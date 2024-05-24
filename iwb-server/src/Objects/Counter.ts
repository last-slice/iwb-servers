import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Client } from "colyseus";
import { Scene } from "./Scene";

export class CounterComponentSchema extends Schema{
    @type("number") currentValue:number
    @type("number") previousValue:number
}

export class CounterComponent extends Schema{
    @type({map:CounterComponentSchema}) values:MapSchema<CounterComponentSchema>
}

export class CounterBarComponent extends Schema{
    @type("string") p:string
    @type("string") s:string
    @type("number") max:number
}

export function addNumber(scene:Scene, info:any){
    let counters:CounterComponent = scene.counters.get(info.aid)

    let counter = counters.values.get(info.action.counter)
    counter.currentValue += info.action.value
}