import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { generateRandomId } from "../utils/functions";

export class ActionComponentSchema extends Schema{

    @type("number") entity:number

    @type("string") hoverText:string
    @type("string") aid:string
    @type("string") animName:string
    @type("string") teleport:string
    @type("string") teleCam:string
    @type("boolean") animLoop:boolean
    @type("number") showTimer:string
    @type("number") showSize:number
    @type("string") showPos:string
    @type("number") startDTimer:number
    @type("string") startDId:string
    @type("number") cVMask:number
    @type("number") cIMask:number
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
    @type("string") showText:string
    @type("string") url:string
    @type("string") movePos:string
    @type("string") moveCam:string
    @type("boolean") moveRel:boolean

    ///amount for add/subtract actions
    @type("number") value:number
    @type("string") counter:string
    @type("string") state:string
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

    scene.actions.set(aid, component)
}