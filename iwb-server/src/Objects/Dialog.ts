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
        console.log('dialog component data is', data)
        component.i = data.i
        component.type = data.type
        data.dialogs && data.dialogs.forEach((dialog:any)=>{
            let dial = new DialogInfoComponent()
            dial.text = dialog.text
            
            if(dialog.buttons){
                dial.buttons = new ArraySchema()

                dialog.buttons.forEach((button:any)=>{
                    console.log('button is')
                    let newButton = new DialogButtonComponent()
                    newButton.label = button.label

                    if(button.actions){
                        button.actions.forEach((action:string)=>{
                            newButton.actions.push(action)
                        })
                    }
                    dial.buttons.push(newButton)
                })
            }

            component.dialogs.push(dial)
        })
    }
   
    scene[COMPONENT_TYPES.DIALOG_COMPONENT].set(aid, component)
}

export function editDialogComponent(data:any, scene:Scene){
    let dialogInfo = scene[COMPONENT_TYPES.DIALOG_COMPONENT].get(data.aid)
    if(!dialogInfo){
        return
    }

    let newDialogData = data.data

    switch(data.action){
        case 'delete':
            dialogInfo.dialogs.splice(newDialogData.value, 1)
            break;

        case 'add':
            let dialogComponent = new DialogInfoComponent()
            dialogComponent.text = newDialogData.text
            if(newDialogData.buttons){
                console.log('add dialog buttons')
            }

            dialogInfo.dialogs.push(dialogComponent)
            break;

        case 'update':
            let dialog = dialogInfo.dialogs[newDialogData.index]
            console.log('dialog to update is', dialog)
            dialog.text = newDialogData.text
            break;

        case 'addbutton':
            let button = dialogInfo.dialogs[newDialogData.index]
            console.log('dialog to update is', button)
            if(!button.buttons){
                button.buttons = new ArraySchema()
            }
            let newButton = new DialogButtonComponent()
            newButton.label = newDialogData.button.label
            if(newDialogData.actions){
                newDialogData.actions.forEach((action:string)=>{
                    newButton.actions.push(action)
                })
            }
            button.buttons.push(newButton)
            break;

        case 'deletebutton':
            let todelete = dialogInfo.dialogs[newDialogData.index]
            todelete.buttons.splice(newDialogData.buttonId, 1)
            break;
    }
}