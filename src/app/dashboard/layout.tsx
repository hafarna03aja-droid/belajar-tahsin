"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/ui/BottomNav";
import { Sidebar } from "@/components/ui/Sidebar";
import { MobileHeader } from "@/components/ui/MobileHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const isUstadz = pathname.startsWith("/dashboard/ustadz");

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* 1. Sidebar Navigasi di sebelah kiri (dengan support collapse) */}
      {!isUstadz && <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />}

      {/* Induk div pembungkus Konten Utama dengan transition-all dan margin dinamis */}
      <div
        className={`flex-1 flex flex-col min-h-screen relative transition-all duration-300 ${
          isUstadz ? "" : isCollapsed ? "ml-0 md:ml-20" : "ml-0 md:ml-64"
        }`}
      >
        {/* Header Mobile */}
        {!isUstadz && <MobileHeader />}

        {/* 2 & 3 & 5. Elemen pembungkus Konten Utama (<main>) dengan padding dan max-width */}
        <main
          className={`flex-1 w-full max-w-7xl mx-auto p-5 md:p-10 ${
            isUstadz
              ? "pt-10"
              : "pt-24 pb-28 md:pt-10 md:pb-10"
          }`}
        >
          {children}
        </main>

        {/* Bottom Navigasi Mobile */}
        {!isUstadz && <BottomNav />}
      </div>
    </div>
  );
}


