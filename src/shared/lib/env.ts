function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }

  return fallback;
}

const rawBffBaseUrl = process.env.NEXT_PUBLIC_BFF_BASE_URL ?? "http://localhost:8070";

export const env = {
  bffBaseUrl: rawBffBaseUrl.replace(/\/$/, ""),
  topicsPageSize: parsePositiveInteger(process.env.NEXT_PUBLIC_TOPICS_PAGE_SIZE, 20),
  inboxPageSize: parsePositiveInteger(process.env.NEXT_PUBLIC_INBOX_PAGE_SIZE, 20)
};
