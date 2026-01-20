# Test Data

## Demo data (výchozí stav)
Aplikace inicializuje demo data při prvním spuštění v čistém profilu prohlížeče (bez existujících uložených dat v `localStorage`). Demo data aktuálně obsahují roky 2023–2026.

Demo data slouží jako výchozí stav pro manuální testování a ověření základních funkčností aplikace. Uživatel v UI nevytváří libovolné roky – pracuje s předdefinovanými roky a s následujícím rokem, který lze přidat ručně.

---

## Roky a editovatelnost
Pro účely testování je doporučeno mít v demo datech následující stavy:

- **Aktuální rok** – editovatelný, s možností nastavení rozpočtu a správy dárků
- **Minulý rok** – výchozí stav zamčený; po odemknutí je možné provádět editace
- **Následující rok** – lze přidat ručně (CTA v hero sekci)

Tyto roky umožňují ověřit přepínání, lock/unlock logiku, historii i chování aplikace při přechodu na nový kalendářní rok.

---

## Rozpočet – doporučené varianty
V rámci editovatelných roků je vhodné pokrýt různé stavy rozpočtu:

- **Rok bez nastaveného rozpočtu**
- **Rok pod limitem** (plánované a koupené dárky < rozpočet)
- **Rok nad limitem** (plánované a/nebo koupené dárky > rozpočet, over budget)

---

## Dárky
Pro ověření validací, výpočtů a statistik se doporučuje kombinace následujících typů dárků:

- Koupený dárek s vyplněnou cenou (validní stav)
- Koupený dárek bez ceny (záměrně nevalidní stav pro ověření, že ho nelze uložit)
- Plánovaný dárek s cenou
- Plánovaný dárek bez ceny

---

## Osoby
- Minimálně 3 osoby s různou historií dárků napříč roky
- Alespoň jedna osoba bez přiřazených dárků (ověření prázdného stavu) – v demo datech není, je potřeba ji přidat ručně

---

Poznámka: Konkrétní hodnoty cen a rozpočtů nejsou fixní; důležitý je jejich vzájemný vztah (bez rozpočtu / pod limitem / nad limitem).
