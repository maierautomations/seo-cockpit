# Product Requirements Document (PRD)

## SEO Cockpit — KI-gestütztes Optimierungstool für Finanzredaktionen

**Version:** 1.0
**Datum:** 28. März 2026
**Autor:** Dominik M.
**Status:** Entwurf

---

## 1. Executive Summary

SEO Cockpit ist eine KI-gestützte Web-App, die Finanzredaktionen dabei hilft, bestehende Artikel systematisch zu optimieren und neue Inhalte datengetrieben zu planen. Das Tool verbindet Google Search Console-Daten mit automatischer Artikelanalyse und KI-generierten Optimierungsvorschlägen.

**Kernthese:** Die meisten Redaktionen veröffentlichen zu viel neuen Content und vernachlässigen die Optimierung bestehender Artikel. SEO Cockpit dreht diese Logik um: Zuerst das bestehende Potenzial ausschöpfen, dann gezielt neue Inhalte produzieren.

**Der Pitch in einem Satz:** „Du lädst deine Search-Console-Daten hoch, und 30 Sekunden später weißt du exakt, welche drei Artikel du diese Woche anfassen musst — und bekommst die Optimierung gleich mitgeliefert."

---

## 2. Problemstellung

### 2.1 Status Quo (ohne Tool)

Der aktuelle Workflow bei einer typischen SEO-optimierten Redaktion sieht so aus:

1. **GSC-Export** manuell herunterladen (Suchanfragen + Seiten)
2. **Excel-Filterung:** Daten nach Position, Impressions, CTR sortieren
3. **Manuelle Priorisierung:** Welche Artikel haben Potenzial? Welche nicht?
4. **Artikel-Diagnose:** Jeden Artikel einzeln öffnen, lesen und bewerten — fehlt ein FAQ-Block? Sind die Kennzahlen veraltet? Passt die Meta-Description?
5. **Optimierung durchführen:** SEO-Titel umschreiben, Meta-Description anpassen, FAQ ergänzen, Zahlen aktualisieren
6. **Keine Erfolgskontrolle:** Ob die Optimierung gewirkt hat, zeigt sich erst Wochen später in der GSC — ohne systematisches Tracking

**Zeitaufwand:** 1–2 Stunden Analyse, bevor überhaupt optimiert wird. Pro Artikel weitere 30–60 Minuten für Diagnose und Umsetzung.

### 2.2 Was existierende Tools nicht lösen

| Tool | Was es kann | Was fehlt |
|------|------------|-----------|
| Sistrix / Semrush / Ahrefs | Keyword-Tracking, Wettbewerbsanalyse, Backlinks | Keine Artikelanalyse auf Content-Ebene. Keine KI-Optimierungsvorschläge. Teuer (100–400 €/Monat) |
| Surfer SEO / Clearscope | Content-Scoring, NLP-Analyse | Kein GSC-Integration für Priorisierung. Fokus auf neue Artikel, nicht auf Nachoptimierung. Keine Finanzredaktions-Logik |
| Google Search Console | Die Rohdaten | Kein Tooling drumherum. Keine Diagnose, keine Vorschläge |
| ChatGPT / Claude direkt | KI-Analyse on demand | Kein strukturierter Workflow. Keine Datenbank, kein Tracking. Jedes Mal von vorne |

**Die Lücke:** Kein bestehendes Tool verbindet GSC-Priorisierung → Artikelanalyse → KI-Optimierung → Tracking in einem Workflow. Genau hier setzt SEO Cockpit an.

### 2.3 Besonderheit YMYL/Finanzen

Finanzredaktionen haben verschärfte Anforderungen, die generische SEO-Tools nicht abbilden:

- Kennzahlen (KGV, Kurse, Dividendenrenditen) veralten schnell und müssen regelmäßig geprüft werden
- Google bewertet YMYL-Content strenger (E-E-A-T)
- Veraltete Finanzdaten sind nicht nur ein SEO-Problem, sondern ein Vertrauensproblem
- Quellenangaben und Aktualitätssignale (Update-Datum) sind erfolgskritisch

---

## 3. Zielgruppe

