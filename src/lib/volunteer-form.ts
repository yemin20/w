/** Gönüllü formu alan tipleri */
export type VolunteerFieldType =
  | "text"
  | "email"
  | "tel"
  | "textarea"
  | "radio"
  | "checkbox";

export type VolunteerFieldOption = {
  value: string;
  label: string;
};

export type VolunteerFormField = {
  id: string;
  key: string; // Form gönderiminde kullanılacak key (benzersiz)
  label: string;
  type: VolunteerFieldType;
  required?: boolean;
  placeholder?: string;
  options?: VolunteerFieldOption[]; // radio ve checkbox için
  minLength?: number;
  maxLength?: number;
  rows?: number; // textarea için
};

export type VolunteerFormConfig = {
  title: string;
  submitText: string;
  successMessage: string;
  /** Liste görünümünde özet için kullanılacak alan key'i (örn: fullName) */
  listDisplayField?: string;
  fields: VolunteerFormField[];
};

/** Varsayılan form konfigürasyonu */
export const defaultVolunteerFormConfig: VolunteerFormConfig = {
  title: "Gönüllü Başvuru Formu",
  submitText: "Gönder",
  successMessage: "Başvurunuz alındı. En kısa sürede değerlendirilecektir.",
  listDisplayField: "fullName",
  fields: [
    {
      id: "f1",
      key: "fullName",
      label: "Ad Soyad",
      type: "text",
      required: true,
      placeholder: "Ad Soyad",
      minLength: 2,
      maxLength: 100,
    },
    {
      id: "f2",
      key: "email",
      label: "E-posta",
      type: "email",
      required: true,
      placeholder: "ornek@email.com",
    },
    {
      id: "f3",
      key: "phone",
      label: "Telefon",
      type: "tel",
      required: true,
      placeholder: "05XXXXXXXXX",
      minLength: 10,
      maxLength: 20,
    },
    {
      id: "f4",
      key: "reason",
      label: "Başvuru Gerekçesi / Mesajınız",
      type: "textarea",
      required: true,
      placeholder:
        "Neden gönüllü olmak istiyorsunuz? Hangi alanlarda destek olabilirsiniz?",
      minLength: 10,
      maxLength: 2000,
      rows: 4,
    },
  ],
};

/** Yeni benzersiz alan id'si üret */
export function generateFieldId(): string {
  return "f" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
