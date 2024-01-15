import * as fsExtra from 'fs-extra';
import { copyTemplate } from "./copy";
import { writeIndexFile } from "./entry";
import { writeIWBFile } from "./file";
import { writeSceneMetadata } from "./metadata";
import { zipScene } from "./zip";
import { copyAssets } from "./assets";
import { writeComponentFile } from './componentFile';
import { writeSceneTemplate } from './template';

export let templateDirectory = process.env.NODE_ENV === "Development" ? process.env.DEV_DOWNLOAD_TEMPLATE_DIRECTORY : process.env.PROD_DOWNLOAD_TEMPLATE_DIRECTORY
export let temporaryDirectory = process.env.NODE_ENV === "Development" ? process.env.DEV_DOWNLOAD_TEMP_DIRECTORY : process.env.PROD_DOWNLOAD_TEMP_DIRECTORY
export let assetDirectory = process.env.NODE_ENV === "Development" ? process.env.DEV_DOWNLOAD_ASSET_DIRECTORY : process.env.PROD_DOWNLOAD_ASSET_DIRECTORY
export let ugcDirectory = process.env.NODE_ENV === "Development" ? process.env.DEV_DOWNLOAD_UGC_DIRECTORY : process.env.PROD_DOWNLOAD_UGC_DIRECTORY

export async function initDownload(req:any, res:any){
    let data = req.body.scene
    let template = ``

    copyTemplate(data)
    .then(()=>{
        writeIndexFile(data)
    })
    .catch((e)=>{
        console.log('error ', e)
        errorCleanup(data.o)
    })
    .then(()=>{
        writeSceneMetadata(data)
    })
    .catch((e)=>{
        console.log('error ', e)
        errorCleanup(data.o)
    })
    .then(()=>{
        writeSceneTemplate(data)
    })
    .catch((e)=>{
        console.log('error ', e)
        errorCleanup(data.o)
    })
    .then(()=>{
        writeIWBFile(data)
    })
    .catch((e)=>{
        console.log('error ', e)
        errorCleanup(data.o)
    })
    .then(()=>{
        writeComponentFile(data)
    })
    .catch((e)=>{
        console.log('error ', e)
        errorCleanup(data.o)
    })
    .then(async ()=>{
        await copyAssets(data)
    })
    .catch((e)=>{
        console.log('error ', e)
        errorCleanup(data.o)
    })
    .then(async ()=>{
        await zipScene(data)
    })
    .catch((e)=>{
        console.log('error ', e)
        errorCleanup(data.o)
    })
    res.status(200).send({valid: true})
}

async function errorCleanup(user:string){
    try{
        await fsExtra.remove(temporaryDirectory)
    }
    catch(e){
        console.log('error cleaning up ', user, e)
    }
}