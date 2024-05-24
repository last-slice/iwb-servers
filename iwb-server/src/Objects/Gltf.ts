import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";

export class GltfComponent extends Schema{
    @type("string") src:string
    @type("number") visibleCollision:number
    @type("number") invisibleCollision:number
}
