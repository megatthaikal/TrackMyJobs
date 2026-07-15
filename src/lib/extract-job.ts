import * as cheerio from "cheerio";
import { GoogleGenAI, Type } from "@google/genai";

export type ExtractedJob = {
  company?: string;
  role?: string;
  location?: string;
  workType?: "REMOTE" | "HYBRID" | "ONSITE";
  datePosted?: string;
  salary?: string;
};

// Below this many characters, a page is almost certainly a client-rendered
// SPA shell rather than real job content — worth trying headless rendering.
const MIN_USABLE_TEXT_LENGTH = 200;

function extractReadableText(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg, nav, footer, header, iframe").remove();
  return $("body").text().replace(/\s+/g, " ").trim();
}

async function fetchJobPageHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    throw new Error(`Couldn't fetch that page (status ${res.status}).`);
  }
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    throw new Error("That URL didn't return a webpage.");
  }
  return res.text();
}

async function renderWithHeadlessBrowser(url: string): Promise<string> {
  const chromium = (await import("@sparticuz/chromium")).default;
  const puppeteer = await import("puppeteer-core");

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    );
    // "networkidle2" waits for network activity to settle, which many sites
    // (analytics beacons, polling, websockets) never fully do — that made
    // this reliably eat its whole timeout. "domcontentloaded" fires as soon
    // as the initial script has run, then a short fixed wait lets client-side
    // rendering (React/Vue) finish painting the actual content.
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await new Promise((resolve) => setTimeout(resolve, 2500));
    return await page.content();
  } finally {
    await browser.close();
  }
}

async function fetchJobPageText(url: string): Promise<string> {
  const html = await fetchJobPageHtml(url);
  let text = extractReadableText(html);

  if (text.length < MIN_USABLE_TEXT_LENGTH) {
    // Likely a client-rendered page (React/Vue SPA) with no real content in
    // the initial HTML. Try rendering it with a real browser instead. This
    // only works in environments with a compatible headless Chromium
    // (i.e. production on Vercel) — fails silently in local dev on
    // Windows/macOS, where we just fall back to whatever little text we have.
    try {
      const renderedHtml = await renderWithHeadlessBrowser(url);
      const renderedText = extractReadableText(renderedHtml);
      if (renderedText.length > text.length) {
        text = renderedText;
      }
    } catch (err) {
      console.warn("Headless render fallback unavailable:", err);
    }
  }

  if (!text) {
    throw new Error("Couldn't find any readable content on that page.");
  }
  return text.slice(0, 15000);
}

const EXTRACT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    company: { type: Type.STRING, description: "The hiring company's name." },
    role: { type: Type.STRING, description: "The job title / role." },
    location: {
      type: Type.STRING,
      description:
        "The job location as stated, e.g. 'San Francisco, CA' or 'Remote'.",
    },
    workType: {
      type: Type.STRING,
      enum: ["REMOTE", "HYBRID", "ONSITE"],
      description:
        "The work arrangement, only if clearly stated or strongly implied.",
    },
    datePosted: {
      type: Type.STRING,
      description:
        "The date the job was posted, formatted YYYY-MM-DD, only if stated.",
    },
    salary: {
      type: Type.STRING,
      description: "The salary or compensation range exactly as stated.",
    },
  },
  required: ["company", "role"],
};

export async function extractJobFromText(
  jobText: string
): Promise<ExtractedJob> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "Auto-extract isn't set up yet — add GEMINI_API_KEY to your .env file."
    );
  }

  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await client.models.generateContent({
    model: "gemini-flash-latest",
    contents: `Extract the job posting details from the following text. Only include fields you can confidently determine from the text; omit anything unclear rather than guessing.\n\n${jobText.slice(0, 15000)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: EXTRACT_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Extraction didn't return any structured data.");
  }

  return JSON.parse(text) as ExtractedJob;
}

export async function extractJobFromUrl(url: string): Promise<ExtractedJob> {
  const pageText = await fetchJobPageText(url);
  return extractJobFromText(pageText);
}
