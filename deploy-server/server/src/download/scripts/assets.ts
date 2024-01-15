import * as fs from 'fs-extra';
import { assetDirectory, temporaryDirectory, ugcDirectory } from '.';

export async function copyAssets(data:any){
    let alreaadyCopied:string[] = []

    for(let i = 0; i < data.ass.length; i++){
        let asset = data.ass[i]
        if(asset.type === "3D" && !alreaadyCopied.includes(asset.id)){
            let location = temporaryDirectory + data.o + "-" + data.id + "/assets/"
            let file = asset.id

            let catalogDirectory:string = asset.ugc ? (ugcDirectory + data.o + "/") : assetDirectory
                        
            switch(asset.type){
                case '2D':
                    location += '2D/'
                    file += ".png"
                    break;
    
                case '3D':
                    location += '3D/'
                    file += ".glb"
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

async function checkFileExists(filePath: string) {
    try {
      fs.accessSync(filePath, fs.constants.F_OK);
      return true;
    } catch (err) {
      return false;
    }
  }