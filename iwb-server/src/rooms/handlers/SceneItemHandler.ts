import { Player } from "../../Objects/Player";
import { Scene, Vector3 } from "../../Objects/Scene";
import { EDIT_MODIFIERS, SCENE_MODES, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { IWBRoom } from "../IWBRoom";

export class RoomSceneItemHandler {
    room:IWBRoom

    constructor(room:IWBRoom) {
        this.room = room

        room.onMessage(SERVER_MESSAGE_TYPES.PLAYER_EDIT_ASSET, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.PLAYER_EDIT_ASSET + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)
            if(player && player.mode === SCENE_MODES.BUILD_MODE){
                let scene = room.state.scenes.get(info.sceneId)
                if(scene){
                    switch(info.editType){
                        case EDIT_MODIFIERS.TRANSFORM:
                            this.transformAsset(scene, info)
                            break;
                    }
                }
            }
        })
    }

    transformAsset(scene:Scene, data:any){
        console.log('need to get asset to update scene')
        let asset = scene.ass.find((asset)=> asset.aid === data.aid)
        if(asset){
            switch(data.modifier){
                case EDIT_MODIFIERS.POSITION:
                    switch(data.axis){
                        case 'x':
                            asset.p.x += (data.direction * data.factor)
                            break;

                        case 'y':
                            asset.p.y += (data.direction * data.factor)
                            console.log('asset is now', asset.p.y)
                            break;

                        case 'z':
                            asset.p.z += (data.direction * data.factor)
                            break;
                    }
                    break;
        
                case EDIT_MODIFIERS.ROTATION:
                    switch(data.axis){
                        case 'x':
                            asset.r.x += (data.direction * data.factor)
                            break;

                        case 'y':
                            asset.r.y += (data.direction * data.factor)
                            break;

                        case 'z':
                            asset.r.z += (data.direction * data.factor)
                            break;
                    }
                    break;
        
                case EDIT_MODIFIERS.SCALE:
                    switch(data.axis){
                        case 'x':
                            asset.s.x += (data.direction * data.factor)
                            break;

                        case 'y':
                            asset.s.y += (data.direction * data.factor)
                            break;

                        case 'z':
                            asset.s.z += (data.direction * data.factor)
                            break;
                    }
                    break;
            }
        }
    }
}