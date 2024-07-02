import { Client, generateId } from "colyseus";
import { IWBRoom } from "../IWBRoom";
import { ACTIONS, COMPONENT_TYPES, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { ActionComponent, ActionComponentSchema, handleCloneAction } from "../../Objects/Actions";

export function iwbSceneActionHandler(room:IWBRoom){
    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_ACTION, (client:Client, info:any)=>{
        console.log(SERVER_MESSAGE_TYPES.SCENE_ACTION + " received", info)
        let {sceneId, actionId, aid} = info

        if(!info || !sceneId || !aid || !actionId){
            return
        }

        let scene = room.state.scenes.get(sceneId)
        if(scene && scene[COMPONENT_TYPES.ACTION_COMPONENT]){
            let assetActions = scene[COMPONENT_TYPES.ACTION_COMPONENT].get(aid)
            if(assetActions){
                let action = assetActions.actions.find(($:any)=> $.id === actionId)
                if(action){
                    switch(action.type){
                        case ACTIONS.ADD_NUMBER:
                            // addNumber(scene, info)
                            break;
        
                        case ACTIONS.CLONE:
                            handleCloneAction(room, client, scene, aid, action)
                            break;
                    }
                }
            }
        }
      })
}