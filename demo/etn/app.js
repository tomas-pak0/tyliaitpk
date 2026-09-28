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
  let countries=[],currentCountry=null,progressTimer=null,progressRevision=0;
  const borderPane=map.createPane('countryBorders');
  borderPane.style.zIndex='650';borderPane.style.pointerEvents='none';
  const borders=L.layerGroup().addTo(map);
  const countryNames=typeof Intl.DisplayNames==='function'
    ?new Intl.DisplayNames(['lt'],{type:'region'}):null;
  const countryName=feature=>{
    const code=feature.properties.code;
    return /^[A-Z]{2}$/.test(code||'')&&countryNames
      ?countryNames.of(code):feature.properties.name;
  };
  const countryFlag=code=>/^[A-Z]{2}$/.test(code||'')
    ?String.fromCodePoint(...[...code].map(letter=>127397+letter.charCodeAt(0))):'🌐';
  function rings(feature){
    const g=feature.geometry;
    return g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];
  }
  function inRing(lon,lat,ring){
    let inside=false;
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const [xi,yi]=ring[i],[xj,yj]=ring[j];
      if((yi>lat)!==(yj>lat)&&lon<(xj-xi)*(lat-yi)/(yj-yi)+xi)inside=!inside;
    }
    return inside;
  }
  function inCountry(lon,lat,feature){
    const [west,south,east,north]=feature.bounds;
    if(lon<west||lon>east||lat<south||lat>north)return false;
    return rings(feature).some(polygon=>inRing(lon,lat,polygon[0])&&
      !polygon.slice(1).some(hole=>inRing(lon,lat,hole)));
  }
  function sphericalArea(ring){
    let sum=0;
    for(let i=0;i<ring.length-1;i++){
      const a=ring[i],b=ring[i+1];
      let delta=(b[0]-a[0])*Math.PI/180;
      if(delta>Math.PI)delta-=2*Math.PI;
      if(delta< -Math.PI)delta+=2*Math.PI;
      sum+=delta*(Math.sin(a[1]*Math.PI/180)+Math.sin(b[1]*Math.PI/180));
    }
    return Math.abs(sum)*6371008.8**2/2;
  }
  function prepareCountry(feature){
    const bounds=[180,90,-180,-90];
    let area=0;
    for(const polygon of rings(feature)){
      for(let i=0;i<polygon.length;i++){
        const ring=polygon[i];
        area+=(i===0?1:-1)*sphericalArea(ring);
        for(const [lon,lat] of ring){
          bounds[0]=Math.min(bounds[0],lon);bounds[1]=Math.min(bounds[1],lat);
          bounds[2]=Math.max(bounds[2],lon);bounds[3]=Math.max(bounds[3],lat);
        }
      }
    }
    feature.bounds=bounds;feature.area=Math.max(area,1);
    return feature;
  }
  function updateBorders(){
    borders.clearLayers();
    if(!countries.length)return;
    const visible=map.getBounds();
    for(const feature of countries){
      const [west,south,east,north]=feature.bounds;
      if(!visible.intersects([[south,west],[north,east]]))continue;
      L.geoJSON(feature,{pane:'countryBorders',interactive:false,style:{
        color:feature===currentCountry?'#fa9b83':'#e78371',
        weight:feature===currentCountry?2.5:1.3,opacity:feature===currentCountry?.9:.65,
        fill:false
      }}).addTo(borders);
    }
  }
  map.on('moveend',updateBorders);
  function findCountry(point){
    // Prefer the previous country on a shared border to avoid label flicker.
    const [lat,lon]=point;
    if(currentCountry&&inCountry(lon,lat,currentCountry))return currentCountry;
    return countries.find(feature=>inCountry(lon,lat,feature))||null;
  }
  async function loadCountries(){
    try{
      const response=await fetch('data/countries-50m.bin');
      if(!response.ok)throw Error('Country boundaries unavailable');
      const stream=response.body.pipeThrough(new DecompressionStream('gzip'));
      const data=JSON.parse(await new Response(stream).text());
      if(data.type!=='FeatureCollection'||!Array.isArray(data.features))throw Error('Invalid borders');
      countries=data.features.map(prepareCountry);
      if(marker)setCountry(marker.getLatLng());
      updateBorders();
    }catch{
      $('country').textContent='Ribų duomenys nepasiekiami';
      $('countryProgress').textContent='–';
    }
  }
  function setCountry(point){
    if(!countries.length)return;
    const found=findCountry([point.lat,point.lng]);
    if(found===currentCountry)return;
    currentCountry=found;
    $('country').textContent=found?countryName(found):'Už šalių ribų';
    $('countryFlag').textContent=found?countryFlag(found.properties.code):'🌐';
    $('countryProgress').textContent=found?'Skaičiuojama…':'–';
    updateBorders();scheduleProgress();
  }
  function pointVisibility(distance,angle,sectors){
    const position=(angle+Math.PI*2)%(Math.PI*2)/(Math.PI/4);
    const before=Math.floor(position)%8,after=(before+1)%8;
    const t=position-Math.floor(position),blend=t*t*(3-2*t);
    const value=kind=>{
      const config=profile(kind);
      if(distance<=config.clear)return 1;
      if(distance>=config.radius)return 0;
      return (config.radius-distance)/(config.radius-config.clear);
    };
    return value(sectors[before])*(1-blend)+value(sectors[after])*blend;
  }
  function exploredPercent(feature){
    // A 100 m grid approximates the union of all visibility masks. Each cell
    // retains its greatest visibility, matching the on-screen fog composition.
    const [west,south,east,north]=feature.bounds;
    const baseLat=(south+north)/2,cosBase=Math.max(.01,Math.cos(baseLat*Math.PI/180));
    const step=100,metersPerDegree=111195;
    const latAt=y=>south+(y+.5)*step/metersPerDegree;
    const lonAt=x=>west+(x+.5)*step/(metersPerDegree*cosBase);
    const cells=new Map();
    const add=(x,y,visibility)=>{
      if(visibility<=0)return;
      const lon=lonAt(x),lat=latAt(y);
      if(!inCountry(lon,lat,feature))return;
      const key=x+','+y;
      if(visibility>(cells.get(key)||0))cells.set(key,visibility);
    };
    for(const [lat,lon,kind='field',sectors] of points){
      const maxRadius=Array.isArray(sectors)
        ?Math.max(...sectors.map(s=>profile(s).radius)):profile(kind).radius;
      if(lon<(west-maxRadius/100000)||lon>(east+maxRadius/100000)||
        lat<(south-maxRadius/100000)||lat>(north+maxRadius/100000))continue;
      const cx=(lon-west)*metersPerDegree*cosBase/step-.5;
      const cy=(lat-south)*metersPerDegree/step-.5;
      const reach=Math.ceil(maxRadius/step/cosBase)+1;
      const types=Array.isArray(sectors)?sectors:Array(8).fill(kind);
      for(let y=Math.floor(cy-reach);y<=Math.ceil(cy+reach);y++){
        const sampleLat=latAt(y),dy=(sampleLat-lat)*metersPerDegree;
        if(Math.abs(dy)>=maxRadius)continue;
        const halfWidth=Math.sqrt(maxRadius**2-dy**2);
        const lonFactor=metersPerDegree*Math.max(.01,Math.cos(sampleLat*Math.PI/180));
        const left=Math.ceil((lon-halfWidth/lonFactor-west)*metersPerDegree*cosBase/step-.5);
        const right=Math.floor((lon+halfWidth/lonFactor-west)*metersPerDegree*cosBase/step-.5);
        for(let x=left;x<=right;x++){
          const dx=(lonAt(x)-lon)*lonFactor,distance=Math.hypot(dx,dy);
          add(x,y,pointVisibility(distance,Math.atan2(dx,dy),types));
        }
      }
    }
    for(const ring of loops){
      const ys=ring.map(p=>p[0]),xs=ring.map(p=>p[1]);
      const polygon=ring.map(([lat,lon])=>[lon,lat]);
      const minX=Math.floor((Math.max(west,Math.min(...xs))-west)*metersPerDegree*cosBase/step);
      const maxX=Math.ceil((Math.min(east,Math.max(...xs))-west)*metersPerDegree*cosBase/step);
      const minY=Math.floor((Math.max(south,Math.min(...ys))-south)*metersPerDegree/step);
      const maxY=Math.ceil((Math.min(north,Math.max(...ys))-south)*metersPerDegree/step);
      for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
        if(inRing(lonAt(x),latAt(y),polygon))add(x,y,1);
      }
    }
    let revealed=0;
    for(const [key,visibility] of cells){
      const y=Number(key.slice(key.indexOf(',')+1));
      revealed+=visibility*step*step*Math.cos(latAt(y)*Math.PI/180)/cosBase;
    }
    return Math.min(100,100*revealed/feature.area);
  }
  function scheduleProgress(){
    clearTimeout(progressTimer);
    const revision=++progressRevision,feature=currentCountry;
    if(!feature)return;
    progressTimer=setTimeout(()=>{
      if(revision!==progressRevision)return;
      const value=exploredPercent(feature);
      $('countryProgress').textContent=value===0?'0 %':
        value.toLocaleString('lt-LT',{minimumFractionDigits:5,maximumFractionDigits:5})+' %';
    },300);
  }
  loadCountries();
  $('count').textContent=String(points.length);
  const canvas=document.createElement('canvas');
  canvas.className='fog-canvas';canvas.setAttribute('aria-hidden','true');
  map.getContainer().appendChild(canvas);
  const ctx=canvas.getContext('2d');
  const coverage=document.createElement('canvas');
  const coverageCtx=coverage.getContext('2d',{willReadFrequently:true});
  const MASK_SIZE=512,MASK_CACHE_LIMIT=24,maskCache=new Map();
  let polarGrid=null;
  function getPolarGrid(){
    if(polarGrid)return polarGrid;
    const angles=new Float32Array(MASK_SIZE*MASK_SIZE);
    const distances=new Float32Array(MASK_SIZE*MASK_SIZE);
    const half=MASK_SIZE/2;
    for(let y=0;y<MASK_SIZE;y++)for(let x=0;x<MASK_SIZE;x++){
      const dx=(x+.5-half)/half,dy=(y+.5-half)/half,index=y*MASK_SIZE+x;
      distances[index]=Math.hypot(dx,dy);
      angles[index]=(Math.atan2(dx,-dy)+Math.PI*2)%(Math.PI*2)/(Math.PI/4);
    }
    polarGrid={angles,distances};
    return polarGrid;
  }
  function directionalMask(sectors){
    const key=sectors.join(',');
    if(maskCache.has(key)){
      const cached=maskCache.get(key);
      maskCache.delete(key);maskCache.set(key,cached);
      return cached;
    }
    const configs=sectors.map(profile);
    const maxRadius=Math.max(...configs.map(c=>c.radius));
    const mask=document.createElement('canvas');
    mask.width=mask.height=MASK_SIZE;
    const maskContext=mask.getContext('2d');
    const image=maskContext.createImageData(MASK_SIZE,MASK_SIZE);
    const pixels=image.data,{angles,distances}=getPolarGrid();
    for(let index=0;index<distances.length;index++){
      const distance=distances[index]*maxRadius;
      let visibility=0;
      if(distance<=maxRadius){
        const direction=angles[index];
        const before=Math.floor(direction)%8,after=(before+1)%8;
        const fraction=direction-Math.floor(direction);
        const blend=fraction*fraction*(3-2*fraction);
        const visibilityAt=config=>{
          if(distance<=config.clear)return 1;
          if(distance>=config.radius)return 0;
          return (config.radius-distance)/(config.radius-config.clear);
        };
        visibility=visibilityAt(configs[before])*(1-blend)+
          visibilityAt(configs[after])*blend;
      }
      const offset=index*4,value=Math.round(255*visibility);
      pixels[offset]=pixels[offset+1]=pixels[offset+2]=value;
      pixels[offset+3]=255;
    }
    maskContext.putImageData(image,0,0);
    const result={canvas:mask,maxRadius};
    maskCache.set(key,result);
    if(maskCache.size>MASK_CACHE_LIMIT)maskCache.delete(maskCache.keys().next().value);
    return result;
  }
  function draw(){
    queued=false;
    const size=map.getSize(),ratio=Math.min(devicePixelRatio||1,2);
    if(canvas.width!==Math.round(size.x*ratio)||canvas.height!==Math.round(size.y*ratio)){
      canvas.width=Math.round(size.x*ratio);canvas.height=Math.round(size.y*ratio);
    }
    if(coverage.width!==canvas.width||coverage.height!==canvas.height){
      coverage.width=canvas.width;coverage.height=canvas.height;
    }
    coverageCtx.setTransform(ratio,0,0,ratio,0,0);
    coverageCtx.globalCompositeOperation='source-over';
    coverageCtx.fillStyle='#000';
    coverageCtx.fillRect(0,0,size.x,size.y);
    coverageCtx.globalCompositeOperation='lighten';
    for(const [lat,lon,kind='field',sectors] of points){
      const config=profile(kind);
      const p=map.latLngToContainerPoint([lat,lon]);
      const north=map.latLngToContainerPoint([lat+1000/111320,lon]);
      const pxPerMeter=Math.abs(north.y-p.y)/1000;
      const maxRadius=Array.isArray(sectors)
        ?Math.max(...sectors.map(s=>profile(s).radius)):config.radius;
      const outer=maxRadius*pxPerMeter;
      if(outer<.3)continue;
      if(p.x+outer<0||p.x-outer>size.x||p.y+outer<0||p.y-outer>size.y)continue;
      const shape=directionalMask(Array.isArray(sectors)?sectors:Array(8).fill(kind));
      coverageCtx.save();
      coverageCtx.translate(p.x,p.y);
      coverageCtx.drawImage(shape.canvas,-outer,-outer,2*outer,2*outer);
      coverageCtx.restore();
    }
    // A walked, closed ring reveals everything it surrounds, even where
    // the individual 1 km clearings leave fog in the middle.
    coverageCtx.fillStyle='#fff';
    for(const ring of loops){
      coverageCtx.beginPath();
      ring.forEach(([lat,lon],index)=>{
        const p=map.latLngToContainerPoint([lat,lon]);
        if(index===0)coverageCtx.moveTo(p.x,p.y);else coverageCtx.lineTo(p.x,p.y);
      });
      coverageCtx.closePath();coverageCtx.fill();
    }
    const fog=coverageCtx.getImageData(0,0,coverage.width,coverage.height);
    for(let i=0;i<fog.data.length;i+=4){
      const visible=fog.data[i];
      fog.data[i]=5;fog.data[i+1]=10;fog.data[i+2]=12;
      fog.data[i+3]=255-visible;
    }
    ctx.putImageData(fog,0,0);
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
    scheduleProgress();
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
        scheduleProgress();
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
    setCountry({lat,lng:lon});
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
