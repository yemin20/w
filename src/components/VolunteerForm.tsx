"use client";

import { useState, useEffect } from "react";
import type { VolunteerFormConfig, VolunteerFormField } from "@/lib/volunteer-form";

export default function VolunteerForm() {
  const [config, setConfig] = useState<VolunteerFormConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, string | string[]>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings/volunteer-form")
      .then((res) => res.json())
      .then((data: VolunteerFormConfig) => {
        setConfig(data);
        const initial: Record<string, string | string[]> = {};
        data.fields?.forEach((f) => {
          initial[f.key] = f.type === "checkbox" ? [] : "";
        });
        setFormData(initial);
      })
      .catch(() => setConfig({ fields: [], title: "", submitText: "", successMessage: "" }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data.details?.fieldErrors
            ? Object.values(data.details.fieldErrors).flat().join(", ")
            : data.message || "Başvuru gönderilemedi.";
        throw new Error(msg);
      }

      setSuccess(true);
      const reset: Record<string, string | string[]> = {};
      config.fields?.forEach((f) => {
        reset[f.key] = f.type === "checkbox" ? [] : "";
      });
      setFormData(reset);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: VolunteerFormField
  ) => {
    if (field.type === "checkbox") {
      const opts = field.options ?? [];
      const val = e.target.value;
      setFormData((prev) => {
        const arr = (prev[field.key] as string[]) ?? [];
        const next = arr.includes(val)
          ? arr.filter((x) => x !== val)
          : [...arr, val];
        return { ...prev, [field.key]: next };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [field.key]: e.target.value,
      }));
    }
  };

  const handleRadioChange = (fieldKey: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldKey]: value }));
  };

  const inputClass =
    "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500";

  const renderField = (field: VolunteerFormField) => {
    const value = formData[field.key];

    if (field.type === "textarea") {
      return (
        <textarea
          name={field.key}
          value={(value as string) ?? ""}
          onChange={(e) => handleChange(e, field)}
          placeholder={field.placeholder}
          required={field.required}
          minLength={field.minLength}
          maxLength={field.maxLength}
          rows={field.rows ?? 4}
          className={inputClass}
        />
      );
    }

    if (field.type === "radio") {
      const options = field.options ?? [];
      return (
        <div className="space-y-2">
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2">
              <input
                type="radio"
                name={field.key}
                value={opt.value}
                checked={(value as string) === opt.value}
                onChange={() => handleRadioChange(field.key, opt.value)}
                required={field.required}
                className="w-4 h-4"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      );
    }

    if (field.type === "checkbox") {
      const options = field.options ?? [];
      const selected = (value as string[]) ?? [];
      return (
        <div className="space-y-2">
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={opt.value}
                checked={selected.includes(opt.value)}
                onChange={(e) => handleChange(e, field)}
                className="w-4 h-4 rounded"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      );
    }

    const inputType: string =
      field.type === "email"
        ? "email"
        : field.type === "tel"
          ? "tel"
          : "text";

    return (
      <input
        type={inputType}
        name={field.key}
        value={(value as string) ?? ""}
        onChange={(e) => handleChange(e, field)}
        placeholder={field.placeholder}
        required={field.required}
        minLength={field.minLength}
        maxLength={field.maxLength}
        className={inputClass}
      />
    );
  };

  if (!config || !config.fields?.length) {
    return (
      <div className="max-w-lg mx-auto p-6 text-gray-500 text-center">
        Form yapılandırılmıyor. Lütfen admin panelinden formu düzenleyin.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-lg mx-auto bg-white shadow rounded-lg p-6"
    >
      {config.title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {config.title}
        </h3>
      )}

      {config.fields.map((field) => (
        <div key={field.id}>
          <label className="block text-sm font-medium mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderField(field)}
        </div>
      ))}

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && (
        <p className="text-green-600 text-sm">{config.successMessage}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 transition"
      >
        {loading ? "Gönderiliyor..." : config.submitText}
      </button>
    </form>
  );
}
