# Playing it live

The same rules played live in a browser, against a metronome: one clock for the page, the picture just ahead of the sound, the sound scheduled ahead, and what changes when there is no song.

## Contents

1. One clock on the page's time
2. The picture on or just ahead of the sound
3. Sound scheduled ahead on the audio clock
4. Starting the sound
5. With no song, every change on a click
6. The metronome's own sound
7. Pausing on the beat
8. A typed tempo
9. Reduced motion
10. Type on screen
11. Endings at any tempo
12. Checking a live page

These values come from a page where six before-and-after scenes play in a browser against one metronome whose tempo the visitor sets, 60 to 200 BPM. The scenes are Geist, black on white, each drawn on a 640×360 canvas scaled to its card. Everything in the other references still holds; this file covers what a browser changes.

## 1. One clock on the page's time

- **One clock for the whole page**, as the film had one for the whole video. Every scene reads the same beat, so they all change on the same frame as the metronome's click.
- **The beat is a line through the page's time**, in poses: `beat = anchorBeat + elapsed seconds × BPM / 60 × 2`, the elapsed time from `anchorTime` on `performance.now()`. Two poses to a click: the metronome counts song beats, the scenes count eighths.
- **On a tempo change, re-anchor at now**: `anchorBeat` becomes the beat now and `anchorTime` now, then the tempo changes. The beat carries on from the same pose instead of jumping.
- **Every scene is a pure function of that beat**, its loop's pose `beat mod loop`. A pose is then the same whenever it's drawn, and a scene can join the clock at any moment. Keep no state between frames.
- **Only what's on screen animates.** An `IntersectionObserver` tells each scene when it's in view; out of view it holds a still pose and doesn't listen to the clock. One `requestAnimationFrame` loop runs while anything listens, and none when nothing does.
- **The example most on screen is the one heard** (the largest share in view, at least a quarter): its clicks and drops play, the others stay quiet. With a before-and-after divider, the side it shows more of is heard.

## 2. The picture on or just ahead of the sound

- **The same rule as the film's cut**: a change reads best on or just ahead of its sound ([song.md](song.md) §5).
- **A browser draws late.** Measured, a pose was drawn 3 to 11ms after its click was heard: React commits a change a frame after the beat is read, and the next paint shows it.
- **So the picture reads the beat 25ms ahead** (`PICTURE_LEAD_MS`): each frame draws the pose at `now + 25ms`. The sound keeps the clock's own time.
- **Commit every scene inside the animation frame.** Call the listeners inside React's `flushSync`, so the scenes commit in that frame and paint together with anything drawn straight onto the page, such as a metronome's needle set with `setAttribute`, not a frame after it.

## 3. Sound scheduled ahead on the audio clock

- **Schedule on the Web Audio clock; never play a sound on a frame.** A timer every 25ms schedules everything that falls in the next 120ms, each sound at its own time, and the audio clock plays it to the sample however late the timer runs.
- **Map the page's time to the audio clock's** with `AudioContext.getOutputTimestamp()`: a time `at` on `performance.now()` is `contextTime + (at − performanceTime) / 1000`, so a sound comes out of the speakers as its frame is on screen. Where it's missing: `currentTime + (at − performance.now()) / 1000 − (outputLatency || baseLatency)`.
- **Measure the lookahead window in audio time.** A beat's mapped time sits behind `currentTime` by the output's latency, so add that latency to the window. A Bluetooth headset has 150 to 250ms of it: without it, every click falls behind `currentTime`, is skipped as too late, and the page still says the sound is on.
- **Skip a sound that is already late** (due before `currentTime` plus a few ms) rather than play it off the beat.
- **Stop what's scheduled ahead** on a tempo change, a mute or a pause. Keep each scheduled source with its time and stop the ones still to come; otherwise up to 120ms of clicks play at the old tempo.
- **Suspend the audio when the tab is hidden** (`visibilitychange`), and on return re-sync the schedule to the beat now, so it doesn't catch up with a burst of missed clicks.

A sketch of the clock and the scheduler:

