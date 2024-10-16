import Axios from "axios";

const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');

const NFTStorageAuth = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDlCNTIyZDczN0UyOEMwOEFmNzhiQzM2Njk5QzVhMmM2ZDI4NDFBRmYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY5NzI0MDY4MjY4OCwibmFtZSI6IklXQiBVUGxvYWRlciJ9.7nIofYjxMC6-y5RkNI6IYIOrxRritSH-NKGCz8KuMX4'
// const command = '../../bulk-asset-upload.sh';
const command = '/Users/lastraum/Desktop/programming/Decentraland/LastSlice/sdk7/iwb/servers/deploy-server/bulk-asset-upload.sh';
const sourceDirectory = '/root/deployment/asset-git'; // The source directory
const targetDirectory = '/root/iwb-assets/'; // The target directory where you want to copy files

let errors:any[] = []
let uploaded:any[] = []

import { promisify } from 'util';
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

export async function handleBulkUpload(body:any, skip?:boolean){
  if(skip){
    modifyAssets(body.type, body.data)
  }else{
    pullGithub(true)
  }
}

export async function handleBuilderAssets(req:any, res:any){
  pullGithub()
}

export async function pullGithub(modify?:boolean){
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
              if(modify){
                await modifyAssets('3d', [])
              }
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

export async function modifyBuilderAssets(){
  try {
    // Read the contents of a file synchronously
    const filedata = fs.readFileSync('../../builderassets.json', 'utf8');
    let data = JSON.parse(filedata)
    errors = [...data]

  for(let i = 0; i < data.length; i++){
    let asset = data[i]
    try{
      console.log('asset is ', asset)
      const subfolderPath = path.join(sourceDirectory, "current-builder-assets");
  
      if (fs.existsSync(subfolderPath)) {
        // console.log('asset folder exists')
        const filePath = path.join(subfolderPath, asset.m + ".glb");

        if (fs.statSync(filePath).isFile() && path.extname(filePath) === '.glb') {
        //  console.log('asset glb exists')
           let id = uuidv4()
           asset.id = id
           const newFilePath = path.join(targetDirectory, id + ".glb");

           try{
             let filename = asset.m + ".png"
             let fileContent = fs.readFileSync(path.join(subfolderPath, filename))

            //  console.log('image content', fileContent)

             var myHeaders = new Headers();
             myHeaders.append("Authorization", NFTStorageAuth);
           
             var requestOptions = {
               method: 'POST',
               headers: myHeaders,
               body: fileContent
             };
             
             let response = await fetch("https://api.nft.storage/upload", requestOptions)
             let json = await response.json()
         
            //  console.log('image storage json is', json)
             if(json.ok){
              //  console.log('asset image uploaded successfully')
               asset.im = "https://" + json.value.cid + ".ipfs.dweb.link"

               // Copy the file to the target directory
               fse.copySync(filePath, newFilePath);

               let size = getFileSize(filePath)
               asset.fs = size

               errors.splice(i,1)
               await postAssetsToIWB([asset])
             }
             else{
               console.log('error asset image upload', asset.m)
               logFile('builder-upload-error', errors)
             }
           }catch(e){
             console.log('asset image upload error', asset.m)
           }
        }else{
          console.log('cannot find file', asset.m)
          logFile('builder-upload-error', errors, asset.m)
        }
      }
    }
    catch(e){
      console.log('error moving file', asset.m)
    }

    }

    console.log('finished modifying assets, need to post to iwb server')
    logFile('upload-success',uploaded)
    errors.length = 0
    
  } catch (err) {
    // Handle any errors that may occur during file reading
    console.error('Error reading the file:', err);
  }
}

export async function modifyAssets(type:string, currentAssets:any){
  switch(type){
    case 'audio':
      await modifyAudioAssets(currentAssets)
      break;

    case '3d':
      const filedata = fs.readFileSync('../../customassets.json', 'utf8');
      let data = JSON.parse(filedata)
      errors = [...data]
    
      console.log('running bulk uploader')
      for(let i = 0; i < data.length; i++){
        let asset = data[i]
        try{
          let subDir = asset.on
          const subfolderPath = path.join(sourceDirectory, subDir);
      
          if (fs.existsSync(subfolderPath)) {
            const filePath = path.join(subfolderPath, asset.m + ".glb");
    
            if (fs.statSync(filePath).isFile() && path.extname(filePath) === '.glb') {
               let id = uuidv4()
               asset.id = id
               const newFilePath = path.join(targetDirectory, id + ".glb");
    
               try{
                 let filename = asset.m + ".png"
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
                  //  console.log('asset image uploaded successfully')
                   asset.im = "https://" + json.value.cid + ".ipfs.dweb.link"
    
                   // Copy the file to the target directory
                   fse.copySync(filePath, newFilePath);
    
                   let size = getFileSize(filePath)
                   asset.fs = size
                   asset.bb = JSON.parse(asset.bb)
    
                   errors.splice(i,1)
                   await postAssetsToIWB([asset])
                 }
                 else{
                   console.log('error asset image upload', asset.m)
                   logFile('custom-upload-error', errors)
                 }
    
               }catch(e){
                 console.log('asset image upload error', asset.m, e)
               }
            }
           }else{
             console.log('cannot find file', asset.m)
             logFile('custom-upload-error', errors, asset.m)
           }
        }
        catch(e){
          console.log('error moving file', asset.m)
        }
    
      }
        console.log('finished modifying assets, need to post to iwb server')
        logFile('upload-success', uploaded)
        errors.length = 0
      break;
  }

}

