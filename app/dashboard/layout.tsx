"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Wallet,
  ArrowDownToLine,
  User,
  LogOut,
  Menu,
  X,
  Ticket,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        window.location.href = "/login";
        return;
      }
      setUser(currentUser);
      
      // Fetch seller info
      try {
        const docRef = doc(db, "sellers", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSeller(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching seller profile:", err);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Produk Saya", href: "/dashboard/products", icon: Package },
    { name: "Pesanan Masuk", href: "/dashboard/orders", icon: ShoppingBag },
    { name: "Voucher Diskon", href: "/dashboard/vouchers", icon: Ticket },
    { name: "Wallet & Saldo", href: "/dashboard/wallet", icon: Wallet },
    { name: "Penarikan Dana", href: "/dashboard/withdrawal", icon: ArrowDownToLine },
    { name: "Profil Seller", href: "/dashboard/profile", icon: User },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground flex">
        {/* Sidebar for desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border">
          <div className="p-6 border-b border-border">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              KREASI <span className="text-accent">SELLER</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-black"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </aside>

        {/* Mobile Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)}>
            <aside
              className="w-64 bg-surface h-full border-r border-border flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex justify-between items-center">
                <span className="text-xl font-bold tracking-tight">
                  KREASI <span className="text-accent">SELLER</span>
                </span>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-accent text-black"
                          : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>

            <div className="ml-auto flex items-center gap-4">
              <ThemeToggle />
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{seller?.displayName || user?.displayName}</p>
                <p className="text-xs text-muted-foreground">@{seller?.username || "username"}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-sm font-bold text-accent">
                {(seller?.displayName || user?.displayName || "S")[0].toUpperCase()}
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
