"use client";
import { signIn, useSession } from "next-auth/react";
import { createPlaylist as createEmptyPlaylist } from "./playlists";
import { getArtistID } from "./artist";
import { jambase_festivals } from './data/jambase_festivals2';
import { getTracks } from "./tracks";
import { postTracks } from "./trackstoplaylist";
import { useState, useEffect } from 'react';

export default function Home() {
  const { data: session } = useSession();
  const [selectedCountry, setSelectedCountry] = useState<string>(""); // Initialize with an empty string
  const [uniqueCountries, setUniqueCountries] = useState<string[]>([]);
  const [topN, setTopN] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [playlistName, setPlaylistName] = useState<string>("");
  const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState<number | null>(null);
  const [playlistCreatedMessage, setPlaylistCreatedMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today

  useEffect(() => {
    // Extract unique countries from festivals array
    const countriesSet = new Set(jambase_festivals.map((festival: any) => festival.country));
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

  const handleSearchQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const handlePlaylistSelection = (index: number) => {
    setSelectedPlaylistIndex(index === selectedPlaylistIndex ? null : index);
    setPlaylistName(filteredFestivals[index].name); // Set playlist name to the filtered festival name
  };

  const handlePlaylistNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlaylistName(event.target.value); // Update playlistName state
  };

  const handleCreatePlaylist = async () => {
    if (selectedPlaylistIndex !== null) {
      const festival = filteredFestivals[selectedPlaylistIndex];
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

  const filteredFestivals = jambase_festivals.filter((festival: any) => {
    const festivalDate = new Date(festival.date.slice(0, 4) + '-' + festival.date.slice(4, 6) + '-' + festival.date.slice(6, 8));
    const selectedDateObj = new Date(selectedDate);
    return festival.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
           (!selectedCountry || festival.country === selectedCountry) &&
           festivalDate >= selectedDateObj;
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-100">
      <div className="z-10 w-full max-w-5xl flex flex-col items-center">
        <div className="w-full flex justify-center mb-8">
          <div className="flex flex-col items-center bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
            <img src="/Spotaplaylist.png" alt="Spot a Playlist" className="mb-4 w-full max-w-md h-auto" />
            <p className="text-lg mb-4">
              Discover Your Next Favorite Playlist Based On A Festival !
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
                <div className="mb-4 md:mb-0 md:mr-4 flex-grow">
                  <label htmlFor="countrySelect" className="block text-lg font-semibold mb-2">
                    Select Country:
                  </label>
                  <select
                    id="countrySelect"
                    value={selectedCountry}
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
                <div className="flex flex-col w-full md:w-auto">
                  <label htmlFor="searchInput" className="block text-lg font-semibold mb-2">
                    Search Festival:
                  </label>
                  <input
                    type="text"
                    id="searchInput"
                    value={searchQuery}
                    onChange={handleSearchQueryChange}
                    className="bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                  />
                </div>
                <div className="flex flex-col w-full md:w-auto">
                  <label htmlFor="dateInput" className="block text-lg font-semibold mb-2">
                    Select Date:
                  </label>
                  <input
                    type="date"
                    id="dateInput"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {session && (
        <div className="z-10 w-full max-w-5xl flex flex-col items-center">
          {selectedPlaylistIndex !== null && (
            <div className="flex items-center mb-8 w-full">
              {/* Input for playlist name and button */}
              <div className="flex flex-col md:flex-row items-center w-full md:w-auto space-x-4">
                <div className="flex flex-col md:flex-row items-center">
                  <label htmlFor="playlistNameInput" className="block text-lg font-semibold mb-2 md:mb-0 md:mr-4">
                    Playlist Name:
                  </label>
                  <input
                    type="text"
                    id="playlistNameInput"
                    value={playlistName}
                    onChange={handlePlaylistNameChange}
                    className="bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-auto"
                  />
                </div>
                <button
                  onClick={handleCreatePlaylist}
                  className="bg-green-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-600 shadow-md"
                >
                  Create Playlist
                </button>
              </div>
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
      {session && (
        <div>
          <h1 className="text-3xl font-bold text-green-900 mb-6">Festivals</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFestivals.map((festival: any, index: number) => {
              const topArtists = festival.artists.slice(0, 5);
              const remainingArtistsCount = festival.artists.length - topArtists.length;
              const imageUrl = festival.image || '/Festivals.jpeg';
              const formattedDate = `${festival.date.slice(0, 4)}-${festival.date.slice(4, 6)}-${festival.date.slice(6, 8)}`;
  
              return (
                <div
                  key={index}
                  className={`flex p-6 cursor-pointer bg-green-100 rounded-lg border border-green-300 shadow-md hover:bg-green-200 transition-colors ${
                    selectedPlaylistIndex === index ? 'border-green-600' : ''
                  }`}
                  style={{ height: '150px' }} // Adjust these values as needed
                  onClick={() => handlePlaylistSelection(index)}
                >
                  <img src={imageUrl} alt={festival.name} className="w-1/4 h-auto rounded-lg mr-4" />
                  <div className="flex flex-col justify-between w-3/4">
                    <div className="flex justify-between">
                      <h2 className="text-xl font-bold text-green-900">{festival.name}</h2>
                      <span className="text-gray-500">{formattedDate}</span>
                    </div>
                    <div className="text-sm text-gray-700 mt-2">
                      <span className="font-semibold">Artists: </span>
                      <span>
                        {topArtists.join(' / ')}
                        {remainingArtistsCount > 0 && ` / + ${remainingArtistsCount} more`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );}