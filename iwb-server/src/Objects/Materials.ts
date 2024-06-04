import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { Color4 } from "../utils/types";

export class MaterialComponent extends Schema{
    @type("number") type:number // 0 - pbr, 1 - unit
    @type(Color4) albedoColor:Color4
}

export function createMaterialComponent(scene:Scene, aid:string, data:any){
    let component = new MaterialComponent()
    component.type = data.type
    data.albedoColor ? component.albedoColor = new Color4(data.albedoColor) : null
    scene.materials.set(aid, component)
}

