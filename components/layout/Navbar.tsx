"use client";

import Link from "next/link";
import { Store } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-xl border-b border-border/50 shadow-lg">
      <div className="mx-auto max-w-7xl h-16 flex items-center justify-between px-6">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <span>KREASI<span className="text-accent">.SELLER</span></span>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          <a
            href={process.env.NEXT_PUBLIC_CLIENT_URL || "https://kreasi-client.vercel.app"}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            Kembali ke KREASI.ID
          </a>
          
          <div className="flex items-center gap-2 sm:gap-4 border-l border-border pl-4 sm:pl-6">
            <Link 
              href="/login" 
              className="text-sm font-bold text-foreground hover:text-accent transition-colors"
            >
              Masuk
            </Link>
            <Link 
              href="/register" 
              className="text-sm font-bold bg-accent hover:bg-accent-hover text-black px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Mulai Jualan</span>
              <span className="sm:hidden">Daftar</span>
            </Link>
          </div>

          <div className="ml-2">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
