import { Player } from "../../Objects/Player";
import { Scene, SceneItem, Vector3 } from "../../Objects/Scene";
import { COMPONENT_TYPES, EDIT_MODIFIERS, SCENE_MODES, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { IWBRoom } from "../IWBRoom";

export class RoomSceneItemHandler {
    room:IWBRoom

    constructor(room:IWBRoom) {
        this.room = room

        room.onMessage(SERVER_MESSAGE_TYPES.UPDATE_ITEM_COMPONENT, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.UPDATE_ITEM_COMPONENT + " message", info)

            let player:Player = room.state.players.get(client.userData.userId)
            if(player && player.mode === SCENE_MODES.BUILD_MODE){
                let scene = room.state.scenes.get(info.data.sceneId)
                if(scene){
                    let asset = scene.ass.find((a)=> a.aid === info.data.aid)
                    if(asset){
                        this.updateComponent(asset, info)
                    }
                }
            }
        })

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
                            if(data.manual){
                                asset.p.x = data.value === "" ? 0 : data.value
                            }else{
                                asset.p.x += (data.direction * data.factor)
                            }
                            break;

                        case 'y':
                            if(data.manual){
                                asset.p.y = data.value === "" ? 0 : data.value
                            }else{
                                asset.p.y += (data.direction * data.factor)
                            }
                            break;

                        case 'z':
                            if(data.manual){
                                asset.p.z = data.value === "" ? 0 : data.value
                            }else{
                                asset.p.z += (data.direction * data.factor)
                            }
                            break;
                    }
                    break;
        
                case EDIT_MODIFIERS.ROTATION:
                    switch(data.axis){
                        case 'x':
                            if(data.manual){
                                asset.r.x = data.value === "" ? 0 : data.value
                            }else{
                                asset.r.x += (data.direction * data.factor)
                            }
                            break;

                        case 'y':
                            if(data.manual){
                                asset.r.y = data.value === "" ? 0 : data.value
                            }else{
                                asset.r.y += (data.direction * data.factor)
                            }
                            break;

                        case 'z':
                            if(data.manual){
                                asset.r.z = data.value === "" ? 0 : data.value
                            }else{
                                asset.r.z += (data.direction * data.factor)
                            }
                            break;
                    }
                    break;
        
                case EDIT_MODIFIERS.SCALE:
                    switch(data.axis){
                        case 'x':
                            if(data.manual){
                                asset.s.x = data.value === "" ? 0 : data.value
                            }else{
                                asset.s.x += (data.direction * data.factor)
                            }
                            break;

                        case 'y':
                            if(data.manual){
                                asset.s.y = data.value === "" ? 0 : data.valuee
                            }else{
                                asset.s.y += (data.direction * data.factor)
                            }
                            break;

                        case 'z':
                            if(data.manual){
                                asset.s.z = data.value === "" ? 0 : data.value
                            }else{
                                asset.s.z += (data.direction * data.factor)
                            }
                            break;
                    }
                    break;
            }
        }
    }

    updateComponent(asset:SceneItem, info:any){
        switch(info.component){
            case COMPONENT_TYPES.VISBILITY_COMPONENT:
                asset.visComp.visible = !asset.visComp.visible
                break;

            case COMPONENT_TYPES.IMAGE_COMPONENT:
                asset.imgComp.url = info.data.url
                break;

            case COMPONENT_TYPES.VIDEO_COMPONENT:
                asset.vidComp.url = info.data.url
                break;

            case COMPONENT_TYPES.COLLISION_COMPONENT:
                if(info.data.layer === 'iMask'){
                    asset.colComp.iMask = info.data.value
                }else{
                    asset.colComp.vMask = info.data.value
                }
                break;
        }
    }
}