### 3.1 Primär (MVP)

- **Dominik / Goldesel-Redaktion:** 3–4 Artikel pro Woche, regelmäßige Nachoptimierung, GSC als Hauptdatenquelle, Budget-bewusst

### 3.2 Sekundär (Skalierung)

- **Kleine bis mittlere Finanzredaktionen** (1–5 Redakteure), die SEO betreiben aber keine teuren Enterprise-Tools nutzen
- **SEO-Freelancer und Berater**, die für mehrere Kunden Content optimieren
- **Nischen-Publisher** (Finanzen, Gesundheit, Recht — alle YMYL-Bereiche), die besonders auf Datenaktualität achten müssen

### 3.3 Anti-Zielgruppe

- Große Redaktionen mit Enterprise-SEO-Stack (Sistrix + Ryte + eigenes BI)
- Reine Affiliate-Seiten ohne redaktionellen Anspruch
- Entwickler die nur eine API wollen

---

## 4. Produktvision & Abgrenzung

### Was SEO Cockpit ist

- Ein **Optimierungs-Werkzeug** für bestehende Artikel (80 % des Werts)
- Ein **Planungs-Werkzeug** für neue Artikel (20 % des Werts)
- **KI als Co-Pilot:** Analysiert, diagnostiziert und schlägt vor — der Redakteur entscheidet
- **Workflow-zentriert:** Nicht 50 Features, sondern ein klarer Ablauf von Daten → Priorisierung → Diagnose → Optimierung → Tracking

### Was SEO Cockpit nicht ist

- Kein Keyword-Research-Tool (dafür gibt es Ubersuggest, KWFinder etc.)
- Kein Backlink-Tool (dafür gibt es Ahrefs, Majestic)
- Kein CMS (es erstellt keine Artikel, sondern Optimierungsvorschläge)
- Kein Ersatz für redaktionelles Urteil

---

## 5. Feature-Übersicht & Phasen

### Phase 1: MVP — Nachoptimierungs-Cockpit (Wochen 1–4)

Das Kernprodukt. Löst das dringendste Problem: „Welche Artikel soll ich diese Woche optimieren, und was genau soll ich tun?"

#### 5.1 GSC-Datenimport (CSV)

**Nutzer-Aktion:** Zwei CSV-Dateien hochladen (Suchanfragen + Seiten) aus der Google Search Console.

**Was das Tool tut:**
- CSVs parsen und validieren (Fehlerhafte Formate erkennen, z.B. Position als Datum formatiert)
- Daten zusammenführen: Keywords den zugehörigen Seiten (URLs) zuordnen
- Dashboard mit Gesamtüberblick generieren: Klicks, Impressions, Ø CTR, Ø Position

**Datenfelder pro Eintrag:**
- URL (Seite)
- Keyword (Suchanfrage)
- Klicks
- Impressions
- CTR
- Ø Position

#### 5.2 Automatische Priorisierung

**Logik:** Jede URL wird nach einem Scoring-System bewertet und kategorisiert.

**Scoring-Faktoren:**
- Impressions-Volumen (gewichtet: 40 %)
- Position-Bereich (gewichtet: 30 %)
- CTR-Abweichung vom Benchmark (gewichtet: 20 %)
- Anzahl rankender Keywords (gewichtet: 10 %)

**Kategorisierung:**

| Kategorie | Kriterien | Empfohlene Aktion |
|-----------|-----------|-------------------|
| 🟢 Content-Problem | Position 8–20, hohe Impressions (≥ 3.000/3 Monate) | Artikel inhaltlich verbessern: Tiefe, Struktur, fehlende Elemente |
| 🟡 Packaging-Problem | Position 1–10, CTR unter Benchmark | SEO-Titel und Meta-Description optimieren (nach SERP-Check) |
| 🔵 Quick Win | Position 6–12, moderate Impressions, wenige Keywords | Gezielte Keyword-Integration, interne Links |
| ⚪ Low Priority | Niedrige Impressions (< 3.000), Position > 20 | Erstmal ignorieren oder archivieren |

