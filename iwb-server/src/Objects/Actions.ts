import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { generateRandomId } from "../utils/functions";
import { removeActionFromTriggers } from "./Trigger";
import { COMPONENT_TYPES } from "../utils/types";
import { Client, generateId } from "colyseus";
import { itemManager } from "../app.config";
import { IWBRoom } from "../rooms/IWBRoom";
import { createNewItem } from "../rooms/messaging/ItemHandler";
import { createGLTFComponent } from "./Gltf";

export class ActionComponentSchema extends Schema{

    

    // @type("string") hoverText:string
    
    // @type("number") showSize:number
    // @type("string") showPos:string
    // @type("string") startDId:string
    // @type("string") dialID:string

    @type("string") id:string
    @type("string") aid:string
    @type("string") name:string
    @type("string") type:string
    @type("string") game:string
    @type("string") emote:string
    @type("string") label:string
    @type("string") variableText:string
    @type("string") text:string
    @type("string") url:string
    @type("string") movePos:string
    @type("string") moveCam:string
    @type("string") counter:string
    @type("string") state:string
    @type("string") message:string
    @type("string") button1Label:string
    @type("string") button2Label:string
    @type("string") playlistAid:string
    @type("string") pathAid:string
    @type("string") anim:string
    @type("string") actionId:string
   
    @type("number") entity:number
    @type("number") anchor:number
    @type("number") timer:number
    @type("number") x:number
    @type("number") y:number
    @type("number") z:number
    @type("number") xLook:number
    @type("number") yLook:number
    @type("number") zLook:number
    @type("number") sx:number
    @type("number") sy:number
    @type("number") sz:number
    @type("number") value:number
    @type("number") textAlign:number
    @type("number") vMask:number
    @type("number") iMask:number
    @type("number") size:number
    @type("number") ttype:number
    @type("number") tloop:number
    @type("number") min:number
    @type("number") max:number
    @type("number") speed:number
    @type("number") channel:number

    @type("boolean") loop:boolean
    @type("boolean") visible:boolean
    @type("boolean") moveRel:boolean
    @type("boolean") button1:boolean
    @type("boolean") button2:boolean

    @type(["string"]) actions:ArraySchema<string>
    @type(["string"]) button1Actions:ArraySchema<string>
    @type(["string"]) button2Actions:ArraySchema<string>
}

export class ActionComponent extends Schema {
    @type([ActionComponentSchema]) actions:ArraySchema<ActionComponentSchema> = new ArraySchema<ActionComponentSchema>()
}

export async function createActionComponent(scene:Scene, aid:string, data:any){
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
    console.log('editing action component')
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
                    
                    else if(key === "button1"){
                        newAction.button1 = action.button1.enabled
                        if(action.button1.enabled){
                            newAction.button1Label = action.button1.label
                            if(action.button1.actionId){
                                newAction.button1Actions = new ArraySchema<string>()
                                newAction.button1Actions.push(action.button1.actionId)
                            }
                        }
                    }
                   else if(key === "button2"){
                        newAction.button2 = action.button2.enabled
                        if(action.button2.enabled){
                            newAction.button2Label = action.button2.label
                            if(action.button2.actionId){
                                newAction.button2Actions = new ArraySchema<string>()
                                newAction.button2Actions.push(action.button2.actionId)
                            }
                        }
                    }
                    else{
                        newAction[key] = action[key]
                    }
                    
                }
            }
            newAction['id'] = generateRandomId(6)
            actions.actions.push(newAction)
            // console.log('new action is', newAction)
            break;

        case 'delete':            
            let toDelete = actions.actions.findIndex($=> $.id === data.data.id)
            console.log('deleting action', actions.actions[toDelete])
            if(toDelete >= 0){
                actions.actions.splice(toDelete, 1)
                removeActionFromTriggers(scene, data.data.id)
            }
            break;

    }
}

export function handleCloneAction(room:IWBRoom, client:Client, scene:any, aid:string, action:ActionComponentSchema){
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

                createNewItem(room, client, scene, clonedItemInfo, catalogItem)

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