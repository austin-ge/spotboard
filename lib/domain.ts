import { prisma } from "@/lib/db";

// Common freemail domains to exclude from DZ domain matching
const FREEMAIL_DOMAINS = new Set([
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com",
  "icloud.com", "mail.com", "protonmail.com", "proton.me", "zoho.com",
  "yandex.com", "gmx.com", "fastmail.com", "tutanota.com", "hey.com",
  "live.com", "msn.com", "me.com", "mac.com", "pm.me",
]);

export function extractEmailDomain(email: string): string {
  // Use the LAST "@" so "a@good.com@evil.tld" resolves to "evil.tld".
  const at = email.lastIndexOf("@");
  return at === -1 ? "" : email.slice(at + 1).trim().toLowerCase();
}

export function isFreemailDomain(domain: string): boolean {
  return FREEMAIL_DOMAINS.has(domain);
}

export async function findDropzonesByEmailDomain(email: string) {
  const domain = extractEmailDomain(email);
  if (!domain || isFreemailDomain(domain)) return [];

  return prisma.dropzone.findMany({
    where: { verifiedDomains: { has: domain } },
    select: { id: true, slug: true, name: true, ownerId: true },
  });
}
