# The clock

How the video keeps time: one clock for the whole video, frames per pose, pages on bar lines, how lengths change, and how to wire it in Remotion.

## Contents

1. The pose is the song's eighth note
2. Author on a 200ms pose
3. Frames per pose
4. One clock for the whole video
5. Pages on bar lines
6. Changing a page's length
7. Remotion wiring
8. The 60fps smooth variant
9. Everything from the frame

## 1. The pose is the song's eighth note

- **30fps, on purpose.** The low frame rate is the look. It was the designer's standing note: "keep low framerate on purpose".
- **A pose is held for one eighth note of the song.** At 169.825 BPM that is 176.65ms, or 5.66 poses a second, each held 5 or 6 frames. Six poses a second is shooting "on fours" at 24fps.
- **Before the song, the film ran 6 poses a second, 5 frames each.** Locking to the song moved that to the eighth note. Don't keep a round pose length next to a song: it drifts off within a bar or two.
- **Everything holds each pose and changes together**, transitions included. Typing is the one exception: it runs quicker than the beat, as typing does, from its pose ([poses.md](poses.md) §10). The film's motion audit found one thing moving on every frame, a skeleton page scrolling inside a window. It was the only off-beat motion on its page, and it was moved onto the pose.

## 2. Author on a 200ms pose

- **Write every time in authored ms, on a 200ms pose.** Turn it into frames with `ms()`.
- **`SPEED = TEMPO / 150`.** A 200ms eighth note is the eighth note of 150 BPM, so playing the authored timeline `TEMPO / 150` times faster makes each authored pose play as the song's eighth. At 169.825 BPM, `SPEED` is 1.1322.
- **Anything with its own clock reads `seconds()`, never `frame / fps`.** That covers embedded animations and pages that play. Otherwise it runs at authored speed against a faster video.
- **Times stay in authored ms in the code**, including the 25ms per letter, three frames per word and 50ms press in [poses.md](poses.md). Times in the audio (the 25ms hit lag, the 50ms and 10ms duck edges) are real seconds.

## 3. Frames per pose

- **A pose isn't a whole number of frames.** At 30fps and 169.825 BPM it is 5.2996 frames, so poses are 5 or 6 frames long.
- **Pose `n` starts on frame `ceil(n × 5.2996)`** (`beatFrame`). Pose 72 starts on frame 382, and pose 268 ends the film at frame 1,421 (47.37s).
- **Round only where Remotion needs a whole number** (`durationInFrames`, `<Sequence from>`). `interpolate()` takes fractional frames.

## 4. One clock for the whole video

- **Count poses on the whole video's frames, never on a scene's.** A scene that counts from its own first frame starts part-way into a pose. It then changes a frame after everything else at some of its poses, and the song with it.
- **Each page gets the video frame its own time starts on**, through the `BeatClock` context. In a scene, read the pose with `useBeat()`, never `stepAt(useCurrentFrame())`. Read the frame a pose starts on with `useBeatFrame()`.
- **A scene that starts a clock of its own** (a counter that carries on under the next page) gives that clock its own `BeatClock`.
- **Played live in a browser, the one clock is the page's time**: the beat a line through `performance.now()`, re-anchored at now when the tempo changes, every scene a pure function of it ([live.md](live.md) §1).

## 5. Pages on bar lines

- **Every page is a whole number of poses and starts on a bar line**, a pose divisible by 8.
- **An exception is written down where it's made.** The film had two. One page came on half-way through bar 28, during a drop, so its title typed in the quiet before the drums came back; it kept the slot it had when it followed an earlier page straight away. Another started on the bar's second song beat, because that was where the designer's note put it. Both started on a song beat (an even pose), and both were declared in the storyboard (`barBeat`), so the bar-line check didn't warn.
- **Check it in code.** Lay the storyboard out in poses and warn when a page's start isn't where it's meant to be on the bar.

## 6. Changing a page's length

Changing a page's length moves everything after it. Change it by whole bars, or take the poses back elsewhere before the next bar line. Otherwise every later page falls off the song.

- **By whole bars.** A note asked for "9 seconds; can we do 6-7". The page went from 9.2s to 6.4s, two bars, and everything after it moved two bars earlier on the song.
- **Longer here, shorter there.** A page made "1.5s longer" got a bar (1.41s), and the last page's hold got a bar shorter, so the ending stayed on its kick.
- **Taken back inside the bar.** A page extended by one song beat, to show a tick alone, took that beat from the transition after it. The unveil went one step quicker and everything after it stayed where it was.
- **Moved inside the page.** A page whose first part was shortened gave its first bar a longer lead, so its later events stayed on their hits.

## 7. Remotion wiring

Remotion is the tool this skill proposes by default (SKILL.md, "The tool"). Its config, as the film's:

