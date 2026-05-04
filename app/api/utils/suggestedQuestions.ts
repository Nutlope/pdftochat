import { ChatTogetherAI } from '@langchain/community/chat_models/togetherai';
import type { Document } from '@langchain/core/documents';

const PROMPT = `You are helping a reader explore a PDF they just uploaded.
Read the excerpts below and propose three short, specific questions a careful
reader would ask. Questions should be concrete and answerable from the text —
not "What is this about?" Keep each under 12 words.

Return ONLY a JSON array of three strings. No prose, no commentary.

Excerpts:
{sample}`;

/**
 * Generate three suggested questions for a freshly-ingested document. Always
 * resolves — never throws — because the calling ingest route must succeed
 * even when the suggestion model is rate-limited or absent.
 */
export async function generateSuggestedQuestions(
  splitDocs: Document[],
): Promise<string[]> {
  if (!process.env.TOGETHER_AI_API_KEY) return [];

  try {
    const sample = splitDocs
      .slice(0, 4)
      .map((d) => d.pageContent.slice(0, 500))
      .join('\n\n---\n\n');

    const model = new ChatTogetherAI({
      model: 'Qwen/Qwen3.5-9B',
      temperature: 0.3,
      modelKwargs: {
        chat_template_kwargs: { enable_thinking: false },
      },
    });

    const raw = await model.invoke(PROMPT.replace('{sample}', sample));
    const text =
      typeof raw.content === 'string'
        ? raw.content
        : Array.isArray(raw.content)
        ? raw.content.map((c: any) => c.text ?? '').join('')
        : '';

    return safeParseJsonArray(text);
  } catch (err) {
    console.warn('[suggestedQuestions] generation failed:', err);
    return [];
  }
}

function safeParseJsonArray(text: string): string[] {
  // The model may wrap the array in code fences; pull the first array literal.
  const match = text.match(/\[[\s\S]*?\]/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((q): q is string => typeof q === 'string' && q.length > 0)
      .slice(0, 3);
  } catch {
    return [];
  }
}
