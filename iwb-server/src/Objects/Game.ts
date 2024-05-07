import {ArraySchema, Schema, type} from "@colyseus/schema";
import {ACTIONS, COMPONENT_TYPES} from "../utils/types";
import { Actions, Vector3 } from "./Components";

export class AccessModule extends Schema {
    @type("string") id:string
    @type("string") type:string
}

export class PointModule extends Schema {
    @type("string") id:string
    @type("string") type:string
}

export class ActionModule extends Schema {
    @type("string") id:string
    @type("string") type:string
    @type([Actions]) actions: ArraySchema<Actions>
}

export class EnemyConfig extends Schema {
    @type("string") id:string //not sure
    @type("string") aid:string //scene specific id
    @type("number") ty:number // type, no idea what this will do yet
    @type("string") cid:string //character id for 3d model reference
    @type("number") as:number //attack speed
    @type("number") she:number //start health
    @type("number") he:number //health
    @type("number") def:number //defense
    @type(Vector3) si:Vector3 //size
    @type("number") anims:number //animations?
    @type("number") snds:number //sounds?

    // Animations?
    // sounds?

    //on death action?
    //on leave action?
    //on hit player action?
    
}

export class WaveModule extends Schema {
    @type("string") id:string
    @type([Vector3]) starts: ArraySchema<Vector3>
    @type([Vector3]) ends: ArraySchema<Vector3>
    @type("number") sTy: number //start type conditions 1) level start, 2) time based 3) other
    @type("number") spwnTy: number //spawn type 1) interval, 2) all at once, 3) random
    @type("number") spwnAmt: number // spawn amounts
    @type("number") spwnDel: number // spawn delay
    @type("number") spwnDelTy: number // spawn delay type 1) consistent, 2) random
    @type("string") spwnDelRng: string // spawn delay timer range
    @type(EnemyConfig) enmy: EnemyConfig // enemy config choice
}

export class TimerModule extends Schema {
    @type("string") id:string
    @type("string") type:string
    @type("number") time:number
}

export class LevelModule extends Schema {
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
    @type([LevelModule]) levels: ArraySchema<LevelModule>
    @type([EnemyConfig]) enemies: ArraySchema<EnemyConfig>

    //restrict access to # of players in 24 hours?
    //other restrictions?
}