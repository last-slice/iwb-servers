import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";

export class AnimatorComponentSchema extends Schema{
    @type("string") clip:string
    @type("boolean") loop:boolean
    @type("boolean") playing:boolean
}

export class AnimatorComponent extends Schema{
    @type("string") id:string
    @type([AnimatorComponentSchema]) states:ArraySchema<AnimatorComponentSchema>
}