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
const SCENE_COLLECTION = "collection";
const SCENE_SORTING = "sorting";

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
const TARGET_FRAGMENT_LABELS = ["B", "C", "A", "D", "E", "F", "G", "H"];

const AUDIO_BASE_URL =
  "https://raw.githubusercontent.com/JimmyZheng6/"
  + "echo-fragments/sound/music_mp3/";

// Only these eight fragments enter collection and sorting.
// Their correct relative order is B, C, A, D, E, F, G, H.
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
  ]
];

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
  [231, 76, 60, 255],
  [243, 156, 18, 255],
  [241, 196, 15, 255],
  [46, 204, 113, 255],
  [52, 152, 219, 255],
  [63, 81, 181, 255],
  [155, 89, 182, 255],
  [233, 30, 99, 255]
];

let current_scene = SCENE_COLLECTION;
let e_was_down = false;
let q_was_down = false;
let r_was_down = false;
let mouse_was_down = false;

set_dimensions([CANVAS_WIDTH, CANVAS_HEIGHT]);

// ============================================================
// Shared scene visibility helpers
// ============================================================

const collection_objects = [];
const collection_saved_positions = [];
const sorting_objects = [];
const sorting_saved_positions = [];

function register_collection_object(gameobject, position) {
  update_position(gameobject, position);
  collection_objects[array_length(collection_objects)] = gameobject;
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
const MAX_STAMINA = 100;

const map = [];
let reachable_cells = [];
const world_fragments = [];
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

let player = undefined;
let goal_object = undefined;
let selected_slot = 0;
let hp = MAX_HP;
let stamina = MAX_STAMINA;
let current_speed = WALK_SPEED;
let hp_back = undefined;
let sprint_locked = false;
let hp_front = undefined;
let stamina_back = undefined;
let stamina_front = undefined;
let collection_action_text = undefined;
let collection_message_text = undefined;
let collection_progress_text = undefined;
let collection_playing_item = undefined;

function initialise_map() {
  for (let row = 0; row < ROWS; row = row + 1) {
    map[row] = [];
    for (let column = 0; column < COLS; column = column + 1) {
      map[row][column] = 0;
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
        map[row][column] = 1;
      } else {
        map[row][column] = math_random() < 0.17 ? 1 : 0;
      }
    }
  }

  for (let row = 1; row <= 3; row = row + 1) {
    for (let column = 1; column <= 3; column = column + 1) {
      map[row][column] = 0;
    }
  }

  for (let row = ROWS - 4; row <= ROWS - 2; row = row + 1) {
    for (let column = COLS - 4;
         column <= COLS - 2;
         column = column + 1) {
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
      map[START_ROW][column] = 0;
    }
    for (let row = START_ROW; row <= GOAL_ROW; row = row + 1) {
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

        // Offset shadow gives each wall tile depth.
        register_collection_object(
          update_color(
            create_rectangle(TILE - 2, TILE - 2),
            [48, 15, 72, 255]
          ),
          [position[0] + 2, position[1] + 2]
        );

        // Main purple-magenta wall face.
        register_collection_object(
          update_color(
            create_rectangle(TILE - 3, TILE - 3),
            wall_colour
          ),
          position
        );

        // Top and left highlights create a beveled pixel-art edge.
        register_collection_object(
          update_color(
            create_rectangle(TILE - 7, 3),
            wall_highlight
          ),
          [position[0] - 1, position[1] - 8]
        );
        register_collection_object(
          update_color(
            create_rectangle(3, TILE - 8),
            wall_highlight
          ),
          [position[0] - 8, position[1]]
        );
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

    const colour = FRAGMENT_COLOURS[index % 8];
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
      create_rectangle(key_width + 4, 28),
      [8, 11, 30, 255]
    ),
    [783, y + 2]
  );
  register_collection_object(
    update_color(
      create_rectangle(key_width, 24),
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
    update_color(create_rectangle(138, 720), [18, 22, 52, 245]),
    [825, 375]
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
    update_color(create_rectangle(116, 238), [25, 31, 70, 255]),
    [825, 235]
  );
  register_collection_object(
    update_color(create_rectangle(102, 2), [73, 84, 135, 255]),
    [825, 135]
  );
  register_collection_object(
    update_color(
      update_scale(create_text("MISSION"), [0.7, 0.7]),
      [255, 255, 255, 255]
    ),
    [825, 116]
  );
  register_collection_object(
    update_color(
      update_scale(create_text("♪"), [3.0, 3.0]),
      [220, 78, 239, 255]
    ),
    [825, 218]
  );
  collection_progress_text = register_collection_object(
    update_color(
      update_scale(create_text("0 / 8"), [1.22, 1.22]),
      [255, 255, 255, 255]
    ),
    [825, 305]
  );
  register_collection_object(
    update_color(
      update_scale(create_text("COLLECTED"), [0.58, 0.58]),
      [255, 255, 255, 255]
    ),
    [825, 334]
  );

  register_collection_object(
    update_color(
      update_scale(create_text("CONTROLS"), [0.78, 0.78]),
      [255, 255, 255, 255]
    ),
    [825, 410]
  );
  register_collection_object(
    update_color(create_rectangle(112, 2), [75, 84, 130, 255]),
    [825, 430]
  );

  create_collection_key_hint("WASD", "MOVE", 458, 44);
  create_collection_key_hint("F", "SPRINT", 496, 28);
  create_collection_key_hint("R", "PREVIEW", 534, 28);
  create_collection_key_hint("E", "COLLECT", 572, 28);
  create_collection_key_hint("Q", "DROP", 610, 28);
  create_collection_key_hint("1-8", "SELECT NOTE", 648, 28);
  
  

  register_collection_object(
    update_color(create_rectangle(126, 84), [29, 35, 72, 255]),
    [825, 720]
  );
  register_collection_object(
    update_color(
      update_scale(create_text("STATUS"), [0.74, 0.74]),
      [255, 255, 255, 255]
    ),
    [825, 690]
  );
  register_collection_object(
    update_color(create_rectangle(108, 1), [75, 84, 130, 255]),
    [825, 743]
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
    [825, 676]
  );

  collection_message_text = register_collection_object(
    update_color(
      update_scale(create_text("Find 8 notes."), [0.62, 0.62]),
      [255, 255, 255, 255]
    ),
    [825, 708]
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

  if (!input_key_down("f")) {
  sprint_locked = false;
      
  }
  if (input_key_down("f")
    && !sprint_locked
    && stamina > 0) {
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

  if (input_key_down("w")) {
    y = y - current_speed;
  }
  if (input_key_down("s")) {
    y = y + current_speed;
  }
  if (input_key_down("a")) {
    x = x - current_speed;
  }
  if (input_key_down("d")) {
    x = x + current_speed;
  }

  const next_position = [x, y];
  if (player_can_move(next_position)) {
    update_position(player, next_position);
  }

  return query_position(player);
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
            item[WORLD_ACTIVE_INDEX] = true;
            item[WORLD_ROW_INDEX] = item[WORLD_SPAWN_ROW_INDEX];
            item[WORLD_COL_INDEX] = item[WORLD_SPAWN_COL_INDEX];
            item[WORLD_SCALE_INDEX] = 1.8;
            update_scale(item[WORLD_OBJECT_INDEX], [1.8, 1.8]);
            update_position(
                item[WORLD_OBJECT_INDEX],
                [
                    item[WORLD_SPAWN_COL_INDEX] * TILE + TILE / 2,
                    item[WORLD_SPAWN_ROW_INDEX] * TILE + TILE / 2
                    ]
                    );
                    remove_from_inventory(selected_slot);
                    update_text(collection_message_text, "Dropped.");
                    return undefined;
            
        }
  }

  return undefined;
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
  const position = move_player();
  const nearby_item = find_nearby_world_fragment(position);
  select_inventory_slot();
  update_player_status(position);
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
  create_player_and_status();
  create_collection_ui();
  update_inventory_ui();
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

// sorting fragment item:
// [label, slot, shape, label_text, button, button_text,
//  audio, centre, fragment_id, song_id, fragment_data, idle_button_colour]
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

let sorting_fragments = [];
let sorting_fixed_fragments = [];
let sorting_slot_positions = [];
let sorting_sequence_positions = [];
let sorting_equalizer_bars = [];
let sorting_floating_notes = [];
let sorting_dragged_fragment = undefined;
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
    const cache_index = FRAGMENT_COUNT + index;
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
      [6, 8, 35, 255]
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
      [18, 25, 80 + math_floor(math_random() * 90), 80]
    );
  }

  const star_colours = [
    [255, 255, 255, 235],
    [226, 0, 255, 225],
    [99, 72, 255, 210]
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
      ? [255, 255, 255, 245]
      : index < 18
      ? [235, 0, 255, 225]
      : [83, 55, 210, 150];
    create_sort_pixel(
      88 + index * 5,
      690 - index * 1.15 + (math_random() - 0.5) * 12,
      index < 8 ? 8 : 4,
      trail_colour
    );
  }

  register_sorting_object(
    update_color(create_rectangle(860, 275), [21, 30, 58, 225]),
    [CANVAS_WIDTH / 2, 305]
  );
  register_sorting_object(
    update_color(create_rectangle(820, 155), [15, 23, 46, 225]),
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
        [246, 192, 67, 255]
      ),
      position
    );
    const centre = register_sorting_object(
      update_color(
        create_circle(SORT_FRAGMENT_RADIUS - 5),
        [30, 27, 60, 255]
      ),
      position
    );
    const label_text = register_sorting_object(
      update_color(
        update_scale(
          create_text("FIXED"),
          [0.72, 0.72]
        ),
        [255, 235, 120, 255]
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
        [181, 127, 35, 255]
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
      [181, 127, 35, 255]
    ];
  }
}

