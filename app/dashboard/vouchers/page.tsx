"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Plus, Trash2, Ticket } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const voucherSchema = z.object({
  code: z.string().min(3, "Kode voucher minimal 3 karakter").max(20, "Kode voucher maksimal 20 karakter").toUpperCase(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().min(1, "Nilai diskon harus lebih dari 0"),
  expiresAt: z.string().refine((val) => !isNaN(Date.parse(val)), "Tanggal tidak valid"),
});

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sellerId, setSellerId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof voucherSchema>>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      code: "",
      discountType: "percentage",
      discountValue: 0,
      expiresAt: "",
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setSellerId(user.uid);
        fetchVouchers(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchVouchers = async (uid: string) => {
    try {
      const q = query(collection(db, "vouchers"), where("sellerId", "==", uid));
      const querySnapshot = await getDocs(q);
      const fetchedVouchers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort by createdAt desc
      fetchedVouchers.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      setVouchers(fetchedVouchers);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      toast.error("Gagal memuat daftar voucher.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof voucherSchema>) => {
    if (!sellerId) return;

    // Additional validation
    if (values.discountType === "percentage" && values.discountValue > 100) {
      form.setError("discountValue", { message: "Diskon persentase tidak boleh lebih dari 100%" });
      return;
    }

    // Check if code already exists globally or per seller (here we just allow creation, but normally you'd check if code is unique)
    const q = query(collection(db, "vouchers"), where("code", "==", values.code));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      form.setError("code", { message: "Kode voucher ini sudah digunakan." });
      return;
    }

    try {
      const expiresAtDate = new Date(values.expiresAt);
      
      await addDoc(collection(db, "vouchers"), {
        code: values.code,
        sellerId,
        discountType: values.discountType,
        discountValue: values.discountValue,
        expiresAt: expiresAtDate.toISOString(),
        isActive: true,
        createdAt: serverTimestamp(),
      });

      toast.success("Voucher berhasil dibuat.");
      setIsDialogOpen(false);
      form.reset();
      fetchVouchers(sellerId);
    } catch (error: any) {
      console.error("Error creating voucher:", error);
      toast.error(error.message || "Gagal membuat voucher.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus voucher ini?")) return;
    try {
      await deleteDoc(doc(db, "vouchers", id));
      toast.success("Voucher berhasil dihapus.");
      if (sellerId) fetchVouchers(sellerId);
    } catch (error) {
      console.error("Error deleting voucher:", error);
      toast.error("Gagal menghapus voucher.");
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const isExpired = (expiresAtStr: string) => {
    return new Date(expiresAtStr).getTime() < new Date().getTime();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Voucher Diskon</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola kode voucher diskon untuk pelanggan Anda.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent-hover text-black font-bold">
              <Plus className="w-4 h-4 mr-2" />
              Buat Voucher
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-surface border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Buat Voucher Baru</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Kode Voucher</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Misal: PROMO20"
                          className="bg-surface-2 border-border text-foreground focus-visible:ring-accent"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Tipe Diskon</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-surface-2 border-border text-foreground">
                              <SelectValue placeholder="Pilih tipe" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="percentage">Persentase (%)</SelectItem>
                            <SelectItem value="fixed">Nominal (Rp)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Nilai Diskon</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="bg-surface-2 border-border text-foreground focus-visible:ring-accent"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Berlaku Sampai (Tanggal & Waktu)</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          className="bg-surface-2 border-border text-foreground focus-visible:ring-accent"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent-hover text-black font-bold mt-2"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Voucher"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-surface border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Kode</TableHead>
                  <TableHead className="text-muted-foreground">Diskon</TableHead>
                  <TableHead className="text-muted-foreground">Berlaku Sampai</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.length === 0 ? (
                  <TableRow className="border-border">
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Belum ada voucher yang dibuat.
                    </TableCell>
                  </TableRow>
                ) : (
                  vouchers.map((v) => {
                    const expired = isExpired(v.expiresAt);
                    return (
                      <TableRow key={v.id} className="border-border hover:bg-surface-2/50">
                        <TableCell className="font-semibold text-foreground flex items-center gap-2">
                          <Ticket className="w-4 h-4 text-accent" />
                          {v.code}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {v.discountType === "percentage"
                            ? `${v.discountValue}%`
                            : formatIDR(v.discountValue)}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {format(new Date(v.expiresAt), "dd MMM yyyy, HH:mm", { locale: idLocale })}
                        </TableCell>
                        <TableCell>
                          {expired ? (
                            <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">
                              Kadaluarsa
                            </Badge>
                          ) : v.isActive ? (
                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                              Aktif
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20">
                              Nonaktif
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(v.id)}
                            className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
