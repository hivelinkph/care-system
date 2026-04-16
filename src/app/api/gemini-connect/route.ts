import { NextResponse } from 'next/server';

export async function GET() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 });
    }

    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${key}`;
    return NextResponse.json({ url });
}
