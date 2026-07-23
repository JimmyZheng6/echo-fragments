import {
  build_game,
  create_audio,
  create_circle,
  create_rectangle,
  create_text,
  gameobjects_overlap,
  get_game_time,
  input_left_mouse_down,
  play_audio,
  pointer_over_gameobject,
  query_pointer_position,
  set_dimensions,
  stop_audio,
  update_color,
  update_loop,
  update_position,
  update_scale,
  update_text,
  update_to_top
} from "arcade_2d";

// Canvas and layout constants.
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 650;
const FRAGMENT_RADIUS = 38;
const FRAGMENT_GAP = 22;
const FRAGMENT_Y = 275;
const FRAGMENT_COUNT = 8;
const TIMER_DURATION_MS = 5 * 60 * 1000;
const BUTTON_WIDTH = 160;
const BUTTON_HEIGHT = 48;
const BACK_BUTTON_WIDTH = 120;
const BACK_BUTTON_HEIGHT = 42;
const PREVIEW_BUTTON_WIDTH = 64;
const PREVIEW_BUTTON_HEIGHT = 30;
const PREVIEW_BUTTON_Y_OFFSET = FRAGMENT_RADIUS
  + PREVIEW_BUTTON_HEIGHT / 2 + 12;
const EQUALIZER_BAR_COUNT = 15;
const EQUALIZER_BAR_WIDTH = 18;
const EQUALIZER_BAR_HEIGHT = 64;
const EQUALIZER_GAP = 14;
const EQUALIZER_BOTTOM_Y = 620;

// Fragment array indexes.
const LABEL_INDEX = 0;
const SLOT_INDEX = 1;
const SHAPE_INDEX = 2;
const LABEL_TEXT_INDEX = 3;
const PREVIEW_BUTTON_INDEX = 4;
const PREVIEW_BUTTON_TEXT_INDEX = 5;
const AUDIO_INDEX = 6;
const DISC_CENTER_INDEX = 7;
const FRAGMENT_ID_INDEX = 8;
const FRAGMENT_SONG_ID_INDEX = 9;

// Incoming fragment array indexes.
// Each item received from the previous level must be:
// [fragment_id, song_id, audio_url]
const INPUT_ID_INDEX = 0;
const INPUT_SONG_ID_INDEX = 1;
const INPUT_AUDIO_URL_INDEX = 2;

// Colours use the documented [red, green, blue, alpha] format.
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
const TITLE_TEXT = [255, 255, 255, 255];
const NORMAL_TEXT = [220, 220, 220, 255];
const LIGHT_TEXT = [255, 255, 255, 255];
const BACKGROUND_COLOUR = [10, 15, 35, 255];
const PANEL_COLOUR = [21, 30, 58, 255];
const ANIMATION_PANEL_COLOUR = [15, 23, 46, 255];
const DISC_CENTER_COLOUR = [17, 24, 45, 255];
const BUTTON_COLOUR = [52, 73, 94, 255];
const BACK_BUTTON_COLOUR = [76, 86, 106, 255];
const PREVIEW_BUTTON_COLOUR = [41, 128, 185, 255];
const STOP_BUTTON_COLOUR = [192, 57, 43, 255];
const DISABLED_BUTTON_COLOUR = [140, 140, 140, 255];

const fragment_labels = ["A", "B", "C", "D", "E", "F", "G", "H"];

// Trusted configuration owned by this level, not by the previous level.
const TARGET_SONG_ID = "song_01";
const TARGET_FRAGMENT_IDS = [
  "song_01_part_1",
  "song_01_part_2",
  "song_01_part_3",
  "song_01_part_4",
  "song_01_part_5",
  "song_01_part_6",
  "song_01_part_7",
  "song_01_part_8"
];

// Result values returned to the level controller.
const RESULT_SOLVED = "solved";
const RESULT_WRONG_SONG = "wrong_song";
const RESULT_WRONG_FRAGMENTS = "wrong_fragments";
const RESULT_WRONG_ORDER = "wrong_order";
const RESULT_INVALID_INPUT = "invalid_input";
const RESULT_TIME_UP = "time_up";

// Stand-alone demonstration data. In the full game, the previous level passes
// its own list to start_melody_sorting_level instead.
const SAMPLE_AUDIO_URL =
  "https://labs.phaser.io/assets/audio/tech/bass.mp3";
