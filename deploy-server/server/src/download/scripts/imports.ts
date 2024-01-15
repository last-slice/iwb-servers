

export async function writeImports(){
    let scene = `
import { Entity, GltfContainer, Material, MeshCollider, MeshRenderer, Transform, VideoPlayer, engine } from "@dcl/sdk/ecs"
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math"
import { scene } from "./config"
`
    return scene
}