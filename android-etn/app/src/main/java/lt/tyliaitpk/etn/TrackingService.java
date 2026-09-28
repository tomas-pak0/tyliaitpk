package lt.tyliaitpk.etn;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ServiceInfo;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.IBinder;
import android.os.Looper;
import android.os.SystemClock;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class TrackingService extends Service implements LocationListener {
    public static final String ACTION_STOP = "lt.tyliaitpk.etn.STOP_TRACKING";
    private static final String CHANNEL = "etn-location";
    private static final String FILENAME = "pending-locations.jsonl";
    private static final String PREFS = "etn-native";
    private static final Object FILE_LOCK = new Object();
    private LocationManager locations;
    private final ExecutorService terrainWorker = Executors.newSingleThreadExecutor();
    private volatile TerrainFix terrainFix;
    private volatile boolean terrainPending;
    private long nextTerrainAt;
    private static class TerrainFix {
        final double lat, lon;
        final String kind;
        final JSONArray sectors;
        final long at;
        TerrainFix(double lat, double lon, String kind, JSONArray sectors) {
            this.lat=lat;this.lon=lon;this.kind=kind;this.sectors=sectors;this.at=System.currentTimeMillis();
        }
    }
    private static float meters(double lat1, double lon1, double lat2, double lon2) {
        float[] result=new float[1];Location.distanceBetween(lat1,lon1,lat2,lon2,result);return result[0];
    }
    private void checkTerrain(Location location) {
        TerrainFix old=terrainFix;
        long now=SystemClock.elapsedRealtime();
        if(terrainPending||now<nextTerrainAt||(old!=null&&System.currentTimeMillis()-old.at<120000&&
            meters(old.lat,old.lon,location.getLatitude(),location.getLongitude())<250))return;
        terrainPending=true;nextTerrainAt=now+45000;
        final double lat=location.getLatitude(),lon=location.getLongitude();
        terrainWorker.execute(()->{
            try {
                TerrainFix found=fetchTerrain(lat,lon);
                if(found!=null && !"unknown".equals(found.kind)) {
                    terrainFix=found;
                    // Give fixes captured during the request the classification too.
                    synchronized(FILE_LOCK){
                        List<String> lines=readLines(this);
                        StringBuilder updated=new StringBuilder();
                        for(String line:lines){
                            try{
                                JSONObject item=new JSONObject(line);
                                if(!item.has("kind")&&meters(lat,lon,item.getDouble("lat"),item.getDouble("lon"))<250){
                                    item.put("kind",found.kind);item.put("sectors",found.sectors);
                                }
                                updated.append(item).append('\n');
                            }catch(Exception ignored){updated.append(line).append('\n');}
                        }
                        Files.write(queue(this).toPath(),updated.toString().getBytes(StandardCharsets.UTF_8));
                    }
                }
            }catch(Exception ignored){}finally{terrainPending=false;}
        });
    }
    private static String terrainClass(List<JSONObject> elements) {
        boolean forest=false,urban=false,field=false;
        int buildings=0;
        for(JSONObject element:elements){
            JSONObject tags=element.optJSONObject("tags");
            if(tags==null)continue;
            String landuse=tags.optString("landuse"),natural=tags.optString("natural");
            if("forest".equals(landuse)||"wood".equals(natural)||"trees".equals(tags.optString("landcover")))forest=true;
            if("residential".equals(landuse)||"commercial".equals(landuse)||"industrial".equals(landuse)||
                "retail".equals(landuse)||"construction".equals(landuse)||"garages".equals(landuse)||tags.has("building"))urban=true;
            if("farmland".equals(landuse)||"farmyard".equals(landuse)||"meadow".equals(landuse)||
                "orchard".equals(landuse)||"vineyard".equals(landuse)||"allotments".equals(landuse)||
                "grass".equals(landuse)||"grassland".equals(natural)||"heath".equals(natural))field=true;
            if("count".equals(element.optString("type")))buildings=tags.optInt("total",0);
        }
        return forest?"forest":urban||buildings>=8?"urban":field?"field":"unknown";
    }
    private static TerrainFix fetchTerrain(double lat,double lon){
        StringBuilder q=new StringBuilder("[out:json][timeout:18];");
        for(int i=-1;i<8;i++){
            double angle=Math.max(0,i)*Math.PI/4;
            double y=i<0?lat:lat+300*Math.cos(angle)/111320;
            double x=i<0?lon:lon+300*Math.sin(angle)/(111320*Math.max(.01,Math.cos(Math.toRadians(lat))));
            String position=String.format(Locale.US,"%.6f,%.6f",y,x);
            q.append("is_in(").append(position).append(");out tags;")
                .append("nwr[\"building\"](around:120,").append(position).append(");out count;");
        }
        for(String endpoint:new String[]{"https://overpass-api.de/api/interpreter","https://overpass.kumi.systems/api/interpreter"}){
            HttpURLConnection conn=null;
            try{
                conn=(HttpURLConnection)new URL(endpoint).openConnection();
                conn.setConnectTimeout(9000);conn.setReadTimeout(18000);
                conn.setRequestMethod("POST");conn.setDoOutput(true);
                conn.setRequestProperty("Content-Type","application/x-www-form-urlencoded; charset=UTF-8");
                conn.setRequestProperty("User-Agent","ETN/0.4 (background location exploration)");
                byte[] body=("data="+URLEncoder.encode(q.toString(),"UTF-8")).getBytes(StandardCharsets.UTF_8);
                try(java.io.OutputStream output=conn.getOutputStream()){output.write(body);}
                if(conn.getResponseCode()!=200)continue;
                byte[] bytes;
                try(InputStream input=conn.getInputStream();ByteArrayOutputStream output=new ByteArrayOutputStream()){
                    byte[] buffer=new byte[8192];int n;
                    while((n=input.read(buffer))!=-1){output.write(buffer,0,n);if(output.size()>2_000_000)throw new Exception("Too large");}
                    bytes=output.toByteArray();
                }
                JSONArray elements=new JSONObject(new String(bytes,StandardCharsets.UTF_8)).getJSONArray("elements");
                List<JSONObject> group=new ArrayList<>();JSONArray kinds=new JSONArray();
                for(int i=0;i<elements.length();i++){
                    JSONObject element=elements.getJSONObject(i);group.add(element);
                    if("count".equals(element.optString("type"))){kinds.put(terrainClass(group));group.clear();}
                }
                if(kinds.length()!=9||!group.isEmpty())continue;
                String kind=kinds.getString(0);JSONArray sectors=new JSONArray();
                int[] counts=new int[3];
                for(int i=1;i<9;i++){
                    String value=kinds.getString(i);sectors.put(value);
                    if("field".equals(value))counts[0]++;if("urban".equals(value))counts[1]++;if("forest".equals(value))counts[2]++;
                }
                if("unknown".equals(kind)&&counts[0]+counts[1]+counts[2]>=3)
                    kind=counts[0]>=counts[1]&&counts[0]>=counts[2]?"field":counts[1]>=counts[2]?"urban":"forest";
                return new TerrainFix(lat,lon,kind,sectors);
            }catch(Exception ignored){}finally{if(conn!=null)conn.disconnect();}
        }
        return null;
    }

    static boolean isRunning(Context context) {
        return context.getSharedPreferences(PREFS, MODE_PRIVATE).getBoolean("running", false);
    }
    private void setRunning(boolean value) {
        getSharedPreferences(PREFS, MODE_PRIVATE).edit().putBoolean("running", value).apply();
    }
    private static File queue(Context context) { return new File(context.getFilesDir(), FILENAME); }
    private static List<String> readLines(Context context) {
        List<String> lines = new ArrayList<>();
        File file = queue(context);
        if (!file.exists()) return lines;
        try (BufferedReader input = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = input.readLine()) != null) if (!line.isEmpty()) lines.add(line);
        } catch (Exception ignored) {}
        return lines;
    }
    static String pendingFixes(Context context) {
        synchronized (FILE_LOCK) {
            JSONArray result = new JSONArray();
            for (String line : readLines(context)) {
                if (result.length() >= 1000) break;
                try { result.put(new JSONObject(line)); } catch (Exception ignored) {}
            }
            return result.toString();
        }
    }
    static void ackFixes(Context context, long lastId) {
        synchronized (FILE_LOCK) {
            try {
                StringBuilder remaining = new StringBuilder();
                for (String line : readLines(context)) {
                    JSONObject item = new JSONObject(line);
                    if (item.getLong("id") > lastId) remaining.append(line).append('\n');
                }
                Files.write(queue(context).toPath(), remaining.toString().getBytes(StandardCharsets.UTF_8));
            } catch (Exception ignored) {}
        }
    }
    private static String label(String key) {
        String language = Locale.getDefault().getLanguage();
        switch (language) {
            case "lt": return key.equals("title") ? "ETN tyrinėja aplinką" : key.equals("stop") ? "Stabdyti" : "Vieta fiksuojama fone";
            case "lv": return key.equals("title") ? "ETN pēta apkārtni" : key.equals("stop") ? "Apturēt" : "Atrašanās vieta tiek saglabāta fonā";
            case "pl": return key.equals("title") ? "ETN odkrywa okolicę" : key.equals("stop") ? "Zatrzymaj" : "Lokalizacja jest zapisywana w tle";
            case "de": return key.equals("title") ? "ETN erkundet die Umgebung" : key.equals("stop") ? "Stoppen" : "Standort wird im Hintergrund erfasst";
            case "es": return key.equals("title") ? "ETN explora el entorno" : key.equals("stop") ? "Detener" : "La ubicación se guarda en segundo plano";
            case "fr": return key.equals("title") ? "ETN explore les environs" : key.equals("stop") ? "Arrêter" : "Position enregistrée en arrière-plan";
            default: return key.equals("title") ? "ETN is exploring" : key.equals("stop") ? "Stop" : "Location is recorded in the background";
        }
    }
    private Notification notification() {
        NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        manager.createNotificationChannel(new NotificationChannel(CHANNEL, "ETN GPS", NotificationManager.IMPORTANCE_LOW));
        PendingIntent open = PendingIntent.getActivity(this, 0,
            new Intent(this, MainActivity.class), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        PendingIntent stop = PendingIntent.getService(this, 1,
            new Intent(this, TrackingService.class).setAction(ACTION_STOP),
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        return new Notification.Builder(this, CHANNEL).setSmallIcon(R.drawable.ic_stat_etn)
            .setContentTitle(label("title")).setContentText(label("body"))
            .setContentIntent(open).setOngoing(true).setCategory(Notification.CATEGORY_SERVICE)
            .addAction(R.drawable.ic_stat_etn, label("stop"), stop).build();
    }
    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            stopTracking();return START_NOT_STICKY;
        }
        if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
            && checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            stopTracking();return START_NOT_STICKY;
        }
        try {
            if (Build.VERSION.SDK_INT >= 29)
                startForeground(1001, notification(), ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
            else startForeground(1001, notification());
            if (locations == null) {
                locations = (LocationManager) getSystemService(LOCATION_SERVICE);
                for (String provider : new String[]{LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER}) {
                    try {
                        if (locations.isProviderEnabled(provider))
                            locations.requestLocationUpdates(provider, 3000L, 20f, this, Looper.getMainLooper());
                    } catch (IllegalArgumentException | SecurityException ignored) {}
                }
            }
            setRunning(true);
        } catch (SecurityException ex) { stopTracking();return START_NOT_STICKY; }
        return START_STICKY;
    }
    @Override public void onLocationChanged(Location location) {
        if (!location.hasAccuracy() || location.getAccuracy() > 100f) return;
        checkTerrain(location);
        synchronized (FILE_LOCK) {
            try {
                long previous = getSharedPreferences(PREFS, MODE_PRIVATE).getLong("lastId", 0);
                long id = Math.max(System.currentTimeMillis() * 1000, previous + 1);
                getSharedPreferences(PREFS, MODE_PRIVATE).edit().putLong("lastId", id).apply();
                JSONObject fix = new JSONObject();
                fix.put("id", id);fix.put("lat", location.getLatitude());
                fix.put("lon", location.getLongitude());fix.put("accuracy", location.getAccuracy());
                fix.put("time", location.getTime());
                TerrainFix known=terrainFix;
                if(known!=null&&System.currentTimeMillis()-known.at<600000&&
                    meters(known.lat,known.lon,location.getLatitude(),location.getLongitude())<450){
                    fix.put("kind",known.kind);fix.put("sectors",known.sectors);
                }
                try (FileOutputStream output = new FileOutputStream(queue(this), true)) {
                    output.write((fix.toString() + "\n").getBytes(StandardCharsets.UTF_8));
                }
                File file = queue(this);
                if (file.length() > 2_000_000) {
                    List<String> all = readLines(this);
                    StringBuilder recent = new StringBuilder();
                    for (int i = Math.max(0, all.size() - 5000); i < all.size(); i++)
                        recent.append(all.get(i)).append('\n');
                    Files.write(file.toPath(), recent.toString().getBytes(StandardCharsets.UTF_8));
                }
            } catch (Exception ignored) {}
        }
    }
    private void stopTracking() {
        setRunning(false);
        if (locations != null) { locations.removeUpdates(this);locations = null; }
        stopForeground(STOP_FOREGROUND_REMOVE);stopSelf();
    }
    @Override public void onDestroy() {
        if (locations != null) locations.removeUpdates(this);
        terrainWorker.shutdownNow();
        super.onDestroy();
    }
    @Override public IBinder onBind(Intent intent) { return null; }
}
