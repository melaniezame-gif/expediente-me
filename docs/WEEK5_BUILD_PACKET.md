# Week 5 — Public Chatbot / Guided Assistant · Build Discipline Packet

Project: **Vitalis** (medical record + vital-signs triage) · Live: https://expediente-me-wine.vercel.app
Required page: **`/chat`** · Written and committed **before any Week 5 code** (Gate 1).

---

## 🧩 Problem
The `/core` triage form works, but it assumes the user already knows what to do: type 4 numbers and read a light. Real
users don't start there. They start with a worry — *"my dad's oxygen says 91, is that bad?"*, *"can I give him
ibuprofen?"*, *"he has chest pain"*. A blank form can't (1) catch an emergency **before** asking for numbers, (2) explain
what a reading means in plain words, or (3) say "no" safely when someone asks for a diagnosis or a dose.

A public health chatbot that answers freely is dangerous: it can invent medical advice, miss an emergency, or collect
personal data. So the problem this week is: **give people a guided conversation that gets them to the right next step,
with guardrails that are stricter than helpfulness, a human checkpoint, and real feedback from real users.**

## 👤 User
- **Primary: Daniela, 38, Mexico City** (same persona as Week 4) — caregiver for her father (67), measures his vitals at
  home, panics at night, is on her phone, not a health expert. Needs: "is this urgent?" in under a minute.
- **Secondary: any adult (18+)** checking their own readings — Vitalis is for everyone 18+ who wants to keep their
  records, not only older adults.
- **Internal user: the Vitalis founder (me)** — reviews flagged conversations, reads ratings and test summaries to
  decide what to fix next.
- **Not a user:** minors (under 18) and anyone in an active emergency — the assistant routes both away immediately.

## 🎯 Success (what must work by the end of the week)
1. `/chat` loads live on Vercel, desktop and mobile (390 px, no horizontal scroll).
2. The assistant asks **3 intake questions** (who is it for, age group, red-flag symptoms) and then the 4 readings.
3. **Response logic:** results use the same rule-based score as `/core`; free-text questions are answered from a curated,
   human-written answer set (no invented answers).
4. **Guardrails fire correctly** for: emergency symptoms, self-harm, medication/dose requests, diagnosis requests,
   personal data (CURP, phone, email — redacted before saving), minors, impossible readings, and off-topic questions.
5. **Human checkpoint:** the user must confirm a summary of their answers before any result is shown; emergencies,
   Attention results, 👎 ratings and "Talk to a person" mark the conversation **needs human review**, visible in a review
   queue on `/chat`.
6. Every assistant answer has **👍 / 👎**, saved to Supabase `chat_feedback`.
7. **Save test summary** inserts one row into `chat_sessions` (redacted transcript, intake, result, guardrails fired,
   1–5 rating, tester comment) — proven with a **screenshot of the inserted row in Supabase Table Editor**
   (Week 1 lesson: no screenshot = not done).
8. **3 software tests** pass (`npm test`) and **3 external user tests** with real people are documented.

## 🖼️ UX Concept
Wireframe: `docs/week5-wireframe.png` (desktop left, mobile right). Key UX decisions:
- **Chat, but guided.** Intake answers are buttons (fast on a phone, no typos); free text is always allowed too.
- **Emergency check comes before numbers.** Question 3 asks about red-flag symptoms; if any is present the assistant
  stops and shows a red "Call 911 now" card — it never asks for readings first.
- **Guardrail messages look different** (slate border + "Safety" label) so the user sees *why* the bot said no.
  Red/amber/green stay reserved for triage status (brand rule from Week 4); red is also used for emergencies.
- **Checkpoint card:** "Here's what I understood — is this right?" with *Confirm* / *Edit* before the result.
- Header always shows **Talk to a person** and **Restart**. A permanent note: "Automated guide, not a doctor."
- Side panel (below the chat on mobile): dashboard widget, human review queue, recent test summaries.

## ✂️ Scope Cut (looked nice, not built this week)
- **A real LLM (Claude/GPT API).** A free-form model can hallucinate medical advice; a public health tool needs
  answers a human wrote and reviewed. Deterministic rules are also testable. (Revisit with a retrieval-only design.)
