(() => {
'use strict';
const root=document.getElementById('mpa-maintenance-preview');
const q=selector=>root.querySelector(selector);
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const canvas=q('#maintenance-scene'),ctx=canvas.getContext('2d');
const C={blue:'#6e9fc8',deep:'#3b78ad',pale:'#edf6fd',line:'#cce1f1',orange:'#dc9972',red:'#e77778',paper:'#ffffff'};
function line(points,color=C.blue,w=1.4){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle=color;ctx.lineWidth=w;ctx.stroke();}
function rect(x,y,w,h,fill,stroke,r=0){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.4;ctx.stroke();}}
function circle(x,y,r,fill,stroke){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.4;ctx.stroke();}}
function poly(points,fill,stroke){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.4;ctx.stroke();}}
function cloud(x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);circle(0,0,12,'#f8fcff',C.line);circle(18,-9,21,'#f8fcff',C.line);circle(41,-2,16,'#f8fcff',C.line);circle(55,7,10,'#f8fcff',C.line);rect(-12,6,78,18,'#fff');ctx.restore();}
function tree(x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-32,-28,-19,-49,0,-70);ctx.bezierCurveTo(25,-46,28,-22,0,0);ctx.fillStyle=C.blue;ctx.fill();line([[0,10],[0,-54]],'#e6f2fa');line([[0,-17],[-10,-32]],'#e6f2fa');line([[0,-30],[11,-42]],'#e6f2fa');ctx.restore();}
function cone(x,y,s){poly([[x,y],[x+7*s,y-24*s],[x+14*s,y]],C.red);line([[x+3*s,y-9*s],[x+11*s,y-9*s]],'#fff',3*s);rect(x-3*s,y,20*s,3*s,C.red);}
function draw(t){
 const width=canvas.clientWidth,height=width*350/900,dpr=Math.min(window.devicePixelRatio||1,2);
 if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}
 ctx.setTransform(canvas.width/900,0,0,canvas.height/350,0,0);ctx.clearRect(0,0,900,350);ctx.lineCap='round';ctx.lineJoin='round';
 // Quiet city silhouette, with ample open sky.
 poly([[170,312],[170,240],[215,240],[215,202],[250,202],[250,179],[298,179],[320,155],[344,179],[360,179],[360,122],[380,122],[380,110],[408,110],[408,126],[430,126],[430,312]],C.pale);
 poly([[440,312],[440,170],[453,170],[453,74],[463,139],[494,163],[500,312]],C.pale);
 poly([[540,312],[540,235],[558,235],[558,188],[570,188],[580,156],[590,188],[604,188],[604,235],[625,235],[625,312]],C.pale);
 cloud(225+Math.sin(t*.24)*14,121,.65);cloud(697+Math.sin(t*.18+2)*20,140,.85);cloud(414+Math.sin(t*.22+1)*13,83,.42);
 line([[105,313],[802,313]],C.blue,1.7);
 // Laptop and phone.
 rect(267,191,244,120,'#fff',C.deep,9);rect(276,201,226,108,'#fbfdff',C.line,2);
 rect(290,215,44,5,'#edf4f9');rect(290,226,27,3,'#edf4f9');
 rect(291,287,38,3,'#edf4f9');rect(459,218,27,3,'#edf4f9');
 poly([[247,312],[530,312],[522,320],[259,320]],'#e9f4fc',C.deep);rect(371,312,37,3,C.deep,null,2);
 rect(496,234,54,79,'#fff',C.blue,8);rect(502,247,42,57,'#f6fbff',C.line,1);line([[518,240],[530,240]],C.line,2);
 // Lattice crane.
 rect(590,66,25,237,null,C.blue);for(let y=67;y<297;y+=21){line([[590,y],[615,Math.min(303,y+21)],[590,Math.min(303,y+42)]],C.blue,1);}
 poly([[579,303],[579,224],[590,209],[615,209],[626,224],[626,303]],null,C.blue);
 for(let y=227;y<295;y+=19)line([[580,y],[625,Math.min(303,y+19)],[580,Math.min(303,y+38)]],C.blue,1);
 rect(570,304,69,8,'#d8eafa',C.blue,2);
 rect(272,59,470,12,'#fff',C.blue,4);for(let x=278;x<728;x+=22){line([[x,60],[x+11,70],[x+22,60]],C.blue,1);}
 rect(596,10,13,42,'#fff',C.blue);for(let y=12;y<44;y+=10)line([[596,y],[609,y+10],[596,y+20]],C.blue,1);
 line([[272,59],[602,12],[742,59]],C.orange,1);poly([[589,59],[596,52],[609,52],[616,59]],'#fff',C.blue);
 rect(711,64,17,31,'#e5aa77');rect(731,64,9,17,'#edbc8e');
 // Moving carriage, cable and gently swaying suspended components.
 const carriageX=399+Math.sin(t*.4)*24, liftY=247+Math.sin(t*.65)*10;
 rect(carriageX-9,64,18,27,'#e5aa77');line([[carriageX,91],[carriageX,liftY-91]],C.orange,1.8);
 ctx.save();ctx.translate(carriageX,liftY-91);ctx.rotate(Math.sin(t*.65)*.025);rect(-3,-5,6,14,C.orange);line([[0,7],[-33,92],[33,92],[0,7]],C.orange,1.7);
 rect(-36,91,72,6,'#e5aa77');rect(-28,81,12,10,'#9bbcd8');rect(-11,72,13,19,C.deep);rect(5,60,12,31,C.deep);rect(21,80,10,11,'#8cb3d2');ctx.restore();
 // Ladder and landscaping.
 line([[466,312],[466,265],[477,265],[477,312]],C.orange);for(let y=273;y<312;y+=9)line([[466,y],[477,y]],C.orange);
 tree(240,303,.77);tree(666,305,.78);tree(688,306,.55);cone(302,309,.7);cone(557,310,.5);cone(790,310,.5);
 rect(164,286,57,13,'#fff',C.line);ctx.save();ctx.beginPath();ctx.rect(164,286,57,13);ctx.clip();for(let x=155;x<225;x+=17)poly([[x,299],[x+12,286],[x+20,286],[x+8,299]],C.red);ctx.restore();line([[170,300],[170,311]],C.orange);line([[216,300],[216,311]],C.orange);
 // Mixer truck: drum rotation is deliberately slow.
 ctx.save();ctx.translate(708,289);rect(-24,8,75,10,'#eaf4fc',C.blue,2);poly([[-53,8],[-53,-10],[-44,-23],[-28,-23],[-24,8]],'#f7fbff',C.blue);poly([[-47,-9],[-40,-18],[-31,-18],[-31,-6],[-47,-6]],'#e3f1fc',C.blue);
 ctx.save();ctx.translate(12,-9);ctx.rotate(-.23);ctx.beginPath();ctx.ellipse(0,0,34,18,0,0,Math.PI*2);ctx.fillStyle='#f5faff';ctx.fill();ctx.strokeStyle=C.blue;ctx.stroke();ctx.save();ctx.beginPath();ctx.ellipse(0,0,34,18,0,0,Math.PI*2);ctx.clip();for(let i=-1;i<3;i++){let x=(i*24+t*9)%84-42;line([[x-10,-24],[x+10,24]],'#b7d3e8',3);}ctx.restore();ctx.restore();line([[43,-16],[49,-21],[56,-21]],C.blue,2);
 [-36,13,38].forEach(x=>{circle(x,18,10,C.blue);circle(x,18,6,'#e3f0fa');circle(x,18,2,C.deep);});ctx.restore();
}

if(!ctx) return;
let last=0,sceneTime=0,frameId=0;
function frame(now){
 frameId=0;
 if(!root.isConnected) return;
 const dt=last?Math.min((now-last)/1000,.12):0;last=now;
 if(!document.hidden){if(!reduced.matches)sceneTime+=dt;draw(sceneTime);}
 if(!reduced.matches)frameId=requestAnimationFrame(frame);
}
function start(){last=0;if(!frameId)frameId=requestAnimationFrame(frame);}
reduced.addEventListener('change',()=>{q('.mpa-page').classList.toggle('motion-off',reduced.matches);start();});
new ResizeObserver(()=>{if(reduced.matches)draw(sceneTime);}).observe(canvas);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)start();});
q('.mpa-page').classList.toggle('motion-off',reduced.matches);
start();
})();
