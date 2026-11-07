import { createFileRoute } from "@tanstack/react-router";
import driveRaw from "@/data/drive-songs.json";

// Only songs from the curated Drive list can be streamed through this proxy.
const ALLOWED = new Set((driveRaw as [string][]).map((r) => r[0]));

export const Route = createFileRoute("/api/public/song/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        if (!ALLOWED.has(params.id)) return new Response("Not found", { status: 404 });
        const headers: Record<string, string> = {};
        const range = request.headers.get("range");
        if (range) headers.Range = range;
        const upstream = await fetch(`https://drive.usercontent.google.com/download?id=${params.id}&export=download`, { headers });
        if (!upstream.ok && upstream.status !== 206) return new Response(`Upstream error ${upstream.status}`, { status: 502 });
        const out = new Headers();
        for (const h of ["content-type", "content-length", "content-range", "accept-ranges"]) {
          const v = upstream.headers.get(h);
          if (v) out.set(h, v);
        }
        out.set("accept-ranges", "bytes");
        out.set("cache-control", "public, max-age=86400");
        return new Response(upstream.body, { status: upstream.status, headers: out });
      },
    },
  },
});
