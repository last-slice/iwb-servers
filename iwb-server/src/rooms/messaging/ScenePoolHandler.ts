import { Client } from "colyseus";
import fs from "fs";
import path from "path";
import { IWBRoom } from "../IWBRoom";
import { ACTIONS, COMPONENT_TYPES, EDIT_MODIFIERS, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { Player } from "../../Objects/Player";
import { canBuild } from "./ItemHandler";
import { isWorldOwner } from "./SceneHandler";
import { getCache } from "../../utils/cache";
import { SCENE_POOL_CACHE_KEY } from "../../Objects/IWBManager";
import { iwbManager } from "../../app.config";
import { getJSONScene } from "../../Objects/Scene";

export function scenePoolHandler(room:IWBRoom){
    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_POOL_ADD_SCENE, async (client:Client, data:any)=>{
        console.log(SERVER_MESSAGE_TYPES.SCENE_POOL_ADD_SCENE + " received", data)

        let player:Player = room.state.players.get(client.userData.userId)
        if(player && isWorldOwner(room, client.userData.userId)){
            let {sceneId} = data
            let scene = room.state.scenes.get(sceneId)
            if(!scene){
                console.log('scene doesnt exit')
                return
            }

            //validate scene limits even if we do it client side
            let jsonScene = await getJSONScene(room, scene)
            let scenePool = getCache(SCENE_POOL_CACHE_KEY)
            const index = scenePool.findIndex((scene: any) => scene.id === sceneId);
            if (index !== -1) {
                console.log('scene already added');
                scenePool[index] = jsonScene; // Replace the object in the array
                iwbManager.broadcastAllClients(SERVER_MESSAGE_TYPES.SCENE_POOL_UPDATED_SCENE, {user:client.userData.userId, sceneName:jsonScene.metadata.n, name:player.name})
            }else{
                console.log('adding new scene to pool')
                scenePool.push(jsonScene)
                iwbManager.broadcastAllClients(SERVER_MESSAGE_TYPES.SCENE_POOL_ADD_SCENE, {user:client.userData.userId, sceneName:jsonScene.metadata.n, name:player.name})
            }
        }else{
            console.log('invalid player trying to add scene to pool', client.userData.userId)
        }
    })
}
