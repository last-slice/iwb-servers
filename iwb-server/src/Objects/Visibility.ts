import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Client } from "colyseus";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";

export class VisibilityComponent extends Schema{
    @type("boolean") visible:boolean
}

export function editVisibility(client:Client, info:any, scene:Scene){
    let visibilty = scene[COMPONENT_TYPES.VISBILITY_COMPONENT].get(info.aid)
    if(visibilty){
        visibilty.visible = !visibilty.visible
    }
}

export function createVisibilityComponent(scene:Scene, data:any){
    let component = new VisibilityComponent()
    component.visible = true
    scene[COMPONENT_TYPES.VISBILITY_COMPONENT].set(data.aid, component)
}