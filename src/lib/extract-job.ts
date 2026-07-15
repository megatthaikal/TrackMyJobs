import * as cheerio from "cheerio";
import Anthropic from "@anthropic-ai/sdk";

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

const EXTRACT_TOOL: Anthropic.Tool = {
  name: "extract_job",
  description:
    "Record structured job posting details extracted from a job listing page's text.",
  input_schema: {
    type: "object",
    properties: {
      company: { type: "string", description: "The hiring company's name." },
      role: { type: "string", description: "The job title / role." },
      location: {
        type: "string",
        description:
          "The job location as stated, e.g. 'San Francisco, CA' or 'Remote'.",
      },
      workType: {
        type: "string",
        enum: ["REMOTE", "HYBRID", "ONSITE"],
        description:
          "The work arrangement, only if clearly stated or strongly implied.",
      },
      datePosted: {
        type: "string",
        description:
          "The date the job was posted, formatted YYYY-MM-DD, only if stated.",
      },
      salary: {
        type: "string",
        description: "The salary or compensation range exactly as stated.",
      },
    },
    required: ["company", "role"],
  },
};

export async function extractJobFromUrl(url: string): Promise<ExtractedJob> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "Auto-extract isn't set up yet — add ANTHROPIC_API_KEY to your .env file."
    );
  }

  const pageText = await fetchJobPageText(url);

  const client = new Anthropic();
  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    tools: [EXTRACT_TOOL],
    tool_choice: { type: "tool", name: "extract_job" },
    messages: [
      {
        role: "user",
        content: `Extract the job posting details from the following page text. Only include fields you can confidently determine from the text; omit anything unclear rather than guessing.\n\n${pageText}`,
      },
    ],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) {
    throw new Error("Extraction didn't return any structured data.");
  }

  return toolUse.input as ExtractedJob;
}
