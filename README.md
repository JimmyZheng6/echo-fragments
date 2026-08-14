<h1 align="center">Echo Fragments</h1>

<p align="center">
  <strong>Listen. Explore. Collect. Reconstruct.</strong>
</p>

<p align="center">
  An interactive music puzzle game created for the<br>
  <strong>NUS School of Computing Summer Workshop 2026</strong><br>
  <strong>Structure and Interpretation of Computer Programs (SICP) Final Project</strong>
</p>

<p align="center">
  <strong>🏆 Gold Prize — First Place</strong><br>
  SICP Final Project Competition
</p>

<p align="center">
  <a href="https://github.com/JimmyZheng6/echo-fragments/releases/tag/v1.0.1">
    <img src="https://img.shields.io/badge/release-v1.0.1-7057ff" alt="Release v1.0.1">
  </a>
  <img src="https://img.shields.io/badge/award-Gold%20Prize%20%7C%20First%20Place-FFD700" alt="Gold Prize — First Place">
  <img src="https://img.shields.io/badge/language-JavaScript-f7df1e" alt="JavaScript">
  <img src="https://img.shields.io/badge/runtime-Node.js%2022-5fa04e" alt="Node.js 22">
  <img src="https://img.shields.io/badge/original-Source%20Academy-1f6feb" alt="Source Academy">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-2ea44f" alt="MIT License">
  </a>
</p>

<p align="center">
  <img src="docs/screenshots/start-menu.png" alt="Echo Fragments start menu" width="850">
</p>

## Awards

🏆 **Gold Prize (First Place)** — NUS School of Computing Summer Workshop 2026,
Structure and Interpretation of Computer Programs (SICP) Final Project
Competition.

Echo Fragments received the highest project award for its integration of
functional music synthesis, procedural exploration, interactive gameplay, and
audio-driven puzzle design.

## About the Game

**Echo Fragments** is an audio-driven exploration and sorting game originally
built with JavaScript in Source Academy and later packaged as a standalone
Node.js/Vite project for easier local use.

A melody has been broken into fragments and scattered across a procedurally
generated world. Listen to the original song, explore the map, preview nearby
fragments, collect the correct pieces, and reconstruct the melody before time
runs out.

Visual labels, colours, and starting positions change between games. Harder
modes also introduce distractor fragments, so players must solve the puzzle by
listening instead of memorizing a fixed visual answer.

## Quick Links

