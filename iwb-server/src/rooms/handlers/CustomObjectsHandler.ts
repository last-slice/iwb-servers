import { generateId } from "colyseus";
import {
    ActionComponent,
    Actions,
    Color4,
    Quaternion,
    TriggerComponent,
    Triggers,
    Vector3,
    addActionComponent,
    addCollisionComponent,
    addImageComponent,
    addMaterialComponent,
    addNFTComponent,
    addTextComponent,
    addTriggerComponent,
    addVideoComponent,
    addVisibilityComponent,
    addAudioComponent,
    addTriggerAreaComponent,
    addClickAreaComponent,
    addAnimationComponent
} from "../../Objects/Components";
import { Player } from "../../Objects/Player";
import { Scene, SceneItem } from "../../Objects/Scene";
import { itemManager, iwbManager } from "../../app.config";
import { COMPONENT_TYPES, EDIT_MODIFIERS, SCENE_MODES, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { IWBRoom } from "../IWBRoom";
import { updateItemComponentFunctions } from "./ItemComponentUpdates";

export class CustomObjectsHandler {
    room:IWBRoom

    constructor(room:IWBRoom) {
        this.room = room

        room.onMessage(SERVER_MESSAGE_TYPES.SCENE_DELETE_ITEM, async(client, info)=>{

        })
    }
}