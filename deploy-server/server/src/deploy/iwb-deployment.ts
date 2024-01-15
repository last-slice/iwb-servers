import Axios from "axios";

const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');

const command = '../../iwb-deploy.sh';
let newAssets:any[]= []
let deploying:boolean = false
let redeployTime = 20

let redeployInterval = setInterval(()=>{
  if(newAssets.length > 0 && !deploying){
    console.log('new assets available, need to deploy iwb scene')
    if(process.env.NODE_ENV === "Development"){
      newAssets.shift()
    }else{
      deployIWB()
    }

  }
}, 1000 * redeployTime)

export function checkDeploymentQueue(){
  
}

export function newAssetsReady(value:string){
  newAssets.push(value)
}

export function deployIWB(fromGithub?:boolean){
  newAssets.shift()
  deploying = true
    try {
        // Execute the shell command
        const childProcess = exec(command + " " + process.env.DEPLOY_KEY)
  
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
        childProcess.on('exit', async (code:any, signal:any) => {
            if (code === 0) {
                console.log('Child process exited successfully.');

                if(fromGithub){}
                else{
                  await updateIWBVersion()
                }
            } else {
                console.error(`Child process exited with code ${code}.`);
            }
              deploying = false 
        });

      } catch (error) {
        console.error("try/catch deploy error ", error);
        deploying = false
      }
}

async function updateIWBVersion(){
  const result = await Axios.get('http://localhost:2751/update/version',
  {headers: {                      
      'AssetAuth': `Bearer ${process.env.IWB_UPLOAD_AUTH_KEY}`, 
  }},
  );
  console.log('result is', result.data)
}