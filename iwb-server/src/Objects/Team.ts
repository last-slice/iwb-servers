import {ArraySchema, Schema, type} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";
import { removeAllAssetComponents } from "../rooms/messaging/ItemHandler";

export class TeamComponent extends Schema {
    @type("string") id:string
    @type("number") max :number
}

export function createTeamComponent(scene:Scene, aid:string, data:any){
    let component:any = new TeamComponent()
    for(let key in data){
        component[key] = data[key]
    }
    scene[COMPONENT_TYPES.TEAM_COMPONENT].set(aid, component)
}

export function removeAllTeams(scene:Scene){
    scene[COMPONENT_TYPES.TEAM_COMPONENT].forEach((team:TeamComponent, aid:string)=>{
        removeAllAssetComponents(scene, aid)
    })
}