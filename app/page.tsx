"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Spot a Playlist
        </p>  
      </div>

      <button 
      onClick={() =>
        signIn("spotify", {
          callbackUrl: "http://localhost:3000",
        })
      }
      className="mt-8 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
        Connect Spotify
      </button>
    </main>
  );
}