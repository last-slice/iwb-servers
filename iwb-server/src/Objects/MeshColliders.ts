import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";

export class MeshColliderComponent extends Schema{
    @type("number") shape:number //0 - plane, 1 - box
    @type("number") layer:number
}

export function createMeshColliderComponent(scene:Scene, data:any){
    let component = new MeshColliderComponent()
    component.shape = data.shape
    component.layer = data.layer
    scene.meshColliders.set(data.aid, component)
}

export function editMeshColliderComponent(info:any, scene:Scene){
    let itemInfo:any = scene.meshColliders.get(info.aid)
    if(itemInfo){
        for(let key in info){
            if(itemInfo.hasOwnProperty(key)){
                itemInfo[key] = info[key]
            }
        }
    }
}