**CTR-Benchmarks (nach Position):**
- Position 1: ~28–35 %
- Position 2: ~15–18 %
- Position 3: ~10–12 %
- Position 4–5: ~6–8 %
- Position 6–10: ~2–5 %

(Quellen: Sistrix, Backlinko, Advanced Web Ranking — konfigurierbar)

**Output:** Priorisierte Liste, sortiert nach Optimierungspotenzial. Die Top-10-Artikel mit dem größten Hebel werden prominent angezeigt.

#### 5.3 Artikel-Tiefenanalyse (KI-gestützt)

**Nutzer-Aktion:** Klick auf „Analysieren" bei einem priorisierten Artikel.

**Was das Tool tut:**
1. Live-Artikel fetchen (URL → HTML → Markdown-Extraktion)
2. Strukturanalyse: H1, H2, H3-Hierarchie prüfen, FAQ-Block vorhanden?, Infoboxen vorhanden?, Vergleichstabelle vorhanden?, Quellenblock vorhanden?
3. Content-Analyse (via Claude API): Zahlen im Artikel identifizieren und auf Plausibilität/Aktualität prüfen, Keyword-Abdeckung bewerten (Hauptkeyword in H1, H2, Meta?), Inhaltliche Tiefe vs. Top-Ranking-Konkurrenz einschätzen, Fehlende Themenaspekte identifizieren
4. SEO-Element-Check: Meta-Description vorhanden und passend?, SEO-Titel-Länge (55–65 Zeichen Zielbereich), Alt-Texte für Bilder vorhanden?, Interne Links vorhanden?

**Output: Diagnose-Report pro Artikel**

```
Artikel: „Tesla Aktie 2026: Analyse und Ausblick"
URL: /artikel/tesla-aktie-2026-analyse
Status: 🟢 Content-Problem (Position 11,3 / 14.200 Impressions)

Strukturcheck:
  ✅ H1 vorhanden, enthält Hauptkeyword
  ❌ FAQ-Block fehlt
  ❌ Nur 1 Infobox (2 empfohlen)
  ✅ Vergleichstabelle vorhanden
  ⚠️ Quellenblock: Nur 2 Quellen (Empfehlung: 4+)

Content-Check:
  ⚠️ KGV im Artikel: 48,2 — möglicherweise veraltet (Artikel von November 2025)
  ⚠️ Kurs im Artikel: 342 $ — aktueller Stand prüfen
  ❌ Keine Erwähnung von Q4/2025-Zahlen (inzwischen veröffentlicht)
  ✅ Keyword-Abdeckung: „Tesla Aktie" 8x verwendet (gut)

SEO-Check:
  ⚠️ Meta-Description: 138 Zeichen (Ziel: 140–160)
  ✅ SEO-Titel: 58 Zeichen (gut)
  ❌ 2 Bilder ohne Alt-Text

Priorität: HOCH — geschätzter Impact bei Optimierung: +3–5 Positionen
```

#### 5.4 KI-Optimierungsvorschläge

**Direkt im Diagnose-Report:** Zu jedem identifizierten Problem generiert die KI konkrete Vorschläge.

**Beispiel-Outputs:**

- **SEO-Titel (3 Varianten):**
  1. „Tesla Aktie 2026: Robotaxi-Start trifft auf Margendruck | Analyse"
  2. „Tesla Aktie Prognose 2026: Lohnt sich der Einstieg noch?"
  3. „Tesla Aktie: Warum die Bewertung jetzt entscheidend ist"

- **Meta-Description:**
  „Tesla kämpft mit sinkenden Margen, setzt aber auf Robotaxis und KI. Was die Tesla Aktie 2026 wert ist — mit Chartcheck und Kennzahlen."

- **FAQ-Block (3–5 Fragen):**
  Q: Ist die Tesla Aktie 2026 überbewertet?
  Q: Wann startet Tesla mit Robotaxis?
  Q: Wie hoch ist das KGV der Tesla Aktie?

- **Fehlende Inhalte:**
  „Der Artikel erwähnt die Q4/2025-Zahlen nicht. Empfehlung: Absatz mit Umsatz (25,7 Mrd. $), Marge und Ausblick ergänzen."

