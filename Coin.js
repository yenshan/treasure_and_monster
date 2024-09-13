
const State = {
    NORMAL: 'NORMAL',
}

const anime_table = {
    NORMAL: { frames: [24,25,26,27], frame_interval: 10},
}


export class ECoin {
    constructor() {
        this.state = State.NORMAL;
        this.anime_index = 0;
        this.frame_count = 0;
        this.sprite = 24;
    }

    can_go_through() { return true; }

    can_up() { return false; }

    can_stand_on() { return false; }

    can_hang() { return false; }

    can_pick_up() { return true; }

    is_dig_hole() { return false; }

    sprite_no() { return this.sprite; }

    update () {
        !this.anime_update();
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


