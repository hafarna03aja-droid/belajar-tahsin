"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", icon: "🏠", label: "Beranda" },
  { href: "/dashboard/materi", icon: "📚", label: "Materi" },
  { href: "/dashboard/quran", icon: "📖", label: "Al-Qur'an" },
  { href: "/dashboard/setor", icon: "🎙️", label: "Setor" },
  { href: "/dashboard/profil", icon: "👤", label: "Profil" },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide BottomNav on Ustadz routes
  if (pathname.startsWith("/dashboard/ustadz")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe md:hidden">
      <div className="glass-card mx-3 mb-3 px-2 py-2 shadow-2xl">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.label.toLowerCase().replace("'", "")}`}
                className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-2xl transition-all duration-200 min-w-[58px] relative ${
                  active
                    ? "bg-brand-600/20 text-brand-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {active && (
                  <span className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-400" />
                )}
                <span className="text-2xl leading-none">{item.icon}</span>
                <span className={`text-[11px] font-semibold leading-none ${
                  active ? "text-brand-400" : "text-slate-500"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
