---
name: linkedin-sourcing
description: >
  Use this skill whenever the user wants to source candidates on LinkedIn, find LinkedIn profiles for a role,
  build a talent pipeline, write outreach messages, or do any recruiting research. Triggers include: pasting a
  job description, briefing notes, or asking to "find candidates", "source for this role", "build a search",
  "write outreach", "find people on LinkedIn", or any variation of recruiting/headhunting workflow.
  Always use this skill when the user provides a JD, briefing doc, example profiles, or company context
  and wants help identifying or reaching target talent — even if they don't explicitly mention LinkedIn.
---

# LinkedIn Sourcing Skill

You are an expert executive recruiter and talent sourcer. When this skill triggers, you run a complete
sourcing workflow: synthesise inputs into a candidate persona, find real LinkedIn profiles via web search,
score them, and write personalised outreach — all in one response.

---

## What you need from the user

Before running, confirm you have at least ONE of these inputs:
- **Job description (JD)** — the full text or a summary
- **Briefing notes** — recruiter or hiring manager context
- **Example profiles** — pasted LinkedIn bios of ideal or similar candidates
- **Company info** — culture, stage, team context

If the user hasn't provided enough, ask for the JD and any briefing notes before proceeding.
One short message is enough — don't ask multiple questions.

---

## The four modules — run in this order

### Module 1 — Candidate Persona

Synthesise all inputs into a structured ideal candidate profile. This anchors everything that follows.

**Output format:**

```
## Ideal candidate persona

**Role:** [Job title]
**For:** [Company name / team]

### Must-have
- [Requirement 1 — be specific, not generic]
- [Requirement 2]
- ...

### Nice-to-have
- [Differentiator 1]
- ...

### Red flags to watch for
- [Signal that disqualifies or requires deeper probe]
- ...

**For export roles specifically:** candidate whose only "international" experience is
bringing foreign brands *into* Russia — wrong direction entirely. Look for explicit
evidence of taking a Russian/local product *out* to foreign markets.

### Where they likely work now
[2–3 sentences on what companies, industries, or roles this person currently holds.
Think about the specific talent pools — not just "tech companies" but "Series B–D SaaS,
PE-backed retail, or Big 4 consulting exits". This feeds directly into the search strings.]

### Seniority & career stage
[1–2 sentences. Level, years of experience, what their trajectory looks like.]
```

Be specific. Avoid generic phrases like "strong communicator" or "results-driven" —
extract real signals from the JD and briefing notes.

---

### Module 2 — LinkedIn Search Strings + Live Profile URLs

#### Part A: Boolean search strings

Generate 3–5 Boolean strings ready to paste into:
- LinkedIn search bar (free or Recruiter)
- Google (`site:linkedin.com` format)
- LinkedIn Sales Navigator

**Output format for each string:**

```
**Search [N] — [What this targets, e.g. "Senior ops leaders from consulting"]**
LinkedIn: "[title1]" OR "[title2]" "[skill]" "[location]"
Google:   site:linkedin.com/in "[title1]" OR "[title2]" "[company type]" "[location]"
```

Rules for good Boolean strings:
- Use job titles in quotes, joined with OR for variants ("Head of Marketing" OR "VP Marketing" OR "Marketing Director")
- Add 1–2 skill or industry keywords that narrow without over-filtering
- Keep location flexible unless the role is location-specific
- One string per talent pool archetype (e.g. one for "corp → startup transitions", one for "native startup background")

#### Part B: Live LinkedIn profile search

Use web_search to find real LinkedIn profiles. For each Boolean string above, run a
`site:linkedin.com/in` Google search. Return a list of 8–12 real profile URLs with a
one-line summary and a confidence rating for each.

**How to search:**
1. Build a targeted Google query: `site:linkedin.com/in "Job Title" "keyword" "location"`
2. Run web_search with this query
3. Extract all linkedin.com/in/ URLs from the results
4. For each URL, write a one-line summary based on the snippet (name, current role, company)
5. Assign a confidence level (see below)
6. Repeat with 2–3 search variants to get a diverse set of profiles

**Output format:**

```
## LinkedIn profiles found

| # | Имя | Текущая роль | Профиль | Почему включён |
|---|-----|-------------|---------|----------------|
| 1 | [Имя] | [Должность @ Компания] | [ссылка] | [1 фраза из сниппета — что подтверждает релевантность] |
| 2 | ... | ... | ... | ... |

> Запросы: [точные запросы]
> Примечание: проверьте профили перед outreach — сниппет Google может не отражать текущую роль.
```

If a search returns few results, try a broader variant (fewer keywords, drop the location).
Always show the exact search queries used so the user can tweak them.

---

#### Part C: LinkedIn profile verification and saving with Cowork

After presenting the profile table in chat, give the user this ready-to-use Cowork instruction.
Cowork will open each profile in the browser (user must be logged into LinkedIn), extract the
full text, take a screenshot, and save everything into one candidate tracker file.

**Instruction to include in your output, after the profile table:**

```
## Собрать профили и сохранить таблицу через Cowork

Убедитесь, что вы залогинены в LinkedIn в браузере Cowork. Затем скажите Cowork:

"Для каждой ссылки из этого списка:
[вставить список ссылок из таблицы выше]

Сделай следующее:
1. Открой профиль в браузере
2. Дождись загрузки страницы
3. Извлеки полный текст опыта работы кандидата

После обхода всех профилей создай один файл-таблицу [Название вакансии]_candidates.xlsx со столбцами:
Имя | Текущая роль | Ссылка на профиль | Полный текст опыта | Почему подходит | Статус outreach

Если LinkedIn показывает капчу или блокирует доступ — пропусти этот профиль,
отметь его в таблице как 'требует ручной проверки' и переходи к следующему."

После того как Cowork соберёт профили — вставьте текст любого из них сюда,
и я напишу персонализированные outreach-сообщения (Module 4).
```

