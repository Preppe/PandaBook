"use client";
import CurrentlyPlaying from "@/components/home/CurrentlyPlaying";
import Categories from "@/components/home/Categories";
import PopularAudiobooks from "@/components/home/PopularAudiobooks";
import NewReleases from "@/components/home/NewReleases";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100">
      <div className="pb-20">
        <CurrentlyPlaying />
        {/* <Categories />
        <PopularAudiobooks /> */}
        <NewReleases />
      </div>
    </div>
  );
}