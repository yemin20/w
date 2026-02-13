"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

type BankAccount = {
  id: string;
  bankName: string;
  branch: string;
  iban: string;
  currency: string;
  order: number;
  isActive: boolean;
};

export default function AdminBankAccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    bankName: "",
    branch: "",
    iban: "",
    currency: "TRY",
    order: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    const res = await fetch("/api/admin/bank-accounts", {
      credentials: "include",
    });
    const data = await res.json();
    if (data.accounts) setAccounts(data.accounts);
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      bankName: "",
      branch: "",
      iban: "",
      currency: "TRY",
      order: accounts.length,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (a: BankAccount) => {
    setEditingId(a.id);
    setForm({
      bankName: a.bankName,
      branch: a.branch,
      iban: a.iban,
      currency: a.currency,
      order: a.order,
      isActive: a.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      bankName: form.bankName,
      branch: form.branch,
      iban: form.iban.replace(/\s/g, "").toUpperCase(),
      currency: form.currency,
      order: form.order,
      isActive: form.isActive,
    };

    try {
      const url = editingId
        ? `/api/admin/bank-accounts/${editingId}`
        : "/api/admin/bank-accounts";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? data.error ?? "İşlem başarısız");
        return;
      }
      setModalOpen(false);
      fetchAccounts();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu banka hesabını silmek istediğinize emin misiniz?"))
      return;
    const res = await fetch(`/api/admin/bank-accounts/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok) {
      fetchAccounts();
    } else {
      alert(data.message ?? "Silinemedi");
    }
  };

  const formatIban = (iban: string) => {
    return iban.replace(/(.{4})/g, "$1 ").trim();
  };

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Banka Hesapları</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#009044] text-white rounded-lg hover:bg-[#007a38] transition"
        >
          <Plus className="w-4 h-4" />
          Yeni Hesap Ekle
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Yükleniyor...</p>
      ) : accounts.length === 0 ? (
        <p className="text-gray-500 py-8">
          Henüz banka hesabı yok. Yeni eklemek için yukarıdaki butonu kullanın.
        </p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                  Banka
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                  Şube
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                  IBAN
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                  Durum
                </th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-gray-100 hover:bg-gray-50/50"
                >
                  <td className="px-4 py-3 font-medium">{a.bankName}</td>
                  <td className="px-4 py-3 text-gray-600">{a.branch}</td>
                  <td className="px-4 py-3 font-mono text-sm">
                    {formatIban(a.iban)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        a.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {a.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(a)}
                        className="p-1.5 text-[#009044] hover:bg-green-50 rounded"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingId ? "Banka Hesabı Düzenle" : "Yeni Banka Hesabı Ekle"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banka Adı
                  </label>
                  <input
                    type="text"
                    value={form.bankName}
                    onChange={(e) =>
                      setForm({ ...form, bankName: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#009044]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şube
                  </label>
                  <input
                    type="text"
                    value={form.branch}
                    onChange={(e) =>
                      setForm({ ...form, branch: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#009044]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IBAN (TR ile başlamalı)
                  </label>
                  <input
                    type="text"
                    value={form.iban}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        iban: e.target.value.replace(/\s/g, "").toUpperCase(),
                      })
                    }
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    className="w-full border rounded-lg px-3 py-2 font-mono focus:ring-2 focus:ring-[#009044]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Para Birimi
                  </label>
                  <select
                    value={form.currency}
                    onChange={(e) =>
                      setForm({ ...form, currency: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#009044]"
                  >
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
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
                {error && <p className="text-red-600 text-sm">{error}</p>}
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
