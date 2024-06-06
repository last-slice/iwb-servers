import { iwbManager } from "../app.config"
import { testCatalog } from "../tests/catalog"
import { PLAYFAB_DATA_ACCOUNT, abortFileUploads, fetchPlayfabFile, fetchPlayfabMetadata, fetchUserMetaData, finalizeUploadFiles, getTitleData, initializeUploadPlayerFiles, playfabLogin, pushPlayfabEvent, setTitleData, uploadPlayerFiles } from "../utils/Playfab"
import { SERVER_MESSAGE_TYPES } from "../utils/types"
import { Player } from "./Player"

export class ItemManager{
    
    items:Map<string, any> = new Map()
    newItemsToDeploy:any[] = []

    constructor(){
        // this.getServerItems(true)
    }

    async initServerItems(){
        // try{
        //     let metadata = await fetchPlayfabMetadata(PLAYFAB_DATA_ACCOUNT)
        //     let catalogData = await fetchPlayfabFile(metadata, "catalog.json")
        //     catalogData.forEach((item:any)=>{
        //         if(!this.items.has(item.id)){
        //             this.items.set(item.id, item)
        //         }
        //     })
        //     console.log('catalog size is', this.items.size)
        // }
        // catch(e){
        //     console.log('error fetching data account')
        // }

        testCatalog.forEach((item:any)=>{
            if(!this.items.has(item.id)){
                this.items.set(item.id, item)
            }
        })


        console.log('catalog size is', this.items.size)
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

        this.uploadFile(PLAYFAB_DATA_ACCOUNT, 'catalog.json', items)
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
        let asset = await this.createNewAsset(data, true)
        // this.newItemsToDeploy.push(asset)
    
        // this.items.set(asset.id, asset)

        let player:Player = iwbManager.findUser(user)
        if(player){
            console.log('we have player, get their info')
            asset.on = "" + player.dclData.name
            player.uploadAsset(asset, true)

            pushPlayfabEvent(
                SERVER_MESSAGE_TYPES.PLAYER_ASSET_UPLOADED, 
                player, 
                [{name:data.n, type:data.ty}]
            )

        }else{
            asset.on = "" + iwbManager.worlds.find((w)=> w.owner === user).worldName
            console.log("player no longer here, need to add to their profile")

            let userData = await playfabLogin(user)
            let metadata = await fetchUserMetaData(userData)

            let catalog = await fetchPlayfabFile(metadata, 'catalogs.json')

            asset.pending = true
            asset.ugc = true
            
            catalog.push(asset)
            await this.uploadFile(data.o, "catalogs.json", catalog)

            player.playFabData.PlayFabId,
            
            pushPlayfabEvent(
                SERVER_MESSAGE_TYPES.PLAYER_ASSET_UPLOADED, 
                {playfabData:{PlayFabId:userData.PlayFabId}}, 
                [{name:data.n, type:data.ty}]
            )
        }
    }

    async createNewAsset(data:any, ugc?:boolean){
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
            sty:data.sty ? data.sty : data.style ? data.style : undefined,
            anim: data.anims ? data.anims : undefined,
            v: ugc ? iwbManager.worlds.find((w)=> w.owner === data.o).cv + 1 : iwbManager.version + 1
        }
        if(data.bb){
            if(data.ty === "3D"){
                if(typeof data.bb === "string"){
                    data.bb = JSON.parse(data.bb)
                }
                asset.bb = data.bb
                asset.bb = {x:parseFloat(data.bb.x.toFixed(2)), y:parseFloat(data.bb.y.toFixed(2)), z:parseFloat(data.bb.z.toFixed(2))  } 
            }else{
                let size = JSON.parse(data.bb)
                asset.bb = {x:parseFloat(size.x.toFixed(2)), y:parseFloat(size.y.toFixed(2)), z:parseFloat(size.z.toFixed(2))  } 

            }   
            
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

    async uploadFile(customLogin:any, filename:string, file:any){
        let user:any
        try{
            user = await playfabLogin(customLogin)

            let initres = await initializeUploadPlayerFiles(user.EntityToken.EntityToken,{
                Entity: {Id: user.EntityToken.Entity.Id, Type: user.EntityToken.Entity.Type},
                FileNames:[filename]
            })

            await uploadPlayerFiles(initres.UploadDetails[0].UploadUrl, JSON.stringify(file))
            await finalizeUploadFiles(user.EntityToken.EntityToken,
                {
                    Entity: {Id: user.EntityToken.Entity.Id, Type: user.EntityToken.Entity.Type},
                    FileNames:[filename],
                    ProfileVersion:initres.ProfileVersion,
            })

            console.log('file upload success')
        }
        catch(e){
            console.log('upload error')
            await abortFileUploads(user.EntityToken.EntityToken,{
                Entity: {Id: user.EntityToken.Entity.Id, Type: user.EntityToken.Entity.Type},
                FileNames:[filename],
              })
        }
    }




}


