import {ArraySchema, Schema, type} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";
import { removeAllAssetComponents } from "../rooms/messaging/ItemHandler";
import { Client } from "colyseus";
import { IWBRoom } from "../rooms/IWBRoom";

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

export function editGameComponent(room:IWBRoom, client:Client, info:any, scene:Scene){
    let itemInfo:any = scene[COMPONENT_TYPES.TEAM_COMPONENT].get(info.aid)
    if(!itemInfo){
        scene[COMPONENT_TYPES.TEAM_COMPONENT].set(info.aid, new TeamComponent())
        switch(info.action){
            case 'add':
                break
        }
    }
}

export function removeAllTeams(scene:Scene){
    scene[COMPONENT_TYPES.TEAM_COMPONENT].forEach((team:TeamComponent, aid:string)=>{
        removeAllAssetComponents(scene, aid)
    })
}