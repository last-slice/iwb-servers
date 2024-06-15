import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Client } from "colyseus";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";

export class UITextComponent extends Schema{
    @type("string") src:string
    @type("string") text:string = "Testing"
    @type("number") size:number = 50
    @type("number") pt:number
    @type("number") pl:number
}

export function createUITextComponent(scene:Scene, aid:string, data:any){
    console.log('creating ui component', data)
    let component = new UITextComponent()
    component.src = data.src
    component.pt = data.pt
    component.pl = data.pl
    scene[COMPONENT_TYPES.UI_TEXT_COMPONENT].set(aid, component)
}