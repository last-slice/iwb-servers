import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { generateRandomId } from "../utils/functions";

export class TriggerConditionComponent extends Schema{
    @type("string") id:string
    @type("string") type:string
    @type("string") value:string
    @type("string") counter:string
}

export class TriggerComponentSchema extends Schema{
    @type("string") id:string
    @type("string") type:string
    @type("number") input:number
    @type("number") tick:number = 0
    @type([TriggerConditionComponent]) conditions:ArraySchema<TriggerConditionComponent>
    @type(["string"]) actions:ArraySchema<string>
}

export class TriggerComponent extends Schema{
    @type([TriggerComponentSchema]) triggers:ArraySchema<TriggerComponentSchema>
}

export function createTriggerComponent(scene:Scene, aid:string, data?:any){
    let component:any = new TriggerComponent()
    component.triggers = new ArraySchema<TriggerComponentSchema>()

    if(data){
        data.triggers.forEach((data:any)=>{
            let schema = new TriggerComponentSchema()
            schema.type = data.type
            schema.input = data.input
            schema.conditions = new ArraySchema<TriggerConditionComponent>()
            schema.actions = new ArraySchema<string>()
    
            data.conditions.forEach((condition:any)=>{
                schema.conditions.push(new TriggerConditionComponent(condition))
            })
    
            data.actions.forEach((action:any)=>{
                schema.actions.push(action.id)
            })
            component.triggers.push(schema)
        })
    }
    scene.triggers.set(aid, component)
}

export function editTriggerComponent(data:any, scene:Scene){
    let triggers = scene.triggers.get(data.aid)
    if(triggers){
        let triggerData = data.data
        switch(data.action){
            case 'add':
                let schema = new TriggerComponentSchema()
                schema.type = triggerData.type
                schema.input = 0
                schema.conditions = new ArraySchema<TriggerConditionComponent>()
                schema.actions = new ArraySchema<string>()
        
                schema['id'] = generateRandomId(6)
                triggers.triggers.push(schema)
                break;

            case 'edit':
                let editTrigger:any = triggers.triggers.find(trigger => trigger.id === triggerData.id)
                if(editTrigger){
                    editTrigger.tick++
                    for(let key in triggerData.data){
                        let update = triggerData.data[key]
                        if(key !== "tick"){
                            if(key === "condtions"){

                            }else if(key === "actions"){
    
                            }else{
                                editTrigger[key] = update
                            }
                        }
                    }
                }
                break;

            case 'delete':
                let toDelete = triggers.triggers.findIndex($=> $.id === triggerData.id)
                if(toDelete >= 0){
                    triggers.triggers.splice(toDelete, 1)
                }
                break;
            
            case 'addaction':
                let trigger = triggers.triggers.find(trigger => trigger.id === triggerData.id)
                if(trigger){
                    trigger.actions.push(triggerData.actions[triggerData.actions.length-1])
                    trigger.tick++
                }
                break;

            case 'deleteaction':
                let t = triggers.triggers.find(trigger => trigger.id === triggerData.id)
                if(t){
                    let toDelete = t.actions.findIndex($=> $ === triggerData.actionId)
                    if(toDelete >= 0){
                        t.actions.splice(toDelete, 1)
                        trigger.tick++
                    }
                }
                break;
        }
    }
}