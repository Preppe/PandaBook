import React from "react";

export default function Categories() {
  return (
    <div className="px-6 py-4">
      <h2 className="text-lg font-bold text-red-800 mb-4">Categorie</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button className="px-4 py-2 bg-red-500 text-white rounded-xl whitespace-nowrap">Tutti</button>
        <button className="px-4 py-2 bg-white/70 text-red-700 border border-red-200 rounded-xl whitespace-nowrap">Romanzi</button>
        <button className="px-4 py-2 bg-white/70 text-red-700 border border-red-200 rounded-xl whitespace-nowrap">Per Bambini</button>
        <button className="px-4 py-2 bg-white/70 text-red-700 border border-red-200 rounded-xl whitespace-nowrap">Storia</button>
        <button className="px-4 py-2 bg-white/70 text-red-700 border border-red-200 rounded-xl whitespace-nowrap">Scienza</button>
      </div>
    </div>
  );
}