"use client";

export function ConfirmSubmit({ label, message }: { label: string; message: string }) {
  return (
    <button
      type="submit"
      className="text-sm text-[var(--warn)]"
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {label}
    </button>
  );
}
