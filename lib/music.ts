import fs from "node:fs";
import path from "node:path";
import { music, type MusicEntry } from "@/lib/data";

/**
 * The soundtrack's track list, built from `music` in lib/data.ts: the entries in
 * `music.playlist` if there are any, otherwise every audio file in `music.folder`
 * (a folder inside public/). Read on the server when the page is built, or on
 * each request in `pnpm dev`, so new files need a refresh in dev or a rebuild.
 */
export type Track = { src: string; title: string };

const AUDIO = /\.(mp3|m4a|aac|ogg|oga|opus|wav|flac|webm)$/i;

/** "/music/01-pit_lane.mp3" → "pit lane" */
const titleOf = (src: string) => {
  const file = decodeURIComponent(src.split(/[?#]/)[0].split("/").pop() ?? src);
  return file.replace(AUDIO, "").replace(/^\d+[\s._-]+/, "").replace(/[_-]+/g, " ").trim() || file;
};

/** Folder as a URL prefix: "music/" or "/music/" → "/music" */
const folderUrl = () => `/${music.folder.replace(/^\/+|\/+$/g, "")}`;

/** A playlist entry's URL: full URLs and /paths as given, bare names inside the folder. */
function resolve(src: string) {
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/")) return encodeURI(src);
  return `${folderUrl()}/${encodeURIComponent(src)}`;
}

function fromPlaylist(entries: MusicEntry[]): Track[] {
  return entries.map((e) => {
    const { src, title } = typeof e === "string" ? { src: e, title: undefined } : e;
    const url = resolve(src);
    return { src: url, title: title?.trim() || titleOf(url) };
  });
}

function fromFolder(): Track[] {
  const dir = path.join(process.cwd(), "public", music.folder);
  let files: string[];
  try {
    files = fs.readdirSync(dir);
  } catch {
    return [];
  }
  return files
    .filter((f) => AUDIO.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => {
      const src = `${folderUrl()}/${encodeURIComponent(f)}`;
      return { src, title: titleOf(src) };
    });
}

export function getTracks(): Track[] {
  return music.playlist.length ? fromPlaylist(music.playlist) : fromFolder();
}
