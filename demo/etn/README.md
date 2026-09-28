# ETN — Explore the Neighborhood

Atskiras pradinis prototipas pagal „Kur aš?“ žemėlapį.

- Tamsus rūkas dengia žemėlapį. „OpenStreetMap Overpass“ pagal vietovės plotų žymas nustato laukus (1 km riba, perėjimas nuo 0,25 km), užstatytą teritoriją (0,5 km riba, perėjimas nuo 0,25 km), mišką (0,25 km riba, perėjimas nuo 0,1 km). Jei žymų trūksta, vertinamas netoliese esančių pastatų kiekis. Jei atsakymo ar pakankamų duomenų nėra, taikoma atsargi 0,25 km riba.
- Apėjus uždarą ratą (bent 450 m kelias ir 15 000 m² aptvertas plotas) jo vidus visiškai atidengiamas ir išsaugomas.
- Judant atveriamos naujos vietos. Tik trumpi ir realistiški tarpai užpildomi.
- GPS tikslumas turi būti iki 100 m; staigūs šuoliai ignoruojami.
- Atrasti taškai ir jų vietovės tipai saugomi naršyklės localStorage ir išlieka perkrovus puslapį. Senesni taškai išsaugo jau atidengtą 1 km plotą.
- Rūkas iš naujo piešiamas pagal geografines koordinates keičiant mastelį.

Paleidimas: ETN aplanke vykdyti python3 -m http.server 8000 ir atverti http://localhost:8000. Telefone reikia HTTPS adreso ir vietos leidimo. Žemėlapio plytelėms reikia interneto.

Šiuo etapu vieta stebima tik kol puslapis aktyvus. Android foniniam tyrinėjimui reikės atskiros vietos paslaugos.

Pagrindas: https://github.com/tomas-pak0/kur-as. „Leaflet“ failai paimti iš to projekto; licencija vendor/leaflet/LICENSE. Žemėlapio duomenys © OpenStreetMap bendraautoriai.
