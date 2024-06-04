import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";

export class VideoComponent extends Schema {
    @type("string") url:string
    @type("number") volume:number
    @type("boolean") autostart:boolean
    @type("boolean") loop:boolean
}

export function createVideoComponent(scene:Scene, aid:string, data:any){
    let component = new VideoComponent()
    component.url = data.url
    component.volume = 1
    component.autostart = false
    component.loop = false
    scene.videos.set(aid, component)
}

export function editVideoComponent(info:any, scene:Scene){
    let itemInfo:any = scene.videos.get(info.aid)
    if(itemInfo){
        for(let key in info){
            if(itemInfo.hasOwnProperty(key)){
                itemInfo[key] = info[key]
            }
        }
    }
}