- Live hand-off to a real nurse/doctor (needs staff, schedule, liability). The checkpoint is a review queue, not live.
- Reviewer login + "mark as reviewed" (needs Supabase Auth and an update policy).
- Voice input, WhatsApp bot, Spanish version (course requires English this term).
- Saving the conversation to a personal medical record (needs accounts + LFPDPPP consent flow).
- Multi-turn memory across visits.

## 🧱 Product Spec + Acceptance Criteria
| # | Requirement | Acceptance criteria (testable) |
|---|---|---|
| R1 | Chat UI | `/chat` shows a message list (bot left, user right), a text box + Send (Enter sends), and choice buttons; auto-scrolls to the newest message; works at 390 px. |
| R2 | 3 intake questions | Q1 who it's for (Me / Someone I care for), Q2 age group (18–64 / 65+ / Under 18), Q3 red flags (chest pain, severe breathing trouble, fainting/confusion, stroke signs, None). Typed answers ("my dad", "70", "none") are understood. |
| R3 | Vitals step | 4 fields (°C, bpm, SpO₂ %, pain 0–10) or typed "38.5 110 93 6". Impossible values (e.g. 50 °C) are rejected with the valid range. "I don't have readings" skips to Q&A. |
| R4 | Human checkpoint | A summary card with Confirm / Edit appears **before** every result; no result is shown without Confirm. |
| R5 | Response logic | Result = `calculateTriage` from `/core` (same score 0–8 and status). 65+ and caregiver notes added. Free text matched to ≥ 10 curated intents; unknown health questions get an honest "I don't have a reliable answer" fallback. |
| R6 | Guardrails | Priority: self-harm → emergency → minor → medication → diagnosis → off-topic. Personal data is redacted from the saved transcript and the user is told. Simple negation ("no chest pain") does **not** fire the emergency guardrail. |
| R7 | Human review flags | Session is flagged with reasons when: emergency or self-harm guardrail, Attention result, a 👎, "Talk to a person", or under-18. Flagged sessions appear in the review queue. |
| R8 | Feedback rating | 👍/👎 on every assistant answer inserts into `chat_feedback`; the button shows the saved state or the real error. |
| R9 | Save test summary | "Finish & save" asks tester code (optional), 1–5 rating, comment → inserts into `chat_sessions` and shows the row id returned by Supabase; on failure shows the real error. |
| R10 | Dashboard widget | Shows sessions saved, average rating, % 👍, flagged count — read from Supabase. |

## 🏗️ Architecture
```
Visitor ── /chat (server page) ──> <ChatAssistant/> (client component)
              │   state = { step, intake, vitals, flags, transcript }
              │   every user event ──> lib/chatbot.js  (PURE: no React, no network)
              │        ├─ checkGuardrails(text)  → self_harm | emergency | minor | medication | diagnosis | pii | off_topic
              │        ├─ reduceChat(state, event) → { state, botMessages }   (intake state machine)
              │        ├─ parseVitals / validateVitals
              │        ├─ calculateTriage()  ← lib/triage.js (same rules as /core)
              │        ├─ matchIntent(text) → curated answer (lib/chatAnswers inside chatbot.js)
              │        └─ reviewReasons(state) / buildSummary(state)  (redacted)
              │
              ├─ 👍/👎 ──insert──> Supabase chat_feedback  (session_id, message_id, intent, rating)
              └─ Finish & save ──insert──> Supabase chat_sessions (intake, vitals, result, guardrails,
                                                             needs_review, reasons, rating, transcript)
Founder ── /chat side panel <ChatInsights/> ──select──> chat_sessions + chat_feedback
              → widget (counts, avg rating, % 👍) · review queue (needs_review = true) · recent tests
Supabase (Postgres + RLS): anon can INSERT + SELECT only (no update/delete).
```
Data flow rule: the transcript is **redacted in the browser before** it is sent, so CURP/phone/email never reach the DB.

