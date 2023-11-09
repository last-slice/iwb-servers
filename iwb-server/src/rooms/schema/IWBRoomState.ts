import { Schema, Context, MapSchema,type, ArraySchema } from "@colyseus/schema";
import { Player } from "../../Objects/Player";
import { Scene } from "../../Objects/Scene";
import { RoomSceneHandler } from "../handlers/SceneHandler";

let iwbtype = Context.create()
export class IWBRoomState extends Schema {

  world:any
  sceneHandler:RoomSceneHandler

  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: Scene }) scenes = new MapSchema<Scene>();
}
