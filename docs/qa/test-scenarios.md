# Test Scenarios

## 1. Hero sekce
- Prepnut rok: zmen rok v hero -> zobrazi se data pro zvoleny rok
- Pridat dalsi rok: klik na pridani dalsiho roku -> rok se prida a aktivuje
- CTA scroll: klik na tlacitko pro pridani darku -> page scrolluje na formular
- Odemknout minuly rok: odemknout -> lze editovat dary/rozpocet v minulom roce
- Statistiky: pocet darku a utrata odpovida tabulce

## 2. Rozpocet
- Nastaveni rozpoctu: uprav hodnotu a uloz -> persistuje po refreshi
- Delta: soucet koupeno + planovano odpovida zobrazenemu rozdilu
- Preteceny rozpoct: prekroceni -> zobrazen stav over budget

## 3. Sprava osob
- Pridat osobu: nova osoba se objevi v seznamu
- Duplicita: pridat stejny nazev s jinou velikosti -> neznasobi se
- Odebrat osobu: osoba zmizi a jeji darky se odstrani
- Undo: vratit smazani -> osoba i darky se vrati

## 4. Sprava darku
- Pridat koupeny dar: vypln jmeno, popis, cenu -> ulozi se
- Pridat planovany dar bez ceny: ulozi se
- Validace: koupeny dar bez ceny -> nelze ulozit
- Upravit dar: zmena stavu/ceny -> ulozi se
- Smazat dar + Undo: dar se vrati

## 5. Tabulka a prehledy
- Tabulka filtruje dle roku
- Historie podle osoby: zobrazi se darky napric roky
- Grafy: data odpovidaji seznamu
- Souhrn: nejdrazsi/nejlevnejsi a prumer odpovida datum

## 6. Persistace
- Refresh stranky -> data zustanou
- Cisty profil -> nactou se demo data
