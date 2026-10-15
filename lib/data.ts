// ============================================================
// Single source of truth for the site's content.
// Real facts (projects, stack, contact) framed as an F1 race programme.
// Lap times, positions and telemetry are decorative, not measurements.
// ============================================================

export const me = {
  name:      "Meng Heng",
  short:     "M. HENG",
  number:    "52",
  role:      "Backend developer",
  tagline:   "Backend engineering, race pace.",
  radio:     "Lights out. Systems green. Pushing now.",
  location:  "Phnom Penh",
  school:    "Cambodia Academy of Digital Technology",
  schoolShort: "CADT",
  workplace: "BongKert Solutions",
  languages: "Khmer & English",
  email:     "mheng770@gmail.com",
  github:    "https://github.com/hengputh52",
  linkedin:  "", // add your LinkedIn URL and it appears as a radio channel
  telephone: "+855 90979874",
};

// ============================================================
// MUSIC: the soundtrack behind the sound button in the top bar
// folder   → folder inside public/ to scan for audio files
//            ("/music" means public/music). Files play in name order.
// playlist → or list the tracks yourself, in the order you want.
//            Each entry is a file name in `folder`, a path inside public/
//            ("/audio/intro.mp3"), or a full URL, optionally with a title:
//              "01-intro.mp3"
//              { src: "/audio/pit-lane.mp3", title: "Pit lane" }
//            When the playlist has entries, the folder isn't scanned.
// Leave both empty (no files, empty playlist) for the built-in engine sound.
// ============================================================
export type MusicEntry = string | { src: string; title?: string };

export const music: { folder: string; playlist: MusicEntry[] } = {
  folder: "/music",
  playlist: [],
};

// ============================================================
// THE DRIVER: a race-programme bio
// ============================================================
export const driver = {
  intro:
    "Phnom Penh-based backend developer. Came up through the academy, now races for BongKert Solutions. Specialist in the part of the web nobody sees: the API behind the button, the schema under the screen, the job that runs in the dark and finishes before anyone wakes up.",
  quote:
    "Most days it feels like a race weekend. Something is off somewhere underneath, nobody knows why yet, and you go out and find it. You have to be curious, a little stubborn, and brave enough to read the logs.",
  career: [
    {
      stage: "Academy",
      sector: "S1",
      name: "Cambodia Academy of Digital Technology",
      note: "Where it started. Lectures by day, late nights after, and a first look under the hood of the web.",
    },
    {
      stage: "Junior series",
      sector: "S2",
      name: "First races",
      note: "PSA Book, TH Movie, Delivery Guy, Angkor Guide. Shipped, live, and learned from.",
    },
    {
      stage: "Team",
      sector: "S3",
      name: "BongKert Solutions",
      note: "Backend developer. APIs, schemas and services built to hold up under pressure.",
    },
  ],
  stats: [
    { k: "Number",  v: "52" },
    { k: "Base",    v: "Phnom Penh" },
    { k: "Academy", v: "CADT" },
    { k: "Team",    v: "BongKert Solutions" },
    { k: "Role",    v: "Backend developer" },
    { k: "Radio",   v: "Khmer & English" },
  ],
};

// ============================================================
// RACE RESULTS: each project is a Grand Prix entry
// round  → order in the season calendar (oldest first)
// result → finishing position; 1 to 3 get podium styling
// track  → which circuit outline to draw (0 to 4)
// ============================================================
export interface Race {
  id:       string;
  round:    number;
  gp:       string;
  year:     string;
  result:   number;
  gained:   number;
  lap:      string;
  setup:    string[];
  report:   string;
  imageSrc: string;
  source:   string;
  demo?:    string;
  status?:  string;
  track:    number;
  livery:   string;
}

