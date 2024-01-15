import path from "path";

export function pagesRouter(router:any){  
    router.get('/:user/:key', (req:any, res:any) => {
        console.log('load asset creator page')
        res.sendFile(path.join(__dirname, '..', '..', '..', 'public', 'index.html'));
    });
}