function move_sorting_fragment(fragment, position) {
  const button_position = [position[0], position[1] + SORT_PREVIEW_OFFSET];
  update_position(fragment[SORT_SHAPE_INDEX], position);
  update_position(fragment[SORT_CENTRE_INDEX], position);
  update_position(fragment[SORT_LABEL_TEXT_INDEX], position);
  update_position(fragment[SORT_BUTTON_INDEX], button_position);
  update_position(fragment[SORT_BUTTON_TEXT_INDEX], button_position);
}

function move_sorting_fragment_to_slot(fragment) {
  move_sorting_fragment(
    fragment,
    sorting_slot_positions[fragment[SORT_SLOT_INDEX]]
  );
}

function bring_sorting_fragment_to_front(fragment) {
  update_to_top(fragment[SORT_SHAPE_INDEX]);
  update_to_top(fragment[SORT_CENTRE_INDEX]);
  update_to_top(fragment[SORT_LABEL_TEXT_INDEX]);
  update_to_top(fragment[SORT_BUTTON_INDEX]);
  update_to_top(fragment[SORT_BUTTON_TEXT_INDEX]);
}

function create_sorting_fragments() {
  sorting_fragments = [];

  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    const disc = register_sorting_object(
      update_color(create_circle(SORT_FRAGMENT_RADIUS), FRAGMENT_COLOURS[index]),
      [0, 0]
    );
    const centre = register_sorting_object(
      update_color(create_circle(13), [17, 24, 45, 255]),
      [0, 0]
    );
    const label_text = register_sorting_object(
      update_color(
        update_scale(create_text(SORT_LABELS[index]), [1.35, 1.35]),
        [255, 255, 255, 255]
      ),
      [0, 0]
    );
    const button = register_sorting_object(
      update_color(
        create_rectangle(SORT_PREVIEW_WIDTH, SORT_PREVIEW_HEIGHT),
        [41, 128, 185, 255]
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
      [41, 128, 185, 255]
    ];

    sorting_fragments[index] = fragment;
    move_sorting_fragment_to_slot(fragment);
  }
}

