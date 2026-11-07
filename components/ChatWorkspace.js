"use client";

import { useState } from "react";
import ChatAssistant from "@/components/ChatAssistant";
import ChatInsights from "@/components/ChatInsights";

// Chat on the left, founder insights on the right (below on mobile).
// Saving a rating or a summary bumps refreshKey so the widget reloads from Supabase.
export default function ChatWorkspace() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <ChatAssistant onSaved={() => setRefreshKey((k) => k + 1)} />
      <ChatInsights refreshKey={refreshKey} />
    </div>
  );
}
