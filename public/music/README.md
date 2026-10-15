# Music

Drop your own audio files in this folder and they become the site's soundtrack.

- Formats: `.mp3`, `.m4a`, `.aac`, `.ogg`, `.opus`, `.wav`, `.flac`, `.webm`. MP3 works in every browser.
- Order: files play in name order and loop. Prefix them to set the order: `01-engine-start.mp3`, `02-pit-lane.mp3`.
- Title: the file name is shown in the player, without the number prefix, and with `-` and `_` turned into spaces.
- Nothing plays until a visitor presses the sound button in the top bar.
- With `pnpm dev`, refresh the page after adding a file. For production, run `pnpm build` again.

## Choosing the folder or the exact tracks

The settings live in `lib/data.ts`, in `music`:

```ts
export const music = {
  folder: "/music",   // folder inside public/ to scan
  playlist: [],       // or list tracks yourself, in order
};
```

- Change `folder` to use a different folder inside `public/`, for example `"/audio"` for `public/audio`.
- Or fill `playlist` to pick tracks and their order yourself. Each entry can be a file name in the folder, a path inside `public/`, or a full URL, with an optional title:

  ```ts
  playlist: [
    "01-intro.mp3",
    { src: "/audio/pit-lane.mp3", title: "Pit lane" },
    "https://example.com/track.mp3",
  ],
  ```

  When `playlist` has entries, the folder isn't scanned.

If there are no tracks at all, the button plays the built-in synthesised engine, crowd and radio ambience instead.

Only add audio you have the rights to share. Keep files small (a few MB each), since visitors download them.
