import {
  build_game,
  create_audio,
  create_circle,
  create_rectangle,
  create_sprite,
  create_text,
  gameobjects_overlap,
  get_game_time,
  input_key_down,
  input_left_mouse_down,
  play_audio,
  pointer_over_gameobject,
  query_pointer_position,
  query_position,
  set_dimensions,
  stop_audio,
  update_color,
  update_loop,
  update_position,
  update_scale,
  update_text,
  update_to_top
} from "arcade_2d";

// ============================================================
// Shared game configuration and unified fragment interface
// ============================================================

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 800;
const SCENE_START = "start";
const SCENE_LISTENING = "listening";
const SCENE_COLLECTION = "collection";
const SCENE_SORTING = "sorting";
const SCENE_SUCCESS = "success";
const SCENE_PRIZE = "prize";
const SCENE_FAILURE = "failure";
const SCENE_INSTRUCTIONS = "instructions";

// Every fragment in every scene uses exactly this structure:
// [fragment_id, song_id, audio_url]
const DATA_ID_INDEX = 0;
const DATA_SONG_ID_INDEX = 1;
const DATA_AUDIO_URL_INDEX = 2;

const FRAGMENT_COUNT = 8;
const TARGET_SONG_ID = "song_01";
const TARGET_FRAGMENT_IDS = [
  "song_01_fragment_B",
  "song_01_fragment_C",
  "song_01_fragment_A",
  "song_01_fragment_D",
  "song_01_fragment_E",
  "song_01_fragment_F",
  "song_01_fragment_G",
  "song_01_fragment_H"
];
const TARGET_LABEL_POOL = ["A", "B", "C", "D", "E", "F", "G", "H"];
let target_fragment_labels = ["B", "C", "A", "D", "E", "F", "G", "H"];

const AUDIO_BASE_URL =
  "https://raw.githubusercontent.com/JimmyZheng6/"
  + "echo-fragments/main/sound/music_mp3/";
const ASSET_BASE_URL =
  "https://raw.githubusercontent.com/JimmyZheng6/"
  + "echo-fragments/main/assets/";
const ASSET_VERSION = "?v=20260726-layout-alignment-2";
const START_MENU_BACKGROUND_URL =
  ASSET_BASE_URL + "start-menu-background.png" + ASSET_VERSION;
const LISTENING_BACKGROUND_URL =
  ASSET_BASE_URL + "listening-background.png" + ASSET_VERSION;
const SUCCESS_BACKGROUND_URL =
  ASSET_BASE_URL + "success.png" + ASSET_VERSION;
const PRIZE_BACKGROUND_URL =
  ASSET_BASE_URL + "prize.jpg" + ASSET_VERSION;
const FAILURE_BACKGROUND_URL =
  ASSET_BASE_URL + "failure.jpg" + ASSET_VERSION;

// The start artwork is 2304 x 1728. The listening and ending artworks are
// 2000 x 1778. Independent axes make every image fill the 900 x 800 canvas.
const START_BACKGROUND_SCALE_X = CANVAS_WIDTH / 2304;
const START_BACKGROUND_SCALE_Y = CANVAS_HEIGHT / 1728;
const FULLSCREEN_BACKGROUND_SCALE_X = CANVAS_WIDTH / 2000;
const FULLSCREEN_BACKGROUND_SCALE_Y = CANVAS_HEIGHT / 1778;
const START_ORBIT_CENTRE_X = CANVAS_WIDTH / 2;
const START_ORBIT_CENTRE_Y = 0;
const LISTENING_NOTE_ORIGIN_X = 533;
const LISTENING_NOTE_ORIGIN_Y = 245;

// The first eight entries are the target song. The final four are
// distractors used by Hard and Extreme difficulty.
const ALL_FRAGMENT_DATA = [
  [
    "song_01_fragment_B",
    "song_01",
    AUDIO_BASE_URL + "correct_fragment_B.mp3"
  ],
  [
    "song_01_fragment_C",
    "song_01",
    AUDIO_BASE_URL + "correct_fragment_C.mp3"
  ],
  [
    "song_01_fragment_A",
    "song_01",
    AUDIO_BASE_URL + "correct_fragment_A.mp3"
  ],
  [
    "song_01_fragment_D",
    "song_01",
    AUDIO_BASE_URL + "correct_fragment_D.mp3"
  ],
  [
    "song_01_fragment_E",
    "song_01",
    AUDIO_BASE_URL + "correct_fragment_E.mp3"
  ],
  [
    "song_01_fragment_F",
    "song_01",
    AUDIO_BASE_URL + "correct_fragment_F.mp3"
  ],
  [
    "song_01_fragment_G",
    "song_01",
    AUDIO_BASE_URL + "correct_fragment_G.mp3"
  ],
  [
    "song_01_fragment_H",
    "song_01",
    AUDIO_BASE_URL + "correct_fragment_H.mp3"
  ],
  [
    "false_fragment_a",
    "distractor_song_a",
    AUDIO_BASE_URL + "false_fragment_a.mp3"
  ],
  [
    "false_fragment_b",
    "distractor_song_b",
    AUDIO_BASE_URL + "false_fragment_b.mp3"
  ],
  [
    "false_fragment_c",
    "distractor_song_c",
    AUDIO_BASE_URL + "false_fragment_c.mp3"
  ],
  [
    "false_fragment_d",
    "distractor_song_d",
    AUDIO_BASE_URL + "false_fragment_d.mp3"
  ]
];

const DISTRACTOR_FRAGMENT_IDS = [
  "false_fragment_a",
  "false_fragment_b",
  "false_fragment_c",
  "false_fragment_d"
];
const DISTRACTOR_FRAGMENT_LABELS = ["I", "J", "K", "L"];

// Fixed sequence item: [zero_based_position, display_label, fragment_data]
// These two repeats are shown in sorting but can never be dragged.
const FIXED_FRAGMENT_DATA = [
  [
    0,
    "A",
    [
      "song_01_repeat_A",
      "song_01",
      AUDIO_BASE_URL + "correct_fragment_A.mp3"
    ]
  ],
  [
    8,
    "F",
    [
      "song_01_repeat_F",
      "song_01",
      AUDIO_BASE_URL + "correct_fragment_F.mp3"
    ]
  ]
];

const FIXED_POSITION_INDEX = 0;
const FIXED_LABEL_INDEX = 1;
const FIXED_DATA_INDEX = 2;

const FRAGMENT_COLOURS = [
  [211, 102, 96, 255],
  [214, 145, 68, 255],
  [215, 181, 70, 255],
  [77, 177, 124, 255],
  [74, 151, 197, 255],
  [90, 110, 191, 255],
  [155, 98, 182, 255],
  [202, 81, 130, 255]
];

// Distractors use their own colours. They remain visually plausible notes,
// but never reuse the exact colour assigned to a correct fragment.
const DISTRACTOR_FRAGMENT_COLOURS = [
  [64, 169, 158, 255],
  [188, 116, 139, 255],
  [137, 158, 82, 255],
  [119, 124, 174, 255]
];

const DIFFICULTY_EASY = 1;
const DIFFICULTY_HARD = 2;
const DIFFICULTY_EXTREME = 3;
const MAX_WALL_PERCENT = 30;
const HIDDEN_POSITION = [-5000, -5000];

let current_scene = SCENE_START;
let e_was_down = false;
let q_was_down = false;
let r_was_down = false;
let mouse_was_down = false;
let difficulty = DIFFICULTY_EASY;
let note_count = 8;
let wall_percent = 17;
let monster_count = 3;
let game_has_started = false;

set_dimensions([CANVAS_WIDTH, CANVAS_HEIGHT]);

function input_letter_key_down(lowercase_key, uppercase_key) {
  return input_key_down(lowercase_key)
    || input_key_down(uppercase_key);
}

function randomise_target_fragment_labels() {
  const shuffled_labels = [];

  for (let index = 0;
       index < array_length(TARGET_LABEL_POOL);
       index = index + 1) {
    shuffled_labels[index] = TARGET_LABEL_POOL[index];
  }

  for (let index = array_length(shuffled_labels) - 1;
       index > 0;
       index = index - 1) {
    const swap_index = math_floor(math_random() * (index + 1));
    const old_value = shuffled_labels[index];
    shuffled_labels[index] = shuffled_labels[swap_index];
    shuffled_labels[swap_index] = old_value;
  }

  // Prevent the new visible solution from being identical to the previous
  // one, even in the rare case that the shuffle produces the same order.
  let matches_previous = true;
  for (let index = 0;
       index < array_length(shuffled_labels);
       index = index + 1) {
    if (shuffled_labels[index] !== target_fragment_labels[index]) {
      matches_previous = false;
    }
  }

  if (matches_previous) {
    const first_label = shuffled_labels[0];
    shuffled_labels[0] = shuffled_labels[1];
    shuffled_labels[1] = first_label;
  }

  target_fragment_labels = shuffled_labels;
}

// ============================================================
// Shared scene visibility helpers
// ============================================================

const collection_objects = [];
const collection_saved_positions = [];
const listening_objects = [];
const listening_saved_positions = [];
const sorting_objects = [];
const sorting_saved_positions = [];
const start_objects = [];
const start_saved_positions = [];
const instruction_objects = [];
const instruction_saved_positions = [];
const success_objects = [];
const success_saved_positions = [];
const prize_objects = [];
const prize_saved_positions = [];
const failure_objects = [];
const failure_saved_positions = [];
const start_vortex_stars = [];
let easy_menu_button = undefined;
let hard_menu_button = undefined;
let extreme_menu_button = undefined;
let start_instructions_button = undefined;

const START_BUTTON_BACKGROUND_INDEX = 0;
const START_BUTTON_TITLE_INDEX = 1;
const START_BUTTON_DETAIL_INDEX = 2;
const START_BUTTON_IDLE_COLOUR_INDEX = 3;
const START_BUTTON_HOVER_COLOUR_INDEX = 4;
const START_BUTTON_LEVEL_INDEX = 5;

function register_start_object(gameobject, position) {
  update_position(gameobject, position);
  start_objects[array_length(start_objects)] = gameobject;
  return gameobject;
}

function register_instruction_object(gameobject, position) {
  update_position(gameobject, position);
  instruction_objects[array_length(instruction_objects)] = gameobject;
  return gameobject;
}

function register_success_object(gameobject, position) {
  update_position(gameobject, position);
  success_objects[array_length(success_objects)] = gameobject;
  return gameobject;
}

function register_prize_object(gameobject, position) {
  update_position(gameobject, position);
  prize_objects[array_length(prize_objects)] = gameobject;
  return gameobject;
}

function register_failure_object(gameobject, position) {
  update_position(gameobject, position);
  failure_objects[array_length(failure_objects)] = gameobject;
  return gameobject;
}

function create_start_button(
  title,
  detail,
  level,
  y,
  idle_colour,
  hover_colour
) {
  const background = register_start_object(
    update_color(create_rectangle(216, 92), idle_colour),
    [CANVAS_WIDTH / 2, y]
  );
  const title_text = register_start_object(
    update_color(
      update_scale(create_text(title), [1.15, 1.15]),
      [255, 255, 255, 255]
    ),
    [CANVAS_WIDTH / 2, y - 13]
  );
  const detail_text = register_start_object(
    update_color(
      update_scale(create_text(detail), [0.58, 0.58]),
      [225, 230, 242, 255]
    ),
    [CANVAS_WIDTH / 2, y + 21]
  );

  return [
    background,
    title_text,
    detail_text,
    idle_colour,
    hover_colour,
    level
  ];
}

function create_start_menu() {
  // Fallback colour shown while the remote background image is loading.
  register_start_object(
    update_color(
      create_rectangle(CANVAS_WIDTH, CANVAS_HEIGHT),
      [10, 14, 42, 255]
    ),
    [CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2]
  );
  register_start_object(
    update_scale(
      create_sprite(START_MENU_BACKGROUND_URL),
      [
        START_BACKGROUND_SCALE_X,
        START_BACKGROUND_SCALE_Y
      ]
    ),
    [CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2]
  );

  // This animation layer orbits around the midpoint of the canvas's top
  // edge, matching the vanishing point of the uploaded star-trail image.
  for (let index = 0; index < 160; index = index + 1) {
    const phase = math_random() * 6.283;
    const radius = 85 + math_random() * 820;
    const size = 2 + index % 3;
    const star = register_start_object(
      update_color(
        create_rectangle(size, size + 5),
        index % 5 === 0
          ? [255, 215, 244, 205]
          : index % 5 === 1
          ? [190, 215, 255, 195]
          : [255, 255, 255, 225]
      ),
      [
        START_ORBIT_CENTRE_X + radius * math_sin(phase),
        START_ORBIT_CENTRE_Y
          + radius * math_cos(phase)
      ]
    );
    start_vortex_stars[index] = [
      star,
      phase,
      radius,
      0.045 + index % 7 * 0.008
    ];
  }

  // The labels already exist in the background artwork. These transparent
  // rectangles provide accurate click and hover areas without duplicating
  // the text.
  easy_menu_button = create_start_button(
    "",
    "",
    DIFFICULTY_EASY,
    390,
    [255, 255, 255, 0],
    [255, 255, 255, 54]
  );
  hard_menu_button = create_start_button(
    "",
    "",
    DIFFICULTY_HARD,
    507,
    [255, 255, 255, 0],
    [255, 255, 255, 54]
  );
  extreme_menu_button = create_start_button(
    "",
    "",
    DIFFICULTY_EXTREME,
    623,
    [255, 255, 255, 0],
    [255, 255, 255, 54]
  );

  const instructions_background = register_start_object(
    update_color(create_rectangle(176, 42), [12, 17, 48, 215]),
    [792, 758]
  );
  const instructions_text = register_start_object(
    update_color(
      update_scale(create_text("HOW TO PLAY"), [0.72, 0.72]),
      [255, 255, 255, 255]
    ),
    [792, 758]
  );
  start_instructions_button = [
    instructions_background,
    instructions_text
  ];
}

function pointer_over_start_button(button) {
  return pointer_over_gameobject(button[START_BUTTON_BACKGROUND_INDEX])
    || pointer_over_gameobject(button[START_BUTTON_TITLE_INDEX])
    || pointer_over_gameobject(button[START_BUTTON_DETAIL_INDEX]);
}

function update_start_button_hover(button) {
  update_color(
    button[START_BUTTON_BACKGROUND_INDEX],
    pointer_over_start_button(button)
      ? button[START_BUTTON_HOVER_COLOUR_INDEX]
      : button[START_BUTTON_IDLE_COLOUR_INDEX]
  );
}

function pointer_over_small_button(button) {
  return pointer_over_gameobject(button[0])
    || pointer_over_gameobject(button[1]);
}

function update_start_instructions_hover() {
  update_color(
    start_instructions_button[0],
    pointer_over_small_button(start_instructions_button)
      ? [69, 79, 135, 245]
      : [12, 17, 48, 215]
  );
}

function hide_start_scene() {
  for (let index = 0;
       index < array_length(start_objects);
       index = index + 1) {
    const position = query_position(start_objects[index]);
    start_saved_positions[index] = [position[0], position[1]];
    update_position(start_objects[index], [-4000, -4000]);
  }
}

function show_start_scene() {
  for (let index = 0;
       index < array_length(start_objects);
       index = index + 1) {
    update_position(start_objects[index], start_saved_positions[index]);
  }
}

function set_difficulty(level) {
  difficulty = level;

  if (level === DIFFICULTY_EASY) {
    note_count = 8;
    wall_percent = 17;
    monster_count = 3;
  } else if (level === DIFFICULTY_HARD) {
    note_count = 10;
    wall_percent = 25;
    monster_count = 5;
  } else {
    note_count = 12;
    wall_percent = 30;
    monster_count = 7;
  }
}

function start_selected_difficulty(level) {
  if (game_has_started || current_scene !== SCENE_START) {
    return undefined;
  }

  set_difficulty(level);
  randomise_target_fragment_labels();
  hide_start_scene();
  show_listening_scene();
  reset_listening_scene();
  game_has_started = true;
  current_scene = SCENE_LISTENING;
  return undefined;
}

function animate_start_menu() {
  const time = get_game_time() / 1000;

  for (let index = 0;
       index < array_length(start_vortex_stars);
       index = index + 1) {
    const star = start_vortex_stars[index];
    const angle = star[1] + time * star[3];
    const pulse =
      0.72 + 0.26 * (1 + math_sin(time * 2 + star[1])) / 2;
    update_position(
      star[0],
      [
        START_ORBIT_CENTRE_X + star[2] * math_sin(angle),
        START_ORBIT_CENTRE_Y
          + star[2] * math_cos(angle)
      ]
    );
    update_scale(star[0], [pulse, pulse]);
  }
}

