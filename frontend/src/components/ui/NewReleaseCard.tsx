import React from "react";
import PlayButton from "./PlayButton";

interface NewReleaseCardProps {
  image: string;
  title: string;
  author: string;
  rating: number | string;
  onPlay?: () => void;
}

export default function NewReleaseCard({
  image,
  title,
  author,
  rating,
  onPlay,
}: NewReleaseCardProps) {
  return (
    <div className="flex gap-4 items-center">
      <img
        src={image}
        alt="Book Cover"
        className="w-16 h-20 rounded-xl shadow-md object-cover"
      />
      <div className="flex-1">
        <h3 className="text-red-800 font-medium">{title}</h3>
        <p className="text-red-600 text-sm">{author}</p>
        <div className="flex items-center gap-2 mt-1">
          <i className="fa-solid fa-star text-yellow-400 text-xs"></i>
          <span className="text-red-600 text-sm">{rating}</span>
        </div>
      </div>
      <PlayButton bgColor="bg-red-500" iconColor="text-white" onClick={onPlay} />
    </div>
  );
}