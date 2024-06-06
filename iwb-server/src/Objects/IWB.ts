import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { itemManager } from "../app.config";
import { IWBRoom } from "../rooms/IWBRoom";

export class IWBComponent extends Schema{
    @type("string") id:string
    aid:string
    n:string
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
    @type("string") editor:string
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

export function setIWBComponent(room:IWBRoom, scene:Scene, key:string, components:any){
    for (const aid in components[key]) {
        let component = new IWBComponent(components[key][aid])
        // component.id = 
        scene.itemInfo.set(aid, component)

        let catalogItem = component.ugc ? room.state.realmAssets.get(component.id) : itemManager.items.get(component.id)
        if(catalogItem){
            console.log('catalog item is', catalogItem)
            let size = catalogItem.si
            scene.itemInfo.forEach((item:IWBComponent, aid:string)=>{
                if(item.id === catalogItem.id){
                    size = 0
                }
            })
            scene.si += size
       }
    }
}

export function editIWBComponent(info:any, scene:Scene){
    let itemInfo:any = scene.itemInfo.get(info.aid)
    if(itemInfo){
        for(let key in info){
            if(itemInfo.hasOwnProperty(key)){
                itemInfo[key] = info[key]
            }
        }
    }
}