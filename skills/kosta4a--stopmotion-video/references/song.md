# The song

How to measure a track, cut the excerpt, and map the song onto poses and bars before anything is animated.

## Contents

1. What to find
2. Tempo from onsets
3. Check that the grid holds
4. Bars, phrases, drops and big kicks
5. Cut the excerpt exactly to the sample
6. Map the song to poses
7. Half-time feel
8. A song map
9. Rights

## 1. What to find

Before any storyboard, write down these six things. Everything after is set to them.

| Find | Why |
|---|---|
| The tempo, to three decimals | The pose is its eighth note. At 170 BPM, a tempo 0.1 BPM off puts the picture a frame (33ms) off the song after 56 seconds |
| Where the first beat is | The excerpt starts a hair before a hit, so a pose's first frame falls on or just ahead of its sound |
| The bars and phrases | Pages start on bar lines. A phrase start is the best place to begin the excerpt |
| Where the drums drop out and come back | The build goes in the quiet; the landing comes when the drums return |
| The big kicks | The biggest changes land on them |
| The snares | Clicks and pops land on them |

## 2. Tempo from onsets

Measure the tempo from the song's onsets, not from a tag or a tap. A tagged BPM is rounded, and a tap is never closer than a few ms.

1. **Onset strength.** Compute spectral flux per band: the rise in log magnitude, bin by bin, from one short frame to the next, summed within a few frequency bands. Scale each band to its own level, so the kick, the snare's body and the hats count alike.
2. **Tempo.** Autocorrelate the onset strength between 70 and 200 BPM.
3. **Grid fit.** Find the attack of each strong hit near a grid line, then fit a straight line through the attacks by beat number. Its slope is the beat's period and its intercept is the first beat. Fit to attacks rather than flux peaks. In the film's first measurement, the flux grid sat 34ms off the real attacks, because a flux frame smears an attack over tens of ms.

`scripts/find-tempo.mjs` does all three on a 16-bit WAV:

```sh
ffmpeg -i song.mp3 -ac 2 -ar 44100 -c:a pcm_s16le song.wav
node scripts/find-tempo.mjs song.wav --from 95 --to 185
```

On the film's 52.5s excerpt it reports 169.83 BPM (169.828), with the first beat at 0.026s and the hits a median 1.2ms off the grid. The film measured 169.825 over a longer stretch. Use the longest stretch the video will use, since a longer stretch fixes the tempo more tightly.

## 3. Check that the grid holds

A fitted tempo is only as good as the stretch it holds over. Check how far the hits sit off the grid across all of it.

- **The film's track held to within 1.5ms from 1:35 to 3:05.** That is sequenced music. A live drummer drifts, and then you need a tempo map instead of a single TEMPO.
- **Look at the worst two-bar stretch, not only the median.** A slow drift shows as one end of the song sitting off the grid while the median looks fine. `find-tempo.mjs` reports the median, the worst hit and the worst two-bar stretch. It fails with "no clear beat" on a stretch with too few sharp attacks to fit, and when the grid it fits falls outside `--min` and `--max`, rather than report a tempo it can't stand behind.
- **Measure where the hit actually lands.** The film measured its hits at the steepest rise of the high end, 23 to 29ms after their poses (25ms typical), from the cut's 23ms lead. Use the attack, not the start of the sound file or the flux frame.

## 4. Bars, phrases, drops and big kicks

- **The downbeat.** It is the beat of the bar where the low band hits hardest. In the film's track, the kick fell on 1 and the snare on 2 and 4. The breakbeat looped every two bars, and a big kick opened every odd bar.
- **Phrases.** These are groups of two-bar loops. Start the excerpt and the big pages on a phrase start.
- **Drops.** The drums dropped out half-way through a bar and came back on the next phrase's downbeat. The film built in the quiet (lines growing, a title typed) and landed when the drums returned (cards falling into place).
- **Fills.** The song's opening fill had a snare on almost every sixteenth. It carried the opening's quickest move: the first page slid in over three poses and the camera came down onto it over four.
- **Listing them.** `find-tempo.mjs --bars` lists every bar's start, how hard its downbeat hits against the median bar, and how sharp the attacks on its beats are in each half. A half well under the median points to the drums dropping out, and a downbeat well over it points to a big kick. These are pointers, so listen to confirm: a pad or sample with sharp attacks can read as drums.

