import * as fs from 'fs';
import { temporaryDirectory } from '.';
import { status } from '../../config/config'

export async function updateWorldMetadata(location:string, data:any){
    console.log('updating iwb scene.json', data.ens)
    let fileData = await fs.promises.readFile(location)
    let metadata = JSON.parse(fileData.toString())

    metadata['iwb'] = {
        name: data.ens,
        gcScene:false,
        online:true
    }


    await fs.promises.writeFile(location, JSON.stringify(metadata,null, 2));
}

export async function writeSceneMetadata(location:string, data:any, image:string, type:string, pendingData?:any){
    let fileData = await fs.promises.readFile(location)
    let metadata = JSON.parse(fileData.toString())

    console.log('data is', data)

    let title:any
    let description:any
    let owner:any

    if(type === "download"){
        title = data.metadata.n
        description = data.metadata.d
        owner = data.metadata.o
    }else{
        title = data.metadata.title
        description = data.metadata.description
        owner = data.metadata.owner
    }
    
    metadata.display.title = title
    metadata.display.description = description
    metadata.display.navmapThumbnail = (image === "" || image === undefined ? "images/scene-thumbnail.png" : "images/" + image)
    metadata.owner = owner
    metadata.contact = {
        name: owner,
        email: "lastraum@lastslice.co"
    }

    metadata.scene.parcels = []
    metadata.scene.base = ""

    let locationJson:any
    if(data.dest === "angzaar"){
        console.log('we need to get angzaar parcels')
        try{
            let res = await fetch((status.DEBUG ? "http://localhost:5353" : "https://angzaar-plaza.dcl-iwb.co/ws") + "/api/plaza/locations/" + data.locationId)
            locationJson = await res.json()
            console.log('angzaar plaza location is', locationJson)

            if(locationJson.valid && locationJson.location){
                if(data.angzaarReset || (locationJson.location.currentReservation && locationJson.location.currentReservation === data.reservationId)){
                    console.log('we found reservation for user and its current, continue deployment')
                    metadata.scene.parcels = locationJson.location.parcels
                    metadata.scene.base = locationJson.location.parcels[0]
                    console.log('parcels are ', metadata.scene)
                    pendingData.base = locationJson.location.parcels[0]
                }else{
                    console.log('invalid reservation')
                    throw new Error("Invalid Reservation")
                }

                // let res = await fetch((status.DEBUG ? "http://localhost:5353" : "https://angzaar-plaza.dcl-iwb.co/ws") + "/api/plaza/reservation/" + data.reservationId)
                // let json = await res.json()
                // console.log('angzaar plaza location reservation is', json)
                // if(json.valid && 
                //     json.reservation && 
                //     json.reservation.current &&
                //     json.reservation.id === data.reservationId &&
                //     json.reservation.ethAddress === data.user
                // ){
                //     console.log('we found reservation for user and its current, continue deployment')
                //     metadata.scene.parcels = locationJson.location.parcels
                //     console.log('parcels are ', metadata.scene)

                // }else{
                //     console.log('invalid reservation')
                //     throw new Error("Invalid Reservation")
                // }
            }else{
                throw new Error("Invalid Angzaar Location")
            }
        }
        catch(e:any){
            console.log('error getting location parcels for angzaar plaza deployment')
            throw new Error("Invalid Angzaar Location")
        }
    }else{
        console.log('have a gc or download deployment')

        if(data.dest === "gc"){
            data.parcels.forEach((parcel:any)=>{
                metadata.scene.parcels.push("" + parcel.x + "," + parcel.y)
            })
            metadata = determineBaseParcel(metadata, data.parcels)
            pendingData.base = metadata.scene.base
        }else{
            data.pcls.forEach((parcel:any)=>{
                metadata.scene.parcels.push(parcel)
            })
            metadata.scene.base = data.bpcl
        }
    }

    if(data.dest === "worlds"){
        metadata['worldConfiguration'] = {
            name: data.worldName
        }
    }
    else{
        delete metadata.worldConfiguration
    }

    metadata['iwb'] = {
        name: data.worldName,
        gcScene:true,
        online:true,
        scene: type === "download" ? data : undefined
    }
    if(data.hasOwnProperty("angzaarReset")){
        metadata['iwb'].scenePool = true
        metadata['iwb'].parcles = locationJson.location.parcels
        metadata['iwb'].base = locationJson.location.parcels[0]
        metadata['iwb'].sceneId = data.sceneId
    }
    //     scenePool: data.angzaarReset ? true : undefined,
    //     parcles: data.angzaarReset ? locationJson.location.parcels : undefined,
    //     base: data.angzaarReset ?  locationJson.location.parcels[0] : undefined,
    //     sceneId: data.angzaarReset ? data.sceneId : undefined
    // }

    if(data.sceneId){
        metadata.iwb.scene = data.sceneId
    }

    metadata.spawnPoints = []

    if(data.hasOwnProperty("spawns")){
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
    }
    if(data.hasOwnProperty("sp")){
        data.sp.forEach((sp:any, index:number)=>{
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
    }
    
    console.log('scene metadata is', metadata['iwb'])
    await fs.promises.writeFile(location, JSON.stringify(metadata,null, 2));
}

function determineBaseParcel(metadata:any, parcels:any[]){
    metadata.scene.base = "" + (parcels[0].x + "," + parcels[0].y)
    return metadata
}