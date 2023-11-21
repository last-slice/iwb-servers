import { Schema, MapSchema,ArraySchema, type } from "@colyseus/schema";
import { Player } from "../../Objects/Player";
import { Scene, TempScene } from "../../Objects/Scene";
import { RoomMessageHandler } from "../handlers/MessageHandler";
import { RoomSceneManager } from "../handlers/SceneManager";

export class IWBRoomState extends Schema {

  @type("string") world:string
  messageHandler:RoomMessageHandler
  sceneManager:RoomSceneManager

  @type(TempScene) tempScene:TempScene

  @type(["string"]) occupiedParcels = new ArraySchema<string>()
  @type(["string"]) temporaryParcels = new ArraySchema<string>()
  
  @type({map: Scene}) scenes = new MapSchema<Scene>()
  @type({ map: Player }) players = new MapSchema<Player>();
}