const DEMO_FRAGMENT_LIST = [
  ["song_01_part_1", "song_01", SAMPLE_AUDIO_URL],
  ["song_01_part_2", "song_01", SAMPLE_AUDIO_URL],
  ["song_01_part_3", "song_01", SAMPLE_AUDIO_URL],
  ["song_01_part_4", "song_01", SAMPLE_AUDIO_URL],
  ["song_01_part_5", "song_01", SAMPLE_AUDIO_URL],
  ["song_01_part_6", "song_01", SAMPLE_AUDIO_URL],
  ["song_01_part_7", "song_01", SAMPLE_AUDIO_URL],
  ["song_01_part_8", "song_01", SAMPLE_AUDIO_URL]
];

// This fixed starting layout makes the player solve the puzzle every time.
// Each entry gives the slot occupied by the matching label above.
const initial_slot_indexes = [5, 0, 7, 2, 6, 1, 4, 3];
const slot_positions = [];
const fragments = [];
const equalizer_bars = [];
const floating_notes = [];

let received_fragment_list = [];
let result_callback = undefined;
let back_callback = undefined;
let dragged_fragment = undefined;
let playing_fragment = undefined;
let mouse_was_down = false;
let puzzle_is_active = true;
let timer_has_started = false;
let timer_started_at = 0;
let time_remaining_ms = TIMER_DURATION_MS;
let submit_button = undefined;
let submit_button_text = undefined;
let back_button = undefined;
let back_button_text = undefined;
let back_has_been_requested = false;

set_dimensions([CANVAS_WIDTH, CANVAS_HEIGHT]);

// Objects are painted in creation order, so the background and panels come first.
update_color(
  update_position(
    create_rectangle(CANVAS_WIDTH, CANVAS_HEIGHT),
    [CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2]
  ),
  BACKGROUND_COLOUR
);
update_color(
  update_position(create_circle(180), [CANVAS_WIDTH / 2, -65]),
  [54, 82, 149, 90]
);
update_color(
  update_position(create_rectangle(860, 260), [CANVAS_WIDTH / 2, 290]),
  PANEL_COLOUR
);
update_color(
  update_position(create_rectangle(820, 120), [CANVAS_WIDTH / 2, 575]),
  ANIMATION_PANEL_COLOUR
);

const title_text = update_scale(
  update_position(create_text("Arrange the Melody"), [CANVAS_WIDTH / 2, 48]),
  [2.25, 2.25]
);
const timer_text = update_position(
  create_text("Time: 05:00"),
  [CANVAS_WIDTH / 2, 105]
);
const instruction_text = update_position(
  create_text("Drag the records to swap them. Click Stop to pause a preview."),
  [CANVAS_WIDTH / 2, 145]
);
const status_text = update_position(
  create_text(""),
  [CANVAS_WIDTH / 2, 435]
);

update_color(title_text, TITLE_TEXT);
update_color(timer_text, NORMAL_TEXT);
update_color(instruction_text, NORMAL_TEXT);
update_color(status_text, TITLE_TEXT);

function create_slot_positions() {
  const fragment_diameter = FRAGMENT_RADIUS * 2;
  const total_width = FRAGMENT_COUNT * fragment_diameter
    + (FRAGMENT_COUNT - 1) * FRAGMENT_GAP;
  const first_slot_x = (CANVAS_WIDTH - total_width) / 2
    + FRAGMENT_RADIUS;

  for (let slot_index = 0;
       slot_index < FRAGMENT_COUNT;
       slot_index = slot_index + 1) {
    slot_positions[slot_index] = [
      first_slot_x + slot_index * (fragment_diameter + FRAGMENT_GAP),
      FRAGMENT_Y
    ];
  }
}

