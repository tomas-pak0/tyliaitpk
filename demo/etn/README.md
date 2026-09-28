# ETN — Explore the Neighborhood

Atskiras pradinis prototipas pagal „Kur aš?“ žemėlapį.

- Tamsus rūkas dengia žemėlapį. „OpenStreetMap Overpass“ vienoje užklausoje tikrina dabartinę vietą ir 8 kryptis apie 300 m nuo jos. Kiekviena kryptis turi savą spindulį: laukai (1 km riba, perėjimas nuo 0,25 km), užstatyta teritorija (0,5 km riba, perėjimas nuo 0,25 km), miškas (0,25 km riba, perėjimas nuo 0,1 km). Gretimų krypčių skaidrumas sujungiamas kiekviename kaukės taške, o persidengę aplankyti plotai naudoja didžiausią matomumą, todėl šonuose nesusidaro ryškios siūlės. Jei žymų trūksta, vertinamas netoliese esančių pastatų kiekis. Jei atsakymo ar pakankamų duomenų nėra, taikoma atsargi 0,25 km riba. Ribos yra apytikslės, nes naudojamos 8 kryptys ir OSM duomenys.
- Apėjus uždarą ratą (bent 450 m kelias ir 15 000 m² aptvertas plotas) jo vidus visiškai atidengiamas ir išsaugomas.
- Judant atveriamos naujos vietos. Tik trumpi ir realistiški tarpai užpildomi.
- GPS tikslumas turi būti iki 100 m; staigūs šuoliai ignoruojami.
- Atrasti taškai ir jų vietovės tipai saugomi naršyklės localStorage ir išlieka perkrovus puslapį. Senesni taškai išsaugo jau atidengtą 1 km plotą.
- Rūkas iš naujo piešiamas pagal geografines koordinates keičiant mastelį.

Paleidimas: ETN aplanke vykdyti python3 -m http.server 8000 ir atverti http://localhost:8000. Telefone reikia HTTPS adreso ir vietos leidimo. Žemėlapio plytelėms reikia interneto.

Šiuo etapu vieta stebima tik kol puslapis aktyvus. Android foniniam tyrinėjimui reikės atskiros vietos paslaugos.

Pagrindas: https://github.com/tomas-pak0/kur-as. „Leaflet“ failai paimti iš to projekto; licencija vendor/leaflet/LICENSE. Žemėlapio duomenys © OpenStreetMap bendraautoriai.
