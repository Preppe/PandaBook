import React from 'react';
import Image from 'next/image'; // Using next/image for optimized images

const PlayerPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 text-red-800">
      {/* Header */}
      <div id="player-header" className="px-6 pt-12 pb-4">
        <div className="flex justify-between items-center">
          <button className="text-red-800">
            <i className="fa-solid fa-chevron-down text-xl"></i>
          </button>
          <span className="font-medium">In riproduzione</span>
          <button className="text-red-800">
            <i className="fa-solid fa-ellipsis-vertical text-xl"></i>
          </button>
        </div>
      </div>

      {/* Book Cover */}
      <div id="book-cover" className="px-6 py-8">
        <div className="relative w-64 h-64 mx-auto">
          {/* Using placeholder for image source, replace with actual data later */}
          <Image
            src="/366131d9e7-27a4b9270c78fe51bb8e.png"
            alt="Book Cover"
            width={256} // specify width
            height={256} // specify height
            className="rounded-3xl shadow-2xl object-cover"
          />
        </div>
      </div>

      {/* Book Info */}
      <div id="book-info" className="px-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Il Piccolo Principe</h1>
        <p className="text-red-600">Antoine de Saint-Exupéry</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <i className="fa-solid fa-star text-yellow-400"></i>
          <span className="text-red-600">4.8</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div id="progress-bar" className="px-6 py-8">
        <div className="relative">
          <div className="h-1 bg-red-200 rounded-full">
            {/* Example progress, make dynamic later */}
            <div className="h-1 bg-red-500 rounded-full w-1/3"></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-red-600">
            <span>14:22</span>
            <span>45:30</span>
          </div>
        </div>
      </div>

      {/* Player Controls */}
      <div id="player-controls" className="px-6">
        {/* Secondary Controls */}
        <div className="flex justify-between items-center mb-8">
          <button className="text-red-600">
            <i className="fa-solid fa-shuffle text-xl"></i>
          </button>
          <button className="text-red-600">
            <i className="fa-solid fa-repeat text-xl"></i>
          </button>
        </div>

        {/* Primary Controls */}
        <div className="flex justify-center items-center gap-8">
          <button className="text-red-800">
            <i className="fa-solid fa-backward-step text-3xl"></i>
          </button>
          <button className="bg-red-500 w-20 h-20 rounded-full flex items-center justify-center shadow-lg">
            {/* Example: Pause icon, make dynamic later */}
            <i className="fa-solid fa-pause text-white text-3xl"></i>
          </button>
          <button className="text-red-800">
            <i className="fa-solid fa-forward-step text-3xl"></i>
          </button>
        </div>

        {/* Additional Controls */}
        <div className="flex justify-between items-center mt-8">
          <button className="text-red-600">
            <i className="fa-solid fa-volume-high text-xl"></i>
          </button>
          <button className="text-red-600">
            <i className="fa-solid fa-clock text-xl"></i>
          </button>
        </div>
      </div>

      {/* Speed Control */}
      <div id="speed-control" className="px-6 py-8">
        <div className="flex items-center justify-center gap-4">
          {/* Example: Active state on 1.0x, make dynamic later */}
          <button className="px-4 py-2 rounded-full text-red-600 text-sm">0.5x</button>
          <button className="px-4 py-2 rounded-full bg-red-500 text-white text-sm">1.0x</button>
          <button className="px-4 py-2 rounded-full text-red-600 text-sm">1.5x</button>
          <button className="px-4 py-2 rounded-full text-red-600 text-sm">2.0x</button>
        </div>
      </div>

      {/* Chapters Button */}
      <div id="chapters-button" className="px-6 pb-12"> {/* Added padding bottom */}
        <button className="w-full py-3 bg-white/70 border border-red-200 rounded-xl text-red-800 font-medium">
          <i className="fa-solid fa-list-ul mr-2"></i>
          Capitoli
        </button>
      </div>
    </div>
  );
};

export default PlayerPage;