"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import ProductForm from "@/components/products/ProductForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, "products", id as string));
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Verify owner
          if (data.sellerId !== auth.currentUser?.uid) {
            alert("Akses ditolak. Anda bukan pemilik produk ini.");
            window.location.href = "/dashboard/products";
            return;
          }
          setProduct({ id: docSnap.id, ...data });
        } else {
          alert("Produk tidak ditemukan.");
          window.location.href = "/dashboard/products";
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSubmit = async (formData: any) => {
    if (!id || !product) return;
    setLoading(true);

    try {
      const docRef = doc(db, "products", id as string);
      
      // If product was already approved or rejected, changing it returns status to pending
      const updatedStatus = "pending";

      await updateDoc(docRef, {
        ...formData,
        reviewStatus: updatedStatus,
        updatedAt: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard/products";
      }, 1500);
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Gagal memperbarui produk.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Edit Produk</h1>
          <p className="text-muted-foreground text-sm mt-1">Mengubah data produk akan mengirim ulang produk ke Curation Queue.</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl p-4 text-sm font-semibold">
          Perubahan berhasil disimpan! Mengarahkan ke daftar produk...
        </div>
      )}

      {product && (
        <ProductForm
          initialData={product}
          onSubmit={handleSubmit}
          loading={loading}
          submitButtonText="Simpan & Kirim Ulang ke Review"
        />
      )}
    </div>
  );
}
