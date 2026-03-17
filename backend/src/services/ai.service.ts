import { openai } from "../config/openai";
import { BOOKLEAF_KB } from "../constants/bookleafKnowledgeBase";

type TicketCategory =
  | "Royalty & Payments"
  | "ISBN & Metadata Issues"
  | "Printing & Quality"
  | "Distribution & Availability"
  | "Book Status & Production Updates"
  | "General Inquiry";

type TicketPriority = "Critical" | "High" | "Medium" | "Low";

function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("No JSON found in AI response");
  }
  return JSON.parse(match[0]);
}

async function createResponse(input: string, instructions: string) {
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    instructions,
    input,
  });

  return response.output_text;
}

export async function classifyTicketAI(ticket: {
  subject: string;
  description: string;
}): Promise<{ category: TicketCategory; reason: string }> {
  try {
    const instructions = `
You are classifying BookLeaf author support tickets.

Valid categories:
1. Royalty & Payments
2. ISBN & Metadata Issues
3. Printing & Quality
4. Distribution & Availability
5. Book Status & Production Updates
6. General Inquiry

Return valid JSON only:
{
  "category": "...",
  "reason": "..."
}
`;

    const input = `
Subject: ${ticket.subject}
Description: ${ticket.description}
`;

    const output = await createResponse(input, instructions);
    return extractJson(output);
  } catch (error) {
    return {
      category: "General Inquiry",
      reason: "Fallback used because AI classification failed.",
    };
  }
}

export async function scorePriorityAI(ticket: {
  subject: string;
  description: string;
  category?: string;
}): Promise<{ priority: TicketPriority; reason: string }> {
  try {
    const instructions = `
You are assigning support ticket priority for BookLeaf.

Priority levels:
- Critical: severe issue, urgent financial/payment failure, major metadata error, serious production issue affecting publishing.
- High: important issue needing fast action.
- Medium: normal support issue.
- Low: informational or minor request.

Return valid JSON only:
{
  "priority": "...",
  "reason": "..."
}
`;

    const input = `
Subject: ${ticket.subject}
Description: ${ticket.description}
Category: ${ticket.category || "Unknown"}
`;

    const output = await createResponse(input, instructions);
    return extractJson(output);
  } catch (error) {
    return {
      priority: "Medium",
      reason: "Fallback used because AI priority scoring failed.",
    };
  }
}

export async function draftResponseAI(data: {
  subject: string;
  description: string;
  category: string;
  priority: string;
  authorName?: string;
  bookTitle?: string;
  bookStatus?: string;
  royaltyPending?: number;
  lastRoyaltyPayoutDate?: string | null;
}): Promise<{ draft: string }> {
  try {
    const instructions = `
You are a BookLeaf Publishing support representative.

Use this BookLeaf knowledge base:
${BOOKLEAF_KB.companyOverview}
${BOOKLEAF_KB.royaltyPolicy}
${BOOKLEAF_KB.isbnPolicy}
${BOOKLEAF_KB.printingQuality}
${BOOKLEAF_KB.distributionAvailability}
${BOOKLEAF_KB.productionStages}
${BOOKLEAF_KB.communicationTone}

Write a response that:
- sounds empathetic and professional,
- acknowledges the author concern,
- uses the available facts,
- does not invent missing details,
- includes a clear next step,
- avoids generic AI phrasing.

Return valid JSON only:
{
  "draft": "..."
}
`;
    const input = `
Author name: ${data.authorName || "Author"}
Book title: ${data.bookTitle || "General / Account Level"}
Book status: ${data.bookStatus || "Not provided"}
Ticket category: ${data.category}
Ticket priority: ${data.priority}
Subject: ${data.subject}
Description: ${data.description}
Royalty pending: ${data.royaltyPending ?? "Not provided"}
Last royalty payout date: ${data.lastRoyaltyPayoutDate ?? "Not provided"}
`;

    const output = await createResponse(input, instructions);
    return extractJson(output);
  } catch (error) {
    return {
      draft:
        "Thank you for reaching out. We understand your concern and our team will review this ticket and get back to you with the next steps shortly.",
    };
  }
}
