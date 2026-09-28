# ETN — Explore the Neighborhood

Atskiras pradinis prototipas pagal „Kur aš?“ žemėlapį.

- Tamsus rūkas dengia žemėlapį. Patikima GPS pozicija atveria 1 km spindulį: iki 0,25 km žemėlapis skaidrus, ties 0,5 km rūkas pusiau skaidrus, ties 1 km — visiškai nepermatomas.
- Judant atveriamos naujos vietos. Tik trumpi ir realistiški tarpai užpildomi.
- GPS tikslumas turi būti iki 100 m; staigūs šuoliai ignoruojami.
- Atrasti taškai saugomi naršyklės localStorage ir išlieka perkrovus puslapį.
- Rūkas iš naujo piešiamas pagal geografines koordinates keičiant mastelį.

Paleidimas: ETN aplanke vykdyti python3 -m http.server 8000 ir atverti http://localhost:8000. Telefone reikia HTTPS adreso ir vietos leidimo. Žemėlapio plytelėms reikia interneto.

Šiuo etapu vieta stebima tik kol puslapis aktyvus. Android foniniam tyrinėjimui reikės atskiros vietos paslaugos.

Pagrindas: https://github.com/tomas-pak0/kur-as. „Leaflet“ failai paimti iš to projekto; licencija vendor/leaflet/LICENSE. Žemėlapio duomenys © OpenStreetMap bendraautoriai.
