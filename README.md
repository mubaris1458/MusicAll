# Tamil Music

A Tamil music streaming web app. Songs are streamed from Google Drive through a small server route (`/api/public/song/:id`). Only Drive IDs listed in `src/data/drive-songs.json` can be streamed.

Built with TanStack Start, React 19, Tailwind CSS 4 and Nitro.

## Run locally (Node.js 20+)

```sh
npm install
npm run dev     # http://localhost:3000
npm test
```

## Production

```sh
npm run build
npm start
```

## Deploy

The app needs a server (the song proxy), so GitHub Pages will not work. Import the GitHub repo into **Vercel** or **Netlify** and click Deploy. No settings needed.

## Data

- `src/data/drive-songs.json`: song list `[drive_file_id, title, artist, movie, year, composer, file_name]`.
- `public/audio/Vizhi_Veekura.mp3`: the one song hosted in the app itself.
- Playlists, favourites and recently played are stored in each visitor's browser only.
- `archive/tamilmusic-backup/`: backup copy of the data (CSV/JSON). Not used by the app.
