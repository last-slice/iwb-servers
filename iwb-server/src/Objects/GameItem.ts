import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";

export class GameItemComponent extends Schema{
    @type({map:"number"}) variables:MapSchema<number> = new MapSchema()
}

export function createGameItemComponent(scene:Scene, aid:string, data?:any){
    let component = new GameItemComponent()
    if(data){
        for(let key in data.variables){
            component.variables.set(key, data.variables[key])
        }
    }else{
        let gameInfo = scene[COMPONENT_TYPES.GAME_COMPONENT].get(scene.id)
        if(gameInfo){
            gameInfo.variables.forEach((variable:string)=>{
                component.variables.set(variable, 0)
            })
        }
    }
    scene[COMPONENT_TYPES.GAME_ITEM_COMPONENT].set(aid, component)
}

export function editGameItemComponent(){
    
}