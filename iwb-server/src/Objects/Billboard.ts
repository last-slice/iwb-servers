import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";

export class BillboardComponent extends Schema{
    @type("number") mode:number
}

export function createBillboardComponent(scene:Scene, aid:string, data:any){
    let component = new BillboardComponent()
    component.mode = data.mode
    scene[COMPONENT_TYPES.BILLBOARD_COMPONENT].set(aid, component)
}

export function editBillboardComponent(info:any, scene:Scene){
    let itemInfo:any = scene[COMPONENT_TYPES.BILLBOARD_COMPONENT].get(info.aid)
    if(itemInfo){
        itemInfo.mode = info.mode
    }
}