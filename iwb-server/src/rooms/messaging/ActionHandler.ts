import { Client, generateId } from "colyseus";
import { IWBRoom } from "../IWBRoom";
import { ACTIONS, COMPONENT_TYPES, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { ActionComponent, ActionComponentSchema, handleCloneAction } from "../../Objects/Actions";
import { Player } from "../../Objects/Player";
import { handleReward } from "../../Objects/Rewards";
import { handlePlaylistAction, stopAllPlaylist, stopPlaylist } from "../../Objects/Playlist";
import { handleGlobalAttachItem, handleGlobalDetachItem } from "../../Objects/Multiplayer";

export function iwbSceneActionHandler(room:IWBRoom){
    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_ACTION, (client:Client, info:any)=>{
        console.log(SERVER_MESSAGE_TYPES.SCENE_ACTION + " received", info)

        if(!info || !info.type){
            return
        }

        let {sceneId, actionId, aid, message} = info
        let scene = room.state.scenes.get(sceneId)
        let player = room.state.players.get(client.userData.userId)

        switch(info.type){
            case 'ENDALL':
                stopAllPlaylist(scene)
                break;

            case ACTIONS.STOP_PLAYLIST:
            case ACTIONS.SEEK_PLAYLIST:
            case ACTIONS.PLAY_PLAYLIST:
                handlePlaylistAction(room, client, scene, info)
                break;

            case ACTIONS.GIVE_REWARD:
                handleReward(room, client, scene, info)
                break;

            case 'live-action':
                if(!info.actionId || !info.aid){
                    return
                }
                room.broadcast(SERVER_MESSAGE_TYPES.SCENE_ACTION, {type:info.type, aid:info.aid, sceneId:sceneId, actionId:actionId, forceScene:info.forceScene})
                break;

            case 'live-bounce':
                if(!info.player || !info.location){
                    return
                }

                try{
                    if(info.player === "all"){
                        console.log('bouncing everyone')
                        room.broadcast(SERVER_MESSAGE_TYPES.SCENE_ACTION, {type:info.type, l:info.location.look, p:info.location.position})
                    }else{
                        console.log('bouncing single plaer')
                        let player = room.state.players.get(info.player)
                        if(player){
                            console.log('found player to obunce')
                            player.sendPlayerMessage(SERVER_MESSAGE_TYPES.SCENE_ACTION, {type:info.type, l:info.location.look, p:info.location.position})
                        }
                    }
                }
                catch(e){
                    console.log('error trying to bounce', e)
                    }
                break;
            
                case 'live-players-get':
                if(scene){
                    let players:any[] = []
                    room.state.players.forEach((player:Player, userId:string)=>{
                        players.push({name:player.dclData.name, userId:userId})
                    })
                    client.send(SERVER_MESSAGE_TYPES.SCENE_ACTION, {type:info.type, players: players, sceneId:scene.id})
                }
                break;

            case 'live-message':
                if(scene && message){
                    room.broadcast(SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, {message:message, forceScene:info.forceScene})
                }
                break;

            case 'scene-action':
                if(!info || !sceneId || !aid || !actionId){
                    return
                }
        
                if(scene && scene[COMPONENT_TYPES.ACTION_COMPONENT]){
                    let assetActions = scene[COMPONENT_TYPES.ACTION_COMPONENT].get(aid)
                    if(assetActions){
                        let action = assetActions.actions.find(($:any)=> $.id === actionId)
                        if(action){
                            switch(action.type){
                                case ACTIONS.DETACH_PLAYER:
                                    handleGlobalDetachItem(scene, info.aid)
                                    break;

                                case ACTIONS.ATTACH_PLAYER:
                                    console.log('attach item to player')
                                    handleGlobalAttachItem(scene, info.aid, player.address, action)
                                    break;

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
                break;
        }
    })
}