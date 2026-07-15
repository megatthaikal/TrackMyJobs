"use server";

import { extractJobFromUrl, type ExtractedJob } from "@/lib/extract-job";

export type ExtractResult =
  | { ok: true; data: ExtractedJob }
  | { ok: false; error: string };

export async function extractJob(url: string): Promise<ExtractResult> {
  try {
    new URL(url);
  } catch {
    return { ok: false, error: "Enter a valid URL." };
  }

  try {
    const data = await extractJobFromUrl(url);
    return { ok: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed.";
    return { ok: false, error: message };
  }
}