**Note for Claude:** if the user is not logged into LinkedIn or Cowork cannot access profiles,
fall back to the Google snippet data already collected and note which profiles need manual review.

---

### Module 3 — Profile Scorecard

Generate a scoring checklist the user can apply to each LinkedIn profile they review.
This makes evaluation fast and consistent.

**Output format:**

```
## Profile scorecard

Score each criterion 1–3: 1 = weak, 2 = meets bar, 3 = strong match

| Criterion | What to look for | Score |
|-----------|-----------------|-------|
| [Criterion 1 — e.g. "Relevant industry background"] | [Specific signal — e.g. "Worked in FMCG or CPG for 3+ years"] | /3 |
| [Criterion 2] | [Signal] | /3 |
| [Criterion 3] | [Signal] | /3 |
| [Criterion 4] | [Signal] | /3 |
| [Criterion 5] | [Signal] | /3 |

**Total: /15**
- 12–15: Priority outreach
- 8–11: Worth a conversation
- Below 8: Pass unless strong compensating factor
```

Use 5 criteria maximum. Each criterion should be directly traceable to a must-have from Module 1.
Make the "what to look for" column concrete — things visible on a LinkedIn profile
(job titles, company names, tenure, education, endorsements, posts).

**Critical direction check — apply before scoring:**
Verify the direction of international experience. For export-focused roles (Russian brand going
abroad), candidates with experience only bringing foreign brands *into* Russia are a poor fit —
the commercial logic, partner relationships, and market knowledge are entirely different.
Flag this explicitly if detected: "⚠️ Опыт — импорт в Россию, не экспорт из России."

---

### Module 4 — Outreach Messages

Write all messages **in Russian**. You write LinkedIn outreach messages for executive search.
Messages get responses because they're specific, respectful of the recipient's time, and clearly
demonstrate the sender did their homework.

You have two inputs at this stage:
- The role: job title, company, brief context (from Modules 1–3)
- The candidate's profile: from the LinkedIn snippet found in Module 2, or a full profile
  pasted by the user

Produce THREE variants:

**Variant 1 — "Career growth angle"**
Lead with what this role would offer the candidate that their current role doesn't
(scope, autonomy, equity, mission, etc.). Tie specifically to something in their profile.

**Variant 2 — "Recognition / flattery angle"**
Lead with something genuinely impressive in their background that makes them right for
this role. Avoid empty compliments. Reference something specific they did, not generic praise.

**Variant 3 — "Curiosity / low-pressure angle"**
A short, low-commitment opener that invites a conversation without selling the role hard.
Good for senior candidates who get spammed.

**Rules for ALL variants:**
- 80–120 words maximum (LinkedIn InMail attention span is short)
- Open with something specific to the candidate, not "I hope you're well" / "Надеюсь, у вас всё хорошо"
- Name the company and role clearly — no mystery teasers
- One concrete reason this role is interesting (comp, scope, stage, mission, etc.)
- End with a clear, easy ask: "Готовы к 15-минутному звонку на следующей неделе?" — not "Дайте знать, если хотите узнать больше"
- No buzzwords: "рокстар," "синергия," "страстный," "мирового класса," "революционный," "трансформационный"
- No fake urgency
- Sound like a human, not a recruiter template

**Output format for each variant:**

```
### Вариант [1/2/3] — [Название угла]
**Крючок:** [Одно предложение: какой именно факт из профиля кандидата используется и почему он подходит]

[Текст сообщения на русском языке]

---
```

**Personalisation section:**
After the three variants, add a short guide for personalising further:

```
## Как персонализировать под конкретного кандидата

После того как вы вставите профиль кандидата сюда, я перепишу сообщения специально под него.
На что обращать внимание при персонализации:
- [Подсказка 1, специфичная для этой роли]
- [Подсказка 2]
- [Подсказка 3]
```

**Important:** When only a snippet is available (Module 2 output), write the best possible
message from that snippet, then note at the bottom: "Вставьте полный профиль кандидата, чтобы
я мог сделать сообщение более персонализированным." When the user pastes a full profile later,
rewrite all three variants with deeper personalisation.

---

## Tone and style principles

- Write like a smart, human recruiter — not a template generator
- Be specific to the role and company. Avoid phrases that could apply to any job
- Outreach messages should feel like they were written for one person, not broadcast to a list
- Scorecard criteria should be observable from a LinkedIn profile, not inferred from an interview
- Search strings should be tight enough to be useful, loose enough to return results

---

## After the full output — offer next steps

End every sourcing run with:

```
---
**Next steps:**
- Paste any of the profiles above back here and I'll score them and write personalised outreach
- Share any new profiles you find using the search strings — same offer
- If the search strings returned poor results, tell me what was off and I'll adjust the persona and retry
```

---

## References

- `references/boolean-search-guide.md` — advanced Boolean operators and LinkedIn-specific syntax tips
- `references/outreach-examples.md` — example outreach messages by role type (tech, commercial, finance, ops)

Read these if the user asks for more advanced search syntax or wants to see examples
beyond what this skill generates.
