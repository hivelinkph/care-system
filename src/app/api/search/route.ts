import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        // 1. Generate Embedding for the query
        const embedResponse = await ai.models.embedContent({
            model: "gemini-embedding-001",
            contents: query,
        });
        const embedding = embedResponse.embeddings?.[0]?.values;

        if (!embedding) throw new Error("Failed to generate embedding");

        // 2. Query Supabase for relevant context
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: contextData, error: matchError } = await supabase.rpc("match_knowledge", {
            query_embedding: embedding,
            match_threshold: 0.5,
            match_count: 5,
        });

        if (matchError) throw matchError;

        const context = contextData?.map((item: any) => item.content).join("\n\n") || "No specific information found in the knowledge base.";

        return NextResponse.json({ context });
    } catch (error: any) {
        console.error("Search API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
