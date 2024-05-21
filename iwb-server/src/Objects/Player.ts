import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { COMPONENT_TYPES, SCENE_MODES, VIEW_MODES } from "../utils/types";
import { IWBRoom } from "../rooms/IWBRoom";
import { Client } from "colyseus";
import { Scene } from "@gltf-transform/core";

export class Player extends Schema {
    @type("string") userId:string;
    @type("string") address:string
    @type("string") name:string 
    // @type(SelectedAsset) selectedAsset: SelectedAsset

    playFabData:any
    ip:string

    room:IWBRoom
    roomId:string
    client:Client
    world:string = "main"

    playtime:number = 0
    updateTimer:any
    modified = false

    settings:any

    stats = new MapSchema<number>()
    catalog:Map<string,any> = new Map()
    pendingAssets:any[] = []
    pendingDeployment:any = false
    startTime:any

    claimingReward = false

    dclData:any
    mode:SCENE_MODES
    viewMode:VIEW_MODES = VIEW_MODES.AVATAR
    scenes:Scene[] = []
    worlds:any[] = []
    buildingAllowed:boolean = false
    previousParcel:string
    currentParcel:string
    uploadToken:string
    version:number
    activeScene: Scene | null
    activeSceneId:string = ""
    canBuild:boolean = false
    objects:any[]
    selectedEntity:any
    homeWorld:boolean = false
    cameraParent?:any
    uploads:any[] = []
    landsAvailable:any[] = []
    worldsAvailable:any[] = []
    deploymentLink:string
    rotation:number
    parent:any

    constructor(room:IWBRoom, client:Client){
        super()
        this.room = room
        this.client = client

        this.userId = client.userData.userId
    
        this.playFabData = client.auth.playfab
        this.dclData = client.userData
        this.address = client.userData.userId
        this.name = client.userData.name
        this.ip = client.userData.ip
    
        this.mode = SCENE_MODES.PLAYMODE
    
        this.startTime = Math.floor(Date.now()/1000)

        // this.setSettings(this.playFabData.InfoResultPayload.UserData)
      }

      getPlayerData(){
        return this.canBuild
      }
}