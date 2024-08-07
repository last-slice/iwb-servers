import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { ACTIONS, COMPONENT_TYPES, SERVER_MESSAGE_TYPES } from "../utils/types";
import { IWBRoom } from "../rooms/IWBRoom";
import { Client } from "colyseus";
import { getRandomIntInclusive } from "../utils/functions";

export class PlaylistComponent extends Schema{
    @type("number") type:number = -500 // 0 - images, 1 - video, 2 - audio
    @type("number") slideTime:number
    @type("number") playtype:number = 0 //0 - in order, 1 - shuffle
    @type("number") current:number
    @type("number") currentKeyframe:number
    @type(["string"]) meshAids:ArraySchema<string> = new ArraySchema()
    @type(["string"]) playlist:ArraySchema<string> = new ArraySchema()

    player:any
}

export function createPlaylistComponent(scene:Scene, aid:string, data?:any){
    let component:any = new PlaylistComponent()
    if(data){
        for(let key in data){
            if(key === "playlist" || key === "meshAids"){
                data[key].forEach((item:any)=>{
                    component[key].push(item)
                })
            }
            else{
                component[key] = data[key]
            }
        }
    }
    scene[COMPONENT_TYPES.PLAYLIST_COMPONENT].set(aid, component)
}

export function editPlaylistComponent(info:any, scene:Scene){
    let itemInfo = scene[COMPONENT_TYPES.PLAYLIST_COMPONENT].get(info.aid)
    if(!itemInfo){
        return
    }

    switch(info.action){
        case 'type':
            itemInfo.type = info.data
            if(itemInfo.type === 0){
                itemInfo.slideTime = 5
            }
            break;

        case 'playmode':
            itemInfo.playtype = info.data
            break;

        case 'slidetime':
            itemInfo.slideTime = info.data
            break;

        case 'playmode':
            itemInfo.playtype = info.data
            break;

        case 'edit':
            break;

        case 'additem':
            itemInfo.playlist.push(info.data)
            break;

        case 'remove':
            itemInfo.playlist.splice(info.data,1)
        break;

        case 'reorder':
            switch(info.type){
                case 'up':
                    if(info.data - 1 >= 0){
                        itemInfo.playlist = movePlaylistItem(itemInfo.playlist, info.data, info.data - 1)
                    }
                    break;

                case 'down':
                    if(info.data + 1 <= itemInfo.playlist.length){
                        itemInfo.playlist = movePlaylistItem(itemInfo.playlist, info.data, info.data + 1)
                    }
                    break;
            }
            break;
    }
}

function movePlaylistItem(arr:any, fromIndex:number, toIndex:number) {
    return arr.map((item:any, index:number) => {
        if (index === toIndex) return arr[fromIndex];
        if (index === fromIndex) return arr[toIndex];
        return item;
    });
}

export function handlePlaylistAction(room:IWBRoom, client:Client, scene:Scene, info:any){
    console.log('handling playlist action', info)

    let playlistInfo = scene[COMPONENT_TYPES.PLAYLIST_COMPONENT].get(info.playlistAid)
    if(!playlistInfo){
        return
    }

    switch(info.type){
        case ACTIONS.STOP_PLAYLIST:
         stopPlaylist(playlistInfo)
            break;

        case ACTIONS.PLAY_PLAYLIST:
            switch(playlistInfo.type){
                case 0: //images
                playImagePlaylist(room, client, scene, playlistInfo, info.meshAid)
                break;

                case 1: //videos
                break;

                case 2: //audio
                break;
            }

            break;
    }
}

export function garbageCollectPlaylist(room:IWBRoom){
    room.state.scenes.forEach((scene:Scene)=>{
        scene[COMPONENT_TYPES.PLAYLIST_COMPONENT].forEach((playlist:PlaylistComponent, aid:string)=>{
            stopPlaylist(playlist)
        })
    })
}

export function stopPlaylist(playlist:PlaylistComponent){
    clearInterval(playlist.player)
    playlist.current = undefined
    playlist.currentKeyframe = undefined
}

export function playImagePlaylist(room:IWBRoom, client:Client, scene:Scene, playlistInfo:any, meshAid:string){
    console.log('playing image playlist')
    playlistInfo.current = -1

    sendPlaylistUpdate(room, client, scene, playlistInfo, meshAid)
    playlistInfo.player = setInterval(()=>{
        sendPlaylistUpdate(room, client, scene, playlistInfo, meshAid)
    }, 1000 * playlistInfo.slideTime)
}

function sendPlaylistUpdate(room:IWBRoom, client:Client, scene:Scene, playlistInfo:any, meshAid:string){
    playlistInfo.current += 1
    let currentSlide = playlistInfo.playtype === 0 ? (playlistInfo.current > playlistInfo.playlist.length - 1 ? 0 : playlistInfo.current) : getRandomIntInclusive(0, playlistInfo.playlist.length - 1)
    console.log('current slide to play is', currentSlide)
    playlistInfo.current = currentSlide
    // room.broadcast(SERVER_MESSAGE_TYPES.SCENE_ACTION, {
    //     action:ACTIONS.PLAY_PLAYLIST,
    //     sceneId:scene.id,
    //     type:playlistInfo.type,
    //     currentSlide:currentSlide,
    //     meshAid:meshAid
    // })
}