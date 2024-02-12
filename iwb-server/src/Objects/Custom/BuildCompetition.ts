import path from "path";
import { queueBackup } from ".";
import { iwbManager } from "../../app.config";
import { IWBRoom } from "../../rooms/IWBRoom";
import { SERVER_MESSAGE_TYPES } from "../../utils/types";
import Web3 from 'web3';
import { generateId } from "colyseus";
import { Scene } from "../Scene";
import { getRandomIntInclusive } from "../../utils/functions";
import { Player } from "../Player";
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/ba894243397342df92a95b4df348acb3"))
const MESSAGE_ACTION = "buildCompetition"

let iwbRoom:IWBRoom

enum BUILD_TYPES {
    SIGNUP = 'signup',
    GET_SCENES = 'getscenes',
    CAST_VOTE = 'cast-vote',
    START = 'start',
    END = 'end',
    UPDATE = 'update'
}

let signupQueue:any[] = []
let signingup = false

//iwbManager.customKeys['Build Competition'].enabled

export function createBuildCompetitionRouters(router:any){
    router.get('/custom/competitions/slots/add/:auth/:slot/:parcels', (req:any, res:any) => {
        console.log('adding build slots', req.params.slot, req.params.parcels)
        //need to check auth
        if(!req.params.auth || req.params.auth !== process.env.IWB_UPLOAD_AUTH_KEY){
            res.status(200).send({valid: false, msg: "Invalid Auth"})
            return
        }
        addBuildSlot(req, res)
    });

    router.get('/custom/competitions/slots/reset/:auth/:slots', (req:any, res:any) => {
        console.log('resetting builder slots', req.params.slots)
        //need to check auth
        if(!req.params.auth || req.params.auth !== process.env.IWB_UPLOAD_AUTH_KEY){
            res.status(200).send({valid: false, msg: "Invalid Auth"})
            return
        }
        resetBuilderSlots(req, res)
    });

    router.get('/custom/competitions/slots/delete/:auth/:slot', (req:any, res:any) => {
        console.log('deleting builder slots', req.params.slot)
        if(!req.params.auth || req.params.auth !== process.env.IWB_UPLOAD_AUTH_KEY){
            res.status(200).send({valid: false, msg: "Invalid Auth"})
            return
        }
        deleteBuilderSlot(req, res)
    });

    router.get('/custom/competitions/scenes/reset/:auth/:scene', (req:any, res:any) => {
        console.log('resetting builder slots', req.params.slots)
        if(!req.params.auth || req.params.auth !== process.env.IWB_UPLOAD_AUTH_KEY){
            res.status(200).send({valid: false, msg: "Invalid Auth"})
            return
        }
        resetBuilderScenes(req, res)
    });

    router.get('/custom/competitions/add/admin/:auth/:user', (req:any, res:any) => {
        console.log('adding build admin', req.params.user)
        if(!req.params.auth || req.params.auth !== process.env.IWB_UPLOAD_AUTH_KEY){
            res.status(200).send({valid: false, msg: "Invalid Auth"})
            return
        }
        iwbManager.customKeys['Build Competition'].admins.push(req.params.user)
        res.status(200).send({valid: true, msg: "Admin Added"})
    });

    router.get('/custom/competitions/delete/admin/:auth/:user', (req:any, res:any) => {
        console.log('deleting build admin', req.params.user)
        //need to check auth
        iwbManager.customKeys['Build Competition'].admins.splice(iwbManager.customKeys['Build Competition'].admins.findIndex((admin:any)=> admin === req.params.user), 1)
        res.status(200).send({valid: true, msg: "Admin Deleted"})
    });

    router.get('/custom/competitions/get', (req:any, res:any) => {
        console.log('getting build compeition')
        res.status(200).send({valid: true, data: iwbManager.customKeys['Build Competition']})
    });

    router.get('/custom/competitions/enabled/:auth/:enabled', (req:any, res:any) => {
        console.log('setting enabled competition', req.params.enabled)
        if(!req.params.auth || req.params.auth !== process.env.IWB_UPLOAD_AUTH_KEY){
            res.status(200).send({valid: false, msg: "Invalid Auth"})
            return
        }
        iwbManager.customKeys['Build Competition'].enabled = req.params.enabled === "true" ? true : false
        res.status(200).send({valid: true, enabled: iwbManager.customKeys['Build Competition'].enabled})
        iwbRoom && iwbRoom.broadcast(SERVER_MESSAGE_TYPES.CUSTOM, 
            {action:MESSAGE_ACTION, 
                data:{
                    type:BUILD_TYPES.UPDATE, 
                    key:"enabled",
                    value:iwbManager.customKeys['Build Competition'].enabled 
                }
            }
        )
    });

    router.get('/custom/competitions/cansignup/:auth/:enabled', (req:any, res:any) => {
        console.log('setting can sign up competition', req.params.enabled)
        if(!req.params.auth || req.params.auth !== process.env.IWB_UPLOAD_AUTH_KEY){
            res.status(200).send({valid: false, msg: "Invalid Auth"})
            return
        }
        iwbManager.customKeys['Build Competition'].canSignup = req.params.enabled === "true" ? true : false
        res.status(200).send({valid: true, canSignup: iwbManager.customKeys['Build Competition'].canSignup})
        iwbRoom && iwbRoom.broadcast(SERVER_MESSAGE_TYPES.CUSTOM, 
            {action:MESSAGE_ACTION, 
                data:{
                    type:BUILD_TYPES.UPDATE, 
                    key:"canSignup",
                    value:iwbManager.customKeys['Build Competition'].canSignup 
                }
            }
        )
    });

    router.get('/custom/competitions/voting/enabled/:auth/:enabled', (req:any, res:any) => {
        console.log('setting voting enabled', req.params.enabled)
        if(!req.params.auth || req.params.auth !== process.env.IWB_UPLOAD_AUTH_KEY){
            res.status(200).send({valid: false, msg: "Invalid Auth"})
            return
        }
        iwbManager.customKeys['Build Competition'].voting = req.params.enabled === "true" ? true : false
        res.status(200).send({valid: true, enabled: iwbManager.customKeys['Build Competition'].voting})
        iwbRoom && iwbRoom.broadcast(SERVER_MESSAGE_TYPES.CUSTOM, 
            {action:MESSAGE_ACTION, 
                data:{
                    type:BUILD_TYPES.UPDATE, 
                    key:"voting",
                    value:iwbManager.customKeys['Build Competition'].voting 
                }
            }
        )
    });

    router.get('/custom/competitions/decide/:auth/', (req:any, res:any) => {
        console.log('deciding competition')
        if(!req.params.auth || req.params.auth !== process.env.IWB_UPLOAD_AUTH_KEY){
            res.status(200).send({valid: false, msg: "Invalid Auth"})
            return
        }

        iwbManager.customKeys['Build Competition'].enabled = false
        iwbRoom && iwbRoom.broadcast(SERVER_MESSAGE_TYPES.CUSTOM, 
            {action:MESSAGE_ACTION, 
                data:{
                    type:BUILD_TYPES.UPDATE, 
                    key:"enabled",
                    value:iwbManager.customKeys['Build Competition'].enabled
                }
            }
        )

        let winner = ""
        let votes = 0
        iwbManager.customKeys['Build Competition'].scenes.forEach((scene:any)=>{
            if(scene.votes.length > votes){
                votes = scene.votes.length
                winner = scene.name
            }else if(scene.votes.length === votes){
                votes = scene.votes.length
                winner += "|" + scene.name
            }
        })
        res.status(200).send({valid: true, winner:winner})
        iwbRoom && iwbRoom.broadcast(SERVER_MESSAGE_TYPES.CUSTOM, 
            {action:MESSAGE_ACTION, 
                data:{
                    type:BUILD_TYPES.UPDATE, 
                    key:"decide",
                    winner:winner,
                    votes: votes
                }
            }
        )
    });

    router.post('/custom/competitions/scenes/add/:auth/', (req:any, res:any) => {
        console.log('adding builder to competition', req.params.slot, req.params.parcels)
        if(!req.params.auth || req.params.auth !== process.env.IWB_UPLOAD_AUTH_KEY){
            res.status(200).send({valid: false, msg: "Invalid Auth"})
            return
        }
        addScene(req, res)
    });

    router.get('/custom/competitions/queue/nudge/:auth/', (req:any, res:any) => {
        console.log('adding build slots', req.params.slot, req.params.parcels)
        //need to check auth
        if(!req.params.auth || req.params.auth !== process.env.IWB_UPLOAD_AUTH_KEY){
            res.status(200).send({valid: false, msg: "Invalid Auth"})
            return
        }
        checkSignupQueue()
        res.status(200).send({valid: true})
    });

    router.get('/custom/competitions/queue/enable/:auth/', (req:any, res:any) => {
        console.log('adding build slots', req.params.slot, req.params.parcels)
        //need to check auth
        if(!req.params.auth || req.params.auth !== process.env.IWB_UPLOAD_AUTH_KEY){
            res.status(200).send({valid: false, msg: "Invalid Auth"})
            return
        }
        signingup = false
        res.status(200).send({valid: true})
    });
}

