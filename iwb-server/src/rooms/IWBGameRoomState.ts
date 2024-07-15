import { Schema, MapSchema,ArraySchema, type } from "@colyseus/schema";
import { GameManager } from "./IWBGameManager";
import { Player } from "../Objects/Player";

export class IWBGameRoomState extends Schema {
  @type("string") world:string
  @type("number") gameCountdown:number
  @type("boolean") startingSoon:boolean = false
  @type("boolean") started:boolean = false
  @type("boolean") ended:boolean = false
  @type("boolean") reset:boolean = false
  @type("string") winner:string = ""
  @type("string") winnerId:string = ""

  @type({ map: Player }) players = new MapSchema<Player>();

  gameManager: GameManager
}