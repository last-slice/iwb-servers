import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";


export class SoundComponent extends Schema {
    @type("string") url:string
    @type("number") type:number
    @type("number") volume:number
    @type("boolean") autostart:boolean
    @type("boolean") loop:boolean
    @type("boolean") attach:boolean
}

export function createSoundComponent(scene:Scene, aid:string, data:any){
    let component = new SoundComponent()
    component.url = data.id
    component.type = data.ty === "Audio" ? 0 : 1
    component.volume = 1
    component.autostart = false
    component.loop = false
    component.attach = false
    scene.sounds.set(aid, component)
}

export function editAudioComponent(info:any, scene:Scene){
    let itemInfo:any = scene.sounds.get(info.aid)
    if(itemInfo){
        for(let key in info){
            if(itemInfo.hasOwnProperty(key)){
                itemInfo[key] = info[key]
            }
        }
    }
}