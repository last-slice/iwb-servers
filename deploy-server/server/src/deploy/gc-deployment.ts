import ignore from 'ignore'

import { buildTypescript, getSceneFile } from "./helpers"
import { ContentClient, DeploymentBuilder, createCatalystClient, createContentClient } from 'dcl-catalyst-client'
import { ChainId, EntityType, getChainName } from '@dcl/schemas'
import { Authenticator } from '@dcl/crypto'
import { getCatalystServersFromCache } from 'dcl-catalyst-client/dist/contracts-snapshots'
import { createFetchComponent } from '@well-known-components/fetch-component'
import { deployBuckets } from './buckets'
import { resetBucket } from '.'
import { buildScene } from '../download/scripts'
import { status } from "../config/config";
import { SERVER_MESSAGE_TYPES } from '../utils/types'

const { v4: uuidv4 } = require('uuid');

const fs = require('fs-extra');
const path = require('path');

export let dclBucketDirectory = status.DEBUG ? "/Users/lastraum/Desktop/programming/decentraland/lastslice/sdk7/iwb/servers/deploy-server/buckets/gc/" : "/root/iwb-deployment/buckets/gc/"
export let pendingDeployments:any = {}

export interface IFile {
    path: string
    content: Buffer
    size: number
  }

export async function handleGenesisCityDeployment(key:string, data:any){
  let bucket = deployBuckets.get(key)
  data.user = data.user.toLowerCase()

  bucket.owner = data.user
  bucket.address = data.user

  let bucketDirectory = path.join(dclBucketDirectory, key)
  console.log('dcl bucket directory is', bucketDirectory, data)

    try{
      if(pendingDeployments[data.user]){
        console.log('already have a deployment request')
      }else{
        pendingDeployments[data.user] = {
          status:"building",
          data: data,
          name: data.metadata.title,
          dest: data.dest,
          worldName: data.worldName,
          tokenId: data.tokenId
        }

        await buildScene(data, "deploy", bucketDirectory)

          await buildTypescript({
            workingDir: bucketDirectory, 
            watch:false, 
            production: true
          })

        //   // Obtain list of files to deploy//
          const originalFilesToIgnore = await fs.readFile(
            bucketDirectory + '/.dclignore',
              'utf8'
            )

          const files: IFile[] = await getFiles({
          ignoreFiles: originalFilesToIgnore,
          skipFileSizeCheck: false,
          }, bucketDirectory)
          const contentFiles = new Map(files.map((file) => [file.path, file.content]))

          // Create scene.json
          const sceneJson = await getSceneFile(bucketDirectory + "/")
          pendingDeployments[data.user].sceneJSON = sceneJson

          const { entityId, files: entityFiles } = await DeploymentBuilder.buildEntity({
              type: EntityType.SCENE,
              pointers: findPointers(sceneJson),
              files: contentFiles,
              metadata: sceneJson
          })

          pendingDeployments[data.user].entityFiles = entityFiles
          pendingDeployments[data.user].entityId = entityId
          pendingDeployments[data.user].auth = uuidv4()
          // pendingDeployments[req.body.user].timer = setTimeout(()=>{
          //   clearTimeout(pendingDeployments[req.body.user].timer)
          //   delete pendingDeployments[req.body.user]
          // }, 1000 * 60)

          console.log('pending deployments', pendingDeployments)

          try{
            console.log('senging message', {
              user:data.user, 
              auth:pendingDeployments[data.user].auth, 
              entityId:pendingDeployments[data.user].entityId, 
              // data:pendingDeployments[data.user].data,
              bucket: key
            })
            const result = await fetch((status.DEBUG ? process.env.IWB_DEV_PATH : process.env.IWB_PROD_PATH) + "scene/deployment/ready",
            {headers: {                      
                'Authorization': `${process.env.IWB_DEPLOYMENT_AUTH}`,
                "content-type":"application/json"
            },
            method:"POST",
            body: JSON.stringify({
              user:data.user, 
              auth:pendingDeployments[data.user].auth, 
              entityId:pendingDeployments[data.user].entityId, 
              data:{
                worldName:pendingDeployments[data.user].worldName,
                name:pendingDeployments[data.user].name,
                dest:pendingDeployments[data.user].dest,
                tokenId: pendingDeployments[data.user].tokenId
              },
              bucket: key
            })
          });
          let res = await result.json()
            console.log('result is', res)

            if(res.valid){
              console.log('valid ping, now wait for user to accept link')
              pendingDeployments[data.user].status = "signature"
            }else{
              resetDeployment(key)
            }
        }
        catch(e:any){
            console.log('error posting to iwb server', e)
            resetDeployment(key)
        }
      }
  }
  catch(e){
      console.log('error building gc deployment', e)
      resetDeployment(key)
      return
  }
}

