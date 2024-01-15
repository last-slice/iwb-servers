"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateItemComponentFunctions = void 0;
const colyseus_1 = require("colyseus");
const Components_1 = require("../../Objects/Components");
const types_1 = require("../../utils/types");
exports.updateItemComponentFunctions = {
    [types_1.COMPONENT_TYPES.VISBILITY_COMPONENT]: (asset, info) => { updateVisiblityComponent(asset, info); },
    [types_1.COMPONENT_TYPES.MATERIAL_COMPONENT]: (asset, info) => { updateMaterialComponent(asset, info); },
    [types_1.COMPONENT_TYPES.COLLISION_COMPONENT]: (asset, info) => { updateCollisionComponent(asset, info); },
    [types_1.COMPONENT_TYPES.IMAGE_COMPONENT]: (asset, info) => { updateImageComponent(asset, info); },
    [types_1.COMPONENT_TYPES.VIDEO_COMPONENT]: (asset, info) => { updateVideoComponent(asset, info); },
    [types_1.COMPONENT_TYPES.AUDIO_COMPONENT]: (asset, info) => { updateAudioComponent(asset, info); },
    [types_1.COMPONENT_TYPES.NFT_COMPONENT]: (asset, info) => { updateNFTComponent(asset, info); },
    [types_1.COMPONENT_TYPES.TEXT_COMPONENT]: (asset, info) => { updateTextComponent(asset, info); },
    [types_1.COMPONENT_TYPES.TRIGGER_COMPONENT]: (asset, info) => { updateTriggerComponent(asset, info); },
    [types_1.COMPONENT_TYPES.ACTION_COMPONENT]: (asset, info) => { updateActionComponent(asset, info); },
};
function updateVisiblityComponent(asset, info) {
    asset.visComp.visible = !asset.visComp.visible;
}
function updateImageComponent(asset, info) {
    asset.imgComp.url = info.data.url;
}
function updateVideoComponent(asset, info) {
    asset.vidComp.url = info.data.url;
}
function updateAudioComponent(asset, info) {
    console.log('updating audio component', info);
    switch (info.data.type) {
        case 'url':
            asset.audComp.url = info.data.value;
            break;
        case 'attach':
            asset.audComp.attachedPlayer = !asset.audComp.attachedPlayer;
            break;
        case 'loop':
            asset.audComp.loop = info.data.value;
            break;
        case 'autostart':
            asset.audComp.autostart = info.data.value;
            break;
    }
}
function updateMaterialComponent(asset, info) {
    console.log('data is', info);
    switch (info.data.type) {
        case 'enabled':
            asset.matComp.emiss = info.data.value;
            if (info.data.type) {
                asset.matComp.emissColor.push("1", "1", "1", "1");
            }
            else {
                asset.matComp.emissColor.length = 0;
            }
            break;
        case 'metallic':
            console.log('updating metallic', info.data.value);
            asset.matComp.metallic = info.data.value;
            break;
        case 'emissPath':
            console.log('updating emissPath', info.data.value);
            asset.matComp.emissPath = info.data.value;
            break;
        case 'emissInt':
            console.log('updating emissInt', info.data.value);
            asset.matComp.emissInt = info.data.value;
            break;
        case 'type':
            console.log('updating type', info.data.value);
            asset.matComp.type = info.data.value;
            break;
    }
}
function updateCollisionComponent(asset, info) {
    if (info.data.layer === 'iMask') {
        asset.colComp.iMask = info.data.value;
    }
    else {
        asset.colComp.vMask = info.data.value;
    }
}
function updateNFTComponent(asset, info) {
    switch (info.data.type) {
        case 'chain':
            asset.nftComp.chain = info.data.value;
            break;
        case 'style':
            asset.nftComp.style = info.data.value;
            break;
        case 'contract':
            asset.nftComp.contract = info.data.value;
            break;
        case 'tokenId':
            asset.nftComp.tokenId = info.data.value;
            break;
    }
}
function updateTextComponent(asset, info) {
    switch (info.data.type) {
        case 'text':
            asset.textComp.text = info.data.value;
            break;
        case 'font':
            asset.textComp.font = info.data.value;
            break;
        case 'fontSize':
            asset.textComp.fontSize = parseInt(info.data.value);
            break;
        case 'color':
            asset.textComp.color = new Components_1.Color4();
            asset.textComp.color.r = info.data.value.r;
            asset.textComp.color.g = info.data.value.g;
            asset.textComp.color.b = info.data.value.b;
            asset.textComp.color.a = info.data.value.a;
            break;
        case 'align':
            asset.textComp.align = info.data.value;
            break;
    }
}
function updateTriggerComponent(asset, info) {
    switch (info.data.type) {
        case 'enabled':
            asset.trigComp.enabled = info.data.value;
            break;
        case 'new':
            console.log('need to add new trigger', info.data.value);
            let action = new Components_1.Actions();
            action.name = info.data.value.name;
            action.type = info.data.value.type;
            action.url = info.data.value.url;
            let trigger = new Components_1.Triggers();
            trigger.actions.set(info.data.value.name, action);
            if (!asset.trigComp) {
                asset.trigComp = new Components_1.TriggerComponent();
            }
            asset.trigComp.triggers.push(trigger);
            break;
        case 'remove':
            if (asset.trigComp) {
                asset.trigComp.triggers.splice(info.data.value, 1);
            }
            break;
    }
}
function updateActionComponent(asset, info) {
    switch (info.action) {
        case 'add':
            console.log('adding new action action', info.data.value);
            if (!asset.actComp) {
                asset.actComp = new Components_1.ActionComponent();
            }
            let action = new Components_1.Actions();
            action.name = info.data.value.name;
            action.type = info.data.value.action.type;
            action.url = info.data.value.action.url;
            console.log('new action to save is', action.name, action.url);
            asset.actComp.actions.set((0, colyseus_1.generateId)(5), action);
            break;
        case 'delete':
            console.log('deleting action', info.data.value);
            if (asset.actComp) {
                asset.actComp.actions.forEach((action, key) => {
                    if (action.name === info.data.value.name) {
                        asset.actComp.actions.delete(key);
                    }
                });
            }
            break;
    }
}
