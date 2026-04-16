"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Database, UploadCloud, CheckCircle2, FileText, Upload, Trash2 } from "lucide-react";

export default function KnowledgeBaseManager() {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoadingDocs, setIsLoadingDocs] = useState(true);

    const fetchDocuments = async () => {
        setIsLoadingDocs(true);
        try {
            const res = await fetch("/api/knowledge");
            const data = await res.json();
            if (res.ok && data.documents) {
                setDocuments(data.documents);
            }
        } catch (err) {
            console.error("Failed to fetch documents", err);
        } finally {
            setIsLoadingDocs(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this document?")) return;
        try {
            const res = await fetch(`/api/knowledge?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setDocuments(prev => prev.filter(doc => doc.id !== id));
            }
        } catch (err) {
            console.error("Failed to delete document", err);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) setFile(selected);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) setFile(dropped);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setIsSubmitting(true);
        setStatus("idle");
        setErrorMessage("");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/embed", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to embed file content");

            setStatus("success");
            setFile(null);
            if (fileRef.current) fileRef.current.value = "";
            fetchDocuments();

            setTimeout(() => setStatus("idle"), 4000);
        } catch (err: any) {
            console.error(err);
            setStatus("error");
            setErrorMessage(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Database className="text-teal-600" />
                    AI Knowledge Base
                </h1>
                <p className="text-zinc-500 mt-2">
                    Upload assisted living documents below. The text will be extracted, embedded using Google GenAI (gemini-embedding-001), and saved to the Supabase vector database for the AI assistant to reference.
                </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Upload Document</label>

                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileRef.current?.click()}
                            className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors
                                ${isDragging
                                    ? "border-teal-500 bg-teal-50 dark:bg-teal-950"
                                    : "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                }`}
                        >
                            <input
                                type="file"
                                hidden
                                ref={fileRef}
                                onChange={handleFileChange}
                                accept=".txt,.json,.csv,.md,.pdf"
                            />
                            {file ? (
                                <div className="flex flex-col items-center text-teal-600">
                                    <FileText size={48} className="mb-3 opacity-80" />
                                    <span className="font-medium text-lg">{file.name}</span>
                                    <span className="text-sm opacity-60 mt-1">{(file.size / 1024).toFixed(1)} KB — Click to change</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-zinc-500">
                                    <Upload size={48} className="mb-3 opacity-40" />
                                    <span className="font-medium text-zinc-700 dark:text-zinc-300">Click to browse or drag & drop</span>
                                    <span className="text-sm mt-1 opacity-70">PDF, TXT, CSV, JSON, MD</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <div className="text-sm">
                            {status === "success" && (
                                <span className="text-green-600 flex items-center gap-1">
                                    <CheckCircle2 size={16} /> Knowledge base updated successfully!
                                </span>
                            )}
                            {status === "error" && (
                                <span className="text-red-500">{errorMessage}</span>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !file}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <UploadCloud size={18} />
                            )}
                            {isSubmitting ? "Processing & Embedding..." : "Upload to Knowledge Base"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Existing Documents List */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Existing Documents</h2>
                {isLoadingDocs ? (
                    <div className="flex justify-center p-8 text-zinc-500">
                        <Loader2 className="animate-spin" size={24} />
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-zinc-500 text-center p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                        No documents have been uploaded yet.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {documents.map((doc) => (
                            <div key={doc.id} className="flex items-start justify-between p-4 border border-zinc-100 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/30 hover:border-teal-200/50 transition-colors">
                                <div className="pr-4">
                                    <div className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
                                        {doc.content}
                                    </div>
                                    <div className="text-xs text-zinc-400 mt-2 font-mono bg-zinc-100 dark:bg-zinc-800/60 inline-block px-1.5 py-0.5 rounded">
                                        ID: {doc.id}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(doc.id)}
                                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors flex-shrink-0 mt-1 cursor-pointer"
                                    title="Delete document"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
