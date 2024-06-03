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
    @type("boolean") billboard:boolean
    @type(["number"]) outlineColor:ArraySchema<number> = new ArraySchema<number>()
    @type(["number"]) textColor:ArraySchema<number> = new ArraySchema<number>()
}

export function createTextComponent(scene:Scene, aid:string, data:any){
    let component = new TextShapeComponent()
    component.text = "Text"
    component.font = 2
    component.fontSize = 3
    component.fontAutoSize = false
    component.textAlign = 4
    component.paddingTop = 0
    component.paddingBottom = 0
    component.paddingLeft = 0
    component.paddingRight = 0
    component.lineSpacing = 0
    component.outlineWidth = 0
    component.billboard = false
    component.textColor = new ArraySchema(1,1,1,1)

    scene.textShapes.set(aid, component)
}

export function editTextShape(client:Client, info:any, scene:Scene){
    let textShape:any = scene.textShapes.get(info.aid)
    if(textShape){
        for(let option in info.data){
            if(option === "outlineColor"){}
            else if(option === "textColor"){}//
            else{
                textShape[option] = info.data[option]
            }
        }
    }
}