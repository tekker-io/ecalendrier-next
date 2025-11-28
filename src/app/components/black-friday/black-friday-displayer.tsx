"use client";

export function BlackFridayDisplayer({ premium }: { premium: boolean }) {
  if (
    !premium &&
    typeof document !== "undefined" &&
    !document.body.classList.contains("display-black-friday")
  ) {
    document.body.classList.add("display-black-friday");
  }
  return null;
}
