import * as fs from 'fs-extra';
import { assetDirectory, temporaryDirectory, ugcDirectory } from '.';

export async function copyAssets(location:string, data:any){
    let alreaadyCopied:string[] = []

    for(let i = 0; i < data.assetIds.length; i++){
        let asset = data.assetIds[i]
        if(!alreaadyCopied.includes(asset.id)){
            console.log('copying asset', asset)
            let file = asset.id

            let catalogDirectory:string = asset.ugc ? (ugcDirectory + data.user + "/") : assetDirectory
            
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

export async function copyUITextures(location:string, data:any){
    if (await checkFileExists(assetDirectory + "atlas1.png")) {
        try{
            await fs.copy(assetDirectory + "atlas1.png", location + "atlas1.png")
        }
        catch(e){
            console.error(`Error copying file: ${e}`);
        }
    }else{
        console.log('file doesnt exist', assetDirectory + "atlas1.png")
    }

    if (await checkFileExists(assetDirectory + "atlas2.png")) {
        try{
            await fs.copy(assetDirectory + "atlas2.png", location + "atlas2.png")
        }
        catch(e){
            console.error(`Error copying file: ${e}`);
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