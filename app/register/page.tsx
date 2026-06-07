"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      setError("Anda harus menyetujui syarat & ketentuan.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Check if username already exists
      const usernameClean = username.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
      if (!usernameClean) {
        throw new Error("Username tidak valid.");
      }

      // We can check username availability if we have a lookup
      // But let's simplify for direct onboarding
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile displayName
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });

      // Write to sellers collection
      await setDoc(doc(db, "sellers", userCredential.user.uid), {
        id: userCredential.user.uid,
        displayName: displayName,
        username: usernameClean,
        email: email,
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

      // Redirect to profile setup
      window.location.href = "/dashboard/profile";
    } catch (err: any) {
      setError(err.message || "Pendaftaran gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Daftar Seller <span className="text-accent">Kreasi</span>
          </h1>
          <p className="text-sm text-muted-foreground">Mulai menjual produk digital Anda dalam hitungan menit</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-3 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">NAMA LENGKAP</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Joko Susilo"
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">USERNAME (UNTUK URL PROFIL)</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="jokosusilo"
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">EMAIL</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joko@email.com"
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">PASSWORD</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="agree"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1 accent-[#E8FF4D]"
            />
            <label htmlFor="agree" className="text-xs text-muted-foreground select-none cursor-pointer">
              Saya menyetujui <span className="text-accent hover:underline">Syarat & Ketentuan</span> serta{" "}
              <span className="text-accent hover:underline">Kebijakan Privasi</span> platform Kreasi.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-black font-bold py-2.5 rounded-lg text-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? "Mendaftar..." : "Daftar Sekarang"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Sudah memiliki akun?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Login di Sini
          </Link>
        </p>
      </div>
    </div>
  );
}
