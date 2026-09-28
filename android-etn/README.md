# ETN Android

ETN v0.1.0 Android WebView apvalkalas. Lokalūs HTML, CSS ir JS failai imami iš demo/etn, su Android programos HTTPS kilmės imitacija. Tik žemėlapio plytelės siunčiamos į internetą. Naršyklės buvimo vietos duomenims Android paprašo GPS leidimo.

Surinkimas iš repozitorijos šaknies:

1. Nukopijuoti demo/etn failus į android-etn/app/src/main/assets.
2. Aplanke android-etn paleisti gradle :app:assembleDebug (Gradle 8.11.1, JDK 17, Android SDK 35).

Tai debug APK, skirtas bandymams. Atrastos vietos saugomos programos WebView localStorage; ištrynus programos duomenis jos prarandamos. Fone vietos sekimo dar nėra.
