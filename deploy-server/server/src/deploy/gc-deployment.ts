import fs from 'fs-extra'
import path from 'path'
import ignore from 'ignore'

import { buildTypescript, getSceneFile } from "./helpers"
import { ContentClient, DeploymentBuilder, createCatalystClient } from 'dcl-catalyst-client'
import { ChainId, EntityType, getChainName } from '@dcl/schemas'
import { Authenticator } from '@dcl/crypto'
import { getCatalystServersFromCache } from 'dcl-catalyst-client/dist/contracts-snapshots'
import { createFetchComponent } from '@well-known-components/fetch-component'

// export let workingDirectory = "/Users/lastraum/Desktop/programming/decentraland/lastslice/sdk7/iwb/toolset/"
export let workingDirectory = "/Users/lastraum/Downloads/scene/"

let testEntityFiles:any
let testJSON:any

export interface IFile {
    path: string
    content: Buffer
    size: number
  }

export async function handleGenesisCityDeployment(req:any, res:any){
    res.status(200).json({result: "failure", msg:"invalid api call"})
    
    try{
        await buildTypescript({
            workingDir: workingDirectory, 
            watch:false, 
            production: true
        })
    }
    catch(e){
        console.log('error building gc deployment', e)
    }

    // Obtain list of files to deploy
    const originalFilesToIgnore = await fs.readFile(
        workingDirectory + '.dclignore',
        'utf8'
      )

    const files: IFile[] = await getFiles({
    ignoreFiles: originalFilesToIgnore,
    skipFileSizeCheck: false
    })
    const contentFiles = new Map(files.map((file) => [file.path, file.content]))

    // Create scene.json
    const sceneJson = await getSceneFile(workingDirectory)
    testJSON = sceneJson

    const { entityId, files: entityFiles } = await DeploymentBuilder.buildEntity({
        type: EntityType.SCENE,
        pointers: findPointers(sceneJson),
        files: contentFiles,
        metadata: sceneJson
    })

    testEntityFiles = entityFiles

    console.log('entity id is', entityId)
}

export async function pingCatalyst(req:any, res:any){//entityId:any, address:any, signature:any){
    let entityId = req.body.entityId
    let address = req.body.address
    let signature = req.body.signature

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
    if(req.body.target){
        catalyst = await createCatalystClient({
            url: req.body.target,
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

  if (!catalyst) {
    console.log('Could not find a up catalyst')
    return
  }

  console.log(`Uploading data to: ${url}`)

  const deployData = { entityId, files: testEntityFiles, authChain }
  const position = testJSON.scene.base
  const network = 'mainnet'
  const worldName = testJSON.worldConfiguration?.name
  const worldNameParam = worldName ? `&realm=${worldName}` : ''
  const sceneUrl = `https://play.decentraland.org/?NETWORK=${network}&position=${position}&${worldNameParam}`

  try {
    const response = (await catalyst.deploy(deployData, {
      timeout: 600000
    })) as { message?: string }
    // project.setDeployInfo({ status: 'success' })
    console.log(`Content uploaded.`)// ${chalk.underline.bold(sceneUrl)}\n`)
    res.status(200).json({result: "failure", msg:"invalid api call"})

    if (response.message) {
      console.log(response.message)
    }
  } catch (error: any) {
    // debug('\n' + error.stack)
    console.log('Could not upload content', error)
    res.status(200).json({result: "failure", msg:"invalid api call"})
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
    skipFileSizeCheck = false
  }: {
    ignoreFiles?: string
    cache?: boolean
    skipFileSizeCheck?: boolean
  } = {}): Promise<IFile[]> {
    // if (cache && this.files.length) {
    //   return this.files
    // }

    const files = await getAllFilePaths()
    const filteredFiles = (ignore as any)()
      .add(ignoreFiles.split(/\n/g).map(($) => $.trim()))
      .filter(files)
    const data = []

    for (let i = 0; i < filteredFiles.length; i++) {
      const file = filteredFiles[i]
      const filePath = path.resolve(workingDirectory, file)
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
 async function getAllFilePaths(
    { dir, rootFolder }: { dir: string; rootFolder: string } = {
      dir: workingDirectory,
      rootFolder: workingDirectory
    }
  ): Promise<string[]> {
    try {
      const files = await fs.readdir(dir)
      let tmpFiles: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const filePath = path.resolve(dir, file)
        const relativePath = path.relative(rootFolder, filePath)
        const stat = await fs.stat(filePath)

        if (stat.isDirectory()) {
          const folderFiles = await getAllFilePaths({
            dir: filePath,
            rootFolder
          })
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