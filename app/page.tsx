"use client";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { getPlaylist } from "./playlists";
import { getArtistID } from "./artist";
import { festivals } from './data/festivals';

export default function Home() {
  const { data: session } = useSession();
  const [playlists, setPlaylists] = useState<[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log(session)

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

    const fetchArtist = async () => {
      try {
        if (session) {
          const response = await getArtistID(session, "Avril Lavigne");
          setError(null);
          console.log(response);
        } else {
          throw new Error("No session available");
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    //fetchPlaylists();
    fetchArtist();
  }, [session]);
  

  return (
<main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-100">
  <div className="z-10 w-full max-w-5xl flex flex-col items-center">
    <div className="w-full flex justify-center mb-8">
      <div className="flex flex-col items-center bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Spot a Playlist</h1>
        <p className="text-lg mb-4">
          Discover your next favorite playlist based on a festival around you!
        </p>
        <button 
          onClick={() => signIn("spotify", { callbackUrl: "http://localhost:3000" })} 
          className="bg-white text-green-600 font-semibold px-4 py-2 rounded-md hover:bg-gray-100 shadow-md"
        >
          Connect Spotify
        </button>
      </div>
    </div>
  </div>

      <div>
        <h1 className="text-3xl font-bold text-green-900 mb-6">Festivals</h1>

        {loading && <div className="text-gray-800">Loading...</div>}
        {error && <div className="text-red-500">Error: {error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {festivals.map((festival: any) => {
            const topArtists = festival.artists.slice(0, 5);
            const remainingArtistsCount = festival.artists.length - topArtists.length;

            return (
              <a 
                key={festival.name} 
                href={festival.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block p-6 max-w-sm bg-green-100 rounded-lg border border-green-300 shadow-md hover:bg-green-200 transition-colors"
              >
                <h2 className="text-2xl font-bold text-green-900 mb-2">{festival.name}</h2>
                <h3 className="text-lg font-semibold text-gray-800">Artists:</h3>
                <ul className="list-disc list-inside ml-4 text-gray-700">
                  {topArtists.map((artist: string, index: number) => (
                    <li key={index}>{artist}</li>
                  ))}
                  {remainingArtistsCount > 0 && (
                    <li>+ {remainingArtistsCount} more</li>
                  )}
                </ul>
              </a>
            );
          })}
        </div>
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