```ts
// remotion.config.ts: applies to `remotion studio` and `remotion render`
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95); // the default 80 roughens flat grounds and thin type
Config.setColorSpace("bt709"); // players show the colours as the browser does
Config.setOverwriteOutput(true);
```

Pin `remotion`, `@remotion/cli`, `@remotion/transitions` and `@remotion/fonts` to one exact version; mixed versions fail at render.

Keep the storyboard as data, laid out in poses:

```tsx
const PAGES = [
  { name: "Opening", durationMs: beats(72), scene: <Opening /> },
  { name: "Counter", durationMs: beats(16), scene: <Counter /> },
  { name: "Install", durationMs: beats(10), scene: <Install />, comesOn: { transition: slideOver("from-left"), poses: 3 } },
  // barBeat: where on the bar a page starts, when not on its first pose; live: plays during its transition
];

let next = 0;
const LAYOUT = PAGES.map((page) => {
  const from = next; // the pose its transition sets off on
  const own = from + (page.comesOn?.poses ?? 0); // the pose its own time starts on
  next = own + Math.round(page.durationMs / STEP_MS);
  return { ...page, from, own, end: next };
});
for (const { name, own, barBeat = 0 } of LAYOUT)
  if (own % BAR !== barBeat) console.warn(`${name} comes on pose ${own}, not where it's meant to on the bar`);
export const TOTAL_POSES = next;
export const TOTAL_FRAMES = beatFrame(TOTAL_POSES, 30);
```

Then play it as a `TransitionSeries` (`@remotion/transitions`):

- **Each page's sequence runs from its transition's first frame** to the frame the next page's own time starts: `beatFrame(nextOwn) − beatFrame(from)`.
- **Each page gets its clock:** `<BeatClock.Provider value={beatFrame(live ? from : own)}>`.
- **A page being laid on holds its first frame** while its transition runs, so what happens on it starts once it's all there: `<Freeze frame={after} active={frame < after}><Sequence from={after}>…</Sequence></Freeze>`. A `live` page plays during its transition instead. The film's page seen through growing openings was already moving as they opened, as asked.
- **The music and the click track go at the root, from frame 0**, as `<Html5Audio>` (`<Audio>` in earlier Remotion 4 releases). The music's volume falls to 0 over the last pose.
- **The metronome cut is the same component with a prop.** It adds the metronome track and plays the music at 20%. Register it as its own composition and never export it ([sound.md](sound.md)).
- **Nothing in the tree takes a `from` offset.** Dragging a track in the Studio's timeline writes one into the code (`<AbsoluteFill from={…}>`, `<TransitionSeries from={…}>`). The film got four: 17 frames put the colour flashes off the metronome, 376 left black at the end, and −3 put the whole video 100ms early against the music. Search for `from={` after every Studio session and remove any that appear.
- **Keep TypeScript on 5.x.** Remotion 4's esbuild loader reads `tsconfig.json` through `typescript.sys`, which TypeScript 7 no longer exports. Without it, JSX compiles to `React.createElement`, and module-level JSX (the storyboard list) crashes with "React is not defined".

## 8. The 60fps smooth variant

A second composition can play the same storyboard, song and poses at 60fps, with everything moving every frame instead of holding a pose. The stop-motion cut stays untouched. A `Smooth` context, set by the composition, tells the scenes which cut they're in.

- **`useBeat()` gives the pose to the frame**: a fraction of the way into it.
- **`moved(beat, from, poses, smooth)`** is how far a move has come. On the beat, its first pose is its first step; smooth, it starts from nothing at `from`. Use it, not `(beat − from + 1) / poses`, for anything that moves.
- **`press(now, atMs, smooth)`** is a click. On the beat it is one pose pressed. Smooth, it goes down in the 50ms before its pose, so it's down as its sound is, and comes up over 150ms (authored).
- **Transitions take `smooth`**: their progress runs to the frame.
- **Each thing gets its own smooth form.** A counter counts to the frame. A row that steps a place each song beat eases between places and is there on the beat. A wiggle eases between its poses. A spinner turns at the web's own pace (540° in 450ms). A cursor glides without its per-hop turns. A baked animation is baked at twelve poses per pose.
- **The same length.** The film's smooth cut was 2,841 frames for the same 47.4s.

## 9. Everything from the frame

- **Drive every movement from `useCurrentFrame()`.** CSS transitions and keyframes, and a motion library's `animate()` or animated components, run on the wall clock. A render draws frames out of order across tabs, so they flicker or skip.
- **Use a motion library only for its maths, sampled at the frame**: a spring's value at a time, or a colour mix at an amount.
- **Use Remotion's `random(seed)`, not `Math.random()`**, so every render draws the same poses.
- **Bake an embedded animation one pose at a time.** The film ran a website's own drawing script in Node, saved the SVG it drew at each pose (0.2s apart on its own clock), and showed one a pose.
