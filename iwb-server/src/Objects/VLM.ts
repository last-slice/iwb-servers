import {ArraySchema, Schema, type} from "@colyseus/schema";
import { COMPONENT_TYPES } from "../utils/types";
import { Scene } from "./Scene";

export class VLMComponent extends Schema {
    @type("string") id:string
}

export function createVLMComponent(scene:Scene, aid:string, data?:any){
    let component:any = new VLMComponent()
    if(data){
        for(let key in data){
            component[key] = data[key]
        }
    }
    // scene[COMPONENT_TYPES.VLM_COMPONENT].set(aid, component)
}

export function editVLMComponent(info:any, scene:any){
    console.log('editing vlm component', info)
    let componentInfo = scene[COMPONENT_TYPES.VLM_COMPONENT].get(info.aid)
    if(componentInfo){
        for(let key in info){
            if(componentInfo.hasOwnProperty(key)){
                componentInfo[key] = info[key]
            }
        }
    }
}