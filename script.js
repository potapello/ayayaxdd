var cvs = document.getElementById("ayayaxdd");
var ctx = cvs.getContext("2d");
// focus stopper
let windowVisibility = false;
window.onfocus = window.onpageshow = () => {
    windowVisibility = true; fpsFocusSwitch = true
};
window.onpagehide = window.onblur = () => {
    windowVisibility = false; fpsFocusSwitch = true
};
// database shorter
function databaseShorter() {
    for(a in adb) {
        // delete adb[a].synonyms;
        delete adb[a].relations;
        delete adb[a].thumbnail
    }
};
//
// @EAG FPS
//
let fpsCalcFreq = 10;
var FPS = 0, deltaTime = 0, oldTime = 0;
let fpsFrames = 0, fpsSumm = 0;
let timeMultiplier = 1;
//
let fpsFocusLimiter = 20;
let fpsFocusLast = Number();
let fpsFocusSwitch = false;
function workWithFPS() {
    // // limit fps, if no focus
    // if(fpsFocusSwitch) {
    //     fpsFocusSwitch = false;
    //     if(windowVisibility) {
    //         lockFpsSwitch(0, false)
    //     } else {
    //         fpsFocusLast = Number(pref.framerate);
    //         lockFpsSwitch(fpsFocusLimiter, false)
    //     }
    // };
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
            for(let i = 1; i < this.array.length; i++) {
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
            for(let i = 1; i < this.array.length; i++) {
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
    max = array[0];
    for(i = 1; i < array.length; i++) {
        if(max >= array[i]) {continue} else {max = array[i]}
    }; return max
};
function findMin(array, default_min) {
    if(default_min || default_min == 0) {min = default_min} else {min = array[0]};
    for(i = 0; i < array.length; i++) {
        if(min <= array[i]) {continue} else {min = array[i]}
    }; return min
};
function findCent(array) {
    summ = 0;
    for(i = 0; i < array.length; i++) {summ += array[i]};
    return Math.floor(summ/array.length*10)/10
};
//
let graphFPS = new Graph('FPS', 80, 100);
//
// @EAG RNG WORK
//
let _rng = Number(0);
let _rngmax = Number(65535);
function RNG() {_rng = Math.floor(Math.random()*_rngmax)};
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
return 1 - Math.pow(1 - x, 5);
};
function easeOutCubic(x){
return 1 - Math.pow(1 - x, 3)
};
function easeInOutCirc(x) {
return x < 0.5
  ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
  : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2
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
    oldtouch: [new Vector2(), new Vector2()],
};
let _def_mouse = JSON.stringify(mouse);
//
let events = {
    // default args for functions -> (key, value)
    wheel: {},
};
function updateEventThread(array, key, value) {
    for(f in array) {array[f](key, value)}
};
function resetEventThread() {
    events = {wheel:{},}
};
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
    wheelState = a;
    // updateEventThread(events.wheel, wheelState, mouse.wheel)
};
// mouse button events
document.addEventListener('mousedown', (e) => {
    if(e.button == 0) {mouse.press = true};
});
document.addEventListener('mouseup', (e) => {
    if(e.button == 0) {mouse.press = false};
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
            touchScroll = (scroll[0] + scroll[1]) / 2 * cvsscale.get()
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
function keyPressed(key = String()) {
    if(keyboard[key] === undefined) {
        return false
    } else {
        var k = keyboard[key];
        keyboard[key] = false;
        return k
    }
};
//
document.addEventListener('keyup', (e) => {
    keyboard[e.key] = false
});
document.addEventListener('keydown', (e) => {
    keyboard[e.key] = true
});
//
// @EAG INPUT LISTENER
//
function inputListener() {
    // keyboard
    if(keyPressed('+') || keyPressed('=')) {cvsscale.getFixed() < 2.4 ? cvsscale.move(cvsscale.getFixed()+0.1, 0.25, easeOutCirc) : false; globalRescale()};
    if(keyPressed('-')) {cvsscale.getFixed() >= 0.6 ? cvsscale.move(cvsscale.getFixed()-0.1, 0.25, easeOutCirc) : false; globalRescale()};
    if(keyPressed('Escape')) {
        if(activeScreen !== screenRoulette && activeScreen !== screenLoading) {
            requestScreen(screenRoulette)
        }
    };
    if(activeScreen == screenRoulette && roulette.catchWinner !== true) {
        if(keyPressed('ArrowLeft')) {
            roulette.progress.move(Math.round(roulette.progress.getFixed())-1, 0.3, easeOutCirc)
        } else if(keyPressed('ArrowRight')) {
            roulette.progress.move(Math.round(roulette.progress.getFixed())+1, 0.3, easeOutCirc)
        } else if(keyPressed(' ')) {
            buttonDoRoll.onclick()
        }
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
    mouse.old.setv(mouse.pos)
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
    var m = Math.floor(sec/60);
    var s = Math.floor(sec - m*60);
    return `${m}:${s>=10?s:'0'+s}`
};
function floatNumber(x, digits=1) {
    var d = Math.pow(10, Math.abs(digits))
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
    //['src', rolltime],
    ['audio/music1.ogg', 61, 'Kuhaku Gokko - Lil\'b'],
    ['audio/music2.ogg', 49, 'Miku Sawai - Gomen ne, Iiko ja Irarenai'],
    ['audio/music3.ogg', 17, 'DUSTCELL - Narazumono'],
    ['audio/music4.ogg', 0, 'Cagayake! - GIRLS'],
    ['audio/music5.ogg', 35, 'bulow - Revolver'],
    ['audio/music6.ogg', 26, 'Giga (feat. KAFU) - CH4NGE'],
    ['audio/music7.ogg', 41, 'Ado - AntiSystem\'s'],
    ['audio/music8.ogg', 44, 'Kenshi Yonezu - KICK BACK'],
    ['audio/music9.ogg', 34, 'BABYMETAL - Divine Attack'],
    ['audio/music10.ogg', 0, 'Uesaka Sumire - Inner Urge'],
    ['audio/music11.ogg', 47.5, 'Kanako Itou - Fatima'],
    ['audio/music12.ogg', 36, 'Kanako Itou - Hacking to the Gate'],
    ['audio/music13.ogg', 0, 'ZOE, Jododo - Lighting'],
    ['audio/music14.ogg', 0, 'Ikimono Gakari - Blue Bird'],
    ['audio/music15.ogg', 46, 'Uverworld - Touch off'],
    ['audio/music16.ogg', 55, 'Masayuki Suzuki - Love Dramatic'],
    ['audio/music17.ogg', 0, 'Takuma Terashima - Nameless story'],
    ['audio/music18.ogg', 42, 'Konomi Suzuki - Redo'],
    ['audio/music19.ogg', 34, 'Huwie Ishizaki - Wasuregataki'],
    ['audio/music20.ogg', 49, 'yama - Shikisai'],
    ['audio/music21.ogg', 27, 'Kessoku Band - Seishun Complex'],
    // DELETED
    // 'audio/music2.ogg', 42, 'Quinn Karter - Living in a Dream'
    // 'audio/music3.ogg', 43, 'ITZY - Snowy'
    // 'audio/music6.ogg', 47, 'Gawr Gura - REFLECT'
];
//
let musicNormal = new Audio();
let musicRoll = new Audio();
let musicNormalVolume = new Vector1(0);
let musicRollVolume = new Vector1(0);
musicNormal.oncanplay = () => {if(pref.bgmusic > 0) {musicNormal.play()}};
musicRoll.oncanplay = () => {musicRoll.play()};
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
    var track = musicRandomTrack();
    musicNormal.src = track[0];
    musicLite.name = track[2];
    musicNormalVolume.move(1, 2, easeInOutSine);
    if(pref.bgmusic > 0) {musicNormal.play()};
    //
    updateMusic = updateMusicCache;
    musicInitialize = () => {}
};
function updateMusic() {};
function updateMusicCache() {
    musicNormalVolume.update();
    musicRollVolume.update();
    musicNormal.volume = (pref.bgmusic / 100) * musicNormalVolume.get();
    musicRoll.volume = (pref.rollmusic / 100) * musicRollVolume.get();
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
            musicNormalVolume.move(1, 2, easeInOutSine);
            musicNormalLoop = false;
            buttonNextTrack.state = 'idle';
            buttonPauseTrack.state = 'idle';
        }, 2000);
    };
    if(musicRoll.duration === musicRoll.currentTime) {
        musicRollVolume.reset();
        musicRollVolume.move(0, 2, easeInOutSine);
        musicRoll.currentTime = 0;
        musicRoll.play()
    }
};
//
function musicNormalSelect(id) {
    musicNormal.pause();
    musicNormal.currentTime = 0;
    musicNormalVolume.move(1, 1, easeInOutSine);
    buttonPauseTrack.image = mlcPauseImage;
    musicNormal.src = music[id][0];
    musicLite.name = music[id][2];
    if(pref.bgmusic > 0) {musicNormal.play()}
};
//
function musicRandomTrack() {
    return music[Math.floor(Math.random() * (music.length - 0.001))]; 
};
function musicNormalNew() {
    if(pref.bgmusic > 0) {
        musicNormal.pause();
        musicNormal.currentTime = 0;
        musicNormalVolume.move(1, 1, easeInOutSine);
        buttonPauseTrack.image = mlcPauseImage;
        var track = musicRandomTrack()
        musicNormal.src = track[0];
        musicLite.name = track[2];
        musicNormal.play()
    }
};
//
function musicNormalPause() {
    if(musicNormal.paused) {
        if(pref.bgmusic > 0) {
            buttonPauseTrack.image = mlcPauseImage;
            musicNormal.play();
            musicNormalVolume.move(1, 0.25, easeInOutSine)
        }
    } else {
        buttonPauseTrack.image = mlcPlayImage;
        musicNormalVolume.move(0, 0.25, easeInOutSine);
        setTimeout(() => {musicNormal.pause()}, 250)
    }
}
//
function musicRollStart(time = 2) {
    if(pref.rollNewTrack) {
        var trackname;
        musicRoll.pause();
        [musicRoll.src, musicRoll.currentTime, trackname] = musicRandomTrack();
        musicRoll.play();
        //
        musicNormalVolume.move(0, time, easeInOutSine);
        musicRollVolume.move(1, time, easeInOutSine);
        setTimeout(() => {
            musicNormal.pause();
            musicLite.name = trackname;
            musicNormal.src = String(musicRoll.src)
        }, time*1000)
    };
};
function musicRollEnd(time = 0.5) {
    if(pref.rollNewTrack) {
        if(pref.bgmusic > 0) {musicNormal.play()};
        musicNormal.currentTime = Number(String(musicRoll.currentTime));
        musicRollVolume.move(0, time, easeInOutSine);
        setTimeout(() => {
            musicNormalVolume.move(1, time, easeInOutSine);
            musicRoll.pause()
        }, time*1000)
    };
};
//
// @EAG FILTER DEFAULT
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
    // roulette
    rollTime: 30,
    rollSpeed: 40,
    rouletteItems: 50,
    rollImages: 13,
    showMap: false,
    showNSFW: false,
    autoScroll: true,
    // draw
    imageQuality: 'low',
    imageSmoothing: true,
    lockfps: true,
    framerate: 60,
    bgalpha: 0.7,
    scale: 1,
    // audio
    sound: 8,
    bgmusic: 6,
    rollmusic: 10,
    playerShow: true,
    rollNewTrack: true,
    // other
    language: 'en',         // NIPM
    parallax: true,
    showFPS: false,
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
for(key in pref) {
    pref[key] = lsLoadValue(`pref.${key}`, pref[key])
};
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
    for(i in array) {
        arr[i] = optimizeAnimeObject(array[i])
    };
    return arr
};
//
// @EAG TRANSLATED TEXT
//
let _TextTranslations = {
    'ru': {
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
        rbRoll: 'Roll!', rbWait: 'Ждём', rbMusicOff: 'Музыка выключена.',
        // desc
        descHead: 'Описание',
        descWait: 'Секундочку...',
        descNone: 'Описания нет',
        descContinue: '    (далее на MyAnimeList)',
        descTranslate: '[Перевести]',
        descWork: 'Переводим... ',
        descRoll: 'Рулетка крутится...',
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
        // prompts
        promIntLess: 'Введите целое число, меньше чем',
        promIntOver: 'Введите целое число, больше чем',
        promHoverCopy: 'Нажмите, чтобы скопировать название',
        // filter
        filterApplyPreset: 'Применить',
        filterWallpaper: 'Вставьте ссылку на изображение',
        filterDiap: 'Диапазоны',
        filterYear: 'Год выхода (0 - 2023)',
        filterEps: 'Кол-во серий (1 - 9999)',
        filterScore: 'Ср. оценка (0 - 100)',
        filterScoreAllow: 'Учитывать оценки MAL',
        filterSTS: 'Сезоны, типы и статусы',
        filterTags: 'Тэги',
        filterPresets: 'Пресеты',
        filterAboutPresets: 'Нажмите на пресет, чтобы узнать, что именно он изменяет. Применение пресета выставит новые значения последующих настроек фильтра.',
        filterWarn: 'Применение фильтра перезапишет старые элементы рулетки и удалит ПОБЕДИТЕЛЯ, если он уже определялся до этого.',
        filterFindNone: 'Ни одного тайтла, прошедшего по условиям фильтра, не найдено! Фильтр восстановлен до настроек пресета.',
        filterCounter: 'Кол-во тайтлов, проходящих по условиям: ',
        // load
        loadJkrg: `Думаем...`,
        loadPics: `Грузим картинки...`,
        loadGen: `Генерируем рулетку...`,
        loadDone: `Готово!`,
        loadFirstEvent: `Нажмите в любую область экрана для продолжения...`,
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
        // prefsets
        pstDisable: 'Выкл.', pstLow: 'Низк.', pstHigh: 'Выс.', pstChange: 'Сменить',
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
    },
    'en': {
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
        rbRoll: 'Roll!', rbWait: 'Wait', rbMusicOff: 'Music is turned off.',
        // desc
        descHead: 'Description',
        descWait: 'Please wait...',
        descNone: 'No description',
        descContinue: '    (continued in MyAnimeList)',
        descTranslate: '[Translate]',
        descWork: 'Translating... ',
        descRoll: 'Roulette is spinning...',
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
        // prompts
        promIntLess: 'Enter an integer less than',
        promIntOver: 'Enter an integer greater than',
        promHoverCopy: 'Click to copy the name',
        // filter
        filterApplyPreset: 'Apply',
        filterWallpaper: 'Insert a URL link to the image',
        filterDiap: 'Ranges',
        filterYear: 'Year of release (0 - 2023)',
        filterEps: 'Episodes (1 - 9999)',
        filterScore: 'Avg. score (0 - 100)',
        filterScoreAllow: 'Take into account the MAL rating',
        filterSTS: 'Seasons, types & statuses',
        filterTags: 'Tags',
        filterPresets: 'Presets',
        filterAboutPresets: 'Click on the preset to find out exactly what it changes. Applying the preset will set new values for subsequent filter settings.',
        filterWarn: 'Applying the filter will overwrite the old roulette elements and remove the WINNER if it has already been determined before.',
        filterFindNone: 'Not a single title that passed the filter conditions was found! The filter has been restored to the preset settings.',
        filterCounter: 'Number of filtered anime: ',
        // load
        loadJkrg: `Thinkge...`,
        loadPics: `Loading pictures...`,
        loadGen: `Generating roulette...`,
        loadDone: `Success!`,
        loadFirstEvent: `Tap anywhere on the screen to continue...`,
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
        // prefsets
        pstDisable: 'Off', pstLow: 'Low', pstHigh: 'High', pstChange: 'Change',
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
let allTranslations = {
    'en': {
        name: 'English',
        author: 'Web-translator'
    },
    'ru': {
        name: 'Русский',
        author: 'potapello'
    }
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
    'secret':           new animeTag('secret', ['hentai', 'nudity']),
    'allnsfw':          new animeTag('allnsfw', [
        // eto pizdec
        'hentai', 'anal', 'oral', 'nudity', 'large breasts', 'pantsu',
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
        this.scoreAllow = false; this.score = score;
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
            for(i in this.in) {ini = ini + ' ' + tagbase[this.in[i]].name + ','};
            ini = ini.substring(0, ini.length-1) + '.'
        };
        if(this.ex !== null) {
            exi = ' ' + txt('prinExcludes');
            for(i in this.ex) {exi = exi + ' ' + tagbase[this.ex[i]].name + ','};
            exi = exi.substring(0, exi.length-1) + '.'
        };
        return txt('prinPreset') + this.name + '.' + ini + exi + txt('prinEps') + this.ep.min + '-' + this.ep.max + txt('prinYears') + this.years.min+ '-' + this.years.max + txt('prinScore') + this.score.min + '-' + this.score.max + txt('prinMultiplier') + ' x'+String(this.mult + 0.001).substring(0,4)
    }
};
//
// @EAG ALL PRESETS
//
let YEARS = new Range(1900, 2024);
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
    for(i in child) {
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
    for(i in array) {summ+=array[i]};
    return summ === array.length
};
function arrayORCondition(array) {
    var summ = 0;
    for(i in array) {summ+=array[i]};
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
    for(i in array) {
        if(!array[i].complete) {return false}
    };
    return true
};
//
function objectAddEntry(object, entries=[]) {
    var obj = object, entry;
    for(e in entries) {
        entry = String(entries[e])
        obj[entry] === undefined
        ? obj[entry] = 1
        : obj[entry] += 1
    };
    return obj
};
//
function objectSortEntries(object) {
    var sorted = [], obj = object, l = 0, max, key;
    // calc length
    for(asd in obj) {
        l += 1
    };
    console.log(l);
    // search max, migrate, delete
    for(let i=0;i<l;i++) {
        max = 0;
        for(j in obj) {
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
    af = JSON.parse(JSON.stringify(filter));
    if(typeof mod == 'object') {
        for(key in mod) {
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
    tags = tagbase[animetag].tags;
    for(i in tags) {
        if(array.indexOf(tags[i]) !== -1) {return true}
    }
    return false
};
function filterIncludeTags(included, array) {
    for(i in included) {
        if(!filterAnimeTag(included[i], array)) {return false} else {continue}
    }
    return true
};
function filterExcludeTags(excluded, array) {
    for(i in excluded) {
        if(filterAnimeTag(excluded[i], array)) {return false} else {continue}
    }
    return true
};
// filter precounting by all changes
let filterPrecount = {
    count: 0,
    timeout: 1,
    flag: true,
    filter: JSON.parse(JSON.stringify(filterDefault)),
    request: () => {
        filterPrecount.filter = JSON.parse(JSON.stringify(filterDefault));
        filterPrecount.filter.tagsIncluded = []; 
        filterPrecount.filter.tagsExcluded = [];
        for(t in tagSelection) {
            if(tagSelection[t] === 'inc') {filterPrecount.filter.tagsIncluded.push(t)};
            if(tagSelection[t] === 'exc') {filterPrecount.filter.tagsExcluded.push(t)}
        };
        filterPrecount.flag = true;
        filterPrecount.timeout = 0.5
    },
    update: () => {
        if(filterPrecount.flag) {
            if(filterPrecount.timeout < 0) {
                filterPrecount.count = getListFiltered(filterPrecount.filter).length;
                filterPrecount.flag = false
            } else {
                filterPrecount.count = txt('rbWait') + ' ' + Math.floor(filterPrecount.timeout*1000) + 'мc.';
                filterPrecount.timeout -= deltaTime/1000
            }
        }
    },
};
//
// @EAG FEEDBACK FUNCTIONS
//
function getArrayWorkProgress(iter, length, step) {
    for(let i = 1; i<100/step; i++) {
        if(iter == Math.round(length*step*i/100)) {console.info(`Work progress -> ${step*i}%`)}
    }
};
//
// @EAG LIST GETTER FUNCTIONS
//
function getListFiltered(filter = filterDefault) {
    var list = [];
    for(i in adb) {
        anime = adb[i];
        // sort by episodes
        if(anime['episodes'] < filter.episodeMin || anime['episodes'] > filter.episodeMax) {continue};
        // sort by score, if allowed
        if(filter.scoreAllow) {
            var anime_id = malAnimeID(anime.sources);
            if(anime_id == null) {continue}
            else {
                if(adb_ratings[anime_id] === undefined) {continue};
                var score = adb_ratings[anime_id]['score'];
                if(score == 'None' || score == undefined) {continue}
                else {
                    if(score < filter.scoreMin) {continue};
                    if(score > filter.scoreMax) {continue};
                }
            }
        };
        // sort by year
        if(anime['animeSeason']['year'] > filter.yearMax || anime['animeSeason']['year'] < filter.yearMin) {continue};
        // sort by include/exclude tags
        if(anime['tags'].length > 0) {
            if(!filterIncludeTags(filter.tagsIncluded, anime['tags'])) {continue};
            if(!filterExcludeTags(filter.tagsExcluded, anime['tags'])) {continue};
        } else {
            if(!filter.tagsUndefined) {continue}
        };
        // sort by nsfw
        if(!filter.NSFW && filterAnimeTag('allnsfw', anime['tags'])) {continue};
        // sort by season
        season = anime['animeSeason']['season'];
        if(!filter.seasonSpring && season == 'SPRING') {continue};
        if(!filter.seasonSummer && season == 'SUMMER') {continue};
        if(!filter.seasonFall && season == 'FALL') {continue};
        if(!filter.seasonWinter && season == 'WINTER') {continue};
        if(!filter.seasonUndefined && season == 'UNDEFINED') {continue};
        // sort by status
        stat = anime['status'];
        if(!filter.statusFinished && stat == 'FINISHED') {continue};
        if(!filter.statusUpcoming && stat == 'UPCOMING') {continue};
        if(!filter.statusOngoing && stat == 'ONGOING') {continue};
        if(!filter.statusUnknown && stat == 'UNKNOWN') {continue};
        // sort by type
        type = anime['type'];
        if(!filter.typeMovie && type == 'MOVIE') {continue};
        if(!filter.typeTV && type == 'TV') {continue};
        if(!filter.typeONA && type == 'ONA') {continue};
        if(!filter.typeOVA && type == 'OVA') {continue};
        if(!filter.typeSpecial && type == 'SPECIAL') {continue};
        if(!filter.typeUnknown && type == 'UNKNOWN') {continue};
        //
        list.push(anime)
    };
    return list
};
//
function randomItemsFrom(array, count) {
    var list = array, items = [];
    if(list.length > count) {
        for(let i=0; i<count; i++) {
            items.push(list.splice(Math.floor(Math.random()*(list.length-0.01)), 1)[0])
        }
    } else {
        return arrayShuffle(list)
    };
    return arrayShuffle(items)
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
    _send: () => {
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
        jikan._send()
    },
    full: (mal_id) => {
        jikan._xhr.open("GET", jikan._prefix + mal_id + '/full');
        jikan._send()
    },
};
//
// @EAG JIKAN METHODS
//
function malAnimeID(sources) {
    source = null;
    for(s in sources) {
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
        for(str in translator.response) {
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
    for(i in database) {
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
    for(i in database) {
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
    var names = [], result = [], req = request.toLowerCase();
    for(a in db) {
        names = [].concat(db[a]['title'], db[a]['synonyms']);
        for(t in names) {
            if(stringIncludeRequest(names[t].toLowerCase(), req, hard)) {
                result.push(db[a]); break
            }
        }
    };
    return result.length > 0 ? result : false
};
function stringIncludeRequest(str, req, hard=false) {
    var arr = req.split(' ');
    if(hard) {
        for(w in arr) {
            if(!str.includes(arr[w])) {return false}
        }; return true
    } else {
        for(w in arr) {
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
let cvsscale = new Vector1(1);
//
let casState = 'idle';
let casscale = new Vector2();
let casTimeout = 0.25;
let casResized = new Vector2();
let cvsField = 0;
function canvasActualSize() {
    if(casState === 'idle') {
        if(ctx.canvas.width  != window.innerWidth || ctx.canvas.height != window.innerHeight) {
            casState = 'moved'
        };
        if(!docsize.condAND(new Vector2(window.innerWidth, window.innerHeight)) && docsize.time == 0) {
            docsize.movexy(window.innerWidth, window.innerHeight, 0.25, easeOutQuint);
            ctx.canvas.width = window.innerWidth;
            ctx.canvas.height = window.innerHeight;
        }
        //
    } else if (casState === 'moved') {
        casTimeout = 0.25;
        if(casResized.x  == window.innerWidth && casResized.y == window.innerHeight) {
            casState = 'timeout'
        };
        casResized.setxy(window.innerWidth, window.innerHeight)
        //
    } else if (casState === 'timeout') {
        if(casResized.x  != window.innerWidth || casResized.y != window.innerHeight) {
            casState = 'moved'
        }
        casTimeout -= deltaTime/1000;
        //
        if(casTimeout <= 0) {casState = 'resize'; casTimeout = 0}
    } else if (casState === 'resize') {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
        docsize.movexy(window.innerWidth, window.innerHeight, 0.25, easeOutQuint);
        casState = 'idle'
    } else if (casState === 'init') {
        if(casTimeout > 0) {
            ctx.canvas.width = window.innerWidth;
            ctx.canvas.height = window.innerHeight;
            docsize.movexy(window.innerWidth, window.innerHeight, 0.01);
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
};
//
// @EAG RESCALE METHODS
//
function globalRescale() {
    setTimeout(() => {
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
function fillRectRounded(size, pos=new Vector2(), color='#000', radius=12*cvsscale.get()) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, size.x, size.y, [radius]);
    ctx.fill();
};
function fillRectRoundedFrame(size, pos=new Vector2(), color='#000', radius=12*cvsscale.get()) {
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
        for(let i = 0; i < array.length; i++) {
            ctx.fillText(array[i], pos.x, pos.y + (size.y + spacing) * (i+1))
        }
    } else if(ctx.textAlign === 'end') {
        for(let i = 0; i < array.length; i++) {
            ctx.fillText(array[i], pos.x + size.x, pos.y + (size.y + spacing) * (i+1))
        }
    } else {
        for(let i = 0; i < array.length; i++) {
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
            if(this.rM !== 0) {this.r += this.rD; this.rM = 0};
            if(this.gM !== 0) {this.g += this.gD; this.gM = 0};
            if(this.bM !== 0) {this.b += this.bD; this.bM = 0};
            if(this.aM !== 0) {this.a += this.aD; this.aM = 0};
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
            var height = this.height * cvsscale.get();
            var tap = this.tap.get() * cvsscale.get();
            //
            this.shape = this.shapefunc(this.pos.get().sumxy(0, tap), size, [12 * cvsscale.get()]);
            this.shadow = this.shapefunc(this.pos.get().sumxy(0, tap+1), size.sumxy(0, height-tap), [12 * cvsscale.get()]);
            if(!this.initactivity) {this.state = shapeCollisionState(this.shadow, false)} 
            else {setTimeout(() => {this.active = true}, 500); this.initactivity = false};
            //
            if(this.state !== 'unaval') {
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
        this.shapesize = new Vector2(this.image.naturalWidth, this.image.naturalHeight).sumv(this.spacing);
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
            // this.shapecm.alphaMult(this.alpha);
            this.shapeclr = this.shapecm.get();
            this.shadowclr = this.shapecm.idle.light(50).getColor();
            // draw
            ctx.globalAlpha = this.alpha.get();
            fillShape(this.shadow, this.shadowclr);
            fillShape(this.shape, this.shapeclr);
            this.imagepos = this.pos.get().sumv(this.spacing.get()).sumxy(0, this.tap.get());
            drawImageSized(this.image, this.imagepos, this.shapesize.minv(this.spacing.get().multxy(2)));
            ctx.globalAlpha = 1
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
        var height = this.height * cvsscale.get();
        var tap = this.tap.get() * cvsscale.get();
        //
        this.shape = this.shapefunc(this.pos.get().sumxy(0, tap), this.size.get(), [12 * cvsscale.get()]);
        this.shadow = this.shapefunc(this.pos.get().sumxy(0, tap+1), this.size.get().sumxy(0, height-tap), [12 * cvsscale.get()]);
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
                this.shdw.fadeTo(colorMatrix(`rgba(255,63,255,0.4)`), 0.25)
            } else if(tagSelection[this.tag] === 'inc') {
                this.tap.move(0, 0.25, easeOutCirc);
                this.shdw.fadeTo(colorMatrix(`rgba(63,255,63,0.8)`), 0.25)
            } else {
                if(tap === height) {this.tap.move(0, 0.25, easeOutCirc)} 
                else {this.tap.move(height, 0.25, easeParabolaQuad)};
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
        // shapes
        this.shadow = shapeRectRounded(this.pos, this.size, this.radius * cvsscale.get());
        this.shape = shapeRectRounded(this.pos.sumxy(this.spacing * cvsscale.get()), this.size.minxy(this.spacing*2 * cvsscale.get()).multxy(this.pointer, 1), this.radius * cvsscale.get())
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
// @EAG TEXT METHODS
//
function scaleFont(size, font, style=false) {
    ctx.font = style !== false
    ? `${style} ${size * cvsscale.get()}px ${font}`
    : `${size * cvsscale.get()}px ${font}`
};
function scaleFontObject(fontobject) {
    ctx.font = fontobject.style !== false
    ? `${fontobject.style} ${fontobject.size * cvsscale.get()}px ${fontobject.font}`
    : `${fontobject.size * cvsscale.get()}px ${fontobject.font}`
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
    for(i in array) {
        if(getTextMetrics(array[i]).x > w.x) {w = getTextMetrics(array[i])}
    };
    return w
};
function getMaxTextLength(array) {
    var w = 0;
    for(i in array) {
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
function textSplitByLength(full='', len) {
    if(full.length <= len) {return [full]}
    else {
        var ma=0, mb=0, fragment = '', result = [];
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
        };
        // если меньше, то остаток строки будет отправлен в result и на этом функция завершится
        result.push(full.substring(ma));
        return result
    }
};
//
function textWidthFit(text, width) {
    // textbox fill
    var state = 'measure', strings = [], measure, pointer, settext = text;
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
        }
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
    };
    draw() {
        var pointer;
        // update all
        this.pos.update();
        this.size.update();
        this.margin.update();
        this.shadow.update();
        this.dissolving ? this.dissolve.update() : false;
        // detect text changes
        if(this.state === '' && this.settext !== this.text) {
            this.settext = this.text;
            this.state = 'measure'
        };
        //
        // textbox fill
        while(this.state !== '') {
            if(this.state === 'measure') {
                this.measure = getTextMetrics(this.settext);
                if(this.measure.x <= this.size.get().x) {
                    this.strings.push(this.settext);
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
                    }
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
            }
        };
        // ограничиваем ширину текста изменяя расстояние между знаками
        var letters = 0-((this.shadow.getFixed().x - this.shadow.get().x)/(getMaxTextLength(this.complet)-1));
        // if(letters > 0) {letters = 0};
        ctx.letterSpacing = `${letters}px`;
        // draw
        var p = this.pos.get();
        this.dissolving ? ctx.globalAlpha = this.dissolve.get() : false;
        for(let i = 0; i < this.complet.length; i++) {
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
    offset: 15,
    pose: new Vector2(),
    //
    font: 'Segoe UI Light',
    fsize: 14,
    spacing: 3,
    //
    scaletime: 0,
    //
    time: 0.33,
    cd: 0,
    alpha: new Vector1(0),
    //
    invoke: (text) => {
        hoverHint.text = text;
        hoverHint.cd = hoverHint.time
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
            fillTextFast(normalAlign(new Vector2(0.99, 0.01)).sumxy(0, 32 * cvsscale.get()), txt('prefScale') + floatNumber(cvsscale.get(), 2));
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
        ctx.globalAlpha = hoverHint.alpha.get();
        hoverHint.main.text = hoverHint.text;
        hoverHint.fit = hoverHint.main.shadow.getFixed();
        // moving alpha
        if(hoverHint.text == '' && hoverHint.alpha.getFixed() !== 0) {hoverHint.alpha.move(0, hoverHint.time, easeInOutCubic)};
        if(hoverHint.alpha.get() > 0) {
            // scale
            hoverHint.main.size.x = hoverHint.box * cvsscale.getFixed();
            hoverHint.main.margin = hoverHint.margin.multxy(cvsscale.get());
            var offset = hoverHint.offset * cvsscale.get();
            // get pos
            mouse.pos.x + offset + hoverHint.fit.x > cvssize.x
            ? hoverHint.pose.x = mouse.pos.x - hoverHint.fit.x
            : hoverHint.pose.x = mouse.pos.x + offset;
            mouse.pos.y + offset + hoverHint.fit.y > cvssize.y
            ? hoverHint.pose.y = mouse.pos.y - hoverHint.fit.y
            : hoverHint.pose.y = mouse.pos.y + getTextMetrics(hoverHint.text).y;
            // draw
            hoverHint.main.pos = hoverHint.pose;
            hoverHint.main.spacing = hoverHint.spacing * cvsscale.get();
            ctx.textAlign = 'start';
            hoverHint.main.castShadow();
            ctx.fillStyle = '#fff';
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
let imageNotFound = invokeNewImage('images/notfound.jpg');
function tryImage(image) {
    var error = true;
    try {
        drawImageSized(image, new Vector2(), new Vector2())
    } catch (e) {
        error = false
    }
    return error
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
            var border = fitImageBorder * cvsscale.get();
            ctx.globalAlpha = this.alpha;
            var glal = normalAlign(this.align, this.fitsize.sumxy(border).multxy(this.zoom));
            fillRect(this.fitsize.multxy(this.zoom).sumxy(border*2), glal.minxy(border), this.bgColor.alpha(pref.bgalpha).getColor());
            drawImageSized(this.image, glal, this.fitsize.multxy(this.zoom))
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
    shape.roundRect(pos.x, pos.y, size.x, size.y, 4 * cvsscale.getFixed());
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
        for(b in sites.buttons) {
            sites.buttons[b].state = 'unaval'
        };
        // врубаем доступные
        sites.actives = {};
        sites.buttons['shikimori.one'].state = 'idle';
        sites.buttons['shikimori.one'].oldstate = 'idle';
        sites.actives['shikimori.one'] = sites.buttons['shikimori.one'];
        //
        var len = 1;
        for(b in sites.sources) {
            len++;
            sites.buttons[b].state = 'idle';
            sites.buttons[b].oldstate = 'idle';
            sites.actives[b] = sites.buttons[b]
        };
        // cсылки и размер
        siteUpdateURLs(sites.sources);
        sites.resizeButtons();
        // возвращаем в центр недоступные
        for(b in sites.buttons) {
            if(sites.buttons[b].state == 'unaval') {
                sites.buttons[b].alpha.set(0);
                // sites.buttons[b].pos.setv(sites.pos.sumxy(siteButtonSize/2, 0), siteButtonTime, easeInOutSine)
            }
        };
        var xanchor = siteButtonSize * cvsscale.get() * (len/2);
        sites.len = len; len = 0;
        for(b in siteSequence) {
            if(sites.actives[siteSequence[b]] === undefined) {continue};
            sites.actives[siteSequence[b]].alpha.move(1, siteButtonTime);
            sites.poses[siteSequence[b]].applyMod();
            sites.poses[siteSequence[b]].movexy(-xanchor + siteButtonSize * cvsscale.get() * len, 0, siteButtonTime, easeInOutSine);
            len++
        }
    },
    //
    resizeButtons: () => {
        var xanchor = siteButtonSize * cvsscale.get() * (sites.len/2);
        var len = 0;
        for(b in sites.actives) {
            sites.poses[b].movexy(-xanchor + siteButtonSize * cvsscale.get() * len, 0, 0.25, easeOutCirc);
            sites.actives[b].sizedZoom(new Vector2(siteButtonSize * cvsscale.get()));
            len++
        }
    },
    //
    draw: (pos) => {
        // позиционирование
        sites.pos.setv(pos);
        // рисуем онли доступные кнопки
        for(b in sites.actives) {
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
for(b in sites.buttons) {
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
    for(s in siteArray) {
        for(n in siteNames) {
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
    return Math.norma(x) < 0.5 ? `rgba(${255*x*2},255,63,1)` : `rgba(255,${255-255*(x-0.5)*2},63,1`
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
    return Number(filterChangesText) == 0
    ? txt('infoNoChanges')
    : txt('infoChangesCount') + filterChangesText;
};
//
let tInfo = {
    //
    spacing: tinfSpacing * cvsscale.get(),
    box: tinfBoxSize * cvsscale.get(),
    //
    anchor: new Vector2(0.05, 0.95),
    pos: new Vector2(),
    height: (tinfBoxSize * cvsscale.get() - (tinfSpacing * cvsscale.get() * 9)) / 8,
    width: tinfBoxSize * cvsscale.get() - (tinfSpacing * cvsscale.get() * 2),
    //
    title: null,
    rating: null,
    updater: tinfTime,
    usePreset: true,
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
        // позиция, бг
        tInfo.spacing = tinfSpacing * cvsscale.get();
        tInfo.box = tinfBoxSize * cvsscale.get();
        tInfo.pos = normalAlign(tInfo.anchor, new Vector2(tInfo.box));
        fillRectRounded(new Vector2(tInfo.box), tInfo.pos, `rgba(0,0,0,${pref.bgalpha})`, 10*cvsscale.get());
        // размеры элементов
        tInfo.height = (tinfBoxSize * cvsscale.get() - (tinfSpacing * cvsscale.get()) * 9) / 8,
        tInfo.width = tinfBoxSize * cvsscale.get() - (tinfSpacing * cvsscale.get() * 2),
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
            new Vector2(tInfo.width * (tInfo.episodes.get() / filterDefault.episodeMax), tInfo.height*0.2),
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
        if(tInfo.usePreset) {
            fillTextFast(tInfo.posit(3).sumxy(tInfo.width/2, tInfo.height*0.7), textStringLimit(txt('infoPreset') + presetbase[presetSelected].name, tInfo.width));
            scaleFont(tinfFontSize, 'Segoe UI');
            fillTextFast(tInfo.posit(4).sumxy(tInfo.width/2, tInfo.height*0.5), filterChangesString());
        };
        // MAL оценки
        scaleFont(tinfFontSize, 'Segoe UI', 'bold');
        fillTextFast(tInfo.posit(5).sumxy(tInfo.width*0.5, tInfo.height*0.7), txt('malHead'));
        if(tInfo.rating  === null) {
            fillTextFast(tInfo.posit(6).sumxy(tInfo.width*0.5, tInfo.height*0.7), txt('mal404'))
        } else {
            scaleFont(tinfFontSize, 'Segoe UI');
            fillTextFast(tInfo.posit(6).sumxy(tInfo.width*0.5, tInfo.height*0.5), txt('malScore') +  tInfo.score);
            fillTextFast(tInfo.posit(7).sumxy(tInfo.width*0.5, tInfo.height*0.3), txt('malScoredBy') + tInfo.scoredby)
        }
    },
};
//
// @EAG DESCRIPTION OBJECT
//
let descrFontFamily = 'Segoe UI';
let descrFontSize = 13;
let descrFontSpacing = 0.2;
let descrWait = 1;
//
let descrTransFunctions = {
    'get-ru': () => {
        tDesc.scroll = 0;
        if(!tDesc.terror) {
            playSound(sound['player']);
            translator.ru(jikan._response.data.synopsis);
            tDesc.translate = false;
            tDesc.original = false;
            tDesc.tstate = 'work';
            decsrTranslate.onclick = () => {};
            decsrTranslate.text = '...';
            decsrTranslate.state = 'unaval'
        }
    },
    'orig': () => {
        tDesc.scroll = 0;
        if(!tDesc.terror) {
            tDesc.original = true;
            decsrTranslate.onclick = descrTransFunctions['trans'];
            decsrTranslate.text = txt('wordTranslate');
            tDesc.alpha.set(0);
            tDesc.alpha.move(1, 0.25)
        }
    },
    'trans': () => {
        tDesc.scroll = 0;
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
let tDesc = {
    anchor: new Vector2(0.95),
    pos: new Vector2(),
    size: tinfBoxSize * cvsscale.get(),
    spacing: 0,
    fsize: 0,
    //
    malid: null,
    desc: [txt('descNone')],
    height: 0,
    //
    max: 0,
    scroll: 0,
    indicate: [false, false],
    //
    original: true,
    showing: [],
    alpha: new Vector1(0),
    //
    wait: 0,
    request: true,
    apply: true,
    //
    translate: false,
    tstate: 'idle',
    terror: false,
    tdesc: [],
    //
    newDesc: () => {
        decsrTranslate.state = 'unaval';
        if(pref.autoScroll && roulette.dragged === false) {
            tDesc.desc = [txt('descRoll')];
            tDesc.request = false;
            return
        };
        tDesc.malid = malAnimeID(roulette.centerAnime.sources);
        tDesc.scroll = 0;
        tDesc.apply = true;
        if(tDesc.malid == null) {
            tDesc.desc = [txt('descNone')];
            tDesc.request = false;
            return
        } else {
            tDesc.desc = [txt('descWait')];
            tDesc.wait = Number(descrWait);
            tDesc.request = true
        }
    },
    //
    resize: () => {
        scaleFont(descrFontSize, 'Segoe UI');
        if (tDesc.apply) {
            // var height;
            [tDesc.desc, tDesc.height] = textWidthFit(jikan._response.data.synopsis, tInfo.box - (tInfo.spacing*2 + tDesc.fsize));
            // [tDesc.tdesc, tDesc.height] = textWidthFit(translator.single, tInfo.box - (tInfo.spacing*2 + tDesc.fsize));
            // tDesc.original ? null : tDesc.height = height
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
        tDesc.scroll = 0
    },
    //
    draw: () => {
        // scale
        tDesc.fsize = descrFontSize * cvsscale.get();
        // обновления, позиция, задний фон
        tDesc.alpha.update();
        tDesc.pos = normalAlign(tDesc.anchor, new Vector2(tInfo.box));
        fillRectRounded(new Vector2(tInfo.box), tDesc.pos, `rgba(0,0,0,${pref.bgalpha})`, 10*cvsscale.get());
        // заголовок
        ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
        scaleFont(tinfHeaderSize, 'Segoe UI', 'bold');
        fillTextFast(tDesc.pos.sumxy(tInfo.box/2, -tInfo.spacing*2)  , txt('descHead'));
        // получаем данные
        tDesc.wait > 0 ? tDesc.wait -= deltaTime : tDesc.wait = 0;
        if(tDesc.request && tDesc.wait <= 0) {
            tDesc.request = false;
            tDesc.apply = false;
            jikan.full(tDesc.malid)
        };
        if(!tDesc.apply && jikan._loaded) {
            tDesc.apply = true;
            decsrTranslate.state = 'idle'
            if(jikan._error) {
                tDesc.desc = [txt('descNone')];
                decsrTranslate.state = 'unaval'
            } else {
                scaleFont(descrFontSize, 'Segoe UI');
                [tDesc.desc, tDesc.height] = textWidthFit(jikan._response.data.synopsis, tInfo.box - (tInfo.spacing*2 + tDesc.fsize));
                tDesc.alpha.set(0);
                tDesc.alpha.move(1, 0.25);
                tDesc.scroll = 0
            }
        };
        // ограничение текста
        var fontSpacing = descrFontSpacing * tDesc.fsize * cvsscale.get();
        tDesc.max = Math.floor((tInfo.box - tInfo.spacing*2) / (fontSpacing + tDesc.fsize)) -1;
        // режим показа
        tDesc.original
        ? tDesc.showing = tDesc.desc
        : tDesc.showing = tDesc.tdesc;
        // индикаторы
        tDesc.indicate = [tDesc.scroll + tDesc.max < tDesc.showing.length, tDesc.scroll > 0];
        // скроллинг
        if(mouse.pos.overAND(tDesc.pos) && mouse.pos.lessAND(tDesc.pos.sumxy(tInfo.box))) {
            // паузим рулетку, ещё раз запрашиваем описание если стоп был и продолжаем
            if(tDesc.desc[0] == txt('descRoll')) {
                tDesc.newDesc();
                tDesc.release()
            };
            roulette.pause(3000);
            if(tDesc.max >= tDesc.showing.length) {
                tDesc.scroll = 0
            } else {
                if(wheelState !== 'idle') {
                    if(wheelState === 'top') {
                        if(tDesc.indicate[1]) {tDesc.scroll -= 1}
                    } else {
                        if(tDesc.indicate[0]) {tDesc.scroll += 1}
                    }
                }
            }
        };
        // индикаторы
        ctx.globalAlpha = tDesc.alpha.get();
        ctx.textAlign = 'center';
        scaleFont(descrFontSize, 'Consolas');
        var indic = tDesc.indicate[0]
            ? tDesc.indicate[1] 
                ? '\\/ /\\'
                : '\\/   '
            : tDesc.indicate[1]
                ? '   /\\'
                : '     ';
        fillTextFast(tDesc.pos.sumxy(tInfo.box/2, tInfo.box - tInfo.spacing*2), indic);
        // описание
        scaleFont(descrFontSize, 'Segoe UI');
        ctx.textAlign = 'start';
        for(let i = 0; i < tDesc.max && i < tDesc.showing.length; i++) {
            fillTextFast(tDesc.pos.sumxy(tInfo.spacing, tInfo.spacing + (fontSpacing + tDesc.fsize) * (i + 1) - fontSpacing), tDesc.showing[i + tDesc.scroll]);
        };
        ctx.globalAlpha = 1;
        // кнопка перевода
        ctx.textAlign = 'center';
        // decsrTranslate.size.setxy(tInfo.box/3, tDesc.fsize);
        // decsrTranslate.pos = tDesc.pos.sumxy(tInfo.box).minv(decsrTranslate.size).minxy(tInfo.spacing, tInfo.spacing*2);
        // decsrTranslate.draw();
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
                        [tDesc.tdesc, tDesc.height] = textWidthFit(translator.single, tInfo.box - (tInfo.spacing*2 + tDesc.fsize));
                        tDesc.alpha.set(0);
                        tDesc.alpha.move(1, 0.25);
                        tDesc.scroll = 0;
                        decsrTranslate.onclick = descrTransFunctions['orig'];
                        decsrTranslate.text = txt('wordOriginal');
                        decsrTranslate.state = 'idle';
                        tDesc.translate = true;
                        tDesc.tstate = 'ok'
                    }
                }
            }
        }
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
    rollBar.state = 'hide';
    //
    if(pref.rollNewTrack) {
        buttonDoRoll.text = txt('rbWait');
        musicRoll.oncanplay = () => {
            playSound(sound['roll']);
            roulette.doRoll(pref.rollTime, pref.rollSpeed);
            srv.hideProgress.value = 0;
            srv.hideProgress.move(1, srv.hideTime, easeInQuad);
            srv.state = 'roll_start';
            buttonDoRoll.state = 'unaval';
            //
            setTimeout(() => {buttonDoRoll.text = txt('rbRoll')}, 2000);
            musicRoll.oncanplay = () => {musicRoll.play()}
        }
    } else {
        playSound(sound['roll']);
        roulette.doRoll(pref.rollTime, pref.rollSpeed);
        srv.hideProgress.value = 0;
        srv.hideProgress.move(1, srv.hideTime, easeInQuad);
        srv.state = 'roll_start';
        buttonDoRoll.state = 'unaval'
    };
    musicRollStart()
};
buttonDoRoll.waitanim = false;
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
// let buttonPrevTitle = new TextButtonShaped(shapeRectRounded, '<<', new Vector2(40, 40),
//     colorMapMatrix(colorMapForeDefault),
//     colorMapMatrix(`rgba(0,0,0,0)#rgba(63,63,255,0.25)#rgba(63,63,255,1)#rgba(0,0,0,0)`));
// let buttonNextTitle = new TextButtonShaped(shapeRectRounded, '>>', new Vector2(40, 40),
//     colorMapMatrix(colorMapForeDefault),
//     colorMapMatrix(`rgba(0,0,0,0)#rgba(63,63,255,0.25)#rgba(63,63,255,1)#rgba(0,0,0,0)`));
// buttonPrevTitle.onclick = () => {
//     roulette.speed.set(0); roulette.dragged = 5000;
//     roulette.progress.move(Math.round(roulette.progress.getFixed())-1, 0.3, easeOutCirc)
// };
// buttonNextTitle.onclick = () => {
//     roulette.speed.set(0); roulette.dragged = 5000;
//     roulette.progress.move(Math.round(roulette.progress.getFixed())+1, 0.3, easeOutCirc)
// };
//
let rollBar = {
    anchor: new Vector2(0.5, 1.2),
    normal: new Vector2(0.5, 0.95),
    hide: new Vector2(0.5, 1.2),
    //
    pos: new Vector2(),
    size: new Vector2(cvssize.x * 0.45, rbBodyHeight*cvsscale.get()),
    alpha: new Vector1(0),
    spacing: 0,

    //
    state: 'init',
    time: 1,
    //
    draw: () => {
        // scale
        rollBar.spacing = rbSpacing * cvsscale.get();
        // update
        rollBar.anchor.update();
        rollBar.alpha.update();
        ctx.globalAlpha = rollBar.alpha.get();
        // размеры и задний фон
        rollBar.size.setxy(cvssize.x * 0.45, rbBodyHeight * cvsscale.get());
        rollBar.pos = normalAlign(rollBar.anchor.get(), rollBar.size);
        rbRollWidth = (rollBar.size.y - rollBar.spacing*2)*2 + rollBar.spacing;
        // рисуем
        if(rollBar.state !== 'init' && rollBar.state !== 'invis') {
            fillRectRounded(rollBar.size, rollBar.pos, `rgba(0,0,0,${pref.bgalpha})`, 10*cvsscale.get());
            // крутить
            ctx.textAlign = 'center';
            scaleFont(36, 'Arial', 'bold');
            buttonDoRoll.size.setxy(rbRollWidth, rollBar.size.y-rollBar.spacing*2);
            buttonDoRoll.pos.setv(rollBar.pos.sumxy(rollBar.spacing));
            buttonDoRoll.draw();
            // карта
            scaleFont(16, 'Segoe UI', 'bold');
            drawMapRoulette(rollBar.size.x - (rbRollWidth*2 + rollBar.spacing*4), rollBar.pos.sumxy(rbRollWidth + rollBar.spacing*2, rollBar.size.y*0.75 - rmpBarHeight/2));
            // ctx.fillStyle = "#fff";
            // fillTextFast(
            //     rollBar.pos.sumxy(rollBar.size.x/2, rollBar.size.y/2 - rollBar.spacing/2), 
            //     `${Math.round(roulette.progress.get())+1}/${roulette.picsCount} | ${1234}`);
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
    ctx.fillText(timeStringify(musicNormalComplete ? value : 0), mouse.pos.x-(2*cvsscale.get()), mlcMusicBar.pos.y+mlcBarSize.y+(14*cvsscale.get()))
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
    draw: () => {
        if(pref.playerShow) {musicLite.drawfunc()}
    },
    drawfunc: () => {
        // scale
        var spacing = mlcSpacing * cvsscale.get();
        var barsize =  mlcBarSize.multxy(cvsscale.get());
        var buttonsize = mlcButtonSize * cvsscale.get();
        // position
        musicLite.size = new Vector2(buttonsize*2 + spacing*2 + barsize.x, buttonsize);
        musicLite.pos = normalAlign(musicLite.anchor, musicLite.size).sumxy(0, spacing);
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
        ctx.fillText(trackname, musicLite.pos.x + buttonsize + spacing*2, musicLite.pos.y + 20 * cvsscale.get());
        if(mouse.pos.overAND(musicLite.pos.sumxy(buttonsize + spacing, spacing)) && pref.bgmusic > 0 &&
        mouse.pos.lessAND(musicLite.pos.sumv(musicLite.size).minxy(buttonsize + spacing, buttonsize/2))) {
            hoverHint.invoke(txt('hintTrackName') + musicLite.fullname)};
        //
        ctx.textAlign = 'end';
        musicLite.dur = musicNormalComplete ? musicNormal.duration : 0;
        ctx.fillText(`${timeStringify(musicNormal.currentTime)} - ${timeStringify(musicLite.dur)}`,
        musicLite.pos.x + buttonsize + barsize.x, musicLite.pos.y + 20 * cvsscale.get());
        // load anim
        if(!musicNormalComplete) {
            musicLite.loada += musicLite.loada < 1 ? deltaTime/1000 : null;
            musicLite.load >= 1 ? musicLite.load = 0 : musicLite.load += deltaTime/1000; 
            ctx.lineWidth = 6; ctx.strokeStyle = `rgba(255,255,255,${Math.norma(musicLite.loada-0.25)})`;
            rotatingArc(musicLite.load, 18 * cvsscale.get(), musicLite.pos.sumxy(buttonsize + spacing + barsize.x/2, buttonsize/2))
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
    centerAnime: adb[0],
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
        for(let i=0; i<roulette.picsCount; i++) {
            roulette.pics[i] = new Image();
            roulette.pics[i].onerror = () => {roulette.pics[i].src = 'images/notfound.jpg'};
            if(array[i]['picture'] !== undefined) {
                roulette.pics[i].src = array[i]['picture']
            } else {
                roulette.pics[i].src = 'images/notfound.jpg';
                console.warn(`roulette.picsGet -> argument -> array[${i}]['picture'] is undefined!`);
            }
        }
    },
    setFrames: () => {
        for(pic in roulette.pics) {
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
        for(pic in roulette.pics) {
            if(roulette.pics[pic].complete) {progress++}
        };
        return progress
    },
    centerItem: () => {
        if(roulette.picsCount > 1) {
            var flag = Math.round(roulette.progress.get());
            while(flag < 0) {flag += roulette.picsCount};
            while(flag > roulette.picsCount - 1) {flag -= roulette.picsCount};
            return roulette.anime[flag]
        } else {
            return Math.norma(roulette.picsCount)
        }
    },
    winnerCentered: () => {
        return roulette.winnerPos == Math.round(roulette.progress.get())
    },
    centerNumber: () => {
        if(roulette.picsCount > 1) {
            var n = Math.round(roulette.progress.get());
        while(n < 0) {n += roulette.picsCount};
        while(n > roulette.picsCount - 1) {n -= roulette.picsCount};
        return n
        } else {
            return Math.norma(roulette.picsCount)
        }
    },
    speed: new Vector1(0),
    time: 0, atime: 0,
    catchWinner: false,
    speedMax: 0,
    randomizer: 0.5,
    doRoll: (time, speed) => {
        winnerRelease.move(0, 2, easeOutQuint);
        blinkProgress.set(0);
        if(roulette.winnerPos >= 0) {setTimeout(() => {
            roulette.pics[roulette.winnerPos].bgColor = new Color(0,0,0,1);
            roulette.winnerPos = -1
        }, 500)};
        roulette.time = 0;
        roulette.atime = time * (1 + (Math.random() * roulette.randomizer) - roulette.randomizer/2);
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
                winnerRelease.move(1, 2, easeOutQuint);
                roulette.time = roulette.atime;
                console.log('Winner: '+roulette.catchWinner['title'] + '\n    ' + roulette.catchWinner['sources'][0]);
                musicRollEnd();
                setTimeout(() => {playSound(sound['winner'])}, 100);
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
        // циклируем
        if(roulette.progress.get() >= roulette.picsCount) {
            roulette.progress.value -= roulette.picsCount;
            if(roulette.picsCount === 1) {
                playSound(sound['scroll'])
            }
        } else if(roulette.progress.get() <= -1) {
            roulette.progress.value += roulette.picsCount;
            if(roulette.picsCount === 1) {
                playSound(sound['scroll'])
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
            ctx.fillText('Рулетка пуста!', pos.x, pos.y)
        } else if (roulette.picsCount == 1) {
            // в рулетке 1 тайтл
            roulette.hidemap = true;
            var transform = rouletteItemsMapper(0.5);
            var item = roulette.pics[0];
            item.align = transform.align.sumv(roulette.addAlign);
            item.zoom = transform.zoom * roulette.zoomMult;
            item.alpha = transform.alpha * roulette.alphaMult;
            item.bgcolor = roulette.winnerStyle;
            item.draw()
        } else {
            // подготавливаем картинки
            for(let i = 0; i < pref.rollImages; i++) {
                var item, elem = Math.round(roulette.progress.get()) - Math.floor(pref.rollImages/2) + i;
                elem = elem - Math.floor(elem / roulette.picsCount) * roulette.picsCount;
                //
                var transform = rouletteItemsMapper((i-depos+0.5)/pref.rollImages);
                if(pref.rollImages >= roulette.pics.length) {
                    item = roulette.pics[elem].copy()
                } else {
                    item = roulette.pics[elem]
                };
                // transform
                item.align = transform.align.sumv(roulette.addAlign);
                item.zoom = transform.zoom * roulette.zoomMult;
                item.alpha = transform.alpha * roulette.alphaMult;
                if(elem === roulette.winnerPos) {item.bgColor = roulette.winnerStyle};
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
            for(a in roulette.sorted) {
                roulette.sorted[a].draw()
            }
        }
    },
};
//
function rouletteSetItems(array) {
    roulette.complete = false;
    roulette.winnerPos = -1;
    roulette.catchWinner = false;
    roulette.progress.set(Math.floor(roulette.anime.length/2));
    roulette.speed.reset();
    //
    if(array.length > pref.rouletteItems) {
        roulette.picsCount = pref.rouletteItems;
        roulette.picsGet(array.slice(0, pref.rouletteItems))
    } else {
        roulette.picsCount = array.length;
        roulette.picsGet(array)
    };
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
    var tf = {align: new Vector2(), zoom: cvsscale.get(), alpha: 0};
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
let winnerRelease = new Vector1(0);
let blinkProgress = new Vector1(0);
function gradWinner(hue = 180) {
    blinkProgress.update();
    winnerRelease.update();
    var d = cvssize;
    var p = (blinkProgress.get()*0.98)+0.01;
    const r = winnerRelease.get();
    //
    const cy = `hsl(${hue}deg 100% 45%)`;
    const cw = `hsl(${hue}deg 100% 80%)`;
    const cb = fitFrameBg.getColor();
    //
    var lg = ctx.createLinearGradient(100, 100, d.x, d.y);
    if(r !== 1) {
        lg.addColorStop(0, cy);
        lg.addColorStop(Math.norma(r), cy);
        lg.addColorStop(Math.norma(r+0.05), cb);
        lg.addColorStop(1, cb);
    } else {
        lg.addColorStop(0, cy);
        if(blinkProgress.isMoving()) {
            lg.addColorStop(Math.norma(p-0.025), cy);
            lg.addColorStop(Math.norma(p), cw);
            lg.addColorStop(Math.norma(p+0.025), cy)
        };
        lg.addColorStop(1, cy);
        //
        if(!blinkProgress.isMoving()) {
            if(_rng < 500) {
                blinkProgress.set(1);
                blinkProgress.move(0, 3, easeInOutSine)
            }
        }
    };
    //
    var o = {
        getColor : () => {
            return lg
    },};
    return o
};
//
let rmpBarHeight = 10;
let rouletteMapBar = new ShapedSelectBar(new Vector2(cvssize.x*0.3, rmpBarHeight*cvsscale.get()), colorMatrix(`rgba(0,0,0,0)`), colorMatrix(`rgba(0,0,0,0.5)`));
rouletteMapBar.permanent = true;
rouletteMapBar.onset = (value) => {
    roulette.progress.set(value);
    roulette.dragged = 5000
};
rouletteMapBar.unpress = (value) => {
    roulette.progress.move(Math.round(value), 0.5, easeOutCirc);
    roulette.dragged = 5000
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
    rouletteMapBar.size = new Vector2(width, rmpBarHeight*cvsscale.get());
    rouletteMapBar.pos = pos;
    var p = roulette.progress.get(); p = p > roulette.picsCount ? roulette.picsCount : p < 0 ? 0 : p;
    rouletteMapBar.update(p, roulette.picsCount);
    rouletteMapBar.draw()
};
//
// @EAG SCREEN LOADING
//
let sload = {
    state: 'show',
    time: 1,
    init: false,
    //
    alpha: new Vector1(0),
    bgcolor: 'rgba(48,48,143,1)',
};
// window.onload = () => {sload.state = 'show'};
//
let firstMouseEvent = false;
let dynamicBgcolor = colorMatrix(sload.bgcolor).alpha(0);
let staticBgcolor = '#000';
let imageLoadProgress = new TextBox(normalAlign(new Vector2(0.5, 0.3)), new Vector2(400 * cvsscale.get()));
let loadImagesBar = `rgba(200,200,200,0.2)#rgba(255,255,255,0.8)#rgba(0,0,0,1)#rgba(0,0,0,1)`;
//
function screenLoading() {
    imageLoadProgress.size.setxy(400 * cvsscale.get());
    imageLoadProgress.margin.setxy(10 * cvsscale.get());
    var spbsize =  new Vector2(fullsize.x, 8 * cvsscale.get());
    fillRect(fullsize, normalAlign(new Vector2(0.5), fullsize), dynamicBgcolor.getColor());
    //
    if(sload.state === 'show') {
        sload.alpha.move(1, sload.time, easeInOutSine);
        dynamicBgcolor.fadeTo(colorMatrix(sload.bgcolor), sload.time);
        imageLoadProgress.text = txt('loadJkrg');
        imageLoadProgress.shadow.x = imageLoadProgress.size.x;
        databaseShorter();
        //
        sload.state = 'wait'
    //
    } else if(sload.state === 'wait') {
        sload.alpha.update();
        dynamicBgcolor.update();
        shapeProgressBar(normalAlign(new Vector2(0.5, 0), spbsize), spbsize, sload.alpha.get(), colorMapMatrix(loadImagesBar));
        //
        if(sload.alpha.get() >= 1) {
            sload.alpha.set(1);
            dynamicBgcolor = colorMatrix(sload.bgcolor);
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
            rouletteSetItems(lsLoadObject('roulette.anime'));
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
        if(!firstMouseEvent) {imageLoadProgress.text = txt('loadFirstEvent')};
        if(roulette.complete) {
            if((mouse.click && mouse.pos.overSAND(new Vector2()) && mouse.pos.lessSAND(cvssize)) || firstMouseEvent) {
                roulette.progress.set(-20);
                roulette.speed.reset();
                if(!lsItemUndefined('roulette.winner')) {
                    [roulette.winnerPos, roulette.catchWinner] = lsLoadObject('roulette.winner', [roulette.winnerPos, roulette.catchWinner]);
                    roulette.progress.move(roulette.winnerPos, 3, easeOutQuint);
                    setTimeout(() => {winnerRelease.move(1, 2, easeOutQuint); setTimeout(() => {playSound(sound['winner'])}, 100)}, 3*1000)
                } else {
                    roulette.progress.move(0, 3, easeOutQuint)
                };
                setTimeout(() => {roulette.initsound = false}, 3000);
                //
                musicInitialize();
                if(!firstMouseEvent) {playSound(sound['loaded']); firstMouseEvent = true};
                rollBar.state = 'show';
                srv.state = 'show_roulette';
                //
                sload.state = 'none';
                staticBgcolor = sload.bgcolor;
                dynamicBgcolor = new Color(0,0,0,0);
                requestScreen(screenRoulette)
            }
        }
    };
    //
    ctx.globalAlpha = sload.alpha.get();
    //
    var center = fullAlign(new Vector2(0.5, 0.5));
    var sizei = new Vector2(200 * cvsscale.get());
    var spacing = 15 * cvsscale.get();
    drawImageSized(imageChangeFilter, center.minxy(sizei.x/2, sizei.y).minxy(0, spacing), sizei);
    imageLoadProgress.pos = center.sumxy(0, imageLoadProgress.shadow.get().y/2 + spacing);
    ctx.textAlign = 'center';
    imageLoadProgress.castShadow();
    ctx.fillStyle = '#fff';
    scaleFont(28, 'Segoe UI');
    imageLoadProgress.draw();
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
let namebox = new TextBox(new Vector2(), new Vector2(640 * cvsscale.get(), 0));
namebox.dissolving = true;
namebox.shadow.x = namebox.size.x/2;
//
_lastbufferedtitle = '';
namebox.onupd = () => {
    // scale
    namebox.size.x = cvssize.x * 0.45;
    namebox.margin = srv.margin.multxy(cvsscale.get());
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
    sload.init = true;
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
        ctx.globalAlpha = (1 - srvhp);
        tDesc.draw(); 
        tInfo.draw(); 
        musicLite.draw();
        ctx.globalAlpha = 1;
        if(srvhp <= 0) {
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
    //
    } else if(srv.state === 'roll_start') {
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
        ctx.globalAlpha = (1 - srvhp);
        tDesc.draw(); 
        tInfo.draw(); 
        musicLite.draw();
        ctx.globalAlpha = 1;
        //
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
        //
        roulette.draw();
        if(typeof roulette.catchWinner !== 'boolean') {
            // other
            srv.hideProgress.value = 1;
            srv.hideProgress.move(0, srv.hideTime, easeOutExpo);
            srv.state = 'roll_stop';
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
        ctx.globalAlpha = (1 - srvhp);
        tDesc.draw(); 
        tInfo.draw(); 
        musicLite.draw();
        ctx.globalAlpha = 1;
        //
        if(srvhp <= 0) {
            namebox.state = 'measure';
            srv.state = 'idle'
        }
    }
};
//
// @EAG DEFAULT SCREEN BLOCKS
//
// hint operator
let sbBlockHint = {
    size: 32,
    logo: invokeNewImage('images/hint.png'),
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
    ctx.fillStyle = '#fff';
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
    ctx.fillText(text2, (pos.x + width) - (spacing*2 + bar.size.x), pos.y + sizey - spacing*2 - scroll);
    ctx.textAlign = 'start';
    ctx.fillText(text, pos.x + spacing, pos.y + sizey - spacing*2 - scroll);
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
    for(key in presetbase) {
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
    for(key in tagSelection) {
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
    filterDefault['scoreMin'] = promptNumber(`${txt('promIntLess')} ${filterDefault['scoreMax']*10}.`, 0, filterDefault['scoreMax']*10-1, filterDefault['scoreMin']*10)/10;
    filterPrecount.request();
    lsSaveObject('filterDefault', filterDefault)
};
let buttonFilterScoreMax = new TextButtonShaped(shapeRectRounded, filterDefault['scoreMax'], filterPromptSize,
colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
colorMapMatrix(`rgba(32,128,128,1)#rgba(48,180,180,1)#rgba(64,255,255,1)#rgba(200,200,47,0.1)`));
buttonFilterScoreMax.onclick = () => {
    playSound(sound['prompt']);
    filterDefault['scoreMax'] = promptNumber(`${txt('promIntOver')} ${filterDefault['scoreMin']*10}.`, filterDefault['scoreMin']*10+1, 100, filterDefault['scoreMax']*10)/10;
    filterPrecount.request();
    lsSaveObject('filterDefault', filterDefault)
};
// rescale functions
function rescaleFilterButtons() {
    var measure, spacing;
    var spacing = filterButtonsSpacing * cvsscale.get();
    ctx.textAlign = 'center';
    // preset
    scaleFontObject(presetButtonFont);
    for(key in presetbase) {
        measure = ctx.measureText(presetbase[key].name);
        presetButtons[key].size = new Vector2(Math.floor(measure.width), measure.fontBoundingBoxAscent).sumxy(spacing*2)
    };
    // tags
    scaleFontObject(tagButtonsFont);
    for(key in tagbase) {
        measure = ctx.measureText(tagbase[key].name);
        tagButtons[key].size = new Vector2(Math.floor(measure.width), measure.fontBoundingBoxAscent).sumxy(spacing*2)
    };
    // sts
    for(key in seasonButtons) {rescaleAnotherButton(seasonButtons, key)};
    for(key in typeButtons) {rescaleAnotherButton(typeButtons, key)};
    for(key in statusButtons) {rescaleAnotherButton(statusButtons, key)};
    // other
    buttonFilterYearMin.size = filterPromptSize.multxy(cvsscale.get());
    buttonFilterYearMax.size = filterPromptSize.multxy(cvsscale.get());
    buttonFilterEpsMin.size = filterPromptSize.multxy(cvsscale.get());
    buttonFilterEpsMax.size = filterPromptSize.multxy(cvsscale.get());
    buttonScoreAllow.size = filterPromptSize.multxy(cvsscale.get());
    buttonFilterScoreMin.size = filterPromptSize.multxy(cvsscale.get());
    buttonFilterScoreMax.size = filterPromptSize.multxy(cvsscale.get());
    // main
    buttonFilterLeave.size = filterThreeSize.multxy(cvsscale.get());
    buttonFilterApply.size = filterThreeSize.multxy(cvsscale.get());
    buttonFilterReset.size = filterThreeSize.multxy(cvsscale.get());
    buttonSwitchPreset.size = filterThreeSize.multxy(cvsscale.get());
};
function rescaleAnotherButton(object, key) {
    var measure = ctx.measureText(txt(key));
    object[key].size = new Vector2(Math.floor(measure.width), measure.fontBoundingBoxAscent).sumxy(filterButtonsSpacing*cvsscale.get()*2);
};
//
function actualizeFilterButtons() {
    for(key in seasonButtons) {seasonButtons[key].active = filterDefault[key]};
    for(key in typeButtons) {typeButtons[key].active = filterDefault[key]};
    for(key in statusButtons) {statusButtons[key].active = filterDefault[key]};
    //
    buttonFilterYearMin.text = filterDefault['yearMin'];
    buttonFilterYearMax.text = filterDefault['yearMax'];
    buttonFilterEpsMin.text = filterDefault['episodeMin'];
    buttonFilterEpsMax.text = filterDefault['episodeMax'];
    buttonFilterScoreMin.text = filterDefault['scoreMin'];
    buttonFilterScoreMax.text = filterDefault['scoreMax'];
    buttonScoreAllow.active = filterDefault['scoreAllow'];
};
//
let buttonFilterLeave = new TextButtonShaped(shapeRectRounded, txt('wordBack'), new Vector2(240, 60),
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(24,110,24,1)#rgba(40,160,40,1)#rgba(63,255,63,1)#rgba(200,200,47,0.1)`));
buttonFilterLeave.onclick = () => {requestScreen(screenRoulette, false)};
let buttonFilterApply = new TextButtonShaped(shapeRectRounded, txt('wordApply'), new Vector2(240, 60),
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(24,110,24,1)#rgba(40,160,40,1)#rgba(63,255,63,1)#rgba(200,200,47,0.1)`));
buttonFilterApply.onclick = () => {animeFilterApply()};
let buttonFilterReset = new TextButtonShaped(shapeRectRounded, txt('wordReset'), new Vector2(240, 60),
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(24,110,24,1)#rgba(40,160,40,1)#rgba(63,255,63,1)#rgba(200,200,47,0.1)`));
buttonFilterReset.onclick = () => {resetFilter(); filterPrecount.request(); tagSelectionPrepare(); lsSaveObject('tagSelection', tagSelection)};
//
let buttonSwitchPreset = new TextButtonShaped(shapeRectRounded, txt('filterApplyPreset'), new Vector2(300, 50),
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(24,110,24,1)#rgba(40,160,40,1)#rgba(63,255,63,1)#rgba(200,200,47,0.1)`));
buttonSwitchPreset.onclick = () => {presetSwitcher(); filterPrecount.request(); lsSaveObject('tagSelection', tagSelection)};
//
buttonFilterLeave.waitanim = false;
buttonFilterApply.waitanim = false;
buttonFilterReset.waitanim = false;
//
function tagSelectionPrepare() {
    tagSelection = JSON.parse(tagSelectionString);
    //
    for(t in filterDefault.tagsIncluded) {
        tagSelection[filterDefault.tagsIncluded[t]] = 'inc'
    };
    for(t in filterDefault.tagsExcluded) {
        tagSelection[filterDefault.tagsExcluded[t]] = 'exc';
        tagButtons[filterDefault.tagsExcluded[t]].tap.set(_imagebuttonheight*cvsscale.get()-1)
    }
};
function tagSelectionParse(filter) {
    var tags = JSON.parse(tagSelectionString);
    //
    for(t in filter.tagsIncluded) {
        tags[filter.tagsIncluded[t]] = 'inc'
    };
    for(t in filter.tagsExcluded) {
        tags[filter.tagsExcluded[t]] = 'exc'
    };
    return tags
};
function animeFilterApply() {
    // сначала скормим выбранные тэги
    filterDefault.tagsIncluded = []; filterDefault.tagsExcluded = [];
    for(t in tagSelection) {
        if(tagSelection[t] === 'inc') {filterDefault.tagsIncluded.push(t)};
        if(tagSelection[t] === 'exc') {filterDefault.tagsExcluded.push(t)}
    };
    // генерим фигню
    sload.state = 'loadstart';
    var anime = getListFiltered();
    presetOnRoulette = presetbase[presetSelected].name;
    lsSaveValue('presetOnRoulette', presetOnRoulette);
    if(anime.length >= 1) {
        rouletteSetItems(randomItemsFrom(anime, pref.rouletteItems));
        rbChangesText(calcPresetChanges())
    } else {
        console.error(txt('filterFindNone'));
        filterDefault = JSON.parse(filterPresetOnly); tagSelectionPrepare(); 
        lsSaveObject('tagSelection', tagSelection);
        rouletteSetItems(randomItemsFrom(getListFiltered(), pref.rouletteItems));
        rbChangesText(0)
    };
    lsSaveObject('filterDefault', filterDefault);
    localStorage.removeItem(savePrefix+'roulette.winner');
    // переключаем экран
    sload.state = 'loadnew';
    requestScreen(screenLoading)
};
//
function animeArrayApply(array) {
    sload.state = 'loadstart';
    requestScreen(screenLoading);
    setTimeout(() => {
        rouletteSetItems(randomItemsFrom(array, pref.rouletteItems));
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
    for(let i = 0; i < changeableValues.length; i++) {
        if(filterDefault[changeableValues[i]] !== p[changeableValues[i]]) {changes++}
    };
    // tags
    var tagsp = tagSelectionParse(p), tagsf = tagSelectionParse(filterDefault);
    for(key in tagsp) {
        if(tagsp[key] !== tagsf[key]) {changes++}
    };
    //
    return changes
};
//
// @EAG SCREEN ANIME FILTER
//
let saf = {
    state: 'preset',
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
    precounter: 0,
}; 
//
function screenAnimeFilter() {
    // update
    actualizeFilterButtons();
    saf.scroll.update();
    saf.bgcolor = `rgba(0,0,0,${pref.bgalpha})`;
    // scaling
    var sensivity = saf.sensivity * cvsscale.get();
    var fbSpacing = filterButtonsSpacing * cvsscale.get();
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
    saf.width = fullsize.y * 1.2 > fullsize.x ? fullsize.x : fullsize.y * 1.2;
    saf.height = 0 + saf.precounter + fbSpacing;
    saf.xanchor = (cvssize.x - saf.width)/2 - fbSpacing + cvsxoffset;
    fillRect(new Vector2(saf.width + fbSpacing*2, cvssize.y), new Vector2(saf.xanchor, 0), saf.bgcolor);
    saf.height += fbSpacing;
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
    for(b in presetButtons) {
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
    for(b in tagButtons) {
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
    for(b in seasonButtons) {
        seasonButtons[b].pos.setv(saf.tagpos[b].sumxy((cvssize.x - saf.width)/2 + cvsxoffset, fbSpacing));
        if(seasonButtons[b].pos.y + seasonButtons[b].size.y < 0) {continue};
        if(seasonButtons[b].pos.y > cvssize.y) {continue};
        seasonButtons[b].draw()
    };
    // типы
    [saf.tagpos, saf.height] = positionsWidthBox(typeButtons, saf.width, fbSpacing, saf.height, saf.scroll.get());
    for(b in typeButtons) {
        typeButtons[b].pos.setv(saf.tagpos[b].sumxy((cvssize.x - saf.width)/2 + cvsxoffset, fbSpacing));
        if(typeButtons[b].pos.y + typeButtons[b].size.y < 0) {continue};
        if(typeButtons[b].pos.y > cvssize.y) {continue};
        typeButtons[b].draw()
    };
    // статусы
    [saf.tagpos, saf.height] = positionsWidthBox(statusButtons, saf.width, fbSpacing, saf.height, saf.scroll.get());
    for(b in statusButtons) {
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
    // предупреждение перед применением
    saf.height += fbSpacing;
    scaleFont(16, 'Segoe UI Light'); ctx.textAlign = 'center';
    saf.height += sbTextFit(txt('filterWarn'), new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get(), '#f44');
    // действия с фильтром
    scaleFont(28, 'Segoe UI Light', 'bold');
    saf.height += sbThreeButtonAlign([buttonFilterLeave, buttonFilterApply, buttonFilterReset], new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get());
    // подсчёт аниме
    filterPrecount.update();
    scaleFontObject(titleCounterFont);
    fillRectRounded(new Vector2(saf.width, saf.precounter), (new Vector2(saf.xanchor + fbSpacing, fbSpacing)), saf.bgcolor, fbSpacing);
    saf.precounter = filterPrecount.flag
    ? fbSpacing + sbTextFit(filterPrecount.count, new Vector2(saf.xanchor + fbSpacing, fbSpacing), saf.width, fbSpacing, 0, '#ffff')
    : fbSpacing + sbTextFit(txt('filterCounter') + filterPrecount.count, new Vector2(saf.xanchor + fbSpacing, fbSpacing), saf.width, fbSpacing, 0, '#ffff')
};
function positionsWidthBox(array, width, spacing, height=0, scroll=0) {
    var pos = {}, size, px=0, py=height;
    for(i in array) {
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
// @EAG STUFF PREFERENCES
//
let prefButtonSpacing = 5;
let prefButtonHeight = 32;
let prefBarHeight = 16;
let prefOptionWidth = 250;
// base
let imagePrefApply = invokeNewImage('images/apply.png');
let imagePrefDefault = invokeNewImage('images/recycle.png');
//
let buttonPrefApply = new ImageButtonShaped(shapeRectRounded, imagePrefApply, new Vector2(prefButtonSpacing), 
    colorMapMatrix(`rgba(24,110,24,1)#rgba(40,160,40,1)#rgba(63,255,63,1)#rgba(47,200,47,0.3)`));
buttonPrefApply.onclick = () => {requestScreen(screenRoulette, false)};
buttonPrefApply.waitanim = false;
let buttonPrefDefault = new ImageButtonShaped(shapeRectRounded, imagePrefDefault, new Vector2(prefButtonSpacing),
    colorMapMatrix(`rgba(110,24,24,1)#rgba(160,40,40,1)#rgba(255,63,63,1)#rgba(47,47,200,0.3)`));
buttonPrefDefault.onclick = () => {pref = JSON.parse(prefDefault); pref.lockfps ? lockFpsSwitch(pref.framerate) : lockFpsSwitch()};
buttonPrefDefault.onhover = () => {hoverHint.invoke(txt('hintPrefReset'))};
// fast state access
// colors
let prefTextPalette = `rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`;
let prefPromptPalette = `rgba(32,128,128,1)#rgba(48,180,180,1)#rgba(64,255,255,1)#rgba(200,200,47,0.1)`;
let prefBarPalette = [`rgba(220,48,220,0.8)`, `rgba(127,24,127,0.3)`];
let prefSwitchPalette = `rgba(220,63,63,1)#rgba(220,220,63,1)#rgba(63,220,63,1)#rgba(220,220,63,0.3)`;
// roulette
let prefRouletteTime = new ShapedSelectBar(new Vector2(prefOptionWidth*1.5, prefBarHeight), colorMatrix(prefBarPalette[0]), colorMatrix(prefBarPalette[1]));
let prefRouletteSpeed = new ShapedSelectBar(new Vector2(prefOptionWidth*1.5, prefBarHeight), colorMatrix(prefBarPalette[0]), colorMatrix(prefBarPalette[1]));
let prefRouletteTitles = new ShapedSelectBar(new Vector2(prefOptionWidth*1.5, prefBarHeight), colorMatrix(prefBarPalette[0]), colorMatrix(prefBarPalette[1]));
let prefRouletteImages = new ShapedSelectBar(new Vector2(prefOptionWidth*1.5, prefBarHeight), colorMatrix(prefBarPalette[0]), colorMatrix(prefBarPalette[1]));
prefRouletteTime.onset = (value) => {prefSetValue('rollTime', 5 + Math.round(value))};
prefRouletteSpeed.onset = (value) => {prefSetValue('rollSpeed', 10 + Math.round(value))};
prefRouletteTitles.onset = (value) => {prefSetValue('rouletteItems', 10 + Math.round(value))};
prefRouletteImages.onset = (value) => {prefSetValue('rollImages', 7 + Math.round(value)*2)};
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
    prefRouletteTitles.update(pref['rouletteItems'] - 10, 190);
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
prefAudioShowPlayer.isSwitcher = true; prefAudioNewTrack.isSwitcher = true;
prefAudioShowPlayer.needshadow = false; prefAudioNewTrack.needshadow = false;
prefAudioShowPlayer.height = 0; prefAudioNewTrack.height = 0;
prefAudioShowPlayer.onclick = () => {prefSetValue('playerShow', true)}; prefAudioShowPlayer.ondeact = () => {prefSetValue('playerShow', false)};
prefAudioNewTrack.onclick = () => {prefSetValue('rollNewTrack', true)}; prefAudioNewTrack.ondeact = () => {prefSetValue('rollNewTrack', false)};
//
function actualPrefAudio() {
    prefAudioSound.update(pref['sound'], 100);
    prefAudioBG.update(pref['bgmusic'], 100);
    prefAudioRoll .update(pref['rollmusic'], 100);
    prefAudioShowPlayer.active = pref.playerShow;
    prefAudioNewTrack.active = pref.rollNewTrack
};
// render
let prefRenderText = '';
let prefRenderFps = new ShapedSelectBar(new Vector2(prefOptionWidth*1.5, prefBarHeight), colorMatrix(prefBarPalette[0]), colorMatrix(prefBarPalette[1]));
let prefRenderBack = new ShapedSelectBar(new Vector2(prefOptionWidth*1.5, prefBarHeight), colorMatrix(prefBarPalette[0]), colorMatrix(prefBarPalette[1]));
let prefRenderQuality = new ShapedSelectBar(new Vector2(prefOptionWidth*1.5, prefBarHeight), colorMatrix(prefBarPalette[0]), colorMatrix(prefBarPalette[1]));
prefRenderFps.onset = (value) => {if(pref.lockfps) {prefSetValue('framerate', 30 + Math.round(value)*5); lockFpsSwitch(pref.framerate)}};
prefRenderBack.onset = (value) => {prefSetValue('bgalpha', Math.round(value)/100)}; prefRenderBack.permanent = true; 
prefRenderQuality.onset = (value) => {setRenderQuality(Math.round(value))};
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
// rescale
function prefButtonsRescale() {
    // roll
    prefRouletteTime.size = new Vector2(prefOptionWidth*1.5, prefBarHeight).multxy(cvsscale.get());
    prefRouletteSpeed.size = new Vector2(prefOptionWidth*1.5, prefBarHeight).multxy(cvsscale.get());
    prefRouletteTitles.size = new Vector2(prefOptionWidth*1.5, prefBarHeight).multxy(cvsscale.get());
    prefRouletteImages.size = new Vector2(prefOptionWidth*1.5, prefBarHeight).multxy(cvsscale.get());
    prefRouletteScroll.size = new Vector2(prefOptionWidth/2, prefButtonHeight).multxy(cvsscale.get());
    prefRouletteMap.size = new Vector2(prefOptionWidth/2, prefButtonHeight).multxy(cvsscale.get());
    prefRouletteNSFW.size = new Vector2(prefOptionWidth/2, prefButtonHeight).multxy(cvsscale.get());
    // audio
    prefAudioSound.size = new Vector2(prefOptionWidth*1.5, prefBarHeight).multxy(cvsscale.get());
    prefAudioBG.size = new Vector2(prefOptionWidth*1.5, prefBarHeight).multxy(cvsscale.get());
    prefAudioRoll.size = new Vector2(prefOptionWidth*1.5, prefBarHeight).multxy(cvsscale.get());
    prefAudioShowPlayer.size = new Vector2(prefOptionWidth/2, prefButtonHeight).multxy(cvsscale.get());
    prefAudioNewTrack.size = new Vector2(prefOptionWidth/2, prefButtonHeight).multxy(cvsscale.get());
    // render
    prefRenderFps.size = new Vector2(prefOptionWidth*1.5, prefBarHeight).multxy(cvsscale.get());
    prefRenderBack.size = new Vector2(prefOptionWidth*1.5, prefBarHeight).multxy(cvsscale.get());
    prefRenderQuality.size = new Vector2(prefOptionWidth*1.5, prefBarHeight).multxy(cvsscale.get());
    prefRenderLockFps.size = new Vector2(prefOptionWidth/2, prefButtonHeight).multxy(cvsscale.get());
    prefRenderWallpaper.size = new Vector2(prefOptionWidth, prefButtonHeight*1.2).multxy(cvsscale.get());
    prefRenderParallax.size = new Vector2(prefOptionWidth/2, prefButtonHeight).multxy(cvsscale.get());
    // other
    prefRenderShowFps.size = new Vector2(prefOptionWidth/2, prefButtonHeight).multxy(cvsscale.get());
    prefRenderDevInfo.size = new Vector2(prefOptionWidth/2, prefButtonHeight).multxy(cvsscale.get());
};
//
function actualPrefRender() {
    prefRenderFps.update((pref.framerate - 30)/5, 34);
    prefRenderBack.update(pref.bgalpha*100, 100);
    if(!pref.imageSmoothing) {
        prefRenderQuality.update(0, 2);
        prefRenderText = txt('pstDisable')
    } else {
        if(pref.imageQuality === 'low') {
            prefRenderQuality.update(1, 2);
            prefRenderText = txt('pstLow')
        } else {
            prefRenderQuality.update(2, 2);
            prefRenderText = txt('pstHigh')
        }
    };
    prefRenderLockFps.active = pref.lockfps;
    prefRenderParallax.active = pref.parallax;
    prefRenderShowFps.active = pref.showFPS;
    prefRenderDevInfo.active = pref.showDebugInfo
};
//
function setRenderQuality(value) {
    if(value === 0) {
        prefSetValue('imageSmoothing', false)
    } else {
        prefSetValue('imageSmoothing', true);
        if(value === 1) {
            prefSetValue('imageQuality', 'low')
        } else {
            prefSetValue('imageQuality', 'high')
        }
    }
};
//
// @EAG SCREEN PREFERENCES
//
let spref = {
    xanchor: 0,
    bgcolor: `rgba(0,0,0,${pref.bgalpha})`,
    selbox: '#0008',
    state: 'roulette',
    alpha: new Vector1(1),
    //
    width: 0,
    height: 0,
    scroll: new Vector1(0),
    sensivity: 100,
    //
    pointer: 0,
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
    var sensivity = spref.sensivity * cvsscale.get();
    var spacing = prefButtonSpacing * cvsscale.get();
    var bheight = prefButtonHeight * cvsscale.get();
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
    spref.height = 0;
    spref.width = fullsize.y * 1.2 > fullsize.x ? fullsize.x : fullsize.y * 1.2;
    spref.xanchor = (cvssize.x - spref.width)/2 + (spacing + bheight)/2 + cvsxoffset;
    fillRect(new Vector2(spref.width + spacing*2, cvssize.y), new Vector2(spref.xanchor, 0), spref.bgcolor);
    spref.height += spacing;
    // main buttons
    buttonPrefApply.sizedZoom(new Vector2(bheight*2));
    buttonPrefDefault.sizedZoom(new Vector2(bheight*2));
    buttonPrefApply.pos = new Vector2(spref.xanchor - (spacing + bheight*2), spacing);
    buttonPrefDefault.pos = new Vector2(spref.xanchor - (spacing + bheight*2), cvssize.y - (bheight*2 + spacing + _imagebuttonheight));
    buttonPrefApply.draw(); buttonPrefDefault.draw();
    spref.alpha.update(); ctx.globalAlpha = spref.alpha.get();
    // НАСТРОЙКИ РУЛЕТКИ
    scaleFont(54, 'Segoe UI', 'bold'); ctx.textAlign = 'center';
    fillRectRounded(new Vector2(spref.width, spref.pointer - spref.height), new Vector2(spref.xanchor+spacing, spref.height - spref.scroll.get()), spref.selbox, 10 * cvsscale.get());
    spref.height += sbTextHeader(txt('prefHead'), new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
    spref.height += spacing;
    spref.pointer = spref.height;
    //
    actualPrefRoulette();
    scaleFont(40, 'Segoe UI', 'bold');
    spref.height += sbTextHeader(txt('prefRoll'), new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
    scaleFont(24, 'Segoe UI'); ctx.textAlign = 'start';
    spref.height += sbSelectbarPrefix(txt('prefRTime'), Math.round(prefRouletteTime.point())+5, prefRouletteTime, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
    spref.height += sbSelectbarPrefix(txt('prefRSpeed'), Math.round(prefRouletteSpeed.point())+10, prefRouletteSpeed, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
    sbBlockHint.text = txt('hintTitleMax');
    spref.height += sbSelectbarPrefix(txt('prefRTitle'), Math.round(prefRouletteTitles.point())+10, prefRouletteTitles, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
    spref.height += sbSelectbarPrefix(txt('prefROnscreen'), Math.round(prefRouletteImages.point())*2+7, prefRouletteImages, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
    sbBlockHint.text = txt('hintAutoScroll');
    spref.height += sbButtonPrefix(txt('prefRAuto'), prefRouletteScroll, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
    sbBlockHint.text = txt('hintAllowNSFW');
    spref.height += sbButtonPrefix(txt('prefRNSFW'), prefRouletteNSFW, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
    // НАСТРОЙКИ АУДИО
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
    // НАСТРОЙКИ ОТРИСОВКИ
    actualPrefRender();
    scaleFont(40, 'Segoe UI', 'bold'); ctx.textAlign = 'center';
    spref.height += sbTextHeader(txt('prefRender'), new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
    scaleFont(24, 'Segoe UI'); ctx.textAlign = 'start';
    spref.height += sbButtonPrefix(txt('prefRLimit'), prefRenderLockFps, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
    ctx.textAlign = 'start';
    spref.height += sbSelectbarPrefix(txt('prefRFPS'), Math.round(prefRenderFps.point())*5 + 30, prefRenderFps, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
    spref.height += sbSelectbarPrefix(txt('prefRSmooth'), prefRenderText, prefRenderQuality, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
    spref.height += sbSelectbarPrefix(txt('prefRShadow'), Math.round(prefRenderBack.point())/100, prefRenderBack, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
    sbBlockHint.text = txt('hintBackgroundURL') + wallpaper.src;
    spref.height += sbButtonPrefix(textStringLimit(txt('prefRBG') + wallpaper.src, spref.width - (prefOptionWidth*cvsscale.get() + spacing*2)), prefRenderWallpaper, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
    spref.height += _imagebuttonheight;
    // ДРУГОЕ
    sbBlockHint.text = txt('hintParallax');
    spref.height += sbButtonPrefix(txt('prefParallax'), prefRenderParallax, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
    spref.height += sbButtonPrefix(txt('prefShowFPS'), prefRenderShowFps, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
    spref.height += sbButtonPrefix(txt('prefDevinfo'), prefRenderDevInfo, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
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
                resetEventThread();
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
                resetEventThread();
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
// @EAG WALLPAPER IMAGE
//
let wallpaper = new Image();
let wallpaperbase = [
    '1Vms2RLx82NUKreiDxmmQLv3fD-87XlMM', 
    '1ZpoUGc4GDB_BNI70I_uQEq7PsbzERpI5',
    '1ecD4IWwzis4Cd1rpITZRcHBorKUm2qQY', 
    '1YtlziStVpf17_0C1zCtYz_E2efUGvEYt',
    '1XMwpoYMTP7stprsuCTe-uFwveXiXIxqC', 
    '1XrEUNnEEb5t-oB9NRsK-g4ssM0PcNZ6A',
    '12-zKGioSwrkF2I0AP1TYMckuEc7EcdQd', 
    '1U8hD1wef0yWQbpBiUo6ur20y4PdEgpDy',
    '1V1z15_uWfU41CjgRFjP2_OxmBv8hI8Px', 
    '1EKW-y834w3tvo3ZSiEeEUr58n0nOKjpq'
];
// это зачатки видео на заднем фоне, пока что сложно и лень
// let wallvideo = document.createElement('video');
// wallvideo.src = '';
// wallvideo.preload = 'auto';
// wallvideo.loop = true;
let wlpsize = new Vector2();
let parallaxSize = new Vector2();
let parallaxOffset = new Vector2();
let oldwallpaper = randomWallpaperGD();
wallpaper.src = lsLoadString('wallpaper', randomWallpaperGD());
wallpaper.onerror = () => {wallpaper.src = oldwallpaper};
//
function setWallpaper(src) {
    wallpaper.src = src
};
function randomWallpaperGD(apply = false) {
    const prefix = 'https://drive.google.com/uc?export=download&confirm=no_antivirus&id=';
    return apply
    ? setWallpaper(prefix + randomItemsFrom(wallpaperbase, 1)[0])
    : prefix + randomItemsFrom(wallpaperbase, 1)[0]
};
//
function updateWallSize() {
    if(oldwallpaper !== wallpaper.src && wallpaper.naturalHeight > 0) {
        lsSaveValue('wallpaper', wallpaper.src); 
        oldwallpaper = wallpaper.src
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
    if(!wallpaper.complete || !sload.init) {
        fillRect(fullsize, fullAlign(new Vector2(0.5), fullsize), staticBgcolor)
    } else {
        updateWallSize();
        drawImageSized(wallpaper, fullAlign(new Vector2(0.5), wlpsize).sumv(parallaxOffset), wlpsize);
        fillRect(fullsize, fullAlign(new Vector2(0.5), fullsize), '#0004')
    };
    // if(!wallvideo.paused) {
    //     [wallvideo.width, wallvideo.height] = [wlpsize.x, wlpsize.y];
    //     drawImageSized(wallvideo, fullAlign(new Vector2(0.5), wlpsize).sumv(parallaxOffset), wlpsize);
    // }
};
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
        //
        fillRectRounded(new Vector2(devinfoValues.width, devinfoValues.height), new Vector2(devinfoValues.xanchor, devinfoValues.offset), '#0029', devinfoValues.margin);
        fillText(new Vector2(devinfoValues.text, devinfoValues.texty(1)), 'FPS: '+FPS, '#fff', 'bold 16px Consolas');
        fillText(new Vector2(devinfoValues.text, devinfoValues.texty(2)), 'memLimit: '+limit, '#fcc', 'bold 12px Consolas');
        fillText(new Vector2(devinfoValues.text, devinfoValues.texty(3)), 'memUsage/Total: ' + usage + ' / ' + total, '#fcc', 'bold 12px Consolas');
        fillText(new Vector2(devinfoValues.text, devinfoValues.texty(4)), 'roulette: '+Math.floor(roulette.progress.get()*10)/10+'/'+(roulette.picsCount-1), '#ffc', 'bold 12px Consolas');
        fillText(new Vector2(devinfoValues.text, devinfoValues.texty(5)), 'full: '+Math.floor(fullsize.x)+'x'+Math.floor(fullsize.y) + ', cvs: '+Math.floor(cvssize.x)+'x'+Math.floor(cvssize.y), '#ccf', 'bold 12px Consolas');
        fillText(new Vector2(devinfoValues.text, devinfoValues.texty(6)), 'scale: '+floatNumber(cvsscale.get(), 2), '#cfc', 'bold 12px Consolas');
        fillText(new Vector2(devinfoValues.text, devinfoValues.texty(7)), 'touch-s: '+floatNumber(touchScroll, 1), '#cfc', 'bold 12px Consolas');
        //
        graphFPS.draw(new Vector2(devinfoValues.xanchor, devinfoValues.texty(8)), 3, 0);
        ctx.textAlign = 'start';
    } else if(pref.showFPS) {
        fillText(new Vector2(14, 30), 'FPS: '+FPS, '#fff', 'bold 16px Consolas');
    }
};
//
//
// render();
function render() {
    // input & update
    canvasActualSize();
    workWithFPS();
    inputListener();
    updatePreferences();
    RNG();
    updateMusic();
    jikan._update();
    // draw
    wallpaperImage();
    activeScreen();
    transitionScreen();
    hoverHint.draw();
    ctx.textAlign = 'start';
    developInfo();
    // title
    scaleFont(12, 'Consolas', 'italic'); ctx.fillStyle = '#fff';
    ctx.fillText('ayayaxdd v0.84 beta', 2, fullsize.y-4);
    ctx.textAlign = 'end';
    ctx.fillText('created by potapello', fullsize.x-4, fullsize.y-4);
    //
    // requestAnimationFrame(render)
};