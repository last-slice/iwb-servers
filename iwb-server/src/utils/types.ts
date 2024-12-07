import {Schema, type} from "@colyseus/schema";

export class Color4 extends Schema {
    @type("number") r: number
    @type("number") g: number
    @type("number") b: number
    @type("number") a: number
}


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
    REMOVE_WEAPONS_BUILD_MODE = 'remove_weapons_build_mode',

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
    ADD_WORLD_ASSETS = 'add_world_assets',
    DELETE_WORLD_ASSETS = 'delete_world_assets',
    CHUNK_SEND_ASSETS ='chunk_send_assets',
    CHUNK_WAREHOUSE_ASSETS ='chunk_warehouse_assets',
    SAVE_WAREHOUSE = 'save_warehouse',
    WAREHOUSE_ITEM_TRANSFORM = 'warehouse_item_tranform',
    WAREHOUSE_ADD_TRIGGER = 'warehouse_add_trigger',
    DOWNLOAD_IWB_ASSET = 'download_iwb_asset', 

    // Scene
    SCENE_SAVE_NEW = "scene_save_new",
    SCENE_ADD_ITEM = 'scene_add_item',
    SCENE_ADDED_NEW = "scene_added_new",
    SCENE_DROPPED_GRABBED = 'scene_dropped_grabbed',
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
    SCENE_ACTION = 'scene_action',
    SCENE_DELETE_GRABBED_ITEM = 'scene_delete_grabbed_item',
    SCENE_CREATE_QUEST = 'scene_create_quest',
    SCENE_DELETE_QUEST = 'scene_delete_quest',

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
    WORLD_ADD_BP = 'world_add_build_permissions',
    WORLD_DELETE_BP = 'world_delete_build_permissions',
    WORLD_ADD_BAN = 'world_add_ban',
    WORLD_DELETE_BAN = 'world_delete_ban',
    GET_MARKETPLACE = 'get_marketplace',
    FORCE_BACKUP = 'force_backup',
    EXPORT_WORLD = 'export_world',

    CUSTOM = "custom",
    IWB_VERSION_UPDATE ='iwb_version_update',

    VERIFY_ACCESS = 'verify_access',

    //AUDIUS SPECIFIC ACTIONS
    PLAY_AUDIUS_TRACK = 'play_audius_track',

    //REMOTE SERVER ACTIONS
    CLAIM_REWARD = 'claim_reward',

    //GAMING
    START_GAME = 'start_game',
    END_GAME = 'end_game',
    CREATE_GAME_LOBBY = 'create_game_lobby',
    GAME_FINISHED_EARLY = 'game_finished_early',
    WIN_GAME = 'win_game',
    GAME_TIED = 'game_tied',
    LEADERBOARD_UPDATE = 'leaderboard_update',
    GAME_ACTION = 'game_action',

    HIT_OBJECT = 'hit_object',
    SHOOT = 'shoot',


    //QUESTING
    GET_QUEST_DEFINITIONS = 'get_quest_definitions',
    QUEST_EDIT = 'edit_quest',
    QUEST_ACTION = 'quest_action',
    QUEST_PLAYER_DATA = 'quest_player_data',
    QUEST_STEP_DATA = 'quest_step_data'
}

export enum SCENE_MODES {
    PLAYMODE,
    CREATE_SCENE_MODE,
    BUILD_MODE
}

