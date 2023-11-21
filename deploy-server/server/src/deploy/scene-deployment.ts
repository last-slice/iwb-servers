import { DeploymentData } from "src/utils/types";
import { buckets } from "./buckets";
import { updateSceneMetadata } from "./sceneData";

const fs = require('fs-extra');
const ncp = require('ncp').ncp;
const path = require('path');
const { exec } = require('child_process');

const command = '../deploy.sh';

let queue:DeploymentData[] = []

export function addDeployment(data:DeploymentData){
    queue.push(data)
    checkDeploymentQueue()
}

async function deploy(key:string, data:DeploymentData){
    try {
        let b = buckets.get(key)
        b.status = "Deploying"

        let temp = command + " " + key + " " + process.env.DEPLOY_KEY

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
                b.status = "Deployed"
                successIWBServer(key, data).then(()=>{
                    resetBucket(key)
                })
              } else {
                console.error(`Child process exited with code ${code}.`);
                throw new Error("DCL Deployment Error")
              }        
        });//

      } catch (error) {
        console.error(error);
        throw new Error("DCL Deployment Error")
      }
}

function resetBucket(key:string){
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
    let tempData:DeploymentData = queue.shift()

    outerLoop: for (const [key, bucket] of buckets) {
        if(bucket.available){
            console.log('bucket ' + key + " is available")
            bucket.available = false
            try{
                buildBucket(key, bucket).then(()=>{
                  modifyScene(key, tempData).then(()=>{
                         deploy(key, tempData)
                     })
                })
            }
            catch(e){
                console.log("bucket for each error", e)
                failBucket(key)
            }
            break outerLoop;
        }
      }
}

async function modifyScene(key:string, data:DeploymentData){
    const projectRoot = "../../"
    const bucketsFolderPath = path.join(projectRoot, 'buckets'); // Path to the "buckets" folder
    const dep1FolderPath = path.join(bucketsFolderPath, key); // Path to the "dep1" folder inside "buckets"

    try{
        await updateSceneMetadata(dep1FolderPath, data)
    }
    catch(e){
        console.log('error modifying scene')
        throw new Error("Error modifying scene")
    }
}

async function buildBucket(key:string, bucket:any){
    console.log("building temp deploy bucket", key)
    try {
        bucket.status = "building"

        const projectRoot = "../../"
        const bucketsFolderPath = path.join(projectRoot, 'buckets'); // Path to the "buckets" folder
        const dep1FolderPath = path.join(bucketsFolderPath, key); // Path to the "dep1" folder inside "buckets"
        console.log('dep1 folder path is', dep1FolderPath)
        const templateFolderPath = path.join(projectRoot, 'iwb-template'); // Path to the "template" folder
    
        await fs.mkdir(dep1FolderPath, {recursive: true});
        await copyFolder(templateFolderPath, dep1FolderPath);

    } catch (error:any) {
        console.error("error building deployment bucket", error);
        throw new Error("Error Building Bucket")
      }
}

function failBucket(key:any){
    let bucket = buckets.get(key)
    bucket.status = "failed"
    bucket.available = false
}

// Create a function to promisify the ncp operation
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