```ts
const POSES_PER_CLICK = 2;
const PICTURE_LEAD_MS = 25;
let bpm = 120, anchorBeat = 0, anchorTime = performance.now(), scheduled = 0;

const beatAt = (now: number) => anchorBeat + ((now - anchorTime) / 1000) * (bpm / 60) * POSES_PER_CLICK;
const audioTime = (at: number) => {
  const stamp = ctx.getOutputTimestamp?.();
  if (stamp?.performanceTime) return stamp.contextTime! + (at - stamp.performanceTime) / 1000;
  return ctx.currentTime + (at - performance.now()) / 1000 - (ctx.outputLatency || ctx.baseLatency || 0);
};

function setBpm(next: number) {
  const now = performance.now();
  anchorBeat = scheduled = beatAt(now); // re-anchored: the beat carries on from this pose
  anchorTime = now;
  bpm = next;
  stopScheduledAhead();
}

function frame(now: number) {
  const beat = beatAt(now + PICTURE_LEAD_MS);
  flushSync(() => listeners.forEach((draw) => draw(beat))); // every scene in this frame
  requestAnimationFrame(frame);
}

setInterval(() => {
  if (ctx.state !== "running" || muted) return;
  const now = performance.now();
  const latency = Math.max(0, (ctx.currentTime - audioTime(now)) * 1000); // the window in audio time
  const to = beatAt(now + latency + 120);
  for (let pose = Math.floor(scheduled / POSES_PER_CLICK + 1) * POSES_PER_CLICK; pose <= to; pose += POSES_PER_CLICK) {
    const when = audioTime(anchorTime + ((pose - anchorBeat) / POSES_PER_CLICK) * (60000 / bpm));
    if (when > ctx.currentTime + 0.004) tick(when, pose % 8 === 0); // the bar's first accented
  }
  scheduled = Math.max(scheduled, to);
}, 25);
```

## 4. Starting the sound

- **A browser plays sound only after the visitor's own press or key**, unless they've let the site play sound before. So try at load, which plays where the site is allowed, then start on the first `pointerdown`, `pointerup`, `touchend` or `keydown` anywhere on the page, listened for in the capture phase.
- **A press that just started the sound mustn't also mute it.** The first press often lands on the sound button itself: within 600ms of a start, that press starts the sound rather than muting it. A press while the sound is on but not yet allowed starts it too.
- **Remember a visitor's mute** in `localStorage`, every read and write wrapped in try/catch: a private window or blocked site data then just means sound on next time.
- **On Safari, set `navigator.audioSession.type = "playback"` only when the visitor presses a sound button themselves.** It then plays through the ringer switch, as a video does; the sound that starts on its own keeps to the switch.
- **Show whether sound is really coming out**: unmuted and allowed to play (`ctx.state === "running"`), not only unmuted.

## 5. With no song, every change on a click

- **With only a metronome, its clicks are the hits.** There is no drum between them to land on, so every visible change lands on a click you can hear. The designer's note on a board's slide was that it should "match to beat".
- **A move may step twice a click**, on the eighths (at 120 BPM it steps 240 times a minute), but it starts and lands on clicks. A board set off on a click (not drawn there, as it was still off the frame), stepped 38, 70 and 92% across on `easeOutSine`, and landed on the second click after, four poses on; the camera then came down over four more poses and filled the frame on the bar line.
- **A ground flash cuts once a click**, black and white by turns.
- **A pixel unveil goes a third a click** and is whole on the bar line.
- **The click itself goes on a snare, with the metronome's own click there dropped**, so it's heard alone. The result (a tick) holds alone until the next click, and the metronome comes back with the unveil's first blocks. Under any other click, the metronome's click plays at 45%, as the film ducked its song.
- **The camera's rise-and-stop lands on a bar line**: up in seven poses, two identical poses at the top, down in seven onto the next page.
- **Typing still runs quicker than the beat**, starting on a snare or a bar line. Set its pace in poses, so it keeps to the beat at any tempo: the film's letter every 25ms (authored) is an eighth of a pose, and its word every three frames (120ms authored) is 0.6 of one. The caret blinks two poses on, two off, with the metronome.

## 6. The metronome's own sound

