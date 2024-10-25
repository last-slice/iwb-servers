import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Vector3 } from "./Transform";
import { COMPONENT_TYPES } from "../utils/types";
import { Scene } from "./Scene";

export class VirtualCameraComponent extends Schema{
    @type("number") transitiontype:number
    @type("number") transitionAmount:number
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