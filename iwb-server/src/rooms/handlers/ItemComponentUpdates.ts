import { generateId } from "colyseus";
import { ActionComponent, Actions, Color4, TriggerActionComponent, TriggerComponent, Triggers } from "../../Objects/Components";
import { ACTIONS, COMPONENT_TYPES } from "../../utils/types";
import { IWBRoom } from "../IWBRoom";

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
    [COMPONENT_TYPES.ACTION_COMPONENT]:(asset:any, info:any)=>{updateActionComponent(asset, info)},
    [COMPONENT_TYPES.TRIGGER_AREA_COMPONENT]:(asset:any, info:any, room?:IWBRoom)=>{updateTriggerAreaComponent(asset, info, room)},
}

function updateVisiblityComponent(asset:any, info:any){
    asset.visComp.visible = !asset.visComp.visible
}

function updateImageComponent(asset:any, info:any){
    asset.imgComp.url = info.data.url
}

function updateVideoComponent(asset:any, info:any){
    console.log('updating video component', info);

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
    console.log('updating audio component', info);
    
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
    console.log('data is', info)
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
            console.log('updating metallic', info.data.value)
            asset.matComp.metallic = info.data.value
        break;

        case 'emissPath':
            console.log('updating emissPath', info.data.value)
            asset.matComp.emissPath = info.data.value
        break;

        case 'emissInt':
            console.log('updating emissInt', info.data.value)
            asset.matComp.emissInt = info.data.value
        break;

        case 'type':
            console.log('updating type', info.data.value)
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
    switch(info.data.type){
        case 'enabled':
            asset.trigComp.enabled = info.data.value
            break;

        case 'new':
            console.log('need to add new trigger', info.data)
            let scene = room.state.scenes.get(info.data.sceneId)
        
            if(scene){
                let actionAsset:any
                scene.ass.forEach((asset, i)=>{
                    if(asset.actComp && asset.actComp.actions.has(info.data.value.action)){
                        actionAsset = asset
                        return
                    }
                })

                let triggerAction = new TriggerActionComponent()
                triggerAction.aid = actionAsset.aid
                triggerAction.id = info.data.value.action

                let trigger = new Triggers()
                trigger.actions.push(triggerAction)
                trigger.pointer = info.data.value.pointer
                trigger.type = info.data.value.type
    
                if(!asset.trigComp){
                    asset.trigComp = new TriggerComponent()
                }
                asset.trigComp.triggers.push(trigger)
            }
            break;

        case 'remove':
            if(asset.trigComp){
                asset.trigComp.triggers.splice(info.data.value, 1)
            }
            break;
    }
}

function updateActionComponent(asset:any, info:any){
    switch(info.action){
        case 'add':
            console.log('adding new action action', info.data.value)
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
            }

            console.log('new action to save is', action.name, action.url)
            asset.actComp.actions.set(generateId(5), action)
            break;

        case 'delete':
            console.log('deleting action', info.data.value)
            if(asset.actComp){
                asset.actComp.actions.forEach((action:any, key:any)=>{
                    if(action.name === info.data.value.name){
                        asset.actComp.actions.delete(key)
                    }
                })
            }
            break;
    }
}

function updateTriggerAreaComponent(asset:any, info:any, room:IWBRoom){
    switch(info.action){
        case 'add':
            console.log('adding new trigger area action', info.data)

            let scene = room.state.scenes.get(info.data.sceneId)
        
            if(scene){
                let actionAsset:any
                scene.ass.forEach((asset, i)=>{
                    if(asset.actComp && asset.actComp.actions.has(info.data.value.action)){
                        actionAsset = asset
                        return
                    }
                })

                console.log('acction asset is', actionAsset)

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
            console.log('deleting action', info.data.value)
            if(asset.trigArComp){
                let array:any[] = info.data.value.type === "eActions" ? asset.trigArComp.eActions : asset.trigArComp.lActions
                let index = array.findIndex((act:any)=> act === info.data.value.action)
                array.splice(index,1)
            }
            break;
    }
}