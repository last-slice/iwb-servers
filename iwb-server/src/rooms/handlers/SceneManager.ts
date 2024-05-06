import { IWBRoom } from "../IWBRoom"
import { abortFileUploads, fetchPlayfabFile, fetchPlayfabMetadata, finalizeUploadFiles, initializeUploadPlayerFiles, playerLogin, playfabLogin, uploadPlayerFiles } from "../../utils/Playfab"
import { Scene, SceneItem } from "../../Objects/Scene"
import { iwbManager } from "../../app.config"
import { SERVER_MESSAGE_TYPES } from "../../utils/types"
import { Player } from "../../Objects/Player"

export class RoomSceneManager {
    room:IWBRoom

    realm:string = ""
    version:number = 0
    // scenes: Scene[] = []
    occupiedParcels: string[] = []
    reservedParcels: string[] = ["0,0", "0,1", "1,0", "1,1"]

    backupQueue:any[] = []
    backingUp:boolean = false
    modified:boolean = false

    realmToken:string
    realmId:string
    realmTokenType:string

    constructor(room:IWBRoom, realm:string) {
        this.room = room
        this.realm = realm

        try{
            // let backupInterval = setInterval(async()=>{
            //     if(this.modified){
            //         await setTitleData({Key:"Scenes", Value: JSON.stringify(this.scenes)})
            //         this.modified = false
            //     }
            // }, 1000 * 30)

            this.room.state.cv = iwbManager.worlds.find((w:any)=> w.ens === this.room.state.world).cv

            //  console.log('room cv is', this.room.state.cv)
            // console.log('world cv is', iwbManager.worlds.find((w:any)=> w.ens === this.room.state.world).cv)
    
            this.initServerScenes()
            this.initServerAssets()
        }
        catch(e){
            console.log('error with init scene manager', e)
        }
    }

    initServerScenes(){
        if(iwbManager.pendingSaves.includes((this.room.state.world))){
            let timeout = setTimeout(()=>{
                clearTimeout(timeout)
                this.initServerScenes()
            }, 1000 * 1)
        }else{
            setTimeout(()=>{
                let world = iwbManager.worlds.find((w)=> w.ens === this.realm)
                if(world){
                    iwbManager.initiateRealm(world.owner)
                    .then((realmData)=>{
                        // console.log('realm data is', realmData)
                        this.realmToken = realmData.EntityToken.EntityToken
                        this.realmId = realmData.EntityToken.Entity.Id
                        this.realmTokenType = realmData.EntityToken.Entity.Type
        
                        iwbManager.fetchRealmData(realmData)
                        .then((realmScenes)=>{
                           //  console.log('realm scenes are ', realmScenes)
                            iwbManager.fetchRealmScenes(this.room.state.world, realmScenes)
                            .then((sceneData)=>{
    
                                this.loadRealmScenes(sceneData)
                            })
                        })   
                    })
                    .catch((error)=>{
                        console.log('error initating realm', error)
                    })
                }
            }, 1000)
        }
    }

    async initServerAssets(){
        let metadata = await fetchPlayfabMetadata(iwbManager.worlds.find((w:any)=> w.ens === this.room.state.world).owner)

        let catalog = await fetchPlayfabFile(metadata, "catalogs.json")
        catalog.forEach((item:any)=>{
        //   if(item.v > this.room.state.cv){
        //     item.pending = true//
        //   }
          this.room.state.realmAssets.set(item.id, item)
        })
    }

    loadRealmScenes(scenes:any[]){
        let filter = scenes.filter((scene)=> scene.w === this.room.state.world)
        this.room.state.sceneCount = filter.length

        filter.forEach((scene)=>{
            this.room.state.scenes.set(scene.id, new Scene(scene, this.room))
        })
    }

    async saveRealmScenes(){
        let scenes:any[] = []
        this.room.state.scenes.forEach((scene:Scene)=>{
            let jsonScene:any = scene.toJSON()
            jsonScene.ass = []

            scene.ass.forEach((asset:any)=>{

                asset.editing = false
                asset.editor = ""

                // let ass:any = asset.toJSON()
                // ass.editing = false
                // ass.editor = ""//

               let jsonAsset:any = this.checkAssetCacheStates(asset)
               jsonScene.ass.push(jsonAsset)
            })
            scenes.push(jsonScene)
        })

        let world = iwbManager.worlds.find((w)=>w.ens === this.room.state.world)
        if(world){
            world.builds = scenes.length
            world.updated = Math.floor(Date.now()/1000)
        }

        if(scenes.length > 0){
            iwbManager.backupScene(this.room.state.world, this.realmToken, this.realmTokenType, this.realmId, scenes)
        }
    }

    checkAssetCacheStates(asset:SceneItem){
        let item:any = asset.toJSON()
        if(asset.rComp){
            item.rComp.id = asset.rComp.id
            item.rComp.start = asset.rComp.start
            item.rComp.end = asset.rComp.end
            item.rComp.ip = asset.rComp.ip
            item.rComp.amt = asset.rComp.amt
            item.rComp.key = asset.rComp.key
            item.rComp.claims = asset.rComp.claims
        }

        console.log('checking asset cached variables are now', item)

        return item
    }

    // async saveWorldScenes(scenes:Map<string, Scene>){
    //     scenes.forEach((scene:Scene, key)=>{
    //         let sceneIndex = this.scenes.findIndex((sc:any) =>sc.id === scene.id)
    //         if(sceneIndex >= 0){
    //             this.scenes[sceneIndex] = scene
    //         }else{
    //             this.scenes.push(scene)
    //         }
    //         this.modified = true
    //     })

    //     console.log('saved world scenes', this.scenes)
    // }

    // addNewScene(scene:Scene){
    //     this.room.state.scenes.set(scene, s)
    // }
}




// console.log('res is',res.data)
// let data = res.data.data
// let metadata = data.Metadata

// for (const key in metadata) {
//     if (metadata.hasOwnProperty(key)) {
//       console.log(key, metadata[key]);
//       let res = await fetch( metadata[key].DownloadUrl)
//       let json = await res.json()
//       console.log('file is', json)
//       json = []

//       let initres = await initializeUploadPlayerFiles(client.auth.EntityToken.EntityToken,{
//         Entity: {Id: client.auth.EntityToken.Entity.Id, Type: client.auth.EntityToken.Entity.Type},
//         FileNames:[key]
//       })
//       console.log('init res is', initres)
//       console.log('init upload url is', initres.UploadDetails[0])

//     //   await abortFileUploads(client.auth.EntityToken.EntityToken,{
//     //     Entity: {Id: client.auth.EntityToken.Entity.Id, Type: client.auth.EntityToken.Entity.Type},
//     //     FileNames:[key]
//     //   })

//       let uploadres = await uploadPlayerFiles(initres.UploadDetails[0].UploadUrl, JSON.stringify(json))
//         console.log('upload res is', uploadres)

//         let finalres = await finalizeUploadFiles(client.auth.EntityToken.EntityToken,
//             {
//             Entity: {Id: client.auth.EntityToken.Entity.Id, Type: client.auth.EntityToken.Entity.Type},
//             FileNames:[key],
//             ProfileVersion:initres.ProfileVersion,
//           })
//           console.log('final res upload is', finalres)
