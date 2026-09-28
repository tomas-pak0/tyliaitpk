# ETN Android

ETN 0.4.1 apvalkalas su Android vietos tipo foreground paslauga. Programėlės sąsaja ir žemėlapis pateikiami per vietinį WebView HTTPS kilmės adresą. Lietuvių, latvių, lenkų, anglų, vokiečių, ispanų ir prancūzų kalbų pasirinkimas veikia ir neprisijungus prie tinklo; pirmoji kalba imama iš telefono nustatymų.

Paspaudus „Pradėti tyrinėjimą“, prašoma tikslios vietos ir pranešimų leidimų. Tik tada, kai programėlė yra ekrane, paleidžiama foreground paslauga. Ji rodo nuolatinę ETN piktogramą, fone renka tinkamus GPS taškus ir atsargiai tikrina vietovę per „Overpass“. Taškai laikinai saugomi privačiame Android faile ir sujungiami su jau egzistuojančia WebView localStorage istorija, kai programėlės langas vėl atidaromas. Tyrinėjimą galima sustabdyti programėlės mygtuku arba pranešimo veiksmu. Neleidus pranešimų Android 13+ pranešimų juostos piktograma nebus rodoma, nors fono paslauga gali veikti. Priverstinis sustabdymas sistemos nustatymuose ją nutraukia.

Surinkimas: iš repozitorijos šaknies perkelti demo/etn HTML, CSS, JS, i18n.js, vendor ir data į android-etn/app/src/main/assets, tada aplanke android-etn vykdyti `gradle :app:assembleDebug` (Gradle 8.11.1, JDK 17, Android SDK 35). Tai debug APK bandymams. Pašalinus programos duomenis dings vietoje saugoma istorija.
