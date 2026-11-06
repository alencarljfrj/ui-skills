# When to skip a beat

When to break the grid on purpose (drop the music, duck it, hold a pose, snap a note, cut a bar, end) and the reason for each. The grid is strict so that each of these reads as a decision.

## Contents

1. Choosing
2. Drop the music round a click that matters
3. Duck the music under the other clicks
4. Hold a result alone for a song beat
5. Hold still at the top of a rise
6. Two poses on a round number
7. Big changes step on the song beat, not the pose
8. Snap a note that falls between beats
9. A mark inside a pose
10. Cut whole bars, and say what it costs
11. Take the poses back before the next bar line
12. Start off a bar line, on purpose
13. The ending: hold about 2 seconds, end on a song beat
14. Otherwise end right after the action
15. What never skips

## 1. Choosing

| The moment | Skip | Reason |
|---|---|---|
| The click that matters most | drop the music to the next bar line | heard alone, the beat comes back with what follows |
| Any other click | duck the music to 45% for 160ms | room for the click's thump |
| A result (a tick, a copied state) | hold it alone for one song beat | seen before it's covered |
| The top of a rise | two identical poses | the move reads as rise and stop |
| A count reaching its figure | two poses on it | the number is read |
| A full-frame change | step on the song beat, every other pose | on the metronome, under three flashes a second |
| A note that falls between beats | the nearest accented beat | the user hears the beat, not the frame |
| A note asking for a length cut | whole bars | every later page stays on a bar line |
| The end | about 2 seconds, ending on a song beat | the music finishes with the picture |

## 2. Drop the music round a click that matters

- **Do:** silence the music from 50ms before the click's tick until the next bar line's hit. Fade out over 10ms and back in over 10ms, so it is full again 10ms before the hit.
- **Why:** the click is heard alone, and the beat comes back with the next page. It turns one click into an event.
- **From the film:** the first click in the film, a cursor running a command on a snare, was the only one dropped. The designer's notes came in two steps: "mute the beat slightly before/after the click so we can hear the click well", then "beat should come back at 12.22 (382), when the 0 count starts". The first version was silent from 50ms before the click to 120ms after. The second ran on to bar 20's kick, the counter's first frame, so the song was silent for 0.38s.
- **Tool:** `node scripts/duck.mjs music.wav music-ducked.wav --bpm 169.825 --offset 0.025 70-72`.
- **Against a metronome alone:** drop the metronome's own click on the click's snare, and hold the result alone until the next click, where the metronome comes back ([live.md](live.md) §5).

## 3. Duck the music under the other clicks

- **Do:** lower the music to 45% from 10ms before each click's tick to 160ms after it, and let it back up over 60ms.
- **Why:** the click carries a thump tuned to the song's bass. A mix makes room for a kick the same way, and without the room the two clip together. Even with the click 3.7dB under full scale, one sample still touched full scale on the final click.
- **From the film:** every click but the first, on a checkbox, a button, a copy button and the final link.
- **Tool:** `duck.mjs … 150:0.45 160:0.45 234:0.45 256:0.45`.

## 4. Hold a result alone for a song beat

- **Do:** when a click produces a result (an icon turning to a tick, a state changing), hold the page with the result alone for one song beat, two poses. Start the next thing on the following song beat.
- **Why:** the click is the cause, the result is the point. A viewer needs a beat to see it before the next page covers it.
- **From the film:** the designer's note: "make sure a checkmark is shown after copying the button, and then we switch on beat". Before, the unveil's first blocks covered the tick at once. The beat was taken from the unveil, which became a step quicker, so nothing after it moved. Earlier, an arrow turned to a tick on its click and held for the next pose, until the cut ("for a very brief moment").

## 5. Hold still at the top of a rise

- **Do:** a camera that rises and comes down holds dead still for two poses at the top: two identical poses.
- **Why:** this is the one place a repeated pose belongs inside a move. Without it, the camera drifts across the top as it turns, and the move reads as a sweep.
- **From the film's tabletop version** (a camera over a table, later dropped): a continuous sweep and the rise-and-stop were rendered side by side. The designer chose the stop: "It has to rise and stop".

## 6. Two poses on a round number

