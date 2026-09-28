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
        Array.isArray(p)&&(p.length===2||p.length===3||p.length===4)&&Number.isFinite(p[0])&&
        Number.isFinite(p[1])&&Math.abs(p[0])<=90&&Math.abs(p[1])<=180&&
        (p.length===2||['field','urban','forest','unknown'].includes(p[2]))&&
        (p.length!==4||(Array.isArray(p[3])&&p[3].length===8&&
          p[3].every(kind=>['field','urban','forest','unknown'].includes(kind))))):[];
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
    for(const [lat,lon,kind='field',sectors] of points){
      const configs=Array.isArray(sectors)?sectors.map(profile):[profile(kind)];
      const p=map.latLngToContainerPoint([lat,lon]);
      const north=map.latLngToContainerPoint([lat+1000/111320,lon]);
      const pxPerMeter=Math.abs(north.y-p.y)/1000;
      const outer=Math.max(...configs.map(c=>c.radius))*pxPerMeter;
      if(outer<.3)continue;
      if(p.x+outer<0||p.x-outer>size.x||p.y+outer<0||p.y-outer>size.y)continue;
      ctx.save();
      ctx.translate(p.x,p.y);
      const count=Array.isArray(sectors)?16:1;
      for(let i=0;i<count;i++){
        const first=configs[Math.floor(i/2)%8];
        const next=configs[(Math.floor(i/2)+1)%8];
        const config=count===1?configs[0]:i%2===0?first:{
          radius:(first.radius+next.radius)/2,clear:(first.clear+next.clear)/2
        };
        const radius=config.radius*pxPerMeter;
        if(count>1){
          const half=Math.PI/count;
          const center=-Math.PI/2+i*2*half;
          ctx.save();ctx.beginPath();ctx.moveTo(0,0);
          ctx.arc(0,0,radius+1,center-half,center+half);
          ctx.closePath();ctx.clip();
        }
        const fade=ctx.createRadialGradient(0,0,0,0,0,radius);
        fade.addColorStop(0,'rgba(0,0,0,1)');
        fade.addColorStop(config.clear/config.radius,'rgba(0,0,0,1)');
        fade.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=fade;
        ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();
        if(count>1)ctx.restore();
      }
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
  function save(lat,lon,kind,sectors){
    const entry=[lat,lon,kind];
    if(Array.isArray(sectors))entry.push(sectors);
    points.push(entry);
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
  function updateTerrainLabel(kind,sectors){
    const config=profile(kind);
    const radii=Array.isArray(sectors)?sectors.map(s=>profile(s).radius):[config.radius];
    const smallest=Math.min(...radii),largest=Math.max(...radii);
    const label=radius=>radius===1000?'1':radius===500?'0,5':'0,25';
    $('radius').textContent=smallest===largest?label(largest)+' km':label(smallest)+'–'+label(largest)+' km';
    $('terrain').textContent=(kind==='unknown'?'Nežinoma':config.label)+(smallest!==largest?' · mišru':'');
  }
  function terrainFor(point){
    return terrainFix&&Date.now()-terrainFix.at<90000&&map.distance(point,terrainFix.point)<120
      ?{kind:terrainFix.kind,sectors:terrainFix.sectors}:{kind:'unknown',sectors:null};
  }
  function directionPoint(point,meters,index){
    const angle=index*Math.PI/4,cos=Math.max(.01,Math.cos(point[0]*Math.PI/180));
    return [point[0]+meters*Math.cos(angle)/111320,
      point[1]+meters*Math.sin(angle)/(111320*cos)];
  }
  function terrainQuery(samples){
    return '[out:json][timeout:30];'+samples.map(([latitude,longitude])=>{
      const lat=latitude.toFixed(6),lon=longitude.toFixed(6);
      return 'is_in('+lat+','+lon+');out tags;'+
        'nwr["building"](around:120,'+lat+','+lon+');out count;';
    }).join('');
  }
  function parseSamples(elements,count){
    const groups=[],group=[];
    for(const item of elements){
      group.push(item);
      if(item.type==='count'){groups.push(group.splice(0));}
    }
    if(groups.length!==count||group.length)throw Error('Incomplete terrain samples');
    return groups.map(classify);
  }
  async function checkTerrain(point){
    const now=Date.now();
    if(terrainPending||now<nextTerrainCheck||
      (terrainFix&&now-terrainFix.at<90000&&map.distance(point,terrainFix.point)<150))return;
    terrainPending=true;nextTerrainCheck=now+20000;
    const samples=[point,...Array.from({length:8},(_,i)=>directionPoint(point,300,i))];
    const query=terrainQuery(samples);
    try{
      const response=await fetch('https://overpass-api.de/api/interpreter',{
        method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:'data='+encodeURIComponent(query),signal:AbortSignal.timeout(35000)
      });
      if(!response.ok)throw Error('Overpass '+response.status);
      const data=await response.json();
      if(!Array.isArray(data.elements))throw Error('Invalid Overpass response');
      const [kind,...sectors]=parseSamples(data.elements,samples.length);
      terrainFix={point,kind,sectors,at:Date.now()};
      let changed=false;
      for(const saved of points){
        if(saved[2]==='unknown'&&map.distance(saved,point)<150){
          saved[2]=kind;saved[3]=sectors;changed=true;
        }
      }
      if(changed){
        try{localStorage.setItem(KEY,JSON.stringify(points));}catch{}
        redraw();
      }
      if(lastFix){const current=terrainFor(lastFix.point);updateTerrainLabel(current.kind,current.sectors);}
    }catch{
      // Unknown places keep the narrow forest profile until a new lookup succeeds.
      nextTerrainCheck=Date.now()+60000;
      if(lastFix){const current=terrainFor(lastFix.point);updateTerrainLabel(current.kind,current.sectors);}
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
    const terrain=terrainFor(point);
    updateTerrainLabel(terrain.kind,terrain.sectors);
    if(distance>=80){
      // Short plausible gaps form a corridor; long gaps only reveal endpoints.
      if(lastFix&&distance<=2000&&seconds>0&&seconds<=120){
        const steps=Math.ceil(distance/250);
        for(let i=1;i<steps;i++){
          const t=i/steps;save(lastFix.point[0]+(lat-lastFix.point[0])*t,lastFix.point[1]+(lon-lastFix.point[1])*t,terrain.kind,terrain.sectors);
        }
      }
      save(lat,lon,terrain.kind,terrain.sectors);lastFix={point,time:now};
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
