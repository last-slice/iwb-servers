import { generateId } from "colyseus";
import { ActionComponent, Actions, Color4, DialogButtonComponent, DialogInfoComponent, RewardComponent, TriggerActionComponent, TriggerComponent, Triggers } from "../../Objects/Components";
import { ACTIONS, COMPONENT_TYPES, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { IWBRoom } from "../IWBRoom";
import { Player } from "../../Objects/Player";

export let updateItemComponentFunctions:any = {
    [COMPONENT_TYPES.VISBILITY_COMPONENT]:(asset:any, info:any)=>{updateVisiblityComponent(asset, info)},
    [COMPONENT_TYPES.MATERIAL_COMPONENT]:(asset:any, info:any)=>{updateMaterialComponent(asset, info)},
    [COMPONENT_TYPES.COLLISION_COMPONENT]:(asset:any, info:any)=>{updateCollisionComponent(asset, info)},
    [COMPONENT_TYPES.IMAGE_COMPONENT]:(asset:any, info:any)=>{updateImageComponent(asset, info)},
    [COMPONENT_TYPES.VIDEO_COMPONENT]:(asset:any, info:any)=>{updateVideoComponent(asset, info)},
    [COMPONENT_TYPES.AUDIO_COMPONENT]:(asset:any, info:any)=>{updateAudioComponent(asset, info)},
    [COMPONENT_TYPES.NFT_COMPONENT]:(asset:any, info:any)=>{updateNFTComponent(asset, info)},
    [COMPONENT_TYPES.TEXT_COMPONENT]:(asset:any, info:any)=>{updateTextComponent(asset, info)},
    [COMPONENT_TYPES.TRIGGER_COMPONENT]:(asset:any, info:any, room?:IWBRoom)=>{updateTriggerComponent(asset, info, room)},
    [COMPONENT_TYPES.ACTION_COMPONENT]:(asset:any, info:any, room?:IWBRoom)=>{updateActionComponent(asset, info, room)},
    [COMPONENT_TYPES.TRIGGER_AREA_COMPONENT]:(asset:any, info:any, room?:IWBRoom)=>{updateTriggerAreaComponent(asset, info, room)},
    [COMPONENT_TYPES.ANIMATION_COMPONENT]:(asset:any, info:any)=>{updateAnimationComponent(asset, info)},
    [COMPONENT_TYPES.NPC_COMPONENT]:(asset:any, info:any)=>{updateNPCComponent(asset, info)},
    [COMPONENT_TYPES.DIALOG_COMPONENT]:(asset:any, info:any)=>{updateDialogComponent(asset, info)},
    [COMPONENT_TYPES.REWARD_COMPONENT]:(asset:any, info:any, room?:IWBRoom, player?:Player)=>{updateRewardComponent(asset, info, player)},
    [SERVER_MESSAGE_TYPES.UPDATE_ASSET_LOCKED]:(asset:any, info:any)=>{updateBuildLock(asset, info)},
    [SERVER_MESSAGE_TYPES.UPDATE_ASSET_BUILD_VIS]:(asset:any, info:any)=>{updateBuildVis(asset, info)},
}

function updateVisiblityComponent(asset:any, info:any){
    asset.visComp.visible = !asset.visComp.visible
}

function updateImageComponent(asset:any, info:any){
    asset.imgComp.url = info.data.url
}

function updateVideoComponent(asset:any, info:any){
    // console.log('updating video component', info);

    switch(info.data.type){
        case 'url':
            asset.vidComp.url = info.data.value
            break;

        case 'loop':
            asset.vidComp.loop = info.data.value
            break;

        case 'autostart':
            asset.vidComp.autostart = info.data.value
            break;

        case 'volume':
            asset.vidComp.volume = info.data.value
            break;
    }
}

function updateAudioComponent(asset:any, info:any){
   //  console.log('updating audio component', info);
    
    switch(info.data.type){
        case 'url':
            asset.audComp.url = info.data.value
            break;

        case 'attach':
            asset.audComp.attachedPlayer = !asset.audComp.attachedPlayer
            break;

        case 'loop':
            asset.audComp.loop = info.data.value
            break;

        case 'autostart':
            asset.audComp.autostart = info.data.value
            break;

        case 'volume':
            asset.audComp.volume = info.data.value
            break;
    }
    
}

function updateMaterialComponent(asset:any, info:any){
  //  console.log('data is', info)
    switch(info.data.type){
        case 'enabled':
            asset.matComp.emiss = info.data.value
            if(info.data.type){
                asset.matComp.emissColor.push("1", "1", "1", "1")
            }else{
                asset.matComp.emissColor.length = 0
            }
        break;

        case 'metallic':
            // console.log('updating metallic', info.data.value)
            asset.matComp.metallic = info.data.value
        break;

        case 'emissPath':
            // console.log('updating emissPath', info.data.value)
            asset.matComp.emissPath = info.data.value
        break;

        case 'emissInt':
            // console.log('updating emissInt', info.data.value)
            asset.matComp.emissInt = info.data.value
        break;

        case 'type':
            // console.log('updating type', info.data.value)
            asset.matComp.type = info.data.value
        break;
    }
}

function updateCollisionComponent(asset:any, info:any){
    if(info.data.layer === 'iMask'){
        asset.colComp.iMask = info.data.value
    }else{
        asset.colComp.vMask = info.data.value
    }
}

function updateNFTComponent(asset:any, info:any){
    switch(info.data.type){
        case 'chain':
            asset.nftComp.chain = info.data.value
            break;

        case 'style':
            asset.nftComp.style = info.data.value
            break;

        case 'contract':
            asset.nftComp.contract = info.data.value
            break;

        case 'tokenId':
            asset.nftComp.tokenId = info.data.value
            break;
    }
}

function updateTextComponent(asset:any, info:any){
    switch(info.data.type){
        case 'text':
            asset.textComp.text = info.data.value
            break;

        case 'font':
            asset.textComp.font = info.data.value
            break;
            
        case 'fontSize':
            asset.textComp.fontSize = parseInt(info.data.value)
            break;

        case 'color':
            asset.textComp.color = new Color4()
            asset.textComp.color.r = info.data.value.r
            asset.textComp.color.g = info.data.value.g
            asset.textComp.color.b = info.data.value.b
            asset.textComp.color.a = info.data.value.a
            break;

        case 'align':
            asset.textComp.align = info.data.value
            break;
    }
}

function updateTriggerComponent(asset:any, info:any, room:IWBRoom){
    let scene:any
    scene = room.state.scenes.get(info.data.sceneId)

    switch(info.data.type){
        case 'enabled':
            asset.trigComp.enabled = info.data.value
            break;

        case 'new':        
            if(scene){
                // let actionAsset:any
                // scene.ass.forEach((asset:any, i:number)=>{
                //     if(asset.actComp && asset.actComp.actions.has(info.data.value.action)){
                //         actionAsset = asset
                //         return
                //     }
                // })

                // let triggerAction = new TriggerActionComponent()
                // triggerAction.aid = actionAsset.aid
                // triggerAction.id = info.data.value.action

                let trigger = new Triggers()
                // trigger.actions.push(triggerAction)
                trigger.pointer = info.data.value.pointer
                trigger.type = info.data.value.type
    
                if(!asset.trigComp){
                    asset.trigComp = new TriggerComponent()
                }
                asset.trigComp.triggers.push(trigger)
            }
            break;

        case 'add':        
            if(scene){
                let actionAsset:any
                scene.ass.forEach((asset:any, i:number)=>{
                    if(asset.actComp && asset.actComp.actions.has(info.data.value.action)){
                        actionAsset = asset
                        return
                    }
                })

                if(actionAsset){
                    let trigger = asset.trigComp.triggers.find((t:any)=>t.type === info.data.value.type && t.pointer === info.data.value.pointer)
                    if(trigger){
                        // console.log('found trigger for that type')
                        let triggerAction = new TriggerActionComponent()
                        triggerAction.aid = actionAsset.aid
                        triggerAction.id = info.data.value.action
                        trigger.actions.push(triggerAction)
                    }
                }
            }
            break;

        case 'delete':
            if(scene){
                let trigger = asset.trigComp.triggers.find((t:any)=>t.type === info.data.value.type)
                if(trigger){
                    trigger.actions.splice(info.data.value.action, 1)
                }
            }
            break;

        case 'text':
            if(scene){
                let trigger = asset.trigComp.triggers.find((t:any)=>t.type === info.data.value.type)
                if(trigger){
                    trigger.hoverText = info.data.value.text
                }
            }
            break;

         case 'distance':
            if(scene){
                let trigger = asset.trigComp.triggers.find((t:any)=>t.type === info.data.value.type)
                if(trigger){
                    trigger.distance = info.data.value.distance
                }
            }
            break;

        case 'remove':
            if(asset.trigComp){
                asset.trigComp.triggers.splice(info.data.value, 1)
            }
            break;
    }
}

function updateActionComponent(asset:any, info:any, room:IWBRoom){
    let scene:any
    scene = room.state.scenes.get(info.data.sceneId)

    switch(info.action){
        case 'add':
            // console.log('show action', info.data.value.action)

            let action = new Actions()
            action.aid = info.data.value.action.aid
            action.name = info.data.value.name
            action.type = info.data.value.action.type

            switch(info.data.value.action.type){
                case ACTIONS.OPEN_LINK:
                    action.url = info.data.value.action.url
                    break;

                case ACTIONS.PLAY_AUDIO:
                case ACTIONS.PLAY_VIDEO:
                case ACTIONS.TOGGLE_VIDEO:
                break;

                case ACTIONS.PLAY_ANIMATION:
                    action.animName = info.data.value.action.animName
                    action.animLoop = info.data.value.action.animLoop
                    break;

                case ACTIONS.TELEPORT_PLAYER:
                    action.teleport = info.data.value.action.location
                    action.teleCam = info.data.value.action.camera
                    break;

                case ACTIONS.EMOTE:
                    action.emote = info.data.value.action.emote
                    break;

                case ACTIONS.SET_VISIBILITY:
                    action.vis = info.data.value.action.vis === 0 ? true : false
                    action.vMask = info.data.value.action.vMask
                    action.iMask = info.data.value.action.iMask
                    break;

                case ACTIONS.SHOW_TEXT:
                    action.showText = info.data.value.action.text.text
                    action.showSize = info.data.value.action.text.size
                    action.showTimer = info.data.value.action.text.timer
                    action.showPos = info.data.value.action.text.pos
                    break;

                case ACTIONS.HIDE_TEXT:
                    break;

                case ACTIONS.START_DELAY:
                    action.startDTimer = info.data.value.action.delay.timer
                    action.startDId = info.data.value.action.delay.id
                    break;

                case ACTIONS.SHOW_DIALOG:
                    action.dialID = info.data.value.action.dialID
                    break;

                case ACTIONS.START_TWEEN:
                    console.log('adding tween action', info.data.value.action.tween)
                    action.twT = info.data.value.action.tween.type
                    action.twE = info.data.value.action.tween.ease
                    action.twD = info.data.value.action.tween.duration
                    action.twL = info.data.value.action.tween.loop
                    action.twEX = info.data.value.action.tween.end.x
                    action.twEY = info.data.value.action.tween.end.y
                    action.twEZ = info.data.value.action.tween.end.z
                    break;

                    case ACTIONS.SHOW_DIALOG:
                        action.dialID = info.data.value.action.dialID
                        break;

            }
            asset.actComp.actions.set(generateId(5), action)
            break;

        case 'delete':
          //   console.log('deletint action')
            if(asset.actComp){
               //  console.log('asset has action component')
                asset.actComp.actions.forEach((action:any, key:any)=>{
                  //   console.log('asset action is', key, action)
                    if(action.name === info.data.value.name){
                        asset.actComp.actions.delete(key)
                        if(scene){
                           //  console.log('we found scene pertaining to asset')
                            scene.ass.forEach((asset:any, i:number)=>{
                                //check if asset has trigger component
                                if(asset.trigComp){
                                    asset.trigComp.triggers.forEach((trigger:any, i:number)=>{
                                        trigger.actions = trigger.actions.filter((actions:any)=> actions.id !== key)
                                    })
                                }

                                //check if asset has trigger area component
                                if(asset.trigArComp){
                                    asset.trigArComp.eActions = asset.trigArComp.eActions.filter((actions:any)=> actions.id !== key)
                                    asset.trigArComp.lActions = asset.trigArComp.lActions.filter((actions:any)=> actions.id !== key)
                                }
                            })
                        }
                    }
                })
            }
            break;
    }
}

function updateTriggerAreaComponent(asset:any, info:any, room:IWBRoom){
    let scene = room.state.scenes.get(info.data.sceneId)

    switch(info.action){
        case 'toggle':
            asset.trigArComp.enabled = !asset.trigArComp.enabled
            break;

        case 'add':
           //  console.log('adding new trigger area action', info.data)
            if(scene){
                let actionAsset:any
                scene.ass.forEach((asset, i)=>{
                    if(asset.actComp && asset.actComp.actions.has(info.data.value.action)){
                        actionAsset = asset
                        return
                    }
                })

               //  console.log('acction asset is', actionAsset)

                let triggerAction = new TriggerActionComponent()
                triggerAction.aid = actionAsset.aid
                triggerAction.id = info.data.value.action

                switch(info.data.value.type){
                    case 'eActions':
                        asset.trigArComp.eActions.push(triggerAction)
                        break;

                    case 'lActions':
                        asset.trigArComp.lActions.push(triggerAction)
                        break;
                }

            }
            break;

        case 'delete':
            // console.log('deleting action', info.data.value)
            if(asset.trigArComp){
                let array:any[] = info.data.value.type === "eActions" ? asset.trigArComp.eActions : asset.trigArComp.lActions
                let index = array.findIndex((act:any)=> act.aid === info.data.value.action.aid)
                // console.log('action index to delete is', index)
                array.splice(index,1)
            }
            break;
    }
}

function updateAnimationComponent(asset:any, info:any){
   //  console.log('updating animation component', info);
    
    switch(info.data.type){
        case 'autoloop':
            asset.animComp.autoloop = info.data.value
            break;

        case 'autostart':
            asset.animComp.autostart = info.data.value
            break;

        case 'startIndex':
            asset.animComp.startIndex = info.data.value
            break;
    }
    
}

function updateBuildLock(asset:any, info:any){
    asset.locked = !asset.locked
}

function updateBuildVis(asset:any, info:any){
    asset.buildVis = !asset.buildVis
}

function updateNPCComponent(asset:any, info:any){
    let data = info.data.value
    
    switch(info.type){
        case 'update':
            asset.npcComp.change++

            asset.npcComp.name = data.name
            asset.npcComp.dName = data.dName
            asset.npcComp.bodyShape = data.bodyShape

            asset.npcComp.eyeColor.r = data.eyeColor.r
            asset.npcComp.eyeColor.g = data.eyeColor.g
            asset.npcComp.eyeColor.b = data.eyeColor.b

            asset.npcComp.hairColor.r = data.hairColor.r
            asset.npcComp.hairColor.g = data.hairColor.g
            asset.npcComp.hairColor.b = data.hairColor.b

            asset.npcComp.skinColor.r = data.skinColor.r
            asset.npcComp.skinColor.g = data.skinColor.g
            asset.npcComp.skinColor.b = data.skinColor.b

            asset.npcComp.wearables.length = 0
            data.wearables.forEach((wearable:string)=>{
                asset.npcComp.wearables.push(wearable)
            })

            break;

        case 'wDelete':
            asset.npcComp.change++
            asset.npcComp.wearables.splice(data, 1)
            break;

        case 'wAdd':
            asset.npcComp.change++
            asset.npcComp.wearables.push(data)
            break;
    }
    
}

function updateDialogComponent(asset:any, info:any){
    console.log('new dialog is', info,info.data.value.dialog)
    
    switch(info.type){
        case 'new':
            let dialog = new DialogInfoComponent()
            dialog.text = info.data.value.dialog.text
            if(info.data.value.dialog.buttons){
                info.data.value.dialog.buttons.forEach((buttonData:any)=>{
                    let button = new DialogButtonComponent()
                    button.label = buttonData.label
                    buttonData.actions.forEach((action:any)=>{
                        button.actions.push(action.id)
                    })
                    dialog.buttons.push(button)
                })
            }
            asset.dialComp.dialogs.push(dialog)
            break;

        case 'remove':
            asset.dialComp.dialogs.splice(info.data.value.index, 1)
            break;
    }
}

function updateRewardComponent(asset:any, info:any, player:Player){
    console.log('new reward is', info,info.data.value.dialog)
    
    switch(info.data.type){
        case 'update':
            asset.rComp = new RewardComponent()
            asset.rComp.id = generateId(5)
            asset.rComp.type = info.data.value.type
            asset.rComp.start = info.data.value.start
            asset.rComp.end = info.data.value.end
            asset.rComp.ip = info.data.value.ip
            asset.rComp.amt = info.data.value.amt
            asset.rComp.key = info.data.value.key

            console.log('rweard asset is', asset.rComp)
            break;
    }
}