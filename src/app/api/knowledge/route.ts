import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();
        // Fetch documents, limit content to 200 chars for preview, descending id order.
        const { data, error } = await supabase
            .from("knowledge_base")
            .select("id, content")
            .order("id", { ascending: false });

        if (error) throw error;

        // Truncate content on the server side
        const documents = data?.map(doc => ({
            id: doc.id,
            content: doc.content.length > 200 ? doc.content.slice(0, 200) + "..." : doc.content,
        }));

        return NextResponse.json({ documents });
    } catch (error: any) {
        console.error("GET knowledge base error:", error);
        return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing document ID." }, { status: 400 });
        }

        const supabase = await createClient();
        const { error } = await supabase
            .from("knowledge_base")
            .delete()
            .eq("id", parseInt(id, 10));

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Document deleted." });
    } catch (error: any) {
        console.error("DELETE knowledge base error:", error);
        return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
    }
}
