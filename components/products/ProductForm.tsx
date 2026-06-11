"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const productSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  slug: z.string().min(3, "Slug minimal 3 karakter"),
  shortDescription: z.string().min(10, "Deskripsi singkat minimal 10 karakter"),
  description: z.string().min(20, "Deskripsi detail minimal 20 karakter"),
  category: z.string(),
  tags: z.array(z.string()).min(1, "Minimal 1 tag"),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  originalPrice: z.coerce.number().optional(),
  thumbnail: z.string().min(1, "Thumbnail wajib diupload"),
  previewImages: z.array(z.string().url("URL tidak valid")),
  driveLink: z.string().url("URL tidak valid").includes("drive.google.com", { message: "Harus berupa link Google Drive" }),
  fileFormats: z.array(z.string()).min(1, "Pilih minimal 1 format"),
  fileSize: z.string().min(1, "Ukuran file wajib diisi"),
  softwareRequired: z.string().min(1, "Software wajib diisi"),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  submitButtonText: string;
}

export default function ProductForm({
  initialData,
  onSubmit,
  loading,
  submitButtonText,
}: ProductFormProps) {
  const [tagInput, setTagInput] = useState("");
  const [previewInput, setPreviewInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const availableFormats = ["PSD", "AI", "Figma", "Sketch", "PDF", "OTF", "TTF", "MP4", "MOV", "PNG", "JPEG", "ZIP"];

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      slug: "",
      shortDescription: "",
      description: "",
      category: "template",
      tags: [],
      price: 0,
      originalPrice: 0,
      thumbnail: "",
      previewImages: [],
      driveLink: "",
      fileFormats: [],
      fileSize: "",
      softwareRequired: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        originalPrice: initialData.originalPrice || 0,
        tags: initialData.tags || [],
        previewImages: initialData.previewImages || [],
        fileFormats: initialData.fileFormats || [],
        softwareRequired: initialData.softwareRequired ? initialData.softwareRequired.join(", ") : "",
      });
    }
  }, [initialData, form]);

  const watchTitle = form.watch("title");
  useEffect(() => {
    if (!initialData && watchTitle) {
      const generatedSlug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      form.setValue("slug", generatedSlug);
    }
  }, [watchTitle, initialData, form]);

  const handleAddTag = () => {
    const cleanTag = tagInput.trim().toLowerCase();
    const currentTags = form.getValues("tags");
    if (cleanTag && !currentTags.includes(cleanTag)) {
      form.setValue("tags", [...currentTags, cleanTag], { shouldValidate: true });
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    const currentTags = form.getValues("tags");
    form.setValue("tags", currentTags.filter((_, i) => i !== index), { shouldValidate: true });
  };

  const handleThumbnailSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (maks 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExtension = file.name.split(".").pop();
      const fileName = `products/thumbnails/${uuidv4()}.${fileExtension}`;
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
          toast.error("Gagal mengupload gambar");
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          form.setValue("thumbnail", downloadURL, { shouldValidate: true });
          setIsUploading(false);
          toast.success("Gambar berhasil diupload");
        }
      );
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat upload");
      setIsUploading(false);
    }
  };

  const handleAddPreview = () => {
    const cleanUrl = previewInput.trim();
    const currentPreviews = form.getValues("previewImages");
    if (cleanUrl && !currentPreviews.includes(cleanUrl)) {
      form.setValue("previewImages", [...currentPreviews, cleanUrl], { shouldValidate: true });
      setPreviewInput("");
    }
  };

  const handleRemovePreview = (index: number) => {
    const currentPreviews = form.getValues("previewImages");
    form.setValue("previewImages", currentPreviews.filter((_, i) => i !== index), { shouldValidate: true });
  };

  const handleFormSubmit = async (values: ProductFormValues) => {
    const payload = {
      ...values,
      originalPrice: values.originalPrice ? values.originalPrice : undefined,
      softwareRequired: values.softwareRequired.split(",").map((s) => s.trim()).filter(Boolean),
    };
    await onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8 bg-surface border border-border rounded-xl p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-muted-foreground text-xs font-semibold">JUDUL PRODUK</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 50+ Premium Presentation Slides" className="bg-surface-2 border-border text-foreground focus-visible:ring-accent" {...field} />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-muted-foreground text-xs font-semibold">SLUG (URL PATH)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 50-premium-presentation-slides" className="bg-surface-2 border-border text-foreground focus-visible:ring-accent" {...field} />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-muted-foreground text-xs font-semibold">KATEGORI</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-surface-2 border-border text-foreground focus:ring-accent">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-surface-2 border-border text-foreground">
                    <SelectItem value="template">Template Desain</SelectItem>
                    <SelectItem value="preset">Preset Lightroom / LUTS</SelectItem>
                    <SelectItem value="motion">Motion Template</SelectItem>
                    <SelectItem value="font">Typography / Font</SelectItem>
                    <SelectItem value="asset">3D Asset / Illustration</SelectItem>
                    <SelectItem value="other">Format Digital Lainnya</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shortDescription"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-muted-foreground text-xs font-semibold">DESKRIPSI SINGKAT</FormLabel>
                <FormControl>
                  <Input placeholder="Penjelasan ringkas produk dalam 1 kalimat" className="bg-surface-2 border-border text-foreground focus-visible:ring-accent" {...field} />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-1 md:col-span-2">
                <FormLabel className="text-muted-foreground text-xs font-semibold">DESKRIPSI DETAIL</FormLabel>
                <FormControl>
                  <Textarea rows={6} placeholder="Jelaskan apa saja yang didapat, kelebihan produk..." className="bg-surface-2 border-border text-foreground focus-visible:ring-accent" {...field} />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-muted-foreground text-xs font-semibold">HARGA JUAL (IDR)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 50000" className="bg-surface-2 border-border text-foreground focus-visible:ring-accent" {...field} />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="originalPrice"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-muted-foreground text-xs font-semibold">HARGA CORET / ASLI (OPSIONAL - IDR)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 150000" className="bg-surface-2 border-border text-foreground focus-visible:ring-accent" {...field} />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="thumbnail"
            render={({ field }) => (
              <FormItem className="space-y-1 md:col-span-2">
                <FormLabel className="text-muted-foreground text-xs font-semibold flex justify-between items-center">
                  <span>THUMBNAIL UTAMA (MAKS 2MB)</span>
                  {isUploading && <span className="text-accent text-xs">Uploading... {uploadProgress}%</span>}
                </FormLabel>
                <div className="flex gap-4 items-start">
                  {field.value ? (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border group shrink-0">
                      <img src={field.value} alt="Thumbnail preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => form.setValue("thumbnail", "")}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-lg border border-dashed border-border flex items-center justify-center bg-surface-2 shrink-0">
                      <span className="text-xs text-muted-foreground">Belum ada</span>
                    </div>
                  )}
                  <FormControl>
                    <div className="flex-1">
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={handleThumbnailSelect}
                        disabled={isUploading}
                        className="bg-surface-2 border-border text-foreground focus-visible:ring-accent cursor-pointer" 
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Pilih gambar berukuran 16:9 untuk hasil terbaik.
                      </p>
                    </div>
                  </FormControl>
                </div>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <div className="space-y-2 md:col-span-2">
            <FormLabel className="text-muted-foreground text-xs font-semibold">URL PREVIEW TAMBAHAN (DI CAROUSEL)</FormLabel>
            <div className="flex gap-2">
              <Input
                type="url"
                value={previewInput}
                onChange={(e) => setPreviewInput(e.target.value)}
                placeholder="e.g. https://images.unsplash.com/..."
                className="flex-1 bg-surface-2 border-border text-foreground focus-visible:ring-accent"
              />
              <Button type="button" onClick={handleAddPreview} variant="secondary" className="bg-surface-3 text-foreground hover:bg-accent hover:text-black">
                Tambah
              </Button>
            </div>
            {form.watch("previewImages").length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {form.watch("previewImages").map((url, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-surface-2 border border-border rounded-lg px-2.5 py-1 text-xs text-foreground">
                    <span className="truncate max-w-[200px]">{url}</span>
                    <button type="button" onClick={() => handleRemovePreview(i)} className="text-red-400 hover:text-red-500">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {form.formState.errors.previewImages && (
              <p className="text-[0.8rem] font-medium text-red-400">{form.formState.errors.previewImages.message}</p>
            )}
          </div>

          <FormField
            control={form.control}
            name="driveLink"
            render={({ field }) => (
              <FormItem className="space-y-1 md:col-span-2">
                <FormLabel className="text-muted-foreground text-xs font-semibold flex items-center gap-1.5">
                  LINK FILE PRODUK (GOOGLE DRIVE) <span className="text-accent font-bold">*PRIVATE*</span>
                </FormLabel>
                <FormControl>
                  <Input type="url" placeholder="e.g. https://drive.google.com/file/d/..." className="bg-surface-2 border-border text-foreground focus-visible:ring-accent" {...field} />
                </FormControl>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Pastikan file sudah di-share ke Publik ("Anyone with the link can view").
                </p>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fileFormats"
            render={() => (
              <FormItem className="space-y-2 md:col-span-2">
                <FormLabel className="text-muted-foreground text-xs font-semibold">FORMAT FILE</FormLabel>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {availableFormats.map((format) => (
                    <FormField
                      key={format}
                      control={form.control}
                      name="fileFormats"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={format}
                            className="flex flex-row items-start space-x-3 space-y-0 bg-surface-2 border border-border rounded-lg p-3"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(format)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, format])
                                    : field.onChange(field.value?.filter((value) => value !== format));
                                }}
                                className="border-[#888888] data-[state=checked]:bg-accent data-[state=checked]:text-black"
                              />
                            </FormControl>
                            <FormLabel className="font-normal text-xs cursor-pointer text-foreground">
                              {format}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fileSize"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-muted-foreground text-xs font-semibold">UKURAN FILE (e.g. 45 MB)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 150 MB" className="bg-surface-2 border-border text-foreground focus-visible:ring-accent" {...field} />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="softwareRequired"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-muted-foreground text-xs font-semibold">SOFTWARE DIBUTUHKAN (KOMMA-SEPARATED)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Figma, Adobe Photoshop CC 2022" className="bg-surface-2 border-border text-foreground focus-visible:ring-accent" {...field} />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <div className="space-y-2 md:col-span-2">
            <FormLabel className="text-muted-foreground text-xs font-semibold">TAGS / KATA KUNCI</FormLabel>
            <div className="flex gap-2">
              <Input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g. presentation, minimal, dark"
                className="flex-1 bg-surface-2 border-border text-foreground focus-visible:ring-accent"
              />
              <Button type="button" onClick={handleAddTag} variant="secondary" className="bg-surface-3 text-foreground hover:bg-accent hover:text-black">
                Tambah Tag
              </Button>
            </div>
            {form.watch("tags").length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {form.watch("tags").map((tag, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-accent/10 border border-accent/20 rounded-full px-3 py-1 text-xs text-accent">
                    <span>#{tag}</span>
                    <button type="button" onClick={() => handleRemoveTag(i)} className="hover:text-foreground">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {form.formState.errors.tags && (
              <p className="text-[0.8rem] font-medium text-red-400">{form.formState.errors.tags.message}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || isUploading}
          className="w-full md:w-auto bg-accent hover:bg-accent-hover text-black font-bold px-8 py-6 rounded-lg text-sm transition-colors mt-8"
        >
          {loading ? "Memproses..." : (isUploading ? "Mengupload..." : submitButtonText)}
        </Button>
      </form>
    </Form>
  );
}
