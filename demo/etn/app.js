/* ETN prototype: geographical fog over the Leaflet map used by Kur aš? */
(() => {
  'use strict';
  const KEY='etn-explored-v1', RADIUS=1000, MAX_ACCURACY=100, MAX_POINTS=5000;
  const $=id=>document.getElementById(id);
  const map=L.map('map',{zoomControl:false,zoomSnap:0,zoomDelta:.5}).setView([55.1694,23.8813],7);
  L.control.zoom({position:'bottomright'}).addTo(map);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  function load(){
    try{
      const data=JSON.parse(localStorage.getItem(KEY)||'[]');
      return Array.isArray(data)?data.slice(-MAX_POINTS).filter(p=>Array.isArray(p)&&p.length===2&&Number.isFinite(p[0])&&Number.isFinite(p[1])&&Math.abs(p[0])<=90&&Math.abs(p[1])<=180):[];
    }catch{return [];}
  }
  let points=load(),watcher=null,lastFix=null,marker=null,queued=false;
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
    ctx.fillStyle='rgba(5,10,12,.96)';ctx.fillRect(0,0,size.x,size.y);
    if(!points.length)return;
    const viewport=map.getBounds().pad(.8);
    ctx.globalCompositeOperation='destination-out';
    ctx.beginPath();
    for(const [lat,lon] of points){
      if(!viewport.contains([lat,lon]))continue;
      const p=map.latLngToContainerPoint([lat,lon]);
      const north=map.latLngToContainerPoint([lat+RADIUS/111320,lon]);
      const cos=Math.max(.01,Math.cos(lat*Math.PI/180));
      const east=map.latLngToContainerPoint([lat,lon+RADIUS/(111320*cos)]);
      const rx=Math.abs(east.x-p.x),ry=Math.abs(north.y-p.y);
      if(rx<.3&&ry<.3)continue;
      ctx.moveTo(p.x+rx,p.y);
      ctx.ellipse(p.x,p.y,Math.max(rx,.3),Math.max(ry,.3),0,0,Math.PI*2);
    }
    ctx.fill();
    ctx.globalCompositeOperation='source-over';
  }
  function redraw(){if(!queued){queued=true;requestAnimationFrame(draw);}}
  map.on('move zoom zoomanim zoomend resize viewreset',redraw);redraw();
  function save(lat,lon){
    points.push([lat,lon]);
    if(points.length>MAX_POINTS)points=points.slice(-MAX_POINTS);
    try{localStorage.setItem(KEY,JSON.stringify(points));}
    catch{$('status').textContent='Įrenginyje pritrūko vietos istorijai išsaugoti.';}
    $('count').textContent=String(points.length);redraw();
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
    if(distance>=80){
      // Short plausible gaps form a corridor; long gaps only reveal endpoints.
      if(lastFix&&distance<=2000&&seconds>0&&seconds<=120){
        const steps=Math.ceil(distance/250);
        for(let i=1;i<steps;i++){
          const t=i/steps;save(lastFix.point[0]+(lat-lastFix.point[0])*t,lastFix.point[1]+(lon-lastFix.point[1])*t);
        }
      }
      save(lat,lon);lastFix={point,time:now};
      $('status').textContent='Tyrinėjama · atrasta vieta išsaugota šiame įrenginyje.';
    }else $('status').textContent='Vieta nustatyta · laukiamas judėjimas.';
    $('mapLabel').textContent='ATRANDAMA TERITORIJA';
  }
  function stop(){
    if(watcher!==null)navigator.geolocation.clearWatch(watcher);
    watcher=null;lastFix=null;$('start').disabled=false;$('stop').disabled=true;
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
