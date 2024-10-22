import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { itemManager } from "../app.config";
import { IWBRoom } from "../rooms/IWBRoom";
import { COMPONENT_TYPES } from "../utils/types";

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
    pending:boolean
    components:any
    entity:any
    @type("boolean") ugc:boolean
    @type("boolean") locked:boolean
    @type("boolean") buildVis:boolean
    @type("boolean") editing:boolean
    @type("string") editor:string
    @type("boolean") priv:boolean
}

export function createIWBComponent(room:IWBRoom, scene:Scene, data:any){
    // console.log('creating iwb component', data)
    let component = new IWBComponent()
    component.aid = data.scene.aid
    component.id = data.scene.id
    component.n = data.scene.n
    component.type = data.item.ty
    component.ugc = data.item.ugc !== undefined ? data.item.ugc : false
    component.pending = data.item.pending !== undefined ? data.item.pending : false
    component.style = data.item.sty
    component.buildVis = data.scene.buildVis !== undefined ? data.scene.buildVis : true
    component.locked = false
    component.editing = false
    component.priv = false

    checkAssetPolyAndSize(room, scene, data.scene.id)
    scene[COMPONENT_TYPES.IWB_COMPONENT].set(data.scene.aid, component)
}

export function setIWBComponent(room:IWBRoom, scene:Scene,aid:string, data:any){
    let catalogItem = room.state.realmAssets.get(data.id)
    if(catalogItem){
        let iwbData:any = {
            scene:{
                aid:aid,
                id:data.id,
                n:catalogItem.n,
                buildVis:data.buildVis
            },
            item:{
                pending:catalogItem.pending,
                ugc: catalogItem.ugc,
                ty: catalogItem.ty,
                sty: catalogItem.sty
            },
        }
        createIWBComponent(room, scene, iwbData)
    }
}

export function editIWBComponent(info:any, scene:Scene){
    let itemInfo:any = scene[COMPONENT_TYPES.IWB_COMPONENT].get(info.aid)
    if(itemInfo){
        for(let key in info){
            if(itemInfo.hasOwnProperty(key)){
                itemInfo[key] = info[key]
            }
        }
    }
}

function checkAssetPolyAndSize(room:IWBRoom, scene:Scene, id:string){
    let catalogItem = room.state.realmAssets.get(id) //component.ugc ? room.state.realmAssets.get(component.id) : itemManager.items.get(component.id)
    // console.log('catalog item is', catalogItem)
    if(catalogItem){
        let size = catalogItem.si
        scene.pc += catalogItem.pc

        scene[COMPONENT_TYPES.IWB_COMPONENT].forEach((item:IWBComponent, aid:string)=>{
            if(item.id === catalogItem.id){
                // console.log('we found same item in scene')
                size = 0
            }
        })
        scene.si += size
   }
}

export async function checkIWBCache(scene:Scene, aid:string, jsonScene:any){
    let itemInfo = scene[COMPONENT_TYPES.IWB_COMPONENT].get(aid)
    if(itemInfo){
        let itemJSON = itemInfo.toJSON()
        itemJSON.editing = false
        itemJSON.editor = ""
        jsonScene[COMPONENT_TYPES.IWB_COMPONENT][aid] = itemJSON
    }
    return jsonScene
}