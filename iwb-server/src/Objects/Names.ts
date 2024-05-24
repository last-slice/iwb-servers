import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";

export class NameComponent extends Schema{
    @type("string") value:string
}