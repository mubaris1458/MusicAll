# Tamilmusic

Project: Music player



Build a beautiful, modern, fully responsive music streaming and local music player website inspired by the usability of Spotify, the music discovery features of JioSaavn, and the premium visual experience of Apple Music.



1. Design Theme



Use Warm Amber Liquid Glassmorphism UI — transparent, water-glass surfaces with warm amber lighting.

I attached the ui style photo



Create realistic liquid-glass panels with backdrop , subtle reflections, translucent layers, rounded corners, soft shadows, and smooth hover animations.



Use warm amber gradients for active controls, audio visualizers, progress bars, and highlighted album artwork.



Avoid a flat design. The entire interface should feel premium, immersive, elegant, and fluid.



2. Main Layout



Create a responsive desktop layout with three sections:



- Left sidebar navigation

- Main music discovery and library area

- Persistent bottom music player



On mobile, use a compact header, responsive album grids, and a bottom navigation bar.



Sidebar:



- Home

- Discover

- My Library

- Playlists

- Albums

- Artists

- Recently Played

- Downloads



Add a search bar at the top with a search icon and a clear search interaction.



3. Home Page



Create a premium music dashboard featuring:



- Greeting header: “Your music, your atmosphere.”



- Recently Played section



- Popular Songs section



- New Releases section



- Your Playlists section



- Artists and Albums section



Use beautiful album-cover cards with rounded corners, translucent overlays, and amber hover effects.



Each song card should display artwork, song title, artist name, movie or album name when available, and a play button.

Movie Page



Example:



Thug Life (2025)



Poster



Hero: Kamal Haasan



Music: A.R. Rahman



Songs:



Jinguchaa



Sugar Baby





... (All 10 songs)

Applying to all songs 

Movies-:

1.Songs 

2.songs

3.......



4. Functional Music Player



Build a fully working music player using the HTML5 Audio API.



Include:



- Play and Pause

- Previous Song

- Next Song

- Shuffle Songs

- Seekable progress bar

- Current time and total duration

- Volume slider and mute

- Song queue

- Clickable album artwork

- Mini-player on mobile

- Keyboard-accessible playback controls



The player must maintain playback when navigating between website pages.



Shuffle should play tracks in a randomized order without repeatedly selecting the current track when alternatives exist.



Next and Previous should follow the queue or shuffle order correctly.



Update the progress bar and timestamps in real time. Handle loading, playback errors, and ended tracks gracefully.



Do not autoplay audio before the user chooses to play a song.



5. Import and Analyze Music



Add an “Import Music” button that lets users select multiple audio files from their device.



Support common formats such as MP3, WAV, M4A, and OGG when supported by the browser.



For every imported song:



- Read the audio file

- Extract available metadata, including title, artist, album, and duration

- Read embedded cover artwork when available

- Display the song in the library

- Allow immediate playback

- Preserve the original filename when metadata is missing



7. Download Options



Add download option to users can download that song



8. Search and Filtering



Create a functional search system that searches:



- Song title

- Artist

- Album

- Movie name

- Playlist



Add filters for artists, albums, movie soundtracks, and recently added tracks.



Display a helpful empty state when there are no matching results.



9. Playlists and Library



Allow users to:



- Create playlists

- Rename playlists

- Delete playlists with confirmation

- Add and remove songs

- Reorder tracks

- Play an entire playlist

- Shuffle a playlist

- Save favorite songs

- View recently played songs



Persist the library and playlists appropriately. Use browser storage for a local-only prototype or a database for a multi-device account-based application.



10. UI Animations



**Warm Amber Liquid Glassmorphism UI

Add smooth, tasteful animations:



- Glass cards gently lift on hover

- Amber glow around the active song

- Smooth progress-bar movement

- Rotating vinyl-style artwork while music plays

- Subtle animated audio-wave visualization

- Soft transitions between pages

- Fluid expanding search

- Smooth bottom-player transitions



Respect reduced-motion accessibility settings.



11. Technical Requirements



Use React, TypeScript, Tailwind CSS, and reusable components.



Use the native HTML5 Audio API for reliable playback of imported files and accessible audio controls.



Create reusable components for:



- Sidebar

- Header and Search

- SongCard

- AlbumCard

- MovieSoundtrackCard

- PlaylistCard

- MusicPlayer

- PlayerProgressBar

- QueueDrawer

- ImportMusicDialog

- MusicMetadataEditor

- DownloadButton



Keep the code organized, responsive, and easy to maintain.



Use realistic sample data only for the initial visual preview. Clearly distinguish sample tracks from imported audio files.



If a backend is required, integrate Lovable Cloud or Supabase for user accounts, database storage, and permitted file storage. Do not expose private API keys in frontend code.



12. Final Requirements



Build the actual interactive website, not just a static design.



Make Play, Pause, Next, Previous, Shuffle, Repeat, Search, Import Music, Playlist Management, Movie Grouping, and permitted Downloads functional.



Test the playback queue, track switching, audio progress, metadata extraction, mobile responsiveness, and empty states.



Prioritize the Warm Amber Liquid Glassmorphism visual style throughout every page.



The final result should feel like a premium music application combining familiar music-streaming usability with a unique, warm, transparent glass aesthetic.



The songs are:

https://drive.google.com/drive/folders/1olC4ZBc8ULhLaWtlYnJMcZDvn4uaGfuI

https://drive.google.com/drive/folders/1w2uHPM0r1KhcF6yKwHJyhuMNbvPBhSvN

https://drive.google.com/drive/folders/11xpgjEUpuU-cOqgnW1x4qG7_LBH23dMu

https://drive.google.com/drive/folders/1k1TUbhqC9M3b3v3MLv9pyT5mOljKFN9x

https://drive.google.com/drive/folders/1myNDiK6axX-Hwhilqgi-jjsl21iyUg5A

https://drive.google.com/drive/folders/138CK2q1cpnj413uC-GM40ZF0-k5nH37M

Analyse the all songs to merge to movie wise

Important: don't show a Single songs, in the home page

Show a movie users can link that movie after click the songs to play

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tamilmusic.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/034a7592-44ba-4bdd-993e-b501e5414d22).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
