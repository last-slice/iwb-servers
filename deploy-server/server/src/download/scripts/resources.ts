import * as fs from 'fs';

export async function writeResourcesFile(location:string, data:any){
    let template = await writeFile()
    await fs.writeFileSync(location, template);
}


async function writeFile(){
    let scene = `
import { engine } from "@dcl/sdk/ecs"
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math"

export let colorsLabels:string[] = [
    "Black",
    "Blue",
    "Gray",
    "Green",
    "Magenta",
    "Purple",
    "Red",
    "Teal",
    "Yellow",
    "White",
]

export let colors:Color4[] = [
    Color4.Black(),
    Color4.Blue(),
    Color4.Gray(),
    Color4.Green(),
    Color4.Magenta(),
    Color4.Purple(),
    Color4.Red(),
    Color4.Teal(),
    Color4.Yellow(),
    Color4.White(),
]

export default {
    colors:{
        transparent: Color4.create(0,0,0,0),
        opaqueGreen: Color4.create(0,1,0,0.4)
    },

    textures:{
        atlas1:"assets/atlas1.png",
        atlas2:"assets/atlas2.png"
    },
}
`
return scene
}