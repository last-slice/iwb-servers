import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { generateRandomId } from "../utils/functions";
import { COMPONENT_TYPES, TriggerConditionOperation } from "../utils/types";
import { generateId } from "colyseus";

export class TriggerConditionComponent extends Schema{
    @type("string") aid:string
    @type("string") condition:string
    @type("string") type:string
    @type("string") value:string
    @type("number") counter:number
}

export class TriggerDecisionComponent extends Schema{
    @type("string") id:string
    @type("string") name:string
    @type("string") operator:string = TriggerConditionOperation.AND
    @type([TriggerConditionComponent]) conditions:ArraySchema<TriggerConditionComponent> = new ArraySchema()
    @type(["string"]) actions:ArraySchema<string> = new ArraySchema()
}


export class TriggerComponentSchema extends Schema{
    @type("string") id:string
    @type("string") type:string
    @type("number") input:number
    @type("number") pointer:number
    @type("number") tick:number = 0
    // @type([TriggerConditionComponent]) conditions:ArraySchema<TriggerConditionComponent>
    @type([TriggerDecisionComponent]) decisions:ArraySchema<TriggerDecisionComponent> = new ArraySchema()
    // @type(["string"]) actions:ArraySchema<string>

    // @type(["string"]) caid:ArraySchema<string>
    // @type(["string"]) ctype:ArraySchema<string>
    // @type(["string"]) cvalue:ArraySchema<string>
    // @type(["number"]) ccounter:ArraySchema<number>
}

export class TriggerComponent extends Schema{
    @type("boolean") isArea:boolean
    @type([TriggerComponentSchema]) triggers:ArraySchema<TriggerComponentSchema>
    trigger:any
}

export async function createTriggerComponent(scene:Scene, aid:string, data?:any){
    console.log('creating new trigger component', data)
    let component:any = new TriggerComponent()
    component.triggers = new ArraySchema<TriggerComponentSchema>()

    if(data){
        component.isArea = data.isArea
        data.triggers.forEach((triggerData:any)=>{

            let triggerSchema = new TriggerComponentSchema()
            triggerSchema.id = triggerData.id ? triggerData.id : generateRandomId(6)
            triggerSchema.type = triggerData.type
            triggerSchema.input = triggerData.input ? triggerData.input : 0
            triggerSchema.pointer = triggerData.pointer ? triggerData.pointer : 0

            triggerData.decisions.forEach((decision:any)=>{
                let triggerDecision = new TriggerDecisionComponent()
                triggerDecision.id = decision.id

                console.log('decision for trigger component is', decision)
                triggerDecision.name = decision.name ? decision.name : decision.id
                triggerDecision.operator = decision.operator ? decision.operator : TriggerConditionOperation.AND
                
                if(decision.conditions){
                    triggerDecision.conditions = new ArraySchema()
                    decision.conditions.forEach((condition:any) => {
                        let decisionCondition = new TriggerConditionComponent()
                        decisionCondition.aid = condition.aid
                        decisionCondition.condition = condition.condition
                        decisionCondition.type = condition.type
                        decisionCondition.counter = condition.counter ? condition.counter : undefined
                        decisionCondition.value = condition.value ? condition.value : undefined
                        triggerDecision.conditions.push(decisionCondition)
                    });
                }

                if(decision.actions){
                    triggerDecision.actions = new ArraySchema()
                    decision.actions.forEach((action:string)=>{
                        triggerDecision.actions.push(action)
                    })
                }

                triggerSchema.decisions.push(triggerDecision)
            })



            // if(data.conditions){
            //     let condition = new TriggerConditionComponent()
            //     if(data.conditions){
            //         schema.conditions = new ArraySchema<TriggerConditionComponent>()
            //         data.conditions.forEach((serverCondition:any, i:number)=>{
            //             if(serverCondition.actions){
            //                 condition.actions = new ArraySchema<string>()
            //                 serverCondition.actions.forEach((action:string, i:number)=>{
            //                     condition.actions.push(action)
            //                 })
            //                 condition.aid = serverCondition.aid
            //                 condition.type = serverCondition.type
            //                 condition.value = serverCondition.value
            //                 condition.counter = serverCondition.counter
            //                 condition.operator = serverCondition.operator
            //             }
            //             schema.conditions.push(condition)
            //         })
            //     }
            // }

            // schema.caid = new ArraySchema<string>()
            // schema.ctype = new ArraySchema<string>()
            // schema.cvalue = new ArraySchema<string>()
            // schema.ccounter = new ArraySchema<number>()

            // data.caid && data.caid.forEach((caid:any)=>{
            //     schema.caid.push(caid)
            // })
            // data.ctype && data.ctype.forEach((ctype:any)=>{
            //     schema.ctype.push(ctype)
            // })
            // data.cvalue && data.cvalue.forEach((cvalue:any)=>{
            //     schema.cvalue.push(cvalue)
            // })
            // data.ccounter && data.ccounter.forEach((ccounter:any)=>{
            //     schema.ccounter.push(ccounter)
            // })

            // schema.actions = new ArraySchema<string>()
            // data.actions.forEach((action:any)=>{
            //     schema.actions.push(action)
            // })
            // component.triggers.push(schema)
            component.triggers.push(triggerSchema)
        })
    }
    scene[COMPONENT_TYPES.TRIGGER_COMPONENT].set(aid, component)
}

