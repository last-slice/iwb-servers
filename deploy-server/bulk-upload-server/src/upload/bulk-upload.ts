import Axios from "axios";

const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');

const NFTStorageAuth = process.env.NFT_STORAGE_KEY
const command = '../../bulk-asset-upload.sh';
const sourceDirectory = '/root/deployment/asset-git'; // The source directory
const targetDirectory = '/root/iwb-assets/'; // The target directory where you want to copy files

let errors:any[] = []
let uploaded:any[] = []

export async function handleBulkUpload(data:any, res:any){
  errors = [...data]

  pullGithub(data)
  // .then((result)=> modifyAssets(result))
  // .then((result2)=> updateServer(result2))
}

async function pullGithub(data:any){
  try {
    const childProcess = exec(command + " " + process.env.DEPLOY_KEY)

    // Listen for stdout data events
    childProcess.stdout.on('data', (data:any) => {
        console.log(`stdout: ${data}`);
    });
        
    // Listen for stderr data events
    childProcess.stderr.on('data', (data:any) => {
        console.error(`stderr: ${data}`);
    });

    // You can also listen for the child process to exit
    childProcess.on('exit', async (code:any, signal:any) => {
        if (code === 0) {
            console.log('Child process exited successfully.');
            await modifyAssets(data)
        } else {
            console.error(`Child process exited with code ${code}.`);
            logFile('upload-error', errors)
        }
    });

  } catch (error) {
    console.error("try/catch deploy error ", error);
    logFile('upload-error', errors)
  }
}

async function modifyAssets(data:any){
  console.log('data is', data.length)
  for(let i = 0; i < data.length; i++){
    let asset = data[i]
    try{
      console.log('asset is ', asset)
      let subDir = asset.on
      const subfolderPath = path.join(sourceDirectory, subDir);
  
      if (fs.existsSync(subfolderPath)) {

        for(const file of fs.readdirSync(subfolderPath)){
          if(file === asset.n + ".glb"){
            const filePath = path.join(subfolderPath, file);

           if (fs.statSync(filePath).isFile() && path.extname(filePath) === '.glb') {
              let id = uuidv4()
              asset.id = id
              const newFilePath = path.join(targetDirectory, id + ".glb");
    
              // Copy the file to the target directory
              fse.copySync(filePath, newFilePath);

              let size = getFileSize(filePath)
              asset.fs = size

              try{
                let filename = asset.n + ".png"
                let fileContent = fs.readFileSync(path.join(subfolderPath, filename))

                var myHeaders = new Headers();
                myHeaders.append("Authorization", NFTStorageAuth);
              
                var requestOptions = {
                  method: 'POST',
                  headers: myHeaders,
                  body: fileContent
                };
                
                let response = await fetch("https://api.nft.storage/upload", requestOptions)
                let json = await response.json()
            
                // console.log('image storage json is', json)
                if(json.ok){
                  console.log('asset image uploaded successfully')
                  asset.im = "https://" + json.value.cid + ".ipfs.dweb.link"
                }
                else{
                  console.log('error asset image upload')
                }

              }catch(e){
                console.log('asset image upload error')
              }

              errors.splice(i,1)
              uploaded.push(asset)
           }
          }
        }
      }
    }
    catch(e){
      console.log('error moving file', asset)
    }

    }

    console.log('finished modifying assets, need to post to iwb server')
    logFile('upload-success',uploaded)
    await postAssetsToIWB(uploaded)
}

async function updateServer(data:any){

}

function logFile(filename:string, data:any){
  fs.writeFile('../../'+filename+'-' + Math.floor(Date.now()/1000) + ".json", JSON.stringify(data), (err:any) => {
    if (err) {
      console.error('Error writing to the file:', err);
    } else {
      console.log('Data has been written to the file successfully.');
    }
  });
}

async function postAssetsToIWB(assets:any){
  const result = await Axios.post('http://localhost:2751/update/catalog',{assets:assets},
  {headers: {                      
      'Authorization': `Bearer ${process.env.IWB_UPLOAD_AUTH_KEY}`, 
  }},
  );
  console.log('result is', result.data)

  if(result.data.valid){
    console.log('successfully posted new items iwb catalog')
  }else{
    console.log('there was an error', result.data.msg)
    logFile('catalog-post-error', assets)
  }
}

function getFileSize(filePath:any) {
  const stats = fs.statSync(filePath);
  return stats.size;
}