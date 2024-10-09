import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Client } from "colyseus";
import { Scene } from "./Scene";
import { COMPONENT_TYPES, Color4 } from "../utils/types";


export class TextShapeComponent extends Schema{
    @type("string") id:string
    @type("string") text:string = "Text Shape"
    @type("number") font:number = 2
    @type("number") fontSize:number = 3
    @type("number") textAlign:number = 4
    @type("number") dataType:number = 0 //0 - text, 1 - state, 2 - counter
    @type("number") paddingTop:number
    @type("number") paddingRight:number
    @type("number") paddingBottom:number
    @type("number") paddingLeft:number
    @type("number") lineSpacing:number
    @type("number") outlineWidth:number
    @type("boolean") fontAutoSize:boolean
    @type("boolean") onPlay:boolean = false
    @type("boolean") isText:boolean = false
    @type(Color4) outlineColor:Color4 = new Color4({r:1, g:1, b:1, a:1})
    @type(Color4) color:Color4 = new Color4({r:1, g:1, b:1, a:1})
}

export function createTextComponent(scene:Scene, aid:string, data:any){
    let component:any = new TextShapeComponent()
    for(let key in data){
        if(key === "color" || key === "outlineColor"){
            component[key] = new Color4(data[key])
        }else{
            component[key] = data[key]
        }
    }
    scene[COMPONENT_TYPES.TEXT_COMPONENT].set(aid, component)
}

export function editTextShape(client:Client, info:any, scene:Scene){
    let itemInfo:any = scene[COMPONENT_TYPES.TEXT_COMPONENT].get(info.aid)
    if(itemInfo){
        switch(info.type){
            case 'color':
                itemInfo.color[info.data.hue] = info.data.value
                break;

            default:
                for(let key in info){
                    if(info.hasOwnProperty(key)){
                        itemInfo[key] = info[key]
                    }
                }
                break;
        }
    }
}