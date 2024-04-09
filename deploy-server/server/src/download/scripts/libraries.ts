import * as fs from 'fs';

export async function writeLibrariesFile(location:string, data:any){
    let template = await writeFile()
    await fs.writeFileSync(location, template);
}

async function writeFile(){
    let scene = `
    import * as utils from '@dcl-sdk/utils'
    // import * as ui from '@dcl/ui-scene-utils'
    // import * as l2 from '@dcl/l2-scene-utils'
    // import * as crypto from '@dcl/crypto-scene-utils'
    // import {NPC} from '@dcl/npc-scene-utils'
    import * as eth from 'eth-connect'
    // import {hud} from '@dcl/builder-hud'
    
    export {
        utils, 
        // ui, 
        // l2, 
        // crypto, 
        // NPC, 
        eth, 
        // hud
    }
    
    
`
return scene
}