function checkSignupQueue(admin?:boolean){
    console.log('signup queue is', signingup)
    if(signupQueue.length > 0 && !signingup){
        signingup = true
        let user = signupQueue.shift()
        signUpUser(user, admin)
    }
}

export function createBuildCompetition(room:IWBRoom){
    iwbRoom = room

    room.onMessage(SERVER_MESSAGE_TYPES.CUSTOM, async(client, info)=>{
        console.log(SERVER_MESSAGE_TYPES.CUSTOM + " received", info)
        if(info.action === MESSAGE_ACTION){
            handleAction(client, info)
        }
    })
}

export function destroyBuildCompetition(room:IWBRoom){

}

async function addScene(req:any, res:any){
    try{
        handleSignUp({userData: {userId:req.body.user, displayName: req.body.name}}, {} , true)
        res.status(200).send({valid: true})
    }
    catch(e){
        console.log('error adming signup', req.body.user)
        res.status(200).send({valid: false, msg: "Signup Erro"})
    }
}

function addBuildSlot(req:any, res:any){
    if(!iwbManager.customKeys['Build Competition'].slots.find((bs:any)=>bs.slot === req.params.slot)){
        iwbManager.customKeys['Build Competition'].slots.push({
            slot:req.params.slot,
            available:true,
            name:"",
            builder:"",
            parcels: req.params.parcels.split('|')
        })
        res.status(200).send({valid: true, msg: "Builder Slot Added"})
    }else{
        res.status(200).send({valid: false, msg: "Already Created Slot!"})
    }
}

