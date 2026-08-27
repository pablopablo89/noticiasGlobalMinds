const http=require('http'),fs=require('fs'),path=require('path');
const root=__dirname;const types={'.html':'text/html','.json':'application/json','.js':'text/javascript','.css':'text/css'};
http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);if(p==='/')p='/index.html';
const fp=path.join(root,p);fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);res.end('404');return;}
res.writeHead(200,{'Content-Type':types[path.extname(fp)]||'text/plain'});res.end(d);});}).listen(4321,()=>console.log('http://localhost:4321'));
