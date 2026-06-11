"use client";

import { useEffect, useState } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { X } from "lucide-react";

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const docSnap = await getDoc(doc(db, "sellers", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDisplayName(data.displayName || "");
          setUsername(data.username || "");
          setBio(data.bio || "");
          setAvatarUrl(data.avatarUrl || "");
          setPortfolioUrl(data.portfolioUrl || "");
          setBankName(data.bankInfo?.bankName || "");
          setAccountNumber(data.bankInfo?.accountNumber || "");
          setAccountName(data.bankInfo?.accountName || "");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      e.target.value = "";
      return;
    }

    setIsUploadingAvatar(true);
    setUploadProgress(0);

    try {
      const fileExtension = file.name.split(".").pop();
      const fileName = `sellers/avatars/${uuidv4()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error(error);
          toast.error("Gagal mengupload avatar");
          setIsUploadingAvatar(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setAvatarUrl(downloadURL);
          setIsUploadingAvatar(false);
          toast.success("Avatar berhasil diupload");
        }
      );
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat upload");
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    setSuccess(false);

    try {
      const docRef = doc(db, "sellers", user.uid);
      await updateDoc(docRef, {
        displayName,
        username: username.toLowerCase().replace(/[^a-z0-9-_]/g, ""),
        bio,
        avatarUrl,
        portfolioUrl,
        bankInfo: {
          bankName,
          accountNumber,
          accountName,
        },
        updatedAt: serverTimestamp(),
      });
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Pengaturan Profil</h1>
        <p className="text-muted-foreground text-sm mt-1">Kelola data profil publik Anda dan konfigurasi rekening bank.</p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl p-4 text-sm font-semibold">
          Profil berhasil diperbarui!
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: General Profile Info */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6 md:p-8 space-y-6">
          <h3 className="text-lg font-bold border-b border-border pb-3 text-foreground">Informasi Umum</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">NAMA TAMPILAN (DISPLAY NAME)</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">USERNAME PROFILE (URL PATH)</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground flex justify-between items-center">
                <span>FOTO PROFIL (MAKS 2MB)</span>
                {isUploadingAvatar && <span className="text-accent text-xs">Uploading... {uploadProgress}%</span>}
              </label>
              <div className="flex gap-4 items-center">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border border-border group shrink-0 bg-surface-2 flex items-center justify-center">
                  {avatarUrl ? (
                    <>
                      <img src={avatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAvatarUrl("")}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">Kosong</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    disabled={isUploadingAvatar}
                    className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-accent cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-accent file:text-black hover:file:bg-accent-hover"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1.5">Disarankan resolusi 1:1 (persegi).</p>
                </div>
              </div>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">PORTFOLIO / WEBSITE LINK</label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">BIO RINGKAS</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tulis biografi singkat tentang Anda sebagai kreator..."
                className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Bank Info */}
        <div className="bg-surface border border-border rounded-xl p-6 md:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b border-border pb-3 text-foreground">Informasi Rekening Bank</h3>
            <p className="text-xs text-muted-foreground">Digunakan untuk pengiriman dana hasil penjualan (withdrawal).</p>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">NAMA BANK</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none"
                >
                  <option value="">Pilih Bank</option>
                  <option value="BCA">BCA (Bank Central Asia)</option>
                  <option value="Mandiri">Bank Mandiri</option>
                  <option value="BNI">BNI (Bank Negara Indonesia)</option>
                  <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                  <option value="CIMB">CIMB Niaga</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">NOMOR REKENING</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 5240xxxxxx"
                  className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">NAMA PEMILIK REKENING</label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Harus sesuai dengan nama rekening"
                  className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || isUploadingAvatar}
            className="w-full bg-accent hover:bg-accent-hover text-black font-bold py-3 rounded-lg text-sm transition-colors mt-6 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : (isUploadingAvatar ? "Mengupload..." : "Simpan Perubahan")}
          </button>
        </div>
      </form>
    </div>
  );
}
