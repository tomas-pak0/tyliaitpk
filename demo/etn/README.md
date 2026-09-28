# ETN — Explore the Neighborhood

Atskiras pradinis prototipas pagal „Kur aš?“ žemėlapį.

- Tamsus rūkas dengia žemėlapį. Laukuose vertinama 8 kryptimis, kiekvienoje tikrinant 125, 250, 500, 1000, 2000, 3500, 5000 ir 7000 m taškus pagal „OpenStreetMap Overpass“. Pirmas miško, užstatymo arba nežinomos vietovės taškas apriboja tik tos krypties spindulį; jei tokių nėra, riba 7 km. Jei esama vieta yra miškas arba nežinoma, riba 250 m; užstatyta vieta – 500 m. Tarp matavimo taškų ir krypčių rūko skaidrumas pereina sklandžiai, o uždaras apeitas kontūras atidengiamas. Ribos yra apytikslės dėl OSM aprėpties ir baigtinio mėginių skaičiaus.
- Apėjus uždarą ratą (bent 450 m kelias ir 15 000 m² aptvertas plotas) jo vidus visiškai atidengiamas ir išsaugomas.
- Judant atveriamos naujos vietos. Tik trumpi ir realistiški tarpai užpildomi.
- GPS tikslumas turi būti iki 100 m; staigūs šuoliai ignoruojami.
- Atrasti taškai ir jų vietovės tipai saugomi naršyklės localStorage ir išlieka perkrovus puslapį. Senesni taškai išsaugo jau atidengtą 1 km plotą.
- Rūkas iš naujo piešiamas pagal geografines koordinates keičiant mastelį.
- Šalių ribos rodomos ant žemėlapio. Pagal GPS vietą pateikiamas šalies pavadinimas pasirinkta kalba ir vėliava. Šalies ištyrinėjimo procentas yra apytikslis: 100 m gardelėje suskaičiuojamas didžiausias persidengiančių atidengimo kaukių matomumas ir pilnai atvertų uždarų plotų dalis, suma dalijama iš šalies sausumos ploto. Rodoma penkių skaitmenų po kablelio tikslumu; labai nedideli plotai gali būti suapvalinti iki 0,00000 %. Šalies ribos supaprastintos, todėl šalia sienos skaičius netinka matavimams.
- Šviesiai pilkos šalių ribos matomos ir virš neatrastos teritorijos rūko. Pasaulio mygtukas atveria atskirą žemėlapį su visomis platumomis nuo 90° pietų iki 90° šiaurės. Pirštu galima slinkti rytų ir vakarų kryptimi; šiame vaizde šalių pavadinimai nerašomi. Mygtukas „Rodyti mano vietą“ perkelia pasaulio vaizdą į dabartinį ilgumos tašką.
- Paspaudus šalies kortelę, žemėlapis sutelkiamas į visą jos ribų stačiakampį. Jei įrenginio istorijoje aplankytos kelios šalys, galima pasirinkti vieną iš jų. Priartinus šalį arba ranka pastūmus žemėlapį, automatinis vietos sekimas pristabdomas; jį grąžina taikinio mygtukas.
- GPS stebėjimas prašo tikslios vietos be talpykloje laikomų padėčių; žemėlapio centras seka kiekvieną tinkamą padėtį. Nauji tyrinėjimo taškai saugomi pajudėjus bent 10 m. Vietovės tikrinimas pakartojamas ir stovint vietoje, ir pajudėjus, pakartotinai panaudojama artimiausia jau nustatyta vietovė, o nepasiekus vieno „Overpass“ serverio bandomas antras. Šios išorinės paslaugos nepriklauso ETN; jei jos abi neatsako ar duomenys nepakankami, išlieka atsargus 0,25 km spindulys.
- Sąsaja išversta į lietuvių, latvių, lenkų, anglų, vokiečių, ispanų ir prancūzų kalbas. Pirmąkart naudojant imama telefono arba naršyklės kalba; pasirinkimą galima pakeisti viršuje. Nežinomai telefono kalbai naudojama anglų.
- Android APK paleidžia vietos tipo foreground paslaugą su ETN piktograma pranešimų juostoje. Įjungus tyrinėjimą ji fone registruoja GPS ir apytiksliai nustato vietovės tipą, kai pasiekiami OSM duomenys. Grįžus į programėlę, laukiantys taškai sujungiami su ankstesne tyrinėjimo istorija. Stabdyti galima programėlėje arba pranešime. Paslaugą reikia pradėti matant programėlę; jei pranešimų leidimas nesuteiktas, Android 13+ gali nerodyti būsenos juostos ikonos. Priverstinis programėlės sustabdymas sistemos nustatymuose sekimą nutraukia.

Paleidimas: ETN aplanke vykdyti python3 -m http.server 8000 ir atverti http://localhost:8000. Telefone reikia HTTPS adreso ir vietos leidimo. Žemėlapio plytelėms reikia interneto.

Naršyklės demonstracijoje vieta stebima tik kol puslapis aktyvus. Fono paslauga veikia tik Android APK.

Pagrindas: https://github.com/tomas-pak0/kur-as. „Leaflet“ failai paimti iš to projekto; licencija vendor/leaflet/LICENSE. Žemėlapio duomenys © OpenStreetMap bendraautoriai.
Šalių geometrija: „Natural Earth“ Admin 0 Countries 1:50 mln., viešoji nuosavybė; šaltinio ir apdorojimo nuorodos faile data/README.txt.
