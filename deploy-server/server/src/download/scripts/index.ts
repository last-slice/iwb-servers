import * as fsExtra from 'fs-extra';
import { copyTemplate } from "./copy";
import { writeIndexFile } from "./entry";
import { writeIWBFile } from "./file";
import { writeSceneMetadata } from "./metadata";
import { zipScene } from "./zip";
import { copyAssets } from "./assets";
import { writeComponentFile } from './componentFile';
import { writeSceneTemplate } from './template';
const path = require('path');

export let templateDirectory = process.env.NODE_ENV === "Development" ? process.env.DEV_DOWNLOAD_TEMPLATE_DIRECTORY : process.env.PROD_DOWNLOAD_TEMPLATE_DIRECTORY
export let temporaryDirectory = process.env.NODE_ENV === "Development" ? process.env.DEV_DOWNLOAD_TEMP_DIRECTORY : process.env.PROD_DOWNLOAD_TEMP_DIRECTORY
export let assetDirectory = process.env.NODE_ENV === "Development" ? process.env.DEV_DOWNLOAD_ASSET_DIRECTORY : process.env.PROD_DOWNLOAD_ASSET_DIRECTORY
export let ugcDirectory = process.env.NODE_ENV === "Development" ? process.env.DEV_DOWNLOAD_UGC_DIRECTORY : process.env.PROD_DOWNLOAD_UGC_DIRECTORY

export async function buildScene(data:any, type:string, bucketDirectory?:string, parcels?:any){

    let directory = type === "download" ? path.join(temporaryDirectory, data.o + "-" + data.id) : bucketDirectory

    try{
        if(type === "download"){
            await copyTemplate(directory, data)
        }
        await writeIndexFile(path.join(directory, "src/index.ts"))
        await writeSceneMetadata(path.join(directory, 'scene.json'), data , parcels ? parcels : undefined)
        await writeSceneTemplate(path.join(directory, "src/iwb/config.ts"), data)
        await writeIWBFile(path.join(directory, 'src/iwb/iwb.ts'), data)
        await writeComponentFile(path.join(directory, 'src/iwb/components.ts'), data)
        await copyAssets(path.join(directory, "assets/"), data)
        return true
    }
    catch(e){
        console.log('error ', e)
        errorCleanup(data.o)
        throw new Error("download build scene error")
    }


    // copyTemplate(data)
    // .then(()=>{
    //     writeIndexFile(data)
    // })
    // .catch((e)=>{
    //     console.log('error ', e)
    //     errorCleanup(data.o)
    //     return false
    // })
    // .then(()=>{
    //     writeSceneMetadata(data)
    // })
    // .catch((e)=>{
    //     console.log('error ', e)
    //     errorCleanup(data.o)
    //     return false
    // })
    // .then(()=>{
    //     writeSceneTemplate(data)
    // })
    // .catch((e)=>{
    //     console.log('error ', e)
    //     errorCleanup(data.o)
    //     return false
    // })
    // .then(()=>{
    //     writeIWBFile(data)
    // })
    // .catch((e)=>{
    //     console.log('error ', e)
    //     errorCleanup(data.o)
    //     return false
    // })
    // .then(()=>{
    //     writeComponentFile(data)
    // })
    // .catch((e)=>{
    //     console.log('error ', e)
    //     errorCleanup(data.o)
    //     return false
    // })
    // .then(async ()=>{
    //     await copyAssets(data)
    // })
    // .catch((e)=>{
    //     console.log('error ', e)
    //     errorCleanup(data.o)
    //     return false
    // })
    // .then(async ()=>{
    //     sceneData = data
    // })
    // .catch((e)=>{
    //     console.log('error ', e)
    //     errorCleanup(data.o)
    //     return false
    // })
    // return sceneData
}

async function errorCleanup(user:string){
    try{
        await fsExtra.remove(temporaryDirectory)
    }
    catch(e){
        console.log('error cleaning up ', user, e)
    }
    return false
}