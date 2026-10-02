/* engine.js — Three.js scene, camera, particles, debris, sound, mesh helpers */
const G={ts:1,shake:0,hold:0,yaw:0,tick:null,deb:[]};
G.rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
G.fmt=(n,d=0)=>Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
(function(){
const view=document.getElementById('view');
const R=new THREE.WebGLRenderer({antialias:true});
R.setPixelRatio(Math.min(devicePixelRatio,2));R.shadowMap.enabled=true;view.appendChild(R.domElement);
const S=new THREE.Scene();S.background=new THREE.Color(0x0b1e3d);S.fog=new THREE.Fog(0x0b1e3d,55,150);
const C=new THREE.PerspectiveCamera(48,1,.1,400);
S.add(new THREE.HemisphereLight(0xcfe0ff,0x1a2b44,.95));
const sun=new THREE.DirectionalLight(0xffe6c4,1.1);sun.position.set(12,24,14);sun.castShadow=true;
Object.assign(sun.shadow.camera,{left:-40,right:40,top:30,bottom:-30,near:1,far:90});sun.shadow.mapSize.set(2048,2048);S.add(sun);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(500,500),new THREE.MeshStandardMaterial({color:0x14304f,roughness:.9}));
floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;S.add(floor);
const grid=new THREE.GridHelper(500,250,0x2c5b8f,0x1d3e63);grid.position.y=.01;S.add(grid);
const sp=[];for(let i=0;i<400;i++){const a=Math.random()*6.28,b=Math.random()*1.3+.1,r=200;sp.push(Math.cos(a)*Math.cos(b)*r,Math.sin(b)*r,Math.sin(a)*Math.cos(b)*r)}
const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
S.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:1.3,fog:false})));

G.stage=new THREE.Group();S.add(G.stage);
G.clear=()=>{G.deb.length=0;G.stage.traverse(o=>{if(o.geometry)o.geometry.dispose()});while(G.stage.children.length)G.stage.remove(G.stage.children[0]);G.shake=0;G.hold=0};
G.mat=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.55,metalness:.1},o));
const put=(m,x,y,z,p)=>{m.position.set(x||0,y||0,z||0);m.castShadow=m.receiveShadow=true;(p||G.stage).add(m);return m};
G.box=(w,h,d,c,x,y,z,p)=>put(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),G.mat(c)),x,y,z,p);
G.ball=(r,c,x,y,z,p)=>put(new THREE.Mesh(new THREE.SphereGeometry(r,20,14),G.mat(c)),x,y,z,p);
G.cyl=(r,h,c,x,y,z,p,axis)=>{const m=put(new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,18),G.mat(c)),x,y,z,p);if(axis==='z')m.rotation.x=Math.PI/2;if(axis==='x')m.rotation.z=Math.PI/2;return m};
G.vehicle=(len,col)=>{const g=new THREE.Group(),h=len*.28,w=len*.45;
  G.box(len,h*.8,w,col,0,h*.7,0,g);G.box(len*.5,h*.7,w*.9,0xdbe6f5,-len*.06,h*1.45,0,g);G.box(len*.04,h*.3,w*.7,0xffe9a8,len*.5,h*.8,0,g);
  [-.32,.32].forEach(x=>[-.5,.5].forEach(z=>G.cyl(h*.4,w*.16,0x1a1a1a,x*len,h*.4,z*w,g,'z')));
  G.stage.add(g);return g};
G.gate=(x,col)=>{col=col||0x4fc3b0;const g=new THREE.Group(),m=new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:.8});g.position.x=x;
  [-3.6,3.6].forEach(z=>{const p=new THREE.Mesh(new THREE.BoxGeometry(.4,5,.4),m);p.position.set(0,2.5,z);g.add(p)});
  const b=new THREE.Mesh(new THREE.BoxGeometry(.5,.5,7.6),m);b.position.y=5;g.add(b);g.glow=c=>{m.color.set(c);m.emissive.set(c)};G.stage.add(g);return g};
