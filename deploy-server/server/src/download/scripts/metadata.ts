import * as fs from 'fs';
import { temporaryDirectory } from '.';

export async function updateWorldMetadata(location:string, data:any){
    console.log('updating iwb scene.json', data.ens)
    let fileData = await fs.promises.readFile(location)
    let metadata = JSON.parse(fileData.toString())

    metadata['iwb'] = {
        name: data.ens
    }

    await fs.promises.writeFile(location, JSON.stringify(metadata,null, 2));
}

export async function writeSceneMetadata(location:string, data:any, image:string){
    let fileData = await fs.promises.readFile(location)
    let metadata = JSON.parse(fileData.toString())

    console.log('image is', image)

    let {title, description, owner} = data.metadata
    
    metadata.display.title = title
    metadata.display.description = description
    metadata.display.navmapThumbnail = (image === "" || image === undefined ? "images/scene-thumbnail.png" : "images/" + image)
    metadata.owner = owner

    metadata.scene.parcels = []
    metadata.scene.base = ""

    data.parcels.forEach((parcel:any)=>{
        metadata.scene.parcels.push("" + parcel.x + "," + parcel.y)
    })

    metadata = determineBaseParcel(metadata, data.parcels)

    if(data.dest === "worlds"){
        metadata['worldConfiguration'] = {
            name: data.worldName
        }
    }
    else{
        delete metadata.worldConfiguration
    }

    metadata['iwb'] = {
        name: data.worldName
    }

    if(data.sceneId){
        metadata.iwb.scene = data.sceneId
    }

    metadata.spawnPoints = []
    data.spawns.forEach((sp:any, index:number)=>{
        const [x1,y1, z1] = sp.split(",")
        let spawn:any =  {
            "name": "spawn-" + index,
            "default": true,
            "position": {
              "x": parseFloat(x1),
              "y": parseFloat(y1),
              "z": parseFloat(z1)
            }
        }
        metadata.spawnPoints.push(spawn)
    })
    await fs.promises.writeFile(location, JSON.stringify(metadata,null, 2));
}

function determineBaseParcel(metadata:any, parcels:any[]){
    metadata.scene.base = "" + (parcels[0].x + "," + parcels[0].y)
    return metadata
}