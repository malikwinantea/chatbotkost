"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export interface HeroProps {
  mainTitle?: string;
  titles?: string[];
  description?: string;
  bgImageUrl?: string;
}

function Hero({
  mainTitle = "Reservasi Kamar Kost",
  titles = ["Nyaman", "Aman", "Strategis", "Eksklusif", "Terbaik"],
  description = "Pilihan hunian kost premium. fasilitas terbaik untuk menjamin kenyamanan dan keamanan Anda setiap saat.",
  bgImageUrl = "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=1920"
}: HeroProps) {
  const [titleNumber, setTitleNumber] = useState(0);
  const displayTitles = useMemo(() => titles, [titles]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === displayTitles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, displayTitles]);

  return (
    <div className="w-full relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${bgImageUrl}')` }}
      />
      <div className="absolute inset-0 z-0 bg-black/60" />

      <div className="container mx-auto relative z-10 px-4">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col text-white">
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-3xl tracking-tighter text-center font-bold drop-shadow-lg leading-tight">
              <span className="block mb-2">{mainTitle}</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1 text-primary">
                &nbsp;
                {displayTitles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold text-emerald-400"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                          y: 0,
                          opacity: 1,
                        }
                        : {
                          y: titleNumber > index ? -150 : 150,
                          opacity: 0,
                        }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-white/90 max-w-2xl text-center mx-auto drop-shadow">
              {description}
            </p>
          </div>
          <div className="flex flex-row gap-4 mt-4">
            <Button size="lg" className="gap-4 text-base h-12 px-8 bg-primary/90 hover:bg-primary" onClick={() => window.dispatchEvent(new Event("open-chatbot"))}>
              Chat AI Customer Service <MessageCircle className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="gap-4 text-base h-12 px-8 bg-transparent text-white border-white hover:bg-white/20" asChild>
              <Link href="/register">
                Sign up here <MoveRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
