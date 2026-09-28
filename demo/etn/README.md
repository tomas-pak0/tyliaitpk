# ETN — Explore the Neighborhood

Atskiras pradinis prototipas pagal „Kur aš?“ žemėlapį.

- Tamsus rūkas dengia žemėlapį. „OpenStreetMap Overpass“ vienoje užklausoje tikrina dabartinę vietą ir 8 kryptis apie 300 m nuo jos. Kiekviena kryptis turi savą spindulį: laukai (1 km riba, perėjimas nuo 0,25 km), užstatyta teritorija (0,5 km riba, perėjimas nuo 0,25 km), miškas (0,25 km riba, perėjimas nuo 0,1 km). Gretimų krypčių skaidrumas sujungiamas kiekviename kaukės taške, o persidengę aplankyti plotai naudoja didžiausią matomumą, todėl šonuose nesusidaro ryškios siūlės. Jei žymų trūksta, vertinamas netoliese esančių pastatų kiekis. Jei atsakymo ar pakankamų duomenų nėra, taikoma neutrali 0,5 km riba. Ribos yra apytikslės, nes naudojamos 8 kryptys ir OSM duomenys.
- Apėjus uždarą ratą (bent 450 m kelias ir 15 000 m² aptvertas plotas) jo vidus visiškai atidengiamas ir išsaugomas.
- Judant atveriamos naujos vietos. Tik trumpi ir realistiški tarpai užpildomi.
- GPS tikslumas turi būti iki 100 m; staigūs šuoliai ignoruojami.
- Atrasti taškai ir jų vietovės tipai saugomi naršyklės localStorage ir išlieka perkrovus puslapį. Senesni taškai išsaugo jau atidengtą 1 km plotą.
- Rūkas iš naujo piešiamas pagal geografines koordinates keičiant mastelį.
- Šalių ribos rodomos ant žemėlapio. Pagal GPS vietą pateikiamas šalies pavadinimas pasirinkta kalba ir vėliava. Šalies ištyrinėjimo procentas yra apytikslis: 100 m gardelėje suskaičiuojamas didžiausias persidengiančių atidengimo kaukių matomumas ir pilnai atvertų uždarų plotų dalis, suma dalijama iš šalies sausumos ploto. Rodoma penkių skaitmenų po kablelio tikslumu; labai nedideli plotai gali būti suapvalinti iki 0,00000 %. Šalies ribos supaprastintos, todėl šalia sienos skaičius netinka matavimams.
- Šviesiai pilkos šalių ribos matomos ir virš neatrastos teritorijos rūko. Pasaulio mygtukas atveria atskirą žemėlapį su visomis platumomis nuo 90° pietų iki 90° šiaurės. Pirštu galima slinkti rytų ir vakarų kryptimi; šiame vaizde šalių pavadinimai nerašomi. Mygtukas „Rodyti mano vietą“ perkelia pasaulio vaizdą į dabartinį ilgumos tašką.
- Paspaudus šalies kortelę, žemėlapis sutelkiamas į visą jos ribų stačiakampį. Jei įrenginio istorijoje aplankytos kelios šalys, galima pasirinkti vieną iš jų. Priartinus šalį arba ranka pastūmus žemėlapį, automatinis vietos sekimas pristabdomas; jį grąžina taikinio mygtukas.
- GPS stebėjimas prašo tikslios vietos be talpykloje laikomų padėčių; žemėlapio centras seka kiekvieną tinkamą padėtį. Nauji tyrinėjimo taškai saugomi pajudėjus bent 35 m. Vietovės tikrinimas pakartojamas ir stovint vietoje, ir pajudėjus, pakartotinai panaudojama artimiausia jau nustatyta vietovė, o nepasiekus vieno „Overpass“ serverio bandomas antras. Šios išorinės paslaugos nepriklauso ETN; jei jos abi neatsako ar duomenys nepakankami, išlieka neutralus 0,5 km spindulys.
- Sąsaja išversta į lietuvių, latvių, lenkų, anglų, vokiečių, ispanų ir prancūzų kalbas. Pirmąkart naudojant imama telefono arba naršyklės kalba; pasirinkimą galima pakeisti viršuje. Nežinomai telefono kalbai naudojama anglų.
- Android APK paleidžia vietos tipo foreground paslaugą su ETN piktograma pranešimų juostoje. Įjungus tyrinėjimą ji fone registruoja GPS ir apytiksliai nustato vietovės tipą, kai pasiekiami OSM duomenys. Grįžus į programėlę, laukiantys taškai sujungiami su ankstesne tyrinėjimo istorija. Stabdyti galima programėlėje arba pranešime. Paslaugą reikia pradėti matant programėlę; jei pranešimų leidimas nesuteiktas, Android 13+ gali nerodyti būsenos juostos ikonos. Priverstinis programėlės sustabdymas sistemos nustatymuose sekimą nutraukia.

Paleidimas: ETN aplanke vykdyti python3 -m http.server 8000 ir atverti http://localhost:8000. Telefone reikia HTTPS adreso ir vietos leidimo. Žemėlapio plytelėms reikia interneto.

Naršyklės demonstracijoje vieta stebima tik kol puslapis aktyvus. Fono paslauga veikia tik Android APK.

Pagrindas: https://github.com/tomas-pak0/kur-as. „Leaflet“ failai paimti iš to projekto; licencija vendor/leaflet/LICENSE. Žemėlapio duomenys © OpenStreetMap bendraautoriai.
Šalių geometrija: „Natural Earth“ Admin 0 Countries 1:50 mln., viešoji nuosavybė; šaltinio ir apdorojimo nuorodos faile data/README.txt.
