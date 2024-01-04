import * as fs from 'fs-extra';
import { templateDirectory, temporaryDirectory } from '.';

export async function copyTemplate(data:any){
    try{
        await fs.copy(templateDirectory, temporaryDirectory + data.o + "-" + data.id)
    }
    catch(e){
        console.error(`Error copying folder: ${e}`);
    }
}