function resetBuilderSlots(req:any, res:any){
    if(req.params.slots === "all"){
        iwbManager.customKeys['Build Competition'].slots.forEach((slot:any)=>{
            resetBuilderSlot(slot)
        })
    }else{
        let slots = req.params.slots.split(",")
        slots.forEach((slot:any) => {
            if(iwbManager.customKeys['Build Competition'].slots.find((bs:any)=> bs.slot === slot)){
                resetBuilderSlot(slot)
            }
        });
    }
    res.status(200).send({valid: true, msg: "Builder Slot(s) Reset"})
}

function resetBuilderSlot(slot:any){
    slot.available = true
    slot.name = ""
    slot.builder = ""
}

function resetBuilderScenes(req:any, res:any){
    if(req.params.slots === "all"){
        iwbManager.customKeys['Build Competition'].scenes.length = 0
    }else{
        let sceneIndex = iwbManager.customKeys['Build Competition'].scenes.findIndex((scene:any)=>scene.builder === req.params.scene)
        iwbManager.customKeys['Build Competition'].scenes.splice(sceneIndex, 1)
    }
    res.status(200).send({valid: true, msg: "Builder Scene Reset"})
}

function deleteBuilderSlot(req:any, res:any){
    let index = iwbManager.customKeys['Build Competition'].slots.findIndex((bs:any)=> bs.slot === req.params.slot)
    if(index >=0){
        iwbManager.customKeys['Build Competition'].slots.splice(index,1)
        res.status(200).send({valid: true, msg: "Builder Slot Deleted"})
    }else{
        res.status(200).send({valid: true, msg: "Builder Slot does not exist"})
    }
}

