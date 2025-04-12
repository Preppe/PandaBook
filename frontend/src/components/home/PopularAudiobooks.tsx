import React from "react";

import BookCard from "@/components/ui/BookCard";

export default function PopularAudiobooks() {
  return (
    <div className="px-6 py-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-red-800">Popolari</h2>
        <button className="text-red-500">Vedi tutti</button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        <BookCard
          image="https://storage.googleapis.com/uxpilot-auth.appspot.com/366131d9e7-27a4b9270c78fe51bb8e.png"
          title="Il Nome della Rosa"
          author="Umberto Eco"
        />
        <BookCard
          image="https://storage.googleapis.com/uxpilot-auth.appspot.com/366131d9e7-27a4b9270c78fe51bb8e.png"
          title="1984"
          author="George Orwell"
        />
        <BookCard
          image="https://storage.googleapis.com/uxpilot-auth.appspot.com/366131d9e7-27a4b9270c78fe51bb8e.png"
          title="Orgoglio e Pregiudizio"
          author="Jane Austen"
        />
      </div>
    </div>
  );
}