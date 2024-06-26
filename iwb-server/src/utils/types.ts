

export enum SERVER_MESSAGE_TYPES {
    INIT = "init",
    PLAYER_LEAVE = "player_leave",
    PLAYER_JOINED = 'player_joined',

    // Parcels
    SELECT_PARCEL = "select_parcel",
    REMOVE_PARCEL = "remove_parcel",

    // Player
    PLAY_MODE_CHANGED = 'play_mode_changed',
    SELECTED_SCENE_ASSET = 'selected_scene_asset',
    EDIT_SCENE_ASSET = 'edit_scene_asset',
    EDIT_SCENE_ASSET_DONE = 'edit_scene_asset_done',
    EDIT_SCENE_ASSET_CANCEL = 'edit_scene_asset_cancel',
    PLACE_SELECTED_ASSET = 'place_asset',
    SELECT_CATALOG_ASSET = 'select_catalog_asset',
    PLAYER_CANCELED_CATALOG_ASSET = 'player_canceled_catalog',
    ASSET_OVER_SCENE_LIMIT = 'asset_over_scene_limit',
    SUBMIT_FEEDBACK = 'submit_feedback',
    PLAYER_SETTINGS = 'player_settings',
    FIRST_TIME = 'first_time',

    // Catalog and Assets
    CATALOG_UPDATED = 'catalog_updated',
    PLAYER_ASSET_UPLOADED = 'player_asset_uploaded',
    PLAYER_ASSET_CATALOG = 'player_asset_catalog',
    PLAYER_CATALOG_DEPLOYED = 'player_catalog_deployed',
    PLAYER_RECEIVED_MESSAGE = 'player_received_message',
    PLAYER_SCENES_CATALOG = 'player_scenes_catalog',
    PLAYER_JOINED_USER_WORLD = 'player_joined_private_world',
    PLAYER_EDIT_ASSET = 'player_edit_asset',
    UPDATE_ITEM_COMPONENT = "update_component",
    UPDATE_GRAB_Y_AXIS = 'update_grab_y_axix',
    PLAYER_ASSET_PENDING = 'player_asset_pending',
    UPDATE_ASSET_LOCKED = 'update_asset_locked',
    UPDATE_ASSET_BUILD_VIS = 'update_asset_build_visibility',
    DELETE_UGC_ASSET = 'delete_ugc_asset',

    // Scene
    SCENE_SAVE_NEW = "scene_save_new",
    SCENE_ADD_ITEM = 'scene_add_item',
    SCENE_ADDED_NEW = "scene_added_new",
    SCENE_LOAD = 'scene_load',
    SCENE_UPDATE_ITEM = 'scene_update_item',
    SCENE_DELETE_ITEM = 'scene_delete_item',
    SCENE_ADD_BP = 'add_build_permissions',
    SCENE_DELETE_BP = 'delete_build_permissions',
    SCENE_DELETE = 'delete_scene',
    SCENE_UPDATE_PARCELS = 'scene_update_parcels',
    SCENE_SAVE_EDITS = 'scene_save_edits',
    SCENE_UPDATE_ENABLED = 'scene_update_enabled',
    SCENE_UPDATE_PRIVACY = 'scene_update_privacy',
    SCENE_DOWNLOAD = 'scene_download',
    SCENE_DEPLOY = 'scene_deploy',
    SCENE_DEPLOY_READY = 'scene_deploy_ready',
    SCENE_ADDED_SPAWN = "scene_added_spawn",
    SCENE_DELETE_SPAWN = "scene_delete_spawn",
    SCENE_CLEAR_ASSETS = 'scene_clear_assets',
    SCENE_COPY_ITEM = 'scene_copy_item',
    SCENE_DEPLOY_FINISHED = 'scene_deploy_finished',

    //World
    INIT_WORLD = "init_world",
    NEW_WORLD_CREATED = 'new_world_created',
    FORCE_DEPLOYMENT = 'force_deployment',
    SCENE_COUNT  = 'scene_count',
    ADDED_TUTORIAL = 'added_tutorial',
    REMOVED_TUTORIAL = 'removed_tutorial',
    UPDATED_TUTORIAL_CID = 'updated_tutorial_cid', 
    WORLD_TRAVEL = 'world_travel',
    PLAYTIME = 'playtime',