function update_start_scene(mouse_pressed) {
  animate_start_menu();
  update_start_button_hover(easy_menu_button);
  update_start_button_hover(hard_menu_button);
  update_start_button_hover(extreme_menu_button);
  update_start_instructions_hover();

  if (mouse_pressed) {
    if (pointer_over_start_button(easy_menu_button)) {
      start_selected_difficulty(DIFFICULTY_EASY);
    } else if (pointer_over_start_button(hard_menu_button)) {
      start_selected_difficulty(DIFFICULTY_HARD);
    } else if (pointer_over_start_button(extreme_menu_button)) {
      start_selected_difficulty(DIFFICULTY_EXTREME);
    } else if (pointer_over_small_button(start_instructions_button)) {
      hide_start_scene();
      show_instruction_scene();
      current_scene = SCENE_INSTRUCTIONS;
    }
  }
}

function register_collection_object(gameobject, position) {
  update_position(gameobject, position);
  collection_objects[array_length(collection_objects)] = gameobject;
  return gameobject;
}

function register_listening_object(gameobject, position) {
  update_position(gameobject, position);
  listening_objects[array_length(listening_objects)] = gameobject;
  return gameobject;
}

function register_sorting_object(gameobject, position) {
  update_position(gameobject, position);
  sorting_objects[array_length(sorting_objects)] = gameobject;
  return gameobject;
}

function hide_collection_scene() {
  for (let index = 0;
       index < array_length(collection_objects);
       index = index + 1) {
    const position = query_position(collection_objects[index]);
    collection_saved_positions[index] = [position[0], position[1]];
    update_position(collection_objects[index], [-2000, -2000]);
  }
}

function show_collection_scene() {
  for (let index = 0;
       index < array_length(collection_objects);
       index = index + 1) {
    update_position(
      collection_objects[index],
      collection_saved_positions[index]
    );
  }
}

function hide_listening_scene() {
  for (let index = 0;
       index < array_length(listening_objects);
       index = index + 1) {
    const position = query_position(listening_objects[index]);
    listening_saved_positions[index] = [position[0], position[1]];
    update_position(listening_objects[index], [-4500, -4500]);
  }
}

function show_listening_scene() {
  for (let index = 0;
       index < array_length(listening_objects);
       index = index + 1) {
    update_position(
      listening_objects[index],
      listening_saved_positions[index]
    );
  }
}

function hide_sorting_scene() {
  for (let index = 0;
       index < array_length(sorting_objects);
       index = index + 1) {
    const position = query_position(sorting_objects[index]);
    sorting_saved_positions[index] = [position[0], position[1]];
    update_position(sorting_objects[index], [-3000, -3000]);
  }
}

function show_sorting_scene() {
  for (let index = 0;
       index < array_length(sorting_objects);
       index = index + 1) {
    update_position(
      sorting_objects[index],
      sorting_saved_positions[index]
    );
  }
}

function hide_object_group(objects, saved_positions, hidden_x) {
  for (let index = 0;
       index < array_length(objects);
       index = index + 1) {
    const position = query_position(objects[index]);
    saved_positions[index] = [position[0], position[1]];
    update_position(objects[index], [hidden_x, hidden_x]);
  }
}

function show_object_group(objects, saved_positions) {
  for (let index = 0;
       index < array_length(objects);
       index = index + 1) {
    update_position(objects[index], saved_positions[index]);
  }
}

function hide_instruction_scene() {
  hide_object_group(
    instruction_objects,
    instruction_saved_positions,
    -5200
  );
}

function show_instruction_scene() {
  show_object_group(instruction_objects, instruction_saved_positions);
}

function hide_success_scene() {
  hide_object_group(success_objects, success_saved_positions, -5400);
}

function show_success_scene() {
  show_object_group(success_objects, success_saved_positions);
}

function hide_prize_scene() {
  hide_object_group(prize_objects, prize_saved_positions, -5600);
}

function show_prize_scene() {
  show_object_group(prize_objects, prize_saved_positions);
}

function hide_failure_scene() {
  hide_object_group(failure_objects, failure_saved_positions, -5800);
}

function show_failure_scene() {
  show_object_group(failure_objects, failure_saved_positions);
}

// ============================================================
// Full-song listening scene
// ============================================================

// The programmed full melody is 48.5 seconds after the 0.5 tempo scaling.
const FULL_SONG_DURATION_MS = 48.5 * 1000;
const LISTENING_IDLE = "idle";
const LISTENING_PLAYING = "playing";
const LISTENING_COUNTDOWN = "countdown";
const LISTENING_COUNTDOWN_MIN_SCALE = 22;
const LISTENING_COUNTDOWN_SCALE_RANGE = 8;
const listening_vortex_stars = [];
const listening_note_particles = [];
let listening_state = LISTENING_IDLE;
let listening_song_started_at = 0;
let listening_countdown_started_at = 0;
let listening_song_audio = undefined;
let listening_play_button = undefined;
let listening_play_button_text = undefined;
let listening_status_text = undefined;
let listening_countdown_text = undefined;

function create_listening_scene() {
  // Fallback colour shown while the remote background image is loading.
  register_listening_object(
    update_color(
      create_rectangle(CANVAS_WIDTH, CANVAS_HEIGHT),
      [7, 10, 38, 255]
    ),
    [CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2]
  );
  register_listening_object(
    update_scale(
      create_sprite(LISTENING_BACKGROUND_URL),
      [
        FULLSCREEN_BACKGROUND_SCALE_X,
        FULLSCREEN_BACKGROUND_SCALE_Y
      ]
    ),
    [CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2]
  );

  register_listening_object(
    update_color(create_rectangle(248, 72), [5, 8, 28, 185]),
    [456, 611]
  );
  listening_play_button = register_listening_object(
    update_color(create_rectangle(240, 64), [99, 111, 165, 238]),
    [450, 604]
  );
  listening_play_button_text = register_listening_object(
    update_color(
      update_scale(create_text("PLAY FULL SONG"), [0.95, 0.95]),
      [255, 255, 255, 255]
    ),
    [450, 604]
  );
  listening_status_text = register_listening_object(
    update_color(
      update_scale(
        create_text("Listen carefully before entering the map."),
        [0.67, 0.67]
      ),
      [211, 220, 248, 255]
    ),
    [450, 674]
  );
  listening_countdown_text = register_listening_object(
    update_color(
      update_scale(
        create_text(""),
        [
          LISTENING_COUNTDOWN_MIN_SCALE,
          LISTENING_COUNTDOWN_MIN_SCALE
        ]
      ),
      [255, 214, 38, 255]
    ),
    HIDDEN_POSITION
  );

  // These notes remain hidden until the full song is playing. Their
  // individual phase and speed values create a continuous outward stream.
  for (let index = 0; index < 36; index = index + 1) {
    const label = index % 3 === 0
      ? "♪"
      : index % 3 === 1
      ? "♫"
      : "♬";
    const note = register_listening_object(
      update_color(
        update_scale(create_text(label), [0.8, 0.8]),
        FRAGMENT_COLOURS[index % FRAGMENT_COUNT]
      ),
      HIDDEN_POSITION
    );
    listening_note_particles[index] = [
      note,
      index / 36,
      0.16 + index % 7 * 0.018
    ];
  }

  listening_song_audio = create_audio(
    AUDIO_BASE_URL + "Castle%20in%20the%20Sky.mp3",
    1
  );
}

function hide_listening_notes() {
  for (let index = 0;
       index < array_length(listening_note_particles);
       index = index + 1) {
    update_position(listening_note_particles[index][0], HIDDEN_POSITION);
  }
}

function reset_listening_scene() {
  if (listening_song_audio !== undefined) {
    stop_audio(listening_song_audio);
  }
  listening_state = LISTENING_IDLE;
  listening_song_started_at = 0;
  listening_countdown_started_at = 0;
  update_text(listening_play_button_text, "PLAY FULL SONG");
  update_color(listening_play_button, [117, 130, 175, 235]);
  update_color(listening_play_button_text, [255, 255, 255, 255]);
  update_text(
    listening_status_text,
    "Listen carefully before entering the map."
  );
  update_text(listening_countdown_text, "");
  update_position(listening_countdown_text, HIDDEN_POSITION);
  hide_listening_notes();
}

function animate_listening_vortex() {
  const time = get_game_time() / 1000;

  for (let index = 0;
       index < array_length(listening_vortex_stars);
       index = index + 1) {
    const star = listening_vortex_stars[index];
    const angle = star[1] + time * star[3];
    const pulse = 0.75
      + 0.24 * (1 + math_sin(time * 2.2 + star[1])) / 2;
    update_position(
      star[0],
      [
        450 + star[2] * math_sin(angle),
        365 + star[2] * 0.66 * math_sin(angle + 1.57)
      ]
    );
    update_scale(star[0], [pulse, pulse]);
  }
}

function animate_listening_notes() {
  const elapsed = (get_game_time() - listening_song_started_at) / 1000;

  for (let index = 0;
       index < array_length(listening_note_particles);
       index = index + 1) {
    const note = listening_note_particles[index];
    const progress = (elapsed * note[2] + note[1]) % 1;
    const radius = 55 + progress * 390;
    const angle = note[1] * 6.283 + progress * 2.1;
    const scale = 0.55 + progress * 1.15;
    update_position(
      note[0],
      [
        LISTENING_NOTE_ORIGIN_X + radius * math_sin(angle),
        LISTENING_NOTE_ORIGIN_Y
          + radius * 0.58 * math_sin(angle + 1.57)
      ]
    );
    update_scale(note[0], [scale, scale]);
    update_to_top(note[0]);
  }
}

function start_full_song() {
  listening_state = LISTENING_PLAYING;
  listening_song_started_at = get_game_time();
  play_audio(listening_song_audio);
  update_text(listening_play_button_text, "PLAYING...");
  update_color(listening_play_button, [91, 79, 139, 240]);
  update_text(
    listening_status_text,
    "Follow the melody. The map opens when the song ends."
  );
}

function begin_listening_countdown() {
  listening_state = LISTENING_COUNTDOWN;
  listening_countdown_started_at = get_game_time();
  hide_listening_notes();
  update_text(listening_play_button_text, "SONG COMPLETE");
  update_color(listening_play_button, [65, 69, 103, 235]);
  update_text(listening_status_text, "GET READY");
  update_text(listening_countdown_text, "3");
  update_position(listening_countdown_text, [450, 400]);
}

function enter_collection_from_listening() {
  stop_audio(listening_song_audio);
  hide_listening_scene();
  show_collection_scene();
  apply_collection_difficulty();
  current_scene = SCENE_COLLECTION;
  update_text(
    collection_message_text,
    difficulty === DIFFICULTY_EASY
      ? "Easy: 0 decoys / 3 monsters"
      : difficulty === DIFFICULTY_HARD
      ? "Hard: 2 decoys / 5 monsters"
      : "Extreme: 4 decoys / 7 monsters"
  );
}

function update_listening_scene(mouse_pressed) {
  animate_listening_vortex();

  if (listening_state === LISTENING_IDLE) {
    const pointer_over_play =
      pointer_over_gameobject(listening_play_button)
      || pointer_over_gameobject(listening_play_button_text);
    update_color(
      listening_play_button,
      pointer_over_play
        ? [153, 171, 218, 245]
        : [117, 130, 175, 235]
    );

    if (mouse_pressed && pointer_over_play) {
      start_full_song();
    }
  } else if (listening_state === LISTENING_PLAYING) {
    animate_listening_notes();

    if (get_game_time() - listening_song_started_at
        >= FULL_SONG_DURATION_MS) {
      begin_listening_countdown();
    }
  } else {
    const countdown_elapsed =
      get_game_time() - listening_countdown_started_at;

    if (countdown_elapsed < 1000) {
      update_text(listening_countdown_text, "3");
    } else if (countdown_elapsed < 2000) {
      update_text(listening_countdown_text, "2");
    } else if (countdown_elapsed < 3000) {
      update_text(listening_countdown_text, "1");
    } else {
      enter_collection_from_listening();
    }

    const countdown_wave =
      (1 + math_sin(get_game_time() / 95)) / 2;
    const pulse = LISTENING_COUNTDOWN_MIN_SCALE
      + LISTENING_COUNTDOWN_SCALE_RANGE * countdown_wave;
    const green = math_floor(145 + 105 * countdown_wave);
    const blue = math_floor(18 + 92 * countdown_wave);
    update_scale(listening_countdown_text, [pulse, pulse]);
    update_color(
      listening_countdown_text,
      [255, green, blue, 255]
    );
    update_to_top(listening_countdown_text);
  }
}

// ============================================================
// Collection scene: maze, player, sprint, status and inventory
// ============================================================

// Preserve the original collection map dimensions and visual background.
const GRID_WIDTH = 750;
const GRID_HEIGHT = 750;
const TILE = 25;
const ROWS = math_floor(GRID_HEIGHT / TILE);
const COLS = math_floor(GRID_WIDTH / TILE);
const START_ROW = 1;
const START_COL = 1;
const GOAL_ROW = ROWS - 2;
const GOAL_COL = COLS - 2;
const PLAYER_SIZE = TILE * 0.5;
const PLAYER_HALF = PLAYER_SIZE / 2;
const WALK_SPEED = 3;
const RUN_SPEED = 9;
const MAX_HP = 100;
const MAX_LIVES = 3;
const MAX_STAMINA = 100;
const MAX_MONSTER_COUNT = 7;
const MONSTER_HALF = 9;
const MONSTER_SPEED = 1.15;
const MONSTER_CHASE_DISTANCE = 160;
const MONSTER_ATTACK_DISTANCE = 24;
const MONSTER_DAMAGE = 10;
const MONSTER_ATTACK_COOLDOWN_MS = 850;
const MONSTER_FLASH_DURATION_MS = 160;
const HEALTH_PACK_COUNT = 2;
const HEALTH_PACK_REFRESH_MS = 30 * 1000;
const HEALTH_PACK_HEAL_AMOUNT = 40;
const HEALTH_PACK_PICKUP_DISTANCE = 24;
const MONSTER_COLOURS = [
  [117, 45, 156, 255],
  [166, 53, 112, 255],
  [66, 79, 166, 255],
  [143, 62, 66, 255],
  [73, 126, 125, 255],
  [108, 63, 143, 255],
  [157, 80, 55, 255]
];
const DROP_MIN_DISTANCE = 38;
const DROP_OFFSETS = [
  [0, 0],
  [38, 0],
  [-38, 0],
  [0, 38],
  [0, -38],
  [38, 38],
  [38, -38],
  [-38, 38],
  [-38, -38],
  [76, 0],
  [-76, 0],
  [0, 76],
  [0, -76],
  [76, 38],
  [76, -38],
  [-76, 38],
  [-76, -38],
  [38, 76],
  [-38, 76],
  [38, -76],
  [-38, -76]
];

const map = [];
const wall_scores = [];
const wall_visuals = [];
let reachable_cells = [];
const world_fragments = [];
const world_monsters = [];
const world_health_packs = [];
const inventory = ["", "", "", "", "", "", "", ""];
const inventory_texts = [];
const inventory_slot_backs = [];

// world_fragments item:
// [fragment_data, gameobject, row, column, active, colour, scale]
const WORLD_DATA_INDEX = 0;
const WORLD_OBJECT_INDEX = 1;
const WORLD_ROW_INDEX = 2;
const WORLD_COL_INDEX = 3;
const WORLD_ACTIVE_INDEX = 4;
const WORLD_COLOUR_INDEX = 5;
const WORLD_SCALE_INDEX = 6;
const WORLD_SPAWN_ROW_INDEX = 7;
const WORLD_SPAWN_COL_INDEX = 8;

// world_monsters item:
// [body, face, left_eye, right_eye, spawn_row, spawn_column,
//  active, phase, colour, flash_until]
const MONSTER_BODY_INDEX = 0;
const MONSTER_FACE_INDEX = 1;
const MONSTER_LEFT_EYE_INDEX = 2;
const MONSTER_RIGHT_EYE_INDEX = 3;
const MONSTER_SPAWN_ROW_INDEX = 4;
const MONSTER_SPAWN_COL_INDEX = 5;
const MONSTER_ACTIVE_INDEX = 6;
const MONSTER_PHASE_INDEX = 7;
const MONSTER_COLOUR_INDEX = 8;
const MONSTER_FLASH_UNTIL_INDEX = 9;

// world_health_packs item:
// [aura, box, vertical_cross, horizontal_cross, active, row, column]
const HEALTH_AURA_INDEX = 0;
const HEALTH_BOX_INDEX = 1;
const HEALTH_VERTICAL_INDEX = 2;
const HEALTH_HORIZONTAL_INDEX = 3;
const HEALTH_ACTIVE_INDEX = 4;
const HEALTH_ROW_INDEX = 5;
const HEALTH_COL_INDEX = 6;

let player = undefined;
let goal_object = undefined;
let selected_slot = 0;
let hp = MAX_HP;
let lives_remaining = MAX_LIVES;
let stamina = MAX_STAMINA;
let current_speed = WALK_SPEED;
let sprint_locked = false;
let hp_back = undefined;
let hp_front = undefined;
let stamina_back = undefined;
let stamina_front = undefined;
let collection_action_text = undefined;
let collection_message_text = undefined;
let collection_progress_text = undefined;
let collection_lives_text = undefined;
let collection_playing_item = undefined;
let last_monster_attack_at = -MONSTER_ATTACK_COOLDOWN_MS;
let last_health_pack_refresh_at = 0;
let player_defeated = false;

