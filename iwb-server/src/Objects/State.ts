import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";

export class StateComponent extends Schema{
    @type(["string"]) values:ArraySchema<string>
    @type("string") defaultValue:string
}