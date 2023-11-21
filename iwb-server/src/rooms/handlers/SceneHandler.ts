import {Client} from "@colyseus/core";
import { Player } from "../../Objects/Player"
import { Quaternion, Scene, SceneItem, Vector3 } from "../../Objects/Scene"
import { iwbManager } from "../../app.config"
import { SCENE_MODES, SERVER_MESSAGE_TYPES } from "../../utils/types"
import { IWBRoom } from "../IWBRoom"

export class RoomSceneHandler {
    room:IWBRoom

    constructor(room:IWBRoom) {
        this.room = room

        room.onMessage(SERVER_MESSAGE_TYPES.SELECT_PARCEL, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SELECT_PARCEL + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)
            if(player && player.mode === SCENE_MODES.CREATE_SCENE_MODE){

                if(!this.isOccupied(info.parcel)){
                    if(this.hasTemporaryParcel(info.parcel)){
                        console.log('player has temporary parcel', info.parcel)
                        this.removeTemporaryParcel(info.parcel)
                        }else{
                        if(!this.hasTemporaryParcel(info.parcel)){
                            console.log('scene doesnt have temp parcel')
                            this.addTempParcel(info.parcel) 
                        }
                    }
                }
            }
        })
    
        room.onMessage(SERVER_MESSAGE_TYPES.SCENE_SAVE_NEW, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SCENE_SAVE_NEW + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)

            if(player && player.mode === SCENE_MODES.CREATE_SCENE_MODE){
                if(this.room.state.temporaryParcels.length > 0){
                    let scene:Scene = player.createScene(info, [...this.room.state.temporaryParcels])
                    this.room.state.scenes.set(scene.id, scene)

                    this.room.state.temporaryParcels.forEach((parcel)=>{
                       this.room.state.occupiedParcels.push(parcel)
                    })
                   this.freeTemporaryParcels()

                    // iwbManager.addNewScene(scene)
                    console.log('iwb rooms are', iwbManager.rooms)
                    player.updatePlayMode(SCENE_MODES.BUILD_MODE)
                    client.send(SERVER_MESSAGE_TYPES.PLAY_MODE_CHANGED, {mode:player.mode})
                }
            }else{
                console.log('player is not in create scene mode')
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.SCENE_DELETE_ITEM, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SCENE_DELETE_ITEM + " message", info)

            let player:Player = room.state.players.get(client.userData.userId)
            if(player && player.mode === SCENE_MODES.BUILD_MODE){

                let scene = this.room.state.scenes.get(info.sceneId)
                if(scene){
                    let assetIndex = scene.ass.findIndex((ass)=> ass.aid === info.aid)
                    if(assetIndex >= 0){
                        scene.ass.splice(assetIndex,1)
                        // room.broadcast(
                        //     SERVER_MESSAGE_TYPES.SCENE_DELETE_ITEM,
                        //     {userId: client.userData.userId, sceneId:info.sceneId, entity:info.entity, aid:info.aid}
                        // )
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

                let scene = this.room.state.scenes.get(info.item.sceneId)
                if(scene){
                    scene.ass.push(newItem)
                }
            }
        })
    }

    freeTemporaryParcels() {
        this.room.state.temporaryParcels.clear()
    }

    removeTemporaryParcel(parcel: any) {
        let index = this.room.state.temporaryParcels.findIndex((p) => p === parcel)
        if (index >= 0) {
            this.room.state.temporaryParcels.splice(index, 1)
        }
    }

    addOccupiedParcel(parcel: any) {
        this.room.state.occupiedParcels.push(parcel)
    }

    addTempParcel(parcel: any) {
        this.room.state.temporaryParcels.push(parcel)
    }

    isOccupied(parcel: any){
        return [...this.room.state.occupiedParcels]
            .find((p) => p === parcel)
    }

    hasTemporaryParcel(parcel: any) {
        return [...this.room.state.temporaryParcels, ...this.room.state.occupiedParcels]
            .find((p) => p === parcel)
    }
}