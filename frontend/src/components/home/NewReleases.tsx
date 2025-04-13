import React from "react";
import NewReleaseCard from "@/components/ui/NewReleaseCard";
import { useBooks } from "@/lib/api/bookClient";

export default function NewReleases() {
  // Fetch first 5 new releases, sorted by createdAt descending if supported
  const { data, isLoading, isError, error, refetch } = useBooks({
    limit: 5,
    page: 1,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });
  {
    console.log(data);
  }

  return (
    <div className="px-6 py-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-red-800">Nuove Uscite</h2>
        <button className="text-red-500" onClick={() => refetch()}>
          Aggiorna
        </button>
      </div>
      <div className="space-y-4">
        {isLoading && (
          <div className="text-gray-500">Caricamento in corso...</div>
        )}
        {isError && (
          <div className="text-red-500">
            Errore nel caricamento:{" "}
            {error instanceof Error ? error.message : "Errore sconosciuto"}
          </div>
        )}
        {!isLoading &&
          !isError &&
          Array.isArray(data) &&
          data.data.length === 0 && (
            <div className="text-gray-500">Nessuna nuova uscita trovata.</div>
          )}
        {!isLoading &&
          !isError &&
          Array.isArray(data?.data) &&
          data?.data.map((book) => {
            return (
              <NewReleaseCard
                key={book.id}
                image={book.cover || "/file.svg"}
                title={book.title}
                author={book.author}
                rating={0}
              />
            );
          })}
      </div>
    </div>
  );
}
