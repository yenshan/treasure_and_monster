import {drawSprite} from "./index.js"
import {Chara} from "./Chara.js" 

const STAY_HOLE_SEC = 3;

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
    IN_HOLE: 'IN_HOLE',
    UP_HOLE: 'UP_HOLE',
    DEADING: 'DEADING',
    DEAD: 'DEAD',
}

const anime_table =  {
    STOP: {move_count: 0, frames: [50,51,54], frame_interval: 60},
    MOVE_LEFT: {move_count: 8, frames: [50,52,53], frame_interval: 3},
    MOVE_RIGHT: { move_count: 8, frames: [50,52,53], frame_interval: 3},
    MOVE_UP: {move_count: 8, frames: [55,56], frame_interval: -1},
    MOVE_DOWN: {move_count: 8, frames: [55,56], frame_interval: -1},
    FALL: {move_count: 8, frames: [49,56], frame_interval: 2},
    STOP_LADDER: {move_count: 8, frames: [55,56], frame_interval: -1},
    MOVE_BAR_LEFT: {move_count: 8, frames: [48,49], frame_interval: -1},
    MOVE_BAR_RIGHT: {move_count: 8, frames: [48,49], frame_interval: -1},
    STOP_BAR: {move_count: 8, frames: [48], frame_interval: -1},
    IN_HOLE: {move_count: 30*STAY_HOLE_SEC, frames: [50], frame_interval: 1},
    UP_HOLE: {move_count: 8, frames: [50,52], frame_interval: 1},
    DEADING: {move_count: 30*3, frames: [58,59,60,61], frame_interval: 30},
    DEAD: {move_count: 8, frames: [61], frame_interval: 60},
};

export class Enemy extends Chara {

    constructor(x,y, world, chara) {
        super(x,y,world);
        this.sprite = 50;
        this.anime_table = anime_table;
        this.chara = chara;
        this.action_interval = 1;
        this.action_wait_count = 0;
    }

    wait_for_action() {
        if (this.action_wait_count < this.action_interval) {
            this.action_wait_count++;
            return true;
        }
        this.action_wait_count = 0;
        return false;
    }
    
    update() {
        if (this.wait_for_action())
            return;

        let action_func = `action_${this.state.toLowerCase()}`;

        if (!this[action_func]()) {
            this.check_get_coin();
            if (this.can_fall()) {
                this.change_state(State.FALL);
            } else {
                this.think_next_action();
            }
        }

        this.anime_update();
    }

    think_next_action() {
        let chara = this.chara;

        if (chara.y == this.y) {
            if (chara.x < this.x) {
                if (!this.check_move_left()) 
                    this.change_state(State.STOP);
            } else {
                if (!this.check_move_right())
                    this.change_state(State.STOP);
            }
            return;
        }

        if (chara.y > this.y) { 
            if (this.check_move_down()) return;
        } else {
            if (this.check_move_up()) return;
        }

        switch(this.state) {
        case State.MOVE_LEFT:
            if (!this.check_move_left()) this.check_move_right();
            break;
        case State.MOVE_RIGHT:
            if (!this.check_move_right()) this.check_move_left();
            break;
        default:
            if (chara.x < this.x) {
                this.check_move_left();
            } else {
                this.check_move_right();
            }
        }

    }

    check_get_coin() {
        if (this.hold_coins > 0)
            return;
        super.check_get_coin();
    }
    
    check_dead() {
        return !this.world.canGoThrough(this.x,this.y);
    }

    check_move_right() {
        if (this.world.isDigHole(this.x+this.w+1, this.y))
            return false;
        return super.check_move_right();
    }

    check_move_left() {
        if (this.world.isDigHole(this.x-1, this.y))
            return false;
        return super.check_move_left();
    }

    check_move_down() {
        if (this.world.isDigHole(this.x, this.y))
            return false;
        return super.check_move_down();
    }

    can_fall() {
        if (this.world.isDigHole(this.x, this.y)) {
            this.change_state(State.IN_HOLE);
            if (this.hold_coins > 0) {
                this.world.putCoin(this.x, this.y-1);
                this.hold_coins--;
            }
            return false;
        }
        return super.can_fall()
    }

    action_in_hole() {
        let ret = this.count_move(0, 0);
        if (!ret) {
            this.change_state(State.UP_HOLE);
        }
        if (this.check_dead()) {
            this.change_state(State.DEADING);
        }
        return true;
    }

    action_up_hole() {
        let ret = this.count_move(0, -1);
        if (!ret) {
            if (this.chara.x < this.x) {
                this.change_state(State.MOVE_LEFT);
            } else {
                this.change_state(State.MOVE_RIGHT);
            }
        }
        return true;
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

    isDead() {
        return this.state == State.DEAD;
    }
}

