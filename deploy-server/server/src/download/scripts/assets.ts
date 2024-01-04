import * as fs from 'fs-extra';
import { assetDirectory, temporaryDirectory } from '.';

export async function copyAssets(data:any){
    let alreaadyCopied:string[] = []

    for(let i = 0; i < data.ass.length; i++){
        let asset = data.ass[i]
        if(asset.type === "3D" && !alreaadyCopied.includes(asset.id)){
            let location = temporaryDirectory + data.o + "-" + data.id + "/assets/"
            let file = asset.id
            
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
    
            try{
                await fs.copy(assetDirectory + file, location + file)
                alreaadyCopied.push(asset.id)
            }
            catch(e){
                console.error(`Error copying folder: ${e}`);
            }
        }
    }
}