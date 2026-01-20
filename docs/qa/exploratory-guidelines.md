# Exploratory Testing Guidelines

Tento dokument popisuje doporučený postup pro exploratorní testování v projektu Gift Tracker.

## Cíle
- Ověřit chování aplikace mimo běžné testovací scénáře
- Odhalit hraniční situace a UX problémy
- Doplnit modulové testovací scénáře o neočekávaná pozorování

## Příprava
- Otestuj aplikaci v čistém profilu prohlížeče (ověření demo dat) i v profilu s existujícími daty
- Zvol si fokus testovací session (např. rozpočty, roky, validace, UX)
- Připrav si testovací data podle dokumentu `test-data.md`

## Postup
- Začni od hero sekce a projdi hlavní uživatelské toky
- Měň rozpočty a sleduj reakci statistik a grafů
- Zkoušej nevalidní vstupy (prázdné hodnoty, nevalidní ceny)
- Testuj zamykání a odemykání minulého roku a jeho dopad na editaci
- Sleduj chování toast notifikací a časových limitů
- Všímej si chování aplikace po refreshi stránky

## Záznam výsledků
- Zapisuj pozorování do souboru `exploratory-notes.md`
- U každého nálezu uveď:
  - co se stalo
  - kroky k reprodukci
  - očekávaný vs. skutečný výsledek
  - dopad na uživatele

## Tipy
- Použij názvy osob a dárků s mezerami, diakritikou a dlouhými texty
- Otestuj chování aplikace na mobilním viewportu (390×844)
- Zkus provést více akcí rychle po sobě (např. smazání položky a následné Undo)

