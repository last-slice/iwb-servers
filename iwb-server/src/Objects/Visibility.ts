import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Client } from "colyseus";
import { Scene } from "./Scene";

export class VisibilityComponent extends Schema{
    @type("boolean") visible:boolean
}

export function editVisibility(client:Client, info:any, scene:Scene){
    let visibilty = scene.visibilities.get(info.aid)
    console.log('visibility is', visibilty)
    if(visibilty){
        console.log('editing visibility',visibilty.visible)
        visibilty.visible = !visibilty.visible
    }
}

export function createVisibilityComponent(scene:Scene, data:any){
    let component = new VisibilityComponent()
    component.visible = true
    scene.visibilities.set(data.aid, component)
}