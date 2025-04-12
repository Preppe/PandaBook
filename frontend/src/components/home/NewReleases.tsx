import React from "react";
import PlayButton from "@/components/ui/PlayButton";
import NewReleaseCard from "@/components/ui/NewReleaseCard";

export default function NewReleases() {
  return (
    <div className="px-6 py-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-red-800">Nuove Uscite</h2>
        <button className="text-red-500">Vedi tutti</button>
      </div>
      <div className="space-y-4">
        <NewReleaseCard
          image="https://storage.googleapis.com/uxpilot-auth.appspot.com/366131d9e7-27a4b9270c78fe51bb8e.png"
          title="La Divina Commedia"
          author="Dante Alighieri"
          rating={4.8}
        />
        <NewReleaseCard
          image="https://storage.googleapis.com/uxpilot-auth.appspot.com/366131d9e7-27a4b9270c78fe51bb8e.png"
          title="Il Barone Rampante"
          author="Italo Calvino"
          rating={4.6}
        />
      </div>
    </div>
  );
}