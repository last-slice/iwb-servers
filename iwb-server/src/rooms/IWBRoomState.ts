import { Schema, MapSchema,ArraySchema, type } from "@colyseus/schema";
import { Scene, TempScene } from "../Objects/Scene";
import { Player } from "../Objects/Player";

export class IWBRoomState extends Schema {

  @type("string") world:string
  @type("string") owner:string
  @type("number") cv:number = 0 
  @type("number") sceneCount:number = 0 
  
  realmAssets:Map<string,any> = new Map()
  realmAssetsChanged = false

  @type(TempScene) tempScene:TempScene

  @type(["string"]) occupiedParcels = new ArraySchema<string>()
  @type(["string"]) temporaryParcels = new ArraySchema<string>()
  
    @type({ map: Player }) players = new MapSchema<Player>();
  @type({map: Scene}) scenes = new MapSchema<Scene>()


  realm:string = ""
  version:number = 0
  gcWorld:boolean = false
  // scenes: Scene[] = []
  // occupiedParcels: string[] = []
  reservedParcels: string[] = ["0,0", "0,1", "1,0", "1,1"]

  backupQueue:any[] = []
  backingUp:boolean = false
  modified:boolean = false

  realmToken:string
  realmId:string
  realmTokenType:string


}