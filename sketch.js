CANVAS_SIZE_X = 1200;
CANVAS_SIZE_Y = 600;

game_mode = "READY";
feedback_mode = "NONE";
gravity_mode = "CONSTANT";

// Acceleration for button push
acc_x = 0.1;
acc_y = 0.1;

move_histories = [];
session_moves = [];

gravity_values = [];
for (i = 0; i < CANVAS_SIZE_X; i++) {
  // gravity_values.push((1 + Math.sin((i / 500) * Math.PI)) / 80);
  gravity_values.push(0.002);
}

obstacles = [
  [CANVAS_SIZE_X * 0.4, CANVAS_SIZE_Y * 0.15],
  [CANVAS_SIZE_X * 0.7, CANVAS_SIZE_Y * 0.7],
  [CANVAS_SIZE_X * 0.2, CANVAS_SIZE_Y * 0.8],
];

function draw_player() {
  fill("purple");
  circle(pos_x, pos_y, 10);
}

function draw_text() {
  fill(100);
  rect(CANVAS_SIZE_X, 0, 200, CANVAS_SIZE_Y, 20);

  fill("white");

  text(`Player Name: ${participant_name}`, CANVAS_SIZE_X + 10, 30);
  text(`Game Mode: ${game_mode}`, CANVAS_SIZE_X + 10, 50);
  text(`Feedback Mode: ${feedback_mode}`, CANVAS_SIZE_X + 10, 70);
  text(`Gravity Mode: ${gravity_mode}`, CANVAS_SIZE_X + 10, 90);

  text("Game Mode: (SPACE, R)", CANVAS_SIZE_X + 10, 660);
  text("Feedback Mode: (1, 2, 3)", CANVAS_SIZE_X + 10, 680);
  text("Gravty Mode: (C, V)", CANVAS_SIZE_X + 10, 700);
}

function draw_feedback() {
  fill(100);
  // rect(0, CANVAS_SIZE_Y, 100, 200, 20);
  rect(0, CANVAS_SIZE_Y, CANVAS_SIZE_X, 150, 20);

  stroke(255);
  if (feedback_mode == "LINE") {
    for (i = 0; i < CANVAS_SIZE_X; i++) {
      point(i, CANVAS_SIZE_Y * 1.05 + gravity_values[i] * 1500);
    }
  } else if (feedback_mode == "NUMBER") {
    textSize(32);
    fill(255);
    text(
      String(Math.round(gravity_values[int(pos_x)] * 10000) / 100),
      CANVAS_SIZE_X / 2,
      CANVAS_SIZE_Y * 1.15
    );
    textSize(12);
  }
  stroke(0);
}

function create_stage() {
  background(100);
  // Move line below to draw function to remove black path trace
  fill(125);
  rect(0, 0, CANVAS_SIZE_X, CANVAS_SIZE_Y, 20);

  fill("#c7ddb5");
  circle(CANVAS_SIZE_X, CANVAS_SIZE_Y / 2, 50);

  fill("#f94449");
  for (i = 0; i < obstacles.length; i++) {
    circle(obstacles[i][0], obstacles[i][1], 100);
  }

  // Starting position
  pos_x = 30;
  pos_y = 30;

  velocity_x = 0.0;
  velocity_y = 0.0;

  draw_player();
  draw_text();
  draw_feedback();

  game_mode = "READY";
}

function setup() {
  createCanvas(CANVAS_SIZE_X + 200, CANVAS_SIZE_Y + 150);

  participant_name = prompt("Enter Name", "DEFAULT_USER")
  // participant_name = "JEN";

  create_stage();
}

function end_session() {
  game_mode = "RESET";
  background("#f94449");

  move_histories.push(session_moves);
  session_moves = [];
}

function ready_listener() {
  // Space Bar
  if (keyIsDown(32)) {
    game_mode = "ACTIVE";
  }

  // 49 -> Num Row 1
  if (keyIsDown(49)) {
    feedback_mode = "NONE";
  }
  // 50 -> Num Row 1
  if (keyIsDown(50)) {
    feedback_mode = "LINE";
  }
  // 51 -> Num Row 1
  if (keyIsDown(51)) {
    feedback_mode = "NUMBER";
  }

  // 67 -> c
  if (keyIsDown(67)) {
    gravity_mode = "CONSTANT";
    gravity_values = [];
    for (i = 0; i < CANVAS_SIZE_X; i++) {
      gravity_values.push(0.002);
    }
  }
  // 86 -> v
  if (keyIsDown(86)) {
    gravity_mode = "VARIABLE";
    gravity_values = [];
    for (i = 0; i < CANVAS_SIZE_X; i++) {
      gravity_values.push((1 + Math.sin((i / 500) * (Math.PI * 2.5))) / 30);
    }
  }
}

function active_listener() {
  if (keyIsDown(LEFT_ARROW)) {
    velocity_x -= acc_x;
    session_moves.push(["LEFT", Date.now(), pos_x, pos_y]);
  }

  if (keyIsDown(RIGHT_ARROW)) {
    velocity_x += acc_x;
    session_moves.push(["RIGHT", Date.now(), pos_x, pos_y]);
  }

  if (keyIsDown(UP_ARROW)) {
    velocity_y -= acc_y;
    session_moves.push(["UP", Date.now(), pos_x, pos_y]);
  }

  if (keyIsDown(DOWN_ARROW)) {
    velocity_y += acc_y;
    session_moves.push(["DOWN", Date.now(), pos_x, pos_y]);
  }

  pos_x += velocity_x;
  pos_y += velocity_y;
}

function reset_listener() {
  // 82 -> r Key
  if (keyIsDown(82)) {
    create_stage();
  }

  // 83 -> s Key
  if (keyIsDown(83)) {
    // Save file

    save_name = `${participant_name}_${gravity_mode}_${feedback_mode}`;

    localStorage[save_name] = JSON.stringify(move_histories);
    move_histories = [];
    alert(`Data Saved!, ${save_name}`);
  }
}

function check_boundaries() {
  if (pos_x < 0 || pos_x > CANVAS_SIZE_X) {
    end_session();
  }

  if (pos_y < 0 || pos_y > CANVAS_SIZE_Y) {
    end_session();
  }
}

function check_obstacles() {
  for (i = 0; i < obstacles.length; i++) {
    dx = pos_x - obstacles[i][0];
    dy = pos_y - obstacles[i][1];

    distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

    if (distance < 100 / 2) {
      end_session();
    }
  }
}

function gravity() {
  temp_pos_x = max(0, int(pos_x));
  velocity_y += gravity_values[temp_pos_x];
}

function check_objective() {
  dx = pos_x - CANVAS_SIZE_X;
  dy = pos_y - CANVAS_SIZE_Y / 2;

  distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

  if (distance < 50 / 2) {
    game_mode = "RESET";
    move_histories.push(session_moves);
    session_moves = [];
  }
}

function draw() {
  // Reset the Game
  if (game_mode == "READY") {
    ready_listener();
    // create_stage();
    draw_player();
    draw_text();
    draw_feedback();
  } else if (game_mode == "ACTIVE") {
    check_boundaries();
    check_obstacles();
    gravity();

    active_listener();

    pos_x += velocity_x;
    pos_y += velocity_y;

    check_objective();

    draw_player();
    draw_text();
    draw_feedback();
  } else if (game_mode == "RESET") {
    reset_listener();
  }
}
