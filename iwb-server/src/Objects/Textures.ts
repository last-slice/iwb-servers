import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";

export class TextureComponent extends Schema{
    @type("number") type:number //0 - texture, 1 - video
    @type("string") path:string
    //wrap mode
    //filter mode
}

export function createTextureComponent(scene:Scene, data:any){
    let component = new TextureComponent()
    component.type = data.type
    component.path = data.path ? data.path : undefined
    scene.textures.set(data.aid, component)
}

export function editTextureComponent(info:any, scene:Scene){
    let itemInfo:any = scene.textures.get(info.aid)
    if(itemInfo){
        for(let key in info){
            if(itemInfo.hasOwnProperty(key)){
                itemInfo[key] = info[key]

                if(itemInfo.type === 1){
                    itemInfo.path = undefined
                }
            }
        }
    }
}