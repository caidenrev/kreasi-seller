"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, orderBy } from "firebase/firestore";
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; title: string } | null>(null);

  const fetchProducts = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(
        collection(db, "products"),
        where("sellerId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error fetching products list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleActive = async (id: string, currentVal: boolean) => {
    try {
      const docRef = doc(db, "products", id);
      await updateDoc(docRef, { isActive: !currentVal });
      setProducts(products.map((p) => (p.id === id ? { ...p, isActive: !currentVal } : p)));
    } catch (err) {
      console.error("Error toggling product status:", err);
    }
  };

  const handleDeleteProduct = (id: string, title: string) => {
    setProductToDelete({ id, title });
    setShowDeleteModal(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await deleteDoc(doc(db, "products", productToDelete.id));
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.reviewStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <div className="flex justify-between items-center">
          <div className="h-10 bg-surface rounded w-1/4"></div>
          <div className="h-10 bg-surface rounded w-32"></div>
        </div>
        <div className="h-96 bg-surface rounded-xl border border-border"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Manajemen Produk</h1>
          <p className="text-muted-foreground text-sm mt-1">Daftar semua produk kreatif yang Anda tawarkan.</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="bg-accent hover:bg-accent-hover text-black font-bold px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Upload Produk
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-surface border border-border rounded-xl p-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul produk..."
            className="w-full bg-surface-2 border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-2 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            Tidak ada produk ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-surface-2">
                  <th className="px-6 py-4">Thumbnail</th>
                  <th className="px-6 py-4">Judul</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Harga</th>
                  <th className="px-6 py-4">Status Review</th>
                  <th className="px-6 py-4">Total Sales</th>
                  <th className="px-6 py-4">Aktif</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-6 py-4">
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        className="w-12 h-12 rounded bg-surface-2 border border-border object-cover"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground max-w-[200px] truncate">{p.title}</div>
                      <div className="text-xs text-muted-foreground">/{p.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground capitalize">{p.category}</td>
                    <td className="px-6 py-4 font-semibold text-foreground">{formatIDR(p.price)}</td>
                    <td className="px-6 py-4">
                      {p.reviewStatus === "approved" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                          Approved
                        </span>
                      )}
                      {p.reviewStatus === "pending" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                          Pending
                        </span>
                      )}
                      {p.reviewStatus === "rejected" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20" title={p.reviewNote}>
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">{p.totalSales || 0}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(p.id, p.isActive)}
                        className={`text-xs p-1.5 rounded-lg border transition-colors ${
                          p.isActive
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                        }`}
                      >
                        {p.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/dashboard/products/${p.id}`}
                        className="inline-flex items-center p-2 rounded-lg bg-surface-3 hover:bg-accent hover:text-black transition-colors text-foreground"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.title)}
                        className="inline-flex items-center p-2 rounded-lg bg-surface-3 hover:bg-red-500/20 hover:text-red-400 transition-colors text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[425px]" aria-describedby="dialog-description">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Produk</DialogTitle>
            <DialogDescription id="dialog-description" className="py-4">
              Apakah Anda yakin ingin menghapus produk <strong>"{productToDelete?.title}"</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProduct}>
              Hapus Produk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
