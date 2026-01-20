# Christmas Gift Tracker

Webová aplikace pro sledování vánočních dárků napříč roky, včetně práce s rozpočtem a statistikami.  
Umožňuje vést seznam osob, spravovat dárky se stavem (Koupeno / Plánováno), sledovat plán vs. rozpočet a přehledně zobrazovat historii i grafy.

---

## Hlavní funkce

### Správa let
- Přepínání aktivního roku
- Možnost přidat následující rok
- Editace povolena:
  - pro aktuální rok
  - pro minulý rok po odemčení
- Starší roky jsou dostupné pouze pro čtení

### Správa osob
- Přidání a odebrání osob pro daný rok
- Smazání osoby odstraní i všechny její dárky v daném roce
- Možnost vrácení akce pomocí Undo

### Správa dárků
- Přidání, úprava a smazání dárku
- Atributy dárku: název, popis, stav, cena, rok
- Validace ceny podle stavu dárku

### Rozpočet
- Roční rozpočet
- Součty koupených vs. plánovaných dárků
- Rozdíl vůči rozpočtu (delta)

### Přehledy a statistiky
- Tabulka dárků
- Historie dárků podle osoby
- Grafy za jednotlivé roky
- Souhrn (nejdražší / nejlevnější dárek, průměr, meziroční změna)

### Uživatelský komfort
- Toast notifikace pro akce s možností Undo
- Zvýraznění nově přidaných nebo upravených dárků

---

## Data a výchozí stav
- Data jsou ukládána do `localStorage`
- Při první návštěvě se inicializují demo data
- `sessionStorage` slouží k zajištění jednorázové inicializace demo dat

---

## Testování
Testovací dokumentace (test plan, testovací scénáře, regresní checklist, bug template) je k dispozici ve složce [`docs/qa`](./docs/qa).

---

## Požadavky
- Node.js 18+

## Spuštění lokálně
```bash
npm install
npm run dev
```

## Build a preview
```bash
npm run build
npm run preview
```

## Lint
```bash
npm run lint
```
