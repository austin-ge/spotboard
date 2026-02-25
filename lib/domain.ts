import { prisma } from "@/lib/db";

// Common freemail domains to exclude from DZ domain matching
const FREEMAIL_DOMAINS = new Set([
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com",
  "icloud.com", "mail.com", "protonmail.com", "proton.me", "zoho.com",
  "yandex.com", "gmx.com", "fastmail.com", "tutanota.com", "hey.com",
  "live.com", "msn.com", "me.com", "mac.com", "pm.me",
]);

export function extractEmailDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase() ?? "";
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
