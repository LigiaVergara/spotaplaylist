import { get } from "http";
import { getSession } from "next-auth/react";
import { festivals } from './data/festivals'; // Assuming festivals data is imported from a file

export interface Artist {
  id: string;
  name: string;
}

export async function getArtistsID(user: any): Promise<Array<Artist>> {
  try {
    const session = await getSession(user);
    const artistIds: Array<Artist> = [];

    for (const festival of festivals) {
      const lineup = festival.artists; // Split lineup into array of artist names
  
      for (const artistName of lineup) { // Use artistName instead of artist here
        const trimmedArtistName = artistName.trim();
        
        // Search Spotify for artist by name
        const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(trimmedArtistName)}&type=artist`;
        const data: any = await fetch(searchUrl); // Assuming fetchData function is defined elsewhere
  
        if (data && data.artists && data.artists.items.length > 0) {
          // If artist found, add their Spotify ID to artistIds
          artistIds.push({id: data.artists.items[0].id, name: artistName});
        }
      }
    }

    return artistIds; // Return array of artist IDs
  } catch (error) {
    console.error('Failed to get artists:', error);
    throw error;
  }
}