- **Do:** a counter that reaches its figure holds it for two poses, then moves on (the film's carried on in jumps under the next page).
- **Why:** the number is the message, so it is held long enough to be read.
- **From the film:** the counter counted a figure a pose on the strong ease-out, reached its round number on a downbeat, and held two poses.

## 7. Big changes step on the song beat, not the pose

- **Do:** step full-frame changes on the song's beats, every other pose: a colour cycle, a pixel unveil, a row of marks moving a place.
- **Why:** they then fall on the metronome's clicks, and a full-frame change every pose (5.66 a second) would flash too fast. The film's cycle changed 2.83 times a second.
- **From the film:** the designer's notes: "The transition between logos (first few seconds) is off metronome; make sure it's perfectly aligned with beat aka metronome" and "Expand the pixels (transition onto the last screen) in line with beat". The unveil went a third, two thirds and whole on three song beats (`onQuarters`).

## 8. Snap a note that falls between beats

- **Do:** when a timestamp falls between the song's beats, move it to the nearest accented beat (a bar's downbeat, the metronome's higher click). Say where it went and why.
- **Why:** the user hears a beat and writes down the time near it. The beat they mean is the accented one.
- **From the film:** "we should start switching colors at 1.10 (that beat)". 0:01.10 fell between two song beats, and the nearest accented one was bar 12's downbeat at 0:01.13. The colours started there. An earlier note, "at around 2.12", pointed to the groove's first big kick and snare at 0:02.15.

## 9. A mark inside a pose

- **Do:** a timestamp is a frame, and a pose is 5 or 6 frames. Start on the pose whose first frame is nearest the mark. Say which pose it is and that it is a frame off.
- **From the film:** 0:21.18 is frame 648, one frame into the pose that starts at frame 647 (0:21.17), so it started there, a frame early. 0:23.14 is four frames into the pose that starts at 0:23.10 and one frame before the next, so it started on the next pose (0:23.15), a frame late.

## 10. Cut whole bars, and say what it costs

- **Do:** when a note asks for a length change, make it in whole bars, even if that's a little more or less than asked. Then say what it costs.
- **Why:** a part bar moves every later page off its bar line.
- **From the film:** "make the entire sequence shorter by 4-5 clicks". Four clicks were cut rather than five, because four song beats are a whole bar. The cost came at the end: the final click moved from a big kick to a lighter downbeat. That was said, with an offer to take another bar elsewhere. A later change took out another bar, which put the ending back on the big kicks.

## 11. Take the poses back before the next bar line

- **Do:** when one part of a page must start earlier or later, absorb the difference inside the page: build faster, shorten a hold, lengthen a lead. The next bar line then doesn't move.
- **Why:** the designer's note: "Make sure rest of the video gets unaffected by this".
- **From the film:** a piece asked to show from 0:21.18 was built 1.5 times as fast so it finished before its lines thickened. The zoom before it finished a pose sooner to make room. The next page still came on its bar line. When the opening's zoom moved into the opening fill, the tagline after it still started at 0:05.20.

## 12. Start off a bar line, on purpose

- **Do:** start a page off a bar line only on a song beat (an even pose), and only for a reason the song gives. Write the reason where the page is declared.
- **From the film:** one page came on half-way through bar 28, during a drop, so its title typed in the quiet before the drums came back. Another started on the bar's second song beat because the designer's mark was there. Both were declared, so the bar-line check didn't warn.

## 13. The ending: hold about 2 seconds, end on a song beat

- **Do:** once the last action is done, hold the last page for about 2 seconds with the music playing under it. End on a song beat (a metronome click), fading the music over the last pose so it stops before its next hit.
- **Why:** the music finishes with the picture instead of being cut off mid-beat.
- **From the film:** "Extend last section for 2s (when done with animations), and extend the beat so it covers it". Two seconds is 11.3 poses. Eleven poses after the click was released landed on a song beat, so the hold is 1.94s, not 2.00s. Ending at the next bar line instead would have held 2.65s. The excerpt already covered it; only the metronome was rebuilt.
- **At another tempo,** keep the hold in poses: a whole number that ends on a click. The same 11 poses are 2.36s at 140 BPM ([live.md](live.md) §11).

## 14. Otherwise end right after the action

- **Do:** unless a hold is asked for, end the video on the pose after its last action. Take the cursor away the pose after its last click.
- **From the film:** "End the video after the click; it extends for no reason". Later: "Remove cursor after click".

## 15. What never skips

- The pose grid. Nothing moves between poses in the stop-motion cut, except typing, which runs quicker than the beat from its pose.
- Clicks on hits, placed to the sample.
- Pages on bar lines, except the declared ones.
- One clock for the whole video.
