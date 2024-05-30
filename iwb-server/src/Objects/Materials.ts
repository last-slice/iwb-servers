import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { Color4 } from "../utils/types";

export class TextureComponent extends Schema{
    @type("string") src:number
}

export class EmissiveComponent extends Schema{
    @type("string") src:number
    @type(Color4) color:Color4
    @type("number") intensity:number
}

export class MaterialComponent extends Schema{
    @type("string") type:string
    @type(Color4) albedoColor:Color4
    @type(TextureComponent) texture:TextureComponent
    @type(EmissiveComponent) emissive:EmissiveComponent
}

export function createMaterialComponent(scene:Scene, aid:string, data:any){
    let component = new MaterialComponent()
    component.type = data.type
    data.albedoColor ? component.albedoColor = new Color4(data.albedoColor) : null

    if(data.texture){
        component.texture = new TextureComponent(data.texture)
    }

    if(data.emissive){
        component.emissive = new EmissiveComponent()
        component.emissive.color = new Color4(data.emissive.color)
        component.emissive.src = data.emissive.src
        component.emissive.intensity = data.emissive.intensity
    }
    scene.materials.set(aid, component)

}

