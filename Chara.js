import {drawSprite} from "./index.js"

const State = {
    STOP: 'STOP',
    MOVE_LEFT : 'MOVE_LEFT',
    MOVE_RIGHT: 'MOVE_RIGHT',
    MOVE_UP : 'MOVE_UP',
    MOVE_DOWN : 'MOVE_DOWN',
    FALL:  'FALL',
    STOP_LADDER: 'STOP_LADDER',
    MOVE_BAR_LEFT : 'MOVE_BAR_LEFT',
    MOVE_BAR_RIGHT : 'MOVE_BAR_RIGHT',
    STOP_BAR : 'STOP_BAR',
    DIG_RIGHT: 'DIG_RIGHT',
    DIG_LEFT: 'DIG_LEFT',
    DEADING: 'DEADING',
    DEAD: 'DEAD',
}

const anime_table =  {
    STOP: {move_count: 0, frames: [34,35], frame_interval: 60},
    MOVE_LEFT: {move_count: 8, frames: [36,37,38], frame_interval: 3},
    MOVE_RIGHT: { move_count: 8, frames: [36,37,38], frame_interval: 3},
    MOVE_UP: {move_count: 8, frames: [39,40], frame_interval: -1},
    MOVE_DOWN: {move_count: 8, frames: [39,40], frame_interval: -1},
    FALL: {move_count: 8, frames: [34,34,41,41], frame_interval: 2},
    STOP_LADDER: {move_count: 8, frames: [39,40], frame_interval: -1},
    MOVE_BAR_LEFT: {move_count: 8, frames: [32,33], frame_interval: -1},
    MOVE_BAR_RIGHT: {move_count: 8, frames: [32,33], frame_interval: -1},
    STOP_BAR: {move_count: 8, frames: [32,33], frame_interval: -1},
    DIG_LEFT: {move_count: 48, frames: [34], frame_interval: 1},
    DIG_RIGHT: {move_count: 48, frames: [34], frame_interval: 1},
    DEADING: {move_count: 3*60, frames: [42,0], frame_interval: 20},
    DEAD: {move_count: 8, frames: [42], frame_interval: 1},
};

class Razer {
    constructor(x, y, flip) {
        this.x = x;
        this.y = y;
        this.flip = flip;
        this.frame_count = 0;
        this.anime_table = { frames: [4,5], frame_interval: 20};
        this.frame_index = 0;
        this.sprite = 4;
    }
    update() {
        if (this.frame_count > this.anime_table.frame_interval) {
            this.frame_index = (this.frame_index + 1) % this.anime_table.frames.length;
            this.frame_count = 0;
        }
        this.frame_count++;
        this.sprite = this.anime_table.frames[this.frame_index];
    }
    draw() {
        drawSprite(this.sprite, this.x, this.y, this.flip);
    }
}

export class Chara {

    constructor(x,y, world) {
        this.x = x;
        this.y = y;
        this.w = 8;
        this.h = 8;
        this.anime_count = 0;
        this.anime_index = 0;
        this.move_count = 0;
        this.state = State.STOP;
        this.request_move = State.STOP;
        this.flip = false;
        this.anime_table = anime_table;
        this.world = world;
        this.razer = null;
        this.hold_coins = 0;
    }

    update() {
        if (this.check_dead()) {
            this.change_state(State.DEADING);
        }

        let action_func = `action_${this.state.toLowerCase()}`;

        if (!this[action_func]()) {
            this.check_get_coin();
            if (this.can_fall()) {
                this.change_state(State.FALL);
            } else {
                let check_func = `check_${this.request_move.toLowerCase()}`;
                this[check_func]();
                this.request_move = State.STOP;
            }
        }

        this.anime_update();
        if (this.razer != null) this.razer.update();
    }

    check_dead() {
        if (this.state == State.DEADING || this.state == State.DEAD)
            return false;
        if (this.world.isOnEnemy(this.x, this.y, this.w, this.h)) {
            return true;
        }
        if (!this.world.canGoThrough(this.x, this.y)) {
            return true;
        }
        return false;
    }

    check_get_coin() {
        if (this.world.isOnCoin(this.x, this.y)) {
            this.world.pickUp(this.x,this.y);
            this.hold_coins++;
            if (this.hold_coins == this.world.numOfCoins()) {
                this.world.showHideLadder();
            }
        }
    }

    check_stop() {
        if (this.is_over_ladder()) {
            this.change_state(State.STOP_LADDER);
        } else if (this.is_over_bar()) {
            this.change_state(State.STOP_BAR);
        } else {
            this.change_state(State.STOP);
        }
        this.razer = null;
    }

