import * as fs from 'fs';
import { temporaryDirectory } from '.';

export async function writeSceneMetadata(data:any){
    let fileData = await fs.promises.readFile(temporaryDirectory + data.o + "-" + data.id + '/scene.json')
    let metadata = JSON.parse(fileData.toString())
    
    metadata.display.title = data.n
    metadata.display.description = data.d
    metadata.owner = data.ona
    metadata.scene.base = data.bpcl
    metadata.scene.parcels = data.pcls
    metadata.spawnPoints = []

    data.sp.forEach((sp:any, index:number)=>{
        const [x1, z1] = sp.split(",")
        let spawn:any =  {
            "name": "spawn-" + index,
            "default": true,
            "position": {
              "x": parseFloat(x1),
              "y": 1,
              "z": parseFloat(z1)
            }
        }
        metadata.spawnPoints.push(spawn)
    })

    await fs.promises.writeFile(temporaryDirectory + data.o + "-" + data.id + '/scene.json', JSON.stringify(metadata,null, 2));
}