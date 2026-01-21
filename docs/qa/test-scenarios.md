# Test Scenarios

Poznámka: Scénáře jsou psané modulově a pokrývají happy path i vybrané hraniční situace. Výsledky exekuce (PASS/FAIL) se nezapisují sem, ale do checklistu / test runu.

---

## Modul A: Start a demo data

<a id="ts-01"></a>

### TS-01 – První načtení aplikace (demo data)

**Cíl:** Ověřit inicializaci demo dat v čistém profilu prohlížeče.

**Kroky:**
1. Otevři aplikaci v čistém profilu (bez uložených dat).
2. Zkontroluj, že jsou viditelné osoby, dárky, rozpočet a statistiky.

**Očekávání:** Demo data jsou načtena, aplikace je použitelná bez dalších kroků.

<a id="ts-02"></a>
### TS-02 – Persistace dat po refreshi
**Cíl:** Ověřit, že se uživatelská data po refreshi neztratí ani nepřepíší demo daty.  
**Kroky:**
1. Proveď změnu (např. přidej dárek nebo uprav rozpočet).
2. Proveď refresh stránky.
**Očekávání:** Změny zůstávají zachovány, demo data se znovu neinicializují.

---

## Modul B: Roky (přepínání, přidání, zamykání)

<a id="ts-03"></a>
### TS-03 – Přepnutí aktivního roku
**Cíl:** Ověřit, že přepnutí roku přefiltruje data.  
**Kroky:**
1. Přepni rok v hlavičce / hero sekci.
**Očekávání:** Zobrazí se data pro zvolený rok (tabulka, rozpočet, statistiky).

<a id="ts-04"></a>
### TS-04 – Ruční přidání následujícího roku
**Cíl:** Ověřit, že uživatel může přidat pouze následující kalendářní rok a ten se aktivuje.  
**Předpoklad:** Čistý profil prohlížeče (bez uložených dat), aby následující rok ještě nebyl v nabídce.  
**Kroky:**
1. V hero sekci klikni na CTA pro přidání následujícího roku.
**Očekávání:**  
- Přidá se pouze následující rok (aktuální rok + 1).  
- Nový rok se stane aktivním a je editovatelný.  
- CTA pro přidání dalšího roku po přidání zmizí.

<a id="ts-05"></a>
### TS-05 – Aktuální rok se objeví po změně data
**Cíl:** Ověřit, že se po přechodu na nový kalendářní rok zobrazí nový aktuální rok.  
**Poznámka:** Ověřitelné změnou systémového data.  
**Postup (OS):**
- macOS: System Settings → General → Date & Time → vypnout „Set automatically“ → nastavit 1. 1.
- Windows: Settings → Time & Language → Date & Time → vypnout „Set time automatically“ → nastavit 1. 1.
**Očekávání:** Aktuální rok se automaticky objeví v přepínači let a je editovatelný; další rok je možné přidat ručně přes CTA.

<a id="ts-05b"></a>
### TS-05b – Po přechodu roku je dostupné přidání dalšího roku
**Cíl:** Ověřit, že po změně aktuálního roku je v hero sekci dostupné CTA pro přidání následujícího roku (pokud ještě není v nabídce).  
**Předpoklad:** Následující rok (aktuální + 1) není ještě přidaný v nabídce let.  
**Kroky:**
1. Změň systémové datum na 1. 1. nového roku.
2. Otevři aplikaci a zkontroluj hero sekci.
**Očekávání:** CTA pro přidání dalšího roku je dostupné a umožňuje přidat rok (aktuální + 1).

<a id="ts-06"></a>
### TS-06 – Zamčený minulý rok (nelze editovat)
**Cíl:** Ověřit, že minulý rok je zamčený a změny nelze provést.  
**Kroky:**
1. Přepni na minulý rok.
2. Zkus upravit rozpočet nebo dárek.
**Očekávání:** Editace není možná (disabled/readonly), žádná změna se neuloží.

<a id="ts-07"></a>
### TS-07 – Odemknutí minulého roku (lock/unlock logika)
**Cíl:** Ověřit, že po odemknutí lze minulý rok editovat a změny se uloží.  
**Kroky:**
1. Přepni na minulý rok.
2. Odemkni editaci.
3. Proveď změnu (rozpočet / dárek).
4. Proveď refresh.
**Očekávání:** Minulý rok je editovatelný, změny se uloží a přetrvají po refreshi.

---

## Modul C: Rozpočet a výpočty

<a id="ts-08"></a>
### TS-08 – Nastavení rozpočtu pro aktivní rok
**Cíl:** Ověřit uložení rozpočtu a perzistenci.  
**Kroky:**
1. Změň hodnotu rozpočtu pro aktivní rok.
2. Ulož a proveď refresh.
**Očekávání:** Rozpočet je uložen a po refreshi zůstává.

<a id="ts-09"></a>
### TS-09 – Výpočty: koupeno + plánováno + delta
**Cíl:** Ověřit, že součty odpovídají datům v tabulce.  
**Kroky:**
1. Porovnej součet „koupeno“ a „plánováno“ s položkami v tabulce.
2. Zkontroluj rozdíl vůči rozpočtu (delta).
**Očekávání:** Součty a delta odpovídají tabulkovým datům.

<a id="ts-10"></a>
### TS-10 – Stav „over budget“
**Cíl:** Ověřit správné chování při překročení rozpočtu.  
**Kroky:**
1. Nastav rozpočet tak, aby součet výdajů rozpočet překročil.
**Očekávání:** UI zobrazí stav překročení rozpočtu (např. „over budget“).

