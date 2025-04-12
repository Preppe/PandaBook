import React from "react";

interface PlayButtonProps {
  iconColor?: string; // Tailwind color class for the icon
  bgColor?: string;   // Tailwind color class for the button background
  onClick?: () => void;
  className?: string;
}

export default function PlayButton({
  iconColor = "text-red-500",
  bgColor = "bg-white",
  onClick,
  className = "",
}: PlayButtonProps) {
  return (
    <button
      className={`rounded-full p-3 shadow-md ${bgColor} ${className}`}
      onClick={onClick}
      type="button"
    >
      <i className={`fa-solid fa-play ${iconColor}`}></i>
    </button>
  );
}