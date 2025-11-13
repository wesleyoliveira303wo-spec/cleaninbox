import OpenAI from "openai";
import type { ParsedEmail } from "./types";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("❌ OPENAI_API_KEY não configurada!");
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeEmails(emails: ParsedEmail[]) {
  try {
    const emailList = emails
      .map(
        (email, i) =>
          `${i + 1}. De: ${email.from}\nAssunto: ${
            email.subject
          }\nPrévia: ${email.snippet}`
      )
      .join("\n\n");

    const prompt = `
Você é um classificador de e-mails brasileiro.
Classifique cada item em:
- Importante
- Promoção
- Lixo

Retorne SOMENTE JSON no formato:

{
  "classifications": [
    { "index": 1, "category": "Importante", "reason": "motivo" }
  ],
  "summary": {
    "important": 0,
    "promotion": 0,
    "junk": 0
  }
}

E-mails:
${emailList}
`;

    // --- NOVA API DA OPENAI ---
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      response_format: { type: "json_object" },
    });

    const text =
      response.output?.[0]?.content?.[0]?.text ||
      response.output_text ||
      "";

    if (!text) {
      throw new Error("Resposta da IA vazia ou inválida.");
    }

    const parsed = JSON.parse(text);

    return parsed;
  } catch (err: any) {
    console.error("❌ Erro dentro de analyzeEmails():", err);
    throw new Error(err?.message || "Erro desconhecido na IA");
  }
}
