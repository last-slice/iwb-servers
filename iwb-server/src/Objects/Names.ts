import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";

export class NameComponent extends Schema{
    @type("string") value:string
}

export function createNameComponent(scene:Scene, data:any){
    let component = new NameComponent()
    component.value = data.item.n
    scene[COMPONENT_TYPES.NAMES_COMPONENT].set(data.scene.aid, component)
}

export function editNameComponent(info:any, scene:Scene){
    let itemInfo:any = scene[COMPONENT_TYPES.NAMES_COMPONENT].get(info.aid)
    if(itemInfo){
        itemInfo.value = info.value
    }
}