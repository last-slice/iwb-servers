import fs from 'fs';
import path from 'path';

import Axios from "axios";
import { deployIWB, newAssetsReady } from "../deploy/iwb-deployment";
import { addDeployment, queue, resetBucket } from "../deploy/scene-deployment";
import { status } from "../config/config";
import { buckets } from "../deploy/buckets";
const jwt = require("jsonwebtoken");

export function handleBucketEnable(req:any, res:any){
    if(!req.params.auth || !req.params.bucket || req.params.auth !== process.env.DEPLOY_AUTH){
        res.status(200).json({result: "failure", msg:"invalid auth"})
        return
    }
    let bucket = buckets.get(req.params.bucket)
    if(bucket){
        if(bucket.available){
            try{
                bucket.enabled = req.params.enabled === "enabled" ? true: false
                bucket.available = req.params.enabled === "enabled" ? true: false
                bucket.status = req.params.enabled === "enabled" ? '' : 'Offline'
                res.status(200).json({result: "success"})
            }
            catch(e){
                console.log('error resetting bucket', req.params.bucket)
                res.status(200).json({result: "failure", msg:"bucket is in use"})
            }
        }
    }
}

export function handleBucketReset(req:any, res:any){
    if(!req.params.auth || !req.params.bucket || req.params.auth !== process.env.DEPLOY_AUTH){
        res.status(200).json({result: "failure", msg:"invalid auth"})
        return
    }
    let bucket = buckets.get(req.params.bucket)
    if(bucket){
        try{
            if(bucket.process && bucket.process !== null){
                bucket.process.kill('SIGTERM')
            }
            resetBucket(req.params.bucket)
            res.status(200).json({result: "success"})
        }
        catch(e){
            console.log('error resetting bucket', req.params.bucket, e)
            res.status(200).json({result: "failure", msg:"error resetting bucket"})
        }
    }
}

export function handleWorldDeploy(req:any, res:any){
    console.log("deploy world api received")
    if(!req.body){
        res.status(200).json({result: "failure", msg:"invalid api call"})
        return
    }

    if(!req.body.auth){
        res.status(200).json({result: "failure", msg:"invalid auth"})
        return
    }

    //more error checking for scene data

    console.log("")
    console.log("/////////////////////////////////////////////////////////////////////")
    console.log("new deployment pending")
    console.log(JSON.stringify(req.body))
    console.log("/////////////////////////////////////////////////////////////////////")
    console.log("")
  
    addDeployment(req.body.world)
    res.status(200).json({result: "success", msg:"deployment added to queue"})
}


export function forceCopyAssets(req:any, res:any){
      if(!req.body){
          res.status(200).json({result: "failure", msg:"invalid api call"})
          return
      }
  
      if(!req.body.auth){
          res.status(200).json({result: "failure", msg:"invalid auth"})
          return
      }

  //more error checking for scene data

  console.log("need to copy assets to template directory")

  copyDirectorySync(process.env.PROD_DOWNLOAD_ASSET_DIRECTORY, process.env.PROD_TEMPLATE_ASSET_DIRECTORY, res);

  res.status(200).json({result: "success", msg:"asset copy success"})
}

