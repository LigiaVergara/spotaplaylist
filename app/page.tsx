"use client";
import { signIn, useSession } from "next-auth/react";
import { createPlaylist as createEmptyPlaylist } from "./playlists";
import { getArtistID } from "./artist";
import { festivals } from './data/festivals';
import { getTracks } from "./tracks";
import { postTracks } from "./trackstoplaylist";
import { useState, useEffect } from 'react';

export default function Home() {
  const { data: session } = useSession();
  const [selectedCountry, setSelectedCountry] = useState<string>(""); // Initialize with an empty string
  const [uniqueCountries, setUniqueCountries] = useState<string[]>([]);
  const [topN, setTopN] = useState<number>(1);
  const [playlistName, setPlaylistName] = useState<string>("");
  const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState<number | null>(null);
  const [playlistCreatedMessage, setPlaylistCreatedMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); 


  useEffect(() => {
    // Extract unique countries from festivals array
    const countriesSet = new Set(festivals.map((festival: any) => festival.country));
    const countriesArray = Array.from(countriesSet);
    setUniqueCountries(countriesArray);
  }, []);

  const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(event.target.value);
  };

  const handleTopNChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10); // Parse input value as integer
    setTopN(value); // Update topN state
  };

  const handlePlaylistSelection = (index: number) => {
    setSelectedPlaylistIndex(index === selectedPlaylistIndex ? null : index);
    setPlaylistName(festivals[index].name); // Set playlist name to festival name
  };

  const handlePlaylistNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlaylistName(event.target.value); // Update playlistName state
  };

  const handleCreatePlaylist = async () => {
    if (selectedPlaylistIndex !== null) {
      const festival = festivals[selectedPlaylistIndex];
      setIsLoading(true);
      await createFestivalPlaylist(festival.artists, festival.name);
      setIsLoading(false);
      // Optionally reset selectedPlaylistIndex after creation
      setSelectedPlaylistIndex(null);
    }
  };

  async function createFestivalPlaylist(artistNames: string[], festivalName: string): Promise<void | PromiseLike<void>> {
    try {
      const playlistId = await createEmptyPlaylist(session, playlistName);
  
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
        const trackUri = await getTracks(session, artistId, topN);
        if (trackUri) {
          trackUris.push(...trackUri);
        }
      }
  
      // add tracks to empty playlist
      await postTracks(session, trackUris, playlistId);
  
      // Playlist created message
      setPlaylistCreatedMessage(`Playlist "${playlistName}" created successfully!`);
    } catch (error) {
      console.error('Error creating playlist:', error);
      if (error instanceof Error) {
        setPlaylistCreatedMessage(`Failed to create playlist: ${error.message}`);
      } else {
        setPlaylistCreatedMessage('Failed to create playlist: An unknown error occurred');
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-100">
      <div className="z-10 w-full max-w-5xl flex flex-col items-center">
        <div className="w-full flex justify-center mb-8">
          <div className="flex flex-col items-center bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
            <img src="/Spotaplaylist.png" alt="Spot a Playlist" className="mb-4 w-full max-w-md h-auto" />
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
  {session && (
     <div className="z-10 w-full max-w-5xl flex flex-col items-center">
        <div className="w-full flex justify-center mb-8">
          <div className="flex items-center bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-green-600 p-6 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row items-center w-full md:w-auto">
              {/* Country selection dropdown */}
              <div className="mb-4 md:mb-0 md:mr-4 flex-grow">
                <label htmlFor="countrySelect" className="block text-lg font-semibold mb-2">
                  Select Country:
                </label>
                <select
                  id="countrySelect"
                  value={selectedCountry} // Default to empty string if selectedCountry is undefined
                  onChange={handleCountryChange}
                  className="bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                >
                  <option value="">All Countries</option>
                  {uniqueCountries.map((country: string, index: number) => (
                    <option key={index} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Input for topN selection */}
              <div className="flex flex-col w-full md:w-auto">
                <label htmlFor="topNInput" className="block text-lg font-semibold mb-2">
                  Number of Tracks:
                </label>
                <input
                  type="number"
                  id="topNInput"
                  value={topN}
                  onChange={handleTopNChange}
                  className="bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    {session && (
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
                  <div
                    key={index}
                    className={`block p-6 cursor-pointer max-w-sm bg-green-100 rounded-lg border border-green-300 shadow-md hover:bg-green-200 transition-colors ${
                      selectedPlaylistIndex === index ? 'border-green-600' : ''
                    }`}
                    onClick={() => handlePlaylistSelection(index)}
                  >
                    <h2 className="text-2xl font-bold text-green-900 mb-2">{festival.name}</h2>
                    <h3 className="text-lg font-semibold text-gray-800">Artists:</h3>
                    <ul className="list-disc list-inside ml-4 text-gray-700">
                      {topArtists.map((artist: string, artistIndex: number) => (
                        <li key={artistIndex}>{artist}</li>
                      ))}
                      {remainingArtistsCount > 0 && (
                        <li>+ {remainingArtistsCount} more</li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>

            {selectedPlaylistIndex !== null && (
              <div className="flex items-center mt-4">
                {/* Input for playlist name */}
                <div className="flex flex-col w-full md:w-auto mr-4">
                  <label htmlFor="playlistNameInput" className="block text-lg font-semibold mb-2">
                    Playlist Name:
                  </label>
                  <input
                    type="text"
                    id="playlistNameInput"
                    value={playlistName}
                    onChange={handlePlaylistNameChange}
                    className="bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                  />
                </div>
                <button
                  onClick={handleCreatePlaylist}
                  className="bg-green-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-600 shadow-md"
                >
                  Create Playlist
                </button>
              </div>
            )}
            {isLoading && (
              <div className="mt-4 p-4 bg-blue-200 text-blue-900 rounded-md shadow-md">
                Creating playlist, please wait...
              </div>
            )}

            {playlistCreatedMessage && (
              <div className="mt-4 p-4 bg-green-200 text-green-900 rounded-md shadow-md">
                {playlistCreatedMessage}
              </div>
            )}
          </div>
      )}
    </main>
  );
}
