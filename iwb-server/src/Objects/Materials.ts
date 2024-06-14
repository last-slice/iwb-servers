import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES, Color4 } from "../utils/types";

export class MaterialComponent extends Schema{
    @type("number") type:number // 0 - pbr, 1 - unit
    @type(Color4) albedoColor:Color4
    @type("boolean") onPlay:boolean = false
}

export function createMaterialComponent(scene:Scene, aid:string, data:any){
    let component:any = new MaterialComponent()
    for(let key in data){
        if(key === "albedoColor"){
            component[key] = new Color4(data[key])
        }else{
            component[key] = data[key]
        }
    }
    scene[COMPONENT_TYPES.MATERIAL_COMPONENT].set(aid, component)
}

