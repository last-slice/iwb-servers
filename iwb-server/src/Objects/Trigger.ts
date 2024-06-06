import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";

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
    @type([TriggerConditionComponent]) conditions:ArraySchema<TriggerConditionComponent>
    @type(["string"]) actions:ArraySchema<string>
}

export class TriggerComponent extends Schema{
    @type([TriggerComponentSchema]) triggers:ArraySchema<TriggerComponentSchema>
}

export function createTriggerComponent(scene:Scene, aid:string, data:any){
    let component:any = new TriggerComponent()
    component.triggers = new ArraySchema<TriggerComponentSchema>()

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


    scene.triggers.set(aid, component)
}