function handleAction(client:any, info:any){
    switch(info.data.type){
        case BUILD_TYPES.SIGNUP:
            handleSignUp(client, info)
            break;

        case BUILD_TYPES.GET_SCENES:
            client.send(SERVER_MESSAGE_TYPES.CUSTOM, 
                {
                    action:MESSAGE_ACTION, 
                    data:{
                        type:info.data.type, 
                        value:iwbManager.customKeys['Build Competition']
                    }
                }
            )
            break;

        case BUILD_TYPES.CAST_VOTE:
            castVote(client, info)
            break;

        case BUILD_TYPES.START:
            startCompetition(client)
            break;

        case BUILD_TYPES.END:
            endCompetition(client)
            break;
    }
}

async function handleSignUp(client:any, info:any, admin?:boolean){
    console.log('handling sign up for ', client.userData.displayName, client.userData.userId)
    try{
        // let add = web3.eth.accounts.recover(info.data.message, info.data.signature);
        // console.log('message is', add)
        if(iwbRoom || admin){
        // if((iwbRoom && iwbRoom.state.players.has(client.userData.userId)) || admin){
            if(admin){}
            else{
                console.log("room exists so let them sign up")
                let player:Player = iwbRoom.state.players.get(client.userData.userId)
                console.log('player data is', player.dclData)
                // if(!player.dclData.hasConnectedWeb3){
                //     client.send(SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, "Only Web3 wallets are eligible")
                //     return
                // }
            }
            signupQueue.push(client)
            checkSignupQueue(admin)
        }else{
            console.log('player is not on colyseus server', client.userData.userId)
            client.send(SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, "Our server cannot detect your presence. Refresh and try agian.")
        }
    }
    catch(e){
        console.log('error recovering signature', e)
    }
}

async function signUpUser(client:any, admin?:boolean){
    console.log('admin is', admin)
    if(!iwbManager.customKeys['Build Competition'].scenes.find((scene:any)=> scene.builder === client.userData.userId)){
        let competitionScene:any = {
            builder: client.userData.userId,
            name: client.userData.displayName,
            votes:[]
        }
        
        let sceneId = await assignLocation(client)
        if(sceneId !== null){
            iwbManager.customKeys['Build Competition'].scenes.push(competitionScene)
            if(admin){}
            else{
                if(admin){}
                else{
                    client.send(SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, "You have registered for the Builder Competition! You will be assigned a 2x2 scene inside the BuilderWorld realm.")
                }
                iwbRoom.broadcast(SERVER_MESSAGE_TYPES.CUSTOM, 
                    {action:MESSAGE_ACTION, 
                        data:{
                            type:BUILD_TYPES.SIGNUP, 
                            sceneId:sceneId,
                            competitionScene:competitionScene
                        }
                    }
                )
            }
            queueBackup()
        }else{
            console.log('no more open slots for registration', client.userData.displayName, client.userData.userId)
            if(admin){}
            else{
                client.send(SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, "There are no more open slots for the competition! You are on the wait list to be added manually.")
            }
            iwbManager.customKeys['Build Competition'].pending.push({builder:client.userData.userId, name:client.userData.displayName})
        }
    }else{
        console.log('player has already registered', client.dclData.userId)
        if(admin){}
        else{
            client.send(SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, "You have already registered for the Builder Competition.")
        }
    }
    signingup = false
    checkSignupQueue()
}

