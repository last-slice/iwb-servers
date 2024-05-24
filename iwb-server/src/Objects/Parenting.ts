import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";

export class ParentingComponent extends Schema{
    @type("string") aid:string
    @type("number") entity:number
    @type(["string"]) children:ArraySchema<string> = new ArraySchema<string>()

    constructor(data:any){
        super()
        this.aid = data.aid
        data.children.forEach((child:any)=>{
            this.children.push(child)
        })
    }
}