async function modifyAudioAssets(currentAssets:any){
  const filedata = fs.readFileSync('./audioAssets.json', 'utf8');
  let data = JSON.parse(filedata)
  errors = [...data]

  // Filter assets to include only those whose names are not in existingArray
  const newAssets = data.filter((asset:any) => {
    return !currentAssets.some((existing:any) => existing.name === asset.name);
  });


  // Usage example:
  const sourceDirectory = '/Users/lastraum/desktop/programming/decentraland/lastslice/sdk7/iwb/audio-repo/';
  const destinationDirectory = '/Users/lastraum/desktop/programming/decentraland/lastslice/sdk7/iwb/iwb-audio/';

  try{
    let newAudioData = await moveMatchingFiles(sourceDirectory, destinationDirectory, newAssets)
    logFile("new-audio", newAudioData)
    // await postAssetsToIWB(newAudioData)

  }
  catch(e){
    console.log('error moving assets')
  }


}

async function moveMatchingFiles(
  sourceDirectory: string,
  destinationDirectory: string,
  jsonObjects:any[]
) {
  let newAssets:any[] = []

  try {
    // await mkdir(destinationDirectory, { recursive: true });

    async function processDirectory(directory: string) {
      const items = await readdir(directory);

      for (const item of items) {
        const itemPath = path.join(directory, item);
        const itemInfo = await stat(itemPath);

        if (itemInfo.isDirectory()) {
          await processDirectory(itemPath); // Recursively process subdirectories
        } else {
          // Check if the file matches the name property in any JSON object
          const matchingObject = jsonObjects.find((obj) => obj.file + ".mp3" === item);

          if (matchingObject) {
            console.log('found file', matchingObject)
            let size = getFileSize(itemPath)

            let id = uuidv4()

            let newAssetData:any = {
              "id": "" + id,
              "n": "" + matchingObject.name,
              "d": "",
              "style": "" + matchingObject.cat,
              "cat": "" + matchingObject.cat,
              "m": "" + id + ".mp3",
              "on": "" + matchingObject.artist,
              "o": "IWB Team",
              "pc": 0,
              "im": "https://bafkreibzvpwxnzewseobcvog24qsmekvlp4avrsrdgnt74dxta75rqbqbe.ipfs.nftstorage.link/",
              "ty": "Audio",
              "isdl": false,
              "tag": [],
              "si": 0 + size,
              "bb":{"x":1, "y":1, z:1},
              "ugc":false,
              "v":1
            }

            newAssets.push(newAssetData)

            try{
              
              const destinationPath = path.join(destinationDirectory, id + ".mp3");
              fse.copySync(itemPath, destinationPath);
              console.log(`Moved: ${itemPath} -> ${destinationPath}`);
            }
            catch(e){
              console.log('error uploading asset or moving file ', matchingObject.file)
            }
          }
        }
      }
    }

    await processDirectory(sourceDirectory);
    console.log('Matching files moved successfully.');
    return newAssets
  } catch (error) {
    console.error('An error occurred:', error);
    return newAssets
  }
}

function logFile(filename:string, data:any, asset?:any){
  fs.writeFile('../'+filename+'-' + (asset ? asset : "") + "-" + Math.floor(Date.now()/1000) + ".json", JSON.stringify(data), (err:any) => {
    if (err) {
      console.error('Error writing to the file:', err);
    } else {
      console.log('Data has been written to the file successfully.');
    }
  });
}

async function postAssetsToIWB(assets:any){
  // const result = await Axios.post('http://localhost:2751/update/catalog',{assets:assets},
  // {headers: {                      
  //     'Authorization': `Bearer ${process.env.IWB_UPLOAD_AUTH_KEY}`, 
  // }},
  // );
  // // console.log('result is', result.data)

  // if(result.data.valid){
  //   // console.log('successfully posted new items iwb catalog')
  // }else{
  //   console.log('there was an error', result.data.msg)
  //   logFile('catalog-post-error', assets)
  // }
}

function getFileSize(filePath:any) {
  const stats = fs.statSync(filePath);
  return stats.size;
}