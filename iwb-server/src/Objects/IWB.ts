import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";

export class IWBComponent extends Schema{
    @type("string") id:string
    @type("string") aid:string
    @type("string") n:string
    @type("string") editor:string
    @type("string") description:string
    @type("string") owner:string
    @type("string") ownerAddress:string
    @type("string") category:string
    @type("string") type:string
    @type("string") style:string
    @type("boolean") ugc:boolean
    @type("boolean") pending:boolean
    @type("boolean") locked:boolean
    @type("boolean") buildVis:boolean
    @type("boolean") editing:boolean
    @type("boolean") priv:boolean
}

export function createIWBComponent(scene:Scene, data:any){
    let component = new IWBComponent()
    component.aid = data.scene.aid
    component.id = data.scene.id
    component.n = data.scene.n
    component.type = data.item.ty
    component.ugc = data.item.ugc
    component.pending = data.item.pending
    component.style = data.item.sty
    component.buildVis = true
    scene.itemInfo.set(data.scene.aid, component)
}