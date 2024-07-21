import * as fsExtra from 'fs-extra';
import { copyTemplate } from "./copy";
import { writeSceneMetadata } from "./metadata";
import { copyAssets, copyUITextures } from "./assets";
import { downloadImage } from './downloadImage';
const path = require('path');

export let templateDirectory = process.env.NODE_ENV === "Development" ? process.env.DEV_DOWNLOAD_TEMPLATE_DIRECTORY : process.env.PROD_DOWNLOAD_TEMPLATE_DIRECTORY
export let temporaryDirectory = process.env.NODE_ENV === "Development" ? process.env.DEV_DOWNLOAD_TEMP_DIRECTORY : process.env.PROD_DOWNLOAD_TEMP_DIRECTORY
export let assetDirectory = process.env.NODE_ENV === "Development" ? process.env.DEV_DOWNLOAD_ASSET_DIRECTORY : process.env.PROD_DOWNLOAD_ASSET_DIRECTORY
export let ugcDirectory = process.env.NODE_ENV === "Development" ? process.env.DEV_DOWNLOAD_UGC_DIRECTORY : process.env.PROD_DOWNLOAD_UGC_DIRECTORY

export async function buildScene(data:any, type:string, bucketDirectory?:string){

    let directory = type === "download" ? path.join(temporaryDirectory, data.o + "-" + data.id) : bucketDirectory

    try{
        if(type === "download"){
            await copyTemplate(directory, data)
        }

        let image = await downloadImage(directory, data)
        await writeSceneMetadata(path.join(directory, 'scene.json'), data, image)
        await copyUITextures(path.join(directory, "assets/"), data)
        await copyAssets(path.join(directory, "assets/"), data)

        return true
    }
    catch(e){
        console.log('error ', e)
        errorCleanup(data.o)
        throw new Error("download build scene error")
    }
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