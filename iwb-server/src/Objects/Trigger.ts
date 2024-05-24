import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";

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