function initialise_map() {
  for (let row = 0; row < ROWS; row = row + 1) {
    map[row] = [];
    wall_scores[row] = [];
    wall_visuals[row] = [];
    for (let column = 0; column < COLS; column = column + 1) {
      map[row][column] = 0;
      wall_scores[row][column] = 100;
      wall_visuals[row][column] = [];
    }
  }
}

function generate_obstacles() {
  for (let row = 0; row < ROWS; row = row + 1) {
    for (let column = 0; column < COLS; column = column + 1) {
      if (row === 0
          || row === ROWS - 1
          || column === 0
          || column === COLS - 1) {
        wall_scores[row][column] = 0;
        map[row][column] = 1;
      } else {
        const score = math_random() * 100;
        wall_scores[row][column] = score;
        map[row][column] = score < MAX_WALL_PERCENT ? 1 : 0;
      }
    }
  }

  for (let row = 1; row <= 3; row = row + 1) {
    for (let column = 1; column <= 3; column = column + 1) {
      wall_scores[row][column] = 100;
      map[row][column] = 0;
    }
  }

  for (let row = ROWS - 4; row <= ROWS - 2; row = row + 1) {
    for (let column = COLS - 4;
         column <= COLS - 2;
         column = column + 1) {
      wall_scores[row][column] = 100;
      map[row][column] = 0;
    }
  }
}

function map_has_path() {
  const visited = [];
  const queue = [];
  let head = 0;

  for (let row = 0; row < ROWS; row = row + 1) {
    visited[row] = [];
    for (let column = 0; column < COLS; column = column + 1) {
      visited[row][column] = false;
    }
  }

  queue[0] = [START_ROW, START_COL];
  visited[START_ROW][START_COL] = true;

  while (head < array_length(queue)) {
    const point = queue[head];
    const row = point[0];
    const column = point[1];
    head = head + 1;

    const neighbours = [
      [row - 1, column],
      [row + 1, column],
      [row, column - 1],
      [row, column + 1]
    ];

    for (let index = 0; index < 4; index = index + 1) {
      const next_row = neighbours[index][0];
      const next_column = neighbours[index][1];

      if (next_row >= 0
          && next_row < ROWS
          && next_column >= 0
          && next_column < COLS
          && !visited[next_row][next_column]
          && map[next_row][next_column] !== 1) {
        visited[next_row][next_column] = true;
        queue[array_length(queue)] = [next_row, next_column];
      }
    }
  }

  reachable_cells = visited;
  return visited[GOAL_ROW][GOAL_COL];
}

function build_valid_map() {
  let attempts = 0;
  let valid = false;

  while (!valid && attempts < 100) {
    generate_obstacles();
    valid = map_has_path();
    attempts = attempts + 1;
  }

  // This fallback guarantees a playable map even if all random attempts fail.
  if (!valid) {
    for (let column = START_COL;
         column <= GOAL_COL;
         column = column + 1) {
      wall_scores[START_ROW][column] = 100;
      map[START_ROW][column] = 0;
    }
    for (let row = START_ROW; row <= GOAL_ROW; row = row + 1) {
      wall_scores[row][GOAL_COL] = 100;
      map[row][GOAL_COL] = 0;
    }
    map_has_path();
  }
}

function create_collection_world() {
  // Warm grout behind the individual floor tiles.
  register_collection_object(
    update_color(
      create_rectangle(GRID_WIDTH, GRID_HEIGHT),
      [221, 174, 166, 255]
    ),
    [GRID_WIDTH / 2, GRID_HEIGHT / 2]
  );

  for (let row = 0; row < ROWS; row = row + 1) {
    for (let column = 0; column < COLS; column = column + 1) {
      const position = [
        column * TILE + TILE / 2,
        row * TILE + TILE / 2
      ];
      const floor_variation = math_floor(
        7 * (1 + math_sin(row * 0.48 + column * 0.36)) / 2
      );
      const floor_colour = (row + column) % 2 === 0
        ? [255 - floor_variation, 222 - floor_variation, 196, 255]
        : [249 - floor_variation, 211 - floor_variation, 187, 255];

      // Slightly inset alternating tiles create a soft pixel-floor pattern.
      register_collection_object(
        update_color(
          create_rectangle(TILE - 2, TILE - 2),
          floor_colour
        ),
        position
      );

      // Sparse floor glints echo the music-fragment sparkle without clutter.
      if (map[row][column] !== 1
          && (row * 11 + column * 7) % 41 === 0) {
        register_collection_object(
          update_color(
            create_rectangle(3, 3),
            [255, 245, 230, 210]
          ),
          [position[0] + 6, position[1] - 6]
        );
      }

      if (map[row][column] === 1) {
        const wall_wave =
          (1 + math_sin(row * 0.58 + column * 0.42)) / 2;
        const wall_colour = [
          100 + 100 * wall_wave,
          22 + 28 * wall_wave,
          150 + 75 * (1 - wall_wave),
          255
        ];
        const wall_highlight = [
          205 + 45 * wall_wave,
          75 + 65 * wall_wave,
          245,
          255
        ];
        const shadow_position = [position[0] + 2, position[1] + 2];
        const top_highlight_position = [position[0] - 1, position[1] - 8];
        const left_highlight_position = [position[0] - 8, position[1]];

        // Offset shadow gives each wall tile depth.
        const shadow = register_collection_object(
          update_color(
            create_rectangle(TILE - 2, TILE - 2),
            [48, 15, 72, 255]
          ),
          shadow_position
        );

        // Main purple-magenta wall face.
        const face = register_collection_object(
          update_color(
            create_rectangle(TILE - 3, TILE - 3),
            wall_colour
          ),
          position
        );

        // Top and left highlights create a beveled pixel-art edge.
        const top_highlight = register_collection_object(
          update_color(
            create_rectangle(TILE - 7, 3),
            wall_highlight
          ),
          top_highlight_position
        );
        const left_highlight = register_collection_object(
          update_color(
            create_rectangle(3, TILE - 8),
            wall_highlight
          ),
          left_highlight_position
        );

        wall_visuals[row][column] = [
          [shadow, shadow_position],
          [face, position],
          [top_highlight, top_highlight_position],
          [left_highlight, left_highlight_position]
        ];
      }
    }
  }

  goal_object = register_collection_object(
    update_scale(
      create_sprite("https://labs.phaser.io/assets/sprites/diamond.png"),
      [0.45, 0.45]
    ),
    [GOAL_COL * TILE + TILE / 2, GOAL_ROW * TILE + TILE / 2]
  );
}

function fragment_position_is_far(row, column) {
  if ((row <= 4 && column <= 4)
      || (row >= ROWS - 5 && column >= COLS - 5)) {
    return false;
  }

  for (let index = 0;
       index < array_length(world_fragments);
       index = index + 1) {
    const old_row = world_fragments[index][WORLD_ROW_INDEX];
    const old_column = world_fragments[index][WORLD_COL_INDEX];
    const delta_row = row - old_row;
    const delta_column = column - old_column;

    if (delta_row * delta_row + delta_column * delta_column < 16) {
      return false;
    }
  }

  return true;
}

function create_world_fragments() {
  for (let index = 0;
       index < array_length(ALL_FRAGMENT_DATA);
       index = index + 1) {
    let row = 1;
    let column = 1;
    let position_found = false;

    while (!position_found) {
      row = 1 + math_floor(math_random() * (ROWS - 2));
      column = 1 + math_floor(math_random() * (COLS - 2));
      position_found = map[row][column] === 0
        && reachable_cells[row][column]
        && fragment_position_is_far(row, column);
    }

    const colour = index < FRAGMENT_COUNT
      ? FRAGMENT_COLOURS[index]
      : DISTRACTOR_FRAGMENT_COLOURS[index - FRAGMENT_COUNT];
    const note = register_collection_object(
      update_color(
        update_scale(create_text("♪"), [1.8, 1.8]),
        colour
      ),
      [column * TILE + TILE / 2, row * TILE + TILE / 2]
    );

    world_fragments[index] = [
      ALL_FRAGMENT_DATA[index],
      note,
      row,
      column,
      true,
      colour,
      1.8,
      row,
      column
    ];
  }
}

function monster_position_is_far(row, column) {
  const start_delta_row = row - START_ROW;
  const start_delta_column = column - START_COL;
  const goal_delta_row = row - GOAL_ROW;
  const goal_delta_column = column - GOAL_COL;

  if (start_delta_row * start_delta_row
        + start_delta_column * start_delta_column < 64
      || goal_delta_row * goal_delta_row
        + goal_delta_column * goal_delta_column < 36) {
    return false;
  }

  for (let index = 0;
       index < array_length(world_fragments);
       index = index + 1) {
    const item = world_fragments[index];
    const delta_row = row - item[WORLD_SPAWN_ROW_INDEX];
    const delta_column = column - item[WORLD_SPAWN_COL_INDEX];

    if (delta_row * delta_row + delta_column * delta_column < 9) {
      return false;
    }
  }

  for (let index = 0;
       index < array_length(world_monsters);
       index = index + 1) {
    const monster = world_monsters[index];
    const delta_row = row - monster[MONSTER_SPAWN_ROW_INDEX];
    const delta_column = column - monster[MONSTER_SPAWN_COL_INDEX];

    if (delta_row * delta_row + delta_column * delta_column < 36) {
      return false;
    }
  }

  return true;
}

function update_monster_visual_position(monster, position) {
  update_position(monster[MONSTER_BODY_INDEX], position);
  update_position(
    monster[MONSTER_FACE_INDEX],
    [position[0], position[1] - 4]
  );
  update_position(
    monster[MONSTER_LEFT_EYE_INDEX],
    [position[0] - 4, position[1] - 4]
  );
  update_position(
    monster[MONSTER_RIGHT_EYE_INDEX],
    [position[0] + 4, position[1] - 4]
  );
}

function create_world_monsters() {
  for (let index = 0;
       index < MAX_MONSTER_COUNT;
       index = index + 1) {
    let row = 1;
    let column = 1;
    let position_found = false;

    while (!position_found) {
      row = 1 + math_floor(math_random() * (ROWS - 2));
      column = 1 + math_floor(math_random() * (COLS - 2));
      position_found = map[row][column] === 0
        && reachable_cells[row][column]
        && monster_position_is_far(row, column);
    }

    const position = [
      column * TILE + TILE / 2,
      row * TILE + TILE / 2
    ];
    const colour = MONSTER_COLOURS[index];
    const face_colour = [
      colour[0] + 45,
      colour[1] + 45,
      colour[2] + 45,
      255
    ];
    const body = register_collection_object(
      update_color(create_rectangle(18, 16), colour),
      position
    );
    const face = register_collection_object(
      update_color(create_rectangle(14, 7), face_colour),
      [position[0], position[1] - 4]
    );
    const left_eye = register_collection_object(
      update_color(create_rectangle(3, 3), [255, 245, 188, 255]),
      [position[0] - 4, position[1] - 4]
    );
    const right_eye = register_collection_object(
      update_color(create_rectangle(3, 3), [255, 245, 188, 255]),
      [position[0] + 4, position[1] - 4]
    );

    world_monsters[index] = [
      body,
      face,
      left_eye,
      right_eye,
      row,
      column,
      true,
      index * 1.73,
      colour,
      0
    ];
  }
}

function health_pack_position_is_valid(row, column, pack_index) {
  if (map[row][column] !== 0
      || !reachable_cells[row][column]
      || (row <= 4 && column <= 4)
      || (row >= ROWS - 5 && column >= COLS - 5)) {
    return false;
  }

  for (let index = 0;
       index < array_length(world_fragments);
       index = index + 1) {
    const fragment = world_fragments[index];
    const delta_row = row - fragment[WORLD_ROW_INDEX];
    const delta_column = column - fragment[WORLD_COL_INDEX];
    if (delta_row * delta_row + delta_column * delta_column < 9) {
      return false;
    }
  }

  for (let index = 0;
       index < array_length(world_monsters);
       index = index + 1) {
    const monster = world_monsters[index];
    const delta_row = row - monster[MONSTER_SPAWN_ROW_INDEX];
    const delta_column = column - monster[MONSTER_SPAWN_COL_INDEX];
    if (delta_row * delta_row + delta_column * delta_column < 9) {
      return false;
    }
  }

  for (let index = 0; index < HEALTH_PACK_COUNT; index = index + 1) {
    const other_pack = world_health_packs[index];
    if (index !== pack_index
        && other_pack !== undefined
        && other_pack[HEALTH_ACTIVE_INDEX]) {
      const delta_row = row - other_pack[HEALTH_ROW_INDEX];
      const delta_column = column - other_pack[HEALTH_COL_INDEX];
      if (delta_row * delta_row + delta_column * delta_column < 16) {
        return false;
      }
    }
  }

  return true;
}

function move_health_pack(pack, position) {
  update_position(pack[HEALTH_AURA_INDEX], position);
  update_position(pack[HEALTH_BOX_INDEX], position);
  update_position(pack[HEALTH_VERTICAL_INDEX], position);
  update_position(pack[HEALTH_HORIZONTAL_INDEX], position);
}

function hide_health_pack(pack) {
  move_health_pack(pack, HIDDEN_POSITION);
}

function create_world_health_packs() {
  for (let index = 0; index < HEALTH_PACK_COUNT; index = index + 1) {
    const aura = register_collection_object(
      update_color(create_circle(14), [73, 215, 169, 105]),
      HIDDEN_POSITION
    );
    const box = register_collection_object(
      update_color(create_rectangle(20, 20), [241, 246, 248, 255]),
      HIDDEN_POSITION
    );
    const vertical_cross = register_collection_object(
      update_color(create_rectangle(5, 15), [229, 67, 85, 255]),
      HIDDEN_POSITION
    );
    const horizontal_cross = register_collection_object(
      update_color(create_rectangle(15, 5), [229, 67, 85, 255]),
      HIDDEN_POSITION
    );

    world_health_packs[index] = [
      aura,
      box,
      vertical_cross,
      horizontal_cross,
      false,
      0,
      0
    ];
  }
}

function refresh_world_health_packs() {
  for (let index = 0; index < HEALTH_PACK_COUNT; index = index + 1) {
    let row = 1;
    let column = 1;

    while (!health_pack_position_is_valid(row, column, index)) {
      row = 1 + math_floor(math_random() * (ROWS - 2));
      column = 1 + math_floor(math_random() * (COLS - 2));
    }

    const pack = world_health_packs[index];
    pack[HEALTH_ACTIVE_INDEX] = true;
    pack[HEALTH_ROW_INDEX] = row;
    pack[HEALTH_COL_INDEX] = column;
    move_health_pack(
      pack,
      [column * TILE + TILE / 2, row * TILE + TILE / 2]
    );
  }

  last_health_pack_refresh_at = get_game_time();
}

function update_world_health_packs(player_position) {
  const now = get_game_time();

  if (now - last_health_pack_refresh_at >= HEALTH_PACK_REFRESH_MS) {
    refresh_world_health_packs();
    update_text(
      collection_message_text,
      "Two health packs refreshed."
    );
  }

  for (let index = 0; index < HEALTH_PACK_COUNT; index = index + 1) {
    const pack = world_health_packs[index];

    if (pack[HEALTH_ACTIVE_INDEX]) {
      const position = query_position(pack[HEALTH_BOX_INDEX]);
      const delta_x = player_position[0] - position[0];
      const delta_y = player_position[1] - position[1];
      const distance_squared =
        delta_x * delta_x + delta_y * delta_y;

      if (distance_squared
            < HEALTH_PACK_PICKUP_DISTANCE * HEALTH_PACK_PICKUP_DISTANCE
          && hp < MAX_HP) {
        hp = math_min(MAX_HP, hp + HEALTH_PACK_HEAL_AMOUNT);
        pack[HEALTH_ACTIVE_INDEX] = false;
        hide_health_pack(pack);
        update_text(
          collection_message_text,
          "Health pack! HP: " + stringify(hp)
        );
      } else {
        const pulse =
          0.88 + 0.2 * (1 + math_sin(now / 150 + index)) / 2;
        update_scale(pack[HEALTH_AURA_INDEX], [pulse, pulse]);
        update_to_top(pack[HEALTH_AURA_INDEX]);
        update_to_top(pack[HEALTH_BOX_INDEX]);
        update_to_top(pack[HEALTH_VERTICAL_INDEX]);
        update_to_top(pack[HEALTH_HORIZONTAL_INDEX]);
      }
    }
  }
}

function create_player_and_status() {
  player = register_collection_object(
    update_scale(
      create_sprite("avatars/beat/beat.happy.png"),
      [0.05, 0.05]
    ),
    [START_COL * TILE + TILE / 2, START_ROW * TILE + TILE / 2]
  );

  hp_back = register_collection_object(
    update_color(create_rectangle(50, 4), [60, 60, 60, 255]),
    [0, 0]
  );
  hp_front = register_collection_object(
    update_color(create_rectangle(50, 4), [220, 40, 40, 255]),
    [0, 0]
  );
  stamina_back = register_collection_object(
    update_color(create_rectangle(50, 4), [60, 60, 60, 255]),
    [0, 0]
  );
  stamina_front = register_collection_object(
    update_color(create_rectangle(50, 4), [40, 220, 80, 255]),
    [0, 0]
  );
}