- **Latest published release:** [Echo Fragments v1.0.1](https://github.com/JimmyZheng6/echo-fragments/releases/tag/v1.0.1)
- **Gameplay video:** [Watch or download the MP4](https://github.com/JimmyZheng6/echo-fragments/releases/download/v1.0.1/echo-fragments-gameplay.mp4)
- **Download the project:** Use **Code → Download ZIP** on the repository page, or clone the repository with Git
- **Project poster:** [View the poster PDF](docs/echo-fragments-poster.pdf)
- **Original Source Academy program:** [`echo-fragments-game.js`](echo-fragments-game.js)

## Run the Game Locally

The recommended way to play Echo Fragments is to run the Node.js/Vite version
locally. The instructions below cover both Windows and macOS.

### Project Requirements

- [Node.js](https://nodejs.org/) 22
- npm, which is installed together with Node.js
- A modern browser such as Chrome, Edge, Firefox, or Safari
- Internet access for any audio or image assets loaded from remote URLs

### Windows Setup

1. Download **nvm-windows** from the
   [official releases page](https://github.com/coreybutler/nvm-windows/releases).
2. Download and run `nvm-setup.exe`.
3. Close and reopen PowerShell or Command Prompt. If `nvm use` reports a
   permissions error, open the terminal with **Run as administrator**.
4. Install and activate Node.js 22:

```powershell
nvm install 22
nvm use 22
node --version
npm --version
```

The Node.js version should begin with `v22`.

5. Download the project using either method below.

**Option A — Clone with Git**

```powershell
git clone https://github.com/JimmyZheng6/echo-fragments.git
cd echo-fragments
```

**Option B — Download ZIP**

- On GitHub, click **Code → Download ZIP**.
- Extract the ZIP file.
- Open PowerShell or Command Prompt inside the extracted
  `echo-fragments` folder.

6. Install the dependencies and start the development server:

```powershell
npm install
npm run dev
```

7. Open the local URL printed in the terminal, usually
   `http://localhost:5173`.

### macOS Setup

1. Open Terminal and install **NVM**:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.6/install.sh | bash
```

2. Close and reopen Terminal so that the `nvm` command is available.
3. Install and activate Node.js 22:

```bash
nvm install 22
nvm use 22
node --version
npm --version
```

The Node.js version should begin with `v22`.

4. Download the project using either method below.

**Option A — Clone with Git**

```bash
git clone https://github.com/JimmyZheng6/echo-fragments.git
cd echo-fragments
```

**Option B — Download ZIP**

- On GitHub, click **Code → Download ZIP**.
- Double-click the ZIP file to extract it.
- In Terminal, change into the extracted `echo-fragments` folder.

5. Install the dependencies and start the development server:

```bash
npm install
npm run dev
```

6. Open the local URL printed in the terminal, usually
   `http://localhost:5173`.

### Returning to the Game Later

After the first installation, you do not need to run `npm install` every time.
Open a terminal in the project folder and run:

```bash
npm run dev
```

Keep the terminal open while playing. Press `Ctrl+C` in the terminal to stop
the development server.

### Troubleshooting

- Run all npm commands from the repository root—the folder containing
  `package.json`.
- Do not open `index.html` directly. Start the Vite server with `npm run dev`.
- If `nvm` is not recognized after installation, close and reopen the terminal.
- If Windows cannot switch Node.js versions, reopen the terminal as
  Administrator and run `nvm use 22` again.
- If the browser blocks audio, click once inside the game before pressing a
  Play button.
- If assets fail to load, check the internet connection and refresh the page.
- If the default port is occupied, Vite will print a different local URL; open
  the exact URL shown in the terminal.

## Run the Original Source Academy Version

The original integrated Source Academy program is preserved in
[`echo-fragments-game.js`](echo-fragments-game.js).

1. Open the [Source Academy Playground](https://sourceacademy.org/playground).
2. Select **Full JavaScript**.
3. Copy the complete contents of `echo-fragments-game.js`.
4. Paste the code into the editor and run it.
5. Open the Arcade 2D display tab if it is not selected automatically.

The standalone version in `src/main.js` contains compatibility changes needed
for Node.js, Vite, and Phaser. The original gameplay design and core logic are
preserved.

## How to Play

1. Choose **Easy**, **Hard**, or **Extreme**.
2. On the listening screen, click **Play Full Song** to study the complete
   melody, or click **Skip to Map** to begin exploring immediately.
3. If you listen to the song, the map opens automatically after the animated
   `3–2–1` countdown.
4. Explore the map while avoiding monsters.
5. Preview nearby fragments and collect the pieces that belong to the song.
6. Manage inventory, health, stamina, and three lives.
7. Collect all eight correct fragments and reach the goal.
8. In the sorting stage, listen to the records and drag them into the correct
   musical order.
9. Submit the sequence before the timer reaches zero.

### Difficulty Levels

| Difficulty | Correct fragments | Distractor fragments | Experience |
| --- | ---: | ---: | --- |
| Easy | 8 | 0 | Learn the melody and reconstruct its order |
| Hard | 8 | 2 | Identify and reject two incorrect fragments |
| Extreme | 8 | 4 | Identify and reject four incorrect fragments |

## Controls

### Exploration

| Input | Action |
| --- | --- |
| `W` `A` `S` `D` | Move the character |
| `F` | Sprint while stamina is available |
| `R` | Preview a nearby music fragment |
| `E` | Collect a fragment or enter the sorting stage |
| `Q` | Drop the selected fragment near the character |
| `1`–`8` | Select an inventory slot |

Uppercase and lowercase movement keys are both supported.

### Menus and Sorting

| Input | Action |
| --- | --- |
| Mouse click | Select difficulty, play or skip the song, preview audio, and submit |
| Mouse drag | Move a record to another sorting slot |
| Click the active Play button again | Stop the current fragment |

## Gameplay Screenshots

### Listen to the Song

<p align="center">
  <img src="docs/screenshots/listening-screen.png" alt="Full-song listening screen" width="850">
</p>

### Explore and Collect

<p align="center">
  <img src="docs/screenshots/map-gameplay.png" alt="Map exploration gameplay" width="850">
</p>

### Reconstruct the Melody

<p align="center">
  <img src="docs/screenshots/sorting-gameplay.png" alt="Music fragment sorting gameplay" width="850">
</p>

### Endings and Prize

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/success.png" alt="Success screen"></td>
    <td width="50%"><img src="docs/screenshots/failure.jpg" alt="Failure screen"></td>
  </tr>
  <tr>
    <td align="center"><strong>Success</strong></td>
    <td align="center"><strong>Game Over</strong></td>
  </tr>
</table>

<p align="center">
  <img src="docs/screenshots/prize.png" alt="Prize music selection screen" width="850">
</p>

## Main Features

- Animated difficulty-selection and full-song listening scenes
- Optional **Skip to Map** button before, during, or after song playback
- Programmed music synthesis and multi-instrument audio
- Procedurally generated and validated exploration map
- Wall collision and valid object placement
- Nearby fragment preview before collection
- Inventory selection and safe, non-overlapping fragment dropping
- Health, stamina, sprinting, monsters, and a three-life system
- Two health packs refreshed every 30 seconds
- Fixed and movable music records
- Individual audio preview with click-to-play and click-to-stop
- Randomized fragment labels, colours, positions, and starting arrangements
- Distractor fragments for Hard and Extreme modes
- Success, failure, instructions, and prize scenes

## Technical Highlights

### Functional Music Synthesis

Melodies are represented as note-and-duration lists. Recursive functions
transform those lists into sound functions using the Source Academy `sound`
module.

### Higher-Order Sound Composition

The sound system uses `map`, lambda expressions, recursion, `make_sound`, and
`get_wave`. `consecutively` constructs melodic lines, while `simultaneously`
combines right-hand, left-hand, and multi-instrument parts.

The sound-generation programs are kept in [`sound/`](sound/). They were run
separately to synthesize and record the MP3 resources used by the main game.

### Guaranteed-Playable Procedural Map

Walls and objects are generated algorithmically. Breadth-first search uses a
queue and visited grid to verify that the player can reach the goal, preventing
unwinnable maps.

### State-Driven Character and Scene Systems

A shared update loop coordinates input, movement, collision, inventory,
stamina, health, monsters, audio, timers, animation, and transitions between
the menu, listening, map, sorting, success, failure, and prize scenes.

### Identity-Based Music Validation

Every music fragment uses the same data representation:

```text
[fragment_id, song_id, audio_url]
```

Each sorting record conceptually contains three layers:

| Layer | Data | Purpose |
| --- | --- | --- |
| Display | Label, colour, shape | What the player sees |
| Sorting | Slot | Where the record currently is |
| Identity | Fragment ID, song ID, audio | What the record really represents |

Dragging changes the slot while the musical identity remains attached to the
record. Submission reconstructs the sequence by slot and validates the real
song and fragment IDs instead of the randomized visual labels.

## Runtime Architecture

The original Source Academy project has been adapted to run locally without
requiring the Source Academy Playground:

- `src/main.js` contains the integrated game adapted for standard JavaScript.
- `src/arcade_2d.js` is a local copy of the Source Academy Arcade 2D module.
- Phaser provides the rendering engine used underneath Arcade 2D.
- Vite provides the local development server.
- `sicp` and `js-slang` provide Source and runtime functions required by the
  project.

## Project Structure

```text
echo-fragments/
├── index.html                    # Vite application entry page
├── package.json                  # Dependencies and npm scripts
├── src/
│   ├── main.js                   # Standalone integrated game
│   └── arcade_2d.js              # Local Arcade 2D compatibility module
├── MAP/                          # Map prototypes and development stages
├── assets/                       # Runtime backgrounds and ending artwork
├── character/                    # Character-system development
├── docs/
│   ├── echo-fragments-poster.pdf
│   ├── echo-fragments-poster_Page.png
│   └── screenshots/              # README gameplay screenshots
├── sorting/
│   └── sorting.js                # Sorting-stage development
├── sound/
│   ├── music_mp3/                # Full song, fragments, and prize audio
│   └── ...                       # Sound synthesis source files
├── echo-fragments-game.js        # Original Source Academy game
├── README.md                     # Project documentation
└── LICENSE
```

## Project Poster

<p align="center">
  <a href="docs/echo-fragments-poster.pdf">
    <img src="docs/echo-fragments-poster_Page.png" alt="Echo Fragments project poster" width="600">
  </a>
</p>

<p align="center">
  <a href="docs/echo-fragments-poster.pdf">View or download the full project poster</a>
</p>

## Team

| Team member | Responsibility | Main contribution |
| --- | --- | --- |
| [**Lu Jianyi**](https://github.com/jianyilu13-art) | Sound | Music synthesis, note and duration data, sound composition, fragment generation, and audio resources |
| [**Zheng Yaohan**](https://github.com/JimmyZheng6) | Sorting | Sorting interface, record dragging, audio previews, timers, identity-based validation, and sorting UI |
| [**Qin Yibin**](https://github.com/qinf9263-design) | Character | Movement, sprint and stamina, health and lives, inventory, collection, dropping, and character interaction |
| [**Liu Chenyan**](https://github.com/Prof-Liu6) | Map | Procedural map construction, walls, collision, fragment placement, path validation, and map interaction |

## Built With

- JavaScript
- [Node.js](https://nodejs.org/) 22
- [Vite](https://vite.dev/)
- [Phaser](https://phaser.io/)
- [Source Academy](https://sourceacademy.org/)
- SICP JS, `sicp`, and `js-slang`
- Source Academy `arcade_2d` and `sound` modules
- Functional programming, recursion, lists, higher-order functions, and state

## Acknowledgements

- NUS School of Computing Summer Workshop 2026 instructors, teaching
  assistants, organizers, and classmates
- Special thanks to Brian for adapting and packaging the original Source
  Academy project as a Node.js/Vite application

## License

This project is released under the [MIT License](LICENSE).

Echo Fragments was developed for educational purposes as the final project of
the **NUS School of Computing Summer Workshop 2026**.
