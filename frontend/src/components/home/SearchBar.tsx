import React from "react";

export default function SearchBar() {
  return (
    <div className="px-6 py-3">
      <div className="relative">
        <i className="fa-solid fa-search absolute left-4 top-3.5 text-red-400"></i>
        <input
          type="search"
          placeholder="Cerca audiolibri..."
          className="w-full bg-white/70 border border-red-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-red-400 text-red-800 placeholder-red-300"
        />
      </div>
    </div>
  );
}