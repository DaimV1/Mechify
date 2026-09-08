// Original procedural engineering study. No external model or image assets.
export function mountAssembly(canvas) {
  const ctx=canvas.getContext('2d');
  if(!ctx) return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const slider=document.querySelector('#explode');
  let progress=Number(slider?.value||65)/100, rotation=0, frame=0, visible=true, manual=false;
  const project=(x,y,z)=>[330+(x-y)*0.83,320+(x+y)*0.34-z];
  function polygon(points,fill,stroke='#687176') {
    ctx.beginPath();points.forEach((p,i)=>{const q=project(...p);if(i)ctx.lineTo(...q);else ctx.moveTo(...q)});ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=0.7;ctx.stroke();
  }
  function block(x,y,z,w,d,h,colors=['#747d81','#343d43','#aab2b5']) {
    polygon([[x,y,z],[x+w,y,z],[x+w,y,z+h],[x,y,z+h]],colors[0]);
    polygon([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],colors[1]);
    polygon([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],colors[2]);
  }
  function disc(x,y,z,r,h,top='#bbc4c6',side='#566268',hole=0) {
    const steps=52;
    for(let i=0;i<steps;i++) {
      let a=i/steps*Math.PI*2,b=(i+1)/steps*Math.PI*2;
      if(Math.sin(a)+Math.cos(a)>0) polygon([[x+Math.cos(a)*r,y+Math.sin(a)*r,z],[x+Math.cos(b)*r,y+Math.sin(b)*r,z],[x+Math.cos(b)*r,y+Math.sin(b)*r,z+h],[x+Math.cos(a)*r,y+Math.sin(a)*r,z+h]],side,side);
    }
    const ring=Array.from({length:steps},(_,i)=>[x+Math.cos(i/steps*Math.PI*2)*r,y+Math.sin(i/steps*Math.PI*2)*r,z+h]);
    polygon(ring,top);
    if(hole) {polygon(Array.from({length:steps},(_,i)=>[x+Math.cos(i/steps*Math.PI*2)*hole,y+Math.sin(i/steps*Math.PI*2)*hole,z+h+0.2]),'#151c20','#849599');}
  }
  function label(text,sub,point,x,y) {
    const p=project(...point);ctx.strokeStyle='#5d777c';ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(...p);ctx.lineTo(x-13,y+5);ctx.lineTo(x+115,y+5);ctx.stroke();ctx.fillStyle='#45e4d3';ctx.beginPath();ctx.arc(...p,2.6,0,Math.PI*2);ctx.fill();ctx.font='11px monospace';ctx.fillText(text,x,y-5);ctx.fillStyle='#819094';ctx.font='10px monospace';ctx.fillText(sub,x,y+21);
  }
  function draw() {
    const rect=canvas.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,2);
    if(canvas.width!==Math.round(rect.width*dpr)||canvas.height!==Math.round(rect.height*dpr)){canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr)}
    ctx.setTransform(canvas.width/660,0,0,canvas.height/580,0,0);ctx.clearRect(0,0,660,580);
    const glow=ctx.createRadialGradient(335,305,0,335,305,280);glow.addColorStop(0,'#18353a66');glow.addColorStop(1,'#0e141800');ctx.fillStyle=glow;ctx.fillRect(0,0,660,580);
    ctx.strokeStyle='#8cadb112';ctx.lineWidth=0.7;
    for(let i=-350;i<400;i+=40){ctx.beginPath();ctx.moveTo(...project(i,-310,-48));ctx.lineTo(...project(i,320,-48));ctx.stroke();ctx.beginPath();ctx.moveTo(...project(-310,i,-48));ctx.lineTo(...project(320,i,-48));ctx.stroke();}
    ctx.strokeStyle='#55cabe55';ctx.setLineDash([4,7]);ctx.beginPath();ctx.moveTo(...project(0,0,-32));ctx.lineTo(...project(0,0,310));ctx.stroke();ctx.setLineDash([]);
    // Machined mounting plate and its four counterbores.
    block(-126,-100,-20,252,200,20,['#606b70','#333e45','#9fa9ae']);
    block(-119,-93,0,238,186,3,['#566169','#3a454b','#aeb6b9']);
    for(const x of [-105,105])for(const y of [-80,80]){disc(x,y,3,9,0,'#273238','#444',5);disc(x,y,3.3,4,0,'#10191d','#111');}
    // Motor body with cooling fins, flange and axial output shaft.
    const e=progress;
    block(-57,-57,6+e*5,114,114,63,['#37464f','#1c2830','#52606a']);
    for(let j=0;j<7;j++)block(-62,-62,9+j*8+e*5,124,124,3,['#58656d','#24343b','#718087']);
    disc(0,0,71+e*6,57,12,'#89969d','#3f4d56',15);
    disc(0,0,83+e*6,14,35,'#d3dddd','#879499');
    const z1=105+e*58;
    disc(0,0,z1,57,21,'#adc0c0','#527475',19);
    disc(0,0,z1+21,43,4,'#47dcca','#178d83',19);
    for(let j=0;j<8;j++){const a=j*Math.PI/4+rotation;disc(Math.cos(a)*47,Math.sin(a)*47,z1+25,3,0,'#172e32','#172e32');}
    const z2=139+e*100;
    disc(0,0,z2,69,17,'#a1aeb3','#4a575f',29);disc(0,0,z2+17,56,3,'#d0d8d9','#909a9e',30);
    for(let j=0;j<12;j++){const a=j*Math.PI/6;disc(Math.cos(a)*43,Math.sin(a)*43,z2+20,5,0,'#495d64','#333');}
    const z3=164+e*142;
    block(-62,-62,z3,124,124,13,['#64737d','#384750','#b3bec1']);
    disc(0,0,z3+13,42,3,'#7f949a','#71868a',27);
    for(const x of [-46,46])for(const y of [-46,46]){disc(x,y,z3+13,6,1,'#23343c','#223',3);disc(x,y,z3+26+e*16,3,12,'#97a7ad','#68797f');disc(x,y,z3+38+e*16,7,5,'#c3cdcf','#69797d',3);}
    if(rect.width>420){label('01 / LAGERFLENS','Aluminium · schematisch',[60,-55,z3+10],425,115);label('02 / KOPPELING','Koppeloverdracht',[42,-15,z1+25],452,254);label('03 / AANDRIJVING','Stationair werkpunt',[-60,40,55],55,390);}
    const o=project(-170,95,-30);ctx.font='11px monospace';[['X',32,13],['Y',-26,12],['Z',0,-34]].forEach(([t,x,y])=>{ctx.strokeStyle='#60a69f';ctx.beginPath();ctx.moveTo(...o);ctx.lineTo(o[0]+x,o[1]+y);ctx.stroke();ctx.fillStyle='#90aaa9';ctx.fillText(t,o[0]+x+4,o[1]+y)});
    if(canvas.dataset)canvas.dataset.ready='true';
  }
  const render=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(draw)};
  slider?.addEventListener('input',()=>{manual=true;progress=Number(slider.value)/100;document.querySelector('#assembly-state').textContent=progress<0.1?'GEMONTEERD':'EXPLODED VIEW';render()});
  const resize=new ResizeObserver(render);resize.observe(canvas);
  const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting});io.observe(canvas);
  const scroll=()=>{if(!reduced.matches&&visible){rotation=scrollY*0.001;if(!manual){progress=.65*Math.max(0,1-scrollY/650);if(slider)slider.value=String(Math.round(progress*100));document.querySelector('#assembly-state').textContent=progress<0.1?'GEMONTEERD':'EXPLODED VIEW';}render()}};window.addEventListener('scroll',scroll,{passive:true});
  draw();
  if(!reduced.matches){let start;function intro(t){start??=t;const n=Math.min((t-start)/1300,1);progress=.65*(1-Math.pow(1-n,3));draw();if(n<1)frame=requestAnimationFrame(intro)}frame=requestAnimationFrame(intro)}
  return ()=>{cancelAnimationFrame(frame);resize.disconnect();io.disconnect();window.removeEventListener('scroll',scroll)};
}
