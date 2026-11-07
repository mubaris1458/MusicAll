# TamilMusic backend backup (Nov 2026)

## 1-3. Backend provider
None. This site has NO Lovable Cloud and NO Supabase project connected.
So there is no project URL, project reference ID, or Supabase Dashboard URL.

## 4-5. Database tables, migrations, functions, triggers, RLS
None exist. The song catalogue is a static file: data/drive-songs.json
(rows: [drive_file_id, title, artist, movie, year, composer, file_name]),
also provided as data/songs.csv. Playlists, favorites and recently played are
stored only in each visitor's browser (localStorage keys amber.playlists,
amber.favorites, amber.recent, amber.downloaded) - they are not on any server.

## 6. Server code (no Edge Functions)
server/song-proxy.ts - the only server code. It streams songs from Google Drive
at /api/public/song/<id>, allowing only IDs in the song list.

## 7. Storage / song files
- 2,900+ songs live in YOUR Google Drive folders (links in songs.csv).
  Your Drive is the real backup of the audio.
- 1 uploaded song: now at public/audio/Vizhi_Veekura.mp3

## 8. Restoring into your own Supabase (optional)
1. Create a project at https://supabase.com/dashboard.
2. SQL editor:
   create table songs (drive_file_id text primary key, title text, artist text,
     movie text, year int, composer text, file_name text, drive_link text);
   alter table songs enable row level security;
   create policy "public read" on songs for select using (true);
3. Table editor > songs > Import data from CSV > data/songs.csv.
4. Optional: Storage > new bucket "songs" > upload MP3s.
Keep your service_role key private; never put it in website code.
