import * as fsExtra from 'fs-extra';
import { temporaryDirectory } from './scripts';
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
        await fsExtra.remove(temporaryDirectory + download.user + "-" + download.time + ".zip")
        let index = downloadQueue.findIndex((d)=> d.user === download.user)
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

export function findUserDownload(user:string, sceneId:string){
    return downloadQueue.find((d)=> d.user === user)
}

export async function addDownloadQueue(sceneId:string, user:string, time:number){
    let id = uuidv4()
    downloadQueue.push({user:user, time:time, id:id, sceneId:sceneId})
    try{
        let res = await fetch(process.env.IWB_PATH + "download/ready",{
            method:"POST",
            headers:{"Content-type":"application/json"},
            body:JSON.stringify({
                user:user,
                time:time,
                id:id,
                sceneId:sceneId
            })
        })
        let json = await res.json()
        console.log("download ready fetch", json)
    }
    catch(e){
        console.log('error pinging iwb server for new zip download', user, e)
    }
}