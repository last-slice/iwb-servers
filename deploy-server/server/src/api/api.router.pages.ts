import path from "path";

export function pagesRouter(router:any){  
    router.get('/deploy/:user/:dest/:bucket/:name/:id/:auth', (req:any, res:any) => {
        console.log('load deploy page')
        res.sendFile(path.join('/root', 'iwb-deployment', 'dapps', 'deploy', 'index.html'));
    });

    router.get('/upload/:user/:key', (req:any, res:any) => {
        console.log('load deploy page')
        res.sendFile(path.join('/root', 'iwb-deployment', 'dapps', 'upload', 'index.html'));
    });
}