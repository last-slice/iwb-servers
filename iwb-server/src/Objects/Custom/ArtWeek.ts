import { queueBackup } from ".";
import { iwbManager } from "../../app.config";
import { IWBRoom } from "../../rooms/IWBRoom";

export function createArtWeekRouters(router:any){
    router.get('/custom/artweek/get', (req:any, res:any) => {
        res.status(200).send({valid: true, artweek: iwbManager.customKeys['Artweek']})
    });

    router.post('/custom/artweek/add/:auth', (req:any, res:any) => {
        console.log('adding artweek artist', req.body)
        //need to check auth
        if(!req.params.auth || req.params.auth !== process.env.IWB_UPLOAD_AUTH_KEY){
            res.status(200).send({valid: false, msg: "Invalid Auth"})
            return
        }
        addArtist(req, res)
    });

    router.get('/custom/artweek/remove/:artist/:auth', (req:any, res:any) => {
        console.log('removing artweek artist', req.params.artist)
        //need to check auth
        if(!req.params.auth || req.params.auth !== process.env.IWB_UPLOAD_AUTH_KEY){
            res.status(200).send({valid: false, msg: "Invalid Auth"})
            return
        }
        removeArtist(req, res)
    });
}

function addArtist(req:any, res:any){
    req.body.wallet = req.body.wallet.toLowerCase()
    if(!iwbManager.customKeys['Artweek'].artists.find((artist:any)=>artist.wallet === req.body.artist)){
        iwbManager.customKeys['Artweek'].artists.push(req.body)

        res.status(200).send({valid: true, msg: "Artist Added"})
        queueBackup()
    }else{
        res.status(200).send({valid: false, msg: "Artist Already Added"})
    }
}

function removeArtist(req:any, res:any){
    iwbManager.customKeys['Artweek'].artists = iwbManager.customKeys['Artweek'].artists.filter((artist:any)=>artist.wallet !== req.params.artist.toLowerCase())
    console.log(iwbManager.customKeys['Artweek'])
    res.status(200).send({valid: true, msg: "Artist Removed"})
    queueBackup()
}