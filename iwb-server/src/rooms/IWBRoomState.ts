import { Schema, MapSchema,ArraySchema, type } from "@colyseus/schema";
import { Scene, TempScene } from "../Objects/Components";

export class IWBRoomState extends Schema {

  @type("string") world:string
  @type("string") owner:string
  @type("number") cv:number = 0 
  @type("number") sceneCount:number = 0 
  // messageHandler:RoomMessageHandler
  // sceneManager:RoomSceneManager
  realmAssets:Map<string,any> = new Map()

  @type(TempScene) tempScene:TempScene

  @type(["string"]) occupiedParcels = new ArraySchema<string>()
  @type(["string"]) temporaryParcels = new ArraySchema<string>()
  
  @type({map: Scene}) scenes = new MapSchema<Scene>()
  // @type({ map: Player }) players = new MapSchema<Player>();
}
