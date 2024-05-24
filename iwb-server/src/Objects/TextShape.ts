import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Client } from "colyseus";
import { Scene } from "./Scene";


export class TextShapeComponent extends Schema{
    @type("string") id:string
    @type("string") text:string
    @type("number") font:number
    @type("number") fontSize:number
    @type("number") textAlign:number
    @type("number") paddingTop:number
    @type("number") paddingRight:number
    @type("number") paddingBottom:number
    @type("number") paddingLeft:number
    @type("number") lineSpacing:number
    @type("number") outlineWidth:number
    @type("boolean") fontAutoSize:boolean
    @type(["number"]) outlineColor:ArraySchema<number> = new ArraySchema<number>()
    @type(["number"]) textColor:ArraySchema<number> = new ArraySchema<number>()
}

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