import * as fs from 'fs-extra';
import { templateDirectory } from '.';

export async function copyTemplate(location:string, data:any){
    try{
        await fs.copy(templateDirectory, location)
    }
    catch(e){
        console.error(`Error copying folder: ${e}`);
    }
}