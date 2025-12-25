import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function rewriteArticle(original, ref1, ref2) {
  const prompt = `
You are a professional technical content writer.

Original Article:
${original}

Reference Article 1:
${ref1}

Reference Article 2:
${ref2}

Task:
- Improve structure and formatting
- Add clear headings
- Enhance clarity and flow
- Do NOT copy text
- Maintain original topic

Return a rewritten article in markdown.
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7
  });

  return res.choices[0].message.content;
}
