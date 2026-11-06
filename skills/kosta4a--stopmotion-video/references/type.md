# Type in the frame

How to set type that is seen for a few poses at a time: tracking by size, leading, contrast at every pose, figures, and how words come on.

## Contents

1. One family, black on white, by default
2. Tracking tightens as size grows
3. Leading tightens with it
4. Small mono capitals
5. Figures
6. Contrast at every pose
7. Greys for secondary words only
8. Titles are typed, never faded
9. Placement
10. Check the face

## 1. One family, black on white, by default

- **One typeface family by default**, a default taken from tactile-design, the designer's product skill. The examples use Geist for words and Geist Mono for code, commands and small labels, with hierarchy from size and an ink step.
- **Black on white by default**: 21:1, the most contrast there is. When a page takes a colour ground, the type is checked against it again (§6).
- **The film departed from both.** It paired a display face, used from about 32px up, with its text face and a mono, and set every page on a flat colour ground. Either is a fair choice for a film; the size rules and the 4.5:1 floor below hold whichever faces and grounds you use.
- **One weight for words.** Make a size step or an ink step before reaching for bold.
- **Load the faces before the first frame renders** (Remotion's `loadFont` holds every frame until the face is ready), so nothing renders in a fallback face.

## 2. Tracking tightens as size grows

The rule for this skill, as the designer set it: smaller letter spacing for larger sizes, from −1% to −3%. The size thresholds generalise from the sizes the designer has set.

| Size | Tracking (`letter-spacing`) |
|---|---|
| under 20px | 0 |
| 20px and up | −1% (`-0.01em`) |
| 32px and up | −2% (`-0.02em`) |
| 56px and up | −3% (`-0.03em`) |

- **Why:** a face's spacing is drawn for text sizes. At display sizes the gaps between letters grow with the letters and read as loose, so the tracking pulls them back in proportion.
- **What the designer set before this rule:** −1% on a 31px message. −2% on 32px mono captions, 64px headlines, a 136px statement line and the launch film's 181px titles. −3% on a 132px headline. This skill moves everything from 56px up to −3%.
- **Never go tighter than −2% at 16px or under**, the floor in tactile-design.
- **Write tracking in `em`**, so it scales with the type: `letter-spacing: -0.03em`, not a px value that is wrong at the next size.

## 3. Leading tightens with it

The leading values come from the sizes used in the film, the designer's other announcement films and tactile-design. The ladder between them is a generalisation.

| Size | Leading | Seen as |
|---|---|---|
| under 20px | 1.4–1.5 | 13/20, 16/24 |
| 20px | about 1.4 | 20/28 |
| 32px | about 1.25 | 32/40; a 31/40 message |
| 56px and up | 1.1–1.2 | 64px at 1.2; 132/150 |
| two-line display titles over about 150px | down to 0.9 | 181/163 in the launch film |

- **Set the line height in px, from the size.** A title's lines then sit the same distance apart wherever it appears, including when it is scaled down for a busy page (the film set those at 60% of the title size, lines and spacing with it).
- **Explicit line breaks, no wrapping** (`white-space: nowrap`). A title is written in the lines it is shown in ("fit in 2 lines"), so it never rewraps mid-type.

## 4. Small mono capitals

- **Mono capitals under 20px get a little positive tracking: +2%** (`0.02em`). Capitals sit tight at small sizes and need air. This follows tactile-design, which keeps positive tracking for tiny capitals and gives mono in fields +0.02em.
- **Use them for short labels only**: a name tag on a cursor, a caption under a figure. The film's cursor tags were 12/16 mono capitals.
- **Capitals at 32px and over are display type**, and take the size rule above. The film's 32px mono captions ran at −2%.

## 5. Figures

- **Counters and any changing number use tabular figures** (`font-variant-numeric: tabular-nums`), so the figure doesn't shift as it counts. Geist Mono's figures are all one width already.
- **Group thousands** (30,000,000). A counter is read in a pose or two.

## 6. Contrast at every pose

- **Every word reaches at least 4.5:1 against its ground, at every pose.** WCAG allows 3:1 for large text. This skill holds every word to 4.5:1, because a word may be on screen for less than a second.
- **Check the in-between poses, not only the settled one.** These include a ground cut under the words, a page being laid over, blocks of the next page spreading over the last, a zoom passing through a colour, and lines thickening behind a title. Check any pose where a word sits on a ground that isn't its own.
- **A pair that works for a mark doesn't always work for words.** A logo on a coloured ground can read at display size where the same two colours fail for a line of type. Check the type pair on its own.
- **Clear what's under the words.** When a title sits over a drawing or a grid, rub out a little of the drawing round the letters (the film used a halo in the ground's colour, 30px wide, blurred 8px). That restores the contrast without a box.
- **On a web page, marks that carry meaning need 3:1** (a dial's notches, pills that count the bar), and a scene drawn on a canvas and scaled down needs its smallest words checked at the size they render, 9px or more on screen ([live.md](live.md) §10).
- **Reference values:** black on white is 21:1. The lightest grey that passes on white is #767676 (4.54:1), and the darkest that passes on black is #757575 (4.56:1).

## 7. Greys for secondary words only

- **The words that carry the message are full ink.** Greys are for the second voice: a caption under a figure, a label, a prompt character.
- **A grey still passes 4.5:1** against its ground, at every pose.

## 8. Titles are typed, never faded

- **Titles come on typed, with a caret**, never faded in or risen in. The reference film typed its lines with a caret and swapped whole words. Typing reads on the beat, while a fade is a few in-between poses.
- **The pace:** a word every three frames for titles, a letter every 25ms (authored) for long lines, code in uneven chunks of 2 to 4 characters a pose ([poses.md](poses.md) §10).
- **The caret:** a thin bar in a title (0.04em wide, 0.74em tall), a block in a code field (0.6em wide). It is solid while typing, then blinks two poses on and two off.
- **Swap whole words or lines.** Delete with a held backspace, then type the new words on the next bar line.
- **An underline draws in four steps**, one a pose, 0.06em thick and 0.1em under the text.

## 9. Placement

- **A line keeps its place while it's typed.** Lay the group out on its full text, so letters arrive into a fixed layout.
- **A group moves only when something new joins it.** The designer's note: "center [it] vertically, then keep it centered; only move it up when the [field] appears". The lines rose over the field's two poses, so the lines and the field ended centred together.
- **Centre a closing stack as one group**: a mark, a short label, a title, nothing else between them.

## 10. Check the face

- **Tracking depends on the face.** The values above suit a face spaced like Geist or Inter. A tightly spaced face needs less negative tracking, and a loose one may take the full −3% from smaller sizes.
- **Look at the largest size at full resolution**, in a still, before it's animated. Look for letters touching, and a capital's side-bearings opening a gap.
