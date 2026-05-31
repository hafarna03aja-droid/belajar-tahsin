"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard",        icon: "🏠",  label: "Beranda"    },
  { href: "/dashboard/materi", icon: "📚",  label: "Materi"     },
  { href: "/dashboard/quran",  icon: "📖",  label: "Al-Qur'an"  },
  { href: "/dashboard/setor",  icon: "🎙️", label: "Setor Ayat" },
  { href: "/dashboard/profil", icon: "👤",  label: "Profil"     },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard/ustadz")) return null;

  return (
    <aside
      className={`hidden md:flex flex-col fixed top-0 left-0 h-screen z-40 bg-slate-950 border-r border-white/5 shadow-2xl transition-all duration-300 ${
        isCollapsed ? "w-20 p-4 items-center" : "w-64 p-6"
      }`}
    >
      {/* ─── Logo ─── */}
      <div className={`mb-10 flex items-center w-full ${isCollapsed ? "justify-center" : "justify-between"}`}>
        <Link href="/" className="flex items-center gap-2.5 font-bold min-w-0">
          <span className="text-2xl leading-none flex-shrink-0">🕌</span>
          {!isCollapsed && (
            <span className="gradient-text text-base font-extrabold tracking-tight whitespace-nowrap">
              QuranEdutech
            </span>
          )}
        </Link>

        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all flex-shrink-0 ml-2"
            title="Ciutkan Menu"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* ─── Nav Items ─── */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto w-full">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center rounded-xl transition-all duration-200 border ${
                isCollapsed
                  ? "justify-center w-12 h-12 mx-auto"
                  : "gap-3.5 px-4 py-3.5"
              } ${
                active
                  ? "bg-brand-600/20 text-brand-400 font-semibold border-brand-500/25"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent"
              }`}
            >
              <span className="text-xl flex-shrink-0 leading-none">{item.icon}</span>
              {!isCollapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ─── Expand button (collapsed state) ─── */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="mt-6 w-12 h-12 mx-auto flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all"
          title="Perluas Menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </aside>
  );
}
