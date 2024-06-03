import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";

export class MeshComponent extends Schema{
    @type("number") type:number //0 - plane, 1 - box
    @type("number") collision:number
}

export function createMeshComponent(scene:Scene, data:any){
    let component = new MeshComponent()
    component.type = data.type
    component.collision = data.collision
    scene.meshes.set(data.aid, component)
}

