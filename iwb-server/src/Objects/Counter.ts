import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Client } from "colyseus";
import { Scene } from "./Scene";

export class CounterComponent extends Schema{
    @type("number") currentValue:number = 0
    @type("number") previousValue:number = 0
}

export class CounterBarComponent extends Schema{
    @type("string") p:string
    @type("string") s:string
    @type("number") max:number
}

export function createCounterComponent(scene:Scene, aid:string, data:any){
    let component = new CounterComponent()
    component.currentValue = data.currentValue ? data.currentValue : 0
    component.previousValue = data.previousValue ? data.previousValue : 0
    scene.counters.set(aid, component)
}

export function addNumber(scene:Scene, info:any){
    let counter:CounterComponent = scene.counters.get(info.aid)
    counter.previousValue = counter.currentValue
    counter.currentValue += info.action.value
}