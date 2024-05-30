import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";

export class VideoComponent extends Schema {
    @type("string") url:string
    @type("number") volume:number
    @type("boolean") autostart:boolean
    @type("boolean") loop:boolean
}
