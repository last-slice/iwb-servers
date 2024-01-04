import * as fsExtra from 'fs-extra';
import { copyTemplate } from "./copy";
import { writeIndexFile } from "./entry";
import { writeFile } from "./file";
import { writeSceneMetadata } from "./metadata";
import { writeImports } from "./imports"
import { writeSceneTemplate } from "./template";
import { writeParent } from "./parent";
import { writeItems } from "./items";
import { writeComponents } from "./components";
import { zipScene } from "./zip";
import { copyAssets } from "./assets";

export let templateDirectory = process.env.NODE_ENV === "Development" ? process.env.DEV_DOWNLOAD_TEMPLATE_DIRECTORY : process.env.PROD_DOWNLOAD_TEMPLATE_DIRECTORY
export let temporaryDirectory = process.env.NODE_ENV === "Development" ? process.env.DEV_DOWNLOAD_TEMP_DIRECTORY : process.env.PROD_DOWNLOAD_TEMP_DIRECTORY
export let assetDirectory = process.env.NODE_ENV === "Development" ? process.env.DEV_DOWNLOAD_ASSET_DIRECTORY : process.env.PROD_DOWNLOAD_ASSET_DIRECTORY

export async function initDownload(req:any, res:any){
    let data = req.body.scene
    let template = ``

    copyTemplate(data)
    .then(()=>{
        writeIndexFile(data)
        .then(()=>{
            writeSceneMetadata(data)
            .then(()=>{
                writeImports(template)
                .then((scene:any)=>{
                    writeSceneTemplate(data)
                    .then(()=>{
                        writeParent(scene)
                        .then((scene3:any)=>{
                            writeItems(scene3)
                            .then((scene4:any)=>{
                                writeComponents(scene4)
                                .then((scene5:any)=>{
                                    copyAssets(data)
                                    .then(()=>{
                                        writeFile(scene5, data)
                                        .then(async ()=>{
                                            await zipScene(data)
                                        })
                                        .catch((e)=>{
                                            console.log('error ', e)
                                            errorCleanup(data.o)
                                        })
                                    })
                                    .catch((e)=>{
                                        console.log('error ', e)
                                        errorCleanup(data.o)
                                    })
                                })
                                .catch((e)=>{
                                    console.log('error ', e)
                                    errorCleanup(data.o)
                                })
                            })
                            .catch((e)=>{
                                console.log('error ', e)
                                errorCleanup(data.o)
                            })
                        })
                        .catch((e)=>{
                            console.log('error ', e)
                            errorCleanup(data.o)
                        })
                    })
                    .catch((e)=>{
                        console.log('error ', e)
                        errorCleanup(data.o)
                    })
                })
                .catch((e)=>{
                    console.log('error ', e)
                    errorCleanup(data.o)
                })
            })
            .catch((e)=>{
                console.log('error ', e)
                errorCleanup(data.o)
            })
        })
        .catch((e)=>{
            console.log('error ', e)
            errorCleanup(data.o)
        })
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