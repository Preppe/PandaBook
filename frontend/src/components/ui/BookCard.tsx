import React from "react";

interface BookCardProps {
  image: string;
  title: string;
  author: string;
}

export default function BookCard({ image, title, author }: BookCardProps) {
  return (
    <div className="flex-shrink-0 w-32">
      <img
        src={image}
        alt="Book Cover"
        className="w-32 h-40 rounded-xl shadow-md object-cover mb-2"
      />
      <h3 className="text-red-800 font-medium">{title}</h3>
      <p className="text-red-600 text-sm">{author}</p>
    </div>
  );
}