## 🧰 Tech Stack
| Tool | Why |
|---|---|
| Next.js 14 App Router | Same as Weeks 1–4; `/chat` is a server page with one client island. |
| React state (`useState`/`useReducer`-style pure reducer) | Whole conversation is a deterministic state machine → easy to test. |
| Tailwind CSS | Chat bubbles, responsive layout, brand tokens. |
| Supabase (Postgres + RLS) | `chat_sessions` and `chat_feedback`; anon insert/select only. |
| Vercel | Auto-deploy on push to `main`. |
| GitHub | Commit history = build evidence. |
| `node:test` | Built-in test runner, no new dependency. |
| No LLM / no external API | Safety, cost $0, deterministic, testable (see Scope Cut). |

## ⚙️ DevOps
- Repo `melaniezame-gif/expediente-me`, branch `main`, ≥ 5 small commits (this packet is commit #1).
- Env vars unchanged: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (trimmed in `lib/supabaseClient.js`).
- Database: run `supabase_chat.sql` in Supabase SQL Editor **before** testing Save / 👍👎.
- Deploy plan: push → Vercel build → open `/chat` live → run software + user tests → fix the bug found → push again
  (≥ 2 deployments) → re-test the same case live.
- Rollback: Vercel "Promote to production" on the previous deployment.

## 🧪 Test Plan
**Software tests (automated, `npm test`, file `tests/chat.test.mjs`):**
1. **C1 — Guardrails:** emergency, self-harm (EN + ES), medication, diagnosis, minor, off-topic are detected with the
   right priority; "no chest pain" does not fire; CURP/phone/email are redacted.
2. **C2 — Intake flow + checkpoint:** Q1 → Q2 → Q3 → vitals → checkpoint → result; result is impossible without
   Confirm; Edit restarts intake; impossible vitals are rejected; a red flag jumps straight to the emergency card.
3. **C3 — Response logic + review flags:** typed vitals give the same score/status as `/core` for the 3 Week 1 cases;
   free-text questions hit the right intent; review reasons are produced for Attention, emergency, 👎, human request;
   the saved summary contains no personal data.

**External user tests (3 real people, live URL):** each tester gets a short task card, uses `/chat` on their own phone,
then rates 1–5 and comments with "Finish & save". Planned scenarios:
- **U1 — Caregiver, normal-ish readings** (e.g. 37.4 °C, 98 bpm, 95 %, pain 3) → expects a clear, calm answer.
- **U2 — Tries to break it** (asks for a diagnosis, a dose, types personal data, off-topic) → guardrails must hold.
- **U3 — Emergency path** (says "chest pain") → must see 911 immediately, no numbers asked.
Evidence: screenshot of each tester's `chat_sessions` row + their comment, and what we changed because of it.

**Manual live checks:** 👍 a message → screenshot the `chat_feedback` row. Save a summary → screenshot the
`chat_sessions` row. Confirm the flagged session appears in the review queue after refresh.

## 🤖 Coding Agent Prompt (exact)
> Week 5 for my Next.js 14 (App Router, JavaScript, Tailwind, Supabase) project "Vitalis". Follow
> docs/WEEK5_BUILD_PACKET.md. (1) Create lib/chatbot.js — pure, no React, no network: checkGuardrails(text) with
> priority self-harm > emergency > minor > medication > diagnosis > off-topic, simple negation handling, and redactPII
> (CURP, phone, email); a reducer reduceChat(state, event) for the guided flow Q1 who → Q2 age → Q3 red flags →
> vitals → human checkpoint (Confirm/Edit) → result using calculateTriage from lib/triage.js → free Q&A; parseVitals and
> validateVitals with safe ranges; matchIntent over ≥ 10 curated, human-written answers with an honest fallback;
> reviewReasons and buildSummary (redacted). (2) Write supabase_chat.sql: chat_sessions and chat_feedback with RLS
> insert/select for anon and grants. (3) Write 3 node:test tests (guardrails, flow + checkpoint, response logic +
> review flags). (4) Build /chat: ChatAssistant with bubbles, choice buttons, inline vitals form, text box, Talk to a
> person, Restart, 👍/👎 on every answer saved to chat_feedback, and "Finish & save test summary" (tester code, 1–5
> rating, comment) inserting into chat_sessions and showing the returned row id. (5) Add a ChatInsights side panel:
> widget, human review queue, recent summaries. English everywhere. Never show "saved" unless Supabase returned the row.
