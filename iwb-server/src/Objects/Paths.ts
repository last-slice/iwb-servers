import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES, Color4 } from "../utils/types";
import { Vector3 } from "./Transform";

export class PathComponent extends Schema{
    @type("string") id:string

    @type("number") start:number = 1 //1 - at starting point, 2 - at relative location
    @type("number") duration:number = 0 
    @type("number") speed:number

    @type("boolean") backToStart:boolean = false
    @type("boolean") loop:boolean = false
    @type("boolean") curve:boolean = false
    @type("boolean") smooth:boolean = false
    @type("boolean") lookPoint:boolean = false

    @type([Vector3]) paths:ArraySchema<Vector3> = new ArraySchema()

}

export function createPathComponent(scene:Scene, aid:string, data?:any){
    let component:any = new PathComponent()
    if(data){
        for(let key in data){
            if(key === "paths"){
                data[key].forEach((point:any)=>{
                    component[key].push(new Vector3(point))
                })
            }else{
                component[key] = data[key]
            }
        }
    }
    scene[COMPONENT_TYPES.PATH_COMPONENT].set(aid, component)
}

export function editPathComponent(info:any, scene:Scene){
    let itemInfo:any = scene[COMPONENT_TYPES.PATH_COMPONENT].get(info.aid)
    if(itemInfo){
        switch(info.action){
            case 'edit':
                for(let key in info){
                    if(itemInfo.hasOwnProperty(key)){
                        itemInfo[key] = info[key]
                    }
                }
                break;

            case 'addpoint':
                itemInfo.paths.push(new Vector3(info.point))
                break;

            case 'deletepoint':
                itemInfo.paths.splice(info.point, 1)
                break;
        }
    //     switch(info.action){
    //         case 'update':
    //             let npcData = info.npcData
    //             console.log('npc data to update', npcData)
    //             for(let key in npcData){
    //                 if(key === "eyeColor" || key === "skinColor" || key === "hairColor"){
    //                     itemInfo[key] = new Color4(npcData[key])
    //                 }
    //                 else if(key ==="wearables"){
    //                     // itemInfo.wearables = npcData[key]
    //                 }
    //                 else{
    //                     itemInfo[key] = npcData[key]
    //                 }
    //             }
    //             itemInfo.change += 1
    //             break;

    //         case 'addwearable':
    //             itemInfo.wearables.push(info.wearable)
    //             break;

    //         case 'deletewearable':
    //             itemInfo.wearables.splice(info.wearable, 1)
    //             break;
    //     }
    }
}