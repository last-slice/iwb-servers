import {RoomMessageHandler} from "../rooms/MessageHandler"
import {Player} from "./Player"


export class SceneManager {

    scenes: any[] = []
    occupiedParcels: string[] = []
    reservedParcels: string[] = ["0,0", "0,1", "1,0", "1,1"]
    messageHandler: RoomMessageHandler

    constructor() {
    }

    async getServerScenes() {
    }

    freeTemporaryParcels(player: Player) {
        player.temporaryParcels.forEach((parcel) => {
            let index = this.occupiedParcels.findIndex((p) => p === parcel)
            if (index >= 0) {
                this.occupiedParcels.splice(index, 1)
            }
        })
    }

    removeTemporaryParcel(parcel: any) {
        let index = this.occupiedParcels.findIndex((p) => p === parcel)
        if (index >= 0) {
            this.occupiedParcels.splice(index, 1)
        }
    }

    addOccupiedParcel(parcel: any) {
        this.occupiedParcels.push(parcel)
    }

    hasTemporaryParcel(parcel: any) {
        return [...this.reservedParcels, ...this.occupiedParcels]
            .find((p) => p === parcel)
    }

    createScene(parcels: string[]) {
        let scene = {
            parcels: parcels
        }
        this.scenes.push(scene)
        return scene
    }

    cleanUp() {
        this.occupiedParcels = []
        this.scenes.length = 0
    }
}