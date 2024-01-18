import { status } from "../config/config";
import { handleGenesisCityDeployment, pendingDeployments, workingDirectory } from "./gc-deployment";
import { deployBuckets } from "./buckets";
import { DCLDeploymentData } from "src/utils/types";

const fs = require('fs-extra');
const path = require('path');

export let dclDeploymentQueue:DCLDeploymentData[] = []

export function checkDCLDeploymentQueue(){
    if(dclDeploymentQueue.length > 0){
        outerLoop: for (const [key, bucket] of deployBuckets) {
            if(bucket.available && bucket.enabled){
                console.log('dcl bucket ' + key + " is available")
                bucket.available = false

                let deploymentData:DCLDeploymentData = dclDeploymentQueue.shift()
                try{
                    handleGenesisCityDeployment(key, deploymentData)
                }
                catch(e){
                    console.log("bucket for each error", e)
                    failBucket(key)
                }
                break outerLoop;
            }
            else{
                console.log('no buckets available for deployment')
            }
          }
    }
}

function failBucket(key:any){
    let bucket = deployBuckets.get(key)
    bucket.status = "failed"
    bucket.available = false
    // resetBucket(key)
}

export async function resetBucket(key:string){
    console.log('resetting dcl bucket', key)
    try{
         //remove assets files
         await fs.emptyDir(path.join(workingDirectory, key, "assets"))
         await fs.emptyDir(path.join(workingDirectory, key, "src", "iwb"))

         let b = deployBuckets.get(key)
         b.status = "free"
         b.available = true
         b.owner = ""
         b.address = ""
         checkDCLDeploymentQueue()

    }
    catch(e){
        console.log('error resetting dcl bucket', key)
        let b = deployBuckets.get(key)
        b.status = "Bucket Failure"
        b.reason = "Error Removing Bucket"
        b.available = false
        b.owner = ""
        b.address = ""
        checkDCLDeploymentQueue()
    }
}

export function validateDeployment(req:any, res:any){
    if(req.body && req.body.user && pendingDeployments[req.body.user.toLowerCase()]){
        res.status(200).json({valid:true, entityId: pendingDeployments[req.body.user.toLowerCase()].entityId})
    }else{
        res.status(200).json({valid:false})
    }
}

export function cancelPendingDeployment(req:any, res:any){
    if(req.body && req.body.user && pendingDeployments[req.body.user.toLowerCase()] && pendingDeployments[req.body.user.toLowerCase()].auth === req.body.auth){
        console.log('valid auth, canceling deployment')
        let deployment =  pendingDeployments[req.body.user.toLowerCase()]
        if(deployment.status === "init"){

        }
        delete pendingDeployments[req.body.user.toLowerCase()]
        res.status(200).json({valid:true})
    }else{
        console.log('invalid auth, not canceling deployment')
        res.status(200).json({valid:false})
    }
}

export async function handleDeploymentRequest(req:any, res:any){
    if(status.DEBUG){
        switch(req.body.dest){
            case 'gc':
                dclDeploymentQueue.push(req.body)
                checkDCLDeploymentQueue()

                res.status(200).json({valid: true, msg:"Deployment pending..."})
                break;

            default:
                res.status(200).json({valid:false, msg:"invalid parameters"})
                break;
        }
    }
    else{
        if(!req.body || !req.header('Auth')){
            res.status(200).json({valid:false, msg:"invalid parameters"})
            return
        }

        res.status(200).json({valid:true})
        handleGenesisCityDeployment(req, res)
    }
}