import { Player } from "../../Objects/Player";
import { sceneManager } from "../../app.config";
import { SCENE_MODES, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { IWBRoom } from "../IWBRoom";
import {Quaternion, SceneItem, Vector3} from "../../Objects/Scene";

export function sceneCreationHandlers(room:IWBRoom){
    room.onMessage(SERVER_MESSAGE_TYPES.SELECT_PARCEL, async(client, info)=>{
        console.log(SERVER_MESSAGE_TYPES.SELECT_PARCEL + " message", info)

        let player:Player = room.state.players.get(client.userData.userId)
        console.log(player.mode)
        if(player && player.mode === SCENE_MODES.CREATE_SCENE_MODE){

            if(player.hasTemporaryParcel(info.parcel)){
                console.log('player has temporary parcel', info.parcel)
                sceneManager.removeTemporaryParcel(info.parcel)
                player.removeTemporaryParcel(info.parcel)
                room.broadcast(SERVER_MESSAGE_TYPES.REMOVE_PARCEL, info)
            }else{
                console.log('player doenst have temp parcel')
                if(!sceneManager.hasTemporaryParcel(info.parcel)){
                    console.log('scene doesnt have temp parcel')
                    sceneManager.addOccupiedParcel(info.parcel) 
                    player.addParcelToScene(info.parcel)
                    room.broadcast(SERVER_MESSAGE_TYPES.SELECT_PARCEL, info)
                }
            }
        }
    })

    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_SAVE_NEW, async(client, info)=>{
        console.log(SERVER_MESSAGE_TYPES.SCENE_SAVE_NEW + " message", info)

        let player:Player = room.state.players.get(client.userData.userId)
        if(player && player.mode === SCENE_MODES.CREATE_SCENE_MODE){
            let sceneParcels = player.temporaryParcels
            if(sceneParcels){
                let scene = player.createScene(sceneParcels)
                room.broadcast(
                    SERVER_MESSAGE_TYPES.SCENE_SAVE_NEW,
                    {userId: client.userData.userId, scene}
                )
            }
        }
    })

    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_ADD_ITEM, async(client, info)=>{
        console.log(SERVER_MESSAGE_TYPES.SCENE_ADD_ITEM + " message", info)

        let player:Player = room.state.players.get(client.userData.userId)
        if(player && player.mode === SCENE_MODES.BUILD_MODE){

            const {item} = info

            const newItem = new SceneItem()
            newItem.id = item.id
            newItem.position = new Vector3(item.position)
            newItem.rotation = new Quaternion(item.rotation)
            newItem.scale = new Vector3(item.scale)

            console.log(JSON.stringify(newItem))



            player.scenes.get(info.baseParcel)?.assets.push(newItem)



            room.broadcast(
                SERVER_MESSAGE_TYPES.SCENE_ADD_ITEM,
                {userId: client.userData.userId, item:info.item}
            )
        }

    })
}