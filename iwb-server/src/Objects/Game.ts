import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";

export class GameComponent extends Schema{
    @type("string") id:string
    @type("string") name:string
    @type("string") description:string
    @type("string") loadingScreen:string
    @type("number") type:number
    @type("number") startLevel:number
    @type("boolean") invisibleStartBox:boolean //do we need this?
    @type("boolean") saveProgress:boolean //do we need this?
    @type("boolean") premiumAccess:boolean //do we need this? ifo
    @type("boolean") premiumAccessType:boolean //do we need this? ifo
    @type("boolean") premiumAccessItem:boolean //do we need this? ifo
    //levels here?

    //game component can have children components to track "global" variables
    // like time, score, health, death, etc
}

export function createGameComponent(scene:Scene, aid:string, data:any){
    let component:any = new GameComponent()
    for(let key in data){
        component[key] = data[key]
    }
    scene[COMPONENT_TYPES.UI_TEXT_COMPONENT].set(aid, component)
}