    check_move_right() {
        if (!this.world.canGoThrough(this.x+this.w+1, this.y))
            return false;
        if (this.can_fall())
            return false;

        if (this.world.isOnBar(this.x+this.w+1, this.y)) {
            this.change_state(State.MOVE_BAR_RIGHT);
            this.anime_update(true);
        } else {
            this.change_state(State.MOVE_RIGHT);
        }
        this.flip = false;
        return true;
    }

    check_move_left() {
        if (!this.world.canGoThrough(this.x-1, this.y))
            return false;
        if (this.can_fall())
            return false;

        if (this.world.isOnBar(this.x-1, this.y)) {
            this.change_state(State.MOVE_BAR_LEFT);
            this.anime_update(true);
        } else {
            this.change_state(State.MOVE_LEFT);
        }
        this.flip = true;
        return true;
    }

    check_move_up() {
        if (!this.world.canUp(this.x, this.y)) 
            return false;
        if (!this.world.canGoThrough(this.x, this.y-1))
            return false;

        this.change_state(State.MOVE_UP);
        this.anime_update(true);
        return true;
    }

    check_move_down() {
        if (!this.world.canUp(this.x,this.y+this.h+1)
            && !this.world.canGoThrough(this.x,this.y+this.h+1))
            return false;

        this.change_state(State.MOVE_DOWN);
        this.anime_update(true);
        return true;
    }

    check_dig_right() {
        if (!this.world.canGoThrough(this.x+this.h+1, this.y))
            return;
        this.world.dig(this.x+this.w+1, this.y+this.h+1);
        this.change_state(State.DIG_RIGHT);
        this.flip = false;
        this.razer = new Razer(this.x+this.w+1, this.y, false);
    }

    check_dig_left() {
        if (!this.world.canGoThrough(this.x-1, this.y))
            return;
        this.world.dig(this.x-1, this.y+this.h+1);
        this.change_state(State.DIG_LEFT);
        this.flip = true;
        this.razer = new Razer(this.x-this.w, this.y, true);
    }

    action_stop() {
    }

    action_move_left() {
        return this.count_move(-1, 0);
    }

    action_move_right() {
        return this.count_move(1, 0);
    }
    action_move_up() {
        return this.count_move(0, -1);
    }

    action_move_down() {
        return this.count_move(0, 1);
    }

    action_stop_ladder() {
        this.action_stop();
    }

    action_fall() {
        return this.count_move(0, 1);
    }

    action_move_bar_right() {
        return this.count_move(1, 0);
    }

    action_move_bar_left() {
        return this.count_move(-1, 0);
    }

    action_stop_bar() {
        return this.action_stop();
    }

    action_dig_left() {
        return this.count_move(0,0);
    }

    action_dig_right() {
        return this.count_move(0,0);
    }

    action_deading() {
        if (!this.count_move(0,0)) {
            this.change_state(State.DEAD);
        }
        return true;
    }

    action_dead() {
        return true;
    }

    anime_update(force=false) {
        let frames = this.anime_table[this.state].frames;
        let frame_interval = this.anime_table[this.state].frame_interval;

        if (force) {
            this.anime_index++;
        } else if (frame_interval == -1) {
        } else if (this.anime_count >= frame_interval) {
            this.anime_index++;
            this.anime_count = 0;
        }

        if (this.anime_index >= frames.length)
            this.anime_index = 0;

        this.sprite = frames[this.anime_index];
        this.anime_count++;
    }

    draw() {
        drawSprite(this.sprite, this.x, this.y, this.flip);
        if (this.razer != null) this.razer.draw();
    }

    change_state(state) {
        this.state = state;
        this.move_count = this.anime_table[this.state].move_count;
    }

    count_move(dx, dy) {
        this.move_count--;
        if (this.move_count < 0) {
            return false;
        }
        this.x += dx;
        this.y += dy;
        return true;
    }

    stop_move() {
        this.request_move = Move.STOP;
    }

    can_fall() {
        if (this.world.canHang(this.x, this.y))
            return false;
        if (this.world.isOnEnemy(this.x,this.y+this.h+1, this.w, this.h))
            return false;
        return !this.world.canStandOn(this.x, this.y+this.h+1);
    }

    is_over_ladder() {
        return this.world.isOnLadder(this.x+this.w/2, this.y+this.h/2);
    }

    is_over_bar() {
        return this.world.isOnBar(this.x+this.w/2, this.y+this.h/2);
    }


    move_right() {
        this.request_move = State.MOVE_RIGHT;
    }

    move_left() {
        this.request_move = State.MOVE_LEFT;
    }

    move_up() {
        this.request_move = State.MOVE_UP;
    }

    move_down() {
        this.request_move = State.MOVE_DOWN;
    }

    dig_right() {
        this.request_move = State.DIG_RIGHT;
    }

    dig_left() {
        this.request_move = State.DIG_LEFT;
    }

    isDead() {
        return this.state == State.DEADING || this.state == State.DEAD;
    }
}

