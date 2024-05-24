import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { REWARD_TYPES } from "../utils/types";

export class RewardComponent extends Schema {
    @type("string") id:string
    @type("string") type:string = REWARD_TYPES.DCL_ITEM
    @type("number") start:number
    @type("number") end:number
    @type("number") ip:number
    @type("number") amt:number

    o:string

    // @filter(function(
    //     this: RewardComponent, // the instance of the class `@filter` has been defined (instance of `Card`)
    //     client: Client, // the Room's `client` instance which this data is going to be filtered to
    //     value: RewardComponent['key'], // the value of the field to be filtered. (value of `number` field)
    //     root: Schema // the root state Schema instance
    // ) {
    //     return this.o === client.userData.userId;//
    // })

    key:string

    en:boolean
    claims:any[] = []
}
