

export enum SERVER_MESSAGE_TYPES {
    INIT = "init",
    PLAYER_LEAVE = "player_leave",
    SELECT_PARCEL = "select_parcel",
    REMOVE_PARCEL = "remove_parcel",
    CATALOG_UPDATED = 'catalog_updated',
    PLAY_MODE_CHANGED = 'play_mode_changed',
    PLAYER_ASSET_UPLOADED = 'player_asset_uploaded',
    PLAYER_ASSET_CATALOG = 'player_asset_catalog',
    PLAYER_CATALOG_DEPLOYED = 'player_catalog_deployed',
    PLAYER_RECEIVED_MESSAGE = 'player_received_message',
    PLAYER_SCENES_CATALOG = 'player_scenes_catalog',
}

export enum SCENE_MODES {
    PLAYMODE,
    CREATE_SCENE_MODE,
    BUILD_MODE
}

export type PlayerData = {
    dclData:any | null,
    mode: SCENE_MODES,
    buildMode:number | null,
}