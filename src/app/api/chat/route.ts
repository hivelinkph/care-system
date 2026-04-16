import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/utils/supabase/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// System prompt giving the website context.
const SYSTEM_PROMPT = `
You are a helpful and compassionate AI assistant for an Assisted Living service platform called "Care System by Kyte" (or AssistedLiving). 
Your goal is to answer questions from users or facility managers who might want to enroll in the service. 

BASE WEBSITE KNOWLEDGE:
- Care System by Kyte is a care management platform designed for modern assisted living.
- Features include "Secure Checklists" (Keep daily routines organized), "Real-time Coverage" (Instant sync across devices), and "Tenant Isolation" (Enterprise-grade RLS data privacy).
- Trusted by Sarah Jenkins (Facility Director at Sunrise Care), Dr. Michael Chen (CMO), and Elena Rodriguez (Head Nurse).
- The onboarding is seamless, ensures nothing falls through the cracks, and gives families peace of mind.

You can also use the additional internal knowledge base below to answer questions:

CONTEXT:
`;

export async function POST(request: Request) {
    try {
        const { message } = await request.json();

        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { error: "Message is required." },
                { status: 400 }
            );
        }

        // Generate embedding for the user message
        const embedResponse = await ai.models.embedContent({
            model: "gemini-embedding-001",
            contents: message,
        });

        const queryEmbedding = embedResponse.embeddings?.[0]?.values;

        if (!queryEmbedding) {
            throw new Error("Failed to embed user message");
        }

        // Query Supabase for relevant content
        const supabase = await createClient();
        const { data: documents, error: dbError } = await supabase.rpc(
            "match_knowledge",
            {
                query_embedding: queryEmbedding,
                match_threshold: 0.6, // Only highly relevant context
                match_count: 5,       // Max chunks to include
            }
        );

        if (dbError) {
            console.error("Database search error:", dbError);
        }

        // Build the injected context string
        let retrievedContext = "";
        if (documents && documents.length > 0) {
            retrievedContext = documents.map((doc: any) => doc.content).join("\n\n");
        }

        const fullPrompt = `${SYSTEM_PROMPT}\n${retrievedContext}\n\nUSER QUESTION: ${message}`;

        // Call Gemini to generate a response
        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite-preview",
            contents: fullPrompt,
        });

        return NextResponse.json({ reply: response.text });
    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json(
            { error: error?.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