## 5. Cut the excerpt exactly to the sample

- **Cut with ffmpeg's `atrim`, not an MP3 seek.** `atrim` is exact to the sample; a seek in an MP3 isn't.
- **Start a hair before a phrase's first kick.** The film started 23ms ahead. Each pose's first frame then falls between 23ms ahead of its hit and 10ms after it. Picture changes read best on or just ahead of the sound.
- **Fade in over 3ms** so the cut doesn't click. **Fade out over the video's last pose**, so it stops before the song's next hit.
- **Cut it long enough to cover the video.** If the video grows past the excerpt, cut again, longer, from the same point.
- **If the video grows at the front, start the excerpt earlier by whole bars.** When the film's opening grew by 16 poses, the excerpt started two bars earlier, and every later page stayed on its hit.

```sh
ffmpeg -i song.mp3 \
  -af "atrim=start=111.8556:duration=52.5,asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.003" \
  -ar 44100 -ac 2 -c:a pcm_s16le public/audio/song.wav
```

The start time is the hit's time less the lead. Take the hit's time from `find-tempo.mjs` run over the whole song. The excerpt then starts at that moment less 0.023s.

## 6. Map the song to poses

- **A pose is the song's eighth note.** A bar is 8 poses, with the kick on pose 0 and the snares on poses 2 and 6.
- **Number the song's bars, then name every event by its pose.** In the film, pose 0 was the kick opening the song's bar 11. Pose 8 was bar 12's downbeat, and pose 72 was bar 20. Bar `b` starts on pose `8 × (b − first bar)`.
- **Choose the excerpt so its events fall where the story needs them.** The film's excerpt was picked to put the drum break under the camera's dive (in an earlier cut; after later edits it fell under a piece building in the quiet), the drums' return under the cards landing, and the final click on a big kick.
- **Keep the map in the code.** Write it as a comment next to the storyboard, so a page whose length changes can be checked against it.

## 7. Half-time feel

A 170 BPM drum and bass track feels like 85: the snare on 2 and 4 is heard as the backbeat of a slow bar. Measure and count at 170, because that keeps the eighth note at 5.66 poses a second. If autocorrelation finds 85, the snares half-way between its beats show that the beat is twice as fast. `find-tempo.mjs` checks this and says which tempo it chose and why.

## 8. A song map

Fill this in before the storyboard. These are the film's rows, with brand words taken out.

| Pose | Song | Picture |
|---|---|---|
| 0–8 | the opening fill (bar 11) | the first page slides in, the camera comes down onto it |
| 8 | bar 12's downbeat | the colours start changing, a song beat each |
| 32 | bar 15 | a line typed |
| 42 | bar 16's snare | the line deleted in one held-backspace run |
| 48 | bar 17 | new words typed |
| 70 | a snare | the click that runs the field |
| 72 | bar 20 | the counter |
| 132 | the drums drop out, half-way through bar 27 | a piece builds in the quiet |
| 140 | half-way through bar 28 | a page comes on, its title typed in the quiet |
| 144 | bar 29, the drums come back | cards fall into their slots |
| 150 | a snare | a tick |
| 160 | bar 31's big kick | a click on a button |
| 224 | bar 39's big kick | a page laid down |
| 234 | a snare | a click on a copy button |
| 240 | bar 41's big kick | the last page whole |
| 256 | bar 43's big kick | the final click |
| 268 | a song beat | the end |

## 9. Rights

A commercial track has to be cleared before the video is published, and so does any sound sampled from one. Note in the project where the excerpt and every sample came from.
