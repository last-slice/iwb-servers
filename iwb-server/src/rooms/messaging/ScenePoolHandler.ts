import { Client, generateId } from "colyseus";
import { IWBRoom } from "../IWBRoom";
import { ACTIONS, COMPONENT_TYPES, EDIT_MODIFIERS, SCENE_MODES, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { Player } from "../../Objects/Player";
import { isWorldOwner } from "./SceneHandler";
import { getCache } from "../../utils/cache";
import { SCENE_POOL_CACHE_KEY } from "../../Objects/IWBManager";
import { iwbManager } from "../../app.config";
import { getJSONScene, Scene } from "../../Objects/Scene";
import { hasWorldPermissions } from "./ItemHandler";

export function scenePoolHandler(room:IWBRoom){
    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_POOL_PLACE, async (client:Client, data:any)=>{
        console.log(SERVER_MESSAGE_TYPES.SCENE_POOL_PLACE + " received", data)
        let scenePool = getCache(SCENE_POOL_CACHE_KEY)
        let poolScene = scenePool.find((s:any)=> s.id === data.sceneId)
        if(!poolScene){
            console.log('that pool scene does not exist')
            return
        }

        if(!data.parcels){
            console.log('invalid parcels')
            return
        }

        let player:Player = room.state.players.get(client.userData.userId)
        if(player && (player.inHomeWorld(room.state.world) || hasWorldPermissions(room, player.address))){
            let scenePoolCopy = {...poolScene}
            scenePoolCopy.id = generateId(5)
            scenePoolCopy.metadata.o = player.address
            scenePoolCopy.w = room.state.world
            scenePoolCopy.bpcl = data.parcels[0]
            scenePoolCopy.pcls = data.parcels
            scenePoolCopy.cd = Math.floor(Date.now()/1000)
            scenePoolCopy.upd = Math.floor(Date.now()/1000)
            scenePoolCopy.Multiplayer = {}
            room.state.scenes.set(scenePoolCopy.id, new Scene(room, scenePoolCopy))
            room.state.sceneCount += 1

            data.parcels.forEach((parcel:any)=>{
                room.state.occupiedParcels.push(parcel)
            })

            player.updatePlayMode(SCENE_MODES.BUILD_MODE)
            room.broadcast(SERVER_MESSAGE_TYPES.SCENE_ADDED_NEW, {name:player.name, sceneName:scenePoolCopy.metadata.n})        
        }
    })

    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_POOL_GET, async (client:Client, data:any)=>{
        console.log(SERVER_MESSAGE_TYPES.SCENE_POOL_GET + " received", data)
        let scenePool = getCache(SCENE_POOL_CACHE_KEY)

        client.send(SERVER_MESSAGE_TYPES.SCENE_POOL_GET, [...scenePool.map((poolScene:any)=> {
            let count:number = 0
            // let scene = room.state.scenes.get(poolScene.id)
            // scene[COMPONENT_TYPES.IWB_COMPONENT].forEach((iwb:any)=>{
            //     count++
            // })

            return {
            id:poolScene.id,
            image:poolScene.metadata.im,
            name:poolScene.metadata.n,
            si:poolScene.si,
            pc:poolScene.pc,
            pcnt:poolScene.pcnt,
            // assets:countw
        }})])
    })

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