---

## Modul D: Správa osob

<a id="ts-11"></a>
### TS-11 – Přidání osoby
**Cíl:** Ověřit vytvoření osoby a zobrazení v seznamu.  
**Kroky:** Přidej novou osobu.  
**Očekávání:** Osoba se objeví v seznamu a je dostupná pro přiřazení dárků.

<a id="ts-12"></a>
### TS-12 – Duplicitní osoba (case-insensitive)
**Cíl:** Ověřit ochranu proti duplicitám bez ohledu na velikost písmen.  
**Kroky:**
1. Přidej osobu „Eva“.
2. Zkus přidat „eva“.
**Očekávání:** Duplicitní jméno se neuloží nebo je validováno.

<a id="ts-13"></a>
### TS-13 – Smazání osoby odstraní její dárky
**Cíl:** Ověřit vazbu osoba → dárky.  
**Kroky:**
1. Vyber osobu, která má dárky.
2. Smaž ji.
**Očekávání:** Osoba zmizí a její dárky se odstraní.

<a id="ts-14"></a>
### TS-14 – Undo po smazání osoby
**Cíl:** Ověřit návrat smazané osoby i dárků.  
**Kroky:**
1. Smaž osobu.
2. V toastu klikni na Undo.
**Očekávání:** Osoba i její dárky se vrátí do původního stavu.

---

## Modul E: Správa dárků (validace, CRUD)

<a id="ts-15"></a>
### TS-15 – Přidání dárku ve stavu „Plánováno“
**Cíl:** Ověřit uložení plánovaného dárku (cena volitelná).  
**Kroky:** Přidej dárek se stavem „Plánováno“ bez ceny.  
**Očekávání:** Dárek se uloží a zobrazí v tabulce.

<a id="ts-16"></a>
### TS-16 – Přidání dárku ve stavu „Koupeno“ (cena povinná)
**Cíl:** Ověřit uložení koupeného dárku s cenou.  
**Kroky:** Přidej dárek se stavem „Koupeno“ a vyplň cenu.  
**Očekávání:** Dárek se uloží, rozpočet a statistiky se přepočítají.

<a id="ts-17"></a>
### TS-17 – Validace: „Koupeno“ bez ceny nelze uložit
**Cíl:** Ověřit validaci povinné ceny.  
**Kroky:** Zkus uložit dárek ve stavu „Koupeno“ bez ceny.  
**Očekávání:** Uložení není možné, UI zobrazí validaci.

<a id="ts-18"></a>
### TS-18 – Editace dárku v editovatelném roce
**Cíl:** Ověřit editaci (stav, cena, popis) a přepočty.  
**Kroky:**
1. Otevři editaci existujícího dárku.
2. Změň stav/cenu/popis.
3. Ulož.
**Očekávání:** Změna se projeví v tabulce i ve statistikách.

<a id="ts-19"></a>
### TS-19 – Smazání dárku + Undo
**Cíl:** Ověřit bezpečné mazání a možnost vrácení.  
**Kroky:**
1. Smaž dárek.
2. Klikni na Undo.
**Očekávání:** Dárek se vrátí, pokud byl Undo proveden v časovém limitu.

---

## Modul F: Tabulka, historie a přehledy

<a id="ts-20"></a>
### TS-20 – Tabulka filtruje data podle roku
**Cíl:** Ověřit, že tabulka zobrazuje pouze data aktivního roku.  
**Kroky:** Přepínej roky a sleduj obsah tabulky.  
**Očekávání:** Tabulka vždy odpovídá aktivnímu roku.

<a id="ts-21"></a>
### TS-21 – Historie podle osoby napříč roky
**Cíl:** Ověřit zobrazení historie dárků pro osobu.  
**Kroky:** Otevři přehled historie pro vybranou osobu.  
**Očekávání:** Zobrazí se dárky napříč roky.

<a id="ts-22"></a>
### TS-22 – Grafy a souhrny odpovídají datům
**Cíl:** Ověřit konzistenci tabulky vs. grafů/souhrnů.  
**Kroky:** Porovnej grafy (součty, průměr, nejdražší/nejlevnější) s daty v tabulce.  
**Očekávání:** Grafy a souhrny odpovídají tabulkovým datům.

---

## Modul G: UX (scroll, toasty, zvýraznění)

<a id="ts-23"></a>
### TS-23 – CTA scroll na formulář přidání dárku
**Cíl:** Ověřit, že CTA posune stránku na formulář.  
**Kroky:** Klikni na CTA pro přidání dárku.  
**Očekávání:** Stránka se posune na formulář pro aktivní rok; u needitovatelných roků je stav jasně indikovaný.

<a id="ts-24"></a>
### TS-24 – Toast a timeout (Undo)
**Cíl:** Ověřit chování toast notifikací.  
**Kroky:**
1. Proveď akci se stavem (např. smazání).
2. Sleduj toast a jeho zmizení po timeoutu.
**Očekávání:** Toast odpovídá akci a po čase zmizí; Undo funguje v rámci limitu.

<a id="ts-25"></a>
### TS-25 – Zvýraznění nově přidané nebo změněné položky
**Cíl:** Ověřit vizuální feedback po změně dat.  
**Kroky:** Přidej nebo uprav dárek a sleduj UI.  
**Očekávání:** Nová nebo změněná položka je zvýrazněna dle návrhu.