function configure_sorting_fragments(fragment_list) {
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
    update_text(fragment[SORT_BUTTON_TEXT_INDEX], "Play");
    update_color(
      fragment[SORT_BUTTON_INDEX],
      fragment[SORT_BUTTON_IDLE_COLOUR_INDEX]
    );
    move_sorting_fragment_to_slot(fragment);
  }
}

function label_for_fragment_id(fragment_id) {
  for (let index = 0;
       index < FRAGMENT_COUNT;
       index = index + 1) {
    if (TARGET_FRAGMENT_IDS[index] === fragment_id) {
      return TARGET_FRAGMENT_LABELS[index];
    }
  }

  return "?";
}

function create_sorting_controls() {
  sorting_back_button = register_sorting_object(
    update_color(create_rectangle(120, 42), [76, 86, 106, 255]),
    [82, 62]
  );
  sorting_back_text = register_sorting_object(
    update_color(create_text("Back"), [255, 255, 255, 255]),
    [82, 62]
  );
  sorting_submit_button = register_sorting_object(
    update_color(create_rectangle(160, 48), [52, 73, 94, 255]),
    [CANVAS_WIDTH / 2, 530]
  );
  sorting_submit_text = register_sorting_object(
    update_color(create_text("Submit"), [255, 255, 255, 255]),
    [CANVAS_WIDTH / 2, 530]
  );
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
  update_color(fragment[SORT_BUTTON_INDEX], [192, 57, 43, 255]);
  return undefined;
}

