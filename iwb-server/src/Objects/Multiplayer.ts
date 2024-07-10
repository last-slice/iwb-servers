import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Quaternion, Vector3 } from "./Transform";

export class Multiplayer extends Schema{
    @type("number") number:number
    @type("number") loadingMin:number = 3
    @type(Vector3) loadingSpawn:Vector3 = new Vector3({x:0, y:0, z:0})
    @type(Vector3) loadingSpawnLook:Vector3 = new Vector3({x:0, y:0, z:0})
    @type("boolean") invisibleStartBox:boolean //do we need this?
    @type("boolean") saveProgress:boolean //do we need this?
    @type("boolean") premiumAccess:boolean //do we need this? ifo
    @type("boolean") premiumAccessType:boolean //do we need this? ifo
    @type("boolean") premiumAccessItem:boolean //do we need this? ifo
    @type("boolean") live:boolean = false
    //levels here?

    //game component can have children components to track "global" variables
    // like time, score, health, death, etc
}