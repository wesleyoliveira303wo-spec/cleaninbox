import OpenAI from "openai";
import type { ParsedEmail, EmailClassification, AnalysisResult } from "./types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

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
Classifique os e-mails abaixo nas categorias: "Importante", "Promoção" ou "Lixo".
Retorne SOMENTE JSON válido:

{
  "classifications": [
    {
      "index": 1,
      "category": "Importante",
      "reason": "Fatura bancária"
    }
  ],
  "summary": {
    "important": 0,
    "promotion": 0,
    "junk": 0
  }
}

E-mails:
${JSON.stringify(formatted, null, 2)}
  `;

  try {
    console.log("🔵 Chamando OpenAI Responses API…");

    const result = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      response_format: { type: "json_object" }
    });

    // *** Extração correta do JSON ***
    const raw = result.output_text;
    if (!raw) {
      console.error("Resposta bruta:", JSON.stringify(result, null, 2));
      throw new Error("A API retornou resposta vazia.");
    }

    const ai = JSON.parse(raw);

    const classifications: EmailClassification[] = ai.classifications.map((c: any) => ({
      id: emails[c.index - 1]?.id || String(c.index),
      category: c.category,
      reason: c.reason,
      confidence: 1.0
    }));

    const summary = {
      important: classifications.filter(c => c.category === "Importante").length,
      promotion: classifications.filter(c => c.category === "Promoção").length,
      junk: classifications.filter(c => c.category === "Lixo").length
    };

    return { classifications, summary };

  } catch (err: any) {
    console.error("❌ ERRO OpenAI:", err?.response?.data || err);
    throw new Error("Erro ao chamar OpenAI API");
  }
}
