import { IWBRoom } from "../rooms/IWBRoom"
import { UserRoom } from "../rooms/UserRoom"
import { RoomMessageHandler } from "../rooms/handlers/MessageHandler"
import { Player } from "./Player"
import { Scene } from "./Scene"

export class SceneManager{

    scenes:any[] = []
    occupiedParcels:any[] = ["0,0", "0,1", "1,0", "1,1"]
    messageHandler:RoomMessageHandler

    constructor(){
    }

    initServerScenes(scenes:any){
        this.scenes = JSON.parse(scenes)
        console.log('Server scenes are', scenes)
    }

    freeTemporaryParcels(player:Player){
        player.temporaryParcels.forEach((parcel)=>{
            let index = this.occupiedParcels.findIndex((p)=> p === parcel)
            if(index >= 0){
                this.occupiedParcels.splice(index,1)
            }
        })
    }

    removeTemporaryParcel(parcel:any){
        let index = this.occupiedParcels.findIndex((p)=> p === parcel)
        if(index >= 0){
          this.occupiedParcels.splice(index,1)
        }
      }
    
    addOccupiedParcel(parcel:any){
        this.occupiedParcels.push(parcel)
    }

    hasTemporaryParcel(parcel:any){
        return this.occupiedParcels.find((p)=> p === parcel)
    }

    cleanUp(){
        this.occupiedParcels = ["0,0", "0,1", "1,0", "1,1"]
    }

    loadWorldScenes(room:IWBRoom | UserRoom){    
        console.log('room world is', room.state.world)
        let scenes = this.scenes.filter((scene) => scene.o === room.state.world && scene.e)
        console.log('any scenes are a', scenes)
        scenes.forEach((scene)=>{
            new Scene(room, scene)
        })

    }
}