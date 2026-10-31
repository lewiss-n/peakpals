"use client";

import { useState } from "react";
import { Icon } from "../Icon";

export function DeleteButton({ action, id, label, confirmText, extra }: { action: (fd: FormData) => Promise<void>; id: string; label: string; confirmText: string; extra?: Record<string, string> }) {
  const [armed, setArmed] = useState(false);
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      {extra && Object.entries(extra).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {armed ? (
        <>
          <span className="text-sm font-semibold text-brown">{confirmText}</span>
          <button className="btn !min-h-10 !border-brown !bg-brown !py-2 !text-white">Yes, delete</button>
          <button type="button" className="btn btn-ghost !min-h-10 !py-2" onClick={() => setArmed(false)}>Cancel</button>
        </>
      ) : (
        <button type="button" className="btn btn-ghost !min-h-10 !py-2 text-brown" onClick={() => setArmed(true)}><Icon name="trash" className="size-4" />{label}</button>
      )}
    </form>
  );
}
