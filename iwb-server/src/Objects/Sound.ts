import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";


export class SoundComponent extends Schema {
    @type("string") name:string = ""
    @type("string") url:string = ""
    @type("number") type:number = 0 //0 - sound file, 1 - audio stream, 2 - audius song, 3 - audius playist
    @type("number") volume:number = 1
    @type("boolean") autostart:boolean = false
    @type("boolean") loop:boolean = false
    @type("boolean") attach:boolean = false
}

export function createAudioComponent(scene:Scene, aid:string, data:any){
    let component:any = new SoundComponent()
    if(data){
        for(let key in data){
            if(data.hasOwnProperty(key)){
                component[key] = data[key]
            }
        }
    }
    scene[COMPONENT_TYPES.AUDIO_COMPONENT].set(aid, component)
}

// export function createAudioSourceComponent(scene:Scene, aid:string, data:any){
//     let component:any = new SoundComponent()
//     if(data){
//         for(let key in data){
//             if(data.hasOwnProperty(key)){
//                 component[key] = data[key]
//             }
//         }
//     }
//     scene[COMPONENT_TYPES.AUDIO_SOURCE_COMPONENT].set(aid, component)
// }

// export function createAudioStreamComponent(scene:Scene, aid:string, data:any){
//     let component:any = new SoundComponent()
//     if(data){
//         for(let key in data){
//             if(data.hasOwnProperty(key)){
//                 component[key] = data[key]
//             }
//         }
//     }
//     scene[COMPONENT_TYPES.AUDIO_STREAM_COMPONENT].set(aid, component)
// }

export function editAudioComponent(info:any, scene:any){
    let itemInfo:any = scene[COMPONENT_TYPES.AUDIO_COMPONENT].get(info.aid)
    if(itemInfo){
        for(let key in info){
            if(itemInfo.hasOwnProperty(key)){
                itemInfo[key] = info[key]
            }
        }
    }
}