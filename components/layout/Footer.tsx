import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface text-muted-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start">
              <img src="/logo-dark-mode.png" alt="KREASI.ID" className="h-8 dark:hidden" />
              <img src="/logo-light-mode.png" alt="KREASI.ID" className="h-8 hidden dark:block" />
            </div>
            <p className="text-sm mt-1">Portal bagi kreator untuk menjual karya digital dengan mudah.</p>
          </div>
          <div className="flex gap-6 text-sm">
            <a href={process.env.NEXT_PUBLIC_CLIENT_URL || "https://kreasi-client.vercel.app"} className="hover:text-foreground transition-colors">Utama</a>
            <Link href="/login" className="hover:text-foreground transition-colors">Masuk</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Daftar</Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border/50 text-xs text-center flex flex-col md:flex-row justify-between items-center gap-2">
          <p>&copy; {new Date().getFullYear()} KREASI.ID. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
