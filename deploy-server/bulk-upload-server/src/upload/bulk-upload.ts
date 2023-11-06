import Axios from "axios";

const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');

const command = '../../bulk-asset-upload.sh';
const sourceDirectory = '/root/deployment/asset-git'; // The source directory
const targetDirectory = '/root/iwb-assets/'; // The target directory where you want to copy files

let errors:any[] = []

export async function handleBulkUpload(data:any, res:any){
  let status = false
  let msg = ""
  let files = ""
  let uploaded:any[] = []
  errors = [...data]

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

          console.log('data is', data.length)
          for(let i = 0; i < data.length; i++){
            let asset = data[i]
                console.log('asset is ', asset)
                let subDir = asset.art
                const subfolderPath = path.join(sourceDirectory, subDir);
            
                if (fs.existsSync(subfolderPath)) {

                  fs.readdirSync(subfolderPath).forEach((file:any) => {
                    
                    if(file === asset.n + ".glb"){
                      const filePath = path.join(subfolderPath, file);

                     if (fs.statSync(filePath).isFile() && path.extname(filePath) === '.glb') {
                        let id = uuidv4()
                        asset.id = id
                        const newFilePath = path.join(targetDirectory, subDir, id + ".glb");
              
                        // Copy the file to the target directory
                        fse.copySync(filePath, newFilePath);

                        let size = getFileSize(filePath)
                        asset.fs = size
                        asset.file = id + ".glb"
                        asset.fs = 0
                        asset.on = "IWB Team"
                        asset.o = ""
                        asset.isdl = true
                        asset.tag = []
                        asset.name = asset.n
                        asset.image = ""
                        asset.polycount = 0
                        errors.splice(i,1)
                        uploaded.push(asset)
                     }
                    }
                  });
                }
              }

            logFile('upload-success',uploaded)

            await postAssetsToIWB(uploaded)

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