"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowRight, ShieldCheck, Zap, UploadCloud, CreditCard } from "lucide-react";

export default function SellerLanding() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <Navbar />

      {/* Ambient Glowing Orbs */}
      <div className="absolute pointer-events-none z-0 rounded-full blur-[120px] opacity-40 dark:opacity-20 bg-accent w-[300px] h-[300px] top-0 left-[-100px]"></div>
      <div className="absolute pointer-events-none z-0 rounded-full blur-[120px] opacity-40 dark:opacity-20 bg-purple-500 w-[400px] h-[400px] bottom-[10%] right-[-100px]"></div>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-6 py-24 md:py-32 flex flex-col items-center text-center">
          <motion.div
            className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm font-medium text-accent mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Zap className="mr-2 h-4 w-4" />
            Platform Kreator Digital Tercepat
          </motion.div>
          
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Jualan Produk Digital Tanpa Ribet dengan <span className="text-accent">KREASI.SELLER</span>
          </motion.h1>
          
          <motion.p
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Mulai hasilkan pendapatan dari karya Anda hari ini. Tanpa verifikasi KTP, tanpa proses rumit. Cukup upload ke Google Drive, tempel link, dan dapatkan bayaran!
          </motion.p>
          
          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href="/register"
              className="bg-accent hover:bg-accent-hover text-black px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-accent/25 flex items-center justify-center gap-2"
            >
              Mulai Berjualan <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="bg-surface hover:bg-surface-2 text-foreground border border-border px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
            >
              Masuk ke Dashboard
            </Link>
          </motion.div>
        </section>

        {/* Benefits Section */}
        <section className="bg-surface border-y border-border py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-gradient opacity-30"></div>
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={itemVariants}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Kenapa Memilih KREASI?</h2>
              <p className="mt-4 text-muted-foreground text-lg">Keuntungan yang tidak akan Anda temukan di platform lain.</p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} className="bg-background border border-border rounded-2xl p-8 hover:border-accent transition-colors shadow-sm group">
                <div className="w-14 h-14 rounded-2xl bg-accent/20 group-hover:bg-accent/30 transition-colors flex items-center justify-center mb-6">
                  <ShieldCheck className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Tanpa Verifikasi Identitas</h3>
                <p className="text-muted-foreground leading-relaxed">Lewati proses KYC (KTP/Selfie) yang merepotkan. Cukup daftar menggunakan email dan Anda bisa langsung berjualan detik itu juga.</p>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-background border border-border rounded-2xl p-8 hover:border-accent transition-colors shadow-sm group">
                <div className="w-14 h-14 rounded-2xl bg-accent/20 group-hover:bg-accent/30 transition-colors flex items-center justify-center mb-6">
                  <UploadCloud className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Integrasi Google Drive</h3>
                <p className="text-muted-foreground leading-relaxed">Tidak perlu upload file berukuran raksasa ke server kami. Anda cukup menempelkan link Google Drive Anda, sistem kami yang akan mengirimkannya ke pembeli.</p>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-background border border-border rounded-2xl p-8 hover:border-accent transition-colors shadow-sm group">
                <div className="w-14 h-14 rounded-2xl bg-accent/20 group-hover:bg-accent/30 transition-colors flex items-center justify-center mb-6">
                  <CreditCard className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Potongan Super Rendah</h3>
                <p className="text-muted-foreground leading-relaxed">Nikmati potongan platform yang jauh lebih rendah dibandingkan <i>marketplace</i> digital lainnya. Keuntungan maksimal untuk keringat Anda!</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div 
              className="text-center mb-20"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={itemVariants}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Cara Kerja Sederhana</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Line connector for desktop */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-border z-0"></div>
              
              {[
                { step: "1", title: "Buat Akun", desc: "Daftar hanya dengan alamat email, tanpa verifikasi KTP." },
                { step: "2", title: "Upload & Tautkan", desc: "Upload karya ke GDrive, buat produk baru, dan tautkan link-nya." },
                { step: "3", title: "Terima Bayaran", desc: "Pembeli membayar, sistem otomatis memberi akses, dana masuk ke saldo." }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  className="relative z-10 flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.2 }}
                >
                  <div className="w-24 h-24 rounded-full bg-surface-2 border-[6px] border-background shadow-xl flex items-center justify-center text-3xl font-black text-accent mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="pb-24">
          <div className="mx-auto max-w-4xl px-6">
            <motion.div 
              className="bg-accent/10 border border-accent/30 rounded-3xl p-10 md:p-16 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Siap Menghasilkan Uang dari Karya Anda?</h2>
              <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">Bergabunglah dengan kreator lainnya yang sudah mengubah *passion* mereka menjadi penghasilan nyata di KREASI.ID.</p>
              <Link
                href="/register"
                className="inline-flex bg-accent hover:bg-accent-hover text-black px-10 py-5 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-3"
              >
                Daftar Sekarang <ArrowRight className="w-6 h-6" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
