import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { generateRandomId } from "../utils/functions";

export class PointerComponentEvent extends Schema{
    @type("string") id:string
    @type("string") hoverText:string = "Hover Text"
    @type("number") eventType:number = 0
    @type("number") button:number = 0
    @type("number") maxDistance:number = 3
    @type("boolean") showFeedback:boolean = true
}

export class PointerComponent extends Schema{
    @type("string") id:string
    @type([PointerComponentEvent]) events:ArraySchema<PointerComponentEvent>
}

export function createPointerComponent(scene:Scene, aid:string, data:any){
    let component:any = new PointerComponent()
    component.events = new ArraySchema<PointerComponentEvent>()
    if(data){
        for(let key in data.pointers){
            let pointer = data.pointers[key]
            if(pointer.hasOwnProperty(key)){
                component[key] = pointer[key]
            }
        }
    }
    scene.pointers.set(aid, component)
}

export function editPointerComponent(data:any, scene:Scene){
    let pointerInfo = scene.pointers.get(data.aid)
    if(pointerInfo){

        let pointer = data.data
        switch(data.action){
            case 'add':
                let newPointer:any = new PointerComponentEvent()

                for(let key in pointer){
                    if(pointer.hasOwnProperty(key)){
                        newPointer[key] = pointer[key]
                    }
                }
                newPointer.id = generateRandomId(6)
                pointerInfo.events.push(newPointer)
                break;

            case 'edit':
                let pointerEvent:any = pointerInfo.events.find(event => event.id === pointer.id)
                if(pointerEvent){
                    for(let key in pointer){
                        if(pointer.hasOwnProperty(key)){
                            pointerEvent[key] = pointer[key]
                        }
                    }
                }
                break;

            case 'delete':
                let toDelete = pointerInfo.events.findIndex($=> $.id === pointer.id)
                if(toDelete >= 0){
                    pointerInfo.events.splice(toDelete, 1)
                }
                break;

        }
    }
}