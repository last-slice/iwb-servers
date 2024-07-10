import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Quaternion, Vector3 } from "./Transform";

export class LiveShow extends Schema{
    @type(["string"]) admins:ArraySchema<string> = new ArraySchema()
}