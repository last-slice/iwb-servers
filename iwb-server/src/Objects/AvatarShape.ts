import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES, Color4 } from "../utils/types";

export class AvatarShapeComponent extends Schema{
    @type("string") name:string = "NPC Avatar"
    @type("number") bodyShape:number = 0
    @type("number") type:number = 0
    @type("number") change:number = 0
    @type("boolean") displayName: boolean = true
    @type(['string']) wearables = new ArraySchema<string>()
    @type(Color4) eyeColor = new Color4({r:0,g:0,b:0,a:1})
    @type(Color4) skinColor = new Color4({r:215,g:170,b:105,a:1})
    @type(Color4) hairColor = new Color4({r:0,g:0,b:0,a:1})
}

export function createAvatarShapeComponent(scene:Scene, aid:string, data?:any){
    let component:any = new AvatarShapeComponent()
    if(data){
        for(let key in data){
            if(key === "eyeColor" || key === "skinColor" || key === "hairColor"){
                component[key] = new Color4(data[key])
            }else{
                component[key] = data[key]
            }
        }
        component.change = 0
    }
    scene[COMPONENT_TYPES.AVATAR_SHAPE_COMPONENT].set(aid, component)
}

export function editAvatarShapeComponent(info:any, scene:Scene){
    let itemInfo:any = scene[COMPONENT_TYPES.AVATAR_SHAPE_COMPONENT].get(info.aid)
    if(itemInfo){
        switch(info.action){
            case 'update':
                let npcData = info.npcData
                console.log('npc data to update', npcData)
                for(let key in npcData){
                    if(key === "eyeColor" || key === "skinColor" || key === "hairColor"){
                        itemInfo[key] = new Color4(npcData[key])
                    }
                    else if(key ==="wearables"){
                        // itemInfo.wearables = npcData[key]
                    }
                    else{
                        itemInfo[key] = npcData[key]
                    }
                }
                itemInfo.change += 1
                break;

            case 'addwearable':
                itemInfo.wearables.push(info.wearable)
                break;

            case 'deletewearable':
                itemInfo.wearables.splice(info.wearable, 1)
                break;
        }
    }
}