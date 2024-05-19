import { Client } from "colyseus";
import { Scene } from "./Components";

export function editTextShape(client:Client, info:any, scene:Scene){
    let textShape:any = scene.textShapes.get(info.aid)
    if(textShape){
        for(let option in info.data){
            if(option === "outlineColor"){}
            else if(option === "textColor"){}
            else{
                textShape[option] = info.data[option]
            }
        }
    }
}