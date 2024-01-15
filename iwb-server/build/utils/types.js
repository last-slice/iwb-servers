"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BLOCKCHAINS = exports.COLLISION_LAYERS = exports.COMPONENT_TYPES = exports.EDIT_MODIFIERS = exports.EDIT_MODES = exports.SCENE_MODES = exports.SERVER_MESSAGE_TYPES = void 0;
var SERVER_MESSAGE_TYPES;
(function (SERVER_MESSAGE_TYPES) {
    SERVER_MESSAGE_TYPES["INIT"] = "init";
    SERVER_MESSAGE_TYPES["PLAYER_LEAVE"] = "player_leave";
    // Parcels
    SERVER_MESSAGE_TYPES["SELECT_PARCEL"] = "select_parcel";
    SERVER_MESSAGE_TYPES["REMOVE_PARCEL"] = "remove_parcel";
    // Player
    SERVER_MESSAGE_TYPES["PLAY_MODE_CHANGED"] = "play_mode_changed";
    SERVER_MESSAGE_TYPES["SELECTED_SCENE_ASSET"] = "selected_scene_asset";
    SERVER_MESSAGE_TYPES["EDIT_SCENE_ASSET"] = "edit_scene_asset";
    SERVER_MESSAGE_TYPES["EDIT_SCENE_ASSET_DONE"] = "edit_scene_asset_done";
    SERVER_MESSAGE_TYPES["PLACE_SELECTED_ASSET"] = "place_asset";
    SERVER_MESSAGE_TYPES["SELECT_CATALOG_ASSET"] = "select_catalog_asset";
    SERVER_MESSAGE_TYPES["PLAYER_CANCELED_CATALOG_ASSET"] = "player_canceled_catalog";
    SERVER_MESSAGE_TYPES["ASSET_OVER_SCENE_LIMIT"] = "asset_over_scene_limit";
    // Catalog and Assets
    SERVER_MESSAGE_TYPES["CATALOG_UPDATED"] = "catalog_updated";
    SERVER_MESSAGE_TYPES["PLAYER_ASSET_UPLOADED"] = "player_asset_uploaded";
    SERVER_MESSAGE_TYPES["PLAYER_ASSET_CATALOG"] = "player_asset_catalog";
    SERVER_MESSAGE_TYPES["PLAYER_CATALOG_DEPLOYED"] = "player_catalog_deployed";
    SERVER_MESSAGE_TYPES["PLAYER_RECEIVED_MESSAGE"] = "player_received_message";
    SERVER_MESSAGE_TYPES["PLAYER_SCENES_CATALOG"] = "player_scenes_catalog";
    SERVER_MESSAGE_TYPES["PLAYER_JOINED_USER_WORLD"] = "player_joined_private_world";
    SERVER_MESSAGE_TYPES["PLAYER_EDIT_ASSET"] = "player_edit_asset";
    SERVER_MESSAGE_TYPES["UPDATE_ITEM_COMPONENT"] = "update_component";
    SERVER_MESSAGE_TYPES["UPDATE_GRAB_Y_AXIS"] = "update_grab_y_axix";
    SERVER_MESSAGE_TYPES["PLAYER_ASSET_PENDING"] = "player_asset_pending";
    // Scene
    SERVER_MESSAGE_TYPES["SCENE_SAVE_NEW"] = "scene_save_new";
    SERVER_MESSAGE_TYPES["SCENE_ADD_ITEM"] = "scene_add_item";
    SERVER_MESSAGE_TYPES["SCENE_ADDED_NEW"] = "scene_added_new";
    SERVER_MESSAGE_TYPES["SCENE_LOAD"] = "scene_load";
    SERVER_MESSAGE_TYPES["SCENE_UPDATE_ITEM"] = "scene_update_item";
    SERVER_MESSAGE_TYPES["SCENE_DELETE_ITEM"] = "scene_delete_item";
    SERVER_MESSAGE_TYPES["SCENE_ADD_BP"] = "add_build_permissions";
    SERVER_MESSAGE_TYPES["SCENE_DELETE_BP"] = "delete_build_permissions";
    SERVER_MESSAGE_TYPES["SCENE_DELETE"] = "delete_scene";
    SERVER_MESSAGE_TYPES["SCENE_UPDATE_PARCELS"] = "scene_update_parcels";
    SERVER_MESSAGE_TYPES["SCENE_SAVE_EDITS"] = "scene_save_edits";
    SERVER_MESSAGE_TYPES["SCENE_UPDATE_ENABLED"] = "scene_update_enabled";
    SERVER_MESSAGE_TYPES["SCENE_UPDATE_PRIVACY"] = "scene_update_privacy";
    SERVER_MESSAGE_TYPES["SCENE_DOWNLOAD"] = "scene_download";
    //World
    SERVER_MESSAGE_TYPES["INIT_WORLD"] = "init_world";
    SERVER_MESSAGE_TYPES["NEW_WORLD_CREATED"] = "new_world_created";
    SERVER_MESSAGE_TYPES["FORCE_DEPLOYMENT"] = "force_deployment";
})(SERVER_MESSAGE_TYPES || (exports.SERVER_MESSAGE_TYPES = SERVER_MESSAGE_TYPES = {}));
var SCENE_MODES;
(function (SCENE_MODES) {
    SCENE_MODES[SCENE_MODES["PLAYMODE"] = 0] = "PLAYMODE";
    SCENE_MODES[SCENE_MODES["CREATE_SCENE_MODE"] = 1] = "CREATE_SCENE_MODE";
    SCENE_MODES[SCENE_MODES["BUILD_MODE"] = 2] = "BUILD_MODE";
})(SCENE_MODES || (exports.SCENE_MODES = SCENE_MODES = {}));
var EDIT_MODES;
(function (EDIT_MODES) {
    EDIT_MODES[EDIT_MODES["GRAB"] = 0] = "GRAB";
    EDIT_MODES[EDIT_MODES["EDIT"] = 1] = "EDIT";
})(EDIT_MODES || (exports.EDIT_MODES = EDIT_MODES = {}));
var EDIT_MODIFIERS;
(function (EDIT_MODIFIERS) {
    EDIT_MODIFIERS[EDIT_MODIFIERS["POSITION"] = 0] = "POSITION";
    EDIT_MODIFIERS[EDIT_MODIFIERS["ROTATION"] = 1] = "ROTATION";
    EDIT_MODIFIERS[EDIT_MODIFIERS["SCALE"] = 2] = "SCALE";
    EDIT_MODIFIERS[EDIT_MODIFIERS["TRANSFORM"] = 3] = "TRANSFORM";
})(EDIT_MODIFIERS || (exports.EDIT_MODIFIERS = EDIT_MODIFIERS = {}));
var COMPONENT_TYPES;
(function (COMPONENT_TYPES) {
    COMPONENT_TYPES["VISBILITY_COMPONENT"] = "Visibility";
    COMPONENT_TYPES["IMAGE_COMPONENT"] = "Image";
    COMPONENT_TYPES["VIDEO_COMPONENT"] = "Video";
    COMPONENT_TYPES["AUDIO_COMPONENT"] = "Audio";
    COMPONENT_TYPES["MATERIAL_COMPONENT"] = "Material";
    COMPONENT_TYPES["COLLISION_COMPONENT"] = "Collision";
    COMPONENT_TYPES["TRANSFORM_COMPONENT"] = "Transform";
    COMPONENT_TYPES["NFT_COMPONENT"] = "NFT";
    COMPONENT_TYPES["TEXT_COMPONENT"] = "Text";
    COMPONENT_TYPES["TRIGGER_COMPONENT"] = "Trigger";
    COMPONENT_TYPES["ACTION_COMPONENT"] = "Action";
    // CLICK_COMPONENT = "Click",
})(COMPONENT_TYPES || (exports.COMPONENT_TYPES = COMPONENT_TYPES = {}));
var COLLISION_LAYERS;
(function (COLLISION_LAYERS) {
    COLLISION_LAYERS["INVISIBLE"] = "invisible";
    COLLISION_LAYERS["VISIBLE"] = "visible";
})(COLLISION_LAYERS || (exports.COLLISION_LAYERS = COLLISION_LAYERS = {}));
var BLOCKCHAINS;
(function (BLOCKCHAINS) {
    BLOCKCHAINS["ETH"] = "eth";
    BLOCKCHAINS["POLYGON"] = "polygon";
})(BLOCKCHAINS || (exports.BLOCKCHAINS = BLOCKCHAINS = {}));
// export type SceneData = {
//     id:string,
//     n:string, 
//     d:string,
//     o:string,
//     ona:string,
//     cat:string,
//     bpcl:string,
//     ass:any[],
//     bps:string[],
//     rat:string[],
//     rev:string[],
//     pcls:string[],
//     sp:string[],
//     cd:number,
//     upd:number,
//     si:number,
//     toc:number,
//     pc:number,
//     pcnt:number,
//     isdl:boolean,
//     e:boolean
// }
