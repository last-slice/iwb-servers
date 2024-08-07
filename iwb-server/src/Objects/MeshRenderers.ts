import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";

export class MeshRendererComponent extends Schema{
    @type("number") shape:number //0 - plane, 1 - box
    @type("boolean") onPlay:boolean = false
}

export function createMeshRendererComponent(scene:Scene, data:any){
    let component = new MeshRendererComponent()
    if(data){
        component.shape = data.shape
        component.onPlay = data.onPlay
    }
    
    scene[COMPONENT_TYPES.MESH_RENDER_COMPONENT].set(data.aid, component)
}

export function editMeshRendererComponent(info:any, scene:Scene){
    let itemInfo:any = scene[COMPONENT_TYPES.MESH_RENDER_COMPONENT].get(info.aid)
    if(itemInfo){
        for(let key in info){
            if(itemInfo.hasOwnProperty(key)){
                itemInfo[key] = info[key]
            }
        }
    }
}