function create_fragments() {
  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    const input_fragment = received_fragment_list[index];
    const fragment_id = input_fragment[INPUT_ID_INDEX];
    const song_id = input_fragment[INPUT_SONG_ID_INDEX];
    const audio_url = input_fragment[INPUT_AUDIO_URL_INDEX];
    const disc = update_color(
      create_circle(FRAGMENT_RADIUS),
      FRAGMENT_COLOURS[index]
    );
    const disc_center = update_color(
      create_circle(13),
      DISC_CENTER_COLOUR
    );
    const label_text = update_color(
      create_text(fragment_labels[index]),
      LIGHT_TEXT
    );
    const preview_button = update_color(
      create_rectangle(PREVIEW_BUTTON_WIDTH, PREVIEW_BUTTON_HEIGHT),
      PREVIEW_BUTTON_COLOUR
    );
    const preview_button_text = update_color(
      create_text("Play"),
      LIGHT_TEXT
    );

    // A fragment owns its record, label, preview control, audio, and centre dot.
    const fragment = [
      fragment_labels[index],
      initial_slot_indexes[index],
      disc,
      label_text,
      preview_button,
      preview_button_text,
      create_audio(audio_url, 1),
      disc_center,
      fragment_id,
      song_id
    ];

    update_scale(fragment[LABEL_TEXT_INDEX], [1.5, 1.5]);
    update_scale(fragment[PREVIEW_BUTTON_TEXT_INDEX], [0.8, 0.8]);
    fragments[index] = fragment;
    move_fragment_to_slot(fragment);
  }
}

function move_fragment_to_position(fragment, fragment_position) {
  const preview_button_position = [
    fragment_position[0],
    fragment_position[1] + PREVIEW_BUTTON_Y_OFFSET
  ];

  update_position(fragment[SHAPE_INDEX], fragment_position);
  update_position(fragment[DISC_CENTER_INDEX], fragment_position);
  update_position(fragment[LABEL_TEXT_INDEX], fragment_position);
  update_position(fragment[PREVIEW_BUTTON_INDEX], preview_button_position);
  update_position(fragment[PREVIEW_BUTTON_TEXT_INDEX], preview_button_position);
}

function move_fragment_to_slot(fragment) {
  move_fragment_to_position(
    fragment,
    slot_positions[fragment[SLOT_INDEX]]
  );
}

function move_fragment_to_front(fragment) {
  update_to_top(fragment[SHAPE_INDEX]);
  update_to_top(fragment[DISC_CENTER_INDEX]);
  update_to_top(fragment[LABEL_TEXT_INDEX]);
  update_to_top(fragment[PREVIEW_BUTTON_INDEX]);
  update_to_top(fragment[PREVIEW_BUTTON_TEXT_INDEX]);
}

function snap_fragments() {
  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    move_fragment_to_slot(fragments[index]);
  }
}

function find_previewed_fragment() {
  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    const fragment = fragments[index];
    if (pointer_over_gameobject(fragment[PREVIEW_BUTTON_INDEX])
        || pointer_over_gameobject(fragment[PREVIEW_BUTTON_TEXT_INDEX])) {
      return fragment;
    }
  }

  return undefined;
}

function stop_fragment_audio() {
  if (playing_fragment === undefined) {
    return undefined;
  }

  stop_audio(playing_fragment[AUDIO_INDEX]);
  update_text(playing_fragment[PREVIEW_BUTTON_TEXT_INDEX], "Play");
  update_color(
    playing_fragment[PREVIEW_BUTTON_INDEX],
    PREVIEW_BUTTON_COLOUR
  );
  playing_fragment = undefined;

  return undefined;
}

function play_fragment_audio(fragment) {
  // Clicking the same playing fragment a second time stops it.
  if (playing_fragment === fragment) {
    stop_fragment_audio();
    return undefined;
  }

  // Only one preview may play at a time.
  stop_fragment_audio();
  play_audio(fragment[AUDIO_INDEX]);
  playing_fragment = fragment;
  update_text(fragment[PREVIEW_BUTTON_TEXT_INDEX], "Stop");
  update_color(fragment[PREVIEW_BUTTON_INDEX], STOP_BUTTON_COLOUR);

  return undefined;
}

function start_drag_if_possible() {
  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    const fragment = fragments[index];
    if (pointer_over_gameobject(fragment[SHAPE_INDEX])
        || pointer_over_gameobject(fragment[DISC_CENTER_INDEX])
        || pointer_over_gameobject(fragment[LABEL_TEXT_INDEX])) {
      dragged_fragment = fragment;
      move_fragment_to_front(fragment);
      return undefined;
    }
  }

  return undefined;
}

function drag_fragment() {
  const pointer_position = query_pointer_position();
  move_fragment_to_position(dragged_fragment, pointer_position);
  move_fragment_to_front(dragged_fragment);
}

function find_overlapped_fragment() {
  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    const candidate_fragment = fragments[index];
    if (candidate_fragment !== dragged_fragment
        && gameobjects_overlap(
          dragged_fragment[SHAPE_INDEX],
          candidate_fragment[SHAPE_INDEX]
        )) {
      return candidate_fragment;
    }
  }

  return undefined;
}