function begin_sorting_drag() {
  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    const fragment = sorting_fragments[index];
    if (pointer_over_gameobject(fragment[SORT_SHAPE_INDEX])
        || pointer_over_gameobject(fragment[SORT_CENTRE_INDEX])
        || pointer_over_gameobject(fragment[SORT_LABEL_TEXT_INDEX])) {
      sorting_dragged_fragment = fragment;
      bring_sorting_fragment_to_front(fragment);
      return undefined;
    }
  }
}

function drag_sorting_fragment() {
  move_sorting_fragment(
    sorting_dragged_fragment,
    query_pointer_position()
  );
  bring_sorting_fragment_to_front(sorting_dragged_fragment);
}

function release_sorting_fragment() {
  let overlapped = undefined;

  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    const candidate = sorting_fragments[index];
    if (candidate !== sorting_dragged_fragment
        && gameobjects_overlap(
          sorting_dragged_fragment[SORT_SHAPE_INDEX],
          candidate[SORT_SHAPE_INDEX]
        )) {
      overlapped = candidate;
    }
  }

  if (overlapped === undefined) {
    move_sorting_fragment_to_slot(sorting_dragged_fragment);
  } else {
    const old_slot = sorting_dragged_fragment[SORT_SLOT_INDEX];
    sorting_dragged_fragment[SORT_SLOT_INDEX] = overlapped[SORT_SLOT_INDEX];
    overlapped[SORT_SLOT_INDEX] = old_slot;
    move_sorting_fragment_to_slot(sorting_dragged_fragment);
    move_sorting_fragment_to_slot(overlapped);
  }

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
    complete_sequence[fixed_item[FIXED_POSITION_INDEX]] =
      fixed_item[FIXED_DATA_INDEX];
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
  update_color(sorting_submit_button, [52, 73, 94, 255]);
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
// One shared update loop for every scene
// ============================================================

function update_game(game_state) {
  const e_is_down = input_key_down("e");
  const q_is_down = input_key_down("q");
  const r_is_down = input_key_down("r");
  const e_pressed = e_is_down && !e_was_down;
  const q_pressed = q_is_down && !q_was_down;
  const r_pressed = r_is_down && !r_was_down;
  const mouse_is_down = input_left_mouse_down();
  const mouse_pressed = mouse_is_down && !mouse_was_down;
  const mouse_released = !mouse_is_down && mouse_was_down;

  if (current_scene === SCENE_COLLECTION) {
    update_collection_scene(e_pressed, q_pressed, r_pressed);
  } else if (current_scene === SCENE_SORTING) {
    update_sorting_scene(mouse_is_down, mouse_pressed, mouse_released);
  }

  e_was_down = e_is_down;
  q_was_down = q_is_down;
  r_was_down = r_is_down;
  mouse_was_down = mouse_is_down;
}

initialise_collection_scene();
initialise_sorting_scene();
update_loop(update_game);

// build_game must be the final statement in Source Academy.
build_game();
