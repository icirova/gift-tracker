# Test Plan

## Cíl
Cílem testování je ověřit funkční chování aplikace Gift Tracker, zejména správu dárků a osob, práci s rozpočtem a roky, ukládání dat do `localStorage` a základní uživatelské prvky (notifikace, zvýraznění změn, automatické posouvání obsahu).

---

## Rozsah testování

### V rozsahu
- Uživatelské rozhraní a klientská logika aplikace
- Perzistence dat v prohlížeči (`localStorage`, `sessionStorage`)
- Základní responzivita (desktop a mobilní zařízení)

### Mimo rozsah
- Backendové integrace (aplikace je čistě klientská)
- Výkonnostní a zátěžové testy
- Bezpečnostní testování

---

## Testovací prostředí
- Prohlížeče: Chrome, Safari
- Viewporty: 1440×900 (desktop), 390×844 (mobil)
- Testovací URL (Netlify): https://x-gift-tracker.netlify.app/
- Operační systém:
    - macOS (primární testovací prostředí)
    - Windows (základní ověření kompatibility)

---

## Vstupní předpoklady
- Aplikace je dostupná buď lokálně (`npm install`, `npm run dev`) nebo přes Netlify Deploy Preview URL
- Testování probíhá v čistém profilu prohlížeče pro ověření práce s demo daty

---

## Rizika
- Ztráta nebo přepsání dat při chybách práce s `localStorage`
- Nesprávná editovatelnost minulých let (lock/unlock logika) → nechtěné změny historie
- Nesoulad statistik/grafů vs. tabulkových dat (počty, součty, rozpočet)
- Validace dárků a cen (koupeno bez ceny, plánované s nevalidní cenou)
- Responzivita na menších mobilech (breakpointy 640/360)

---

## Přístup k testování

Zvolený přístup k testování se liší podle rozsahu a dopadu změn:

### Větší změny / nové funkce
- Provedení relevantních modulových testovacích scénářů (viz `test-scenarios.md`)
- Doplnění nebo aktualizace testovacích scénářů podle změn
- Exploratorní testování se zaměřením na novou nebo upravenou funkcionalitu

### Menší změny / opravy chyb
- Provedení regresního checklistu (viz `regression-checklist.md`)
- Cílené otestování dotčené oblasti

### Před nasazením / zveřejněním změn
- Spuštění regresního checklistu
- Ověření klíčových toků aplikace

---

## Odpovědnosti
- **QA:** provedení testovacích scénářů, evidování a report chyb
- **PO / Dev:** prioritizace nalezených chyb a ověření opravených defektů

---

## Kritéria dokončení

Testování je považováno za ukončené, pokud jsou splněny následující podmínky:

- Všechny relevantní scénáře v `test-scenarios.md` byly provedeny a neobsahují otevřené kritické nebo major chyby
- Regresní checklist v `regression-checklist.md` byl úspěšně proveden v případě změn nebo před zveřejněním aktualizace.
- Kritické a major chyby jsou uzavřené; minor chyby jsou zdokumentované a akceptované
- Byla ověřena perzistence dat po refreshi a inicializace demo dat v čistém profilu prohlížeče
- Testování proběhlo na prohlížečích Chrome a Safari, v desktopovém i mobilním viewportu
