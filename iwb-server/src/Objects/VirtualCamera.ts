import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Vector3 } from "./Transform";
import { COMPONENT_TYPES } from "../utils/types";
import { Scene } from "./Scene";

export class VirtualCameraComponent extends Schema{
    @type("number") transitiontype:number = -1
    @type("number") transitionAmount:number = 0
    @type("number") lookAt:string
}

export function createVirtualCameraComponent(scene:Scene, aid:string, data?:any){
    let component:any = new VirtualCameraComponent()
    if(data){
        for(let key in data){
            component[key] = data[key]
        }
    }
    scene[COMPONENT_TYPES.VIRTUAL_CAMERA].set(aid, component)
}

export function editVirtualCameraComponent(info:any, scene:Scene){
    let componentInfo:any = scene[COMPONENT_TYPES.VIRTUAL_CAMERA].get(info.aid)
    if(!componentInfo){
        return
    }

    for(let key in info){
        componentInfo[key] = info[key]
    }
}