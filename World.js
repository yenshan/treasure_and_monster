import {drawSprite} from "./index.js"
import { EBlock } from "./Block.js"
import { ECoin } from "./Coin.js"
import { Chara } from "./Chara.js"
import { Enemy } from "./Enemy.js"

const MAP_ELEM_SIZE = 8;

const Elem = {
    NONE: 0,
    BLOCK: 1,
    LADDER: 2,
    BAR: 3,
    ROCK: 4,
    COIN: 5,
    HIDE_LADDER: 6,
    ENEMY: 7,
    PLAYER: 8,
    HIDE_BLOCK: 9,
}

class ENone {
    can_go_through() { return true; }
    can_up() { return false; }
    can_stand_on() { return false; }
    can_hang() { return false; }
    is_dig_hole() { return false;}
    can_pick_up() { return false; }
    sprite_no() { return 0; }
    dig() {}
    update() {}
}

class EHideLadder {
    can_go_through() { return true; }
    can_up() { return false; }
    can_stand_on() { return false; }
    can_hang() { return false; }
    is_dig_hole() { return false;}
    can_pick_up() { return false; }
    sprite_no() { return 0; }
    dig() {}
    update() {}
}

class ELadder {
    can_go_through() { return true; }
    can_up() { return true; }
    can_stand_on() { return true; }
    can_hang() { return true; }
    is_dig_hole() { return false;}
    can_pick_up() { return false; }
    sprite_no() { return 1; }
    dig() {}
    update() {}
}

class EBar {
    can_go_through() { return true; }
    can_up() { return false; }
    can_stand_on() { return false; }
    can_hang() { return true; }
    is_dig_hole() { return false;}
    can_pick_up() { return false; }
    sprite_no() { return 3; }
    dig() {}
    update() {}
}

class ERock {
    can_go_through() { return false; }
    can_up() { return false; }
    can_stand_on() { return true; }
    can_hang() { return false; }
    is_dig_hole() { return false;}
    can_pick_up() { return false; }
    sprite_no() { return 22; }
    dig() {}
    update() {}
}

class EHideBlock {
    can_go_through() { return false; }
    can_up() { return false; }
    can_stand_on() { return true; }
    can_hang() { return false; }
    is_dig_hole() { return false;}
    can_pick_up() { return false; }
    sprite_no() { return 0; }
    dig() {}
    update() {}
}


function createElem(id) {
    switch(id) {
    case Elem.NONE: return new ENone();
    case Elem.BLOCK: return new EBlock();
    case Elem.LADDER: return new ELadder();
    case Elem.BAR: return new EBar();
    case Elem.ROCK: return new ERock();
    case Elem.COIN: return new ECoin();
    case Elem.HIDE_LADDER: return new EHideLadder();
    case Elem.ENEMY: return new ENone();
    case Elem.PLAYER: return new ENone();
    case Elem.HIDE_BLOCK: return new EHideBlock();
    }
}

function createMap(m) {
    let dat = [];
    for (let i = 0; i < m.length; i++) {
        dat[i] = createElem(m[i]);
    }
    return dat;
}

function countCoins(m) {
    let n = 0;
    for (let id of m) {
        if (id == Elem.COIN) n++;
    }
    return n;
}

function collision(obj1, obj2) {
    let flg =  obj1.x >= obj2.x + obj2.w
            || obj2.x >= obj1.x + obj1.w
            || obj1.y >= obj2.y + obj2.h
            || obj2.y >= obj1.y + obj1.h;
    return !flg;
}

export class World {
    constructor(w,h, data, bg=true) {
        this.w = w;
        this.h = h;
        this.num_of_coins = countCoins(data);
        this.map = createMap(data);
        this.player = this.createPlayer(w,h,data);
        this.enemy_list = this.createEnemies(w,h,data,this.player);
        this.bg = bg;
    }

    createPlayer(w, h, data) {
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (data[x + y*w] == Elem.PLAYER)
                    return new Chara(x*8, y*8, this);
            }
        }
    }

    createEnemies(w, h, data, player) {
        let enms = [];
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (data[x + y*w] == Elem.ENEMY)
                    enms.push(new Enemy(x*8, y*8, this, player));
            }
        }
        return enms;
    }

    get_obj(sx,sy) {
        let x = Math.floor(sx/MAP_ELEM_SIZE);
        let y = Math.floor(sy/MAP_ELEM_SIZE);
        return this.map[x + y*this.w];
    }

    put_obj(sx,sy, obj) {
        let x = Math.floor(sx/MAP_ELEM_SIZE);
        let y = Math.floor(sy/MAP_ELEM_SIZE);
        this.map[x + y*this.w] = obj;
    }

    canGoThrough(x,y) {
        return this.get_obj(x,y).can_go_through();
    }

    canUp(x,y) {
        return this.get_obj(x,y).can_up();
    }

    canStandOn(x,y) {
        return this.get_obj(x,y).can_stand_on();
    }

    canHang(x,y) {
        return this.get_obj(x,y).can_hang();
    }

    pickUp(x,y) {
        if (this.get_obj(x,y).can_pick_up()) {
            this.put_obj(x,y, new ENone());
        }
    }
    
    putCoin(x,y) {
        this.put_obj(x,y, new ECoin());
    }

    showHideLadder() {
        for (let i = 0; i < this.map.length; i++) {
            if (this.map[i] instanceof EHideLadder) {
                this.map[i] = new ELadder();
            }
        }
    }

    isDigHole(x,y) {
        return this.get_obj(x,y).is_dig_hole();
    }

    isOnLadder(x,y) {
        return this.get_obj(x,y) instanceof ELadder;
    }

    isOnBar(x,y) {
        return this.get_obj(x,y) instanceof EBar;
    }

    isOnCoin(x,y) {
        return this.get_obj(x,y) instanceof ECoin;
    }

    numOfCoins() {
        return this.num_of_coins;
    }

    isOnEnemy(x, y, w, h) {
        for (let e of this.enemy_list) {
            if (collision(e, {x:x, y:y, w:w, h:h})) {
                return true;
            }
        }
        return false;
    }

    dig(x, y) {
        this.get_obj(x,y).dig();
    }

    isGameClear() {
        return this.player.y == 0;
    }

    isGameOver() {
        return this.player.isDead();
    }

    update() {
        this.player.update();

        if (this.isGameOver())
            return;

        for (let o of this.map) {
            o.update();
        }

        this.enemy_list = this.enemy_list.filter(e => !e.isDead());
        for (let e of this.enemy_list) {
            e.update();
        }
    }

    draw_bg_wall() {
        if (this.bg) {
            for (let y = 0; y < this.h; y++) {
                for (let x = 0; x < this.w; x++) {
                    drawSprite(21, x*MAP_ELEM_SIZE, y*MAP_ELEM_SIZE);
                }
            }
        }
    }

    draw_map() {
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
               let sno = this.map[x+y*this.w].sprite_no();
               drawSprite(sno, x*MAP_ELEM_SIZE, y*MAP_ELEM_SIZE);
            }
        }
    }

    draw() {
        this.draw_bg_wall();
        this.draw_map();
        this.player.draw();
        for (let e of this.enemy_list) {
            e.draw();
        }
    }
}

