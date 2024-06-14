import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { generateRandomId } from "../utils/functions";
import { removeActionFromTriggers } from "./Trigger";
import { COMPONENT_TYPES } from "../utils/types";
import { generateId } from "colyseus";
import { itemManager } from "../app.config";
import { IWBRoom } from "../rooms/IWBRoom";
import { createNewItem } from "../rooms/messaging/ItemHandler";
import { createGLTFComponent } from "./Gltf";

export class ActionComponentSchema extends Schema{

    @type("number") entity:number

    @type("string") hoverText:string
    @type("string") aid:string
    @type("string") anim:string
    @type("string") teleport:string
    @type("string") teleCam:string
    @type("boolean") loop:boolean
    @type("number") showSize:number
    @type("string") showPos:string
    @type("number") startDTimer:number
    @type("string") startDId:string

    @type("string") dialID:string
    @type("number") twT:number
    @type("number") twE:number
    @type("number") twD:number
    @type("number") twL:number
    @type("number") twEX:number
    @type("number") twEY:number
    @type("number") twEZ:number










    @type("string") id:string
    @type("string") name:string
    @type("string") type:string
    @type("number") anchor:number
    @type("string") emote:string
    @type("boolean") visible:boolean
    @type("number") vMask:number
    @type("number") iMask:number
    @type("string") text:string
    @type("number") textAlign:number
    @type("number") size:number
    @type("string") url:string
    @type("string") movePos:string
    @type("string") moveCam:string
    @type("boolean") moveRel:boolean
    @type("number") timer:number
    @type("number") x:number
    @type("number") y:number
    @type("number") z:number

    ///amount for add/subtract actions
    @type("number") value:number
    @type("string") counter:string
    @type("string") state:string
    @type("string") message:string
    @type(["string"]) actions:ArraySchema<string>
}

export class ActionComponent extends Schema {
    @type([ActionComponentSchema]) actions:ArraySchema<ActionComponentSchema> = new ArraySchema<ActionComponentSchema>()
}

export function createActionComponent(scene:Scene, aid:string, data:any){
    let component:any = new ActionComponent()
    let actions:any[] = []
    if(data){
        data.actions.forEach((action:any)=>{
            let newAction:any = new ActionComponentSchema()
            for(let key in action){
                if(action.hasOwnProperty(key)){
                    newAction[key] = action[key]
                }
            }
            newAction['id'] = generateRandomId(6)
            actions.push(newAction)
        })
    }
    component.actions = actions

    scene[COMPONENT_TYPES.ACTION_COMPONENT].set(aid, component)
}

export function editActionComponent(data:any, scene:Scene){
    let actions = scene[COMPONENT_TYPES.ACTION_COMPONENT].get(data.aid)
    if(!actions){
        scene[COMPONENT_TYPES.ACTION_COMPONENT].set(data.aid, new ActionComponent())
    }

    actions = scene[COMPONENT_TYPES.ACTION_COMPONENT].get(data.aid)

    switch(data.action){
        case 'add':
            let newAction:any = new ActionComponentSchema()
            let action = data.data
            for(let key in action){
                if(action.hasOwnProperty(key)){
                    if(key === "actions"){
                        if(!newAction.actions){
                            newAction.actions = new ArraySchema<string>()
                        }

                        action.actions.forEach((actionId:string)=>{
                            newAction.actions.push(actionId)
                        })
                    }
                    newAction[key] = action[key]
                }
            }
            newAction['id'] = generateRandomId(6)
            actions.actions.push(newAction)
            break;

        case 'delete':
            let toDelete = actions.actions.findIndex($=> $.id === data.data.id)
            if(toDelete >= 0){
                actions.actions.splice(toDelete, 1)
                removeActionFromTriggers(scene, data.data.id)
            }
            break;

    }
}

export function handleCloneAction(room:IWBRoom, scene:any, aid:string, action:ActionComponentSchema){
    let iwbInfo:any = scene[COMPONENT_TYPES.IWB_COMPONENT].get(aid)
    let nameInfo:any = scene[COMPONENT_TYPES.NAMES_COMPONENT].get(aid)
    if(iwbInfo && nameInfo){
        let clonedItemInfo:any = {...iwbInfo}
        let catalogItem:any = iwbInfo.ugc ? room.state.realmAssets.get(iwbInfo.id) : itemManager.items.get(iwbInfo.id)
        if(catalogItem){
            clonedItemInfo.aid = generateId(6)
            clonedItemInfo.n = nameInfo.value + " Clone"

            let transform = scene[COMPONENT_TYPES.TRANSFORM_COMPONENT].get(aid)
            if(transform){
                clonedItemInfo.position = {x:action.x, y:action.y, z:action.z}
                clonedItemInfo.rotation = {...transform.r}
                clonedItemInfo.scale = {...transform.s}

                createNewItem(room, scene, clonedItemInfo, catalogItem)

                let omittedComponents:COMPONENT_TYPES[] = [
                    COMPONENT_TYPES.NAMES_COMPONENT,
                    COMPONENT_TYPES.IWB_COMPONENT,
                    COMPONENT_TYPES.TRANSFORM_COMPONENT,
                    COMPONENT_TYPES.VISBILITY_COMPONENT,
                    COMPONENT_TYPES.PARENTING_COMPONENT,
                ]

                Object.values(COMPONENT_TYPES).forEach((sceneComponent:any)=>{
                    let component:any = scene[sceneComponent] && scene[sceneComponent][aid]
                    if(component && !omittedComponents.includes(sceneComponent)){
                        switch(sceneComponent){
                            case COMPONENT_TYPES.GLTF_COMPONENT:
                                createGLTFComponent(scene, {...component, ...{aid:clonedItemInfo.aid}})
                                break
                        }
                    }
                })
            }
        }
    }
}