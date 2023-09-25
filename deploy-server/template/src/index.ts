import { engine, InputAction, inputSystem, Material, MeshCollider, MeshRenderer, pointerEventsSystem, Transform } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'


export function main() {

  let box = engine.addEntity()
  MeshRenderer.setBox(box)
  Transform.create(box, {position: Vector3.create(8,1,8)})

}
