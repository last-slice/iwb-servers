import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";

export class MeshRendererComponent extends Schema{
    @type("number") shape:number //0 - plane, 1 - box
}

export function createMeshRendererComponent(scene:Scene, data:any){
    let component = new MeshRendererComponent()
    component.shape = data.shape
    scene.meshRenders.set(data.aid, component)
}

export function editMeshRendererComponent(info:any, scene:Scene){
    let itemInfo:any = scene.meshRenders.get(info.aid)
    if(itemInfo){
        for(let key in info){
            if(itemInfo.hasOwnProperty(key)){
                itemInfo[key] = info[key]
            }
        }
    }
}