import { Player } from "../Objects/Player"
import { pushPlayfabEvent, PLAYFAB_DATA_ACCOUNT } from "../utils/Playfab"
import { SERVER_MESSAGE_TYPES } from "../utils/types"
import { IWBGameRoom } from "./IWBGameRoom"

export class GameManager {

    room:IWBGameRoom

    minPlayers:number = 1
    maxPlayers:number = 8
    numPlayers:number = 0

    pods:any[] = []

    countdownTimer:any
    countdownInterval:any
    countdownBase:number = 10
    countdownTime:number = this.countdownBase

    gameTimeBase:number = 60
    gameResetTimeBase:number = 12

    haveMinPlayers:boolean = false

    leaderboards:Map<string, any> = new Map()

    constructor(gameRoom:IWBGameRoom){
        this.room = gameRoom
    }
    
    garbageCollect(){
        this.clearCountdown()
    }

    removePlayer(player:Player){
        if(this.room.state.started){
            //do other player removal things
            this.checkRemainingPlayers()
        }
    }

    checkRemainingPlayers(){
        let playing = 0

        //check how many players still left before auto end

        if(playing === 0){
            this.endGame()
        }
    }

    checkGameReady(){
        // if(this.room.state.pods.filter(pod => pod.locked).length >= this.minPlayers && !this.room.state.startingSoon){
        //     console.log("we have minimum players, begin game")
            
        //     if(this.haveMinPlayers){
        //         this.clearCountdown()
        //         this.room.state.gameCountdown = -500
        //     }else{
        //         this.haveMinPlayers = true
        //     }

        //     this.room.state.gameCountdown = 10
        //     this.countdownInterval = setInterval(()=>{
        //         this.room.state.gameCountdown--
        //       }, 1000)

        //     this.countdownTimer = setTimeout(()=>{
        //         this.clearCountdown()

        //         this.room.state.startingSoon = true
        //         this.startGameCountdown()
        //       }, 1000 * 10)
        // }
    }

    clearCountdown(){
        clearTimeout(this.countdownTimer)
        clearInterval(this.countdownInterval)
    }

    startGameCountdown(){
        this.room.state.gameCountdown = -500
        this.room.state.gameCountdown = this.countdownTime

        this.countdownTimer = setTimeout(()=>{
            this.room.state.gameCountdown = -500
            this.clearCountdown()
            this.startGame()
          }, 1000 * this.countdownTime)
            
          this.countdownInterval = setInterval(()=>{
            this.room.state.gameCountdown--
          }, 1000)
    }

    startGame(){
        console.log('starting game')
       
        this.room.state.reset = false
        this.room.state.ended = false
        this.room.state.started = true

        this.startForceEndTimer()
    }

    async endGame(){
        this.room.state.ended = true
        this.clearCountdown()

        this.room.state.players.forEach((player:Player)=>{
            player.playingGame = false
            // player.sendPlayerMessage(SERVER_MESSAGE_TYPES.PLAYER_SCORES, {pigs: pod.pigsFlown, targets: pod.targetsHit})
            // player.saveToDB()
        })

        pushPlayfabEvent(SERVER_MESSAGE_TYPES.END_GAME, PLAYFAB_DATA_ACCOUNT, {})

        await this.determineWinner()

        this.countdownTime = this.gameResetTimeBase
        this.countdownTimer = setTimeout(()=>{
            this.clearCountdown()
            this.resetGame()
          }, 1000 * this.countdownTime)

        console.log('game over')
    }

    determineWinner(){
        let highscore = 0
        let winner = ""
        let winnerId = ""
        // this.room.state.pods.forEach((pod, i:number)=>{
        //     if(pod.locked){
        //         if(pod.score === highscore){
        //             winner = "tie"
        //             pushPlayfabEvent(SERVER_MESSAGE_TYPES.GAME_TIED, PLAYFAB_DATA_ACCOUNT, {})
        //         }else{
        //             if(pod.score > highscore){
        //                 highscore = pod.score
        //                 winner = pod.name
        //                 winnerId = pod.id
        //             }
        //         }
        //     }
        // })
        this.room.state.winner = winner
        this.room.state.winnerId = winnerId

        // if(winner !== "tie"){
        //     let player = this.room.state.players.get(winnerId)
        //     if(player && this.numPlayers > 1){
        //         player.increaseValueInMap(player.stats, SERVER_MESSAGE_TYPES.WIN_GAME, 1)
        //     }
        // }
    }

    resetPlayers(){
        this.room.state.players.forEach((player)=>{
            //do player cleanup
        })
    }

    resetGame(){
        this.resetPlayers()
        this.numPlayers = 0
        this.haveMinPlayers = false
        this.room.state.reset = true
        this.room.state.winner = ""
        this.room.state.winnerId = ""

        this.countdownTime = this.gameResetTimeBase
        this.countdownTimer = setTimeout(()=>{
            this.clearCountdown()
            this.room.state.started = false
            this.room.state.ended = false
            this.room.state.startingSoon = false
            this.countdownTime = this.countdownBase
          }, 1000 * this.countdownTime)
    }

    isGameLive(){
        return this.room.state.started && !this.room.state.ended
    }

    startForceEndTimer(){
        this.countdownTime = this.gameTimeBase
        this.countdownTimer = setTimeout(()=>{
            this.room.state.gameCountdown = -500

            pushPlayfabEvent(SERVER_MESSAGE_TYPES.GAME_FINISHED_EARLY, PLAYFAB_DATA_ACCOUNT, {})

            this.clearCountdown()
            this.endGame()
          }, 1000 * this.countdownTime)
    }

    resetForceEndTimer(){
        this.clearCountdown()
        this.startForceEndTimer()
    }
}