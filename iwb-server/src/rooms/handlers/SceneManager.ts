import { IWBRoom } from "../IWBRoom"
import { abortFileUploads, finalizeUploadFiles, initializeUploadPlayerFiles, playerLogin, uploadPlayerFiles } from "../../utils/Playfab"
import { Scene } from "../../Objects/Scene"
import { iwbManager } from "../../app.config"

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

        // let backupInterval = setInterval(async()=>{
        //     if(this.modified){
        //         await setTitleData({Key:"Scenes", Value: JSON.stringify(this.scenes)})
        //         this.modified = false
        //     }
        // }, 1000 * 30)

        this.initServerScenes()
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
                            console.log('realm scenes are ', realmScenes)
                            iwbManager.fetchRealmScenes(realmScenes)
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

    loadRealmScenes(scenes:any[]){
        let filter = scenes.filter((scene)=> scene.w === this.room.state.world)
        filter.forEach((scene)=>{
            this.room.state.scenes.set(scene.id, new Scene(scene))
        })
    }

    async saveRealmScenes(){
        let scenes:Scene[] = []
        this.room.state.scenes.forEach((scene)=>{
            scene.ass.forEach((asset)=>{
                asset.editing = false
                asset.editor = ""
            })
            scenes.push(scene)
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
