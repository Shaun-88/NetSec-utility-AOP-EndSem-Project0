# Training Grounds Story Page: Build Document

Read this together with `AGENTS.md`, `docs/project-brief.md`, `docs/architecture.md` and `docs/HANDOFF.md` before changing anything.

## 1. What we are building

A scroll-driven storytelling subpage for **The Big Bro's NetSec Armoury**. It explains the Training Grounds (a sandbox for simulated, interactive cybersecurity practice) by narrating its BRD. The visitor scrolls, and a cinematic camera journey plays in step with the scroll: a cable on a wall, into the wire, along a network, to a computer, through its Ethernet port, and into storage where the data is downloaded.

- It is a **subpage** linked from the Training Grounds card on the home page. It is not a separate site.
- **Desktop only** for now (16:9). Do not build a phone version. It must not break on small screens, but no mobile polish is needed.
- Keep the existing look: dark by default, black background, neon green (#00FF66) with faint amber accents, clean modern sans-serif type (no monospace), same style as the rest of the site.
- Follow the existing modular structure. Do not modify unrelated tools or shared systems. If a shared piece must change, tell me first.

## 2. The story

The hero is a **glowing, blocky cube-shaped data packet**. The camera follows it. The voice is Big Bro, short noir-style lines. The text below is a **draft**. Replace it with wording taken from the Training Grounds BRD where the BRD has it, and keep each line short.

| Scene | Clip file | What happens | BRD topic shown as text |
|---|---|---|---|
| 1 | `scene-01-dark-room.mp4` | Slow push through a dim room toward a glowing green cable on the wall | Purpose: why Training Grounds exists |
| 2 | `scene-02-into-the-wire.mp4` | Camera dives into the cable, then flies down a tunnel of light toward a glowing packet | The problem: most people never get to practise security safely |
| 3 | `scene-03-packet-journey.mp4` | Follows the packet through junctions and router hubs, out into a dark office with a computer | Who it is for and what they learn |
| 4 | `scene-04-the-computer.mp4` | Camera circles the desk to the back of the computer, and the Ethernet port glows | The labs (modules) |
| 5 | `scene-05-through-the-port.mp4` | The packet is scanned at a green security gate, enters the port, and the camera follows it inside | Safety rules: everything is simulated |
| 6 | `scene-06-the-download.mp4` | The packet splits into small cubes that fill a wall of storage blocks, then the camera pulls back out to the office where the monitor shows a full progress bar | Architecture: sign-in, database, progress |
| 7 | **built in code, no video** | Zoom out from the monitor into the training arena, using the site's own glow and card styles | Scope, limits and future work |
| 8 | **built in code, no video** | A large "Enter Training Grounds" button | Link to the labs |

Draft copy (replace with BRD wording):

1. *"Every system starts somewhere. In the dark, with one wire."* (Purpose)
2. *"Most people never get to touch real security. One wrong click, and it is not practice any more."* (Problem)
3. *"Students, beginners, the curious. If you can read a screen, you can learn this."* (Users and learning)
4. *"Hands-on labs, one skill at a time."* (Modules; list the real labs from the BRD)
5. *"Nothing here touches a real system. Everything is simulated, and the gate checks every packet."* (Safety)
6. *"Sign in, practise, and your progress is saved."* (Architecture; use the real stack from the BRD)
7. *"What it does, what it does not, and what comes next."* (Scope and future work)
8. Button: **Enter Training Grounds**

Proposed labs (not confirmed, check the BRD): Phishing Spotter, Crack-Time Lab, Mock Login (a simulated vulnerable login), Port Scan Sim. All simulated inside the page, never against real servers.

**Important:** Training Grounds is not finished (its home-page card shows OFFLINE). Until the labs exist, the final button must clearly say "Coming soon" and not link to a broken page. Make this a single setting I can flip later.

## 3. Assets

Six clips, 16:9, generated at 4K 24 fps, each about 10 seconds.

Folder plan (relative to the project root):

- `assets-source/training-grounds-story/` holds the **original 4K clips**. Add this folder to `.gitignore`. These files are far too big for GitHub (100 MB per file limit) and for Vercel.
- `public/story/` holds the **web-ready** versions that the page loads. Keep these small.
- `assets-source/training-grounds-story/frames/` holds optional reference stills named `scene-0X-last-frame.png`.

Clip rules:

- Every clip after Scene 1 **starts with about 1 to 2 seconds that repeat the end of the previous clip**. Find the first new frame by comparing the opening frames with the last frame of the previous clip, trim that overlap, and make sure each join between scenes is seamless. Tell me the trim time you chose for each clip. Do this from the original files and do not re-encode more than once.
- Each clip has its own audio. See section 5.
- A small Gemini sparkle sits in the bottom-right corner of the original videos. Crop it out or cover it so it never shows on the page.

## 4. How the scroll works

Pick the approach and tell me what you chose and why. Options:

- **A. Frame sequence on a canvas** (frames drawn from scroll position). Smooth in both directions, but heavy.
- **B. Video scrubbing**, with every clip re-encoded so each frame is a keyframe, and `video.currentTime` set from scroll position.

Requirements:

- One pinned full-screen stage. Scroll position maps to the whole journey, scene by scene. Smooth scrolling (Lenis or similar) is welcome.
- Scrolling backwards must play the journey backwards without stutter.
- Text panels fade in and out over the stage at their scene's scroll range. Keep text readable over the bright parts of the video (dark gradient or panel behind it).
- Starting point for the scroll length (adjust if it feels wrong): about 200vh per video scene and about 150vh for each of scenes 7 and 8.
- **Page weight matters.** Keep the web-ready assets as small as you can without visible blocking (1080p is enough). Load scene by scene, with the first two scenes loaded up front and the rest loaded ahead of the viewer. Show a small loading state if a scene isn't ready. Tell me the total size before you finish.
- Use a fallback: if the assets fail to load, the text sections must still read in order on the dark background.
- Add a visible progress indicator (a thin green line or scene dots) and a "skip to Enter" link at the top.
- Add the holographic feel in code over the video: a very light scan-line overlay and a gentle glow on the text panels. Do not alter the clip colours.

## 5. Sound

Each original clip has generated audio (hum, whooshes, a "gate approved" chime, and so on). Scrubbing a video back and forth makes its own audio unusable, so do this instead:

- Extract each clip's audio as a reference file, `scene-0X-audio.mp3`, into `assets-source/training-grounds-story/`.
- On the page, play one quiet **ambient loop** (a low electrical hum), and trigger **short sound effects at set scroll points**: for example, a whoomp when the camera enters the cable, a soft click at each junction, the chime at the security gate, a "complete" chime at the end. Pick the points from the scene list in section 2.
- Sound must start only after a user action. Reuse the site's existing press-to-start sound gate if it is available. Always show a mute button.
- Do not add music.

## 6. Build order

1. Read the files listed at the top. Confirm the plan in a few lines before writing code.
2. Prepare the assets: trim, crop, and export the web-ready versions into `public/story/`. Report the trim times and file sizes.
3. Build the page with scenes 1 to 3 first. Check it in the browser, scrolling both directions.
4. Add scenes 4 to 6, then 7 and 8 in code.
5. Add the sound, the progress indicator and the fallback.
6. Test, then link the page from the Training Grounds card. Do not touch the other tools.

## 7. Done when

- Scrolling plays all six clips in order, smoothly in both directions, with no visible jump at any join.
- Each text section appears at the right moment and is readable.
- Scenes 7 and 8 are built in code and match the site's style.
- The Enter button follows the "Coming soon" setting.
- It works on desktop in the browser you test with, and still deploys on Vercel with the file sizes within limits.
- The original 4K files are not in Git.

## 8. What I need from you (Antigravity) at the end

A short summary: what you built, which scroll approach you chose, the trim times, the total size of the web assets, anything you could not finish, and anything I should check by hand.
