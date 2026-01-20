# Test Plan

## Ucel
Overit funkcni chovani aplikace Gift Tracker: spravu darku, osob, rozpoctu, prace s roky, ukladani do localStorage a UX prvky (toast, highlight, scroll).

## Rozsah
- UI a logika klienta
- Persistace v prohlizeci (localStorage, sessionStorage)
- Zakladni responzivita (desktop + mobil)

Mimo rozsah:
- Backend integrace (aplikace je bez backendu)
- Vykonove testy
- Bezpecnostni testy

## Prostredi
- Prohlizece: Chrome, Safari
- Viewporty: 1440x900, 390x844
- OS: macOS

## Vstupni predpoklady
- Aplikace nainstalovana a spustena lokalne (npm install, npm run dev)
- Cisty profil prohlizece pro testy demo dat

## Rizika
- Ztrata dat pri chybach localStorage
- Nespravne zamykani/odemykani editace pro minulost
- Nesoulad mezi statistikami a tabulkou

## Pristup k testovani
- Modulove scenare (viz test-scenarios.md)
- Minimalni regresni checklist pred releasem
- Exploratorni testovani zamereno na edge cases

## Odpovednosti
- QA: provedeni scenaru a report chyb
- PO/Dev: priorizace oprav a validace oprav
