import crypto from 'crypto';
import { deploymentAuth, deploymentEndpoint, gitDeploymentBranch, gitIWBServerDeploymentBranch, githookSecreyKey } from '../iwb-server';
import axios from 'axios';

export function handleGithook(req:any){
    const payload = JSON.stringify(req.body);
    const signature = req.header('x-hub-signature-256') || '';
    if (verifySignature(payload, signature, githookSecreyKey)) {
        switch(req.body.ref){
            case "ref/heads/" + gitDeploymentBranch:
                console.log('githook detected push to deploy branch, init world redeploy')
                initIWBDeploy()
                break;

            case "ref/heads/" + gitIWBServerDeploymentBranch:
                console.log("attempting to redeploy iwb-server")
                break;
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