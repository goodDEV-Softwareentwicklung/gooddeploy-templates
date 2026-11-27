"use client";

import { useState } from "react";

// Formular mit Fehler- und Hinweiszeile. onSubmit liefert einen Fehlertext,
// einen Hinweis oder nichts (dann hat es selbst weitergeleitet).
export function AuthForm({
  onSubmit,
  submit,
  children,
}: {
  onSubmit: (form: FormData) => Promise<{ error?: string; info?: string } | void>;
  submit: string;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<{ error?: string; info?: string }>({});
  const [pending, setPending] = useState(false);
  return (
    <form
      className="card stack"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setState({});
        try {
          setState((await onSubmit(new FormData(e.currentTarget))) ?? {});
        } finally {
          setPending(false);
        }
      }}
    >
      {children}
      {state.error && (
        <p className="error" role="alert">
          {state.error}
        </p>
      )}
      {state.info && <p className="note">{state.info}</p>}
      <button type="submit" disabled={pending}>
        {submit}
      </button>
    </form>
  );
}