export function removeActionFromTriggers(scene:Scene, actionId:string){
    scene[COMPONENT_TYPES.TRIGGER_COMPONENT].forEach((trigger:TriggerComponent)=>{
        // trigger.triggers.forEach((trigger:TriggerComponentSchema)=>{
        //     if(trigger.actions && trigger.actions.length > 0){
        //         let toDelete = trigger.actions.findIndex($=> $ === actionId)
        //         if(toDelete >= 0){
        //             trigger.actions.splice(toDelete, 1)
        //         }
        //     }
        // })
    })
}

export function editTriggerComponent(data:any, scene:Scene){
    console.log('editing trigger component', data)
    let triggers = scene[COMPONENT_TYPES.TRIGGER_COMPONENT].get(data.aid)
    if(triggers){
        let triggerData = data.data
        let trigger:any
        let triggerIndex:any
        let decision:any

        switch(data.action){
            case 'add':
                let schema = new TriggerComponentSchema()
                schema.type = triggerData.type
                schema.input = triggerData.input ? triggerData.input : 0
                schema.pointer = triggerData.pointer ? triggerData.pointer : 0

                // schema.caid = new ArraySchema<string>()
                // schema.ctype = new ArraySchema<string>()
                // schema.cvalue = new ArraySchema<string>()
                // schema.ccounter = new ArraySchema<number>()

                // schema.conditions = new ArraySchema<TriggerConditionComponent>()
                // schema.actions = new ArraySchema<string>()
        
                schema['id'] = generateRandomId(6)
                triggers.triggers.push(schema)
                break;

            case 'editoperation':
                trigger = triggers.triggers.find(trigger => trigger.id === triggerData.tid)
                // console.log('trigger to edit operation is', trigger)
                if(trigger){
                    let decision:TriggerDecisionComponent = trigger.decisions.find(($:any)=> $.id === triggerData.did)
                    console.log('decision is', decision)
                    if(decision){
                        console.log('found decision to update operation')
                        decision.operator = triggerData.conditionperator
                    }
                }
                break;

            case 'edit':
                trigger = triggers.triggers.find(trigger => trigger.id === triggerData.id)
                if(trigger){
                    for(let key in triggerData){
                        let update = triggerData[key]
                        if(key !== "tick"){
                            if(key === "conditions"){

                            }else if(key === "actions"){
    
                            }else{
                                trigger[key] = update
                            }
                        }
                    }
                    trigger.tick++
                }
                break;

            case 'delete':
                triggerIndex = triggers.triggers.findIndex($=> $.id === triggerData.id)
                if(triggerIndex >= 0){
                    triggers.triggers.splice(triggerIndex, 1)
                }
                break;
            
            case 'addaction':
                console.log('trying to add an action')
                trigger = triggers.triggers.find(trigger => trigger.id === triggerData.tid)
                if(trigger){
                    let decision = trigger.decisions.find(($:any)=> $.id === triggerData.did)
                    if(decision){
                        decision.actions.push(triggerData.id)
                        trigger.tick++
                    }
                }
                break;

            case 'deleteaction':
                trigger = triggers.triggers.find(trigger => trigger.id === triggerData.tid)
                if(trigger){
                    let decision = trigger.decisions.find(($:any)=> $.id === triggerData.did)
                    if(decision){
                        let actionIndex = decision.actions.findIndex(($:any)=> $ === triggerData.actionId)
                        if(actionIndex >= 0){
                            decision.actions.splice(actionIndex, 1)
                            trigger.tick++
                        }
                    }
                }
                break;

            case 'decisionname':
                trigger = triggers.triggers.find(trigger => trigger.id === triggerData.tid)
                decision = trigger.decisions.find((d:any)=> d.id === triggerData.did)
                if(decision){
                    decision.name = triggerData.name
                }
                break;

            case 'adddecision':
                trigger = triggers.triggers.find(trigger => trigger.id === triggerData.tid)
                if(trigger){
                    let newDecision = new TriggerDecisionComponent()
                    newDecision.id = triggerData.did
                    newDecision.name = triggerData.did
                    newDecision.operator = TriggerConditionOperation.AND
                    trigger.decisions.push(newDecision)
                }
                break;

            case 'deletedecision':
                triggerIndex = triggers.triggers.findIndex($=> $.id === triggerData.tid)
                if(triggerIndex >= 0){
                    console.log('found trigger by index', triggerIndex)
                    let decisionIndex = triggers.triggers[triggerIndex].decisions.findIndex(($:any)=> $.id === triggerData.did)
                    console.log('decision index to delete is', decisionIndex)
                    if(decisionIndex >= 0){
                        console.log("found decision to delete")
                        triggers.triggers[triggerIndex].decisions.splice(decisionIndex, 1)
                        //need to delete actions as well
                    }
                }
                // if(deleteCondition){
                //     deleteCondition.caid.splice(triggerData.index, 1)
                //     deleteCondition.ctype.splice(triggerData.index, 1)
                //     deleteCondition.cvalue.splice(triggerData.index, 1)
                //     deleteCondition.ccounter.splice(triggerData.index, 1)
                // }
                break;

            case 'addcondition':
                trigger = triggers.triggers.find(trigger => trigger.id === triggerData.tid)
                if(trigger){
                    let triggerDecision = trigger.decisions.find(($:any)=> $.id === triggerData.did)
                    if(triggerDecision){
                        if(!triggerDecision.conditions){
                            triggerDecision.conditions = new ArraySchema<TriggerConditionComponent>()
                        }
                        let newCondition = new TriggerConditionComponent()
                        newCondition.aid = triggerData.aid

                        let newConditionData = triggerData.condition
                        newCondition.condition = newConditionData.condition

                        switch(newConditionData.type){
                            case COMPONENT_TYPES.COUNTER_COMPONENT:
                                newCondition.counter = triggerData.counter
                                break;
    
                            case COMPONENT_TYPES.STATE_COMPONENT:
                                newCondition.value = triggerData.value
                                break;
                        }
                        triggerDecision.conditions.push(newCondition)
                        trigger.tick++
                    }
                }
                break;

            case 'deletecondition':
                trigger = triggers.triggers.find(trigger => trigger.id === triggerData.tid)
                if(trigger){
                    let decision = trigger.decisions.find(($:any)=> $.id === triggerData.did)
                    if(decision){
                        decision.conditions.splice(triggerData.index, 1)
                    }
                }
                // if(deleteCondition){
                //     deleteCondition.caid.splice(triggerData.index, 1)
                //     deleteCondition.ctype.splice(triggerData.index, 1)
                //     deleteCondition.cvalue.splice(triggerData.index, 1)
                //     deleteCondition.ccounter.splice(triggerData.index, 1)
                // }
                break;
        }
    }
}