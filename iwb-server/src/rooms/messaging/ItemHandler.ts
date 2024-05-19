import { Client } from "colyseus";
import { IWBRoom } from "../IWBRoom";
import { COMPONENT_TYPES, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { editTransform } from "../../Objects/Transform";
import { editVisibility } from "../../Objects/Visibility";
import { editTextShape } from "../../Objects/TextShape";

export function iwbItemHandler(room:IWBRoom){
    room.onMessage(SERVER_MESSAGE_TYPES.EDIT_SCENE_ASSET, (client:Client, info:any)=>{
        console.log("edit asset message", info)
        let scene = room.state.scenes.get(info.sceneId)
        if(scene){
            switch(info.component){
                case COMPONENT_TYPES.TRANSFORM_COMPONENT:
                    editTransform(client, info, scene)
                    break;

                case COMPONENT_TYPES.VISBILITY_COMPONENT:
                    editVisibility(client, info, scene)
                    break;

                case COMPONENT_TYPES.TEXT_COMPONENT:
                    editTextShape(client, info, scene)
                    break;
            }
        }
      })
}