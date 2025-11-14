import OpenAI from "openai";
import type { ParsedEmail, EmailClassification, AnalysisResult } from "./types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Analisa e-mails usando a API nova "responses.create()"
 * — Compatível com chaves sk-proj-*
 */
export async function analyzeEmails(emails: ParsedEmail[]): Promise<AnalysisResult> {
  if (!emails || emails.length === 0) {
    return {
      classifications: [],
      summary: { important: 0, promotion: 0, junk: 0 },
    };
  }

  const formatted = emails.map((email, index) => ({
    index: index + 1,
    from: email.from,
    subject: email.subject,
    snippet: email.snippet,
  }));

  const prompt = `
Você é um modelo especialista em classificar e-mails brasileiros.

Classifique cada e-mail como:
- "Importante"
- "Promoção"
- "Lixo"

Retorne APENAS JSON assim:

{
  "classifications": [
    { "index": 1, "category": "Importante", "reason": "Fatura bancária" }
  ],
  "summary": { "important": 0, "promotion": 0, "junk": 0 }
}

E-mails:
${JSON.stringify(formatted, null, 2)}
`;

  try {
    console.log("🔵 Chamando OpenAI Responses API…");

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      response_format: { type: "json_object" },
    });

    // 🔥 EXTRAÇÃO CORRETA (Responses API)
    const text = response.output_text;

    if (!text) {
      console.error("ERRO RAW:", JSON.stringify(response, null, 2));
      throw new Error("Resposta inválida da OpenAI: sem texto.");
    }

    const ai = JSON.parse(text);

    const classifications: EmailClassification[] = ai.classifications.map(
      (c: any) => ({
        id: emails[c.index - 1]?.id || String(c.index),
        category: c.category,
        reason: c.reason || "Sem motivo",
        confidence: 1.0,
      })
    );

    const summary = {
      important: classifications.filter((c) => c.category === "Importante").length,
      promotion: classifications.filter((c) => c.category === "Promoção").length,
      junk: classifications.filter((c) => c.category === "Lixo").length,
    };

    return { classifications, summary };
  } catch (error: any) {
    console.error("❌ OPENAI ERROR:", error);

    if (error?.response) {
      console.error("📌 STATUS:", error.response.status);
      console.error("📌 DATA:", error.response.data);
    }

    throw new Error(
      "OPENAI_ERROR: " +
        (error?.response?.data?.error?.message ||
         error?.message ||
         "Erro desconhecido")
    );
  }
}
