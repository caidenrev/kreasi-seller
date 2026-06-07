"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { ArrowLeft, Clock, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default function WithdrawalPage() {
  const [seller, setSeller] = useState<any>(null);
  const [minWithdrawalAmount, setMinWithdrawalAmount] = useState(50000); // default fallback
  const [amount, setAmount] = useState<number>(0);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Fetch seller info
      const sellerSnap = await getDoc(doc(db, "sellers", user.uid));
      if (sellerSnap.exists()) {
        const data = sellerSnap.data();
        setSeller(data);
        setBankName(data.bankInfo?.bankName || "");
        setAccountNumber(data.bankInfo?.accountNumber || "");
        setAccountName(data.bankInfo?.accountName || "");
      }

      // Fetch global settings
      const settingsSnap = await getDoc(doc(db, "settings", "global"));
      if (settingsSnap.exists()) {
        setMinWithdrawalAmount(settingsSnap.data().minWithdrawalAmount || 50000);
      }

      // Fetch withdrawal history
      const reqQuery = query(
        collection(db, "withdrawals"),
        where("sellerId", "==", user.uid),
        orderBy("requestedAt", "desc")
      );
      const reqSnap = await getDocs(reqQuery);
      setRequests(reqSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error fetching withdrawal dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !seller) return;

    setError("");
    setSuccess(false);

    if (amount < minWithdrawalAmount) {
      setError(`Jumlah penarikan minimal adalah ${formatIDR(minWithdrawalAmount)}`);
      return;
    }

    if (amount > seller.walletBalance) {
      setError("Saldo tidak mencukupi untuk melakukan penarikan ini.");
      return;
    }

    if (!bankName || !accountNumber || !accountName) {
      setError("Lengkapi informasi rekening bank terlebih dahulu.");
      return;
    }

    setSubmitting(true);

    try {
      const withdrawalsRef = collection(db, "withdrawals");
      await addDoc(withdrawalsRef, {
        sellerId: user.uid,
        sellerName: seller.displayName || "Seller",
        amount: Number(amount),
        bankInfo: {
          bankName,
          accountNumber,
          accountName,
        },
        status: "pending",
        adminNote: "",
        processedBy: "",
        processedAt: null,
        requestedAt: serverTimestamp(),
      });

      // Deduct balance locally for instantaneous visual update if wanted,
      // but the Cloud Function handles the debit when "completed".
      // To prevent double withdrawal: we can either lock the balance or subtract it immediately.
      // Under our PRD: "Firebase Function: debit wallet seller: walletBalance -= amount when completed".
      // So the balance is debited once processed by admin.
      
      setSuccess(true);
      setAmount(0);
      fetchData(); // reload
    } catch (err: any) {
      setError(err.message || "Gagal mengajukan penarikan dana.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/wallet" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Ajukan Penarikan Dana</h1>
          <p className="text-muted-foreground text-sm mt-1">Tarik saldo hasil penjualan langsung ke rekening terdaftar Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Request */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6 md:p-8 space-y-6">
          <div className="bg-surface-2 border border-border rounded-xl p-6 flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">SALDO YANG BISA DITARIK</p>
              <h2 className="text-3xl font-extrabold text-accent mt-1">{formatIDR(seller?.walletBalance)}</h2>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              Minimal Penarikan:<br />
              <span className="text-foreground font-bold">{formatIDR(minWithdrawalAmount)}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-3.5 text-sm text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg p-3.5 text-sm text-center font-semibold">
              Permintaan penarikan dana berhasil dikirim! Silakan tunggu konfirmasi admin.
            </div>
          )}

          <form onSubmit={handleRequest} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">JUMLAH PENARIKAN (IDR)</label>
              <input
                type="number"
                required
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="e.g. 100000"
                className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-lg font-bold text-foreground focus:outline-none focus:border-accent"
              />
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <h4 className="text-sm font-bold text-foreground">Tujuan Pengiriman Dana (Rekening Bank)</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">BANK</label>
                  <input
                    type="text"
                    disabled
                    value={bankName || "Belum diatur"}
                    className="w-full bg-surface-2/40 border border-border rounded-lg px-4 py-2.5 text-sm text-muted-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">NOMOR REKENING</label>
                  <input
                    type="text"
                    disabled
                    value={accountNumber || "Belum diatur"}
                    className="w-full bg-surface-2/40 border border-border rounded-lg px-4 py-2.5 text-sm text-muted-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">NAMA PEMILIK</label>
                  <input
                    type="text"
                    disabled
                    value={accountName || "Belum diatur"}
                    className="w-full bg-surface-2/40 border border-border rounded-lg px-4 py-2.5 text-sm text-muted-foreground"
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                *Untuk mengubah rekening tujuan, silakan pergi ke{" "}
                <Link href="/dashboard/profile" className="text-accent hover:underline">
                  Pengaturan Profil
                </Link>
                .
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !bankName}
              className="w-full bg-accent hover:bg-accent-hover text-black font-bold py-3 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {submitting ? "Mengirimkan..." : "Ajukan Penarikan"}
            </button>
          </form>
        </div>

        {/* Right Column: History List */}
        <div className="bg-surface border border-border rounded-xl p-6 md:p-8 space-y-4">
          <h3 className="text-lg font-bold border-b border-border pb-3 text-foreground">Status Penarikan</h3>
          
          {requests.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Belum ada riwayat penarikan dana.</p>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {requests.map((req) => (
                <div key={req.id} className="bg-surface-2 border border-border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {req.requestedAt?.toDate().toLocaleDateString("id-ID") || "-"}
                      </p>
                      <p className="text-sm font-bold text-foreground mt-1">{formatIDR(req.amount)}</p>
                    </div>

                    <div>
                      {req.status === "pending" && (
                        <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                      {req.status === "processing" && (
                        <span className="flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          <Clock className="w-3.5 h-3.5" /> Diproses
                        </span>
                      )}
                      {req.status === "completed" && (
                        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                        </span>
                      )}
                      {req.status === "rejected" && (
                        <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20" title={req.adminNote}>
                          <XCircle className="w-3.5 h-3.5" /> Ditolak
                        </span>
                      )}
                    </div>
                  </div>
                  {req.adminNote && (
                    <p className="text-[11px] bg-surface-3/40 text-muted-foreground rounded p-2 border border-border/20">
                      Catatan: {req.adminNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
