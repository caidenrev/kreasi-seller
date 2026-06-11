"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, getDoc, orderBy, limit, doc } from "firebase/firestore";
import { Wallet, ArrowDownToLine, TrendingUp, CreditCard } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function WalletPage() {
  const [seller, setSeller] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Fetch seller balance
        const sellerRef = doc(db, "sellers", user.uid);
        const sellerSnap = await getDoc(sellerRef);
        if (sellerSnap.exists()) {
          setSeller(sellerSnap.data());
        }

        // Fetch transactions
        const txQuery = query(
          collection(db, "wallet_transactions"),
          where("sellerId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const txSnap = await getDocs(txQuery);
        setTransactions(txSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching wallet transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const filteredTx = transactions.filter((tx) => {
    if (filter === "all") return true;
    return tx.type === filter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/4 bg-surface" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 bg-surface rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 bg-surface rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Wallet & Saldo</h1>
          <p className="text-muted-foreground text-sm mt-1">Kelola pendapatan Anda dan ajukan penarikan dana.</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent-hover text-black font-bold px-4 py-5">
          <Link href="/dashboard/withdrawal" className="flex items-center gap-2">
            <ArrowDownToLine className="w-4 h-4" />
            Tarik Dana
          </Link>
        </Button>
      </div>

      {/* Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-surface border-border">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saldo Tersedia</p>
              <p className="text-3xl font-extrabold text-accent">{formatIDR(seller?.walletBalance)}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <Wallet className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Akumulasi Penghasilan</p>
              <p className="text-3xl font-extrabold text-foreground">{formatIDR(seller?.totalEarnings)}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Penjualan</p>
              <p className="text-3xl font-extrabold text-foreground">{seller?.totalSales || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <CreditCard className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table Card */}
      <Card className="bg-surface border-border">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Riwayat Transaksi</CardTitle>
          <div className="flex gap-2">
            {["all", "credit", "debit"].map((t) => (
              <Button
                key={t}
                onClick={() => setFilter(t)}
                variant="outline"
                size="sm"
                className={`capitalize transition-colors ${
                  filter === t
                    ? "bg-accent text-black border-accent hover:bg-accent-hover"
                    : "bg-surface-2 text-muted-foreground border-border hover:bg-surface-3 hover:text-foreground"
                }`}
              >
                {t === "all" ? "Semua" : t === "credit" ? "Kredit (Masuk)" : "Debit (Keluar)"}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {filteredTx.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-12">Tidak ada riwayat transaksi wallet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Tanggal</TableHead>
                  <TableHead className="text-muted-foreground">Keterangan</TableHead>
                  <TableHead className="text-muted-foreground">Tipe</TableHead>
                  <TableHead className="text-muted-foreground">Jumlah</TableHead>
                  <TableHead className="text-muted-foreground text-right">Saldo Akhir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTx.map((tx) => (
                  <TableRow key={tx.id} className="border-border hover:bg-surface-2">
                    <TableCell className="text-muted-foreground">
                      {tx.createdAt?.toDate().toLocaleString("id-ID") || "-"}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{tx.description}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${
                          tx.type === "credit"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {tx.type === "credit" ? "Masuk" : "Keluar"}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`font-bold ${
                        tx.type === "credit" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {tx.type === "credit" ? "+" : "-"}
                      {formatIDR(tx.amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right">{formatIDR(tx.balanceAfter)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
