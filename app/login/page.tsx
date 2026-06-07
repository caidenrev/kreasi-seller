"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Check if seller profile exists, if not create one (fallback)
      const sellerDoc = await getDoc(doc(db, "sellers", userCredential.user.uid));
      if (!sellerDoc.exists()) {
        await setDoc(doc(db, "sellers", userCredential.user.uid), {
          id: userCredential.user.uid,
          displayName: userCredential.user.displayName || "Seller Baru",
          username: userCredential.user.email?.split("@")[0] || "seller",
          email: userCredential.user.email || "",
          avatarUrl: "",
          bio: "",
          portfolioUrl: "",
          bankInfo: {
            bankName: "",
            accountNumber: "",
            accountName: "",
          },
          walletBalance: 0,
          totalEarnings: 0,
          totalSales: 0,
          totalProducts: 0,
          status: "active",
          joinedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      
      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const sellerDoc = await getDoc(doc(db, "sellers", userCredential.user.uid));
      if (!sellerDoc.exists()) {
        await setDoc(doc(db, "sellers", userCredential.user.uid), {
          id: userCredential.user.uid,
          displayName: userCredential.user.displayName || "Seller Baru",
          username: userCredential.user.email?.split("@")[0] || "seller",
          email: userCredential.user.email || "",
          avatarUrl: userCredential.user.photoURL || "",
          bio: "",
          portfolioUrl: "",
          bankInfo: {
            bankName: "",
            accountNumber: "",
            accountName: "",
          },
          walletBalance: 0,
          totalEarnings: 0,
          totalSales: 0,
          totalProducts: 0,
          status: "active",
          joinedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Gagal masuk menggunakan Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Seller Portal <span className="text-accent">Kreasi</span>
          </h1>
          <p className="text-sm text-muted-foreground">Masuk ke dashboard kelola produk & earnings Anda</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-3 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">EMAIL</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-muted-foreground">PASSWORD</label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-black font-bold py-2.5 rounded-lg text-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? "Memuat..." : "Masuk"}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-muted-foreground text-xs">ATAU</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full border border-border hover:bg-surface-2 text-foreground py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Masuk dengan Google
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Belum terdaftar?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Daftar Akun Seller
          </Link>
        </p>
      </div>
    </div>
  );
}
