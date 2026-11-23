import path from 'node:path';
import {stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {startProdServer} from './node_modules/vinext/dist/server/prod-server.js';

const {server}=await startProdServer({port:Number(process.env.PORT??9600),host:process.env.HOST??'0.0.0.0',outDir:path.resolve(process.cwd(),'dist')});
const original=server.listeners('request');
server.removeAllListeners('request');
const root='/home/web/lumo-demo/current';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.wav':'audio/wav','.json':'application/json'};
server.on('request',(req,res)=>{
 const pathname=(req.url??'/').split('?')[0];
 if(pathname!=='/lumo'&&!pathname.startsWith('/lumo/')){for(const handle of original)handle.call(server,req,res);return}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return}
 if(pathname==='/lumo'){res.writeHead(308,{Location:'/lumo/','Cache-Control':'no-store'});res.end();return}
 serve(req,res,pathname).catch(()=>{if(!res.headersSent){res.writeHead(500);res.end('Internal Server Error')}else res.destroy()});
});
async function serve(req,res,pathname){
 let relative;try{relative=decodeURIComponent(pathname.slice('/lumo/'.length))}catch{res.writeHead(400);res.end();return}
 if(relative.includes('\0')||relative.split('/').some(p=>p==='..'||p.startsWith('.'))){res.writeHead(404);res.end();return}
 let file=path.resolve(root,relative||'index.html');
 if(!file.startsWith(root+'/')){res.writeHead(404);res.end();return}
 let info;try{info=await stat(file)}catch{}
 if(!info?.isFile()){
  if(path.extname(relative)){res.writeHead(404);res.end('Not Found');return}
  file=path.join(root,'index.html');info=await stat(file);
 }
 const ext=path.extname(file);
 res.writeHead(200,{'Content-Type':types[ext]??'application/octet-stream','Content-Length':info.size,'Cache-Control':ext==='.html'?'no-store':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'});
 if(req.method==='HEAD'){res.end();return}
 createReadStream(file).on('error',()=>res.destroy()).pipe(res);
}
