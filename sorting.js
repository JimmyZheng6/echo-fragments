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
const FRAGMENT_RADIUS = 54;
const FRAGMENT_GAP = 40;
const FRAGMENT_Y = 275;
const FRAGMENT_COUNT = 5;
const TIMER_DURATION_MS = 5 * 60 * 1000;
const BUTTON_WIDTH = 160;
const BUTTON_HEIGHT = 48;
const PREVIEW_BUTTON_WIDTH = 80;
const PREVIEW_BUTTON_HEIGHT = 32;
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

// Colours use the documented [red, green, blue, alpha] format.
const FRAGMENT_COLOURS = [
  [231, 76, 60, 255],
  [243, 156, 18, 255],
  [241, 196, 15, 255],
  [46, 204, 113, 255],
  [52, 152, 219, 255]
];
const TITLE_TEXT = [255, 255, 255, 255];
const NORMAL_TEXT = [220, 220, 220, 255];
const LIGHT_TEXT = [255, 255, 255, 255];
const BACKGROUND_COLOUR = [10, 15, 35, 255];
const PANEL_COLOUR = [21, 30, 58, 255];
const ANIMATION_PANEL_COLOUR = [15, 23, 46, 255];
const DISC_CENTER_COLOUR = [17, 24, 45, 255];
const BUTTON_COLOUR = [52, 73, 94, 255];
const PREVIEW_BUTTON_COLOUR = [41, 128, 185, 255];
const STOP_BUTTON_COLOUR = [192, 57, 43, 255];
const DISABLED_BUTTON_COLOUR = [140, 140, 140, 255];

const fragment_labels = ["A", "B", "C", "D", "E"];
const target_order = ["A", "B", "C", "D", "E"];

// These working sample URLs can be replaced with the five real melody files.
// Keeping the URLs in one array makes the replacement straightforward.
const fragment_audio_urls = [
  "https://labs.phaser.io/assets/audio/tech/bass.mp3",
  "https://labs.phaser.io/assets/audio/tech/bass.mp3",
  "https://labs.phaser.io/assets/audio/tech/bass.mp3",
  "https://labs.phaser.io/assets/audio/tech/bass.mp3",
  "https://labs.phaser.io/assets/audio/tech/bass.mp3"
];

// This fixed starting layout makes the player solve the puzzle every time.
// Each entry gives the slot occupied by the matching label above.
const initial_slot_indexes = [2, 0, 4, 1, 3];
const slot_positions = [];
const fragments = [];
const current_order = ["", "", "", "", ""];
const equalizer_bars = [];
const floating_notes = [];

let dragged_fragment = undefined;
let playing_fragment = undefined;
let mouse_was_down = false;
let puzzle_is_active = true;
let timer_has_started = false;
let timer_started_at = 0;
let time_remaining_ms = TIMER_DURATION_MS;
let submit_button = undefined;
let submit_button_text = undefined;

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
  update_position(create_rectangle(820, 260), [CANVAS_WIDTH / 2, 290]),
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
    const disc = update_color(
      create_circle(FRAGMENT_RADIUS),
      FRAGMENT_COLOURS[index]
    );
    const disc_center = update_color(
      create_circle(18),
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
      create_audio(fragment_audio_urls[index], 1),
      disc_center
    ];

    update_scale(fragment[LABEL_TEXT_INDEX], [1.5, 1.5]);
    update_scale(fragment[PREVIEW_BUTTON_TEXT_INDEX], [0.8, 0.8]);
    fragments[index] = fragment;
    move_fragment_to_slot(fragment);
  }

  update_current_order();
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

function update_current_order() {
  for (let slot_index = 0;
       slot_index < FRAGMENT_COUNT;
       slot_index = slot_index + 1) {
    for (let fragment_index = 0;
         fragment_index < FRAGMENT_COUNT;
         fragment_index = fragment_index + 1) {
      const fragment = fragments[fragment_index];
      if (fragment[SLOT_INDEX] === slot_index) {
        current_order[slot_index] = fragment[LABEL_INDEX];
      }
    }
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
  update_current_order();
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
    end_game();
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

function handle_submit() {
  if (puzzle_is_active) {
    end_game();
  }
}

function check_solution() {
  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    if (current_order[index] !== target_order[index]) {
      return false;
    }
  }

  return true;
}

function end_game() {
  if (!puzzle_is_active) {
    return undefined;
  }

  puzzle_is_active = false;
  dragged_fragment = undefined;
  stop_fragment_audio();
  snap_fragments();
  update_color(submit_button, DISABLED_BUTTON_COLOUR);
  update_color(submit_button_text, [220, 220, 220, 255]);

  if (check_solution()) {
    update_text(status_text, "Puzzle Solved!");
  } else {
    update_text(status_text, "Incorrect Order.");
  }
  update_to_top(status_text);

  return undefined;
}

function update() {
  const mouse_is_down = input_left_mouse_down();
  const mouse_pressed_this_frame = mouse_is_down && !mouse_was_down;
  const mouse_released_this_frame = !mouse_is_down && mouse_was_down;

  if (!timer_has_started) {
    start_timer();
  }

  animate_ambient_background();

  if (puzzle_is_active) {
    update_timer();
  }

  if (puzzle_is_active && mouse_pressed_this_frame) {
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

create_slot_positions();
create_fragments();
create_submit_button();
create_ambient_animation();
update_loop(update);
build_game();