G.label=(t,col)=>{const cv=document.createElement('canvas');cv.width=256;cv.height=96;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthTest:false}));s.scale.set(5,1.9,1);
  s.set=(txt,c)=>{const x=cv.getContext('2d');x.clearRect(0,0,256,96);x.fillStyle='rgba(8,18,32,.8)';x.fillRect(8,14,240,64);x.strokeStyle='#ff8a3d';x.lineWidth=3;x.strokeRect(8,14,240,64);
    x.fillStyle=c||col||'#fff';x.font='bold 30px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,128,47);s.material.map.needsUpdate=true};
  s.set(t);G.stage.add(s);return s};

// particles
const PN=200,pm=[],pg=new THREE.BoxGeometry(.2,.2,.2);let pi=0;
for(let i=0;i<PN;i++){const m=new THREE.Mesh(pg,new THREE.MeshBasicMaterial({transparent:true}));m.visible=false;m.userData={v:new THREE.Vector3(),l:0};S.add(m);pm.push(m)}
G.burst=(x,y,z,col,n,s)=>{n=n||20;s=s||6;for(let i=0;i<n;i++){const m=pm[pi++%PN];m.position.set(x,y,z);m.material.color.set(col);
  m.userData.v.set((Math.random()-.5)*s,Math.random()*s*.9,(Math.random()-.5)*s);m.userData.l=1;m.visible=true}};
// debris (bricks, dummies)
G.scatter=(list,dir,pw)=>list.forEach(m=>{m.userData.dv=new THREE.Vector3(dir*(.4+Math.random())*pw,Math.random()*pw*.7,(Math.random()-.5)*pw);m.userData.sp=Math.random()*8;G.deb.push(m)});
// sound
let AC;G.beep=(f,d,t,v,s)=>{try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain(),n=AC.currentTime;d=d||.15;
  o.type=t||'sine';o.frequency.setValueAtTime(f,n);if(s)o.frequency.exponentialRampToValueAtTime(Math.max(20,f+s),n+d);g.gain.setValueAtTime(v||.12,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(n+d)}catch(e){}};
// camera
const cp=new THREE.Vector3(0,9,24),cl=new THREE.Vector3(0,2,0),tp=cp.clone(),tl=cl.clone();
G.look=(px,py,pz,lx,ly,lz,snap)=>{tp.set(px,py,pz);tl.set(lx,ly,lz);if(snap){cp.copy(tp);cl.copy(tl)}};
view.addEventListener('pointermove',e=>{if(e.buttons)G.yaw=Math.max(-.9,Math.min(.9,G.yaw-e.movementX*.005))});
const rs=()=>{const w=view.clientWidth,h=view.clientHeight;R.setSize(w,h);C.aspect=w/h;C.updateProjectionMatrix();if(w>800)C.setViewOffset(w,h,-150,0,w,h);else C.clearViewOffset()};
new ResizeObserver(rs).observe(view);rs();

let last=performance.now();
(function loop(n){requestAnimationFrame(loop);let dt=Math.min((n-last)/1000,.05);last=n;
  if(G.hold>0){G.hold-=dt;dt*=.08}
  if(G.tick)G.tick(dt*G.ts);
  for(const m of pm){if(!m.visible)continue;const u=m.userData;u.l-=dt*1.4;if(u.l<=0){m.visible=false;continue}u.v.y-=14*dt;m.position.addScaledVector(u.v,dt);m.material.opacity=u.l}
  for(const m of G.deb){const u=m.userData;if(m.position.y>.2||u.dv.y>0){u.dv.y-=22*dt;m.position.addScaledVector(u.dv,dt);m.rotation.x+=u.sp*dt;m.rotation.z+=u.sp*dt;if(m.position.y<.2){m.position.y=.2;u.dv.set(0,0,0)}}}
  cp.lerp(tp,.06);cl.lerp(tl,.06);
  const ox=cp.x-cl.x,oz=cp.z-cl.z,c=Math.cos(G.yaw),s=Math.sin(G.yaw);
  C.position.set(cl.x+ox*c+oz*s,cp.y,cl.z-ox*s+oz*c);
  G.shake*=.9;if(G.shake>.01)C.position.add(new THREE.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).multiplyScalar(G.shake));
  C.lookAt(cl);R.render(S,C)})(last);
})();