function swap_fragments(first_fragment, second_fragment) {
  const first_slot = first_fragment[SLOT_INDEX];
  first_fragment[SLOT_INDEX] = second_fragment[SLOT_INDEX];
  second_fragment[SLOT_INDEX] = first_slot;
  snap_fragments();
}

function release_drag() {
  const overlapped_fragment = find_overlapped_fragment();

  if (overlapped_fragment === undefined) {
    move_fragment_to_slot(dragged_fragment);
  } else {
    swap_fragments(dragged_fragment, overlapped_fragment);
  }

  dragged_fragment = undefined;
}

function start_timer() {
  timer_started_at = get_game_time();
  time_remaining_ms = TIMER_DURATION_MS;
  timer_has_started = true;
  draw_timer();
}

function two_digits(value) {
  return value < 10 ? "0" + stringify(value) : stringify(value);
}

function format_time(milliseconds_remaining) {
  // Rounding up keeps 05:00 visible throughout the first second.
  const total_seconds = math_floor((milliseconds_remaining + 999) / 1000);
  const minutes = math_floor(total_seconds / 60);
  const seconds = total_seconds - minutes * 60;
  return two_digits(minutes) + ":" + two_digits(seconds);
}

function draw_timer() {
  update_text(timer_text, "Time: " + format_time(time_remaining_ms));
}

function update_timer() {
  const elapsed_time = get_game_time() - timer_started_at;
  time_remaining_ms = TIMER_DURATION_MS - elapsed_time;

  if (time_remaining_ms <= 0) {
    time_remaining_ms = 0;
  }

  draw_timer();

  if (time_remaining_ms === 0) {
    finish_game("Time is up.", RESULT_TIME_UP);
  }
}

function create_ambient_animation() {
  const total_width = EQUALIZER_BAR_COUNT * EQUALIZER_BAR_WIDTH
    + (EQUALIZER_BAR_COUNT - 1) * EQUALIZER_GAP;
  const first_x = (CANVAS_WIDTH - total_width) / 2
    + EQUALIZER_BAR_WIDTH / 2;

  for (let index = 0; index < EQUALIZER_BAR_COUNT; index = index + 1) {
    const starting_scale = 0.22;
    const bar = update_color(
      update_position(
        update_scale(
          create_rectangle(EQUALIZER_BAR_WIDTH, EQUALIZER_BAR_HEIGHT),
          [1, starting_scale]
        ),
        [
          first_x + index * (EQUALIZER_BAR_WIDTH + EQUALIZER_GAP),
          EQUALIZER_BOTTOM_Y - EQUALIZER_BAR_HEIGHT * starting_scale / 2
        ]
      ),
      FRAGMENT_COLOURS[index % FRAGMENT_COUNT]
    );
    equalizer_bars[index] = bar;
  }

  const note_symbols = ["♪", "♫", "♪", "♬"];
  const note_positions = [
    [105, 550],
    [795, 548],
    [145, 610],
    [755, 610]
  ];

  for (let index = 0; index < 4; index = index + 1) {
    const note = update_color(
      update_scale(
        update_position(create_text(note_symbols[index]), note_positions[index]),
        [1.5, 1.5]
      ),
      FRAGMENT_COLOURS[index]
    );
    floating_notes[index] = [
      note,
      note_positions[index][0],
      note_positions[index][1],
      index * 1.7
    ];
  }
}

function animate_ambient_background() {
  const animation_time = get_game_time() / 1000;
  const activity = playing_fragment === undefined ? 0.45 : 1;
  const total_width = EQUALIZER_BAR_COUNT * EQUALIZER_BAR_WIDTH
    + (EQUALIZER_BAR_COUNT - 1) * EQUALIZER_GAP;
  const first_x = (CANVAS_WIDTH - total_width) / 2
    + EQUALIZER_BAR_WIDTH / 2;

  for (let index = 0; index < EQUALIZER_BAR_COUNT; index = index + 1) {
    const wave = (1 + math_sin(animation_time * 4 + index * 0.78)) / 2;
    const scale_y = 0.16 + activity * (0.25 + wave * 0.59);
    const bar_x = first_x
      + index * (EQUALIZER_BAR_WIDTH + EQUALIZER_GAP);
    const bar_y = EQUALIZER_BOTTOM_Y
      - EQUALIZER_BAR_HEIGHT * scale_y / 2;

    update_scale(equalizer_bars[index], [1, scale_y]);
    update_position(equalizer_bars[index], [bar_x, bar_y]);
  }

  for (let index = 0; index < 4; index = index + 1) {
    const note_state = floating_notes[index];
    const phase = note_state[3];
    const note_x = note_state[1]
      + 9 * math_sin(animation_time * 1.2 + phase);
    const note_y = note_state[2]
      + 8 * math_sin(animation_time * 1.7 + phase);
    const note_scale = 1.35
      + 0.18 * math_sin(animation_time * 2 + phase);

    update_position(note_state[0], [note_x, note_y]);
    update_scale(note_state[0], [note_scale, note_scale]);
  }
}

