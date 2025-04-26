import React from "react";

export default function Header() {
  return (
    <div>
      <div className="px-4 pt-5 pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-paw text-2xl text-red-500"></i>
          </div>
          <div className="relative flex-grow mx-4"> {/* Added flex-grow and margin for spacing */}
            <i className="fa-solid fa-search absolute left-4 top-3.5 text-red-400"></i>
            <input
              type="search"
              placeholder="Cerca audiolibri..."
              className="w-full bg-white/70 border border-red-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-red-400 text-red-800 placeholder-red-300"
            />
          </div>
          <button className="p-2">
            <i className="fa-solid fa-bell text-red-400 text-xl"></i>
          </button>
        </div>
      </div>
    </div>
  );
}