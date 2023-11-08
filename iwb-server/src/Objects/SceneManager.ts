import { IWBRoom } from "../rooms/IWBRoom"
import { UserRoom } from "../rooms/UserRoom"
import { RoomMessageHandler } from "../rooms/handlers/MessageHandler"
import { setTitleData } from "../utils/Playfab"
import { SceneData } from "../utils/types"
import { Player } from "./Player"
import { Scene } from "./Scene"


export class SceneManager {

    scenes: SceneData[] = []
    occupiedParcels: string[] = []
    reservedParcels: string[] = ["0,0", "0,1", "1,0", "1,1"]

    backupQueue:any[] = []
    backingUp:boolean = false
    modified:boolean = false

    constructor() {

        let backupInterval = setInterval(async()=>{
            if(this.modified){
                await setTitleData({Key:"Scenes", Value: JSON.stringify(this.scenes)})
                this.modified = false
            }
        }, 1000 * 30)
    }

    initServerScenes(scenes:any){
        this.scenes = JSON.parse(scenes)
    }

    loadLobbyScenes(room:IWBRoom){    
        let scenes = this.scenes.filter((scene) => scene.o === "0x" && scene.e)
        // let scenes = this.scenes.filter((scene) => scene.e)//
        console.log('world scenes are ', scenes)
        scenes.forEach((config)=>{
            let scene:Scene = new Scene(config)
            room.state.scenes.set(config.id, scene)
        })
    }

    loadWorldScenes(room:UserRoom){    
        let scenes = this.scenes.filter((scene) => scene.o === room.state.world && scene.e)
        scenes.forEach((config)=>{
            // let scene:Scene = 
            room.state.scenes.set(config.id, new Scene(config))
        })
    }

    getScenes(){
        let serverScenes:any[] = []
        this.scenes.forEach((scene)=>{
            serverScenes.push({id:scene.id, scna:scene.n, owner:scene.o, updated: scene.upd, name: scene.ona})
        })
        return serverScenes
    }

    saveWorldScenes(scenes:Map<string, Scene>){
        scenes.forEach((scene, key)=>{
            let sceneIndex = this.scenes.findIndex((sc:any) =>sc.id === scene.id)
            if(sceneIndex >= 0){
                this.scenes[sceneIndex] = scene
            }else{
                this.scenes.push(scene)
            }
            this.modified = true
        })
    }

    addNewScene(scene:SceneData){
        this.scenes.push(scene)
    }
}