**Wichtig:** Alle Vorschläge sind Copy-Paste-ready. Der Redakteur kann sie direkt übernehmen oder anpassen.

---

### Phase 2: Erweiterungen (Wochen 5–8)

#### 5.5 SERP-Konkurrenzanalyse

**Nutzer-Aktion:** Keyword eingeben (z.B. „Tesla Aktie") → Tool analysiert die Top-10-Ergebnisse.

**Was das Tool tut:**
1. Top-10-SERPs fetchen (via SERP-API)
2. Jedes Ergebnis analysieren: Titel-Muster (welche Wörter, welche Struktur?), Content-Länge und -Tiefe, H2-Struktur (welche Themen werden abgedeckt?), FAQ-Fragen der Konkurrenz, Featured-Snippet-Format
3. Gap-Analyse: Was decken alle Top-10 ab, was dein Artikel nicht hat?

**Output:**

```
SERP-Analyse: „Tesla Aktie"

Top-10 Titel-Muster:
  8/10 nutzen Jahreszahl (2026)
  6/10 enthalten „Prognose" oder „Analyse"
  4/10 enthalten „Kursziel"

Themen-Coverage der Top-10:
  10/10: Quartalszahlen
  9/10: Analystenmeinungen / Kursziele
  8/10: Chartanalyse
  7/10: Robotaxi / FSD
  5/10: Elon Musk / DOGE
  3/10: Vergleich mit Konkurrenz

Dein Artikel fehlt:
  ❌ Analystenkursziele (9/10 Konkurrenten haben es)
  ❌ Elon Musk DOGE-Thematik (5/10 haben es, aktuell relevant)

Featured Snippet Chance:
  Typ: Tabelle (KGV, Umsatz, Marge im Überblick)
  → Empfehlung: Kennzahlen-Tabelle prominenter platzieren
```

#### 5.6 Content-Briefing-Generator

**Nutzer-Aktion:** Keyword für einen neuen Artikel eingeben.

**Was das Tool tut:**
1. SERP-Analyse (wie oben)
2. Keyword-Clustering: Verwandte Keywords aus den GSC-Daten gruppieren
3. Strukturvorschlag generieren

**Output: Fertiges Content-Briefing**

```
Content-Briefing: „ServiceNow Aktie"

Suchvolumen-Cluster:
  servicenow aktie — 7.786 Imp. (Haupt-KW)
  servicenow aktie prognose — 1.200 Imp.
  servicenow kursziel — 890 Imp.
  servicenow dividende — 420 Imp.

Empfohlene Struktur:
  H1: ServiceNow Aktie: Der stille KI-Gewinner im Enterprise-Bereich
  H2: Was macht ServiceNow?
  H2: ServiceNow Quartalszahlen — Das Wachstum in Zahlen
  H2: ServiceNow vs. Salesforce — Wer liegt vorne?
  H2: Chartanalyse ServiceNow Aktie
  H2: FAQ

Empfohlene Elemente:
  💡 Infobox: Was ist eine SaaS-Plattform?
  📦 Infobox: ServiceNow im KI-Wettbewerb
  Vergleichstabelle: ServiceNow vs. Salesforce vs. Workday

Interne Verlinkungsziele auf Goldesel:
  → /aktie/salesforce (Detailseite)
  → /artikel/ki-aktien-2026 (thematisch verwandt)

Yoast-SEO-Felder:
  Keyphrase: ServiceNow Aktie
  SEO-Titel: ServiceNow Aktie 2026: KI-Wachstum und Bewertung im Check
  Slug: servicenow-aktie-analyse
  Meta-Description: ServiceNow wächst mit KI-Features rasant. Lohnt sich die Aktie bei einem KGV von über 60? Analyse mit Vergleich und Chartcheck.
```

---

### Phase 3: Tracking & Skalierung (Wochen 9–12)

#### 5.7 Optimierungs-Tracking

- Historische GSC-Daten speichern (bei jedem Upload)
- Vorher/Nachher-Vergleich pro Artikel: Position, CTR, Klicks vor und nach Optimierung
- Dashboard: „Deine Optimierungen haben diesen Monat +1.240 Klicks gebracht"

#### 5.8 GSC-API-Integration

- OAuth2-Anbindung an Google Search Console
- Automatischer Datenimport (täglich/wöchentlich)
- Kein manueller CSV-Export mehr nötig

#### 5.9 Multi-Projekt-Support

- Mehrere Websites verwalten (für Freelancer/Agenturen)
- Projekt-spezifische Einstellungen (CTR-Benchmarks, Scoring-Gewichtung)

---

## 6. Technische Architektur

### 6.1 Tech-Stack

| Komponente | Technologie | Begründung |
|-----------|-------------|------------|
| Frontend | Next.js (React) + Tailwind CSS | Schnell, modern, SSR-fähig, Vercel-native |
| Hosting | Vercel | Kostenloser Tier reicht für MVP, automatische Deployments |
| Backend/API | Next.js API Routes (Serverless) | Kein separater Server nötig, skaliert automatisch |
| KI-Engine | Claude API (Sonnet 4.6 für Routine, Opus 4.6 für Deep Analysis) | Bestes Preis-Leistungs-Verhältnis, starke Reasoning-Fähigkeiten |
| Datenbank | Supabase (PostgreSQL) | Kostenloser Tier, Auth inklusive, gut für MVP |
| SERP-Daten | SerpAPI oder ValueSERP | Pay-per-use, Budget-freundlich |
| Artikel-Fetch | Eigener Scraper (Cheerio/node-html-parser) | Kein externes Dependency, volle Kontrolle |

### 6.2 Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │ Dashboard│ │ Artikel- │ │ SERP-    │ │ Briefing- │  │
│  │ & Prio   │ │ Analyse  │ │ Analyse  │ │ Generator │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬─────┘  │
│       │             │            │              │        │
│  ─────┴─────────────┴────────────┴──────────────┴─────  │
│                    API Routes (Serverless)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │CSV-Parser│ │Claude API│ │ SERP-API │ │ URL-Fetch │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬─────┘  │
└───────┴─────────────┴────────────┴──────────────┴───────┘
                      │
              ┌───────┴───────┐
              │   Supabase    │
              │  (PostgreSQL) │
              │  - GSC-Daten  │
              │  - Analysen   │
              │  - Tracking   │
              └───────────────┘
```

### 6.3 KI-Modell-Strategie (Kosten-Optimierung)

Nicht jede Aufgabe braucht das teuerste Modell:

| Aufgabe | Modell | Geschätzte Kosten/Aufruf |
|---------|--------|--------------------------|
| CSV-Parsing, Scoring | Kein LLM (reine Logik) | 0 € |
| Strukturcheck (H1, FAQ, etc.) | Kein LLM (HTML-Parsing) | 0 € |
| Content-Analyse & Diagnose | Claude Sonnet 4.6 | ~0,01–0,03 € |
| Optimierungsvorschläge generieren | Claude Sonnet 4.6 | ~0,02–0,05 € |
| SERP-Deep-Dive & Gap-Analyse | Claude Opus 4.6 | ~0,05–0,15 € |
| Content-Briefing (komplex) | Claude Opus 4.6 | ~0,05–0,15 € |

**Geschätzte Monatskosten bei moderater Nutzung:**
- 20 Artikelanalysen × 0,04 € = 0,80 €
- 20 Optimierungsvorschläge × 0,05 € = 1,00 €
- 10 SERP-Analysen × 0,15 € = 1,50 €
- 5 Content-Briefings × 0,15 € = 0,75 €
- SERP-API (100 Queries) ≈ 5–10 €
- **Gesamt: ~10–15 €/Monat** (komfortabel im 10–50 € Budget)

---

## 7. User Interface — Kernscreens

### 7.1 Dashboard (Startseite nach Upload)

```
┌─────────────────────────────────────────────────────────┐
│  SEO COCKPIT                           [Upload CSVs ▲]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Überblick (letzte 3 Monate)                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  38.240  │ │  2,87M   │ │  1,3 %   │ │  12,7    │  │
│  │  Klicks  │ │  Impress.│ │  Ø CTR   │ │  Ø Pos.  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│  Top-10 Optimierungskandidaten                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🟢 /artikel/tesla-aktie-2026    Pos 11,3  │ ▶  │   │
│  │    14.200 Imp · CTR 0,8% · 6 Keywords           │   │
│  │    Geschätztes Potenzial: +2.800 Klicks/Quartal  │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ 🟡 /vergleich/depot/junior      Pos 13,5  │ ▶  │   │
│  │    49.389 Imp · CTR 0,5% · 12 Keywords          │   │
│  │    Geschätztes Potenzial: +4.100 Klicks/Quartal  │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ ...                                              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Verteilung                                             │
│  🟢 Content-Probleme: 23 Artikel                       │
│  🟡 Packaging-Probleme: 8 Artikel                      │
│  🔵 Quick Wins: 15 Artikel                             │
│  ⚪ Low Priority: 67 Artikel                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Artikel-Analyse-Ansicht

```
┌─────────────────────────────────────────────────────────┐
│  ← Zurück zum Dashboard                                │
│                                                         │
│  Tesla Aktie 2026: Analyse und Ausblick                │
│  /artikel/tesla-aktie-2026-analyse                      │
│  🟢 Content-Problem · Pos. 11,3 · 14.200 Imp.         │
│                                                         │
│  ┌─── Diagnose ────────────────────────────────────┐   │
│  │                                                  │   │
│  │  Struktur           Content          SEO         │   │
│  │  ✅ H1              ⚠️ KGV veraltet  ✅ Titel   │   │
│  │  ❌ FAQ fehlt       ⚠️ Kurs veraltet ⚠️ Meta    │   │
│  │  ❌ 1/2 Infoboxen   ❌ Q4 fehlt      ❌ Alt-Text │   │
│  │  ✅ Tabelle         ✅ Keywords OK               │   │
│  │                                                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─── KI-Vorschläge ──────────────────────────────┐    │
│  │                                                  │   │
│  │  SEO-Titel (3 Varianten):           [Kopieren]  │   │
│  │  1. Tesla Aktie 2026: Robotaxi-Start ...        │   │
│  │  2. Tesla Aktie Prognose 2026: ...              │   │
│  │  3. Tesla Aktie: Warum die Bewertung ...        │   │
│  │                                                  │   │
│  │  Meta-Description:                  [Kopieren]  │   │
│  │  „Tesla kämpft mit sinkenden ..."               │   │
│  │                                                  │   │
│  │  FAQ-Block (4 Fragen):              [Kopieren]  │   │
│  │  ...                                             │   │
│  │                                                  │   │
│  │  Fehlende Inhalte:                               │   │
│  │  „Q4/2025-Zahlen ergänzen: ..."                  │   │
│  │                                                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  [Als erledigt markieren]  [SERP-Check starten →]       │
└─────────────────────────────────────────────────────────┘
```

---

## 8. Differenzierung & Moat

### Was SEO Cockpit besonders macht

1. **Workflow-first:** Nicht 100 Features, sondern ein klarer Pfad: Daten → Priorisierung → Diagnose → Vorschläge → Tracking. Die meisten Tools sind Feature-Sammlungen ohne Workflow.

2. **Nachoptimierung als Kernkonzept:** Während Surfer, Clearscope & Co. auf neue Artikel fokussieren, ist SEO Cockpit das erste Tool, das systematisch bestehende Artikel optimiert. Das ist der Pitch: „Hör auf, neue Artikel zu produzieren, die auf Position 15 landen. Bring deine bestehenden auf Position 5."

3. **YMYL-Awareness:** Das Tool versteht, dass veraltete Finanzkennzahlen nicht nur ein SEO-Problem sind, sondern Leservertrauen zerstören. Keine generische SEO-Analyse, sondern branchenspezifische Checks.

4. **Preis:** 10–50 €/Monat statt 100–400 € für Sistrix/Ahrefs + 100–200 € für Surfer SEO. Damit erreichbar für Freelancer und kleine Redaktionen.

5. **KI-native:** Nicht KI als Add-on draufgeschraubt, sondern von Anfang an als KI-Produkt gedacht. Die Analyse-Qualität ist der Kern, nicht das Dashboard.

### Langfristiger Moat (wenn es ein Produkt wird)

- **Branchenspezifische Prompt-Templates:** Finanz-, Gesundheits- und Rechts-Redaktionen haben unterschiedliche Anforderungen. Diese Templates sind schwer zu replizieren.
- **Optimierungs-Historie:** Je mehr Daten, desto besser die Vorhersage, welche Maßnahmen welchen Impact haben.
- **Community & Templates:** Redaktionen teilen ihre besten Optimierungsstrategien und Briefing-Vorlagen.

---

## 9. Risiken & Mitigations

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Google ändert SERP-Layout → CTR-Benchmarks veralten | Mittel | Mittel | Benchmarks konfigurierbar machen, regelmäßig updaten |
| Claude API-Kosten steigen | Niedrig | Mittel | Modell-Fallback (Haiku für einfache Tasks), Caching |
| SERP-API wird teuer oder eingestellt | Mittel | Hoch | Abstraktion bauen, einfach auf andere SERP-API wechselbar |
| Google wertet KI-generierten Content ab | Mittel | Hoch | Tool liefert Vorschläge, Redakteur überarbeitet immer. Nie 1:1 übernehmen |
| Nutzer verstehen das Tool nicht | Niedrig | Mittel | Onboarding-Flow, Tooltips, Video-Walkthrough |
| Artikel-Fetch wird von Websites blockiert | Mittel | Mittel | Fallback: Nutzer kann Artikel-Text manuell einfügen |

---

## 10. Erfolgskennzahlen (KPIs)

### Intern (Goldesel)

- **Zeitersparnis:** Analyse-Workflow von 1–2 Stunden auf < 15 Minuten
- **Optimierungs-Output:** Von 3–5 Artikel/Monat nachoptimiert auf 8–12
- **Ranking-Verbesserung:** Ø Positionsverbesserung der optimierten Artikel um 3–5 Plätze
- **Traffic-Wachstum:** +20 % organische Klicks innerhalb von 3 Monaten nach Einführung

### Produkt (wenn extern angeboten)

- **Aktivierung:** 80 % der Nutzer laden innerhalb von 5 Minuten GSC-Daten hoch
- **Retention:** 60 % Nutzung nach 30 Tagen
- **Time-to-Value:** Erste Optimierungsvorschläge in < 2 Minuten nach Upload

---

## 11. Roadmap (Zusammenfassung)

```
Woche 1–2:  CSV-Parser, Scoring-Engine, Priorisierungs-Dashboard
Woche 3–4:  Artikel-Fetch, KI-Diagnose, Optimierungsvorschläge
Woche 5–6:  SERP-Analyse-Modul
Woche 7–8:  Content-Briefing-Generator
Woche 9–10: Tracking & Verlaufsansicht
Woche 11–12: GSC-API-Anbindung, Multi-Projekt, Polish
```

---

## 12. Offene Fragen / Noch zu klären

1. **Name:** „SEO Cockpit" ist ein Arbeitstitel. Brauchen wir etwas Eigenes, Marktfähiges?
2. **Auth:** Reicht für den MVP ein einfacher API-Key-Schutz, oder brauchen wir von Anfang an User-Accounts (Supabase Auth)?
3. **Caching:** Wie lange sollen Analyse-Ergebnisse gespeichert werden? (Spart API-Kosten, aber Daten veralten)
4. **Sprache:** Tool-UI auf Deutsch (Zielgruppe DACH) oder Englisch (international skalierbar)?
5. **Monetarisierung:** Freemium (5 Analysen/Monat kostenlos) + Pro-Tier? Oder erstmal komplett intern?
6. **SERP-API-Auswahl:** SerpAPI (50 $/Monat für 5.000 Queries) vs. ValueSERP (günstiger, weniger zuverlässig) vs. eigener Scraper (kostenlos, fragil)?
7. **Goldesel-spezifische Features:** Soll die Anbindung an die Goldesel-Kennzahlen-Datenbank Teil des Tools sein, oder bleibt das manuell?

---

## Anhang A: Prompt-Architektur (Beispiel)

### System-Prompt für Artikelanalyse

```
Du bist ein SEO-Analyst für deutschsprachige Finanzredaktionen. 
Analysiere den folgenden Artikel und liefere eine strukturierte Diagnose.

KONTEXT:
- Hauptkeyword: {{keyword}}
- Aktuelle Position: {{position}}
- Impressions (3 Monate): {{impressions}}
- CTR: {{ctr}}

AUFGABEN:
1. STRUKTUR-CHECK: Prüfe ob folgende Elemente vorhanden sind:
   - FAQ-Block, Infoboxen (💡/📦), Vergleichstabelle, Quellenblock, 
     Chartanalyse-Abschnitt
   
2. DATEN-CHECK: Identifiziere alle Zahlen im Artikel (KGV, Kurse, 
   Umsätze, Margen, Dividendenrenditen). Markiere jede Zahl die 
   älter als 3 Monate sein könnte als ⚠️ zu prüfen.

3. KEYWORD-CHECK: Wie oft kommt das Hauptkeyword vor? Ist es in H1, 
   H2, Meta-Description? Gibt es verwandte Keywords die fehlen?

4. OPTIMIERUNGS-VORSCHLÄGE: Generiere:
   - 3 SEO-Titel-Varianten (55-65 Zeichen)
   - 1 Meta-Description (140-160 Zeichen)
   - 3-5 FAQ-Fragen mit kurzen Antworten
   - Liste fehlender Inhalte die ergänzt werden sollten

FORMAT: Antworte als strukturiertes JSON.
SPRACHE: Deutsch.
STIL: Journalistisch, Du-Ansprache, keine Anlageberatung.
```

### System-Prompt für SERP-Analyse

```
Du bist ein SEO-Stratege. Analysiere die folgenden Top-10-
Suchergebnisse für das Keyword "{{keyword}}" und identifiziere 
Muster und Lücken.

SUCHERGEBNISSE:
{{serp_results}}

EIGENER ARTIKEL:
{{own_article_summary}}

AUFGABEN:
1. TITEL-MUSTER: Welche Wörter/Strukturen nutzen die Top-Ergebnisse?
2. THEMEN-COVERAGE: Welche Themen decken die meisten Ergebnisse ab?
3. GAP-ANALYSE: Was haben die Top-Ergebnisse, was der eigene 
   Artikel nicht hat?
4. FEATURED-SNIPPET: Gibt es ein Featured Snippet? Welches Format 
   hat es? Kann der eigene Artikel es gewinnen?
5. EMPFEHLUNGEN: Konkrete, priorisierte Maßnahmen.

FORMAT: Strukturiertes JSON.
```

---

## Anhang B: Wettbewerbsmatrix

| Feature | SEO Cockpit | Surfer SEO | Sistrix | Clearscope | Frase |
|---------|------------|-----------|---------|-----------|-------|
| GSC-Daten-Integration | ✅ (Kern) | ❌ | ✅ (begrenzt) | ❌ | ❌ |
| Nachoptimierungs-Priorisierung | ✅ (Kern) | ❌ | ❌ | ❌ | ❌ |
| KI-Artikelanalyse | ✅ | ✅ (NLP) | ❌ | ✅ (NLP) | ✅ |
| KI-Optimierungsvorschläge | ✅ | ⚠️ (begrenzt) | ❌ | ⚠️ | ✅ |
| SERP-Konkurrenzanalyse | ✅ | ✅ | ✅ | ✅ | ✅ |
| Content-Briefings | ✅ | ✅ | ❌ | ✅ | ✅ |
| YMYL/Finanz-spezifisch | ✅ | ❌ | ❌ | ❌ | ❌ |
| Zahlen-Aktualitätscheck | ✅ | ❌ | ❌ | ❌ | ❌ |
| Optimierungs-Tracking | ✅ (Phase 3) | ❌ | ✅ | ❌ | ❌ |
| Preis (pro Monat) | 10–50 € | 99–249 $ | 100–500 € | 170–350 $ | 15–115 $ |
