import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Tables the AI is permitted to read from
const ALLOWED_TABLES = ["patients", "daily_tasks", "facilities", "users", "knowledge_base"] as const;
type AllowedTable = typeof ALLOWED_TABLES[number];

// Columns that support fuzzy/partial text search
const TEXT_SEARCH_COLUMNS: Record<AllowedTable, string[]> = {
    patients: ["first_name", "last_name", "room_number", "medical_notes"],
    daily_tasks: ["task_name", "notes", "status", "category"],
    users: ["first_name", "last_name", "role"],
    facilities: ["name", "address"],
    knowledge_base: ["content"],
};

export async function POST(req: Request) {
    try {
        const { table, filters, search } = await req.json() as {
            table: AllowedTable;
            filters?: Record<string, string | number>;
            search?: { column: string; term: string };
        };

        if (!table || !ALLOWED_TABLES.includes(table)) {
            return NextResponse.json(
                { error: `Invalid table. Must be one of: ${ALLOWED_TABLES.join(", ")}` },
                { status: 400 }
            );
        }

        // Server client respects RLS — only returns data for the logged-in facility
        const supabase = await createClient();

        let query = supabase.from(table).select("*").limit(50);

        // Exact-match filters (e.g. { status: "pending" })
        if (filters && typeof filters === "object") {
            for (const [key, value] of Object.entries(filters)) {
                query = query.eq(key, value) as typeof query;
            }
        }

        // Partial text search (e.g. { column: "room_number", term: "101" })
        if (search?.column && search?.term) {
            const allowed = TEXT_SEARCH_COLUMNS[table] || [];
            if (allowed.includes(search.column)) {
                query = query.ilike(search.column, `%${search.term}%`) as typeof query;
            }
        }

        const { data, error } = await query;

        if (error) {
            console.error("DB Query Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ results: data ?? [] });
    } catch (err: any) {
        console.error("Query API Error:", err);
        return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
    }
}