function create_back_button() {
  back_button = update_color(
    update_position(
      create_rectangle(BACK_BUTTON_WIDTH, BACK_BUTTON_HEIGHT),
      [82, 62]
    ),
    BACK_BUTTON_COLOUR
  );
  back_button_text = update_color(
    update_position(create_text("Back"), [82, 62]),
    LIGHT_TEXT
  );

  return undefined;
}

function create_submit_button() {
  submit_button = update_color(
    update_position(
      create_rectangle(BUTTON_WIDTH, BUTTON_HEIGHT),
      [CANVAS_WIDTH / 2, 480]
    ),
    BUTTON_COLOUR
  );
  submit_button_text = update_color(
    update_position(create_text("Submit"), [CANVAS_WIDTH / 2, 480]),
    LIGHT_TEXT
  );

  return undefined;
}

function validate_input_fragment_list(fragment_list) {
  if (fragment_list === undefined
      || array_length(fragment_list) !== FRAGMENT_COUNT) {
    return false;
  }

  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    const input_fragment = fragment_list[index];

    if (input_fragment === undefined
        || array_length(input_fragment) !== 3
        || input_fragment[INPUT_ID_INDEX] === undefined
        || input_fragment[INPUT_SONG_ID_INDEX] === undefined
        || input_fragment[INPUT_AUDIO_URL_INDEX] === undefined) {
      return false;
    }
  }

  return true;
}

function find_fragment_in_slot(slot_index) {
  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    if (fragments[index][SLOT_INDEX] === slot_index) {
      return fragments[index];
    }
  }

  return undefined;
}

function fragments_belong_to_target_song() {
  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    if (fragments[index][FRAGMENT_SONG_ID_INDEX] !== TARGET_SONG_ID) {
      return false;
    }
  }

  return true;
}

function has_exact_target_fragments() {
  for (let target_index = 0;
       target_index < FRAGMENT_COUNT;
       target_index = target_index + 1) {
    const target_id = TARGET_FRAGMENT_IDS[target_index];
    let matching_count = 0;

    for (let fragment_index = 0;
         fragment_index < FRAGMENT_COUNT;
         fragment_index = fragment_index + 1) {
      if (fragments[fragment_index][FRAGMENT_ID_INDEX] === target_id) {
        matching_count = matching_count + 1;
      }
    }

    // Every required fragment must appear exactly once.
    if (matching_count !== 1) {
      return false;
    }
  }

  return true;
}

function fragments_are_in_correct_order() {
  for (let slot_index = 0;
       slot_index < FRAGMENT_COUNT;
       slot_index = slot_index + 1) {
    const fragment = find_fragment_in_slot(slot_index);

    if (fragment === undefined
        || fragment[FRAGMENT_ID_INDEX]
           !== TARGET_FRAGMENT_IDS[slot_index]) {
      return false;
    }
  }

  return true;
}

function check_solution() {
  if (!fragments_belong_to_target_song()) {
    return RESULT_WRONG_SONG;
  }

  if (!has_exact_target_fragments()) {
    return RESULT_WRONG_FRAGMENTS;
  }

  if (!fragments_are_in_correct_order()) {
    return RESULT_WRONG_ORDER;
  }

  return RESULT_SOLVED;
}

function show_status(message) {
  update_text(status_text, message);
  update_to_top(status_text);
}

function notify_result(result) {
  if (result_callback !== undefined) {
    result_callback(result);
  }
}

function pointer_is_over_back_button() {
  return pointer_over_gameobject(back_button)
    || pointer_over_gameobject(back_button_text);
}

