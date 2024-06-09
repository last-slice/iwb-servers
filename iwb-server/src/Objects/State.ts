import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";

export class StateComponent extends Schema{
    @type(["string"]) values:ArraySchema<string> = new ArraySchema<string>()
    @type("string") defaultValue:string
    @type("string") currentValue:string
    @type("string") previousValue:string
}

export function createStateComponent(scene:Scene, aid:string){
    let component = new StateComponent()
    scene.states.set(aid, component)
}

export function editStateComponent(data:any, scene:Scene){
    let states = scene.states.get(data.aid)
    if(!states){
        scene.states.set(data.aid, new StateComponent())
    }

    states = scene.states.get(data.aid)

    switch(data.action){
        case 'add':
            console.log('adding new state', data.data.value)
            states.values.push(data.data.value)
            states.values.length === 1 ? states.defaultValue = data.data.value : null
            break;

        case 'delete':
            let toDelete = states.values.findIndex($=> $ === data.data.value)
            if(toDelete >= 0){
                states.values.splice(toDelete, 1)
                if(states.values.length === 0){
                    states.defaultValue = ""
                    return
                }
                if(states.defaultValue === data.data.value){
                    states.defaultValue = states.values[0]
                }
            }
            break;

        case 'default':
            states.defaultValue = data.data.default
            break;
    }
}