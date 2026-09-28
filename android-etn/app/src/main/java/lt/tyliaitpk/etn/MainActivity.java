package lt.tyliaitpk.etn;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private static final String ORIGIN = "https://appassets.androidplatform.net";
    private static final int LOCATION_REQUEST = 11;
    private WebView webView;
    private GeolocationPermissions.Callback pendingGeolocation;
    private String pendingOrigin;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(0xff090d11);
        getWindow().setNavigationBarColor(0xff090d11);
        webView = new WebView(this);
        webView.setBackgroundColor(0xff090d11);
        FrameLayout frame = new FrameLayout(this);
        frame.setBackgroundColor(0xff090d11);
        frame.addView(webView, new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        if (Build.VERSION.SDK_INT >= 35) {
            frame.setOnApplyWindowInsetsListener((view, insets) -> {
                Insets safe = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                view.setPadding(safe.left, safe.top, safe.right, safe.bottom);
                return WindowInsets.CONSUMED;
            });
        }
        setContentView(frame);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setGeolocationEnabled(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        webView.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (!ORIGIN.equals(uri.getScheme() + "://" + uri.getHost())) return null;
                String path = uri.getPath();
                if (path == null || path.contains("..") || !path.startsWith("/")) return missing();
                if (path.equals("/")) path = "/index.html";
                try {
                    InputStream file = getAssets().open(path.substring(1));
                    String mime = path.endsWith(".html") ? "text/html"
                        : path.endsWith(".css") ? "text/css"
                        : path.endsWith(".js") ? "text/javascript"
                        : path.endsWith(".svg") ? "image/svg+xml"
                        : path.endsWith(".png") ? "image/png" : "application/octet-stream";
                    return new WebResourceResponse(mime, "UTF-8", file);
                } catch (IOException ex) { return missing(); }
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (ORIGIN.equals(uri.getScheme() + "://" + uri.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (Exception ignored) {}
                return true;
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onGeolocationPermissionsShowPrompt(String origin,
                    GeolocationPermissions.Callback callback) {
                if (!ORIGIN.equals(origin) && !(ORIGIN + "/").equals(origin)) {
                    callback.invoke(origin, false, false);
                    return;
                }
                if (hasLocation()) callback.invoke(origin, true, false);
                else {
                    pendingGeolocation = callback;
                    pendingOrigin = origin;
                    requestPermissions(new String[]{
                        Manifest.permission.ACCESS_FINE_LOCATION,
                        Manifest.permission.ACCESS_COARSE_LOCATION
                    }, LOCATION_REQUEST);
                }
            }
        });
        webView.loadUrl(ORIGIN + "/index.html");
    }

    private WebResourceResponse missing() {
        return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
            java.util.Collections.emptyMap(),
            new java.io.ByteArrayInputStream("Not found".getBytes(StandardCharsets.UTF_8)));
    }

    private boolean hasLocation() {
        return checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
            || checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(requestCode, permissions, results);
        if (requestCode == LOCATION_REQUEST && pendingGeolocation != null) {
            pendingGeolocation.invoke(pendingOrigin, hasLocation(), false);
            pendingGeolocation = null;
            pendingOrigin = null;
        }
    }

    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override protected void onDestroy() {
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