function copyDirectorySync(source: string, target: string, res:any) {
  if (!fs.existsSync(target)) {
    console.log("no directory")
    res.status(200).json({result: "success", msg:"asset copy success"})
    return
  }

  const files = fs.readdirSync(source);

  files.forEach((file) => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      copyDirectorySync(sourcePath, targetPath, res);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

export function handleIWBDeploy(req:any, res:any, fromGithub?:boolean, override?:boolean){
    console.log("deploy iwb api received")

    if(override){}
    else{
        if(!req.body){
            res.status(200).json({result: "failure", msg:"invalid api call"})
            return
        }
    
        if(!req.body.auth){
            res.status(200).json({result: "failure", msg:"invalid auth"})
            return
        }
    }

    //more error checking for scene data

    console.log("need to deploy iwb to world")
    deployIWB(fromGithub)
    res.status(200).json({result: "success", msg:"deploying new iwb to world"})
}

export function handleAssetSigning(req:any, res:any){
    if(req.body.user && req.header('Authorization')){
        const sceneToken = req.header('Authorization').replace('Bearer ', '').trim();

        if (!sceneToken) {
            return res.status(200).json({valid:false, message: 'Unauthorized' });
        }
    
        jwt.verify(sceneToken, process.env.SERVER_SECRET, (err:any, user:any) => {
            if (err) {
                console.log('error validating scene upload token for user', req.body.user)
                return res.status(200).json({valid:false, message: 'Invalid token' });
            }

            let token;
            token = jwt.sign(
                {
                    userId: user,
                    key: sceneToken
                },
                process.env.SERVER_SECRET,
                {expiresIn: "6h"}
            )
            res.status(200).send({valid: true, token: token})

        });
    }else{
        res.status(200).send({valid: false, token: false})
    }
}

export function handleSceneSigning(req:any, res:any){
    if(req.params.user){
        let token;
            token = jwt.sign(
                {
                    userId: req.params.user
                },
                process.env.SERVER_SECRET,
                {expiresIn: "6h"}
            )
        res.status(200).send({valid: true, token: token})
    }else{
        res.status(200).send({valid: true, token: false})
    }
}

export function authenticateToken(req:any, res:any, next:any) {
    if(status.DEBUG){}
    if(req.header('SceneAuth')){
        const token = req.header('SceneAuth').replace('Bearer ', '').trim();
        const uploadAuth = req.header('UploadAuth').replace('Bearer ', '').trim();

        if (!token) {
            return res.status(200).json({valid:false, message: 'Unauthorized' });
        }

        jwt.verify(token, process.env.SERVER_SECRET, (err:any, info:any) => {
            if (err) {
                return res.status(200).json({valid:false, message: 'Invalid token' });
            }
            console.log('asset upload token verified')
            req.user = info.userId;
            req.key = uploadAuth
            next();
        });
    }else{
        return res.status(200).json({valid:false, message: 'Invalid Authorization' });
    }
}

export function validateSceneToken(req:any, res:any){
    if(req.body.user && req.header('Authorization')){
        const sceneToken = req.header('Authorization').replace('Bearer ', '').trim();
        if (!sceneToken) {
            return res.status(200).json({valid:false, message: 'Unauthorized' });
        }
    
        jwt.verify(sceneToken, process.env.SERVER_SECRET, async(err:any, user:any) => {
            if (err) {
                console.log('error validating scene upload token for user', req.body.user)
                return res.status(200).json({valid:false, message: 'Invalid token' });
            }

            try{
                const result = await Axios.post(process.env.IWB_UPLOAD_AUTH_PATH, { user:req.body.user},
                {headers: {                      
                    'Authorization': `Bearer ${sceneToken}`,
                    'AssetAuth': `Bearer ${process.env.IWB_UPLOAD_AUTH_KEY}`,
                }},
                );
                console.log('result is', result.data)
                if(result.data.valid){
                    res.status(200).send({valid: true, token: result.data.token})
                }else{
                    res.status(200).send({valid: false})
                }
            }
            catch(e:any){
                console.log('error posting to iwb server', e.message)
            }

        });
    }else{
        console.log("Invalid Authorization for asset uploader")
        res.status(200).send({valid: false, token: false})
    }
}

export async function postNewAssetData(req:any, res:any){
    const {name, polycount, image, scale} = req.body

    let assetData:any = {
        name:name,
        polycount:polycount,
        scale: scale,
        image:image,
        file: req.file.filename.split('.')[0],
        user: req.user
    }

    console.log('need to send asset data to iwb server ', assetData)

    const result = await Axios.post('http://localhost:2751/asset/uploaded', assetData,
        {headers: {                      
            'Authorization': `Bearer ${req.key}`,
            'AssetAuth': `Bearer ${process.env.IWB_UPLOAD_AUTH_KEY}`,
        }},
        );
        if(result.data.valid){
            console.log('new asset successfully pinged on iwb server')
            newAssetsReady(req.user)
            res.status(200).send({valid: true, token: result.data.token})
        }else{
            console.log('new asset not pinged on iwb server')
            res.status(200).send({valid: false})
        }
}

export function returnBuckets(res:any){
    let bucks:any[] = [...buckets.values()]

  const table = `
  <table style="width: 100%; border: 1px solid black;">
  <thead>
      <tr>
        <th>Id</th>
        <th>Enabled</th>
        <th>Available</th>
        <th>Status</th>
        <th>World</th>
      </tr>
    </thead>
    <tbody>
      ${bucks.map(item => `
        <tr>
        <td style="text-align: left;">${item.id}</td>
        <td style="text-align: left;">${item.enabled ? "Enabled" : "Disabled"}</td>
        <td style="text-align: left;">${item.available ?  item.enabled ? "Free" : "Occupied" : ""}</td>
        <td style="text-align: left;">${item.status}</td>
        <td style="text-align: left;">${item.owner}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
`;

// Create a complete HTML page with the table
const html = `
  <!DOCTYPE html>
  <html>
    <head>
    <link rel="icon" href="https://bafkreigfd6u2qwzcllnw4jmivk25e5z7f5kqtvzslb4jmlxeut2ccg6ns4.ipfs.nftstorage.link/" type="image/x-icon">

      <title>IWB Deployment Buckets</title>
      <style>
      body {
        background-color: black;
        color: white;
        font-family: Arial, sans-serif;
      }
      table {
        width: 100%;
        border: 1px solid white;
      }
      th, td {
        text-align: left;
        padding: 8px;
      }
      th {
        background-color: #333;
        color: white;
      }
      /* Set the percentage height for table rows */
      tr:nth-child(odd) {
        height: 10%;
      }
      tr:nth-child(even) {
        height: 10%;
      }
    </style>
    </head>
    <body>
    <img src="https://bafkreids4czeoymh6wmb6rgzvq6oeul7k6mttwa6utb2g6m7qctdqbd6ae.ipfs.nftstorage.link/" alt="Your Logo" style="max-width: 50%;">
      <h1>IWB Deployment Buckets</h1>
      ${table}
    </body>
  </html>
`;

res.send(html);
}

export function returnStatus(res:any){
    let bucks:any[] = [...buckets.values()]

    const table = `
    <table style="width: 100%; border: 1px solid black;">
    <thead>
        <tr>
          <th>Id</th>
          <th>Enabled</th>
          <th>Available</th>
          <th>Status</th>
          <th>World</th>
        </tr>
      </thead>
      <tbody>
        ${bucks.map(item => `
          <tr>
          <td style="text-align: left;">${item.id}</td>
          <td style="text-align: left;">${item.enabled ? "Enabled" : "Disabled"}</td>
          <td style="text-align: left;">${item.available ?  item.enabled ? "Free" : "" : item.enabled ? "Occupied" : ""}</td>
          <td style="text-align: left;">${item.status}</td>
          <td style="text-align: left;">${item.owner}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  const queueTable = `
  <table style="width: 100%; border: 1px solid black;">
  <thead>
      <tr>
        <th>ENS</th>
        <th>Owner</th>
      </tr>
    </thead>
    <tbody>
      ${queue.map(item => `
        <tr>
        <td style="text-align: left;">${item.ens}</td>
        <td style="text-align: left;">${item.owner}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  `;
  
  // Create a complete HTML page with the table
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
      <meta charset="UTF-8">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.7.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="icon" href="https://bafkreigfd6u2qwzcllnw4jmivk25e5z7f5kqtvzslb4jmlxeut2ccg6ns4.ipfs.nftstorage.link/" type="image/x-icon">
  
        <title>IWB Deployment Buckets</title>
        <style>
        body {
          background-color: black;
          color: white;
          font-family: Arial, sans-serif;
        }
        table {
          width: 100%;
          border: 1px solid white;
        }
        th, td {
          text-align: left;
          padding: 8px;
        }
        th {
          background-color: #333;
          color: white;
        }
        /* Set the percentage height for table rows */
        tr:nth-child(odd) {
          height: 10%;
        }
        tr:nth-child(even) {
          height: 10%;
        }
      </style>
      </head>
      <body>
      <div class="container">
      <div class="row">
      <div class="col-md-12">
      <img src="https://bafkreids4czeoymh6wmb6rgzvq6oeul7k6mttwa6utb2g6m7qctdqbd6ae.ipfs.nftstorage.link/" alt="Your Logo" style="max-width: 50%;">
        </div>
      </div>
  
      <div class="row">
        <div class="col-md-6">
        <h1>IWB Deployment Queue</h1>
        ${queueTable}
        </div>
  
  
        <div class="col-md-6">
        <h1>IWB Deployment Buckets</h1>
        ${table}
        </div>
  
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.7.0/dist/js/bootstrap.min.js"></script>
  
      </body>
    </html>
  `;
  
  res.send(html);
}

export function returnQueue(res:any){
    // res.status(200).json({result: "success", queue: queue})
   // Create an HTML table from the JSON data
   const table = `
   <table style="width: 100%; border: 1px solid black;">
   <thead>
       <tr>
         <th>Name</th>
         <th>ENS</th>
         <th>Owner</th>
       </tr>
     </thead>
     <tbody>
       ${queue.map(item => `
         <tr>
         <td style="text-align: left;">${item.worldName}</td>
         <td style="text-align: left;">${item.ens}</td>
         <td style="text-align: left;">${item.owner}</td>
         </tr>
       `).join('')}
     </tbody>
   </table>
 `;

 // Create a complete HTML page with the table
 const html = `
   <!DOCTYPE html>
   <html>
     <head>
     <link rel="icon" href="https://bafkreigfd6u2qwzcllnw4jmivk25e5z7f5kqtvzslb4jmlxeut2ccg6ns4.ipfs.nftstorage.link/" type="image/x-icon">

       <title>IWB Deployment Queue</title>
       <style>
       body {
         background-color: black;
         color: white;
         font-family: Arial, sans-serif;
       }
       table {
         width: 100%;
         border: 1px solid white;
       }
       th, td {
         text-align: left;
         padding: 8px;
       }
       th {
         background-color: #333;
         color: white;
       }
       /* Set the percentage height for table rows */
       tr:nth-child(odd) {
         height: 10%;
       }
       tr:nth-child(even) {
         height: 10%;
       }
     </style>
     </head>
     <body>
     <img src="https://bafkreids4czeoymh6wmb6rgzvq6oeul7k6mttwa6utb2g6m7qctdqbd6ae.ipfs.nftstorage.link/" alt="Your Logo" style="max-width: 50%;">
       <h1>IWB Deployment Queue</h1>
       ${table}
     </body>
   </html>
 `;

 res.send(html);
}