import React from "react";

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-red-100 px-6 py-3 z-50">
      <div className="flex justify-between items-center">
        <button className="flex flex-col items-center gap-1">
          <i className="fa-solid fa-house text-red-500 text-xl"></i>
          <span className="text-xs text-red-800">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <i className="fa-solid fa-compass text-red-400 text-xl"></i>
          <span className="text-xs text-red-600">Scopri</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <i className="fa-solid fa-bookmark text-red-400 text-xl"></i>
          <span className="text-xs text-red-600">Libreria</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <i className="fa-solid fa-user text-red-400 text-xl"></i>
          <span className="text-xs text-red-600">Profilo</span>
        </button>
      </div>
    </div>
  );
}