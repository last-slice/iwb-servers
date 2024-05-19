import { Client } from "colyseus";
import { Scene } from "./Components";


export function editTransform(client:Client, info:any, scene:Scene){
    let transform = scene.transforms.get(info.aid)
    if(transform){
      switch(info.mode){
        case 'p':
          console.log('moving objct', info.aid)
          transform.p.x += 1
          break;
      }
    }
}