export function resetDeployment(key:string){
    console.log('begin resetting bucket', key)
    let bucket = deployBuckets.get(key)
    delete pendingDeployments[bucket.owner]
    resetBucket(key)
}

export async function pingCatalyst(req:any, res:any){//entityId:any, address:any, signature:any){
    if(validateSignature(req)){
      console.log('valid signature, pinging catalyst for upload', req.body)
      let entityId = pendingDeployments[req.body.user.toLowerCase()].entityId
      let address = req.body.user.toLowerCase()
      let signature = req.body.signature
      let target:any
      if(req.body.target){
        target = req.body.target
        console.log("target is", target)
      }
  
      const authChain = Authenticator.createSimpleAuthChain(
          entityId,
          address,
          signature
      )
  
      // Uploading data
    let catalyst: ContentClient | null = null
    let url = ''
  
  //   if (args['--target']) {
  //     let target = args['--target']
  //     if (target.endsWith('/')) {
  //       target = target.slice(0, -1)
  //     }
  //     catalyst = await createCatalystClient({
  //       url: target,
  //       fetcher: createFetchComponent()
  //     }).getContentClient()
  //     url = target
  //   } else if (args['--target-content']) {
  //     const targetContent = args['--target-content']
  //     catalyst = createContentClient({
  //       url: targetContent,
  //       fetcher: createFetchComponent()
  //     })
  //     url = targetContent
  //   } else if (chainId === ChainId.ETHEREUM_SEPOLIA) {
  //     catalyst = await createCatalystClient({
  //       url: 'peer.decentraland.zone',
  //       fetcher: createFetchComponent()
  //     }).getContentClient()
  //     url = 'peer.decentraland.zone'
  //   } else {

  if(req.body.dest === "worlds"){
      catalyst = createContentClient({
        url: target,
        fetcher: createFetchComponent()
      })
  }
  else{
    target = undefined
      if(target){
          catalyst = await createCatalystClient({
              url: target,
              fetcher: createFetchComponent()
            }).getContentClient()
      }else{
      const cachedCatalysts = getCatalystServersFromCache('mainnet')
      for (const cachedCatalyst of cachedCatalysts) {
        const client = createCatalystClient({
          url: cachedCatalyst.address,
          fetcher: createFetchComponent()
        })
  
        const {
          healthy,
          content: { publicUrl }
        } = await client.fetchAbout()
  
        if (healthy) {
          catalyst = await client.getContentClient()
          url = publicUrl
          break
        }
      }
      }
    }
  
    if (!catalyst) {
      console.log('Could not find a up catalyst')
      res.status(200).json({valid: false, msg:"invalid catalyst"})
      return
    }
  
    console.log(`Uploading data to: ${url}`)
  
    const deployData = { entityId, files: pendingDeployments[req.body.user].entityFiles, authChain }
    // const position = pendingDeployments[req.body.user].sceneJSON.scene.base
    // const network = 'mainnet'
    // const worldName = pendingDeployments[req.body.user].sceneJSON.worldConfiguration?.name
    // const worldNameParam = worldName ? `&realm=${worldName}` : ''
    // const sceneUrl = `https://play.decentraland.org/?NETWORK=${network}&position=${position}&${worldNameParam}`
  
      try {
        const response = (await catalyst.deploy(deployData, {
          timeout: 600000
        })) as { message?: string }
        // project.setDeployInfo({ status: 'success' })
        console.log(`Content uploaded.`)// ${chalk.underline.bold(sceneUrl)}\n`)
        res.status(200).json({valid:true})
    
        if (response.message) {
          console.log(response.message)
        }
        pingIWBServer({type:SERVER_MESSAGE_TYPES.SCENE_DEPLOY_FINISHED, dest:pendingDeployments[req.body.user].dest, user:req.body.user, name:pendingDeployments[req.body.user].name, world:pendingDeployments[req.body.user].worldName, valid:true})
        resetDeployment(req.body.key)
      } catch (error: any) {
        // debug('\n' + error.stack)
        console.log('Could not upload content', error)

        res.status(200).json({valid: false, msg:"invalid api call"})
        pingIWBServer({type:SERVER_MESSAGE_TYPES.SCENE_DEPLOY_FINISHED, user:req.body.user, valid:false})
        resetDeployment(req.body.key)
      }
    }else{
      console.log('cannot validate message from signature request')

      res.status(200).json({valid:false})
      pingIWBServer({type:SERVER_MESSAGE_TYPES.SCENE_DEPLOY_FINISHED, user:req.body.user, valid:false})
      resetDeployment(req.body.key)
    }
}

