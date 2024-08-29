

export type DeploymentData = {
    worldName:string,
    owner:string,
    ens:string
    init:boolean
    url?:string   
}

export type DCLDeploymentData = {
    scene:any,
    dest:string,
    name: string,
    worldName:string,
    user: string,
    parcel: string,
    tokenId: string,
}

export enum SERVER_MESSAGE_TYPES {
    INIT = "init",
    PLAYER_LEAVE = "player_leave",

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
    
    CUSTOM = "custom"
}

export enum REQUIRED_ASSETS {
    SELECTION_POINTER = "40e64954-b84f-40e1-ac58-438a39441c3e.glb",
    ATLAS_1 = "atlas1.png",
    ATLAS_2 = "atlas2.png",
    BLANK_GRASS = "a20e1fbd-9d55-4536-8a06-db8173c1325e.glb",
    SCIFI_PACK_TRANSPARENT = "SciFiPackTransp_TX.png",
    FANTASY_PACK = "FanstasyPack_TX.png",
    PIRATES_PACK = "PiratesPack_TX.png.png",
    PIRATES_PACK2 = "PiratesPack_TX.png",
    SCIFI_PACK = "SciFiPack_TX.png",
    FLOOR_DIRT = "FloorBaseDirt 01.png",
    FLOOR_DIRT_2 = "FloorBaseDirt 02.png",
    FLOOR_DIRT_02 = "Floor_Dirt02.png.png",
    FLOOR_DIRT_03 = "Floor_Dirt03.png.001.png",
    FLOOR_GRASS_01 = "Floor_Grass01.png.png",
    FLOOR_GRASS = "FloorBaseGrass 01.png",
    FLOOR_GRASS_2 = "FloorBaseGrass 02.png",
    FLOOR_CONCRETE = 'FloorBaseConcrete 01.png',
    FLOOR_DESERT = 'FloorBaseDesert 01.png',
    FLOOR_PEBBLES = 'FloorBasePebbles 01.png',
    FLOOR_SAND = 'FloorBaseSand 01.png',
    FLOOR_TILES = 'FloorBaseTiles 01.png',
    FLOOR_WOOD = 'FloorBaseWood 01.png',
    FLOOR_FANTASY_ROCK = 'FloorFantasyRocks 01.png',
    GROUND_FLOOR_SCIFI = 'GroundFloorSciFi 01.png',
    SCIFI_FLOOR_RED = 'SciFi_Floor_Red2.png',
    SCIFI_FLOOR_VIOLET = 'SciFi_Floor_Violet.png',
    FILE1 = 'file1.png',

    //smart items
    VIDEO = 'bb3b0edf-377b-438b-80af-bd199455a9bb',
    UI_IMAGE = '4b245184-2862-4d92-8f96-58493b87e7bf',
    UI_TEXT = '13b63e57-a636-4cf2-8449-488a5fd6d03e.png',
    IMAGE = 'e6991f31-4b1e-4c17-82c2-2e484f53a123',
}