export enum VIEW_MODES {
    AVATAR,
    GOD
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
    MATERIAL_COMPONENT = "Material",
    TRANSFORM_COMPONENT = "Transform",
    NFT_COMPONENT = "NFT_Shape",
    TEXT_COMPONENT = "Text",
    TRIGGER_COMPONENT = "Triggers",
    ACTION_COMPONENT = 'Actions',
    CLICK_AREA_COMPONENT = "Click_Area",
    ANIMATION_COMPONENT = "Animator",
    DIALOG_COMPONENT = 'Dialog',
    REWARD_COMPONENT ='Reward',
    PARENTING_COMPONENT = 'Parenting',
    NAMES_COMPONENT ='Name',
    POINTER_COMPONENT = 'Pointers',
    UI_TEXT_COMPONENT = 'UI_Text',
    UI_IMAGE_COMPONENT ='UI_Image',
    COUNTER_COMPONENT = 'Counters',
    GLTF_COMPONENT = 'Gltf',
    STATE_COMPONENT ='States',
    AUDIO_SOURCE_COMPONENT = 'Audio_Source',
    AUDIO_COMPONENT = 'Audio',
    AUDIO_STREAM_COMPONENT = 'Audio_Stream',
    IWB_COMPONENT = 'IWB',
    MESH_RENDER_COMPONENT = 'Mesh_Renderer',
    MESH_COLLIDER_COMPONENT = 'Mesh_Collider',
    TEXTURE_COMPONENT = 'Texture',
    AVATAR_SHAPE_COMPONENT = 'Avatar_Shape',
    GAME_COMPONENT = 'Game',
    LEVEL_COMPONENT = 'Levels',
    BILLBOARD_COMPONENT = 'Billboard',
    LIVE_COMPONENT = 'Live',
    TEAM_COMPONENT = 'Team',
    GAME_ITEM_COMPONENT = 'GameItem',
    GAME_ROOM_COMPONENT = 'gaming',
    PLAYLIST_COMPONENT ='Playlist',
    PATH_COMPONENT = 'Path',
    VLM_COMPONENT = 'VLM',
    MULTIPLAYER_COMPONENT = 'Multiplayer',
    LEADERBOARD_COMPONENT = 'Leaderboard',
    VEHICLE_COMPONENT = 'Vehicle',
    PHYSICS_COMPONENT = 'Physics',
    QUEST_COMPONENT = 'Quest',
    WEAPON_COMPONENT = 'Weapon',
    VIRTUAL_CAMERA = 'Camera'
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
    STOP_TWEEN = 'tween_stop',
    START_TWEEN = "tween_start",
    PLAY_SOUND = "audio_play",
    STOP_SOUND = "audio_stop",
    SET_VISIBILITY = "entity_visiblity_change",
    ATTACH_PLAYER = "player_attach",
    DETACH_PLAYER = "player_detach",
    PLAY_VIDEO = 'video_play',
    // TOGGLE_VIDEO = 'video_toggle',
    PLAY_VIDEO_STREAM = 'video_stream_play',
    STOP_VIDEO = 'video_stop',
    STOP_VIDEO_STREAM = 'video_stream_stop',
    PLAY_AUDIO_STREAM = 'audio_stream_play',
    STOP_AUDIO_STREAM = 'audio_stream_stop',
    TELEPORT_PLAYER = 'player_teleport',
    EMOTE = 'player_emote',
    OPEN_LINK = 'open_link',
    SHOW_TEXT = 'ui_text_show',
    HIDE_TEXT = 'ui_text_hide',
    START_DELAY = 'delay_start',
    STOP_DELAY = 'delay_stop',
    START_LOOP = 'loop_start',
    STOP_LOOP = 'loop_stop',
    CLONE = 'entity_clone',
    REMOVE = 'entity_remove',
    // SHOW_IMAGE = 'show_image',
    // HIDE_IMAGE = 'hide_image',
    PLAY_ANIMATION = 'animation_start',
    STOP_ANIMATION = 'animation_stop',
    SHOW_DIALOG ='dialog_show',
    HIDE_DIALOG = 'dialog_hide',
    ENABLE_CLICK_AREA = 'click_area_enable',
    DISABLE_CLICK_AREA = 'click_area_disable',
    ENABLE_TRIGGER_AREA = 'trigger_area_enable',
    DISABLE_TRIGGER_AREA = 'trigger_area_disable',
    GIVE_REWARD = 'reward_give',
    VERIFY_ACCESS = 'access_verify',
    ADD_NUMBER = 'number_add',
    SET_NUMBER = 'number_set',
    SUBTRACT_NUMBER = 'number_subtract',
    LOAD_LEVEL = 'level_load',
    END_LEVEL = 'level_end',
    COMPLETE_LEVEL = 'level_win',
    ADVANCED_LEVEL = 'level_advance',
    LOSE_LEVEL = 'level_lose',
    START_TIMER = 'timer_start',//
    STOP_TIMER = 'timer_stop',
    LOCK_PLAYER = 'player_lock',
    UNLOCK_PLAYER = 'player_lock',
    SET_POSITION = 'entity_set_position',
    SET_ROTATION = 'entity_set_rotation',
    SET_SCALE = 'entity_set_scale',//
    SET_STATE = 'state_set',
    MOVE_PLAYER = 'player_move',
    SHOW_NOTIFICATION = 'notification_show',
    HIDE_NOTIFICATION = 'notification_hide',
    PLACE_PLAYER_POSITION = 'entity_place_player_position',
    BATCH_ACTIONS = 'actions_batch',
    RANDOM_ACTION = 'actions_random',
    SET_TEXT = 'text_set',
    SHOW_CUSTOM_IMAGE = 'ui_image_show',
    HIDE_CUSTOM_IMAGE = 'ui_image_hide',
    ATTEMPT_GAME_START = 'game_start_attempt',
    END_GAME = 'game_end',
    PLAY_PLAYLIST = 'playlist_play',
    SEEK_PLAYLIST = 'playlist_seek',
    STOP_PLAYLIST = 'playlist_stop',
    POPUP_SHOW = 'popup_show',
    POPUP_HIDE = 'popup_hide',
    RANDOM_NUMBER ='random_number',
    QUEST_ACTION = 'quest_action',
    QUEST_START = 'quest_start',
    PLAYER_EQUIP_WEAPON = 'player_equip_weapon',
    PLAYER_UNEQIP_WEAPON = 'player_unequip_weapon',
    FORCE_CAMERA = 'player_camera_force',
    REMOVE_FORCE_CAMERA = 'player_camera_force_remove',
    ENABLE_PHYSICS = 'physics_enable',
    DISABLE_PHYSICS = 'physics_disable',
    ENTER_VEHICLE = 'vehicle_enter',
    EXIT_VEHICLE = 'vehicle_exit'
}

