# Checking

How to check a stop-motion cut against its song: contact sheets, measured sync, the metronome cut, notes given as timestamps, and the loop for taking a run of notes.

## Contents

1. A contact sheet, one still per pose
2. Measure the sync
3. Watch the metronome cut
4. Notes as timestamps
5. Taking a run of notes
6. After every change
7. Before an export

## 1. A contact sheet, one still per pose

- **Look at every pose, not a playback.** A playback hides a leap, a repeated pose or a stray thing for a pose. A sheet of stills shows them.
- **One still per pose, a bar per row.** Take the first frame of each pose (`beatFrame(n)`) and lay them out eight across, so each row is a bar and the bar lines run down the left edge.
- **From a render,** with ffmpeg:

```sh
# poses 0 to 31 (four bars) at 169.825 BPM, 30fps: the first frame of each, eight across
SEL=$(node -e 'const P = 30 * 60 / 169.825 / 2; const f = []; for (let n = 0; n < 32; n++) f.push(Math.ceil(n * P - 1e-9)); console.log(f.map((x) => `eq(n\\,${x})`).join("+"))')
ffmpeg -i out/video.mp4 -vf "select='$SEL',scale=320:-1,tile=8x4" -frames:v 1 -fps_mode passthrough sheet.jpg
```

- **For a change in progress,** render only the stretch (`npx remotion render <Comp> --frames=<first>-<last>`), or single stills (`npx remotion still <Comp> --frame=<n>`).
- **Read it for:** a first pose identical to the one before, a pose that barely moves, a leap, something from off the frame appearing early, a cut that doesn't match colour to colour, a word under 4.5:1 on any pose, a click drawn on the wrong pose.
- **Compare two options as two short renders of the same move.** The rise-and-stop was chosen over a continuous sweep that way, in the film's tabletop version.

## 2. Measure the sync

Measure the rendered file's audio against its frames. Don't trust a preview or your ear.

| Check | Target | The film |
|---|---|---|
| Each click's tick against its hit | within a few ms | within 3ms, after placing to the sample (21ms ahead to 7ms behind before) |
| Page changes against the downbeats | within 15ms | the big kicks within 15ms of their frames; cuts −7 to +8ms |
| The metronome against the song | within 2ms | within 2ms |
| A drop round a click | silent through the click, back by the hit | silent from 12.341s, back in full at 12.733s, the counter's first frame |

- **Clicks:** decode the render's audio and find each tick by matching the click file's waveform near where it should be. Then compare it with the song's hit, found as the steepest rise of the high end.
- **The whole grid:** run `scripts/find-tempo.mjs` on the render's audio. The tempo should match the excerpt's, and the first beat should sit at the same lag (about 25ms in the film). A different first beat means something has shifted. A `from` offset left by a Studio drag put the film 100ms early.
- **Clipping:** check the peak where a click meets the music. In the film one sample still touched full scale on the final click.
- **Played live in a browser:** measure when each pose is drawn against when its click is heard, and try a Bluetooth headset, a hidden tab, a tempo change mid-move and reduced motion ([live.md](live.md) §12).

## 3. Watch the metronome cut

- **A composition with the metronome over the music at 20%.** Every change should land on a click, the downbeats on the higher one. Remotion has none built in ([sound.md](sound.md)).
- **Keep it out of the export.** Export the clean composition.

## 4. Notes as timestamps

The user's notes arrive as timestamps read off the Studio: "at 0:44:16", "12.11", "0:22:04", "12.22 (382)".

- **The Studio shows m:ss.ff, where ff is the frame within the second** (00 to 29 at 30fps). "0:22:04" and "0:22.04" are the same mark. Its frame is `(m × 60 + ss) × 30 + ff`: 0:22.04 is frame 664. A note sometimes gives the frame too ("12.22 (382)").
- **A media player shows decimal seconds** (0:12.7), and a copy sheet sent to reviewers should say which it uses. A value of 30 or more after the point can't be frames.
- **Frame to pose:** `pose = floor(frame / frames per pose)`. Pose to bar: `bar = first bar + floor(pose / 8)`, and the pose in the bar is `pose mod 8`.
- **Then decide** ([skipping.md](skipping.md) §8 and §9). A mark inside a pose starts on the pose whose first frame is nearest. A mark between song beats snaps to the nearest accented beat. Say which you chose and how far it is from the mark: "0:21.18 is frame 648, one frame into the pose at 0:21.17; it starts there."
- **Answer in the same notation**, with the pose and the bar alongside: "the click lands at 0:12.11, pose 70, bar 19's snare".

## 5. Taking a run of notes

The film was made over a few hundred short notes, often several in a row, some correcting the last ("or start animating … then*").

- **Read a run as one intent.** The latest note wins, and a correction replaces the note before it.
- **Apply each note without moving anything else.** The designer said so outright ("Make sure rest of the video gets unaffected by this"). Retime by whole bars, or take the poses back inside the page ([skipping.md](skipping.md) §10 and §11).
- **When a note can mean two things, do both if they agree.** "Too long" for a zoom meant both that it started late and that it took long, so both were fixed.
- **When a note can't land exactly, say why and where it went:** a frame early, the nearest accented beat, four clicks instead of five.
- **Keep the record.** Keep the storyboard in poses, the song map, and why each page is the length it is, in the project's notes, so the next note starts from what was decided.

## 6. After every change

- **Typecheck,** then reload the Studio and look for bar-line warnings.
- **Search for `from={`** in the composition tree and remove any offset a Studio drag wrote.
- **Rebake** the click track, the ducked music or the metronome if a click or the length moved ([sound.md](sound.md) §7).
- **Stills of the changed stretch,** one per pose, and the sync measured if a click, a cut or the excerpt moved.
- **Put the shared preview's playhead back to frame 0.** The user watches the same Studio, and a playhead left mid-video hides the opening.
- **Say which exports are now out of date.** A file already exported doesn't have the change.

## 7. Before an export

- [ ] The clean composition, not the metronome one
- [ ] No `from` offsets in the tree
- [ ] The ducked music and the click track baked from the current click list
- [ ] Sync measured in the finished file
- [ ] The file checked: resolution, frame rate, length, sound present
- [ ] Stills pulled from the finished file wherever copy changed
- [ ] The rights cleared: song, sampled sounds, fonts, any third-party marks
