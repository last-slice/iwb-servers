import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";

export class MeshColliderComponent extends Schema{
    @type("number") shape:number //0 - plane, 1 - box
    @type("number") layer:number
    @type("boolean") onPlay:boolean
}

export function createMeshColliderComponent(scene:Scene, data:any){
    let component = new MeshColliderComponent()
    component.shape = data.shape
    component.layer = data.layer
    component.onPlay = data.hasOwnProperty("onPlay") ? data.onPlay : false
    scene[COMPONENT_TYPES.MESH_COLLIDER_COMPONENT].set(data.aid, component)
}

export function editMeshColliderComponent(info:any, scene:Scene){
    let itemInfo:any = scene[COMPONENT_TYPES.MESH_COLLIDER_COMPONENT].get(info.aid)
    if(itemInfo){
        for(let key in info){
            if(itemInfo.hasOwnProperty(key)){
                itemInfo[key] = info[key]
            }
        }
    }
}