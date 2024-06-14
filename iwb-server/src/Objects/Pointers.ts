import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { generateRandomId } from "../utils/functions";
import { COMPONENT_TYPES } from "../utils/types";

export class PointerComponentEvent extends Schema{
    @type("string") id:string
    @type("string") hoverText:string = "Hover Text"
    @type("number") eventType:number = 0
    @type("number") button:number = 0
    @type("number") maxDistance:number = 3
    @type("number") tick:number = 0
    @type("boolean") showFeedback:boolean = true
}

export class PointerComponent extends Schema{
    @type("string") id:string
    @type([PointerComponentEvent]) events:ArraySchema<PointerComponentEvent>
}

export function createPointerComponent(scene:Scene, aid:string, data?:any){
    let pointerEvents = new PointerComponent()
    pointerEvents.events = new ArraySchema<PointerComponentEvent>()
    if(data){
        data.events.forEach((event:any)=>{
            let pointerEvent = new PointerComponentEvent()
            pointerEvent.eventType = event.eventType
            pointerEvent.hoverText = event.hoverText
            pointerEvent.maxDistance = event.maxDistance
            pointerEvent.showFeedback = event.showFeedback
            pointerEvent.button = event.button
            pointerEvents.events.push(pointerEvent)
        })
    }
    scene[COMPONENT_TYPES.POINTER_COMPONENT].set(aid, pointerEvents)

    // let component:any = new PointerComponent()
    // component.events = new ArraySchema<PointerComponentEvent>()
    // if(data){
    //     let pointerComponentEvent = new PointerComponentEvent(data)
    //     for(let key in data.pointers){
    //         let pointer = data.pointers[key]
    //         if(pointer.hasOwnProperty(key)){
    //             component[key] = pointer[key]
    //         }
    //     }
    // }
    // scene[COMPONENT_TYPES.POINTER_COMPONENT].set(aid, component)
}

export function editPointerComponent(data:any, scene:Scene){
    let pointerInfo = scene[COMPONENT_TYPES.POINTER_COMPONENT].get(data.aid)
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
                    pointerEvent.tick++
                    for(let key in pointer){
                        if(pointer.hasOwnProperty(key) && key !== "tick"){
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