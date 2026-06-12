"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, orderBy } from "firebase/firestore";
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    className={className}
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

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
                        <div className="flex flex-col gap-2 items-start">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            Pending
                          </span>
                          <a
                            href={`https://wa.me/6283848538388?text=Halo%20Admin,%20saya%20ingin%20bertanya%20mengenai%20status%20produk%20saya%20yang%20berjudul%20"${encodeURIComponent(p.title)}"`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded text-[10px] font-semibold hover:bg-[#25D366]/20 transition-colors"
                          >
                            <WhatsappIcon className="w-3 h-3" />
                            Chat Admin
                          </a>
                        </div>
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