    CUSTOM = "custom",


    VERIFY_ACCESS = 'verify_access',


    //REMOTE SERVER ACTIONS
    CLAIM_REWARD = 'claim_reward',

    //GAMING
    CREATE_GAME_LOBBY = 'create_game_lobby'
}

export enum SCENE_MODES {
    PLAYMODE,
    CREATE_SCENE_MODE,
    BUILD_MODE
}

export enum EDIT_MODES {
    GRAB,
    EDIT
}

export enum EDIT_MODIFIERS {
    POSITION,
    ROTATION,
    SCALE,
    TRANSFORM
}

export type PlayerData = {
    dclData:any | null,
    mode: SCENE_MODES,
    buildMode:number | null,
}

export enum COMPONENT_TYPES {
    VISBILITY_COMPONENT = "Visibility",
    IMAGE_COMPONENT = "Image",
    VIDEO_COMPONENT = 'Video',
    AUDIO_COMPONENT = "Audio",
    MATERIAL_COMPONENT = "Material",
    COLLISION_COMPONENT = "Collision",
    TRANSFORM_COMPONENT = "Transform",
    NFT_COMPONENT = "NFT",
    TEXT_COMPONENT = "Text",
    TRIGGER_COMPONENT = "Trigger",
    ACTION_COMPONENT = 'Action',
    TRIGGER_AREA_COMPONENT = "Trigger Area",
    CLICK_AREA_COMPONENT = "Click Area",
    ANIMATION_COMPONENT = "Animation",
    NPC_COMPONENT = 'NPC',
    DIALOG_COMPONENT = 'Dialog',
    REWARD_COMPONENT ='Reward'
}

export enum COLLISION_LAYERS {
    INVISIBLE = "invisible",
    VISIBLE = "visible"
}

export enum BLOCKCHAINS {
    ETH = "eth",
    POLYGON = "polygon"
}

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

export enum ACTIONS {
    START_TWEEN = "start_tween",
    PLAY_SOUND = "play_sound",
    STOP_SOUND = "stop_sound",
    SET_VISIBILITY = "set_vis",
    ATTACH_PLAYER = "attach_player",
    DETACH_PLAYER = "detach_player",
    PLAY_VIDEO = 'play_video',
    TOGGLE_VIDEO = 'toggle_video',
    PLAYER_VIDEO_STREAM = 'play_video_stream',
    STOP_VIDEO = 'stop_video',
    STOP_VIDEO_STREAM = 'stop_video_stream',
    PLAY_AUDIO = 'play_audio',
    PLAY_AUDIO_STREAM = 'play_audio_stream',
    STOP_AUDIO = 'stop_audio',
    STOP_AUDIO_STREAM = 'stop_audio_stream',
    TELEPORT_PLAYER = 'telport',
    EMOTE = 'emote',
    OPEN_LINK = 'open_link',
    SHOW_TEXT = 'show_text',
    HIDE_TEXT = 'hide_text',
    SHOW_TOAST = 'show_toast',
    HIDE_TOAST = 'hide_toast',
    START_DELAY = 'start_delay',
    STOP_DELAY = 'stop_delay',
    START_LOOP = 'start_loop',
    STOP_LOOP = 'stop_loop',
    CLONE = 'clone',
    REMOVE = 'remove',
    SHOW_IMAGE = 'show_image',
    HIDE_IMAGE = 'hide_image',
    PLAY_ANIMATION = 'play_animation',
    STOP_ANIMATION = 'stop_animation',
    SHOW_DIALOG = 'show_dialog',
    GIVE_REWARD = 'give_reward'
}

export enum REWARD_TYPES {
    DCL_ITEM = 'dcl_item'
}

export enum ACCESS_TYPES {
    NFT_OWNERSHP = 'nft_ownership'
}

export enum ACCESS_CATEGORIES {
    HAS_OWNERSHIP = 'has_ownership',
    HAS_ON = 'has_on'
}

export enum ACCESS_FILTERS {
    HAS_ALL = 'has_all',
    HAS_ANY = 'has_any'
}