import {ArraySchema, Schema, type} from "@colyseus/schema";
import {ACTIONS, COMPONENT_TYPES} from "../utils/types";
import { Vector3 } from "./Components";
import { Player } from "./Player";

export class AccessModule extends Schema {
    @type("string") id:string
    @type("string") type:string
}

export class EnemyConfig extends Schema {
    @type("string") id:string
    @type("string") aid:string
    @type("number") ty:number
    @type("string") cid:string
    @type("number") as:number
    @type("number") he:number
    @type("number") def:number

    // Animations?
    // sounds?
    
}

export class WaveModule extends Schema {
    @type(["number"]) starts: ArraySchema<number>
    @type(["number"]) ends: ArraySchema<number>
    @type("number") spwnTy: number
    @type("number") spwnAmt: number
    @type("number") spwnDel: number
    @type("string") spwnDelRng: string
    @type("string") enmy: string

}

export class TimerModule extends Schema {
    @type("string") id:string
    @type("string") type:string
    @type("number") direction:number
    @type("number") start:number
    @type("number") end:number
    @type("string") sound:string
}

export class Level extends Schema {
    //token gated
    //sound pack?
    //win conditions
    @type("string") id:string
    @type("string") type:string
    @type("number") number:number
    @type("boolean") restricted:boolean
    @type("boolean") showLevel:boolean
    @type(TimerModule) timer: ArraySchema<TimerModule>
    @type(TimerModule) countdown: ArraySchema<TimerModule>
}

export class Game extends Schema {
    @type("string") id:string
    @type("string") name:string
    @type("string") desc:string
    @type("string") im:string
    @type("number") type:number
    @type("boolean") editing:boolean
    @type("number") editLvl:number
    @type("number") startLives:number
    @type("number") startHealth:number
    @type("number") startScore:number
    @type("number") startLevel:number
    @type("boolean") uiBorder:string
    @type(Vector3) p: Vector3 = new Vector3()
    @type([WaveModule]) waves: ArraySchema<WaveModule>
    @type([Level]) levels: ArraySchema<Level>
    @type([EnemyConfig]) enemies: ArraySchema<EnemyConfig>
    @type([Player]) players: ArraySchema<Player> // might need something for this for multiplayer to keep track of player health etc

    //win conditions?

    //restrict access to # of players in 24 hours?
    //other restrictions?
}