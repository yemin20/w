"use client";

import { useState, useEffect } from "react";
import { Check, X, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import {
  defaultVolunteerFormConfig,
  generateFieldId,
  type VolunteerFormConfig,
  type VolunteerFormField,
  type VolunteerFieldType,
  type VolunteerFieldOption,
} from "@/lib/volunteer-form";

type Application = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  reason: string;
  data?: Record<string, unknown> | null;
  status: string;
  createdAt: string;
};

const FIELD_TYPES: { value: VolunteerFieldType; label: string }[] = [
  { value: "text", label: "Metin" },
  { value: "email", label: "E-posta" },
  { value: "tel", label: "Telefon" },
  { value: "textarea", label: "Çok satırlı metin" },
  { value: "radio", label: "Tek seçim (radio)" },
  { value: "checkbox", label: "Çoklu seçim (checkbox)" },
];

export default function AdminVolunteerPage() {
  const [tab, setTab] = useState<"applications" | "form">("applications");
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [formConfig, setFormConfig] = useState<VolunteerFormConfig>(defaultVolunteerFormConfig);
  const [configSaving, setConfigSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  const fetchApplications = async () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", "50");
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/volunteer?${params}`, {
      credentials: "include",
    });
    const data = await res.json();
    if (data.applications) setApplications(data.applications);
    if (data.pagination) setPagination(data.pagination);
    setLoading(false);
  };

  const fetchFormConfig = async () => {
    const res = await fetch("/api/admin/settings?key=volunteer_form", {
      credentials: "include",
    });
    const data = await res.json();
    if (data.value) {
      const cfg = data.value as VolunteerFormConfig;
      if (cfg.fields && Array.isArray(cfg.fields)) {
        setFormConfig({ ...defaultVolunteerFormConfig, ...cfg });
      } else {
        setFormConfig(defaultVolunteerFormConfig);
      }
    } else {
      setFormConfig(defaultVolunteerFormConfig);
    }
  };

  useEffect(() => {
    if (tab === "applications") {
      setLoading(true);
      fetchApplications();
    } else {
      fetchFormConfig();
    }
  }, [tab, statusFilter]);

  const updateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    const res = await fetch(`/api/admin/volunteer/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    if (res.ok) fetchApplications();
  };

  const saveFormConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ key: "volunteer_form", value: formConfig }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
          alert("Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapıp deneyin.");
          window.location.href = "/admin/login?return=/admin/volunteer";
          return;
        }
        throw new Error(data.message || "Kaydetme başarısız.");
      }
      setEditingFieldId(null);
      alert("Form ayarları kaydedildi.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setConfigSaving(false);
    }
  };

  const addField = () => {
    const newField: VolunteerFormField = {
      id: generateFieldId(),
      key: `field_${Date.now()}`,
      label: "Yeni Alan",
      type: "text",
      required: false,
    };
    setFormConfig({
      ...formConfig,
      fields: [...formConfig.fields, newField],
    });
    setEditingFieldId(newField.id);
  };

  const removeField = (id: string) => {
    setFormConfig({
      ...formConfig,
      fields: formConfig.fields.filter((f) => f.id !== id),
    });
    if (editingFieldId === id) setEditingFieldId(null);
  };

  const updateField = (id: string, patch: Partial<VolunteerFormField>) => {
    setFormConfig({
      ...formConfig,
      fields: formConfig.fields.map((f) =>
        f.id === id ? { ...f, ...patch } : f
      ),
    });
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const arr = [...formConfig.fields];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    setFormConfig({ ...formConfig, fields: arr });
  };

  const addOption = (fieldId: string) => {
    updateField(fieldId, {
      options: [
        ...(formConfig.fields.find((f) => f.id === fieldId)?.options ?? []),
        { value: "seçenek", label: "Seçenek" },
      ],
    });
  };

  const updateOption = (
    fieldId: string,
    optIndex: number,
    patch: Partial<VolunteerFieldOption>
  ) => {
    const field = formConfig.fields.find((f) => f.id === fieldId);
    if (!field?.options) return;
    const opts = [...field.options];
    opts[optIndex] = { ...opts[optIndex], ...patch };
    updateField(fieldId, { options: opts });
  };

  const removeOption = (fieldId: string, optIndex: number) => {
    const field = formConfig.fields.find((f) => f.id === fieldId);
    if (!field?.options) return;
    const opts = field.options.filter((_, i) => i !== optIndex);
    updateField(fieldId, { options: opts });
  };

  const statusBadge = (s: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-amber-100 text-amber-700",
      APPROVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
    };
    const labels: Record<string, string> = {
      PENDING: "Beklemede",
      APPROVED: "Onaylandı",
      REJECTED: "Reddedildi",
    };
    return (
      <span className={`px-2 py-1 rounded text-sm ${styles[s] ?? "bg-gray-100"}`}>
        {labels[s] ?? s}
      </span>
    );
  };

  /** Başvurudan tüm alanları oku (data varsa oradan, yoksa eski kolonlardan) */
  const getApplicationDisplay = (app: Application) => {
    const d = app.data as Record<string, unknown> | undefined;
    const fmt = (v: unknown): string => {
      if (Array.isArray(v)) return v.join(", ");
      return typeof v === "string" ? v : String(v ?? "");
    };
    if (d && typeof d === "object" && Object.keys(d).length > 0) {
      return {
        ...app,
        displayFields: d,
        fullName: fmt(d.fullName) || app.fullName,
        email: fmt(d.email) || app.email,
        phone: fmt(d.phone) || app.phone,
      };
    }
    return {
      ...app,
      displayFields: {
        fullName: app.fullName,
        email: app.email,
        phone: app.phone,
        reason: app.reason,
      },
    };
  };

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setTab("applications")}
          className={`pb-3 px-1 font-medium ${
            tab === "applications"
              ? "text-[#009044] border-b-2 border-[#009044]"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Başvurular
        </button>
        <button
          onClick={() => setTab("form")}
          className={`pb-3 px-1 font-medium ${
            tab === "form"
              ? "text-[#009044] border-b-2 border-[#009044]"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Form Ayarları
        </button>
      </div>

      {tab === "applications" && (
        <>
          <div className="flex gap-4 mb-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#009044]"
            >
              <option value="">Tümü</option>
              <option value="PENDING">Beklemede</option>
              <option value="APPROVED">Onaylandı</option>
              <option value="REJECTED">Reddedildi</option>
            </select>
          </div>

          {loading ? (
            <p className="text-gray-500">Yükleniyor...</p>
          ) : applications.length === 0 ? (
            <p className="text-gray-500 py-8">Henüz başvuru yok.</p>
          ) : (
            <div className="space-y-2">
              {applications.map((app) => {
                const disp = getApplicationDisplay(app);
                return (
                  <div
                    key={app.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() =>
                        setExpandedId(expandedId === app.id ? null : app.id)
                      }
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{disp.fullName}</span>
                        <span className="text-gray-500 ml-2">
                          • {disp.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {statusBadge(app.status)}
                        {app.status === "PENDING" && (
                          <div
                            className="flex gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() =>
                                updateStatus(app.id, "APPROVED")
                              }
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                              title="Onayla"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                updateStatus(app.id, "REJECTED")
                              }
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Reddet"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {expandedId === app.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {expandedId === app.id && (
                      <div className="px-4 pb-4 pt-0 border-t bg-gray-50/50">
                        <div className="grid gap-2 mt-3 text-sm">
                          {Object.entries(disp.displayFields).map(
                            ([key, val]) => {
                              const v = Array.isArray(val)
                                ? val.join(", ")
                                : String(val ?? "");
                              if (!v) return null;
                              return (
                                <p key={key}>
                                  <span className="text-gray-500 capitalize">
                                    {key}:
                                  </span>{" "}
                                  {v}
                                </p>
                              );
                            }
                          )}
                          <p className="text-gray-500 text-xs">
                            {new Date(app.createdAt).toLocaleString("tr-TR")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "form" && (
        <form
          onSubmit={saveFormConfig}
          className="max-w-2xl space-y-6 bg-white p-6 rounded-xl border border-gray-200"
        >
          <h3 className="font-semibold text-gray-900">
            Gönüllü Formu Yapılandırması
          </h3>
          <p className="text-sm text-gray-500">
            Alan ekleyip çıkarabilir, metin/radio/checkbox türlerini ayarlayabilirsiniz.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Form Başlığı
            </label>
            <input
              type="text"
              value={formConfig.title}
              onChange={(e) =>
                setFormConfig({ ...formConfig, title: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gönder Butonu Metni
            </label>
            <input
              type="text"
              value={formConfig.submitText}
              onChange={(e) =>
                setFormConfig({ ...formConfig, submitText: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Başarı Mesajı
            </label>
            <input
              type="text"
              value={formConfig.successMessage}
              onChange={(e) =>
                setFormConfig({
                  ...formConfig,
                  successMessage: e.target.value,
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Form Alanları</h4>
              <button
                type="button"
                onClick={addField}
                className="flex items-center gap-2 px-3 py-2 bg-[#009044] text-white rounded-lg hover:bg-[#007a38] text-sm"
              >
                <Plus className="w-4 h-4" />
                Alan Ekle
              </button>
            </div>
            <div className="space-y-4">
              {formConfig.fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="border rounded-lg p-4 bg-gray-50/50"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => moveField(idx, "up")}
                      disabled={idx === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Yukarı taşı"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveField(idx, "down")}
                      disabled={idx === formConfig.fields.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Aşağı taşı"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium truncate flex-1">
                      {field.label || field.key || "Yeni Alan"}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingFieldId(
                          editingFieldId === field.id ? null : field.id
                        )
                      }
                      className="text-sm text-[#009044] hover:underline"
                    >
                      {editingFieldId === field.id ? "Kapat" : "Düzenle"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeField(field.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {editingFieldId === field.id && (
                    <div className="space-y-3 pt-2 border-t">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Alan key (formda kullanılır)
                        </label>
                        <input
                          type="text"
                          value={field.key}
                          onChange={(e) =>
                            updateField(field.id, {
                              key: e.target.value.replace(/\s/g, "_"),
                            })
                          }
                          placeholder="fullName, email, phone..."
                          className="w-full border rounded px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Etiket
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) =>
                            updateField(field.id, { label: e.target.value })
                          }
                          className="w-full border rounded px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Tür
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateField(field.id, {
                              type: e.target.value as VolunteerFieldType,
                              options:
                                e.target.value === "radio" ||
                                e.target.value === "checkbox"
                                  ? [{ value: "1", label: "Seçenek 1" }]
                                  : undefined,
                            })
                          }
                          className="w-full border rounded px-2 py-1.5 text-sm"
                        >
                          {FIELD_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`req-${field.id}`}
                          checked={field.required ?? false}
                          onChange={(e) =>
                            updateField(field.id, {
                              required: e.target.checked,
                            })
                          }
                        />
                        <label htmlFor={`req-${field.id}`} className="text-sm">
                          Zorunlu
                        </label>
                      </div>
                      {field.type !== "radio" && field.type !== "checkbox" && (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Placeholder
                          </label>
                          <input
                            type="text"
                            value={field.placeholder ?? ""}
                            onChange={(e) =>
                              updateField(field.id, {
                                placeholder: e.target.value,
                              })
                            }
                            className="w-full border rounded px-2 py-1.5 text-sm"
                          />
                        </div>
                      )}
                      {(field.type === "radio" || field.type === "checkbox") && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-gray-500">
                              Seçenekler
                            </label>
                            <button
                              type="button"
                              onClick={() => addOption(field.id)}
                              className="text-xs text-[#009044] hover:underline"
                            >
                              + Ekle
                            </button>
                          </div>
                          <div className="space-y-2">
                            {(field.options ?? []).map((opt, oi) => (
                              <div
                                key={oi}
                                className="flex gap-2 items-center"
                              >
                                <input
                                  type="text"
                                  value={opt.value}
                                  onChange={(e) =>
                                    updateOption(field.id, oi, {
                                      value: e.target.value,
                                    })
                                  }
                                  placeholder="value"
                                  className="flex-1 border rounded px-2 py-1 text-sm"
                                />
                                <input
                                  type="text"
                                  value={opt.label}
                                  onChange={(e) =>
                                    updateOption(field.id, oi, {
                                      label: e.target.value,
                                    })
                                  }
                                  placeholder="label"
                                  className="flex-1 border rounded px-2 py-1 text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeOption(field.id, oi)
                                  }
                                  className="p-1 text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {field.type === "textarea" && (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Satır sayısı
                          </label>
                          <input
                            type="number"
                            min={2}
                            max={20}
                            value={field.rows ?? 4}
                            onChange={(e) =>
                              updateField(field.id, {
                                rows: parseInt(e.target.value, 10) || 4,
                              })
                            }
                            className="w-full border rounded px-2 py-1.5 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={configSaving}
            className="px-4 py-2 bg-[#009044] text-white rounded-lg hover:bg-[#007a38] disabled:opacity-50"
          >
            {configSaving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </form>
      )}
    </div>
  );
}
