/*===============================================================================================*/
//  AYAYA - Anime Roulette (WIP)
//      An application for getting random anime from a list randomly generated 
//      or manually assembled.
//  Copyright (C) 2023  Ilya 'potapello' Potapov
//  Repository -> https://github.com/potapello/ayayaxdd
//  License -> GNU General Public License v3.0
//  License URL -> https://github.com/potapello/ayayaxdd/blob/main/LICENSE
/*===============================================================================================*/
//  This program based on -> anime-offline-database (by manami-project)
//  GitHub Repository -> https://github.com/manami-project/anime-offline-database
//  License -> GNU Affero General Public License v3.0
//  License URL -> https://github.com/manami-project/anime-offline-database/blob/master/LICENSE 
/*===============================================================================================*/
var cvs = document.getElementById("ayayaxdd");
var ctx = cvs.getContext("2d");
// focus stopper
let windowVisibility = false;
let onhideMusicPaused = false;
window.onfocus = window.onpageshow = () => {
    windowVisibility = true; fpsFocusSwitch = true;
    //
    if(onhideMusicPaused) {onhideMusicPaused = false; musicNormalPause(1)}
};
window.onpagehide = window.onblur = () => {
    windowVisibility = false; fpsFocusSwitch = true
};
// database shorter
function databaseShorter() {
    for(var a in adb) {
        delete adb[a].relations;
        delete adb[a].thumbnail
    }
};
//
// @EAG SUMMARY
//
let $appInfo = {
    // main @rel
    version: '1.2 beta',
    date: '20-12-2023',
    name: 'AYAYA', // поч такое название? да по рофлу (до последнего хотел `ayayaxdd` - название смайла с `7TV`)
    fullname: 'AYAYA - Anime Roulette',
    author: 'potapello',
    license: 'GNU General Public License v3.0',
    licenseURL: 'https://github.com/potapello/ayayaxdd/blob/main/LICENSE',
    // other
    codename: 'ayayaxdd', // EAG? в самом начале это называлось 'Everlasting Anime Gauntlet', но это сложно и вообще хуйня
    cleft: 'ayayaxdd 1.2 beta',
    cright: 'created by potapello',
};
//
// @EAG FPS
// уёбск
let fpsCalcFreq = 10;
var FPS = 0, deltaTime = 0, oldTime = 0;
let fpsFrames = 0, fpsSumm = 0;
let timeMultiplier = 1;
//
let fpsFocusLimiter = 20;
let fpsFocusLast = Number();
let fpsFocusSwitch = false;
function workWithFPS() {
    // // limit fps, if no focus @RELEASE
    if(fpsFocusSwitch) {
        fpsFocusSwitch = false;
        if(windowVisibility) {
            lockFpsSwitch(0, false)
        } else {
            fpsFocusLast = Number(pref.framerate);
            lockFpsSwitch(fpsFocusLimiter, false)
        }
    };
    //
    deltaTime = performance.now() - oldTime;
    oldTime = performance.now();
    //
    fpsFrames++;
    fpsSumm += deltaTime;
    //
    deltaTime = timeMultiplier * deltaTime
};
//
setInterval(() => {
    FPS = floatNumber(1000 / (fpsSumm / fpsFrames), 2);
    graphFPS.update(FPS);
    //
    fpsFrames = 0;
    fpsSumm = 0
}, 1000/fpsCalcFreq);
//
// @EAG GRAPH CLASS
//
class Graph {
    constructor(name, height_pixels, width_elements) {
      this.name = name; this.height = height_pixels; this.width = width_elements;
    }
    // add array
    array = []
    pickup = 0;
    max = 0;
    // updating
    update(newNumber) {
        if(this.array.length < this.width) {
          this.array.unshift(newNumber);
        } 
        else {
          this.array.unshift(newNumber);
          this.array.pop();
        }
    }
    // drawing graph
    draw(pos, elem_spacing=1, min=0, colors = {bg:`rgba(0,0,0,${pref.bgalpha})`,fg:'#f009',line:'#f000',text:'#ffff'}) {
        // array debug
        if(this.array[0] == undefined) {this.array[0] = 0};
        // calculate
        min = findMin(this.array, min);
        this.pickup = min*(-1);
        this.max = findMax(this.array) + this.pickup;
        // draw background
        ctx.fillStyle = colors.bg;
        ctx.fillRect(pos.x-1, pos.y-1, (this.width*elem_spacing), this.height+1);
        //
        // foreground path & draw
        ctx.beginPath();
        ctx.moveTo(pos.x-1, pos.y+this.height-(((this.array[0]+this.pickup)/this.max)*this.height)+2);
        if(this.array.length > 1) {
            for(var i = 1; i < this.array.length; i++) {
                ctx.lineTo(pos.x+i*elem_spacing+elem_spacing/1.15, pos.y+this.height-(((this.array[i]+this.pickup)/this.max)*this.height)+2)
            }
        }
        ctx.lineTo(pos.x+(this.array.length-1)*elem_spacing+elem_spacing/1.15, pos.y+this.height);
        ctx.lineTo(pos.x-1, pos.y+this.height);
        ctx.fillStyle = colors.fg;
        ctx.fill();
        //
        // line path & draw
        ctx.beginPath();
        ctx.lineWidth ="2";
        ctx.moveTo(pos.x, pos.y+this.height-(((this.array[0]+this.pickup)/this.max)*this.height)+2);
        if(this.array.length > 1) {
            for(var i = 1; i < this.array.length; i++) {
                ctx.lineTo(pos.x+i*elem_spacing+elem_spacing/1.15-1, pos.y+this.height-(((this.array[i]+this.pickup)/this.max)*this.height)+2)
            }
        }
        ctx.strokeStyle = colors.line;
        ctx.stroke();
        // draw any info
        ctx.fillStyle = colors.text;
        ctx.font = "12px Helvetica";
        // max & min
        ctx.textAlign = "start";
        ctx.fillText(findMax(this.array), pos.x+2, pos.y+12);
        ctx.fillText(findMin(this.array, min), pos.x+2, pos.y+this.height-3);
        // name, average
        ctx.textAlign = "end";
        ctx.fillText(this.name, pos.x+this.width*elem_spacing-6, pos.y+12);
        ctx.fillText('Avg ' + findCent(this.array, true), pos.x+this.width*elem_spacing-6, pos.y+this.height-3);
    }
};
// graph functions
function findMax(array) {
    var max = array[0];
    for(var i = 1; i < array.length; i++) {
        if(max >= array[i]) {continue} else {max = array[i]}
    }; return max
};
function findMin(array, default_min) {
    var min;
    if(default_min || default_min == 0) {min = default_min} else {min = array[0]};
    for(var i = 0; i < array.length; i++) {
        if(min <= array[i]) {continue} else {min = array[i]}
    }; return min
};
function findCent(array) {
    var summ = 0;
    for(var i = 0; i < array.length; i++) {summ += Number(String(array[i])) !== NaN ? array[i] : 0};
    return Math.floor(summ/array.length*10)/10
};
//
let graphFPS = new Graph('FPS', 80, 100);
// let graphClipSync = new Graph('VcSO', 50, 300);
//
// @EAG VECTOR1 CLASS
//
class Vector1 {
    constructor(value=0) {
        this.value = value;
        this.Diff = 0; this.Mod = 0;
        this.time = 0; this.dtime = 0;
        this.ease = 0;
        this.onupd = () => {}
    }
    reset() {
        this.value = 0;
        this.Diff = 0; this.Mod = 0;
        this.time = 0; this.dtime = 0;
        this.ease = false;
    }
    set(value) {this.reset(); this.value = Number(String(value))}
    get() {return this.value + this.Mod}
    getFixed() {return this.value + this.Diff}
    applyMod() {
        this.value += this.Mod;
        this.Mod = 0;
        this.Diff = 0;
        this.time = 0; this.dtime = 0;
        this.ease = false;
    }
    applyDiff() {
        if(this.ease !== false) {
            this.value += this.ease(1) * this.Diff
        } else {
            this.value += this.Diff
        };
        this.Mod = 0;
        this.Diff = 0;
        this.time = 0; this.dtime = 0;
        this.ease = false;
    }
    update() {
        if(this.Diff !== 0) {
            if(this.time > this.dtime) {
                if(this.ease) {
                    this.Mod = this.ease(this.dtime / this.time) * this.Diff; 
                } else {
                    this.Mod = (this.dtime / this.time) * this.Diff; 
                }
            } else {
                this.applyDiff();
                this.dtime = 0
            };
            this.onupd();
            this.dtime += deltaTime
        }
    }
    isMoving() {
        return this.Diff !== 0
    }
    addMove(value) {
        this.Diff += value - this.Diff;
        this.dtime = 0;
    };
    move(value, sec = 1, ease = false) {
        this.applyMod();
        this.Diff = value - this.value;
        this.time = sec * 1000;
        this.ease = ease;
    }
    offset(value, sec = 1, ease = false) {
        this.applyMod();
        this.Diff = value;
        this.time = sec * 1000;
        this.ease = ease;
    }
};
//
// @EAG VECTOR2 CLASS
//
class Vector2 {
    constructor(x=0, y=x) {
        this.x = x; this.y = y;
        this.xMod = 0; this.yMod = 0;
        this.time = 0; this.dtime = 0;
        this.xDiff = 0; this.yDiff = 0;
        this.ease = false
    }
    sumv(vec) {return new Vector2(this.x + vec.x, this.y + vec.y)}
    sumxy(ux, uy=ux) {return new Vector2(this.x + ux, this.y + uy)}
    minv(vec) {return new Vector2(this.x - vec.x, this.y - vec.y)}
    minxy(sx, sy=sx) {return new Vector2(this.x - sx, this.y - sy)}
    dividev(vec) {return new Vector2(this.x / vec.x, this.y / vec.y)}
    dividexy(dx, dy=dx) {return new Vector2(this.x / dx, this.y / dy)}
    multv(vec) {return new Vector2(this.x * vec.x, this.y * vec.y)}
    multxy(mx, my=mx) {return new Vector2(this.x * mx, this.y * my)}
    setv(vec) {this.x = Number(String(vec.x)); this.y = Number(String(vec.y))}
    setxy(newx, newy=newx) {this.x = Number(String(newx)); this.y = Number(String(newy))}
    invert() {this.x = this.x*this.y; this.y = this.x/this.y; this.x = this.x/this.y}
    minus() {this.x *= -1; this.y *= -1}
    sign(sign) {
        if(sign < 0) {
            if(this.x > 0) {this.x *= -1};
            if(this.y > 0) {this.y *= -1}};
        if(sign > 0) {
            if(this.x < 0) {this.x *= -1}; 
            if(this.y < 0) {this.y *= -1}};
        if(sign == 0) {this.x = 0; this.y = 0}; return new Vector2(this.x, this.y)};
    abs() {return new Vector2(Math.abs(this.x), Math.abs(this.y))}
    round() {return new Vector2(Math.round(this.x), Math.round(this.y))}
    floor() {return new Vector2(Math.floor(this.x), Math.floor(this.y))}
    ceil() {return new Vector2(Math.ceil(this.x), Math.ceil(this.y))}
    hypot() {return Math.hypot(this.x, this.y)}
    $(tag = 'Vector2') {console.log(`Vector ${tag} -> X: ${this.x}, Y: ${this.y}.`)}
    condAND(vec) {if(this.x == vec.x && this.y == vec.y) {return true} else {return false}}
    condOR(vec) {if(this.x == vec.x || this.y == vec.y) {return true} else {return false}}
    overAND(vec) {if(this.x >= vec.x && this.y >= vec.y) {return true} else {return false}}
    overSAND(vec) {if(this.x > vec.x && this.y > vec.y) {return true} else {return false}}
    overOR(vec) {if(this.x >= vec.x || this.y >= vec.y) {return true} else {return false}}
    overSOR(vec) {if(this.x > vec.x || this.y > vec.y) {return true} else {return false}}
    lessAND(vec) {if(this.x <= vec.x && this.y <= vec.y) {return true} else {return false}}
    lessSAND(vec) {if(this.x < vec.x && this.y < vec.y) {return true} else {return false}}
    lessOR(vec) {if(this.x <= vec.x || this.y <= vec.y) {return true} else {return false}}
    lessSOR(vec) {if(this.x < vec.x || this.y < vec.y) {return true} else {return false}}
    reset() {
        this.x = 0; this.y = 0;
        this.xMod = 0; this.yMod = 0;
        this.time = 0; this.dtime = 0;
        this.xDiff = 0; this.yDiff = 0;
        this.ease = false;
    }
    comp(abs=false) {if(abs) {return Math.abs(this.x)+Math.abs(this.y)} else {return this.x + this.y}}
    decr(sx, sy, decr) {
        if(this.x != sx) {
            if(this.x-decr > sx) {this.x -= decr} else {this.x = sx}
            if(this.x+decr < sx) {this.x += decr} else {this.x = sx}
        };
        if(this.y != sy) {
            if(this.y-decr > sy) {this.y -= decr} else {this.y = sy}
            if(this.y+decr < sy) {this.y += decr} else {this.y = sy}
        }; return new Vector2(this.x, this.y)
    }
    // VECTOR2 ANIMATOR METHODS
    get() {return new Vector2(this.x + this.xMod, this.y + this.yMod)}
    getFixed() {return new Vector2(this.x + this.xDiff, this.y + this.yDiff)}
    applyMod() {
        this.x += this.xMod;
        this.y += this.yMod;
        this.xDiff = 0; this.yDiff = 0;
        this.xMod = 0; this.yMod = 0;
        this.time = 0; this.dtime = 0;
        this.ease = false;
    }
    isMoving() {
        return this.xDiff !== 0 || this.yDiff !== 0
    }
    applyDiff() {
        if(this.ease !== false) {
            this.x += this.ease(1) * this.xDiff;
            this.y += this.ease(1) * this.yDiff
        } else {
            this.x += this.xDiff;
            this.y += this.yDiff
        };
        this.xDiff = 0; this.yDiff = 0;
        this.xMod = 0; this.yMod = 0;
        this.time = 0; this.dtime = 0;
        this.ease = false;
    }
    update() {
        if(this.xDiff !== 0 || this.yDiff !== 0) {
            if(this.time > this.dtime) {
                if(this.ease) {
                    this.xMod = this.ease(this.dtime / this.time) * this.xDiff; 
                    this.yMod = this.ease(this.dtime / this.time) * this.yDiff; 
                } else {
                    this.xMod = (this.dtime / this.time) * this.xDiff; 
                    this.yMod = (this.dtime / this.time) * this.yDiff; 
                }
            } else {
                this.applyDiff();
                this.dtime = 0
            };
            this.dtime += deltaTime
        }
    }
    movev(vec2, sec = 1, ease = false) {
        this.applyMod();
        this.xDiff = vec2.x - this.x;
        this.yDiff = vec2.y - this.y;
        this.time = sec * 1000;
        this.ease = ease;
    }
    movexy(x, y, sec = 1, ease = false) {
        this.applyMod();
        this.xDiff = x - this.x;
        this.yDiff = y - this.y;
        this.time = sec * 1000;
        this.ease = ease;
    }
    offsetv(vec2, sec = 1, ease = false) {
        this.applyMod();
        this.xDiff = vec2.x;
        this.yDiff = vec2.y;
        this.time = sec * 1000;
        this.ease = ease;
    }
    offsetxy(x, y, sec = 1, ease = false) {
        this.applyMod();
        this.xDiff = x;
        this.yDiff = y;
        this.time = sec * 1000;
        this.ease = ease;
    }
};
//
// @EAG LIGHT TRANSFORM CLASS
//
class Transform {
    constructor(position = new Vector2(), size = new Vector2(), angle = new Vector1(), alpha = new Vector1(1)) {
        this.pos = position; this.size = size; this.angle = angle; this.alpha = alpha
    }
    raw() {return new Transform(this.pos, this.size, this.angle, this.alpha)}
    update() {
        this.pos.update();
        this.size.update();
        this.angle.update();
        this.alpha.update();
    }
    centeredAngle() {
    }
};
//
// @EAG EASINGS
//
function easeOutQuint(x) {
    return (1 - Math.pow(1 - x, 5))
};
function easeInOutCubic(x) {
    if(x < 0.5) {return 4 * x * x * x} 
    else {return 1 - Math.pow(-2 * x + 2, 3) / 2}
};
function easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2
};
function easeInQuad(x) {
    return x * x
};
function easeInCirc(x) {
    return 1 - Math.sqrt(1 - Math.pow(x, 2))
};
function easeParabolaQuad(x) {
    return (-x * (4 * x)) + (4 * x)
};
function easeOutCirc(x) {
    return Math.sqrt(1 - Math.pow(x - 1, 2))
};
function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
};
function easeInCubic(x) {
    return Math.abs(x * x * x)
};
function easeInQuint(x) {
    return Math.pow(x, 5)
};
function easeOutQuint(x) {
return 1 - Math.pow(1 - x, 5)
};
//
// @EAG MOUSE INPUT
//
let mouse = {
    old: new Vector2(0),
    pos: new Vector2(0),
    delta: new Vector2(0),
    holdTicks: 0,
    wheelTicks: 0,
    holded: false,
    wheel: 0,
    press: false,
    click: false,
    context: false,
    next: false,
    preview: false,
    oldtouch: [new Vector2(), new Vector2()],
};
let _def_mouse = JSON.stringify(mouse);
//
let wheelState = 'idle';
let touchScroll = 0;
let _holdTicks = 1;
let _wheelTicks = 1;
mouse.holdTicks = _holdTicks;
mouse.wheelTicks = _wheelTicks;
// mouse position
document.addEventListener('mousemove', (e) => {
    mouse.pos.setxy(e.clientX, e.clientY)
});
// get wheel compatible
if (document.addEventListener) {
    if ('onwheel' in document) {
      // iExplorer > 8, FFox > 17, Chrome > 31
      document.addEventListener("wheel", onWheel);
    } else if ('onmousewheel' in document) {
      // Chrome < 31
      document.addEventListener("mousewheel", onWheel);
    } else {
      // FFox < 17
      document.addEventListener("MozMousePixelScroll", onWheel);
    }
    // iExplorer < 8
} else {
    document.attachEvent("onmousewheel", onWheel);
};
// wheel list  
function onWheel(e) {
    e = e || window.event;
    // wheelDelta not support count of pixels
    mouse.wheel += Math.sign(e.deltaY || e.detail || e.wheelDelta);
    getMousewheel()
};
function getMousewheel() {
    var a = mouse.wheel;
    mouse.wheel = 0;
    if(a != 0) {if(a > 0) {a = 'btm'} else {a = 'top'}} else {a = 'idle'};
    wheelState = a
};
// mouse button events
document.addEventListener('mousedown', (e) => {
    if(e.button == 0) {mouse.press = true};
    if(e.button == 3) {mouse.preview = true};
});
document.addEventListener('mouseup', (e) => {
    if(e.button == 0) {mouse.press = false};
    if(e.button == 3) {mouse.preview = false};
});
//
// @EAG TOUCH INPUT
//
document.addEventListener('touchmove', (e) => {
    // mouse pos
    mouse.pos.setxy(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    // try to scroll
    touchScroll = 0;
    if(e.changedTouches[1] !== undefined) {
        var scroll = [
            mouse.oldtouch[0].y - e.changedTouches[0].clientY,
            mouse.oldtouch[1].y - e.changedTouches[1].clientY
        ];
        if(scroll[0] > 0 && scroll[1] > 0) {
            touchScroll = (scroll[0] + scroll[1]) / 2 * _scaleDynamic
        };
        //
        mouse.oldtouch[0].setxy(e.changedTouches[0].x, e.changedTouches[0].y);
        mouse.oldtouch[1].setxy(e.changedTouches[1].x, e.changedTouches[1].y)
    }
});
document.addEventListener('touchstart', (e) => {mouse.press = true});
document.addEventListener('touchend', (e) => {mouse.press = false});
//
// @EAG KEYBOARD INPUT
//
let keyboard = {};
let cheatPrompt = [];
function keyPressed(key = String()) {
    if(keyboard[key] === undefined) {
        return false
    } else {
        const k = keyboard[key];
        keyboard[key] = false;
        return k
    }
};
//
document.addEventListener('keyup', (e) => {
    keyboard[e.key] = false
});
document.addEventListener('keydown', (e) => {
    keyboard.EVENT = true;
    keyboard[e.key] = true;
});
//
// @EAG INPUT LISTENER
//
function inputListener() {
    // KEYBOARD
    if(keyboard.EVENT !== undefined) {
        // scaling
        if(keyPressed('+') || keyPressed('=')) {_scaleFixed < 3.9 ? cvsscale.move(_scaleFixed+0.1, 0.25, easeOutCirc) : false; globalRescale()};
        if(keyPressed('-')) {_scaleFixed >= 0.6 ? cvsscale.move(_scaleFixed-0.1, 0.25, easeOutCirc) : false; globalRescale()};
        // return to roulette screen
        if(keyPressed('Escape') || mouse.preview) {
            mouse.preview = false;
            if(activeScreen !== screenRoulette && activeScreen !== screenLoading) {
                requestScreen(screenRoulette)
            }
        };
        if(activeScreen == screenRoulette && roulette.catchWinner !== true) {
            // roulette key scroll
            if(keyPressed('ArrowLeft')) {
                roulette.pause(5000);
                roulette.progress.move(Math.round(roulette.progress.getFixed())-1, 0.3, easeOutCirc)
            } else if(keyPressed('ArrowRight')) {
                roulette.pause(5000);
                roulette.progress.move(Math.round(roulette.progress.getFixed())+1, 0.3, easeOutCirc)
            } else if(keyPressed(' ')) {
                buttonDoRoll.onclick()
            };
            // music menu keys
            if(keyPressed('ArrowUp')) {
                mnMenu.active(-1);
            } else if(keyPressed('ArrowDown')) {
                mnMenu.active(1);
            };
            if(keyPressed('Enter')) {mnMenu.apply = true} 
            else if(keyPressed('1')) {mnMenu.plan = true}
        };
        if(keyPressed('~')) {
            cheatPrompt = String(prompt('Write a command...')).split(' ');
            checkCheatPrompt()
        };
        // end
        keyboard = {}
    };
    // reset
    mouse.click = false;
    // mouse button hold
    if(mouse.press) {
        if(mouse.holdTicks > 0) {
            mouse.holdTicks -= deltaTime
        } else {
            mouse.holded = true
        }
    } else {
        if(mouse.holdTicks != _holdTicks) {
            mouse.holdTicks = _holdTicks;
            // focus
            mouse.click = true
        };
        if(mouse.holded) {mouse.holded = false}
    };
    // mouse wheel state
    if(wheelState !== 'idle') {
        if(mouse.wheelTicks > 0) {
            mouse.wheelTicks -= deltaTime
        } else {
            mouse.wheelTicks = _wheelTicks;
            wheelState = 'idle'
        }
    };
    // calc mouse delta
    mouse.delta = mouse.pos.minv(mouse.old);
    mouse.old.setv(mouse.pos);
    // detect file manager results
    if(fileManager.result != null && fileManager.result != false) {
        if(fileManager.onupload != null) {fileManager.onupload(); fileManager.onupload = null}
    }
};
//
// @EAG LOCAL FILE MANAGER
//
let fileManager = {
    // blobs
    createBlobJSON: (data) => {
        return new Blob([data], { type: "application/json" })
    },
    createBlobText: (data) => {
        return new Blob([data], { type: "text/plain" })
    },
    // download
    downloadJSON: (name, data) => {
        const a = document.createElement("a");
        const file = fileManager.createBlobJSON(JSON.stringify(data));
        const url = window.URL.createObjectURL(file);
        a.href = url;
        a.download = String(name) + ".json";
        a.click()
    },
    downloadText: (name, text) => {
        const a = document.createElement("a");
        const file = fileManager.createBlobText(String(text));
        const url = window.URL.createObjectURL(file);
        a.href = url;
        a.download = String(name) + ".txt";
        a.click()
    },
    // upload
    request: false,
    result: null,
    message: '',
    input: document.createElement('input'),
    onupload: null,
    // upl text
    uploadText: (maxsize = powsOfTwo['20']) => {
        fileManager.input = document.createElement('input');
        fileManager.input.type = 'file';
        //
        fileManager.request = true,
        fileManager.result = false,
        //
        fileManager.input.onchange = () => {
            //
            var file = fileManager.input.files[0];
            if(file.type === 'text/plain' && file.size <= maxsize) {
                var reader = new FileReader();
                reader.readAsText(file);
                //
                reader.onload = function() {
                    fileManager.result = reader.result;
                    fileManager.request = false;
                    fileManager.message = 'Success';
                    console.info('FileManager: '+fileManager.message)
                };
                reader.onerror = function() {
                    fileManager.result = reader.error;
                    fileManager.request = false;
                    fileManager.message = 'Reader error';
                    console.error('FileManager: '+fileManager.message)
                }
            } else {
                fileManager.result = null;
                fileManager.request = false;
                fileManager.message = 'File type is not [text/plain] OR size of the uploaded file is larger than the specified maximum';
                console.warn('FileManager: '+fileManager.message)
            };
        };
        fileManager.input.click()
    },
    // upl json
    uploadJSON: (maxsize = powsOfTwo['20']) => {
        fileManager.input = document.createElement('input');
        fileManager.input.type = 'file';
        //
        fileManager.request = true,
        fileManager.result = false,
        //
        fileManager.input.onchange = () => {
            //
            var file = fileManager.input.files[0];
            if(file.type === 'application/json' && file.size <= maxsize) {
                var reader = new FileReader();
                reader.readAsText(file);
                //
                reader.onload = function() {
                    fileManager.result = JSON.parse(reader.result);
                    fileManager.request = false;
                    fileManager.message = 'Success';
                    console.info('FileManager: '+fileManager.message)
                };
                reader.onerror = function() {
                    fileManager.result = reader.error;
                    fileManager.request = false;
                    fileManager.message = 'Reader error';
                    console.error('FileManager: '+fileManager.message)
                }
            } else {
                fileManager.result = null;
                fileManager.request = false;
                fileManager.message = 'File type is not [text/plain] OR size of the uploaded file is larger than the specified maximum';
                console.warn('FileManager: '+fileManager.message)
            };
        };
        fileManager.input.click()
    },
};
//
// @EAG PROMPT FUNCTIONS
//
function promptNumber(text, min, max, actual) {
    var p = String(Number(prompt(text, actual)));
    if(p === 'NaN' || p === 'null') {return actual}
    else {p = Number(p)};
    return p < min ? min : p > max ? max : p
};
//
// @EAG CHEAT COMMANDS
//
function checkCheatPrompt() {
    if(activeScreen == screenRoulette && roulette.catchWinner !== true) {
        for(var key in _cheats) {
            if(cheatPrompt[0] == key) {
                _cheats[key](cheatPrompt); 
                break
            }
        }
    }
};
function cheater(cheat) {
    if(cheat == null) {return};
    cheatPrompt = cheat.split(' ');
    checkCheatPrompt()
};
//
let _cheats = {
    values: {},
    'winner': () => {
        if(!roulette.hidemap) {
            if(roulette.winnerPos >= 0) {
                if(roulette.pics[roulette.winnerPos] !== undefined) {
                    roulette.pics[roulette.winnerPos].bgColor = new Color(0,0,0,1);
                    roulette.pics[roulette.winnerPos].winner = false;
                    roulette.winnerPos = -1
                }
            };
            //
            roulette.speed.reset();
            roulette.catchWinner = roulette.centerItem();
            roulette.winnerPos = roulette.centerNumber();
            roulette.nameboxcolor = roulette.winnerStyle;
            lsSaveObject('roulette.winner', [roulette.winnerPos, roulette.catchWinner])
        }
    },
    'delete-title': () => {
        if(!roulette.hidemap) {
            var title = roulette.centerNumber();
            if(roulette.winnerPos == title) {
                localStorage.removeItem(savePrefix+'roulette.winner');
                roulette.catchWinner = false;
                roulette.winnerPos = -1
            };
            roulette.anime.splice(title, 1);
            roulette.pics.splice(title, 1);
            roulette.picsCount -= 1;
        }
    },
    'save-roulette': () => {
        lsSaveObject('roulette.anime', optimizeAnimeArray(roulette.anime))
    },
    'hard-reset': () => {
        localStorage.clear();
        sessionStorage.clear();
        window.open(window.location.href);
        window.close()
    },
    'botagiri': () => {
        pref.playClip = true;
        musicNormalVolume.move(0, 1, easeInOutSine);
        setTimeout(() => {musicNormal.pause()}, 1000);
        clipmainOnCanPlay = () => {
            videoClipPlay();
            roulette.doRoll(clipmainTime, pref.rollSpeed, false);
            srv.hideProgress.value = 0;
            srv.hideProgress.move(1, srv.hideTime, easeInQuad);
            srv.state = 'roll_start';
            tInfo.hidereq = true;
            buttonDoRoll.state = 'unaval';
            musicNormalVolume.reset();
            visual.lightDiam.move(0, 0.25, easeInCirc);
            //
            setTimeout(() => {buttonDoRoll.text = txt('rbRoll')}, 2000)
        };
        videoClipSet(new videoClip(['audio/clip1.ogg', 0, 'Shikitashi - Botagiri (YTPMV)'], 0, 63.1,   'w0i5vrvg2qat8mawfjy2i/video1.webm?rlkey=vc7tda62c9s0kfcznxnm02240'))
    },
    'clip': (args) => {
        if(args[1] === undefined) {return};
        if(String(Number(args[1])) == 'NaN') {return};
        var number = Number(args[1]);
        if(number < 0 || number >= clips.length) {return};
        _clipSelected = number;
        playSound(sound['taginc'])
    },
    'snowflakes': (args) => {
        if(args[1] === undefined) {return};
        if(String(Number(args[1])) == 'NaN') {return};
        var number = Number(args[1]);
        snowflake.count = number < 0 ? 0 : number > 1024 ? 1024 : number;
        resetSnowflakes()
    },
};
//
// @EAG OTHER CLASSES
//
class Range {
    constructor(min, max) {this.min = min; this.max = max}
};
//
// @EAG MATH FUNCTIONS
//
Math.norma = (x) => {
    return x > 1 ? 1 : x < 0 ? 0 : x
};
function moreThanZero(value) {
    return value < 0 ? 0 : value
}
function timeStringify(sec) {
    if(String(sec) == 'NaN') {return `0:00`}
    else {
        const m = Math.floor(sec/60);
        const s = Math.floor(sec - m*60);
        return `${m}:${s>=10?s:'0'+s}`
    }
};
function floatNumber(x, digits=1) {
    const d = Math.pow(10, Math.abs(digits))
    return Math.round(x * d) / d
};
//
let powsOfTwo = {
    '10': Math.pow(2, 10),
    '20': Math.pow(2, 20),
    '30': Math.pow(2, 30),
};
function bytesStringify(bytes) {
    if(bytes < powsOfTwo['10']) {
        return `${floatNumber(bytes, 2)} B`
    } else if(bytes >= powsOfTwo['10'] && bytes < powsOfTwo['20']) {
        return `${floatNumber(bytes / powsOfTwo['10'], 2)} KB` 
    } else if(bytes >= powsOfTwo['20'] && bytes < powsOfTwo['30']) {
        return `${floatNumber(bytes / powsOfTwo['20'], 2)} MB`
    } else if(bytes >= powsOfTwo['30']) {
        return `${floatNumber(bytes / powsOfTwo['30'], 2)} GB`
    } else {
        return '? bytes'
    }
};
//
// @EAG VIDEO CLIP CLASS
//
const _gdPrefix = 'https://drive.google.com/uc?export=download&id=';
const _dropboxAffix = ['https://www.dropbox.com/scl/fi/','&raw=1'];
function _dropboxURL(key) {
    return  String(_dropboxAffix[0] + key + _dropboxAffix[1])
};
//
class videoClip {
    constructor(music, video_anchor, time, video_url) {
        this.m = music;
        this.v = [_dropboxURL(video_url), video_anchor];
        this.time = time;
    }
};
//
let _musictimestamp = 0;
let _cliptimestamp = 0;
function videoClipPlay(time = 1) {
    clipmainPlay = true;
    clipmainAlpha.set(0);
    clipmainAlpha.move(1, time, easeInOutSine);
    clipmain.play();
    //
    musicNormalVolume.move(0, time, easeInOutSine);
    musicRollVolume.set(0);
    musicRollVolume.move(1, time, easeInOutSine);
    musicRoll.play();
    //
    setTimeout(() => {
        musicNormal.pause();
    }, 1000*time);
    // initial sync
    setTimeout(videoClipSync, _videoclipsyncrate);
};
function videoClipCan() {
    return clipmainLoaded && musicrollLoaded
};
let _videoclipsyncrate = 2000;
function videoClipSync() {
    if(Math.abs((clipmain.currentTime - _cliptimestamp) - (musicRoll.currentTime - _musictimestamp)) > 0.1) {
        console.log(`Sync clip... (offset: ${(clipmain.currentTime - _cliptimestamp) - (musicRoll.currentTime - _musictimestamp)})`);
        musicRoll.currentTime = _musictimestamp + (clipmain.currentTime - _cliptimestamp) + 0.05;
        setTimeout(videoClipSync, _videoclipsyncrate)
    } else {console.info('Clip sync stopped.')}
}
function videoClipSet(clip) {
    //
    musicrollLoaded = false;
    musicRoll.src = clip.m[0];
    _musictimestamp = musicRoll.currentTime = clip.m[1];
    clipmainName = clip.m[2];
    musicRoll.oncanplay = () => {musicrollLoaded = true};
    //
    clipmainLoaded = false;
    clipmain = document.createElement('video');
    clipmain.src = clip.v[0];
    _cliptimestamp = clipmain.currentTime = clip.v[1];
    clipmainTime = clip.time;
    clipmain.preload = 'auto';
    clipmain.oncanplay = () => {clipmainLoaded = true};
    clipmain.onended = () => {clipmain.pause()};
    //
    clipWaiting = clipTimeout;
    _clipmainBuffered = [];
};
function videoClipEnd(time = 1) {
    //
    clipmainPlay = false;
    musicLite.name = clipmainName;
    musicNormal.pause();
    musicNormal.src = String(musicRoll.src);
    if(pref.bgmusic > 0) {musicNormal.play()};
    musicNormal.currentTime = Number(String(musicRoll.currentTime));
    musicRollVolume.move(0, time, easeInOutSine);
    clipmainAlpha.move(0, time, easeInOutSine);
    setTimeout(() => {
        musicNormalVolume.move(1, time, easeInOutSine);
        musicRoll.pause();
        clipmain.pause()
    }, time*1000)
};
function videoClipUnload(time = 1) {
    rollBar.state = 'show';
    buttonDoRoll.text = txt('rbRoll');
    musicLite.show();
    musicLite.wait = false;
    //
    clipmainPlay = false;
    clipmainOnCanPlay = null;
    musicNormal.pause();
    if(pref.bgmusic > 0) {musicNormal.play()};
    musicRoll.oncanplay = () => {};
    clipmain.oncanplay = () => {};
    musicRollVolume.set(0);
    clipmainAlpha.set(0);
    musicNormalVolume.move(1, time, easeInOutSine);
    //
    console.error('Clip downloading time out! (20 s.)\nTry roll again OR disable \'Videoclips\' in Options.')
};
//
let _clipmainBuffered = [];
function videoClipBuffered() {
    for(let i = 0; i < clipmain.buffered.length; i++) {
        _clipmainBuffered[i] = [];
        _clipmainBuffered[i][0] = clipmain.buffered.start(i) / clipmain.duration;
        _clipmainBuffered[i][1] = clipmain.buffered.end(i) / clipmain.duration
    };
};
//
let clipmain = document.createElement('video');
clipmain.src = '';
clipmain.preload = 'auto';
clipmain.onended = () => {clipmain.pause()};
//
let clipmainLoaded = false;
let musicrollLoaded = false;
let clipmainTime = 0;
let clipmainAlpha = new Vector1(0);
let clipmainName = '';
let clipmainPlay = false;
let clipmainOnCanPlay = null;
//
let clipWaiting = 20;
let clipTimeout = 20;
//
// @EAG ALL AUDIO DATA
//
let sound = {
    'scroll': new Audio('sounds/scroll.ogg'),
    'button': new Audio('sounds/button.ogg'),
    'tagnone': new Audio('sounds/tagnone.ogg'),
    'taginc': new Audio('sounds/taginc.ogg'),
    'tagexc': new Audio('sounds/tagexc.ogg'),
    'loaded': new Audio('sounds/loaded.mp3'),
    'screen': new Audio('sounds/screen.ogg'),
    'winner': new Audio('sounds/winner.ogg'),
    'roll': new Audio('sounds/roll.ogg'),
    'prompt': new Audio('sounds/prompt.ogg'),
    'player': new Audio('sounds/player.ogg'),
};
let music = [
    //['src', rolltime, 'name'],
    // music
    ['audio/music1.ogg', 61, 'Kuhaku Gokko - Lil\'b'],
    ['audio/music2.ogg', 49, 'Miku Sawai - Gomen ne, Iiko ja Irarenai'],
    ['audio/music3.ogg', 17, 'DUSTCELL - Narazumono'],
    ['audio/music4.ogg', 0, 'Cagayake! - GIRLS'],
    ['audio/music5.ogg', 35, 'bulow - Revolver'], // над заменить, нахуй оно тут? 
    ['audio/music6.ogg', 0, 'Aoi Yuki - Los! Los! Los!'],
    ['audio/music7.ogg', 41, 'Ado - AntiSystem\'s'],
    ['audio/music8.ogg', 44, 'Kenshi Yonezu - KICK BACK'],
    ['audio/music9.ogg', 34, 'BABYMETAL - Divine Attack'],
    ['audio/music10.ogg', 0, 'Uesaka Sumire - Inner Urge'],
    ['audio/music11.ogg', 47.5, 'Kanako Itou - Fatima'],
    ['audio/music12.ogg', 36, 'Kanako Itou - Hacking to the Gate'],
    ['audio/music13.ogg', 0, 'ZOE, Jododo - Lighting'], // мб поискать нарезочку из игры
    ['audio/music14.ogg', 0, 'Ikimono Gakari - Blue Bird'],
    ['audio/music15.ogg', 46, 'Uverworld - Touch off'],
    ['audio/music16.ogg', 55, 'Masayuki Suzuki - Love Dramatic'],
    ['audio/music17.ogg', 0, 'Takuma Terashima - Nameless story'], // мб оп
    ['audio/music18.ogg', 42, 'Konomi Suzuki - Redo'],
    ['audio/music19.ogg', 34, 'Huwie Ishizaki - Wasuregataki'],
    ['audio/music20.ogg', 49, 'yama - Shikisai'],
    ['audio/music21.ogg', 27, 'Kessoku Band - Seishun Complex'],
    ['audio/music22.ogg', 51, 'Perfume - Pick Me Up'], // поискать надо
    ['audio/music23.ogg', 23, 'Nightcore - Everytime We Touch'], // искать надо
    ['audio/music24.ogg', 11, 'beatMARIO - Night of Nights'], // искать надо
    ['audio/music25.ogg', 48, 'FELT - Summer Fever'],
    ['audio/music26.ogg', 20.5, 'SEREBRO - Мало тебя (speed up)'],
    ['audio/music27.ogg', 50, 'Touhou - Bad Apple!!'],
    // bloody stream - жёжё оп, с клипом
    // guren no yumiya - титосы оп, с клипом
];
// 
let cliponly = [
    ['audio/clip1.ogg', 31, 'Shikitashi - Botagiri (YTPMV)'],
    ['audio/clip2.ogg', 55, 'skwd - Aquarius (YTPMV)'],
    music[26], // тайминг прост 1 и тот же, нхй ещ рз не буд писать, и так NASRAL
    ['audio/clip3.ogg', 35, 'skwd - Point of no return (YTPMV)'],
    ['audio/clip4.ogg', 78, 'beoh - Yuyushiki Factory (YTPMV)'],
    ['audio/music4.ogg', 53.7, 'Cagayake! - GIRLS'],
    ['audio/music7.ogg', 51.2, 'Ado - AntiSystem\'s'],
    ['audio/music10.ogg', 10.85, 'Uesaka Sumire - Inner Urge'],
    ['audio/music8.ogg', 38.05, 'Kenshi Yonezu - KICK BACK'],
    ['audio/music11.ogg', 0.2, 'Kanako Itou - Fatima'],
    ['audio/music12.ogg', 48.5, 'Kanako Itou - Hacking to the Gate'],
    ['audio/clip5.weba', 0, 'aku rin - INTR (YTPMV)'],
    ['audio/clip6.weba', 0, 'aku rin - HTDN (YTPMV)'],
    ['audio/clip7.weba', 0, 'beoh - Old Castle Baby (YTPMV)'],
];
//
let _clipSelected = null;
let clips = [
    // new videoClip(music[x], rolltime, lifetime, 'key'), (* = ytpmv)
    new videoClip(cliponly[0], 31, 32.1,    'w0i5vrvg2qat8mawfjy2i/video1.webm?rlkey=vc7tda62c9s0kfcznxnm02240'), // botagiri *
    new videoClip(cliponly[1], 55, 37,      'ieofoxdaqm4jmumczph92/video2.webm?rlkey=mss80z4v2rcjl0qq3mvz0qwky'), // aquarius *
    new videoClip(cliponly[2], 21.35, 35.4, '4f2z5ksu6bxu0l68vhslf/video3.webm?rlkey=sli7839jj0sn7dtndkqdr9vdb'), // bad apple
    new videoClip(cliponly[3], 35, 43.2,    'drhq7vy4mcb32jcq9jtot/video4.webm?rlkey=69155pksd9z5gbn80zm0ungku'), // point of no k-on *
    new videoClip(cliponly[4], 78, 38.8,    'xvdt3he159lduqixpffk0/video5.webm?rlkey=zbe9w4z7kkslnggz67mw3pf2h'), // yuyushiki factory *
    new videoClip(cliponly[5], 48, 36,      '9snur9h8l5cftf47n3ln1/video6.webm?rlkey=2qv31z6q5gf98sy01emowo8ct'), // k-on op
    new videoClip(cliponly[6], 51, 37,      'a4bfdi4hnbzj1t8l4f39q/video7.webm?rlkey=7zolbpa1ptyizc4vgub9e2dwe'), // ado antisystem
    new videoClip(cliponly[7], 6, 28.5,     'cujxc4en713r25f20iz4a/video8.webm?rlkey=0qpxdx4fwwtwg74szmbhs4vc0'), // shimoneta ed
    new videoClip(cliponly[8], 38, 34,      'upfai6wav5gy5dq4nogoy/video9.webm?rlkey=fs8dhy9djvp64tukntarhbto6'), // kick back
    new videoClip(cliponly[9], 0, 69.5,     'b5tlu916tcn3r5f9ezau2/video10.webm?rlkey=bgfoiorex4sirmn898rqcfx4p'), // fatima
    new videoClip(cliponly[10], 48, 40,     'z5pq4uemtopjii80yeh1k/video11.webm?rlkey=godc4mzev23jxezdu99o5of29'), // gate 1
    new videoClip(cliponly[11], 0, 26.5,    '41z7s482j3wqgk3ua1ugs/video12.webm?rlkey=3wqgbwn2phyifv0egj3aoms9c'), // INTR *
    new videoClip(cliponly[12], 0, 37,      '0g4hye7mc3iv3vp783qfj/video13.webm?rlkey=6m5rc64tmuht2rq4nsm0tdpzs'), // HTDN *
    new videoClip(cliponly[13], 0, 46.4,    'rtk3o32aoe9xy5tzur21x/video14.webm?rlkey=0jc0tz7r1fz9lvnennj12wvpf'), // old castle baby *
    // nasruto
    // neverland
    // kaguya 1 op
    // re zero
    // bocchi
    // jojo
    // titosy ebat'
    // минимум 9 ещё будет catDespair SnowTime
];
//
let musicNormal = new Audio();
let musicRoll = new Audio();
let musicNormalVolume = new Vector1(0);
let musicRollVolume = new Vector1(0);
musicNormal.oncanplay = () => {
    if(pref.bgmusic > 0) {
        musicNormal.play()
    };
    musicNormal.oncanplay = () => {}
};
musicRoll.oncanplay = () => {};
let musicRollPrefound = null;
let musicNormalLoop = false;
let musicNormalComplete = false;
let musicBGVOld = -1;
//
// @EAG AUDIO METHODS
//
function playSound(sound = new Audio()) {
    sound.currentTime = 0;
    sound.volume = pref.sound / 100;
    sound.play()
};
//
function musicInitialize() {
    const track = musicRandomTrack();
    musicNormal.src = track[0];
    musicLite.name = track[2];
    musicNormalVolume.move(1, 2, easeInOutSine);
    if(pref.bgmusic > 0) {musicNormal.play()};
    // @RELEASE
    updateMusic = updateMusicCache;
    musicAnalysis.init();
    musicInitialize = () => {}
};
function updateMusic() {};
function updateMusicCache() {
    musicNormalVolume.update();
    musicRollVolume.update();
    clipmainAlpha.update();
    musicNormal.volume = (pref.bgmusic / 100) * musicNormalVolume.get();
    musicRoll.volume = (pref.rollmusic / 100) * musicRollVolume.get();
    // play button
    buttonPauseTrack.image = !musicNormal.paused && pref.bgmusic > 0
    ? mlcPauseImage : mlcPlayImage;
    // check
    musicNormalComplete = String(musicNormal.duration) !== 'NaN';
    // продолжаем играть, если громкость > 0
    if(musicBGVOld !== pref.bgmusic) {
        if(pref.bgmusic <= 0) {
            musicNormal.play();
            musicNormalPause()
        } else {
            if(musicNormal.paused && musicBGVOld <= 0) {
                musicNormalVolume.set(0);
                musicNormal.pause();
                musicNormalPause()
            }
        };
        musicBGVOld = pref.bgmusic
    };
    // лупим рандомим музычку
    if(musicNormal.currentTime >= musicNormal.duration - 2.1 && !musicNormalLoop) {
        musicNormalLoop = true;
        musicNormalVolume.move(0, 2, easeInOutSine);
        buttonNextTrack.state = 'unaval';
        buttonPauseTrack.state = 'unaval';
        setTimeout(() => {
            musicNormalNew();
            // musicNormalVolume.move(1, 2, easeInOutSine);
            musicNormalLoop = false;
            buttonNextTrack.state = 'idle';
            buttonPauseTrack.state = 'idle';
        }, 2000);
    };
    // лупим ролл музыку
    if(musicRoll.duration === musicRoll.currentTime) {
        musicRollVolume.reset();
        musicRollVolume.move(0, 2, easeInOutSine);
        musicRoll.currentTime = 0;
        musicRoll.play()
    };
    // подготовка клипа
    if(clipmainTime > 0 && clipmainPlay) {
        if(clipmainLoaded && musicrollLoaded) {
            if(!clipmain.paused) {clipmainTime -= deltaTime/1000};
        }
    } else {
        if(clipmainPlay) {videoClipEnd()}
    };
    if(clipmainOnCanPlay !== null) {
        if(clipmainLoaded && musicrollLoaded) {
            clipmainOnCanPlay();
            clipmainOnCanPlay = null
        };
        //
        clipWaiting -= deltaTime/1000;
        if(clipWaiting <= 0) {
            videoClipUnload();
        }

    }
};
//
function musicNormalSelect(id) {
    musicNormal.pause();
    musicNormal.currentTime = 0;
    musicNormalVolume.move(1, 1, easeInOutSine);
    musicNormal.src = music[id][0];
    musicLite.name = music[id][2];
    if(pref.bgmusic > 0) {musicNormal.play()}
};
//
function musicRandomTrack() {
    return music[Math.floor(Math.random() * (music.length - 0.001))]; 
};
function musicNormalNew() {
    if(pref.bgmusic > 0 && !clipmainPlay) {
        musicNormal.pause();
        musicNormal.currentTime = 0;
        musicNormalVolume.move(1, 2, easeInOutSine);
        const track = musicRandomTrack()
        musicNormal.src = track[0];
        musicLite.name = track[2];
        musicNormal.play()
    }
};
//
function musicNormalPause(time = 0.25) {
    if(musicNormal.paused) {
        if(pref.bgmusic > 0) {
            musicNormal.play();
            musicNormalVolume.move(1, time, easeInOutSine)
        }
    } else {
        musicNormalVolume.move(0, time, easeInOutSine);
        setTimeout(() => {musicNormal.pause()}, time*1000)
    }
}
//
function musicRollStart(time = 2) {
    var trackname;
    musicRoll.pause();
    //
    if(pref.rollNewTrack) {
        [musicRoll.src, musicRoll.currentTime, trackname] = musicRollPrefound === null
        ? musicRandomTrack() : music[musicRollPrefound] === undefined
        ? musicRandomTrack() : music[musicRollPrefound];
        musicRollPrefound = null;
    } else {
        [musicRoll.src, musicRoll.currentTime, trackname] = musicRollPrefound === null
        ? music[getCurrentMusic()] : music[musicRollPrefound] === undefined
        ? music[getCurrentMusic()] : music[musicRollPrefound];
    };
    //
    musicRoll.play();
    musicNormalVolume.move(0, time, easeInOutSine);
    setTimeout(() => {
        musicNormal.pause();
        musicLite.name = trackname;
        musicNormal.src = String(musicRoll.src)
    }, time*1000)
};
function musicRollEnd(time = 0.5) {
    if(pref.bgmusic > 0) {musicNormal.play()};
    musicNormal.currentTime = Number(String(musicRoll.currentTime));
    musicRollVolume.move(0, time, easeInOutSine);
    setTimeout(() => {
        musicNormalVolume.move(1, time, easeInOutSine);
        musicRoll.pause()
    }, time*1000)
};
//
// @EAG MUSIC NORMAL MENU
//
let musicMenuWidth = 420;
function getCurrentMusic() {
    for(var a in music) {
        if(music[a][2] === musicLite.fullname) {return Number(a)}
    };
    return 0
};
function getTrackMenu(sel) {
    return [
        music[sel-2] !== undefined ?    [textStringLimit(music[sel-2][2], mnMenu.size.x*0.68),  '#fff5'] : null,
        music[sel-1] !== undefined ?    [textStringLimit(music[sel-1][2], mnMenu.size.x*0.68),  '#fffb'] : null,
        music[sel] !== undefined ?      [textStringLimit(music[sel][2],   mnMenu.size.x*0.68),  '#ffff'] : null,
        music[sel+1] !== undefined ?    [textStringLimit(music[sel+1][2], mnMenu.size.x*0.68),  '#fffb'] : null,
        music[sel+2] !== undefined ?    [textStringLimit(music[sel+2][2], mnMenu.size.x*0.68),  '#fff5'] : null,
    ]
};
//
let mnMenu = {
    anchor: new Vector2(0.5, 0.15),
    pos: new Vector2(),
    size: new Vector2(musicMenuWidth, 0),
    spacing: 4,
    //
    fsize: 18,
    font: 'Segoe UI',
    //
    break: true,
    apply: false,
    plan: false,
    //
    sel: 0,
    tracks: [],
    alpha: new Vector1(0),
    time: 0,
    selector: (name) => {return `>>> ${name} <<<`},
    //
    active: (input) => {
        if(srv.state === 'idle') {
            if(mnMenu.alpha.get() <= 0) {
                mnMenu.sel = getCurrentMusic();
                mnMenu.alpha.move(1, 0.25, easeInOutSine);
            } else {
                if(mnMenu.alpha.getFixed() <= 0) {mnMenu.alpha.move(1, 0.25, easeInOutSine)};
                if(mnMenu.sel + input >= 0 && mnMenu.sel + input < music.length) {
                    mnMenu.sel += input;
                    playSound(sound['scroll'])
                }
            };
            mnMenu.tracks = getTrackMenu(mnMenu.sel);
            mnMenu.time = 1.5
        }
    },
    //
    draw: () => {
        // update & preroll lock
        mnMenu.alpha.update();
        if(srv.state !== 'idle') {mnMenu.time = 0};
        //
        if(mnMenu.alpha.get() > 0) {
            // timing & applying
            if(mnMenu.time <= 0) {
                if(mnMenu.alpha.getFixed() !== 0) {mnMenu.alpha.move(0, 0.25, easeInOutSine)}
            } else {
                mnMenu.time -= deltaTime/1000;
                if(mnMenu.apply) {
                    if(pref.bgmusic > 0) {
                        mnMenu.time = 0;
                        playSound(sound['player']);
                        musicNormalSelect(mnMenu.sel)
                    }
                } else if(mnMenu.plan) {
                    mnMenu.time = 0;
                    playSound(sound['player']);
                    musicRollPrefound = mnMenu.sel
                }
            };
            // scale + position
            mnMenu.pos = normalAlign(mnMenu.anchor, mnMenu.size).sumxy(0, musicLite.offset.get());
            const spacing = mnMenu.spacing * _scaleDynamic;
            const fsize = mnMenu.fsize * _scaleDynamic;
            // tracknames, markup
            mnMenu.size.x = musicMenuWidth * _scaleDynamic;
            mnMenu.size.y = fsize * 5 + spacing * 5;
            // draw
            ctx.globalAlpha = mnMenu.alpha.get();
            fillRectRounded(mnMenu.size.sumxy(spacing*2), mnMenu.pos.minxy(spacing), `rgba(0,0,0,${pref.bgalpha})`, spacing*2);
            scaleFont(mnMenu.fsize, mnMenu.font);
            ctx.textAlign = 'center';
            for(var i=0; i<5; i++) {
                if(mnMenu.tracks[i] === null) {continue};
                ctx.fillStyle = mnMenu.tracks[i][1];
                fillTextFast(mnMenu.pos.sumxy(mnMenu.size.x/2, fsize + (fsize + spacing) * i),
                    i === 2 ? mnMenu.selector(mnMenu.tracks[i][0]) : mnMenu.tracks[i][0])
            }
        };
        mnMenu.apply = false;
        mnMenu.plan = false;
        ctx.globalAlpha = 1
    },
};
//
// @EAG MUSIC ANALYZER
//
let musicAnalysis = {
    ctx: null,
    //
    srcNormal: null,
    srcRoll: null,
    anNormal: null,
    anRoll: null,
    //
    freq: new Uint8Array(1024),
    domain: new Uint8Array(2048),
    //
    step: 0,
    equalizer: [],
    equalCent: 0,
    // initialize
    init: () => {
        if(pref.visual) {
            musicAnalysis.ctx = new (window.AudioContext || window.webkitAudioContext)();
            musicAnalysis.srcNormal = musicAnalysis.ctx.createMediaElementSource(musicNormal);
            musicAnalysis.srcRoll = musicAnalysis.ctx.createMediaElementSource(musicRoll);
            musicAnalysis.anNormal = musicAnalysis.ctx.createAnalyser();
            musicAnalysis.anRoll = musicAnalysis.ctx.createAnalyser();
            musicAnalysis.srcNormal.connect(musicAnalysis.anNormal);
            musicAnalysis.srcRoll.connect(musicAnalysis.anRoll);
            musicAnalysis.anNormal.connect(musicAnalysis.ctx.destination);
            musicAnalysis.anRoll.connect(musicAnalysis.ctx.destination);
            musicAnalysis.anNormal.fftSize = 2048;
            musicAnalysis.anRoll.fftSize = 2048;
            musicAnalysis.anNormal.smoothingTimeConstant = 0.85
        }
    },
    // update
    update: () => {
        if(musicAnalysis.ctx !== null && pref.visual) {
            if(srv.state !== 'idle') {
                musicAnalysis.anRoll.getByteFrequencyData(musicAnalysis.freq);
                musicAnalysis.anRoll.getByteTimeDomainData(musicAnalysis.domain)
            } else {
                musicAnalysis.anNormal.getByteFrequencyData(musicAnalysis.freq);
                musicAnalysis.anNormal.getByteTimeDomainData(musicAnalysis.domain)
            };
            // equalizer
            musicAnalysis.step = 1024 / (pref.visualQuality / 2);
            const freqArray = Array.from(musicAnalysis.freq);
            const freqMax = findMax(freqArray);
            musicAnalysis.equalCent = findCent(freqArray);
            musicAnalysis.equalizer = [];
            for(var i = 0; i < pref.visualQuality/2; i++) {
                musicAnalysis.equalizer[i] = (findCent(freqArray.splice(0, musicAnalysis.step)) / (freqMax/2 + 128))
            };
        }
    },
};
//
// @EAG MUSIC EQUALIZER
//
let musicEqualizer = {
    size: new Vector2(),
    // draw
    draw: () => {
        // calc
        musicEqualizer.size.setxy(cvssize.x / pref.visualQuality, cvssize.y/2.5);
        //
        for(var i = 0; i < pref.visualQuality; i++) {
            const a = i < pref.visualQuality/2 ? i : i - pref.visualQuality/2;
            const elem = i < pref.visualQuality/2 ?pref.visualQuality/2 - (i+1) : a;
            ctx.fillStyle = `hsla(${Math.round(360 * musicAnalysis.equalizer[elem])} 100% 80% / 0.6)`;
            ctx.fillRect(
                cvsxoffset + musicEqualizer.size.x * i,
                cvssize.y - musicEqualizer.size.y * musicAnalysis.equalizer[elem],
                musicEqualizer.size.x,
                musicEqualizer.size.y * musicAnalysis.equalizer[elem]
            )
        }
    },
};
//
// @EAG FILTER DEFAULT
//
let filterAttempts = 0;
let filterAttemptTags = false;
let filterAttRange = new Range(0, 4);
//
let filterDefault = {
    //tags
    tagsIncluded: [],
    tagsExcluded: [], // 'horror', 'mecha', 'yaoi'
    tagsUndefined: false,
    NSFW: false,
    //episodes
    episodeMin: 1,
    episodeMax: 50,
    //year
    yearMin: 1970,
    yearMax: 2023,
    // score
    scoreAllow: false,
    scoreMin: 0,
    scoreMax: 10,
    //status
    statusFinished: true,
    statusOngoing: false,
    statusUpcoming: false,
    statusUnknown: false,
    //type
    typeTV: true,
    typeMovie: true,
    typeONA: true,
    typeOVA: true,
    typeSpecial: true,
    typeUnknown: true,
    //season
    seasonSpring: true,
    seasonSummer: true,
    seasonFall: true,
    seasonWinter: true,
    seasonUndefined: true,

};
//
let filterDefaultBackup = JSON.stringify(filterDefault);
let filterPresetOnly = JSON.stringify(filterDefault);
function resetFilter() {
    filterDefault = JSON.parse(filterDefaultBackup);
    filterDefault.NSFW = pref.showNSFW
};
//
// @EAG PREFERENCES
//
let pref = {
    // roulette @RELEASE
    rollTime: 30,       // 30
    rollSpeed: 40,
    rouletteItems: 50,
    rouletteItemsMax: 200,
    rollImages: 13,
    showMap: false,     // --not use
    showNSFW: false,
    autoScroll: true,       // true
    // draw
    imageQuality: 'medium',
    imageSmoothing: true,
    lockfps: true,
    framerate: 90,        
    bgalpha: 0.7,
    scale: 4,
    // audio
    sound: 8,
    bgmusic: 6,
    rollmusic: 10,
    playerShow: true,
    rollNewTrack: true,
    // visual
    visual: false,
    visualQuality: 128, // 2^n
    playClip: true,
    snowflakes: false,
    // other
    language: 'en',
    parallax: true,
    showFPS: false,          // false
    showDebugInfo: false,
};
let prefDefault = JSON.stringify(pref);
function prefSetValue(name, value) {
    pref[name] = value;
    lsSaveObject('pref.'+name, pref[name])
};
//
function updatePreferences() {
    ctx.imageSmoothingEnabled = pref.imageSmoothing;
    ctx.imageSmoothingQuality = pref.imageQuality;
    ctx.lineCap = 'round';
};
//
// @EAG SAVELOAD DATA TYPES
//
let savePrefix = 'eagsv_';
//
function lsItemUndefined(name) {
    return localStorage[savePrefix + name] === undefined
};
function lsLoadItem(name) {
    return localStorage[savePrefix + name]
};
//
function lsSaveValue(name, value) {
    localStorage[savePrefix + name] = value
};
function lsLoadValue(name, def=null) {
    return lsItemUndefined(name) ? def : eval(lsLoadItem(name))
};
function lsLoadString(name, def=null) {
    return lsItemUndefined(name) ? def : lsLoadItem(name)
};
//
function lsSaveObject(name, object) {
    lsSaveValue(name, JSON.stringify(object))
};
function lsLoadObject(name, def=null) {
    return lsItemUndefined(name) ? def : JSON.parse(lsLoadItem(name))
};
// load preferences
for(var key in pref) {
    pref[key] = lsLoadValue(`pref.${key}`, pref[key])
};
filterAttempts = lsLoadValue('filterAttempts', 0);
filterAttemptTags = lsLoadValue('filterAttemptTags', false);
// pref visual
let _prefVisuals = pref.visual;
function prefVisualSwitch() {
    if(!pref.visual) {
        prefSetValue('visual', true);
        if(!_prefVisuals) {
            musicAnalysis.init();
            _prefVisuals = true
        }
    } else {
        prefSetValue('visual', false)
    }
};
//
// @EAG SESSION STORAGE
//
let session = sessionStorage;
let sessionLimit = (4 * 1024 * 1024) - 1;
let sessionPref = 'eagsession_';
//
function sesWrite(key, value) {
    session.setItem(String(key), String(value))
};
function sesRead(key, def = null) {
    if(session[String(key)] !== undefined) {
        return session[String(key)]
    } else {
        return def
    }
};
//
function getSessionSize() {
    var size = 0;
    for(var k in session) {
        size += String(session[k]).length
    };
    return size * 2
};
function getLocalSize() {
    var size = 0;
    for(var k in localStorage) {
        size += String(localStorage[k]).length
    };
    return size * 2
};
// session optimizer
function sessionOptimize() {
    var allk = [];
    if(getSessionSize() >= sessionLimit) {
        for(var k in session) {
            allk.push(k)
        };
        allk = allk.splice(0, allk.length/2);
        for(var k in allk) {
            delete session[allk[k]]
        }
    }
};
setInterval(() => {sessionOptimize()}, 60000);
//
// @EAG SAVE OPTIMIZATION
//
function optimizeAnimeObject(object) {
    var obj = JSON.parse(JSON.stringify(object));
    delete obj.relations;
    delete obj.synonyms;
    delete obj.thumbnail;
    delete obj.tags;
    return obj
};
function optimizeAnimeArray(array) {
    var arr = [];
    for(var i in array) {
        arr[i] = optimizeAnimeObject(array[i])
    };
    return arr
};
//
// @EAG TRANSLATED TEXT
//
let _TextTranslations = {
    'ru': {
        // global
        eagName: 'Аниме Рулетка',
        eagFilter: 'Фильтруем Аниме',
        eagEmpty: 'Рулетка пуста!',
        eagBased: 'Проект основан на оффлайн базе данных аниме (\"Offline Anime Database\") от manami-project.',
        eagThanks: 'Спасибо за использование :)',
        eagAbout: 'Приложение для генерации рандомного аниме из списков, случайно сгенерированных или собранных вручную.',
        // lang
        langWarn: 'Требуется перезагрузка!',
        // tagnames
        tagnames: {
            'action':           'Экшн',
            'adventure':        'Приключения',
            'comedy':           'Комедия',
            'drama':            'Драма',
            'ecchi':            'Этти',
            'fantasy':          'Фэнтези',
            'game':             'Игра',
            'harem':            'Гарем',
            'historical':       'Историческое',
            'horror':           'Хоррор',
            'isekai':           'Исекай',
            'magic':            'Магия',
            'mecha':            'Меха',
            'military':         'Военное',
            'music':            'Музыка',
            'mystery':          'Мистика',
            'parody':           'Пародия',
            'psychological':    'Психологическое',
            'romance':          'Романтика',
            'school':           'Школа',
            'sci-fi':           'Научное',
            'seinen':           'Сэйнэн',
            'shoujo':           'Сёдзё',
            'shounen':          'Сёнэн',
            'slice of life':    'Повседневное',
            'sports':           'Спорт',
            'supernatural':     'Суперсилы',
            'yaoi':             'Яой',
            'yuri':             'Юри',
            'work':             'Работа',
            'tsundere':         'Цундере',
            'yandere':          'Яндере',
            'kuudere':          'Куудере',
            'detective':        'Детектив',
            'space':            'Космос',
            'future':           'Футуризм',
            'crime':            'Преступления',
            'cooking':          'Еда',
            'present':          'Подарок',
            'kids':             'Дети',
            'manga':            'По манге',
            'original':         'Оригинал',
            'male':             'ГГ - Мальчик',
            'female':           'ГГ - Девочка',
            'family':           'Семья',
            'altworld':         'Другой мир',
            'shorts':           'Короткое',
            'secret':           'Секретно!',
            'allnsfw':          'NSFW',
        },
        // presetnames
        presetnames: {
            'Дефолтный': 'Дефолтный',
            'Cтарая романтика': 'Cтарая романтика',
            'Перерождение в 2007-й': 'Перерождение в 2007-й',
            'Современный кал': 'Современный кал',
            'Хорошая ностальгия': 'Хорошая ностальгия',
            'Мужская магия': 'Мужская магия',
            'Сверхъестественная школа': 'Сверхъестественная школа',
            'Девочки колдуют': 'Девочки колдуют',
            'Женский исекай': 'Женский исекай',
            'Можно короче?': 'Можно короче?',
            'Лучшая эротика': 'Лучшая эротика',
            'Бывалые гаремы': 'Бывалые гаремы',
            'Девочки в танках': 'Девочки в танках',
            'Новая психология': 'Новая психология',
            'Повседневность нулевых': 'Повседневность нулевых',
            '"Сполт это фыфнь".': '"Сполт это фыфнь".',
            'Игры десятых': 'Игры десятых',
            'Пережитая история': 'Пережитая история',
            'Лучшие приключения': 'Лучшие приключения',
            'Когда плакать?': 'Когда плакать?',
            'Пожилые слёзы': 'Пожилые слёзы',
            'Что это было?': 'Что это было?',
            'Новое приключение': 'Новое приключение',
            'Фентезийная любовь': 'Фентезийная любовь',
            'Плюс уши': 'Плюс уши',
            'Плохие шутки': 'Плохие шутки',
            'Новаторский юмор': 'Новаторский юмор',
            'Грустно, но вкусно': 'Грустно, но вкусно',
            'Бесится, но любит': 'Бесится, но любит',
            'Влюбиться насмерть': 'Влюбиться насмерть',
            'Бесконечное "это"': 'Бесконечное "это"',
            'Работать - круто!': 'Работать - круто!',
            'Совсем не похоже': 'Совсем не похоже',
            'Годная сатира': 'Годная сатира',
            'Супер-романтика': 'Супер-романтика',
            'Выключаем свет': 'Выключаем свет',
            'Женский спорт': 'Женский спорт',
            'Кухня, 7 сезон': 'Кухня, 7 сезон',
            'Прохладная любовь': 'Прохладная любовь',
        },
        // status
        statusFinished: 'Вышел', statusOngoing: 'Онгоинг', statusUpcoming: 'Анонс', statusUnknown: 'Неизв.',
        //type
        typeTV: 'TV Сериал', typeMovie: 'Фильм', typeONA: 'ONA', typeOVA: 'OVA', typeSpecial: 'Спешл', typeUnknown: 'Неизв.',
        //season
        seasonSpring: 'Весна', seasonSummer: 'Лето', seasonFall: 'Осень', seasonWinter: 'Зима', seasonUndefined: 'Неизв.',
        // info table
        infoHead: 'Информация',
        infoEps: 'Серий: ',
        infoYear404: 'Неизв.',
        infoPreset: 'Пресет: ',
        infoList: 'Список',
        infoChangesCount: 'Изменений: ',
        infoNoChanges: 'Изменений нет',
        // MAL
        malHead: 'Рейтинг MyAnimeList',
        mal404: 'Нет данных...',
        malScore: 'Ср. оценка: ',
        malScoredBy: `Всего оценок: `,
        // rollbar
        rbRoll: 'Roll!', rbWait: 'Ждём', rbMusicOff: 'Музыка выключена.', rbWarn: 'Победитель уже определён!',
        // desc
        descHead: 'Описание',
        descWait: 'Секундочку...',
        descNone: 'Описания нет',
        descContinue: '    (далее на MyAnimeList)',
        descTranslate: '[Перевести]',
        descWork: 'Переводим... ',
        descRoll: 'Рулетка крутится...',
        descTrailer: '[Трейлер]',
        descNoTrailer: 'Трейлер не найден...',
        // single words
        wordError: 'Ошибка',
        wordOriginal: '[Оригинал]',
        wordTranslate: '[Перевод]',
        wordMinimum: 'Минимальный',
        wordMaximum: 'Максимальный',
        wordBack: 'Назад',
        wordApply: 'Применить',
        wordFiltrate: 'Фильтр!',
        wordReset: 'Сбросить',
        wordApp: 'Приложение',
        wordDatabase: 'Датабаза',
        // prompts
        promIntLess: 'Введите целое число, меньше чем',
        promIntOver: 'Введите целое число, больше чем',
        promHoverCopy: 'Нажмите, чтобы скопировать название',
        promFloatLess: 'Введите число с точностью до десятых (пример - "1.5"), меньше чем',
        promFloatOver: 'Введите число с точностью до десятых (пример - "8.5"), больше чем',
        // filter
        filterApplyPreset: 'Применить',
        filterWallpaper: 'Вставьте ссылку на изображение или нажмите "Отмена" для случайного изображения из заранее подготовленных...',
        filterDiap: 'Диапазоны',
        filterYear: 'Год выхода (0 - 2023)',
        filterEps: 'Кол-во серий (1 - 9999)',
        filterScore: 'Ср. оценка (0 - 10)',
        filterScoreAllow: 'Учитывать оценки MAL',
        filterSTS: 'Сезоны, типы и статусы',
        filterTags: 'Тэги',
        filterPresets: 'Пресеты',
        filterAboutPresets: 'Нажмите на пресет, чтобы узнать, что именно он изменяет. Применение пресета выставит новые значения последующих настроек фильтра.',
        filterWarn: 'Применение фильтра перезапишет старые элементы рулетки и удалит ПОБЕДИТЕЛЯ, если он уже определялся до этого.',
        filterFindNone: 'Ни одного тайтла, прошедшего по условиям фильтра, не найдено! Фильтр восстановлен до настроек пресета.',
        filterCounter: 'Кол-во тайтлов, проходящих по условиям: ',
        filterFirstChange: 'Измените что-нибудь для подсчёта...',
        filterAttempts: 'Игнорирование условий (0 - 4)',
        filterStateFilter: 'Рандом',
        filterStateArrays: 'Списки',
        filterStateEditor: 'Редактор',
        filterStateBrowser: 'Поиск',
        filterBrowserFind: 'Искать',
        filterBrowserPrompt: 'Введите название тайтла, который хотите найти...',
        filterAttTags: 'Только для тэгов',
        // browser, arrays
        browserEnter: 'Ввести', browserPage: 'Страница', browserNext: 'Вперёд', browserPrev: 'Назад',
        browserAddNote: 'Зажмите, чтобы добавить тайтл в редактируемый список',
        browserAlreadyNote: 'Тайтл уже в редактируемом списке',
        browserNoResult: 'Нет ни одного результата по запросу: ',
        browserResultCount: ' результатов по запросу: ',
        // editor
        editorDeleteNote: 'Зажмите, чтобы удалить тайтл из списка',
        editorClaimRoulette: 'Взять с рулетки',
        editorListClear: 'Удалить все тайтлы из редактируемого списка?',
        editorApplyEmpty: 'Отправлять на рулетку нечего - редактируемый список пуст!',
        editorDownloadEmpty: 'Нечего скачивать - редактируемый список пуст!',
        editorUploadEmpty: 'В загруженном файле не найдено ни одного тайтла!',
        editorCompatibilityWarn_1: 'Версии компонентов, на которых был сделан загруженный список аниме и текущие версии отличаются:',
        editorCompatibilityWarn_2: 'Это может вызвать некоторые проблемы, тайтлы в датабазе придётся искать по названиям (DBID могут отличаться). Продолжайте, если знаете, что делаете.',
        editorUploadOverwrite: 'Для загрузки новых тайтлов необходимо удалить старые. Продолжить?',
        editorDownloadJSON: 'Скачать .json',
        editorUploadJSON: 'Загрузить .json',
        editorJSON: 'Списки в JSON формате',
        // load
        loadJkrg: `Думаем...`,
        loadPics: `Грузим картинки...`,
        loadGen: `Генерируем рулетку...`,
        loadDone: `Готово!`,
        loadFirstEvent: `Нажмите в любую область экрана для продолжения...`,
        loadNoCon: `Нет соединения с интернетом!`,
        loadRecon: `Пожалуйста, проверьте соединение с интернетом и перезагрузите страницу.`,
        // presetinfo
        prinIncludes: 'Включения:', prinExcludes: 'Исключения:', prinPreset: 'Пресет: ', prinEps: ' Серии: ',
        prinYears: '. Года выхода: ', prinScore: '. Ср. оценка: ', prinMultiplier: '. Множитель:',
        // pref
        prefHead: 'Настройки',
        prefRoll: 'Рулетка',
        prefRTime: 'Время',
        prefRSpeed: 'Скорость',
        prefRTitle: 'Максимум тайтлов',
        prefROnscreen: 'Тайтлов на экране',
        prefRAuto: 'Авто-вращение',
        prefRNSFW: 'Разрешить NSFW-тайтлы',
        prefAudio: 'Аудио',
        prefASound: 'Звуки',
        prefABG: 'Музыка (задний фон)',
        prefARoll: 'Музыка (вращение)',
        prefANew: 'Другой трек при вращении',
        prefAShow: 'Показать плеер',
        prefRender: 'Отрисовка',
        prefRLimit: 'Ограничить FPS',
        prefRFPS: 'FPS',
        prefRSmooth: 'Сглаживание изображений',
        prefRShadow: 'Непрозрачность теней',
        prefRBG: 'Задний фон - ',
        prefParallax: 'Параллакс',
        prefShowFPS: 'Показать FPS',
        prefDevinfo: 'Показать доп. информацию',
        prefScale: 'Размер: ',
        prefScaleSet: 'Размер интерфейса',
        prefVersion: 'Версия: ',
        prefAbout: 'О проекте',
        prefVisual: 'Визуализация музыки',
        prefPlayClip: 'Показывать видеоклип*',
        prefLanguage: 'Язык',
        prefOthers: 'Прочее',
        prefRecovery: 'Восстановление',
        prefResetDefault: 'Настройки по умолчанию',
        prefResetStorage: 'Удалить все данные',
        // prefsets
        pstDisable: 'Выкл.', pstLow: 'Низко', pstMedium: 'Средне', pstHigh: 'Высоко', pstChange: 'Сменить',
        // hints
        hintTags: 'Тут можно включать и исключать тэги для фильтра. Не забывайте смотреть, есть ли аниме по уже выбранной комбинации. Для работы некоторых тэгов нужно включить `NSFW` в настройках.',
        hintAllowScore: 'Это значит, что не пройдёт всё, чего нет на сайте MAL (+5000 тайтлов) и что не удовлетворяет минимальной и максимальной указанным средним оценкам.',
        hintTitleMax: 'Ограничивает кол-во аниме, которые отправляются в рулетку после фильтрации.',
        hintAutoScroll: 'Рулетка в спокойном состоянии будет автоматически медленно вращаться.',
        hintAllowNSFW: 'В рулетке будет разрешено аниме с содержанием 18+. Включая это, вы подтверждаете, что достигли совершеннолетия. (Осторожно: постеры могут содержать нецензурный контент!)',
        hintAudio: 'Микшеры "Задний фон" и  "Вращение" позволяют настроить разную громкость музыки в спокойном состоянии и во время вращения.',
        hintNewTrack: 'При запуске рулетки будет играть новый трек с начала или с определённого момента.',
        hintParallax: 'Изображение на заднем фоне будет немного следовать за указателем мыши.',
        hintBackgroundURL: 'Ссылка на изображение: ',
        hintPrefReset: 'Вернуть все настройки к значениям по умолчанию.',
        hintTrackName: 'Сейчас играет: ',
        hintMusicOff: 'Выберите "0", чтобы выключить музыку на заднем фоне.',
        hintAudioVisual: 'Визуализация звука снизу во всю внутреннюю ширину интерфейса.',
        hintRoll: 'На низких значениях времени и скорости будет слабый рандом. Рекомендуемое время = 20-60, скорость не меньше 20.',
        hintPrefScale: 'Множитель размера всех элементов интерфейса. Можно настраивать кнопками "+" и "-".',
        hintAttempts: 'Количество условий, которые фильтр сможет проигнорировать.',
        hintAudioClips: 'Экспериментальная функция (требует хорошего подключения к интернету). Воспроизводит ролик к треку вместо заднего фона во время прокрута. Настройка времени рулетки игнорируется.',
        hintAttTags: 'Опция "Игнорирование условий" будет использована только для тэгов.',
        hintResetStorage: 'Удалить все накопленные данные из localStorage. Это касается настроек, аниме на рулетке, фильтра, сохранённых списков и т.п.',
        hintClaimRoulette: 'Взять все тайтлы с рулетки',
        hintAwaitingClip: 'Грузим видео с музычкой ...',
        hintAwaitingMusic: 'Грузим музыку ...',
        hintOpenURL: 'Нажмите, чтобы открыть в новой вкладке: ',
    },
    'en': {
        // global
        eagName: 'Anime Roulette',
        eagFilter: 'Filtering Anime',
        eagEmpty: 'Roulette is empty!',
        eagBased: 'The project is based on an \"Offline Anime Database\" by manami-project. Some APIs are also used: Jikan REST API, Microsoft Text Translator (via restapi.com).',
        eagThanks: 'Thanks for using :)',
        eagAbout: 'An application for getting random anime from a list randomly generated or manually assembled.',
        // lang
        langWarn: 'A reboot is required!',
        // tagnames
        tagnames: {
            'action':           'Action',
            'adventure':        'Adventure',
            'comedy':           'Comedy',
            'drama':            'Drama',
            'ecchi':            'Ecchi',
            'fantasy':          'Fantasy',
            'game':             'Game',
            'harem':            'Harem',
            'historical':       'Historical',
            'horror':           'Horror',
            'isekai':           'Isekai',
            'magic':            'Magic',
            'mecha':            'Mecha',
            'military':         'Military',
            'music':            'Music',
            'mystery':          'Mystery',
            'parody':           'Parody',
            'psychological':    'Psychological',
            'romance':          'Romance',
            'school':           'School',
            'sci-fi':           'Sci-Fi',
            'seinen':           'Seinen',
            'shoujo':           'Shoujo',
            'shounen':          'Shounen',
            'slice of life':    'Slice of life',
            'sports':           'Sports',
            'supernatural':     'Supernatural',
            'yaoi':             'Yaoi',
            'yuri':             'Yuri',
            'work':             'Work',
            'tsundere':         'Tsundere',
            'yandere':          'Yandere',
            'kuudere':          'Kuudere',
            'detective':        'Detective',
            'space':            'Space',
            'future':           'Future',
            'crime':            'Criminal',
            'cooking':          'Food',
            'present':          'Present',
            'kids':             'Kids',
            'manga':            'By manga',
            'original':         'Original',
            'male':             'Male protagonist',
            'female':           'Female protagonist',
            'family':           'Family',
            'altworld':         'Another world',
            'shorts':           'Shorts',
            'secret':           'Secret!',
            'allnsfw':          'NSFW',
        },
        // presetnames
        presetnames: {
            'Дефолтный': 'Default',
            'Cтарая романтика': 'Old romance',
            'Перерождение в 2007-й': 'Rebirth in 2007',
            'Современный кал': 'Modern feces',
            'Хорошая ностальгия': 'Good nostalgia',
            'Мужская магия': 'Male magic',
            'Сверхъестественная школа': 'Supernatural school',
            'Девочки колдуют': 'Girls conjure',
            'Женский исекай': 'Female isekai',
            'Можно короче?': 'Can it be shorter?',
            'Лучшая эротика': 'Best erotica',
            'Бывалые гаремы': 'Experienced harems',
            'Девочки в танках': 'Girls in tanks',
            'Новая психология': 'New psychology',
            'Повседневность нулевых': 'Everyday life in 2000',
            '"Сполт это фыфнь".': '"Spoft is Life"',
            'Игры десятых': 'Games of the 2010',
            'Пережитая история': 'Experienced history',
            'Лучшие приключения': 'Best adventures',
            'Когда плакать?': 'When to cry?',
            'Пожилые слёзы': 'Elderly tears',
            'Что это было?': 'What was that?',
            'Новое приключение': 'A new adventure',
            'Фентезийная любовь': 'Fantasy love',
            'Плюс уши': 'Plus ears',
            'Плохие шутки': 'Bad jokes',
            'Новаторский юмор': 'Innovative humor',
            'Грустно, но вкусно': 'Sad, but delicious',
            'Бесится, но любит': 'She\'s mad, but she loves',
            'Влюбиться насмерть': 'Fall in love to death',
            'Бесконечное "это"': 'The infinite "it"',
            'Работать - круто!': 'Working is cool!',
            'Совсем не похоже': 'Doesn\'t look like',
            'Годная сатира': 'Good satire',
            'Супер-романтика': 'Super-romance',
            'Выключаем свет': 'Turning off the light',
            'Женский спорт': 'Women\'s sports',
            'Кухня, 7 сезон': 'Kitchen, season 7',
            'Прохладная любовь': '\"Cool\" love',
        },
        // status
        statusFinished: 'Finished', statusOngoing: 'Ongoing', statusUpcoming: 'Upcoming', statusUnknown: 'Unknown',
        //type
        typeTV: 'TV Series', typeMovie: 'Movie', typeONA: 'ONA', typeOVA: 'OVA', typeSpecial: 'Special', typeUnknown: 'Unknown',
        //season
        seasonSpring: 'Spring', seasonSummer: 'Summer', seasonFall: 'Fall', seasonWinter: 'Winter', seasonUndefined: 'Unknown',
        // info table
        infoHead: 'Information',
        infoEps: 'Episodes: ',
        infoYear404: 'Unknown',
        infoPreset: 'Preset: ',
        infoList: 'List: ',
        infoChangesCount: 'Change count: ',
        infoNoChanges: 'No changes',
        // MAL
        malHead: 'MyAnimeList Score',
        mal404: 'No data...',
        malScore: 'Avg. score: ',
        malScoredBy: `Total scores: `,
        // rollbar
        rbRoll: 'Roll!', rbWait: 'Wait', rbMusicOff: 'Music is turned off.', rbWarn: 'The winner has already been determined!',
        // desc
        descHead: 'Description',
        descWait: 'Please wait...',
        descNone: 'No description',
        descContinue: '    (continued in MyAnimeList)',
        descTranslate: '[Translate]',
        descWork: 'Translating... ',
        descRoll: 'Roulette is spinning...',
        descTrailer: '[Trailer]',
        descNoTrailer: 'Trailer not found...',
        // single words
        wordError: 'Error',
        wordOriginal: '[Original]',
        wordTranslate: '[Translation]',
        wordMinimum: 'Minimum',
        wordMaximum: 'Maximum',
        wordBack: 'Back',
        wordApply: 'Apply',
        wordFiltrate: 'Filter!',
        wordReset: 'Reset',
        wordApp: 'App',
        wordDatabase: 'Database',
        // prompts
        promIntLess: 'Enter an integer less than',
        promIntOver: 'Enter an integer greater than',
        promHoverCopy: 'Click to copy the name',
        promFloatLess: 'Enter a number with precision to tenths (example - "1.5"), less than',
        promFloatOver: 'Enter a number with precision to tenths (example - "8.5"), over than',
        // filter
        filterApplyPreset: 'Apply',
        filterWallpaper: 'Insert a URL link to the image or click "Cancel" for a random image from the pre-prepared ones...',
        filterDiap: 'Ranges',
        filterYear: 'Year of release (0 - 2023)',
        filterEps: 'Episodes (1 - 9999)',
        filterScore: 'Avg. score (0 - 10)',
        filterScoreAllow: 'Take into account the MAL rating',
        filterSTS: 'Seasons, types & statuses',
        filterTags: 'Tags',
        filterPresets: 'Presets',
        filterAboutPresets: 'Click on the preset to find out exactly what it changes. Applying the preset will set new values for subsequent filter settings.',
        filterWarn: 'Applying the filter will overwrite the old roulette elements and remove the WINNER if it has already been determined before.',
        filterFindNone: 'Not a single title that passed the filter conditions was found! The filter has been restored to the preset settings.',
        filterCounter: 'Number of filtered anime: ',
        filterFirstChange: 'Precounter is waiting for changes...',
        filterAttempts: 'Ignore conditions (0 - 4)',
        filterStateFilter: 'Random',
        filterStateArrays: 'Arrays',
        filterStateEditor: 'Editor',
        filterStateBrowser: 'Search',
        filterBrowserFind: 'Find',
        filterBrowserPrompt: 'Enter the name of the title you want to find...',
        filterAttTags: 'Only for tags',
        // browser & arrays
        browserEnter: 'Enter', browserPage: 'Page', browserNext: 'Next', browserPrev: 'Prev',
        browserAddNote: 'Hold for add title to editable list',
        browserAlreadyNote: 'Title is already in editable list!',
        browserNoResult: 'There are no results for the query: ',
        browserResultCount: ' results for the query: ',
        // editor
        editorDeleteNote: 'Hold for delete title from list',
        editorClaimRoulette: 'Claim roll',
        editorListClear: 'Delete all titles from the edited list?',
        editorApplyEmpty: 'There is nothing to send to roulette - the editable list is empty!',
        editorDownloadEmpty: 'There is nothing to download - the editable list is empty!',
        editorUploadEmpty: 'No titles were found in the uploaded file!',
        editorCompatibilityWarn_1: 'The versions of the components on which the downloaded anime list was made and the current versions differ:',
        editorCompatibilityWarn_2: 'This may cause some problems, the titles in the database will have to be searched by name (DBID\'s may differ). Go ahead if you know what you\'re doing.',
        editorUploadOverwrite: 'To download new titles, you need to delete the old ones. Continue?',
        editorDownloadJSON: 'Download .json',
        editorUploadJSON: 'Upload .json',
        editorJSON: 'Lists in JSON format',
        // load
        loadJkrg: `Thinkge...`,
        loadPics: `Loading pictures...`,
        loadGen: `Generating roulette...`,
        loadDone: `Success!`,
        loadFirstEvent: `Tap anywhere on the screen to continue...`,
        loadNoCon: `No internet connection!`,
        loadRecon: `Please check your internet connection and reload the page.`,
        // presetinfo
        prinIncludes: 'Includes:', prinExcludes: 'Excludes:', prinPreset: 'Preset: ', prinEps: ' Episodes: ',
        prinYears: '. Years: ', prinScore: '. Avg. score: ', prinMultiplier: '. Multiplier:',
        // pref
        prefHead: 'Options',
        prefRoll: 'Roulette',
        prefRTime: 'Time',
        prefRSpeed: 'Speed',
        prefRTitle: 'Filter maximum',
        prefROnscreen: 'Posters on screen',
        prefRAuto: 'Auto-scroll',
        prefRNSFW: 'Allow NSFW-anime',
        prefAudio: 'Audio',
        prefASound: 'Sounds',
        prefABG: 'Music (background)',
        prefARoll: 'Music (during spin)',
        prefANew: 'Another track when rotating',
        prefAShow: 'Show music player',
        prefRender: 'Render',
        prefRLimit: 'Limit FPS',
        prefRFPS: 'FPS',
        prefRSmooth: 'Image Smoothing',
        prefRShadow: 'Opacity of shadows',
        prefRBG: 'BG Image - ',
        prefParallax: 'Parallax',
        prefShowFPS: 'Show FPS',
        prefDevinfo: 'Show Dev. info',
        prefScale: 'Scale: ',
        prefScaleSet: 'UI size',
        prefVersion: 'Version: ',
        prefAbout: 'About the project',
        prefVisual: 'Music visualization',
        prefPlayClip: 'Show Video clip*',
        prefLanguage: 'Language',
        prefOthers: 'Other',
        prefRecovery: 'Recovery',
        prefResetDefault: 'Default settings',
        prefResetStorage: 'Delete all data',
        // prefsets
        pstDisable: 'Off', pstLow: 'Low', pstMedium: 'Medium', pstHigh: 'High', pstChange: 'Change',
        // hints
        hintTags: 'Here you can include and exclude tags for the filter. Do not forget to see if there is an anime for the already selected combination. For some tags to work, you need to enable `NSFW` in the settings.',
        hintAllowScore: 'This means that everything that is not on the MAL site (+5000 titles) and that does not meet the minimum and maximum avg. score will not pass.',
        hintTitleMax: 'Limits the number of anime that are sent to roulette after filtering.',
        hintAutoScroll: 'The roulette in a calm state will automatically rotate slowly.',
        hintAllowNSFW: 'Anime with 18+ content will be allowed in roulette. By including this, you confirm that you have reached the age of majority. (Attention: Posters may contain obscene content!)',
        hintAudio: 'The "Background" and "During spin" mixers allow you to adjust different music volume for a calm state and during spin.',
        hintNewTrack: 'When you start the roulette, a new track will play from the beginning or from a certain moment.',
        hintParallax: 'The image in the background will follow the mouse pointer a little.',
        hintBackgroundURL: 'Background image URL: ',
        hintPrefReset: 'Return all settings to default values.',
        hintTrackName: 'Now playing: ',
        hintMusicOff: 'Select "0" to turn off the background music.',
        hintAudioVisual: 'Visualization of the sound at the bottom of the entire width of the interface.',
        hintRoll: 'At low values of time and speed, there will be a weak random. Recommended time = 20-60, speed not less than 20.',
        hintPrefScale: 'Multiplier of the size of all interface elements. You can configure it using the "+" and "-" buttons.',
        hintAttempts: 'The number of conditions that the filter can ignore.',
        hintAudioClips: 'Experimental feature (requires a good internet connection). Plays the video to the track instead of the background while the roulette is running. The roulette time setting is ignored.',
        hintAttTags: 'The "Ignore conditions" option will be used only for tags.',
        hintResetStorage: 'Delete all accumulated data from localStorage. This applies to settings, roulette anime, filter, saved lists, etc.',
        hintClaimRoulette: 'Take all titles from the roulette',
        hintAwaitingClip: 'Waiting for music & video ...',
        hintAwaitingMusic: 'Waiting for music ...',
        hintOpenURL: 'Click to open in a new tab: ',
    },
};
//
let _Text = _TextTranslations[pref.language];
function txt(key) {
    return _Text[key] === undefined ? key : _Text[key]
};
function txtTag(key) {
    return _Text.tagnames[key] === undefined ? key : _Text.tagnames[key]
};
function txtPreset(key) {
    return _Text.presetnames[key] === undefined ? key : _Text.presetnames[key]
};
//
let langInitialized = pref.language;
let langSelected = pref.language;
let allTranslations = {
    'en': {
        name: 'English',
        comment: 'A web translator was used',
    },
    'ru': {
        name: 'Русский',
        comment: 'Оригинальный язык',
    },
    //
    head: () => {
        return langInitialized === langSelected
        ? allTranslations[pref.language].name
        : allTranslations[pref.language].name + ' - ' + _TextTranslations[pref.language].langWarn
    },
};
//
// @EAG TAG CLASS
//
class animeTag {
    constructor(name, tags = []) {
        this.name = txtTag(name); this.tags = tags
    }
};
//
// @EAG TAGS VARIANTS & TRANSLATE
//
let tagbase = {
    // main
    'action':           new animeTag('action', ['action']),
    'adventure':        new animeTag('adventure', ['adventure', 'travel']),
    'comedy':           new animeTag('comedy', ['comedy', 'dark comedy', 'verbal comedy', 'surreal comedy']),
    'drama':            new animeTag('drama', ['drama', 'tragedy', 'romantic drama', 'psychological drama']),
    'ecchi':            new animeTag('ecchi', ['ecchi']),
    'fantasy':          new animeTag('fantasy', ['fantasy', 'contemporary fantasy', 'fantasy world', 'urban fantasy', 'dark fantasy', 'epic fantasy', 'high fantasy']),
    'game':             new animeTag('game', ['game', 'video game', 'virtual reality', 'hacking', 'rpg', 'mmorpg']),
    'harem':            new animeTag('harem', ['harem', 'female harem', 'male harem', 'reverse harem']),
    'historical':       new animeTag('historical', ['historical', 'history']),
    'horror':           new animeTag('horror', ['horror', 'post-apocalyptic', 'body horror', 'ghost', 'survival']),
    'isekai':           new animeTag('isekai', ['isekai', 'reincarnation', 'rehabilitation', 'summoned into another world']),
    'magic':            new animeTag('magic', ['magic', 'magical girl', 'magic school', ]),
    'mecha':            new animeTag('mecha', ['mecha', 'robot']),
    'military':         new animeTag('military', ['military', 'war', 'guns']),
    'music':            new animeTag('music', ['music', 'classical music', 'musical', 'musical band']),
    'mystery':          new animeTag('mystery', ['mystery', 'mystical']),
    'parody':           new animeTag('parody', ['parody']),
    'psychological':    new animeTag('psychological', ['psychological', 'philosophy']),
    'romance':          new animeTag('romance', ['romance', 'romantic', 'romantic comedy', 'mature romance']),
    'school':           new animeTag('school', ['school', 'teacher', 'educational', 'high school', 'teaching', 'school life']),
    'sci-fi':           new animeTag('sci-fi', ['sci-fi', 'sci fi', 'science fiction', 'science-fiction']),
    'seinen':           new animeTag('seinen', ['seinen']),
    'shoujo':           new animeTag('shoujo', ['shoujo', 'mahou shoujo', 'shoujo-ai', 'shoujo ai']),
    'shounen':          new animeTag('shounen', ['shounen', 'fighting-shounen', 'shounen ai', 'shounen-ai']),
    'slice of life':    new animeTag('slice of life', ['slice of life', 'daily life']),
    'sports':           new animeTag('sports', ['sports', 'sport', 'swimming', 'boxing', 'soccer', 'racing']),
    'supernatural':     new animeTag('supernatural', ['supernatural', 'super power', 'psi-powers', 'superheroes']),
    'yaoi':             new animeTag('yaoi', ['yaoi']),
    'yuri':             new animeTag('yuri', ['yuri']),
    // other
    'work':             new animeTag('work', ['work', 'work life', 'workplace', 'working life', 'coworkers', 'office worker']),
    'tsundere':         new animeTag('tsundere', ['tsundere']),
    'yandere':          new animeTag('yandere', ['yandere']),
    'kuudere':          new animeTag('kuudere', ['kuudere']),
    'detective':        new animeTag('detective', ['detective', 'detectives']),
    'space':            new animeTag('space', ['space', 'outer space', 'on spaceship', 'space pirates', 'space battles', 'space opera', 'space travel', 'astronauts', 'earth']),
    'future':           new animeTag('future', ['future']),
    'crime':            new animeTag('crime', ['crime', 'organized crime', 'prison', 'thief']),
    'cooking':          new animeTag('cooking', ['cooking', 'food', 'cocktails', 'restaurants']),
    // новые
    'present':          new animeTag('present', ['present']),
    'kids':             new animeTag('kids', ['loli', 'kids']),
    'manga':            new animeTag('manga', ['based on a manga', 'manga']),
    'original':         new animeTag('original', ['original work']),
    'male':             new animeTag('male', ['male protagonist']),
    'female':           new animeTag('female', ['female protagonist']),
    'family':           new animeTag('family', ['family friendly']),
    'altworld':         new animeTag('altworld', ['alternative world']),
    'shorts':           new animeTag('shorts', ['short episodes', 'shorts', 'short movie']),
    // oh no
    'secret':           new animeTag('secret', ['hentai']),
    'allnsfw':          new animeTag('allnsfw', [
        // eto pizdec
        'hentai', 'anal', 'oral', 'nudity', 'large breasts', 'pantsu', 'nudity',
        'pantsu shots', 'transgender', 'big boobs', 'bondage', 'masturbation', 'sado maso', 
        'tentacle', 'threesome', 'boys love', 'sex', 'boobjob', 'group sex', 'lactation',
        'exhibitionism', 'incest', 'urinating', 'voyeurism', 'double penetration', 'strap-ons',
        'footjob', 'futanari', 'small breasts', 'lgbt themes', 'cunnilingus', 'public sex',
        'bdsm', 'tentacles', 'hypersexuality', 'sex toys', 'handjob', 'magical sex shift']),
};
//
// @EAG PRESET CLASS
//
class Preset {
    constructor(name, includes=null, excludes=null, years=null, episodes=null, score=null, mult=1, others=null) {
        this.name = txtPreset(name);
        this.tag = name;
        this.in = includes; this.ex = excludes;
        this.years = years; this.ep = episodes; 
        this.score = score;
        this.scoreAllow = this.score.max !== 10 || this.score.min !== 5;
        this.mult = mult; this.others = others
    }
    addon() {
        var adn = {};
        if(this.in !== null) {adn['tagsIncluded'] = this.in};
        if(this.ex !== null) {adn['tagsExcluded'] = this.ex};
        adn['yearMax'] = this.years.max; adn['yearMin'] = this.years.min;
        adn['episodeMax'] = this.ep.max; adn['episodeMin'] = this.ep.min;
        adn['scoreAllow'] = this.scoreAllow;
        adn['scoreMax'] = this.score.max; adn['scoreMin'] = this.score.min;
        if(this.others !== null) {adn = filterModify(adn, this.others)};
        return adn
    };
    getInfo() {
        var ini = '', exi = '';
        if(this.in !== null) {
            ini = ' ' + txt('prinIncludes');
            for(var i in this.in) {ini = ini + ' ' + tagbase[this.in[i]].name + ','};
            ini = ini.substring(0, ini.length-1) + '.'
        };
        if(this.ex !== null) {
            exi = ' ' + txt('prinExcludes');
            for(var i in this.ex) {exi = exi + ' ' + tagbase[this.ex[i]].name + ','};
            exi = exi.substring(0, exi.length-1) + '.'
        };
        return txt('prinPreset') + this.name + '.' + ini + exi + txt('prinEps') + this.ep.min + '-' + this.ep.max + txt('prinYears') + this.years.min+ '-' + this.years.max + txt('prinScore') + this.score.min + '-' + this.score.max + txt('prinMultiplier') + ' x'+String(this.mult + 0.001).substring(0,4)
    }
};
//
// @EAG ALL PRESETS
//
let YEARS = new Range(1900, 2024);
let SCORES = new Range(5, 10);
let presetbase = {
    'Дефолтный': new Preset('Дефолтный', 
    includes = null, excludes = null,
    years = YEARS, episodes = new Range(1, 50), score = new Range(5, 10),
    mult = 1, others = null),
    'Cтарая романтика': new Preset('Cтарая романтика', 
    includes = ['romance'], excludes = null,
    years = new Range(YEARS.min, 2007), episodes = new Range(1, 50), score = new Range(6, 10),
    mult = 1, others = null),
    'Перерождение в 2007-й': new Preset('Перерождение в 2007-й', 
    includes = ['isekai'], excludes = null,
    years = new Range(2005, 2009), episodes = new Range(1, 50), score = new Range(5, 10),
    mult = 1, others = null),
    'Современный кал': new Preset('Современный кал', 
    includes = null, excludes = null,
    years = new Range(2018, YEARS.max), episodes = new Range(1, 50), score = new Range(3, 7),
    mult = 1.5, others = null),
    'Хорошая ностальгия': new Preset('Хорошая ностальгия', 
    includes = null, excludes = null,
    years = new Range(YEARS.min, 2000), episodes = new Range(1, 50), score = new Range(7, 10),
    mult = 1, others = null),
    'Мужская магия': new Preset('Мужская магия', 
    includes = ['seinen', 'magic'], excludes = null,
    years = YEARS, episodes = new Range(1, 50), score = new Range(6, 10),
    mult = 1, others = null),
    'Сверхъестественная школа': new Preset('Сверхъестественная школа', 
    includes = ['supernatural', 'school'], excludes = null,
    years = YEARS, episodes = new Range(1, 50), score = new Range(5, 10),
    mult = 1, others = null),
    'Девочки колдуют': new Preset('Девочки колдуют', 
    includes = ['female', 'magic'], excludes = null,
    years = new Range(YEARS.min, 2010), episodes = new Range(1, 50), score = new Range(5, 10),
    mult = 1, others = null),
    'Женский исекай': new Preset('Женский исекай', 
    includes = ['female', 'isekai'], excludes = null,
    years = YEARS, episodes = new Range(1, 50), score = new Range(5, 10),
    mult = 1, others = null),
    'Можно короче?': new Preset('Можно короче?', 
    includes = null, excludes = null,
    years = YEARS, episodes = new Range(1, 13), score = new Range(5, 10),
    mult = 1, others = null),
    'Лучшая эротика': new Preset('Лучшая эротика', 
    includes = ['ecchi'], excludes = null,
    years = YEARS, episodes = new Range(1, 50), score = new Range(7, 10),
    mult = 1, others = null),
    'Бывалые гаремы': new Preset('Бывалые гаремы', 
    includes = ['harem'], excludes = null,
    years = new Range(YEARS.min, 2007), episodes = new Range(1, 50), score = new Range(5, 10),
    mult = 1, others = null),
    'Девочки в танках': new Preset('Девочки в танках', 
    includes = ['female', 'military'], excludes = null,
    years = YEARS, episodes = new Range(1, 50), score = new Range(5, 10),
    mult = 1, others = null),
    'Новая психология': new Preset('Новая психология', 
    includes = ['psychological'], excludes = null,
    years = new Range(2016, YEARS.max), episodes = new Range(1, 50), score = new Range(6, 10),
    mult = 1, others = null),
    'Повседневность нулевых': new Preset('Повседневность нулевых', 
    includes = ['slice of life'], excludes = null,
    years = new Range(2001, 2010), episodes = new Range(1, 50), score = new Range(5, 10),
    mult = 1, others = null),
    '\"Сполт это фыфнь\".': new Preset('\"Сполт это фыфнь\".', 
    includes = ['sports'], excludes = null,
    years = YEARS, episodes = new Range(1, 50), score = new Range(4, 10),
    mult = 1.25, others = null),
    'Игры десятых': new Preset('Игры десятых', 
    includes = ['game'], excludes = null,
    years = new Range(2011, 2020), episodes = new Range(1, 50), score = new Range(5, 10),
    mult = 1, others = null),
    'Пережитая история': new Preset('Пережитая история', 
    includes = ['historical'], excludes = null,
    years = new Range(YEARS.min, 2000), episodes = new Range(1, 50), score = new Range(5, 10),
    mult = 1, others = null),
    'Лучшие приключения': new Preset('Лучшие приключения', 
    includes = ['adventure', 'action'], excludes = null,
    years = YEARS, episodes = new Range(20, 50), score = new Range(7, 10),
    mult = 1.25, others = null),
    'Когда плакать?': new Preset('Когда плакать?', 
    includes = ['drama'], excludes = null,
    years = YEARS, episodes = new Range(1, 50), score = new Range(3, 7),
    mult = 1.5, others = null),
    'Пожилые слёзы': new Preset('Пожилые слёзы', 
    includes = ['drama'], excludes = null,
    years = new Range(YEARS.min, 2000), episodes = new Range(1, 50), score = new Range(7, 10),
    mult = 1, others = null),
    'Что это было?': new Preset('Что это было?', 
    includes = ['mystery'], excludes = null,
    years = new Range(2007, YEARS.max), episodes = new Range(1, 50), score = new Range(5, 10),
    mult = 1, others = null),
    'Новое приключение': new Preset('Новое приключение', 
    includes = ['adventure'], excludes = null,
    years = new Range(2018, YEARS.max), episodes = new Range(1, 50), score = new Range(6, 10),
    mult = 1, others = null),
    'Фентезийная любовь': new Preset('Фентезийная любовь', 
    includes = ['fantasy', 'romance'], excludes = null,
    years = new Range(2007, YEARS.max), episodes = new Range(1, 50), score = new Range(5, 10),
    mult = 1, others = null),
    'Плюс уши': new Preset('Плюс уши', 
    includes = ['music'], excludes = null,
    years = YEARS, episodes = new Range(1, 50), score = new Range(7, 10),
    mult = 1, others = null),
    'Плохие шутки': new Preset('Плохие шутки', 
    includes = ['comedy'], excludes = null,
    years = YEARS, episodes = new Range(1, 50), score = new Range(3, 7),
    mult = 1.5, others = null),
    'Новаторский юмор': new Preset('Новаторский юмор', 
    includes = ['comedy'], excludes = null,
    years = new Range(2016, YEARS.max), episodes = new Range(1, 50), score = new Range(6, 10),
    mult = 1, others = null),
    'Грустно, но вкусно': new Preset('Грустно, но вкусно', 
    includes = ['drama', 'romance'], excludes = null,
    years = new Range(2018, YEARS.max), episodes = new Range(1, 50), score = new Range(5, 10),
    mult = 1, others = null),
    'Бесится, но любит': new Preset('Бесится, но любит', 
    includes = ['tsundere'], excludes = null,
    years = YEARS, episodes = new Range(1, 50), score = new Range(6, 10),
    mult = 1, others = null),
    'Влюбиться насмерть': new Preset('Влюбиться насмерть',
    includes = ['yandere'], excludes = null,
    years = YEARS, episodes = new Range(1, 50), score = new Range(6, 10),
    mult = 1, others = null),
    'Прохладная любовь': new Preset('Прохладная любовь',
    includes = ['kuudere'], excludes = null,
    years = YEARS, episodes = new Range(1, 50), score = new Range(6, 10),
    mult = 1, others = null),
    'Бесконечное \"это\"': new Preset('Бесконечное \"это\"',
    includes = ['ecchi'], excludes = null,
    years = YEARS, episodes = new Range(1, 25), score = new Range(5, 10),
    mult = 1, others = {seasonSpring: false, seasonFall: false, seasonWinter: false, seasonUndefined: false}),
    'Работать - круто!': new Preset('Работать - круто!', 
    includes = ['work'], excludes = null,
    years = YEARS, episodes = new Range(1, 50), score = new Range(6, 10),
    mult = 1, others = null),
    'Совсем не похоже': new Preset('Совсем не похоже', 
    includes = ['parody'], excludes = null,
    years = YEARS, episodes = new Range(1, 50), score = new Range(3, 7),
    mult = 1.25, others = null),
    'Годная сатира': new Preset('Годная сатира', 
    includes = ['parody'], excludes = null,
    years = YEARS, episodes = new Range(1, 50), score = new Range(7, 10),
    mult = 1, others = null),
    'Супер-романтика': new Preset('Супер-романтика', 
    includes = ['romance', 'supernatural'], excludes = null,
    years = YEARS, episodes = new Range(1, 50), score = new Range(5, 10),
    mult = 1, others = null),
    'Выключаем свет': new Preset('Выключаем свет', 
    includes = ['horror'], excludes = null,
    years = YEARS, episodes = new Range(1, 50), score = new Range(7, 10),
    mult = 1, others = null),
    'Женский спорт': new Preset('Женский спорт', 
    includes = ['female', 'sports'], excludes = null,
    years = YEARS, episodes = new Range(1, 50), score = new Range(6, 10),
    mult = 1, others = null),
    'Кухня, 7 сезон': new Preset('Кухня, 7 сезон', 
    includes = ['cooking', 'comedy'], excludes = null,
    years = YEARS, episodes = new Range(1, 50), score = new Range(6, 10),
    mult = 1, others = null),
};
//
// @EAG ARRAY METHODS
//
function arrayAddNew(main, child) {
    var temp = [].concat(main), temp2;
    for(var i in child) {
        temp2 = child[i];
        if(typeof child[i] === 'string') {
            if(child[i].substr(0, 8) === 'https://') {
                temp2 = child[i].slice(8).split('/')[0]
            }
        }
        if(temp.indexOf(temp2) !== -1) {continue} else {temp.push(temp2)}
    };
    return temp
};
function arrayANDCondition(array) {
    var summ = 0;
    for(var i in array) {summ+=array[i]};
    return summ === array.length
};
function arrayORCondition(array) {
    var summ = 0;
    for(var i in array) {summ+=array[i]};
    return summ > 0
};
function arrayShuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    };
    return array
};
//
function arrayCompleted(array) {
    for(var i in array) {
        if(!array[i].complete) {return false}
    };
    return true
};
//
function objectAddEntry(object, entries=[]) {
    var obj = object, entry;
    for(var e in entries) {
        entry = String(entries[e])
        obj[entry] === undefined
        ? obj[entry] = 1
        : obj[entry] += 1
    };
    return obj
};
//
function objectSortEntries(object) {
    var sorted = [], obj = JSON.parse(JSON.stringify(object)), l = 0, max, key;
    // calc length
    for(var asd in obj) {
        l += 1
    };
    console.log(l);
    // search max, migrate, delete
    for(var i=0;i<l;i++) {
        max = 0;
        for(var j in obj) {
            if(obj[j] > max) {max = obj[j]; key = j}
        };
        sorted[i] = `${key}: ${max}`;
        delete obj[key]
    };
    return sorted
}
//
// @EAG FILTER METHODS
//
function filterModify(filter, mod) {
    var af = JSON.parse(JSON.stringify(filter));
    if(typeof mod == 'object') {
        for(var key in mod) {
                af[key] = mod[key];
            }
    };
    return af
};
function filterPreset(preset = presetbase['Дефолтный']) {
    resetFilter();
    presetSelected = preset.tag;
    filterDefault = filterModify(filterDefault, preset.addon());
    lsSaveObject('filterDefault', filterDefault)
};
//
function filterAnimeTag(animetag, array) {
    const tags = tagbase[animetag].tags;
    for(var i in tags) {
        if(array.indexOf(tags[i]) !== -1) {return true}
    }
    return false
};
function filterIncludeTags(included, array) {
    var err = 0;
    for(var i in included) {
        if(!filterAnimeTag(included[i], array)) {err++} else {continue}
    }
    return err
};
function filterExcludeTags(excluded, array) {
    var err = 0;
    for(var i in excluded) {
        if(filterAnimeTag(excluded[i], array)) {err++} else {continue}
    }
    return err
};
// filter precounting by all changes
let filterPrecount = {
    count: 0,
    timeout: 1,
    flag: false,
    first: false,
    filter: JSON.parse(JSON.stringify(filterDefault)),
    request: () => {
        filterPrecount.filter = JSON.parse(JSON.stringify(filterDefault));
        filterPrecount.filter.tagsIncluded = []; 
        filterPrecount.filter.tagsExcluded = [];
        for(var t in tagSelection) {
            if(tagSelection[t] === 'inc') {filterPrecount.filter.tagsIncluded.push(t)};
            if(tagSelection[t] === 'exc') {filterPrecount.filter.tagsExcluded.push(t)}
        };
        filterPrecount.first = true;
        filterPrecount.flag = true;
        filterPrecount.timeout = 0.5
    },
    update: () => {
        if(!filterPrecount.first) {filterPrecount.count = txt('filterFirstChange'); return}
        if(filterPrecount.flag) {
            if(filterPrecount.timeout < 0) {
                filterPrecount.count = getListFiltered(filterPrecount.filter).length;
                filterPrecount.flag = false
            } else {
                filterPrecount.count = txt('rbWait');
                filterPrecount.timeout -= deltaTime/1000
            }
        }
    },
};
//
// @EAG FEEDBACK FUNCTIONS
//
function getArrayWorkProgress(iter, length, step) {
    for(var i = 1; i<100/step; i++) {
        if(iter == Math.round(length*step*i/100)) {console.info(`Work progress -> ${step*i}%`)}
    }
};
//
// @EAG LIST GETTER FUNCTIONS
//
function _attemptAny(x=1) {
    if(filterAttemptTags) {return true} else {
        _filterHaveAttempts-=x;
        return _filterHaveAttempts < 0
    }
};
function _attemptTags(x=1) {
    _filterHaveAttempts-=x;
    return _filterHaveAttempts < 0
};
let _filterHaveAttempts = 0;
//
function getListFiltered(filter = filterDefault) {
    var list = [], anime;
    for(var i in adb) {
        anime = adb[i];
        _filterHaveAttempts = Number(filterAttempts);
        // sort by episodes
        if(anime['episodes'] < filter.episodeMin || anime['episodes'] > filter.episodeMax) {if(_attemptAny()){continue}};
        // sort by score, if allowed
        if(filter.scoreAllow) {
            const anime_id = malAnimeID(anime.sources);
            if(anime_id == null) {continue}
            else {
                if(adb_ratings[anime_id] === undefined) {continue};
                const score = adb_ratings[anime_id]['score'];
                if(score == 'None' || score == undefined) {continue}
                else {
                    if(score < filter.scoreMin) {if(_attemptAny()){continue}};
                    if(score > filter.scoreMax) {if(_attemptAny()){continue}};
                }
            }
        };
        // sort by year
        if(anime['animeSeason']['year'] > filter.yearMax || anime['animeSeason']['year'] < filter.yearMin) {if(_attemptAny()){continue}};
        // sort by include/exclude tags
        if(anime['tags'].length > 0) {
            if(_attemptTags(filterIncludeTags(filter.tagsIncluded, anime['tags']))) {continue};
            if(_attemptTags(filterExcludeTags(filter.tagsExcluded, anime['tags']))) {continue};
        } else {
            if(!filter.tagsUndefined) {continue}
        };
        // sort by nsfw
        if(!filter.NSFW && filterAnimeTag('allnsfw', anime['tags'])) {continue};
        // sort by season
        const season = anime['animeSeason']['season'];
        if(!filter.seasonSpring && season == 'SPRING') {if(_attemptAny()){continue}};
        if(!filter.seasonSummer && season == 'SUMMER') {if(_attemptAny()){continue}};
        if(!filter.seasonFall && season == 'FALL') {if(_attemptAny()){continue}};
        if(!filter.seasonWinter && season == 'WINTER') {if(_attemptAny()){continue}};
        if(!filter.seasonUndefined && season == 'UNDEFINED') {if(_attemptAny()){continue}};
        // sort by status
        const stat = anime['status'];
        if(!filter.statusFinished && stat == 'FINISHED') {if(_attemptAny()){continue}};
        if(!filter.statusUpcoming && stat == 'UPCOMING') {if(_attemptAny()){continue}};
        if(!filter.statusOngoing && stat == 'ONGOING') {if(_attemptAny()){continue}};
        if(!filter.statusUnknown && stat == 'UNKNOWN') {if(_attemptAny()){continue}};
        // sort by type
        const type = anime['type'];
        if(!filter.typeMovie && type == 'MOVIE') {if(_attemptAny()){continue}};
        if(!filter.typeTV && type == 'TV') {if(_attemptAny()){continue}};
        if(!filter.typeONA && type == 'ONA') {if(_attemptAny()){continue}};
        if(!filter.typeOVA && type == 'OVA') {if(_attemptAny()){continue}};
        if(!filter.typeSpecial && type == 'SPECIAL') {if(_attemptAny()){continue}};
        if(!filter.typeUnknown && type == 'UNKNOWN') {if(_attemptAny()){continue}};
        //
        list.push(anime)
    };
    return list
};
//
function randomItemsFrom(array, count) {
    var list = array, items = [];
    if(list.length > count) {
        for(var i=0; i<count; i++) {
            items.push(list.splice(Math.floor(Math.random()*(list.length-0.01)), 1)[0])
        }
    } else {
        return arrayShuffle(list)
    };
    return arrayShuffle(items)
};
//
// @EAG ANIME LIST CLASS
//
class animeList {
    constructor(name = 'AnimeListName') {
        this.list = [];
        // list = [adb_id, ...]
        // meta
        this.name = name;
        this.desc = '';
        this.color = `#fff`;
        // compatibility
        this.compat = {
            version: '1.0',
            adb: adb_information.lastUpdate,
            app: $appInfo.version,
        };
        this.timestamp = {
            created: (new Date()).toLocaleDateString() + ' ' + (new Date()).toLocaleTimeString(),
            lastChange: (new Date()).toLocaleDateString() + ' ' + (new Date()).toLocaleTimeString(),
        };
        // null if no preset
        this.presetname = null;
        // ranges
        this.rangesMode = 'auto'; // auto, manual
        this.eps = new Range(-1, 1);
        this.years = new Range(-1, 1);
        this.scores = new Range(-1, 1);
    }
    //
    updateTimestamp() {
        this.timestamp.lastChange = (new Date()).toLocaleDateString() + ' ' + (new Date()).toLocaleTimeString()
    }
    compatibility() {
        var status = {app: true, adb: true, version: this.compat.version};
        if(this.compat.adb != adb_information.lastUpdate) {status.adb = false};
        if(this.compat.app != $appInfo.version) {status.app = false};
        return status
    }
    //
    updateRangesSingle(item) {
        if(this.rangesMode == 'auto') {
            this.updateTimestamp();
            var anime = item;
            var malid = malAnimeID(anime.sources);
            if(malid == null) {anime.score = null}
            else if(adb_ratings[malid] == undefined) {anime.score = null}
            else {anime.score = String(adb_ratings[malid].score)};
            //
            if(String(Number(anime.episodes)) !== 'NaN') {
                if(this.eps.min == -1) {
                    this.eps.min = Number(anime.episodes);
                    this.eps.max = Number(anime.episodes)
                } else {
                    if(anime.episodes > this.eps.max) {this.eps.max = Number(anime.episodes)}
                    else if(anime.episodes < this.eps.min) {this.eps.min = Number(anime.episodes)}
                }
            };
            //
            if(anime.animeSeason.year != null && String(Number(anime.animeSeason.year)) !== 'NaN') {
                if(this.years.min == -1) {
                    this.years.min = Number(anime.animeSeason.year);
                    this.years.max = Number(anime.animeSeason.year)
                } else {
                    if(anime.animeSeason.year > this.years.max) {this.years.max = Number(anime.animeSeason.year)}
                    else if(anime.animeSeason.year < this.years.min) {this.years.min = Number(anime.animeSeason.year)}
                }
            };
            //
            if(anime.score !== null) {
                if(String(Number(anime.score)) !== 'NaN') {
                    if(this.scores.min == -1) {
                        this.scores.min = Number(anime.score);
                        this.scores.max = Number(anime.score)
                    } else {
                        if(anime.score > this.scores.max) {this.scores.max = Number(anime.score)}
                        else if(anime.score < this.scores.min) {this.scores.min = Number(anime.score)}
                    }
                }
            }
        }
    }
    updateRangesAll() {
        if(this.rangesMode == 'auto') {
            this.eps = new Range(-1, 1);
            this.years = new Range(-1, 1);
            this.scores = new Range(-1, 1);
            //
            for(var i in this.list) {
                this.updateRangesSingle(adb[this.list[i]])
            }
        }
    }
    //
    parse(string) {
        var obj = JSON.parse(string);
        this.list = obj.list !== undefined ? obj.list : this.list;
        this.name = obj.name !== undefined ? obj.name : this.name;
        this.desc = obj.desc !== undefined ? obj.desc : this.desc;
        this.color = obj.color !== undefined ? obj.color : this.color;
        this.compat = obj.compat !== undefined ? obj.compat : this.compat;
        this.timestamp = obj.timestamp !== undefined ? obj.timestamp : this.timestamp;
        //
        this.presetname = obj.presetname !== undefined ? obj.presetname : this.presetname;
        this.rangesMode = obj.rangesMode !== undefined ? obj.rangesMode : this.rangesMode;
        this.eps = obj.eps !== undefined ? obj.eps : this.eps;
        this.years = obj.years !== undefined ? obj.years : this.years;
        this.scores = obj.scores !== undefined ? obj.scores : this.scores;
    }
    stringify() {
        return JSON.stringify(this)
    }
    //
    newEntry(adb_id) {
        // test for repeat
        for(var key in this.list) {
            if(this.list[key] == adb_id) {return false}
        };
        // test for exist
        if(adb[adb_id] !== undefined) {
            this.list.push(String(adb_id));
            this.updateRangesSingle(adb[adb_id]);
            return true
        } else {
            return false
        }
    }
    deleteEntry(adb_id) {
        for(var k in this.list) {
            if(this.list[k] == adb_id) {
                this.deleteKey(Number(k));
                break
            }
        }
    }
    deleteKey(key) {
        var d = this.list.splice(key, 1);
        this.updateRangesAll();
        return d
    }
    //
    getAnime() {
        var anime = [];
        for(var key in this.list) {
            anime.push(adb[this.list[key]])
        };
        return anime
    }
    //
    compressArray(array) {
        this.list = [];
        for(var a in array) {
            if(array[a].dbid !== undefined) {
                this.list.push(array[a].dbid)
            } else {
                var dbid = getAnimeDBID(array[a]);
                if(dbid !== null) {
                    this.list.push(dbid)
                } else {
                    console.warn(`Title by DBID #${dbid} not found!`)
                }
            }
        };
        this.updateRangesAll()
    }
};
//
// @EAG JIKAN REST API
//
let jikan = {
    _prefix: `https://api.jikan.moe/v4/anime/`,
    _request: () => {},
    _xhr: new XMLHttpRequest(),
    _result: null,
    _response: null,
    _loaded: false,
    _error: false,
    _progress: 0,
    _waitResponse: false,
    _timeout: 0,
    //
    _update: () => {
        if(jikan._waitResponse) {
            if(jikan._timeout > 0) {
                jikan._timeout -= deltaTime
            } else {
                jikan._request();
                jikan._waitResponse = false
            }
        }
    },
    _cache: (mal_id) => {
        jikan._error = false;
        jikan._waitResponse = false;
        jikan._request = () => {};
        jikan._result = jikan._response = JSON.parse(sesRead('jikan'+mal_id));
        jikan._loaded = true
    },
    _send: (mal_id) => {
        jikan._loaded = false;
        jikan._error = false;
        jikan._result = 'wait';
        jikan._waitResponse = true;
        //
        jikan._request = () => {
            jikan._xhr.responseType = 'json';
            jikan._xhr.send();
            //
            jikan._xhr.onload = () => {
                if (jikan._xhr.status != 200) {
                    console.log(`Jikan API error with status: ${jikan._xhr.status}. (${jikan._xhr.statusText})`);
                    jikan._loaded = true;
                    jikan._error = true;
                    jikan._result = `failed`;
                } else {
                    sesWrite(`jikan${mal_id}`, JSON.stringify(jikan._xhr.response));
                    jikan._result = jikan._response = jikan._xhr.response;
                    jikan._loaded = true;
                }
            };
            jikan._xhr.onerror = () => {
                console.error(`Jikan API fatal error!`);
                jikan._result = `error`;
                jikan._loaded = true;
                jikan._error = true;
            };
            jikan._xhr.onprogress = (e) => {
                jikan._progress = e.loaded
            };
        };
        //
        if(jikan._timeout <= 0) {
            jikan._timeout = 1000
        }
    },
    //
    stats: (mal_id) => {
        jikan._xhr.open("GET", jikan._prefix + mal_id + '/statistics');
        jikan._send(mal_id)
    },
    full: (mal_id) => {
        if(sesRead('jikan'+mal_id) !== null) {
            jikan._cache(mal_id)
        } else {
            jikan._xhr.open("GET", jikan._prefix + mal_id + '/full');
            jikan._send(mal_id)
        }
    },
};
//
// @EAG JIKAN METHODS
//
function malAnimeID(sources) {
    source = null;
    for(var s in sources) {
        if(sources[s].includes('myanimelist.net')) {
            source = sources[s]
        }
    };
    if(source !== null) {
        return Number(source.substring(source.lastIndexOf('/')+1))
    } else {
        return source
    }
};
//
// @EAG TRANSLATOR API
// (MICROSOFT TRANSLATOR TEXT API)
//
let transXHR = new XMLHttpRequest();
transXHR.withCredentials = true;
transXHR.addEventListener('readystatechange', function () {
	if (this.readyState === this.DONE) {
		translator.iteration(this.responseText)
	}
});
//
let translator = {
    request: [],
    response: [],
    progress: 0,
    single: '',
    state: 'idle',
    error: false,
    target: 'ru',
    len: 350,
    //
    send: (text) => {
        var data = JSON.stringify([{Text: text}]);
        transXHR.open('POST', `https://microsoft-translator-text.p.rapidapi.com/translate?to%5B0%5D=${translator.target}&api-version=3.0&from=en`);
        transXHR.setRequestHeader('content-type', 'application/json');
        transXHR.setRequestHeader('X-RapidAPI-Key', '1c1569888bmsha3e843083c42b72p166a6fjsn2ec89f708f43');
        transXHR.setRequestHeader('X-RapidAPI-Host', 'microsoft-translator-text.p.rapidapi.com');
        transXHR.send(data);
    },
    //
    getProgress: () => {
        return `${translator.progress}/${translator.request.length}`
    },
    //
    iteration: (response) => {
        var object = JSON.parse(response);
        // обработка ответа
        if(object[0].translations === undefined) {
            // если пришло что-то кроме текста - ошибка
            translator.error = true;
            translator.response.push(object[0])
        } else {
            // если пришел текст - добавляем его
            translator.response.push(object[0].translations[0].text);
            // если ещё есть, что перевести - работаем дальше
            translator.progress++;
            if(translator.request.length > translator.progress) {
                translator.send(translator.request[translator.progress])
            } else {
                // если всё, то начинаем собирать
                translator.pack()
            }
        }
    },
    //
    pack: () => {
        translator.single = '';
        for(var str in translator.response) {
            translator.single += translator.response[str]
        };
        translator.state = 'idle'
    },
    //
    ru: (text) => {
        if(translator.state !== 'idle') {return null}
        else {
            translator.target = 'ru';
            translator.error = false;
            translator.response = [];
            translator.progress = 0;
            translator.request = textSplitByLength(text, translator.len);
            translator.state = 'work';
            // отправляем стартовый запрос
            translator.send(translator.request[0])
        }
    },
};
//
// @EAG GET DATA METHODS
//
var _lastTypeDataArray = [];
var _lastCalcEntries = [];
//
function getTypedData(root, database = adb) {
    var data = [];
    var l = database.length;
    console.info(`Start data collecting..."${root}".`);
    for(var i in database) {
        piece = eval(`database[i]${root}`);
        getArrayWorkProgress(i, l, 5);
        if(piece instanceof Array) {
            data = arrayAddNew(data, piece)
        } else {
            if(data.indexOf(piece) !== -1) {continue} else {data.push(piece)}
        }
    };
    _lastTypeDataArray = data;
    console.info(`All data in "${root}" collected to "_lastTypeDataArray".`);
    return data
};
//
function calcDataEntries(root, database=adb) {
    var data = {};
    var l = database.length;
    console.info(`Start entry calculating..."${root}".`);
    for(var i in database) {
        piece = eval(`database[i]${root}`);
        getArrayWorkProgress(i, l, 5);
        if(piece instanceof Array) {data = objectAddEntry(data, piece)}
        else {data = objectAddEntry(data, [piece])}
    };
    _lastCalcEntries = data;
    console.info(`Entries in "${root}" calculated to "_lastCalcEntries".`);
    return data
};
//
// @EAG BROWSE DB METHODS
//
function searchByTitle(request='', hard=false, db=adb) {
    var names = [], item = {}, result = [], req = request.toLowerCase();
    for(var a in db) {
        names = [].concat(db[a]['title'], db[a]['synonyms']);
        for(var t in names) {
            if(stringIncludeRequest(names[t].toLowerCase(), req, hard)) {
                item = db[a];
                if(!pref.showNSFW && filterAnimeTag('allnsfw', item['tags'])) {break};
                item.dbid = Number(a);
                result.push(db[a]); break
            }
        }
    };
    return result.length > 0 ? result : false
};
function stringIncludeRequest(str, req, hard=false) {
    var arr = req.split(' ');
    if(hard) {
        for(var w in arr) {
            if(!str.includes(arr[w])) {return false}
        }; return true
    } else {
        for(var w in arr) {
            if(str.includes(arr[w])) {return true}
        }; return false
    }
};
//
// @EAG RESIZE DOCUMENT METHODS
//
let docsize = new Vector2(960, 540);
let doczoom = 1;
let cvssize = new Vector2();
let fullsize = new Vector2();
let cvsorient = 'album';
let cvsxoffset = 0;
//
let cvsscale = new Vector1(1);
let _scaleFixed = 1;
let _scaleDynamic = 1;
//
let casState = 'idle';
let casscale = new Vector2();
let casTimeout = 0.25;
let casResized = new Vector2();
let cvsField = 0;
function canvasActualSize() {
    // const doc = new Vector2(document.documentElement.clientWidth, document.documentElement.clientHeight);
    const doc = new Vector2(window.innerWidth, window.innerHeight);
    if(casState === 'idle') {
        if(ctx.canvas.width  != doc.x || ctx.canvas.height != doc.y) {
            casState = 'moved'
        };
        if(!docsize.condAND(new Vector2(doc.x, doc.y)) && docsize.time == 0) {
            docsize.movev(doc, 0.25, easeOutQuint);
            ctx.canvas.width = doc.x;
            ctx.canvas.height = doc.y;
        }
        //
    } else if (casState === 'moved') {
        casTimeout = 0.25;
        if(casResized.x  == doc.x && casResized.y == doc.y) {
            casState = 'timeout'
        };
        casResized.setv(doc)
        //
    } else if (casState === 'timeout') {
        if(casResized.x  != doc.x || casResized.y != doc.y) {
            casState = 'moved'
        }
        casTimeout -= deltaTime/1000;
        //
        if(casTimeout <= 0) {casState = 'resize'; casTimeout = 0}
    } else if (casState === 'resize') {
        ctx.canvas.width = doc.x;
        ctx.canvas.height = doc.y;
        docsize.movev(doc, 0.25, easeOutQuint);
        casState = 'idle'
    } else if (casState === 'init') {
        if(casTimeout > 0) {
            ctx.canvas.width = doc.x;
            ctx.canvas.height = doc.y;
            docsize.movev(doc, 0.01);
        } else {
            casState = 'idle'
        };
        casTimeout -= deltaTime/1000
    };
    docsize.update();
    fullsize = docsize.get();
    if(fullsize.x < fullsize.y) {
        cvsorient = 'book';
        cvsxoffset = 0;
        cvssize = fullsize.get()
    } else {
        cvsorient = 'album';
        if(fullsize.x <= fullsize.y * 2) {
            cvsxoffset = 0;
            cvssize = fullsize.get()
        } else {
            cvsxoffset = (fullsize.x - fullsize.y*2)/2;
            cvssize.setxy(fullsize.y*2, fullsize.y)
        }
    }
    cvsscale.update();
    _scaleFixed = cvsscale.getFixed();
    _scaleDynamic = cvsscale.get()
};
//
// @EAG RESCALE METHODS
//
function globalRescale() {
    setTimeout(() => {
        lsSaveValue('scale', floatNumber(_scaleFixed, 1));
        namebox.state = 'measure';
        imageLoadProgress.state = 'measure';
        if(hoverHint.alpha.get() > 0) {hoverHint.main.state = 'measure'};
        tDesc.resize();
        sites.resizeButtons();
        rescaleFilterButtons();
        prefButtonsRescale();
    }, 300);
};
//
// @EAG MARKUP METHODS
//
function normalAlign(align=new Vector2(0.5), size=new Vector2(0)) {
    return new Vector2(cvsxoffset + cvssize.x*align.x-(size.x*align.x), cvssize.y*align.y-(size.y*align.y))
};
function fullAlign(align=new Vector2(0.5), size=new Vector2(0)) {
    return new Vector2(fullsize.x*align.x-(size.x*align.x), fullsize.y*align.y-(size.y*align.y))
};
//
let _currentAngle = 0;
function setRotation(anchor = new Vector2(), angle = 360) {
    _currentAngle += angle;
    ctx.translate(anchor.x, anchor.y);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-anchor.x, -anchor.y);
};
function resetRotation() {
    ctx.rotate((-_currentAngle * Math.PI) / 180);
    _currentAngle = 0;
};
//
function clipCanvas(size, pos = new Vector2()) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(pos.x, pos.y, size.x, size.y);
    ctx.clip()
};
function clipRestore() {ctx.restore()};
//
// @EAG IMPROVED DRAW METHODS
//
function drawImage(image, vec2) {
    ctx.drawImage(image, vec2.x, vec2.y);
};
function drawImageSized(image, vec2xy, vec2wh) {
    ctx.drawImage(image, vec2xy.x, vec2xy.y, vec2wh.x, vec2wh.y);
};
function drawImagePart(image, vec2srcxy, vec2srcwh, vec2cvsxy, vec2cvswh) {
    ctx.drawImage(image, vec2srcxy.x, vec2srcxy.y, vec2srcwh.x, vec2srcwh.y,
        vec2cvsxy.x, vec2cvsxy.y, vec2cvswh.x, vec2cvswh.y);
};
//
function fillRect(size, pos=new Vector2(), color='#000') {
    ctx.fillStyle = color;
    ctx.fillRect(pos.x, pos.y, size.x, size.y)
};
function fillRectFast(size, pos=new Vector2()) {
    ctx.fillRect(pos.x, pos.y, size.x, size.y)
};
function fillRectRounded(size, pos=new Vector2(), color='#000', radius=12*_scaleDynamic) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, size.x, size.y, [radius]);
    ctx.fill();
};
function fillRectRoundedFrame(size, pos=new Vector2(), color='#000', radius=12*_scaleDynamic) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, size.x, size.y, [radius]);
    ctx.stroke();
};
//
function alignImage(image = new Image, align) {
    image.complete ? drawImage(image, normalAlign(align, new Vector2(image.naturalWidth, image.naturalHeight))) : null
};
function alignImageSized(image = new Image, align, size) {
    image.complete ? drawImageSized(image, normalAlign(align, size), size) : null
};
//
function fillText(pos, text, color='#000', font='12px Helvetica') {
    ctx.fillStyle = color; ctx.font = font;
    ctx.fillText(text, pos.x, pos.y)
};
function fillTextFast(pos, text) {
    ctx.fillText(text, pos.x, pos.y)
};
//
function fillTextArray(pos, [array, size], spacing=5) {
    if(ctx.textAlign === 'start') {
        for(var i = 0; i < array.length; i++) {
            ctx.fillText(array[i], pos.x, pos.y + (size.y + spacing) * (i+1))
        }
    } else if(ctx.textAlign === 'end') {
        for(var i = 0; i < array.length; i++) {
            ctx.fillText(array[i], pos.x + size.x, pos.y + (size.y + spacing) * (i+1))
        }
    } else {
        for(var i = 0; i < array.length; i++) {
            ctx.fillText(array[i], pos.x + size.x/2, pos.y + size.y * (i+1))
        }
    }
};
//
// @EAG COLLISION CLASS
//
class Collision {
    constructor(pos, size) {
        this.pos = pos; this.size = size
    }
    scrollable = false;
    state() {
        if(mouse.pos.overAND(this.pos.get()) && mouse.pos.lessAND(this.pos.get().vsum(this.size.get()))) {
            if(mouse.click) {
                mouse.click = false;
                return 'click'
            } else if(scrollable && wheelState !== 'idle') {
                return wheelState === 'btm' ? 'scrollup' : 'scrolldown'
            } else return 'hover'
        } else {
            return 'idle'
        }
    }
};
//
// @EAG COLOR CLASSES
//
class Color {
    constructor(r, g, b, a) {this.r = r; this.g = g; this.b = b; this.a = a}
    rD = 0; rM = 0;
    gD = 0; gM = 0;
    bD = 0; bM = 0;
    aD = 0; aM = 0;
    time = 0; dtime = 0;
    ease = easeOutQuint;
    easer = 0;
    copy(uicolor) {
        this.r = Number(String(uicolor.r)); this.rM = uicolor.rM; this.rD = uicolor.rD;
        this.g = Number(String(uicolor.g)); this.gM = uicolor.gM; this.gD = uicolor.gD;
        this.b = Number(String(uicolor.b)); this.bM = uicolor.bM; this.bD = uicolor.bD;
        this.a = Number(String(uicolor.a)); this.aM = uicolor.aM; this.aD = uicolor.aD;
        this.dtime = uicolor.dtime; this.time = uicolor.time;
    }
    matrix(string) {
        var a = string;
        string = (string.substring(5).replace(')', '')).split(",");
        if(string.length < 4) {
            console.log("Color parse error \""+ a +"\"  - not enough parameters.");
        } else {
            this.r = Number(string[0]); this.rM = 0;
            this.g = Number(string[1]); this.gM = 0;
            this.b = Number(string[2]); this.bM = 0;
            this.a = Number(string[3]); this.aM = 0;
        }  
    }
    getColor() {
        return `rgba(${this.r + this.rM}, ${this.g + this.gM}, ${this.b + this.bM}, ${this.a + this.aM})`
    }
    set(r, g, b, a) {this.r = r; this.g = g; this.b = b; this.a = a}
    fill() {ctx.fillStyle = this.getColor()}
    fadeTo(uicolor, time) {
        if(this.dtime < this.time) {
            this.r += this.rM; this.rM = 0;
            this.g += this.gM; this.gM = 0;
            this.b += this.bM; this.bM = 0;
            this.a += this.aM; this.aM = 0;
        }
        this.rD = uicolor.r - this.r;
        this.gD = uicolor.g - this.g;
        this.bD = uicolor.b - this.b;
        this.aD = uicolor.a - this.a;
        this.dtime = 0; this.time = time;
    }
    update() {
        // fade color
        if(this.dtime < this.time) {
            this.easer = this.ease(this.dtime / this.time);
            if(this.dtime > this.time) {this.dtime = this.time};
            this.rM = this.rD * this.easer;
            this.gM = this.gD * this.easer;
            this.bM = this.bD * this.easer;
            this.aM = this.aD * this.easer;
            this.dtime += deltaTime/1000;
        } else {
            if(this.rM !== 0) {this.r += this.rD * this.ease(1); this.rM = 0};
            if(this.gM !== 0) {this.g += this.gD * this.ease(1); this.gM = 0};
            if(this.bM !== 0) {this.b += this.bD * this.ease(1); this.bM = 0};
            if(this.aM !== 0) {this.a += this.aD * this.ease(1); this.aM = 0};
        }
    }
    alpha(alpha) {
        return new Color(this.r + this.rM, this.g + this.gM, this.b + this.bM, alpha)
    }
    alphaMult(mult) {
        return new Color(this.r + this.rM, this.g + this.gM, this.b + this.bM, (this.a + this.aM) * mult)
    }
    light(perc) {
        return new Color(
            Math.floor((this.r + this.rM) * perc / 100),
            Math.floor((this.g + this.gM) * perc / 100),
            Math.floor((this.b + this.bM) * perc / 100),
            this.a
        )
    }
    gamma(perc) {
        return new Color(
            Math.floor((this.r + this.rM) + ((255 - (this.r + this.rM)) * perc / 100)),
            Math.floor((this.g + this.gM) + ((255 - (this.g + this.gM)) * perc / 100)),
            Math.floor((this.b + this.bM) + ((255 - (this.b + this.bM)) * perc / 100)),
            this.a
        )
    }
    invert() {
        return new Color(
            255 - (this.r + this.rM),
            255 - (this.g + this.gM),
            255 - (this.b + this.bM),
            this.a
        )
    }
};
function colorMatrix(string) {
    var a = string;
    string = (string.substring(5).replace(')', '')).split(",");
    if(string.length < 4) {
        console.log("Colormap parse error \""+ a +"\"  - not enough parameters.");
        return new Color(0, 0, 0, 1);
    } else {
        return new Color(Number(string[0]), Number(string[1]), Number(string[2]), Number(string[3]))
    }  
};
//
// @EAG UI MAP CLASSES
//
class ColorMap {
    constructor(idle, hover, click, unaval) {
        this.idle = idle; this.hover = hover; this.click = click; this.unaval = unaval
    }
    matrix(string) {
        var map = (string.replace(' ', '')).split(',');
        this.idle = colorMatrix(map[0]);
        this.hover = colorMatrix(map[1]);
        this.click = colorMatrix(map[2]);
        this.unaval = colorMatrix(map[3]);
    }
    color = new Color(0, 0, 0, 0);
    state = 'idle';
    init = false;
    update() {
        this.color.update();
        if(!this.init) {
            this.setState('hover', 0.1);
            this.init = true
        }
    }
    fill() {ctx.fillStyle = this.color.getColor()}
    get() {return this.color.getColor()}
    setState(state, time) {
        if(state == 'idle' && state !== this.state) {this.color.fadeTo(this.idle, time)}
        else if(state == 'hover' && state !== this.state) {this.color.fadeTo(this.hover, time)}
        else if(state == 'click' && state !== this.state) {this.color.copy(this.click)}
        else if(state == 'unaval' && state !== this.state) {this.color.fadeTo(this.unaval, time)};
        this.state = state
    }
    alphaMult(mult) {
        this.idle.alphaMult(mult);
        this.hover.alphaMult(mult);
        this.click.alphaMult(mult);
        this.unaval.alphaMult(mult)
    }
};
function colorMapMatrix(string) {
    var map = string.split('#');
    return new ColorMap(
        colorMatrix(map[0]),
        colorMatrix(map[1]),
        colorMatrix(map[2]),
        colorMatrix(map[3]))
};
//
let colorMapBackDefault = `rgba(31,31,31,1)#rgba(63,63,63,1)#rgba(63,63,63,1)#rgba(0,0,0,0.5)`;
let colorMapForeDefault = `rgba(225,225,225,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(191,191,191,0.75)`;
//
// @EAG PATH2D METHODS
//
function shapeRectRounded(pos, size, radiusArray=[12]) {
    var shape = new Path2D();
    shape.roundRect(pos.x, pos.y, size.x, size.y, radiusArray);
    return shape
};
//
function fillShape(shape, color) {
    ctx.fillStyle = color;
    ctx.fill(shape)
};
function shapeCollisionState(shape, scrollable=false) {
    if(ctx.isPointInPath(shape, mouse.pos.x, mouse.pos.y)) {
        if(mouse.click) {
            mouse.click = false;
            return 'click'
        } else if(scrollable && wheelState !== 'idle') {
            return wheelState === 'btm' ? 'scrollup' : 'scrolldown'
        } else return 'hover'
    };
    return 'idle'
};
//
// @EAG 2D STYLED SHAPES
//
function shapeProgressBar(pos, size, prog, colormap) {
    const p = pos.get();
    const r = size.y/2;
    const w = size.x - size.y;
    const fg = colormap.hover.getColor();
    const bg = colormap.idle.getColor();
    // grad
    var s = ctx.createLinearGradient(p.x, p.y, p.x+size.x, p.y);
    s.addColorStop(0, fg);
    s.addColorStop(prog, fg);
    s.addColorStop(prog, bg);
    s.addColorStop(1, bg);
    ctx.fillStyle = s;
    // shape
    ctx.beginPath();
    ctx.arc(p.x+r, p.y+r, r, Math.PI/2, 3/2*Math.PI);
    ctx.lineTo(p.x+r+w, p.y);
    ctx.arc(p.x+r+w, p.y+r, r, 3/2*Math.PI, Math.PI/2);
    ctx.fill();
};
//
function transitionGradient(prog) {
    var s = ctx.createLinearGradient(cvssize.x*0.25, 0, cvssize.x*0.75, cvssize.y);
    const color1 = '#339';
    const color2 = '#fff';
    //
    s.addColorStop(0, color1);
    s.addColorStop(0.2 + prog/2, color1);
    s.addColorStop(0.25 + prog/2, color2);
    s.addColorStop(0.3 + prog/2, color1);
    s.addColorStop(1, color1);
    //
    return s
};
//
function rotatingArc(prog, radius, pos) {
    var a = new Path2D();
    var offs = Math.PI * 2 * prog;
    a.arc(pos.x, pos.y, radius, offs, offs + Math.PI/2);
    ctx.stroke(a)
};
//
// @EAG SHAPED TEXTBUTTON
//
class TextButtonShaped {
    constructor(shape, text, size, colormap_text, colormap_shape) {
        this.shapefunc = shape; this.text = text; this.size = size;
        this.textcm = colormap_text; this.shapecm = colormap_shape;
        this.shadowclr = colormap_shape.idle.light(50).getColor();
        this.metrics = getTextMetrics(text);
        this.pos = new Vector2();
        this.alpha = new Vector1(1);
        this.height = 7;
        this.tap = new Vector1(0);
        this.textclr = `rgba(0,0,0,1)`;
        this.shapeclr = `rgba(255,255,255,1)`;
        this.shape = new Path2D();
        this.shadow = new Path2D();
        this.state = 'idle';
        this.aval = true;
        this.active = false;
        this.oldact = '';
        this.initactivity = false;
        this.locked = false;
        this.isSwitcher = false;
        this.needshadow = true;
        this.oldstate = 'idle';
        this.waitanim = true;
        this.textpos = new Vector2();
        this.onclick = () => {};
        this.ondeact = () => {};
        this.onhide = () => {};
        this.onshow = () => {};
        this.onhover = () => {};
    }
    draw() {
        if(this.aval) {
            // update all
            this.pos.update();
            this.size.update();
            this.alpha.update();
            this.tap.update();
            // scaling
            var size = this.size.get();
            var height = this.height * _scaleDynamic
            var tap = this.tap.get() * _scaleDynamic;
            //
            this.shape = this.shapefunc(this.pos.get().sumxy(0, tap), size, [12 * _scaleDynamic]);
            this.shadow = this.shapefunc(this.pos.get().sumxy(0, tap+1), size.sumxy(0, height-tap), [12 * _scaleDynamic]);
            //
            if(this.state !== 'unaval') {
                if(!this.initactivity) {this.state = shapeCollisionState(this.shadow, false)}
                else {setTimeout(() => {this.active = true}, 500); this.initactivity = false};
                //
                if(this.state === 'hover') {this.onhover()};
                if(this.state !== this.oldstate) {
                    if(this.state === 'click') {
                        if(this.isSwitcher) {
                            if(this.active) {
                                if(!this.locked) {
                                    playSound(sound['tagexc']);
                                    this.ondeact();
                                    this.active = false
                                }
                            } else {
                                playSound(sound['taginc']);
                                this.onclick();
                                mouse.click = false;
                                this.active = true
                            }
                        } else {
                            this.tap.set(0);
                            this.tap.move(this.height, 0.25, easeParabolaQuad);
                            mouse.click = false;
                            //
                            this.waitanim
                            ? setTimeout(() => {this.onclick()}, 250)
                            : this.onclick()
                        }
                    };
                    this.oldstate = this.state
                };
                if(this.oldact !== this.active) {
                    if(this.active) {
                        this.tap.set(0);
                        this.tap.move(this.height, 0.25, easeInOutSine)
                    } else {
                        this.tap.set(this.height);
                        this.tap.move(0, 0.25, easeInOutSine)
                    };
                    this.oldact = this.active
                }
            };
            //
            if(this.isSwitcher) {
                if(this.active) {
                    this.shapecm.setState('click', 0.25);
                    this.textcm.setState('click', 0.25)
                } else {
                    this.shapecm.setState('idle', 0.25);
                    this.textcm.setState('idle', 0.25)
                };
            } else {
                this.shapecm.setState(this.state, 0.25);
                this.textcm.setState(this.state, 0.25)
            };
            this.shapecm.update();
            this.textcm.update();
            this.shapecm.alphaMult(this.alpha);
            this.textcm.alphaMult(this.alpha);
            this.shapeclr = this.shapecm.get();
            this.textclr = this.textcm.get();
            // draw
            this.needshadow ? fillShape(this.shadow, this.shadowclr):null;
            fillShape(this.shape, this.shapeclr);
            this.metrics = getTextMetrics(this.text);
            this.textpos = this.pos.get().sumxy(size.x/2, (size.y - this.metrics.y)/3 + this.metrics.y).sumxy(0, tap);
            ctx.fillStyle = this.textclr;
            ctx.fillText(this.text, this.textpos.x, this.textpos.y, [size.x])
        }
    }
};
//
// @EAG SHAPED IMAGEBUTTON
//
let _imagebuttonheight = 6;
class ImageButtonShaped {
    constructor(shape, image, spacing, colormap_shape) {
        this.shapefunc = shape; this.image = image; this.spacing = spacing;
        this.shapecm = colormap_shape;
        this.shadowclr = colormap_shape.idle.light(50).getColor();
        this.shapesize = new Vector2();
        this.pos = new Vector2();
        this.alpha = new Vector1(1);
        this.height = _imagebuttonheight-1;
        this.tap = new Vector1(0);
        this.textclr = `rgba(0,0,0,1)`;
        this.shapeclr = `rgba(255,255,255,1)`;
        this.shape = new Path2D();
        this.shadow = new Path2D();
        this.state = 'idle';
        this.aval = false;
        this.active = false;
        this.isSwitcher = false;
        this.oldstate = 'idle';
        this.imagepos = new Vector2();
        this.zoom = new Vector2(1);
        this.locked = false;
        this.waitanim = true;
        this.needshadow = true;
        this.ondeact = () => {};
        this.onclick = () => {};
        this.onhover = () => {};
        this.onhide = () => {};
        this.onshow = () => {};
    }
    sizedZoom(size) {
        this.zoom.setv(size.dividev(new Vector2(this.image.naturalWidth, this.image.naturalHeight).sumv(this.spacing.get().multxy(2))))
    }
    draw() {
        if(this.aval) {
            // vectors
            this.pos.update();
            this.zoom.update();
            this.shapesize = this.zoom.get().multv(new Vector2(this.image.naturalWidth, this.image.naturalHeight).sumv(this.spacing.get().multxy(2)));
            this.alpha.update();
            this.tap.update();
            // shapes
            this.shape = this.shapefunc(this.pos.get().sumxy(0, this.tap.get()), this.shapesize);
            this.shadow = this.shapefunc(this.pos.get().sumxy(0, this.tap.get()+1), this.shapesize.sumxy(0, this.height-this.tap.get()));
            // states
            if(this.state !== 'unaval') {
                this.state = shapeCollisionState(this.shape, false);
                if(this.state === 'hover') {this.onhover()};
                if(this.state !== this.oldstate) {
                    if(this.state === 'click') {
                        if(this.isSwitcher) {
                            if(this.active) {
                                if(!this.locked) {
                                    playSound(sound['tagexc']);
                                    this.tap.set(this.height);
                                    this.tap.move(0, 0.25, easeInOutSine)
                                }
                            } else {
                                playSound(sound['taginc']);
                                this.tap.set(0);
                                this.tap.move(this.height, 0.25, easeInOutSine);
                                this.onclick();
                                mouse.click = false
                            }
                        } else {
                            this.tap.set(0);
                            this.tap.move(this.height, 0.25, easeParabolaQuad);
                            mouse.click = false;
                            //
                            this.waitanim
                            ? setTimeout(() => {this.onclick()}, 250)
                            : this.onclick()
                        }
                    };
                    this.oldstate = this.state
                }
            };
            // colors
            !this.isSwitcher ? this.shapecm.setState(this.state, 0.25) : this.active ? this.shapecm.setState('click', 0.25) : this.shapecm.setState('idle', 0.25);
            this.shapecm.update();
            this.shapeclr = this.shapecm.get();
            this.shadowclr = this.shapecm.idle.light(50).getColor();
            // draw
            const oldalp = ctx.globalAlpha;
            ctx.globalAlpha = ctx.globalAlpha * this.alpha.get();
            this.needshadow ? fillShape(this.shadow, this.shadowclr) : null;
            fillShape(this.shape, this.shapeclr);
            this.imagepos = this.pos.get().sumv(this.spacing.get()).sumxy(0, this.tap.get());
            drawImageSized(this.image, this.imagepos, this.shapesize.minv(this.spacing.get().multxy(2)));
            ctx.globalAlpha = oldalp
        } else {
            this.aval = this.image.complete
        }
    }
};
//
// @EAG SHAPED TAG SWITCHER
//
class TagSwitcherShaped {
    constructor(tag) {
        this.tag = tag;
        this.pos = new Vector2();
        this.alpha = new Vector1(1);
        this.height = _imagebuttonheight-1;
        this.tap = new Vector1(0);
        this.shapecm = colorMapMatrix(`rgba(140,31,140,1)#rgba(190,47,190,1)#rgba(255,63,255,1)#rgba(0,0,0,0)`);
        this.textcm = colorMapMatrix(colorMapForeDefault);
        this.shdw = new Color(255,255,63,0.5);
        this.textclr = `rgba(0,0,0,1)`;
        this.shapeclr = `rgba(255,255,255,1)`;
        this.shadowclr = `rgba(0,0,0,0)`;
        this.shapefunc = shapeRectRounded;
        this.shape = new Path2D();
        this.shadow = new Path2D();
        this.state = 'idle';
        this.oldstate = 'idle';
        this.tagstate = '';
        this.textpos = new Vector2();
        this.text = '';
    }
    draw() {
        // update all
        this.alpha.update();
        this.tap.update();
        this.shdw.update();
        this.text = tagbase[this.tag].name;
        // scale
        var height = this.height * _scaleDynamic;
        var tap = this.tap.get() * _scaleDynamic;
        //
        this.shape = this.shapefunc(this.pos.get().sumxy(0, tap), this.size.get(), [12 * _scaleDynamic]);
        this.shadow = this.shapefunc(this.pos.get().sumxy(0, tap+1), this.size.get().sumxy(0, height-tap), [12 * _scaleDynamic]);
        this.state = shapeCollisionState(this.shadow, false);
        //
        if(this.state !== this.oldstate) {
            if(this.state === 'click') {
                if(tagSelection[this.tag] === 'none') {
                    playSound(sound['taginc']);
                    tagSelection[this.tag] = 'inc'
                } else if(tagSelection[this.tag] === 'inc') {
                    playSound(sound['tagexc']);
                    tagSelection[this.tag] = 'exc'
                } else {
                    playSound(sound['tagnone']);
                    tagSelection[this.tag] = 'none'
                };
                lsSaveObject('tagSelection', tagSelection);
                filterPrecount.request(true)
            };
            this.oldstate = this.state
        };
        //
        if(this.tagstate !== tagSelection[this.tag]) {
            if(tagSelection[this.tag] === 'none') {
                this.tap.move(height, 0.25, easeOutCirc);
                this.shdw.fadeTo(colorMatrix(`rgba(255,63,255,0)`), 0.25)
            } else if(tagSelection[this.tag] === 'inc') {
                this.tap.move(0, 0.25, easeOutCirc);
                this.shdw.fadeTo(colorMatrix(`rgba(63,255,63,0.8)`), 0.25)
            } else {
                if(this.tagstate === 'none') {
                    this.tap.move(0, 0.25, easeOutCirc);
                } else {
                    this.tap.set(0);
                    this.tap.move(height, 0.25, easeParabolaQuad)
                };
                this.shdw.fadeTo(colorMatrix(`rgba(255,63,63,0.8)`), 0.25)
            };
            this.tagstate = tagSelection[this.tag]
        };
        //
        this.shapecm.setState(this.state, 0.25);
        this.textcm.setState(this.state, 0.25);
        this.shapecm.update();
        this.textcm.update();
        this.shapecm.alphaMult(this.alpha);
        this.textcm.alphaMult(this.alpha);
        this.shapeclr = this.shapecm.get();
        this.textclr = this.textcm.get();
        this.shadowclr = this.shdw.getColor();
        // draw
        if(tap !== height) {fillShape(this.shadow, this.shadowclr)};
        fillShape(this.shape, this.shapeclr);
        this.metrics = getTextMetrics(this.text);
        this.textpos = this.pos.get().sumxy(this.size.get().x/2, (this.size.get().y - this.metrics.y)/3 + this.metrics.y).sumxy(0, tap);
        ctx.fillStyle = this.textclr;
        ctx.fillText(this.text, this.textpos.x, this.textpos.y, [this.size.get().x])
    }
};
//
// @EAG SHAPED SELECT BAR
//
let _selectbarlocking = false;
class ShapedSelectBar {
    constructor(size, fore, back) {
        this.size = size; this.fore = fore; this.back = back;
        this.pos = new Vector2();
        this.shadow = new Path2D();
        this.shape = new Path2D();
        this.radius = 5;
        this.spacing = 2;
        this.maxvalue = 1;
        this.progress = 0;
        this.pointer = 0;
        this.visual = new Vector1();
        this.visAlias = false;
        this.state = 'idle';
        this.mod = false;
        this.permanent = false;
        this.scrollable = false;
        this.onset = (value) => {};
        this.onhover = (value) => {};
        this.postdraw = (value) => {};
        this.unpress = (value) => {};
    }
    update(value, max=this.maxvalue) {this.maxvalue = max; this.progress = value / this.maxvalue}
    get() {return this.progress * this.maxvalue}
    point() {return this.pointer * this.maxvalue}
    draw() {
        this.fore.update();
        this.back.update();
        this.visual.update();
        // shape alias
        if(this.visAlias) {
            var vis = Math.round(Math.norma(this.pointer) * this.maxvalue) / this.maxvalue;
            if(this.visual.getFixed() !== vis) {this.visual.move(vis, 0.2, easeInOutCubic)}} 
        else {this.visual.set(Math.norma(this.pointer))};
        // shapes
        this.shadow = shapeRectRounded(this.pos, this.size, this.radius * _scaleDynamic);
        this.shape = shapeRectRounded(this.pos.sumxy(this.spacing * _scaleDynamic), this.size.minxy(this.spacing*2 * _scaleDynamic).multxy(this.visual.get(), 1), this.radius * _scaleDynamic)
        this.state = shapeCollisionState(this.shadow, false);
        // control
        if(!this.mod) {this.pointer = this.progress};
        if(this.permanent) {
            if(this.state === 'hover' || this.state === 'click') {
                this.onhover(this.maxvalue * ((mouse.pos.x - this.pos.x) / this.size.x));
                if(mouse.press) {
                    this.mod = true;
                    this.progress = this.pointer = (mouse.pos.x - this.pos.x) / this.size.x;
                    this.onset(this.get())
                } else if(this.mod){
                    this.mod = false;
                    this.unpress(this.get())
                };
                if(this.scrollable && wheelState !== 'idle') {
                    this.mod = true;
                    wheelState == 'top'
                    ? this.pointer = Math.norma(this.progress - 0.05)
                    : this.pointer = Math.norma(this.progress + 0.05)
                }
            }  else if(this.mod){
                this.mod = false;
                this.unpress(this.get())
            }
        } else {
            if(this.state === 'hover' || this.state === 'click') {
                this.onhover(this.maxvalue * ((mouse.pos.x - this.pos.x) / this.size.x));
                if(mouse.press) {
                    this.pointer = (mouse.pos.x - this.pos.x) / this.size.x;
                    this.mod = true
                } else if(this.mod) {
                    this.progress = this.pointer;
                    this.onset(this.get());
                    this.mod = false
                };
                if(this.scrollable && wheelState !== 'idle') {
                    this.mod = true;
                    wheelState == 'top'
                    ? this.pointer = Math.norma(this.progress - 0.05)
                    : this.pointer = Math.norma(this.progress + 0.05)
                }
            } else if(this.mod) {
                this.progress = this.pointer;
                this.onset(this.get());
                this.mod = false
            }
        };
        // draw
        fillShape(this.shadow, this.back.getColor());
        fillShape(this.shape, this.fore.getColor());
        this.postdraw(this.get())
    } 
};
//
// @EAG SHAPED HOLDBUTTON
//
let _holdbuttonbhvr = {
    time: '1000',
    ease: easeInOutSine,
};
class ShapedHoldButton {
    constructor(shape, size, colormap_shape) {
        this.shapefunc = shape; this.size = size; this.shapecm = colormap_shape;
        this.shadowclr = colormap_shape.idle.light(50).getColor();
        this.progclr = colormap_shape.click.getColor();
        this.grad = ctx.createLinearGradient(0,0,0,0);
        this.pos = new Vector2();
        this.alpha = new Vector1(1);
        this.height = 5;
        this.tap = new Vector1(0);
        this.shapeclr = `rgba(255,255,255,1)`;
        this.shape = new Path2D();
        this.shadow = new Path2D();
        this.state = 'idle';
        this.aval = true;
        this.locked = false;
        this.needshadow = true;
        this.time = _holdbuttonbhvr.time;
        this.dtime = Number(_holdbuttonbhvr.time);
        this.operate = false;
        this.progress = Number(0);
        this.onact = () => {};
        this.onhide = () => {};
        this.onshow = () => {};
        this.onhover = () => {};
        this.onpress = () => {};
    }
    draw() {
        if(this.aval) {
            // update all
            this.pos.update();
            this.size.update();
            this.alpha.update();
            this.tap.update();
            // scaling
            var size = this.size.get();
            var height = this.height * _scaleDynamic
            var tap = this.tap.get() * _scaleDynamic;
            //
            this.shape = this.shapefunc(this.pos.get().sumxy(0, tap), size, [12 * _scaleDynamic]);
            this.shadow = this.shapefunc(this.pos.get().sumxy(0, tap+1), size.sumxy(0, height-tap), [12 * _scaleDynamic]);
            this.state = shapeCollisionState(this.shadow, false);
            //
            if(this.state !== 'unaval') {
                if(this.state !== 'idle') {
                    this.onhover();
                    if(mouse.press) {
                        this.shapecm.setState('hover', 0.25);
                        this.dtime > 0 ? this.dtime -= deltaTime : this.dtime = 0;
                        this.onpress();
                        //
                        if(this.dtime <= 0 && !this.operate) {
                            this.operate = true;
                            this.tap.set(0);
                            this.tap.move(height, 0.25, easeOutCirc);
                            this.onact()
                        }
                    } else {
                        this.shapecm.setState('idle', 0.25);
                        if(this.dtime < Number(this.time) && !this.operate) {
                            this.dtime += deltaTime;
                            if(this.dtime > Number(this.time)) {this.dtime = Number(this.time)}
                        }
                    }
                } else {
                    this.shapecm.setState('idle', 0.25);
                    if(!this.operate) {
                        this.dtime = Number(this.time);
                    }
                }
            } else {this.shapecm.setState('unaval', 0.25)};
            //
            this.shapecm.update();
            this.shapecm.alphaMult(this.alpha);
            this.shapeclr = this.shapecm.get();
            this.progress = 1 - (this.dtime / Number(this.time));
            // gradient
            this.grad = ctx.createLinearGradient(this.pos.x, 0, this.pos.x+this.size.x, 0);
            this.grad.addColorStop(0, this.progclr);
            this.grad.addColorStop(Math.norma(this.progress), this.progclr);
            this.grad.addColorStop(Math.norma(this.progress+0.001), this.shapeclr);
            this.grad.addColorStop(1, this.shapeclr);
            // draw
            this.needshadow ? fillShape(this.shadow, this.shadowclr):null;
            fillShape(this.shape, this.grad);
        }
    }
    // внешняя разблокировка после активации
    unblock() {
        this.operate = false;
        this.dtime = Number(this.time);
        this.tap.move(0, 0.25, easeOutCirc)
    }
};
//
// @EAG TEXT METHODS
//
function scaleFont(size, font, style=false) {
    ctx.font = style !== false
    ? `${style} ${size * _scaleDynamic}px ${font}`
    : `${size * _scaleDynamic}px ${font}`
};
function scaleFontObject(fontobject) {
    ctx.font = fontobject.style !== false
    ? `${fontobject.style} ${fontobject.size * _scaleDynamic}px ${fontobject.font}`
    : `${fontobject.size * _scaleDynamic}px ${fontobject.font}`
};
//
function setTextStyle(size, family, color=colorMatrix(`rgba(255,255,255,1)`), align, style=false) {
    ctx.fillStyle = color.getColor();  ctx.textAlign = align;
    if(style) {
        ctx.font = `${style} ${size}px ${family}`
    } else {
        ctx.font = `${size}px ${family}`
    }
};
function getTextMetrics(text) {
    var t = ctx.measureText(text);
    return {y: t.fontBoundingBoxAscent, x: t.width, c: t.actualBoundingBoxLeft}
};
function getMaxTextWidth(array) {
    var w = getTextMetrics('.');
    for(var i in array) {
        if(getTextMetrics(array[i]).x > w.x) {w = getTextMetrics(array[i])}
    };
    return w
};
function getMaxTextLength(array) {
    var w = 0;
    for(var i in array) {
        if(array[i].length > w) {w = array[i].length}
    };
    return w
};
//
function textStringLimit(text, limit) {
    width = getTextMetrics(text).x;
    if(width <= limit) {
        return text
    } else {
        return text.substring(0, Math.floor(text.length * (limit / width)) - 2) + '...'
    }
};
function textSplitByLength(full='', len, max=199) {
    if(full.length <= len) {return [full]}
    else {
        var iter = 0, ma=0, mb=0, fragment = '', result = [];
        // отрезаем кусок
        while(ma + len < full.length) {
            // берём len символов от А маркера
            fragment = full.substring(ma, ma+len);
            // узнаём позицию последнего пробела, назначаем Б маркер
            mb = fragment.lastIndexOf(' ');
            // отрезаем уже нужный отрезок от А до Б маркеров
            fragment = fragment.substring(0, mb);
            // записываем результат, перемещаем А маркер
            result.push(fragment);
            ma = ma + mb;
            // если остаток строки больше максимума, цикл повторится
            // ограничиваем кол-во итераций
            iter++; if(iter >= max) {break}
        };
        // если меньше, то остаток строки будет отправлен в result и на этом функция завершится
        result.push(full.substring(ma));
        return result
    }
};
//
function textWidthFit(text, width, max) {
    // textbox fill
    var iter = 0, state = 'measure', strings = [], measure, pointer, settext = text;
    while(state !== '') {
        if(state === 'measure') {
            measure = getTextMetrics(settext);
            if(measure.x <= width) {
                strings.push(settext);
                state = ''
            } else {
                state = 'cut'
            }
        } else if (state === 'cut') {
            pointer = Math.floor(settext.length / (measure.x / width));
            if((settext.substring(0, pointer)).lastIndexOf(' ') !== -1) {
                pointer = (settext.substring(0, pointer)).lastIndexOf(' ');
                strings.push(settext.substring(0, pointer));
                settext = settext.replace(settext.substring(0, pointer)+' ', '');
                state = 'measure'
            } else {
                strings.push(settext.substring(0, pointer));
                settext = settext.replace(settext.substring(0, pointer), '');
                state = 'measure'
            }
        };
        // iter limit
        iter++; if(iter >= max) {break}
    };
    return [strings, new Vector2(width, measure.y)]
};
//
class TextBox {
    constructor(pos, size, margin=new Vector2(10)) {
        this.pos = pos; 
        this.size = size; 
        this.margin = margin;
        //
        this.text = ``;
        this.settext = ``;
        this.strings = [];
        this.complet = [''];
        this.spacing = 5;
        this.iterlimit = 99;
        this.addshadow = true;
        this.dissolve = new Vector1(1);
        this.dissolving = false;
        this.corner = new Vector2();
        this.state = '';
        this.measure = getTextMetrics(this.text);
        this.shadow = new Vector2();
        this.onupd = () => {};
    }
    measureShadow() {
        var maxwidth = getMaxTextWidth(this.complet);
        // update shadow
        this.state = '';
        this.shadow = new Vector2(
            maxwidth.x + this.margin.x*2, 
            (this.measure.y * this.complet.length) + (this.spacing * this.complet.length) + this.margin.y*2
        );
    }
    clear() {
        this.state = '';
        this.complet = [''];
        this.strings = [];
        this.text = ``;
        this.settext = ``;
    }
    draw() {
        var pointer = 0, iters = 0;
        // update all
        this.pos.update();
        this.size.update();
        this.margin.update();
        this.shadow.update();
        this.dissolving ? this.dissolve.update() : false;
        // detect text changes
        if(this.state === '' && this.settext !== this.text) {
            this.settext = this.text;
            this.state = 'measure';
            iters = 0
        };
        //
        // textbox fill
        while(this.state !== '') {
            if(this.state === 'measure') {
                this.measure = getTextMetrics(this.settext);
                if(this.measure.x <= this.size.get().x) {
                    if(iters <= this.iterlimit) {this.strings.push(this.settext)};
                    this.complet = this.strings;
                    this.strings = [];
                    this.settext = this.text;
                    this.state = ''
                    // update shadow
                    var maxwidth = getMaxTextWidth(this.complet);
                    this.shadow.movexy(
                        maxwidth.x + this.margin.get().x*2, 
                        (this.measure.y * this.complet.length) + (this.spacing * this.complet.length) + this.margin.y*2,
                        0.5, easeOutExpo
                    );
                    //
                    if(this.dissolving) {
                        this.dissolve.set(0.4);
                        this.dissolve.move(1, 0.2, easeInCirc)
                    };
                    // end by iter limit
                    if(iters > this.iterlimit) {break}
                } else {
                    this.state = 'cut'
                }
            } else if (this.state === 'cut') {
                pointer = Math.floor(this.settext.length / (this.measure.x / this.size.x));
                if((this.settext.substring(0, pointer)).lastIndexOf(' ') !== -1) {
                    pointer = (this.settext.substring(0, pointer)).lastIndexOf(' ');
                    this.strings.push(this.settext.substring(0, pointer));
                    this.settext = this.settext.replace(this.settext.substring(0, pointer)+' ', '');
                    this.state = 'measure'
                } else {
                    this.strings.push(this.settext.substring(0, pointer));
                    this.settext = this.settext.replace(this.settext.substring(0, pointer), '');
                    this.state = 'measure'
                }
            };
            iters++
        };
        // ограничиваем ширину текста изменяя расстояние между знаками
        var letters = 0-((this.shadow.getFixed().x - this.shadow.get().x)/(getMaxTextLength(this.complet)-1));
        // if(letters > 0) {letters = 0};
        ctx.letterSpacing = `${letters}px`;
        // draw
        var p = this.pos.get();
        this.dissolving ? ctx.globalAlpha = this.dissolve.get() : false;
        for(var i = 0; i < this.complet.length; i++) {
            ctx.fillText(this.complet[i], p.x, p.y + (this.spacing + this.measure.y) * i)
        };
        ctx.globalAlpha = 1;
        ctx.letterSpacing = '0px';
        this.onupd()
    }
    getShadowPos() {
        var p = this.pos.get().sumxy(0, this.margin.get().y+this.spacing);
        var anchor = p.minxy(this.shadow.get().x/2, this.shadow.getFixed().y);
        if(ctx.textAlign === 'start') {
            anchor = p.minxy(this.margin.get().x, this.shadow.getFixed().y)
        } else if (ctx.textAlign === 'end') {
            anchor = p.minxy(this.shadow.get().x, this.shadow.getFixed().y).sumxy(this.margin.get().x)
        };
        return anchor.sumxy(0, (this.spacing + this.measure.y) * (this.complet.length-1))
    }
    castShadow() {
        fillRectRounded(new Vector2(this.shadow.get().x, this.shadow.getFixed().y), this.getShadowPos(), `rgba(0,0,0,${pref.bgalpha})`)
    }
};
//
// @EAG HOVER ELEMENTS HINTS
//
let hoverHint = {
    main: new TextBox(new Vector2(), new Vector2(320, 0), new Vector2(5)),
    text: '',
    //
    box: 320,
    margin: new Vector2(5),
    fit: new Vector2(),
    offset: 25,
    pose: new Vector2(),
    //
    font: 'Segoe UI Light',
    fsize: 14,
    spacing: 3,
    color: '#fff',
    //
    scaletime: 0,
    //
    time: 0.33,
    cd: 0,
    alpha: new Vector1(0),
    //
    invoke: (text, color = '#fff') => {
        hoverHint.text = text;
        hoverHint.cd = hoverHint.time;
        hoverHint.color = color
    },
    //
    draw: () => {
        // draw info about scale (da, pryamo zdes', NuAHule)
        if(cvsscale.isMoving()) {hoverHint.scaletime = 1.25}
        if(hoverHint.scaletime > 0) {
            hoverHint.scaletime -= deltaTime/1000;
            ctx.globalAlpha = Math.norma(hoverHint.scaletime*3);
            scaleFont(24, 'Segoe UI', 'bold');
            ctx.textAlign = 'end'; ctx.fillStyle = '#cfc';
            fillTextFast(normalAlign(new Vector2(0.99, 0.01)).sumxy(0, 32 * _scaleDynamic), txt('prefScale') + floatNumber(_scaleDynamic, 2));
            ctx.globalAlpha = 1;
        };
        // set
        if(hoverHint.text != '' && hoverHint.alpha.getFixed() !== 1) {
            hoverHint.alpha.applyMod();
            hoverHint.alpha.move(1, hoverHint.time, easeInOutCubic)
        };
        // update
        hoverHint.alpha.update();
        hoverHint.cd -= deltaTime/1000;
        scaleFont(hoverHint.fsize, hoverHint.font);
        var hoff = getTextMetrics('|').y;
        ctx.globalAlpha = hoverHint.alpha.get();
        hoverHint.main.text = hoverHint.text;
        hoverHint.fit = hoverHint.main.shadow.get();
        // moving alpha
        if(hoverHint.text == '' && hoverHint.alpha.getFixed() !== 0) {hoverHint.alpha.move(0, hoverHint.time, easeInOutCubic)};
        if(hoverHint.alpha.get() > 0) {
            // scale
            hoverHint.main.size.x = hoverHint.box * _scaleFixed;
            hoverHint.main.margin = hoverHint.margin.multxy(_scaleDynamic);
            var offset = hoverHint.offset * _scaleDynamic;
            // get pos
            mouse.pos.x + offset + hoverHint.fit.x > cvssize.x
            ? hoverHint.pose.x = cvssize.x - hoverHint.fit.x
            : hoverHint.pose.x = mouse.pos.x + offset;
            mouse.pos.y + hoverHint.fit.y + offset > cvssize.y
            ? hoverHint.pose.y = cvssize.y - hoverHint.fit.y + hoff
            : hoverHint.pose.y = mouse.pos.y + offset + hoff;
            // draw
            hoverHint.main.pos = hoverHint.pose;
            hoverHint.main.spacing = hoverHint.spacing * _scaleDynamic;
            ctx.textAlign = 'start';
            hoverHint.main.castShadow();
            ctx.fillStyle = hoverHint.color;
            hoverHint.main.draw()
        };
        // end
        ctx.globalAlpha = 1;
        hoverHint.text = ''
    }
};
//
// @EAG IMAGE METHODS
//
let fitFrameSize = new Vector2(240);
let fitFrameBg = new Color(0, 0, 0, 0.8);
let fitImageBorder = 4;
let fitImageSquared = false;
let allInvokedImages = [];
// for predict 404
let imageNotFound = invokeNewImage('images/notfound.png');
//
let imageWorkInProgress = invokeNewImage('images/wip.png');
let imageWIPSize = new Vector2();
imageWorkInProgress.onload = () => {
    imageWIPSize.setxy(imageWorkInProgress.naturalWidth, imageWorkInProgress.naturalHeight)
};
//
function invokeNewImage(src) {
    var image = new Image(); image.src = src;
    allInvokedImages.push(image);
    return image
};
//
class imageFitFrame {
    constructor(image = new Image()) {
        this.image = image;
        //
        this.active = true;
        this.align = new Vector2(0.5);
        this.fitsize = null;
        this.offset = new Vector2();
        this.bgColor = new Color(0,0,0,1);
        this.winner = false;
        this.ratio = 1;
        this.alpha = 1;
        this.zoom = 1
    }
    newImage(source) {
        this.image = new Image();
        this.image.src = String(source);
        this.fitsize = null
    }
    copy() {
        var iff = new imageFitFrame(this.image);
        iff.fitsize = new Vector2().setv(this.fitsize);
        iff.fit();
        iff.ratio = Number(String(this.ratio));
        iff.offset.setv(this.offset)
        return iff
    }
    gety() {return cvssize.y * (this.align.y * this.zoom) - this.image.naturalHeight * (this.align.y * this.zoom)}
    fit() {
        this.alpha = 0;
        this.ratio = this.image.naturalWidth / this.image.naturalHeight;
        if(this.ratio === 1) {
            this.offset = new Vector2();
            this.fitsize = fitFrameSize
        } else {
            if(this.ratio < 1) {
                // book ratio
                this.fitsize = new Vector2(fitFrameSize.x * this.ratio, fitFrameSize.y);
                this.offset = new Vector2((fitFrameSize.x - this.fitsize.x)/2, 0)
            } else {
                // album ratio
                this.fitsize = new Vector2(fitFrameSize.x, fitFrameSize.y / this.ratio);
                this.offset = new Vector2(0, (fitFrameSize.y - this.fitsize.y)/2)
            }
        }
    }
    draw() {
        // set fitsize (change only)
        if(this.image.complete) {
            if(this.image.naturalHeight <= 0) {this.image.src = imageNotFound.src};
            if(this.fitsize === null) {this.fit()};
            // draw frame
            var border = fitImageBorder * _scaleDynamic;
            ctx.globalAlpha = this.alpha;
            var glal = normalAlign(this.align, this.fitsize.sumxy(border).multxy(this.zoom));
            this.winner ? visual.lightRing(glal.sumv(this.fitsize.multxy(this.zoom/2)), visual.lightDiam.get()*this.zoom) : false;
            fillRect(this.fitsize.multxy(this.zoom).sumxy(border*2), glal.minxy(border), this.bgColor.alpha(pref.bgalpha).getColor());
            drawImageSized(this.image, glal, this.fitsize.multxy(this.zoom));
        }
    }
};
//
// @EAG SITES LIST DATA & BAR
//
let siteNames = { 
    'shikimori.one': 'Shikimori',
    'myanimelist.net': 'My Anime List',
    'anidb.net': 'AniDB',
    'anilist.co': 'AniList',
    'anime-planet.com': 'Anime-Planet',
    'anisearch.com': 'aniSearch',
    'kitsu.io': 'KITSU',
    'notify.moe': 'NOTIFY.MOE',
    'livechart.me': 'LiveChart.me',
};
let siteSequence = [
    'shikimori.one',
    'myanimelist.net',
    'anidb.net',
    'anilist.co',
    'anime-planet.com',
    'anisearch.com',
    'kitsu.io',
    'notify.moe',
    'livechart.me',
];
//
let _slpp = 'images/';
let siteLogos = [
    invokeNewImage(_slpp+'shikimori.png'),
    //
    invokeNewImage(_slpp+'myanimelist.png'),
    invokeNewImage(_slpp+'anidb.png'),
    invokeNewImage(_slpp+'anilist.png'),
    invokeNewImage(_slpp+'anime-planet.png'),
    invokeNewImage(_slpp+'anisearch.png'),
    invokeNewImage(_slpp+'kitsu.png'),
    invokeNewImage(_slpp+'notify-moe.png'),
    invokeNewImage(_slpp+'livechart.png'),
];
//
let siteButtonColormap = `rgba(0,0,0,0)#rgba(0,255,127,0.2)#rgba(0,255,127,1)#rgba(255,63,63,0.2)`;
let siteimageSpacing = new Vector2(0);
let siteButtonSize = 32;
let siteButtonTime = 0.3;
//
function sitesButtonShape(pos, size) {
    var shape = new Path2D();
    shape.roundRect(pos.x, pos.y, size.x, size.y, 4 * _scaleFixed);
    return shape
};
// постоянные кнопки
let sitesSearchShikimori = new ImageButtonShaped(
    sitesButtonShape, siteLogos[0], siteimageSpacing,
    colorMapMatrix(siteButtonColormap)
);
sitesSearchShikimori.onclick = () => {
    playSound(sound['player']);
    window.open(`https://shikimori.me/animes?search=${roulette.centerAnime['title']}`)
};
//
let sites = {
    pos: new Vector2(),
    complete: false,
    sources: {},
    len: 0,
    //
    updDelta: 1,
    updRequest: true,
    //
    buttons: {
        'shikimori.one':    sitesSearchShikimori,
        'myanimelist.net':  new ImageButtonShaped(sitesButtonShape, siteLogos[1], siteimageSpacing, colorMapMatrix(siteButtonColormap)),
        'anidb.net':        new ImageButtonShaped(sitesButtonShape, siteLogos[2], siteimageSpacing, colorMapMatrix(siteButtonColormap)),
        'anilist.co':       new ImageButtonShaped(sitesButtonShape, siteLogos[3], siteimageSpacing, colorMapMatrix(siteButtonColormap)),
        'anime-planet.com': new ImageButtonShaped(sitesButtonShape, siteLogos[4], siteimageSpacing, colorMapMatrix(siteButtonColormap)),
        'anisearch.com':    new ImageButtonShaped(sitesButtonShape, siteLogos[5], siteimageSpacing, colorMapMatrix(siteButtonColormap)),
        'kitsu.io':         new ImageButtonShaped(sitesButtonShape, siteLogos[6], siteimageSpacing, colorMapMatrix(siteButtonColormap)),
        'notify.moe':       new ImageButtonShaped(sitesButtonShape, siteLogos[7], siteimageSpacing, colorMapMatrix(siteButtonColormap)),
        'livechart.me':     new ImageButtonShaped(sitesButtonShape, siteLogos[8], siteimageSpacing, colorMapMatrix(siteButtonColormap)),
    },
    actives: [],
    //
    poses: {
        'shikimori.one':    new Vector2(-4.5 * siteButtonSize + siteButtonSize * 0, 0),
        'myanimelist.net':  new Vector2(-4.5 * siteButtonSize + siteButtonSize * 7, 0),
        'anidb.net':        new Vector2(-4.5 * siteButtonSize + siteButtonSize * 1, 0),
        'anilist.co':       new Vector2(-4.5 * siteButtonSize + siteButtonSize * 2, 0),
        'anime-planet.com': new Vector2(-4.5 * siteButtonSize + siteButtonSize * 3, 0),
        'anisearch.com':    new Vector2(-4.5 * siteButtonSize + siteButtonSize * 4, 0),
        'kitsu.io':         new Vector2(-4.5 * siteButtonSize + siteButtonSize * 5, 0),
        'notify.moe':       new Vector2(-4.5 * siteButtonSize + siteButtonSize * 8, 0),
        'livechart.me':     new Vector2(-4.5 * siteButtonSize + siteButtonSize * 6, 0),
    },
    //
    updateSources: () => {
        // ожидание
        sites.updDelta = Number(siteButtonTime);
        sites.updRequest = true
    },
    update: () => {
        // подсчёт доступных ссылок
        sites.sources = getSiteSources(roulette.centerAnime['sources']);
        // вырубаем все
        for(var b in sites.buttons) {
            sites.buttons[b].state = 'unaval'
        };
        // врубаем доступные
        sites.actives = {};
        sites.buttons['shikimori.one'].state = 'idle';
        sites.buttons['shikimori.one'].oldstate = 'idle';
        sites.actives['shikimori.one'] = sites.buttons['shikimori.one'];
        //
        var len = 1;
        for(var b in sites.sources) {
            len++;
            sites.buttons[b].state = 'idle';
            sites.buttons[b].oldstate = 'idle';
            sites.actives[b] = sites.buttons[b]
        };
        // cсылки и размер
        siteUpdateURLs(sites.sources);
        sites.resizeButtons();
        // возвращаем в центр недоступные
        for(var b in sites.buttons) {
            if(sites.buttons[b].state == 'unaval') {
                sites.buttons[b].alpha.set(0);
                // sites.buttons[b].pos.setv(sites.pos.sumxy(siteButtonSize/2, 0), siteButtonTime, easeInOutSine)
            }
        };
        var xanchor = siteButtonSize * _scaleDynamic * (len/2);
        sites.len = len; len = 0;
        for(var b in siteSequence) {
            if(sites.actives[siteSequence[b]] === undefined) {continue};
            sites.actives[siteSequence[b]].alpha.move(1, siteButtonTime);
            sites.poses[siteSequence[b]].applyMod();
            sites.poses[siteSequence[b]].movexy(-xanchor + siteButtonSize * _scaleDynamic * len, 0, siteButtonTime, easeInOutSine);
            len++
        }
    },
    //
    resizeButtons: () => {
        var xanchor = siteButtonSize * _scaleDynamic * (sites.len/2);
        var len = 0;
        for(var b in sites.actives) {
            sites.poses[b].movexy(-xanchor + siteButtonSize * _scaleDynamic * len, 0, 0.25, easeOutCirc);
            sites.actives[b].sizedZoom(new Vector2(siteButtonSize * _scaleDynamic));
            len++
        }
    },
    //
    draw: (pos) => {
        // позиционирование
        sites.pos.setv(pos);
        // рисуем онли доступные кнопки
        for(var b in sites.actives) {
            sites.poses[b].update();
            sites.actives[b].pos = sites.pos.sumv(sites.poses[b].get());
            sites.actives[b].draw()
        };
        // таймер обновления
        sites.updDelta > 0 ? sites.updDelta -= deltaTime/1000 : sites.updDelta = 0;
        // обновляем ссылки
        if(sites.updRequest && sites.updDelta <= 0) {
            sites.updRequest = false;
            sites.update()
        }
    },
};
// удаление высоты у кнопок, функция при наведении
for(var b in sites.buttons) {
    sites.buttons[b].height = 0;
};
sites.buttons['shikimori.one'].onhover      = () => {hoverHint.invoke(siteNames['shikimori.one'])};
sites.buttons['anidb.net'].onhover          = () => {hoverHint.invoke(siteNames['anidb.net'])};
sites.buttons['anilist.co'].onhover         = () => {hoverHint.invoke(siteNames['anilist.co'])};
sites.buttons['anime-planet.com'].onhover   = () => {hoverHint.invoke(siteNames['anime-planet.com'])};
sites.buttons['anisearch.com'].onhover      = () => {hoverHint.invoke(siteNames['anisearch.com'])};
sites.buttons['kitsu.io'].onhover           = () => {hoverHint.invoke(siteNames['kitsu.io'])};
sites.buttons['livechart.me'].onhover       = () => {hoverHint.invoke(siteNames['livechart.me'])};
sites.buttons['myanimelist.net'].onhover    = () => {hoverHint.invoke(siteNames['myanimelist.net'])};
sites.buttons['notify.moe'].onhover         = () => {hoverHint.invoke(siteNames['notify.moe'])};
//
function getSiteSources(siteArray) {
    var sources = {};
    for(var s in siteArray) {
        for(var n in siteNames) {
            if(siteArray[s].includes(n)) {sources[n] = siteArray[s]}
        }
    };
    return sources
};
//
function siteUpdateURLs(sources) {
    if(sources['myanimelist.net']   !== undefined) {sites.buttons['myanimelist.net'].onclick    = () => {playSound(sound['player']); window.open(sources['myanimelist.net'])}};
    if(sources['anidb.net']         !== undefined) {sites.buttons['anidb.net'].onclick          = () => {playSound(sound['player']); window.open(sources['anidb.net'])}};
    if(sources['anilist.co']        !== undefined) {sites.buttons['anilist.co'].onclick         = () => {playSound(sound['player']); window.open(sources['anilist.co'])}};
    if(sources['anime-planet.com']  !== undefined) {sites.buttons['anime-planet.com'].onclick   = () => {playSound(sound['player']); window.open(sources['anime-planet.com'])}};
    if(sources['anisearch.com']     !== undefined) {sites.buttons['anisearch.com'].onclick      = () => {playSound(sound['player']); window.open(sources['anisearch.com'])}};
    if(sources['kitsu.io']          !== undefined) {sites.buttons['kitsu.io'].onclick           = () => {playSound(sound['player']); window.open(sources['kitsu.io'])}};
    if(sources['notify.moe']        !== undefined) {sites.buttons['notify.moe'].onclick         = () => {playSound(sound['player']); window.open(sources['notify.moe'])}};
    if(sources['livechart.me']      !== undefined) {sites.buttons['livechart.me'].onclick       = () => {playSound(sound['player']); window.open(sources['livechart.me'])}};
};
//
// @EAG TITLE INFO OBJECT
//
let tinfBoxSize = 250;
let tinfBoxZoom = 1.2;
let tinfBoxZoom2 = 0.8;
let tinfSpacing = 5;
let tinfTime = 0.3;
let tinfHeaderSize = 24;
let tinfFontSize = 16;
// 
let seasonsDataMap = {
    WINTER:     [`rgba(0,196,255,1)`,   `seasonWinter`],
    SPRING:     [`rgba(0,255,72,1)`,    `seasonSpring`],
    SUMMER:     [`rgba(234,255,0,1)`,   `seasonSummer`],
    FALL:       [`rgba(232,70,0,1)`,    `seasonFall`],
    UNDEFINED:  [`rgba(186,0,133,1)`,   `seasonUndefined`],
};
function tinfEpisodesColor(x) {
    return x <= 1
    ? x < 0.5 ? `rgba(${255*x*2},255,63,1)` : `rgba(255,${255-255*(x-0.5)*2},63,1`
    : `rgba(255, 63, ${Math.norma(x-1)*255}, 1)`
};
let typesDataMap = {
    SPECIAL:    `typeSpecial`,
    ONA:        `typeONA`,
    OVA:        `typeOVA`,
    TV:         `typeTV`,
    MOVIE:      `typeMovie`,
    UNKNOWN:    `typeUnknown`,
    FINISHED:   `statusFinished`,
    ONGOING:    `statusOngoing`,
    UPCOMING:   `statusUpcoming`,
};
//
let filterChangesText = lsLoadString('filterChangesText', 0);
function rbChangesText(count) {
    filterChangesText = count;
    lsSaveValue('filterChangesText', count)
};
function filterChangesString() {
    return Number(tInfo.meta.changes) == 0
    ? txt('infoNoChanges')
    : txt('infoChangesCount') + tInfo.meta.changes;
};
//
let _tinfoMetaDefault = {
    usePreset: true, object: presetbase['Дефолтный'], changes: 0
};
//
let tInfo = {
    //
    spacing: tinfSpacing * _scaleDynamic,
    box: tinfBoxSize * _scaleDynamic,
    zoom: new Vector1(tinfBoxZoom),
    alpha: new Vector1(0),
    hidereq: false,
    hided: true,
    //
    anchor: new Vector2(0.05, 0.95),
    pos: new Vector2(),
    height: (tinfBoxSize * _scaleDynamic - (tinfSpacing * _scaleDynamic * 9)) / 8,
    width: tinfBoxSize * _scaleDynamic - (tinfSpacing * _scaleDynamic * 2),
    //
    title: null,
    rating: null,
    updater: tinfTime,
    meta: lsLoadObject('tinfoMeta', _tinfoMetaDefault),
    //
    episodes: new Vector1(0),
    episodest: '',
    year: new Vector1(0),
    yeart: '',
    status: '',
    season: '',
    type: '',
    score: new Vector1(0),
    scoredby: new Vector1(0),
    //
    updateTitle: (title) => {
        tInfo.updater = tinfTime;
        tInfo.title = title;
        tInfo.episodes.move(title['episodes'], tinfTime, easeInOutCubic);
        tInfo.year.move(title['animeSeason']['year'], tinfTime, easeInOutCubic);
        tInfo.season = txt([seasonsDataMap[title['animeSeason']['season']][1]]);
        tInfo.type = txt([typesDataMap[title['type']]]);
        tInfo.status = txt([typesDataMap[title['status']]]);
        // scores
        tInfo.rating = malAnimeID(title['sources']);
        if(tInfo.rating !== null) {
            if(adb_ratings[tInfo.rating] !== undefined) {
                tInfo.score = adb_ratings[tInfo.rating].score !== 'None'
                ? adb_ratings[tInfo.rating].score : '???';
                tInfo.scoredby = adb_ratings[tInfo.rating].scoredby !== 'None'
                ? adb_ratings[tInfo.rating].scoredby : '???';
            } else {
                tInfo.score = tInfo.scoredby = '???'
            }
        }
    },
    //
    posit: (x) => {return (new Vector2(tInfo.spacing, tInfo.spacing * (x+2) + tInfo.height * x)).sumv(tInfo.pos.get())},
    draw: () => {
        // update
        if(tInfo.updater >= -0.1) {
             tInfo.episodes.update();
             tInfo.episodest = txt('infoEps') + String(Math.round(tInfo.episodes.get()));
             //
             tInfo.year.update();
             if(tInfo.title['animeSeason']['year'] < 1900 || typeof tInfo.title['animeSeason']['year'] !== 'number') {
                tInfo.yeart = txt('infoYear404')} else {
                tInfo.yeart = Math.round(tInfo.year.get())};
            //
            tInfo.updater -= deltaTime / 1000
        };
        // hide animation
        if((roulette.isempty || tInfo.hidereq) && !tInfo.hided) {
            tInfo.hided = true;
            tInfo.zoom.set(1);
            tInfo.zoom.move(tinfBoxZoom2, srv.hideTime, easeInCirc);
            tInfo.alpha.move(0, srv.hideTime, easeOutCirc)
        };
        if(!tInfo.hidereq && !roulette.isempty && tInfo.hided) {
            tInfo.hided = false;
            tInfo.zoom.set(tinfBoxZoom);
            tInfo.zoom.move(1, srv.hideTime, easeOutCirc);
            tInfo.alpha.move(1, srv.hideTime, easeOutCirc)
        };
        tInfo.zoom.update();
        tInfo.alpha.update();
        // позиция, бг
        ctx.globalAlpha = tInfo.alpha.get();
        tInfo.spacing = tinfSpacing * _scaleDynamic;
        tInfo.box = tinfBoxSize * tInfo.zoom.get() * _scaleDynamic;
        tInfo.pos = normalAlign(tInfo.anchor, new Vector2(tInfo.box));
        fillRectRounded(new Vector2(tInfo.box), tInfo.pos, `rgba(0,0,0,${pref.bgalpha})`, 10*_scaleDynamic);
        // размеры элементов
        tInfo.height = (tInfo.box - tInfo.spacing * 9) / 8,
        tInfo.width = tInfo.box - tInfo.spacing * 2,
        // заголовок
        ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
        scaleFont(tinfHeaderSize, 'Segoe UI', 'bold');
        fillTextFast(tInfo.pos.sumxy(tInfo.box/2, -tInfo.spacing*2)  , txt('infoHead'));
        // серии
        scaleFont(tinfFontSize, 'Segoe UI', 'bold');
        fillTextFast(tInfo.posit(0).sumxy(tInfo.width/2, tInfo.height*0.6), tInfo.episodest)
        fillRectRounded(
            new Vector2(tInfo.width, tInfo.height*0.2),
            tInfo.posit(0).sumxy(0, tInfo.height*0.85),
            `#0008`, tInfo.spacing);
        fillRectRounded(
            new Vector2(tInfo.width * Math.norma(tInfo.episodes.get() / filterDefault.episodeMax), tInfo.height*0.2),
            tInfo.posit(0).sumxy(0, tInfo.height*0.85),
            tinfEpisodesColor(tInfo.episodes.get() / filterDefault.episodeMax), tInfo.spacing);
        // сезон, год, тип, статус
        ctx.fillStyle = '#fff';
        fillTextFast(tInfo.posit(1).sumxy(tInfo.width*0.25, tInfo.height*0.7), tInfo.season);
        fillTextFast(tInfo.posit(2).sumxy(tInfo.width*0.25, tInfo.height*0.7), tInfo.type);
        fillTextFast(tInfo.posit(1).sumxy(tInfo.width*0.75, tInfo.height*0.7), tInfo.yeart);
        fillTextFast(tInfo.posit(2).sumxy(tInfo.width*0.75, tInfo.height*0.7), tInfo.status);
        // пресет
        scaleFont(tinfFontSize, 'Segoe UI', 'bold');
        if(tInfo.meta.usePreset) {
            fillTextFast(tInfo.posit(3).sumxy(tInfo.width/2, tInfo.height*0.7), textStringLimit(tInfo.meta.object.name, tInfo.width));
            scaleFont(tinfFontSize, 'Segoe UI');
            fillTextFast(tInfo.posit(4).sumxy(tInfo.width/2, tInfo.height*0.5), filterChangesString());
        } else {
            fillTextFast(tInfo.posit(3).sumxy(tInfo.width/2, tInfo.height*0.7), textStringLimit(tInfo.meta.object.name, tInfo.width));
            scaleFont(tinfFontSize, 'Segoe UI');
            fillTextFast(tInfo.posit(4).sumxy(tInfo.width/2, tInfo.height*0.5), tInfo.meta.object.timestamp.created);
        }
        // MAL оценки
        scaleFont(tinfFontSize, 'Segoe UI', 'bold');
        fillTextFast(tInfo.posit(5).sumxy(tInfo.width*0.5, tInfo.height*0.7), txt('malHead'));
        if(tInfo.rating  === null) {
            fillTextFast(tInfo.posit(6).sumxy(tInfo.width*0.5, tInfo.height*0.7), txt('mal404'))
        } else {
            scaleFont(tinfFontSize, 'Segoe UI');
            fillTextFast(tInfo.posit(6).sumxy(tInfo.width*0.5, tInfo.height*0.5), txt('malScore') +  tInfo.score);
            fillTextFast(tInfo.posit(7).sumxy(tInfo.width*0.5, tInfo.height*0.3), txt('malScoredBy') + tInfo.scoredby)
        };
        ctx.globalAlpha = 1
    },
};
//
// @EAG DESCRIPTION OBJECT
//
let descrFontFamily = 'Segoe UI';
let descrFontSize = 13;
let descrFontSpacing = 0.2;
let descrWaiting = 0.5;
//
let descrTransFunctions = {
    'get-ru': () => {
        tDesc.scroll.set(0);
        if(!tDesc.terror) {
            playSound(sound['player']);
            translator.ru(tDesc.data.synopsis);
            tDesc.translate = false;
            tDesc.original = false;
            tDesc.tstate = 'work';
            decsrTranslate.onclick = () => {};
            decsrTranslate.text = '...';
            decsrTranslate.state = 'unaval'
        }
    },
    'orig': () => {
        tDesc.scroll.set(0);
        if(!tDesc.terror) {
            tDesc.original = true;
            decsrTranslate.onclick = descrTransFunctions['trans'];
            decsrTranslate.text = txt('wordTranslate');
            tDesc.alpha.set(0);
            tDesc.alpha.move(1, 0.25)
        }
    },
    'trans': () => {
        tDesc.scroll.set(0);
        if(!tDesc.terror) {
            tDesc.original = false;
            decsrTranslate.onclick = descrTransFunctions['orig'];
            decsrTranslate.text = txt('wordOriginal');
            tDesc.alpha.set(0);
            tDesc.alpha.move(1, 0.25)
        }
    }
};
//
let decsrTranslate = new TextButtonShaped(shapeRectRounded, txt('descTranslate'), 
    new Vector2(tinfBoxSize/3, descrFontSize),
    colorMapMatrix(`rgba(255,255,255,1)#rgba(255,63,255,1)#rgba(255,63,255,1)#rgba(255,63,63,0.8)`),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(0,0,0,0)#rgba(0,0,0,0)#rgba(0,0,0,0))`));
decsrTranslate.onclick = descrTransFunctions['get-ru'];
decsrTranslate.height = 0; decsrTranslate.waitanim = false;
//
let descrWatchTrailer = new TextButtonShaped(shapeRectRounded, txt('descTrailer'),
    new Vector2(tinfBoxSize/3, descrFontSize),
    colorMapMatrix(`rgba(255,255,255,1)#rgba(63,255,255,1)#rgba(63,255,255,1)#rgba(200,63,63,0.9)`),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(0,0,0,0)#rgba(0,0,0,0)#rgba(0,0,0,0))`));
descrWatchTrailer.onclick = () => {
    if(!musicNormal.paused) {onhideMusicPaused = true; musicNormalPause(2)};
    window.open(tDesc.data.trailer.url);
};
descrWatchTrailer.height = 0; descrWatchTrailer.state = `unaval`;
//
let tDesc = {
    anchor: new Vector2(0.95),
    pos: new Vector2(),
    size: tinfBoxSize * _scaleDynamic,
    spacing: 0,
    fsize: 0,
    //
    data: {},
    malid: null,
    desc: [txt('descNone')],
    height: new Vector2(0,14*_scaleDynamic),
    //
    full: 0,
    scroll: new Vector1(),
    clip: new Vector2(),
    indicate: [false, false],
    //
    original: true,
    showing: [],
    alpha: new Vector1(1),
    //
    request: true,
    apply: true,
    waiting: 0.5,
    //
    translate: false,
    tstate: 'idle',
    terror: false,
    tdesc: [],
    //
    newDesc: () => {
        descrWatchTrailer.state = `unaval`;
        decsrTranslate.state = 'unaval';
        tDesc.malid = malAnimeID(roulette.centerAnime.sources);
        tDesc.scroll.set(0);
        tDesc.apply = true;
        if(tDesc.malid == null) {
            tDesc.desc = [txt('descNone')];
            tDesc.request = false;
            return
        } else {
            tDesc.waiting = Number(descrWaiting);
            tDesc.desc = [txt('descWait')];
            tDesc.request = true
        }
    },
    //
    resize: () => {
        descrWatchTrailer.size = new Vector2(tinfBoxSize/3, descrFontSize).multxy(_scaleDynamic);
        scaleFont(descrFontSize, 'Segoe UI');
        if (tDesc.apply) {
            var height;
            if(jikan._response !== null) {
                [tDesc.desc, tDesc.height] = textWidthFit(tDesc.data.synopsis, tDesc.size - (tInfo.spacing*2 + tDesc.fsize));
                [tDesc.tdesc, height] = textWidthFit(translator.single, tDesc.size - (tInfo.spacing*2 + tDesc.fsize));
                tDesc.original ? null : tDesc.height = height
            };
        }
    },
    //
    release: () => {
        decsrTranslate.onclick = descrTransFunctions['get-ru'];
        decsrTranslate.text = txt('descTranslate');
        tDesc.translate = false;
        tDesc.terror = false;
        tDesc.tstate = 'idle';
        tDesc.original = true;
        tDesc.scroll.set(0)
    },
    //
    draw: () => {
        // scale
        tDesc.fsize = descrFontSize * _scaleDynamic;
        tDesc.size = tinfBoxSize * _scaleDynamic;
        // обновления, позиция, задний фон
        tDesc.alpha.update();
        tDesc.scroll.update();
        tDesc.pos = normalAlign(tDesc.anchor, new Vector2(tInfo.box));
        ctx.globalAlpha = tInfo.alpha.get();
        fillRectRounded(new Vector2(tInfo.box), tDesc.pos, `rgba(0,0,0,${pref.bgalpha})`, 10*_scaleDynamic);
        // заголовок
        ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
        scaleFont(tinfHeaderSize, 'Segoe UI', 'bold');
        fillTextFast(tDesc.pos.sumxy(tInfo.box/2, -tInfo.spacing*2)  , txt('descHead'));
        // ожидаем перед отправкой запроса
        if(tDesc.request) {
            if(sesRead('jikan'+tDesc.malid) !== null) {
                tDesc.data = JSON.parse(sesRead('jikan'+tDesc.malid)).data;
                scaleFont(descrFontSize, 'Segoe UI');
                [tDesc.desc, tDesc.height] = textWidthFit(tDesc.data.synopsis, tDesc.size - (tInfo.spacing*2 + tDesc.fsize));
                tDesc.alpha.set(0.5);
                tDesc.alpha.move(1, 0.25, easeInCirc);
                tDesc.scroll.set(0);
                // хаваем ссылку на трейлер
                if(tDesc.data.trailer.url !== null) {
                    descrWatchTrailer.state = `idle`
                };
                decsrTranslate.state = 'idle';
                tDesc.request = false
            }
            else if(roulette.progress.isMoving() || roulette.speed.get() !== 0) {
                tDesc.desc = [txt('descRoll')]
            } else {
                if(tDesc.waiting > 0) {
                    tDesc.desc = [txt('descWait')];
                    tDesc.waiting -= deltaTime/1000
                } else {
                    tDesc.request = false;
                    tDesc.apply = false;
                    tDesc.desc = [txt('descWait')];
                    jikan.full(tDesc.malid)
                }
            }
        };
        // получаем данные
        if(!tDesc.apply && jikan._loaded) {
            tDesc.apply = true;
            decsrTranslate.state = 'idle'
            if(jikan._error) {
                tDesc.desc = [txt('descNone')];
                decsrTranslate.state = 'unaval'
            } else {
                tDesc.data = jikan._response.data;
                scaleFont(descrFontSize, 'Segoe UI');
                [tDesc.desc, tDesc.height] = textWidthFit(tDesc.data.synopsis, tDesc.size - (tInfo.spacing*2 + tDesc.fsize));
                tDesc.alpha.set(0);
                tDesc.alpha.move(1, 0.25);
                tDesc.scroll.set(0);
                // хаваем ссылку на трейлер
                if(tDesc.data.trailer.url !== null) {
                    descrWatchTrailer.state = `idle`
                }
            }
        };
        // режим показа
        tDesc.original
        ? tDesc.showing = tDesc.desc
        : tDesc.showing = tDesc.tdesc;
        // ограничение текста
        tDesc.full = (tDesc.showing.length + 1) * tDesc.height.y;
        tDesc.clip.setxy(tInfo.box - tInfo.spacing*2, tInfo.box * 0.9 - tInfo.spacing*2);
        // индикаторы
        tDesc.indicate = [tDesc.scroll.getFixed() + tDesc.clip.y < tDesc.full, tDesc.scroll.getFixed() > 0];
        // скроллинг
        if(mouse.pos.overAND(tDesc.pos) && mouse.pos.lessAND(tDesc.pos.sumxy(tInfo.box))) {
            // паузим рулетку, ещё раз запрашиваем описание если стоп был
            if(tDesc.desc[0] == txt('descRoll')) {
                tDesc.newDesc();
                tDesc.release()
            };
            roulette.pause(3000);
            if(tDesc.clip >= tDesc.full) {
                tDesc.scroll.set(0)
            } else {
                if(wheelState !== 'idle') {
                    if(wheelState === 'top') {
                        if(tDesc.indicate[1]) {tDesc.scroll.move(tDesc.scroll.getFixed()-tDesc.height.y*2, 0.25, easeOutCirc)}
                    } else {
                        if(tDesc.indicate[0]) {tDesc.scroll.move(tDesc.scroll.getFixed()+tDesc.height.y*2, 0.25, easeOutCirc)}
                    }
                };
                if(tDesc.scroll.getFixed() + tDesc.clip.y > tDesc.full) {tDesc.scroll.move(tDesc.full - tDesc.clip.y, 0.25, easeOutCirc)};
                if(tDesc.scroll.getFixed() < 0) {tDesc.scroll.move(0, 0.25, easeOutCirc)}
            }
        };
        // индикаторы
        var indic = tDesc.indicate[0]
            ? tDesc.indicate[1] 
                ? '\\/ /\\'
                : '\\/   '
            : tDesc.indicate[1]
                ? '   /\\'
                : '     ';
        // трейлер и индикатор
        ctx.textAlign = 'start';
        scaleFont(descrFontSize, 'Consolas');
        fillTextFast(tDesc.pos.sumxy(tInfo.spacing, tInfo.box - tInfo.spacing*2), indic);
        ctx.textAlign = 'center';
        scaleFont(descrFontSize, 'Segoe UI');
        descrWatchTrailer.size.setxy(tInfo.box/3, tDesc.fsize);
        descrWatchTrailer.pos = tDesc.pos.sumxy(tInfo.box).minv(descrWatchTrailer.size).minxy(tInfo.spacing, tInfo.spacing*2);
        descrWatchTrailer.draw();
        // начала и хвосты
        ctx.globalAlpha = ctx.globalAlpha * tDesc.alpha.get();
        var start = Math.floor(tDesc.scroll.get() / tDesc.height.y) - 1;
        var tail = Math.ceil((tDesc.scroll.get() + tDesc.clip.y) / tDesc.height.y) + 1;
        // описание
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'start';
        clipCanvas(tDesc.clip, tDesc.pos.sumxy(tInfo.spacing));
        for(var i = 0; i < tDesc.showing.length; i++) {
            if(i < start) {continue};
            if(i >= tail || tDesc.showing[i] === undefined) {break};
            fillTextFast(tDesc.pos.sumxy(tInfo.spacing).sumxy(0, -tDesc.scroll.get() + tDesc.height.y * (i+1)), tDesc.showing[i]);
        };
        clipRestore();
        if(pref.language !== 'en') {
            ctx.globalAlpha = tInfo.alpha.get();
            // кнопка перевода
            ctx.textAlign = 'center';
            decsrTranslate.size.setxy(tInfo.box/3, tDesc.fsize);
            decsrTranslate.pos = tDesc.pos.sumxy(tInfo.box/2, tInfo.box).minxy(tInfo.spacing+decsrTranslate.size.x/2, tInfo.spacing*2+decsrTranslate.size.y);
            decsrTranslate.draw();
            // перевод текста
            if(!tDesc.original && !tDesc.translate && !tDesc.terror) {
                if(tDesc.tstate === 'work') {
                    tDesc.tdesc = [txt('descWork') + translator.getProgress()];
                    if(translator.state === 'idle') {
                        if(translator.error) {
                            tDesc.original = true;
                            tDesc.terror = true;
                            decsrTranslate.text = txt('wordError');
                            tDesc.tstate = 'error';
                        } else {
                            scaleFont(descrFontSize, 'Segoe UI');
                            [tDesc.tdesc, tDesc.height] = textWidthFit(translator.single, tDesc.size - (tInfo.spacing*2 + tDesc.fsize));
                            tDesc.alpha.set(0);
                            tDesc.alpha.move(1, 0.25);
                            tDesc.scroll.set(0);
                            decsrTranslate.onclick = descrTransFunctions['orig'];
                            decsrTranslate.text = txt('wordOriginal');
                            decsrTranslate.state = 'idle';
                            tDesc.translate = true;
                            tDesc.tstate = 'ok'
                        }
                    }
                }
            }
        };
        ctx.globalAlpha = 1
    }
};
//
// @EAG ROLL BAR OBJECT
//
let rbBodyHeight = 60;
let rbSpacing = 5;
let rbRollWidth = (rbBodyHeight - rbSpacing*2)*2 + rbSpacing;
//
let buttonDoRoll = new TextButtonShaped(shapeRectRounded, txt('rbRoll'), new Vector2(200, 40),
    colorMapMatrix(colorMapForeDefault),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(63,63,255,0.25)#rgba(63,63,255,1)#rgba(0,0,0,0)`));
buttonDoRoll.onclick = () => {
    if(!roulette.hidemap) {
        rollBar.state = 'hide';
        buttonDoRoll.text = txt('rbWait');
        musicLite.hide();
        musicLite.wait = true;
        if(!pref.playClip) {
            musicRoll.oncanplay = () => {
                playSound(sound['roll']);
                roulette.doRoll(pref.rollTime, pref.rollSpeed);
                srv.hideProgress.value = 0;
                srv.hideProgress.move(1, srv.hideTime, easeInQuad);
                srv.state = 'roll_start';
                tInfo.hidereq = true;
                buttonDoRoll.state = 'unaval';
                musicRollVolume.reset();
                musicRollVolume.move(1, 2, easeInOutSine);
                visual.lightDiam.move(0, 0.25, easeInCirc);
                musicLite.wait = false;
                //
                setTimeout(() => {buttonDoRoll.text = txt('rbRoll')}, 2000)
            };
            musicRollStart()
        } else {
            clipmainOnCanPlay = () => {
                videoClipPlay();
                playSound(sound['roll']);
                roulette.doRoll(clipmainTime, pref.rollSpeed, false);
                srv.hideProgress.value = 0;
                srv.hideProgress.move(1, srv.hideTime, easeInQuad);
                srv.state = 'roll_start';
                tInfo.hidereq = true;
                buttonDoRoll.state = 'unaval';
                musicNormalVolume.move(0, 1, easeInOutSine);
                visual.lightDiam.move(0, 0.25, easeInCirc);
                musicLite.wait = false;
                //
                setTimeout(() => {
                    buttonDoRoll.text = txt('rbRoll');
                    musicNormal.pause()
                }, 2000)
            };
            //
            if(_clipSelected !== null && clips[_clipSelected] !== undefined) {
                videoClipSet(clips[_clipSelected]);
                _clipSelected = null
            } else {
                videoClipSet(clips[Math.floor(Math.random()*(clips.length-0.001))])
            }
        }
    }
};
buttonDoRoll.waitanim = false;
buttonDoRoll.onhover = () => {
    if(typeof roulette.catchWinner !== 'boolean' && !roulette.hidemap) {
        hoverHint.invoke(txt('rbWarn'), `#f66`)
    }
};
//
let imageChangeFilter = invokeNewImage('images/filter.png');
let imagePrefMenu = invokeNewImage('images/pref.png');
let buttonChangeFilter = new ImageButtonShaped(shapeRectRounded, imageChangeFilter, new Vector2(5),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(255,63,255,0.25)#rgba(255,63,255,1)#rgba(0,0,0,0)`));
buttonChangeFilter.onclick = () => {saf.scroll.set(0); playSound(sound['player']); requestScreen(screenAnimeFilter)};
let buttonOpenPref = new ImageButtonShaped(shapeRectRounded, imagePrefMenu, new Vector2(5),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(255,255,63,0.25)#rgba(255,255,63,1)#rgba(0,0,0,0)`));
buttonOpenPref.onclick = () => {playSound(sound['player']); spref.scroll.set(0); requestScreen(screenPreferences)};
buttonChangeFilter.waitanim = false;
buttonOpenPref.waitanim = false;
//
let rollBar = {
    anchor: new Vector2(0.5, 1.2),
    normal: new Vector2(0.5, 0.95),
    hide: new Vector2(0.5, 1.2),
    //
    pos: new Vector2(),
    size: new Vector2(cvssize.x * 0.45, rbBodyHeight*_scaleDynamic),
    alpha: new Vector1(0),
    spacing: 0,

    //
    state: 'init',
    time: 1,
    //
    draw: () => {
        // scale
        rollBar.spacing = rbSpacing * _scaleDynamic;
        // update
        rollBar.anchor.update();
        rollBar.alpha.update();
        ctx.globalAlpha = rollBar.alpha.get();
        // размеры и задний фон
        rollBar.size.setxy(cvssize.x * 0.45, rbBodyHeight * _scaleDynamic);
        rollBar.pos = normalAlign(rollBar.anchor.get(), rollBar.size);
        rbRollWidth = (rollBar.size.y - rollBar.spacing*2)*2 + rollBar.spacing;
        // рисуем
        if(rollBar.state !== 'init' && rollBar.state !== 'invis') {
            fillRectRounded(rollBar.size, rollBar.pos, `rgba(0,0,0,${pref.bgalpha})`, 10*_scaleDynamic);
            // крутить
            ctx.textAlign = 'center';
            scaleFont(36, 'Arial', 'bold');
            buttonDoRoll.size.setxy(rbRollWidth, rollBar.size.y-rollBar.spacing*2);
            buttonDoRoll.pos.setv(rollBar.pos.sumxy(rollBar.spacing));
            buttonDoRoll.draw()
            // карта
            scaleFont(16, 'Segoe UI', 'bold');
            drawMapRoulette(rollBar.size.x - (rbRollWidth*2 + rollBar.spacing*4), rollBar.pos.sumxy(rbRollWidth + rollBar.spacing*2, rollBar.size.y*0.75 - rmpBarHeight/2));
            // фильтр, настройки
            scaleFont(36, 'Arial', 'bold');
            buttonChangeFilter.sizedZoom(new Vector2(buttonDoRoll.size.y));
            buttonOpenPref.sizedZoom(new Vector2(buttonDoRoll.size.y));
            buttonChangeFilter.pos.setv(rollBar.pos.sumxy(rollBar.size.x, 0).minxy(rbRollWidth + rollBar.spacing, -rollBar.spacing));
            buttonOpenPref.pos.setv(rollBar.pos.sumxy(rollBar.size.x, 0).minxy(buttonDoRoll.size.y + rollBar.spacing, -rollBar.spacing));
            buttonChangeFilter.draw();
            buttonOpenPref.draw();
            // полоска с ссылками
            sites.draw(rollBar.pos.sumxy(rollBar.size.x/2, rollBar.spacing))
        };
        //
        ctx.globalAlpha = 1;
        // state model
        if(rollBar.state === 'init') {
            // unaval all
            buttonDoRoll.state = 'unaval';
            buttonChangeFilter.state = 'unaval';
            buttonOpenPref.state = 'unaval';
            //
            rollBar.state = 'complete'
        //
        } else if(rollBar.state === 'show') {
            rollBar.anchor.movev(rollBar.normal, rollBar.time, easeInOutCubic);
            rollBar.alpha.move(1, rollBar.time, easeInOutCubic);
            setTimeout(() => {
                // aval all
                buttonDoRoll.state = 'idle';
                buttonChangeFilter.state = 'idle';
                buttonOpenPref.state = 'idle';
            }, rollBar.time * 1000);
            //
            rollBar.state = 'none'
        //
        } else if(rollBar.state === 'hide') {
            // unaval all
            buttonDoRoll.state = 'unaval';
            buttonChangeFilter.state = 'unaval';
            buttonOpenPref.state = 'unaval';
            //
            rollBar.anchor.movev(rollBar.hide, rollBar.time, easeInOutCubic);
            rollBar.alpha.move(0, rollBar.time, easeInOutCubic);
            //
            rollBar.state = 'none';
            setTimeout(() => {
                rollBar.state = 'invis'
            }, rollBar.time * 1000);
        }
    }
};
//
// @EAG MUSIC LITE CONTROLS
//
let mlcSpacing = 5;
let mlcBarSpacing = 2;
let mlcBarSize = new Vector2(360, 10);
let mlcButtonSize = 40;
//
let mlcPlayImage = invokeNewImage('images/play.png');
let mlcPauseImage = invokeNewImage('images/pause.png');
let mlcNextTrackImage = invokeNewImage('images/random.png');
//
let buttonPauseTrack = new ImageButtonShaped(shapeRectRounded, mlcPauseImage, new Vector2(5),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(127,255,127,0.2)#rgba(127,255,127,0.5)#rgba(255,127,127,0.2)`));
buttonPauseTrack.onclick = () => {musicNormalPause(); playSound(sound['player'])};
let buttonNextTrack = new ImageButtonShaped(shapeRectRounded, mlcNextTrackImage, new Vector2(5),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(127,255,127,0.2)#rgba(127,255,127,0.5)#rgba(255,127,127,0.2)`));
buttonNextTrack.onclick = () => {musicNormalNew(); playSound(sound['player'])};
buttonPauseTrack.waitanim = false; buttonNextTrack.waitanim = false;
//
let mlcMusicBar = new ShapedSelectBar(mlcBarSize, colorMatrix(`rgba(255,255,255,0.8)`), colorMatrix(`rgba(0,0,0,0.5)`));
mlcMusicBar.onset = (value) => {if(musicNormalComplete && pref.bgmusic > 0) {
    if(musicNormal.paused) {
        musicNormal.currentTime = value - 0.2;
        setTimeout(() => {musicNormal.pause()}, 200); 
    } else {
        musicNormal.currentTime = value
    }
}};
mlcMusicBar.onhover = (value) => {
    ctx.fillStyle = '#fff'; ctx.textAlign = 'end'; scaleFont(12, 'Consolas');
    ctx.fillText(timeStringify(musicNormalComplete ? value : 0), mouse.pos.x-(2*_scaleDynamic), mlcMusicBar.pos.y+mlcBarSize.y+(14*_scaleDynamic))
};
mlcMusicBar.permanent = false;
//
let musicLite = {
    anchor: new Vector2(0.5, 0),
    pos: new Vector2(),
    size: new Vector2(mlcButtonSize*2 + mlcSpacing*2 + mlcBarSize.x, mlcButtonSize),
    //
    dur: 0,
    load: 0, loada: 0,
    name: '', old: '',
    fullname: '',
    //
    active: false,
    offset: new Vector1(),
    //
    wait: false,
    walpha: new Vector1(0),
    //
    hide: () => {
        const time = 0.3;
        musicLite.offset.set(0);
        musicLite.offset.move(musicLite.size.y*-2, time, easeInQuad);
        setTimeout(() => {
            musicLite.active = false
        }, time*1100);
    },
    show: () => {
        musicLite.active = true;
        musicLite.offset.set(musicLite.size.y*-2);
        musicLite.offset.move(0, 0.3, easeOutCirc)
    },
    //
    draw: () => {
        // отрисовка плеера
        if(pref.playerShow && musicLite.active) {musicLite.drawfunc()};
        // отрисовка ожидания
        musicLite.walpha.update();
        if(musicLite.wait && musicLite.walpha.getFixed() == 0) {musicLite.walpha.move(1,1,easeInCirc)};
        if(!musicLite.wait && musicLite.walpha.getFixed() == 1) {musicLite.walpha.move(0,0.5,easeOutCirc)};
        //
        if(musicLite.walpha.get() > 0) {
            var wtext = pref.playClip
            ? txt('hintAwaitingClip')
            : txt('hintAwaitingMusic');
            ctx.globalAlpha = musicLite.walpha.get();
            //
            var wsize = new Vector2(400, 24).multxy(_scaleDynamic);
            fillRectRounded(wsize, normalAlign(new Vector2(0.5,0.95), wsize), `#000a`, 8*_scaleDynamic);
            scaleFont(16, 'Segoe UI');
            ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
            fillTextFast(normalAlign(new Vector2(0.5,0.95), wsize).sumxy(wsize.x/2, wsize.y*0.8),
            `${wtext} (${floatNumber(clipTimeout-clipWaiting, 1)} sec.)`);
            //
            ctx.globalAlpha = 1
        }
    },
    drawfunc: () => {
        // scale
        musicLite.offset.update();
        var spacing = mlcSpacing * _scaleDynamic;
        var barsize =  mlcBarSize.multxy(_scaleDynamic);
        var buttonsize = mlcButtonSize * _scaleDynamic;
        // position
        musicLite.size = new Vector2(buttonsize*2 + spacing*2 + barsize.x, buttonsize);
        musicLite.pos = normalAlign(musicLite.anchor, musicLite.size).sumxy(0, spacing + musicLite.offset.get());
        // bar
        mlcMusicBar.pos = musicLite.pos.sumxy(buttonsize + spacing, buttonsize - (barsize.y + spacing));
        mlcMusicBar.size = barsize;
        mlcMusicBar.update(musicNormal.currentTime, musicNormal.duration);
        mlcMusicBar.draw();
        // buttons
        buttonPauseTrack.pos = musicLite.pos;
        buttonNextTrack.pos = musicLite.pos.sumxy(buttonsize + spacing*2 + barsize.x, 0);
        buttonPauseTrack.sizedZoom(new Vector2(buttonsize));
        buttonNextTrack.sizedZoom(new Vector2(buttonsize));
        buttonPauseTrack.draw();
        buttonNextTrack.draw();
        // text
        scaleFont(16, 'Segoe UI');
        if(musicLite.name !== musicLite.old) {
            musicLite.fullname = String(musicLite.name);
            var len = ctx.measureText(musicLite.name).width;
            if(len > barsize.x*0.75) {
                len = Math.floor(musicLite.name.length * ((barsize.x*0.75) / len)) - 3
                musicLite.name = musicLite.name.substring(0, len) + '...'
            };
            //
            musicLite.state = 'text';
            musicLite.dtime = 0;
            musicLite.old = musicLite.name
        };
        // draw text
        ctx.fillStyle = '#fffb'; ctx.textAlign = 'start';
        var trackname = pref.bgmusic > 0 ? musicLite.name : txt('rbMusicOff');
        ctx.fillText(trackname, musicLite.pos.x + buttonsize + spacing*2, musicLite.pos.y + 20 * _scaleDynamic);
        if(mouse.pos.overAND(musicLite.pos.sumxy(buttonsize + spacing, spacing)) && pref.bgmusic > 0 &&
        mouse.pos.lessAND(musicLite.pos.sumv(musicLite.size).minxy(buttonsize + spacing, buttonsize/2))) {
            hoverHint.invoke(txt('hintTrackName') + musicLite.fullname)};
        //
        ctx.textAlign = 'end';
        musicLite.dur = musicNormalComplete && musicNormal.duration !== NaN ? musicNormal.duration : 0;
        ctx.fillText(`${timeStringify(musicNormal.currentTime)} - ${timeStringify(musicLite.dur)}`,
        musicLite.pos.x + buttonsize + barsize.x, musicLite.pos.y + 20 * _scaleDynamic);
        // load anim
        if(!musicNormalComplete) {
            musicLite.loada += musicLite.loada < 1 ? deltaTime/1000 : null;
            musicLite.load >= 1 ? musicLite.load = 0 : musicLite.load += deltaTime/1000; 
            ctx.lineWidth = 6; ctx.strokeStyle = `rgba(255,255,255,${Math.norma(musicLite.loada-0.25)})`;
            rotatingArc(musicLite.load, 18 * _scaleDynamic, musicLite.pos.sumxy(buttonsize + spacing + barsize.x/2, buttonsize/2))
        } else {
            musicLite.loada = 0
        }
    },
};
//
// @EAG ROULETTE OBJECT
//
let roulette = {
    anime: [],
    pics: [],
    sorted: [],
    centerAnime: {},
    oldCenter: undefined,
    //
    addAlign: new Vector2(0),
    zoomMult: 1,
    alphaMult: 1,
    //
    volume: 0.1,
    picsCount: 0,
    complete: false,
    initsound: true,
    //
    dragged: 100,
    idleSpeed: 1,
    winnerPos: -1,
    hidemap: false,
    isempty: false,
    //
    mapper: rouletteItemsMapper,
    winnerStyle: new Color(63, 255, 63, 1),
    nameboxcolor: new Color(255, 255, 255, 1),
    nameboxdef: new Color(255, 255, 255, 1),
    //
    progress: new Vector1(0),
    picsGet: (array) => {
        roulette.anime = array;
        lsSaveObject('roulette.anime', optimizeAnimeArray(roulette.anime));
        roulette.pics = [];
        //
        for(var i=0; i<roulette.picsCount; i++) {
            roulette.pics[i] = new Image();
            roulette.pics[i].onerror = () => {roulette.pics[i].src = 'images/notfound.png'};
            if(array[i]['picture'] !== undefined) {
                roulette.pics[i].src = array[i]['picture']
            } else {
                roulette.pics[i].src = 'images/notfound.png';
                console.warn(`roulette.picsGet -> argument -> array[${i}]['picture'] is undefined!`);
            }
        }
    },
    setFrames: () => {
        for(var pic in roulette.pics) {
            roulette.pics[pic].naturalHeight !== 0
            ? roulette.pics[pic] = new imageFitFrame(roulette.pics[pic])
            : roulette.pics[pic] = new imageFitFrame(imageNotFound);
            //
            roulette.pics[pic].align = new Vector2(0.5, -1);
            roulette.pics[pic].fit()
        };
        roulette.complete = true
    },
    picsComplete: () => {
        var progress = 0;
        for(var pic in roulette.pics) {
            if(roulette.pics[pic].complete) {progress++}
        };
        return progress
    },
    centerItem: () => {
        if(roulette.picsCount > 1) {
            var flag = Math.round(roulette.progress.get());
            if(flag < 0) {flag -= Math.floor(flag / roulette.picsCount) * roulette.picsCount};
            if(flag > roulette.picsCount - 1) {flag -= Math.floor(flag / roulette.picsCount) * roulette.picsCount};
            return roulette.anime[flag]
        } else {
            return roulette.anime[Math.norma(roulette.picsCount)]
        }
    },
    winnerCentered: () => {
        return roulette.winnerPos == Math.round(roulette.progress.get())
    },
    centerNumber: () => {
        if(roulette.picsCount > 1) {
            var n = Math.round(roulette.progress.get());
            if(n < 0) {n -= Math.floor(n / roulette.picsCount) * roulette.picsCount};
            if(n > roulette.picsCount - 1) {n -= Math.floor(n / roulette.picsCount) * roulette.picsCount};
        return n
        } else {
            return Math.norma(roulette.picsCount)
        }
    },
    speed: new Vector1(0),
    time: 0, atime: 0,
    catchWinner: false,
    speedMax: 0,
    randomizer: 0.3,
    doRoll: (time, speed, modTime = true) => {
        if(roulette.winnerPos >= 0) {setTimeout(() => {
            roulette.pics[roulette.winnerPos].bgColor = new Color(0,0,0,1);
            roulette.pics[roulette.winnerPos].winner = false;
            roulette.winnerPos = -1
        }, 500)};
        roulette.time = 0;
        roulette.atime = modTime ? time * (1 + (Math.random() * roulette.randomizer) - roulette.randomizer/2) : time;
        roulette.speedMax = speed * (1 + (Math.random() * roulette.randomizer) - roulette.randomizer/2);
        roulette.catchWinner = true;
        //
        localStorage.removeItem(savePrefix+'roulette.winner')
    },
    pause: (ms) => {
        // внешняя остановкa
        if(roulette.dragged === false) {
            roulette.speed.set(0);
            roulette.progress.move(Math.round(roulette.progress.getFixed()), 1, easeInOutSine)
        };
        roulette.dragged = ms
    },
    draw: () => {
        // обновляем
        roulette.picsCount == 1
        ? roulette.centerAnime = roulette.anime[0]
        : roulette.centerAnime = roulette.centerItem();
        // update winner ring
        visual.lightAngle1 += visual.lightAngle1 < 360 ? (deltaTime/1000) * 45 : -360;
        visual.lightAngle2 -= visual.lightAngle2 > 0 ? (deltaTime/1000) * 30 : -360;
        //
        roulette.progress.update();
        roulette.sorted = [];
        roulette.speed.update();
        if(roulette.speed.get() !== 0) {roulette.progress.value += roulette.speed.get() * (deltaTime/1000)};
        // крутим
        if(roulette.time < roulette.atime) {
            roulette.time += deltaTime/1000;
            if(roulette.time <= roulette.atime/3) {
                roulette.speed.set(roulette.speedMax * easeInQuad((roulette.time / roulette.atime)*3))
            } else {
                roulette.speed.set(roulette.speedMax * easeInCirc(Math.abs(((roulette.time / roulette.atime)-1)*1.5)))
            }
        } else {
            if(roulette.catchWinner === true) {
                roulette.speed.reset();
                roulette.catchWinner = roulette.centerItem();
                roulette.winnerPos = roulette.centerNumber();
                roulette.nameboxcolor = roulette.winnerStyle;
                roulette.progress.move(roulette.winnerPos, 0.5, easeOutQuint);
                roulette.time = roulette.atime;
                console.log('Winner: '+roulette.catchWinner['title'] + '\n    ' + roulette.catchWinner['sources'][0]);
                !pref.playClip ? musicRollEnd() : null;
                rollWinner.invoke(roulette.centerAnime.title);
                lsSaveObject('roulette.winner', [roulette.winnerPos, roulette.catchWinner])
            }
        };
        // звучим и обновляем ссылки
        if(roulette.oldCenter !== roulette.centerAnime) {
            if(roulette.catchWinner || roulette.dragged || roulette.initsound) {playSound(sound['scroll'])};
            roulette.anime[roulette.winnerPos] === roulette.centerAnime
            ? roulette.nameboxcolor = roulette.winnerStyle
            : roulette.nameboxcolor = roulette.nameboxdef;
            //
            if(roulette.picsCount > 0 && roulette.pics.length > 0) {
                namebox.text = roulette.centerAnime['title'];
                sites.updateSources();
                tInfo.updateTitle(roulette.centerAnime);
                tDesc.release(); tDesc.newDesc();
            };
            //
            roulette.oldCenter = roulette.centerAnime
        };
        // крутим мышкой
        if(roulette.catchWinner !== true && roulette.complete) {
            if(mouse.pos.lessAND(cvssize.dividexy(1, 2))) {
                if(wheelState !== 'idle') {
                    roulette.speed.set(0);
                    roulette.dragged = 5000;
                    if(wheelState == 'btm') {
                        roulette.progress.move(Math.round(roulette.progress.getFixed())+1, 0.5, easeOutCirc)
                    } else if (wheelState == 'top') {
                        roulette.progress.move(Math.round(roulette.progress.getFixed())-1, 0.5, easeOutCirc)
                    };
                };
            };
            // отслеживаем кручения
            if(typeof roulette.dragged === 'number') {
                if(roulette.dragged > 0) {
                    roulette.dragged -= deltaTime;
                } else {
                    if(pref.autoScroll) {
                        roulette.dragged = false;
                        if(roulette.catchWinner === false) {
                            roulette.speed.move(roulette.idleSpeed, 0.75, easeOutQuint)
                        } else {
                            roulette.progress.move(roulette.winnerPos, 2, easeOutQuint)
                        }
                    }
                }
            };
            if(!pref.autoScroll && roulette.speed.getFixed() !== 0) {
                roulette.dragged = 0;
                roulette.speed.set(0);
                roulette.progress.move(Math.round(roulette.progress.getFixed()), 1, easeInOutSine)
            }
        };
        // стопаем рулетку, если расфокус
        if(!windowVisibility) {roulette.pause(3000)};
        // циклируем
        if(srv.state !== 'show_roulette') {
            if(roulette.progress.get() >= roulette.picsCount) {
                roulette.progress.value -= Math.floor(roulette.progress.value / roulette.picsCount) * roulette.picsCount;
                if(roulette.picsCount === 1) {
                    playSound(sound['scroll'])
                }
            } else if(roulette.progress.get() <= -1) {
                roulette.progress.value -= Math.floor(roulette.progress.value / roulette.picsCount) * roulette.picsCount;
                if(roulette.picsCount === 1) {
                    playSound(sound['scroll'])
                }
            }
        };
        // обнуляем
        roulette.hidemap = false;
        roulette.isempty = false;
        roulette.sorted = [];
        var depos = roulette.progress.get() - Math.round(roulette.progress.get());
        if(roulette.picsCount <= 0) {
            // рулетка пуста
            roulette.isempty = true;
            roulette.hidemap = true;
            var pos = normalAlign(new Vector2(0.5, 0.33));
            scaleFont(40, 'Segoe UI', 'bold');
            ctx.fillStyle = '#fff';
            ctx.fillText(txt('eagEmpty'), pos.x, pos.y)
        } else if (roulette.picsCount == 1) {
            // в рулетке 1 тайтл
            roulette.hidemap = true;
            var transform = roulette.mapper(0.5);
            var item = roulette.pics[0];
            item.align = transform.align.sumv(roulette.addAlign);
            item.zoom = transform.zoom * roulette.zoomMult;
            item.alpha = transform.alpha * roulette.alphaMult;
            item.bgcolor = roulette.winnerStyle;
            item.winner = true;
            item.draw()
        } else {
            // подготавливаем картинки
            for(var i = 0; i < pref.rollImages; i++) {
                var item, elem = Math.round(roulette.progress.get()) - Math.floor(pref.rollImages/2) + i;
                elem = elem - Math.floor(elem / roulette.picsCount) * roulette.picsCount;
                //
                var transform = roulette.mapper((i-depos+0.5)/pref.rollImages);
                if(pref.rollImages >= roulette.pics.length) {
                    item = roulette.pics[elem].copy()
                } else {
                    item = roulette.pics[elem]
                };
                // transform
                item.align = transform.align.sumv(roulette.addAlign);
                item.zoom = transform.zoom * roulette.zoomMult;
                item.alpha = transform.alpha * roulette.alphaMult;
                if(elem === roulette.winnerPos) {
                    item.bgColor = roulette.winnerStyle;
                    item.winner = true
                };
                roulette.sorted.push(item)
            };
            roulette.sorted.sort((a,b) => {
                if(a.zoom === b.zoom) {
                    return 0
                } else {
                    if(a.zoom > b.zoom) {return 1} else {return -1}
                }
            });
            //
            for(var a in roulette.sorted) {
                roulette.sorted[a].draw()
            }
        }
    },
};
//
function rouletteSetItems(array, limit=true) {
    roulette.complete = false;
    roulette.winnerPos = -1;
    roulette.catchWinner = false;
    roulette.progress.set(Math.floor(roulette.anime.length/2));
    roulette.speed.reset();
    //
    if(array.length > pref.rouletteItems && limit) {
        roulette.picsCount = pref.rouletteItems;
        roulette.picsGet(array.slice(0, pref.rouletteItems))
    } else if(array.length > pref.rouletteItemsMax) {
        roulette.picsCount = array.length;
        roulette.picsGet(array.slice(0, pref.rouletteItemsMax))
    } else {
        roulette.picsCount = array.length;
        roulette.picsGet(array)
    }
};
//
function rouletteApplyPreset(preset = presetbase['Дефолтный'], max = pref.rouletteItems) {
    sload.state = 'loadstart';
    filterPreset(preset);
    rouletteSetItems(randomItemsFrom(getListFiltered(), max))
};
//
let _itemsmapperx = 0;
function rouletteItemsMapper(p) {
    var tf = {align: new Vector2(), zoom: _scaleDynamic, alpha: 0};
    // align, 3 steps
    if(p > 0 && p <= 0.4) {
        tf.align = new Vector2(0.05 + (0.23+_itemsmapperx) * easeInCubic(p*2.5) - _itemsmapperx, 0.05 + 0.1 * easeInCubic(p*2.5));
        tf.zoom *= 0.3 + 0.5 * (p*2.5);
        tf.alpha = p*2.5
    } else if (p > 0.4 && p <= 0.6) {
        tf.align = new Vector2(0.28 + 0.44 * (p-0.4)*5, 0.15 + 0.02 * easeParabolaQuad((p-0.4)*5));
        tf.zoom *= 0.8 + 0.2 * easeParabolaQuad((p-0.4)*5);
        tf.alpha = 1
    } else {
        tf.align = new Vector2(1 - (0.23+_itemsmapperx) * easeInCubic(((p-0.6)*2.5)-1) - 0.05 + _itemsmapperx, 0.05 + 0.1 * easeInCubic(((p-0.6)*2.5)-1));
        tf.zoom *= 0.8 - 0.5 * ((p-0.6)*2.5);
        tf.alpha = 1 - (p-0.6)*2.5
    };
    //
    return tf
};
// bezier curve mapping method
let _map1 = new Vector2(0.25, 0);
let _map2 = new Vector2(0.75, 0);
let _curve1 = new Vector2(-0.5, 0.35);
let _curve2 = new Vector2(1.5, 0.35);
//
function rouletteItemsBezier(p) {
    var tf = {align: new Vector2(), zoom: _scaleDynamic, alpha: 0};
    // pos
    tf.align = (_map1.multxy(Math.pow(1-p, 3))).sumv(_curve1.multxy(3*p*Math.pow(1-p, 2))).sumv(_curve2.multxy(3*p*p*(1-p))).sumv(_map2.multxy(p*p*p))
    // zoom, alpha
    // if(p > 0 && p <= 0.4) {tf.zoom *= 0.3 + 0.5 * (p*2.5); tf.alpha = p*2.5} 
    // else if (p > 0.4 && p <= 0.6) {tf.zoom *= 0.8 + 0.2 * easeParabolaQuad((p-0.4)*5); tf.alpha = 1} 
    // else {tf.zoom *= 0.8 - 0.5 * ((p-0.6)*2.5); tf.alpha = 1 - (p-0.6)*2.5};
    tf.alpha = easeParabolaQuad(p);
    tf.zoom = 0.2 + 0.6 * easeParabolaQuad(p);
    //
    return tf
};
//
// @EAG STUFF ROULETTE
//
function radialShadow(p=0) {
    var d = fullsize;
    var diag = Math.sqrt((d.x/2)*(d.x/2) + d.y*d.y);
    var g = ctx.createRadialGradient(d.x/2, d.y, diag/2 - (diag/2)*p, d.x/2, d.y, diag);
    g.addColorStop(0, `rgba(0,0,0,${0.3*p})`);
    g.addColorStop(0.6 * (1-p), `rgba(0, 0, 0, ${0.7 + 0.3*p})`);
    g.addColorStop(0.85, `rgba(0, 0, 0, 0.9)`);
    g.addColorStop(1, `rgba(0, 0, 0, 1)`);
    return g
};
//
let rmpBarHeight = 10;
let rouletteMapBar = new ShapedSelectBar(new Vector2(cvssize.x*0.3, rmpBarHeight*_scaleDynamic), colorMatrix(`rgba(0,0,0,0)`), colorMatrix(`rgba(0,0,0,0.5)`));
rouletteMapBar.permanent = true;
rouletteMapBar.onset = (value) => {
    roulette.progress.set(value);
    roulette.pause(5000)
};
rouletteMapBar.unpress = (value) => {
    roulette.progress.move(Math.round(value), 0.5, easeOutCirc);
    roulette.pause(5000)
};
rouletteMapBar.postdraw = () => {
    var p = rouletteMapBar.pos, s = rouletteMapBar.size;
    var rp = roulette.progress.get(); rp = rp > roulette.picsCount-1 ? roulette.picsCount-1 : rp < 0 ? 0 : rp;
    fillRectRounded(new Vector2(s.y*2, s.y), p.sumxy(s.x * (rp / roulette.picsCount) - s.y, 0), '#ffff', s.y/2);
    if(typeof roulette.catchWinner !== 'boolean') {
        fillRectRounded(new Vector2(s.y), p.sumxy(s.x * (roulette.winnerPos / roulette.picsCount) - s.y/2, 0), '#4f4f', s.y/2)
    }
};
function drawMapRoulette(width, pos) {
    if(!roulette.hidemap) {
        rouletteMapBar.size = new Vector2(width, rmpBarHeight*_scaleDynamic);
        rouletteMapBar.pos = pos;
        var p = roulette.progress.get(); p = p > roulette.picsCount ? roulette.picsCount : p < 0 ? 0 : p;
        rouletteMapBar.update(p, roulette.picsCount);
        rouletteMapBar.draw()
    }
};
//
// @EAG SCREEN LOADING
//
let sload = {
    state: 'startup', // startup
    time: 0.5,
    init: false,
    connection: true,
    //
    ayaya: invokeNewImage('images/ayaya.png'),
    alpha: new Vector1(0),
    showing: true,
    bgcolor: 'rgba(11,11,18,1)',
    head: txt('eagName'),
    headsize: 50,
};
// downloading database
let databaseRequestResult = null;
let adb = {}, adb_information = {};
function getAnimeDatabase() {
    var xml = new XMLHttpRequest();
    xml.open("GET",'https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database.json',false);
    xml.onload = () => {databaseRequestResult = xml.responseText};
    xml.onerror = () => {databaseRequestResult = false};
    xml.send(null)
};
function awaitForDatabase() {
    if(databaseRequestResult !== null) {
        if(databaseRequestResult !== false) {
            var fulldata = JSON.parse(databaseRequestResult);
            adb = fulldata.data;
            adb_information = {
                license: fulldata.license,
                repository: fulldata.repository,
                lastUpdate: fulldata.lastUpdate
            };
            _preftitles.adb_author = {
                name: 'Author',
                object: 'manami-project',
                url: false
            };
            _preftitles.adb = {
                name: 'Name',
                object: 'anime-offline-database',
                url: adb_information.repository
            };
            _preftitles.adb_license = {
                name: 'License',
                object: adb_information.license.name,
                url: adb_information.license.url
            };
            _preftitles.adb_version = {
                name: 'Last update',
                object: adb_information.lastUpdate,
                url: false
            };
            databaseRequestResult = 'success'
        } else {
            databaseRequestResult = 'error'
        }
    };
};
//
// titles
let _preftitles = {};
//
let firstMouseEvent = false;
let dynamicBgcolor = colorMatrix(sload.bgcolor).alpha(0);
let staticBgcolor = '#000';
let imageLoadProgress = new TextBox(normalAlign(new Vector2(0.5, 0.3)), new Vector2(400 * _scaleDynamic));
imageLoadProgress.iterlimit = 4;
let loadImagesBar = `rgba(200,200,200,0.2)#rgba(255,255,255,0.8)#rgba(0,0,0,1)#rgba(0,0,0,1)`;
//
function screenLoading() {
    imageLoadProgress.size.setxy(400 * _scaleDynamic);
    imageLoadProgress.margin.setxy(10 * _scaleDynamic);
    var spbsize =  new Vector2(fullsize.x, 8 * _scaleDynamic);
    //
    sload.alpha.update();
    fillRect(fullsize, normalAlign(new Vector2(0.5), fullsize), dynamicBgcolor.alpha(sload.alpha.get()).getColor());
    //
    if(!navigator.onLine && !firstMouseEvent) {
        sload.alpha.move(1, sload.time, easeInOutSine);
        sload.state = 'timeout'
    };
    //
    if(wallpaper.complete && sload.showing === false) {
        sload.showing = 'none';
        sload.alpha.move(0.5, sload.time, easeInOutSine)
    };
    //
    if(sload.state === 'startup') {
        if(sload.ayaya.complete) {sload.state = 'show'}
    //
    } else if(sload.state === 'timeout') {
        var center = fullAlign(new Vector2(0.5, 0.5));
        var spacing = 15 * _scaleDynamic;
        ctx.fillStyle = '#b55'; ctx.textAlign = 'center';
        scaleFont(36, 'Segoe UI Light');
        fillTextFast(center.minxy(0, spacing), txt('loadNoCon'));
        ctx.fillStyle = '#ccc';
        scaleFont(18, 'Segoe UI');
        fillTextArray(center.sumxy(-fullsize.x/4, spacing*3), textWidthFit(txt('loadRecon'), fullsize.x/2), spacing/4)
    //
    } else if(sload.state === 'show') {
        var scale = lsLoadValue('scale', null) === null
        ? floatNumber(cvssize.y / 720, 1)
        : lsLoadValue('scale', 1);
        lsSaveValue('scale', scale);
        cvsscale.set(scale);
        globalRescale();
        //
        sload.alpha.move(1, sload.time, easeInOutSine);
        imageLoadProgress.text = txt('loadJkrg');
        imageLoadProgress.shadow.x = imageLoadProgress.size.x;
        getAnimeDatabase();
        //
        sload.state = 'wait_adb'
    //
    } else if(sload.state === 'wait_adb') {
        awaitForDatabase();
        if(databaseRequestResult = 'error') {sload.state = 'timeout'};
        if(databaseRequestResult = 'success') {
            databaseShorter();
            //
            sload.state = 'wait'
        }
    //
    } else if(sload.state === 'wait') {
        shapeProgressBar(normalAlign(new Vector2(0.5, 0), spbsize), spbsize, sload.alpha.get(), colorMapMatrix(loadImagesBar));
        //
        if(sload.alpha.get() >= 1) {
            sload.showing = false;
            roulette.alphaMult = 0;
            roulette.zoomMult = 0;
            roulette.addAlign = new Vector2(0),
            roulette.addAlign = srv.rhAlign.get();
            //
            if(arrayCompleted(allInvokedImages)) {sload.state = 'demo'}
        }
    //
    } else if(sload.state === 'demo') {
        if(lsItemUndefined('roulette.anime')) {
            rouletteApplyPreset(presetbase[presetSelected], pref.rouletteItems)
        } else {
            rouletteSetItems(lsLoadObject('roulette.anime'), false);
            sload.state = 'loadstart'
        };
        //
        imageLoadProgress.text = txt('loadGen');
        shapeProgressBar(normalAlign(new Vector2(0.5, 0), spbsize), spbsize, 1, colorMapMatrix(loadImagesBar));
    //
    } else if(sload.state === 'loadnew') {
        // ресетим рулетку
        roulette.alphaMult = 0;
        roulette.zoomMult = 0;
        roulette.addAlign = new Vector2(0),
        roulette.addAlign = srv.rhAlign.get();
        //
        imageLoadProgress.text = txt('loadPics') + ` (${roulette.picsComplete()}/${roulette.pics.length})`;
        shapeProgressBar(normalAlign(new Vector2(0.5, 0), spbsize), spbsize, 0, colorMapMatrix(loadImagesBar));
        sload.state = 'loadstart'

    // 
    } else if(sload.state === 'loadstart') {
        imageLoadProgress.text = txt('loadPics') + ` (${roulette.picsComplete()}/${roulette.pics.length})`;
        shapeProgressBar(normalAlign(new Vector2(0.5, 0), spbsize), spbsize, roulette.picsComplete()/roulette.pics.length, colorMapMatrix(loadImagesBar));
        //
        if(roulette.picsComplete() == roulette.pics.length) {
            if(firstMouseEvent) {playSound(sound['loaded'])};
            imageLoadProgress.text = txt('loadDone');
            srv.hideProgress.set(1);
            srv.hideProgress.move(0, 1, easeOutExpo);
            roulette.complete = false;
            roulette.setFrames();
            //
            sload.state = 'none';
            setTimeout(() => {sload.state = 'loadend'}, sload.time*1000)
        }
    } else if(sload.state === 'loadend') {
        if(!firstMouseEvent) {
            imageLoadProgress.text = txt('loadFirstEvent')
        };
        if(roulette.complete) {
            if((mouse.click && mouse.pos.overSAND(new Vector2()) && mouse.pos.lessSAND(cvssize)) || firstMouseEvent) {
                roulette.progress.set(-20);
                roulette.speed.reset();
                if(!lsItemUndefined('roulette.winner')) {
                    [roulette.winnerPos, roulette.catchWinner] = lsLoadObject('roulette.winner', [roulette.winnerPos, roulette.catchWinner]);
                    roulette.progress.move(roulette.winnerPos, 3, easeOutQuint);
                    setTimeout(() => {setTimeout(() => {playSound(sound['winner'])}, 100)}, 3*1000)
                } else {
                    roulette.progress.move(0, 3, easeOutQuint)
                };
                setTimeout(() => {roulette.initsound = false}, 3000);
                //
                musicInitialize();
                if(!firstMouseEvent) {playSound(sound['loaded']); resetSnowflakes(); firstMouseEvent = true};
                rollBar.state = 'show';
                srv.state = 'show_roulette';
                //
                sload.state = 'none';
                staticBgcolor = sload.bgcolor;
                //
                musicLite.active = false;
                musicLite.offset.set(musicLite.size.y*-2);
                setTimeout(() => {
                    imageLoadProgress.clear();
                    musicLite.show();
                    // imageLoadProgress.draw();
                    sload.head = txt('eagFilter');
                    sload.ayaya.src = imageChangeFilter.src;
                    sload.headsize = 36
                }, tss.fulltime*1000);
                requestScreen(screenRoulette)
            }
        }
    };
    //
    ctx.globalAlpha = sload.showing === true ? sload.alpha.get() : 1;
    if(sload.state !== 'startup' && sload.state !== 'timeout') {
        var center = fullAlign(new Vector2(0.5, 0.5));
        var sizei = new Vector2(200 * _scaleDynamic);
        var spacing = 15 * _scaleDynamic;
        drawImageSized(sload.ayaya, center.minxy(sizei.x/2, sizei.y).minxy(0, spacing), sizei);
        imageLoadProgress.pos = normalAlign(new Vector2(0.5, 0.99), imageLoadProgress.shadow.get().multxy(0,1));
        ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
        scaleFont(sload.headsize, 'Segoe UI', 'bold');
        fillTextFast(center.sumxy(0, sload.headsize * _scaleDynamic), sload.head);
        scaleFont(28, 'Segoe UI');
        imageLoadProgress.draw()
    }
};
//
// @EAG SCREEN ROULETTE
//
let srv = {
    state: 'init',
    hideProgress: new Vector1(),
    hideTime: 1,
    margin: new Vector2(10),
    //
    rhAlign: new Vector2(0, -0.5),
};
//
let namebox = new TextBox(new Vector2(), new Vector2(640 * _scaleDynamic, 0));
namebox.dissolving = true;
namebox.shadow.x = namebox.size.x/2;
namebox.iterlimit = 4;
let rollProgressBar = colorMapMatrix(`rgba(0,0,0,0.2)#rgba(225,225,255,0.8)#rgba(0,0,0,1)#rgba(0,0,0,1)`);
let rollProgressHeight = 3;
//
_lastbufferedtitle = '';
namebox.onupd = () => {
    // scale
    namebox.size.x = cvssize.x * 0.45;
    namebox.margin = srv.margin.multxy(_scaleDynamic);
    // var hover = false;
    if(roulette.catchWinner !== true && mouse.pos.overAND(namebox.getShadowPos()) 
    && mouse.pos.lessAND(namebox.getShadowPos().sumv(namebox.shadow.get()))) {
        hoverHint.invoke(txt('promHoverCopy'));
        if(mouse.click) {
            mouse.click = false;
            _lastbufferedtitle = prompt('Ctrl+C   :P', roulette.centerAnime['title'])
        }
    }
};
//
function screenRoulette() {
    var srvhp = srv.hideProgress.get();
    if(srv.state === 'show_roulette') {
        fillRect(fullsize, fullAlign(new Vector2(0.5), fullsize), radialShadow(srvhp));
        srv.hideProgress.update();
        // развёртываем рулетку
        roulette.alphaMult = 1 - srvhp;
        roulette.zoomMult = 1 - srvhp;
        roulette.addAlign = srv.rhAlign.multv(new Vector2(srvhp));
        // рисуем
        roulette.draw();
        rollBar.draw();
        tDesc.draw();
        tInfo.draw();
        ctx.globalAlpha = (1 - srvhp);
        musicLite.draw();
        mnMenu.draw();
        ctx.globalAlpha = 1;
        if(srvhp <= 0) {
            mnMenu.break = false;
            roulette.complete = true;
            srv.state = 'idle'
        }
    //
    } else if(srv.state === 'idle') {
        fillRect(fullsize, fullAlign(new Vector2(0.5), fullsize), radialShadow(0));
        ctx.textAlign = 'center';
        namebox.castShadow();
        namebox.pos = normalAlign(new Vector2(0.5, 0.8), new Vector2(0, namebox.shadow.get().y));
        scaleFont(28, 'Segoe UI'); ctx.fillStyle = '#fff';
        if(roulette.winnerCentered()) {ctx.fillStyle = roulette.nameboxcolor.getColor()};
        namebox.draw();
        //
        roulette.draw();
        rollBar.draw();
        tDesc.draw();
        tInfo.draw();
        musicLite.draw();
        mnMenu.draw();
    //
    } else if(srv.state === 'roll_start') {
        mnMenu.break = true;
        fillRect(fullsize, fullAlign(new Vector2(0.5), fullsize), radialShadow(0));
        srv.hideProgress.update();
        //
        namebox.pos = normalAlign(new Vector2(0.5, 0.8+0.05*srvhp), new Vector2(0, namebox.shadow.get().y));
        ctx.textAlign = 'center';
        namebox.castShadow();
        scaleFont(28 + 8*srvhp, 'Segoe UI'); ctx.fillStyle = '#fff';
        namebox.measureShadow();
        if(roulette.winnerCentered()) {ctx.fillStyle = roulette.nameboxcolor.getColor()};
        namebox.draw();
        // main ui
        roulette.draw();
        rollBar.draw();
        tDesc.draw(); 
        tInfo.draw();
        musicLite.draw();
        ctx.globalAlpha = 1 - srvhp;
        mnMenu.draw();
        // roll progress
        ctx.globalAlpha = srvhp;
        shapeProgressBar(new Vector2(cvsxoffset,0), new Vector2(cvssize.x, rollProgressHeight*_scaleDynamic), 
        Math.norma(roulette.time / roulette.atime), rollProgressBar);
        ctx.globalAlpha = 1;
        if(srvhp >= 1) {
            srv.state = 'roll'
        }
    //
    } else if(srv.state === 'roll') {
        fillRect(fullsize, fullAlign(new Vector2(0.5), fullsize), radialShadow(0));
        namebox.pos = normalAlign(new Vector2(0.5, 0.85), new Vector2(0, namebox.shadow.get().y));
        ctx.textAlign = 'center';
        namebox.castShadow();
        scaleFont(36, 'Segoe UI'); ctx.fillStyle = '#fff';
        namebox.draw();
        // roll progress
        shapeProgressBar(new Vector2(cvsxoffset,0), new Vector2(cvssize.x, rollProgressHeight*_scaleDynamic), 
        Math.norma(roulette.time / roulette.atime), rollProgressBar);
        //
        roulette.draw();
        if(typeof roulette.catchWinner !== 'boolean') {
            // other
            srv.hideProgress.value = 1;
            srv.hideProgress.move(0, srv.hideTime, easeOutExpo);
            srv.state = 'roll_stop';
            tInfo.hidereq = false;
            rollBar.state = 'show'
        }
    //
    } else if(srv.state === 'roll_stop') {
        fillRect(fullsize, fullAlign(new Vector2(0.5), fullsize), radialShadow(0));
        srv.hideProgress.update();
        //
        namebox.pos = normalAlign(new Vector2(0.5, 0.8+0.05*srvhp), new Vector2(0, namebox.shadow.get().y));
        ctx.textAlign = 'center';
        namebox.castShadow();
        scaleFont(28 + 8*srvhp, 'Segoe UI'); ctx.fillStyle = '#fff';
        namebox.measureShadow();
        if(roulette.winnerCentered()) {ctx.fillStyle = roulette.nameboxcolor.getColor()};
        namebox.draw();
        //
        roulette.draw();
        rollBar.draw();
        tDesc.draw(); 
        tInfo.draw(); 
        musicLite.draw();
        ctx.globalAlpha = 1 - srvhp;
        mnMenu.draw();
        // roll progress
        ctx.globalAlpha = srvhp;
        shapeProgressBar(new Vector2(cvsxoffset,0), new Vector2(cvssize.x, rollProgressHeight*_scaleDynamic), 
        Math.norma(roulette.time / roulette.atime), rollProgressBar);
        ctx.globalAlpha = 1;
        //
        if(srvhp <= 0) {
            mnMenu.break = false;
            setTimeout(() => {musicLite.show()}, 1000);
            namebox.state = 'measure';
            srv.state = 'idle'
        }
    };
    // visuals
    rollWinner.draw()
};
//
// @EAG DEFAULT SCREEN BLOCKS
//
// hint operator
let sbBlockHint = {
    size: 32,
    // logo: invokeNewImage('images/hint.png'),
    text: null,
    //
    show: () => {
        if(sbBlockHint.text != null) {
            hoverHint.invoke(String(sbBlockHint.text))
        }
    }
};
// blocks
function sbTextHeader(text, pos, width, spacing, scroll=0) {
    var sizey = spacing*2 + ctx.measureText(text).fontBoundingBoxAscent;
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    ctx.fillText(text, pos.x + width/2, pos.y + sizey - spacing*2 - scroll);
    // hints
    if(sbBlockHint.text !== null) {
        if(mouse.pos.overAND(pos.minxy(0, scroll)) && mouse.pos.lessAND(pos.sumxy(width, sizey - scroll))) {
            sbBlockHint.show()
        }; sbBlockHint.text = null
    }
    //
    return sizey
};
function sbTextFit(text, pos, width, spacing, scroll=0, color='#fff') {
    var [array, measure] = textWidthFit(text, width - spacing*2);
    ctx.fillStyle = color;
    fillTextArray(pos.sumxy(spacing, spacing - scroll), [array, measure], spacing);
    return spacing*2 + measure.y * array.length;
};
function sbButtonPrefix(text, button, pos, width, spacing, scroll=0) {
    var sizey = spacing*2 + button.size.y;
    button.pos.setv(pos.sumxy(width - (button.size.x + spacing), spacing - scroll));
    ctx.fillStyle = '#fff'; ctx.textAlign = 'start';
    ctx.fillText(text, pos.x + spacing, pos.y + sizey - spacing*2 - scroll);
    ctx.textAlign = 'center';
    button.draw();
    // hints
    if(sbBlockHint.text !== null) {
        if(mouse.pos.overAND(pos.minxy(0, scroll)) && mouse.pos.lessAND(pos.sumxy(width/2, sizey - scroll))) {
            sbBlockHint.show()
        }; sbBlockHint.text = null
    }
    //
    return sizey + spacing
};
function sbVoidPrefix(text, pos, width, spacing, scroll=0) {
        var sizey = spacing*2 + ctx.measureText(text).fontBoundingBoxAscent;
        ctx.fillStyle = '#fff'; ctx.textAlign = 'start';
        ctx.fillText(text, pos.x + spacing, pos.y + sizey - spacing*2 - scroll);
        // hints
        if(sbBlockHint.text !== null) {
            if(mouse.pos.overAND(pos.minxy(0, scroll)) && mouse.pos.lessAND(pos.sumxy(width/2, sizey - scroll))) {
                sbBlockHint.show()
            }; sbBlockHint.text = null
        }
        //
        return sizey + spacing
};
function sbTwoButtonPrefix(text, button1, button2, pos, width, spacing, scroll=0) {
    var sizey = spacing*2 + button1.size.y;
    button1.pos.setv(pos.sumxy(width - (spacing*2 + button2.size.x + button1.size.x), spacing - scroll));
    button2.pos.setv(pos.sumxy(width - (spacing + button2.size.x), spacing - scroll));
    ctx.fillStyle = '#fff'; ctx.textAlign = 'start';
    ctx.fillText(text, pos.x + spacing, pos.y + sizey - spacing*2 - scroll);
    ctx.textAlign = 'center';
    button1.draw();
    button2.draw();
    return sizey + spacing
};
function sbCenteredButton(button, pos, width, spacing, scroll=0) {
    var sizey = spacing*2 + button.size.y;
    button.pos.setv(pos.sumxy(width/2 - button.size.x/2, spacing - scroll));
    button.draw();
    return sizey + spacing
};
function sbThreeButtonAlign(array, pos, width, spacing, scroll=0) {
    var sizey = spacing*2 + array[0].size.y;
    array[0].size.x = array[1].size.x = array[2].size.x = (width - spacing*2)/3;
    array[0].pos.setv(pos.sumxy(0, spacing - scroll));
    array[1].pos.setv(pos.sumxy(width/2 - array[1].size.x/2, spacing - scroll));
    array[2].pos.setv(pos.sumxy(width - array[2].size.x, spacing - scroll));
    array[0].draw();
    array[1].draw();
    array[2].draw();
    return sizey + spacing
};
function sbSelectbarPrefix(text, text2, bar, pos, width, spacing, scroll=0) {
    var sizey = spacing*2 + ctx.measureText(text).fontBoundingBoxAscent;
    bar.pos = pos.sumxy(width - (bar.size.x + spacing), spacing*2 - scroll);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'end';
    var texty = pos.y + sizey - spacing*2 - scroll;
    ctx.fillText(text2, (pos.x + width) - (spacing*2 + bar.size.x), texty);
    ctx.textAlign = 'start';
    ctx.fillText(text, pos.x + spacing, texty);
    bar.draw();
    // hints
    if(sbBlockHint.text !== null) {
        if(mouse.pos.overAND(pos.minxy(0, scroll)) && mouse.pos.lessAND(pos.sumxy(width/2, sizey - scroll))) {
            sbBlockHint.show()
        }; sbBlockHint.text = null
    }
    //
    return sizey + spacing
};
//
function sbTitleObject(titleobject, pos, width, spacing, scroll=0) {
    var tname = textWidthFit(titleobject.name, width/2 - spacing*3);
    var tobject = textWidthFit(titleobject.object, width/2 - spacing*3);
    ctx.fillStyle = `#ccc`; ctx.textAlign = 'end';
    fillTextArray(pos.sumxy(spacing, spacing - scroll), tname, spacing);
    ctx.fillStyle = `#fff`; ctx.textAlign = 'start';
    fillTextArray(pos.sumxy(spacing*2+width/2, spacing - scroll), tobject, spacing);
    var h = tname[0].length > tobject[0].length ? tname[0].length * tname[1].y : tobject[0].length * tobject[1].y;
    // url
    if(titleobject.url !== false) {
        if(mouse.pos.overAND(pos.sumxy(spacing, -scroll)) && mouse.pos.lessAND(pos.sumxy(width, (h+spacing*2)-scroll))) {
            hoverHint.invoke(txt('hintOpenURL') + titleobject.url);
            if(mouse.click) {window.open(String(titleobject.url))}
        }
    };
    //
    return spacing*2 + h
};
//
let filterBrowserTabHeight = 100;
let filterBrowserItemName = {style: false, font: 'Segoe UI', size: 20};
let filterBrowserItemAbout = {style: false, font: 'Segoe UI', size: 16};
let buttonEditorDeleteSize = new Vector2(90, 30);
//
function sbBrowserItem(item, image, pos, width, spacing, scroll=0) {
    var taby = filterBrowserTabHeight * _scaleDynamic;
    if(pos.y + taby >= scroll && pos.y <= scroll + cvssize.y) {
        // bg
        fillRectRounded(new Vector2(width, taby), pos.sumxy(0, -scroll), '#0005');
        // image
        if(!image.complete) {drawImageSized(imageNotFound, pos.sumxy(spacing, spacing - scroll), new Vector2(taby - spacing*2))} 
        else {drawImageSized(image, pos.sumxy(spacing, spacing - scroll), new Vector2(taby - spacing*2))};
        // name
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
        scaleFontObject(filterBrowserItemName);
        var limit = width - (taby + spacing*3);
        var textt = pos.sumxy(spacing*2 + taby + limit/2, spacing+filterBrowserItemName.size*_scaleDynamic);
        var limited = textStringLimit(item.name, limit);
        ctx.fillText(limited, textt.x, textt.y - scroll);
        // data
        ctx.fillStyle = '#ccc';
        scaleFontObject(filterBrowserItemAbout);
        limited = textStringLimit(item.about, limit);
        textt = textt.sumxy(0, filterBrowserItemName.size*_scaleDynamic);
        ctx.fillText(limited, textt.x, textt.y - scroll);
        // add button (if tab is hovered)
        if(mouse.pos.overAND(pos.sumxy(0, -scroll)) && mouse.pos.lessAND(pos.sumxy(width, taby-scroll))) {
            buttonBrowserAdd.bhvr = item.dbid;
            buttonBrowserAdd.size.setv(buttonEditorDeleteSize.multxy(_scaleDynamic));
            buttonBrowserAdd.pos.setv(pos.sumxy(width, taby - scroll).minv(buttonBrowserAdd.size).minxy(spacing));
            buttonBrowserAdd.draw()
        }
    };
    //
    return taby + spacing
};
//
function sbEditorItem([item, image], pos, width, spacing, scroll=0) {
    var taby = filterBrowserTabHeight * _scaleDynamic;
    if(pos.y + taby >= scroll && pos.y <= scroll + cvssize.y) {
        // bg
        fillRectRounded(new Vector2(width, taby), pos.sumxy(0, -scroll), '#0005');
        // image
        if(!image.complete) {drawImageSized(imageNotFound, pos.sumxy(spacing, spacing - scroll), new Vector2(taby - spacing*2))} 
        else {drawImageSized(image, pos.sumxy(spacing, spacing - scroll), new Vector2(taby - spacing*2))};
        // name
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
        scaleFontObject(filterBrowserItemName);
        var limit = width - (taby + spacing*3);
        var textt = pos.sumxy(spacing*2 + taby + limit/2, spacing+filterBrowserItemName.size*_scaleDynamic);
        var limited = textStringLimit(item.name, limit);
        ctx.fillText(limited, textt.x, textt.y - scroll);
        // data
        ctx.fillStyle = '#ccc';
        scaleFontObject(filterBrowserItemAbout);
        limited = textStringLimit(item.about, limit);
        textt = textt.sumxy(0, filterBrowserItemName.size*_scaleDynamic);
        ctx.fillText(limited, textt.x, textt.y - scroll);
        // delete button (if tab is hovered)
        if(mouse.pos.overAND(pos.sumxy(0, -scroll)) && mouse.pos.lessAND(pos.sumxy(width, taby-scroll))) {
            buttonEditorDelete.bhvr = item.dbid;
            buttonEditorDelete.size.setv(buttonEditorDeleteSize.multxy(_scaleDynamic));
            buttonEditorDelete.pos.setv(pos.sumxy(width, taby - scroll).minv(buttonEditorDelete.size).minxy(spacing));
            buttonEditorDelete.draw()
        }
    };
    //
    return taby + spacing
};
//
let pageManagerFont = {style: false, font: 'Segoe UI', size: 20};
let pageManagerButton = new Vector2(150, 30);
//
function sbPageManager(control, button3, pos, width, spacing, scroll=0) {
    var bsize = pageManagerButton.multxy(_scaleDynamic);
    var h = spacing + pageManagerFont.size*_scaleDynamic + bsize.y;
    // text
    var all = (control.current*control.max-1) > control.all ? control.all : control.current*control.max-1
    var text = `${txt('browserPage')} ${control.current}/${control.pages} | ${(control.current-1)*control.max} - ${all}`;
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
    scaleFontObject(pageManagerFont);
    fillTextFast(pos.sumxy(width/2, h/3 - scroll), text);
    // buttons
    var banch = pos.sumxy(width/2 - (bsize.x*1.5+spacing), (h-bsize.y) - scroll);
    button3[0].size = button3[1].size = button3[2].size = bsize;
    button3[0].pos.setv(banch);
    button3[1].pos.setv(banch.sumxy(bsize.x+spacing, 0));
    button3[2].pos.setv(banch.sumxy((bsize.x+spacing)*2, 0));
    if(control.current > 1) {button3[0].draw()};
    button3[1].draw(); 
    if(control.current < control.pages) {button3[2].draw()};
    //
    return h + spacing
};
//
// @EAG ANIME ITEM CLASS
//
function getAnimeDBID(data) {
    for(var a in adb) {
        if(adb[a].title == data.title) {return Number(a)}
    };
    console.error(`Тайтл ${data.title} не был найден в датабазе!`);
    return null
};
//
class AnimeItem {
    constructor(data) {
        // copy data & ids
        this.data = data;
        this.malid = malAnimeID(data.sources);
        this.dbid = this.data.dbid !== undefined ? this.data.dbid : Number(getAnimeDBID(data));
        // get score
        this.score = null;
        if(this.malid != null) {
            if(adb_ratings[this.malid] !== undefined) {
                this.score = Number(adb_ratings[this.malid].score)}};
        if(typeof this.score !== 'number' || String(this.score) == 'NaN') {this.score = '???'};
        // fast meta
        this.name = data.title;
        this.about = `Ep. ${data.episodes} | MAL ${this.score} | ${data.animeSeason.season}, ${data.animeSeason.year} | ${data.type} | ${data.status} | #${this.dbid}`;
    }
};
//
// @EAG STUFF FILTER
//
let tagSelection = {
    // main ['exc', 'inc', 'none']
    'action':           'none',
    'adventure':        'none',
    'comedy':           'none',
    'drama':            'none',
    'ecchi':            'none',
    'fantasy':          'none',
    'game':             'none',
    'harem':            'none',
    'historical':       'none',
    'horror':           'none',
    'isekai':           'none',
    'magic':            'none',
    'mecha':            'none',
    'military':         'none',
    'music':            'none',
    'mystery':          'none',
    'parody':           'none',
    'psychological':    'none',
    'romance':          'none',
    'school':           'none',
    'sci-fi':           'none',
    'seinen':           'none',
    'shoujo':           'none',
    'shounen':          'none',
    'slice of life':    'none',
    'sports':           'none',
    'supernatural':     'none',
    'yaoi':             'none',
    'yuri':             'none',
    // other
    'work':             'none',
    'tsundere':         'none',
    'yandere':          'none',
    'kuudere':          'none',
    'detective':        'none',
    'space':            'none',
    'future':           'none',
    'crime':            'none',
    'cooking':          'none',
    // 0.8 update
    'present':          'none',
    'kids':             'none',
    'manga':            'none',
    'original':         'none',
    'male':             'none',
    'female':           'none',
    'family':           'none',
    'altworld':         'none',
    'shorts':           'none',
    // oh no
    'secret':           'exc',
    'allnsfw':          'exc',
};
//
let tagSelectionString = JSON.stringify(tagSelection);
let presetSelected = lsLoadString('presetSelected', 'Бесится, но любит');
let newPresetSelected = lsLoadString('presetSelected', 'Бесится, но любит');
let presetOnRoulette =  lsLoadString('presetOnRoulette', presetbase[presetSelected].name);
let listOnRoulette = lsLoadString('listOnRoulette', 'ListName');
//
let presetButtons = {};
let presetButtonFont = {
    style: 'bold',
    font: 'Segoe UI Light',
    size: 16
};
let tagButtons = {};
let tagButtonsFont = {
    style: 'bold',
    font: 'Segoe UI Light',
    size: 18
};
let titleCounterFont = {
    style: 'bold',
    font: 'Consolas',
    size: 18
};
let filterHeaderFont = {
    style: false,
    font: 'Segoe UI',
    size: 50
};
//
let filterButtonsSpacing = 8;
let filterCounterHeight = 60;
//
function generatePresetButtons() {
    var measure, size;
    ctx.textAlign = 'center'; scaleFontObject(presetButtonFont);
    for(var key in presetbase) {
        measure = ctx.measureText(presetbase[key].name);
        size = new Vector2(Math.floor(measure.width), measure.fontBoundingBoxAscent).sumxy(filterButtonsSpacing*2);
        presetButtons[key] = new TextButtonShaped(shapeRectRounded, presetbase[key].name, size, 
            colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
            colorMapMatrix(`rgba(24,110,24,1)#rgba(40,160,40,1)#rgba(40,160,40,1)#rgba(200,200,47,0.1)`));
        presetButtons[key].locked = true; presetButtons[key].isSwitcher = true; 
        presetButtons[key].needshadow = false; presetButtons[key].height = -filterButtonsSpacing/2;
        eval(`presetButtons[key].onclick = () => {newPresetSelected = '${key}'; presetButtonDeactivator()}`)
    }
};
generatePresetButtons();
presetButtons[presetSelected].tap.set(_imagebuttonheight-1);
presetButtons[presetSelected].initactivity = true;
//
function generateTagButtons() {
    var measure, size;
    ctx.textAlign = 'center'; scaleFontObject(tagButtonsFont);
    for(var key in tagSelection) {
        measure = ctx.measureText(tagbase[key].name);
        size = new Vector2(Math.floor(measure.width), measure.fontBoundingBoxAscent).sumxy(filterButtonsSpacing*2);
        tagButtons[key] = new TagSwitcherShaped(key);
        tagButtons[key].size = size
    }
};
generateTagButtons();
//
function presetButtonDeactivator() {
    presetButtons[presetSelected].active = false;
    presetButtons[presetSelected].tap.move(0, 0.25, easeInOutSine);
    presetSelected = newPresetSelected;
    lsSaveValue('presetSelected', presetSelected)
};
function presetSwitcher() {
    // обновляем фильтр
    resetFilter();
    filterDefault = filterModify(filterDefault, presetbase[presetSelected].addon());
    lsSaveObject('filterDefault', filterDefault);
    filterPresetOnly = JSON.stringify(filterDefault);
    // убираем игнор условий
    filterAttempts = 0;
    lsSaveValue('filterAttempts', 0);
    // обновляем тэги, подсчитываем
    tagSelectionPrepare();
    filterPrecount.request()
};
resetFilter();
tagSelectionPrepare();
filterPresetOnly = JSON.stringify(filterModify(filterDefault, presetbase[presetSelected].addon()));
filterDefault = lsLoadObject('filterDefault', filterDefault);
tagSelection = lsLoadObject('tagSelection', tagSelection);
//
function generateAnotherButton(value) {
    var measure, size;
    ctx.textAlign = 'center'; scaleFontObject(tagButtonsFont);
    measure = ctx.measureText(txt(value));
    size = new Vector2(Math.floor(measure.width), measure.fontBoundingBoxAscent).sumxy(filterButtonsSpacing*2);
    var button = new TextButtonShaped(shapeRectRounded, txt(value), size, 
        colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
        colorMapMatrix(`rgba(173,83,19,1)#rgba(222,90,0,1)#rgba(222,90,0,1)#rgba(200,200,47,0.5)`));
    button.isSwitcher = true; button.initactivity = filterDefault[value];
    eval(`button.onclick = () => {filterDefault['${value}'] = true; lsSaveObject('filterDefault', filterDefault); filterPrecount.request()}`);
    eval(`button.ondeact = () => {filterDefault['${value}'] = false; lsSaveObject('filterDefault', filterDefault); filterPrecount.request()}`);
    return button
};
//
let seasonButtons = {
    seasonSpring: generateAnotherButton('seasonSpring'),
    seasonSummer: generateAnotherButton('seasonSummer'),
    seasonFall: generateAnotherButton('seasonFall'),
    seasonWinter: generateAnotherButton('seasonWinter'),
    seasonUndefined: generateAnotherButton('seasonUndefined'),
};
let typeButtons = {
    typeTV: generateAnotherButton('typeTV'),
    typeMovie: generateAnotherButton('typeMovie'),
    typeONA: generateAnotherButton('typeONA'),
    typeOVA: generateAnotherButton('typeOVA'),
    typeSpecial: generateAnotherButton('typeSpecial'),
    typeUnknown: generateAnotherButton('typeUnknown'),
};
let statusButtons = {
    statusFinished: generateAnotherButton('statusFinished'),
    statusOngoing: generateAnotherButton('statusOngoing'),
    statusUpcoming: generateAnotherButton('statusUpcoming'),
    statusUnknown: generateAnotherButton('statusUnknown'),
};
//
filterPromptSize = new Vector2(150, 40);
filterThreeSize = new Vector2(200, 50);
let filterSwitchPalette = `rgba(220,63,63,1)#rgba(220,220,63,1)#rgba(63,220,63,1)#rgba(220,220,63,0.3)`;
//
let buttonFilterYearMin = new TextButtonShaped(shapeRectRounded, filterDefault['yearMin'], filterPromptSize,
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(32,128,128,1)#rgba(48,180,180,1)#rgba(64,255,255,1)#rgba(200,200,47,0.1)`));
buttonFilterYearMin.onclick = () => {
    playSound(sound['prompt']);
    filterDefault['yearMin'] = promptNumber(`${txt('promIntLess')} ${filterDefault['yearMax']}.`, 0, filterDefault['yearMax']-1, filterDefault['yearMin']); 
    filterPrecount.request();
    lsSaveObject('filterDefault', filterDefault)};
let buttonFilterYearMax = new TextButtonShaped(shapeRectRounded, filterDefault['yearMax'], filterPromptSize,
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(32,128,128,1)#rgba(48,180,180,1)#rgba(64,255,255,1)#rgba(200,200,47,0.1)`));
buttonFilterYearMax.onclick = () => {
    playSound(sound['prompt']);
    filterDefault['yearMax'] = promptNumber(`${txt('promIntOver')} ${filterDefault['yearMin']}.`, filterDefault['yearMin']+1, 2099, filterDefault['yearMax']); 
    filterPrecount.request();
    lsSaveObject('filterDefault', filterDefault)};
let buttonFilterEpsMin = new TextButtonShaped(shapeRectRounded, filterDefault['episodeMin'], filterPromptSize,
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(32,128,128,1)#rgba(48,180,180,1)#rgba(64,255,255,1)#rgba(200,200,47,0.1)`));
buttonFilterEpsMin.onclick = () => {
    playSound(sound['prompt']);
    filterDefault['episodeMin'] = promptNumber(`${txt('promIntLess')} ${filterDefault['episodeMax']}.`, 1, filterDefault['episodeMax']-1, filterDefault['episodeMin']); 
    filterPrecount.request();
    lsSaveObject('filterDefault', filterDefault)};
let buttonFilterEpsMax = new TextButtonShaped(shapeRectRounded, filterDefault['episodeMax'], filterPromptSize,
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(32,128,128,1)#rgba(48,180,180,1)#rgba(64,255,255,1)#rgba(200,200,47,0.1)`));
buttonFilterEpsMax.onclick = () => {
    playSound(sound['prompt']);
    filterDefault['episodeMax'] = promptNumber(`${txt('promIntOver')} ${filterDefault['episodeMin']}.`, filterDefault['episodeMin']+1, 9999, filterDefault['episodeMax']); 
    filterPrecount.request();
    lsSaveObject('filterDefault', filterDefault)};
// score allow
let buttonScoreAllow = new TextButtonShaped(shapeRectRounded, '', filterPromptSize,
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(filterSwitchPalette)
);
buttonScoreAllow.isSwitcher = true; buttonScoreAllow.needshadow = false; buttonScoreAllow.height = 0;
buttonScoreAllow.onclick = () => {filterDefault['scoreAllow'] = true; lsSaveObject('filterDefault', filterDefault); filterPrecount.request()}; 
buttonScoreAllow.ondeact = () => {filterDefault['scoreAllow'] = false; lsSaveObject('filterDefault', filterDefault); filterPrecount.request()};
// score
let buttonFilterScoreMin = new TextButtonShaped(shapeRectRounded, filterDefault['scoreMin'], filterPromptSize,
colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
colorMapMatrix(`rgba(32,128,128,1)#rgba(48,180,180,1)#rgba(64,255,255,1)#rgba(200,200,47,0.1)`));
buttonFilterScoreMin.onclick = () => {
    playSound(sound['prompt']);
    filterDefault['scoreMin'] = floatNumber(promptNumber(`${txt('promFloatLess')} ${filterDefault['scoreMax']}.`, 0, floatNumber(filterDefault['scoreMax']-0.1, 1), filterDefault['scoreMin']), 1);
    filterPrecount.request();
    lsSaveObject('filterDefault', filterDefault)
};
let buttonFilterScoreMax = new TextButtonShaped(shapeRectRounded, filterDefault['scoreMax'], filterPromptSize,
colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
colorMapMatrix(`rgba(32,128,128,1)#rgba(48,180,180,1)#rgba(64,255,255,1)#rgba(200,200,47,0.1)`));
buttonFilterScoreMax.onclick = () => {
    playSound(sound['prompt']);
    filterDefault['scoreMax'] = floatNumber(promptNumber(`${txt('promFloatOver')} ${filterDefault['scoreMin']}.`, floatNumber(filterDefault['scoreMin']+0.1, 1), 10, filterDefault['scoreMax']), 1);
    filterPrecount.request();
    lsSaveObject('filterDefault', filterDefault)
};
// filter attempts (это находится в стаффе префов)
// let buttonFilterAttempts = new ShapedSelectBar(new Vector2(250*1.5, 16), colorMatrix(prefBarPalette[0]), colorMatrix(prefBarPalette[1]));
// buttonFilterAttempts.onset = (value) => {var fa = Math.round(value); filterAttempts = fa; lsSaveValue('filterAttempts', fa)};
// rescale functions
function rescaleFilterButtons() {
    var measure, spacing;
    var spacing = filterButtonsSpacing * _scaleDynamic;
    ctx.textAlign = 'center';
    // preset
    scaleFontObject(presetButtonFont);
    for(var key in presetbase) {
        measure = ctx.measureText(presetbase[key].name);
        presetButtons[key].size = new Vector2(Math.floor(measure.width), measure.fontBoundingBoxAscent).sumxy(spacing*2)
    };
    // tags
    scaleFontObject(tagButtonsFont);
    for(var key in tagbase) {
        measure = ctx.measureText(tagbase[key].name);
        tagButtons[key].size = new Vector2(Math.floor(measure.width), measure.fontBoundingBoxAscent).sumxy(spacing*2)
    };
    // sts
    for(var key in seasonButtons) {rescaleAnotherButton(seasonButtons, key)};
    for(var key in typeButtons) {rescaleAnotherButton(typeButtons, key)};
    for(var key in statusButtons) {rescaleAnotherButton(statusButtons, key)};
    // prep*
    var s = [
        filterPromptSize.multxy(_scaleDynamic),
        filterThreeSize.multxy(_scaleDynamic),
        buttonAnimeStateSize.multxy(_scaleDynamic),
    ];
    // other
    buttonFilterYearMin.size = s[0];
    buttonFilterYearMax.size = s[0];
    buttonFilterEpsMin.size = s[0];
    buttonFilterEpsMax.size = s[0];
    buttonScoreAllow.size = s[0];
    buttonFilterScoreMin.size = s[0];
    buttonFilterScoreMax.size = s[0];
    buttonFilterAttempts.size = new Vector2(300, 16).multxy(_scaleDynamic);
    buttonFilterAttTags.size = s[0];
    // main
    buttonFilterLeave.size = s[1];
    buttonFilterApply.size = s[1];
    buttonFilterReset.size = s[1];
    buttonSwitchPreset.size = s[1];
    // header
    buttonAnimeBrowser.size = s[2];
    buttonAnimeEditor.size = s[2];
    buttonAnimeFilter.size = s[2];
    buttonAnimeArrays.size = s[2];
};
function rescaleAnotherButton(object, key) {
    var measure = ctx.measureText(txt(key));
    object[key].size = new Vector2(Math.floor(measure.width), measure.fontBoundingBoxAscent).sumxy(filterButtonsSpacing*_scaleDynamic*2);
};
//
function actualizeFilterButtons() {
    for(var key in seasonButtons) {seasonButtons[key].active = filterDefault[key]};
    for(var key in typeButtons) {typeButtons[key].active = filterDefault[key]};
    for(var key in statusButtons) {statusButtons[key].active = filterDefault[key]};
    //
    buttonFilterYearMin.text = filterDefault['yearMin'];
    buttonFilterYearMax.text = filterDefault['yearMax'];
    buttonFilterEpsMin.text = filterDefault['episodeMin'];
    buttonFilterEpsMax.text = filterDefault['episodeMax'];
    buttonFilterScoreMin.text = filterDefault['scoreMin'];
    buttonFilterScoreMax.text = filterDefault['scoreMax'];
    buttonScoreAllow.active = filterDefault['scoreAllow'];
    buttonFilterAttTags.active = filterAttemptTags;
};
//
let filterMainThreePal = `rgba(24,110,24,1)#rgba(40,160,40,1)#rgba(63,255,63,1)#rgba(200,200,47,0.1)`;
let buttonFilterLeave = new TextButtonShaped(shapeRectRounded, txt('wordBack'), filterThreeSize,
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(filterMainThreePal));
buttonFilterLeave.onclick = () => {requestScreen(screenRoulette, false)};
let buttonFilterApply = new TextButtonShaped(shapeRectRounded, txt('wordApply'), filterThreeSize,
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(filterMainThreePal));
buttonFilterApply.onclick = () => {animeFilterApply()};
let buttonFilterReset = new TextButtonShaped(shapeRectRounded, txt('wordReset'), filterThreeSize,
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(filterMainThreePal));
buttonFilterReset.onclick = () => {resetFilter(); filterPrecount.request(); tagSelectionPrepare(); lsSaveObject('tagSelection', tagSelection)};
//
let buttonSwitchPreset = new TextButtonShaped(shapeRectRounded, txt('filterApplyPreset'), new Vector2(300, 50),
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(filterMainThreePal));
buttonSwitchPreset.onclick = () => {presetSwitcher(); filterPrecount.request(); lsSaveObject('tagSelection', tagSelection)};
//
buttonFilterLeave.waitanim = false; buttonFilterLeave.needshadow = false;
buttonFilterApply.waitanim = false; buttonFilterApply.needshadow = false;
buttonFilterReset.waitanim = false; buttonFilterReset.needshadow = false;
//
function tagSelectionPrepare() {
    tagSelection = JSON.parse(tagSelectionString);
    //
    for(var t in filterDefault.tagsIncluded) {
        tagSelection[filterDefault.tagsIncluded[t]] = 'inc'
    };
    for(var t in filterDefault.tagsExcluded) {
        tagSelection[filterDefault.tagsExcluded[t]] = 'exc';
        tagButtons[filterDefault.tagsExcluded[t]].tap.set(_imagebuttonheight*_scaleDynamic-1)
    }
};
function tagSelectionParse(filter) {
    var tags = JSON.parse(tagSelectionString);
    //
    for(var t in filter.tagsIncluded) {
        tags[filter.tagsIncluded[t]] = 'inc'
    };
    for(var t in filter.tagsExcluded) {
        tags[filter.tagsExcluded[t]] = 'exc'
    };
    return tags
};
function animeFilterApply() {
    // сначала скормим выбранные тэги
    filterDefault.tagsIncluded = []; filterDefault.tagsExcluded = [];
    for(var t in tagSelection) {
        if(tagSelection[t] === 'inc') {filterDefault.tagsIncluded.push(t)};
        if(tagSelection[t] === 'exc') {filterDefault.tagsExcluded.push(t)}
    };
    // генерим фигню
    sload.state = 'loadstart';
    var anime = getListFiltered();
    var changes = 0;
    if(anime.length >= 1) {
        rouletteSetItems(randomItemsFrom(anime, pref.rouletteItems));
        changes = calcPresetChanges()
    } else {
        console.error(txt('filterFindNone'));
        filterDefault = JSON.parse(filterPresetOnly); tagSelectionPrepare(); 
        lsSaveObject('tagSelection', tagSelection);
        rouletteSetItems(randomItemsFrom(getListFiltered(), pref.rouletteItems));
    };
    tInfo.meta.usePreset = true;
    tInfo.meta.object = presetbase[presetSelected];
    tInfo.meta.changes = changes;
    lsSaveObject('tinfoMeta', tInfo.meta);
    lsSaveObject('filterDefault', filterDefault);
    localStorage.removeItem(savePrefix+'roulette.winner');
    // дебаг автопрокрутки после апплая
    roulette.pause(100);
    // переключаем экран
    sload.state = 'loadnew';
    requestScreen(screenLoading)
};
//
function animeArrayApply(array) {
    sload.state = 'loadstart';
    requestScreen(screenLoading);
    setTimeout(() => {
        rouletteSetItems(randomItemsFrom(array, pref.rouletteItemsMax));
        localStorage.removeItem(savePrefix+'roulette.winner');
        sload.state = 'loadnew'
    }, tss.fulltime * 1000);
};
function animeListApply(list) {
    tInfo.meta.usePreset = false;
    tInfo.meta.object = list;
    lsSaveObject('tinfoMeta', tInfo.meta);
    //
    sload.state = 'loadstart';
    requestScreen(screenLoading);
    setTimeout(() => {
        rouletteSetItems(list.getAnime(), false);
        localStorage.removeItem(savePrefix+'roulette.winner');
        sload.state = 'loadnew'
    }, tss.fulltime * 1000);
};
//
let changeableValues = [
    'NSFW', 'scoreAllow', 'scoreMin', 'scoreMax',
    'episodeMin', 'episodeMax', 'yearMin', 'yearMax',
    'statusFinished', 'statusOngoing', 'statusUpcoming', 'statusUnknown',
    'typeTV', 'typeMovie', 'typeONA', 'typeOVA', 'typeSpecial', 'typeUnknown',
    'seasonSpring', 'seasonSummer', 'seasonFall', 'seasonWinter', 'seasonUndefined',
];
function calcPresetChanges() {
    var changes = 0, p = JSON.parse(filterPresetOnly);
    // changeable
    for(var i = 0; i < changeableValues.length; i++) {
        if(filterDefault[changeableValues[i]] !== p[changeableValues[i]]) {changes++}
    };
    // tags
    var tagsp = tagSelectionParse(p), tagsf = tagSelectionParse(filterDefault);
    for(var key in tagsp) {
        if(tagsp[key] !== tagsf[key]) {changes++}
    };
    //
    return changes
};
// state buttons
let buttonAnimeStateSize = new Vector2(240, 35);
let buttonAnimeStateColor = `rgba(110,24,110,1)#rgba(160,40,160,1)#rgba(255,255,255,1)#rgba(200,50,200,0.8)`;
let buttonAnimeFilter = new TextButtonShaped(shapeRectRounded, txt('filterStateFilter'), buttonAnimeStateSize,
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(buttonAnimeStateColor));
let buttonAnimeBrowser = new TextButtonShaped(shapeRectRounded, txt('filterStateBrowser'), buttonAnimeStateSize,
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(buttonAnimeStateColor));
let buttonAnimeEditor = new TextButtonShaped(shapeRectRounded, txt('filterStateEditor'), buttonAnimeStateSize,
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(buttonAnimeStateColor));
let buttonAnimeArrays = new TextButtonShaped(shapeRectRounded, txt('filterStateArrays'), buttonAnimeStateSize,
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(buttonAnimeStateColor));
//
buttonAnimeFilter.onclick = () => {
    buttonAnimeBrowser.state = 'idle';
    buttonAnimeEditor.state = 'idle';
    buttonAnimeFilter.state = 'unaval';
    buttonAnimeArrays.state = 'idle';
    saf.state = 'filter'; saf.scroll.set(0)
};
buttonAnimeBrowser.onclick = () => {
    buttonAnimeBrowser.state = 'unaval';
    buttonAnimeEditor.state = 'idle';
    buttonAnimeFilter.state = 'idle';
    buttonAnimeArrays.state = 'idle';
    saf.state = 'browser'; saf.scroll.set(0)
};
buttonAnimeEditor.onclick = () => {
    buttonAnimeBrowser.state = 'idle';
    buttonAnimeEditor.state = 'unaval';
    buttonAnimeFilter.state = 'idle';
    buttonAnimeArrays.state = 'idle';
    saf.state = 'editor'; saf.scroll.set(0)
};
buttonAnimeArrays.onclick = () => {
    buttonAnimeBrowser.state = 'idle';
    buttonAnimeEditor.state = 'idle';
    buttonAnimeFilter.state = 'idle';
    buttonAnimeArrays.state = 'unaval';
    saf.state = 'arrays'; saf.scroll.set(0)
};
buttonAnimeFilter.state = 'unaval';
buttonAnimeBrowser.needshadow = buttonAnimeEditor.needshadow = 
buttonAnimeArrays.needshadow = buttonAnimeFilter.needshadow = false;
buttonAnimeBrowser.waitanim = buttonAnimeEditor.waitanim = 
buttonAnimeArrays.waitanim = buttonAnimeFilter.waitanim = false;
// filter tabs switcher
function filterTabSwitcher(posx, swidth, fbSpacing) {
    var pos = new Vector2(posx, fbSpacing);
    var width = (swidth - fbSpacing*3)/4;
    buttonAnimeFilter.pos.setv(pos.sumxy(fbSpacing, 0));
    buttonAnimeArrays.pos.setv(pos.sumxy(width + fbSpacing*2, 0));
    buttonAnimeEditor.pos.setv(pos.sumxy(width*2 + fbSpacing*3, 0));
    buttonAnimeBrowser.pos.setv(pos.sumxy(width*3 + fbSpacing*4, 0));
    buttonAnimeFilter.size.x = buttonAnimeArrays.size.x = buttonAnimeEditor.size.x = buttonAnimeBrowser.size.x = width;
    //
    ctx.textAlign = 'center';
    scaleFont(24, 'Segoe UI');
    buttonAnimeFilter.draw();
    buttonAnimeArrays.draw();
    buttonAnimeEditor.draw();
    buttonAnimeBrowser.draw();
};
// browser self buttons
let buttonBrowseTitles = new TextButtonShaped(shapeRectRounded, txt('filterBrowserFind'), buttonAnimeStateSize, 
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`), 
    colorMapMatrix(filterMainThreePal));
buttonBrowseTitles.onclick = () => {sDBs.find(String(prompt(txt('filterBrowserPrompt')), sDBs.string))};
buttonBrowseTitles.needshadow = false;
//
// @EAG SCREEN ANIME FILTER
//
let saf = {
    xanchor: 0,
    presetpos: {},
    tagpos: {},
    bgcolor: `rgba(0,0,0,${pref.bgalpha})`,
    selbox: '#0008',
    //
    width: 0,
    height: 0,
    scroll: new Vector1(0),
    sensivity: 100,
    //
    pointer: 0,
    pointer2: 0,
    pointer3: 0,
    precounter: 0,
    //
    head: 100,
    state: 'filter', // filter, arrays, editor, search
    edstate: 'list', // list, meta
}; 
//
function screenAnimeFilter() {
    // update
    saf.scroll.update();
    saf.bgcolor = `rgba(0,0,0,${pref.bgalpha})`;
    // scaling
    var sensivity = saf.sensivity * _scaleDynamic;
    var fbSpacing = filterButtonsSpacing * _scaleDynamic;
    var linew = 3*_scaleDynamic;
    // scrolling
    if(cvssize.y >= saf.height) {saf.scroll.set(0)}
    else {
        if(saf.scroll.get() < saf.height - cvssize.y && wheelState === 'btm') {
            saf.scroll.move(Math.floor(saf.scroll.getFixed())+sensivity, 0.5, easeOutExpo)}
        else if(saf.scroll.get() > 0 && wheelState === 'top') {
            saf.scroll.move(Math.floor(saf.scroll.getFixed())-sensivity, 0.5, easeOutExpo)};
        if(saf.scroll.get() < 0) {saf.scroll.set(0)};
        if(saf.scroll.get() > saf.height - cvssize.y) {saf.scroll.set(saf.height - cvssize.y)}
    };
    //
    saf.width = fullsize.y * 1.3 > fullsize.x ? fullsize.x : fullsize.y * 1.3;
    saf.xanchor = (cvssize.x - saf.width)/2 - fbSpacing + cvsxoffset;
    var header = buttonAnimeStateSize.y*2*_scaleDynamic + fbSpacing*3 + linew;
    fillRect(new Vector2(saf.width + fbSpacing*2, cvssize.y), new Vector2(saf.xanchor, 0), saf.bgcolor);
    // переключение менбшек
    filterTabSwitcher(saf.xanchor, saf.width, fbSpacing);
    // ебём режем
    ctx.fillStyle = '#fff';
    fillRectFast(new Vector2(saf.width, linew), new Vector2(saf.xanchor+fbSpacing, header-linew));
    // скрины
    if(saf.state == 'filter') {animeSStateFilter(header, fbSpacing, saf.width, saf.xanchor)} 
    else if(saf.state == 'editor') {animeSStateEditor(header, fbSpacing, saf.width, saf.xanchor)}
    else if(saf.state == 'browser') {animeSStateBrowser(header, fbSpacing, saf.width, saf.xanchor)} 
    else if(saf.state == 'arrays') {animeSStateArrays(header, fbSpacing, saf.width, saf.xanchor)};
    // убираем резку
    clipRestore()
};
function positionsWidthBox(array, width, spacing, height=0, scroll=0) {
    var pos = {}, size, px=0, py=height;
    for(var i in array) {
        size = array[i].size;
        if(px === 0) {
            pos[i] = new Vector2(px, py - scroll);
            px += size.x + spacing
        } else if(px + size.x <= width) {
            pos[i] = new Vector2(px, py - scroll);
            px += size.x + spacing
        } else {
            px = 0; py += size.y + spacing;
            pos[i] = new Vector2(px, py - scroll);
            px += size.x + spacing
        }
    };
    return [pos, py + size.y + spacing*2]
};
//
// @EAG ANIME - FILTER
//
function animeSStateFilter(header, fbSpacing, swidth, xanchor) {
    // свои кнопки
    var width = (swidth - fbSpacing*3)/4;
    var h = buttonAnimeStateSize.y * _scaleDynamic;
    var pos = new Vector2(xanchor, fbSpacing*2 + h);
    scaleFont(24, 'Segoe UI');
    buttonFilterLeave.pos.setv(pos.sumxy(fbSpacing, 0));
    buttonFilterApply.pos.setv(pos.sumxy(fbSpacing*2 + width, 0));
    buttonFilterReset.pos.setv(pos.sumxy(fbSpacing*3 + width*2, 0));
    buttonFilterLeave.size = buttonFilterApply.size = buttonFilterReset.size = new Vector2(width, h);
    buttonFilterLeave.draw(); buttonFilterApply.draw(); buttonFilterReset.draw();
    // подсчёт аниме
    filterPrecount.update();
    fillRectRounded(new Vector2(width, h), pos.sumxy(fbSpacing*4 + width*3, 0), saf.bgcolor, fbSpacing);
    ctx.fillStyle = '#fff';
    // scaleFontObject(titleCounterFont); ctx.textAlign = 'center';
    if(filterPrecount.flag || !filterPrecount.first) {fillRectRounded(new Vector2(width * Math.norma(filterPrecount.timeout*2), h), pos.sumxy(fbSpacing*4 + width*3, 0), `#0c05`, fbSpacing)}
    else {fillTextFast(pos.sumxy(fbSpacing*4 + width*3.5, h - fbSpacing), textStringLimit(String(filterPrecount.count), width))};
    // отрезаем
    clipCanvas(fullsize.minxy(0, header), new Vector2(cvsxoffset, header));
    saf.height = fbSpacing + header;
    actualizeFilterButtons();
    // заголовок пресетов
    fillRectRounded(new Vector2(saf.width, saf.pointer - saf.height), new Vector2(saf.xanchor+fbSpacing, saf.height - saf.scroll.get()), saf.selbox, 10);
    scaleFontObject(filterHeaderFont); ctx.textAlign = 'center';
    saf.height += sbTextHeader(txt('filterPresets'), new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get());
    scaleFont(16, filterHeaderFont.font);
    saf.height += sbTextFit(txt('filterAboutPresets'), new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get());
    saf.pointer = saf.height;
    // кнопки пресетов
    [saf.presetpos, saf.height] = positionsWidthBox(presetButtons, saf.width, fbSpacing, saf.height, saf.scroll.get());
    scaleFontObject(presetButtonFont);
    for(var b in presetButtons) {
        presetButtons[b].pos.setv(saf.presetpos[b].sumxy((cvssize.x - saf.width)/2 + cvsxoffset, fbSpacing));
        if(presetButtons[b].pos.y + presetButtons[b].size.y < 0) {continue};
        if(presetButtons[b].pos.y > cvssize.y) {continue};
        presetButtons[b].draw()
    };
    // применение пресета
    fillRectRounded(new Vector2(saf.width, saf.pointer2 - saf.height), new Vector2(saf.xanchor+fbSpacing, saf.height - saf.scroll.get()), saf.selbox, 10);
    scaleFont(20, filterHeaderFont.font);
    saf.height += sbTextFit(presetbase[newPresetSelected].getInfo(), new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get());
    scaleFont(28, 'Segoe UI Light', 'bold');
    saf.height += sbCenteredButton(buttonSwitchPreset, new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get());
    saf.pointer2 = saf.height;
    // заголовок тэгов
    scaleFontObject(filterHeaderFont); ctx.textAlign = 'center';
    sbBlockHint.text = txt('hintTags');
    saf.height += sbTextHeader(txt('filterTags'), new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get());
    // кнопки тэгов
    [saf.tagpos, saf.height] = positionsWidthBox(tagButtons, saf.width, fbSpacing*1.5, saf.height, saf.scroll.get());
    scaleFontObject(tagButtonsFont); ctx.textAlign = 'center';
    for(var b in tagButtons) {
        tagButtons[b].pos.setv(saf.tagpos[b].sumxy((cvssize.x - saf.width)/2 + cvsxoffset, fbSpacing));
        if(tagButtons[b].pos.y + tagButtons[b].size.y < 0) {continue};
        if(tagButtons[b].pos.y > cvssize.y) {continue};
        tagButtons[b].draw()
    };
    // заголовок штук
    scaleFontObject(filterHeaderFont);
    saf.height += sbTextHeader(txt('filterSTS'), new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get());
    // сезоны
    [saf.tagpos, saf.height] = positionsWidthBox(seasonButtons, saf.width, fbSpacing, saf.height, saf.scroll.get());
    scaleFontObject(tagButtonsFont);
    for(var b in seasonButtons) {
        seasonButtons[b].pos.setv(saf.tagpos[b].sumxy((cvssize.x - saf.width)/2 + cvsxoffset, fbSpacing));
        if(seasonButtons[b].pos.y + seasonButtons[b].size.y < 0) {continue};
        if(seasonButtons[b].pos.y > cvssize.y) {continue};
        seasonButtons[b].draw()
    };
    // типы
    [saf.tagpos, saf.height] = positionsWidthBox(typeButtons, saf.width, fbSpacing, saf.height, saf.scroll.get());
    for(var b in typeButtons) {
        typeButtons[b].pos.setv(saf.tagpos[b].sumxy((cvssize.x - saf.width)/2 + cvsxoffset, fbSpacing));
        if(typeButtons[b].pos.y + typeButtons[b].size.y < 0) {continue};
        if(typeButtons[b].pos.y > cvssize.y) {continue};
        typeButtons[b].draw()
    };
    // статусы
    [saf.tagpos, saf.height] = positionsWidthBox(statusButtons, saf.width, fbSpacing, saf.height, saf.scroll.get());
    for(var b in statusButtons) {
        statusButtons[b].pos.setv(saf.tagpos[b].sumxy((cvssize.x - saf.width)/2 + cvsxoffset, fbSpacing));
        if(statusButtons[b].pos.y + statusButtons[b].size.y < 0) {continue};
        if(statusButtons[b].pos.y > cvssize.y) {continue};
        statusButtons[b].draw()
    };
    // диапазоны
    scaleFontObject(filterHeaderFont);
    saf.height += sbTextHeader(txt('filterDiap'), new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get());
    // оценки года и серии
    scaleFont(24, 'Segoe UI Light');
    sbBlockHint.text = txt('hintAllowScore');
    saf.height += sbButtonPrefix(txt('filterScoreAllow'), buttonScoreAllow, new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get());
    saf.height += sbTwoButtonPrefix(txt('filterScore'), buttonFilterScoreMin, buttonFilterScoreMax, new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get());
    saf.height += sbTwoButtonPrefix(txt('filterYear'), buttonFilterYearMin, buttonFilterYearMax, new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get());
    saf.height += sbTwoButtonPrefix(txt('filterEps'), buttonFilterEpsMin, buttonFilterEpsMax, new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get());
    // аккуратность фильтрации
    buttonFilterAttempts.update(filterAttempts, filterAttRange.max);
    scaleFont(24, 'Segoe UI Light');
    fillRectRounded(new Vector2(saf.width, saf.pointer3 - saf.height), new Vector2(saf.xanchor+fbSpacing, saf.height - saf.scroll.get()), saf.selbox, 10);
    saf.height += fbSpacing;
    sbBlockHint.text = txt('hintAttempts');
    saf.height += sbSelectbarPrefix(txt('filterAttempts'), Math.round(buttonFilterAttempts.point()), buttonFilterAttempts, new Vector2(saf.xanchor+fbSpacing*2, saf.height), saf.width-fbSpacing*2, prefButtonSpacing*_scaleDynamic, saf.scroll.get());
    sbBlockHint.text = txt('hintAttTags');
    saf.height += sbButtonPrefix(txt('filterAttTags'), buttonFilterAttTags, new Vector2(saf.xanchor+fbSpacing*2, saf.height), saf.width-fbSpacing*2, prefButtonSpacing*_scaleDynamic, saf.scroll.get());
    saf.pointer3 = saf.height;
    // предупреждение перед применением
    saf.height += fbSpacing;
    scaleFont(16, 'Segoe UI Light'); ctx.textAlign = 'center';
    saf.height += sbTextFit(txt('filterWarn'), new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get(), '#f44')
    saf.height += fbSpacing;
};
//
// @EAG ANIME - BROWSER
//
let sDBs = {
    string: '',
    result: [],
    images: [],
    anime: [],
    //
    max: 50,
    pages: 1,
    current: 1,
    //
    find: (req, hard) => {
        if(req == '') {return};
        var res = searchByTitle(req, hard);
        if(!res) {return} else {
            sDBs.string = req;
            sDBs.result = [];
            for(var r in res) {
                sDBs.result[r] = res[r];
                sDBs.pages = Math.ceil(sDBs.result.length / sDBs.max);
            };
            sDBs.getPage(1)
        }
    },
    getPage: (number = 1) => {
        if(number > sDBs.pages || number < 0) {return};
        sDBs.current = number;
        sDBs.anime = [];
        sDBs.images = [];
        if(number == sDBs.pages) {
            for(var i = (number-1) * sDBs.max; i < sDBs.result.length; i++) {sDBs.drawing(i)}
        } else {
            for(var i = (number-1) * sDBs.max; i < number * sDBs.max; i++) {sDBs.drawing(i)}
        }
    },
    drawing: (id) => {
        sDBs.anime[id] = new AnimeItem(sDBs.result[id]);
        sDBs.images[id] = new Image();
        eval(`sDBs.images[id].onerror = () => {sDBs.images[${id}].src = 'images/notfound.png'}`);
        sDBs.images[id].src = sDBs.result[id].picture
    },
    controls: () => {
        return {
            max: sDBs.max,
            all: sDBs.result.length,
            current: sDBs.current,
            pages: sDBs.pages,
        }
    }
};
//
let browserPrevPage = new TextButtonShaped(shapeRectRounded, txt('browserPrev'), new Vector2(200,30),
    colorMapMatrix(`rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,1)`),
    colorMapMatrix(`rgba(32,128,128,1)#rgba(48,180,180,1)#rgba(64,255,255,1)#rgba(200,200,47,0.1)`));
browserPrevPage.waitanim = false; browserPrevPage.needshadow = false;
let browserNextPage = new TextButtonShaped(shapeRectRounded, txt('browserNext'), new Vector2(200,30),
    colorMapMatrix(`rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,1)`),
    colorMapMatrix(`rgba(32,128,128,1)#rgba(48,180,180,1)#rgba(64,255,255,1)#rgba(200,200,47,0.1)`));
browserNextPage.waitanim = false; browserNextPage.needshadow = false;
let browserPromptPage = new TextButtonShaped(shapeRectRounded, txt('browserEnter'), new Vector2(200,30),
    colorMapMatrix(`rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,1)`),
    colorMapMatrix(`rgba(32,128,128,1)#rgba(48,180,180,1)#rgba(64,255,255,1)#rgba(200,200,47,0.1)`));
browserPromptPage.waitanim = false; browserPromptPage.needshadow = false;
//
browserPrevPage.onclick = () => {sDBs.getPage(sDBs.current-1); saf.scroll.set(0)};
browserNextPage.onclick = () => {sDBs.getPage(sDBs.current+1); saf.scroll.set(0)};
browserPromptPage.onclick = () => {
    sDBs.getPage(promptNumber(txt('browserPage') + '...', 1, sDBs.pages, sDBs.current));
    saf.scroll.set(0)
};
//
//
let buttonBrowserAdd = new ShapedHoldButton(shapeRectRounded, new Vector2(120,30), 
    colorMapMatrix(`rgba(29,130,29,1)#rgba(40,160,40,1)#rgba(63,255,63,1)#rgba(47,200,47,0.3)`));
buttonBrowserAdd.bhvr = -1; buttonBrowserAdd.needshadow = false; buttonBrowserAdd.height = 0;
buttonBrowserAdd.onhover = () => {
    !edList.haveTitle(buttonBrowserAdd.bhvr) ? hoverHint.invoke(txt('browserAddNote')) : hoverHint.invoke(txt('browserAlreadyNote'))
};
buttonBrowserAdd.onact = () => {
    if(!edList.haveTitle(buttonBrowserAdd.bhvr)) {
        edList.addTitle(buttonBrowserAdd.bhvr);
        setTimeout(() => {buttonBrowserAdd.operate = false; buttonBrowserAdd.dtime=500}, 500)
    } else {
        buttonBrowserAdd.operate = false; buttonBrowserAdd.dtime=500
    }
};
buttonBrowserAdd.time = '500';
//
let _saf_browserheight = 0;
function animeSStateBrowser(header, fbSpacing, swidth, xanchor) {
    // свои кнопки
    var width = (swidth - fbSpacing*3)/4;
    var h = buttonAnimeStateSize.y * _scaleDynamic;
    var pos = new Vector2(xanchor, fbSpacing*2 + h);
    scaleFont(24, 'Segoe UI');
    buttonFilterLeave.pos.setv(pos.sumxy(fbSpacing, 0));
    buttonBrowseTitles.pos.setv(pos.sumxy(fbSpacing*4 + width*3, 0))
    buttonBrowseTitles.size = buttonFilterLeave.size = new Vector2(width, h);
    buttonFilterLeave.draw();
    buttonBrowseTitles.draw();
    // отрезаем
    clipCanvas(fullsize.minxy(0, header), new Vector2(cvsxoffset, header));
    saf.height = fbSpacing + header;
    // count n пагес
    scaleFont(18, 'Segoe UI');
    if(sDBs.string != '') {
        sDBs.result.length > 0
        ? saf.height += sbTextFit(sDBs.result.length + txt('browserResultCount') + sDBs.string, new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get())
        : saf.height += sbTextFit(txt('browserNoResult') + sDBs.string, new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get());
        saf.height += fbSpacing
    };
    if(sDBs.pages > 1 && saf.scroll.get() < _saf_browserheight/2) {
        saf.height += sbPageManager(sDBs.controls(), [browserPrevPage, browserPromptPage, browserNextPage], new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get());
    };
    // анимехи (бляъ)
    if(sDBs.anime.length !== 0) {
        for(var a in sDBs.anime) {
            saf.height += sbBrowserItem(sDBs.anime[a], sDBs.images[a], new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get())
        }
    };
    // опять пагес
    if(sDBs.pages > 1 && saf.scroll.get() > _saf_browserheight/2) {
        saf.height += sbPageManager(sDBs.controls(), [browserPrevPage, browserPromptPage, browserNextPage], new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get())
    };
    //
    _saf_browserheight = saf.height;
};
//
// @EAG ANIME - EDITOR
//
let edList = {
    edited: new animeList(),
    images: {},
    anime: {},
    //
    getRoulette: () => {
        edList.edited = new animeList('Roulette #'+Math.floor(Math.random()*10000000));
        edList.edited.compressArray(roulette.anime);
        edList.getMeta()
    },
    getMeta: () => {
        edList.images = {};
        edList.anime = {};
        for(var a in edList.edited.list) {
            edList.getMetaSingle(edList.edited.list[a])
        };
    },
    getMetaSingle: (dbid) => {
        // image
        edList.images[dbid] = new Image();
        eval(`edList.images[dbid].onerror = () => {edList.images[${dbid}].src = 'images/notfound.png'}`);
        edList.images[dbid].src = adb[dbid].picture;
        // anime item
        edList.anime[dbid] = new AnimeItem(adb[dbid])
    },
    //
    setRoulette: () => {
        if(edList.edited.list.length > 0) {
            animeListApply(edList.edited)
        }
    },
    //
    getTitle: (id) => {
        return [edList.anime[edList.edited.list[id]], edList.images[edList.edited.list[id]]]
    },
    addTitle: (dbid) => {
        var res = edList.edited.newEntry(dbid);
        if(res) {edList.getMetaSingle(dbid); return true} else {return false}
    },
    deleteTitle: (dbid) => {
        edList.edited.deleteEntry(dbid);
        delete edList.anime[dbid];
        delete edList.images[dbid];
    },
    haveTitle: (dbid) => {
        for(var t in edList.edited.list) {
            if(edList.edited.list[t] == dbid) {return true}
        };
        return false
    },
    //
    clear: (conf = true) => {
        if(conf) {
            if(confirm(txt('editorListClear'))) {
                edList.edited = new animeList();
                edList.images = {};
                edList.anime = {}
            }
        } else {
            edList.edited = new animeList();
            edList.images = {};
            edList.anime = {}
        }
    },
    downloadJSON: () => {
        if(edList.edited.list.length > 0) {
            var file = {
                data: JSON.parse(JSON.stringify(edList.edited)),
                anime: optimizeAnimeArray(edList.edited.getAnime())
            };
            delete file.data.list;
            fileManager.downloadJSON(edList.edited.name, file)
        } else {
            alert(txt('editorDownloadEmpty'))
        }
    },
    uploadJSON: () => {
        fileManager.uploadJSON();
        fileManager.onupload = () => {
            var file = JSON.parse(JSON.stringify(fileManager.result));
            // проверяем, список ли это вообще
            if(file.anime === undefined) {return};
            if(file.anime[0] === undefined) {return};
            if(file.data === undefined) {return};
            // если список пуст, ниче не делаем дальше
            if(file.anime.length == 0) {alert(txt('editorUploadEmpty')); return};
            // проверяем совместимость, предупреждаем
            var list = new animeList();
            list.parse(JSON.stringify(file.data));
            var compat = list.compatibility(), compConf = true;
            if(!compat.adb || !compat.app) {
                var compConf = confirm(`${txt('editorCompatibilityWarn_1')}\n|\n${compat.adb?'':txt('wordDatabase')+': '+list.compat.adb+' -> '+adb_information.lastUpdate}${compat.app?'':'\n'+txt('wordApp')+': '+list.compat.app+' -> '+$appInfo.version}\n|\n${txt('editorCompatibilityWarn_2')}`);
            };
            if(!compConf) {return} else {
                // конфирмация, если лист не пустой, он будет перезаписан
                var conf = true;
                if(edList.edited.list.length > 0) {conf = confirm(txt('editorUploadOverwrite'))};
            };
            if(!conf) {return} else {
                // применяем, хуле
                edList.clear(false);
                edList.edited.parse(JSON.stringify(file.data));
                // если была несовместимость с датабазой, удаляем дбид и ищем тайтлы по названию
                if(!compat.adb) {
                    for(var a in file.anime) {
                        if(file.anime[a].dbid !== undefined) {delete file.anime[a].dbid}
                    }
                };
                edList.edited.compressArray(file.anime);
                edList.getMeta();
            }
        }
    },
};
//
let buttonEditorDelete = new ShapedHoldButton(shapeRectRounded, new Vector2(120,30), 
    colorMapMatrix(`rgba(130,29,29,1)#rgba(160,40,40,1)#rgba(255,63,63,1)#rgba(47,47,200,0.3)`));
buttonEditorDelete.bhvr = -1; buttonEditorDelete.needshadow = false; buttonEditorDelete.height = 0;
buttonEditorDelete.onhover = () => {
    if(buttonEditorDelete.bhvr != null) {
        hoverHint.invoke(txt('editorDeleteNote'))
    } else {hoverHint.invoke(txt('editorErrorDBID'))}
};
buttonEditorDelete.onact = () => {
    if(buttonEditorDelete.bhvr != null) {edList.deleteTitle(buttonEditorDelete.bhvr)};
    setTimeout(() => {buttonEditorDelete.operate = false; buttonEditorDelete.dtime=500}, 500)
};
buttonEditorDelete.time = '500';
//
let buttonEditorApply = new TextButtonShaped(shapeRectRounded, txt('wordApply'), new Vector2(500,40),
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(filterMainThreePal));
buttonEditorApply.needshadow = false; buttonEditorApply.waitanim = false;
buttonEditorApply.onclick = () => {edList.setRoulette()};
buttonEditorApply.onhover = () => {
    if(edList.edited.list.length == 0) {hoverHint.invoke(txt('editorApplyEmpty'), '#f94')}
};
let buttonEditorClaimRoll = new TextButtonShaped(shapeRectRounded, txt('editorClaimRoulette'), new Vector2(500,40),
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(filterMainThreePal));
buttonEditorClaimRoll.needshadow = false; buttonEditorClaimRoll.waitanim = false;
buttonEditorClaimRoll.onhover = () => {
    roulette.anime.length > 0 ? hoverHint.invoke(txt('hintClaimRoulette')) : hoverHint.invoke(txt('eagEmpty'))
};
buttonEditorClaimRoll.onclick = () => {if(roulette.anime.length > 0) {
    var conf = true; if(edList.edited.list.length > 0) {conf = confirm(txt('editorUploadOverwrite'))};
    if(conf) {edList.edited.compressArray(roulette.anime); edList.getMeta()}
}};
//
let buttonEditorDownloadSize = new Vector2(200,32);
let buttonEditorDownload = new TextButtonShaped(shapeRectRounded, txt('editorDownloadJSON'), new Vector2(500,40),
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(32,128,128,1)#rgba(48,180,180,1)#rgba(64,255,255,1)#rgba(200,200,47,0.1)`));
buttonEditorDownload.needshadow = false; buttonEditorDownload.waitanim = false;
let buttonEditorUpload = new TextButtonShaped(shapeRectRounded, txt('editorUploadJSON'), new Vector2(500,40),
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(32,128,128,1)#rgba(48,180,180,1)#rgba(64,255,255,1)#rgba(200,200,47,0.1)`));
buttonEditorUpload.needshadow = false; buttonEditorUpload.waitanim = false;
buttonEditorDownload.onhover = () => {
    if(edList.edited.list.length == 0) {hoverHint.invoke(txt('editorDownloadEmpty'), '#f94')}
};
buttonEditorDownload.onclick = () => {if(edList.edited.list.length > 0) {edList.downloadJSON()}};
buttonEditorUpload.onclick = () => {edList.uploadJSON()};
//
function animeSStateEditor(header, fbSpacing, swidth, xanchor) {
    // свои кнопки
    var width = (swidth - fbSpacing*3)/4;
    var h = buttonAnimeStateSize.y * _scaleDynamic;
    var pos = new Vector2(xanchor, fbSpacing*2 + h);
    scaleFont(24, 'Segoe UI');
    buttonFilterLeave.pos.setv(pos.sumxy(fbSpacing, 0));
    buttonEditorApply.pos.setv(pos.sumxy(fbSpacing*2 + width, 0));
    buttonEditorClaimRoll.pos.setv(pos.sumxy(fbSpacing*3 + width*2, 0));
    buttonEditorClaimRoll.size = buttonEditorApply.size = buttonFilterLeave.size = new Vector2(width, h);
    buttonFilterLeave.draw(); buttonEditorApply.draw(); buttonEditorClaimRoll.draw();
    // отрезаем
    clipCanvas(fullsize.minxy(0, header), new Vector2(cvsxoffset, header));
    saf.height = fbSpacing + header;
    // стейт списка
    if(saf.edstate == 'list') {
        // json d+u
        scaleFont(18, 'Segoe UI');
        buttonEditorDownload.size = buttonEditorUpload.size = buttonEditorDownloadSize.multxy(_scaleDynamic);
        saf.height += sbTwoButtonPrefix(txt('editorJSON'), buttonEditorDownload, buttonEditorUpload, new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get());
        // анимехи (бляъ 2)
        if(edList.edited.list.length !== 0) {
            for(var a in edList.edited.list) {
                saf.height += sbEditorItem(edList.getTitle(a), new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get())
            }
        }
    // стейт метаданных
    } else {
        
    }
};
//
// @EAG ANIME - ARRAYS
// 
function animeSStateArrays(header, fbSpacing, swidth, xanchor) {
    var size = imageWIPSize.multxy(_scaleDynamic/2);
    drawImageSized(imageWorkInProgress, new Vector2(xanchor + fbSpacing*2, cvssize.y - size.y), size);
    scaleFont(28, 'Consolas'); 
    ctx.fillStyle = '#fbb'; ctx.textAlign = 'end';
    fillTextFast(new Vector2(xanchor + swidth - fbSpacing*2, cvssize.y - fbSpacing), 'Work In Progress!!!')
};
//
// @EAG STUFF PREFERENCES
//
let prefButtonSpacing = 5;
let prefButtonHeight = 32;
let prefLangButtons = new Vector2(40, 30);
let prefBarHeight = 16;
let prefOptionWidth = 250;
// base
let imagePrefApply = invokeNewImage('images/apply.png');
let imagePrefDefault = invokeNewImage('images/recycle.png');
let imageAyayaConfused = invokeNewImage('images/confused.png');
// tabs
let imagesPrefTabs = {
    main: invokeNewImage('images/pref_main.png'),
    audio: invokeNewImage('images/pref_audio.png'),
    draw: invokeNewImage('images/pref_draw.png'),
    other: invokeNewImage('images/pref_other.png'),
    about: invokeNewImage('images/pref_about.png'),
};
let prefTabsColors = {
    main: new Color(250,201,25,1),
    audio: new Color(30,30,200,1),
    draw: new Color(200,30,200,1),
    other: new Color(200,30,30,1),
    about: new Color(220,220,220,1),
};
// header buttons
let buttonPrefApply = new ImageButtonShaped(shapeRectRounded, imagePrefApply, new Vector2(prefButtonSpacing), 
    colorMapMatrix(`rgba(24,110,24,0)#rgba(40,160,40,0.35)#rgba(63,255,63,1)#rgba(47,200,47,0.8)`));
buttonPrefApply.onclick = () => {requestScreen(screenRoulette, false)};
buttonPrefApply.waitanim = false; buttonPrefApply.needshadow = false;
// tab buttons
let buttonPrefTabMain = new ImageButtonShaped(shapeRectRounded, imagesPrefTabs.main, new Vector2(prefButtonSpacing),
    colorMapMatrix(`rgba(250,201,25,0)#rgba(250,201,25,0.35)#rgba(250,201,25,1)#rgba(250,201,25,0.8)`));
buttonPrefTabMain.waitanim = false; buttonPrefTabMain.needshadow = false;
let buttonPrefTabAudio = new ImageButtonShaped(shapeRectRounded, imagesPrefTabs.audio, new Vector2(prefButtonSpacing),
    colorMapMatrix(`rgba(30,30,200,0)#rgba(30,30,200,0.35)#rgba(30,30,200,1)#rgba(30,30,200,0.8)`));
buttonPrefTabAudio.waitanim = false; buttonPrefTabAudio.needshadow = false;
let buttonPrefTabDraw = new ImageButtonShaped(shapeRectRounded, imagesPrefTabs.draw, new Vector2(prefButtonSpacing),
    colorMapMatrix(`rgba(200,30,200,0)#rgba(200,30,200,0.35)#rgba(200,30,200,1)#rgba(200,30,200,0.8)`));
buttonPrefTabDraw.waitanim = false; buttonPrefTabDraw.needshadow = false;
let buttonPrefTabOther = new ImageButtonShaped(shapeRectRounded, imagesPrefTabs.other, new Vector2(prefButtonSpacing),
    colorMapMatrix(`rgba(200,30,30,0)#rgba(200,30,30,0.35)#rgba(200,30,30,1)#rgba(200,30,30,0.8)`));
buttonPrefTabOther.waitanim = false; buttonPrefTabOther.needshadow = false;
let buttonPrefTabAbout = new ImageButtonShaped(shapeRectRounded, imagesPrefTabs.about, new Vector2(prefButtonSpacing),
    colorMapMatrix(`rgba(220,220,220,0)#rgba(220,220,220,0.35)#rgba(220,220,220,1)#rgba(220,220,220,0.8)`));
buttonPrefTabAbout.waitanim = false; buttonPrefTabAbout.needshadow = false;
// tab click events
function prefOnAllTabs() {
    buttonPrefTabMain.state = buttonPrefTabAudio.state = buttonPrefTabDraw.state 
    = buttonPrefTabOther.state = buttonPrefTabAbout.state = 'idle';
    spref.line.set(255,255,255,1); spref.scroll.reset(); mouse.click = false;
};
buttonPrefTabMain.state = 'unaval';
//
buttonPrefTabMain.onclick = () => {prefOnAllTabs(); buttonPrefTabMain.state = 'unaval'; spref.tab = 'main'; spref.line.fadeTo(prefTabsColors.main, 0.5)};
buttonPrefTabAudio.onclick = () => {prefOnAllTabs(); buttonPrefTabAudio.state = 'unaval'; spref.tab = 'audio'; spref.line.fadeTo(prefTabsColors.audio, 0.5)};
buttonPrefTabDraw.onclick = () => {prefOnAllTabs(); buttonPrefTabDraw.state = 'unaval'; spref.tab = 'draw'; spref.line.fadeTo(prefTabsColors.draw, 0.5)};
buttonPrefTabOther.onclick = () => {prefOnAllTabs(); buttonPrefTabOther.state = 'unaval'; spref.tab = 'other'; spref.line.fadeTo(prefTabsColors.other, 0.5)};
buttonPrefTabAbout.onclick = () => {prefOnAllTabs(); buttonPrefTabAbout.state = 'unaval'; spref.tab = 'about'; spref.line.fadeTo(prefTabsColors.about, 0.5)};
// colors
let prefTextPalette = `rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`;
let prefPromptPalette = `rgba(32,128,128,1)#rgba(48,180,180,1)#rgba(64,255,255,1)#rgba(200,200,47,0.1)`;
let prefBarPalette = [`rgba(220,48,220,0.8)`, `rgba(127,24,127,0.3)`];
let prefSwitchPalette = `rgba(220,63,63,1)#rgba(220,220,63,1)#rgba(63,220,63,1)#rgba(220,220,63,0.3)`;
// лангуагес ёбн рот
let imgFlagEnglish = invokeNewImage(`images/flag_en.jpg`);
let buttonLangEnglish = new ImageButtonShaped(shapeRectRounded, imgFlagEnglish, new Vector2(0), 
    colorMapMatrix(`rgba(0,0,0,0)#rgba(0,0,0,0)#rgba(0,0,0,0)#rgba(0,0,0,0)`));
buttonLangEnglish.waitanim = false; buttonLangEnglish.height = 0;
buttonLangEnglish.onclick = () => {prefSetValue('language', 'en'); langSelected = 'en'};
buttonLangEnglish.onhover = () => {hoverHint.invoke(allTranslations.en.comment)};
//
let imgFlagRussian = invokeNewImage(`images/flag_ru.jpg`);
let buttonLangRussian = new ImageButtonShaped(shapeRectRounded, imgFlagRussian, new Vector2(0), 
    colorMapMatrix(`rgba(0,0,0,0)#rgba(0,0,0,0)#rgba(0,0,0,0)#rgba(0,0,0,0)`));
buttonLangRussian.waitanim = false; buttonLangRussian.height = 0;
buttonLangRussian.onclick = () => {prefSetValue('language', 'ru'); langSelected = 'ru'};
buttonLangRussian.onhover = () => {hoverHint.invoke(allTranslations.ru.comment)};
//
let prefLanguages = [
    buttonLangEnglish, buttonLangRussian
];
// roulette
let prefRouletteTime = new ShapedSelectBar(new Vector2(prefOptionWidth*1.5, prefBarHeight), colorMatrix(prefBarPalette[0]), colorMatrix(prefBarPalette[1]));
let prefRouletteSpeed = new ShapedSelectBar(new Vector2(prefOptionWidth*1.5, prefBarHeight), colorMatrix(prefBarPalette[0]), colorMatrix(prefBarPalette[1]));
let prefRouletteTitles = new ShapedSelectBar(new Vector2(prefOptionWidth*1.5, prefBarHeight), colorMatrix(prefBarPalette[0]), colorMatrix(prefBarPalette[1]));
let prefRouletteImages = new ShapedSelectBar(new Vector2(prefOptionWidth*1.5, prefBarHeight), colorMatrix(prefBarPalette[0]), colorMatrix(prefBarPalette[1]));
prefRouletteTime.onset = (value) => {prefSetValue('rollTime', 5 + Math.round(value))};
prefRouletteSpeed.onset = (value) => {prefSetValue('rollSpeed', 10 + Math.round(value))};
prefRouletteTitles.onset = (value) => {prefSetValue('rouletteItems', 20 + Math.round(value))};
prefRouletteImages.onset = (value) => {prefSetValue('rollImages', 7 + Math.round(value)*2)};
prefRouletteImages.visAlias = true;
let prefRouletteScroll = new TextButtonShaped(shapeRectRounded, '', new Vector2(prefOptionWidth/2, prefButtonHeight), colorMapMatrix(prefTextPalette), colorMapMatrix(prefSwitchPalette));
let prefRouletteMap = new TextButtonShaped(shapeRectRounded, '', new Vector2(prefOptionWidth/2, prefButtonHeight), colorMapMatrix(prefTextPalette), colorMapMatrix(prefSwitchPalette));
let prefRouletteNSFW = new TextButtonShaped(shapeRectRounded, '', new Vector2(prefOptionWidth/2, prefButtonHeight), colorMapMatrix(prefTextPalette), colorMapMatrix(prefSwitchPalette));
prefRouletteScroll.isSwitcher = true; prefRouletteMap.isSwitcher = true; prefRouletteNSFW.isSwitcher = true;
prefRouletteScroll.needshadow = false; prefRouletteMap.needshadow = false; prefRouletteNSFW.needshadow = false;
prefRouletteScroll.height = 0; prefRouletteMap.height = 0; prefRouletteNSFW.height = 0;
prefRouletteScroll.onclick = () => {prefSetValue('autoScroll', true)}; prefRouletteScroll.ondeact = () => {prefSetValue('autoScroll', false)};
prefRouletteMap.onclick = () => {prefSetValue('showMap', true)}; prefRouletteMap.ondeact = () => {prefSetValue('showMap', false)};
prefRouletteNSFW.onclick = () => {prefSetValue('showNSFW', true)}; prefRouletteNSFW.ondeact = () => {prefSetValue('showNSFW', false)};
//
function actualPrefRoulette() {
    prefRouletteTime.update(pref['rollTime'] - 5, 195);
    prefRouletteSpeed.update(pref['rollSpeed'] - 10, 90);
    prefRouletteTitles.update(pref['rouletteItems'] - 20, pref.rouletteItemsMax-20);
    prefRouletteImages.update((pref['rollImages'] - 7)/2, 10);
    prefRouletteScroll.active = pref.autoScroll;
    prefRouletteMap.active = pref.showMap;
    prefRouletteNSFW.active = pref.showNSFW;
};
// audio
let prefAudioSound = new ShapedSelectBar(new Vector2(prefOptionWidth*1.5, prefBarHeight), colorMatrix(prefBarPalette[0]), colorMatrix(prefBarPalette[1]));
let prefAudioBG = new ShapedSelectBar(new Vector2(prefOptionWidth*1.5, prefBarHeight), colorMatrix(prefBarPalette[0]), colorMatrix(prefBarPalette[1]));
let prefAudioRoll = new ShapedSelectBar(new Vector2(prefOptionWidth*1.5, prefBarHeight), colorMatrix(prefBarPalette[0]), colorMatrix(prefBarPalette[1]));
prefAudioSound.onset = (value) => {prefSetValue('sound', Math.round(value))};
prefAudioBG.onset = (value) => {prefSetValue('bgmusic', Math.round(value))}; prefAudioBG.permanent = true;
prefAudioRoll.onset = (value) => {prefSetValue('rollmusic', Math.round(value))};
let prefAudioShowPlayer = new TextButtonShaped(shapeRectRounded, '', new Vector2(prefOptionWidth/2, prefButtonHeight), colorMapMatrix(prefTextPalette), colorMapMatrix(prefSwitchPalette));
let prefAudioNewTrack = new TextButtonShaped(shapeRectRounded, '', new Vector2(prefOptionWidth/2, prefButtonHeight), colorMapMatrix(prefTextPalette), colorMapMatrix(prefSwitchPalette));
let prefAudioClips = new TextButtonShaped(shapeRectRounded, '', new Vector2(prefOptionWidth/2, prefButtonHeight), colorMapMatrix(prefTextPalette), colorMapMatrix(prefSwitchPalette));
prefAudioShowPlayer.isSwitcher = true; prefAudioNewTrack.isSwitcher = true; prefAudioClips.isSwitcher = true;
prefAudioShowPlayer.needshadow = false; prefAudioNewTrack.needshadow = false; prefAudioClips.needshadow = false;
prefAudioShowPlayer.height = 0; prefAudioNewTrack.height = 0; prefAudioClips.height = 0;
prefAudioShowPlayer.onclick = () => {prefSetValue('playerShow', true)}; prefAudioShowPlayer.ondeact = () => {prefSetValue('playerShow', false)};
prefAudioNewTrack.onclick = () => {prefSetValue('rollNewTrack', true)}; prefAudioNewTrack.ondeact = () => {prefSetValue('rollNewTrack', false)};
prefAudioClips.onclick = () => {prefSetValue('playClip', true)}; prefAudioClips.ondeact = () => {prefSetValue('playClip', false)};
//
function actualPrefAudio() {
    prefAudioSound.update(pref['sound'], 100);
    prefAudioBG.update(pref['bgmusic'], 100);
    prefAudioRoll .update(pref['rollmusic'], 100);
    prefAudioShowPlayer.active = pref.playerShow;
    prefAudioNewTrack.active = pref.rollNewTrack;
    prefAudioClips.active = pref.playClip
};
// render
let prefRenderText = [txt('pstDisable'), txt('pstLow'), txt('pstMedium'), txt('pstHigh')];
let prefRenderFps = new ShapedSelectBar(new Vector2(prefOptionWidth*1.5, prefBarHeight), colorMatrix(prefBarPalette[0]), colorMatrix(prefBarPalette[1]));
let prefRenderBack = new ShapedSelectBar(new Vector2(prefOptionWidth*1.5, prefBarHeight), colorMatrix(prefBarPalette[0]), colorMatrix(prefBarPalette[1]));
let prefRenderQuality = new ShapedSelectBar(new Vector2(prefOptionWidth*1.5, prefBarHeight), colorMatrix(prefBarPalette[0]), colorMatrix(prefBarPalette[1]));
let prefRenderScale = new ShapedSelectBar(new Vector2(prefOptionWidth*1.5, prefBarHeight), colorMatrix(prefBarPalette[0]), colorMatrix(prefBarPalette[1]));
prefRenderQuality.visAlias = true;
prefRenderFps.onset = (value) => {if(pref.lockfps) {prefSetValue('framerate', 30 + Math.round(value)*5); lockFpsSwitch(pref.framerate)}};
prefRenderBack.onset = (value) => {prefSetValue('bgalpha', Math.round(value)/100)}; prefRenderBack.permanent = true; 
prefRenderQuality.onset = (value) => {setRenderQuality(Math.round(value))};
prefRenderScale.onset = (value) => {setTimeout(() => {cvsscale.move(floatNumber(value+0.5), 0.25, easeOutCirc); globalRescale()}, 250)};
let prefRenderLockFps = new TextButtonShaped(shapeRectRounded, '', new Vector2(prefOptionWidth/2, prefButtonHeight), colorMapMatrix(prefTextPalette), colorMapMatrix(prefSwitchPalette));
let prefRenderShowFps = new TextButtonShaped(shapeRectRounded, '', new Vector2(prefOptionWidth/2, prefButtonHeight), colorMapMatrix(prefTextPalette), colorMapMatrix(prefSwitchPalette));
let prefRenderDevInfo = new TextButtonShaped(shapeRectRounded, '', new Vector2(prefOptionWidth/2, prefButtonHeight), colorMapMatrix(prefTextPalette), colorMapMatrix(prefSwitchPalette));
prefRenderLockFps.isSwitcher = true; prefRenderLockFps.height = 0; prefRenderLockFps.needshadow = false;
prefRenderShowFps.isSwitcher = true; prefRenderShowFps.height = 0; prefRenderShowFps.needshadow = false;
prefRenderDevInfo.isSwitcher = true; prefRenderDevInfo.height = 0; prefRenderDevInfo.needshadow = false;
prefRenderLockFps.onclick = () => {lockFpsSwitch(pref.framerate)}; prefRenderLockFps.ondeact = () => {lockFpsSwitch()};
prefRenderShowFps.onclick = () => {prefSetValue('showFPS', true)}; prefRenderShowFps.ondeact = () => {prefSetValue('showFPS', false)};
prefRenderDevInfo.onclick = () => {prefSetValue('showDebugInfo', true)}; prefRenderDevInfo.ondeact = () => {prefSetValue('showDebugInfo', false)};
let prefRenderWallpaper = new TextButtonShaped(shapeRectRounded, txt('pstChange'), new Vector2(prefOptionWidth, prefButtonHeight*1.2), colorMapMatrix(prefTextPalette), colorMapMatrix(prefPromptPalette));
let prefRenderParallax = new TextButtonShaped(shapeRectRounded, '', new Vector2(prefOptionWidth/2, prefButtonHeight), colorMapMatrix(prefTextPalette), colorMapMatrix(prefSwitchPalette));
prefRenderWallpaper.onclick = () => {setWallpaper(prompt(txt('filterWallpaper'), wallpaper.src))};
prefRenderParallax.isSwitcher = true; prefRenderParallax.height = 0; prefRenderParallax.needshadow = false;
prefRenderParallax.onclick = () => {prefSetValue('parallax', true)}; prefRenderParallax.ondeact = () => {prefSetValue('parallax', false)};
let prefRenderVisual = new TextButtonShaped(shapeRectRounded, '', new Vector2(prefOptionWidth/2, prefButtonHeight), colorMapMatrix(prefTextPalette), colorMapMatrix(prefSwitchPalette));
prefRenderVisual.onclick = prefVisualSwitch; prefRenderVisual.ondeact = prefVisualSwitch;
prefRenderVisual.isSwitcher = true; prefRenderVisual.height = 0; prefRenderVisual.needshadow = false;
// rescale
let prefButtonSizes = [
    new Vector2(prefOptionWidth*1.5, prefBarHeight),
    new Vector2(prefOptionWidth/2, prefButtonHeight),
    new Vector2(prefOptionWidth, prefButtonHeight*1.2)
];
// reset
let buttonPrefDefault = new ShapedHoldButton(shapeRectRounded, new Vector2(prefOptionWidth/2, prefButtonHeight), 
    colorMapMatrix(`rgba(110,24,24,1)#rgba(160,40,40,1)#rgba(255,63,63,1)#rgba(47,47,200,0.3)`));
buttonPrefDefault.onact = () => {
    pref = JSON.parse(prefDefault); 
    pref.lockfps ? lockFpsSwitch(pref.framerate) : lockFpsSwitch();
    for(var k in localStorage) {
        if(k.indexOf('eagsv_pref.') !== -1) {delete localStorage[k]}
    };
    setTimeout(() => {buttonPrefDefault.unblock()}, 500)
};
let buttonResetStorage = new ShapedHoldButton(shapeRectRounded, new Vector2(prefOptionWidth/2, prefButtonHeight), 
colorMapMatrix(`rgba(110,24,24,1)#rgba(160,40,40,1)#rgba(255,63,63,1)#rgba(47,47,200,0.3)`));
buttonResetStorage.onact = () => {localStorage.clear(); setTimeout(() => {buttonResetStorage.unblock()}, 500)};
function prefButtonsRescale() {
    // prepare*
    var s = [
        prefButtonSizes[0].multxy(_scaleDynamic),
        prefButtonSizes[1].multxy(_scaleDynamic),
        prefButtonSizes[2].multxy(_scaleDynamic),
    ];
    // roll
    prefRouletteTime.size = s[0];
    prefRouletteSpeed.size = s[0];
    prefRouletteTitles.size = s[0];
    prefRouletteImages.size = s[0];
    prefRouletteScroll.size = s[1];
    prefRouletteMap.size = s[1];
    prefRouletteNSFW.size = s[1];
    // audio
    prefAudioSound.size = s[0];
    prefAudioBG.size = s[0];
    prefAudioRoll.size = s[0];
    prefAudioShowPlayer.size = s[1];
    prefAudioNewTrack.size = s[1];
    prefAudioClips.size = s[1];
    // render
    prefRenderFps.size = s[0];
    prefRenderBack.size = s[0];
    prefRenderQuality.size = s[0];
    prefRenderScale.size = s[0];
    prefRenderLockFps.size = s[1];
    prefRenderWallpaper.size = s[2];
    prefRenderParallax.size = s[1];
    // other
    prefRenderVisual.size = s[1];
    prefRenderShowFps.size = s[1];
    prefRenderDevInfo.size = s[1];
    buttonPrefDefault.size = s[1];
    buttonResetStorage.size = s[1];
};
//
function actualPrefRender() {
    prefRenderFps.update((pref.framerate - 30)/5, 34);
    prefRenderBack.update(pref.bgalpha*100, 100);
    prefRenderScale.update(_scaleDynamic-0.5, 3.5);
    if(!pref.imageSmoothing) {
        prefRenderQuality.update(0, 3)
    } else {
        if(pref.imageQuality === 'low') {
            prefRenderQuality.update(1, 3)
        } else if(pref.imageQuality === 'medium') {
            prefRenderQuality.update(2, 3)
        } else {
            prefRenderQuality.update(3, 3)
        }
    };
    prefRenderLockFps.active = pref.lockfps;
    prefRenderParallax.active = pref.parallax;
    prefRenderShowFps.active = pref.showFPS;
    prefRenderDevInfo.active = pref.showDebugInfo;
    prefRenderVisual.active = pref.visual;
};
// filter attempts
let buttonFilterAttempts = new ShapedSelectBar(prefButtonSizes[0], colorMatrix(prefBarPalette[0]), colorMatrix(prefBarPalette[1]));
buttonFilterAttempts.onset = (value) => {var fa = Math.round(value); filterAttempts = fa; lsSaveValue('filterAttempts', fa); filterPrecount.request()};
buttonFilterAttempts.visAlias = true;
let buttonFilterAttTags = new TextButtonShaped(shapeRectRounded, '', new Vector2(prefOptionWidth/2, prefButtonHeight), colorMapMatrix(prefTextPalette), colorMapMatrix(prefSwitchPalette));
buttonFilterAttTags.isSwitcher = true; buttonFilterAttTags.needshadow = false; buttonFilterAttTags.height = 0;
buttonFilterAttTags.onclick = () => {filterAttemptTags = true; lsSaveValue('filterAttemptTags', true); filterPrecount.request()};
buttonFilterAttTags.ondeact = () => {filterAttemptTags = false; lsSaveValue('filterAttemptTags', false); filterPrecount.request()};
//
function setRenderQuality(value) {
    if(value === 0) {
        prefSetValue('imageSmoothing', false)
    } else {
        prefSetValue('imageSmoothing', true);
        if(value === 1) {
            prefSetValue('imageQuality', 'low')
        } else if(value === 2) {
            prefSetValue('imageQuality', 'medium')
        } else {
            prefSetValue('imageQuality', 'high')
        }
    }
};
// some titles
_preftitles.jikan = {
    name: 'Source of additional information from the MyAnimeList website',
    object: 'Jikan API (Unofficial MyAnimeList API)',
    url: 'https://jikan.moe/',
};
_preftitles.translator = {
    name: 'Translator',
    object: 'Microsoft Text Translator (via restapi.com)',
    url: 'https://rapidapi.com/blog/microsoft-text-translation-api-tutorial/'
};
_preftitles.author = {
    name: 'Author', object: $appInfo.author, url: 'https://t.me/potapell0'
};
_preftitles.version = {
    name: 'Version', object: $appInfo.version, url: false
};
_preftitles.update = {
    name: 'Update', object: $appInfo.date, url: false
};
_preftitles.license = {
    name: 'License', object: $appInfo.license, url: $appInfo.licenseURL
};
//
// @EAG SCREEN PREFERENCES
//
let spref = {
    xanchor: 0,
    bgcolor: `rgba(0,0,0,${pref.bgalpha})`,
    selbox: '#0008',
    //
    width: 0,
    height: 0,
    scroll: new Vector1(0),
    sensivity: 100,
    head: 60,
    //
    pointer: 0,
    tab: 'main', // main, audio, draw, other, about
    line: new Color(200, 150, 30, 1),
    //
    text: {
    },
}; 
//
function screenPreferences() {
    // update
    spref.scroll.update();
    spref.bgcolor = `rgba(0,0,0,${pref.bgalpha})`;
    // scale
    var sensivity = spref.sensivity * _scaleDynamic;
    var spacing = prefButtonSpacing * _scaleDynamic;
    var bheight = prefButtonHeight * _scaleDynamic;
    var head = spref.head * _scaleDynamic;
    // scrolling
    if(cvssize.y >= spref.height) {spref.scroll.set(0)}
    else {
        if(spref.scroll.get() < spref.height - cvssize.y && wheelState === 'btm') {
            spref.scroll.move(Math.floor(spref.scroll.getFixed())+sensivity, 0.5, easeOutExpo)} 
        else if(spref.scroll.get() > 0 && wheelState === 'top') {
            spref.scroll.move(Math.floor(spref.scroll.getFixed())-sensivity, 0.5, easeOutExpo)};
        if(spref.scroll.get() < 0) {spref.scroll.set(0)};
        if(spref.scroll.get() > spref.height - cvssize.y) {spref.scroll.set(spref.height - cvssize.y)}
    };
    // start
    spref.height = head + 3 * _scaleDynamic + spacing*2;
    spref.width = fullsize.y * 1.3 > fullsize.x ? fullsize.x : fullsize.y * 1.3;
    spref.xanchor = (cvssize.x - spref.width)/2 + cvsxoffset;
    // ayaya & bg
    if(spref.tab == 'about') {
        var ayayasize = new Vector2(imageAyayaConfused.naturalWidth, imageAyayaConfused.naturalHeight).multxy(0.33 * _scaleDynamic);
        drawImageSized(imageAyayaConfused, new Vector2((spref.width + spref.xanchor + spacing*2) - ayayasize.x, fullsize.y-ayayasize.y), ayayasize);
    };
    fillRect(new Vector2(spref.width + spacing*2, cvssize.y), new Vector2(spref.xanchor, 0), spref.bgcolor);
    // header
    ctx.fillStyle = spref.bgcolor;
    fillRectFast(new Vector2(spref.width+spacing*2, head), new Vector2(spref.xanchor, 0));
    scaleFont(50, 'Segoe UI', 'bold'); ctx.fillStyle = '#fff'; ctx.textAlign = 'start';
    fillTextFast(new Vector2(spref.xanchor + bheight*2, head - spacing*2), txt('prefHead'));
    buttonPrefApply.sizedZoom(new Vector2(head-spacing*2));
    buttonPrefApply.pos.setxy(spacing+spref.xanchor, spacing);
    buttonPrefApply.draw();
    // tab buttons
    buttonPrefTabMain.sizedZoom(new Vector2(head-spacing*2));
    buttonPrefTabAudio.sizedZoom(new Vector2(head-spacing*2));
    buttonPrefTabDraw.sizedZoom(new Vector2(head-spacing*2));
    buttonPrefTabOther.sizedZoom(new Vector2(head-spacing*2));
    buttonPrefTabAbout.sizedZoom(new Vector2(head-spacing*2));
    buttonPrefTabAbout.pos.setxy((spref.xanchor+spref.width) - bheight*1.75, spacing);
    buttonPrefTabOther.pos.setxy((spref.xanchor+spref.width) - bheight*3.5, spacing);
    buttonPrefTabDraw.pos.setxy((spref.xanchor+spref.width) - bheight*5.25, spacing);
    buttonPrefTabAudio.pos.setxy((spref.xanchor+spref.width) - bheight*7, spacing);
    buttonPrefTabMain.pos.setxy((spref.xanchor+spref.width) - bheight*8.75, spacing);
    buttonPrefTabMain.draw(); buttonPrefTabAudio.draw(); buttonPrefTabDraw.draw(); buttonPrefTabOther.draw(); buttonPrefTabAbout.draw();
    // clip
    spref.line.update();
    ctx.fillStyle = spref.line.getColor();
    fillRectFast(new Vector2(spref.width+spacing*2, 3*_scaleDynamic), new Vector2(spref.xanchor, head));
    clipCanvas(fullsize.minxy(0, head+3*_scaleDynamic), new Vector2(0, head+3*_scaleDynamic));
    // ГЛАВНОЕ
    if(spref.tab === 'main') {
        // ЯЗЫК
        scaleFont(40, 'Segoe UI', 'bold'); ctx.textAlign = 'center';
        spref.height += spacing + sbTextHeader(txt('prefLanguage'), new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        scaleFont(24, 'Segoe UI'); ctx.textAlign = 'start';
        sbVoidPrefix(allTranslations.head(), new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get())
        for(var elem in prefLanguages) {
            prefLanguages[elem].pos.setxy(spref.xanchor+spref.width - (spacing*2 + prefLangButtons.x) * Number(+elem+1) + spacing, spref.height+spacing - spref.scroll.get());
            prefLanguages[elem].sizedZoom(prefLangButtons.multxy(_scaleDynamic));
            prefLanguages[elem].draw()
        };
        spref.height += prefLangButtons.y + spacing*2;
        // НАСТРОЙКИ РУЛЕТКИ
        actualPrefRoulette();
        scaleFont(40, 'Segoe UI', 'bold'); ctx.textAlign = 'center';
        sbBlockHint.text = txt('hintRoll');
        spref.height += sbTextHeader(txt('prefRoll'), new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        scaleFont(24, 'Segoe UI'); ctx.textAlign = 'start';
        spref.height += sbSelectbarPrefix(txt('prefRTime'), Math.round(prefRouletteTime.point())+5, prefRouletteTime, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += sbSelectbarPrefix(txt('prefRSpeed'), Math.round(prefRouletteSpeed.point())+10, prefRouletteSpeed, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        sbBlockHint.text = txt('hintTitleMax');
        spref.height += sbSelectbarPrefix(txt('prefRTitle'), Math.round(prefRouletteTitles.point())+20, prefRouletteTitles, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += sbSelectbarPrefix(txt('prefROnscreen'), Math.round(prefRouletteImages.point())*2+7, prefRouletteImages, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        sbBlockHint.text = txt('hintAutoScroll');
        spref.height += sbButtonPrefix(txt('prefRAuto'), prefRouletteScroll, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
    // НАСТРОЙКИ АУДИО
    } else if(spref.tab === 'audio') {
        actualPrefAudio();
        scaleFont(40, 'Segoe UI', 'bold'); ctx.textAlign = 'center';
        sbBlockHint.text = txt('hintAudio');
        spref.height += sbTextHeader(txt('prefAudio'), new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        scaleFont(24, 'Segoe UI'); ctx.textAlign = 'start';
        spref.height += sbSelectbarPrefix(txt('prefASound'), Math.round(prefAudioSound.point()), prefAudioSound, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        sbBlockHint.text = txt('hintMusicOff');
        spref.height += sbSelectbarPrefix(txt('prefABG'), Math.round(prefAudioBG.point()), prefAudioBG, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += sbSelectbarPrefix(txt('prefARoll'), Math.round(prefAudioRoll.point()), prefAudioRoll, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        sbBlockHint.text = txt('hintNewTrack');
        spref.height += sbButtonPrefix(txt('prefANew'), prefAudioNewTrack, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += sbButtonPrefix(txt('prefAShow'), prefAudioShowPlayer, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        sbBlockHint.text = txt('hintAudioVisual');
        spref.height += sbButtonPrefix(txt('prefVisual'), prefRenderVisual, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
    // НАСТРОЙКИ ОТРИСОВКИ
    } else if(spref.tab === 'draw') {
        actualPrefRender();
        scaleFont(40, 'Segoe UI', 'bold'); ctx.textAlign = 'center';
        spref.height += sbTextHeader(txt('prefRender'), new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        scaleFont(24, 'Segoe UI'); ctx.textAlign = 'start';
        spref.height += sbButtonPrefix(txt('prefRLimit'), prefRenderLockFps, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        ctx.textAlign = 'start';
        spref.height += sbSelectbarPrefix(txt('prefRFPS'), Math.round(prefRenderFps.point())*5 + 30, prefRenderFps, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += sbSelectbarPrefix(txt('prefRSmooth'), prefRenderText[Math.round(prefRenderQuality.pointer*3)], prefRenderQuality, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += sbSelectbarPrefix(txt('prefRShadow'), Math.round(prefRenderBack.point())/100, prefRenderBack, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        sbBlockHint.text = txt('hintPrefScale');
        spref.height += sbSelectbarPrefix(txt('prefScaleSet'), `x`+floatNumber(_scaleDynamic, 1), prefRenderScale, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        sbBlockHint.text = txt('hintBackgroundURL') + wallpaper.src;
        spref.height += sbButtonPrefix(textStringLimit(txt('prefRBG') + wallpaper.src, spref.width - (prefOptionWidth*_scaleDynamic + spacing*2)), prefRenderWallpaper, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += _imagebuttonheight;
        sbBlockHint.text = txt('hintParallax');
        spref.height += sbButtonPrefix(txt('prefParallax'), prefRenderParallax, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
    // ДРУГИЕ ПРИКОЛЫ
    } else if(spref.tab === 'other') {
        actualPrefRender();
        scaleFont(40, 'Segoe UI', 'bold'); ctx.textAlign = 'center';
        spref.height += sbTextHeader(txt('prefOthers'), new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        scaleFont(24, 'Segoe UI'); ctx.textAlign = 'start';
        spref.height += sbButtonPrefix(txt('prefShowFPS'), prefRenderShowFps, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += sbButtonPrefix(txt('prefDevinfo'), prefRenderDevInfo, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        sbBlockHint.text = txt('hintAllowNSFW');
        spref.height += sbButtonPrefix(txt('prefRNSFW'), prefRouletteNSFW, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        sbBlockHint.text = txt('hintAudioClips');
        spref.height += sbButtonPrefix(txt('prefPlayClip'), prefAudioClips, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        scaleFont(40, 'Segoe UI', 'bold'); ctx.textAlign = 'center';
        spref.height += sbTextHeader(txt('prefRecovery'), new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        scaleFont(24, 'Segoe UI'); ctx.textAlign = 'start';
        sbBlockHint.text = txt('hintPrefReset');
        spref.height += sbButtonPrefix(txt('prefResetDefault'), buttonPrefDefault, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        sbBlockHint.text = txt('hintResetStorage');
        spref.height += sbButtonPrefix(txt('prefResetStorage'), buttonResetStorage, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
    // О ПРОГРАММЕ
    } else {
        // scaleFont(40, 'Segoe UI', 'bold'); ctx.textAlign = 'center';
        // spref.height += sbTextHeader(txt('prefAbout'), new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += spacing*3;
        // о проге
        scaleFont(32, 'Segoe UI', 'bold');
        spref.height += sbTextHeader($appInfo.fullname, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        scaleFont(18, 'Segoe UI Light');
        spref.height += sbTitleObject(_preftitles.author, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += sbTitleObject(_preftitles.version, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += sbTitleObject(_preftitles.update, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += sbTitleObject(_preftitles.license, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += spacing*2;
        ctx.textAlign = 'center';
        spref.height += sbTextFit(txt('eagAbout'), new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += sbTextFit(txt('eagBased'), new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        // о датабазе
        spref.height += spacing*2;
        scaleFont(32, 'Segoe UI', 'bold');
        spref.height += sbTextHeader(txt('wordDatabase'), new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        scaleFont(18, 'Segoe UI Light');
        spref.height += sbTitleObject(_preftitles.adb, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += sbTitleObject(_preftitles.adb_author, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += sbTitleObject(_preftitles.adb_version, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += sbTitleObject(_preftitles.adb_license, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        // об остальном
        spref.height += spacing*2;
        scaleFont(32, 'Segoe UI', 'bold');
        spref.height += sbTextHeader('API', new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        scaleFont(18, 'Segoe UI Light');
        spref.height += sbTitleObject(_preftitles.jikan, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += sbTitleObject(_preftitles.translator, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        //
        spref.height += spacing*3;
        scaleFont(20, 'Segoe UI', 'bold');
        spref.height += sbTextHeader(txt('eagThanks'), new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += spacing;
    };
    //
    clipRestore();
};  
//
// @EAG SCREEN TRANSITION
//
let tss = {
    state: 'end',
    fulltime: 1,
    color: '#000',
    progress: new Vector1(0),
    alpha: new Vector1(0),
    waitfunc: () => {},
    screen: () => {},
};
//
function transitionScreen() {
    ctx.fillStyle = tss.color;
    if(tss.state === 'openhide') {
        playSound(sound['screen']);
        //
        tss.alpha.set(0);
        tss.alpha.move(1, tss.fulltime/2, easeInQuint);
        tss.progress.move(1, tss.fulltime/2, easeInQuint);
        //
        tss.waitfunc = () => {
            ctx.fillRect(0, fullsize.y * (1 - tss.progress.get()), fullsize.x, fullsize.y * tss.progress.get());
            if(tss.progress.get() >= 1) {
                activeScreen = tss.screen;
                tss.state = 'openshow'
            }
        };
        tss.state = 'wait'
    //
    } else if(tss.state === 'openshow') {
        tss.alpha.move(0, tss.fulltime/2, easeOutQuint);
        tss.progress.move(0, tss.fulltime/2, easeOutQuint);
        ctx.fillRect(0, 0, fullsize.x, fullsize.y);
        //
        tss.waitfunc = () => {
            ctx.fillRect(0, 0, fullsize.x, fullsize.y * tss.progress.get());
            if(tss.progress.get() <= 0) {
                tss.screen = () => {};
                tss.state = 'end'
            }
        };
        tss.state = 'wait'

    //
    } else if(tss.state === 'closehide') {
        playSound(sound['screen']);
        //
        tss.alpha.set(0);
        tss.alpha.move(1, tss.fulltime/2, easeInQuint);
        tss.progress.move(1, tss.fulltime/2, easeInQuint);
        //
        tss.waitfunc = () => {
            ctx.fillRect(0, 0, fullsize.x, fullsize.y * tss.progress.get());
            if(tss.progress.get() >= 1) {
                activeScreen = tss.screen;
                tss.state = 'closeshow'
            }
        };
        tss.state = 'wait'
    //
    } else if(tss.state === 'closeshow') {
        tss.alpha.move(0, tss.fulltime/2, easeOutQuint);
        tss.progress.move(0, tss.fulltime/2, easeOutQuint);
        ctx.fillRect(0, 0, fullsize.x, fullsize.y);
        //
        tss.waitfunc = () => {
            ctx.fillRect(0, fullsize.y * (1 - tss.progress.get()), fullsize.x, fullsize.y * tss.progress.get());
            if(tss.progress.get() <= 0) {
                tss.screen = () => {};
                tss.state = 'end'
            }
        };
        tss.state = 'wait'
    //
    } else if(tss.state === 'wait') {
        tss.alpha.update();
        tss.progress.update();
        ctx.globalAlpha = tss.alpha.get();
        tss.waitfunc();
        ctx.globalAlpha = 1
    }
};
//
function requestScreen(screen, open=true) {
    tss.screen = screen;
    open ? tss.state = 'openhide' : tss.state = 'closehide'
};
//
// @EAG WINNER ANIMATION
//
let rollWinner = {
    state: 'none',
    //
    bg: new Color(0,0,0,0),
    text: new Color(0,220,0,0),
    blink: new Vector1(0),
    zoom: new Vector1(1),
    anchor: new Vector2(0.5),
    //
    waiter: 1,
    str: [],
    font: 'Segoe UI',
    fsize: 60,
    //
    effvec: new Vector1(0),
    effect: () => {
        var style = ctx.createLinearGradient(0, 0, cvssize.x, cvssize.y);
        const p = rollWinner.effvec.get();
        const s = 0.2;
        style.addColorStop(0, 'rgba(0,220,0,1)');
        //
        style.addColorStop(0.001+Math.norma(0.998*p-s), 'rgba(0,220,0,1)');
        style.addColorStop(0.001+Math.norma(0.998*p-s/2), '#ffff');
        style.addColorStop(0.001+0.998*p, 'rgba(0,220,0,1)');
        //
        style.addColorStop(1, 'rgba(0,220,0,1)');
        return style
    },
    //
    invoke: (name) => {
        if(rollWinner.state === 'none') {
            scaleFont(rollWinner.fsize, rollWinner.font, 'bold');
            rollWinner.str = textWidthFit(String(name).toLocaleUpperCase(), cvssize.x*0.9, 10*_scaleDynamic);
            rollWinner.waiter = 1 + (rollWinner.str[0].length-1) * 0.75;
            rollWinner.state = 'dark';
            rollWinner.bg = new Color(0,0,0,0);
            rollWinner.text = new Color(0,220,0,0);
            rollWinner.text.ease = easeInQuad;
            rollWinner.blink = new Vector1(0);
            rollWinner.zoom = new Vector1(20);
            rollWinner.effvec = new Vector1(0);
        }
    },
    //
    draw: () => {
        if(rollWinner.state !== 'none') {
            // update
            rollWinner.bg.update();
            rollWinner.text.update();
            rollWinner.blink.update();
            rollWinner.zoom.update();
            rollWinner.effvec.update();
            // draw
            fillRect(fullsize, new Vector2(), rollWinner.bg.getColor());
            ctx.fillStyle = rollWinner.text.getColor();
            ctx.textAlign = 'center';
            ctx.letterSpacing = `${rollWinner.zoom.get()}px`;
            const spacing = 10*_scaleDynamic;
            const [fit, fitsize] = rollWinner.str;
            const pos = normalAlign(rollWinner.anchor, fitsize.sumxy(0, spacing*fit.length).multxy(1, fit.length));
            scaleFont(rollWinner.fsize * rollWinner.zoom.get(), rollWinner.font, 'bold');
            fillTextArray(pos, rollWinner.str, 5 * _scaleDynamic);
            ctx.letterSpacing = '0px';
            //
            if(rollWinner.state === 'dark') {
                rollWinner.bg.fadeTo(new Color(0,0,0,0.5), 0.5);
                rollWinner.text.fadeTo(new Color(0,220,0,1), 1);
                rollWinner.zoom.move(1, 0.5, easeOutExpo);
                rollWinner.state = 'wait';
                setTimeout(() => {rollWinner.state = 'blink'}, 1000);
            //
            } else if(rollWinner.state === 'blink'){
                rollWinner.state = 'wait';
                playSound(sound['winner']);
                rollWinner.text.getColor = rollWinner.effect;
                rollWinner.effvec.move(1, rollWinner.waiter, easeInOutSine);
                setTimeout(() => {rollWinner.state = 'hide'}, rollWinner.waiter*1000);
            //
            } else if(rollWinner.state === 'hide') {
                rollWinner.text = new Color(0,220,0,1);
                rollWinner.text.ease = easeOutCirc;
                rollWinner.text.fadeTo(new Color(0,220,0,0), 0.5);
                rollWinner.bg.fadeTo(new Color(0,0,0,0), 0.5);
                rollWinner.state = 'wait';
                visual.lightDiam.move(fitFrameSize.y*1.6, 1, easeOutCirc)
                setTimeout(() => {
                    rollWinner.state = 'none'
                }, 1100)
            }
        }
    },
};
//
// @EAG VISUAL EFFECTS
//
let winnerLightRing = invokeNewImage('images/light.png');
// с новой годой, с новой снегой, это к НГ крч эффект снега
let novyigodSanta = invokeNewImage('images/chibi_santa.png');
let novyigodElka = invokeNewImage('images/christmas_tree.png');
let noviygodSize = new Vector2(160);
let noviygodOffset = new Vector2(200, 0);
//
let snowflake = {
    image: invokeNewImage('images/snowflake.png'),
    depth: new Range(0.3, 1),
    sizeMax: 40,
    velX: new Range(-40, 40),
    velY: new Range(40, 150),
    rotate: new Range(-180, 180),
    flow: new Range(0.15, 0.4),
    flowX: new Range(50, 150),
    //
    count: 200,
    array: [],
};
class Snowflake {
    constructor() {
        this.pos = fullsize.multxy(Math.random(), -Math.random()).minxy(snowflake.sizeMax);
        var depth = Math.random()*(snowflake.depth.max-snowflake.depth.min)+snowflake.depth.min;
        this.depth = depth;
        this.size = new Vector2(snowflake.sizeMax * depth);
        this.velocity = new Vector2();
        this.velocity.x = (snowflake.velX.max-snowflake.velX.min)*Math.random()+snowflake.velX.min;
        this.velocity.y = (snowflake.velY.max-snowflake.velY.min)*Math.random()+snowflake.velY.min;
        this.alpha = 0.5 + 0.5*depth;
        this.rotate = Math.random()*360;
        this.rotatespeed = Math.random()*(snowflake.rotate.max-snowflake.rotate.min)+snowflake.rotate.min;
        this.parallax = new Vector2();
        this.flow = 2*Math.random();
        this.flowspeed = Math.random()*(snowflake.flow.max-snowflake.flow.min)+snowflake.flow.min;
        this.flowX = Math.random()*(snowflake.flowX.max-snowflake.flowX.min)+snowflake.flowX.min;
        this.wave = 0;
    }
    draw() {
        // flow (такого замороченного снега нет нигде нихуя, агада)
        var dt = deltaTime/1000;
        if(this.flow >= 2) {this.flow = 0} else {this.flow += this.flowspeed*dt};
        this.wave = Math.sin(Math.PI*this.flow) * this.flowX;
        // parallax
        if(pref.parallax) {
            this.parallax.setv(parallaxOffset.multxy(this.depth - (snowflake.depth.max+snowflake.depth.min)/2))
        };
        // transform
        this.pos = this.pos.sumv(this.velocity.multxy(dt*_scaleDynamic)).sumxy(-roulette.speed.get()/1.5, 0);
        this.rotate += this.rotatespeed*dt;
        this.rotate >= 360 ? this.rotate -= 360 : this.rotate < 0 ? this.rotate += 360 : null;
        // draw
        setRotation(this.pos.sumxy(this.wave, 0), this.rotate);
        ctx.globalAlpha = this.alpha;
        drawImageSized(snowflake.image, this.pos.sumxy(this.wave, 0).minv(this.size.multxy(_scaleDynamic/2)).sumv(this.parallax), this.size.multxy(_scaleDynamic));
        ctx.globalAlpha = 1;
        ctx.resetTransform();
    }
    getPos() {return this.pos.sumxy(this.wave, 0).minv(this.size.multxy(_scaleDynamic/2)).sumv(this.parallax)}
};
let resetSnowflakes = () => {snowflake.array=[];for(let i=0; i<snowflake.count; i++) {snowflake.array[i] = new Snowflake()}};
function novyigodSnowflakes() {
    // приколы
    if(firstMouseEvent) {
        noviygodOffset.update();
        var ngsize = noviygodSize.multxy(_scaleDynamic);
        drawImageSized(novyigodSanta, new Vector2(-noviygodOffset.get().x, fullsize.y-ngsize.y), ngsize);
        drawImageSized(novyigodElka, new Vector2(fullsize.x-ngsize.x+noviygodOffset.get().x, fullsize.y-ngsize.y), ngsize)
    } else {
        noviygodOffset.movexy(0, 0, 1.5, easeOutCirc)
    };
    // снежинки
    var sfs = snowflake.sizeMax * _scaleDynamic, sfp = new Vector2();
    if(snowflake.image.complete) {
        for(var sf in snowflake.array) {
            snowflake.array[sf].draw();
            sfp = snowflake.array[sf].getPos();
            // bottom portal
            if(sfp.y - sfs > fullsize.y) {
                snowflake.array[sf].pos = new Vector2(Math.random()*fullsize.x, 0).minxy(sfs);
            };
            // side portals
            if(sfp.x < -sfs) {snowflake.array[sf].pos.x += fullsize.x+sfs}
            else if(sfp.x > fullsize.x) {snowflake.array[sf].pos.x -= fullsize.x+sfs};
            // mouse (тип чтоб они мышкой толкались, но на деле это кал)
            // if(mouse.pos.overSAND(snowflake.array[sf].pos) && mouse.pos.lessSAND(snowflake.array[sf].pos.sumv(snowflake.array[sf].size))) {
            //     snowflake.array[sf].pos = snowflake.array[sf].pos.sumv(mouse.delta.multxy(0.8))
            // }
        }
    }
};
//
let visual = {
    // caching
    stars: [],
    // light ring
    lightAngle1: 0,
    lightAngle2: 180,
    lightDiam: new Vector1(fitFrameSize.y*1.6),
    lightRing: (center, radius) => {
        visual.lightDiam.update();
        setRotation(center, visual.lightAngle1);
        drawImageSized(winnerLightRing, center.minxy(radius/2), new Vector2(radius));
        ctx.resetTransform();
        setRotation(center, visual.lightAngle2);
        drawImageSized(winnerLightRing, center.minxy(radius/2), new Vector2(radius));
        ctx.resetTransform();
    },
    // layers
    backgroundLayer: () => {
        if(pref.snowflakes) {
            novyigodSnowflakes()
        };
        if(pref.visual) {
            // соме щит
            musicAnalysis.update();
            musicEqualizer.draw()
        }
    },
};
//
// @EAG WALLPAPER IMAGE
//
let wallpaper = new Image();
let wallpaperbase = [
    'kyxbor3aw5hud3ek7xpik/1.jpg?rlkey=1s9dvj533143jago8lt5hymlh',    // пять невест
    'q34euwi9ktfz0mnl4a2oe/2.jpg?rlkey=u79lsps7ty61xmkzzfgtp3boa',    // повар боец сома
    'r0uom6cjam85700csbi7d/3.jpg?rlkey=cf65zhme2wtc78f4dp5u5bs1k',    // дракон горничная
    'v95fp9b4bn5zfxhiuz1bk/4.jpg?rlkey=thuhga2sdxfhqekn661c57jcv',    // школа дхд
    'c7d3bptxl0tvgost4kdwy/5.jpg?rlkey=khrz91dgwbxdttavz19tfre05',    // сакурасо
    'iwk9izyskxwpqa2tr1eg3/7.jpg?rlkey=mi7o08qfcl1nyza2rnf3hohz3',    // кейон
    'dfhht3gs1nho3p5c43sgi/9.jpg?rlkey=ntb79u0pkw7e2pls6gcq84tle',    // спай фемили
    '02oqjqer6yzujhdhn7iyd/10.jpg?rlkey=zcvohf7oltsc170vjfop3x8p6',    // вайолетт
    '0m6ff16ci2r2vob9pj4op/8.webp?rlkey=ulyyqggsib2iwiwqi0pco6ccd',    // речка самолётик
    '9dhc9s3cb161fz51supz6/9.webp?rlkey=8jgvodzg0jrjo4aq66ed6kl6y',    // babazaki
    '0pmwgme0p7ailyrv5du44/10.webp?rlkey=365qa0yvpp068gjr7ba62w1yy',    // тянки в лесу
    'htuffcrbcxyd6e9oytxuh/11.webp?rlkey=vmbfr24u3by3mb6u0cs6cxaj4',    // кил ми беби
    '9ij1hhutwpzkqoqk4povs/12.webp?rlkey=v9rppcc9x3ol6a0lsusbnmv5g',    // 14.1 (бл)
    'l2ppz31fopz21tn4frwk4/13.webp?rlkey=px0tjz5agbq4fqgiv7a5o9wbu',    // лаки стар
    'ag6vw67wibubxqwpjc6ok/14.webp?rlkey=shogjr7prha32lxl83yy7oqyz',    // да, я алисофаг, идите нахуй
    '4k3we5e8q9jbaot64ozt8/15.webp?rlkey=jtsdm12xkx2139uq6z6i0q1me',    // хитори гото
    't4k42do7c5e4elozfp2e8/16.webp?rlkey=7hdcxcppz4yv0ik3gp2n0i877',    // глухомань
    '6lmwvqr071txdf0xavnjo/17.webp?rlkey=w7r67potqkh2g8pg7l01ca07i',    // килл ла килл (соска)
    'i3tzg6j39h1uyt5v3jh8d/18.webp?rlkey=ykmtajbepzpbs9oow1wevpbgc',    // ююшики
];
//
let wlpsize = new Vector2();
let parallaxSize = new Vector2();
let parallaxOffset = new Vector2();
let oldwallpaper = randomWallpaperGD();
let _wphide = new Vector1(1);
let _wphided = true;
let wallerror = null;
wallpaper.onerror = () => {
    if(navigator.onLine) {
        wallpaper.onerror = () => {
            wallpaper.src = '';
            lsSaveValue('wallpaper', randomWallpaperGD());
            wallerror = true
        };
        wallpaper.src = String(oldwallpaper)
    } else {
        wallpaper.src = ''
    }
};
wallpaper.src = lsLoadString('wallpaper', randomWallpaperGD());
//
function setWallpaper(src) {
    oldwallpaper = String(wallpaper.src);
    wallpaper.src = src !== null ? src : randomWallpaperGD();
    wallpaper.onerror = () => {
        wallpaper.src = String(oldwallpaper);
        wallpaper.onerror = () => {
            wallpaper.src = '';
            lsSaveValue('wallpaper', randomWallpaperGD());
            wallerror = true
        }
    };
    wallerror = false
};
function randomWallpaperGD(apply = false) {
    const base = JSON.parse(JSON.stringify(wallpaperbase));
    return apply
    ? setWallpaper(_dropboxURL(randomItemsFrom(base, 1)[0]))
    : _dropboxURL(randomItemsFrom(base, 1)[0])
};
//
function updateWallSize() {
    if(oldwallpaper !== wallpaper.src && wallpaper.naturalHeight > 0) {
        lsSaveValue('wallpaper', wallpaper.src); 
        oldwallpaper = String(wallpaper.src)
    };
    //
    var ir = wallpaper.naturalHeight / wallpaper.naturalWidth;
    if(fullsize.x / fullsize.y > ir) {
        wlpsize = new Vector2(fullsize.y / ir, fullsize.y);
        if(wlpsize.x < fullsize.x) {
            wlpsize = new Vector2(fullsize.x, fullsize.x * ir)
        }
    } else {
        wlpsize = new Vector2(fullsize.x, fullsize.x * ir);
        if(wlpsize.y < fullsize.y) {
            wlpsize = new Vector2(fullsize.y / ir, fullsize.y)
        }
    };
    if(pref.parallax) {
        parallaxSize = fullsize.multxy(5/100);
        wlpsize = wlpsize.sumv(parallaxSize);
        parallaxOffset = parallaxSize.multv(mouse.pos.minv(fullsize.dividexy(2)).dividev(fullsize))
    } else {
        parallaxOffset.reset()
    }
};
//
function wallpaperImage() {
    if(!wallpaper.complete || sload.state === 'startup' || sload.state === 'timeout' || wallerror) {
        fillRect(fullsize, fullAlign(new Vector2(0.5), fullsize), staticBgcolor);
        if(!_wphided) {
            _wphide.set(1);
            _wphided = true;
            drawWallpaper = drawWallpaperInit
        }
    } else {
        clipmainAlpha.get() !== 1 ? drawWallpaper() : updateWallSize()
    };
    if(!clipmain.paused) {
        [clipmain.width, clipmain.height] = [wlpsize.x, wlpsize.y];
        ctx.globalAlpha = clipmainAlpha.get();
        drawImageSized(clipmain, fullAlign(new Vector2(0.5), wlpsize).sumv(parallaxOffset), wlpsize);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        fillRectFast(fullsize, new Vector2());
        ctx.globalAlpha = 1;
    }
};
//
function drawWallpaperInit() {
    if(_wphided) {_wphide.move(0, 1, easeInOutSine); _wphided=false};
    _wphide.update();
    updateWallSize();
    drawImageSized(wallpaper, fullAlign(new Vector2(0.5), wlpsize).sumv(parallaxOffset), wlpsize);
    fillRect(fullsize, fullAlign(new Vector2(0.5), fullsize), '#0004');
    fillRect(fullsize, fullAlign(new Vector2(0.5), fullsize), `rgba(11,11,18,${_wphide.get()})`)
    setTimeout(() => {drawWallpaper = drawWallpaperNormal; _wphided=false}, 1200)
};
function drawWallpaperNormal() {
    updateWallSize();
    drawImageSized(wallpaper, fullAlign(new Vector2(0.5), wlpsize).sumv(parallaxOffset), wlpsize);
    fillRect(fullsize, fullAlign(new Vector2(0.5), fullsize), '#0004')
};
let drawWallpaper = drawWallpaperInit;
//
// @EAG RENDER ALL
//
let activeScreen = screenLoading;
//
let eagrendering;
function lockFpsSwitch(framerate = -1, force=true) {
    if(force) {
        if(framerate > 0) {prefSetValue('framerate', framerate); prefSetValue('lockfps', true)} else {prefSetValue('lockfps', false)};
        eagrendering !== null ? clearInterval(eagrendering) : false;
        if(pref.lockfps) {
            eagrendering = setInterval(render, 1000/pref.framerate)
        } else {
            eagrendering = setInterval(render)
        }
    } else {
        eagrendering !== null ? clearInterval(eagrendering) : false;
        if(framerate > 0) {
            eagrendering = setInterval(render, 1000/framerate)
        } else {
            eagrendering = setInterval(render, 1000/pref.framerate)
        }
    }
};
pref.lockfps ? lockFpsSwitch(pref.framerate) : lockFpsSwitch();
//
let devinfoValues = {
    width: 300,
    height: 94,
    offset: 12,
    margin: 4,
    xanchor: 12,
    spacing: 12,
    text: 0,
    texty: (x) => {return devinfoValues.offset + devinfoValues.margin + devinfoValues.spacing * x}
};
//
function developInfo() {
    if(pref.showDebugInfo) {
        //
        mouse.pos.x > fullsize.x/2
        ? devinfoValues.xanchor = devinfoValues.offset
        : devinfoValues.xanchor = fullsize.x - (devinfoValues.width + devinfoValues.offset);
        devinfoValues.text = devinfoValues.xanchor + devinfoValues.margin;
        //
        var limit = bytesStringify(performance.memory.jsHeapSizeLimit);
        var total = bytesStringify(performance.memory.totalJSHeapSize);
        var usage = bytesStringify(performance.memory.usedJSHeapSize);
        // @RELEASE (убрать, если чет добавлял для себя)
        fillRectRounded(new Vector2(devinfoValues.width, devinfoValues.height), new Vector2(devinfoValues.xanchor, devinfoValues.offset), '#0029', devinfoValues.margin);
        fillText(new Vector2(devinfoValues.text, devinfoValues.texty(1)), 'FPS: '+FPS, '#fff', 'bold 16px Consolas');
        fillText(new Vector2(devinfoValues.text, devinfoValues.texty(2)), 'memLimit: '+limit, '#fcc', 'bold 12px Consolas');
        fillText(new Vector2(devinfoValues.text, devinfoValues.texty(3)), 'memUsage/Total: ' + usage + ' / ' + total, '#fcc', 'bold 12px Consolas');
        fillText(new Vector2(devinfoValues.text, devinfoValues.texty(4)), 'roulette: '+Math.floor(roulette.progress.get()*10)/10+'/'+(roulette.picsCount-1), '#ffc', 'bold 12px Consolas');
        fillText(new Vector2(devinfoValues.text, devinfoValues.texty(5)), 'full: '+Math.floor(fullsize.x)+'x'+Math.floor(fullsize.y) + ', cvs: '+Math.floor(cvssize.x)+'x'+Math.floor(cvssize.y), '#ccf', 'bold 12px Consolas');
        fillText(new Vector2(devinfoValues.text, devinfoValues.texty(6)), 'scale: '+floatNumber(_scaleDynamic, 2), '#cfc', 'bold 12px Consolas');
        fillText(new Vector2(devinfoValues.text, devinfoValues.texty(7)), 'session: '+bytesStringify(getSessionSize())+ ` (${floatNumber(getSessionSize()/sessionLimit*100, 1)}%)`, '#fc7', 'bold 12px Consolas');
        // хуй
        //
        graphFPS.draw(new Vector2(devinfoValues.xanchor, devinfoValues.texty(8)), 3, 0);
        if(pref.playClip) {
            // clip sync offset
            // graphClipSync.update(Math.floor(((clipmain.currentTime - _cliptimestamp) - (musicRoll.currentTime - _musictimestamp))*1000));
            // graphClipSync.draw(new Vector2(devinfoValues.xanchor, devinfoValues.texty(8)+85), 1, 0);
            // buffered ranges
            videoClipBuffered();
            ctx.fillStyle = '#0008';
            fillRectFast(new Vector2(devinfoValues.width, devinfoValues.spacing*(_clipmainBuffered.length+1)), new Vector2(devinfoValues.xanchor, devinfoValues.texty(8)+85));
            ctx.fillStyle = '#fffd'; ctx.textAlign = 'start';
            fillTextFast(new Vector2(devinfoValues.text, devinfoValues.texty(8)+85+devinfoValues.spacing), `videoClipBufferedRanges (${_clipmainBuffered.length})`);
            ctx.textAlign = 'end';
            fillTextFast(new Vector2(devinfoValues.xanchor + devinfoValues.width, devinfoValues.texty(8)+85+devinfoValues.spacing), `${timeStringify(clipmain.currentTime)} - ${timeStringify(clipmain.duration)}`);
            for(var r in _clipmainBuffered) {
                var w = (_clipmainBuffered[r][1] - _clipmainBuffered[r][0]) * devinfoValues.width;
                var x = _clipmainBuffered[r][0] * devinfoValues.width;
                ctx.fillStyle = `hsla(${Math.round(360*(r/_clipmainBuffered.length))} 80% 60% / 0.4)`;
                fillRectFast(new Vector2(w, devinfoValues.spacing), new Vector2(devinfoValues.xanchor + x, devinfoValues.texty(8)+85+devinfoValues.spacing*(Number(r)+1)))
            };
            ctx.fillStyle = '#fffa';
            var pos = (clipmain.currentTime/clipmain.duration)*devinfoValues.width;
            fillRectFast(new Vector2(3, devinfoValues.spacing*_clipmainBuffered.length), new Vector2(devinfoValues.xanchor + pos, devinfoValues.texty(8)+85+devinfoValues.spacing))
        };
        ctx.textAlign = 'start';
    } else if(pref.showFPS) {
        fillText(new Vector2(14, 30), 'FPS: '+FPS, '#fff', 'bold 16px Consolas');
    }
};
//
function render() {
    // input & update
    canvasActualSize();
    workWithFPS();
    inputListener();
    updatePreferences();
    updateMusic();
    jikan._update();
    // draw
    wallpaperImage();
    visual.backgroundLayer();
    activeScreen();
    transitionScreen();
    hoverHint.draw();
    ctx.textAlign = 'start';
    developInfo();
    // title
    scaleFont(12, 'Consolas', 'italic'); ctx.fillStyle = '#fff';
    ctx.fillText($appInfo.cleft, 2, fullsize.y-4);
    ctx.textAlign = 'end';
    ctx.fillText($appInfo.cright, fullsize.x-4, fullsize.y-4);
};