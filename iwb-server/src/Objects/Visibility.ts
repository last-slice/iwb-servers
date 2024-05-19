import { Client } from "colyseus";
import { Scene } from "./Components";

export function editVisibility(client:Client, info:any, scene:Scene){
    let visibilty = scene.visibilities.get(info.aid)
    console.log('visibility is', visibilty)
    if(visibilty){
        console.log('editing visibility',visibilty.visible)
        visibilty.visible = !visibilty.visible
    }
}