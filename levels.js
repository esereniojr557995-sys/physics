/* levels.js — six levels, one per idea in the slides. Each: init(keep) -> {controls,info}, prev(vals), go(vals) */
const {rnd,fmt}=G;
const COL={ember:0xff8a3d,blue:0x5fa8e0,teal:0x4fc3b0,red:0xe05b4f,good:0x6fbf73,brass:0xc9a86a};
const track=(a,b)=>{G.box(b-a,.2,8,0x1b2f4a,(a+b)/2,-.1,0);for(let x=a;x<b;x+=4)G.box(1.6,.02,.16,0x3d6a9c,x+2,.02,0)};
const pct=e=>Math.abs(e*100).toFixed(1)+'%';
const cam=(x,y,z,lx,snap)=>G.look(x,y,z,lx,2,0,snap);
const close=(e,tol)=>1-Math.abs(e)/tol;

const LEVELS=[
{name:'Heavy Hitter',tag:'Momentum',formula:'p = m · v',
 intro:'Smash the wall! It only breaks when your momentum is within 5% of the target. Heavy & slow or light & fast — both can hit equally hard.',
 fact:'A 9,000 kg bus at 16 m/s, a 36,000 kg train at 4 m/s and a 1,800 kg car at 80 m/s all have the same momentum: 1.44×10⁵ kg·m/s.',
 init(keep){
  if(!keep)this.T=rnd(2,12)*500*rnd(4,16);
  track(-30,14);this.bricks=[];
  for(let y=0;y<4;y++)for(let z=-2;z<=2;z++)this.bricks.push(G.box(1.2,1,1.2,(y+z)%2?0xb5654a:0xc9795c,10,.5+y,z*1.25));
  this.car=G.vehicle(4,COL.ember);this.car.position.x=-18;this.lab=G.label('');cam(-4,9,24,-4,true);this.prev({m:2000});
  return{controls:[{id:'m',label:'Vehicle mass',min:500,max:9000,step:500,val:2000,unit:' kg'},{id:'v',label:'Speed',min:2,max:40,step:1,val:10,unit:' m/s'}],
   info:v=>[['Your momentum',fmt(v.m*v.v)+' kg·m/s'],['Target momentum',fmt(this.T)+' kg·m/s'],['Off by',pct((v.m*v.v-this.T)/this.T)]]};
 },
 prev(v){const s=Math.cbrt(v.m/2000);this.car.scale.setScalar(s);this.lab.position.set(this.car.position.x,4.2*s+1.5,0);this.lab.set(fmt(v.m)+' kg')},
 go(v){const c=this.car,p=v.m*v.v,e=(p-this.T)/this.T,ok=Math.abs(e)<=.05,sp=3+v.v*.4;let vel=sp,hit=0,t=0;
  G.beep(160,.6,'sawtooth',.07,260);
  G.tick=dt=>{c.position.x+=vel*dt;this.lab.position.x=c.position.x;cam(c.position.x*.5,9,24,c.position.x*.5);
   if(!hit&&c.position.x+2*c.scale.x>=9.4){hit=1;G.hold=.25;G.shake=1.4;G.burst(9.4,2,0,COL.ember,40,10);G.beep(90,.4,'square',.2,-40);
    if(e>-.05){G.scatter(this.bricks,1,ok?13:24);vel=ok?sp*.4:sp*.8}else vel=-2.5}
   if(hit&&(t+=dt)>1.3){G.tick=null;Game.end(ok,close(e,.05),ok?'BOOM! p = '+fmt(p)+' kg·m/s matched the target.':e>0?'Overkill — '+pct(e)+' too much momentum. Lower the mass or speed.':'The wall barely noticed. Your momentum was '+pct(e)+' too low.',ok?'SMASH!':null)}}}},

{name:'Drop Zone',tag:'Free fall',formula:'h = ½ g t²',
 intro:'The crane releases a crate the instant the truck is D metres from the drop point. Choose the drop height so the crate lands on the truck bed. (g = 9.8 m/s²)',
 fact:'In free fall everything accelerates at g = 9.8 m/s², whatever its mass. Fall time depends only on height: t = √(2h/g).',
 init(keep){
  if(!keep){this.u=rnd(4,10);this.t0=rnd(10,30)/10;this.D=this.u*this.t0}
  track(-this.D-10,10);G.box(5,.05,5,COL.teal,0,.03,0);G.box(.4,16,.4,0x7d8794,-.2,8,-3);
  this.truck=G.vehicle(4,COL.blue);this.truck.position.x=-this.D;this.crate=G.box(1.2,1.2,1.2,COL.brass,0,5,0);
  this.lab=G.label('');G.look(-this.D/2,11,42,-this.D/2,5,0,true);
  return{controls:[{id:'h',label:'Drop height',min:1,max:50,step:1,val:10,unit:' m'}],
   info:v=>{const t=Math.sqrt(2*v.h/9.8);return[['Truck speed',this.u+' m/s'],['Distance D',fmt(this.D,1)+' m'],['Fall time',fmt(t,2)+' s'],['Truck covers',fmt(this.u*t,1)+' m']]}};
 },
 prev(v){const y=v.h*.3+.6;this.crate.position.y=y;this.lab.position.set(0,y+2,0);this.lab.set(v.h+' m')},
 go(v){const tf=Math.sqrt(2*v.h/9.8),T=this.truck,c=this.crate,u=this.u,gap=-this.D+u*tf,ok=Math.abs(gap)<=1.8,y0=v.h*.3+.6;let t=0,ld=0,w=0;
  G.beep(700,.6,'sine',.05,-400);
  G.tick=dt=>{t+=dt;T.position.x=-this.D+u*t;
   if(t<tf){c.position.y=y0-4.9*t*t*.3;this.lab.position.y=c.position.y+2;this.lab.set(fmt(t,2)+' s')}
   else{if(!ld){ld=1;G.shake=ok?.5:1;G.hold=.15;G.burst(ok?T.position.x:0,1,0,ok?COL.good:COL.red,30,8);G.beep(ok?520:90,.25,ok?'triangle':'square',.2)}
    c.position.y=ok?1.9:.6;if(ok)c.position.x=T.position.x;this.lab.position.set(c.position.x,3.6,0);w+=dt}
   if(w>1.3){G.tick=null;Game.end(ok,close(gap,1.8),ok?'Fall time '+fmt(tf,2)+' s x '+u+' m/s = '+fmt(u*tf,1)+' m. Perfect timing!':gap>0?'Too high: the truck had already passed. Drop from lower.':'Too low: the crate landed before the truck arrived. Drop from higher.','DIRECT HIT!')}}}},

{name:'Cannon Range',tag:'Projectile',formula:'R = v² sin2θ / g',
 intro:'Hit the bullseye (within 4 m). Choose launch speed and angle (g = 9.8 m/s²). 45° gives the longest range, and 30° and 60° land in the same spot!',
 fact:'Horizontal and vertical motion are independent: vx stays constant while vy changes by g every second. Complementary angles (θ and 90°−θ) give the same range.',
 init(keep){
  if(!keep)do{this.v0=rnd(15,40);this.a0=rnd(2,16)*5;this.R=this.v0*this.v0*Math.sin(2*this.a0*Math.PI/180)/9.8}while(this.R<25||this.R>110);
  track(-26,26);const tx=-22+this.R*.4;G.cyl(1.6,.06,COL.red,tx,.04,0);G.cyl(1,.07,0xffffff,tx,.05,0);G.cyl(.4,.08,COL.red,tx,.06,0);
  G.box(2,.6,1.8,0x4b5563,-22,.3,0);this.cn=new THREE.Group();G.cyl(.4,3,0x2b2f38,1.5,0,0,this.cn,'x');this.cn.position.set(-22,.5,0);G.stage.add(this.cn);
  G.look(0,11,46,0,5,0,true);
  return{controls:[{id:'v',label:'Launch speed',min:10,max:50,step:1,val:25,unit:' m/s'},{id:'a',label:'Launch angle',min:5,max:85,step:5,val:45,unit:'°'}],
   info:v=>{const th=v.a*Math.PI/180;return[['Target range',fmt(this.R,1)+' m'],['Your range',fmt(v.v*v.v*Math.sin(2*th)/9.8,1)+' m'],['Max height',fmt(Math.pow(v.v*Math.sin(th),2)/19.6,1)+' m'],['Flight time',fmt(2*v.v*Math.sin(th)/9.8,2)+' s']]}};
 },
 prev(v){this.cn.rotation.z=v.a*Math.PI/180},
 go(v){const th=v.a*Math.PI/180,vx=v.v*Math.cos(th),vy=v.v*Math.sin(th),R=v.v*v.v*Math.sin(2*th)/9.8,err=R-this.R,ok=Math.abs(err)<=4,b=G.ball(.5,0x222831,-22,.5,0);let t=0,ld=0,w=0;
  G.ts=2;G.burst(-22+Math.cos(th)*3,.5+Math.sin(th)*3,0,0xffd27a,25,8);G.shake=.6;G.beep(90,.3,'sawtooth',.2,-40);
  G.tick=dt=>{if(!ld){t+=dt;const y=vy*t-4.9*t*t;b.position.set(-22+vx*t*.4,.5+Math.max(0,y)*.4,0);G.burst(b.position.x,b.position.y,0,0xffffff,1,.6);
    if(y<=0&&t>.05){ld=1;b.position.set(-22+R*.4,.5,0);G.shake=1;G.burst(b.position.x,1,0,ok?COL.good:0xc9a86a,35,9);G.beep(ok?660:90,.3,ok?'triangle':'square',.2)}}
   else if((w+=dt)>.9){G.tick=null;G.ts=1;Game.end(ok,close(err,4),ok?'Bullseye! Range '+fmt(R,1)+' m, off by only '+fmt(Math.abs(err),1)+' m.':'Landed '+fmt(Math.abs(err),1)+' m '+(err>0?'long':'short')+'. R = v² sin2θ / g = '+fmt(R,1)+' m.','BULLSEYE!')}}}},

{name:'Rocket Sled',tag:'Impulse',formula:'J = F · t = Δp',
 intro:'Hit the speed gate at the target speed (±5%). You pick the thrust F and burn time t. Needed impulse = m × v. Many (F, t) pairs give the same J!',
 fact:'Impulse and momentum share units (N·s = kg·m/s). Any force — big or small — gives the same Δp if F×t is the same.',
 init(keep){
  if(!keep)do{this.m=rnd(5,10)*10;this.F0=rnd(2,15)*100;this.t0=rnd(2,12)/2;this.T=this.F0*this.t0}while(this.T/this.m<8||this.T/this.m>30);
  this.vT=this.T/this.m;track(-26,20);this.gate=G.gate(16,COL.teal);
  this.s=G.vehicle(3,COL.blue);this.s.position.x=-20;this.lab=G.label(this.m+' kg');this.lab.position.set(-20,3.6,0);cam(-8,9,24,-8,true);
  return{controls:[{id:'F',label:'Thrust force F',min:100,max:1500,step:100,val:500,unit:' N'},{id:'t',label:'Burn time t',min:.5,max:6,step:.5,val:2,unit:' s'}],
   info:v=>{const a=v.F/this.m,u=.5*a*v.t*v.t<=100?a*v.t:Math.sqrt(200*a),e=(u-this.vT)/this.vT;return[['Sled mass',this.m+' kg'],['Target speed',fmt(this.vT,1)+' m/s'],['Your impulse J',fmt(v.F*v.t)+' N·s'],['Speed at gate',fmt(u,1)+' m/s'],['Off by',(e>=0?'+':'−')+pct(e)+(Math.abs(e)<=.05?' ✓':'')]]}};
 },
 prev(){},
 go(v){const m=this.m,s=this.s;let t=0,x=0,u=0;G.ts=2.5;G.beep(120,.8,'sawtooth',.06,200);
  G.tick=dt=>{t+=dt;if(t<=v.t){u+=v.F/m*dt;G.burst(s.position.x-1.6,1,0,COL.ember,2,4)}x+=u*dt;s.position.x=-20+x*.36;this.lab.position.x=s.position.x;this.lab.set(fmt(u,1)+' m/s');cam(s.position.x*.6,9,24,s.position.x*.6+2);
   if(x>=100||t>30){G.tick=null;G.ts=1;const e=(u-this.vT)/this.vT,ok=x>=100&&Math.abs(e)<=.05;this.gate.glow(ok?COL.good:COL.red);G.shake=ok?.3:.8;G.burst(16,3,0,ok?COL.good:COL.red,40,10);
   setTimeout(()=>Game.end(ok,close(e,.05),x<100?'Too slow — the sled never reached the gate. You need J ≈ '+fmt(this.T)+' N·s.':ok?'Gate speed '+fmt(u,1)+' m/s. Impulse used: '+fmt(v.F*v.t)+' N·s.':'Gate speed '+fmt(u,1)+' m/s was '+pct(e)+(e>0?' too fast':' too slow')+'. You need J ≈ '+fmt(this.T)+' N·s.','LOCKED ON!'),500)}}}},

{name:'Crash Test',tag:'Stopping time',formula:'F · Δt = Δp',
 intro:'The car must stop, so Δp = m × v is fixed. You choose the stopping time: Force = Δp ÷ Δt. Too short and the force hurts the dummy; too long and the crumple zone will not fit. Watch the Status line!',
 fact:'A car hitting a wall and a car hitting a haystack have the same impulse, but the haystack spreads it over more time, so the force is far smaller. Same idea: airbags, pole-vault mats.',
 init(keep){
  if(!keep){this.m=rnd(8,15)*100;this.v=rnd(12,28);this.dmin=rnd(10,18)/10;this.dmax=this.dmin+rnd(12,20)/10;this.Fmax=this.m*this.v*this.v/(2*this.dmin)}
  track(-30,10);G.box(3,6,10,0x7d8794,11.5,3,0);this.cu=G.box(1,3.2,6,COL.brass,9.5,1.6,0);
  const c=this.car=G.vehicle(4,COL.red);c.position.x=-16;this.dummy=G.ball(.4,0xf2e7c9,-.4,2.1,0,c);
  this.bay=G.box(.2,.05,8,0x6fbf73,10-this.dmax,.06,0);this.lab=G.label('');this.lab.position.set(-16,4.2,0);cam(-3,8,22,-3,true);
  return{controls:[{id:'t',label:'Stopping time Δt',min:.02,max:.8,step:.01,val:.1,unit:' s',dec:2}],
   info:v=>{const F=this.m*this.v/v.t,tmax=2*this.dmax/this.v;return[['Car',this.m+' kg @ '+this.v+' m/s'],['Δp = m × v',fmt(this.m*this.v)+' kg·m/s'],['Force = Δp ÷ Δt',fmt(F/1000,1)+' kN'],['Dummy limit',fmt(this.Fmax/1000,1)+' kN'],['Longest stop allowed',fmt(tmax,2)+' s'],['Status',F>this.Fmax?'Too hard ✗':v.t>tmax+1e-9?'Too long ✗':'Safe ✓']]}};
 },
 prev(v){const d=v.t*this.v/2;this.cu.scale.x=d;this.cu.position.x=10-d/2;this.lab.set(v.t.toFixed(2)+' s stop')},
 go(v){const d=v.t*this.v/2,m=this.m,u0=this.v,F=m*u0/v.t,c=this.car,cu=this.cu,dm=this.dummy,a=u0*u0/(2*d),ok=F<=this.Fmax&&d<=this.dmax,mid=(this.dmin+this.dmax)/2;
  if(d>this.dmax){G.shake=1;G.beep(110,.4,'square');return setTimeout(()=>Game.end(false,0,'Stopping that slowly needs '+d.toFixed(1)+' m of crumple space but the bay only has '+fmt(this.dmax,1)+' m. Stop faster.'),500)}
  let u=u0,t=0,done=0;G.ts=.4;G.beep(140,.6,'sawtooth',.07,200);
  G.tick=dt=>{if(c.position.x+2>=10-d)u=Math.max(0,u-a*dt);c.position.x+=u*dt;const f=c.position.x+2;this.lab.position.x=c.position.x;
   if(f>10-d){const r=Math.max(.01,10-f);cu.scale.x=r;cu.position.x=f+r/2}cam(c.position.x*.5,8,22,c.position.x*.5+2);
   if(!done&&u<=.01){done=1;G.shake=1.2;G.hold=.2;G.burst(10-d,2,0,COL.brass,30,8);G.beep(70,.4,'square',.2,-30);
    if(F>this.Fmax){c.remove(dm);G.stage.add(dm);dm.position.set(c.position.x,2.1,0);dm.material.color.set(COL.red);G.scatter([dm],1,14)}}
   if(done&&(t+=dt)>1.2){G.tick=null;G.ts=1;Game.end(ok,close(d-mid,(this.dmax-this.dmin)/2),ok?'Dummy survived: '+fmt(F/1000,1)+' kN (limit '+fmt(this.Fmax/1000,1)+') over '+fmt(2*d/u0*1000)+' ms.':'Ouch! '+fmt(F/1000,1)+' kN is over the '+fmt(this.Fmax/1000,1)+' kN limit. Spread the same impulse over more time: choose a longer stopping time.','SURVIVED!')}}}},

{name:'Egg Drop',tag:'Free fall + impulse',formula:'v² = 2gH → F·Δt = Δp',
 intro:'The egg free-falls from the platform. The panel gives the impact speed, then Δp, then the force. Pick a stopping time that keeps the force under the shell limit but is short enough to fit the box. Watch the Status line!',
 fact:'Free fall gives the speed; the impulse-momentum theorem gives the force. Same Δp over a longer stopping time means a smaller force, which is why landing mats and bent knees work.',
 init(keep){
  if(!keep){this.H=rnd(5,30);this.m=rnd(2,8);this.dmin=rnd(2,6)/10;this.dmax=this.dmin+rnd(3,6)/10;this.Fmax=this.m*9.8*this.H/this.dmin}
  const H=this.H;track(-8,8);G.box(.4,H*.3,.4,0x7d8794,-2,H*.3/2,0);this.plat=G.box(3,.3,3,0x7d8794,0,H*.3-.15,0);
  this.pad=G.box(4,1,4,COL.brass,0,.5,0);this.egg=G.ball(.45,0xf2e7c9,0,H*.3+.56,0);this.egg.scale.y=1.25;
  this.lab=G.label(this.m+' kg · H = '+H+' m');this.lab.position.set(0,H*.3+2.8,0);G.look(0,10,28,0,5,0,true);
  return{controls:[{id:'t',label:'Stopping time Δt',min:.02,max:.3,step:.01,val:.03,unit:' s',dec:2}],
   info:v=>{const vi=Math.sqrt(19.6*this.H),F=this.m*vi/v.t,tmax=2*this.dmax/vi;return[['1. Impact speed',fmt(vi,1)+' m/s'],['2. Δp = m × v',fmt(this.m*vi,1)+' kg·m/s'],['3. Force = Δp ÷ Δt',fmt(F)+' N'],['Shell limit',fmt(this.Fmax)+' N'],['Longest stop allowed',fmt(tmax,2)+' s'],['Status',F>this.Fmax?'Too hard ✗':v.t>tmax+1e-9?'Too long ✗':'Safe ✓']]}};
 },
 prev(v){const th=v.t*Math.sqrt(19.6*this.H);this.pad.scale.y=th;this.pad.position.y=th/2},
 go(v){const H=this.H,vi=Math.sqrt(19.6*H),d=v.t*vi/2,F=this.m*vi/v.t,ok=F<=this.Fmax&&d<=this.dmax,mid=(this.dmin+this.dmax)/2,tf=Math.sqrt(2*H/9.8),e=this.egg,pad=this.pad,th=d*2,y0=H*.3+.56,y1=th+.56;
  if(d>this.dmax){G.shake=1;G.beep(110,.4,'square');return setTimeout(()=>Game.end(false,0,'Stopping that slowly needs '+fmt(d,2)+' m of cushion but the box only fits '+fmt(this.dmax,2)+' m. Stop faster.'),500)}
  this.plat.visible=false;let t=0,done=0,w=0;G.beep(600,.8,'sine',.05,-350);
  G.tick=dt=>{t+=dt;
   if(t<tf){const k=t/tf;e.position.y=y0-(y0-y1)*k*k;this.lab.position.y=e.position.y+2.2;this.lab.set(fmt(9.8*t,1)+' m/s')}
   else{const s=Math.min(1,(t-tf)/.25),n=th*(1-.7*s);pad.scale.y=n;pad.position.y=n/2;e.position.y=n+.56;
    if(!done){done=1;G.shake=1.2;G.hold=.2;G.burst(0,th,0,ok?0xf2e7c9:0xffd23a,35,9);G.beep(80,.4,'square',.2,-30);if(F>this.Fmax){e.material.color.set(COL.red);e.scale.set(1.8,.35,1.8)}}
    if((w+=dt)>1.4){G.tick=null;Game.end(ok,close(d-mid,(this.dmax-this.dmin)/2),ok?'Egg survived! Impact '+fmt(vi,1)+' m/s, stopped in '+fmt(2*d/vi*1000)+' ms, force '+fmt(F)+' N.':'Crack! '+fmt(F)+' N is over the '+fmt(this.Fmax)+' N shell limit. A longer stopping time means a smaller F.','EGG-CELLENT!')}}}}},

{name:'Sticky Smash',tag:'Conservation',formula:'m₁v₁ = (m₁+m₂)v′',
 intro:'Cart A hits parked cart B and they stick together. Pick A\'s speed so the pair rolls through the gate at the target speed (±5%).',
 fact:'A 0.035 kg bullet at 700 m/s embedded in a 7 kg block gives (0.035)(700) = 7.035 v → v = 3.48 m/s. Momentum before = momentum after.',
 init(keep){
  if(!keep){this.m1=rnd(2,6)*100;this.m2=rnd(3,8)*100;this.v0=rnd(8,30);this.T=this.m1*this.v0/(this.m1+this.m2)}
  track(-32,22);this.gate=G.gate(16,COL.teal);
  this.A=G.vehicle(4,COL.blue);this.A.scale.setScalar(Math.cbrt(this.m1/400));this.A.position.x=-22;
  this.B=G.vehicle(4,COL.teal);this.B.scale.setScalar(Math.cbrt(this.m2/400));this.B.position.x=-6;
  this.la=G.label('A: '+this.m1+' kg');this.la.position.set(-22,4.5,0);this.lb=G.label('B: '+this.m2+' kg');this.lb.position.set(-6,4.5,0);cam(-8,9,26,-8,true);
  return{controls:[{id:'v',label:'Cart A speed',min:2,max:40,step:1,val:10,unit:' m/s'}],
   info:v=>[['p before (A only)',fmt(this.m1*v.v)+' kg·m/s'],['Combined mass',fmt(this.m1+this.m2)+' kg'],['Final speed v′',fmt(this.m1*v.v/(this.m1+this.m2),2)+' m/s'],['Target v′',fmt(this.T,2)+' m/s']]};
 },
 prev(){},
 go(v){const A=this.A,B=this,m1=this.m1,m2=this.m2,vf=m1*v.v/(m1+m2),e=(vf-this.T)/this.T,ok=Math.abs(e)<=.05,k=.7;let st=0,t=0;const b=this.B;
  G.tick=dt=>{if(!st){A.position.x+=v.v*k*dt;this.la.position.x=A.position.x;
    if(A.position.x+2*A.scale.x>=b.position.x-2*b.scale.x){st=1;A.position.x=b.position.x-2*b.scale.x-2*A.scale.x;G.hold=.3;G.shake=1.2;G.burst(b.position.x-2,1.5,0,0xffd27a,40,10);G.beep(100,.3,'square',.2,-40);this.lb.set('v′ = '+fmt(vf,1)+' m/s')}}
   else{const d=vf*k*dt;A.position.x+=d;b.position.x+=d;t+=dt;this.la.position.x=A.position.x;this.lb.position.x=b.position.x+2}
   const mid=(A.position.x+b.position.x)/2;cam(mid,9,26,mid);
   if(st&&(b.position.x+2*b.scale.x>=16||t>14)){G.tick=null;const pass=b.position.x+2*b.scale.x>=16;this.gate.glow(ok?COL.good:COL.red);G.burst(16,3,0,ok?COL.good:COL.red,40,10);
    setTimeout(()=>Game.end(ok&&pass,close(e,.05),!pass?'The pair stalled — A was too slow.':ok?'p before = p after = '+fmt(m1*v.v)+' kg·m/s, so v′ = '+fmt(vf,2)+' m/s.':'v′ = '+fmt(vf,2)+' m/s was '+pct(e)+(e>0?' too fast':' too slow')+'. Check: v′ = m₁v₁/(m₁+m₂).','IN THE ZONE!'),500)}}}},

{name:'Cannon Recoil',tag:'Conservation',formula:'m_b v_b = M v_boat',
 intro:'Fire the cannon: the ball goes right, the boat recoils left toward the pier. Dock at the safe speed (±6%). Too fast = crash, too slow = you miss the tide.',
 fact:'The momentum one object gains, the other loses, so the system total stays zero. The same reasoning explains why Earth moves (a tiny bit) when an apple falls.',
 init(keep){
  if(!keep){this.M=rnd(8,15)*100;do{this.mb=rnd(1,12)*5;this.vb=rnd(2,15)*10;this.vr0=this.mb*this.vb/this.M}while(this.vr0<1.2||this.vr0>4)}
  G.box(80,.12,24,0x2a77b0,0,-.08,0);G.box(5,2,9,0x7a6a55,-12.5,1,0);[-3,0,3].forEach(z=>G.box(.6,2.4,.6,0x3b2f22,-9.8,1.2,z));
  const b=this.boat=new THREE.Group();G.box(5,1,2.6,0x6b4a2f,0,.5,0,b);G.box(1.8,1.2,1.8,COL.brass,-1,1.6,0,b);G.cyl(.35,3,0x2b2f38,1.3,1.7,0,b,'x');b.position.x=3;G.stage.add(b);
  this.lab=G.label(this.M+' kg');this.lab.position.set(3,4,0);cam(-2,8,20,-2,true);
  return{controls:[{id:'mb',label:'Cannonball mass',min:5,max:60,step:5,val:20,unit:' kg'},{id:'vb',label:'Muzzle speed',min:10,max:150,step:10,val:50,unit:' m/s'}],
   info:v=>{const p=v.mb*v.vb;return[['Ball p (→)','+'+fmt(p)],['Boat p (←)','−'+fmt(p)],['Boat speed ('+this.M+' kg)',fmt(p/this.M,2)+' m/s'],['Safe dock speed',fmt(this.vr0,2)+' m/s']]}};
 },
 prev(){},
 go(v){const b=this.boat,vr=v.mb*v.vb/this.M,e=(vr-this.vr0)/this.vr0,ok=Math.abs(e)<=.06;const ball=G.ball(.4,0x222831,b.position.x+2.8,1.7,0);let t=0,hit=0;G.ts=3;
  G.burst(b.position.x+3,1.8,0,0xffd27a,30,9);G.beep(80,.4,'sawtooth',.2,-40);G.shake=.8;
  G.tick=dt=>{ball.position.x+=v.vb*.2*dt;ball.position.y=Math.max(.4,1.7-.02*t*t);t+=dt;
   if(!hit){b.position.x-=vr*dt;this.lab.position.x=b.position.x;this.lab.set(fmt(vr,2)+' m/s');cam(b.position.x*.6,8,20,b.position.x*.6);
    if(b.position.x-2.5<=-10){hit=1;b.position.x=-7.5;if(!ok||true){G.shake=e>.06?1.6:.4;G.burst(-10,1.5,0,e>.06?COL.red:COL.good,35,9)}G.beep(e>.06?70:520,.3,e>.06?'square':'triangle',.2)}
    if(t>25&&!hit){hit=1}}
   if(hit&&(t+=dt)>0){if(!b.userData.w)b.userData.w=t;if(t-b.userData.w>.9){G.tick=null;G.ts=1;
    Game.end(ok,close(e,.06),ok?'Soft landing at '+fmt(vr,2)+' m/s. Ball p = boat p = '+fmt(v.mb*v.vb)+' kg·m/s.':e>0?'CRASH! '+fmt(vr,2)+' m/s is '+pct(e)+' too fast. Use a lighter or slower ball.':'Too slow ('+fmt(vr,2)+' m/s) — you missed the tide. Fire a heavier or faster ball.','SOFT DOCK!')}}}}},

{name:'Dead Stop',tag:'Conservation · Boss',formula:'m₁v₁ − m₂v₂ = (m₁+m₂)v′',
 intro:'Two carts rush at each other and stick. Choose + as →. Pick cart A\'s speed so the total momentum is zero and the wreck stops dead (|v′| ≤ 0.4 m/s).',
 fact:'Momentum is a vector: choose a positive direction and opposite momenta cancel. Sample problem: 3 kg @10 m/s hits 15 kg @6 m/s head-on and the answer comes out negative — so the direction was guessed wrong, and that\'s OK.',
 init(keep){
  if(!keep){this.m1=rnd(1,4)*100;const k=rnd(2,4);this.m2=k*this.m1;this.v2=rnd(3,8);this.v0=k*this.v2}
  track(-30,30);this.A=G.vehicle(4,COL.blue);this.A.scale.setScalar(Math.cbrt(this.m1/400));this.A.position.x=-18;
  this.B=G.vehicle(4,COL.red);this.B.scale.setScalar(Math.cbrt(this.m2/400));this.B.position.x=18;this.B.rotation.y=Math.PI;
  this.la=G.label('A '+this.m1+' kg');this.lb=G.label('B '+this.m2+' kg · '+this.v2+' m/s ←');this.la.position.set(-18,4.5,0);this.lb.position.set(18,4.5,0);cam(0,10,30,0,true);
  return{controls:[{id:'v',label:'Cart A speed (→)',min:1,max:40,step:1,val:10,unit:' m/s'}],
   info:v=>{const pa=this.m1*v.v,pb=-this.m2*this.v2,vf=(pa+pb)/(this.m1+this.m2);return[['A momentum','+'+fmt(pa)],['B momentum',fmt(pb)],['Net momentum',(pa+pb>0?'+':'')+fmt(pa+pb)],['Final velocity v′',fmt(vf,2)+' m/s']]}};
 },
 prev(){},
 go(v){const A=this.A,B=this.B,m1=this.m1,m2=this.m2,vf=(m1*v.v-m2*this.v2)/(m1+m2),ok=Math.abs(vf)<=.4,k=.5;let st=0,t=0;
  G.tick=dt=>{if(!st){A.position.x+=v.v*k*dt;B.position.x-=this.v2*k*dt;this.la.position.x=A.position.x;this.lb.position.x=B.position.x;
    if(A.position.x+2*A.scale.x>=B.position.x-2*B.scale.x){st=1;B.position.x=A.position.x+2*A.scale.x+2*B.scale.x;G.hold=.35;G.shake=1.8;G.burst(A.position.x+2*A.scale.x,1.5,0,0xffd27a,60,12);G.beep(80,.5,'square',.25,-50)}}
   else{const d=vf*k*dt;A.position.x+=d;B.position.x+=d;t+=dt;this.la.position.x=A.position.x;this.lb.position.x=B.position.x;this.lb.set('v′ = '+fmt(vf,2)+' m/s')}
   cam((A.position.x+B.position.x)/2,10,30,(A.position.x+B.position.x)/2);
   if(st&&t>1.8){G.tick=null;if(ok)G.burst(A.position.x+3,1,0,0xffffff,40,5);
    Game.end(ok,close(vf,.4),ok?'Net momentum ≈ 0, the wreck stopped dead. v′ = '+fmt(vf,2)+' m/s.':'The wreck drifts '+(vf>0?'right (A too strong':'left (A too weak')+') at '+fmt(Math.abs(vf),2)+' m/s. Aim for m₁v₁ = m₂v₂ = '+fmt(m2*this.v2)+'.','DEAD STOP!')}}}}
];