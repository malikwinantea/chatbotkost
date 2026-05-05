"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Halo! Ada yang bisa saya bantu terkait informasi Kost Daisy dan Kost Camellia?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleOpenChatbot = () => setIsOpen(true);
        window.addEventListener("open-chatbot", handleOpenChatbot);

        return () => {
            window.removeEventListener("open-chatbot", handleOpenChatbot);
        };
    }, []);

    // Auto scroll ke bawah saat pesan baru muncul
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSendMessage = async (text: string = input) => {
        if (!text.trim() || isLoading) return;

        const userMsg: Message = { role: "user", content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMsg] }),
            });

            if (!res.ok) throw new Error("Gagal mendapatkan respons");

            const data = await res.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: "assistant", content: "Maaf, terjadi kesalahan atau server sedang sibuk." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <Card className="w-[350px] md:w-[400px] shadow-2xl flex flex-col h-[32rem] md:h-[36rem]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 bg-primary text-primary-foreground rounded-t-lg shrink-0">
                        <CardTitle className="text-base font-semibold">
                            Virtual Assistant
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0 hover:bg-primary-foreground/20 text-primary-foreground"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col flex-1 overflow-hidden">

                        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-3 mb-4 scrollbar-thin scrollbar-thumb-muted-foreground/20">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`p-3 rounded-lg text-sm md:text-[15px] leading-relaxed max-w-[85%] whitespace-pre-wrap ${m.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-br-none"
                                            : "bg-muted text-foreground rounded-bl-none border"
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="p-3 rounded-lg bg-muted text-foreground rounded-bl-none border flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        <span className="text-sm md:text-[15px] text-muted-foreground">Mengetik...</span>
                                    </div>
                                </div>
                            )}

                            {messages.length === 1 && (
                                <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                                    <p className="text-sm text-muted-foreground font-semibold">Saran pertanyaan:</p>
                                    <button onClick={() => handleSendMessage("Berapa harga kamar Daisy tipe A?")} className="text-sm text-left text-muted-foreground bg-muted/50 p-2.5 rounded hover:bg-muted border border-transparent hover:border-border transition-colors">
                                        &quot;Berapa harga kamar Daisy tipe A?&quot;
                                    </button>
                                    <button onClick={() => handleSendMessage("Kamar mana yang masih kosong?")} className="text-sm text-left text-muted-foreground bg-muted/50 p-2.5 rounded hover:bg-muted border border-transparent hover:border-border transition-colors">
                                        &quot;Kamar mana yang masih kosong?&quot;
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mt-auto shrink-0">
                            <Input
                                placeholder="Ketik pesan..."
                                className="flex-1 text-sm md:text-base py-5"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                            />
                            <Button size="icon" className="shrink-0 h-10 w-10" onClick={() => handleSendMessage()} disabled={!input.trim() || isLoading}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Button
                    size="icon"
                    className="h-16 w-16 md:h-20 md:w-20 rounded-full shadow-2xl bg-primary hover:bg-primary/90 transition-transform hover:scale-105"
                    onClick={() => setIsOpen(true)}
                >
                    <MessageCircle className="h-8 w-8 md:h-10 md:w-10 text-primary-foreground" />
                </Button>
            )}
        </div>
    );
}
