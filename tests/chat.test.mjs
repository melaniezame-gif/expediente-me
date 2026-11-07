// Week 5 chat assistant tests. Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildFeedbackRow,
  buildSessionSummary,
  checkGuardrails,
  initialChatState,
  matchIntent,
  parseVitals,
  redactPII,
  reduceChat,
  validateVitals,
} from "../lib/chatbot.js";
import { calculateTriage } from "../lib/triage.js";

// Play a list of events through the reducer and collect every message.
function play(events) {
  let state = initialChatState();
  const messages = [];
  for (const e of events) {
    const r = reduceChat(state, e);
    state = r.state;
    messages.push(...r.messages);
  }
  return { state, messages, last: messages[messages.length - 1], bots: messages.filter((m) => m.role === "bot") };
}
const choice = (value, label = value) => ({ type: "choice", value, label });
const text = (t) => ({ type: "text", text: t });
const INTAKE = [{ type: "start" }, choice("other"), choice("65+"), choice("none")];

test("Chat test C1 — guardrails fire with the right priority, handle negation and redact personal data", () => {
  assert.equal(checkGuardrails("I want to kill myself").id, "self_harm");
  assert.equal(checkGuardrails("me quiero morir").id, "self_harm");
  assert.equal(checkGuardrails("my dad has chest pain").id, "emergency");
  assert.equal(checkGuardrails("my dad has chest pain").detail, "chest_pain");
  assert.equal(checkGuardrails("tiene dolor de pecho").id, "emergency");
  assert.equal(checkGuardrails("she can't breathe").detail, "breathing");
  // self-harm beats emergency, emergency beats medication
  assert.equal(checkGuardrails("chest pain and I want to die").id, "self_harm");
  assert.equal(checkGuardrails("chest pain, can I take aspirin?").id, "emergency");
  // negation in the same clause does not fire — but a new clause does
  assert.equal(checkGuardrails("no chest pain, just a fever").id, null);
  assert.equal(checkGuardrails("he doesn't have trouble breathing").id, null);
  assert.equal(checkGuardrails("no fever but chest pain").id, "emergency");

  assert.equal(checkGuardrails("my son is 10 years old").id, "minor");
  assert.equal(checkGuardrails("can I give him ibuprofen?").id, "medication");
  assert.equal(checkGuardrails("how many mg of paracetamol").id, "medication");
  assert.equal(checkGuardrails("do I have covid?").id, "diagnosis");
  assert.equal(checkGuardrails("do I have a fever with 37.8?").id, null);
  assert.equal(checkGuardrails("what does Review mean?").id, null);

  const r = redactPII("my CURP is GODE561231HDFRRN09, call 55 1234 5678 or ana@mail.com");
  assert.ok(!r.text.includes("GODE561231HDFRRN09"));
  assert.ok(!r.text.includes("5678"));
  assert.ok(!r.text.includes("ana@mail.com"));
  assert.deepEqual(r.found.sort(), ["CURP", "email", "phone"]);
  assert.equal(redactPII("37.5 105 93 5").found.length, 0); // readings are not phone numbers

  // in the conversation: off-topic is only decided after no answer matches
  const off = play([...INTAKE, { type: "vitals", values: { temperature: 37, heartRate: 80, oxygenSaturation: 98, painLevel: 1 } }, choice("confirm"), text("what's the weather tomorrow?")]);
  assert.equal(off.last.intent, "guardrail_off_topic");
  assert.ok(off.state.guardrails.includes("off_topic"));

  // a message that is only personal data gets the privacy note, not an extra off-topic reply
  const onlyPII = play([...INTAKE, text("37.0 80 98 1"), choice("confirm"), text("my CURP is GODE561231HDFRRN09")]);
  assert.equal(onlyPII.last.intent, "guardrail_pii");
  assert.equal(onlyPII.state.guardrails.includes("off_topic"), false);
});

test("Chat test C2 — intake flow: 3 questions, vitals validation, human checkpoint before any result", () => {
  const start = play([{ type: "start" }]);
  assert.equal(start.state.step, "q1");
  assert.match(start.last.text, /Question 1 of 3/);

  // typed answers are understood too
  const typed = play([{ type: "start" }, text("my dad"), text("he is 72"), text("none")]);
  assert.equal(typed.state.intake.whoFor, "other");
  assert.equal(typed.state.intake.ageGroup, "65+");
  assert.equal(typed.state.step, "vitals");
  assert.equal(typed.last.form, "vitals");

  // impossible readings are rejected with the valid range, and the step does not advance
  const bad = play([...INTAKE, { type: "vitals", values: { temperature: 50, heartRate: 80, oxygenSaturation: 98, painLevel: 1 } }]);
  assert.equal(bad.state.step, "vitals");
  assert.match(bad.last.text, /between 30 and 45/);
  assert.equal(validateVitals({ temperature: 37, heartRate: 80, oxygenSaturation: 101, painLevel: 2 }).ok, false);
  assert.equal(validateVitals({ temperature: "", heartRate: 80, oxygenSaturation: 98, painLevel: 2 }).ok, false);
  assert.equal(validateVitals({ temperature: 37, heartRate: 80, oxygenSaturation: 98, painLevel: 2.5 }).ok, false);

  // checkpoint comes BEFORE the result; no result exists until Confirm
  const cp = play([...INTAKE, text("38.5 110 93 6")]);
  assert.equal(cp.state.step, "checkpoint");
  assert.equal(cp.last.kind, "checkpoint");
  assert.equal(cp.state.result, null);
  assert.equal(cp.bots.some((m) => m.kind === "result"), false);

  const confirmed = play([...INTAKE, text("38.5 110 93 6"), choice("confirm")]);
  assert.ok(confirmed.bots.some((m) => m.kind === "result"));
  assert.equal(confirmed.state.step, "open");

  const edited = play([...INTAKE, text("38.5 110 93 6"), choice("edit")]);
  assert.equal(edited.state.step, "q1");
  assert.equal(edited.state.vitals, null);
  assert.equal(edited.state.intake.whoFor, null);

  // a red flag stops the intake: emergency card, no readings asked, flagged for review
  const emergency = play([{ type: "start" }, choice("self"), choice("18-64"), choice("chest_pain")]);
  assert.equal(emergency.last.kind, "emergency");
  assert.match(emergency.last.text, /911/);
  assert.equal(emergency.bots.some((m) => m.form === "vitals"), false);
  assert.ok(emergency.state.reasons.includes("emergency"));

  // a blocked question or "Talk to a person" during the intake re-asks the current question
  const medMid = play([{ type: "start" }, choice("self"), text("can I take ibuprofen?")]);
  assert.equal(medMid.state.step, "q2");
  assert.match(medMid.last.text, /Question 2 of 3/);
  const humanMid = play([{ type: "start" }, choice("self"), choice("18-64"), { type: "human" }]);
  assert.equal(humanMid.bots.at(-2).intent, "human_handoff");
  assert.match(humanMid.last.text, /Question 3 of 3/);

  // Found by external tester U2: personal data or a question during the intake
  const phoneQ1 = play([{ type: "start" }, text("My phone number is 55 1234 5678")]);
  assert.equal(phoneQ1.bots.some((m) => /didn't catch/.test(m.text)), false);
  assert.equal(phoneQ1.bots.at(-2).intent, "guardrail_pii");
  assert.match(phoneQ1.last.text, /Question 1 of 3/);
  const nameQ1 = play([{ type: "start" }, text("What’s your name")]);
  assert.ok(nameQ1.bots.some((m) => m.intent === "about"));
  assert.match(nameQ1.last.text, /Question 1 of 3/);
  assert.equal(nameQ1.state.step, "q1");

  // under 18 is routed away
  const minor = play([{ type: "start" }, choice("other"), choice("under18")]);
  assert.equal(minor.last.intent, "guardrail_minor");
  assert.ok(minor.state.reasons.includes("minor"));
});

test("Chat test C3 — response logic matches /core, answers come from curated intents, review flags and saved rows", () => {
  // the 3 Week 1 cases give the same score and status as /core
  const cases = [
    ["37.0 80 98 1", 0, "Stable"],
    ["37.5 105 93 5", 4, "Review"],
    ["39.0 130 88 9", 8, "Attention"],
  ];
  for (const [input, score, status] of cases) {
    const v = parseVitals(input);
    assert.deepEqual(calculateTriage(v), calculateTriage(v));
    const r = play([...INTAKE, text(input), choice("confirm")]);
    assert.equal(r.state.result.score, score, input);
    assert.equal(r.state.result.status, status, input);
    assert.equal(r.state.result.score, calculateTriage(v).score);
  }
  assert.deepEqual(parseVitals("38,5 110 93 6"), { temperature: 38.5, heartRate: 110, oxygenSaturation: 93, painLevel: 6 });
  assert.equal(parseVitals("38 110"), null);

  // curated answers
  assert.equal(matchIntent("What does my result mean?").id, "result_meaning");
  assert.equal(matchIntent("How do I measure oxygen correctly?").id, "oxygen");
  assert.equal(matchIntent("What are normal ranges?").id, "normal_ranges");
  assert.equal(matchIntent("Where can I get care? hospital?").id, "where_care");
  assert.equal(matchIntent("how is the score calculated").id, "score_logic");
  assert.equal(matchIntent("are you a doctor?").id, "about");
  assert.equal(matchIntent("tell me a joke"), null);

  // review flags: Attention result, thumbs down, asking for a person
  const attention = play([...INTAKE, text("39.0 130 88 9"), choice("confirm")]);
  assert.ok(attention.state.reasons.includes("attention_result"));
  const stable = play([...INTAKE, text("37.0 80 98 1"), choice("confirm")]);
  assert.deepEqual(stable.state.reasons, []);
  const rated = play([...INTAKE, text("37.0 80 98 1"), choice("confirm"), { type: "rate", rating: -1 }, { type: "human" }]);
  assert.deepEqual(rated.state.reasons, ["negative_feedback", "user_requested_human"]);

  // saved rows never contain personal data, and the rating is validated
  const pii = play([...INTAKE, text("my number is 55 1234 5678"), text("37.0 80 98 1"), choice("confirm")]);
  assert.ok(pii.state.guardrails.includes("pii"));
  const row = buildSessionSummary({
    sessionId: "s1", state: pii.state, messages: pii.messages, testerLabel: "U1", rating: 4, comment: "mail me at a@b.com",
  });
  assert.equal(JSON.stringify(row).includes("5678"), false);
  assert.equal(row.tester_comment.includes("a@b.com"), false);
  assert.equal(row.triage_status, "Stable");
  assert.equal(row.needs_review, false);
  assert.equal(row.message_count, pii.messages.length);
  assert.throws(() => buildSessionSummary({ sessionId: "s1", state: pii.state, messages: [], rating: 0 }), /1 to 5/);

  const result = attention.bots.find((m) => m.kind === "result");
  const fb = buildFeedbackRow({ sessionId: "s1", message: result, rating: 1 });
  assert.equal(fb.intent, "triage_result");
  assert.equal(fb.message_id, result.id);
  assert.throws(() => buildFeedbackRow({ sessionId: "s1", message: result, rating: 5 }));
});
