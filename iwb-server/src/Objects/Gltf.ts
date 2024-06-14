import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";

export class GltfComponent extends Schema{
    @type("string") src:string
    @type("number") visibleCollision:number
    @type("number") invisibleCollision:number
}

export function createGLTFComponent(scene:Scene, data:any){
    let component = new GltfComponent()
    component.src = data.src
    component.visibleCollision = data.visibleCollision
    component.invisibleCollision = data.invisibleCollision
    scene[COMPONENT_TYPES.GLTF_COMPONENT].set(data.aid, component)
}

export function editGltfComponent(info:any, scene:Scene){
    let itemInfo:any = scene[COMPONENT_TYPES.GLTF_COMPONENT].get(info.aid)
    if(itemInfo){
        for(let key in info){
            if(itemInfo.hasOwnProperty(key)){
                itemInfo[key] = info[key]
            }
        }
    }
}