import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { IWBRoom } from "../rooms/IWBRoom";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";


export class DialogButtonComponent extends Schema {
    @type("string") label: string
    @type(['string']) actions = new ArraySchema<string>()
}

export class DialogInfoComponent extends Schema {
    @type("string") text: string
    @type([DialogButtonComponent]) buttons:ArraySchema
    //audio
    //image
}

export class DialogComponent extends Schema {
    @type("string") name:string = "Dialog"
    @type("string") id:string
    @type("number") i:number = 0
    @type("number") type:number = 0
    @type([DialogInfoComponent]) dialogs = new ArraySchema<DialogInfoComponent>()
}

export function createDialogComponent(scene:Scene, aid:string, data?:any){
    let component = new DialogComponent()

    if(data){
        component.i = data.i
        component.type = data.type
        data.dialogs && data.dialogs.forEach((dialog:any)=>{
            let dial = new DialogInfoComponent()
            dial.text = dialog.text
            component.dialogs.push(dial)
        })
    }
   
    scene[COMPONENT_TYPES.DIALOG_COMPONENT].set(aid, component)
}