import { DeploymentData } from "src/utils/types";
import { iwbBuckets } from "./buckets";
import { updateSceneMetadata } from "./sceneData";
import { buildTypescript } from "./helpers";
import { status } from "../config/config";

const fs = require('fs-extra');
const ncp = require('ncp').ncp;
const path = require('path');
const { exec } = require('child_process');

const command = status.DEBUG ? '/Users/lastraum/desktop/programming/decentraland/lastslice/sdk7/iwb/servers/deploy-server/deploy.sh' : '/root/deployment/server/deploy.sh';

export let iwbDeploymentQueue:DeploymentData[] = []
let worldBucketDirectory = status.DEBUG ? "/Users/lastraum/Desktop/programming/decentraland/lastslice/sdk7/iwb/servers/deploy-server/buckets/iwb/" : "/root/deployment/buckets/iwb/"
let assetDirectory = status.DEBUG ? "/Users/lastraum/Desktop/programming/decentraland/lastslice/sdk7/iwb/toolset/" : "/root/iwb-assets/"

////cp -r /root/deployment/iwb-template/* /root/deployment/buckets/iwb/bucket1/  need to expose an endpoint so i can copy the template into all of the buckets

export async function checkDeploymentQueue(){
    if(iwbDeploymentQueue.length > 0){
        console.log('deployment queue greater than 0')
        outerLoop: for (const [key, bucket] of iwbBuckets) {
            if(bucket.available && bucket.enabled){
                let tempData:DeploymentData = iwbDeploymentQueue.shift()
                console.log('bucket ' + key + " is available")
                bucket.available = false
                bucket.directory = path.join(worldBucketDirectory, key)

                try{
                    await buildBucket(key, bucket, tempData.owner)
                    await modifyScene(key, tempData)
                    await deploy(key, tempData)
                }
                catch(e){
                    console.log("bucket for each error", e)
                    failBucket(key)
                    resetBucket(key)
                }
                break outerLoop;
            }
            else{
                console.log('no buckets available for deployment')
            }
          }
    }
}

export function addDeployment(data:DeploymentData){
    iwbDeploymentQueue.push(data)
    checkDeploymentQueue()
}

async function deploy(key:string, data:DeploymentData){
    try{
        let b = iwbBuckets.get(key)
        b.status = "Building"
        b.owner = data.ens
        b.address = data.owner

        console.log('directory is', b.directory)
    
        await buildTypescript({
            workingDir: b.directory, 
            watch:false, 
            production: true
          })
        
        await deployBucket(key)
    
          successIWBServer(key, data)
          .then(()=>{
            resetBucket(key)
        })
    }
    catch(e){
        console.log('iwb world deployment error', e);
        throw new Error("DCL Deployment Error")
    }
}

async function deployBucket(key:string){
    return new Promise((resolve, reject) => {
    try {
        let bucket = iwbBuckets.get(key)
        bucket.status = "Deploying"

        let temp = command + " " + key + " " + process.env.DEPLOY_KEY
        let deployProcess:any = exec(temp)

        deployProcess.stdout.on('data', (data:any) => {
            console.log(`stdout: ${data}`);
        });

        deployProcess.stderr.on('data', (data:any) => {
            console.log(`stderr: ${data}`);
        });

        deployProcess.on('exit', (code:any, signal:any) => {
            console.log('deploy bucket process exited with code', code)
            if (code === 0) {
                console.log('Child process exited successfully.');
                resolve({})
              } else {
                console.error(`Child process exited with code ${code}.`);
                reject()
                throw new Error("DCL Deployment Error")
              }        
        });

      } catch (error) {
        console.error(error);
        reject()
        throw new Error("DCL Deployment Error")
      }
    })
}

// async function deploy2(key:string, data:DeploymentData){
//     try {
//         let b = iwbBuckets.get(key)
//         b.status = "Deploying"
//         b.owner = data.ens
//         b.address = data.owner

//         let temp = command + " " + key + " " + process.env.DEPLOY_KEY

//         // Execute the shell command
//         b.process = exec(temp)
  
//         // Listen for stdout data events
//         b.process.stdout.on('data', (data:any) => {
//             // console.log(`stdout: ${data}`);
//         });
            
//         // Listen for stderr data events
//         b.process.stderr.on('data', (data:any) => {
//             console.error(`stderr: ${data}`);

//             if(data.substring(0,5) === "Error"){
//                 console.log('we have an error with deployment')
//             }
            
//             if(data === "Content uploaded successfully"){
//                 console.log('we finished deploying')
//             }
//         });

//         // You can also listen for the child process to exit
//         b.process.on('exit', (code:any, signal:any) => {
//             console.log('deploy bucket process exited with code', key, code)
//             if (code === 0) {
//                 console.log('Child process exited successfully.');
//                 b.status = "Deployed"
//                 b.process = null
//                 successIWBServer(key, data).then(()=>{
//                     resetBucket(key)
//                 })
//                 .catch((e)=>{
//                     console.log("error pinging iwb-server")
//                     resetBucket(key)
//                 })
//               } else {
//                 console.error(`Child process exited with code ${code}.`);
//                 throw new Error("DCL Deployment Error")
//               }        
//         });