async function pingIWBServer(data:any){
  let res = await fetch((status.DEBUG ? process.env.IWB_DEV_PATH : process.env.IWB_PROD_PATH) + "scene/deployment/finished",
    {headers:{
      "Content-type":"application/json"
    },
    method:"POST",
      body:JSON.stringify(data)
    })
  let json = await res.json()
  console.log('ping iwb server for deployment finished res', json)
}

function validateSignature(req:any){
  if(req.body && 
    req.body.user && 
    req.body.signature && 
    req.body.entityId && 
    pendingDeployments[req.body.user.toLowerCase()] &&
    pendingDeployments[req.body.user.toLowerCase()].entityId === req.body.entityId &&
    deployBuckets.has(req.body.key) &&
    deployBuckets.get(req.body.key).owner === req.body.user
    ){
    return true
  }else{
    console.log('body is', req.body, deployBuckets.get(req.body.key))
    return false
  }
}

function findPointers(sceneJson: any): string[] {
    return sceneJson.scene.parcels
  }

/**
   * Returns a promise of an array of objects containing the path and the content for all the files in the project.
   * All the paths added to the `.dclignore` file will be excluded from the results.
   * Windows directory separators are replaced for POSIX separators.
   * @param ignoreFile The contents of the .dclignore file
   */
async function getFiles({
    ignoreFiles = '',
    cache = false,
    skipFileSizeCheck = false,
  }: {
    ignoreFiles?: string
    cache?: boolean
    skipFileSizeCheck?: boolean
  } = {}, bucketDirectory:string): Promise<IFile[]> {

    // console.log('ignored files are ', ignoreFiles)

    const files = await getAllFilePaths(bucketDirectory, bucketDirectory)
    const filteredFiles = (ignore as any)()
      .add(ignoreFiles.split(/\n/g).map(($) => $.trim()))
      .filter(files)
    const data = []

    for (let i = 0; i < filteredFiles.length; i++) {
      const file = filteredFiles[i]
      const filePath = path.resolve(bucketDirectory, file)
      const stat = await fs.stat(filePath)

    //   if (stat.size > Project.MAX_FILE_SIZE_BYTES && !skipFileSizeCheck) {
    //     fail(
    //       ErrorType.UPLOAD_ERROR,
    //       `Maximum file size exceeded: '${file}' is larger than ${
    //         Project.MAX_FILE_SIZE_BYTES / 1e6
    //       }MB`
    //     )
    //   }

      const content = await fs.readFile(filePath)
      // console.log('file is', filePath)

      data.push({
        path: file.replace(/\\/g, '/'),
        content: Buffer.from(content),
        size: stat.size
      })
    }
    // this.files = data
    return data
  }

 /**
   * Returns a promise of an array containing all the file paths for the given directory.
   * @param dir The given directory where to list the file paths.
   */
 async function getAllFilePaths(dir:string, rootFolder:string): Promise<string[]> {
    try {
      const files = await fs.readdir(dir)
      let tmpFiles: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const filePath = path.resolve(dir, file)
        const relativePath = path.relative(rootFolder, filePath)
        const stat = await fs.stat(filePath)

        if (stat.isDirectory()) {
          const folderFiles = await getAllFilePaths(
            filePath,
            rootFolder
          )
          tmpFiles = tmpFiles.concat(folderFiles)
        } else {
          tmpFiles.push(relativePath)
        }
      }

      return tmpFiles
    } catch (e) {
      return []
    }
  }