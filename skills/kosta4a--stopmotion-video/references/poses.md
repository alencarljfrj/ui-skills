# Poses

How to space a move when it is seen only a few times a second, and the rules for each kind of thing that moves on the beat.

## Contents

1. Space the move, don't smooth the beat
2. Pick curves by their poses
3. A move's first pose is its first step
4. Every pose moves it visibly
5. Placed by hand, and landing
6. Zooms, thickening and openings
7. The camera
8. In from off the frame
9. Thing by thing
10. Typing
11. Measure a move

## 1. Space the move, don't smooth the beat

At 5.66 poses a second, a move is seen only at its poses, so the curve between them doesn't matter. What matters is where each pose falls. When a move looks rough, look at the size of each pose's step and respace the poses. Don't add frames.

A research pass on how stop motion is made found two things that apply here. Six poses a second is what animators call shooting "on fours" at 24fps, so the film's 5.66 sits close to it. And a good move's tapers take about a third of it, with a peak speed about 1.5 times the average. `easeInOutSine` peaks at π/2, about 1.57 times its average.

## 2. Pick curves by their poses

Sample each curve at the poses it will be seen at, and pick the one whose steps read.

| Curve | Poses | Use |
|---|---|---|
| `easeInOutSine` `(0.37, 0, 0.63, 1)` | 7, 18, 25, 25, 18, 7% over six | in and out moves: camera moves, a cursor's pass, an underline, a hand-placed sheet across the frame |
| cubic in-out `(0.65, 0, 0.35, 1)` | 3, 12, 35, 35, 12, 3% | not on the beat: it creeps at the ends and leaps in the middle |
| strong in-out `(0.77, 0, 0.175, 1)` | 2, 10, 48, 31, 8, 2% | not on the beat |
| `easeOutSine` `(0.61, 1, 0.88, 1)` | 38, 70, 92% over three | a page laid over another, a mark rolled in, a card dropped into its slot |
| strong ease-out `(0.23, 1, 0.32, 1)` | 78, 97, 100% over three (88, 99, 100% with `moved()`) | a counter, which should leap and then close in; not a short move, which it lands on the first pose and then hardly moves |

- **The worst problem the film's motion audit found was the camera's curve**, in its tabletop version (a camera over a table, later dropped). Sampled on the beat, its old in-out curve made the picture jump up to 740px (38% of the frame) between two poses and then sit almost still for five. Respaced on `easeInOutSine`, the same move in the same time became seven even steps out and seven down, with no step over about 410px.
- **A three-pose transition samples its curve at ¼, ½ and ¾.** None of its poses is then the old page alone or the new one alone; those are the poses either side of it (`onTheBeat`). A move counted with `moved()` samples at ⅓, ⅔ and 1, so it is whole on its last pose. The three-pose figures above are a transition's; the six-pose figures are each pose's step with `moved()`.

## 3. A move's first pose is its first step

- **No pose identical to the one it leaves.** In the tabletop version, the camera moves each started with a pose identical to the page they were leaving, and each landing held an extra pose. Both read as hesitation, and both were cut.
- **`moved(beat, from, poses, smooth)`** gives a move's progress on the beat: `(beat − from + 1) / poses`, clamped. The first pose is one step in and the last is whole. Put the result through the curve.
- **A page's first action starts on its first pose.** Something that waits on a window waits only until the window is down.

## 4. Every pose moves it visibly

- **A pose that barely moves reads as a stall.** On a cubic, a sheet's first and last poses moved 1.5px, no more than its hand jitter, and read as stopping. `easeInOutSine` fixed it.
- **Something that runs on its own** steps on the pose too: a page scrolling in a window, a row running across the frame (the film's rows ran 40px a pose), an embedded animation (baked one drawing per pose).
- **Hold a finished thing still.** Don't let it drift between poses.

## 5. Placed by hand, and landing

A sheet, a card or a window put down by hand is handled the way a stop-motion animator handles a puppet.

- **Off by a hand's correction.** Each pose is a little off, by at most a tenth of that pose's move (the film capped it at 1.5px and 0.8°), irregularly from a seeded random, not on a sine. The film's first version shook most when the sheet barely moved and rocked on a sine; both were wrong.
- **None once it stops.** When the move ends, the jitter ends.
- **Down once within a few px.** When what's left of the move is under a few px (8px for the film's sheets, 10px for its pointing hand), it is put down at its place, rather than creeping the last few px.
- **Lift and shadow agree.** Lifted, it is a little larger (3%) and its shadow falls further and softer. Flat, the shadow is tight.
- **A dropped card** falls in from above the frame over four poses (600px on `easeOutSine`). It wiggles as a dropped sheet does: turning 7, −4.5, 2.5, −1.2 and 0.5° and swaying 18, −11, 6, −2.5 and 1px, less each pose. It is still rocking on the pose it lands and square in its slot two poses later. It isn't drawn before it sets off.
- **A field put down** is lifted for one pose, then down. Anything centred with it rises over those two poses, so the group stays centred.

