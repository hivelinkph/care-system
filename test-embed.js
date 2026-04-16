const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: "AIzaSyAWmICm_KDJR2jSfVN_FRu4K-NFctHHmFo" });

async function run() {
    try {
        const res = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite-preview",
            contents: "Hello",
        });
        console.log("Success with lite-preview:", res.text.substring(0, 20));
    } catch (e) { console.error("lite-preview error", e.message); }

    try {
        const res = await ai.models.generateContent({
            model: "gemini-3.1-flash",
            contents: "Hello",
        });
        console.log("Success with 3.1-flash:", res.text.substring(0, 20));
    } catch (e) { console.error("gemini-3.1-flash error", e.message); }
}

run();
