import * as fsExtra from 'fs-extra';
import { copyDirectory, copyTemplate } from "./copy";
import { writeSceneMetadata } from "./metadata";
import { copyAssets, copyUITextures } from "./assets";
import { downloadImage } from './downloadImage';
import { addSceneJSONFile } from './addSceneJSONFile';
import { resetBucket } from 'src/deploy';
const path = require('path');

export let bucketDirectory = process.env.NODE_ENV === "Development" ? process.env.DEV_IWB_BUCKET_DIRECTORY : process.env.PROD_IWB_BUCKET_DIRECTORY
export let temporaryDirectory = process.env.NODE_ENV === "Development" ? process.env.DEV_DOWNLOAD_TEMP_DIRECTORY : process.env.PROD_DOWNLOAD_TEMP_DIRECTORY
export let assetDirectory = process.env.NODE_ENV === "Development" ? process.env.DEV_DOWNLOAD_ASSET_DIRECTORY : process.env.PROD_DOWNLOAD_ASSET_DIRECTORY
export let ugcDirectory = process.env.NODE_ENV === "Development" ? process.env.DEV_DOWNLOAD_UGC_DIRECTORY : process.env.PROD_DOWNLOAD_UGC_DIRECTORY

export async function buildScene(data:any, type:string, bucketDirectory?:string, pendingData?:any){

    let directory = type === "download" ? path.join(temporaryDirectory, data.metadata.o + "-" + data.id) : bucketDirectory
    if(type === "download"){
        try{
            await copyDirectory(directory)
            await addSceneJSONFile(directory, data);
        }
        catch(e:any){
            console.log('error building download directory', e.message)
            errorCleanup(directory)
            throw new Error("Building Download Error")
        }
    }else{
        try{
            let image = await downloadImage(directory, data)
            await writeSceneMetadata(path.join(directory, 'scene.json'), data, image, type, pendingData)
            await copyUITextures(path.join(directory, "assets/"), data)
            await copyAssets(path.join(directory, "assets/"), data, type)

            
        }
        catch(e:any){
            console.log('error building directory', e.message)
            throw new Error("Error building directory")
        }
    }
}

export async function errorCleanup(temp:string){
    try{
        await fsExtra.remove(temp)
    }
    catch(e){
        console.log('error cleaning up ', temp, e)
    }
    return false
}