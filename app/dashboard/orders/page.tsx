"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const q = query(
          collection(db, "orders"),
          where("paymentStatus", "==", "paid"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        
        const sellerOrders: any[] = [];
        snap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const matches = data.items?.filter((item: any) => item.sellerId === user.uid);
          
          if (matches && matches.length > 0) {
            sellerOrders.push({
              id: docSnap.id,
              buyerName: data.buyer?.name || "Anonim",
              createdAt: data.createdAt?.toDate().toLocaleString("id-ID") || "-",
              items: matches,
              totalAmount: matches.reduce((acc: number, curr: any) => acc + curr.price, 0),
              totalEarnings: matches.reduce((acc: number, curr: any) => acc + curr.sellerEarnings, 0),
            });
          }
        });

        setOrders(sellerOrders);
      } catch (err) {
        console.error("Error fetching seller orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-surface rounded w-1/4"></div>
        <div className="h-96 bg-surface rounded-xl border border-border"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Pesanan Masuk</h1>
        <p className="text-muted-foreground text-sm mt-1">Daftar transaksi penjualan produk Anda yang telah lunas dibayar.</p>
      </div>

      {/* Orders Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            Belum ada pesanan masuk untuk produk Anda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-surface-2">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Buyer (Nama)</th>
                  <th className="px-6 py-4">Produk</th>
                  <th className="px-6 py-4">Harga Jual</th>
                  <th className="px-6 py-4">Pendapatan Anda (95%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-foreground">{order.id}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">{order.createdAt}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{order.buyerName}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="text-sm text-foreground font-semibold">
                            {item.productTitle}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground font-medium">{formatIDR(order.totalAmount)}</td>
                    <td className="px-6 py-4 text-accent font-bold">{formatIDR(order.totalEarnings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