function create_collection_key_hint(key_text, action_text, y, key_width) {
  register_collection_object(
    update_color(
      create_rectangle(key_width + 4, 30),
      [8, 11, 30, 255]
    ),
    [783, y + 2]
  );
  register_collection_object(
    update_color(
      create_rectangle(key_width, 26),
      [72, 47, 118, 255]
    ),
    [783, y]
  );
  register_collection_object(
    update_color(
      update_scale(create_text(key_text), [0.68, 0.68]),
      [255, 255, 255, 255]
    ),
    [783, y]
  );
  register_collection_object(
    update_color(
      update_scale(create_text(action_text), [0.68, 0.68]),
      [255, 255, 255, 255]
    ),
    [846, y]
  );
}

function create_collection_ui() {
  // Right-side control panel.
  register_collection_object(
    update_color(create_rectangle(138, 770), [18, 22, 52, 245]),
    [825, 400]
  );
  register_collection_object(
    update_color(create_rectangle(126, 4), [198, 74, 230, 255]),
    [825, 22]
  );
  register_collection_object(
    update_color(
      update_scale(create_text("ECHO"), [1.6, 1.6]),
      [255, 255, 255, 255]
    ),
    [825, 52]
  );
  register_collection_object(
    update_color(
      update_scale(create_text("FRAGMENT RUN"), [0.62, 0.62]),
      [255, 255, 255, 255]
    ),
    [825, 82]
  );

  register_collection_object(
    update_color(create_rectangle(116, 250), [25, 31, 70, 255]),
    [825, 230]
  );
  register_collection_object(
    update_color(create_rectangle(102, 2), [73, 84, 135, 255]),
    [825, 142]
  );
  register_collection_object(
    update_color(
      update_scale(create_text("MISSION"), [0.7, 0.7]),
      [255, 255, 255, 255]
    ),
    [825, 122]
  );
  register_collection_object(
    update_color(
      update_scale(create_text("♪"), [3.0, 3.0]),
      [220, 78, 239, 255]
    ),
    [825, 220]
  );
  collection_progress_text = register_collection_object(
    update_color(
      update_scale(create_text("0 / 8"), [1.22, 1.22]),
      [255, 255, 255, 255]
    ),
    [825, 308]
  );
  register_collection_object(
    update_color(
      update_scale(create_text("COLLECTED"), [0.58, 0.58]),
      [255, 255, 255, 255]
    ),
    [825, 338]
  );

  register_collection_object(
    update_color(
      update_scale(create_text("CONTROLS"), [0.78, 0.78]),
      [255, 255, 255, 255]
    ),
    [825, 382]
  );
  register_collection_object(
    update_color(create_rectangle(112, 2), [75, 84, 130, 255]),
    [825, 404]
  );

  create_collection_key_hint("WASD", "MOVE", 432, 44);
  create_collection_key_hint("F", "SPRINT", 474, 28);
  create_collection_key_hint("R", "PREVIEW", 516, 28);
  create_collection_key_hint("E", "COLLECT", 558, 28);
  create_collection_key_hint("Q", "DROP", 600, 28);
  create_collection_key_hint("1-8", "SELECT NOTE", 642, 28);

  register_collection_object(
    update_color(create_rectangle(126, 110), [29, 35, 72, 255]),
    [825, 725]
  );
  register_collection_object(
    update_color(
      update_scale(create_text("STATUS"), [0.74, 0.74]),
      [255, 255, 255, 255]
    ),
    [825, 682]
  );
  register_collection_object(
    update_color(create_rectangle(108, 1), [75, 84, 130, 255]),
    [825, 699]
  );

  collection_lives_text = register_collection_object(
    update_color(
      update_scale(create_text("LIVES: 3"), [0.72, 0.72]),
      [255, 224, 118, 255]
    ),
    [825, 716]
  );

  // Bottom inventory panel.
  register_collection_object(
    update_color(create_rectangle(742, 46), [18, 22, 52, 250]),
    [375, 775]
  );
  register_collection_object(
    update_color(create_rectangle(730, 3), [77, 190, 225, 255]),
    [375, 753]
  );
  register_collection_object(
    update_color(
      update_scale(create_text("BAG"), [0.64, 0.64]),
      [255, 255, 255, 255]
    ),
    [45, 775]
  );

  const inventory_positions = [
    [115, 775],
    [200, 775],
    [285, 775],
    [370, 775],
    [455, 775],
    [540, 775],
    [625, 775],
    [710, 775]
  ];

  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    inventory_slot_backs[index] = register_collection_object(
      update_color(create_rectangle(74, 32), [36, 43, 78, 255]),
      inventory_positions[index]
    );
    inventory_texts[index] = register_collection_object(
      update_scale(create_text(""), [0.9, 0.9]),
      inventory_positions[index]
    );
  }

  collection_action_text = register_collection_object(
    update_color(
      update_scale(create_text(""), [0.66, 0.66]),
      [255, 255, 255, 255]
    ),
    [825, 742]
  );

  collection_message_text = register_collection_object(
    update_color(
      update_scale(create_text("Find 8 notes."), [0.62, 0.62]),
      [255, 255, 255, 255]
    ),
    [825, 770]
  );
}

function update_lives_ui() {
  update_text(
    collection_lives_text,
    "LIVES: " + stringify(lives_remaining)
  );
}

function colour_for_fragment(fragment_data) {
  for (let index = 0;
       index < array_length(world_fragments);
       index = index + 1) {
    if (world_fragments[index][WORLD_DATA_INDEX][DATA_ID_INDEX]
        === fragment_data[DATA_ID_INDEX]) {
      return world_fragments[index][WORLD_COLOUR_INDEX];
    }
  }

  return [255, 255, 255, 255];
}

function update_inventory_ui() {
  let collected_count = 0;

  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    const prefix = selected_slot === index ? ">" : " ";

    update_color(
      inventory_slot_backs[index],
      selected_slot === index
        ? [92, 55, 142, 255]
        : [36, 43, 78, 255]
    );

    if (inventory[index] === "") {
      update_text(
        inventory_texts[index],
        prefix + "[" + stringify(index + 1) + "] --"
      );
      update_color(inventory_texts[index], [255, 255, 255, 255]);
    } else {
      collected_count = collected_count + 1;
      update_text(
        inventory_texts[index],
        prefix + "[" + stringify(index + 1) + "] ♪"
      );
      update_color(
        inventory_texts[index],
        colour_for_fragment(inventory[index])
      );
    }
  }

  if (collection_progress_text !== undefined) {
    update_text(
      collection_progress_text,
      stringify(collected_count) + " / " + stringify(FRAGMENT_COUNT)
    );
  }
}

function select_inventory_slot() {
  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    if (input_key_down(stringify(index + 1))) {
      selected_slot = index;
    }
  }

  update_inventory_ui();
}

function inventory_is_full() {
  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    if (inventory[index] === "") {
      return false;
    }
  }

  return true;
}

function add_to_inventory(fragment_data) {
  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    if (inventory[index] === "") {
      inventory[index] = fragment_data;
      update_inventory_ui();
      return true;
    }
  }

  return false;
}

function remove_from_inventory(slot_index) {
  inventory[slot_index] = "";
  update_inventory_ui();
}

function copy_inventory_fragments() {
  const fragment_list = [];

  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    fragment_list[index] = inventory[index];
  }

  return fragment_list;
}

// Shared boundary validation used whenever collection data enters sorting.
function fragment_list_is_valid(fragment_list) {
  if (fragment_list === undefined
      || array_length(fragment_list) !== FRAGMENT_COUNT) {
    return false;
  }

  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    const fragment_data = fragment_list[index];

    if (fragment_data === undefined
        || fragment_data === ""
        || fragment_data[DATA_ID_INDEX] === undefined
        || fragment_data[DATA_SONG_ID_INDEX] === undefined
        || fragment_data[DATA_AUDIO_URL_INDEX] === undefined
        || audio_for_fragment_data(fragment_data) === undefined) {
      return false;
    }
  }

  return true;
}

function player_can_move(position) {
  const left = math_floor((position[0] - PLAYER_HALF) / TILE);
  const right = math_floor((position[0] + PLAYER_HALF) / TILE);
  const top = math_floor((position[1] - PLAYER_HALF) / TILE);
  const bottom = math_floor((position[1] + PLAYER_HALF) / TILE);

  if (left < 0
      || right >= COLS
      || top < 0
      || bottom >= ROWS) {
    return false;
  }

  return map[top][left] !== 1
    && map[top][right] !== 1
    && map[bottom][left] !== 1
    && map[bottom][right] !== 1;
}

function move_player() {
  const position = query_position(player);
  let x = position[0];
  let y = position[1];
  const sprint_key_down = input_letter_key_down("f", "F");

  if (!sprint_key_down) {
    sprint_locked = false;
  } else if (stamina <= 0) {
    sprint_locked = true;
  }

  if (sprint_key_down && !sprint_locked && stamina > 0) {
    current_speed = RUN_SPEED;
    stamina = stamina - 1.5;
    if (stamina <= 0) {
      stamina = 0;
      sprint_locked = true;
    }
  } else {
    current_speed = WALK_SPEED;
    if (stamina < MAX_STAMINA) {
      stamina = stamina + 0.5;
    }
  }

  if (stamina < 0) {
    stamina = 0;
  } else if (stamina > MAX_STAMINA) {
    stamina = MAX_STAMINA;
  }

  if (input_letter_key_down("w", "W")) {
    y = y - current_speed;
  }
  if (input_letter_key_down("s", "S")) {
    y = y + current_speed;
  }
  if (input_letter_key_down("a", "A")) {
    x = x - current_speed;
  }
  if (input_letter_key_down("d", "D")) {
    x = x + current_speed;
  }

  const next_position = [x, y];
  if (player_can_move(next_position)) {
    update_position(player, next_position);
  }

  return query_position(player);
}

function monster_can_move(position) {
  const left = math_floor((position[0] - MONSTER_HALF) / TILE);
  const right = math_floor((position[0] + MONSTER_HALF) / TILE);
  const top = math_floor((position[1] - MONSTER_HALF) / TILE);
  const bottom = math_floor((position[1] + MONSTER_HALF) / TILE);

  if (left < 0
      || right >= COLS
      || top < 0
      || bottom >= ROWS) {
    return false;
  }

  return map[top][left] !== 1
    && map[top][right] !== 1
    && map[bottom][left] !== 1
    && map[bottom][right] !== 1;
}

function move_monster(monster, step_x, step_y) {
  const position = query_position(monster[MONSTER_BODY_INDEX]);
  const combined_position = [
    position[0] + step_x,
    position[1] + step_y
  ];
  const horizontal_position = [position[0] + step_x, position[1]];
  const vertical_position = [position[0], position[1] + step_y];
  let next_position = position;

  if (monster_can_move(combined_position)) {
    next_position = combined_position;
  } else if (monster_can_move(horizontal_position)) {
    next_position = horizontal_position;
  } else if (monster_can_move(vertical_position)) {
    next_position = vertical_position;
  }

  update_monster_visual_position(monster, next_position);
  return next_position;
}

function update_world_monsters(player_position) {
  const now = get_game_time();

  for (let index = 0;
       index < array_length(world_monsters);
       index = index + 1) {
    const monster = world_monsters[index];

    if (monster[MONSTER_ACTIVE_INDEX]) {
      const position = query_position(monster[MONSTER_BODY_INDEX]);
      const delta_x = player_position[0] - position[0];
      const delta_y = player_position[1] - position[1];
      const distance_squared =
        delta_x * delta_x + delta_y * delta_y;
      const is_chasing = distance_squared
        < MONSTER_CHASE_DISTANCE * MONSTER_CHASE_DISTANCE;
      let step_x = 0;
      let step_y = 0;

      if (is_chasing) {
        step_x = delta_x > 2
          ? MONSTER_SPEED
          : delta_x < -2
          ? -MONSTER_SPEED
          : 0;
        step_y = delta_y > 2
          ? MONSTER_SPEED
          : delta_y < -2
          ? -MONSTER_SPEED
          : 0;
      } else {
        const phase = monster[MONSTER_PHASE_INDEX];
        step_x = MONSTER_SPEED * 0.55
          * math_sin(now / 760 + phase);
        step_y = MONSTER_SPEED * 0.55
          * math_sin(now / 940 + phase + 1.8);
      }

      const moved_position = move_monster(monster, step_x, step_y);
      const attack_delta_x = player_position[0] - moved_position[0];
      const attack_delta_y = player_position[1] - moved_position[1];
      const attack_distance_squared =
        attack_delta_x * attack_delta_x
        + attack_delta_y * attack_delta_y;

      if (attack_distance_squared
            < MONSTER_ATTACK_DISTANCE * MONSTER_ATTACK_DISTANCE
          && now - last_monster_attack_at
            >= MONSTER_ATTACK_COOLDOWN_MS) {
        hp = hp - MONSTER_DAMAGE;
        if (hp < 0) {
          hp = 0;
        }
        last_monster_attack_at = now;
        monster[MONSTER_FLASH_UNTIL_INDEX] =
          now + MONSTER_FLASH_DURATION_MS;

        if (hp === 0) {
          lives_remaining = lives_remaining - 1;
          if (lives_remaining < 0) {
            lives_remaining = 0;
          }
          update_lives_ui();
          player_defeated = true;
          stop_collection_audio();
          update_text(
            collection_message_text,
            lives_remaining === 0
              ? "No lives remaining."
              : "Life lost! Press E to revive."
          );
        } else {
          update_text(
            collection_message_text,
            "Monster hit! HP: " + stringify(hp)
          );
        }
      }

      update_color(
        monster[MONSTER_BODY_INDEX],
        now < monster[MONSTER_FLASH_UNTIL_INDEX]
          ? [235, 68, 86, 255]
          : monster[MONSTER_COLOUR_INDEX]
      );
      update_to_top(monster[MONSTER_BODY_INDEX]);
      update_to_top(monster[MONSTER_FACE_INDEX]);
      update_to_top(monster[MONSTER_LEFT_EYE_INDEX]);
      update_to_top(monster[MONSTER_RIGHT_EYE_INDEX]);
    }
  }
}

function revive_player() {
  hp = MAX_HP;
  stamina = MAX_STAMINA;
  current_speed = WALK_SPEED;
  sprint_locked = false;
  player_defeated = false;
  last_monster_attack_at = get_game_time();
  update_position(
    player,
    [START_COL * TILE + TILE / 2, START_ROW * TILE + TILE / 2]
  );
  update_player_status(query_position(player));
  update_text(collection_action_text, "");
  update_text(
    collection_message_text,
    "Revived. Lives: " + stringify(lives_remaining)
  );
}

function update_player_status(position) {
  const x = position[0];
  const y = position[1];

  update_position(hp_back, [x, y - 34]);
  update_position(hp_front, [x, y - 34]);
  update_position(stamina_back, [x, y - 28]);
  update_position(stamina_front, [x, y - 28]);
  update_scale(hp_front, [hp / MAX_HP, 1]);
  update_scale(stamina_front, [stamina / MAX_STAMINA, 1]);
}

function find_nearby_world_fragment(position) {
  for (let index = 0;
       index < array_length(world_fragments);
       index = index + 1) {
    const item = world_fragments[index];

    if (item[WORLD_ACTIVE_INDEX]) {
      const item_position = query_position(item[WORLD_OBJECT_INDEX]);
      const delta_x = position[0] - item_position[0];
      const delta_y = position[1] - item_position[1];

      if (delta_x * delta_x + delta_y * delta_y < 30 * 30) {
        return item;
      }
    }
  }

  return undefined;
}

function player_is_near_goal(position) {
  const goal_position = query_position(goal_object);
  const delta_x = position[0] - goal_position[0];
  const delta_y = position[1] - goal_position[1];
  return delta_x * delta_x + delta_y * delta_y < 50 * 50;
}

function stop_collection_audio() {
  if (collection_playing_item !== undefined) {
    const data = collection_playing_item[WORLD_DATA_INDEX];
    const audio = audio_for_fragment_data(data);
    if (audio !== undefined) {
      stop_audio(audio);
    }
    collection_playing_item = undefined;
  }
}

function toggle_collection_audio(item) {
  if (collection_playing_item === item) {
    stop_collection_audio();
    update_text(collection_message_text, "Stopped.");
    return undefined;
  }

  stop_collection_audio();
  const data = item[WORLD_DATA_INDEX];
  const audio = audio_for_fragment_data(data);

  if (audio === undefined) {
    update_text(collection_message_text, "No audio.");
    return undefined;
  }

  play_audio(audio);
  collection_playing_item = item;
  update_text(
    collection_message_text,
    "Playing " + label_for_fragment_id(data[DATA_ID_INDEX]) + "."
  );
  return undefined;
}

