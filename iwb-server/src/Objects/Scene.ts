import {Schema, type} from "@colyseus/schema";

export class Vector3 extends Schema {
    @type("number") x: number
    @type("number") y: number
    @type("number") z: number
}

export class Quaternion extends Schema {
    @type("number") x: number
    @type("number") y: number
    @type("number") z: number
    @type("number") w: number
}


export class SceneItem extends Schema {
    @type("string") id: string
    @type("string") name: string
    @type(Vector3) position: Vector3 = new Vector3()
    @type(Quaternion) rotation: Vector3 = new Vector3()
    @type(Vector3) scale: Vector3 = new Vector3()
}

export class Scene extends Schema {
    @type(["string"]) parcels: string[] = []
    @type("string") baseParcel: string
    @type([SceneItem]) assets: SceneItem[] = []
}
