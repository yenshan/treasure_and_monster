import { UserInput } from "./UserInput.js"
import { Chara } from "./Chara.js"
import { Enemy } from "./Enemy.js"
import { World } from "./World.js"

// background canvas
const canvas_bg = document.getElementById('canvasBg');
const context_bg = canvas_bg.getContext('2d');
const SCREEN_W = canvas_bg.width / 8
const SCREEN_H = canvas_bg.height / 8

// display canvas
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;

const SPRITE_SHEET_WIDTH = 16;
const BLOCK_SIZE = 8;

const GAME_UPDATE_INTERVAL_MSEC = 30;

const State = {
    INIT_TITLE: 'INIT_TITLE',
    TITLE: 'TITLE',
    INIT_GAME: 'INIT_GAME',
    GAME: 'GAME',
    GAME_CLEAR_INIT: 'GAME_CLEAR_INIT',
    GAME_CLEAR: 'GAME_CLEAR',
    GAME_OVER: 'GAME_OVER',
}

const title = [
  //1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 1
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 2
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 3
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 4
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 5
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 6
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 7
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 8
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 9
    0,0,0,0,0,8,0,1,0,0,0,0,0,0,0,7, // 10
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1, // 11
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 12
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 13
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 14
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 15
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 16
];

const map = [
  //1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6
    1,6,0,0,0,0,0,0,0,0,0,0,0,0,0,1, // 1
    1,6,0,0,0,0,0,0,0,0,0,0,0,0,0,1, // 2
    1,6,0,0,0,0,0,0,0,3,3,3,3,3,3,1, // 3
    1,1,1,1,1,1,1,1,2,0,0,0,0,0,5,1, // 4
    1,0,3,3,3,3,0,0,2,0,5,0,0,7,0,1, // 5
    1,2,0,2,0,2,1,0,2,1,1,1,1,1,1,1, // 6
    1,5,1,5,1,5,1,0,2,1,0,0,0,0,0,1, // 7
    1,1,1,1,1,1,1,0,2,1,0,1,1,1,0,1, // 8
    1,1,5,5,5,1,0,2,1,1,0,1,0,0,0,1, // 9
    1,1,1,1,1,1,0,2,1,0,5,1,2,1,1,1, // 10
    1,0,0,3,3,3,0,2,1,0,1,1,2,1,5,1, // 11
    1,2,1,5,5,5,1,2,0,5,1,1,2,1,0,1, // 12
    1,2,4,4,4,4,4,2,0,1,1,1,2,1,1,1, // 13
    1,2,0,0,8,0,0,2,0,0,0,0,2,1,1,1, // 14
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1, // 15
    4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4, // 16
];

const game_clear = [
  //1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 1
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 2
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 3
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 4
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 5
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 6
    0,0,0,0,0,0,8,0,5,0,0,0,0,0,0,0, // 7
    0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0, // 8
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 9
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 10
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 11
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 12
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 13
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 14
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 15
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // 16
];

let state = State.INIT_TITLE;

// スプライトシートのロード
const spriteSheet = new Image();
spriteSheet.src = "./spritesheet.png";
const titleImage = new Image();
titleImage.src = "./title.png";

let world;

export let input = new UserInput(document);


export function drawSprite(sprite_no, x, y, flip=false) {
    let sx = (sprite_no % SPRITE_SHEET_WIDTH) *8;
    let sy = Math.floor(sprite_no / SPRITE_SHEET_WIDTH)*8;
    if (flip) {
        context_bg.save();
        context_bg.scale(-1,1);
        context_bg.drawImage(spriteSheet, sx, sy, 8, 8, -x-8, y, 8, 8);
        context_bg.restore();
    } else {
        context_bg.drawImage(spriteSheet, sx, sy, 8, 8, x, y, 8, 8);
    }
}

let text_display = true;
function draw_text_center(text, ypos, blink=false) {
    if (wait_seconds(0.5)) {
        if (blink) {
            text_display = !text_display;
        }
    }
    if (!blink || text_display) {
        context.fillStyle = "#fff";
        context.font = '24px Consolas';
        context.textAlign = 'left';
        let text_w = context.measureText(text).width;
        context.fillText(text, canvas.width/2-text_w/2, ypos);
    }
}

function clear_background() {
    context_bg.fillStyle = '#292E60';
    context_bg.fillRect(0,0,canvas_bg.width, canvas_bg.height);
}

function update_game_screen() {
    // 表示用にcanvas_bgを拡大する
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(canvas_bg, 0, 0, canvas_bg.width, canvas_bg.height, 0, 0, canvas.width, canvas.height);
}

function update_game() {
    clear_background();
    world.update();
    world.draw();

    if (world.isGameClear()) {
        state = State.GAME_CLEAR_INIT;
    }
    if (world.isGameOver()) {
        state = State.GAME_OVER;
    }
    update_game_screen();
}

function draw_title() {
    context.drawImage(titleImage,0,0,128,62, canvas.width*1/10, canvas.height/10,canvas.width*4/5, 62*4*4/5);
}

let wait_count = 0;
function wait_seconds(seconds) {
    if (wait_count < seconds*(1000/GAME_UPDATE_INTERVAL_MSEC)) {
        wait_count++;
        return false;
    }
    wait_count = 0;
    return true;
}

function update() {
    switch(state) {
    case State.INIT_TITLE:
        world = new World(SCREEN_W, SCREEN_H, title, false);
        input.setInputFilter(['start'])
        state = State.TITLE;
        break;
    case State.TITLE:
        update_game();
        draw_title();
        draw_text_center("Press 'S' Key to Start", canvas.height/5*4, true);
        if (input.start) state = State.INIT_GAME;
        break;
    case State.INIT_GAME:
        context.clearRect(0, 0, canvas.width, canvas.height);
        world = new World(SCREEN_W, SCREEN_H, map);
        update_game();
        input.setInputFilter(null);
        if (wait_seconds(1)) {
            state = State.GAME;
        }
        break;
    case State.GAME:
        update_game();
        if (input.reset) state = State.INIT_GAME;
        break;
    case State.GAME_CLEAR_INIT:
        if (wait_seconds(1)) {
            world = new World(SCREEN_W, SCREEN_H, game_clear, false);
            state = State.GAME_CLEAR;
            input.setInputFilter(['start'])
        }
        break;
    case State.GAME_CLEAR:
        clear_background();
        update_game();
        draw_text_center("Game Clear !!", canvas.height/5*3);
        if (input.start) {
            state = State.INIT_TITLE;
            input.clearInputs();
        }
        break;
    case State.GAME_OVER:
        update_game();
        if (wait_seconds(5)) {
            state = State.INIT_TITLE;
        }
        break;
    }
}

setInterval(update, GAME_UPDATE_INTERVAL_MSEC);