function pick_up_fragment(item) {
  if (add_to_inventory(item[WORLD_DATA_INDEX])) {
    if (collection_playing_item === item) {
      stop_collection_audio();
    }
    item[WORLD_ACTIVE_INDEX] = false;
    update_position(item[WORLD_OBJECT_INDEX], [-2000, -2000]);
    update_text(collection_message_text, "Collected.");
    return true;
  }

  update_text(collection_message_text, "Full! Press Q.");
  return false;
}

function drop_position_is_reachable(position) {
  const row = math_floor(position[1] / TILE);
  const column = math_floor(position[0] / TILE);

  if (row <= 0
      || row >= ROWS - 1
      || column <= 0
      || column >= COLS - 1
      || map[row][column] === 1
      || !reachable_cells[row][column]) {
    return false;
  }

  return map[row - 1][column] !== 1
    || map[row + 1][column] !== 1
    || map[row][column - 1] !== 1
    || map[row][column + 1] !== 1;
}

function drop_position_is_clear(position, dropped_item) {
  if (!player_can_move(position)
      || !drop_position_is_reachable(position)) {
    return false;
  }

  for (let index = 0;
       index < array_length(world_fragments);
       index = index + 1) {
    const other_item = world_fragments[index];

    if (other_item !== dropped_item && other_item[WORLD_ACTIVE_INDEX]) {
      const other_position = query_position(
        other_item[WORLD_OBJECT_INDEX]
      );
      const delta_x = position[0] - other_position[0];
      const delta_y = position[1] - other_position[1];

      if (delta_x * delta_x + delta_y * delta_y
          < DROP_MIN_DISTANCE * DROP_MIN_DISTANCE) {
        return false;
      }
    }
  }

  return true;
}

function find_clear_drop_position(player_position, dropped_item) {
  for (let index = 0;
       index < array_length(DROP_OFFSETS);
       index = index + 1) {
    const offset = DROP_OFFSETS[index];
    const candidate = [
      player_position[0] + offset[0],
      player_position[1] + offset[1]
    ];

    if (drop_position_is_clear(candidate, dropped_item)) {
      return candidate;
    }
  }

  return undefined;
}

function drop_selected_fragment(position) {
  const fragment_data = inventory[selected_slot];

  if (fragment_data === "") {
    return undefined;
  }

  for (let index = 0;
       index < array_length(world_fragments);
       index = index + 1) {
    const item = world_fragments[index];

    if (item[WORLD_DATA_INDEX][DATA_ID_INDEX]
        === fragment_data[DATA_ID_INDEX]) {
      const drop_position = find_clear_drop_position(position, item);

      if (drop_position === undefined) {
        update_text(collection_message_text, "No room to drop.");
        return false;
      }

      item[WORLD_ACTIVE_INDEX] = true;
      item[WORLD_ROW_INDEX] = math_floor(drop_position[1] / TILE);
      item[WORLD_COL_INDEX] = math_floor(drop_position[0] / TILE);
      item[WORLD_SCALE_INDEX] = 1.8;
      update_scale(item[WORLD_OBJECT_INDEX], [1.8, 1.8]);
      update_position(item[WORLD_OBJECT_INDEX], drop_position);
      remove_from_inventory(selected_slot);
      update_text(collection_message_text, "Dropped.");
      return true;
    }
  }

  return false;
}

function highlight_world_fragments(position) {
  for (let index = 0;
       index < array_length(world_fragments);
       index = index + 1) {
    const item = world_fragments[index];

    if (item[WORLD_ACTIVE_INDEX]) {
      const item_position = query_position(item[WORLD_OBJECT_INDEX]);
      const delta_x = position[0] - item_position[0];
      const delta_y = position[1] - item_position[1];
      const nearby = delta_x * delta_x + delta_y * delta_y < 30 * 30;
      let scale = item[WORLD_SCALE_INDEX];

      if (nearby && scale < 2.35) {
        scale = scale + 0.025;
      } else if (!nearby && scale > 1.8) {
        scale = scale - 0.025;
      }

      item[WORLD_SCALE_INDEX] = scale;
      update_scale(item[WORLD_OBJECT_INDEX], [scale, scale]);
      update_to_top(item[WORLD_OBJECT_INDEX]);
    }
  }
}

function update_collection_prompt(position, nearby_item) {
  if (nearby_item !== undefined) {
    update_text(collection_action_text, "R PLAY  E TAKE");
  } else if (player_is_near_goal(position)) {
    if (inventory_is_full()) {
      update_text(collection_action_text, "E: SORT");
    } else {
      update_text(collection_action_text, "NEED 8 NOTES");
    }
  } else {
    update_text(collection_action_text, "");
  }
}

function update_collection_scene(e_pressed, q_pressed, r_pressed) {
  if (player_defeated) {
    if (lives_remaining === 0) {
      enter_failure_scene();
      return undefined;
    }

    if (e_pressed) {
      revive_player();
    }

    if (player_defeated) {
      update_player_status(query_position(player));
      update_text(collection_action_text, "E: REVIVE");
      update_to_top(player);
      update_to_top(hp_back);
      update_to_top(hp_front);
      update_to_top(stamina_back);
      update_to_top(stamina_front);
      return undefined;
    }
  }

  const position = move_player();
  update_world_monsters(position);

  if (player_defeated) {
    update_player_status(position);

    if (lives_remaining === 0) {
      enter_failure_scene();
      return undefined;
    }

    update_text(collection_action_text, "E: REVIVE");
    update_to_top(player);
    update_to_top(hp_back);
    update_to_top(hp_front);
    update_to_top(stamina_back);
    update_to_top(stamina_front);
    return undefined;
  }

  update_world_health_packs(position);
  update_player_status(position);
  const nearby_item = find_nearby_world_fragment(position);
  select_inventory_slot();
  highlight_world_fragments(position);
  update_collection_prompt(position, nearby_item);

  if (collection_playing_item !== undefined
      && collection_playing_item !== nearby_item) {
    stop_collection_audio();
    update_text(collection_message_text, "Stopped.");
  }

  if (r_pressed && nearby_item !== undefined) {
    toggle_collection_audio(nearby_item);
  }

  if (q_pressed) {
    drop_selected_fragment(position);
  }

  if (e_pressed) {
    if (nearby_item !== undefined) {
      pick_up_fragment(nearby_item);
    } else if (player_is_near_goal(position) && inventory_is_full()) {
      enter_sorting_level(copy_inventory_fragments());
    }
  }

  update_to_top(goal_object);
  update_to_top(player);
  update_to_top(hp_back);
  update_to_top(hp_front);
  update_to_top(stamina_back);
  update_to_top(stamina_front);
}

function initialise_collection_scene() {
  initialise_map();
  build_valid_map();
  create_collection_world();
  create_world_fragments();
  create_world_monsters();
  create_world_health_packs();
  create_player_and_status();
  create_collection_ui();
  update_inventory_ui();
  update_lives_ui();
  update_player_status(query_position(player));
}

function apply_collection_difficulty() {
  stop_collection_audio();

  for (let row = 0; row < ROWS; row = row + 1) {
    for (let column = 0; column < COLS; column = column + 1) {
      const border = row === 0
        || row === ROWS - 1
        || column === 0
        || column === COLS - 1;
      const wall_is_active = border
        || wall_scores[row][column] < wall_percent;
      const visuals = wall_visuals[row][column];

      map[row][column] = wall_is_active ? 1 : 0;

      for (let visual_index = 0;
           visual_index < array_length(visuals);
           visual_index = visual_index + 1) {
        update_position(
          visuals[visual_index][0],
          wall_is_active
            ? visuals[visual_index][1]
            : HIDDEN_POSITION
        );
      }
    }
  }

  // The Extreme map is generated first and guaranteed playable. Easy and
  // Hard only remove walls from it, so all three difficulties remain valid.
  map_has_path();

  for (let index = 0;
       index < array_length(world_fragments);
       index = index + 1) {
    const item = world_fragments[index];
    const is_used_by_difficulty = index < note_count;
    const spawn_position = [
      item[WORLD_SPAWN_COL_INDEX] * TILE + TILE / 2,
      item[WORLD_SPAWN_ROW_INDEX] * TILE + TILE / 2
    ];

    item[WORLD_ACTIVE_INDEX] = is_used_by_difficulty;
    item[WORLD_ROW_INDEX] = item[WORLD_SPAWN_ROW_INDEX];
    item[WORLD_COL_INDEX] = item[WORLD_SPAWN_COL_INDEX];
    item[WORLD_SCALE_INDEX] = 1.8;
    update_scale(item[WORLD_OBJECT_INDEX], [1.8, 1.8]);
    update_position(
      item[WORLD_OBJECT_INDEX],
      is_used_by_difficulty ? spawn_position : HIDDEN_POSITION
    );
  }

  for (let index = 0;
       index < array_length(world_monsters);
       index = index + 1) {
    const monster = world_monsters[index];
    const is_used_by_difficulty = index < monster_count;
    const spawn_position = [
      monster[MONSTER_SPAWN_COL_INDEX] * TILE + TILE / 2,
      monster[MONSTER_SPAWN_ROW_INDEX] * TILE + TILE / 2
    ];

    monster[MONSTER_ACTIVE_INDEX] = is_used_by_difficulty;
    monster[MONSTER_FLASH_UNTIL_INDEX] = 0;
    update_color(
      monster[MONSTER_BODY_INDEX],
      monster[MONSTER_COLOUR_INDEX]
    );
    update_monster_visual_position(
      monster,
      is_used_by_difficulty ? spawn_position : HIDDEN_POSITION
    );
  }

  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    inventory[index] = "";
  }

  selected_slot = 0;
  hp = MAX_HP;
  lives_remaining = MAX_LIVES;
  stamina = MAX_STAMINA;
  current_speed = WALK_SPEED;
  sprint_locked = false;
  player_defeated = false;
  last_monster_attack_at = -MONSTER_ATTACK_COOLDOWN_MS;
  update_position(
    player,
    [START_COL * TILE + TILE / 2, START_ROW * TILE + TILE / 2]
  );
  refresh_world_health_packs();
  update_inventory_ui();
  update_lives_ui();
  update_player_status(query_position(player));
}

// ============================================================
// Sorting scene
// ============================================================

const SORT_FRAGMENT_RADIUS = 31;
const SORT_FRAGMENT_GAP = 15;
const SORT_FRAGMENT_Y = 285;
const SORT_PREVIEW_WIDTH = 58;
const SORT_PREVIEW_HEIGHT = 28;
const SORT_PREVIEW_OFFSET = SORT_FRAGMENT_RADIUS
  + SORT_PREVIEW_HEIGHT / 2 + 12;
const SORT_TIMER_DURATION_MS = 5 * 60 * 1000;
const SORT_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const SORT_INITIAL_SLOTS = [5, 0, 7, 2, 6, 1, 4, 3];
const SORT_TOTAL_SEQUENCE_COUNT = 10;
const SORTABLE_SEQUENCE_POSITIONS = [1, 2, 3, 4, 5, 6, 7, 9];
const SORT_LABEL_BASE_SCALE = 1.35;
const SORT_DRAG_SCALE = 1.14;
const SORT_DRAG_FOLLOW = 0.34;
const SORT_SETTLE_FOLLOW = 0.22;

// Muted colours keep the records distinct without overpowering the scene.
const SORT_BACKGROUND_COLOUR = [10, 14, 42, 255];
const SORT_MAIN_PANEL_COLOUR = [24, 34, 68, 238];
const SORT_ANIMATION_PANEL_COLOUR = [18, 27, 54, 238];
const SORT_CENTRE_COLOUR = [22, 28, 48, 255];
const SORT_PREVIEW_COLOUR = [54, 113, 153, 255];
const SORT_PREVIEW_ACTIVE_COLOUR = [181, 77, 79, 255];
const SORT_CONTROL_COLOUR = [54, 82, 112, 255];
const SORT_FIXED_RING_COLOUR = [214, 175, 72, 255];
const SORT_FIXED_CENTRE_COLOUR = [32, 34, 55, 255];
const SORT_FIXED_TEXT_COLOUR = [250, 221, 132, 255];
const SORT_FIXED_BUTTON_COLOUR = [174, 121, 48, 255];
const SORT_SHADOW_COLOUR = [6, 9, 22, 100];

// sorting fragment item:
// [label, slot, shape, label_text, button, button_text,
//  audio, centre, fragment_id, song_id, fragment_data, idle_button_colour,
//  shadow, animation_scale, animation_bounce]
const SORT_LABEL_INDEX = 0;
const SORT_SLOT_INDEX = 1;
const SORT_SHAPE_INDEX = 2;
const SORT_LABEL_TEXT_INDEX = 3;
const SORT_BUTTON_INDEX = 4;
const SORT_BUTTON_TEXT_INDEX = 5;
const SORT_AUDIO_INDEX = 6;
const SORT_CENTRE_INDEX = 7;
const SORT_ID_INDEX = 8;
const SORT_SONG_ID_INDEX = 9;
const SORT_DATA_INDEX = 10;
const SORT_BUTTON_IDLE_COLOUR_INDEX = 11;
const SORT_SHADOW_INDEX = 12;
const SORT_ANIMATION_SCALE_INDEX = 13;
const SORT_ANIMATION_BOUNCE_INDEX = 14;

let sorting_fragments = [];
let sorting_fragment_colours = [];
let sorting_fixed_fragments = [];
let sorting_slot_positions = [];
let sorting_sequence_positions = [];
let sorting_equalizer_bars = [];
let sorting_floating_notes = [];
let sorting_wave_dots = [];
let sorting_drifting_sparks = [];
let sorting_spaceship_pixels = [];
let sorting_spaceship_trail = [];
let sorting_pixel_planets = [];
let sorting_planet_moons = [];
let sorting_dragged_fragment = undefined;
let sorting_drag_pointer_offset = [0, 0];
let sorting_playing_fragment = undefined;
let sorting_active = false;
let sorting_timer_started_at = 0;
let sorting_time_remaining_ms = SORT_TIMER_DURATION_MS;
let sorting_timer_text = undefined;
let sorting_status_text = undefined;
let sorting_submit_button = undefined;
let sorting_submit_text = undefined;
let sorting_back_button = undefined;
let sorting_back_text = undefined;
let completed_fragment_sequence = [];
const fragment_audio_cache = [];
const AUDIO_CACHE_ID_INDEX = 0;
const AUDIO_CACHE_SONG_ID_INDEX = 1;
const AUDIO_CACHE_URL_INDEX = 2;
const AUDIO_CACHE_CLIP_INDEX = 3;

function randomise_sorting_fragment_colours() {
  sorting_fragment_colours = [];

  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    sorting_fragment_colours[index] = FRAGMENT_COLOURS[index];
  }

  for (let index = FRAGMENT_COUNT - 1;
       index > 0;
       index = index - 1) {
    const swap_index = math_floor(math_random() * (index + 1));
    const old_colour = sorting_fragment_colours[index];
    sorting_fragment_colours[index] =
      sorting_fragment_colours[swap_index];
    sorting_fragment_colours[swap_index] = old_colour;
  }

  // Do not allow the rare unshuffled rainbow order.
  let is_original_order = true;
  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    if (sorting_fragment_colours[index] !== FRAGMENT_COLOURS[index]) {
      is_original_order = false;
    }
  }

  if (is_original_order) {
    const first_colour = sorting_fragment_colours[0];
    sorting_fragment_colours[0] = sorting_fragment_colours[1];
    sorting_fragment_colours[1] = first_colour;
  }
}

function create_fragment_audio_cache() {
  for (let index = 0;
       index < array_length(ALL_FRAGMENT_DATA);
       index = index + 1) {
    const data = ALL_FRAGMENT_DATA[index];
    fragment_audio_cache[index] = [
      data[DATA_ID_INDEX],
      data[DATA_SONG_ID_INDEX],
      data[DATA_AUDIO_URL_INDEX],
      // The current Source Academy runtime accepts 0 or 1 here.
      create_audio(data[DATA_AUDIO_URL_INDEX], 1)
    ];
  }

  for (let index = 0;
       index < array_length(FIXED_FRAGMENT_DATA);
       index = index + 1) {
    const data = FIXED_FRAGMENT_DATA[index][FIXED_DATA_INDEX];
    const cache_index = array_length(ALL_FRAGMENT_DATA) + index;
    fragment_audio_cache[cache_index] = [
      data[DATA_ID_INDEX],
      data[DATA_SONG_ID_INDEX],
      data[DATA_AUDIO_URL_INDEX],
      create_audio(data[DATA_AUDIO_URL_INDEX], 1)
    ];
  }
}

