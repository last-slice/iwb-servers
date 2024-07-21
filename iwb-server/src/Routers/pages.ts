import path from "path";

export function pagesRouter(router:any){  
    router.get('/:user/:key', (req:any, res:any) => {
        console.log('load asset creator page')
        res.sendFile(path.join('/root', 'iwb', 'dapps', 'upload', 'index.html'));
    });

    router.get('/:user/:dest/:bucket/:name/:id/:auth', (req:any, res:any) => {
        console.log('load deploy page')
        res.sendFile(path.join('/root', 'iwb-game-qa', 'dapps', 'deploy', 'index.html'));
    });

    //genesis city parcel deployment
    router.get('/:user/:dest/:type/:bucket/:name/:x/:y/:auth', (req:any, res:any) => {
        console.log('load deploy page')
        res.sendFile(path.join('/root', 'iwb-game-qa', 'dapps', 'deploy', 'index.html'));
    });

    //genesis city estate deployment
    router.get('/:user/:dest/:type/:bucket/:name/:id/:auth', (req:any, res:any) => {
        console.log('load deploy page')
        res.sendFile(path.join('/root', 'iwb-game-qa', 'dapps', 'deploy', 'index.html'));
    });
}