import {
  build_game,
  create_rectangle,
  create_text,
  gameobjects_overlap,
  get_game_time,
  input_left_mouse_down,
  pointer_over_gameobject,
  query_pointer_position,
  set_dimensions,
  update_color,
  update_loop,
  update_position,
  update_scale,
  update_text,
  update_to_top
} from "arcade_2d";

// Canvas and layout constants.
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const FRAGMENT_WIDTH = 100;
const FRAGMENT_HEIGHT = 70;
const FRAGMENT_GAP = 10;
const FRAGMENT_Y = 205;
const FRAGMENT_COUNT = 5;
const TIMER_DURATION_MS = 5 * 60 * 1000;
const BUTTON_WIDTH = 120;
const BUTTON_HEIGHT = 42;
const LABEL_INDEX = 0;
const SLOT_INDEX = 1;
const RECTANGLE_INDEX = 2;
const LABEL_TEXT_INDEX = 3;

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
const BUTTON_COLOUR = [52, 73, 94, 255];
const DISABLED_BUTTON_COLOUR = [140, 140, 140, 255];

const fragment_labels = ["A", "B", "C", "D", "E"];
const target_order = ["A", "B", "C", "D", "E"];

// This fixed starting layout makes the player solve the puzzle every time.
// Each entry gives the slot occupied by the matching label above.
const initial_slot_indexes = [2, 0, 4, 1, 3];
const slot_positions = [];
const fragments = [];
const current_order = ["", "", "", "", ""];

let dragged_fragment = undefined;
let mouse_was_down = false;
let puzzle_is_active = true;
let timer_has_started = false;
let timer_started_at = 0;
let time_remaining_ms = TIMER_DURATION_MS;
let submit_button = undefined;
let submit_button_text = undefined;

set_dimensions([CANVAS_WIDTH, CANVAS_HEIGHT]);

const title_text = update_scale(
  update_position(create_text("Arrange the Melody"), [CANVAS_WIDTH / 2, 35]),
  [1.7, 1.7]
);
const timer_text = update_position(create_text("Time: 05:00"), [CANVAS_WIDTH / 2, 78]);
const instruction_text = update_position(
  create_text("Drag one fragment onto another to swap them."),
  [CANVAS_WIDTH / 2, 115]
);
const status_text = update_position(create_text(""), [CANVAS_WIDTH / 2, 282]);

update_color(title_text, TITLE_TEXT);
update_color(timer_text, NORMAL_TEXT);
update_color(instruction_text, NORMAL_TEXT);
update_color(status_text, TITLE_TEXT);

function create_slot_positions() {
  const total_width = FRAGMENT_COUNT * FRAGMENT_WIDTH
    + (FRAGMENT_COUNT - 1) * FRAGMENT_GAP;
  const first_slot_x = (CANVAS_WIDTH - total_width) / 2 + FRAGMENT_WIDTH / 2;

  for (let slot_index = 0; slot_index < FRAGMENT_COUNT; slot_index = slot_index + 1) {
    slot_positions[slot_index] = [
      first_slot_x + slot_index * (FRAGMENT_WIDTH + FRAGMENT_GAP),
      FRAGMENT_Y
    ];
  }
}

function create_fragments() {
  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    // A fragment stores its label, slot, rectangle, and centred label text.
    const fragment = [
      fragment_labels[index],
      initial_slot_indexes[index],
      update_color(
        create_rectangle(FRAGMENT_WIDTH, FRAGMENT_HEIGHT),
        FRAGMENT_COLOURS[index]
      ),
      update_color(create_text(fragment_labels[index]), LIGHT_TEXT)
    ];

    update_scale(fragment[LABEL_TEXT_INDEX], [1.5, 1.5]);
    fragments[index] = fragment;
    move_fragment_to_slot(fragment);
  }

  update_current_order();
}

function move_fragment_to_slot(fragment) {
  const slot_position = slot_positions[fragment[SLOT_INDEX]];
  update_position(fragment[RECTANGLE_INDEX], slot_position);
  update_position(fragment[LABEL_TEXT_INDEX], slot_position);
}

function snap_fragments() {
  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    move_fragment_to_slot(fragments[index]);
  }
}

function update_current_order() {
  for (let slot_index = 0; slot_index < FRAGMENT_COUNT; slot_index = slot_index + 1) {
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

function start_drag_if_possible() {
  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    const fragment = fragments[index];
    if (pointer_over_gameobject(fragment[RECTANGLE_INDEX]) ||
        pointer_over_gameobject(fragment[LABEL_TEXT_INDEX])){
        dragged_fragment = fragment;
        update_to_top(fragment[RECTANGLE_INDEX]);
        update_to_top(fragment[LABEL_TEXT_INDEX]);
        return undefined;
    }
  }

  return undefined;
}

function drag_fragment() {
  const pointer_position = query_pointer_position();
  update_position(dragged_fragment[RECTANGLE_INDEX], pointer_position);
  update_position(dragged_fragment[LABEL_TEXT_INDEX], pointer_position);
  update_to_top(dragged_fragment[RECTANGLE_INDEX]);
  update_to_top(dragged_fragment[LABEL_TEXT_INDEX]);
}

function find_overlapped_fragment() {
  for (let index = 0; index < FRAGMENT_COUNT; index = index + 1) {
    const candidate_fragment = fragments[index];
    if (candidate_fragment !== dragged_fragment
        && gameobjects_overlap(
          dragged_fragment[RECTANGLE_INDEX],
          candidate_fragment[RECTANGLE_INDEX]
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

function create_submit_button() {
  submit_button = update_color(
    update_position(create_rectangle(BUTTON_WIDTH, BUTTON_HEIGHT), [CANVAS_WIDTH / 2, 345]),
    BUTTON_COLOUR
  );
  submit_button_text = update_color(
    update_position(create_text("Submit"), [CANVAS_WIDTH / 2, 345]),
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

  if (puzzle_is_active) {
    update_timer();
  }

  if (puzzle_is_active && mouse_pressed_this_frame) {
    if (pointer_over_gameobject(submit_button) ||
    pointer_over_gameobject(submit_button_text)) {
      handle_submit();
    } else {
      start_drag_if_possible();
    }
  }

  if (puzzle_is_active && dragged_fragment !== undefined && mouse_is_down) {
    drag_fragment();
  }

  if (puzzle_is_active && dragged_fragment !== undefined && mouse_released_this_frame) {
    // Use the release position as the final drag position before testing overlap.
    drag_fragment();
    release_drag();
  }

  mouse_was_down = mouse_is_down;
}

create_slot_positions();
create_fragments();
create_submit_button();
update_loop(update);
build_game();
