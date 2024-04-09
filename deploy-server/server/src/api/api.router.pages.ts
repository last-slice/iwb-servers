import path from "path";

export function pagesRouter(router:any){  
    router.get('/:user/:dest/:bucket/:name/:id/:auth', (req:any, res:any) => {
        console.log('load deploy page')
        res.sendFile(path.join('/root', 'iwb-deployment', 'dapps', 'deploy', 'index.html'));
    });
}