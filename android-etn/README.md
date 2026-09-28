# ETN Android

ETN v0.2.0 Android WebView apvalkalas. Lokalūs HTML, CSS ir JS failai imami iš demo/etn, su Android programos HTTPS kilmės imitacija. Žemėlapio plytelės kraunamos internetu, o vietovės tipui nustatyti užklausos siunčiamos „OpenStreetMap Overpass“. Android paprašo GPS leidimo.

Surinkimas iš repozitorijos šaknies:

1. Nukopijuoti demo/etn failus į android-etn/app/src/main/assets.
2. Aplanke android-etn paleisti gradle :app:assembleDebug (Gradle 8.11.1, JDK 17, Android SDK 35).

Tai debug APK, skirtas bandymams. Atrastos vietos saugomos programos WebView localStorage; ištrynus programos duomenis jos prarandamos. Fone vietos sekimo dar nėra.
