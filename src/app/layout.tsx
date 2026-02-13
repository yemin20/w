import "./globals.css";
import TopBar from "@/components/TopBar";
import MainHeader from "@/components/MainHeader";
import SubHeader from "@/components/SubHeader";
import Footer from "@/components/Footer";

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="bg-white text-gray-900 flex flex-col min-h-screen">
        {/* SABİT */}
        <TopBar />
        <MainHeader />

        {/* AKIŞTA */}
        <SubHeader />

        {/* SAYFA İÇERİĞİ */}
        <main className="pt-[80px] flex-1">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