- **An ordinary, quiet metronome: a wooden knock.** A sine near 880Hz, up in 1ms and decaying in 50ms, with an overtone at 2.72 times it (a wood block's) at about a third of its level, gone in 20ms. The bar's first is a fifth higher, 1320Hz. Peaks about 0.16, and 0.22 accented, so it keeps time under the page rather than over it.
- **Not a bright UI click.** A tactile UI click used as the metronome was called annoying.
- **No thump without a song.** The film's click had a bass thump tuned to its song ([sound.md](sound.md) §4). With no song over it, a thump under a click reads as a dull "dum". Leave it out unless there's music.
- **A cursor's click is a tactile click played a fifth lower** (at 0.67 of its rate) and softer than the tick, so it reads as a press, not as the metronome.
- **Everything through one limiter**: the clicks and the metronome share one output gain (0.8) and one compressor set as a limiter (threshold −6dB, ratio 12), so a click on a tick never clips.

## 7. Pausing on the beat

- **Stop on the click nearest the press**, the needle at an end of its swing and every scene on a whole pose.
- **If that click is still ahead, play on to it** (its click still sounds) and stop there; stop whatever is scheduled after it.
- **If it's just gone, settle back to it** over 160ms on an ease-out (cubic), and stop what's scheduled ahead.
- **Play carries on from that click**, a whole click to the next: re-anchor at the click and at now.

## 8. A typed tempo

- **The field takes 60 to 200 BPM.** A value outside them gives the control a small shake (1.2px at most, over 0.35s) and comes in at the nearest limit.
- **Enter sets it; clicking or tabbing elsewhere puts the old tempo back**, as Escape does. Up and Down step by one, Page Up and Page Down by ten.
- **A new tempo re-anchors at now** (§1) and stops what was scheduled at the old one (§3).

## 9. Reduced motion

- **With `prefers-reduced-motion: reduce`, every scene holds a still pose chosen to show the whole idea**: the camera at the top of its climb with both pages in view, the tick held alone after its click, the hand on the address with the underline whole. The metronome's needle holds in the middle.
- **Only an explicit press of a sound button lets them move.** The visitor has then asked for the beat, and the scenes follow it. The sound that starts on its own doesn't count, and nor does any first tap that wakes it.

## 10. Type on screen

- **The same tracking ladder** as in the frame ([type.md](type.md) §2): −1% from 20px, −2% from 32px, −3% from 56px, and +2% on small mono capitals.
- **Words at least 4.5:1.** The examples' secondary grey #6b6b6b is 5.1:1 on the page's #fafafa (5.3:1 on white); #a3a3a3 on black is 8.3:1.
- **Drawn marks that carry meaning at least 3:1** against their ground: a dial's notches, the pills that count the bar. #5c5c5c on black is 3.1:1.
- **Check a scaled scene's smallest words at the size they render.** A scene drawn on a fixed canvas and scaled to its card shrinks with it: at 0.5 scale a 13px caption renders 6.5px. Keep them at 9px or more on screen at the narrowest width the page allows.

## 11. Endings at any tempo

- **Hold the last page a whole number of poses that ends on a click.** The film held 11 poses after the click was released, 1.94s at 169.825 BPM; the same 11 poses are 2.36s at 140 and 2.75s at 120. Count the hold in poses, not seconds, so the end stays on the beat at whatever tempo is set.
- **The rest as in the film**: the underline in four steps from the downbeat (about 15, 50, 85%, then whole), the click on a snare, and the hand gone the pose after its click ([skipping.md](skipping.md) §13 and §14).

## 12. Checking a live page

- **Measure when a pose is drawn against when its click is heard**, and set the lead from what you measure (§2). Don't judge it by ear.
- **Try a Bluetooth headset**: every click still sounds, on the beat.
- **Change the tempo mid-move**: the pose carries on, and no click plays at the old tempo.
- **Hide the tab and come back**: the sound stops, then returns on the beat without a burst.
- **Press the sound button first**: the sound starts and stays on. Mute, reload: still muted.
- **Turn on reduced motion**: every scene holds its still pose until a sound button is pressed.
- **Look at the page at its narrowest width**: no word under 9px, every mark that carries meaning at 3:1.
