import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";

export class NameComponent extends Schema{
    @type("string") value:string
}

export function createNameComponent(scene:Scene, data:any){
    let component = new NameComponent()
    component.value = data.item.n
    scene.names.set(data.scene.aid, component)
}