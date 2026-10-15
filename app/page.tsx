import { SmoothScroll } from "@/components/SmoothScroll";
import { PitWall } from "@/components/PitWall";
import { CheckerStrip, MotionBlurDefs, SpeedOverlay } from "@/components/fx";
import { Grid } from "@/components/sections/Grid";
import { Driver } from "@/components/sections/Driver";
import { Races } from "@/components/sections/Races";
import { Setup } from "@/components/sections/Setup";
import { Finish, Radio } from "@/components/sections/Radio";
import { getTracks } from "@/lib/music";

export default function Home() {
  // every audio file in public/music becomes a soundtrack track
  const tracks = getTracks();

  return (
    <>
      <MotionBlurDefs />
      <SmoothScroll />
      <PitWall tracks={tracks} />
      <SpeedOverlay />

      <main>
        <Grid />
        <CheckerStrip />
        <Driver />
        <Races />
        <Setup />
        <Radio />
      </main>

      <Finish />
    </>
  );
}
