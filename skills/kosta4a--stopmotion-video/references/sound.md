# Sound

How clicks are placed on the song's hits to the sample, baked into one track, given room in the mix, and checked against a metronome.

## Contents

1. Every click on a hit
2. Place it to the sample
3. One click track from frame 0
4. A richer click, tuned to the song
5. Room in the mix
6. The metronome
7. Bake again when something moves
8. Rights

## 1. Every click on a hit

- **Every click sound goes on the song's own drum hit**, a kick or a snare, on the pose the press is drawn on. The click then sits in place of the hit rather than next to it.
- **The click and its press are one event.** Keep a single list of click poses that the scenes and the audio bake both read. A click component whose pose isn't in the list warns in the console.

## 2. Place it to the sample

- **A pose's first frame isn't the hit.** The film's hits landed 25ms after its poses, measured at the steepest rise of their high end: 23 to 29ms, from the excerpt's 23ms lead. A click placed on the pose's first frame landed anywhere from 21ms ahead of its hit to 7ms behind it.
- **Place the tick to the sample at the hit:** `pose × 60 / TEMPO / 2 + lag`. With a 25ms lag, the film's ticks measured within 3ms of their hits in a render.
- **Give the click file 40ms of quiet before its tick.** A renderer trims a sound that starts between frames to the sample, and that trim must only ever take quiet. Start the file 40ms before the hit, so the tick lands on it.
- **The press is drawn on the pose's first frame**, which falls between about 23ms ahead of its sound and 10ms after it (the film's arrow click led by 24ms; its copy click trailed by 5ms). The 30fps frame grid can't land it closer, and the picture reads best on or just ahead of the sound.

## 3. One click track from frame 0

- **Bake every click into one track** that starts on the video's first frame, as the music does.
- **Why:** a short sound started at its own frame comes in late in the Remotion Studio preview. A click that sounds on time in the render then sounds late while you review. One track from frame 0 keeps the clicks with the music and the metronome in the preview too.
- **The bake,** in plain Node over 16-bit PCM:

```js
const POSE = 60 / TEMPO / 2; // s
const LAG = 0.025; // where the song's hits land after the poses, s
const TICK_AT = 0.04; // the tick's place in the click file, s
for (const n of clickPoses) {
  const start = Math.round((n * POSE + LAG - TICK_AT) * RATE); // in sample frames
  for (let i = 0; i < click.length; i++) out[start + i] += click[i];
}
```

## 4. A richer click, tuned to the song

The designer's note: "add more bass / make richer click across all clicks we use; adapt it to song a bit".

- **Keep the tick** (the film's was a 65ms tick, raised 5dB) **and lay a kick's thump under it.** Keeping the tick where it is keeps every click on its hit.
- **Tune the thump to the song's bass.** Measure where the low end centres over the excerpt; the film's was B1, 61.7Hz. Use a sine that falls from 150Hz to that note in its first 25ms or so (an exponential with a 12ms time constant). It rises over 1.5ms and dies away over about 200ms (a 70ms time constant).
- **Add its octave at 0.18**, so it carries on laptop and phone speakers.
- **Soft-limit it (tanh) to a peak 3.7dB under full scale**, so the click and the music don't clip together.
- **Only under a song.** With no music over it, the thump reads as a dull "dum". A click played against a metronome alone keeps the tick and leaves the thump out ([live.md](live.md) §6).

## 5. Room in the mix

Make room for each click with `scripts/duck.mjs` ([skipping.md](skipping.md) has when to use which):

| Spec | What | The film's use |
|---|---|---|
| `T-U` | silent from 50ms before the click to 10ms before the next bar line's hit, 10ms fades | the one click that matters most |
| `T:0.45` | 45% from 10ms before the click to 160ms after, up over 60ms | every other click |
| `T` | silent from 50ms before to 120ms after, 10ms fades | the first version of the drop |

```sh
node scripts/duck.mjs public/audio/song.wav public/audio/song-ducked.wav \
  --bpm 169.825 --offset 0.025 70-72 150:0.45 160:0.45 234:0.45 256:0.45
```

With `--bpm`, the times are poses counted from `--offset`, the time of pose 0's hit. Without it, they are seconds, so a click that falls outside the file stops the script: it most often means a forgotten `--bpm`. Bake from the clean excerpt every time and play the ducked copy; the script won't write over its input, by any path or link to it.

## 6. The metronome

Remotion has no metronome of its own, so make one for checking the picture against the song.

- **A click on every song beat** (two poses), on its hits: the same lag as the clicks.
- **The first of each bar higher**: 2kHz at 0.75, the others 1kHz at 0.6. Each is a sine burst with a 1ms rise and a 9ms fall away, 40ms in all.
- **The music at 20% under it**, so the clicks sit about 10dB over it.
- **Its own compositions**, one per cut (30fps and 60fps). It is never in the export.
- **Checked in a render:** the film's metronome clicks landed within 2ms of the song's hits.
- **Played live with no song, the metronome is the music.** Then it should sound like an ordinary, quiet metronome, a wooden knock, not this checking beep or a bright UI click ([live.md](live.md) §6).

```sh
node scripts/make-metronome.mjs --bpm 169.825 --beats 134 --lag-ms 25 --out public/audio/metronome.wav
```

`--beats` counts song beats. A video of 268 poses is 134 song beats. `--subdivision 2` adds a quieter click on every pose. That extra click is this script's choice, not the film's.

## 7. Bake again when something moves

| Change | Bake again |
|---|---|
| A click moves | the click list, the click track, the ducked music |
| The video's length changes | the metronome; the excerpt too if the video outgrows it |
| The excerpt is recut | the ducked music, and check the lag again |
| The click sound changes | the click track |

## 8. Rights

A click sampled from a commercial track has to be cleared, or swapped for another, before the video is published. So does the song. Keep a note in the project of where each came from.
