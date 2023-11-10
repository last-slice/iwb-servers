import {Client} from "@colyseus/core";
import { Player } from "../../Objects/Player"
import { Quaternion, Scene, SceneItem, Vector3 } from "../../Objects/Scene"
import { iwbManager, sceneManager } from "../../app.config"
import { SCENE_MODES, SERVER_MESSAGE_TYPES } from "../../utils/types"
import { IWBRoom } from "../IWBRoom"
import { UserRoom } from "../UserRoom"

export class RoomSceneHandler {

    scenes:Map<string, Scene> = new Map()
    occupiedParcels: string[] = []
    reservedParcels: string[] = ["0,0", "0,1", "1,0", "1,1"]
    temporaryParcels:any[] = []
    room:IWBRoom | UserRoom

    constructor(room:IWBRoom | UserRoom) {
        this.room = room

        room.onMessage(SERVER_MESSAGE_TYPES.SELECT_PARCEL, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SELECT_PARCEL + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)
            if(player && player.mode === SCENE_MODES.CREATE_SCENE_MODE){

                if(!this.isOccupied(info.parcel)){
                    if(this.hasTemporaryParcel(info.parcel)){
                        console.log('player has temporary parcel', info.parcel)
                        this.removeTemporaryParcel(info.parcel)
    
                        room.broadcast(SERVER_MESSAGE_TYPES.REMOVE_PARCEL, info)
                    }else{
                        if(!this.hasTemporaryParcel(info.parcel)){
                            console.log('scene doesnt have temp parcel')
                            this.addTempParcel(info.parcel) 
                            room.broadcast(SERVER_MESSAGE_TYPES.SELECT_PARCEL, info)
                        }
                    }
                }
            }
        })
    
        room.onMessage(SERVER_MESSAGE_TYPES.SCENE_SAVE_NEW, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SCENE_SAVE_NEW + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)

            if(player && player.mode === SCENE_MODES.CREATE_SCENE_MODE){
                if(this.temporaryParcels.length > 0){
                    let scene:Scene = player.createScene(info, this.temporaryParcels)
                    this.scenes.set(scene.id, scene)

                    this.occupiedParcels = [...this.occupiedParcels, ...this.temporaryParcels]
                    this.freeTemporaryParcels()

                    sceneManager.addNewScene(scene)
    
                    room.broadcast(
                        SERVER_MESSAGE_TYPES.SCENE_SAVE_NEW,
                        {userId: client.userData.userId, scene}
                    )

                    console.log('new scene info is', {id:scene.id, scna:scene.n, owner:scene.o, updated: scene.upd, name: scene.ona})

                    iwbManager.sendAllMessage(SERVER_MESSAGE_TYPES.SCENE_ADDED_NEW, [{id:scene.id, scna:scene.n, owner:scene.o, updated: scene.upd, name: scene.ona}])
                }
            }else{
                console.log('player is not in create scene mode')
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.SCENE_DELETE_ITEM, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SCENE_DELETE_ITEM + " message", info)

            let player:Player = room.state.players.get(client.userData.userId)
            if(player && player.mode === SCENE_MODES.BUILD_MODE){

                let scene = this.scenes.get(info.sceneId)
                if(scene){
                    let assetIndex = scene.ass.findIndex((ass)=> ass.aid === info.aid)
                    if(assetIndex >= 0){
                        scene.ass.splice(assetIndex,1)

                        room.broadcast(
                            SERVER_MESSAGE_TYPES.SCENE_DELETE_ITEM,
                            {userId: client.userData.userId, sceneId:info.sceneId, entity:info.entity, aid:info.aid}
                        )
                    }
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
                newItem.aid = item.aid
                newItem.p = new Vector3(item.position)
                newItem.r = new Quaternion(item.rotation)
                newItem.s = new Vector3(item.scale)

                let scene = this.scenes.get(info.item.sceneId)
                if(scene){
                    scene.ass.push(newItem)
                }
    
                room.broadcast(
                    SERVER_MESSAGE_TYPES.SCENE_ADD_ITEM,
                    {userId: client.userData.userId, sceneId:info.item.sceneId, entity:info.item.entity, item: newItem}
                )
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.PLAYER_EDIT_ASSET, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.PLAYER_EDIT_ASSET + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)
            if(player && player.mode === SCENE_MODES.BUILD_MODE){
                let scene = this.scenes.get(info.sceneId)
                if(scene){
                    console.log('need to get asset to update scene')
                }

                room.broadcast(SERVER_MESSAGE_TYPES.PLAYER_EDIT_ASSET, info)
            }
        })
    }

    sendScenes(player:Player){
        this.scenes.forEach((scene,key)=>{
            player.sendPlayerMessage(SERVER_MESSAGE_TYPES.SCENE_LOAD, scene)
        })
    }

    freeTemporaryParcels() {
        this.temporaryParcels.forEach((parcel) => {
            let index = this.temporaryParcels.findIndex((p) => p === parcel)
            if (index >= 0) {
                this.temporaryParcels.splice(index, 1)
            }
        })
    }

    removeTemporaryParcel(parcel: any) {
        let index = this.temporaryParcels.findIndex((p) => p === parcel)
        if (index >= 0) {
            this.temporaryParcels.splice(index, 1)
        }
    }

    addOccupiedParcel(parcel: any) {
        this.occupiedParcels.push(parcel)
    }

    addTempParcel(parcel: any) {
        this.temporaryParcels.push(parcel)
    }

    isOccupied(parcel: any){
        return [...this.occupiedParcels, ...this.reservedParcels]
            .find((p) => p === parcel)
    }

    hasTemporaryParcel(parcel: any) {
        return [...this.temporaryParcels, ...this.occupiedParcels, ...this.reservedParcels]
            .find((p) => p === parcel)
    }
}