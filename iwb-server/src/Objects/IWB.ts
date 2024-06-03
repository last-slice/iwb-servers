import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";

export class IWBComponent extends Schema{
    @type("string") id:string
    aid:string
    n:string
    editor:string
    description:string
    owner:string
    ownerAddress:string
    category:string
    type:string
    style:string
    ugc:boolean
    pending:boolean
    @type("boolean") locked:boolean
    @type("boolean") buildVis:boolean
    @type("boolean") editing:boolean
    @type("boolean") priv:boolean
}

export function createIWBComponent(scene:Scene, data:any){
    console.log('creating iwb item info component')
    let component = new IWBComponent()
    component.aid = data.scene.aid
    component.id = data.scene.id
    component.n = data.scene.n
    component.type = data.item.ty
    component.ugc = data.item.ugc
    component.pending = data.item.pending
    component.style = data.item.sty
    component.buildVis = true
    component.locked = false
    component.editing = false
    component.priv = false
    scene.itemInfo.set(data.scene.aid, component)
}

export function setIWBComponent(scene:Scene, key:string, components:any){
    for (const aid in components[key]) {
        let component = new IWBComponent(components[key][aid])
        // component.id = 
        scene.itemInfo.set(aid, component)
    }
}
export function editIWBComponent(info:any, scene:Scene){
    console.log('editing iwb info')
    let itemInfo:any = scene.itemInfo.get(info.aid)
    if(itemInfo){
        console.log('found iwb info to edit')
        delete info.component
        delete info.aid
        delete info.sceneId
        for(let key in info){
            console.log('key is', key)
            itemInfo[key] = info[key]
        }
    }
}