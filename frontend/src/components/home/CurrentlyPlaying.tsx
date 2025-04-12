import React from "react";
import PlayButton from "@/components/ui/PlayButton";

export default function CurrentlyPlaying() {
  return (
    <div className="mx-6 my-4 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-4 shadow-lg">
      <div className="flex items-center gap-4">
        <img
          src="/366131d9e7-27a4b9270c78fe51bb8e.png"
          alt="Book Cover"
          className="w-16 h-16 rounded-xl shadow-md"
        />
        <div className="flex-1">
          <h3 className="text-white font-medium">Continua ad ascoltare</h3>
          <p className="text-white/80 text-sm">Il Piccolo Principe</p>
          <div className="mt-2 bg-white/20 rounded-full h-1">
            <div className="bg-white rounded-full h-1 w-1/3"></div>
          </div>
        </div>
        <PlayButton />
      </div>
    </div>
  );
}