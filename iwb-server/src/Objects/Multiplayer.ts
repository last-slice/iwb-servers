import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Quaternion, Vector3 } from "./Transform";
import { AttachedItem } from "./AttachedItem";
import { COMPONENT_TYPES } from "../utils/types";
import { Scene } from "./Scene";

export class MultiplayerComponent extends Schema{
    @type(AttachedItem) attachedItem:AttachedItem = new AttachedItem()
}

export function handleGlobalDetachItem(scene:Scene, aid:string){
    let multiplayerInfo = scene[COMPONENT_TYPES.MULTIPLAYER_COMPONENT].get(aid)
    if(!multiplayerInfo){
      console.log('no iwb infor for that item to detach')
      return
    }

    multiplayerInfo.attachedItem = undefined
}

export function handleGlobalAttachItem(scene:Scene, aid:string, userId:string, actionInfo:any){
    let iwbInfo = scene[COMPONENT_TYPES.IWB_COMPONENT].get(aid)
    if(!iwbInfo){
      console.log('no iwb infor for that item to attach')
      return
    }

    let multiplayerInfo:MultiplayerComponent
    multiplayerInfo = scene[COMPONENT_TYPES.MULTIPLAYER_COMPONENT].get(aid)
    if(!multiplayerInfo){
        multiplayerInfo = new MultiplayerComponent()
        scene[COMPONENT_TYPES.MULTIPLAYER_COMPONENT].set(aid, multiplayerInfo)
    }

    let attachedItem = new AttachedItem()
    attachedItem.id = iwbInfo.id
    attachedItem.userId = userId
    attachedItem.anchor = actionInfo.anchor
    attachedItem.pOffset = new Vector3({x:actionInfo.x, y:actionInfo.y, z:actionInfo.z})
    attachedItem.rOffset = new Vector3({x:actionInfo.xLook, y:actionInfo.yLook, z:actionInfo.zLook})
    attachedItem.sOffset = new Vector3({x:actionInfo.sx, y:actionInfo.sy, z:actionInfo.sz})
    attachedItem.enabled = true

    multiplayerInfo.attachedItem = attachedItem
}