import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES, Color4 } from "../utils/types";

export class MaterialComponent extends Schema{
    @type("number") type:number // 0 - pbr, 1 - unit
    @type("string") playlist:string
    @type("number") intensity:number = 0
    @type("number") roughness:number = 1
    @type("number") metallic:number = 0
    @type("number") emissiveIntensity:number = 0
    @type("string") textureType:string
    @type("string") texture:string
    @type("string") emissiveType:string = "NONE"
    @type("string") emissveTexture:string = ''
    @type("string") transparencyMode:string
    @type("string") alphaType:string
    @type("string") alphaTexture:string
    @type(Color4) albedoColor:Color4 = new Color4({r:1, g:1, b:1, a:1})
    @type(Color4) emissiveColor:Color4 = new Color4({r:1, g:1, b:1, a:1})
    @type("boolean") onPlay:boolean = false
}

export function createMaterialComponent(scene:Scene, aid:string, data:any){
    let component:any = new MaterialComponent()
    for(let key in data){
        if(key === "albedoColor" || key === "emissiveColor"){
            component[key] = new Color4(data[key])
        }else{
            component[key] = data[key]
        }
    }
    scene[COMPONENT_TYPES.MATERIAL_COMPONENT].set(aid, component)
}

export function editMaterialComponent(info:any, scene:Scene){
    let materialInfo:any = scene[COMPONENT_TYPES.MATERIAL_COMPONENT].get(info.aid)
    if(materialInfo){
        switch(info.type){
            case 'playlist':
                materialInfo.playlist = info.data
                break;

            case 'texturetype':
                materialInfo.textureType = info.data
                break;

            case 'emissivetexturetype':
                materialInfo.emissiveTexture = info.data
                break;

             case 'emissiveIntensity':
                materialInfo.emissiveIntensity = info.data
                break;

            case 'albedoColor':
                materialInfo.albedoColor[info.data.hue] = info.data.value
                break;
        }
    }
}

