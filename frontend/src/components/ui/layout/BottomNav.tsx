import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-red-100 px-6 py-3 z-50">
      <div className="flex justify-between items-center">
        <Link href="/" className="flex flex-col items-center gap-1">
          <i className={`fa-solid fa-house text-xl ${isActive('/') ? 'text-red-500' : 'text-red-400'}`}></i>
          <span className={`text-xs ${isActive('/') ? 'text-red-800' : 'text-red-600'}`}>Home</span>
        </Link>
        <button className="flex flex-col items-center gap-1">
          <i className="fa-solid fa-bookmark text-red-400 text-xl"></i>
          <span className="text-xs text-red-600">Libreria</span>
        </button>
        <Link href="/profile" className="flex flex-col items-center gap-1">
          <i className={`fa-solid fa-user text-xl ${isActive('/profile') ? 'text-red-500' : 'text-red-400'}`}></i>
          <span className={`text-xs ${isActive('/profile') ? 'text-red-800' : 'text-red-600'}`}>Profilo</span>
        </Link>
      </div>
    </div>
  );
}
