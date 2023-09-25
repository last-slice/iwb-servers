import { deployKey } from "src/app";
import { buckets } from "./buckets";
import { updateSceneMetadata } from "./sceneData";

const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');

const command = '../../deploy.sh';

let queue:any[] = []

export function addDeployment(data:any){
    queue.push(data)
    checkDeploymentQueue()
}

async function deploy(bucket:string){
    try {
        let b = buckets.get(bucket)
        b.status = "Deploying"

        let temp = command + " " + bucket + " " + deployKey

        // Execute the shell command
        const childProcess = exec(temp)
  
        // Listen for stdout data events
        childProcess.stdout.on('data', (data:any) => {
            console.log(`stdout: ${data}`);
        });
            
        // Listen for stderr data events
        childProcess.stderr.on('data', (data:any) => {
            console.error(`stderr: ${data}`);

            if(data.substring(0,5) === "Error"){
                console.log('we have an error with deployment')
            }
            else if(data === "Content uploaded successfully"){
                console.log('we finished deploying')
            }
        });

        // You can also listen for the child process to exit
        childProcess.on('exit', (code:any, signal:any) => {
            if (code === 0) {
                console.log('Child process exited successfully.');
              } else {
                console.error(`Child process exited with code ${code}.`);
              }        
            restBucket(bucket)
        });

      } catch (error) {
        console.error(error);
        restBucket(bucket)
      }
}

function restBucket(key:string){
    const projectRoot = "../../"
    const bucketsFolderPath = path.join(projectRoot, 'buckets'); // Path to the "buckets" folder
    const dep1FolderPath = path.join(bucketsFolderPath, key); // Path to the "dep1" folder inside "buckets"

    // Remove the folder and its contents
    fs.remove(dep1FolderPath)
    .then(() => {
    console.log(`Removed folder: ${dep1FolderPath}`);
    })
    .catch((error:any) => {
    console.error(`Error removing folder: ${dep1FolderPath}`, error);
    });
    let b = buckets.get(key)
    b.status = "free"
    b.available = true
}

function checkDeploymentQueue(){
    let tempData = queue.shift()

    buckets.forEach((bucket:any, key:string)=>{
        if(bucket.available){
            console.log('bucket ' + key + " is available")
            bucket.available = false
            try{
                buildBucket(key, bucket, tempData).then(()=>{
                    modifyScene(key, bucket, tempData).then(()=>{
                        deploy(key)
                    })
                })
                return
            }
            catch(e){
                console.log("bucket for each error", e)
                return
            }
        }
    })
}

async function modifyScene(key:string, bucket:any, data:any){
    const projectRoot = "../../"
    const bucketsFolderPath = path.join(projectRoot, 'buckets'); // Path to the "buckets" folder
    const dep1FolderPath = path.join(bucketsFolderPath, key); // Path to the "dep1" folder inside "buckets"

    try{
        await updateSceneMetadata(dep1FolderPath, data)
    }
    catch(e){
        console.log('error modifying scene')
    }
}

async function buildBucket(key:string, bucket:any, data:any){
    console.log("building temp deploy bucket", key)
    try {
        bucket.status = "building"

        const projectRoot = "../../"
        const bucketsFolderPath = path.join(projectRoot, 'buckets'); // Path to the "buckets" folder
        const dep1FolderPath = path.join(bucketsFolderPath, key); // Path to the "dep1" folder inside "buckets"
        const templateFolderPath = path.join(projectRoot, 'template'); // Path to the "template" folder
    
        await fs.mkdir(dep1FolderPath);
        await fs.copy(templateFolderPath, dep1FolderPath);

    } catch (error:any) {
        console.error("error building deployment bucket", error);
        bucket.status = "failed"
        bucket.available = true
      }

    
}