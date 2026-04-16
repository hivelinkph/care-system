import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/utils/supabase/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Max characters to embed in one call (~10k tokens)
const MAX_CHARS = 30000;

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "File is required." },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let content = "";

        if (file.type === "application/pdf") {
            // Use Gemini multimodal to extract text from PDF
            const base64Pdf = buffer.toString("base64");

            const extraction = await ai.models.generateContent({
                model: "gemini-3.1-flash-lite-preview",
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                inlineData: {
                                    mimeType: "application/pdf",
                                    data: base64Pdf,
                                },
                            },
                            {
                                text: "Extract all the text content from this document. Return only the raw extracted text, no commentary or formatting.",
                            },
                        ],
                    },
                ],
            });

            content = extraction.text ?? "";
        } else {
            content = buffer.toString("utf-8");
        }

        content = content.trim();

        if (!content) {
            return NextResponse.json(
                { error: "Could not extract text from the file." },
                { status: 400 }
            );
        }

        // Trim to API limit
        if (content.length > MAX_CHARS) {
            content = content.slice(0, MAX_CHARS);
        }

        // Generate embedding using Google GenAI
        const response = await ai.models.embedContent({
            model: "gemini-embedding-001",
            contents: content,
        });

        const embeddingValues = response.embeddings?.[0]?.values;

        if (!embeddingValues) {
            throw new Error("Failed to generate embedding.");
        }

        // Store in Supabase
        const supabase = await createClient();
        const { error } = await supabase.from("knowledge_base").insert({
            content: content,
            embedding: embeddingValues,
        });

        if (error) {
            console.error("Supabase insert error:", error);
            throw error;
        }

        return NextResponse.json({ success: true, message: "File embedded and saved to knowledge base." });
    } catch (error: any) {
        console.error("Embedding Error: ", error);
        return NextResponse.json(
            { error: error?.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
