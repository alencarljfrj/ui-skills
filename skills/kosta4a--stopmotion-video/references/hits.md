# Hits and transitions

What lands on which part of the song, and how one page gives way to the next.

## Contents

1. What lands where
2. Clicks on the beat, transitions free
3. A page's first action on its first pose
4. Build in the quiet, land when the drums return
5. Overlap, don't queue
6. No idle poses
7. Transitions: few kinds
8. One direction, nothing fades
9. Grounds and flashes
10. From the reference film

## 1. What lands where

| In the song | In the picture | The film |
|---|---|---|
| Eighth notes (every pose) | code typed in chunks, steps of a move | code typed 2 to 4 characters a pose; titles and a held backspace ran quicker than the beat from their pose (a word every three frames, a letter every 25ms authored) |
| Snares (poses 2 and 6 of a bar) | clicks, pops, a tick | the field's arrow clicked (pose 70), a checkbox ticked (150), a copy button clicked (234) |
| Downbeats | landings, new pages, a page's first action | every page's own time on a bar line |
| Big kicks | the big changes | a button clicked (bar 31's, pose 160), a page laid down (bar 39's), the last page whole (bar 41's), the final click (bar 43's) |
| A fill | the quickest move | the first page slid in over three poses and the camera came down over four, during the opening fill |
| The switch into the groove | the start of a cycle | the colours started changing on bar 12's downbeat |
| Drums drop out | the build | a piece built in the quiet, its lines thickening |
| Drums come back | the landing | cards fell into their slots on bar 29's downbeat |

- **Every click falls on a kick or a snare**, so its sound sits in place of a drum hit (the designer's note: "make sure all the clicks are on beat, and they appear over (instead of) a kick / snare / beat in the song").
- **Count backwards from the hit.** If a click is on pose 70, the cursor sets off a few poses before and hovers for two, so the press lands on the snare.
- **With only a metronome and no song, the clicks are the hits.** Every visible change lands on a click you can hear: a move may step on the eighths but starts and lands on clicks, a flash cuts once a click, an unveil is whole on the bar line ([live.md](live.md) §5).

## 2. Clicks on the beat, transitions free

The designer's words: "transition can be off beat, but click shouldn't". A click is heard, so it must land on a hit, to the sample ([sound.md](sound.md)). A transition is seen, and it can start between hits as long as its poses stay on the pose grid. The film's pixel unveil started one song beat after a click and stepped on the song's beats. The page seen through growing openings started part-way into a bar and was whole on the next bar line.

## 3. A page's first action on its first pose

- **Something happens on a page's first pose**: a word typed, a card set off, a row sliding in. A page that sits still on its first poses reads as late.
- **What waits on a window waits for it to be down.** Work out the pose the window lands on and start the next thing there, not at a guessed time.

## 4. Build in the quiet, land when the drums return

When the drums drop out, the song is holding its breath. Put the build there: lines growing, a title typed, the camera going in. When the drums come back, land something on the downbeat. In the film the drums dropped out half-way through a bar, and a piece built and thickened in the quiet. On the next phrase's downbeat the drums came back as cards fell into their slots. The excerpt was first chosen to put the drum break under the camera's dive into a colour; after later edits the break fell under the piece building instead, and a page came on in the last half-bar of it, its title typed in the quiet.

## 5. Overlap, don't queue

Start the next action while the last one is still landing, so its first hit can come as soon as the last thing is down. The designer's note: "Agents can start coming in simultaneously as the boxes are moving in … so that as soon as the boxes slot in they can start." The cursors set off while the cards fell and arrived as each landed. That took a bar out of the page, and it put the later pages back on the big kicks.

## 6. No idle poses

Once what happens on a page is done, hold it only as long as a viewer needs to take it in. Then the next thing happens on the beat. The designer's note: "Catch any of these unnecessary pauses (when animations are done) and cut them out." The film's first pass held its pages 1 to 1.4s after their last action, one of them 2.8s. Cutting those holds took the cut from 36.8s to 28s. The exceptions are deliberate holds ([skipping.md](skipping.md)).

## 7. Transitions: few kinds

| Kind | When | How |
|---|---|---|
| **Hard cut on the beat** | the ground carries on, the same colour either side; or the camera has gone into a colour | on a pose, usually a bar line |
| **Ground cut under a subject that stays put** | a figure or mark that holds still | the ground cuts through colours under it; the film's counter cut through three, ending on the next page's colour |
| **Laid over like a sheet** | a new page coming over the last | from the left, 3 poses on `easeOutSine` (38, 70, 92%), squaring up from 3° as it lands, the faintest shadow at its edge (`0 0 22px rgba(0,0,0,.16)`); the page under stays put; the page being laid holds its first frame (`slideOver`, `onTheBeat`) |
| **The camera going in until a colour fills the frame** | something on the page has the next page's colour (a white page in a window, a filled button) | zoom until it fills to the corners on the last frame; cut to the next page on that colour, then assemble it there ("just spawn stuff in on the zoomed in frame") |
| **Filled from inside** | a drawing made of lines | lines thickened a pose at a time, growing as a zoom does, until they run together into the next page's ground (3 to 1,700px over six or seven poses) |
| **Through a shape** | a shape on the page that can open (the film's: a pair of eyes that shut) | the next page seen through openings of that shape, growing 1.25 to 15 times over four poses, already playing under them (`throughShape`, `inSteps`) |
| **Pixel blocks** | after a click | the next page in 120px blocks spreading from the click (each block's turn: 0.8 of its distance, 0.2 a seeded random), a third, two thirds and whole on the song's beats (`pixels`, `onQuarters`) |

- **None of a transition's poses is the old page alone or the new one alone.** Those are the poses either side of it.
- **A cut into a colour must match.** The film checked each in renders: within a level either side of the cut.
- **The page being brought on** either holds its first frame until it's all there, or plays under the transition when it should already be moving (`live`).

## 8. One direction, nothing fades

- **Few kinds of change, one direction.** Forward is left to right.
- **Nothing fades.** A fade was tried on the film and taken out ("does not really match the rest of the video"). Later, a fade from top to bottom over a black page was asked for, then reverted: "Don't fade in … overlay it on top like before; like a sheet". At 5 or 6 poses a second, a fade is only a few in-between pictures held still.
- **Never crossfade between saturated grounds.** At this pace the whole hold is spent blending two colours. In plain RGB, blue to green passes through a muddy teal.
- **Nothing that needs blur**, as the research pass on launch films put it.
- **Slow into the landing.** Pages come in on an ease-out, and things land rather than stop dead.

## 9. Grounds and flashes

- **Grounds are flat colour, edge to edge.** A change of ground is a cut on a pose.
- **Keep full-frame flashes under three a second** (WCAG 2.3.1). The film's colour cycle changed every song beat, 2.83 times a second, light and dark by turns.
- **If a ground must blend** (in the smooth variant, not the stop-motion cut), mix it in linear light: 700ms on CSS `ease`.

## 10. From the reference film

The designer sent a launch film as the reference, and it was studied frame by frame. It:

- changes scenes by hard cuts on the beat;
- cuts the ground's colour under a subject that stays put (its counter went through three colours, then a flash before the next scene);
- puts its pictures on whole, a frame or two apart, never sliding or fading them in;
- types its lines with a caret and swaps whole words;
- types small subtexts a character at a time;
- morphs pixel blocks into icons.

A research pass on launch films added: few transition types, one direction, slow into the landing, no crossfades between saturated colours, nothing that needs blur.
