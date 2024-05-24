import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";

export class SoundComponent extends Schema {
    @type("string") url:string
    @type("number") volume:number
    @type("boolean") autostart:boolean
    @type("boolean") loop:boolean
    @type("boolean") attach:boolean
}
