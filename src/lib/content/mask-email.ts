// Shows enough of an address for the owner to recognize it on a public,
// shareable page without exposing it in full.
export function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at < 1) {
    return email;
  }

  const local = email.slice(0, at);
  const visible = local.length > 2 ? local.slice(0, 2) : local.slice(0, 1);
  const hidden = Math.max(local.length - visible.length, 1);
  return `${visible}${"*".repeat(hidden)}${email.slice(at)}`;
}
