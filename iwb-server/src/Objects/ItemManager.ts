import { RoomMessageHandler } from "../rooms/MessageHandler"
import { getTitleData } from "../utils/Playfab"
import { SERVER_MESSAGE_TYPES } from "../utils/types"



export class ItemManager{

    items:Map<string, any> = new Map()
    messageHandler:RoomMessageHandler

    constructor(){
        this.getServerItems(true)
    }

    async getServerItems(init?:boolean){
        try{
            let response = await await getTitleData({Keys: ["Builder Items", "Catalog1"]})
            let data = JSON.parse(response.Data['Builder Items'])
            data.forEach((item:any, i:number)=>{
                if(!this.items.has(item.id)){
                    this.items.set(item.id, item)
                }
            })

            data = JSON.parse(response.Data["Catalog1"])
            data.forEach((item:any, i:number)=>{
                if(!this.items.has(item.id)){
                    this.items.set(item.id, item)
                }
            })

            if(init){
                for(let i = 0; i < 2000; i++){
                    let data = this.items.get("065b0495-1dfb-48f9-baa5-b5028bd56a89")
                    this.items.set("065b0495-1dfb-48f9-baa5-b5028bd56a89" + i, data)
                }
            }else{
                this.messageHandler.broadcast(SERVER_MESSAGE_TYPES.CATALOG_UPDATED, {})
            }
        }
        catch(e){
            console.log('error getting server items', e)
        }
    }
}