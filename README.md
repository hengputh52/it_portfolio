# Meng Heng · Driver #52

A one-page portfolio styled as an F1 race weekend: a start grid on a real race photo, a race-programme driver bio, projects as Grand Prix results, the stack as a car setup sheet, and contact as team radio.

## Run it

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build && pnpm start
```

## Add your own music

Put audio files in `public/music/` (MP3 works everywhere). They become the soundtrack behind the sound button in the top bar, played in file-name order and looped. Use number prefixes to set the order, like `01-intro.mp3`. Refresh in `pnpm dev`, or run `pnpm build` again for production. With no files there, the button plays the built-in synthesised engine ambience.

The music path is set in `lib/data.ts` under `music`: `folder` picks which folder inside `public/` is scanned, and `playlist` lets you list exact tracks (file names, `/paths` or URLs, with optional titles) in your own order. See `public/music/README.md`.

## Change the photos

The backgrounds live in `public/img/track/`. Replace a file with your own photo of the same name to swap it:

- `hero.jpg`: the start grid (shown in black and white)
- `circuit.jpg`: behind the Race Results heading
- `pitlane.jpg`: behind Team Radio

The included photos are from Unsplash, free under the Unsplash License: [sydney Rae](https://unsplash.com/photos/a-formula-1-car-speeds-around-the-racetrack-BG3626wRWc0) (hero), [Charlie Schroeder](https://unsplash.com/photos/formula-1-race-cars-speed-along-a-track-BZRWZe7lUAg) (circuit) and [Chris Kursikowski](https://unsplash.com/photos/a-race-track-is-shown-under-a-cloudy-sky-d1MMoTwyheQ) (pit lane). They're credited in the footer.

## Where things live

- `lib/data.ts`: all content (driver bio, race results, car setup, press photos, contact). Edit this first.
- `lib/music.ts`: reads `public/music/` into the track list.
- `components/sections/`
  - `Grid.tsx`: hero. Start lights, name, radio-call tagline, telemetry, and the car that blasts past at lights out.
  - `Driver.tsx`: about, as a race programme. Driver card, stats, career sectors, off-track photography.
  - `Races.tsx`: projects. Classification table, then race cards in a season calendar (pinned sideways scroll on large screens, swipe on small ones) or a grid.
  - `Setup.tsx`: stack. A top-down car whose parts light up as you hover each component.
  - `Radio.tsx`: contact as radio channels, plus the footer.
- `components/PitWall.tsx`: navigation, the soundtrack player, and the race-progress bar with the car.
- `components/fx.tsx`: the car silhouette, motion-blur filters, speed-line overlay, camera-flash hook, section headings.
- `lib/audio.ts`: the synthesised fallback ambience (engines, crowd, team radio).
- `lib/motion.ts`, `components/SmoothScroll.tsx`: GSAP + Lenis setup.

## Motion

- **Lights out**: five red lights come on and go out, then a car blasts across the hero with motion blur, a light trail and a burst of speed lines.
- **Race progress**: a car drives along a line under the nav as you scroll. Its wheels spin with your scroll speed, the rain light glows when you scroll back up, and the lap counter ticks over.
- **Launches**: headings and cards arrive fast with motion blur and brake hard into place. Grid cards launch like a starting grid.
- **Camera**: the hero photo settles in like a tracking shot, and the photos drift with parallax as you scroll.
- **Hover**: motion blur and a light sweep on cards and buttons.
- **Speed lines** appear only when you scroll fast.

Lap times, positions and telemetry are decorative race-weekend framing, not measurements.

## Accessibility

No autoplay audio. The only flashes are small, single camera flashes on cards. With "reduce motion" on, visitors get native scrolling, no pinning (the calendar becomes a swipe), no car pass, speed lines, parallax or flashes, and all content visible immediately.
