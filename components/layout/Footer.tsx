import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface text-muted-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h3 className="font-bold text-lg text-foreground tracking-tight">KREASI<span className="text-accent">.SELLER</span></h3>
            <p className="text-sm mt-1">Portal bagi kreator untuk menjual karya digital dengan mudah.</p>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="http://localhost:3000/" className="hover:text-foreground transition-colors">Utama</a>
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
