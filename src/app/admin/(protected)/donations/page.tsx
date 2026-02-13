"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  fixedPrice: number | null;
  targetAmount: number | null;
  collected: number;
  isActive: boolean;
  order: number;
  _count: { donations: number };
};

export default function AdminDonationsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    fixedPrice: "" as string | number,
    targetAmount: "" as string | number,
    isActive: true,
    order: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    const res = await fetch("/api/admin/donations/categories", {
      credentials: "include",
    });
    const data = await res.json();
    if (data.categories) setCategories(data.categories);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      image: "",
      fixedPrice: "",
      targetAmount: "",
      isActive: true,
      order: categories.length,
    });
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      description: c.description,
      image: c.image ?? "",
      fixedPrice: c.fixedPrice ?? "",
      targetAmount: c.targetAmount ?? "",
      isActive: c.isActive,
      order: c.order,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      name: form.name,
      description: form.description,
      image: form.image.trim() || null,
      fixedPrice: form.fixedPrice ? parseFloat(String(form.fixedPrice)) : null,
      targetAmount: form.targetAmount ? parseFloat(String(form.targetAmount)) : null,
      isActive: form.isActive,
      order: form.order,
    };

    try {
      const url = editingId
        ? `/api/admin/donations/categories/${editingId}`
        : "/api/admin/donations/categories";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg =
          data.message ??
          data.details?.fieldErrors
            ? Object.values(data.details.fieldErrors).flat().join(", ")
            : data.error ??
            "İşlem başarısız";
        setError(typeof msg === "string" ? msg : msg?.join?.() ?? "İşlem başarısız");
        return;
      }
      setModalOpen(false);
      fetchCategories();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu bağış kategorisini silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/admin/donations/categories/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok) {
      fetchCategories();
    } else {
      alert(data.message ?? "Silinemedi");
    }
  };

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bağış Kategorileri</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#009044] text-white rounded-lg hover:bg-[#007a38] transition"
        >
          <Plus className="w-4 h-4" />
          Yeni Bağış Ekle
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Yükleniyor...</p>
      ) : categories.length === 0 ? (
        <p className="text-gray-500 py-8">
          Henüz bağış kategorisi yok. Yeni eklemek için yukarıdaki butonu kullanın.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition"
            >
              <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-300" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{c.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {c.description}
                </p>
                <div className="mt-2 flex gap-2 text-sm">
                  {c.fixedPrice != null && (
                    <span className="text-[#009044] font-medium">
                      {c.fixedPrice} ₺
                    </span>
                  )}
                  {c.targetAmount != null && (
                    <span className="text-gray-500">
                      Hedef: {c.targetAmount} ₺
                    </span>
                  )}
                  {c._count.donations > 0 && (
                    <span className="text-gray-500">
                      • {c._count.donations} bağış
                    </span>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => openEdit(c)}
                    className="flex items-center gap-1 px-2 py-1 text-sm text-[#009044] hover:bg-green-50 rounded"
                  >
                    <Pencil className="w-3 h-3" />
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="flex items-center gap-1 px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingId ? "Bağış Kategorisi Düzenle" : "Yeni Bağış Ekle"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bağış Adı
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#009044]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#009044]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Görsel URL
                  </label>
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#009044]"
                  />
                  {form.image && (
                    <div className="mt-2 aspect-video max-w-[200px] rounded overflow-hidden bg-gray-100">
                      <img
                        src={form.image}
                        alt="Önizleme"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sabit Fiyat (₺)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.fixedPrice}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          fixedPrice: e.target.value
                            ? parseFloat(e.target.value)
                            : "",
                        })
                      }
                      placeholder="Boş bırak = serbest"
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#009044]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hedef Miktar (₺)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.targetAmount}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          targetAmount: e.target.value
                            ? parseFloat(e.target.value)
                            : "",
                        })
                      }
                      placeholder="Boş bırak"
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#009044]"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                  />
                  <label htmlFor="isActive" className="text-sm">
                    Aktif (sitede göster)
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sıra
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#009044]"
                  />
                </div>
                {error && (
                  <p className="text-red-600 text-sm">{error}</p>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-[#009044] text-white rounded-lg hover:bg-[#007a38] disabled:opacity-50"
                  >
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