export const races: Race[] = [
  {
    id: "psa-book", round: 1, gp: "PSA Book", year: "2025", result: 2, gained: 3, lap: "1:29.102",
    setup: ["Node.js", "MySQL", "React"],
    report: "Good books were gathering dust on shelves. Built a place to pass them on: a Node.js API over MySQL for accounts and listings, with React on top. Still on track, and books keep moving between readers.",
    imageSrc: "/img/psa_book.jpg",
    source: "https://github.com/hengputh52/PSABook.git",
    status: "Live",
    track: 1, livery: "var(--papaya)",
  },
  {
    id: "th-movie", round: 2, gp: "TH Movie", year: "2025", result: 6, gained: 0, lap: "1:30.659",
    setup: ["HTML", "CSS"],
    report: "A landing site for a movie streaming product. Plain HTML and CSS, no driver aids. Still running on Netlify.",
    imageSrc: "/img/th-movie.jpg",
    source: "https://github.com/hengputh52/steaming-website.git",
    demo: "https://thmovie.netlify.app/",
    track: 2, livery: "var(--blue)",
  },
  {
    id: "delivery-guy", round: 3, gp: "Delivery Guy", year: "2025", result: 5, gained: 1, lap: "1:30.214",
    setup: ["Unity"],
    report: "A game about racing food across a busy city before the clock runs out. Watch for traffic.",
    imageSrc: "/img/delivery_guy.jpg",
    source: "https://github.com/hengputh52/Delivery-Guy.git",
    track: 3, livery: "var(--amber)",
  },
  {
    id: "angkor-guide", round: 4, gp: "Angkor Guide", year: "2026", result: 4, gained: 2, lap: "1:29.877",
    setup: ["Flutter"],
    report: "A tour guide for the Angkor temples that works with no signal. No pit stops needed: everything lives on the phone.",
    imageSrc: "/img/angkor_guide_1.jpg",
    source: "https://github.com/hengputh52/Angkor_Guide.git",
    track: 4, livery: "var(--green)",
  },
  {
    id: "das-tern", round: 5, gp: "Das Tern", year: "2026", result: 1, gained: 4, lap: "1:28.416",
    setup: ["NestJS", "PostgreSQL", "Docker", "Flutter"],
    report: "Paper prescriptions are easy to misread and easy to lose. Team strategy: take a photo, run it through local OCR in a NestJS API, let an AI step turn the text into doses, and keep the schedule in PostgreSQL. Now nobody has to guess which pill comes next.",
    imageSrc: "/img/das-tern.jpg",
    source: "https://github.com/Choeng-Rayu/das-tern.git",
    track: 0, livery: "var(--red)",
  },
];

/** "1:29.102" → seconds */
export const lapSeconds = (lap: string) => {
  const [m, s] = lap.split(":");
  return Number(m) * 60 + Number(s);
};

// ============================================================
// CAR SETUP: the stack as car components
// part → which part of the car diagram lights up
// ============================================================
export type CarPart = "engine" | "chassis" | "tires" | "aero" | "gearbox" | "cockpit" | "bodywork";

export interface Component {
  part:  CarPart;
  name:  string;
  tech:  string;
  note:  string;
  spec:  { label: string; value: number; unit: string; fill: number };
}

export const setup: Component[] = [
  { part: "engine",   name: "Engine",    tech: "Node.js & TypeScript", note: "The power unit. Runs everything and gets everywhere fast. Types catch problems before they reach the track.", spec: { label: "Oil temp", value: 104, unit: "°C", fill: 0.72 } },
  { part: "chassis",  name: "Chassis",   tech: "NestJS",               note: "A rigid structure: modules, controllers, providers. Every channel organised, everybody in contact.",          spec: { label: "Torsional stiffness", value: 98, unit: "%", fill: 0.98 } },
  { part: "tires",    name: "Tyres",     tech: "PostgreSQL",           note: "Where the grip comes from. The primary compound: finds anything, even deep in the data.",                    spec: { label: "Tyre temp", value: 96, unit: "°C", fill: 0.66 } },
  { part: "tires",    name: "Alt. compounds", tech: "MySQL & MongoDB", note: "More compounds in the garage, picked for the conditions of the job.",                                         spec: { label: "Wear", value: 14, unit: "%", fill: 0.14 } },
  { part: "aero",     name: "Aero",      tech: "Docker",               note: "Same downforce on any circuit. Ships and behaves the same way everywhere.",                                     spec: { label: "Downforce", value: 1840, unit: "kg", fill: 0.84 } },
  { part: "gearbox",  name: "Gearbox",   tech: "Git & GitHub",         note: "Every shift recorded. We always know how we got here, and can go back a gear.",                               spec: { label: "Shift time", value: 28, unit: "ms", fill: 0.28 } },
  { part: "cockpit",  name: "Cockpit",   tech: "Flutter",              note: "The driver's view on mobile. Takes the whole thing with you.",                                                 spec: { label: "Display", value: 60, unit: "fps", fill: 0.6 } },
  { part: "bodywork", name: "Bodywork",  tech: "React & Next.js",      note: "The part the grandstands see. Clean lines over the machinery underneath.",                                     spec: { label: "Drag coeff.", value: 0.7, unit: "Cd", fill: 0.35 } },
];

// ============================================================
// OFF TRACK: volunteer media work
// ============================================================
export const prints = [
  { id: "p1", stamp: "06.12.25", where: "Digital Government Forum", what: "Event video, public relations", imageSrc: "/img/dgf_image.jpg" },
  { id: "p2", stamp: "21.11.25", where: "VBNK",                     what: "Digital storytelling workshop", imageSrc: "/img/digital_story_image.jpg" },
  { id: "p3", stamp: "21.11.25", where: "SongxExpert",              what: "Video competition",             imageSrc: "/img/sony_video_2.jpg" },
  { id: "p4", stamp: "01.03.25", where: "Dream Girl Contest",       what: "Media team, behind the camera", imageSrc: "/img/dgf_gor.jpg" },
];