function audio_for_fragment_data(fragment_data) {
  for (let index = 0;
       index < array_length(fragment_audio_cache);
       index = index + 1) {
    if (fragment_audio_cache[index][AUDIO_CACHE_ID_INDEX]
          === fragment_data[DATA_ID_INDEX]
        && fragment_audio_cache[index][AUDIO_CACHE_SONG_ID_INDEX]
          === fragment_data[DATA_SONG_ID_INDEX]
        && fragment_audio_cache[index][AUDIO_CACHE_URL_INDEX]
          === fragment_data[DATA_AUDIO_URL_INDEX]) {
      return fragment_audio_cache[index][AUDIO_CACHE_CLIP_INDEX];
    }
  }

  return undefined;
}

function create_sort_pixel(x, y, size, colour) {
  return register_sorting_object(
    update_color(create_rectangle(size, size), colour),
    [x, y]
  );
}

function create_sorting_background() {
  register_sorting_object(
    update_color(
      create_rectangle(CANVAS_WIDTH, CANVAS_HEIGHT),
      SORT_BACKGROUND_COLOUR
    ),
    [CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2]
  );

  for (let index = 0; index < 150; index = index + 1) {
    const pixel_x = math_random() * CANVAS_WIDTH;
    const top_band = index % 2 === 0;
    const pixel_y = top_band
      ? 15 + math_random() * 100
      : CANVAS_HEIGHT - 15 - math_random() * 105;
    const pixel_size = 3 + math_floor(math_random() * 8);
    create_sort_pixel(
      pixel_x,
      pixel_y,
      pixel_size,
      [31, 41, 92 + math_floor(math_random() * 58), 78]
    );
  }

  const star_colours = [
    [236, 239, 246, 225],
    [192, 91, 208, 200],
    [104, 111, 218, 195]
  ];

  for (let index = 0; index < 70; index = index + 1) {
    const edge = index % 4;
    let star_x = 0;
    let star_y = 0;

    if (edge === 0) {
      star_x = math_random() * CANVAS_WIDTH;
      star_y = 12 + math_random() * 90;
    } else if (edge === 1) {
      star_x = math_random() * CANVAS_WIDTH;
      star_y = CANVAS_HEIGHT - 12 - math_random() * 90;
    } else if (edge === 2) {
      star_x = 12 + math_random() * 70;
      star_y = 100 + math_random() * 570;
    } else {
      star_x = CANVAS_WIDTH - 12 - math_random() * 70;
      star_y = 100 + math_random() * 570;
    }

    create_sort_pixel(
      star_x,
      star_y,
      3 + math_floor(math_random() * 5),
      star_colours[index % 3]
    );
  }

  for (let index = 0; index < 28; index = index + 1) {
    const trail_colour = index < 7
      ? [236, 239, 246, 225]
      : index < 18
      ? [192, 91, 208, 190]
      : [92, 101, 202, 145];
    create_sort_pixel(
      88 + index * 5,
      690 - index * 1.15 + (math_random() - 0.5) * 12,
      index < 8 ? 8 : 4,
      trail_colour
    );
  }

  register_sorting_object(
    update_color(create_rectangle(840, 190), SORT_MAIN_PANEL_COLOUR),
    [CANVAS_WIDTH / 2, 305]
  );
  register_sorting_object(
    update_color(create_rectangle(820, 155), SORT_ANIMATION_PANEL_COLOUR),
    [CANVAS_WIDTH / 2, 700]
  );
}

function create_sorting_header() {
  register_sorting_object(
    update_color(
      update_scale(create_text("Arrange the Melody"), [2.1, 2.1]),
      [255, 255, 255, 255]
    ),
    [CANVAS_WIDTH / 2, 50]
  );

  sorting_timer_text = register_sorting_object(
    update_color(create_text("Time: 05:00"), [220, 220, 230, 255]),
    [CANVAS_WIDTH / 2, 105]
  );

  register_sorting_object(
    update_color(
      create_text("Drag the 8 records to sort. FIXED records cannot move."),
      [220, 220, 230, 255]
    ),
    [CANVAS_WIDTH / 2, 145]
  );

  sorting_status_text = register_sorting_object(
    update_color(create_text(""), [255, 255, 255, 255]),
    [CANVAS_WIDTH / 2, 475]
  );
}

function create_sorting_slots() {
  const diameter = SORT_FRAGMENT_RADIUS * 2;
  const total_width = SORT_TOTAL_SEQUENCE_COUNT * diameter
    + (SORT_TOTAL_SEQUENCE_COUNT - 1) * SORT_FRAGMENT_GAP;
  const first_x = (CANVAS_WIDTH - total_width) / 2
    + SORT_FRAGMENT_RADIUS;

  sorting_slot_positions = [];
  sorting_sequence_positions = [];

  for (let index = 0;
       index < SORT_TOTAL_SEQUENCE_COUNT;
       index = index + 1) {
    const position = [
      first_x + index * (diameter + SORT_FRAGMENT_GAP),
      SORT_FRAGMENT_Y
    ];
    sorting_sequence_positions[index] = position;
    register_sorting_object(
      update_color(
        update_scale(create_text(stringify(index + 1)), [0.62, 0.62]),
        [145, 155, 185, 255]
      ),
      [position[0], SORT_FRAGMENT_Y - SORT_FRAGMENT_RADIUS - 19]
    );
  }

  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    sorting_slot_positions[index] = sorting_sequence_positions[
      SORTABLE_SEQUENCE_POSITIONS[index]
    ];
  }
}

function create_fixed_sorting_fragments() {
  sorting_fixed_fragments = [];

  for (let index = 0;
       index < array_length(FIXED_FRAGMENT_DATA);
       index = index + 1) {
    const fixed_item = FIXED_FRAGMENT_DATA[index];
    const data = fixed_item[FIXED_DATA_INDEX];
    const position = sorting_sequence_positions[
      fixed_item[FIXED_POSITION_INDEX]
    ];

    const disc = register_sorting_object(
      update_color(
        create_circle(SORT_FRAGMENT_RADIUS),
        SORT_FIXED_RING_COLOUR
      ),
      position
    );
    const centre = register_sorting_object(
      update_color(
        create_circle(SORT_FRAGMENT_RADIUS - 5),
        SORT_FIXED_CENTRE_COLOUR
      ),
      position
    );
    const label_text = register_sorting_object(
      update_color(
        update_scale(
          create_text("FIXED"),
          [0.72, 0.72]
        ),
        SORT_FIXED_TEXT_COLOUR
      ),
      position
    );
    const button_position = [
      position[0],
      position[1] + SORT_PREVIEW_OFFSET
    ];
    const button = register_sorting_object(
      update_color(
        create_rectangle(SORT_PREVIEW_WIDTH, SORT_PREVIEW_HEIGHT),
        SORT_FIXED_BUTTON_COLOUR
      ),
      button_position
    );
    const button_text = register_sorting_object(
      update_color(
        update_scale(create_text("Play"), [0.72, 0.72]),
        [255, 255, 255, 255]
      ),
      button_position
    );

    sorting_fixed_fragments[index] = [
      fixed_item[FIXED_LABEL_INDEX],
      fixed_item[FIXED_POSITION_INDEX],
      disc,
      label_text,
      button,
      button_text,
      audio_for_fragment_data(data),
      centre,
      data[DATA_ID_INDEX],
      data[DATA_SONG_ID_INDEX],
      data,
      SORT_FIXED_BUTTON_COLOUR
    ];
  }
}

function move_sorting_fragment(fragment, position) {
  const button_position = [position[0], position[1] + SORT_PREVIEW_OFFSET];
  const shadow_position = [position[0] + 4, position[1] + 8];
  update_position(fragment[SORT_SHADOW_INDEX], shadow_position);
  update_position(fragment[SORT_SHAPE_INDEX], position);
  update_position(fragment[SORT_CENTRE_INDEX], position);
  update_position(fragment[SORT_LABEL_TEXT_INDEX], position);
  update_position(fragment[SORT_BUTTON_INDEX], button_position);
  update_position(fragment[SORT_BUTTON_TEXT_INDEX], button_position);
}

function scale_sorting_fragment(fragment, scale) {
  fragment[SORT_ANIMATION_SCALE_INDEX] = scale;
  update_scale(fragment[SORT_SHADOW_INDEX], [scale * 1.08, scale * 0.82]);
  update_scale(fragment[SORT_SHAPE_INDEX], [scale, scale]);
  update_scale(fragment[SORT_CENTRE_INDEX], [scale, scale]);
  update_scale(
    fragment[SORT_LABEL_TEXT_INDEX],
    [SORT_LABEL_BASE_SCALE * scale, SORT_LABEL_BASE_SCALE * scale]
  );
}

function move_sorting_fragment_to_slot(fragment) {
  move_sorting_fragment(
    fragment,
    sorting_slot_positions[fragment[SORT_SLOT_INDEX]]
  );
}

function bring_sorting_fragment_to_front(fragment) {
  update_to_top(fragment[SORT_SHADOW_INDEX]);
  update_to_top(fragment[SORT_SHAPE_INDEX]);
  update_to_top(fragment[SORT_CENTRE_INDEX]);
  update_to_top(fragment[SORT_LABEL_TEXT_INDEX]);
  update_to_top(fragment[SORT_BUTTON_INDEX]);
  update_to_top(fragment[SORT_BUTTON_TEXT_INDEX]);
}

function create_sorting_fragments() {
  sorting_fragments = [];

  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    const shadow = register_sorting_object(
      update_color(
        update_scale(
          create_circle(SORT_FRAGMENT_RADIUS),
          [1.08, 0.82]
        ),
        SORT_SHADOW_COLOUR
      ),
      [0, 0]
    );
    const disc = register_sorting_object(
      update_color(create_circle(SORT_FRAGMENT_RADIUS), FRAGMENT_COLOURS[index]),
      [0, 0]
    );
    const centre = register_sorting_object(
      update_color(create_circle(13), SORT_CENTRE_COLOUR),
      [0, 0]
    );
    const label_text = register_sorting_object(
      update_color(
        update_scale(
          create_text(SORT_LABELS[index]),
          [SORT_LABEL_BASE_SCALE, SORT_LABEL_BASE_SCALE]
        ),
        [255, 255, 255, 255]
      ),
      [0, 0]
    );
    const button = register_sorting_object(
      update_color(
        create_rectangle(SORT_PREVIEW_WIDTH, SORT_PREVIEW_HEIGHT),
        SORT_PREVIEW_COLOUR
      ),
      [0, 0]
    );
    const button_text = register_sorting_object(
      update_color(
        update_scale(create_text("Play"), [0.78, 0.78]),
        [255, 255, 255, 255]
      ),
      [0, 0]
    );

    const fragment = [
      SORT_LABELS[index],
      SORT_INITIAL_SLOTS[index],
      disc,
      label_text,
      button,
      button_text,
      undefined,
      centre,
      "",
      "",
      "",
      SORT_PREVIEW_COLOUR,
      shadow,
      1,
      0
    ];

    sorting_fragments[index] = fragment;
    move_sorting_fragment_to_slot(fragment);
  }
}

function configure_sorting_fragments(fragment_list) {
  randomise_sorting_fragment_colours();

  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    const data = fragment_list[index];
    const fragment = sorting_fragments[index];
    const label = label_for_fragment_id(data[DATA_ID_INDEX]);
    fragment[SORT_SLOT_INDEX] = SORT_INITIAL_SLOTS[index];
    fragment[SORT_LABEL_INDEX] = label;
    fragment[SORT_AUDIO_INDEX] = audio_for_fragment_data(data);
    fragment[SORT_ID_INDEX] = data[DATA_ID_INDEX];
    fragment[SORT_SONG_ID_INDEX] = data[DATA_SONG_ID_INDEX];
    fragment[SORT_DATA_INDEX] = data;
    update_text(fragment[SORT_LABEL_TEXT_INDEX], label);
    update_color(
      fragment[SORT_SHAPE_INDEX],
      sorting_fragment_colours[index]
    );
    update_text(fragment[SORT_BUTTON_TEXT_INDEX], "Play");
    update_color(
      fragment[SORT_BUTTON_INDEX],
      fragment[SORT_BUTTON_IDLE_COLOUR_INDEX]
    );
    fragment[SORT_ANIMATION_BOUNCE_INDEX] = 0;
    scale_sorting_fragment(fragment, 1);
    move_sorting_fragment_to_slot(fragment);
  }
}

function label_for_fragment_id(fragment_id) {
  for (let index = 0;
       index < FRAGMENT_COUNT;
       index = index + 1) {
    if (TARGET_FRAGMENT_IDS[index] === fragment_id) {
      return target_fragment_labels[index];
    }
  }

  for (let index = 0;
       index < array_length(DISTRACTOR_FRAGMENT_IDS);
       index = index + 1) {
    if (DISTRACTOR_FRAGMENT_IDS[index] === fragment_id) {
      return DISTRACTOR_FRAGMENT_LABELS[index];
    }
  }

  return "?";
}

function create_sorting_controls() {
  sorting_back_button = register_sorting_object(
    update_color(create_rectangle(120, 42), [72, 79, 96, 255]),
    [82, 62]
  );
  sorting_back_text = register_sorting_object(
    update_color(create_text("Back"), [255, 255, 255, 255]),
    [82, 62]
  );
  sorting_submit_button = register_sorting_object(
    update_color(create_rectangle(160, 48), SORT_CONTROL_COLOUR),
    [CANVAS_WIDTH / 2, 530]
  );
  sorting_submit_text = register_sorting_object(
    update_color(create_text("Submit"), [255, 255, 255, 255]),
    [CANVAS_WIDTH / 2, 530]
  );
}

function add_sorting_spaceship_pixel(grid_x, grid_y, colour) {
  const pixel_size = 5;
  const pixel = register_sorting_object(
    update_color(create_rectangle(pixel_size, pixel_size), colour),
    [-100, -100]
  );
  sorting_spaceship_pixels[
    array_length(sorting_spaceship_pixels)
  ] = [pixel, grid_x * pixel_size, grid_y * pixel_size];
}

function create_sorting_pixel_spaceship() {
  const body_colour = [126, 139, 213, 255];
  const wing_colour = [96, 84, 173, 255];
  const glass_colour = [102, 211, 221, 255];
  const nose_colour = [229, 232, 245, 255];
  const flame_colour = [226, 118, 58, 255];
  const flame_light_colour = [246, 193, 72, 255];
  sorting_spaceship_pixels = [];
  sorting_spaceship_trail = [];

  add_sorting_spaceship_pixel(-5, 0, flame_light_colour);
  add_sorting_spaceship_pixel(-4, -1, flame_colour);
  add_sorting_spaceship_pixel(-4, 0, flame_colour);
  add_sorting_spaceship_pixel(-4, 1, flame_colour);

  for (let grid_x = -2; grid_x <= 1; grid_x = grid_x + 1) {
    add_sorting_spaceship_pixel(grid_x, -2, wing_colour);
    add_sorting_spaceship_pixel(grid_x, 2, wing_colour);
  }
  add_sorting_spaceship_pixel(-1, -3, wing_colour);
  add_sorting_spaceship_pixel(-1, 3, wing_colour);
  add_sorting_spaceship_pixel(-3, -2, wing_colour);
  add_sorting_spaceship_pixel(-3, 2, wing_colour);

  for (let grid_x = -3; grid_x <= 3; grid_x = grid_x + 1) {
    for (let grid_y = -1; grid_y <= 1; grid_y = grid_y + 1) {
      add_sorting_spaceship_pixel(grid_x, grid_y, body_colour);
    }
  }

  add_sorting_spaceship_pixel(1, -1, glass_colour);
  add_sorting_spaceship_pixel(2, -1, glass_colour);
  add_sorting_spaceship_pixel(4, 0, nose_colour);

  for (let index = 0; index < 5; index = index + 1) {
    const colour = index % 2 === 0
      ? flame_colour
      : flame_light_colour;
    const trail = register_sorting_object(
      update_color(create_rectangle(4, 4), colour),
      [-100, -100]
    );
    sorting_spaceship_trail[index] = trail;
  }
}

function add_sorting_planet_pixel(pixel_list, x, y, size, colour) {
  const pixel = register_sorting_object(
    update_color(create_rectangle(size, size), colour),
    [x, y]
  );
  pixel_list[array_length(pixel_list)] = [pixel, x, y];
}

