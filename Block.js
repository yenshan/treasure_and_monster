const BLOCK_RECOVER_SEC = 4;

const State = {
    NORMAL: 'NORMAL',
    BREAKING: 'BREAKING',
    RECOVER: 'RECOVER',
    BROKEN: 'BROKEN',
}

const anime_table = {
    NORMAL: { frames: [16], frame_interval: 1},
    BREAKING: { frames: [17,18,19,20], frame_interval: 20 },
    RECOVER: { frames: [19,18,17], frame_interval: 60 },
    BROKEN: { frames: [20], frame_interval: 60*BLOCK_RECOVER_SEC },
};

const next_state_table = new Map([
    [State.NORMAL, State.NORMAL],
    [State.BREAKING, State.BROKEN],
    [State.BROKEN, State.RECOVER],
    [State.RECOVER, State.NORMAL],
]);

export class EBlock {
    constructor() {
        this.state = State.NORMAL;
        this.anime_index = 0;
        this.frame_count = 0;
        this.sprite = 16;
    }

    can_go_through() { return this.state != State.NORMAL; }

    can_up() { return false; }

    can_stand_on() { return this.state == State.NORMAL; }

    can_hang() { return false; }

    can_pick_up() { return false; }

    is_dig_hole() { return this.state != State.NORMAL;}

    sprite_no() { return this.sprite; }

    dig() {
        if (this.state != State.NORMAL) 
            return;
        this.state = State.BREAKING;
    }

    update () {
        if (!this.anime_update()) {
            this.state = next_state_table.get(this.state);
            this.anime_index = 0;
            this.frame_count = 0;
        }
    }

    anime_update() {
        let frames = anime_table[this.state].frames;

        if (this.anime_index >= frames.length) {
            this.anime_index = 0;
            return false;
        }

        if (this.frame_count >= anime_table[this.state].frame_interval) {
            this.anime_index++;
            this.frame_count = 0;
        }
        this.frame_count++;

        if (this.anime_index < frames.length) {
            this.sprite = frames[this.anime_index];
        }

        return true;
    }
}

