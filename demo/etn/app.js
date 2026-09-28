/* ETN prototype: geographical fog over the Leaflet map used by Kur aš? */
(() => {
  'use strict';
  const KEY='etn-explored-v1', LOOPS_KEY='etn-enclosed-v1';
  const MAX_ACCURACY=100, MAX_POINTS=5000, MAX_LOOPS=100;
  const PROFILES={
    field:{radius:1000,clear:250,label:'Laukai',radiusLabel:'1 km'},
    urban:{radius:500,clear:250,label:'Užstatyta',radiusLabel:'0,5 km'},
    forest:{radius:250,clear:100,label:'Miškas',radiusLabel:'0,25 km'}
  };
  const profile=kind=>PROFILES[kind]||PROFILES.forest;
  const $=id=>document.getElementById(id);
  const map=L.map('map',{zoomControl:false,zoomSnap:0,zoomDelta:.5}).setView([55.1694,23.8813],7);
  L.control.zoom({position:'bottomright'}).addTo(map);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  function load(){
    try{
      const data=JSON.parse(localStorage.getItem(KEY)||'[]');
      return Array.isArray(data)?data.slice(-MAX_POINTS).filter(p=>
        Array.isArray(p)&&(p.length===2||p.length===3)&&Number.isFinite(p[0])&&
        Number.isFinite(p[1])&&Math.abs(p[0])<=90&&Math.abs(p[1])<=180&&
        (p.length===2||['field','urban','forest','unknown'].includes(p[2]))):[];
    }catch{return [];}
  }
  function loadLoops(){
    try{
      const saved=JSON.parse(localStorage.getItem(LOOPS_KEY)||'[]');
      return Array.isArray(saved)?saved.slice(-MAX_LOOPS).filter(ring=>
        Array.isArray(ring)&&ring.length>=7&&ring.length<=MAX_POINTS&&
        ring.every(p=>Array.isArray(p)&&p.length===2&&Number.isFinite(p[0])&&
          Number.isFinite(p[1])&&Math.abs(p[0])<=90&&Math.abs(p[1])<=180)):[];
    }catch{return [];}
  }
  let points=load(),loops=loadLoops(),trail=[],watcher=null,lastFix=null,marker=null,queued=false;
  let terrainFix=null,terrainPending=false,nextTerrainCheck=0;
  $('count').textContent=String(points.length);
  const canvas=document.createElement('canvas');
  canvas.className='fog-canvas';canvas.setAttribute('aria-hidden','true');
  map.getContainer().appendChild(canvas);
  const ctx=canvas.getContext('2d');
  function draw(){
    queued=false;
    const size=map.getSize(),ratio=Math.min(devicePixelRatio||1,2);
    if(canvas.width!==Math.round(size.x*ratio)||canvas.height!==Math.round(size.y*ratio)){
      canvas.width=Math.round(size.x*ratio);canvas.height=Math.round(size.y*ratio);
    }
    ctx.setTransform(ratio,0,0,ratio,0,0);
    ctx.clearRect(0,0,size.x,size.y);
    ctx.fillStyle='#050a0c';ctx.fillRect(0,0,size.x,size.y);
    if(!points.length)return;
    ctx.globalCompositeOperation='destination-out';
    for(const [lat,lon,kind='field'] of points){
      const config=profile(kind),radius=config.radius;
      const p=map.latLngToContainerPoint([lat,lon]);
      const north=map.latLngToContainerPoint([lat+radius/111320,lon]);
      const cos=Math.max(.01,Math.cos(lat*Math.PI/180));
      const east=map.latLngToContainerPoint([lat,lon+radius/(111320*cos)]);
      const rx=Math.abs(east.x-p.x),ry=Math.abs(north.y-p.y);
      if(rx<.3&&ry<.3)continue;
      if(p.x+rx<0||p.x-rx>size.x||p.y+ry<0||p.y-ry>size.y)continue;
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.scale(rx,ry);
      const fade=ctx.createRadialGradient(0,0,0,0,0,1);
      fade.addColorStop(0,'rgba(0,0,0,1)');
      fade.addColorStop(config.clear/radius,'rgba(0,0,0,1)');
      fade.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=fade;
      ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    // A walked, closed ring reveals everything it surrounds, even where
    // the individual 1 km clearings leave fog in the middle.
    ctx.fillStyle='#000';
    for(const ring of loops){
      ctx.beginPath();
      ring.forEach(([lat,lon],index)=>{
        const p=map.latLngToContainerPoint([lat,lon]);
        if(index===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);
      });
      ctx.closePath();ctx.fill();
    }
    ctx.globalCompositeOperation='source-over';
  }
  function redraw(){if(!queued){queued=true;requestAnimationFrame(draw);}}
  map.on('move zoom zoomanim zoomend resize viewreset',redraw);redraw();
  function save(lat,lon,kind){
    points.push([lat,lon,kind]);
    if(points.length>MAX_POINTS)points=points.slice(-MAX_POINTS);
    try{localStorage.setItem(KEY,JSON.stringify(points));}
    catch{$('status').textContent='Įrenginyje pritrūko vietos istorijai išsaugoti.';}
    $('count').textContent=String(points.length);
    trail.push([lat,lon]);
    if(trail.length>1500)trail.shift();
    detectEnclosure();
    redraw();
  }
  function ringArea(ring){
    const origin=ring[0],cos=Math.cos(origin[0]*Math.PI/180);
    let twice=0;
    for(let i=0;i<ring.length;i++){
      const a=ring[i],b=ring[(i+1)%ring.length];
      const ax=(a[1]-origin[1])*111320*cos,ay=(a[0]-origin[0])*111320;
      const bx=(b[1]-origin[1])*111320*cos,by=(b[0]-origin[0])*111320;
      twice+=ax*by-bx*ay;
    }
    return Math.abs(twice)/2;
  }
  function detectEnclosure(){
    if(trail.length<7)return;
    const current=trail[trail.length-1];
    for(let i=0;i<=trail.length-7;i++){
      if(map.distance(current,trail[i])>100)continue;
      const ring=trail.slice(i);
      let perimeter=map.distance(current,trail[i]);
      for(let j=1;j<ring.length;j++)perimeter+=map.distance(ring[j-1],ring[j]);
      if(perimeter<450||ringArea(ring)<15000)continue;
      loops.push(ring);
      if(loops.length>MAX_LOOPS)loops.shift();
      try{localStorage.setItem(LOOPS_KEY,JSON.stringify(loops));}
      catch{$('status').textContent='Nepavyko išsaugoti uždaros teritorijos.';}
      trail=[current];
      return;
    }
  }
  function classify(elements){
    const tags=elements.filter(e=>e.type!=='count').map(e=>e.tags||{});
    if(tags.some(t=>t.landuse==='forest'||t.natural==='wood'||t.landcover==='trees'))return 'forest';
    if(tags.some(t=>['residential','commercial','industrial','retail','construction','garages'].includes(t.landuse)||t.building))return 'urban';
    if(tags.some(t=>['farmland','farmyard','meadow','orchard','vineyard','allotments','grass'].includes(t.landuse)||['grassland','heath'].includes(t.natural)))return 'field';
    const count=elements.find(e=>e.type==='count');
    if(Number(count?.tags?.total)>=8)return 'urban';
    return 'unknown';
  }
  function updateTerrainLabel(kind){
    const config=profile(kind);
    $('radius').textContent=config.radiusLabel;
    $('terrain').textContent=kind==='unknown'?'Nežinoma':config.label;
  }
  function terrainFor(point){
    return terrainFix&&Date.now()-terrainFix.at<90000&&map.distance(point,terrainFix.point)<120
      ?terrainFix.kind:'unknown';
  }
  async function checkTerrain(point){
    const now=Date.now();
    if(terrainPending||now<nextTerrainCheck||
      (terrainFix&&now-terrainFix.at<90000&&map.distance(point,terrainFix.point)<150))return;
    terrainPending=true;nextTerrainCheck=now+20000;
    const lat=point[0].toFixed(6),lon=point[1].toFixed(6);
    const query='[out:json][timeout:10];is_in('+lat+','+lon+');out tags;nwr["building"](around:150,'+lat+','+lon+');out count;';
    try{
      const response=await fetch('https://overpass-api.de/api/interpreter',{
        method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:'data='+encodeURIComponent(query),signal:AbortSignal.timeout(15000)
      });
      if(!response.ok)throw Error('Overpass '+response.status);
      const data=await response.json();
      if(!Array.isArray(data.elements))throw Error('Invalid Overpass response');
      const kind=classify(data.elements);
      terrainFix={point,kind,at:Date.now()};
      if(kind!=='unknown'){
        let changed=false;
        for(const saved of points){
          if(saved[2]==='unknown'&&map.distance(saved,point)<150){saved[2]=kind;changed=true;}
        }
        if(changed){
          try{localStorage.setItem(KEY,JSON.stringify(points));}catch{}
          redraw();
        }
      }
      if(lastFix)updateTerrainLabel(terrainFor(lastFix.point));
    }catch{
      // Unknown places keep the narrow forest profile until a new lookup succeeds.
      nextTerrainCheck=Date.now()+60000;
      if(lastFix)updateTerrainLabel(terrainFor(lastFix.point));
    }finally{terrainPending=false;}
  }
  function onPosition(position){
    const {latitude:lat,longitude:lon,accuracy}=position.coords;
    if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return;
    $('accuracy').textContent=Number.isFinite(accuracy)?Math.round(accuracy)+' m':'–';
    if(!Number.isFinite(accuracy)||accuracy>MAX_ACCURACY){
      $('status').textContent='Laukiama tikslesnės vietos (reikia iki 100 m tikslumo).';return;
    }
    const point=[lat,lon],now=position.timestamp||Date.now();
    const distance=lastFix?map.distance(lastFix.point,point):Infinity;
    const seconds=lastFix?(now-lastFix.time)/1000:Infinity;
    if(lastFix&&seconds>0&&distance/seconds>70){
      $('status').textContent='Staigus GPS šuolis ignoruotas; laukiama kito matavimo.';return;
    }
    if(!marker){marker=L.circleMarker(point,{radius:8,color:'#fff',weight:3,fillColor:'#dd785f',fillOpacity:1}).addTo(map);map.setView(point,15);}
    else marker.setLatLng(point);
    const kind=terrainFor(point);
    updateTerrainLabel(kind);
    if(distance>=80){
      // Short plausible gaps form a corridor; long gaps only reveal endpoints.
      if(lastFix&&distance<=2000&&seconds>0&&seconds<=120){
        const steps=Math.ceil(distance/250);
        for(let i=1;i<steps;i++){
          const t=i/steps;save(lastFix.point[0]+(lat-lastFix.point[0])*t,lastFix.point[1]+(lon-lastFix.point[1])*t,kind);
        }
      }
      save(lat,lon,kind);lastFix={point,time:now};
      $('status').textContent='Tyrinėjama · atrasta vieta išsaugota šiame įrenginyje.';
    }else $('status').textContent='Vieta nustatyta · laukiamas judėjimas.';
    checkTerrain(point);
    $('mapLabel').textContent='ATRANDAMA TERITORIJA';
  }
  function stop(){
    if(watcher!==null)navigator.geolocation.clearWatch(watcher);
    watcher=null;lastFix=null;trail=[];$('start').disabled=false;$('stop').disabled=true;
  }
  $('start').onclick=()=>{
    if(watcher!==null)return;
    if(!navigator.geolocation){$('status').textContent='Šis įrenginys nepalaiko buvimo vietos nustatymo.';return;}
    watcher=navigator.geolocation.watchPosition(onPosition,error=>{
      $('status').textContent=error.code===1?'Vietos leidimas nesuteiktas. Įjunk jį naršyklės nustatymuose.':'Vietos nustatyti nepavyko. Bandyk dar kartą.';
      stop();
    },{enableHighAccuracy:true,maximumAge:0,timeout:20000});
    $('start').disabled=true;$('stop').disabled=false;
    $('status').textContent='Laukiama buvimo vietos leidimo ir pirmojo GPS matavimo…';
  };
  $('stop').onclick=()=>{stop();$('status').textContent='Tyrinėjimas sustabdytas. Atrastos vietos išsaugotos.';};
  $('recenter').onclick=()=>{if(marker)map.flyTo(marker.getLatLng(),Math.max(map.getZoom(),15),{duration:.6});else $('status').textContent='Pirmiausia pradėk tyrinėjimą ir leisk nustatyti vietą.';};
})();
