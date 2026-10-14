'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Boxes,
  Upload,
  X,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Eye,
  Layers,
  Wrench,
  CheckCircle2,
  FolderPlus,
  Tag,
  Tent,
  Flame,
  Compass,
  Mountain,
  Utensils,
  Backpack,
  Lamp,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, getStatusBadgeStyle } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export interface AdminProductItem {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  categoryId: string;
  pricePerDay: number;
  cleaningDays: number;
  isActive: boolean;
  image: string;
  totalUnits: number;
  availableCount: number;
  rentedCount: number;
  cleaningCount: number;
  maintenanceCount: number;
  reservedCount: number;
  units: {
    id: string;
    code: string;
    status: string;
    notes: string | null;
  }[];
}

export interface AdminCategoryItem {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  productCount?: number;
}

interface InventoryManagerProps {
  products: AdminProductItem[];
  categories: AdminCategoryItem[];
}

export default function InventoryManager({ products: initialProducts, categories }: InventoryManagerProps) {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProductItem[]>(initialProducts);
  const [categoriesList, setCategoriesList] = useState<AdminCategoryItem[]>(categories);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Category Management Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('tent');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryFeedback, setCategoryFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add Product Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [pricePerDay, setPricePerDay] = useState(50000);
  const [capacity, setCapacity] = useState(4);
  const [cleaningDays, setCleaningDays] = useState(2);
  const [weightKg, setWeightKg] = useState(3.5);
  const [dimension, setDimension] = useState('200 x 200 x 130 cm');
  const [description, setDescription] = useState('');
  const [unitPrefix, setUnitPrefix] = useState('TND-NEW');
  const [initialUnitCount, setInitialUnitCount] = useState(4);
  const [includedInput, setIncludedInput] = useState('Flysheet, Inner, Frame, Pasak, Tas');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manage Units Modal
  const [activeUnitsProduct, setActiveUnitsProduct] = useState<AdminProductItem | null>(null);
  const [newUnitCode, setNewUnitCode] = useState('');

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (selectedCategory && p.categoryId !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.categoryName.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Handle local image file upload (convert to Base64 data URL per PRD 4.2)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (uploadedImages.length + files.length > 6) {
      alert('Maksimal 6 gambar per produk (PRD 4.2)');
      return;
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const includedItems = includedInput.split(',').map((s) => s.trim()).filter(Boolean);

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          categoryId,
          pricePerDay,
          capacity,
          cleaningDays,
          weightKg,
          dimension,
          description,
          unitPrefix,
          initialUnitCount,
          includedItems,
          images: uploadedImages.length > 0 ? uploadedImages : ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        router.refresh();
        window.location.reload();
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal menambah produk.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add individual unit
  const handleAddUnit = async () => {
    if (!activeUnitsProduct || !newUnitCode) return;
    try {
      const res = await fetch(`/api/products/${activeUnitsProduct.id}/units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: newUnitCode }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveUnitsProduct({
          ...activeUnitsProduct,
          totalUnits: activeUnitsProduct.totalUnits + 1,
          availableCount: activeUnitsProduct.availableCount + 1,
          units: [...activeUnitsProduct.units, data.unit],
        });
        setNewUnitCode('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update unit status
  const handleUpdateUnitStatus = async (unitId: string, newStatus: string) => {
    if (!activeUnitsProduct) return;
    try {
      const res = await fetch(`/api/products/${activeUnitsProduct.id}/units`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId, status: newStatus }),
      });
      if (res.ok) {
        setActiveUnitsProduct({
          ...activeUnitsProduct,
          units: activeUnitsProduct.units.map((u) =>
            u.id === unitId ? { ...u, status: newStatus } : u
          ),
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Available icon options for category
  const categoryIconOptions = [
    { id: 'tent', label: 'Tenda', icon: <Tent className="w-4 h-4" /> },
    { id: 'flame', label: 'Kompor', icon: <Flame className="w-4 h-4" /> },
    { id: 'backpack', label: 'Tas / Carrier', icon: <Backpack className="w-4 h-4" /> },
    { id: 'lamp', label: 'Lentera / Lampu', icon: <Lamp className="w-4 h-4" /> },
    { id: 'utensils', label: 'Alat Masak', icon: <Utensils className="w-4 h-4" /> },
    { id: 'mountain', label: 'Trekking Pole', icon: <Mountain className="w-4 h-4" /> },
    { id: 'layers', label: 'Matras & SB', icon: <Layers className="w-4 h-4" /> },
    { id: 'compass', label: 'Navigasi', icon: <Compass className="w-4 h-4" /> },
  ];

  const renderCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'flame': return <Flame className="w-3.5 h-3.5" />;
      case 'backpack': return <Backpack className="w-3.5 h-3.5" />;
      case 'lamp': return <Lamp className="w-3.5 h-3.5" />;
      case 'utensils': return <Utensils className="w-3.5 h-3.5" />;
      case 'mountain': return <Mountain className="w-3.5 h-3.5" />;
      case 'layers': return <Layers className="w-3.5 h-3.5" />;
      case 'compass': return <Compass className="w-3.5 h-3.5" />;
      case 'tent':
      default:
        return <Tent className="w-3.5 h-3.5" />;
    }
  };

  // Handle create category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsCreatingCategory(true);
    setCategoryFeedback(null);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName.trim(),
          icon: newCatIcon,
        }),
      });

      const data = await res.json();
      if (res.ok && data.category) {
        const createdCat: AdminCategoryItem = {
          id: data.category.id,
          name: data.category.name,
          slug: data.category.slug,
          icon: data.category.icon,
          productCount: 0,
        };
        setCategoriesList((prev) => [...prev, createdCat].sort((a, b) => a.name.localeCompare(b.name)));
        setCategoryId(createdCat.id);
        setNewCatName('');
        setCategoryFeedback({
          type: 'success',
          message: `Kategori "${createdCat.name}" berhasil ditambahkan!`,
        });
        router.refresh();
      } else {
        setCategoryFeedback({
          type: 'error',
          message: data.error || 'Gagal menambahkan kategori.',
        });
      }
    } catch (err) {
      setCategoryFeedback({
        type: 'error',
        message: 'Terjadi kesalahan sistem saat menyimpan kategori.',
      });
    } finally {
      setIsCreatingCategory(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text tracking-tight">Inventori & Unit Fisik Peralatan</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Kelola data katalog produk, kategori peralatan, dan status individual setiap unit fisik.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          {/* Button Tambah Kategori */}
          <button
            onClick={() => {
              setCategoryFeedback(null);
              setIsCategoryModalOpen(true);
            }}
            className="px-4 py-2.5 min-h-[44px] bg-accent-mint hover:bg-primary hover:text-white text-primary text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Kelola & Tambah Kategori</span>
          </button>

          {/* Button Tambah Produk */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 min-h-[44px] bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Produk Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-border p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Cari nama produk, kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 sm:py-2 min-h-[44px] md:min-h-0 bg-gray-50 border border-border rounded-xl text-base md:text-xs font-semibold text-text outline-none focus:border-primary focus:bg-white"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto text-xs">
          <span className="text-text-muted font-bold shrink-0">Kategori:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-auto p-2.5 sm:p-2 min-h-[44px] md:min-h-0 bg-gray-50 border border-border rounded-xl font-bold text-text outline-none cursor-pointer text-base md:text-xs"
          >
            <option value="">Semua Kategori ({categoriesList.length})</option>
            {categoriesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MOBILE CARDS VIEW (block md:hidden) */}
      <div className="block md:hidden space-y-3.5">
        {filteredProducts.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-border p-4 shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover border border-border shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{p.categoryName}</span>
                <h4 className="font-bold text-text text-sm line-clamp-1">{p.name}</h4>
                <div className="text-primary font-black text-xs mt-1">
                  {formatCurrency(p.pricePerDay)}<span className="text-[10px] font-medium text-text-muted">/hari</span>
                </div>
              </div>
            </div>

            {/* Units breakdown badges */}
            <div className="grid grid-cols-4 gap-1.5 py-2 border-y border-border/60 text-center">
              <div className="bg-emerald-50 border border-emerald-200/60 rounded-lg p-1.5">
                <span className="text-[10px] block text-emerald-700 font-bold">Siap</span>
                <span className="text-xs font-black text-emerald-800">{p.availableCount}</span>
              </div>
              <div className="bg-teal-50 border border-teal-200/60 rounded-lg p-1.5">
                <span className="text-[10px] block text-teal-700 font-bold">Sewa</span>
                <span className="text-xs font-black text-teal-800">{p.rentedCount}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-1.5">
                <span className="text-[10px] block text-slate-700 font-bold">Cuci</span>
                <span className="text-xs font-black text-slate-800">{p.cleaningCount}</span>
              </div>
              <div className="bg-amber-50 border border-amber-200/60 rounded-lg p-1.5">
                <span className="text-[10px] block text-amber-700 font-bold">Servis</span>
                <span className="text-xs font-black text-amber-800">{p.maintenanceCount}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 gap-2">
              <span className="text-[11px] text-text-muted font-medium">
                Total: <strong className="text-text font-black">{p.totalUnits} unit</strong> ({p.cleaningDays} hari cuci)
              </span>
              <button
                onClick={() => setActiveUnitsProduct(p)}
                className="px-3.5 py-2.5 min-h-[44px] bg-accent-mint hover:bg-primary hover:text-white text-primary rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center shrink-0"
              >
                Kelola {p.units.length} Unit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE VIEW (hidden md:block) */}
      <div className="hidden md:block bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-border text-text-muted font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Produk</th>
                <th className="px-5 py-3.5 text-center">Total Unit</th>
                <th className="px-5 py-3.5 text-center">Tersedia</th>
                <th className="px-5 py-3.5 text-center">Rented</th>
                <th className="px-5 py-3.5 text-center">Cleaning</th>
                <th className="px-5 py-3.5 text-center">Maintenance</th>
                <th className="px-5 py-3.5 text-center">Masa Cuci</th>
                <th className="px-5 py-3.5">Harga Sewa</th>
                <th className="px-5 py-3.5 text-right">Aksi Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-border shrink-0" />
                      <div>
                        <span className="font-bold text-text text-sm block">{p.name}</span>
                        <span className="text-[11px] text-text-muted">{p.categoryName}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-center font-black text-text">
                    {p.totalUnits}
                  </td>

                  <td className="px-5 py-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      {p.availableCount}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
                      {p.rentedCount}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                      {p.cleaningCount}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
                      {p.maintenanceCount}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-center text-text-muted">
                    {p.cleaningDays} Hari
                  </td>

                  <td className="px-5 py-4 font-black text-primary whitespace-nowrap">
                    {formatCurrency(p.pricePerDay)}/hr
                  </td>

                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setActiveUnitsProduct(p)}
                      className="px-3 py-1.5 bg-accent-mint hover:bg-primary hover:text-white text-primary rounded-lg text-xs font-bold transition-all shadow-xs"
                    >
                      Kelola {p.units.length} Unit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: TAMBAH PRODUK BARU + IMAGE UPLOAD (PRD 4.2 & 6.9) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-border shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h2 className="text-xl font-black text-text">Tambah Produk Baru</h2>
                <p className="text-xs text-text-muted mt-0.5">Upload gambar produk dan buat unit fisik awal.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              {/* Product Name */}
              <div>
                <label className="block font-bold text-text mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Tenda Consina Magnum 4P"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 min-h-[44px] md:min-h-0 bg-gray-50 border border-border rounded-xl text-base md:text-xs font-bold text-text outline-none focus:border-primary focus:bg-white"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-text">Kategori *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryFeedback(null);
                        setIsCategoryModalOpen(true);
                      }}
                      className="text-primary hover:text-primary-dark font-bold text-[11px] flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Buat Kategori Baru</span>
                    </button>
                  </div>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 min-h-[44px] md:min-h-0 bg-gray-50 border border-border rounded-xl text-base md:text-xs font-bold text-text outline-none cursor-pointer"
                  >
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-text mb-1">Harga Sewa / Hari (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(Number(e.target.value))}
                    className="w-full p-2.5 min-h-[44px] md:min-h-0 bg-gray-50 border border-border rounded-xl text-base md:text-xs font-bold text-text outline-none"
                  />
                </div>
              </div>

              {/* Capacity, Cleaning Days, Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-text mb-1">Kapasitas (Orang):</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full p-2.5 min-h-[44px] md:min-h-0 bg-gray-50 border border-border rounded-xl text-base md:text-xs font-bold text-text outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-text mb-1">Waktu Cuci/Cleaning (Hari) *:</label>
                  <input
                    type="number"
                    value={cleaningDays}
                    onChange={(e) => setCleaningDays(Number(e.target.value))}
                    className="w-full p-2.5 min-h-[44px] md:min-h-0 bg-gray-50 border border-border rounded-xl text-base md:text-xs font-bold text-text outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-text mb-1">Bobot (kg):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full p-2.5 min-h-[44px] md:min-h-0 bg-gray-50 border border-border rounded-xl text-base md:text-xs font-bold text-text outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-text mb-1">Deskripsi Produk:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Spesifikasi bahan, kelebihan, dan panduan pakai..."
                  className="w-full p-2.5 bg-gray-50 border border-border rounded-xl text-base md:text-xs font-medium text-text outline-none resize-none"
                />
              </div>

              {/* Included Items tags */}
              <div>
                <label className="block font-bold text-text mb-1">Fasilitas / Kelengkapan (pisahkan dengan koma):</label>
                <input
                  type="text"
                  value={includedInput}
                  onChange={(e) => setIncludedInput(e.target.value)}
                  className="w-full p-2.5 min-h-[44px] md:min-h-0 bg-gray-50 border border-border rounded-xl text-base md:text-xs font-medium text-text outline-none"
                />
              </div>

              {/* Image Upload Drag & Drop (PRD 4.2: 1-6 Gambar per produk) */}
              <div className="pt-2">
                <label className="block font-bold text-text mb-2">
                  Upload Foto Produk (1–6 Gambar, Gambar 1 = Foto Utama)
                </label>
                <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-4 text-center bg-gray-50/50 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    id="product-file-input"
                    className="hidden"
                  />
                  <label htmlFor="product-file-input" className="cursor-pointer block">
                    <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                    <span className="font-bold text-primary block">Klik atau Drag & Drop Foto di Sini</span>
                    <span className="text-[10px] text-text-muted">JPG, PNG, WebP maks 5MB per file</span>
                  </label>
                </div>

                {/* Uploaded Thumbnails Preview */}
                {uploadedImages.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 mt-3">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border group">
                        <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedImages(uploadedImages.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-primary/90 text-white text-[8px] font-bold text-center py-0.5">
                            Utama
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Initial Units Generator */}
              <div className="p-4 bg-accent-mint/40 rounded-2xl border border-primary/20 grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-text mb-1">Prefix Kode Unit Fisik:</label>
                  <input
                    type="text"
                    value={unitPrefix}
                    onChange={(e) => setUnitPrefix(e.target.value.toUpperCase())}
                    placeholder="TND-M4"
                    className="w-full p-2 bg-white border border-border rounded-xl font-black text-primary outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-text mb-1">Jumlah Unit Fisik Awal:</label>
                  <input
                    type="number"
                    value={initialUnitCount}
                    onChange={(e) => setInitialUnitCount(Number(e.target.value))}
                    min={1}
                    className="w-full p-2 bg-white border border-border rounded-xl font-bold text-text outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-text font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-primary/20"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Produk & Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: KELOLA UNIT INDIVIDUAL (PRD 6.9: Kode, Status, AvailableAfter, Catatan, Tambah/Hapus Unit) */}
      {activeUnitsProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-border shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <span className="text-xs font-bold text-text-muted uppercase">Manajemen Unit Fisik</span>
                <h2 className="text-xl font-black text-primary mt-0.5">{activeUnitsProduct.name}</h2>
              </div>
              <button
                onClick={() => setActiveUnitsProduct(null)}
                className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add single unit */}
            <div className="p-3 sm:p-4 bg-gray-50 rounded-2xl border border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <input
                type="text"
                placeholder="Kode Unit Baru (misal: TND-M4-010)"
                value={newUnitCode}
                onChange={(e) => setNewUnitCode(e.target.value.toUpperCase())}
                className="flex-1 p-2.5 min-h-[44px] md:min-h-0 bg-white border border-border rounded-xl text-base md:text-xs font-bold text-text uppercase outline-none"
              />
              <button
                onClick={handleAddUnit}
                className="px-4 py-2.5 min-h-[44px] bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 flex items-center justify-center"
              >
                + Tambah Unit
              </button>
            </div>

            {/* Units list */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Daftar Unit Fisik ({activeUnitsProduct.units.length} Unit Terdaftar)
              </h4>

              <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                {activeUnitsProduct.units.map((u) => {
                  const badge = getStatusBadgeStyle(u.status);

                  return (
                    <div key={u.id} className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-black text-text text-sm block">{u.code}</span>
                        <span className="text-[10px] text-text-muted">ID: {u.id.slice(0, 8)}...</span>
                      </div>

                      <div className="flex items-center gap-2.5 flex-wrap">
                        <select
                          value={u.status}
                          onChange={(e) => handleUpdateUnitStatus(u.id, e.target.value)}
                          className="p-2 sm:p-1.5 min-h-[40px] md:min-h-0 bg-gray-50 border border-border rounded-lg text-base md:text-xs font-bold text-text outline-none cursor-pointer"
                        >
                          <option value="AVAILABLE">AVAILABLE (Tersedia)</option>
                          <option value="RENTED">RENTED (Disewa)</option>
                          <option value="CLEANING">CLEANING (Masa Cuci)</option>
                          <option value="MAINTENANCE">MAINTENANCE (Rusak/Servis)</option>
                          <option value="INACTIVE">INACTIVE (Non-aktif)</option>
                        </select>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveUnitsProduct(null)}
                className="px-5 py-2.5 min-h-[44px] bg-gray-100 hover:bg-gray-200 text-text font-bold text-xs rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: KELOLA & TAMBAH KATEGORI BARU */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-border shadow-2xl p-5 sm:p-7 space-y-5 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-accent-mint flex items-center justify-center text-primary shrink-0">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-text">Kelola & Tambah Kategori</h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Buat kategori baru untuk pengelompokan produk dan filter katalog sewa.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Feedback Alert */}
            {categoryFeedback && (
              <div
                className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
                  categoryFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {categoryFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{categoryFeedback.message}</span>
              </div>
            )}

            {/* Form Tambah Kategori Baru */}
            <form onSubmit={handleCreateCategory} className="bg-gray-50/80 p-4 sm:p-5 rounded-2xl border border-border space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Form Tambah Kategori Baru</span>
              </h4>

              {/* Input Nama Kategori */}
              <div>
                <label className="block font-bold text-text mb-1 text-xs">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Lentera & Penerangan, Hammock, dsb."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full p-2.5 min-h-[44px] md:min-h-0 bg-white border border-border rounded-xl text-base md:text-xs font-bold text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* Pilihan Ikon */}
              <div>
                <label className="block font-bold text-text mb-1.5 text-xs">Pilih Ikon Representatif</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categoryIconOptions.map((opt) => {
                    const isSelected = newCatIcon === opt.id;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setNewCatIcon(opt.id)}
                        className={`p-2.5 min-h-[44px] rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-white text-text border-border hover:border-primary/50'
                        }`}
                      >
                        <span className={isSelected ? 'text-white' : 'text-primary'}>{opt.icon}</span>
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isCreatingCategory || !newCatName.trim()}
                  className="w-full py-2.5 min-h-[44px] bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isCreatingCategory ? 'Menyimpan Kategori...' : 'Simpan Kategori Baru'}</span>
                </button>
              </div>
            </form>

            {/* List Kategori yang Sudah Ada */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center justify-between">
                <span>Daftar Kategori Aktif</span>
                <span className="text-[11px] font-semibold text-primary">{categoriesList.length} Kategori Terdaftar</span>
              </h4>

              <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                {categoriesList.map((c) => (
                  <div key={c.id} className="p-3 bg-white flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-accent-mint text-primary flex items-center justify-center shrink-0">
                        {renderCategoryIcon(c.icon)}
                      </div>
                      <div>
                        <span className="font-bold text-text block">{c.name}</span>
                        <span className="text-[10px] text-text-muted font-mono">slug: {c.slug || c.id}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-gray-100 text-text font-bold text-[10px] border border-border shrink-0">
                      {c.productCount ?? 0} Produk
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-full sm:w-auto px-6 py-2.5 min-h-[44px] bg-gray-100 hover:bg-gray-200 text-text font-bold text-xs rounded-xl transition-colors"
              >
                Selesai / Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
