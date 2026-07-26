# Echo Fragments

> **NUS School of Computing Summer Workshop 2026**  
> **Structure and Interpretation of Computer Programs (SICP) Final Project**

**Echo Fragments** is an interactive music puzzle game built in Source Academy.  
It combines music synthesis, exploration, survival, audio recognition, and
drag-and-drop sequence reconstruction.

A complete melody has been broken into fragments and scattered across a
procedurally generated map. Listen to the original song, explore the map,
preview and collect the correct fragments, then restore the melody before time
runs out.

## Gameplay

1. Choose **Easy**, **Hard**, or **Extreme**.
2. Listen carefully to the complete song.
3. Explore the map while avoiding monsters.
4. Preview nearby fragments and decide whether to collect them.
5. Manage your inventory, health, stamina, and three lives.
6. Reach the goal after collecting eight correct fragments.
7. Listen, compare, and drag the records into the correct musical order.
8. Submit the sequence to restore the melody and unlock the prize screen.

### Difficulty Levels

| Difficulty | Correct fragments | Distractor fragments |
| --- | ---: | ---: |
| Easy | 8 | 0 |
| Hard | 8 | 2 |
| Extreme | 8 | 4 |

Fragment labels and colours are randomized between games, so players must rely
on listening instead of memorizing a fixed visual answer.

## Controls

| Input | Action |
| --- | --- |
| `W` `A` `S` `D` | Move the character |
| `F` | Sprint while stamina is available |
| `R` | Preview a nearby music fragment |
| `E` | Collect a fragment or enter the sorting stage |
| `Q` | Drop the selected fragment near the character |
| `1`–`8` | Select an inventory slot |
| Mouse | Choose a difficulty, press buttons, and drag records |

## Core Features

- Programmed full-song listening stage with animated music particles
- Procedurally generated, guaranteed-playable exploration map
- Wall collision, fragment placement, and goal interaction
- Nearby fragment preview before collection
- Inventory selection, collection, and safe non-overlapping dropping
- Character health, stamina, sprinting, monsters, and three-life system
- Two health packs refreshed at random valid positions every 30 seconds
- Audio-driven sorting puzzle with fixed and movable records
- Randomized fragment labels and colours on every playthrough
- Easy, Hard, and Extreme modes with different numbers of distractors
- Start, instructions, listening, map, sorting, success, failure, and prize scenes

## Technical Highlights — SICP Concepts in Action

### Functional Music Synthesis

The melody is encoded as note-and-duration lists. Recursive functions transform
those data lists into sound functions using the Source Academy `sound` module.
Tempo and volume are handled as reusable functional transformations.

### Higher-Order Sound Composition

The project uses recursion, `map`, lambda expressions, `make_sound`, and
`get_wave` to process musical data. `consecutively` builds each melodic line,
while `simultaneously` combines the right- and left-hand parts.

### Unified Fragment Data Abstraction

Every fragment follows one shared interface:

```text
[fragment_id, song_id, audio_url]
```

The map, inventory, preview system, difficulty system, and sorting puzzle all
consume the same representation.

### Modular Scene and State Management

A shared update loop coordinates the menu, listening, exploration, sorting, and
ending scenes. Explicit state variables manage audio playback, input edges,
timers, dragging, inventory, health, stamina, monsters, and scene transitions.

### Guaranteed-Playable Procedural Map

Random walls and objects are generated algorithmically. Breadth-first search
with a queue and visited grid verifies that the player can reach the goal,
preventing unwinnable maps.

### Song and Sequence Validation

The final puzzle checks that the selected fragments belong to the target song,
contain no invalid duplicates, and appear in the correct musical order. Fixed
and draggable records are reconstructed as one complete sequence.

### Interactive Audio-Driven Gameplay

Sound is part of the game logic rather than decoration. Players preview
fragments on the map, compare recordings in the sorting stage, and solve the
puzzle by listening.

## System Modules

### Sound

- Functional melody synthesis from note and duration lists
- Recursive note-list processing
- Tempo and volume transformations
- Two-hand and multi-instrument composition
- Full-song, fragment, distractor, and prize audio

### Map

- Procedural map and wall generation
- Collision and boundary handling
- Valid object and fragment placement
- Breadth-first-search route validation
- Goal, health-pack, and map interaction systems

### Character

- WASD movement and stamina-based sprinting
- Health, three lives, damage, and recovery
- Inventory selection and fragment highlighting
- Fragment preview, collection, and safe dropping
- Monster detection, pursuit, and attack behaviour

### Sorting

- Drag-and-drop record interaction
- Individual fragment audio previews
- Fixed and movable sequence positions
- Countdown timer and submission feedback
- Song identity, uniqueness, and order validation
- Randomized labels, colours, and distractor integration

## Project Structure

```text
echo-fragments/
├── MAP/
│   ├── BASIC MAP+Character
│   ├── basic map
│   └── map at different stages
├── assets/
│   ├── failure.jpg
│   ├── listening-background.png
│   ├── prize.jpg
│   ├── start-menu-background.png
│   └── success.png
├── character/
│   ├── 体力条
│   ├── 拾取+选中+丢弃+放大+F疾跑
│   └── 拾取+选中+丢弃+物品放大
├── sorting/
│   └── sorting.js
├── sound/
│   ├── music_mp3/
│   │   ├── Castle in the Sky.mp3
│   │   ├── correct_fragment_A.mp3 ... correct_fragment_H.mp3
│   │   ├── false_fragment_a.mp3 ... false_fragment_d.mp3
│   │   └── violin.mp3, cello.mp3, piano.mp3, bell.mp3, trombone.mp3
│   ├── Multi-instruments
│   ├── make_music
│   ├── music_library
│   ├── parameter_needed
│   ├── separated_music_library
│   └── separator
├── echo-fragments-game.js
├── README.md
└── LICENSE
```

## Running the Game

1. Open the [Source Academy Playground](https://sourceacademy.org/playground).
2. Select **JavaScript** and **full JavaScript**.
3. Copy the contents of `echo-fragments-game.js` into the editor.
4. Run the program.
5. Open the game visualizer and choose a difficulty.

The game loads image and audio resources from this GitHub repository, so an
internet connection is required.

## Team Contributions

| Team member | Main responsibility | Contribution |
| --- | --- | --- |
| [**Lu Jianyi**](https://github.com/jianyilu13-art) | Sound | Programmed music synthesis, note and duration data, sound composition, fragment generation, and audio resources |
| [**Zheng Yaohan**](https://github.com/JimmyZheng6) | Sorting | Sorting interface, record dragging, fragment previews, timers, sequence validation, and sorting UI |
| [**Qin Yibin**](https://github.com/qinf9263-design) | Character | Character movement, sprint and stamina, health and lives, inventory, collection, dropping, and character interaction |
| [**Liu Chenyan**](https://github.com/Prof-Liu6) | Map | Map construction, procedural walls, collision, fragment placement, path validation, and map interaction |

## Technology

- JavaScript
- Source Academy
- SICP JS
- Source Academy `arcade_2d` module
- Source Academy `sound` module
- Functional programming, recursion, lists, higher-order functions, and state

## Course Information

**NUS School of Computing**  
**Summer Workshop 2026**  
**Structure and Interpretation of Computer Programs**

## License

This project is released under the [MIT License](LICENSE) and was developed for
educational purposes as the final project of the NUS School of Computing Summer
Workshop 2026.
