import * as fs from 'fs-extra';
import { assetDirectory, temporaryDirectory, ugcDirectory } from '.';
import path from 'path';

export async function copyAssets(location:string, data:any, type:string){
    let alreaadyCopied:string[] = []
    let assetIds:any[] = []

    if(type === "download"){
        console.log('data is',data)
        let iwbAssets = data.IWB
        assetIds.length = 0
        for(let aid in iwbAssets){
            assetIds.push(iwbAssets[aid])
        }
    }else{
        assetIds =  data.assetIds
    }

    for(let i = 0; i < assetIds.length; i++){
        let asset = assetIds[i]
        // console.log('asset is', asset)
        if(!alreaadyCopied.includes(asset.id)){
            // console.log('copying asset', asset)
            let file = asset.id

            let catalogDirectory:string = asset.ugc ? (ugcDirectory + data.user + "/") : assetDirectory

            if(type === "download"){
                catalogDirectory = asset.ugc ? (ugcDirectory + data.metadata.o + "/") : assetDirectory
            }
            
            // console.log('copying asset', asset)
            switch(asset.type){
                case '2D':
                    file += ".png"
                    break;

                case '3D':
                    file += ".glb"
                    break;

                 case 'Audio':
                    file += ".mp3"
                    break;
            }

            if (await checkFileExists(catalogDirectory + file)) {
                try{
                    await fs.copy(catalogDirectory + file, location + file)
                    alreaadyCopied.push(asset.id)
                }
                catch(e){
                    console.error(`Error copying file: ${e}`);
                }
            }else{
                console.log('file doesnt exist', catalogDirectory + file)
            }
        }
    }

}

export async function copyUITextures(location:string, data:any, archive?:any){
    if (await checkFileExists(assetDirectory + "atlas1.png")) {
        try{
            if(archive){
                const fileName = path.basename(assetDirectory + "atlas1.png"); // Get only the file name
                const archivePath = `assets/${fileName}`; // Store under `/assets/`
                archive.file(assetDirectory + "atlas1.png", { name: archivePath });
            }
            else{
                await fs.copy(assetDirectory + "atlas1.png", location + "atlas1.png")
            }
        }
        catch(e){
            console.error(`Error copying file: ${e}`);
        }
    }else{
        console.log('file doesnt exist', assetDirectory + "atlas1.png")
    }

    if (await checkFileExists(assetDirectory + "atlas2.png")) {
        if(archive){
            const fileName = path.basename(assetDirectory + "atlas2.png"); // Get only the file name
            const archivePath = `assets/${fileName}`; // Store under `/assets/`
            archive.file(assetDirectory + "atlas2.png", { name: archivePath });
        }
        else{
            await fs.copy(assetDirectory + "atlas2.png", location + "atlas2.png")
        }
    }else{
        console.log('file doesnt exist', assetDirectory + "atlas2.png")
    }
}

async function checkFileExists(filePath: string) {
    try {
      fs.accessSync(filePath, fs.constants.F_OK);
      return true;
    } catch (err) {
      return false;
    }
  }

export async function copyAssetsToZip(archive:any, sceneJSON:any){
    let alreaadyCopied:string[] = []
    let assetIds:any[] = []
    try{
        let iwbAssets = sceneJSON.IWB
        assetIds.length = 0
        for(let aid in iwbAssets){
            assetIds.push(iwbAssets[aid])
        }

        for(let i = 0; i < assetIds.length; i++){
            let asset = assetIds[i]
            // console.log('asset is', asset)
            if(!alreaadyCopied.includes(asset.id)){
                // console.log('copying asset', asset)
                let file = asset.id
    
                let catalogDirectory:string = asset.ugc ? (ugcDirectory + sceneJSON.metadata.o + "/") : assetDirectory

                // console.log('copying asset', asset)
                switch(asset.type){
                    case '2D':
                        file += ".png"
                        break;
    
                    case '3D':
                        file += ".glb"
                        break;
    
                     case 'Audio':
                        file += ".mp3"
                        break;
                }
    
                if (await checkFileExists(catalogDirectory + file)) {
                    try{
                        // await fs.copy(catalogDirectory + file, location + file)
                        const fileName = path.basename(catalogDirectory + file); // Get only the file name
                        const archivePath = `assets/${fileName}`; // Store under `/assets/`

                        console.log(`Adding ${catalogDirectory + file} -> ${archivePath}`);
                        archive.file(catalogDirectory + file, { name: archivePath });
                        alreaadyCopied.push(asset.id)
                    }
                    catch(e){
                        console.error(`Error copying file: ${e}`);
                    }
                }else{
                    console.log('file doesnt exist', catalogDirectory + file)
                }
            }
        }
    }
    catch(e:any){
        console.log('error copying assets', e)
    }
}