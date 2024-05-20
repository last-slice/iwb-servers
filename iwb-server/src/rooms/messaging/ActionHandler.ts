import { Client } from "colyseus";
import { IWBRoom } from "../IWBRoom";
import { ACTIONS, COMPONENT_TYPES, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { editTransform } from "../../Objects/Transform";
import { editVisibility } from "../../Objects/Visibility";
import { editTextShape } from "../../Objects/TextShape";
import { addNumber } from "../../Objects/Counter";

export function iwbSceneActionHandler(room:IWBRoom){
    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_ACTION, (client:Client, info:any)=>{
        console.log(SERVER_MESSAGE_TYPES.SCENE_ACTION + " received", info)
        if(!info || !info.sceneId){
            return
        }

        let scene = room.state.scenes.get(info.sceneId)
        if(scene){
            let action = info.action

            switch(action.type){
                case ACTIONS.ADD_NUMBER:
                    addNumber(scene, info)
                    break;
            }
            // switch(info.component){
            //     case COMPONENT_TYPES.TRANSFORM_COMPONENT:
            //         editTransform(client, info, scene)
            //         break;

            //     case COMPONENT_TYPES.VISBILITY_COMPONENT:
            //         editVisibility(client, info, scene)
            //         break;

            //     case COMPONENT_TYPES.TEXT_COMPONENT:
            //         editTextShape(client, info, scene)
            //         break;
            // }
        }
      })
}