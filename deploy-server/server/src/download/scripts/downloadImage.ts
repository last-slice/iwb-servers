import Axios from 'axios';
import * as fs from 'fs-extra';
import { dclBucketDirectory } from '../../deploy/gc-deployment'
const path = require('path');

export async function downloadImage(directory:string, data:any){
    try{
        await fs.copy(path.join(dclBucketDirectory, "scene-thumbnail.png"), path.join(directory, "images", "scene-thumbnail.png"));

        if(data.metadata.image !== ""){
            const response = await Axios({
                method: 'get',
                url: data.metadata.image,
                responseType: 'stream',
                });

            const contentType = response.headers['content-type'];
            let extension = '';

            switch (contentType) {
            case 'image/jpeg':
                extension = '.jpg';
                break;
            case 'image/png':
                extension = '.png';
                break;
            case 'image/gif':
                extension = '.gif';
                break;
            default:
                return ""
            }

            let tempPath = path.join(directory, `temp${extension}`)
            const savePath = path.join(directory, 'images', `scene-thumbnail${extension}`);

            await fs.ensureDir(path.dirname(tempPath));
        
            const writer = fs.createWriteStream(tempPath);
            response.data.pipe(writer);

            return new Promise<string>((resolve, reject) => {
                writer.on('finish', async() => {
                    try{
                        await fs.remove(path.join(directory, "images", "scene-thumbnail.png"));
                        await fs.rename(tempPath, savePath);
                        console.log('image location is', `scene-thumbnail${extension}`)
                        resolve(`scene-thumbnail${extension}`)
                    }
                    catch(e){
                        console.log("error on image write finish", e)
                        resolve("")
                    }
                });
            
                writer.on('error', async(err) => {
                    console.error('Error writing image to file', err);
                    await fs.remove(tempPath);
                    resolve("");
                });
              });
        }else{
            return ""
        }
    }
    catch(e){
        console.log('failed to download scene image')
        return ""
    }
}