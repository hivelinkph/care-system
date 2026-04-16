"use client";

import React, { useState } from "react";

export function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

interface DisplayCardProps {
    icon?: React.ReactNode;
    title?: string;
    description?: string;
    date?: string;
    iconClassName?: string;
    titleClassName?: string;
}

export default function DisplayCards({ cards }: { cards: DisplayCardProps[] }) {
    const [orderedCards, setOrderedCards] = useState<DisplayCardProps[]>([...cards]);

    // Click any card → bring it to the front (index 0)
    const handleCardClick = (clickedTitle: string) => {
        setOrderedCards((prev) => {
            const clicked = prev.find((c) => c.title === clickedTitle);
            if (!clicked) return prev;
            const rest = prev.filter((c) => c.title !== clickedTitle);
            return [clicked, ...rest];
        });
    };

    const CARD_W = 420;
    const CARD_H = 210;
    const OFFSET_X = 80; // horizontal spread per layer (back cards peek right)
    const OFFSET_Y = 60; // vertical spread per layer
    const n = orderedCards.length;

    // Total canvas size
    const totalW = CARD_W + OFFSET_X * (n - 1) + 20;
    const totalH = CARD_H + OFFSET_Y * (n - 1) + 32;

    return (
        <div className="relative select-none" style={{ width: totalW, height: totalH }}>
            {/* Render back-to-front so front card paints on top */}
            {[...orderedCards].reverse().map((card, reversedIdx) => {
                // idx 0 = front card (bottom-right), idx n-1 = back card (top-left)
                const idx = n - 1 - reversedIdx;
                const isFront = idx === 0;

                // Front card sits bottom-right; back cards peek from top-left
                const x = (n - 1 - idx) * OFFSET_X;
                const y = (n - 1 - idx) * OFFSET_Y;
                const zIndex = n - idx; // front = highest z

                // Subtle scale: back cards slightly smaller for depth
                const scale = 1 - idx * 0.015;

                return (
                    <div
                        key={card.title}
                        onClick={() => handleCardClick(card.title!)}
                        className="absolute cursor-pointer"
                        style={{
                            width: CARD_W,
                            height: CARD_H,
                            left: x,
                            top: y,
                            zIndex,
                            transform: `scale(${scale})`,
                            transformOrigin: "top left",
                            transition: "all 0.6s cubic-bezier(0.34, 1.25, 0.64, 1)",
                        }}
                    >
                        {/* Card surface */}
                        <div
                            className="w-full h-full rounded-2xl bg-white flex flex-col p-6 overflow-hidden"
                            style={{
                                border: isFront
                                    ? "2px solid #2DD1AC"           // teal border on active/front card
                                    : "1.5px solid rgba(0,0,0,0.09)",
                                boxShadow: isFront
                                    ? "0 8px 48px rgba(45,209,172,0.22), 0 2px 12px rgba(0,0,0,0.07)"
                                    : "0 4px 24px rgba(0,0,0,0.06)",
                                transition: "border 0.4s, box-shadow 0.4s",
                            }}
                        >
                            {/* Header: icon + title — always visible on every card */}
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors duration-400"
                                    style={
                                        isFront
                                            ? { background: "#2DD1AC", borderColor: "#2DD1AC", color: "#fff" }
                                            : { background: "#f3f4f6", borderColor: "#e5e7eb", color: "#363F4D", opacity: 0.7 }
                                    }
                                >
                                    {card.icon}
                                </div>
                                <h3
                                    className="font-heading font-bold text-[18px] tracking-tight leading-none transition-colors duration-400"
                                    style={{ color: isFront ? "#2DD1AC" : "#363F4D", opacity: isFront ? 1 : 0.65 }}
                                >
                                    {card.title}
                                </h3>
                            </div>

                            {/* Body — fades in/out based on whether this is the front card */}
                            <div
                                className="flex flex-col flex-grow gap-2"
                                style={{
                                    opacity: isFront ? 1 : 0.2,
                                    transition: "opacity 0.35s ease",
                                    pointerEvents: isFront ? "auto" : "none",
                                }}
                            >
                                <p className="font-body text-[15px] text-[#363F4D] leading-relaxed flex-grow">
                                    {card.description}
                                </p>
                                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#363F4D] opacity-40">
                                    {card.date}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
