import crypto from 'crypto';
import { githookSecreyKey } from '../iwb-server';

export function handleGithook(req:any){
    const payload = JSON.stringify(req.body);
    const signature = req.header('x-hub-signature-256') || '';
  
    if (!verifySignature(payload, signature, githookSecreyKey)) {
        console.log('signature failed')
    }
    else{
        console.log('signature verified')
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