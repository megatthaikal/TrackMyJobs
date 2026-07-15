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

async function fetchJobPageText(url: string): Promise<string> {
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
  const html = await res.text();
  const $ = cheerio.load(html);
  $("script, style, noscript, svg, nav, footer, header, iframe").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim();
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

export async function extractJobFromUrl(url: string): Promise<ExtractedJob> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "Auto-extract isn't set up yet — add GEMINI_API_KEY to your .env file."
    );
  }

  const pageText = await fetchJobPageText(url);

  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Extract the job posting details from the following page text. Only include fields you can confidently determine from the text; omit anything unclear rather than guessing.\n\n${pageText}`,
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
