import express, { Request, Response } from "express";
import { buckets } from "../deploy/buckets";
import { authenticateToken, handleAssetSigning, handleIWBDeploy, handleWorldDeploy, handleSceneSigning, postNewAssetData, validateSceneToken, handleBucketReset, handleBucketEnable } from "./api.service";
import { checkDeploymentQueue, queue } from "../deploy/scene-deployment";

export const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    destination: function (req:any, file:any, cb:any) {
        cb(null, '../../../iwb-assets');
    },
    filename: function (req:any, file:any, cb:any) {
      cb(null, uuidv4() + ".glb");
    },
  });

const upload = multer({ storage: storage });

router.get("/scene/sign/:user", (req: any, res: any) => {
  console.log('get jwt token for asset upload session')
  handleSceneSigning(req, res)
});

router.post("/scene/verify", async (req: any, res: any) => {
  console.log('validate scene jwt and return iwb jwt')
  await validateSceneToken(req, res)
});
 
router.post("/uploader/sign", (req: any, res: any) => {
  console.log('validate scene jwt and return uploader jwt')
  handleAssetSigning(req, res)
});

router.post('/upload', authenticateToken, upload.single('file'), async (req:any, res:any) => {
    try {
      console.log('upload asset complete!, pinging toolset server with configuration')
      await postNewAssetData(req, res)
    } catch (error) {
      console.error('Error uploading file and saving form data:', error);
      res.status(200).json({valid:false, error: 'Internal Server Error' });
    }
});

router.get("/buckets/:bucket", async function(req: express.Request, res: express.Response) {
    res.status(200).json({result: "success", bucket: buckets.get(req.params.bucket as string)})
})

router.get("/buckets/reset/:bucket/:auth", async function(req: express.Request, res: express.Response) {
  handleBucketReset(req, res)
})

router.get("/buckets/:bucket/:enabled/:auth", async function(req: express.Request, res: express.Response) {
  handleBucketEnable(req, res)
})

router.get("/status", async function(req: express.Request, res: express.Response) {
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

})

router.get("/buckets/", async function(req: express.Request, res: express.Response) {
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
})

router.get("/queue", async function(req: express.Request, res: express.Response) {
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
})

router.get("/queue/knudge", async function(req: express.Request, res: express.Response) {
  checkDeploymentQueue()
  res.status(200).json({result: "success"})
})

router.post("/world-deploy", async function(req: express.Request, res: express.Response) {
  handleWorldDeploy(req,res)
})

router.post("/iwb-deploy/:force", async function(req: express.Request, res: express.Response) {
  handleIWBDeploy(req,res, req.params.force === "true" ? true : false)
})

router.get("/hello-world", async function(req: express.Request, res: express.Response) {
  res.status(200).json({result: "success"})
})