function create_sorting_pixel_planet(
  centre_x,
  centre_y,
  base_colour,
  patch_colour,
  light_colour,
  ring_colour,
  phase,
  pixel_size
) {
  const pixels = [];

  if (ring_colour !== undefined) {
    for (let index = -5; index <= 5; index = index + 1) {
      const ring_y = index < -2 ? -7 : index > 2 ? 7 : 0;
      add_sorting_planet_pixel(
        pixels,
        index * pixel_size,
        ring_y,
        pixel_size,
        ring_colour
      );
    }
  }

  const row_widths = [3, 5, 7, 7, 7, 5, 3];
  for (let row = 0; row < 7; row = row + 1) {
    const width = row_widths[row];
    for (let column = 0; column < width; column = column + 1) {
      const offset_x = (column - (width - 1) / 2) * pixel_size;
      const offset_y = (row - 3) * pixel_size;
      const pattern = (row * 5 + column + math_floor(phase * 3)) % 7;
      const colour = row < 2 && column === 0
        ? light_colour
        : pattern < 2
        ? patch_colour
        : base_colour;
      add_sorting_planet_pixel(
        pixels,
        offset_x,
        offset_y,
        pixel_size,
        colour
      );
    }
  }

  const planet_state = [
    pixels,
    centre_x,
    centre_y,
    phase,
    centre_x,
    centre_y
  ];
  for (let index = 0; index < array_length(pixels); index = index + 1) {
    update_position(
      pixels[index][0],
      [centre_x + pixels[index][1], centre_y + pixels[index][2]]
    );
  }
  sorting_pixel_planets[
    array_length(sorting_pixel_planets)
  ] = planet_state;

  const moon = register_sorting_object(
    update_color(
      create_rectangle(pixel_size < 6 ? 4 : 6, pixel_size < 6 ? 4 : 6),
      light_colour
    ),
    [centre_x + pixel_size * 6, centre_y]
  );
  sorting_planet_moons[
    array_length(sorting_planet_moons)
  ] = [
    moon,
    planet_state,
    phase,
    pixel_size * 6,
    pixel_size * 2.5
  ];
}

function create_sorting_animation() {
  const bar_count = 15;
  const bar_width = 18;
  const bar_height = 64;
  const gap = 14;
  const bottom_y = 770;
  const total_width = bar_count * bar_width + (bar_count - 1) * gap;
  const first_x = (CANVAS_WIDTH - total_width) / 2 + bar_width / 2;
  sorting_equalizer_bars = [];
  sorting_floating_notes = [];
  sorting_wave_dots = [];
  sorting_drifting_sparks = [];
  sorting_pixel_planets = [];
  sorting_planet_moons = [];
  create_sorting_pixel_spaceship();
  create_sorting_pixel_planet(
    112,
    520,
    [63, 139, 174, 255],
    [75, 172, 116, 255],
    [156, 225, 218, 255],
    undefined,
    0.8,
    7
  );
  create_sorting_pixel_planet(
    788,
    525,
    [164, 83, 119, 255],
    [214, 132, 69, 255],
    [244, 196, 105, 255],
    [218, 164, 74, 255],
    2.4,
    7
  );
  create_sorting_pixel_planet(
    205,
    458,
    [91, 137, 190, 255],
    [128, 183, 215, 255],
    [211, 235, 245, 255],
    undefined,
    1.5,
    5
  );
  create_sorting_pixel_planet(
    695,
    468,
    [112, 82, 164, 255],
    [175, 88, 165, 255],
    [224, 154, 207, 255],
    undefined,
    3.2,
    5
  );
  create_sorting_pixel_planet(
    820,
    585,
    [60, 137, 128, 255],
    [104, 177, 108, 255],
    [180, 224, 146, 255],
    [139, 190, 102, 255],
    4.6,
    4
  );

  for (let index = 0; index < bar_count; index = index + 1) {
    const bar = register_sorting_object(
      update_color(
        update_scale(create_rectangle(bar_width, bar_height), [1, 0.2]),
        FRAGMENT_COLOURS[index % 8]
      ),
      [first_x + index * (bar_width + gap), bottom_y - 7]
    );
    sorting_equalizer_bars[index] = bar;
  }

  const note_positions = [[105, 675], [795, 675], [145, 755], [755, 755]];
  const note_symbols = ["♪", "♫", "♪", "♬"];

  for (let index = 0; index < 4; index = index + 1) {
    const note = register_sorting_object(
      update_color(
        update_scale(create_text(note_symbols[index]), [1.45, 1.45]),
        FRAGMENT_COLOURS[index]
      ),
      note_positions[index]
    );
    sorting_floating_notes[index] = [
      note,
      note_positions[index][0],
      note_positions[index][1],
      index * 1.7
    ];
  }

  // A slim animated waveform fills the space above the equalizer panel.
  const wave_dot_count = 29;
  const wave_first_x = 170;
  const wave_gap = 20;

  for (let index = 0; index < wave_dot_count; index = index + 1) {
    const colour = FRAGMENT_COLOURS[index % FRAGMENT_COUNT];
    const dot = register_sorting_object(
      update_color(
        create_circle(index % 3 === 0 ? 3 : 2),
        [colour[0], colour[1], colour[2], 175]
      ),
      [wave_first_x + index * wave_gap, 590]
    );
    sorting_wave_dots[index] = [
      dot,
      wave_first_x + index * wave_gap,
      590,
      index * 0.48
    ];
  }

  // Side sparks add motion without covering the status or Submit button.
  for (let index = 0; index < 10; index = index + 1) {
    const on_left = index % 2 === 0;
    const spark_x = on_left
      ? 75 + math_random() * 175
      : 650 + math_random() * 175;
    const spark_y = 425 + math_random() * 145;
    const colour = FRAGMENT_COLOURS[(index + 3) % FRAGMENT_COUNT];
    const spark_size = 3 + index % 3;
    const spark = register_sorting_object(
      update_color(
        create_rectangle(spark_size, spark_size),
        [colour[0], colour[1], colour[2], 125]
      ),
      [spark_x, spark_y]
    );
    sorting_drifting_sparks[index] = [
      spark,
      spark_x,
      spark_y,
      index * 0.83,
      5 + index % 4
    ];
  }
}

function animate_sorting_background() {
  const time = get_game_time() / 1000;
  const activity = sorting_playing_fragment === undefined ? 0.45 : 1;
  const bar_count = array_length(sorting_equalizer_bars);
  const bar_width = 18;
  const bar_height = 64;
  const gap = 14;
  const bottom_y = 770;
  const total_width = bar_count * bar_width + (bar_count - 1) * gap;
  const first_x = (CANVAS_WIDTH - total_width) / 2 + bar_width / 2;

  for (let index = 0; index < bar_count; index = index + 1) {
    const wave = (1 + math_sin(time * 4 + index * 0.78)) / 2;
    const scale_y = 0.16 + activity * (0.25 + wave * 0.59);
    update_scale(sorting_equalizer_bars[index], [1, scale_y]);
    update_position(
      sorting_equalizer_bars[index],
      [
        first_x + index * (bar_width + gap),
        bottom_y - bar_height * scale_y / 2
      ]
    );
  }

  for (let index = 0; index < 4; index = index + 1) {
    const state = sorting_floating_notes[index];
    const phase = state[3];
    const scale = 1.35 + 0.18 * math_sin(time * 2 + phase);
    update_position(
      state[0],
      [
        state[1] + 9 * math_sin(time * 1.2 + phase),
        state[2] + 8 * math_sin(time * 1.7 + phase)
      ]
    );
    update_scale(state[0], [scale, scale]);
  }

  const spaceship_x = -90 + (time * 64) % 1080;
  const spaceship_y = 438 + 8 * math_sin(time * 1.35);

  for (let index = 0;
       index < array_length(sorting_spaceship_pixels);
       index = index + 1) {
    const state = sorting_spaceship_pixels[index];
    update_position(
      state[0],
      [spaceship_x + state[1], spaceship_y + state[2]]
    );
  }

  for (let index = 0;
       index < array_length(sorting_spaceship_trail);
       index = index + 1) {
    const flicker = 0.65
      + 0.35 * (1 + math_sin(time * 8 + index * 1.4)) / 2;
    update_position(
      sorting_spaceship_trail[index],
      [
        spaceship_x - 37 - index * 13,
        spaceship_y + 5 * math_sin(time * 3 + index)
      ]
    );
    update_scale(
      sorting_spaceship_trail[index],
      [flicker, flicker]
    );
  }

  for (let index = 0;
       index < array_length(sorting_pixel_planets);
       index = index + 1) {
    const planet = sorting_pixel_planets[index];
    const phase = planet[3];
    const planet_x = planet[1] + 4 * math_sin(time * 0.34 + phase);
    const planet_y = planet[2] + 6 * math_sin(time * 0.58 + phase);
    planet[4] = planet_x;
    planet[5] = planet_y;

    for (let pixel_index = 0;
         pixel_index < array_length(planet[0]);
         pixel_index = pixel_index + 1) {
      const pixel = planet[0][pixel_index];
      update_position(
        pixel[0],
        [planet_x + pixel[1], planet_y + pixel[2]]
      );
    }
  }

  for (let index = 0;
       index < array_length(sorting_planet_moons);
       index = index + 1) {
    const moon = sorting_planet_moons[index];
    const planet = moon[1];
    const orbit = time * 0.62 + moon[2];
    const pulse = 0.76
      + 0.24 * (1 + math_sin(time * 2 + moon[2])) / 2;
    update_position(
      moon[0],
      [
        planet[4] + moon[3] * math_sin(orbit),
        planet[5] + moon[4] * math_sin(orbit + 1.57)
      ]
    );
    update_scale(moon[0], [pulse, pulse]);
  }

  for (let index = 0;
       index < array_length(sorting_wave_dots);
       index = index + 1) {
    const state = sorting_wave_dots[index];
    const phase = state[3];
    const wave_height = 4 + activity * 5;
    const pulse = 0.72
      + 0.26 * (1 + math_sin(time * 3.1 + phase)) / 2;
    update_position(
      state[0],
      [
        state[1] + 2 * math_sin(time * 0.75 + phase),
        state[2] + wave_height * math_sin(time * 2.25 + phase)
      ]
    );
    update_scale(state[0], [pulse, pulse]);
  }

  for (let index = 0;
       index < array_length(sorting_drifting_sparks);
       index = index + 1) {
    const state = sorting_drifting_sparks[index];
    const phase = state[3];
    const distance = state[4];
    const pulse = 0.58
      + 0.42 * (1 + math_sin(time * 1.8 + phase)) / 2;
    update_position(
      state[0],
      [
        state[1] + distance * math_sin(time * 0.55 + phase),
        state[2] + 10 * math_sin(time * 0.72 + phase + 1.4)
      ]
    );
    update_scale(state[0], [pulse, pulse]);
  }
}

function sorting_two_digits(value) {
  return value < 10 ? "0" + stringify(value) : stringify(value);
}

function sorting_format_time(milliseconds) {
  const total_seconds = math_floor((milliseconds + 999) / 1000);
  const minutes = math_floor(total_seconds / 60);
  const seconds = total_seconds - minutes * 60;
  return sorting_two_digits(minutes) + ":" + sorting_two_digits(seconds);
}

function update_sorting_timer() {
  sorting_time_remaining_ms = SORT_TIMER_DURATION_MS
    - (get_game_time() - sorting_timer_started_at);

  if (sorting_time_remaining_ms <= 0) {
    sorting_time_remaining_ms = 0;
  }

  update_text(
    sorting_timer_text,
    "Time: " + sorting_format_time(sorting_time_remaining_ms)
  );

  if (sorting_time_remaining_ms === 0 && sorting_active) {
    sorting_finish("Time is up. Use Back to collect again.");
  }
}

function find_previewed_sorting_fragment() {
  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    const fragment = sorting_fragments[index];
    if (pointer_over_gameobject(fragment[SORT_BUTTON_INDEX])
        || pointer_over_gameobject(fragment[SORT_BUTTON_TEXT_INDEX])) {
      return fragment;
    }
  }

  for (let index = 0;
       index < array_length(sorting_fixed_fragments);
       index = index + 1) {
    const fragment = sorting_fixed_fragments[index];
    if (pointer_over_gameobject(fragment[SORT_BUTTON_INDEX])
        || pointer_over_gameobject(fragment[SORT_BUTTON_TEXT_INDEX])) {
      return fragment;
    }
  }

  return undefined;
}

function stop_sorting_audio() {
  if (sorting_playing_fragment !== undefined) {
    stop_audio(sorting_playing_fragment[SORT_AUDIO_INDEX]);
    update_text(
      sorting_playing_fragment[SORT_BUTTON_TEXT_INDEX],
      "Play"
    );
    update_color(
      sorting_playing_fragment[SORT_BUTTON_INDEX],
      sorting_playing_fragment[SORT_BUTTON_IDLE_COLOUR_INDEX]
    );
    sorting_playing_fragment = undefined;
  }
}

function toggle_sorting_audio(fragment) {
  if (sorting_playing_fragment === fragment) {
    stop_sorting_audio();
    return undefined;
  }

  stop_sorting_audio();
  play_audio(fragment[SORT_AUDIO_INDEX]);
  sorting_playing_fragment = fragment;
  update_text(fragment[SORT_BUTTON_TEXT_INDEX], "Stop");
  update_color(
    fragment[SORT_BUTTON_INDEX],
    SORT_PREVIEW_ACTIVE_COLOUR
  );
  return undefined;
}

function animate_sorting_fragments() {
  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    const fragment = sorting_fragments[index];
    const dragging = fragment === sorting_dragged_fragment;
    let target_position = sorting_slot_positions[
      fragment[SORT_SLOT_INDEX]
    ];
    let follow = SORT_SETTLE_FOLLOW;

    if (dragging) {
      const pointer = query_pointer_position();
      target_position = [
        pointer[0] + sorting_drag_pointer_offset[0],
        pointer[1] + sorting_drag_pointer_offset[1]
      ];
      follow = SORT_DRAG_FOLLOW;
    }

    const current_position = query_position(fragment[SORT_SHAPE_INDEX]);
    const delta_x = target_position[0] - current_position[0];
    const delta_y = target_position[1] - current_position[1];
    const close_to_target = delta_x * delta_x + delta_y * delta_y < 0.25;
    const next_position = close_to_target
      ? target_position
      : [
          current_position[0] + delta_x * follow,
          current_position[1] + delta_y * follow
        ];

    move_sorting_fragment(fragment, next_position);

    let scale = fragment[SORT_ANIMATION_SCALE_INDEX];
    let bounce = fragment[SORT_ANIMATION_BOUNCE_INDEX];

    if (dragging) {
      scale = scale + (SORT_DRAG_SCALE - scale) * 0.28;
    } else if (bounce !== 0) {
      scale = 1 + bounce;
      bounce = bounce * -0.55;
      fragment[SORT_ANIMATION_BOUNCE_INDEX] =
        bounce * bounce < 0.000025 ? 0 : bounce;
    } else {
      scale = scale + (1 - scale) * 0.24;
      if ((1 - scale) * (1 - scale) < 0.000025) {
        scale = 1;
      }
    }

    scale_sorting_fragment(fragment, scale);

    if (dragging) {
      bring_sorting_fragment_to_front(fragment);
    }
  }
}

function begin_sorting_drag() {
  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    const fragment = sorting_fragments[index];
    if (pointer_over_gameobject(fragment[SORT_SHAPE_INDEX])
        || pointer_over_gameobject(fragment[SORT_CENTRE_INDEX])
        || pointer_over_gameobject(fragment[SORT_LABEL_TEXT_INDEX])) {
      sorting_dragged_fragment = fragment;
      const pointer = query_pointer_position();
      const fragment_position = query_position(fragment[SORT_SHAPE_INDEX]);
      sorting_drag_pointer_offset = [
        fragment_position[0] - pointer[0],
        fragment_position[1] - pointer[1]
      ];
      fragment[SORT_ANIMATION_BOUNCE_INDEX] = 0;
      bring_sorting_fragment_to_front(fragment);
      return undefined;
    }
  }
}

function drag_sorting_fragment() {
  bring_sorting_fragment_to_front(sorting_dragged_fragment);
}

function release_sorting_fragment() {
  let overlapped = undefined;
  const pointer = query_pointer_position();
  const drop_position = [
    pointer[0] + sorting_drag_pointer_offset[0],
    pointer[1] + sorting_drag_pointer_offset[1]
  ];
  const overlap_distance = SORT_FRAGMENT_RADIUS * 2;

  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    const candidate = sorting_fragments[index];
    if (candidate !== sorting_dragged_fragment) {
      const candidate_position = sorting_slot_positions[
        candidate[SORT_SLOT_INDEX]
      ];
      const delta_x = drop_position[0] - candidate_position[0];
      const delta_y = drop_position[1] - candidate_position[1];

      if (delta_x * delta_x + delta_y * delta_y
          < overlap_distance * overlap_distance) {
        overlapped = candidate;
      }
    }
  }

  if (overlapped !== undefined) {
    const old_slot = sorting_dragged_fragment[SORT_SLOT_INDEX];
    sorting_dragged_fragment[SORT_SLOT_INDEX] = overlapped[SORT_SLOT_INDEX];
    overlapped[SORT_SLOT_INDEX] = old_slot;
    overlapped[SORT_ANIMATION_BOUNCE_INDEX] = 0.08;
  }

  sorting_dragged_fragment[SORT_ANIMATION_BOUNCE_INDEX] = 0.14;
  sorting_dragged_fragment = undefined;
}

function sorting_fragment_in_slot(slot_index) {
  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    if (sorting_fragments[index][SORT_SLOT_INDEX] === slot_index) {
      return sorting_fragments[index];
    }
  }

  return undefined;
}

