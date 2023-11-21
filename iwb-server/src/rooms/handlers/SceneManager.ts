import axios from "axios"
import { IWBRoom } from "../IWBRoom"
import { playerLogin } from "../../utils/Playfab"
import { Scene } from "../../Objects/Scene"

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
        setTimeout(()=>{
            this.initiateRealm()
            .then((realmData)=>{
                console.log('realm data is', realmData)
                this.fetchRealmData(realmData)
                .then((realmScenes)=>{
                    console.log('realm scenes are ', realmScenes)
                    this.fetchRealmScenes(realmScenes)
                    .then((sceneData)=>{
                        this.loadRealmScenes(sceneData)
                    })
                })   
            })
            .catch((error)=>{
                console.log('error initating realm', error)
            })
        }, 1000)

    }

    async initiateRealm(){
        try{
            const playfabInfo = await playerLogin(
              {
                CreateAccount: true, 
                ServerCustomId: this.realm,
                InfoRequestParameters:{
                  "UserDataKeys":[], "UserReadOnlyDataKeys":[],
                  "GetUserReadOnlyData":false,
                  "GetUserInventory":false,
                  "GetUserVirtualCurrency":true,
                  "GetPlayerStatistics":false,
                  "GetCharacterInventories":false,
                  "GetCharacterList":false,
                  "GetPlayerProfile":true,
                  "GetTitleData":false,
                  "GetUserAccountInfo":true,
                  "GetUserData":false,
              }
              })
        
            if(playfabInfo.error){
              console.log('playfab login error => ', playfabInfo.error)
              return null
            }
            else{
              console.log('playfab login success, initiate realm')
              return playfabInfo
            }
          }
          catch(e){
            console.log('playfab connection error', e)
            return null
          }
    }

    async fetchRealmData(realmData:any){
        let response = await axios.post("https://" + process.env.PLAYFAB_ID + ".playfabapi.com/File/GetFiles", 
        {Entity: {Id: realmData.EntityToken.Entity.Id, Type: realmData.EntityToken.Entity.Type}},
        {headers:{
            'content-type': 'application/json',
            'X-EntityToken': realmData.EntityToken.EntityToken}}
        )
        return response.data
    }

    async fetchRealmScenes(realmScenes:any){
        if(realmScenes.code === 200){
            this.version = realmScenes.data.ProfileVersion
            if(this.version > 0){
                let metadata = realmScenes.data.Metadata
                let res = await fetch( metadata['scenes.json'].DownloadUrl)
                let json = await res.json()
                return json
            }else{
                return []
            }
        }
    }

    loadRealmScenes(scenes:any[]){
        scenes.forEach((scene)=>{
            this.room.state.scenes.set(scene.id, new Scene(scene))
        })
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