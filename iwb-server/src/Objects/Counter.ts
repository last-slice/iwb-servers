import { Client } from "colyseus";
import { CounterComponent, Scene } from "./Components";

export function addNumber(scene:Scene, info:any){
    let counters:CounterComponent = scene.counters.get(info.aid)

    let counter = counters.values.get(info.action.counter)
    counter.currentValue += info.action.value
}