function sorting_check_result() {
  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    if (sorting_fragments[index][SORT_SONG_ID_INDEX] !== TARGET_SONG_ID) {
      return "wrong_song";
    }
  }

  for (let target_index = 0;
       target_index < FRAGMENT_COUNT;
       target_index = target_index + 1) {
    let count = 0;
    for (let fragment_index = 0;
         fragment_index < FRAGMENT_COUNT;
         fragment_index = fragment_index + 1) {
      if (sorting_fragments[fragment_index][SORT_ID_INDEX]
          === TARGET_FRAGMENT_IDS[target_index]) {
        count = count + 1;
      }
    }
    if (count !== 1) {
      return "wrong_fragments";
    }
  }

  for (let slot_index = 0;
       slot_index < FRAGMENT_COUNT;
       slot_index = slot_index + 1) {
    const fragment = sorting_fragment_in_slot(slot_index);
    if (fragment === undefined
        || fragment[SORT_ID_INDEX] !== TARGET_FRAGMENT_IDS[slot_index]) {
      return "wrong_order";
    }
  }

  return "solved";
}

function build_complete_fragment_sequence() {
  const complete_sequence = [];

  for (let index = 0;
       index < array_length(FIXED_FRAGMENT_DATA);
       index = index + 1) {
    const fixed_item = FIXED_FRAGMENT_DATA[index];
    complete_sequence[fixed_item[FIXED_POSITION_INDEX]] =      fixed_item[FIXED_DATA_INDEX];
  }

  for (let slot_index = 0;
       slot_index < FRAGMENT_COUNT;
       slot_index = slot_index + 1) {
    const fragment = sorting_fragment_in_slot(slot_index);
    const sequence_position = SORTABLE_SEQUENCE_POSITIONS[slot_index];
    complete_sequence[sequence_position] = fragment[SORT_DATA_INDEX];
  }

  return complete_sequence;
}

function get_completed_fragment_sequence() {
  const sequence_copy = [];

  for (let index = 0;
       index < array_length(completed_fragment_sequence);
       index = index + 1) {
    sequence_copy[index] = completed_fragment_sequence[index];
  }

  return sequence_copy;
}

function sorting_show_status(message) {
  update_text(sorting_status_text, message);
  update_to_top(sorting_status_text);
}

function sorting_finish(message) {
  sorting_active = false;
  sorting_dragged_fragment = undefined;
  stop_sorting_audio();
  update_color(sorting_submit_button, [140, 140, 140, 255]);
  update_color(sorting_submit_text, [220, 220, 220, 255]);
  sorting_show_status(message);
}

function submit_sorting_solution() {
  const result = sorting_check_result();

  if (result === "solved") {
    completed_fragment_sequence = build_complete_fragment_sequence();
    sorting_finish("Puzzle Solved! The 10-part melody is complete.");
    enter_success_scene();
  } else if (result === "wrong_song") {
    sorting_show_status("Some fragments belong to another song. Use Back.");
  } else if (result === "wrong_fragments") {
    sorting_show_status("Fragments are missing or duplicated. Use Back.");
  } else {
    sorting_show_status("Correct fragments, but the order is wrong. Try again.");
  }
}

function return_to_collection_level() {
  stop_sorting_audio();
  hide_sorting_scene();
  current_scene = SCENE_COLLECTION;
  show_collection_scene();
  update_inventory_ui();
  update_text(
    collection_message_text,
    "Back on map."
  );
}

function enter_sorting_level(fragment_list) {
  if (!fragment_list_is_valid(fragment_list)) {
    update_text(
      collection_message_text,
      "Invalid data."
    );
    return false;
  }

  stop_collection_audio();
  stop_sorting_audio();
  hide_collection_scene();
  current_scene = SCENE_SORTING;
  show_sorting_scene();
  sorting_active = true;
  sorting_dragged_fragment = undefined;
  sorting_playing_fragment = undefined;
  completed_fragment_sequence = [];
  sorting_timer_started_at = get_game_time();
  sorting_time_remaining_ms = SORT_TIMER_DURATION_MS;
  configure_sorting_fragments(fragment_list);
  update_text(sorting_timer_text, "Time: 05:00");
  update_text(sorting_status_text, "");
  update_color(sorting_submit_button, SORT_CONTROL_COLOUR);
  update_color(sorting_submit_text, [255, 255, 255, 255]);

  return true;
}

function initialise_sorting_scene() {
  create_fragment_audio_cache();
  create_sorting_background();
  create_sorting_header();
  create_sorting_slots();
  create_sorting_fragments();
  create_fixed_sorting_fragments();
  create_sorting_controls();
  create_sorting_animation();
  hide_sorting_scene();
}

function update_sorting_scene(
  mouse_is_down,
  mouse_pressed,
  mouse_released
) {
  animate_sorting_background();
  animate_sorting_fragments();

  if (sorting_active) {
    update_sorting_timer();
  }

  if (mouse_pressed
      && (pointer_over_gameobject(sorting_back_button)
          || pointer_over_gameobject(sorting_back_text))) {
    return_to_collection_level();
    return undefined;
  }

  if (sorting_active && mouse_pressed) {
    const previewed = find_previewed_sorting_fragment();

    if (previewed !== undefined) {
      toggle_sorting_audio(previewed);
    } else if (pointer_over_gameobject(sorting_submit_button)
               || pointer_over_gameobject(sorting_submit_text)) {
      submit_sorting_solution();
    } else {
      begin_sorting_drag();
    }
  }

  if (sorting_active
      && sorting_dragged_fragment !== undefined
      && mouse_is_down) {
    drag_sorting_fragment();
  }

  if (sorting_active
      && sorting_dragged_fragment !== undefined
      && mouse_released) {
    drag_sorting_fragment();
    release_sorting_fragment();
  }
}

// ============================================================
// Instructions, success, prize and failure scenes
// ============================================================

let instruction_back_button = undefined;
let success_back_button = undefined;
let success_prize_button = undefined;
let failure_back_button = undefined;
let prize_back_button = undefined;
const prize_music_buttons = [];
let prize_playing_index = -1;

const PRIZE_BUTTON_OBJECT_INDEX = 0;
const PRIZE_BUTTON_AUDIO_INDEX = 1;
const PRIZE_BUTTON_NAME_INDEX = 2;

function create_scene_hotspot(register_function, position, width, height) {
  return register_function(
    update_color(create_rectangle(width, height), [255, 255, 255, 0]),
    position
  );
}

function update_scene_hotspot(button, hover_colour) {
  update_color(
    button,
    pointer_over_gameobject(button)
      ? hover_colour
      : [255, 255, 255, 0]
  );
}

function create_instruction_scene() {
  register_instruction_object(
    update_color(
      create_rectangle(CANVAS_WIDTH, CANVAS_HEIGHT),
      [8, 12, 35, 255]
    ),
    [CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2]
  );
  register_instruction_object(
    update_color(create_rectangle(820, 690), [20, 28, 62, 245]),
    [450, 390]
  );
  register_instruction_object(
    update_color(
      update_scale(create_text("HOW TO PLAY"), [2.15, 2.15]),
      [255, 255, 255, 255]
    ),
    [450, 62]
  );
  register_instruction_object(
    update_color(
      update_scale(
        create_text("LISTEN  >  EXPLORE  >  COLLECT  >  SORT"),
        [0.94, 0.94]
      ),
      [109, 217, 240, 255]
    ),
    [450, 112]
  );

  const guide_lines = [
    "GOAL",
    "Find the 8 correct melody fragments.",
    "Rebuild the complete song.",
    "MAP CONTROLS",
    "WASD: Move    F: Sprint    R: Preview",
    "E: Collect / Enter sorting    Q: Drop",
    "1-8: Select an inventory slot.",
    "SURVIVAL",
    "You have 3 lives. Monster attacks reduce HP.",
    "Two health packs respawn every 30 seconds.",
    "SORTING",
    "Listen, compare and drag the 8 records.",
    "Press Submit when the order is complete.",
    "DIFFICULTY",
    "Easy: 0    Hard: 2    Extreme: 4 decoys"
  ];

  for (let index = 0;
       index < array_length(guide_lines);
       index = index + 1) {
    const is_heading =
      index === 0
      || index === 3
      || index === 7
      || index === 10
      || index === 13;
    register_instruction_object(
      update_color(
        update_scale(
          create_text(guide_lines[index]),
          is_heading ? [1.24, 1.24] : [1, 1]
        ),
        [255, 255, 255, 255]
      ),
      [450, 158 + index * 34]
    );
  }

  instruction_back_button = create_scene_hotspot(
    register_instruction_object,
    [450, 735],
    190,
    52
  );
  register_instruction_object(
    update_color(
      update_scale(create_text("BACK"), [0.92, 0.92]),
      [255, 255, 255, 255]
    ),
    [450, 735]
  );
}

function create_success_scene() {
  register_success_object(
    update_color(
      create_rectangle(CANVAS_WIDTH, CANVAS_HEIGHT),
      [17, 41, 72, 255]
    ),
    [450, 400]
  );
  register_success_object(
    update_scale(
      create_sprite(SUCCESS_BACKGROUND_URL),
      [
        FULLSCREEN_BACKGROUND_SCALE_X,
        FULLSCREEN_BACKGROUND_SCALE_Y
      ]
    ),
    [450, 400]
  );
  success_back_button = create_scene_hotspot(
    register_success_object,
    [219, 663],
    236,
    112
  );
  success_prize_button = create_scene_hotspot(
    register_success_object,
    [680, 663],
    236,
    112
  );
}

function create_failure_scene() {
  register_failure_object(
    update_color(
      create_rectangle(CANVAS_WIDTH, CANVAS_HEIGHT),
      [42, 5, 27, 255]
    ),
    [450, 400]
  );
  register_failure_object(
    update_scale(
      create_sprite(FAILURE_BACKGROUND_URL),
      [
        FULLSCREEN_BACKGROUND_SCALE_X,
        FULLSCREEN_BACKGROUND_SCALE_Y
      ]
    ),
    [450, 400]
  );
  failure_back_button = create_scene_hotspot(
    register_failure_object,
    [450, 595],
    234,
    106
  );
}

function add_prize_music_button(name, filename, position, size) {
  const button = create_scene_hotspot(
    register_prize_object,
    position,
    size[0],
    size[1]
  );
  const audio = create_audio(AUDIO_BASE_URL + filename, 1);
  prize_music_buttons[array_length(prize_music_buttons)] = [
    button,
    audio,
    name
  ];
}

function create_prize_scene() {
  register_prize_object(
    update_color(
      create_rectangle(CANVAS_WIDTH, CANVAS_HEIGHT),
      [104, 143, 179, 255]
    ),
    [450, 400]
  );
  register_prize_object(
    update_scale(
      create_sprite(PRIZE_BACKGROUND_URL),
      [
        FULLSCREEN_BACKGROUND_SCALE_X,
        FULLSCREEN_BACKGROUND_SCALE_Y
      ]
    ),
    [450, 400]
  );

  // These areas are converted directly from the 2000 x 1778 artwork into
  // 900 x 800 canvas coordinates, so the hitboxes follow the drawn buttons.
  add_prize_music_button("VIOLIN", "violin.mp3", [194, 49], [172, 66]);
  add_prize_music_button("CELLO", "cello.mp3", [804, 109], [172, 66]);
  add_prize_music_button("PIANO", "piano.mp3", [567, 263], [172, 66]);
  add_prize_music_button("BELL", "bell.mp3", [721, 409], [172, 66]);
  add_prize_music_button(
    "TROMBONE",
    "trombone.mp3",
    [95, 495],
    [172, 66]
  );
  add_prize_music_button(
    "SIN",
    "Castle%20in%20the%20Sky.mp3",
    [343, 746],
    [172, 66]
  );

  prize_back_button = create_scene_hotspot(
    register_prize_object,
    [790, 647],
    172,
    66
  );
}

function stop_prize_audio() {
  if (prize_playing_index >= 0) {
    const entry = prize_music_buttons[prize_playing_index];
    stop_audio(entry[PRIZE_BUTTON_AUDIO_INDEX]);
    prize_playing_index = -1;
  }
}

function return_to_start_menu() {
  stop_collection_audio();
  stop_sorting_audio();
  stop_prize_audio();
  game_has_started = false;
  current_scene = SCENE_START;
  show_start_scene();
}

function enter_success_scene() {
  stop_sorting_audio();
  hide_sorting_scene();
  show_success_scene();
  current_scene = SCENE_SUCCESS;
}

function enter_failure_scene() {
  stop_collection_audio();
  hide_collection_scene();
  show_failure_scene();
  current_scene = SCENE_FAILURE;
}

function update_instruction_scene(mouse_pressed) {
  update_scene_hotspot(
    instruction_back_button,
    [255, 255, 255, 58]
  );

  if (mouse_pressed
      && pointer_over_gameobject(instruction_back_button)) {
    hide_instruction_scene();
    return_to_start_menu();
  }
}

function update_success_scene(mouse_pressed) {
  update_scene_hotspot(
    success_back_button,
    [255, 255, 255, 60]
  );
  update_scene_hotspot(
    success_prize_button,
    [255, 255, 255, 60]
  );

  if (mouse_pressed) {
    if (pointer_over_gameobject(success_back_button)) {
      hide_success_scene();
      return_to_start_menu();
    } else if (pointer_over_gameobject(success_prize_button)) {
      hide_success_scene();
      show_prize_scene();
      current_scene = SCENE_PRIZE;
    }
  }
}

function update_failure_scene(mouse_pressed) {
  update_scene_hotspot(
    failure_back_button,
    [255, 255, 255, 55]
  );

  if (mouse_pressed
      && pointer_over_gameobject(failure_back_button)) {
    hide_failure_scene();
    return_to_start_menu();
  }
}

function update_prize_scene(mouse_pressed) {
  update_scene_hotspot(
    prize_back_button,
    [255, 255, 255, 58]
  );

  for (let index = 0;
       index < array_length(prize_music_buttons);
       index = index + 1) {
    const entry = prize_music_buttons[index];
    const button = entry[PRIZE_BUTTON_OBJECT_INDEX];
    update_color(
      button,
      prize_playing_index === index
        ? [255, 224, 116, 82]
        : pointer_over_gameobject(button)
        ? [255, 255, 255, 58]
        : [255, 255, 255, 0]
    );
  }

  if (mouse_pressed) {
    if (pointer_over_gameobject(prize_back_button)) {
      stop_prize_audio();
      hide_prize_scene();
      show_success_scene();
      current_scene = SCENE_SUCCESS;
      return undefined;
    }

    for (let index = 0;
         index < array_length(prize_music_buttons);
         index = index + 1) {
      const entry = prize_music_buttons[index];
      if (pointer_over_gameobject(entry[PRIZE_BUTTON_OBJECT_INDEX])) {
        if (prize_playing_index === index) {
          stop_prize_audio();
        } else {
          stop_prize_audio();
          play_audio(entry[PRIZE_BUTTON_AUDIO_INDEX]);
          prize_playing_index = index;
        }
        return undefined;
      }
    }
  }
}

// ============================================================
// One shared update loop for every scene
// ============================================================

function update_game(game_state) {
  const e_is_down = input_letter_key_down("e", "E");
  const q_is_down = input_letter_key_down("q", "Q");
  const r_is_down = input_letter_key_down("r", "R");
  const e_pressed = e_is_down && !e_was_down;
  const q_pressed = q_is_down && !q_was_down;
  const r_pressed = r_is_down && !r_was_down;
  const mouse_is_down = input_left_mouse_down();
  const mouse_pressed = mouse_is_down && !mouse_was_down;
  const mouse_released = !mouse_is_down && mouse_was_down;

  if (current_scene === SCENE_START) {
    update_start_scene(mouse_pressed);
  } else if (current_scene === SCENE_LISTENING) {
    update_listening_scene(mouse_pressed);
  } else if (current_scene === SCENE_COLLECTION) {
    update_collection_scene(e_pressed, q_pressed, r_pressed);
  } else if (current_scene === SCENE_SORTING) {
    update_sorting_scene(mouse_is_down, mouse_pressed, mouse_released);
  } else if (current_scene === SCENE_SUCCESS) {
    update_success_scene(mouse_pressed);
  } else if (current_scene === SCENE_PRIZE) {
    update_prize_scene(mouse_pressed);
  } else if (current_scene === SCENE_FAILURE) {
    update_failure_scene(mouse_pressed);
  } else if (current_scene === SCENE_INSTRUCTIONS) {
    update_instruction_scene(mouse_pressed);
  }

  e_was_down = e_is_down;
  q_was_down = q_is_down;
  r_was_down = r_is_down;
  mouse_was_down = mouse_is_down;
}

// Arcade-2D requires every GameObject to be created before build_game().
// Prebuild both gameplay scenes, hide them, then let the menu reveal and
// configure the selected difficulty without creating objects in update_loop.
initialise_collection_scene();
hide_collection_scene();
initialise_sorting_scene();
create_listening_scene();
hide_listening_scene();
create_start_menu();
create_instruction_scene();
hide_instruction_scene();
create_success_scene();
hide_success_scene();
create_prize_scene();
hide_prize_scene();
create_failure_scene();
hide_failure_scene();
update_loop(update_game);

// build_game must be the final statement in Source Academy.
build_game();