function handle_back() {
  if (back_has_been_requested) {
    return undefined;
  }

  if (back_callback === undefined) {
    show_status("Back navigation needs an on_back callback.");
    return undefined;
  }

  back_has_been_requested = true;
  puzzle_is_active = false;
  dragged_fragment = undefined;
  stop_fragment_audio();
  update_color(submit_button, DISABLED_BUTTON_COLOUR);
  update_color(submit_button_text, [220, 220, 220, 255]);
  show_status("Returning to the collection level...");

  // Return the same fragment data so the previous level can restore its state.
  back_callback(received_fragment_list);

  return undefined;
}

function finish_game(message, result) {
  if (!puzzle_is_active) {
    return undefined;
  }

  puzzle_is_active = false;
  dragged_fragment = undefined;
  stop_fragment_audio();
  snap_fragments();
  update_color(submit_button, DISABLED_BUTTON_COLOUR);
  update_color(submit_button_text, [220, 220, 220, 255]);
  show_status(message);
  notify_result(result);

  return undefined;
}

function handle_submit() {
  if (!puzzle_is_active) {
    return undefined;
  }

  const result = check_solution();

  if (result === RESULT_SOLVED) {
    finish_game("Puzzle Solved!", RESULT_SOLVED);
  } else if (result === RESULT_WRONG_SONG) {
    show_status("Wrong-song fragments detected. Return and choose again.");
    notify_result(RESULT_WRONG_SONG);
  } else if (result === RESULT_WRONG_FRAGMENTS) {
    show_status("Fragments are missing, unexpected, or duplicated.");
    notify_result(RESULT_WRONG_FRAGMENTS);
  } else {
    show_status("Correct fragments, but the order is wrong. Try again.");
    notify_result(RESULT_WRONG_ORDER);
  }

  return undefined;
}

function update() {
  const mouse_is_down = input_left_mouse_down();
  const mouse_pressed_this_frame = mouse_is_down && !mouse_was_down;
  const mouse_released_this_frame = !mouse_is_down && mouse_was_down;

  if (puzzle_is_active && !timer_has_started) {
    start_timer();
  }

  animate_ambient_background();

  if (puzzle_is_active) {
    update_timer();
  }

  if (mouse_pressed_this_frame && pointer_is_over_back_button()) {
    handle_back();
  } else if (puzzle_is_active && mouse_pressed_this_frame) {
    const previewed_fragment = find_previewed_fragment();

    if (previewed_fragment !== undefined) {
      // Preview clicks never change slots or begin a drag.
      play_fragment_audio(previewed_fragment);
    } else if (pointer_over_gameobject(submit_button)
               || pointer_over_gameobject(submit_button_text)) {
      handle_submit();
    } else {
      start_drag_if_possible();
    }
  }

  if (puzzle_is_active
      && dragged_fragment !== undefined
      && mouse_is_down) {
    drag_fragment();
  }

  if (puzzle_is_active
      && dragged_fragment !== undefined
      && mouse_released_this_frame) {
    // Use the release position as the final drag position before testing overlap.
    drag_fragment();
    release_drag();
  }

  mouse_was_down = mouse_is_down;
}

// Public level interface. The previous level passes its selected fragment array,
// a result callback, and a callback that restores the previous interface.
function start_melody_sorting_level(fragment_list, on_result, on_back) {
  received_fragment_list = fragment_list;
  result_callback = on_result;
  back_callback = on_back;

  create_slot_positions();

  const input_is_valid = validate_input_fragment_list(fragment_list);

  if (input_is_valid) {
    create_fragments();
  } else {
    puzzle_is_active = false;
    timer_has_started = true;
    update_text(timer_text, "Time: --:--");
  }

  create_submit_button();
  create_back_button();
  create_ambient_animation();

  if (!input_is_valid) {
    update_color(submit_button, DISABLED_BUTTON_COLOUR);
    update_color(submit_button_text, [220, 220, 220, 255]);
    show_status("Invalid fragment list received from the previous level.");
    notify_result(RESULT_INVALID_INPUT);
  }

  return undefined;
}

// Stand-alone demo. In the complete multi-level game, replace only this call
// with start_melody_sorting_level(
//   selected_fragments,
//   handle_sorting_result,
//   return_to_collection_level
// ).
start_melody_sorting_level(DEMO_FRAGMENT_LIST, undefined, undefined);
update_loop(update);

// Source Academy requires build_game to be the final statement.
build_game();
