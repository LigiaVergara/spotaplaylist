"use client";
import { signIn, useSession } from "next-auth/react";
import { createPlaylist as createEmptyPlaylist, getPlaylist } from "./playlists";
import { getArtistID } from "./artist";
import { festivals } from './data/festivals';
import { getTracks } from "./tracks";
import { postTracks } from "./trackstoplaylist";
import { festivals_eur } from './data/festivals_eur';
import { useState, useEffect } from 'react';


export default function Home() {
  const { data: session } = useSession();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null); // State for selected country
  const [uniqueCountries, setUniqueCountries] = useState<string[]>([]); 

  useEffect(() => {
    // Extract unique countries from festivals array
    const countriesSet = new Set(festivals.map((festival: any) => festival.country));
    const countriesArray = Array.from(countriesSet);
    setUniqueCountries(countriesArray);
  }, []);

  const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(event.target.value);
  };

  async function createFestivalPlaylist(artistNames: string[], festivalName: string): Promise<void | PromiseLike<void>> {
    const playlistId = await createEmptyPlaylist(session, festivalName);

    // get artist ids
    const artistIds: string[] = [];
    for (const name of artistNames) {
      const id = await getArtistID(session, name);
      if (id) {
        artistIds.push(id);
      }
    }

    // get track uris
    const trackUris: string[] = [];
    for (const artistId of artistIds) {
      const trackUri = await getTracks(session, artistId);
      if (trackUri) {
        trackUris.push(...trackUri);
      }
    }

    // add tracks to empty playlist
    await postTracks(session, trackUris, playlistId);
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-100">
      <div className="z-10 w-full max-w-5xl flex flex-col items-center">
        <div className="w-full flex justify-center mb-8">
          <div className="flex flex-col items-center bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold mb-2">Spot a Playlist</h1>
            <p className="text-lg mb-4">
              Discover your next favorite playlist based on a festival around you!
            </p>
            {session ? (
               <p className="text-green-600 font-semibold px-4 py-2 rounded-md shadow-md">
               Connected to Spotify
             </p>
           ) : (
            <button
              onClick={() => signIn("spotify", { callbackUrl: "http://localhost:3000" })}
              className="bg-white text-green-600 font-semibold px-4 py-2 rounded-md hover:bg-gray-100 shadow-md"
            >
              Connect Spotify
            </button>
            )}
          </div>
        </div>
      </div>

      {/* Country selection dropdown */}
      <div className="mb-8">
        <label htmlFor="countrySelect" className="block text-lg font-semibold mb-2">
          Select Country:
        </label>
        <select
          id="countrySelect"
          value={selectedCountry}
          onChange={handleCountryChange}
          className="bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">All Countries</option>
          {uniqueCountries.map((country: string, index: number) => (
            <option key={index} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>


      {session &&

        <div>
          <h1 className="text-3xl font-bold text-green-900 mb-6">Festivals</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {festivals.map((festival: any, index: number) => {
              if (selectedCountry && festival.country !== selectedCountry) {
                return null; // Skip rendering if country doesn't match
              } 
              const topArtists = festival.artists.slice(0, 5);
              const remainingArtistsCount = festival.artists.length - topArtists.length;

              return (
                // <a 
                //   key={festival.name} 
                //   href={festival.url} 
                //   target="_blank" 
                //   rel="noopener noreferrer" 
                //   className="block p-6 max-w-sm bg-green-100 rounded-lg border border-green-300 shadow-md hover:bg-green-200 transition-colors"
                // >
                <div key={index} className="block p-6 cursor-pointer max-w-sm bg-green-100 rounded-lg border border-green-300 shadow-md hover:bg-green-200 transition-colors" onClick={async () => await createFestivalPlaylist(festival.artists, festival.name)}>


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

                </div>
              );
            })}
          </div>
        </div>

      }
    </main>
  );
}