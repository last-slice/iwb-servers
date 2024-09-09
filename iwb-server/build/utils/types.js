"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAYER_GAME_STATUSES = exports.GAME_TYPES = exports.CATALOG_IDS = exports.TRIGGER_TYPES = exports.ACCESS_FILTERS = exports.ACCESS_CATEGORIES = exports.ACCESS_TYPES = exports.REWARD_TYPES = exports.TriggerConditionOperation = exports.Triggers = exports.ACTIONS = exports.BLOCKCHAINS = exports.COLLISION_LAYERS = exports.COMPONENT_TYPES = exports.EDIT_MODIFIERS = exports.EDIT_MODES = exports.VIEW_MODES = exports.SCENE_MODES = exports.SERVER_MESSAGE_TYPES = exports.Color4 = void 0;
const schema_1 = require("@colyseus/schema");
class Color4 extends schema_1.Schema {
}
exports.Color4 = Color4;
__decorate([
    (0, schema_1.type)("number")
], Color4.prototype, "r", void 0);
__decorate([
    (0, schema_1.type)("number")
], Color4.prototype, "g", void 0);
__decorate([
    (0, schema_1.type)("number")
], Color4.prototype, "b", void 0);
__decorate([
    (0, schema_1.type)("number")
], Color4.prototype, "a", void 0);
var SERVER_MESSAGE_TYPES;
(function (SERVER_MESSAGE_TYPES) {
    SERVER_MESSAGE_TYPES["INIT"] = "init";
    SERVER_MESSAGE_TYPES["PLAYER_LEAVE"] = "player_leave";
    SERVER_MESSAGE_TYPES["PLAYER_JOINED"] = "player_joined";
    // Parcels
    SERVER_MESSAGE_TYPES["SELECT_PARCEL"] = "select_parcel";
    SERVER_MESSAGE_TYPES["REMOVE_PARCEL"] = "remove_parcel";
    // Player
    SERVER_MESSAGE_TYPES["PLAY_MODE_CHANGED"] = "play_mode_changed";
    SERVER_MESSAGE_TYPES["SELECTED_SCENE_ASSET"] = "selected_scene_asset";
    SERVER_MESSAGE_TYPES["EDIT_SCENE_ASSET"] = "edit_scene_asset";
    SERVER_MESSAGE_TYPES["EDIT_SCENE_ASSET_DONE"] = "edit_scene_asset_done";
    SERVER_MESSAGE_TYPES["EDIT_SCENE_ASSET_CANCEL"] = "edit_scene_asset_cancel";
    SERVER_MESSAGE_TYPES["PLACE_SELECTED_ASSET"] = "place_asset";
    SERVER_MESSAGE_TYPES["SELECT_CATALOG_ASSET"] = "select_catalog_asset";
    SERVER_MESSAGE_TYPES["PLAYER_CANCELED_CATALOG_ASSET"] = "player_canceled_catalog";
    SERVER_MESSAGE_TYPES["ASSET_OVER_SCENE_LIMIT"] = "asset_over_scene_limit";
    SERVER_MESSAGE_TYPES["SUBMIT_FEEDBACK"] = "submit_feedback";
    SERVER_MESSAGE_TYPES["PLAYER_SETTINGS"] = "player_settings";
    SERVER_MESSAGE_TYPES["FIRST_TIME"] = "first_time";
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
    SERVER_MESSAGE_TYPES["UPDATE_ASSET_LOCKED"] = "update_asset_locked";
    SERVER_MESSAGE_TYPES["UPDATE_ASSET_BUILD_VIS"] = "update_asset_build_visibility";
    SERVER_MESSAGE_TYPES["DELETE_UGC_ASSET"] = "delete_ugc_asset";
    SERVER_MESSAGE_TYPES["ADD_WORLD_ASSETS"] = "add_world_assets";
    SERVER_MESSAGE_TYPES["DELETE_WORLD_ASSETS"] = "delete_world_assets";
    SERVER_MESSAGE_TYPES["CHUNK_SEND_ASSETS"] = "chunk_send_assets";
    // Scene
    SERVER_MESSAGE_TYPES["SCENE_SAVE_NEW"] = "scene_save_new";
    SERVER_MESSAGE_TYPES["SCENE_ADD_ITEM"] = "scene_add_item";
    SERVER_MESSAGE_TYPES["SCENE_ADDED_NEW"] = "scene_added_new";
    SERVER_MESSAGE_TYPES["SCENE_DROPPED_GRABBED"] = "scene_dropped_grabbed";
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
    SERVER_MESSAGE_TYPES["SCENE_DEPLOY"] = "scene_deploy";
    SERVER_MESSAGE_TYPES["SCENE_DEPLOY_READY"] = "scene_deploy_ready";
    SERVER_MESSAGE_TYPES["SCENE_ADDED_SPAWN"] = "scene_added_spawn";
    SERVER_MESSAGE_TYPES["SCENE_DELETE_SPAWN"] = "scene_delete_spawn";
    SERVER_MESSAGE_TYPES["SCENE_CLEAR_ASSETS"] = "scene_clear_assets";
    SERVER_MESSAGE_TYPES["SCENE_COPY_ITEM"] = "scene_copy_item";
    SERVER_MESSAGE_TYPES["SCENE_DEPLOY_FINISHED"] = "scene_deploy_finished";
    SERVER_MESSAGE_TYPES["SCENE_ACTION"] = "scene_action";
    SERVER_MESSAGE_TYPES["SCENE_DELETE_GRABBED_ITEM"] = "scene_delete_grabbed_item";
    //World
    SERVER_MESSAGE_TYPES["INIT_WORLD"] = "init_world";
    SERVER_MESSAGE_TYPES["NEW_WORLD_CREATED"] = "new_world_created";
    SERVER_MESSAGE_TYPES["FORCE_DEPLOYMENT"] = "force_deployment";
    SERVER_MESSAGE_TYPES["SCENE_COUNT"] = "scene_count";
    SERVER_MESSAGE_TYPES["ADDED_TUTORIAL"] = "added_tutorial";
    SERVER_MESSAGE_TYPES["REMOVED_TUTORIAL"] = "removed_tutorial";
    SERVER_MESSAGE_TYPES["UPDATED_TUTORIAL_CID"] = "updated_tutorial_cid";
    SERVER_MESSAGE_TYPES["WORLD_TRAVEL"] = "world_travel";
    SERVER_MESSAGE_TYPES["PLAYTIME"] = "playtime";
    SERVER_MESSAGE_TYPES["WORLD_ADD_BP"] = "world_add_build_permissions";
    SERVER_MESSAGE_TYPES["WORLD_DELETE_BP"] = "world_delete_build_permissions";
    SERVER_MESSAGE_TYPES["GET_MARKETPLACE"] = "get_marketplace";
    SERVER_MESSAGE_TYPES["FORCE_BACKUP"] = "force_backup";
    SERVER_MESSAGE_TYPES["CUSTOM"] = "custom";
    SERVER_MESSAGE_TYPES["IWB_VERSION_UPDATE"] = "iwb_version_update";
    SERVER_MESSAGE_TYPES["VERIFY_ACCESS"] = "verify_access";
    //AUDIUS SPECIFIC ACTIONS
    SERVER_MESSAGE_TYPES["PLAY_AUDIUS_TRACK"] = "play_audius_track";
    //REMOTE SERVER ACTIONS
    SERVER_MESSAGE_TYPES["CLAIM_REWARD"] = "claim_reward";
    //GAMING
    SERVER_MESSAGE_TYPES["START_GAME"] = "start_game";
    SERVER_MESSAGE_TYPES["END_GAME"] = "end_game";
    SERVER_MESSAGE_TYPES["CREATE_GAME_LOBBY"] = "create_game_lobby";
    SERVER_MESSAGE_TYPES["GAME_FINISHED_EARLY"] = "game_finished_early";
    SERVER_MESSAGE_TYPES["WIN_GAME"] = "win_game";
    SERVER_MESSAGE_TYPES["GAME_TIED"] = "game_tied";
    SERVER_MESSAGE_TYPES["HIT_OBJECT"] = "hit_object";
    SERVER_MESSAGE_TYPES["SHOOT"] = "shoot";
    //QUESTING
    SERVER_MESSAGE_TYPES["GET_QUEST_DEFINITIONS"] = "get_quest_definitions";
    SERVER_MESSAGE_TYPES["QUEST_EDIT"] = "edit_quest";
})(SERVER_MESSAGE_TYPES || (exports.SERVER_MESSAGE_TYPES = SERVER_MESSAGE_TYPES = {}));
var SCENE_MODES;
(function (SCENE_MODES) {
    SCENE_MODES[SCENE_MODES["PLAYMODE"] = 0] = "PLAYMODE";
    SCENE_MODES[SCENE_MODES["CREATE_SCENE_MODE"] = 1] = "CREATE_SCENE_MODE";
    SCENE_MODES[SCENE_MODES["BUILD_MODE"] = 2] = "BUILD_MODE";
})(SCENE_MODES || (exports.SCENE_MODES = SCENE_MODES = {}));
var VIEW_MODES;
(function (VIEW_MODES) {
    VIEW_MODES[VIEW_MODES["AVATAR"] = 0] = "AVATAR";
    VIEW_MODES[VIEW_MODES["GOD"] = 1] = "GOD";
})(VIEW_MODES || (exports.VIEW_MODES = VIEW_MODES = {}));
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
    COMPONENT_TYPES["MATERIAL_COMPONENT"] = "Material";
    COMPONENT_TYPES["TRANSFORM_COMPONENT"] = "Transform";
    COMPONENT_TYPES["NFT_COMPONENT"] = "NFT_Shape";
    COMPONENT_TYPES["TEXT_COMPONENT"] = "Text";
    COMPONENT_TYPES["TRIGGER_COMPONENT"] = "Triggers";
    COMPONENT_TYPES["ACTION_COMPONENT"] = "Actions";
    COMPONENT_TYPES["CLICK_AREA_COMPONENT"] = "Click_Area";
    COMPONENT_TYPES["ANIMATION_COMPONENT"] = "Animator";
    COMPONENT_TYPES["DIALOG_COMPONENT"] = "Dialog";
    COMPONENT_TYPES["REWARD_COMPONENT"] = "Reward";
    COMPONENT_TYPES["PARENTING_COMPONENT"] = "Parenting";
    COMPONENT_TYPES["NAMES_COMPONENT"] = "Name";
    COMPONENT_TYPES["POINTER_COMPONENT"] = "Pointers";
    COMPONENT_TYPES["UI_TEXT_COMPONENT"] = "UI_Text";
    COMPONENT_TYPES["UI_IMAGE_COMPONENT"] = "UI_Image";
    COMPONENT_TYPES["COUNTER_COMPONENT"] = "Counters";
    COMPONENT_TYPES["GLTF_COMPONENT"] = "Gltf";
    COMPONENT_TYPES["STATE_COMPONENT"] = "States";
    COMPONENT_TYPES["AUDIO_SOURCE_COMPONENT"] = "Audio_Source";
    COMPONENT_TYPES["AUDIO_COMPONENT"] = "Audio";
    COMPONENT_TYPES["AUDIO_STREAM_COMPONENT"] = "Audio_Stream";
    COMPONENT_TYPES["IWB_COMPONENT"] = "IWB";
    COMPONENT_TYPES["MESH_RENDER_COMPONENT"] = "Mesh_Renderer";
    COMPONENT_TYPES["MESH_COLLIDER_COMPONENT"] = "Mesh_Collider";
    COMPONENT_TYPES["TEXTURE_COMPONENT"] = "Texture";
    COMPONENT_TYPES["AVATAR_SHAPE_COMPONENT"] = "Avatar_Shape";
    COMPONENT_TYPES["GAME_COMPONENT"] = "Game";
    COMPONENT_TYPES["LEVEL_COMPONENT"] = "Levels";
    COMPONENT_TYPES["BILLBOARD_COMPONENT"] = "Billboard";
    COMPONENT_TYPES["LIVE_COMPONENT"] = "Live";
    COMPONENT_TYPES["TEAM_COMPONENT"] = "Team";
    COMPONENT_TYPES["GAME_ITEM_COMPONENT"] = "GameItem";
    COMPONENT_TYPES["GAME_ROOM_COMPONENT"] = "gaming";
    COMPONENT_TYPES["PLAYLIST_COMPONENT"] = "Playlist";
    COMPONENT_TYPES["PATH_COMPONENT"] = "Path";
    COMPONENT_TYPES["VLM_COMPONENT"] = "VLM";
    COMPONENT_TYPES["MULTIPLAYER_COMPONENT"] = "Multiplayer";
    COMPONENT_TYPES["LEADERBOARD_COMPONENT"] = "Leaderboard";
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
var ACTIONS;
(function (ACTIONS) {
    ACTIONS["STOP_TWEEN"] = "tween_stop";
    ACTIONS["START_TWEEN"] = "tween_start";
    ACTIONS["PLAY_SOUND"] = "audio_play";
    ACTIONS["STOP_SOUND"] = "audio_stop";
    ACTIONS["SET_VISIBILITY"] = "entity_visiblity_change";
    ACTIONS["ATTACH_PLAYER"] = "player_attach";
    ACTIONS["DETACH_PLAYER"] = "player_detach";
    ACTIONS["PLAY_VIDEO"] = "video_play";
    // TOGGLE_VIDEO = 'video_toggle',
    ACTIONS["PLAY_VIDEO_STREAM"] = "video_stream_play";
    ACTIONS["STOP_VIDEO"] = "video_stop";
    ACTIONS["STOP_VIDEO_STREAM"] = "video_stream_stop";
    ACTIONS["PLAY_AUDIO_STREAM"] = "audio_stream_play";
    ACTIONS["STOP_AUDIO_STREAM"] = "audio_stream_stop";
    ACTIONS["TELEPORT_PLAYER"] = "player_teleport";
    ACTIONS["EMOTE"] = "player_emote";
    ACTIONS["OPEN_LINK"] = "open_link";
    ACTIONS["SHOW_TEXT"] = "ui_text_show";
    ACTIONS["HIDE_TEXT"] = "ui_text_hide";
    ACTIONS["START_DELAY"] = "delay_start";
    ACTIONS["STOP_DELAY"] = "delay_stop";
    ACTIONS["START_LOOP"] = "loop_start";
    ACTIONS["STOP_LOOP"] = "loop_stop";
    ACTIONS["CLONE"] = "entity_clone";
    ACTIONS["REMOVE"] = "entity_remove";
    // SHOW_IMAGE = 'show_image',
    // HIDE_IMAGE = 'hide_image',
    ACTIONS["PLAY_ANIMATION"] = "animation_start";
    ACTIONS["STOP_ANIMATION"] = "animation_stop";
    ACTIONS["SHOW_DIALOG"] = "dialog_show";
    ACTIONS["HIDE_DIALOG"] = "dialog_hide";
    ACTIONS["ENABLE_CLICK_AREA"] = "click_area_enable";
    ACTIONS["DISABLE_CLICK_AREA"] = "click_area_disable";
    ACTIONS["ENABLE_TRIGGER_AREA"] = "trigger_area_enable";
    ACTIONS["DISABLE_TRIGGER_AREA"] = "trigger_area_disable";
    ACTIONS["GIVE_REWARD"] = "reward_give";
    ACTIONS["VERIFY_ACCESS"] = "access_verify";
    ACTIONS["ADD_NUMBER"] = "number_add";
    ACTIONS["SET_NUMBER"] = "number_set";
    ACTIONS["SUBTRACT_NUMBER"] = "number_subtract";
    ACTIONS["LOAD_LEVEL"] = "level_load";
    ACTIONS["END_LEVEL"] = "level_end";
    ACTIONS["COMPLETE_LEVEL"] = "level_win";
    ACTIONS["ADVANCED_LEVEL"] = "level_advance";
    ACTIONS["LOSE_LEVEL"] = "level_lose";
    ACTIONS["START_TIMER"] = "timer_start";
    ACTIONS["STOP_TIMER"] = "timer_stop";
    ACTIONS["LOCK_PLAYER"] = "player_lock";
    ACTIONS["UNLOCK_PLAYER"] = "player_lock";
    ACTIONS["SET_POSITION"] = "entity_set_position";
    ACTIONS["SET_ROTATION"] = "entity_set_rotation";
    ACTIONS["SET_SCALE"] = "entity_set_scale";
    ACTIONS["SET_STATE"] = "state_set";
    ACTIONS["MOVE_PLAYER"] = "player_move";
    ACTIONS["SHOW_NOTIFICATION"] = "notification_show";
    ACTIONS["HIDE_NOTIFICATION"] = "notification_hide";
    ACTIONS["PLACE_PLAYER_POSITION"] = "entity_place_player_position";
    ACTIONS["BATCH_ACTIONS"] = "actions_batch";
    ACTIONS["RANDOM_ACTION"] = "actions_random";
    ACTIONS["SET_TEXT"] = "text_set";
    ACTIONS["SHOW_CUSTOM_IMAGE"] = "ui_image_show";
    ACTIONS["HIDE_CUSTOM_IMAGE"] = "ui_image_hide";
    ACTIONS["ATTEMPT_GAME_START"] = "game_start_attempt";
    ACTIONS["END_GAME"] = "game_end";
    ACTIONS["PLAY_PLAYLIST"] = "playlist_play";
    ACTIONS["SEEK_PLAYLIST"] = "playlist_seek";
    ACTIONS["STOP_PLAYLIST"] = "playlist_stop";
    ACTIONS["POPUP_SHOW"] = "popup_show";
    ACTIONS["POPUP_HIDE"] = "popup_hide";
    ACTIONS["RANDOM_NUMBER"] = "random_number";
})(ACTIONS || (exports.ACTIONS = ACTIONS = {}));
var Triggers;
(function (Triggers) {
    Triggers["ON_CLICK"] = "on_click";
    Triggers["ON_ENTER"] = "on_enter";
    Triggers["ON_LEAVE"] = "on_leave";
    //new triggers
    Triggers["ON_ACCESS_VERIFIED"] = "on_access_verified";
    Triggers["ON_ACCESS_DENIED"] = "on_access_denied";
    Triggers["ON_INPUT_ACTION"] = "on_input_action";
    // ON_TWEEN_END,
    // ON_DELAY,
    // ON_LOOP
    // ON_CLONE
    // ON_CLICK_IMAGE
    // ON_DAMAGE
    // ON_GLOBAL_CLICK
    // ON_TICK
    // ON_HEAL//s
    Triggers["ON_STATE_CHANGE"] = "on_state_change";
    Triggers["ON_COUNTER_CHANGE"] = "on_counter_change";
    Triggers["ON_RAYCAST_HIT"] = "on_raycast_hit";
    Triggers["ON_GAME_START"] = "on_game_start";
    Triggers["ON_LEVEL_LOADED"] = "on_level_loaded";
    Triggers["ON_LEVEL_COMPLETE"] = "on_level_complete";
    Triggers["ON_LEVEL_END"] = "on_level_end";
    Triggers["ON_JOIN_LOBBY"] = "on_join_lobby";
    Triggers["ON_CLOCK_TICK"] = "on_scene_tick";
})(Triggers || (exports.Triggers = Triggers = {}));
var TriggerConditionOperation;
(function (TriggerConditionOperation) {
    TriggerConditionOperation["AND"] = "and";
    TriggerConditionOperation["OR"] = "or";
})(TriggerConditionOperation || (exports.TriggerConditionOperation = TriggerConditionOperation = {}));
var REWARD_TYPES;
(function (REWARD_TYPES) {
    REWARD_TYPES["DCL_ITEM"] = "dcl_item";
})(REWARD_TYPES || (exports.REWARD_TYPES = REWARD_TYPES = {}));
var ACCESS_TYPES;
(function (ACCESS_TYPES) {
    ACCESS_TYPES["NFT_OWNERSHP"] = "nft_ownership";
})(ACCESS_TYPES || (exports.ACCESS_TYPES = ACCESS_TYPES = {}));
var ACCESS_CATEGORIES;
(function (ACCESS_CATEGORIES) {
    ACCESS_CATEGORIES["HAS_OWNERSHIP"] = "has_ownership";
    ACCESS_CATEGORIES["HAS_ON"] = "has_on";
})(ACCESS_CATEGORIES || (exports.ACCESS_CATEGORIES = ACCESS_CATEGORIES = {}));
var ACCESS_FILTERS;
(function (ACCESS_FILTERS) {
    ACCESS_FILTERS["HAS_ALL"] = "has_all";
    ACCESS_FILTERS["HAS_ANY"] = "has_any";
})(ACCESS_FILTERS || (exports.ACCESS_FILTERS = ACCESS_FILTERS = {}));
var TRIGGER_TYPES;
(function (TRIGGER_TYPES) {
    TRIGGER_TYPES["ON_INPUT_ACTION"] = "on_input_action";
})(TRIGGER_TYPES || (exports.TRIGGER_TYPES = TRIGGER_TYPES = {}));
var CATALOG_IDS;
(function (CATALOG_IDS) {
    CATALOG_IDS["GAME_COMPONENT"] = "e7a63c71-c2ba-4e6d-8e62-d77e2c8dc93a";
    CATALOG_IDS["EMPTY_ENTITY"] = "b9768002-c662-4b80-97a0-fb0d0b714fab";
})(CATALOG_IDS || (exports.CATALOG_IDS = CATALOG_IDS = {}));
var GAME_TYPES;
(function (GAME_TYPES) {
    GAME_TYPES[GAME_TYPES["SOLO"] = 0] = "SOLO";
    GAME_TYPES[GAME_TYPES["MULTIPLAYER"] = 1] = "MULTIPLAYER";
})(GAME_TYPES || (exports.GAME_TYPES = GAME_TYPES = {}));
var PLAYER_GAME_STATUSES;
(function (PLAYER_GAME_STATUSES) {
    PLAYER_GAME_STATUSES["NONE"] = "none";
    PLAYER_GAME_STATUSES["PLAYING"] = "playing";
    PLAYER_GAME_STATUSES["LOBBY"] = "lobby";
    PLAYER_GAME_STATUSES["WAITING"] = "waiting";
    PLAYER_GAME_STATUSES["ELIMINATED"] = "eliminated";
})(PLAYER_GAME_STATUSES || (exports.PLAYER_GAME_STATUSES = PLAYER_GAME_STATUSES = {}));
