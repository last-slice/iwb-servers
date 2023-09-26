import crypto from 'crypto';
import { deploymentAuth, deploymentEndpoint, gitDeploymentBranch, githookSecreyKey } from '../iwb-server';
import axios from 'axios';

export function handleGithook(req:any){
    const payload = JSON.stringify(req.body);
    const signature = req.header('x-hub-signature-256') || '';
    if (verifySignature(payload, signature, githookSecreyKey)) {
        if(req.body.ref === "refs/heads/" + gitDeploymentBranch){
            console.log('githook detected push to deploy branch, init world redeploy')
            initIWBDeploy()
        }
    }
}

export function initIWBDeploy(){
    axios.post(deploymentEndpoint,{
        auth:deploymentAuth
    })
    .then(function (response:any) {
    // handle success
    console.log(response);
    })
    .catch(function (error:any) {
    // handle error
    console.log(error);
    })
}

function verifySignature(payload: string, signature: string, secret: string) {
    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')}`;
  
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }