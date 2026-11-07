import ChatWorkspace from "@/components/ChatWorkspace";

export const metadata = {
  title: "Chat — Vitalis Guide",
  description: "A guided assistant that asks 3 questions and 4 readings, then tells you how urgent things look. Not a doctor.",
};

export default function ChatPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Week 5 · Public chatbot / guided assistant</p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900">Vitalis Guide</h1>
      <p className="mt-2 max-w-3xl text-sm text-gray-600">
        A guided conversation for patients and caregivers: 3 quick questions, an emergency check before any numbers, your 4
        readings, and a clear next step. Every answer is written and reviewed by a person — no AI-generated advice. It can't
        diagnose or recommend medicines. In an emergency, call <strong>911</strong>.
      </p>
      <ChatWorkspace />
      <p className="mt-8 text-xs text-gray-500">
        Educational project — not a medical device and not a diagnosis. Conversations are saved anonymously only when you
        press “Save test summary”; CURP, phone numbers and emails are removed first.
      </p>
    </div>
  );
}
