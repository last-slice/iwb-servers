import * as fsExtra from 'fs-extra';
import { copyTemplate } from "./copy";
import { writeIndexFile } from "./entry";
import { writeIWBFile } from "./file";
import { writeSceneMetadata } from "./metadata";
import { zipScene } from "./zip";
import { copyAssets, copyUITextures } from "./assets";
import { writeComponentFile } from './componentFile';
import { writeSceneTemplate } from './template';
import { writeTypesFile } from './types';
import { writePlayModeFile } from './playMode';
import { writeActionsFile } from './actions';
import { writeUIFile } from './ui';
import { writeDialogPanelUI } from './dialogUI';
import { writeHelperFile } from './helper';
import { writeUIConfigFile } from './uiConfig';
import { writeResourcesFile } from './resources';
import { writeUITextComponentFile } from './uiTextComponent';
import { writeLibrariesFile } from './libraries';
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
        // await writeIndexFile(path.join(directory, "src/index.ts"))
        await writeSceneMetadata(path.join(directory, 'scene.json'), data)
        // await writeSceneTemplate(path.join(directory, "src/iwb/config.ts"), data)
        // await writeTypesFile(path.join(directory, 'src/iwb/types.ts'), data)
        // await writeIWBFile(path.join(directory, 'src/iwb/iwb.ts'), data)
        // await writeComponentFile(path.join(directory, 'src/iwb/components.ts'), data)
        // await writePlayModeFile(path.join(directory, 'src/iwb/playMode.ts'), data)
        // await writeActionsFile(path.join(directory, 'src/iwb/actions.ts'), data)
        // await writeUIFile(path.join(directory, 'src/iwb/ui.tsx'), data)
        // await writeDialogPanelUI(path.join(directory, 'src/iwb/dialogPanel.tsx'), data)
        // await writeUITextComponentFile(path.join(directory, 'src/iwb/showTextComponent.tsx'), data)
        // await writeLibrariesFile(path.join(directory, 'src/iwb/libraries.ts'), data)
        // await writeHelperFile(path.join(directory, 'src/iwb/helpers.ts'), data)
        // await writeUIConfigFile(path.join(directory, 'src/iwb/uiConfig.ts'), data)
        // await writeResourcesFile(path.join(directory, 'src/iwb/resources.ts'), data)
        await copyUITextures(path.join(directory, "assets/"), data)
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