export enum Triggers {
    ON_CLICK = "on_click",
    ON_ENTER = "on_enter",
    ON_LEAVE = "on_leave",



    //new triggers
    ON_ACCESS_VERIFIED ='on_access_verified',
    ON_ACCESS_DENIED ='on_access_denied',
    ON_INPUT_ACTION = 'on_input_action',
    // ON_TWEEN_END,
    // ON_DELAY,
    // ON_LOOP
    // ON_CLONE
    // ON_CLICK_IMAGE
    // ON_DAMAGE
    // ON_GLOBAL_CLICK
    // ON_TICK
    // ON_HEAL//s
    ON_STATE_CHANGE = "on_state_change",
    ON_COUNTER_CHANGE = "on_counter_change",
    ON_RAYCAST_HIT = 'on_raycast_hit',
    ON_GAME_START = 'on_game_start',
    ON_LEVEL_LOADED = 'on_level_loaded',
    ON_LEVEL_COMPLETE = 'on_level_complete',
    ON_LEVEL_END = 'on_level_end',
    ON_JOIN_LOBBY = 'on_join_lobby',
    ON_CLOCK_TICK = 'on_scene_tick',
}

export enum TriggerConditionOperation {
    AND = 'and',
    OR = 'or',
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

export enum TRIGGER_TYPES {
    ON_INPUT_ACTION = 'on_input_action'
}

export enum CATALOG_IDS {
    GAME_COMPONENT = "e7a63c71-c2ba-4e6d-8e62-d77e2c8dc93a",
    EMPTY_ENTITY = "b9768002-c662-4b80-97a0-fb0d0b714fab"
}

export enum GAME_TYPES {
    SOLO,
    MULTIPLAYER,
}

export enum PLAYER_GAME_STATUSES {
    NONE = 'none',
    PLAYING = 'playing',
    LOBBY = 'lobby',
    WAITING = 'waiting',
    ELIMINATED = 'eliminated'
}

export interface PlayerQuest {
    id: string;                // Quest ID
    started:boolean,
    status: 'in-progress' | 'completed' | 'failed';  // Quest status
    startedAt?: number;        // Optional: Timestamp when the quest was started
    completedSteps: string[];  // Array of step IDs the player has completed
    currentStep: string;       // The current step the player is working on
    currentRepeats:number
  }


// Enum for prerequisite types
export enum PrerequisiteType {
    Level = 'level',
    Time = 'time',
    Item = 'item',
    QuestCompletion = 'quest_completion',
    StepCompletion = 'step_completion',
    Cooldown = 'cooldown',
    Repeatable = 'repeatable'
  }
  
