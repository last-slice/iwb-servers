import { DeploymentData, REQUIRED_ASSETS } from "../utils/types";
import { iwbBuckets } from "./buckets";
import { updateSceneMetadata } from "./sceneData";
import { buildTypescript } from "./helpers";
import { status } from "../config/config";
import { updateWorldMetadata } from "../download/scripts/metadata"

const fs = require('fs-extra');
const ncp = require('ncp').ncp;
const path = require('path');
const { exec } = require('child_process');

const command = status.DEBUG ? '/Users/lastraum/desktop/programming/decentraland/lastslice/sdk7/iwb/servers/deploy-server/deploy.sh' : '/root/iwb-deployment/server/deploy.sh';

export let iwbDeploymentQueue:DeploymentData[] = []
let worldBucketDirectory = status.DEBUG ? "/Users/lastraum/Desktop/programming/decentraland/lastslice/sdk7/iwb/servers/deploy-server/buckets/iwb/" : "/root/iwb-deployment/buckets/iwb/"
let assetDirectory = status.DEBUG ? "/Users/lastraum/Desktop/programming/decentraland/lastslice/sdk7/iwb/toolset/assets/" : "/root/iwb-assets/"
let ugcDirectory = status.DEBUG ? "/Users/lastraum/Desktop/programming/decentraland/lastslice/sdk7/iwb" : "/root"

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
                    await buildBucket(key, bucket, tempData)
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
    }else{
        console.log('deployment queue has no pending deployments')
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
    
        // await buildTypescript({
        //     workingDir: b.directory, 
        //     watch:false, 
        //     production: true
        //   })
        
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
            if(data === "error: Could not upload content:"){
                deployProcess.kill()
            }
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
              deployProcess.kill()        
        });

      } catch (error) {
        console.error(error);
        reject()
        throw new Error("DCL Deployment Error")
      }
    })
}

export async function resetBucket(key:string){
    console.log('resetting iwb world bucket', key)

    let b = iwbBuckets.get(key)
    b.status = "resetting"

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

async function buildBucket(key:string, bucket:any, data:any){
    console.log("building temp deploy bucket", data.owner, key)
    try {
        bucket.status = "Creating"

        const bucketPath = path.join(worldBucketDirectory, key)

        let assets:any
        if(data.url){
            let res = await fetch(data.url)
            let json = await res.json()
            assets = json.hasOwnProperty("items") ? json.items : json
            // console.log('assets are ', assets)
        }

        // const dep1FolderPath = path.join(worldBucketDirectory, key); // Path to the "dep1" folder inside "buckets"
        // const templateFolderPath = path.join(projectRoot, 'iwb-template'); // Path to the "template" folder
    
        // await fs.mkdir(dep1FolderPath, {recursive: true});
        await copyFiles(assetDirectory, path.join(bucketPath, "assets"), assets);

        try {
            //write scene.json with world name
            await updateWorldMetadata(path.join(bucketPath, "scene.json"), data)

            let ugcPath = path.join(ugcDirectory, 'ugc-assets', data.owner)
            console.log('ugc path is', ugcPath)

            await fs.access(ugcPath, fs.constants.F_OK);
            console.log('World contains UGC content')

            await copyFiles(ugcPath, path.join(bucketPath, "assets"), undefined, true)
        } catch (err) {
            console.log('World does not contain UGC content')
        }

    } catch (error:any) {
        console.error("error building deployment bucket", error);
        throw new Error("Error Building Bucket")
      }
}

async function copyFiles(sourceFolder:string, destinationFolder:string, assets?:any[], ugc?:boolean) {
    try{
        const files = await fs.readdir(sourceFolder);
        if(ugc){
            for (const file of files) {
                const sourceFilePath = path.join(sourceFolder, file);
                try{
                    await fs.copy(sourceFilePath,  path.join(destinationFolder, file));
                }
                catch(e){
                    console.error(`Error copying files: ${e}`);
                }
            }
        }
        else{
            try {
                for(let i = 0; i < Object.values(REQUIRED_ASSETS).length; i++){
                    let file = Object.values(REQUIRED_ASSETS)[i]
                    try{
                        await fs.copy(path.join(sourceFolder, file), path.join(destinationFolder, file))
                    }
                    catch(e){
                        console.log('file copy error', e)
                    }
                }
    
                if(assets && assets.length > 0){
                    const files = await fs.readdir(sourceFolder);
                    for (const file of files) {
                        const sourceFilePath = path.join(sourceFolder, file);
                        let destinationFilePath:any
                            if(assets){
                                if(assets.find(($:any)=> $.id === path.parse(file).name)){
                                    destinationFilePath = path.join(destinationFolder, file);
                                }
                            }else{
                                destinationFilePath = path.join(destinationFolder, file);
                            }
                        
                        if(destinationFilePath){
                            await fs.copy(sourceFilePath, destinationFilePath);
                        }
                    }
                }
                
            } catch (err) {
                console.error(`Error copying files: ${err}`);
            }
        }
    }
    catch(e){
        console.error(`Error reading folder: ${e}`);
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
    try{
        console.log('link is', (status.DEBUG ? process.env.IWB_DEV_PATH : process.env.IWB_PROD_PATH) + "deployment/success")
        let res = await fetch((status.DEBUG ? process.env.IWB_DEV_PATH : process.env.IWB_PROD_PATH) + "deployment/success",{
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
    catch(e){
        console.log('error pinging iwb server for successful deployment', e)
    }
}