## 6. Zooms, thickening and openings

- **They grow by the same factor each pose**, so each pose reads as the same step: `scale = from × (to / from)^t` (`grow`), with `t` the move's eased progress.
- **A zoom keeps its target on a straight line to the middle.** The point under the frame's middle is `target − (1 − t) × (target − centre) / scale`, so the target's place on screen goes straight to the centre however fast the scale grows. A target that sits tilted turns square by the same `t`.
- **A zoom into a colour lands exactly on its last frame**, filled to the corners, so the cut to the next page on that colour is seamless. The film checked each such cut in renders, within a level either side.
- **Thickening lines** grew from 3 to 1,700px over six or seven poses, until they ran together into the next page's ground.
- **Openings** grew from 1.25 to 15 times their size over four poses.

## 7. The camera

- **Rise and stop.** A camera that rises and comes down holds dead still for two poses at the top: two identical poses. The film's tabletop version tried a continuous sweep that drifted across as it peaked. The designer chose the stop: "It has to rise and stop".
- **Seven even steps up and seven down**, with no step over about 420px, in the tabletop version's moves. The 47-second cut has no camera that rises and comes down; the rule and these values come from that earlier version.
- **Options offered and not taken:** the camera on every frame with the rest on the beat (as some stop-motion studios shoot camera moves); longer moves, about 1s more each, keeping every step under about 260px; a one-frame double exposure on the biggest steps. The first breaks the beat. The others cost time or need watching in motion.

## 8. In from off the frame

- **Use an ease-out**, or it spends its slow start out of sight and shows up half-way across. The film's windows did exactly that: nothing showed for two poses, then each popped in half-way. Over three or four poses use `easeOutSine`, since the strong ease-out lands on the first pose.
- **It isn't drawn until it has moved.** Its first pose is off the frame, but on a page drawn while the camera moves, that pose can land in view. A stray window showed on the page before its own because of this.
- **One after another, a pose apart.** The film's rows each slid in a pose after the last.

## 9. Thing by thing

| Thing | Rule | Why |
|---|---|---|
| Click | one pose pressed (`clicked`), on a kick or a snare | a web press (160ms down, 140ms held, 160ms up) mostly falls between poses |
| Hover | the cursor arrives and hovers two poses, the target showing its hover (the film's square darkened), then clicks | the click has a pose to answer |
| Cursor | glides on a critically damped spring (the film's took 450ms, its pointing hand 600ms), sampled on the pose; gone the pose after its last click | a hand on a mouse, not a toy; "remove cursor after click" |
| Caret | solid while typing, then two poses on, two off (`blink`), counted from the first pose after the typing | otherwise it vanishes for the frames between the last letter and the next pose |
| Spinner | at most a quarter turn (90°) a pose | a web spinner's 540° in 450ms, sampled on the beat, turned 240° a pose and read as turning backwards, as a wagon wheel does; over half a turn a pose always does |
| Rolled mark | turns by its travel over its radius (radians), so it lands upright; eight poses on `easeOutSine` | on the strong ease-out it turned over half a turn a pose; on `easeOutSine` its first poses turn 120 to 130°, more than a spinner's quarter but under half, so it still reads forwards |
| Counter | a figure a pose on the strong ease-out, in tabular figures; two poses on the round number; then it may jump on under the next page | it leaps, then closes in; tabular figures keep it from shifting as it counts |
| Underline | drawn left to right in four steps, one a pose (about 15, 50, 85%, then whole) | each pose a visible step |
| Colour cycle | a ground and its mark change together every song beat (two poses), light and dark by turns | on the metronome, and under three flashes a second (WCAG 2.3.1) |

## 10. Typing

Typing is quicker than the beat, as real typing is.

- **Titles:** a word every three frames (120ms authored), all there in about half a second.
- **Long lines:** a letter every 25ms (authored).
- **Code:** uneven chunks of 2 to 4 characters a pose, such as 2, 3, 3, 2, 4, 4, because a hand never types evenly.
- **Lines not yet typed keep their place.** Centre the group on its full text, so nothing shifts as letters arrive.
- **Held backspace:** one run from its pose, a letter every 25ms (authored), line breaks included, with the caret going back along the line. The film's first version took the last letter on the press and paused two poses before the run, as a real key repeat does. The designer's note, "don't delete the S … early", took it out: the line stays whole until the run starts.
- **Swap whole lines.** Type the new line in the old one's place on the next bar line.

## 11. Measure a move

- **List each pose's step in px**, from the scene's own numbers or from stills. The film's audit did this for every move.
- **Look for the outliers:** a step far bigger than its neighbours (a leap), steps of a pixel or two (a creep or a stall), a zero step inside a move (a repeated pose), a first step of zero (a pose identical to the one it leaves).
- **Compare two spacings side by side** as two short renders of the same move. The designer chose between the camera's rise-and-stop and the continuous sweep that way.
