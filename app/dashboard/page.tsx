"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, limit, getDocs, orderBy } from "firebase/firestore";
import { Package, ShoppingBag, Wallet, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function DashboardOverview() {
  const [seller, setSeller] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [pendingProductsCount, setPendingProductsCount] = useState(0);
  const [rejectedProducts, setRejectedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Fetch seller document
        const sellerRef = doc(db, "sellers", user.uid);
        const sellerSnap = await getDoc(sellerRef);
        if (sellerSnap.exists()) {
          setSeller(sellerSnap.data());
        }

        // Fetch pending products count
        const productsRef = collection(db, "products");
        const pendingQuery = query(
          productsRef,
          where("sellerId", "==", user.uid),
          where("reviewStatus", "==", "pending")
        );
        const pendingSnap = await getDocs(pendingQuery);
        setPendingProductsCount(pendingSnap.size);

        // Fetch rejected products
        const rejectedQuery = query(
          productsRef,
          where("sellerId", "==", user.uid),
          where("reviewStatus", "==", "rejected")
        );
        const rejectedSnap = await getDocs(rejectedQuery);
        setRejectedProducts(rejectedSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // Fetch orders containing seller's items
        const ordersRef = collection(db, "orders");
        // We will query for orders where paymentStatus is paid
        const ordersQuery = query(
          ordersRef,
          where("paymentStatus", "==", "paid"),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const ordersSnap = await getDocs(ordersQuery);
        
        // Filter orders in memory to get items matching sellerId
        const sellerOrders: any[] = [];
        ordersSnap.docs.forEach((docSnap) => {
          const orderData = docSnap.data();
          const hasSellerItem = orderData.items?.some((item: any) => item.sellerId === user.uid);
          if (hasSellerItem) {
            sellerOrders.push({
              id: docSnap.id,
              buyerName: orderData.buyer?.name || "Anonim",
              createdAt: orderData.createdAt?.toDate().toLocaleDateString("id-ID") || "-",
              items: orderData.items.filter((item: any) => item.sellerId === user.uid),
              totalAmount: orderData.items
                .filter((item: any) => item.sellerId === user.uid)
                .reduce((acc: number, curr: any) => acc + curr.price, 0),
            });
          }
        });
        setRecentOrders(sellerOrders);
      } catch (err) {
        console.error("Error fetching dashboard overview data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-surface rounded-xl border border-border"></div>
          ))}
        </div>
        <div className="h-64 bg-surface rounded-xl border border-border"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Pantau penjualan dan performa produk digital Anda.</p>
      </div>

      {/* Rejections Alert */}
      {rejectedProducts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Produk Memerlukan Revisi</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Ada {rejectedProducts.length} produk Anda yang ditolak oleh admin. Silakan periksa detail produk dan catatan revisi admin.
            </p>
            <div className="mt-3 flex gap-2">
              {rejectedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/products/${p.id}`}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  Edit "{p.title}"
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cards Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saldo Tersedia</p>
            <p className="text-2xl font-bold">{formatIDR(seller?.walletBalance)}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Pendapatan</p>
            <p className="text-2xl font-bold">{formatIDR(seller?.totalEarnings)}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Penjualan</p>
            <p className="text-2xl font-bold">{seller?.totalSales || 0} unit</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Produk Pending</p>
            <p className="text-2xl font-bold">{pendingProductsCount} item</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Orders */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Pesanan Masuk Terbaru</h3>
            <Link href="/dashboard/orders" className="text-xs text-accent hover:underline">
              Lihat Semua
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">Belum ada pesanan masuk.</p>
          ) : (
            <div className="divide-y divide-border">
              {recentOrders.map((order) => (
                <div key={order.id} className="py-3.5 flex justify-between items-center gap-4">
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {order.items.map((i: any) => i.productTitle).join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Oleh: {order.buyerName} • {order.createdAt}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-accent flex-shrink-0">
                    +{formatIDR(order.totalAmount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Mini Guidelines */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-bold">Tips Penjualan Digital</h3>
          <ul className="text-xs text-muted-foreground space-y-3 list-disc pl-4">
            <li>
              <span className="text-foreground font-semibold">Gunakan Google Drive Link yang Tepat</span>: Pastikan file diatur ke "Anyone with the link can view".
            </li>
            <li>
              <span className="text-foreground font-semibold">Tampilan Preview Menarik</span>: Gunakan thumbnail yang memiliki kontras tinggi untuk menarik perhatian pembeli.
            </li>
            <li>
              <span className="text-foreground font-semibold">Detail Teknis Jelas</span>: Tulis format file, ukuran file, dan software yang direkomendasikan.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
