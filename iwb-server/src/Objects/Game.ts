import {ArraySchema, Schema, type} from "@colyseus/schema";
import {ACTIONS, COMPONENT_TYPES} from "../utils/types";
import { Vector3 } from "./Components";

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
    @type("number") time:number
}

export class Level extends Schema {
    //token gated
    //sound pack?
    //win conditions
    @type("string") id:string
    @type("string") type:string
    @type("number") number:number
    @type("boolean") restricted:boolean
}

export class Game extends Schema {
    @type("string") id:string
    @type("string") name:string
    @type("string") desc:string
    @type("string") im:string
    @type("number") type:number
    @type("boolean") editing:boolean
    @type("string") editLvl:string
    @type(Vector3) p: Vector3 = new Vector3()

    @type(TimerModule) timer: ArraySchema<TimerModule>
    @type([WaveModule]) waves: ArraySchema<WaveModule>
    @type([Level]) levels: ArraySchema<Level>
    @type([EnemyConfig]) enemies: ArraySchema<EnemyConfig>

    //restrict access to # of players in 24 hours?
    //other restrictions?
}