function castVote(client:any, info:any){
    if(!iwbManager.customKeys['Build Competition'].voting){
        client.send(SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, "Voting is disabled.")
        return
    }

    let player = iwbRoom.state.players.get(client.userData.userId)
    if(!player || !player.dclData.hasConnectedWeb3){
        client.send(SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, "Invalid Player. Cannot Vote.")
        return
    }

    let votes = 0
    let scenes = [...iwbManager.customKeys['Build Competition'].scenes]
    
    scenes.forEach((scene:any)=>{
        votes += scene.votes.filter((v:any)=> v === client.userData.userId).length
    })

    if(votes < 3){
        let sceneToVote = iwbManager.customKeys['Build Competition'].scenes.find((scene:any)=> scene.name === info.data.builder)
        if(sceneToVote){
            console.log('scene to vote is', sceneToVote)
            if(sceneToVote.builder === client.userData.userId){
                console.log('trying to vote for yourself')
                client.send(SERVER_MESSAGE_TYPES.CUSTOM, 
                    {action:MESSAGE_ACTION, 
                        data:{
                            type:info.data.type, 
                            vote:0,
                            voteSelf:true
                        }
                    }
                )
            }else{
                console.log('voting for someone else')
                sceneToVote.votes ? sceneToVote.votes.push(client.userData.userId) : sceneToVote.votes = [client.userData.userId]
                
                client.send(SERVER_MESSAGE_TYPES.CUSTOM, 
                    {action:MESSAGE_ACTION, 
                        data:{
                            type:info.data.type, 
                            vote:1,
                            builder:sceneToVote.name,
                        }
                    }
                )
            }
        }
    }else{
        client.send(SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, "You have no more votes to cast.")
    }

}

function assignLocation(client:any){
    let randomAssignment = getRandomAssignment(client)
    if(randomAssignment !== null){
        let world = iwbManager.worlds.find((w)=>w.ens === iwbRoom.state.world)
        if(world){
            world.builds += 1
            world.updated = Math.floor(Date.now()/1000)
        }

        let scene:Scene = createScene(iwbRoom.state.world, {world:world, name: client.userData.displayName, builder:client.userData.userId}, randomAssignment)
        iwbRoom.state.scenes.set(scene.id, scene)
    
        randomAssignment.forEach((parcel:any)=>{
            iwbRoom.state.occupiedParcels.push(parcel)
        })
        return scene.id
    }else{
        return null
    }
}

function getRandomAssignment(client:any){
    let availableSlots = iwbManager.customKeys['Build Competition'].slots.filter((ass:any)=> ass.available)
    if(availableSlots.length > 0){
        let rand = getRandomIntInclusive(0, availableSlots.length-1)
        availableSlots[rand].available = false
        availableSlots[rand].name = client.userData.displayName
        availableSlots[rand].builder = client.userData.userId

        return availableSlots[rand].parcels
    }else{
        return null
    }
}

function createScene(world:string, info:any, parcels:string[]){
    return new Scene({
        w: world,
        id: "" + generateId(5),
        im: "",
        n: info.name,
        d: "IWB Builder Competition",
        o: info.world.owner,
        ona: info.world.name,
        cat:"",
        bps:[info.builder],
        bpcl: parcels[0],
        cd: Math.floor(Date.now()/1000),
        upd: Math.floor(Date.now()/1000),
        si: 0,
        toc:0,
        pc: 0,
        pcnt: parcels.length,
        isdl: false,
        e:true,
        pcls:parcels,
        sp:["0,0,0"],
        cp:["0,0,0"],
        priv:false
    })
}

function startCompetition(client:any){

}

function endCompetition(client:any){

}