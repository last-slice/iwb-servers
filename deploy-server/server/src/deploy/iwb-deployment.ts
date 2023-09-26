const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');

const command = '../../iwb-deploy.sh';

export function deployIWB(){
    try {
        // Execute the shell command
        const childProcess = exec(command)
  
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
        });

      } catch (error) {
        console.error(error);
      }
}