# ETN — Explore the Neighborhood

Atskiras pradinis prototipas pagal „Kur aš?“ žemėlapį.

- Tamsus rūkas dengia žemėlapį. „OpenStreetMap Overpass“ vienoje užklausoje tikrina dabartinę vietą ir 8 kryptis apie 300 m nuo jos. Kiekviena kryptis turi savą spindulį: laukai (1 km riba, perėjimas nuo 0,25 km), užstatyta teritorija (0,5 km riba, perėjimas nuo 0,25 km), miškas (0,25 km riba, perėjimas nuo 0,1 km). Gretimų krypčių skaidrumas sujungiamas kiekviename kaukės taške, o persidengę aplankyti plotai naudoja didžiausią matomumą, todėl šonuose nesusidaro ryškios siūlės. Jei žymų trūksta, vertinamas netoliese esančių pastatų kiekis. Jei atsakymo ar pakankamų duomenų nėra, taikoma atsargi 0,25 km riba. Ribos yra apytikslės, nes naudojamos 8 kryptys ir OSM duomenys.
- Apėjus uždarą ratą (bent 450 m kelias ir 15 000 m² aptvertas plotas) jo vidus visiškai atidengiamas ir išsaugomas.
- Judant atveriamos naujos vietos. Tik trumpi ir realistiški tarpai užpildomi.
- GPS tikslumas turi būti iki 100 m; staigūs šuoliai ignoruojami.
- Atrasti taškai ir jų vietovės tipai saugomi naršyklės localStorage ir išlieka perkrovus puslapį. Senesni taškai išsaugo jau atidengtą 1 km plotą.
- Rūkas iš naujo piešiamas pagal geografines koordinates keičiant mastelį.
- Šalių ribos rodomos ant žemėlapio. Pagal GPS vietą pateikiamas šalies pavadinimas lietuviškai ir vėliava. Šalies ištyrinėjimo procentas yra apytikslis: 100 m gardelėje suskaičiuojamas didžiausias persidengiančių atidengimo kaukių matomumas ir pilnai atvertų uždarų plotų dalis, suma dalijama iš šalies sausumos ploto. Rodoma penkių skaitmenų po kablelio tikslumu; labai nedideli plotai gali būti suapvalinti iki 0,00000 %. Šalies ribos supaprastintos, todėl šalia sienos skaičius netinka matavimams.
- Šviesiai pilkos šalių ribos matomos ir virš neatrastos teritorijos rūko. Pasaulio mygtukas atveria atskirą žemėlapį su visomis platumomis nuo 90° pietų iki 90° šiaurės. Pirštu galima slinkti rytų ir vakarų kryptimi; šiame vaizde šalių pavadinimai nerašomi. Mygtukas „Rodyti mano vietą“ perkelia pasaulio vaizdą į dabartinį ilgumos tašką.

Paleidimas: ETN aplanke vykdyti python3 -m http.server 8000 ir atverti http://localhost:8000. Telefone reikia HTTPS adreso ir vietos leidimo. Žemėlapio plytelėms reikia interneto.

Šiuo etapu vieta stebima tik kol puslapis aktyvus. Android foniniam tyrinėjimui reikės atskiros vietos paslaugos.

Pagrindas: https://github.com/tomas-pak0/kur-as. „Leaflet“ failai paimti iš to projekto; licencija vendor/leaflet/LICENSE. Žemėlapio duomenys © OpenStreetMap bendraautoriai.
Šalių geometrija: „Natural Earth“ Admin 0 Countries 1:50 mln., viešoji nuosavybė; šaltinio ir apdorojimo nuorodos faile data/README.txt.
