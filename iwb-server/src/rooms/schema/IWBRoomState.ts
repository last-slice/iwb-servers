import { Schema, Context,MapSchema, type, ArraySchema } from "@colyseus/schema";
import { Player } from "../../Objects/Player";
import { Scene } from "../../Objects/Scene";

export class IWBRoomState extends Schema {

  world:string

  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: Scene }) scenes = new MapSchema<Scene>();

}