  // Base type for all prerequisites
  export type BasePrerequisite = {
    id: string;            // Unique identifier for the prerequisite
    description: string;   // Human-readable description of the prerequisite
    world:string
  };
  
  // Level prerequisite
  export interface LevelPrerequisite extends BasePrerequisite {
    type: PrerequisiteType;
    value: number;  // Minimum level required
    world:string
  }
  
  // Time-based prerequisite
  export interface TimePrerequisite extends BasePrerequisite {
    type: PrerequisiteType
    value: string;  // ISO timestamp or duration string
    world:string
  }
  
  // Item possession prerequisite
  export interface ItemPrerequisite extends BasePrerequisite {
    type: PrerequisiteType
    value: string;  // Item ID or name required
    world:string
  }
  
  // Quest completion prerequisite
  export interface QuestCompletionPrerequisite extends BasePrerequisite {
    type: PrerequisiteType
    value: string;  // Quest ID that must be completed
    world:string
  }
  
  // Step completion prerequisite
  export interface StepCompletionPrerequisite extends BasePrerequisite {
    type: PrerequisiteType
    questId: string;
    value: string;  // Step ID that must be completed
    world:string
  }
  
  // Cooldown prerequisite (time until the quest can be repeated)
  export interface CooldownPrerequisite extends BasePrerequisite {
    type: PrerequisiteType
    value: number;  // Cooldown in seconds
    lastCompleted: number;  // ISO timestamp of when the quest was last completed
    world:string
  }
  
  // Repeatable quest prerequisite with a maximum number of repetitions
  export interface RepeatablePrerequisite extends BasePrerequisite {
    type: PrerequisiteType
    value: string,
    questId: string;        // Whether the quest is repeatable
    maxRepeats: number;   // Maximum number of times the quest can be repeated
    world:string
  }
  
  
  // Union type for all prerequisite types
  export type QUEST_PREREQUISITES =
    | LevelPrerequisite
    | TimePrerequisite
    | ItemPrerequisite
    | QuestCompletionPrerequisite
    | StepCompletionPrerequisite
    | CooldownPrerequisite
    | RepeatablePrerequisite
  
  
  // Quest step type definition
  export interface QuestStep {
    id: string;
    description: string;
    type: 'interaction' | 'collection' | 'combat' | 'exploration' | 'branching';
    prerequisites: QUEST_PREREQUISITES[];  // Prerequisites for each step
    options?: QuestStep[];  // Used for branching quests
    target?: string;  // Target for combat or collection steps
    quantity?: number;  // Used for collection steps
    order?: boolean
  }
  
  // Quest rewards type
  export interface QuestRewards {
    xp: number;
    items: string[];
  }
  
  // Main Quest interface
  export interface Quest {
    id: string;
    name: string;
    scene: string,
    description: string;
    world:string
    prerequisites: QUEST_PREREQUISITES[];  // Quest-level prerequisites
    steps: QuestStep[];  // Array of quest steps
    rewards: QuestRewards;
  }
  
  