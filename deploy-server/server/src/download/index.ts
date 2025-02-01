import * as fsExtra from 'fs-extra';
import { bucketDirectory, buildScene, errorCleanup, temporaryDirectory } from './scripts';
import { createZipFromDirectory, processDirectory, zipDirectory, zipScene } from './scripts/zip';
import { status } from '../config/config';
import path from 'path';

const { v4: uuidv4 } = require('uuid');

let downloadQueue:any[] = []
let cachedTime =  300

setInterval(()=>{
    checkDownloadQueue()
}, 1000 * 30)

function checkDownloadQueue(){
    let now = Math.floor(Date.now()/1000)
    downloadQueue.forEach(async (download:any, i:number)=>{
        if(now > download.time + cachedTime){
            await removefile(download)
        }
    })
}

async function removefile(download:any){
    try{
        await fsExtra.remove(temporaryDirectory + download.id + ".zip")
        let index = downloadQueue.findIndex((d)=> d.id === download.id)
        if(index >=0){
            downloadQueue.splice(index)
        }
    }
    catch(e){
        console.log('error removing download zip, ', download.user, e)
    }
}

export function deleteUserDownload(user:string, id:string){
    let download = findUserDownload(user, id)
    if(download){
        removefile(download)
    }
}

export function updateCacheTime(time:number){
    cachedTime = time
}

export function getDownloadQueue(){
    return downloadQueue
}

export function findUserDownload(user:string, id:string){
    return downloadQueue.find((d)=> d.id === user + "-" + id)
}

// export async function handleSceneDownload(req:any, res:any){
//     try{
//         await buildScene(req.body.scene, "download")
//         await zipScene(req.body.scene, "download")
//         // await zipDirectory(req.body.scene, "download")
        // addDownloadQueue(req.body.scene.id, req.body.scene.metadata.o, Math.floor(Date.now()/1000))
//         // errorCleanup(path.join(temporaryDirectory, req.body.scene.metadata.o + "-" + req.body.scene.id))
//     }
//     catch(e){
//         console.log('error handling scene download', e)
//     }
// }

export async function handleSceneDownload(req:any, res:any){
    try{
        let scene = req.body.scene
        let owner = scene.metadata.o
        let zipId = uuidv4()

        let zipFilename = owner + "-" + zipId + ".zip"
        let outputFile = path.join(temporaryDirectory, zipFilename)
        await createZipFromDirectory(outputFile, scene)
        addDownloadQueue(owner, zipId)
        
    }
    catch(e){
        console.log('error handling scene download', e)
    }
}

export async function addDownloadQueue(owner:string, id:string){
    downloadQueue.push({id:owner + "-" + id, time:Math.floor(Date.now()/1000)})
    try{
        let res = await fetch((status.DEBUG ? process.env.IWB_DEV_PATH : process.env.IWB_PROD_PATH ) + "download/ready",{
            method:"POST",
            headers:{"Content-type":"application/json"},
            body:JSON.stringify({
                user:owner,
                id:id,
            })
        })
        let json = await res.json()
        console.log("download ready fetch", json)
    }
    catch(e){
        console.log('error pinging iwb server for new zip download', owner, e)
    }
}

// export async function addDownloadQueue(sceneId:string, user:string, time:number){
//     let id = uuidv4()
//     downloadQueue.push({user:user, time:time, id:id, sceneId:sceneId})
//     try{
//         let res = await fetch((status.DEBUG ? process.env.IWB_DEV_PATH : process.env.IWB_PROD_PATH ) + "download/ready",{
//             method:"POST",
//             headers:{"Content-type":"application/json"},
//             body:JSON.stringify({
//                 user:user,
//                 time:time,
//                 id:id,
//                 sceneId:sceneId
//             })
//         })
//         let json = await res.json()
//         console.log("download ready fetch", json)
//     }
//     catch(e){
//         console.log('error pinging iwb server for new zip download', user, e)
//     }
// }