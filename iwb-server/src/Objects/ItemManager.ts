import { getTitleData } from "../utils/Playfab"



export class ItemManager{

    items:Map<string, any> = new Map()

    constructor(){
        this.getServerItems()
    }

    async getServerItems(){
        try{
            let response = await await getTitleData({Keys: ["Builder Items", "Catalog1"]})
            let data = JSON.parse(response.Data['Builder Items'])
            data.forEach((item:any, i:number)=>{
                this.items.set(item.id, item)
            })

            data = JSON.parse(response.Data["Catalog1"])
            data.forEach((item:any, i:number)=>{
                this.items.set(item.id, item)
            })

            // for(let i = 0; i < 2000; i++){
            //     let data = this.items.get("065b0495-1dfb-48f9-baa5-b5028bd56a89")
            //     this.items.set("065b0495-1dfb-48f9-baa5-b5028bd56a89" + i, data)
            // }
        }
        catch(e){
            console.log('error getting server items', e)
        }
    }
}