"use client";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { getPlaylist } from "./playlists";

import { festivals } from './data/festivals';

export default function Home() {
  const { data: session } = useSession();
  const [playlists, setPlaylists] = useState<[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log(session)

  console.log(festivals)

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        if (session) {
          const response = await getPlaylist(session);
          setError(null);
          setPlaylists(response);
        } else {
          throw new Error("No session available");
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [session]);


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Spot a Playlist
        </p>
      </div>

      <div>
        <h1>Festivals</h1>

        {loading &&
          <div>Loading...</div>
        }

        {error &&
          <div>Error: {error}</div>
        }

        {!error && !loading &&
          <ul>
            {/* {playlists.map((playlist: any) => (
              <li key={playlist.id}>{playlist.name}</li>
            ))} */}
            {festivals.map((festival: any) => (
              <li key={festival.name} className="mb-4">
              <a href={festival.url} target="_blank" className="text-blue-500 underline">
                {festival.name}
              </a>
              <div>
              </div>
              <h2 className="mt-2 text-lg font-semibold">Artists:</h2>
              <ul className="list-disc list-inside ml-4">
                {festival.artists.map((artist: string, index: number) => (
                  <li key={index}>{artist}</li>
                ))}
              </ul>
            </li>
            ))}
          </ul>
        }
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