//       } catch (error) {
//         console.error(error);
//         throw new Error("DCL Deployment Error")
//       }
// }

export async function resetBucket(key:string){
    console.log('resetting iwb world bucket', key)
    // const projectRoot = "../../"
    // const bucketsFolderPath = path.join(projectRoot, 'buckets'); // Path to the "buckets" folder
    // const dep1FolderPath = path.join(bucketsFolderPath, key); // Path to the "dep1" folder inside "buckets"

    // Remove the folder and its contents
    // fs.remove(dep1FolderPath)
    // .then(() => {
    //     console.log(`Removed folder: ${dep1FolderPath}`);
    //     let b = buckets.get(key)
    //     b.status = "free"
    //     b.available = true
    //     b.owner = ""
    //     b.address = ""
    //     checkDeploymentQueue()
    // })
    // .catch((error:any) => {
    // console.error(`Error removing folder: ${dep1FolderPath}`, error);
    //     let b = buckets.get(key)
    //     b.status = "Bucket Failure"
    //     b.reason = "Error Removing Bucket"
    //     b.available = false
    //     b.owner = ""
    //     b.address = ""
    //     checkDeploymentQueue()
    // });
    try{
        //remove assets files
        await fs.emptyDir(path.join(worldBucketDirectory, key, "assets"))
        // await fs.emptyDir(path.join(worldBucketDirectory, key, "src", "iwb"))

        let b = iwbBuckets.get(key)
        b.status = "free"
        b.available = true
        b.owner = ""
        b.address = ""
        b.directory = ""
        checkDeploymentQueue()

   }
   catch(e){
       console.log('error resetting dcl bucket', key)
       let b = iwbBuckets.get(key)
       b.status = "Bucket Failure"
       b.reason = "Error Removing Bucket"
       b.available = false
       b.owner = ""
       b.address = ""
       checkDeploymentQueue()
   }
}

async function modifyScene(key:string, data:DeploymentData){
    // const projectRoot = "../../"
    // const bucketsFolderPath = path.join(projectRoot, 'buckets'); // Path to the "buckets" folder
    // const dep1FolderPath = path.join(bucketsFolderPath, key); // Path to the "dep1" folder inside "buckets"

    let bucket = iwbBuckets.get(key)
    let directory = bucket.directory

    try{
        await updateSceneMetadata(directory, data)
    }
    catch(e){
        console.log('error modifying scene')
        throw new Error("Error modifying scene")
    }
}

async function buildBucket(key:string, bucket:any, world:string){
    console.log("building temp deploy bucket", world, key)
    try {
        bucket.status = "Creating"

        const bucketPath = path.join(worldBucketDirectory, key)

        // const dep1FolderPath = path.join(worldBucketDirectory, key); // Path to the "dep1" folder inside "buckets"
        // const templateFolderPath = path.join(projectRoot, 'iwb-template'); // Path to the "template" folder
    
        // await fs.mkdir(dep1FolderPath, {recursive: true});
        await copyFiles(assetDirectory, path.join(bucketPath, "assets"));

        try {
            let ugcPath = path.join('/root', 'ugc-assets', world)
            console.log('ugc path is', ugcPath)

            await fs.access(ugcPath, fs.constants.F_OK);
            console.log('World contains UGC content')

            await copyFiles(ugcPath, path.join(bucketPath, "assets"))
        } catch (err) {
            console.log('World does not contain UGC content')
        }

    } catch (error:any) {
        console.error("error building deployment bucket", error);
        throw new Error("Error Building Bucket")
      }
}

async function copyFiles(sourceFolder:string, destinationFolder:string) {
    try {
        const files = await fs.readdir(sourceFolder);

        for (const file of files) {
            const sourceFilePath = path.join(sourceFolder, file);
            const destinationFilePath = path.join(destinationFolder, file);
            await fs.copy(sourceFilePath, destinationFilePath);
        }

        console.log(`Files copied from ${sourceFolder} to ${destinationFolder}`);
    } catch (err) {
        console.error(`Error copying files: ${err}`);
    }
}

function failBucket(key:any){
    let bucket = iwbBuckets.get(key)
    bucket.status = "failed"
    bucket.available = false
}

function copyFolder(source:string, destination:string) {
    return new Promise((resolve, reject) => {
      ncp(source, destination, (err:any) => {
        if (err) {
          reject(err);
        } else {
          resolve({});
        }
      });
    });
  }

async function successIWBServer(bucket:any, data:DeploymentData){
    let res = await fetch(process.env.IWB_PATH + "deployment/success",{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({
            auth:process.env.IWB_UPLOAD_AUTH_KEY,
            world:data
        })
    })
    let json = await res.json()
    console.log('ping iwb server success deployment', json)
}

