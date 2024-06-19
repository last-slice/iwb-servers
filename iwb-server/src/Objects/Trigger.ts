import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { generateRandomId } from "../utils/functions";
import { COMPONENT_TYPES } from "../utils/types";

export class TriggerConditionComponent extends Schema{
    @type("string") aid:string
    @type("string") type:string
    @type("string") value:string
    @type("number") counter:number
}

export class TriggerComponentSchema extends Schema{
    @type("string") id:string
    @type("string") type:string
    @type("number") input:number
    @type("number") pointer:number
    @type("number") tick:number = 0
    @type([TriggerConditionComponent]) conditions:ArraySchema<TriggerConditionComponent>
    @type(["string"]) actions:ArraySchema<string>

    @type(["string"]) caid:ArraySchema<string>
    @type(["string"]) ctype:ArraySchema<string>
    @type(["string"]) cvalue:ArraySchema<string>
    @type(["number"]) ccounter:ArraySchema<number>
}

export class TriggerComponent extends Schema{
    @type("boolean") isArea:boolean
    @type([TriggerComponentSchema]) triggers:ArraySchema<TriggerComponentSchema>
}

export function createTriggerComponent(scene:Scene, aid:string, data?:any){
    console.log('creating new trigger component', data)
    let component:any = new TriggerComponent()
    component.triggers = new ArraySchema<TriggerComponentSchema>()

    if(data){
        component.isArea = data.isArea
        data.triggers.forEach((data:any)=>{
            let schema = new TriggerComponentSchema()
            schema.type = data.type
            schema.input = data.input ? data.input : 0
            schema.pointer = data.input ? data.pointer : 0

            schema.caid = new ArraySchema<string>()
            schema.ctype = new ArraySchema<string>()
            schema.cvalue = new ArraySchema<string>()
            schema.ccounter = new ArraySchema<number>()

            data.caid && data.caid.forEach((caid:any)=>{
                schema.caid.push(caid)
            })
            data.ctype && data.ctype.forEach((ctype:any)=>{
                schema.ctype.push(ctype)
            })
            data.cvalue && data.cvalue.forEach((cvalue:any)=>{
                schema.cvalue.push(cvalue)
            })
            data.ccounter && data.ccounter.forEach((ccounter:any)=>{
                schema.ccounter.push(ccounter)
            })

            schema.actions = new ArraySchema<string>()
            data.actions.forEach((action:any)=>{
                schema.actions.push(action)
            })
            component.triggers.push(schema)
        })
    }
    scene[COMPONENT_TYPES.TRIGGER_COMPONENT].set(aid, component)
}

export function removeActionFromTriggers(scene:Scene, actionId:string){
    scene[COMPONENT_TYPES.TRIGGER_COMPONENT].forEach((trigger:TriggerComponent)=>{
        trigger.triggers.forEach((trigger:TriggerComponentSchema)=>{
            if(trigger.actions && trigger.actions.length > 0){
                let toDelete = trigger.actions.findIndex($=> $ === actionId)
                if(toDelete >= 0){
                    trigger.actions.splice(toDelete, 1)
                }
            }
        })
    })
}

export function editTriggerComponent(data:any, scene:Scene){
    let triggers = scene[COMPONENT_TYPES.TRIGGER_COMPONENT].get(data.aid)
    if(triggers){
        let triggerData = data.data
        switch(data.action){
            case 'add':
                let schema = new TriggerComponentSchema()
                schema.type = triggerData.type
                schema.input = 0    
                schema.pointer = 0

                schema.caid = new ArraySchema<string>()
                schema.ctype = new ArraySchema<string>()
                schema.cvalue = new ArraySchema<string>()
                schema.ccounter = new ArraySchema<number>()

                // schema.conditions = new ArraySchema<TriggerConditionComponent>()
                schema.actions = new ArraySchema<string>()
        
                schema['id'] = generateRandomId(6)
                triggers.triggers.push(schema)
                break;

            case 'edit':
                let editTrigger:any = triggers.triggers.find(trigger => trigger.id === triggerData.id)
                if(editTrigger){
                    for(let key in triggerData){
                        let update = triggerData[key]
                        if(key !== "tick"){
                            if(key === "condtions"){

                            }else if(key === "actions"){
    
                            }else{
                                editTrigger[key] = update
                            }
                        }
                    }
                    editTrigger.tick++
                }
                break;

            case 'delete':
                let toDelete = triggers.triggers.findIndex($=> $.id === triggerData.id)
                if(toDelete >= 0){
                    triggers.triggers.splice(toDelete, 1)
                }
                break;
            
            case 'addaction':
                console.log('trying to add an action')
                let trigger = triggers.triggers.find(trigger => trigger.id === triggerData.tid)
                if(trigger){
                    trigger.actions.push(triggerData.id)
                    trigger.tick++
                }
                break;

            case 'deleteaction':
                let t = triggers.triggers.find(trigger => trigger.id === triggerData.tid)
                if(t){
                    let toDelete = t.actions.findIndex($=> $ === triggerData.actionId)
                    if(toDelete >= 0){
                        t.actions.splice(toDelete, 1)
                        t.tick++
                    }
                }
                break;

            case 'addcondition':
                let conditionTrigger = triggers.triggers.find(trigger => trigger.id === triggerData.tid)
                if(conditionTrigger){
                    conditionTrigger.caid.push(triggerData.aid)
                    conditionTrigger.ctype.push(triggerData.condition.condition)
                    switch(triggerData.condition.type){
                        case COMPONENT_TYPES.COUNTER_COMPONENT:
                            conditionTrigger.ccounter.push(triggerData.counter)
                            conditionTrigger.cvalue.push("")
                            break;

                        case COMPONENT_TYPES.STATE_COMPONENT:
                            conditionTrigger.ccounter.push(0)
                            conditionTrigger.cvalue.push(triggerData.value)
                            break;
                    }
                    conditionTrigger.tick++
                }
                break;

            case 'deletecondition':
                let deleteCondition = triggers.triggers.find(trigger => trigger.id === triggerData.tid)
                if(deleteCondition){
                    deleteCondition.caid.splice(triggerData.index, 1)
                    deleteCondition.ctype.splice(triggerData.index, 1)
                    deleteCondition.cvalue.splice(triggerData.index, 1)
                    deleteCondition.ccounter.splice(triggerData.index, 1)
                }
                break;
        }
    }
}