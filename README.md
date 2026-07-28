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
  <a href="https://github.com/JimmyZheng6/echo-fragments/releases/tag/v1.0.1">
    <img src="https://img.shields.io/badge/release-v1.0.1-7057ff" alt="Release v1.0.1">
  </a>
  <img src="https://img.shields.io/badge/language-JavaScript-f7df1e" alt="JavaScript">
  <img src="https://img.shields.io/badge/platform-Source%20Academy-1f6feb" alt="Source Academy">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-2ea44f" alt="MIT License">
  </a>
</p>

<p align="center">
  <img src="docs/screenshots/start-menu.png" alt="Echo Fragments start menu" width="850">
</p>

## About the Game

**Echo Fragments** is an audio-driven exploration and sorting game built with
JavaScript in Source Academy.

A melody has been broken into fragments and scattered across a procedurally
generated world. Listen to the original song, explore the map, preview nearby
fragments, collect the correct pieces, and reconstruct the melody before time
runs out.

Visual labels and colours change between games. Harder modes also introduce
distractor fragments, so the puzzle must be solved by listening rather than by
memorizing a fixed visual answer.

## Play and Download

- **Latest version:** [Echo Fragments v1.0.1](https://github.com/JimmyZheng6/echo-fragments/releases/tag/v1.0.1)
- **Gameplay video:** [Watch or download the MP4](https://github.com/JimmyZheng6/echo-fragments/releases/download/v1.0.0/echo-fragments-gameplay.mp4) (hosted with the v1.0.0 release)
- **Source code:** Download **Source code (zip)** from the [v1.0.1 Release](https://github.com/JimmyZheng6/echo-fragments/releases/tag/v1.0.1)
- **Project poster:** [View the poster PDF](docs/echo-fragments-poster.pdf)

> Echo Fragments runs inside the Source Academy Playground. It is not a
> standalone executable game.

## How to Play

1. Choose **Easy**, **Hard**, or **Extreme**.
2. On the listening screen, either click **Play Full Song** to study the
   complete melody or click **Skip to Map** to begin exploring immediately.
3. If you listen to the song, the map opens automatically after the animated
   `3–2–1` countdown.
4. Explore the map while avoiding monsters.
5. Press `R` near a fragment to preview its sound.
6. Press `E` to collect a fragment if you think it belongs to the song.
7. Manage your inventory, health, stamina, and three lives.
8. Collect all eight correct fragments and reach the goal.
9. In the sorting stage, listen to the records and drag them into the correct
   musical order.
10. Submit the sequence before the timer reaches zero.

### Difficulty Levels

| Difficulty | Correct fragments | Distractor fragments | Experience |
| --- | ---: | ---: | --- |
| Easy | 8 | 0 | Focus on learning the melody and order |
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
    <td width="50%">
      <img src="docs/screenshots/success.png" alt="Success screen">
    </td>
    <td width="50%">
      <img src="docs/screenshots/failure.jpg" alt="Failure screen">
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Success</strong></td>
    <td align="center"><strong>Game Over</strong></td>
  </tr>
</table>

<p align="center">
  <img src="docs/screenshots/prize.png" alt="Prize music selection screen" width="850">
</p>

## Running the Game in Source Academy

### Method 1 — Copy from GitHub

1. Open [`echo-fragments-game.js`](echo-fragments-game.js).
2. Click **Raw**, or open the file and copy all of its source code.
3. Open the [Source Academy Playground](https://sourceacademy.org/playground).
4. Select **JavaScript** as the language.
5. Select **full JavaScript** as the execution variant.
6. Delete any existing code and paste the complete game source.
7. Click **Run**.
8. Open the **Arcade 2D** display if it is not shown automatically.
9. Select a difficulty to begin.

### Method 2 — Use the Release Download

1. Open the [v1.0.1 Release](https://github.com/JimmyZheng6/echo-fragments/releases/tag/v1.0.1).
2. Under **Assets**, download **Source code (zip)**.
3. Unzip the downloaded file.
4. Open `echo-fragments-game.js` with a text editor or code editor.
5. Copy the entire file.
6. Paste it into the [Source Academy Playground](https://sourceacademy.org/playground).
7. Select **JavaScript** and **full JavaScript**, then click **Run**.

### Requirements and Troubleshooting

- An internet connection is required because images and audio are loaded from
  this GitHub repository.
- No `npm` installation, package manager, or local web server is required.
- Keep the `import` statement at the beginning of the source file.
- Keep `build_game()` as the final statement.
- If music does not start, click inside the game display and press the relevant
  **Play** button again.
- If an asset fails to load, confirm that GitHub is accessible and run the
  program again.

## Main Features

- Animated difficulty-selection and full-song listening scenes
- Optional **Skip to Map** button before, during, or after song playback
- Programmed music synthesis and multi-instrument audio
- Procedurally generated and validated exploration map
- Wall collision and valid object placement
- Nearby fragment preview before collection
- Inventory selection and safe non-overlapping fragment dropping
- Health, stamina, sprinting, monsters, and a three-life system
- Two health packs refreshed every 30 seconds
- Fixed and movable music records
- Individual audio preview with click-to-play and click-to-stop
- Randomized fragment labels, colours, and starting arrangements
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

### Guaranteed-Playable Procedural Map

Walls and objects are generated algorithmically. Breadth-first search uses a
queue and visited grid to verify that the player can reach the goal, preventing
unwinnable maps.

### State-Driven Character and Scene Systems

A shared update loop coordinates input, movement, collision, inventory,
stamina, health, monsters, audio, timers, animation, and transitions between
the menu, listening, map, sorting, success, failure, and prize scenes.

### Identity-Based Music Validation

Each fragment uses a shared representation:

```text
[fragment_id, song_id, audio_url]
```

Each sorting record conceptually contains three layers:

| Layer | Data | Purpose |
| --- | --- | --- |
| Display | label, colour, shape | What the player sees |
| Sorting | slot | Where the record currently is |
| Identity | fragment ID, song ID, audio | What the record really represents |

Dragging changes the slot but keeps the musical identity attached to the
record. Submission reconstructs the sequence by slot and validates the real
fragment IDs instead of the randomized visual labels.

## Project Structure

```text
echo-fragments/
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
├── echo-fragments-game.js         # Complete integrated game
├── README.md                      # Project documentation
└── LICENSE
```

## Project Poster

<p align="center">
  <a href="docs/echo-fragments-poster.pdf">
    <img src="docs/echo-fragments-poster_Page.png" alt="Echo Fragments project poster" width="600">
  </a>
</p>

<p align="center">
  <a href="docs/echo-fragments-poster.pdf">
    View or download the full project poster
  </a>
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
- [Source Academy](https://sourceacademy.org/)
- SICP JS
- Source Academy `arcade_2d` module
- Source Academy `sound` module
- Functional programming, recursion, lists, higher-order functions, and state

## License

This project is released under the [MIT License](LICENSE).

Echo Fragments was developed for educational purposes as the final project of
the **NUS School of Computing Summer Workshop 2026**.
