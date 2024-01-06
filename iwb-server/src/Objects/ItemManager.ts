import { iwbManager } from "../app.config"
import { IWBRoom } from "../rooms/IWBRoom"
import { RoomMessageHandler } from "../rooms/handlers/MessageHandler"
import { PLAYFAB_DATA_ACCOUNT, abortFileUploads, fetchPlayfabFile, fetchPlayfabMetadata, finalizeUploadFiles, getTitleData, initializeUploadPlayerFiles, playfabLogin, setTitleData, uploadPlayerFiles } from "../utils/Playfab"
import { SERVER_MESSAGE_TYPES } from "../utils/types"
import { Player } from "./Player"



export class ItemManager{
    
    items:Map<string, any> = new Map()
    newItemsToDeploy:any[] = []

    constructor(){
        // this.getServerItems(true)
    }

    async initServerItems(){
        try{
            let metadata = await fetchPlayfabMetadata(PLAYFAB_DATA_ACCOUNT)
            let catalogData = await fetchPlayfabFile(metadata, "catalog.json")
            catalogData.forEach((item:any)=>{
                if(!this.items.has(item.id)){
                    this.items.set(item.id, item)
                }
            })
            console.log('catalog size is', this.items.size)
        }
        catch(e){
            console.log('error fetching data account')
        }
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

        let user:any
        try{
            user = await playfabLogin(PLAYFAB_DATA_ACCOUNT)

            let initres = await initializeUploadPlayerFiles(user.EntityToken.EntityToken,{
                Entity: {Id: user.EntityToken.Entity.Id, Type: user.EntityToken.Entity.Type},
                FileNames:['catalog.json']
            })

            await uploadPlayerFiles(initres.UploadDetails[0].UploadUrl, JSON.stringify(items))
            await finalizeUploadFiles(user.EntityToken.EntityToken,
                {
                    Entity: {Id: user.EntityToken.Entity.Id, Type: user.EntityToken.Entity.Type},
                    FileNames:['catalog.json'],
                    ProfileVersion:initres.ProfileVersion,
            })

            console.log('catalog backup success')
        }
        catch(e){
            console.log('backup error')
            await abortFileUploads(user.EntityToken.EntityToken,{
                Entity: {Id: user.EntityToken.Entity.Id, Type: user.EntityToken.Entity.Type},
                FileNames:['catalog.json'],
              })
        }
    }

    async saveNewCatalogAssets(data:any){
        console.log('saving new catalog assets', data)
        for(let i = 0; i < data.length; i++){
            let asset = await this.createNewAsset(data[i])
            this.newItemsToDeploy.push(asset)
        
            this.items.set(asset.id, asset)
        }
        await this.backupCatalog()
    }

    async saveNewAsset(user:string, data:any){
        console.log('saving new asset', user, data)
        let asset = await this.createNewAsset(data)
        this.newItemsToDeploy.push(asset)
    
        this.items.set(asset.id, asset)

        let player:Player = iwbManager.findUser(user)
        if(player){
            player.uploadAsset(asset, true)
        }
    }

    async createNewAsset(data:any){
        let asset:any = {
            id: data.id,
            m: data.m,
            n: data.n,
            im: data.im,
            d: data.d,
            cat: data.cat,
            on: data.on,
            o: data.o,
            isdl: data.isdl,
            ty: data.ty,
            pc: data.pc,
            si: data.fs,
            tag:data.tag,
            bb:data.bb,
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



