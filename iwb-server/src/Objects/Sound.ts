import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";


export class SoundComponent extends Schema {
    @type("string") url:string = ""
    @type("number") type:number = 0
    @type("number") volume:number = 1
    @type("boolean") autostart:boolean = false
    @type("boolean") loop:boolean = false
    @type("boolean") attach:boolean = false
}

export function createSoundComponent(scene:Scene, aid:string, data:any){
    let component:any = new SoundComponent()
    if(data){
        console.log('data is', data)
        for(let key in data){
            if(data.hasOwnProperty(key)){
                console.log('data key is', data[key])
                component[key] = data[key]
            }
        }
    }
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