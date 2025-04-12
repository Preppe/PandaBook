import React from "react";

export default function Header() {
  return (
    <div className="px-6 pt-12 pb-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-paw text-2xl text-red-500"></i>
          <span className="text-xl font-bold text-red-800">PandaBooks</span>
        </div>
        <button className="p-2">
          <i className="fa-solid fa-bell text-red-400 text-xl"></i>
        </button>
      </div>
    </div>
  );
}