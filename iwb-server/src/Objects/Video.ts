import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";
import { editMeshRendererComponent } from "./MeshRenderers";
import { editMeshColliderComponent } from "./MeshColliders";
import { editMaterialComponent } from "./Materials";

//https://player.vimeo.com/external/917240498.m3u8?s=50ca7a3e589f79fb4feafefd94e393986e534907&logging=false

export class VideoComponent extends Schema {
    @type("number") type:number = -1 //0 - player, 1 - screen
    @type("number") volume:number
    @type("boolean") autostart:boolean = false
    @type("boolean") loop:boolean = false
    @type("boolean") synced:boolean = false
    @type("string") link:string = ""

    videoTexture:any
}

export function createVideoComponent(scene:Scene, aid:string, data?:any){
    let component:any = new VideoComponent()
    if(data){
        console.log('video component data is', data)
        for(let key in data){
            if(component.hasOwnProperty(key)){
                if(key === "volume" && data[key] > 1){
                    component[key] = 1
                }else{
                    component[key] = data[key]
                }
            }
        }
    }else{
        component.volume = 1
        component.autostart = false
        component.loop = false
    }

    scene[COMPONENT_TYPES.VIDEO_COMPONENT].set(aid, component)
}

export function editVideoComponent(info:any, scene:Scene){
    let itemInfo:any = scene[COMPONENT_TYPES.VIDEO_COMPONENT].get(info.aid)
    if(itemInfo){
        for(let key in info){
            if(itemInfo.hasOwnProperty(key)){
                itemInfo[key] = info[key]
            }
        }

        if(info.hasOwnProperty("type")){
            switch(info.type){
                case 0:
                    console.log('need to edit video player')
                    itemInfo.volume = 1
                    itemInfo.link = ""
                    break;

                case 1:
                    console.log('need to edit video screen', info)
                    editMeshRendererComponent({aid:info.aid, shape:0, onPlay:true}, scene)
                    editMeshColliderComponent({aid:info.aid, shape:0, onPlay:true}, scene)
                    editMaterialComponent({aid:info.aid, type:"texturetype", data:"VIDEO", texture:""}, scene)
                    break;
            }
        }

        if(info.hasOwnProperty("player")){
            editMaterialComponent({aid:info.aid, type:"texturetype", data:"VIDEO", texture:info.player}, scene)
        }

        if(info.hasOwnProperty("link")){
            console.log('need to update video texture link')
        }
    }
}