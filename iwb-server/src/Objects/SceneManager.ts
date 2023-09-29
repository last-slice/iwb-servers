import { RoomMessageHandler } from "../rooms/MessageHandler"
import { Player } from "./Player"

export class SceneManager{

    scenes:any[] = []
    occupiedParcels:any[] = ["0,0", "0,1", "1,0", "1,1"]
    messageHandler:RoomMessageHandler

    constructor(){
    }

    async getServerScenes(){
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
        this.scenes.length = 0
    }
}