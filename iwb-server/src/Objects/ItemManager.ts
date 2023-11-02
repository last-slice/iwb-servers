import { iwbManager } from "../app.config"
import { IWBRoom } from "../rooms/IWBRoom"
import { RoomMessageHandler } from "../rooms/handlers/MessageHandler"
import { getTitleData, setTitleData } from "../utils/Playfab"
import { SERVER_MESSAGE_TYPES } from "../utils/types"
import { Player } from "./Player"



export class ItemManager{
    
    items:Map<string, any> = new Map()
    messageHandler:RoomMessageHandler


    newItemsToDeploy:any[] = []

    constructor(){
        // this.getServerItems(true)
    }

    initServerItems(serverItems:any[]){
        serverItems.forEach((items:any)=>{
            let data = JSON.parse(items)
            data.forEach((item:any, i:number)=>{
                if(!this.items.has(item.id)){
                    this.items.set(item.id, item)
                }
            })
        })

        // for(let i = 0; i < 2000; i++){
        //     let data = this.items.get("065b0495-1dfb-48f9-baa5-b5028bd56a89")
        //     this.items.set("065b0495-1dfb-48f9-baa5-b5028bd56a89" + i, data)
        // }
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

    async backupCatalog(){
        let items:any[] = []
        this.items.forEach((item,key)=>{
            items.push(item)
        })
        await setTitleData({Key:"Catalog1", Value:JSON.stringify(items)})
    }

    async saveNewCatalogAssets(data:any){
        for(let i = 0; i < data.length; i++){
            let asset = await this.createNewAsset(data[i].o,data[i])
            this.newItemsToDeploy.push(asset)
        
            this.items.set(asset.id, asset)
        }
        await this.backupCatalog()
    }

    async saveNewAsset(user:string, data:any){
        console.log('saving new asset', user, data)
        let asset = await this.createNewAsset(user,data)
        this.newItemsToDeploy.push(asset)
    
        this.items.set(asset.id, asset)

        let player:Player = iwbManager.findUser(user)
        if(player){
            player.uploadAsset(asset, true)
        }
    }

    async createNewAsset(user:string, data:any){
        let asset:any = {
            id: data.file,
            n: data.name,
            im: data.image,
            d: "Test upload description",
            cat: 'Test',
            o: user,
            isdl: false,
            ty: '3d',
            pc: data.polycount,
            si: {},
            tag:[],
            v: iwbManager.version + 1
        }
        if(data.scale){
            let size = JSON.parse(data.scale)
            console.log('size is', size)
            asset.si = {x:parseFloat(size.x.toFixed(2)), y:parseFloat(size.y.toFixed(2)), z:parseFloat(size.z.toFixed(2))  }    
        }

        console.log('new asset uploaded is', asset)

        return asset
    }

    pingUserAssetUploaded(user:string, data:any){
        iwbManager.sendUserMessage(user, SERVER_MESSAGE_TYPES.PLAYER_ASSET_UPLOADED, {})
    }

    notifyUsersDeploymentReady(){
        this.newItemsToDeploy.forEach((item:any)=>{
            iwbManager.sendUserMessage(item.o, SERVER_MESSAGE_TYPES.PLAYER_CATALOG_DEPLOYED, {})
        })
        this.newItemsToDeploy.length = 0
    }
}

