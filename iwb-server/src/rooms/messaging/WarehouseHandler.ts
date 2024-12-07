import { Client } from "colyseus";
import fs from "fs";
import path from "path";
import { IWBRoom } from "../IWBRoom";
import { ACTIONS, COMPONENT_TYPES, EDIT_MODIFIERS, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { attemptGameEnd, attemptGameStart, GameComponent, GameVariableComponent, setInitialPlayerData } from "../../Objects/Game";
import { id } from "ethers";

let warehouseData:any[] = []
export function setWarehouseData(data:any){
    warehouseData = data
}

export function warehouseHandler(room:IWBRoom){
    room.onMessage(SERVER_MESSAGE_TYPES.WAREHOUSE_ITEM_TRANSFORM, (client:Client, data:any)=>{
        console.log(SERVER_MESSAGE_TYPES.WAREHOUSE_ITEM_TRANSFORM + " received", data)
        let category = warehouseData.find((cat:any) => cat.style === data.style)
        if(!category){
            console.log('warehosue catgegory not found')
            return
        }

        let item:any

        if(data.category){
            item = category
        }else if(data.trigger){
            console.log('moving trigger')
            item = category.triggers.find((it:any) => it.id === data.id)
        }
        else{
            item = category.items.find((it:any)=> it.id === data.id)
        }

        if(!item){
            console.log('no warehouse item found')
            return
        }

        switch(data.modifier){
            case EDIT_MODIFIERS.POSITION:
                switch(data.axis){
                  case 'ALL':
                    item.p.x = data.x
                    item.p.y = data.y
                    item.p.z = data.z
                    break;
    
                    case 'x':
                        if(data.manual){
                            item.p.x = data.value === "" ? 0 : data.value
                        }else{
                            item.p.x += (data.direction * data.factor)
                        }
                        break;
    
                    case 'y':
                        if(data.manual){
                            item.p.y = data.value === "" ? 0 : data.value
                        }else{
                            item.p.y += (data.direction * data.factor)
                        }
                        break;
    
                    case 'z':
                        if(data.manual){
                            item.p.z = data.value === "" ? 0 : data.value
                        }else{
                            item.p.z += (data.direction * data.factor)
                        }
                        break;
                }
                break;
    
            case EDIT_MODIFIERS.ROTATION:
                switch(data.axis){
                  case 'ALL':
                    item.r.x = data.x
                    item.r.y = data.y
                    item.r.z = data.z
                    break;
                    case 'x':
                        if(data.manual){
                            item.r.x = data.value === "" ? 0 : data.value
                        }else{
                            item.r.x += (data.direction * data.factor)
                        }
                        break;
    
                    case 'y':
                        if(data.manual){
                            item.r.y = data.value === "" ? 0 : data.value
                        }else{
                            item.r.y += (data.direction * data.factor)
                        }
                        break;
    
                    case 'z':
                        if(data.manual){
                            item.r.z = data.value === "" ? 0 : data.value
                        }else{
                            item.r.z += (data.direction * data.factor)
                        }
                        break;
                }
                break;
    
            case EDIT_MODIFIERS.SCALE:
                switch(data.axis){
                  case 'ALL':
                    item.r.x = data.x
                    item.r.y = data.y
                    item.r.z = data.z
                    break;
                    case 'x':
                        if(data.manual){
                            item.s.x = data.value === "" ? 0 : data.value
                        }else{
                            item.s.x += (data.direction * data.factor)
                        }
                        break;
    
                    case 'y':
                        if(data.manual){
                            item.s.y = data.value === "" ? 0 : data.value
                        }else{
                            item.s.y += (data.direction * data.factor)
                        }
                        break;
    
                    case 'z':
                        if(data.manual){
                            item.s.z = data.value === "" ? 0 : data.value
                        }else{
                            item.s.z += (data.direction * data.factor)
                        }
                        break;
                }
                break;
        }

        // console.log('item is', item)
        // console.log('ware  is', warehouseData)
    })

    room.onMessage(SERVER_MESSAGE_TYPES.SAVE_WAREHOUSE, (client:Client, info:any)=>{
        console.log(SERVER_MESSAGE_TYPES.SAVE_WAREHOUSE + " received", info)
        try {
            let category = warehouseData.find((cat:any) => cat.style === info.style)
            if(!category){
                console.log('warehosue catgegory not found')
                return
            }

            if(info.trigger){}
            else if(info.category){}
            else{
                let item =  category.items.find((it:any)=> it.id === info.id)
                if(!item){
                    console.log('no warehouse item found')
                }
    
                item.placed = true   
                console.log('item is now', item)
            }

            fs.writeFileSync(path.resolve('./data/warehouse.json'), JSON.stringify(warehouseData, null, 2));
            console.log('write file finished')
          } catch (error) {
            console.error(`Error savign warehosue`, error);
            // throw new Error("Failed to sync cache to file.");
          }
    })

    room.onMessage(SERVER_MESSAGE_TYPES.WAREHOUSE_ADD_TRIGGER, (client:Client, info:any)=>{
        console.log(SERVER_MESSAGE_TYPES.WAREHOUSE_ADD_TRIGGER + " received", info)
        try {

            let category = warehouseData.find((cat:any) => cat.style === info.style)
            if(!category){
                console.log('warehosue catgegory not found')
                return
            }
            if(!category.triggers){
                category.triggers = []
            }

            category.triggers.push(
                {
                    "id": info.count,
                    "p": {
                      "x": 0,
                      "y": 0,
                      "z": 0
                    },
                    "s": {
                      "x": 1,
                      "y": 1,
                      "z": 1
                    }
                  },
            )
            fs.writeFileSync(path.resolve('./data/warehouse.json'), JSON.stringify(warehouseData, null, 2));
            console.log('write file finished')
        }
        catch(e){
            console.log('error adding trigger', e)
        }
    })
}
