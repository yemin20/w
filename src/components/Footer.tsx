async function getContactInfo() {
  const defaultContact = {
    orgName: "Sakarya İHH Akıf Derneği",
    address: "Cumhuriyet Mahallesi Uzunçarşı 1. Geçit No:2, Adapazarı / Sakarya",
    phone: "(0264) 777 24 44",
    email: "sakaryaihh@gmail.com",
    facebook: "",
    twitter: "",
    instagram: "",
  };
  try {
    const { prisma } = await import("@/lib/prisma");
    const setting = await prisma.setting.findUnique({
      where: { id: "contact_info" },
    });
    if (setting)
      return { ...defaultContact, ...JSON.parse(setting.value) } as typeof defaultContact;
  } catch {
    // ignore
  }
  return defaultContact;
}

export default async function Footer() {
  const contact = await getContactInfo();

  return (
    <footer className="bg-gray-900 text-white py-8 mt-12">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* İletişim Bilgileri */}
        <div>
          <h3 className="text-lg font-semibold mb-4">İletişim</h3>
          <p>{contact.orgName}</p>
          <p>Adres: {contact.address}</p>
          <p>Tel: {contact.phone}</p>
          <p>E-posta: {contact.email}</p>
        </div>

        {/* Hızlı Linkler */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Hızlı Linkler</h3>
          <ul className="space-y-2">
            <li><a href="/haberler" className="hover:text-green-400">Haberler</a></li>
            <li><a href="/gonullu" className="hover:text-green-400">Gönüllü Ol</a></li>
            <li><a href="/bagis" className="hover:text-green-400">Bağış Yap</a></li>
            <li><a href="/iletisim" className="hover:text-green-400">İletişim</a></li>
            <li><a href="/hesap-numaralari" className="hover:text-green-400">Hesap Numaraları</a></li>
            <li><a href="/giris" className="hover:text-green-400">Üye Giriş</a></li>
          </ul>
        </div>

        {/* Sosyal Medya */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Sosyal Medya</h3>
          <div className="flex space-x-4">
            {contact.facebook && (
              <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-green-400">
                Facebook
              </a>
            )}
            {contact.twitter && (
              <a href={contact.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-green-400">
                Twitter
              </a>
            )}
            {contact.instagram && (
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-green-400">
                Instagram
              </a>
            )}
            {!contact.facebook && !contact.twitter && !contact.instagram && (
              <span className="text-gray-400">Sosyal medya henüz eklenmedi</span>
            )}
          </div>
        </div>
      </div>

      {/* Alt Çizgi */}
      <div className="text-center mt-8 text-sm text-gray-400">
        © 2026 Sakarya İHH. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}