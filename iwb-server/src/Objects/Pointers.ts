import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";

export class PointerComponentEvent extends Schema{
    @type("string") id:string
    @type("string") hoverText:string
    @type("number") eventType:number
    @type("number") button:number
    @type("number") maxDistance:number
    @type("boolean") showFeedback:boolean
}

export class PointerComponent extends Schema{
    @type("string") id:string
    @type([PointerComponentEvent]) events:ArraySchema<PointerComponentEvent>
}