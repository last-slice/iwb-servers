import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Client } from "colyseus";
import { Scene } from "./Scene";
import { Color4 } from "../utils/types";


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
    @type(Color4) outlineColor:Color4 = new Color4({r:1, g:1, b:1, a:1})
    @type(Color4) color:Color4 = new Color4({r:1, g:1, b:1, a:1})
}

export function createTextComponent(scene:Scene, aid:string, data:any){
    let component = new TextShapeComponent()
    component.text = ""
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

    scene.textShapes.set(aid, component)
}

export function editTextShape(client:Client, info:any, scene:Scene){
    let itemInfo:any = scene.textShapes.get(info.aid)
    if(itemInfo){
        for(let key in info){
            if(itemInfo.hasOwnProperty(key)){
                switch(key){
                    case 'color':
                        itemInfo[key] = new Color4(info[key])
                        break;

                    default:
                        itemInfo[key] = info[key]
                        break;
                }
                
            }
        }
    }
}