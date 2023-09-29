import crypto from 'crypto';
import { gitDeploymentBranch, gitIWBServerDeploymentBranch, githookSecreyKey } from '../iwb-server';
import { initDeployServerDeploy, initIWBDeploy } from '../utils/functions';

export function handleGithook(req:any){
    const payload = JSON.stringify(req.body);
    const signature = req.header('x-hub-signature-256') || '';
    console.log(req.body.ref)
    if (verifySignature(payload, signature, githookSecreyKey)) {
        switch(req.body.ref){
            case "refs/heads/" + gitDeploymentBranch:
                console.log('githook detected push to deploy branch, init world redeploy')
                initDeployServerDeploy()
                break;

            case "refs/heads/" + gitIWBServerDeploymentBranch:
                console.log("attempting to redeploy iwb-server")
                initIWBDeploy()
                break;
        }
    }
    else{
        console.log('failed git signature for', req.body.ref)
    }
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