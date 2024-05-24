import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";

export class IWBCatalogComponent extends Schema{
    @type("string") id:string
    // @type("string") name:string
    @type("string") description:string
    @type("string") owner:string
    @type("string") ownerAddress:string
    @type("string") category:string
    @type("string") type:string
    @type("string") style:string
    @type("boolean") ugc:boolean
    @type("boolean") pending:boolean

    n:string //name
}

export class IWBComponent extends Schema{
    @type("string") aid:string
    @type("string") editor:string
    @type("boolean") locked:boolean
    @type("boolean") buildVis:boolean
    @type("boolean") editing:boolean
    @type("boolean") priv:boolean
}