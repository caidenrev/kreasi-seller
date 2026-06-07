"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import ProductForm from "@/components/products/ProductForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData: any) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Anda harus login terlebih dahulu.");
      return;
    }

    setLoading(true);

    try {
      // Get seller name
      const sellerSnap = await getDoc(doc(db, "sellers", user.uid));
      const sellerName = sellerSnap.exists() ? sellerSnap.data().displayName : "Seller";

      const productsRef = collection(db, "products");
      await addDoc(productsRef, {
        ...formData,
        sellerId: user.uid,
        sellerName: sellerName,
        reviewStatus: "pending",
        reviewNote: "",
        reviewedBy: "",
        reviewedAt: null,
        isActive: true,
        isFeatured: false,
        totalSales: 0,
        rating: 0,
        reviewCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard/products";
      }, 1500);
    } catch (err) {
      console.error("Error creating product:", err);
      alert("Gagal menambahkan produk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Upload Produk Baru</h1>
          <p className="text-muted-foreground text-sm mt-1">Masukkan data lengkap untuk review kualitas produk digital Anda.</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl p-4 text-sm font-semibold">
          Produk berhasil disimpan! Mengarahkan ke daftar produk...
        </div>
      )}

      <ProductForm onSubmit={handleSubmit} loading={loading} submitButtonText="Kirim ke Curation Queue" />
    </div>
  );
}
