/*===============================================================================================*/
//  AYAYA - Anime Roulette (WIP)
//      An application for getting random anime from a list randomly generated 
//      or manually assembled.
//  Copyright (C) 2025  Ilya 'potapello' Potapov
//  Repository -> https://github.com/potapello/ayayaxdd
//  License -> GNU General Public License v3.0
//  License URL -> https://github.com/potapello/ayayaxdd/blob/main/LICENSE
/*===============================================================================================*/
//  This program based on -> anime-offline-database (by manami-project)
//  GitHub Repository -> https://github.com/manami-project/anime-offline-database
//  License -> ODC Open Database License 1.0
//  License URL -> https://github.com/manami-project/anime-offline-database/blob/master/LICENSE 
/*===============================================================================================*/

/*============================================ TODO ===============================================
    SFX (нет звука или он хуйня)
    элементы
        селектбары (такое себе)
        холд кнопки (нет)
    марафон
        перемещение по карте
        исследования
        события (бафф, дебафф, выдача монет)
        рулетка предметов
============================================= CHANGES =============================================
for version - 1.3.1
    === NEW FILES ===
JS          translations.js
JS          meetings.js
    === CHANGES ===
JS          script.js
TXT         changelog.txt
HTML        index.html
=================================================================================================*/
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
/** Работает с `adb` : добавляет `score` и `fake_dbid` каждому элементу и удаляет все неиспользуемые данные. */
function databaseShorter() {
    adb_information.scored = 0;
    for(var a in adb) {
        // counter
        adb[a].fake_dbid = Number(a);
        // shorter
        // delete adb[a].synonyms; (already used for searching)
        delete adb[a].relations;
        delete adb[a].relatedAnime;
        delete adb[a].thumbnail;
        // shorted score info
        if(adb[a].score !== undefined) {adb_information.scored += 1; adb[a].score = floatNumber(adb[a].score.arithmeticMean, 2)}
        else {adb[a].score = null} // arithmeticMean - там значения ближе к реальности, ещё есть arithmeticGeometricMean и median
    }
};
//
// @EAG SUMMARY
//
let $appInfo = {
    // main @rel
    version: '1.3.1 beta',
    date: '28-05-2025',
    name: 'AYAYA', // поч такое название? да по рофлу (до последнего хотел `ayayaxdd` - название смайла с `7TV`)
    fullname: 'AYAYA - Anime Roulette',
    author: 'potapello',
    license: 'GNU General Public License v3.0',
    licenseURL: 'https://github.com/potapello/ayayaxdd/blob/main/LICENSE',
    // other
    codename: 'ayayaxdd', // EAG? в самом начале это называлось 'Everlasting Anime Gauntlet', но это сложно и вообще хуйня
    comment: 'ayayaxdd 1.3.1 beta',
};
console.log(`\n${$appInfo.fullname}\n${$appInfo.comment} (${$appInfo.date})\nby ${$appInfo.author}\n `);
//
// get info about startup & FSA api avalaibility
let windowLocalFile = window.location.protocol === 'file:';
let windowFileAvailable = false;
if(!windowLocalFile) {
    if ('showDirectoryPicker' in window && 'FileSystemFileHandle' in window) {
      windowFileAvailable = true;
    //   console.info('File System Access API - available.')
    } else {
      console.warn('File System Access API is not supported by your browser!');
    }
};
//
// @EAG FPS
// уёбск
const fpsCalcFreq = 10;
var FPS = 0, deltaTime = 0, oldTime = 0;
let fpsFrames = 0, fpsSumm = 0;
let timeMultiplier = 1;
//
const fpsFocusLimiter = 20;
let fpsFocusLast = Number();
let fpsFocusSwitch = false;
function workWithFPS() {
    // for drawtime calc
    if(pref.showDebugInfo || pref.showFPS) {_ft_start = performance.now()};
    // limit fps, if no focus @RELEASE
    if(fpsFocusSwitch) {
        fpsFocusSwitch = false;
        if(windowVisibility) {
            lockFpsSwitch(0, false)
        } else {
            fpsFocusLast = Number(pref.framerate);
            lockFpsSwitch(fpsFocusLimiter, false)
        }
    };
    
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
// drawtime calculation
let _ft, _ft_start = 0;
let _ft_buffer = 50, _ft_all = [];
function calcDrawTime() {
    if(pref.showFPS || pref.showDebugInfo) {
        _ft_all.push(performance.now() - _ft_start);
        if(_ft_all.length > _ft_buffer) {_ft_all.shift()};
        var ftsum = 0;
        _ft_all.forEach((v) => {ftsum += v});
        _ft = floatNumber(ftsum / _ft_all.length, 1)
    };
};
//
// @EAG GRAPH CLASS
//
class Graph {
    constructor(name, height_pixels, width_elements) {
      this.name = name; this.height = height_pixels; this.width = width_elements;
      this.array = [];
      this.pickup = 0;
      this.max = 0;
    }
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
        ctx.lineWidth = "2";
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
const graphFPS = new Graph('FPS', 80, 100);
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
// @EAG MOUSE & TOUCH INPUT
//
let mouse = {
    old: new Vector2(0),
    pos: new Vector2(0),
    delta: new Vector2(0),
    holdTicks: 0,
    wheelTicks: 0,
    pressTicks: 0,
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
let _pressTicks = 100;
mouse.holdTicks = _holdTicks;
mouse.wheelTicks = _wheelTicks;
// mouse position
document.addEventListener('mousemove', (e) => {
    mouse.pos.setxy(e.clientX, e.clientY)
});
// get wheel compatible
if (document.addEventListener) {
    if ('onwheel' in document) {
      document.addEventListener("wheel", onWheel);
    } else if ('onmousewheel' in document) {
      document.addEventListener("mousewheel", onWheel);
    } else {
      document.addEventListener("MozMousePixelScroll", onWheel);
    }
} else {
    document.attachEvent("onmousewheel", onWheel);
};
// wheel list  
function onWheel(e) {
    e = e || window.event;
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
// TOUCH
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
// @EAG KEYBOARD & LISTENER
//
let readKeyboardInput = false;
let inputkeys = [];
//
let keyboard = {};
let cheatPrompt = [];
function keyPressed(key = String()) {
    if(keyboard[key] === undefined) {
        return false;
    } else {
        const k = keyboard[key];
        keyboard[key] = false;
        return k;
    }
};
//
document.addEventListener('keyup', (e) => {
    keyboard[e.code] = false;
    if(readKeyboardInput) {inputkeys.push(e.key)}
});
document.addEventListener('keydown', (e) => {
    keyboard.EVENT = true;
    keyboard[e.code] = true;
});
//
function inputListener() {
    // KEYBOARD
    if(keyboard.EVENT !== undefined && !readKeyboardInput) {
        // scaling
        if(keyPressed('Plus') || keyPressed('Equal')) {_scaleFixed < 3.9 ? cvsscale.move(_scaleFixed+0.1, 0.25, easeOutCirc) : false; globalRescale()};
        if(keyPressed('Minus')) {_scaleFixed >= 0.6 ? cvsscale.move(_scaleFixed-0.1, 0.25, easeOutCirc) : false; globalRescale()};
        // return to roulette screen
        if(activeScreen === screenAnimeFilter || activeScreen === screenPreferences) {
            if(keyPressed('Escape')) {
                requestScreen(screenRoulette, false)
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
            } else if(keyPressed('Space')) {
                buttonDoRoll.onclick()
            };
            // music menu keys
            if(keyPressed('ArrowUp')) {
                mnMenu.active(-1);
            } else if(keyPressed('ArrowDown')) {
                mnMenu.active(1);
            };
            if(keyPressed('Enter')) {mnMenu.apply = true} 
            else if(keyPressed('Digit1')) {mnMenu.plan = true};
        };
        if(keyPressed('Backslash')) {pref.showDebugInfo = pref.showDebugInfo ? false : true};
        if(keyPressed('Backquote')) {
            var prom = prompt('Write a command...', _cheats.last);
            if(prom !== null) {
                _cheats.last = String(prom);
                cheatPrompt = _cheats.last.split(' ');
                checkCheatPrompt()
            }
        };
        // marathon map movement
        if(activeScreen == screenMarathonMap && !mapMeta.cutscene) {
            if(keyPressed('ArrowLeft')) {mapMovePlayer({x:-1,y:0})};
            if(keyPressed('ArrowRight')) {mapMovePlayer({x:1,y:0})};
            if(keyPressed('ArrowUp')) {mapMovePlayer({x:0,y:-1})};
            if(keyPressed('ArrowDown')) {mapMovePlayer({x:0,y:1})};
            //
            if(keyPressed('Escape')) {
                mapMeta.overlay ? mapOverlayMover(false) : requestScreen(screenRoulette, false)
            };
            if(keyPressed('Enter')) {
                mapSelectRect(mapGetRect(mapMeta.pos))
            }
        }
    };
    // end
    keyboard = {};
    // reset
    mouse.click = false;
    // mouse button hold
    if(mouse.press) {
        mouse.pressTicks += deltaTime;
        if(mouse.holdTicks > 0) {
            mouse.holdTicks -= deltaTime
        } else {
            mouse.holded = true
        }
    } else {
        if(mouse.holdTicks != _holdTicks) {
            mouse.holdTicks = _holdTicks;
            // disable click by pressing
            if(mouse.pressTicks < _pressTicks) {mouse.click = true}
        };
        if(mouse.holded) {mouse.holded = false};
        mouse.pressTicks = 0;
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
    };
    // prevent infinity input read
    readKeyboardInput = false;
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
    sizeofJSON: (object, code=1) => {
        return Number(JSON.stringify(object).length) * code
    },
};
//
// @EAG PROMPT & CHEATS
//
/** 
* Открывает окно prompt для ввода числа. Возвращает введёное число или `actual`. 
* @overload `ayayaxdd.promptNumber`
* @param {string} text => Описание запроса.
* @param {number} min => Минимально-возможное возвращаемое значение.
* @param {number} max => Мaксимально-возможное возвращаемое значение.
* @param {number} actual => Текущее значение или значение по умолчанию. Возвращается функцией, если число введено некорректно или число не удовлетворяет условиям `min` `max`.
*/
function promptNumber(text, min, max, actual) {
    var p = String(Number(prompt(text, actual)));
    if(p === 'NaN' || p === 'null') {return actual}
    else {p = Number(p)};
    return p < min ? min : p > max ? max : p
};
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
    last: '',
    'js': (args) => {
        if(args[1] !== undefined) {
            console.log('Cheat | Try to evaluate => '+args[1]);
            eval(args[1])
        }
    },
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
        if(args[2] !== undefined) {
            if(args[2] == 'pm') {
                musicNormal.pause();
                musicNormal.currentTime = 0;
                musicNormalVolume.reset();
                musicNormalVolume.move(1, 1, easeInOutSine);
                musicNormal.src = cliponly[number][0];
                musicLite.name = cliponly[number][2];
                if(pref.bgmusic > 0) {musicNormal.play()}
            }
        } else {
        _clipSelected = number;
        playSound(sound['taginc'])
        }
    },
    'snowflakes': (args) => {
        if(args[1] === undefined) {return};
        if(String(Number(args[1])) == 'NaN') {return};
        var number = Number(args[1]);
        snowflake.count = number < 0 ? 0 : number > 1024 ? 1024 : number;
        resetSnowflakes()
    },
    'vsync': (args) => {
        if(args[1] === undefined) {return};
        enabledVsyncRAF(eval(args[1]))
    },
    'mrt': (args) => {setTimeout(() => {showScreenMarathon()}, 500)},
};
//
// @EAG MATH FUNCTIONS
//
function range(min, max) {
    return {min, max};
};
//
Math.norma = (x) => {
    return x > 1 ? 1 : x < 0 ? 0 : x
};
function moreThanZero(value) {
    return value < 0 ? 0 : value
};
function timeStringify(sec) {
    if(String(sec) == 'NaN' || String(sec) == 'Infinity' || sec == undefined) {return `0:00`}
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
const powsOfTwo = {
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
const _dropboxAffix = ['https://www.dropbox.com/scl/fi/','&raw=1'];
function _dropboxURL(key) {
    return  String(_dropboxAffix[0] + key + _dropboxAffix[1])
};
//
class videoClip {
    constructor(music, video_anchor, time, video_url, custom=false) {
        this.m = music;
        this.v = [_dropboxURL(video_url), video_anchor];
        this.time = time;
        this.custom = custom;
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
    _videoclipsyncattempts = 8; _videoclipsyncdl = 0.08
};
function videoClipCan() {
    return clipmainLoaded && musicrollLoaded
};
const _videoclipsyncrate = 2000;
let _videoclipsyncdl = 0.08;
let _videoclipsyncattempts = 0;
function videoClipSync() {
    if(Math.abs((clipmain.currentTime - _cliptimestamp) - (musicRoll.currentTime - _musictimestamp)) > _videoclipsyncdl) {
        console.log(`Sync clip... (offset: ${floatNumber((clipmain.currentTime - _cliptimestamp) - (musicRoll.currentTime - _musictimestamp), 3)}, rate: ${floatNumber(_videoclipsyncdl, 2)})`);
        musicRoll.currentTime = _musictimestamp + (clipmain.currentTime - _cliptimestamp);
        if(_videoclipsyncattempts > 0) {
            setTimeout(videoClipSync, _videoclipsyncrate);
            _videoclipsyncattempts--;
            _videoclipsyncdl += 0.02
        } else {
            console.info(`Clip sync canceled after 8 attempts. (offset: ${floatNumber((clipmain.currentTime - _cliptimestamp) - (musicRoll.currentTime - _musictimestamp), 3)}, rate:${floatNumber(_videoclipsyncdl, 2)})`)
        }
    } else {console.info(`Clip sync success.`)}
};
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
    clipmain.volume = 0;
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
    rollBar.rollStarted = false;
    //
    console.error('Clip downloading time out! (20 s.)\nTry roll again OR disable \'Videoclips\' in Options.')
};
//
let _clipmainBuffered = [];
function videoClipBuffered() {
    for(var i = 0; i < clipmain.buffered.length; i++) {
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
let musicWaiting = 20;
const clipTimeout = 20;
//
// @EAG ALL AUDIO DATA
//
const sound = {
    'scroll': new Audio('sounds/scroll.ogg'),
    'button': new Audio('sounds/button.ogg'),
    'tagnone': new Audio('sounds/tagnone.ogg'),
    'taginc': new Audio('sounds/taginc.ogg'),
    'tagexc': new Audio('sounds/tagexc.ogg'),
    'loaded': new Audio('sounds/loaded.mp3'),
    'screen': new Audio('sounds/screen.wav'),
    'winner': new Audio('sounds/winner.ogg'),
    'roll': new Audio('sounds/roll.ogg'),
    'prompt': new Audio('sounds/prompt.wav'),
    'player': new Audio('sounds/player.wav'),
    // new in 1.3.1 (for marathon)
    'teleport': new Audio('sounds/teleport.wav'),
    'warn': new Audio('sounds/warn.wav'),
    'coins': new Audio('sounds/coins.wav'),
    'opener': new Audio('sounds/opener.mp3'),
    'steps': new Audio('sounds/steps.wav'),
    'success': new Audio('sounds/success.wav'),
    'insp': new Audio('sounds/insp.wav'),
};
//
const music = [
    //['src', rolltime, 'name'],
    // music
    ['audio/music1.ogg', 61, 'Kuhaku Gokko - Lil\'b'],
    ['audio/music2.ogg', 49, 'Miku Sawai - Gomen ne, Iiko ja Irarenai'],
    ['audio/music3.ogg', 17, 'DUSTCELL - Narazumono'],
    ['audio/music4.ogg', 0, 'Cagayake! - GIRLS'],
    ['audio/music5.weba', 60, 'Sachika Misawa - Links'], // 
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
    ['audio/music28.weba', 42, 'ZUTOMAYO - TAIDADA'],
    ['audio/music29.weba', 35, 'Kuhaku Gokko - Pikaro'],
    // bloody stream        clip
    // guren no yumiya      clip
    // shikanoko            clip
    // domekano op1
    // oshi no ko op1       clip
    // call of the night    clip
    // bakemonogatari op4
    // apothecary diar op1  clip
    // parasyte
    // deja vu
    // black catcher        clip?
    // hell paradise op     clip
    // neverland            onlyclip
    // kaguya op1           onyclip?
    // bocchi               onlyclip
    // ghoul tot samyy      clip
    // frieren op
    // solo level op2
    // yt vAKBZeQklQw 
    // blue lock op2
    // April lie op     
    // naruto ship op1
    // overlord op1
    // date a live op4
    // Food Wars s3op2
];
// 
const cliponly = [
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
    ['audio/clip8.weba', 0, 'Kyoro - Survive (YTPMV)'],
    ['audio/clip9.weba', 0, 'beoh - hpes-shiki (YTPMV)'],
    ['audio/clip10.weba', 62, 'nanodot - It\'s just your fault (YTPMV)'],
    ['audio/music5.weba', 76, 'Sachika Misawa - Links'],
    ['audio/music28.weba', 42, 'ZUTOMAYO - TAIDADA'],
];
//
let _clipSelected = null;
const clips = [
    // new videoClip(music[x], rolltime, lifetime, 'key'), (* = ytpmv)
    new videoClip(cliponly[0], 31, 32.1,    'w0i5vrvg2qat8mawfjy2i/video1.webm?rlkey=vc7tda62c9s0kfcznxnm02240', true), // botagiri *
    new videoClip(cliponly[1], 55, 37,      'ieofoxdaqm4jmumczph92/video2.webm?rlkey=mss80z4v2rcjl0qq3mvz0qwky', true), // aquarius *
    new videoClip(cliponly[2], 21.35, 35.4, '4f2z5ksu6bxu0l68vhslf/video3.webm?rlkey=sli7839jj0sn7dtndkqdr9vdb'), // bad apple
    new videoClip(cliponly[3], 35, 43.2,    'drhq7vy4mcb32jcq9jtot/video4.webm?rlkey=69155pksd9z5gbn80zm0ungku', true), // point of no k-on *
    new videoClip(cliponly[4], 78, 38.8,    'xvdt3he159lduqixpffk0/video5.webm?rlkey=zbe9w4z7kkslnggz67mw3pf2h', true), // yuyushiki factory *
    new videoClip(cliponly[5], 48, 36,      '9snur9h8l5cftf47n3ln1/video6.webm?rlkey=2qv31z6q5gf98sy01emowo8ct'), // k-on op
    new videoClip(cliponly[6], 51, 37,      'a4bfdi4hnbzj1t8l4f39q/video7.webm?rlkey=7zolbpa1ptyizc4vgub9e2dwe'), // ado antisystem
    new videoClip(cliponly[7], 6, 28.5,     'cujxc4en713r25f20iz4a/video8.webm?rlkey=0qpxdx4fwwtwg74szmbhs4vc0'), // shimoneta ed
    new videoClip(cliponly[8], 38, 34,      'upfai6wav5gy5dq4nogoy/video9.webm?rlkey=fs8dhy9djvp64tukntarhbto6'), // kick back
    new videoClip(cliponly[9], 0, 69.5,     'b5tlu916tcn3r5f9ezau2/video10.webm?rlkey=bgfoiorex4sirmn898rqcfx4p'), // fatima
    new videoClip(cliponly[10], 48, 40,     'z5pq4uemtopjii80yeh1k/video11.webm?rlkey=godc4mzev23jxezdu99o5of29'), // gate 1
    new videoClip(cliponly[11], 0, 26.5,    '41z7s482j3wqgk3ua1ugs/video12.webm?rlkey=3wqgbwn2phyifv0egj3aoms9c', true), // INTR *
    new videoClip(cliponly[12], 0, 37,      '0g4hye7mc3iv3vp783qfj/video13.webm?rlkey=6m5rc64tmuht2rq4nsm0tdpzs', true), // HTDN *
    new videoClip(cliponly[13], 0, 46.4,    'rtk3o32aoe9xy5tzur21x/video14.webm?rlkey=0jc0tz7r1fz9lvnennj12wvpf', true), // old castle baby *
    new videoClip(cliponly[14], 0, 49.5,    '322csul3wvt4gt9wy2co5/video15.webm?rlkey=kk1i0webz34xsisd4b97g3xj6', true), // eshatos survive *
    new videoClip(cliponly[15], 0, 56,      'p7dct166v6ekx2obnceft/video16.webm?rlkey=vg2oym9jxs6r7as64qj8qhn5k', true), // hpes-shiki *
    new videoClip(cliponly[16], 62, 36.7,   'rsa1cvk0tbf33gh8ogptn/video17.mp4?rlkey=mmqond1w63sbwpac8xkgocihe', true), // your fault *
    new videoClip(cliponly[17], 0, 33,      'v0ak24ja4eyka6ai3vbji/video18.mp4?rlkey=fjzb9jjmfdfhklaudoo90nz1n'), // railgun s 2ed
    new videoClip(cliponly[18], 42, 44.5,     'gww945yj83uklsof8hngw/video19.mp4?rlkey=nrdtuh9hi1venj5r8yshgpzyy'), // dandadan ed
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
//                                                                          METHODS
function playSound(sound = new Audio(), rate=false) {
    sound.currentTime = 0;
    sound.volume = pref.sound / 100;
    if(rate !== false) {
        sound.preservesPitch = false;
        sound.playbackRate = rate
    } else {sound.playbackRate = 1};
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
// @EAG MUSIC WORK
//
const musicMenuWidth = 420;
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
//                                                                   ANALYZER
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
//                                                                      EQUALIZER
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
// @EAG FILTER & PREFFERENCES
//
let filterAttempts = 0;
let filterAttemptTags = false;
let filterAttRange = range(0, 4);
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
    skipSpecial: false,
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
    // filterDefault.NSFW = pref.showNSFW
};
//                                                                               PREFERENCES
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
    framerate: 60,        
    bgalpha: 0.7,
    scale: 4,
    vsync: false,
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
const prefDefault = JSON.stringify(pref);
function prefSetValue(name, value) {
    pref[name] = value;
    lsSaveObject('pref.'+name, pref[name])
};
//
function updatePreferences() {
    ctx.imageSmoothingEnabled = pref.imageSmoothing;
    ctx.imageSmoothingQuality = pref.imageQuality;
};
//
// @EAG SESSION, LOCAL, LIDB                                                LOCAL
//
const savePrefix = 'eagsv_';
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
//                                                                                      SESSION
let session = sessionStorage;
const sessionLimit = (4 * 1024 * 1024) - 1;
const sessionPref = 'eagsession_';
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
//                                                                                   SAVE OPTIMIZATION
function optimizeAnimeObject(object) {
    var obj = JSON.parse(JSON.stringify(object));
    delete obj.relations;
    delete obj.synonyms;
    delete obj.thumbnail;
    delete obj.tags;
    delete obj.relatedAnime;
    return obj
};
function optimizeAnimeArray(array) {
    var arr = [];
    for(var i in array) {
        arr[i] = optimizeAnimeObject(array[i])
    };
    return arr
};
//                                                                                   INDEXED DB FOR LISTS
let lidb = {
    error: false,
    version: 1,
    //
    max: 100,
    saved: 0,
    //
    response: false,
    request: false,
    lists: [],
};
// startup func
function setupLIDB() {
    lidb.openreq = indexedDB.open("db", lidb.version);
    lidb.openreq.onerror = () => {
        lidb.error = lidb.openreq.error;
        console.error("ILDB error", lidb.openreq.error)
    };
    lidb.openreq.onsuccess = () => {
        lidb.db = lidb.openreq.result;
        console.log('Connected to ILDB');
    };
    lidb.openreq.onupgradeneeded = function(event) {
        lidb.db = lidb.openreq.result;
        switch(event.oldVersion) {
            case 0:
                if(!lidb.db.objectStoreNames.contains('lists')) {
                    console.log('Init ILDB "lists" store...');
                    lidb.db.createObjectStore('lists', {keyPath: 'name'})
                };
                if(!lidb.db.objectStoreNames.contains('lists-info')) {
                    console.log('Init ILDB "lists-info" store...');
                    lidb.db.createObjectStore('lists-info', {keyPath: 'index'})
                }
            case 1:
                console.log('ILDB (v1.0)');
            case 2:
                // update
        }
    }
}; setupLIDB();
// lidb upload, download, delete
function lidbUploadObject(obj, store) {
    var t = lidb.db.transaction(store, "readwrite");
    var s = t.objectStore(store);
    //
    var req = s.add(obj);
    req.onerror = () => {
      console.warn(`Error with uploading ${obj.name} to "${store}"\n`, req.error)
    }
};
function lidbDownloadObject(name, store) {
    lidb.request = true;
    lidb.response = null;
    var t = lidb.db.transaction(store, "readonly");
    var s = t.objectStore(store);
    //
    var req = s.get(name);
    req.onerror = () => {
      console.warn(`Error with downloading ${name} from "${store}"\n`, req.error)
    };
    req.onsuccess = () => {lidb.response = req.result; lidb.request = false}
};
function lidbDeleteObject(name, store) {
    var t = lidb.db.transaction(store, "readwrite");
    var s = t.objectStore(store);
    //
    var req = s.delete(name);
    req.onerror = () => {
      console.warn(`Error with deleting ${name} from "${store}"\n`, req.error)
    };
};
function fullResetLIDB() { // delete exists lidb and create new empty
    indexedDB.deleteDatabase('db');
    setupLIDB();
};
// lidb get all lists
function lidbGetKeys(store) {
    lidb.request = true;
    var t = lidb.db.transaction(store, "readonly");
    var s = t.objectStore(store);
    //
    var req = s.getAllKeys();
    req.onerror = () => {
      console.warn(`Error with getting all "${store} keys"\n`, req.error)
    };
    req.onsuccess = () => {lidb.lists = req.result; lidb.request = false} 
};
//
// @EAG TRANSLATED TEXT
//
// getting lang object
if(!pref.language in _TextTranslations) {pref.language = 'en'}; // debug for unknown langs
let _Text = _TextTranslations[pref.language];
delete _TextTranslations;
//
function txt(key) {
    return _Text[key] === undefined ? key : _Text[key]
};
function txtTag(key) {
    return _Text.tagnames[key] === undefined ? key : _Text.tagnames[key]
};
function txtPreset(key) {
    return _Text.presetnames[key] === undefined ? key : _Text.presetnames[key]
};
function txtMrth(key) {
    return _Text.mrth[key] === undefined ? key : _Text.mrth[key]
};
//
const langInitialized = pref.language;
let langSelected = pref.language;
let allTranslations = {
    'en': {
        name: 'English',
        comment: 'A web translator was used',
    },
    'ru': {
        name: 'Русский',
        comment: 'Язык оригинала',
    },
    //
    head: () => {
        return langInitialized === langSelected
        ? allTranslations[pref.language].name
        : allTranslations[pref.language].name + ' - ' + `Press [F5] !!!`
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
const tagbase = {
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
        this.scoreAllow = this.score.max < 10 || this.score.min > 0;
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
const YEARS = range(1900, 2025);
const SCORES = range(5, 10);
const presetbase = {
    //'Перерождение в 2007-й': new Preset(name, 
    // includes, excludes,years, episodes, score, mult, others)
    'Дефолтный': new Preset('Дефолтный',
    null, null, YEARS, range(1, 50), range(5, 10), 1, null),
    'Cтарая романтика': new Preset('Cтарая романтика',
    ['romance'], null, range(YEARS.min, 2007), range(1, 50), range(6, 10), 1.1, null),
    'Перерождение в 2007-й': new Preset('Перерождение в 2007-й', 
    ['isekai'], null, range(2005, 2009), range(1, 50), range(5, 10), 1.1, null),
    'Современный кал': new Preset('Современный кал', 
    null, null, range(2018, YEARS.max), range(1, 50), range(3, 7), 1.5, null),
    'Хорошая ностальгия': new Preset('Хорошая ностальгия', 
    null, null, range(YEARS.min, 2000), range(1, 50), range(7, 10), 1.1, null),
    'Мужская магия': new Preset('Мужская магия', 
    ['seinen', 'magic'], null, YEARS, range(1, 50), range(6, 10), 1, null),
    'Сверхъестественная школа': new Preset('Сверхъестественная школа', 
    ['supernatural', 'school'], null, YEARS, range(1, 50), range(5, 10), 1, null),
    'Девочки колдуют': new Preset('Девочки колдуют', 
    ['female', 'magic'], null, range(YEARS.min, 2010), range(1, 50), range(5, 10), 1, null),
    'Женский исекай': new Preset('Женский исекай', 
    ['female', 'isekai'], null, YEARS, range(1, 50), range(5, 10), 1, null),
    'Можно короче?': new Preset('Можно короче?', 
    null, null, range(2010, YEARS.max), range(1, 13), range(6, 10), 1, null),
    'Лучшая эротика': new Preset('Лучшая эротика',  
    ['ecchi'], null, range(2010, YEARS.max), range(1, 50), range(7, 10), 1, null),
    'Бывалые гаремы': new Preset('Бывалые гаремы', 
    ['harem'], null, range(YEARS.min, 2007), range(1, 50), range(5, 10), 1, null),
    'Девочки в танках': new Preset('Девочки в танках', 
    ['female', 'military'], null, YEARS, range(1, 50), range(5, 10), 1, null),
    'Новая психология': new Preset('Новая психология', 
    ['psychological'], null, range(2016, YEARS.max), range(1, 50), range(6, 10), 1.1, null),
    'Повседневность нулевых': new Preset('Повседневность нулевых', 
    ['slice of life'], null, range(2001, 2010), range(1, 50), range(5, 10), 1.1, null),
    '\"Сполт это фыфнь\".': new Preset('\"Сполт это фыфнь\".', 
    ['sports'], null, YEARS, range(1, 50), range(4, 10), 1.25, null),
    'Игры десятых': new Preset('Игры десятых', 
    ['game'], null, range(2011, 2020), range(1, 50), range(5, 10), 1, null),
    'Пережитая история': new Preset('Пережитая история', 
    ['historical'], null, range(YEARS.min, 2005), range(1, 50), range(5, 10), 1.3, null),
    'Лучшие приключения': new Preset('Лучшие приключения', 
    ['adventure', 'action'], null, YEARS, range(20, 50), range(7, 10), 1.25, null),
    'Когда плакать?': new Preset('Когда плакать?', 
    ['drama'], null, range(2010, YEARS.max), range(1, 50), range(3, 7), 1.4, null),
    'Пожилые слёзы': new Preset('Пожилые слёзы', 
    ['drama'], null, range(YEARS.min, 2000), range(1, 50), range(7, 10), 1.2, null),
    'Что это было?': new Preset('Что это было?', 
    ['mystery', 'psychological'], null, range(2007, YEARS.max), range(1, 50), range(5, 10), 1.1, null),
    'Новое приключение': new Preset('Новое приключение', 
    ['adventure'], null, range(2020, YEARS.max), range(1, 50), range(6, 10), 1, null),
    'Фентезийная любовь': new Preset('Фентезийная любовь', 
    ['fantasy', 'romance'], null, range(2007, YEARS.max), range(1, 50), range(5, 10), 1, null),
    'Плюс уши': new Preset('Плюс уши', 
    ['music'], null, range(2000, YEARS.max), range(1, 50), range(7, 10), 1.2, null),
    'Плохие шутки': new Preset('Плохие шутки', 
    ['comedy'], null, range(2010, YEARS.max), range(1, 50), range(3, 7), 1.35, null),
    'Новаторский юмор': new Preset('Новаторский юмор', 
    ['comedy'], null, range(2018, YEARS.max), range(1, 50), range(6, 10), 1, null),
    'Грустно, но вкусно': new Preset('Грустно, но вкусно', 
    ['drama', 'romance'], null, range(2016, YEARS.max), range(1, 50), range(6, 10), 1.1, null),
    'Бесится, но любит': new Preset('Бесится, но любит', 
    ['tsundere', 'romance'], null, YEARS, range(1, 50), range(6, 10), 1, null),
    'Влюбиться насмерть': new Preset('Влюбиться насмерть',
    ['yandere'], null, YEARS, range(1, 50), range(6, 10), 1.1, null),
    'Прохладная любовь': new Preset('Прохладная любовь',
    ['kuudere'], null, range(2010, YEARS.max), range(1, 50), range(6, 10), 1, null),
    'Бесконечное \"это\"': new Preset('Бесконечное \"это\"',
    ['ecchi'], null, YEARS, range(1, 25), range(5, 10), 1, 
    {seasonSpring: false, seasonFall: false, seasonWinter: false, seasonUndefined: false}),
    'Работать - круто!': new Preset('Работать - круто!', 
    ['work'], null, YEARS, range(1, 50), range(6, 10), 1.1, null),
    'Совсем не похоже': new Preset('Совсем не похоже', 
    ['parody'], null, YEARS, range(1, 50), range(3, 7), 1.3, null),
    'Годная сатира': new Preset('Годная сатира', 
    ['parody'], null, YEARS, range(1, 50), range(7, 10), 1, null),
    'Супер-романтика': new Preset('Супер-романтика', 
    ['romance', 'supernatural'], null, YEARS, range(1, 50), range(5, 10), 1, null),
    'Выключаем свет': new Preset('Выключаем свет', 
    ['horror'], null, YEARS, range(1, 50), range(7, 10), 1.1, null),
    'Женский спорт': new Preset('Женский спорт', 
    ['female', 'sports'], null, YEARS, range(1, 50), range(6, 10), 1, null),
    'Кухня, 7 сезон': new Preset('Кухня, 7 сезон', 
    ['cooking', 'comedy'], null, YEARS, range(1, 50), range(6, 10), 1, null),
    //
    'Кратко про гаремы': new Preset('Кратко про гаремы', 
    ['harem'], null, range(2010, YEARS.max), range(1, 50), range(5, 10), 1.1, null),
    'Дела семейные': new Preset('Дела семейные', 
    ['family'], null, YEARS, range(1, 50), range(5, 10), 1.1, null),
    'Cyberpunk 2077': new Preset('Cyberpunk 2077', 
    ['future'], null, YEARS, range(1, 50), range(5, 10), 1.1, null),
    'Страшно смешно': new Preset('Страшно смешно', 
    ['horror', 'comedy'], null, YEARS, range(1, 50), range(6, 10), 1.1, null),
    'Супергероини': new Preset('Супергероини', 
    ['female', 'supernatural'], null, range(2010, YEARS.max), range(1, 50), range(5, 10), 1, null),
    'Трава у дома': new Preset('Трава у дома', 
    ['space', 'drama'], null, range(2010, YEARS.max), range(1, 50), range(5, 10), 1.1, null),
    'Аниме \"5в1\"': new Preset('Аниме \"5в1\"', 
    ['adventure', 'action', 'comedy', 'drama', 'romance'], null, YEARS, range(1, 50), range(5, 10), 1.2, null),
};

// кратко про гаремы
//
let _presetnames = [];
for(var p in presetbase) {
    _presetnames.push(p)
};
//
let _mrthpresets = [
    'Cтарая романтика', 'Современный кал', 'Хорошая ностальгия', 'Мужская магия', 'Сверхъестественная школа', 'Девочки колдуют', 'Женский исекай', 'Можно короче?', 'Лучшая эротика',
    'Девочки в танках', 'Новая психология', 'Повседневность нулевых', '\"Сполт это фыфнь\".', 'Игры десятых', 'Пережитая история', 'Лучшие приключения', 'Когда плакать?',
    'Пожилые слёзы', 'Что это было?', 'Новое приключение', 'Фентезийная любовь', 'Плюс уши', 'Плохие шутки', 'Новаторский юмор', 'Грустно, но вкусно', 'Бесится, но любит',
    'Влюбиться насмерть', 'Прохладная любовь', 'Работать - круто!', 'Совсем не похоже', 'Годная сатира', 'Супер-романтика', 'Кухня, 7 сезон', 
    'Кратко про гаремы', 'Дела семейные', 'Cyberpunk 2077', 'Страшно смешно', 'Супергероини', 'Трава у дома', 'Аниме \"5в1\"',
];
let _mrthpresetsEasy = [
    'Хорошая ностальгия', 'Сверхъестественная школа', 'Женский исекай', 'Можно короче?', 'Лучшая эротика', 'Что это было?', 'Фентезийная любовь', 'Плюс уши', 'Новаторский юмор', 
    'Грустно, но вкусно', 'Бесится, но любит', 'Влюбиться насмерть', 'Прохладная любовь', 'Годная сатира', 'Супер-романтика', 'Кухня, 7 сезон', 'Cyberpunk 2077', 'Страшно смешно', 
    'Супергероини', 'Трава у дома', 'Аниме \"5в1\"',
];
//
// @EAG ARRAY & FILTER METHODS
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
//                                                                                  FILTER
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
        filterPrecount.timeout = 0.8
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
function getArrayWorkProgress(iter, length, step) {
    for(var i = 1; i<100/step; i++) {
        if(iter == Math.round(length*step*i/100)) {console.info(`Work progress -> ${step*i}%`)}
    }
};
//
// @EAG FILTERING FUNCTION
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
let _filterWorkTime = 0;
//
function getListFiltered(filter = filterDefault) {
    var list = [], anime;
    var ts = performance.now();
    for(var i in adb) {
        anime = adb[i];
        _filterHaveAttempts = Number(filterAttempts);
        // sort by episodes
        if(anime['episodes'] < filter.episodeMin) {if(_attemptAny()){continue}};
        if(anime['episodes'] > filter.episodeMax) {if(_attemptAny()){continue}};
        // skip if 1 episode & it not a film
        if(filter.skipSpecial) {if(anime['episodes'] == 1 && anime['type'] != 'MOVIE') {continue}};
        // sort by score, if allowed
        if(filter.scoreAllow) {
            // const anime_id = malAnimeID(anime.sources);
            // if(anime_id == null) {continue}
            // else {
            //     if(adb_ratings[anime_id] === undefined) {continue};
            //     const score = adb_ratings[anime_id]['score'];
            //     if(score == 'None' || score == undefined) {continue}
            //     else {
            //         if(score < floatNumber(filter.scoreMin, 2)) {if(_attemptAny()){continue}};               // OLD PART WITH USING DOWNLOADED INFO ABOUT ALL mal ANIME RATINGS
            //         if(score > floatNumber(filter.scoreMax, 2)) {if(_attemptAny()){continue}};
            //     }
            // }
            // check if aodb have score info & sort by limits
            if(adb[i].score === null) {if(_attemptAny(2)){continue}} // 2 points by ignoring max & min score limits
            else {
                if(adb[i].score < floatNumber(filter.scoreMin, 2)) {if(_attemptAny()){continue}};
                if(adb[i].score > floatNumber(filter.scoreMax, 2)) {if(_attemptAny()){continue}};
            }
        };
        // sort by year
        if(anime['animeSeason']['year'] > filter.yearMax) {if(_attemptAny()){continue}};
        if(anime['animeSeason']['year'] < filter.yearMin) {if(_attemptAny()){continue}};
        // sort by include/exclude tags
        if(anime['tags'].length > 0) {
            if(_attemptTags(filterIncludeTags(filter.tagsIncluded, anime['tags']))) {continue};
            if(_attemptTags(filterExcludeTags(filter.tagsExcluded, anime['tags']))) {continue};
        } else {
            if(!pref.showNSFW) {continue}
            if(_attemptTags()){continue}
        };
        // sort by nsfw
        if(!pref.showNSFW && filterAnimeTag('allnsfw', anime['tags'])) {continue};
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
    //
    _filterWorkTime = floatNumber(performance.now() - ts, 1);
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
let _alist_limit = 200;
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
            adb: String(adb_information.lastUpdate),
            app: String($appInfo.version),
        };
        this.timestamp = {
            created: (new Date()).toLocaleDateString() + ' ' + (new Date()).toLocaleTimeString(),
            lastChange: (new Date()).toLocaleDateString() + ' ' + (new Date()).toLocaleTimeString(),
        };
        // null if no preset
        this.presetname = null;
        // ranges
        this.rangesMode = 'auto'; // auto, manual
        this.eps = range(-1, 1);
        this.years = range(-1, 1);
        this.scores = range(-1, 1);
    }
    //
    updateTimestamp() {
        this.timestamp.lastChange = (new Date()).toLocaleDateString() + ' ' + (new Date()).toLocaleTimeString()
    }
    compatibility() {
        var status = {app: true, adb: true, version: this.compat.version};
        if(this.compat.adb != adb_information.lastUpdate && this.compat.adb !== undefined) {status.adb = false};
        if(this.compat.app != $appInfo.version && this.compat.app !== undefined) {status.app = false};
        return status
    }
    //
    updateRangesSingle(item) {
        if(this.rangesMode == 'auto') {
            this.updateTimestamp();
            var anime = item;
            // var malid = malAnimeID(anime.sources);
            // if(malid == null) {anime.score = null}                               // it works with old `adb_ratings`
            // else if(adb_ratings[malid] == undefined) {anime.score = null}
            // else {anime.score = String(adb_ratings[malid].score)};
            // debug for old versions
            if(anime.score === undefined) {anime.score = null};
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
            this.eps = range(-1, 1);
            this.years = range(-1, 1);
            this.scores = range(-1, 1);
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
    _prefix: `https://api.jikan.moe/v4/anime`,
    _request: () => {},
    _xhr: new XMLHttpRequest(),
    _result: null,
    _response: null,
    _loaded: false,
    _error: false,
    _progress: 0,
    _waitResponse: false,
    _timeout: 0,
    _onresult: false,
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
    _send: (mal_id, sess=true) => {
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
                    console.log(`Jikan API error with status: ${jikan._xhr.status}.\n${jikan._xhr.statusText}`);
                    jikan._loaded = true;
                    jikan._error = true;
                    jikan._result = `failed`;
                } else {
                    sess ? sesWrite(`jikan${mal_id}`, JSON.stringify(jikan._xhr.response)) : null;
                    jikan._result = jikan._response = jikan._xhr.response;
                    jikan._loaded = true;
                    //
                    if(jikan._onresult !== false) {
                        jikan._onresult();
                        jikan._onresult = false
                    }
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
        jikan._xhr.open("GET", jikan._prefix + '/' + mal_id + '/statistics');
        jikan._send(mal_id, false)
    },
    full: (mal_id) => {
        if(sesRead('jikan'+mal_id) !== null) {
            jikan._cache(mal_id)
        } else {
            jikan._xhr.open("GET", jikan._prefix + '/' + mal_id + '/full');
            jikan._send(mal_id)
        }
    },
    custom: (string) => {
        jikan._xhr.open("GET", string);
        jikan._send(0, false)
    },
    //
    page: 1,
    lastQ: '',
    search: (q) => {
        if(q.length < 2) {return};
        if(q != jikan.lastQ) {
            jikan.lastQ = q;
            jikan.page = 1
        };
        jikan._xhr.open("GET", jikan._prefix + `?q=${q}&page=${jikan.page}&sfw=${!pref.nsfw}`);
        jikan._send(0, false)
    },
};
//
function malAnimeID(sources) {
    var source = null;
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
// (MyMemory API)
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
    len: 4500, // api limit is 5000
    //
    send: (text) => {
        // var data = JSON.stringify([{Text: text}]);
        transXHR.open('POST', `https://api.mymemory.translated.net/get?q=${text}&langpair=en%7C${translator.target}`);
        // transXHR.open('POST', `https://microsoft-translator-text.p.rapidapi.com/translate?to%5B0%5D=${translator.target}&api-version=3.0&from=en`);
        transXHR.setRequestHeader('content-type', 'application/json');
        // transXHR.setRequestHeader('X-RapidAPI-Key', '1c1569888bmsha3e843083c42b72p166a6fjsn2ec89f708f43');
        // transXHR.setRequestHeader('X-RapidAPI-Host', 'microsoft-translator-text.p.rapidapi.com');
        transXHR.send();
    },
    //
    getProgress: () => {
        return `${translator.progress}/${translator.request.length}`
    },
    //
    iteration: (response) => {
        var object = JSON.parse(response);
        // обработка ответа
        if(object["responseData"] === undefined) {
            // если не стандартная форма ответа
            translator.error = true;
            translator.response.push(object)
        } else {
            if(object["responseData"]["translatedText"] === undefined) { // если в ответе нет переведённого текста
                translator.error = true;
                translator.response.push(object["responseData"]);
                return
            };
            // если пришел текст - добавляем его
            translator.response.push(object["responseData"]["translatedText"]);
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
        if(translator.state !== 'idle') {return null} // ru()
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
// @EAG BROWSE DB METHODS
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
function searchByMALPage(url) {
    var malid = url.substring(url.indexOf('anime/')+6);
    if(String(Number(malid)) == 'NaN') {malid = malid.substring(0, malid.indexOf('/'))};
    for(var a in adb) {
        if(malAnimeID(adb[a].sources) == malid) {return Number(a)}
    };
    return false
};
//
// @EAG RESIZE WINDOW
//
let docsize = new Vector2(window.innerWidth, window.innerHeight);
let doczoom = 1;
let cvssize = new Vector2();
let fullsize = new Vector2(window.innerWidth, window.innerHeight);
let cvsorient = 'album';
let cvsxoffset = 0;
//
let cvsscale = new Vector1(1);
let _scaleFixed = 1;
let _scaleDynamic = 1;
//
let casState = 'idle';
let casTimeout = 0.25;
let casResized = new Vector2();
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
    };
    cvsscale.update();
    _scaleFixed = cvsscale.getFixed();
    _scaleDynamic = cvsscale.get()
};
//
// @EAG MARKUP & RESCALE
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
            ctx.fillText(array[i], pos.x, (pos.y + size.y) + (size.y + spacing) * i)
        }
    } else if(ctx.textAlign === 'end') {
        for(var i = 0; i < array.length; i++) {
            ctx.fillText(array[i], pos.x + size.x, (pos.y + size.y) + (size.y + spacing) * i)
        }
    } else {
        for(var i = 0; i < array.length; i++) {
            ctx.fillText(array[i], pos.x + size.x/2, (pos.y + size.y) + (size.y + spacing) * i)
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
//                                                                                                      UI MAP CLASS
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
const colorMapBackDefault = `rgba(31,31,31,1)#rgba(63,63,63,1)#rgba(63,63,63,1)#rgba(0,0,0,0.5)`;
const colorMapForeDefault = `rgba(225,225,225,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(191,191,191,0.75)`;
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
//                                                                                       2D STYLED SHAPES
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
        this.cooldown = 1;
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
            if(this.cooldown > 0) {this.cooldown -= deltaTime/1000};
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
                    if(this.state === 'click' && this.cooldown <= 0) {
                        //
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
                            if(this.waitanim) {setTimeout(() => {this.onclick(); this.cooldown = 0.5}, 0.25)}
                            else {this.onclick(); this.cooldown = 0.5}
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
const _imagebuttonheight = 6;
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
        this.cooldown = 1;
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
            if(this.cooldown > 0) {this.cooldown -= deltaTime/1000};
            // shapes
            this.shape = this.shapefunc(this.pos.get().sumxy(0, this.tap.get()), this.shapesize);
            this.shadow = this.shapefunc(this.pos.get().sumxy(0, this.tap.get()+1), this.shapesize.sumxy(0, this.height-this.tap.get()));
            // states
            if(this.state !== 'unaval') {
                this.state = shapeCollisionState(this.shape, false);
                if(this.state === 'hover') {this.onhover()};
                if(this.state !== this.oldstate) {
                    if(this.state === 'click' && this.cooldown < 0) {
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
                            if(this.waitanim) {setTimeout(() => {this.onclick(); this.cooldown = 0.5}, 250)}
                            else {this.onclick(); ; this.cooldown = 0.5}
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
                    spartTopClicks(particleImages.apply);
                    tagSelection[this.tag] = 'inc'
                } else if(tagSelection[this.tag] === 'inc') {
                    playSound(sound['tagexc']);
                    spartTopClicks(particleImages.remove);
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
        this.oldpoint = 0; // for sound
        this.soundstep = 0.03;
        this.playsound = true;
        this.onset = (value) => {};
        this.onhover = (value) => {};
        this.postdraw = (value) => {};
        this.unpress = (value) => {}; // only in permanent
    }
    update(value, max=this.maxvalue) {
        this.maxvalue = max; 
        this.progress = value / this.maxvalue; 
        this.soundstep = 1/max < 0.02 ? 0.02 : 1/max; // max steps count = 50
    }
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
        !mouse.press ? this.state = shapeCollisionState(this.shadow, false) : false;
        // control
        if(!this.mod) {this.pointer = +this.progress};
        if(this.permanent) {
            if(this.state === 'hover' || this.state === 'click') {
                this.onhover(this.maxvalue * ((mouse.pos.x - this.pos.x) / this.size.x));
                if(mouse.press) {
                    this.mod = true;
                    this.pointer = (mouse.pos.x - this.pos.x) / this.size.x;
                    this.pointer = this.pointer < 0 ? 0 : this.pointer > 1 ? 1 : this.pointer;
                    this.progress = +this.pointer;
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
                    this.pointer = this.pointer < 0 ? 0 : this.pointer > 1 ? 1 : this.pointer;
                    this.mod = true
                } else if(this.mod) {
                    this.progress = +this.pointer;
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
                this.progress = +this.pointer;
                this.onset(this.get());
                this.mod = false
            }
        };
        // playsound
        if(this.playsound && this.state == 'hover') {
            if(this.pointer < this.oldpoint - this.soundstep || this.pointer > this.oldpoint + this.soundstep) {
                this.oldpoint = +this.pointer;
                playSound(sound['tagnone'], 0.33 + this.pointer*0.67)
            }
        } else {this.oldpoint = +this.pointer};
        // draw
        fillShape(this.shadow, this.back.getColor());
        fillShape(this.shape, this.fore.getColor());
        this.postdraw(this.get())
    } 
};
//
// @EAG SHAPED HOLDBUTTON
//
const _holdbuttonbhvr = {
    time: 1000,
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
        this.dtime = _holdbuttonbhvr.time;
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
                        if(this.dtime < this.time && !this.operate) {
                            this.dtime += deltaTime
                        }
                    }
                } else {
                    this.shapecm.setState('idle', 0.25);
                    if(!this.operate) {
                        this.dtime = +this.time;
                    }
                }
            } else {this.shapecm.setState('unaval', 0.25)};
            //
            this.shapecm.update();
            this.shapecm.alphaMult(this.alpha);
            this.shapeclr = this.shapecm.get();
            this.progress = 1 - Math.norma(this.dtime / this.time);
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
        this.dtime = +this.time;
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
    var width = getTextMetrics(text).x;
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
    var real=0, state = 'measure', strings = [], measure, pointer, settext = text;
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
        real++;
        if(strings.length >= max || real >= 99) {break}
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
// editing text by custom input
function editTextInput(text = '') {
    var edit = text;
    for(let i=0; i<inputkeys.length; i++) {
        var c = inputkeys[i];
        if(c.length > 1) {
            // it is command
            if(c == 'Backspace') {edit = edit.slice(0, edit.length-1)};
            if(c == 'Escape') {edit = ''};
            if(c == 'Delete') {edit = edit.slice(0, edit.lastIndexOf(' '))};
        } else {
            // it a character
            edit = edit.concat(c)
        }
    };
    inputkeys = [];
    return edit
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
    yaccur: -1,
    //
    time: 0.33,
    cd: 0,
    alpha: new Vector1(0),
    //
    invoke: (text, color = '#fff') => {
        if(mouse.pos.y >= hoverHint.yaccur) {
            hoverHint.text = text;
            hoverHint.cd = hoverHint.time;
            hoverHint.color = color
        }
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
const fitFrameSize = new Vector2(240);
const fitImageBorder = 4;
let allInvokedImages = [];
// for predict 404
const imageNotFound = invokeNewImage('images/notfound.png');
//
const imageWorkInProgress = invokeNewImage('images/wip.png');
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
const siteNames = { 
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
const siteSequence = [
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
const _slpp = 'images/';
const siteLogos = [
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
const siteButtonColormap = `rgba(0,0,0,0)#rgba(0,255,127,0.2)#rgba(0,255,127,1)#rgba(255,63,63,0.2)`;
let siteimageSpacing = new Vector2(1);
const siteButtonSize = 32;
const siteButtonTime = 0.3;
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
    const title = roulette.centerAnime;
    const malid = malAnimeID(title.sources);
    if(malid != null) {
        window.open('https://shikimori.one/animes/'+malid)
    } else {
    window.open(`https://shikimori.one/animes?search=${title.title}`)
    }
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
const tinfBoxSize = 250;
const tinfBoxZoom = 1.2;
const tinfBoxZoom2 = 0.8;
const tinfSpacing = 5;
const tinfTime = 0.3;
const tinfHeaderSize = 24;
const tinfFontSize = 16;
// 
const seasonsDataMap = {
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
const typesDataMap = {
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
    yeart: 0,
    status: '',
    season: '',
    type: '',
    score: new Vector1(0),
    scoret: '',
    //
    updateTitle: (title) => {
        tInfo.updater = tinfTime;
        tInfo.title = title;
        tInfo.episodes.move(title['episodes'], tinfTime, easeInOutCubic);
        tInfo.year.move(Number(title['animeSeason']['year']), tinfTime, easeInOutCubic);
        tInfo.season = txt([seasonsDataMap[title['animeSeason']['season']][1]]);
        tInfo.type = txt([typesDataMap[title['type']]]);
        tInfo.status = txt([typesDataMap[title['status']]]);
        // scores
        tInfo.rating = malAnimeID(title['sources']);
        // if(tInfo.rating !== null) {
        //     if(adb_ratings[tInfo.rating] !== undefined) {
        //         tInfo.score = adb_ratings[tInfo.rating].score !== 'None'             // works with old `adb_ratings`
        //         ? adb_ratings[tInfo.rating].score : '???';
        //         tInfo.scoredby = adb_ratings[tInfo.rating].scoredby !== 'None'
        //         ? adb_ratings[tInfo.rating].scoredby : '???';
        //     } else {
        //         tInfo.score = tInfo.scoredby = '???'
        //     }
        // }
        if(title.score == null) {tInfo.score.move(-1, tinfTime, easeInOutCubic)} else {tInfo.score.move(title.score, tinfTime, easeInOutCubic)} // -1 is `???`
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
            tInfo.score.update();
            if(tInfo.score.getFixed() < 0) {tInfo.scoret = '???'} else {tInfo.scoret = floatNumber(tInfo.score.get(), 2)};
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
        // draw score info (строчки отдельно, чтобы не дрыгалось)
        ctx.textAlign = 'end';
        fillTextFast(tInfo.posit(3).sumxy(tInfo.width*0.62, tInfo.height*0.7), txt('malScore'));
        ctx.textAlign = 'start';
        fillTextFast(tInfo.posit(3).sumxy(tInfo.width*0.64, tInfo.height*0.7), tInfo.scoret);
        // пресет
        ctx.textAlign = 'center';
        scaleFont(tinfFontSize, 'Segoe UI', 'bold');
        if(tInfo.meta.usePreset) {
            fillTextFast(tInfo.posit(4).sumxy(tInfo.width/2, tInfo.height*0.7), textStringLimit(tInfo.meta.object.name, tInfo.width));
            scaleFont(tinfFontSize, 'Segoe UI');
            fillTextFast(tInfo.posit(5).sumxy(tInfo.width/2, tInfo.height*0.5), filterChangesString());
        } else {
            fillTextFast(tInfo.posit(4).sumxy(tInfo.width/2, tInfo.height*0.7), textStringLimit(tInfo.meta.object.name, tInfo.width));
            scaleFont(tinfFontSize, 'Segoe UI');
            fillTextFast(tInfo.posit(5).sumxy(tInfo.width/2, tInfo.height*0.5), tInfo.meta.object.timestamp.created);
        }
        // MAL оценки
        // scaleFont(tinfFontSize, 'Segoe UI', 'bold');
        // fillTextFast(tInfo.posit(5).sumxy(tInfo.width*0.5, tInfo.height*0.7), txt('malHead'));
        // scaleFont(tinfFontSize, 'Segoe UI');
        // fillTextFast(tInfo.posit(6).sumxy(tInfo.width*0.5, tInfo.height*0.5), txt('malScore') +  tInfo.scoret);
        // fillTextFast(tInfo.posit(7).sumxy(tInfo.width*0.5, tInfo.height*0.3), txt('malScoredBy') + tInfo.scoredby)
        // malid & dbid
        ctx.fillStyle = '#fff8';
        ctx.textAlign = 'start';
        scaleFont(10, 'Consolas');
        fillTextFast(tInfo.pos.sumxy(tInfo.spacing*3, tInfo.box-tInfo.spacing/2), '#' + tInfo.title['fake_dbid']);
        ctx.textAlign = 'end';
        if(tInfo.rating  !== null) {
            fillTextFast(tInfo.pos.sumxy(tInfo.box-tInfo.spacing*3, tInfo.box-tInfo.spacing/2), 'malid ' + tInfo.rating)
        } else {
            fillTextFast(tInfo.pos.sumxy(tInfo.box-tInfo.spacing*3, tInfo.box-tInfo.spacing/2), 'no malid')
        };
        //
        ctx.globalAlpha = 1
    },
};
//
// @EAG DESCRIPTION OBJECT
//
const descrFontFamily = 'Segoe UI';
const descrFontSize = 13;
const descrFontSpacing = 0.2;
const descrWaiting = 0.5;
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
        // descrWatchTrailer.draw();        // нет норм апи для перевода, клаудфл блокнут(((
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
const rbBodyHeight = 60;
const rbSpacing = 5;
let rbRollWidth = (rbBodyHeight - rbSpacing*2)*2 + rbSpacing;
//
let buttonDoRoll = new TextButtonShaped(shapeRectRounded, txt('rbRoll'), new Vector2(200, 40),
    colorMapMatrix(colorMapForeDefault),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(63,63,255,0.25)#rgba(63,63,255,1)#rgba(0,0,0,0)`));
buttonDoRoll.onclick = () => {
    if(!roulette.hidemap && !rollBar.rollStarted) {
        rollBar.rollStarted = true;
        rollBar.state = 'hide';
        buttonDoRoll.text = txt('rbWait');
        musicLite.hide();
        musicLite.wait = true;
        spartWinnerDrop(mouse.pos, 8, 1.5);
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
const imageChangeFilter = invokeNewImage('images/filter.png');
const imagePrefMenu = invokeNewImage('images/pref.png');
const imageMarathonLogo = invokeNewImage('images/marathon.png');
let buttonChangeFilter = new ImageButtonShaped(shapeRectRounded, imageChangeFilter, new Vector2(5),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(255,63,255,0.25)#rgba(255,63,255,1)#rgba(0,0,0,0)`));
buttonChangeFilter.onclick = () => {saf.scroll.set(0); playSound(sound['player']); requestScreen(screenAnimeFilter)};
let buttonOpenPref = new ImageButtonShaped(shapeRectRounded, imagePrefMenu, new Vector2(5),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(255,255,63,0.25)#rgba(255,255,63,1)#rgba(0,0,0,0)`));
buttonOpenPref.onclick = () => {playSound(sound['player']); spref.scroll.set(0); requestScreen(screenPreferences)};
let buttonOpenMarathon = new ImageButtonShaped(shapeRectRounded, imageMarathonLogo, new Vector2(5),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(63,255,63,0.25)#rgba(63,255,63,1)#rgba(0,0,0,0)`));
buttonOpenMarathon.onclick = () => {playSound(sound['player']); showScreenMarathon()};
buttonChangeFilter.waitanim = false;
buttonOpenPref.waitanim = false;
buttonOpenMarathon.waitanim = false;
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
    light: 0,
    lighttime: 1000,
    lightrect: 0,
    lightcolor: 0,
    //
    rollStarted: false,
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
        rbRollWidth = rollBar.size.y *3;
        // рисуем
        if(rollBar.state !== 'init' && rollBar.state !== 'invis') {
            fillRectRounded(rollBar.size, rollBar.pos, `rgba(0,0,0,${pref.bgalpha})`, 10*_scaleDynamic);
            // крутить
            ctx.textAlign = 'center';
            scaleFont(36, 'Arial', 'bold');
            buttonDoRoll.size.setxy(rbRollWidth, rollBar.size.y-rollBar.spacing*2);
            buttonDoRoll.pos.setv(rollBar.pos.sumxy(rollBar.spacing));
            buttonDoRoll.draw();
            // подсветка кнопки ролла, чтобы её выделить
            if(roulette.winnerPos == -1 && roulette.catchWinner == false) {
                rollBar.light += deltaTime;
                if(rollBar.light > rollBar.lighttime) {
                    rollBar.light = 0; 
                    rollBar.lightrect = rollBar.lighttime;
                    rollBar.lightcolor = Math.round(Math.random() * 360);
                }
            };
            if(rollBar.lightrect > 0) {
                ctx.fillStyle = `hsla(${rollBar.lightcolor} 100% 80% / ${rollBar.lightrect/1500})`;
                var mult = 1.4 - (rollBar.lightrect / rollBar.lighttime)/2;
                fillRectRounded(buttonDoRoll.size.multxy(mult), 
                    buttonDoRoll.pos.sumv(buttonDoRoll.size.dividexy(2)).minv(buttonDoRoll.size.multxy(mult/2)),
                    `hsla(${rollBar.lightcolor} 100% 80% / ${rollBar.lightrect/2000})`, 10*_scaleDynamic);
                rollBar.lightrect -= deltaTime
            };
            // карта
            drawMapRoulette(rollBar.size.x - (rbRollWidth*2 + rollBar.spacing*4), rollBar.pos.sumxy(rbRollWidth + rollBar.spacing*4, rollBar.size.y*0.75 - rmpBarHeight/2));
            // фильтр, настройки
            // scaleFont(36, 'Arial', 'bold');
            var btnsize = new Vector2(buttonDoRoll.size.y);
            if(!roulette.marathon) {
                // block button while marathon is selecting anime
                buttonOpenMarathon.sizedZoom(btnsize);
                buttonOpenMarathon.pos.setv(rollBar.pos.sumxy(rollBar.size.x, rollBar.spacing).minxy(buttonDoRoll.size.y*3 + rollBar.spacing*3, 0));
                buttonOpenMarathon.draw();
                buttonChangeFilter.sizedZoom(btnsize);
                buttonChangeFilter.pos.setv(rollBar.pos.sumxy(rollBar.size.x, rollBar.spacing).minxy(buttonDoRoll.size.y*2 + rollBar.spacing*2, 0));
                buttonChangeFilter.draw();
            };
            if(mrthGetItem('marathon_key') !== false) {
                // draw filter button by marathon_key
                buttonChangeFilter.sizedZoom(btnsize);
                buttonChangeFilter.pos.setv(rollBar.pos.sumxy(rollBar.size.x, rollBar.spacing).minxy(buttonDoRoll.size.y*2 + rollBar.spacing*2, 0));
                buttonChangeFilter.draw();
            };
            buttonOpenPref.sizedZoom(btnsize);
            buttonOpenPref.pos.setv(rollBar.pos.sumxy(rollBar.size.x, rollBar.spacing).minxy(buttonDoRoll.size.y + rollBar.spacing, 0));
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
const mlcSpacing = 5;
const mlcBarSpacing = 2;
const mlcBarSize = new Vector2(360, 10);
const mlcButtonSize = 40;
//
const mlcPlayImage = invokeNewImage('images/play.png');
const mlcPauseImage = invokeNewImage('images/pause.png');
const mlcNextTrackImage = invokeNewImage('images/random.png');
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
    if(mouse.pos.x < mlcMusicBar.pos.x || mouse.pos.x > mlcMusicBar.pos.x + mlcMusicBar.size.x) {return};
    ctx.fillStyle = '#fff'; ctx.textAlign = 'end'; scaleFont(12, 'Consolas');
    ctx.fillText(timeStringify(musicNormalComplete ? value : 0), mouse.pos.x-(2*_scaleDynamic), mlcMusicBar.pos.y+mlcBarSize.y+(14*_scaleDynamic))
};
mlcMusicBar.permanent = false;
mlcMusicBar.playsound = false;
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
        if(pref.playClip) {

        };
        musicLite.walpha.update();
        if(musicLite.wait && musicLite.walpha.getFixed() == 0) {musicLite.walpha.move(1,1,easeInCirc)} 
        else if(!musicLite.wait && musicLite.walpha.getFixed() == 1) {musicLite.walpha.move(0,0.5,easeOutCirc)};
        //
        if(musicLite.walpha.get() > 0) {
            ctx.globalAlpha = musicLite.walpha.get();
            //
            var wsize = new Vector2(400, 24).multxy(_scaleDynamic);
            fillRectRounded(wsize, normalAlign(new Vector2(0.5,0.95), wsize), `#000a`, 8*_scaleDynamic);
            scaleFont(16, 'Segoe UI');
            ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
            fillTextFast(normalAlign(new Vector2(0.5,0.95), wsize).sumxy(wsize.x/2, wsize.y*0.8),
            `${txt('hintAwaitingClip')} (${floatNumber(clipTimeout-clipWaiting, 1)} s.)`);
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
    timeout: 10,
    notfoundplaced: false,
    //
    dragged: 100,
    idleSpeed: 1,
    winnerPos: -1,
    hidemap: false,
    isempty: false,
    //
    marathon: false,
    pitch: 0.8, // prikol
    //
    mapper: rouletteItemsMapper,
    winnerStyle: new Color(63, 255, 63, 1),
    nameboxcolor: new Color(255, 255, 255, 1),
    nameboxdef: new Color(255, 255, 255, 1),
    //
    progress: new Vector1(0),
    picsGet: (array) => {
        roulette.timeout = 10; // timeout for poster loading
        roulette.notfoundplaced = false;
        roulette.anime = array;
        lsSaveObject('roulette.anime', optimizeAnimeArray(roulette.anime));
        roulette.pics = [];
        //
        for(var i=0; i<roulette.picsCount; i++) {
            roulette.pics[i] = new Image();
            roulette.pics[i].onerror = () => {roulette.pics[i].src = 'images/notfound.png'};
            if(array[i]['picture'] !== undefined) {
                roulette.pics[i].src = array[i]['picture'];
                // roulette.pics[i].lowsrc = array[i]['thumbnail'];
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
        roulette.timeout -= deltaTime/1000;
        var progress = 0;
        for(var pic in roulette.pics) {
            if(roulette.pics[pic].complete) {progress++}
        };
        if(roulette.timeout < 0 && !roulette.notfoundplaced) {
            roulette.notfoundplaced = true;
            for(var pic in roulette.pics) {
                if(!roulette.pics[pic].complete) {
                    console.warn('anime poster not loaded (timeout 10s.) -> ' + roulette.pics[pic].src);
                    roulette.pics[pic].src = 'images/notfound.png'
                }
            };
        }
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
        //
        // if(roulette.progress.value > 9999 || roulette.progress.value < 9999) {roulette.progress.set(0)};
        if(roulette.speed.get() !== 0) {roulette.progress.value += roulette.speed.get() * (deltaTime/1000)};
        // крутим
        if(roulette.time < roulette.atime) {
            roulette.time += deltaTime/1000;
            //тут думать надо, мб всё это хуйня ыааыыыааооууо уэээээ :{
            var diff = roulette.time / roulette.atime;
            if(diff <= 0.25) {
                roulette.speed.set(roulette.speedMax * easeInQuad(diff*4))
            } else if(diff > 0.25 && diff <= 0.5) {
                roulette.speed.set(roulette.speedMax * (1 - (diff-0.25)*3.5))
            } else {
                roulette.speed.set((roulette.speedMax/8) * easeInCirc(Math.abs((diff-1)*2)))
            }
        } else {
            if(roulette.catchWinner === true) {
                roulette.speed.reset();
                roulette.catchWinner = roulette.centerItem();
                roulette.winnerPos = roulette.centerNumber();
                roulette.nameboxcolor = roulette.winnerStyle;
                roulette.progress.move(roulette.winnerPos, 0.5, easeOutQuint);
                roulette.time = Number(roulette.atime);
                console.log('Winner: '+roulette.catchWinner['title'] + '\n    ' + roulette.catchWinner['sources'][0]);
                !pref.playClip ? musicRollEnd() : null;
                rollWinner.invoke(roulette.centerAnime.title);
                lsSaveObject('roulette.winner', [roulette.winnerPos, roulette.catchWinner]);
                // marathon work
                if(roulette.marathon) {
                    // update anime rect
                    mapGetRect(mapMeta.pos).object.animedata = roulette.centerItem();
                    mapGetRect(mapMeta.pos).object.state = 'jikan_wait';
                    // delete key if have
                    if(mrthGetItem('marathon_key') !== false) {mrthDeleteItem('marathon_key')};
                    setTimeout(() => {
                        mapMeta.cutscene = false;
                        roulette.marathon = false;
                        buttonChangeFilter.state = 'idle';
                        buttonOpenPref.state = 'idle';
                        //
                        mapMeta.watching = true;
                        showScreenMarathon()
                    }, 2500);
                }
            }
        };
        // звучим и обновляем ссылки
        if(roulette.oldCenter !== roulette.centerAnime) {
            if(roulette.catchWinner || roulette.dragged || roulette.initsound) {playSound(sound['scroll'], roulette.pitch)};
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
                };
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
            roulette.sorted.sort(rouletteSortPosters);
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
    sload.state = 'loadnew';
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
    tf.zoom *= 0.2 + 0.6 * easeParabolaQuad(p);
    //
    return tf
};
//
function rouletteSortPosters(a,b) {
    if(a.zoom === b.zoom) {
        return 0
    } else {
        if(a.zoom > b.zoom) {return 1} else {return -1}
    }
};
//
// @EAG VISUAL EFFECTS
//
const winnerLightRing = invokeNewImage('images/light.png');
// с новой годой, с новой снегой, это к НГ крч эффект снега
const novyigodSanta = invokeNewImage('images/chibi_santa.png');
const novyigodElka = invokeNewImage('images/christmas_tree.png');
const noviygodSize = new Vector2(160);
const noviygodOffset = new Vector2(200, 0);
//
const particleImages = {
    confetti: [
        invokeNewImage('images/particles/conf1.png'),
        invokeNewImage('images/particles/conf2.png'),
        invokeNewImage('images/particles/conf3.png'),
        invokeNewImage('images/particles/conf4.png'),
        invokeNewImage('images/particles/conf5.png'),
        invokeNewImage('images/particles/conf6.png'),
        invokeNewImage('images/particles/conf7.png'),
        invokeNewImage('images/particles/conf8.png'),
    ],
    apply: invokeNewImage('images/particles/apply.png'),
    remove: invokeNewImage('images/particles/remove.png'),
};
// NOVYY GOD
let snowflake = {
    image: invokeNewImage('images/snowflake.png'),
    depth: range(0.3, 1),
    sizeMax: 40,
    velX: range(-40, 40),
    velY: range(40, 150),
    rotate: range(-180, 180),
    flow: range(0.15, 0.4),
    flowX: range(50, 150),
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
            this.parallax.setv(parallaxOffsW.multxy(this.depth - (snowflake.depth.max+snowflake.depth.min)/2))
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
let resetSnowflakes = () => {snowflake.array=[];for(var i=0; i<snowflake.count; i++) {snowflake.array[i] = new Snowflake()}};
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
        }
    }
};
//
class visualParticle {
    constructor() {
        // transform
        this.pos = new Vector2();
        this.velocity = new Vector2();
        this.size = new Vector2();
        this.rotate = 0; // 360
        this.angVelocity = new Vector1();
        // picture
        this.pic = new Image();
        this.alpha = new Vector1(1);
        // meta
        this.lifetime = 0;
    }
    draw(posMod=false, posMult=new Vector2(1), scale=false) {
        // update all vectors
        this.pos.update();
        this.velocity.update();
        this.size.update();
        this.angVelocity.update();
        this.alpha.update();
        // modifying & scaling
        this.pos = this.pos.sumv(this.velocity.get().multxy(_scaleDynamic*deltaTime/1000));
        var pos = posMod === false ? this.pos.get() : (this.pos.get().multxy(posMult).sumv(posMod));
        var size = scale === false ? this.size.get() : this.size.get().multxy(scale);
        // life
        this.lifetime -= deltaTime/1000;
        // update rotation
        this.rotate += this.angVelocity.get() * deltaTime/1000;
        this.rotate >= 360 ? this.rotate -= 360 : this.rotate < 0 ? this.rotate += 360 : null;
        // draw
        setRotation(pos, this.rotate);
        ctx.globalAlpha = this.alpha.get();
        drawImageSized(this.pic, pos.minv(size.multxy(0.5*_scaleDynamic)), size.multxy(_scaleDynamic));
        ctx.globalAlpha = 1;
        ctx.resetTransform();
    }
};
//      BASE FUNCTIONS
//
function particleSplash(particle, pool, pos, count, time=1) {
    for(let i=0; i<count; i++) {
        var p = visual[pool][visual.pointers[pool]];
        var rtime = time + time * 0.2 * Math.random();
        // setting
        p.lifetime = rtime;
        p.pos.setv(pos);
        p.size.setxy(60);
        var vel = 350 + 100 * Math.random();  // distantion from center
        var ang = 600 + 200 * Math.random(); // angular velocity
        var rad = (Math.random() * 359.99) * (Math.PI / 180); // random direction
        p.velocity.setxy(Math.cos(rad)*vel, -Math.sin(rad)*vel);
        p.angVelocity.set(ang);
        p.pic = particle;
        p.alpha.set(1);
        p.rotate = 359.9 * Math.random();
        // moving
        p.velocity.movexy(0, 0, rtime/2, easeOutCirc);
        p.angVelocity.move(0, rtime*0.8, easeOutCirc);
        p.alpha.move(0, rtime, easeInCirc);
        // pointer
        visual.pointers[pool]++;
        if(visual.pointers[pool] >= visual[pool].length) {visual.pointers[pool] = 0}
    }
};
function particleDrop(particle, pool, pos, count, time=1) {
    for(let i=0; i<count; i++) {
        var p = visual[pool][visual.pointers[pool]];
        var rtime = time + time * 0.2 * Math.random();
        // setting
        p.lifetime = rtime;
        p.pos.setv(pos);
        p.size.setxy(30);
        var vel = 250 + 150 * Math.random();  // distantion from center
        var ang = 600; // angular velocity
        var rad = (30 + Math.random() * 120) * (Math.PI / 180);
        p.velocity.setxy(Math.cos(rad)*vel*0.8, -Math.sin(rad)*vel);
        p.angVelocity.set(ang + ang*0.25 * Math.random());
        p.pic = particle;
        p.alpha.set(0.8);
        p.rotate = 359 * Math.random();
        // moving
        p.velocity.movexy(0, 250 + 100*Math.random(), rtime*0.67);
        p.angVelocity.move(ang*0.25, rtime, easeOutCirc);
        p.alpha.move(0, rtime, easeInCirc);
        // pointers
        visual.pointers[pool]++;
        if(visual.pointers[pool] >= visual[pool].length) {visual.pointers[pool] = 0}
    }
};
//      SPECIAL FUNCTIONS
//
function spartMrthLogos(rect) {
    if(mrthMeta.visuals === false) {return}; // false, 'half', 'full'
    var mult = mrthMeta.visuals == 'full' ? 1 : 0.5;
    if(rect.type == 'empty') {
        particleSplash(filterImageBrowser, 'mrth', mapRectCenter(rect), 4*mult, 1.5)
    } else {
        particleSplash(mrthTypedLogos[rect.type], 'mrth', mapRectCenter(rect), 8*mult, 2.5)
    }
};
function spartTopClicks(particle, count=1) {
    particleDrop(particle, 'top', mouse.pos, count, 2)
};
function spartWinnerDrop(pos, count=1, time=4) {
    for(let i=0; i<count; i++) {
        var part = particleImages.confetti[Math.floor(Math.random() * (particleImages.confetti.length-0.001))];
        // var part = particleImages.confetti[1];
        particleDrop(part, 'top', pos, 1, time)
    }
};
// for event rects
function spartMrthGoodIssue(coins=false) {
    if(mrthMeta.visuals === false) {return};
    var mult = mrthMeta.visuals == 'full' ? 1 : 0.5;
    if(!coins) {
        particleSplash(particleImages.apply, 'mrth', mapRectCenter(mapMeta.selected), 8*mult, 1.5)
    } else {
        particleSplash(particleImages.apply, 'mrth', mapRectCenter(mapMeta.selected), 6*mult, 1.5)
    };
    // sounds & coins
    playSound(sound['success']);
    if(coins) {
        setTimeout(() => {
        particleSplash(mrthBadgeCoins, 'mrth', mapRectCenter(mapMeta.selected), 4*mult, 1.5);
        playSound(sound['coins'])
    }, 1000)
    }
};
function spartMrthBadIssue() {
    if(mrthMeta.visuals === false) {return};
    var mult = mrthMeta.visuals == 'full' ? 1 : 0.5;
    particleSplash(particleImages.remove, 'mrth', mapRectCenter(mapMeta.selected), 6*mult, 1.5);
    playSound(sound['warn'])
};
//
let visual = {
    // pools
    mrth: [], top: [],
    // pool pointers
    pointers: {
        mrth: 0, top: 0,
    },
    //
    counters: {
        mrth: 0, top: 0,
    },
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
    mrthLayer: (posMod=false, posMult=false, scale=false) => {
        visual.counters.mrth = 0;
        for(var p in visual.mrth) {
            if(visual.mrth[p].lifetime > 0) {visual.counters.mrth++; visual.mrth[p].draw(posMod, posMult, scale)}
        }
    },
    topLayer: () => {
        visual.counters.top = 0;
        for(var p in visual.top) {
            if(visual.top[p].lifetime > 0) {visual.counters.top++; visual.top[p].draw()}
        }
    },
};
// filling particle pool
for(let i=0; i<100; i++) { // size is 100
    visual.mrth[i] = new visualParticle();
    visual.top[i] = new visualParticle();
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
const rmpBarHeight = 10;
let rouletteMapBar = new ShapedSelectBar(new Vector2(cvssize.x*0.3, rmpBarHeight*_scaleDynamic), colorMatrix(`rgba(0,0,0,0)`), colorMatrix(`rgba(0,0,0,0.5)`));
rouletteMapBar.permanent = true;
rouletteMapBar.playsound = false;
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
    //
    dbSize: 40*1024*1024,
    dbProgress: 0,
};
// downloading database
let databaseRequestResult = null;
let adb = [], adb_information = {};
let _adb_xml_request = new XMLHttpRequest();
let _adb_xml_loadprogress = 0;
_adb_xml_request.onprogress = (e) => {_adb_xml_loadprogress = e.loaded};
function getAnimeDatabase() {
    _adb_xml_request.open("GET",'https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database-minified.json',true);
    _adb_xml_request.onload = () => {databaseRequestResult = _adb_xml_request.responseText};
    _adb_xml_request.onerror = () => {databaseRequestResult = false};
    _adb_xml_request.send(null);
};
function awaitForDatabase() {
    if(databaseRequestResult !== null && databaseRequestResult !== 'success' && databaseRequestResult !== 'error') {
        if(databaseRequestResult[0] !== false) {
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
            _preftitles.adb_length = {
                name: 'Anime count',
                object: adb.length,
                url: false
            };
            console.log(`anime-offline-database ${fulldata.lastUpdate} loaded.`);
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
const loadImagesBar = `rgba(200,200,200,0.2)#rgba(255,255,255,0.8)#rgba(0,0,0,1)#rgba(0,0,0,1)`;
//
function screenLoading() {
    imageLoadProgress.size.setxy(400 * _scaleDynamic);
    imageLoadProgress.margin.setxy(10 * _scaleDynamic);
    var spbsize =  new Vector2(fullsize.x, 8 * _scaleDynamic);
    //
    sload.alpha.update();
    sload.dbProgress = Math.norma(_adb_xml_loadprogress / sload.dbSize);
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
        imageLoadProgress.text = txt('loadJkrg') + bytesStringify(_adb_xml_loadprogress);
        imageLoadProgress.shadow.x = imageLoadProgress.size.x;
        getAnimeDatabase();
        //
        sload.state = 'wait_adb'
    //
    } else if(sload.state === 'wait_adb') {
        awaitForDatabase();
        imageLoadProgress.text = txt('loadJkrg') +' '+ bytesStringify(_adb_xml_loadprogress);
        shapeProgressBar(normalAlign(new Vector2(0.5, 0), spbsize), spbsize, sload.dbProgress, colorMapMatrix(loadImagesBar));
        if(databaseRequestResult == 'error') {sload.state = 'timeout'};
        if(databaseRequestResult == 'success') {
            // оптималим датабазу
            databaseShorter();
            // создаём пустой список в редактор здесь, только после загрузки датабазы
            edList.edited = new animeList();
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
                if(!lsItemUndefined('roulette.winner') && !roulette.marathon) {
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
const rollProgressHeight = 3;
//
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
            playSound(sound['scroll']);
            navigator.clipboard.writeText(String(roulette.centerAnime['title']))
        }
    }
};
//
function screenRoulette() {
    srv.hideProgress.update();
    var srvhp = srv.hideProgress.get();
    if(srv.state === 'show_roulette') {
        fillRect(fullsize, fullAlign(new Vector2(0.5), fullsize), radialShadow(srvhp));
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
            // if marathon - delay for rollbar showing
            if(roulette.marathon) {
                setTimeout(() => {rollBar.state = 'show'}, tss.fulltime*2000);
            } else {
                rollBar.state = 'show'
            }
        }
    //
    } else if(srv.state === 'roll_stop') {
        fillRect(fullsize, fullAlign(new Vector2(0.5), fullsize), radialShadow(0));
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
function sbTextFit(text, pos, width, spacing, scroll=0, fsize, color='#fff') {
    var [array, measure] = textWidthFit(text, width - spacing*2);
    ctx.fillStyle = color;
    fillTextArray(pos.sumxy(spacing, spacing - scroll), [array, measure], fsize*0.5*_scaleDynamic);
    return spacing + (measure.y + fsize*0.5*_scaleDynamic) * array.length;
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
const filterBrowserTabHeight = 100;
const filterBrowserItemName = {style: false, font: 'Segoe UI', size: 20};
const filterBrowserItemAbout = {style: false, font: 'Segoe UI', size: 16};
const buttonEditorDeleteSize = new Vector2(90, 30);
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
const pageManagerFont = {style: false, font: 'Segoe UI', size: 20};
const pageManagerButton = new Vector2(150, 30);
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
    console.error(`Title "${data.title}" not found in DB!`);
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
        // this.score = null;
        // if(this.malid != null) {
        //     if(adb_ratings[this.malid] !== undefined) {                  // old version with `adb_ratings`, score already provided in ADB
        //         this.score = Number(adb_ratings[this.malid].score)}};
        // if(typeof this.score !== 'number' || String(this.score) == 'NaN') {this.score = '???'};
        data.score == null ? this.score = null : this.score = +data.score;
        // fast meta
        this.name = data.title;
        this.about = `Ep. ${data.episodes} | Rating ${this.score} | ${data.animeSeason.season}, ${data.animeSeason.year} | ${data.type} | ${data.status} | #${this.dbid}`;
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
};
//
let tagSelectionString = JSON.stringify(tagSelection);
let presetSelected = lsLoadString('presetSelected', 'Бесится, но любит');
let newPresetSelected = lsLoadString('presetSelected', 'Бесится, но любит');
// let presetOnRoulette =  lsLoadString('presetOnRoulette', presetbase[presetSelected].name); UNUSED
// let listOnRoulette = lsLoadString('listOnRoulette', 'ListName'); UNUSED
//
let presetButtons = {};
const presetButtonFont = {
    style: 'bold',
    font: 'Segoe UI Light',
    size: 16
};
let tagButtons = {};
const tagButtonsFont = {
    style: 'bold',
    font: 'Segoe UI Light',
    size: 18
};
const titleCounterFont = {
    style: 'bold',
    font: 'Consolas',
    size: 18
};
const filterHeaderFont = {
    style: false,
    font: 'Segoe UI',
    size: 50
};
//
const filterButtonsSpacing = 8;
const filterCounterHeight = 60;
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
    spartWinnerDrop(mouse.pos, 1, 1);
    presetButtons[presetSelected].active = false;
    presetButtons[presetSelected].tap.move(0, 0.25, easeInOutSine);
    presetSelected = newPresetSelected;
    lsSaveValue('presetSelected', presetSelected)
};
function presetSwitcher() {
    spartWinnerDrop(mouse.pos, 8, 1.5);
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
    eval(`button.onclick = () => {filterDefault['${value}'] = true; lsSaveObject('filterDefault', filterDefault); filterPrecount.request(); spartTopClicks(particleImages.apply)}`);
    eval(`button.ondeact = () => {filterDefault['${value}'] = false; lsSaveObject('filterDefault', filterDefault); filterPrecount.request(); spartTopClicks(particleImages.remove)}`);
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
const filterPromptSize = new Vector2(150, 40);
const filterThreeSize = new Vector2(200, 50);
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
buttonScoreAllow.onclick = () => {filterDefault['scoreAllow'] = true; lsSaveObject('filterDefault', filterDefault); filterPrecount.request(); spartTopClicks(particleImages.apply)};
buttonScoreAllow.ondeact = () => {filterDefault['scoreAllow'] = false; lsSaveObject('filterDefault', filterDefault); filterPrecount.request(); spartTopClicks(particleImages.remove)};
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
        if(key == 'allnsfw') {continue};
        measure = ctx.measureText(tagbase[key].name);
        tagButtons[key].size = new Vector2(Math.floor(measure.width), measure.fontBoundingBoxAscent).sumxy(spacing*2)
    };
    // sts
    for(var key in seasonButtons) {rescaleAnotherButton(seasonButtons, key)};
    for(var key in typeButtons) {rescaleAnotherButton(typeButtons, key)};
    for(var key in statusButtons) {rescaleAnotherButton(statusButtons, key)};
    // prep*
    const s = [
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
buttonFilterLeave.onclick = () => {requestScreen(screenRoulette, false); playSound(sound['player'])};
let buttonFilterApply = new TextButtonShaped(shapeRectRounded, txt('wordApply'), filterThreeSize,
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(filterMainThreePal));
buttonFilterApply.onclick = () => {animeFilterApply(); spartWinnerDrop(mouse.pos, 8, 1.5); playSound(sound['prompt'])};
let buttonFilterReset = new TextButtonShaped(shapeRectRounded, txt('wordReset'), filterThreeSize,
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(filterMainThreePal));
buttonFilterReset.onclick = () => {resetFilter(); filterPrecount.request(); tagSelectionPrepare(); lsSaveObject('tagSelection', tagSelection); playSound(sound['prompt'])};
//
let buttonSwitchPreset = new TextButtonShaped(shapeRectRounded, txt('filterApplyPreset'), new Vector2(300, 50),
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(filterMainThreePal));
buttonSwitchPreset.onclick = () => {presetSwitcher(); filterPrecount.request(); lsSaveObject('tagSelection', tagSelection); playSound(sound['prompt'])};
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
    requestScreen(screenLoading, false)
};
//
function animeArrayApply(array) {
    sload.state = 'loadstart';
    requestScreen(screenLoading, false);
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
    requestScreen(screenLoading, false);
    setTimeout(() => {
        rouletteSetItems(list.getAnime(), false);
        localStorage.removeItem(savePrefix+'roulette.winner');
        sload.state = 'loadnew'
    }, tss.fulltime * 1000);
};
//
const changeableValues = [
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
const buttonAnimeStateSize = new Vector2(240, 35);
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
    saf.state = 'filter'; saf.scroll.set(0);
    playSound(sound['button'])
};
buttonAnimeBrowser.onclick = () => {
    buttonAnimeBrowser.state = 'unaval';
    buttonAnimeEditor.state = 'idle';
    buttonAnimeFilter.state = 'idle';
    buttonAnimeArrays.state = 'idle';
    saf.state = 'browser'; saf.scroll.set(0);
    playSound(sound['button'])
};
buttonAnimeEditor.onclick = () => {
    buttonAnimeBrowser.state = 'idle';
    buttonAnimeEditor.state = 'unaval';
    buttonAnimeFilter.state = 'idle';
    buttonAnimeArrays.state = 'idle';
    saf.state = 'editor'; saf.scroll.set(0);
    playSound(sound['button'])
};
buttonAnimeArrays.onclick = () => {
    buttonAnimeBrowser.state = 'idle';
    buttonAnimeEditor.state = 'idle';
    buttonAnimeFilter.state = 'idle';
    buttonAnimeArrays.state = 'unaval';
    saf.state = 'arrays'; saf.scroll.set(0);
    playSound(sound['button'])
};
buttonAnimeFilter.state = 'unaval';
buttonAnimeBrowser.needshadow = buttonAnimeEditor.needshadow = 
buttonAnimeArrays.needshadow = buttonAnimeFilter.needshadow = false;
buttonAnimeBrowser.waitanim = buttonAnimeEditor.waitanim = 
buttonAnimeArrays.waitanim = buttonAnimeFilter.waitanim = false;
// filter tabs images
let filterImageBackward = invokeNewImage('images/fs_backward.png');
let filterImageFilter = invokeNewImage('images/fs_filter.png');
let filterImageArrays = invokeNewImage('images/fs_arrays.png');
let filterImageEditor = invokeNewImage('images/fs_editor.png');
let filterImageBrowser = invokeNewImage('images/fs_browser.png');
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
buttonBrowseTitles.onclick = () => {
    var p = prompt(txt('filterBrowserPrompt'));
    playSound(sound['prompt']);
    if(p == null) {return} else {sDBs.find(p)}
};
buttonBrowseTitles.needshadow = false;
let buttonBrowseTitlesMAL = new TextButtonShaped(shapeRectRounded, txt('filterMALFind'), buttonAnimeStateSize, 
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`), 
    colorMapMatrix(filterMainThreePal));
buttonBrowseTitlesMAL.onclick = () => {
    var p = prompt(txt('filterMALPrompt'));
    playSound(sound['prompt']);
    if(p == null) {return} else {sDBs.findMAL(p)}
};
buttonBrowseTitlesMAL.needshadow = false;
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
    viewmeta: false, // list, meta
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
    hoverHint.yaccur = -1;
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
    if(filterPrecount.flag || !filterPrecount.first) {fillRectRounded(new Vector2(width * Math.norma(filterPrecount.timeout/0.8), h), pos.sumxy(fbSpacing*4 + width*3, 0), `#0c05`, fbSpacing)}
    else {fillTextFast(pos.sumxy(fbSpacing*4 + width*3.5, h - fbSpacing), textStringLimit(String(filterPrecount.count), width))};
    // отрезаем
    clipCanvas(fullsize.minxy(0, header), new Vector2(cvsxoffset, header));
    saf.height = fbSpacing + header;
    actualizeFilterButtons();
    hoverHint.yaccur = header;
    // заголовок пресетов
    fillRectRounded(new Vector2(saf.width, saf.pointer - saf.height), new Vector2(saf.xanchor+fbSpacing, saf.height - saf.scroll.get()), saf.selbox, 10);
    scaleFontObject(filterHeaderFont); ctx.textAlign = 'center';
    saf.height += sbTextHeader(txt('filterPresets'), new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get());
    scaleFont(16, filterHeaderFont.font);
    saf.height += sbTextFit(txt('filterAboutPresets'), new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get(), 16);
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
    saf.height += sbTextFit(presetbase[newPresetSelected].getInfo(), new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get(), 20);
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
    sbBlockHint.text = txt('hintAllowScore') + (adb.length - adb_information.scored);
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
    saf.height += sbTextFit(txt('filterWarn'), new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get(), 16, '#f44')
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
    all: 0,
    max: 50,
    pages: 1,
    current: 1,
    where: 'db',
    state: 'empty',
    //
    newQuerry: (where, max) => {
        sDBs.max = max;
        sDBs.where = where;
        sDBs.current = 0;
        sDBs.all = 0;
    },
    //
    find: (req, hard) => {
        if(req == '') {return};
        sDBs.state = 'start_db';
        sDBs.newQuerry('db', 50);
        var res = searchByTitle(req, hard);
        if(!res) {
            sDBs.state = 'no_anime';
            return
        } else {
            sDBs.string = req;
            sDBs.result = [];
            for(var r in res) {
                sDBs.result[r] = res[r];
                sDBs.pages = Math.ceil(sDBs.result.length / sDBs.max);
            };
            sDBs.state = 'success';
            sDBs.all = sDBs.result.length;
            sDBs.getPage(1)
        }
    },
    findMAL: (q) => {
        if(q.length < 2) {return};
        sDBs.state = 'start_mal';
        sDBs.newQuerry('mal', 25);
        sDBs.string = String(q);
        sDBs.getPage()
    },
    //
    getPage: (number = 1) => {
        if(number > sDBs.pages || number < 0) {return};
        sDBs.anime = [];
        sDBs.images = [];
        //
        if(sDBs.current !== number) {
            if(sDBs.where == 'db') {
                sDBs.current = number;
                if(number == sDBs.pages) {
                    for(var i = (number-1) * sDBs.max; i < sDBs.result.length; i++) {sDBs.drawing(i)}
                } else {
                    for(var i = (number-1) * sDBs.max; i < number * sDBs.max; i++) {sDBs.drawing(i)}
                }
            } else if(sDBs.where == 'mal') {
                if(jikan._result == 'wait') {return};
                sDBs.pages = 1;
                sDBs.current = 1;
                sDBs.result = [];
                jikan._onresult = () => {
                    var res = JSON.parse(JSON.stringify(jikan._result));
                    sDBs.pages = res.pagination.last_visible_page;
                    sDBs.current = res.pagination.current_page;
                    sDBs.all = res.pagination.items.total;
                    if(res.data.length > 0) {
                        sDBs.state = 'success';
                        for(var i in res.data) {
                            var a = searchByMALPage(`/anime/${res.data[i].mal_id}/asd`);
                            if(a !== false) {sDBs.result.push(adb[a])}
                        };
                        for(var a in sDBs.result) {sDBs.drawing(a)}
                    } else {
                        sDBs.state = 'no_anime';
                    }
                };
                jikan.page = number;
                jikan.search(sDBs.string)
            }
        }
        //
    },
    drawing: (id) => {
        if(sDBs.result[id] === undefined) {return};
        sDBs.anime[id] = new AnimeItem(sDBs.result[id]);
        sDBs.images[id] = new Image();
        eval(`sDBs.images[id].onerror = () => {sDBs.images[${id}].src = 'images/notfound.png'}`);
        sDBs.images[id].src = sDBs.result[id].picture
    },
    controls: () => {
        return {
            max: sDBs.max,
            all: sDBs.all,
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
browserPrevPage.onclick = () => {sDBs.getPage(sDBs.current-1); saf.scroll.set(0); playSound(sound['button'])};
browserNextPage.onclick = () => {sDBs.getPage(sDBs.current+1); saf.scroll.set(0); playSound(sound['button'])};
browserPromptPage.onclick = () => {
    sDBs.getPage(promptNumber(txt('browserPage') + '...', 1, sDBs.pages, sDBs.current));
    playSound(sound['prompt']);
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
        playSound(sound['button']);
        setTimeout(() => {buttonBrowserAdd.operate = false; buttonBrowserAdd.dtime=500}, 500)
    } else {
        buttonBrowserAdd.operate = false; buttonBrowserAdd.dtime=500
    }
};
buttonBrowserAdd.time = 500;
//
let _saf_browserheight = 0;
function animeSStateBrowser(header, fbSpacing, swidth, xanchor) {
    // свои кнопки
    var width = (swidth - fbSpacing*3)/4;
    var h = buttonAnimeStateSize.y * _scaleDynamic;
    var pos = new Vector2(xanchor, fbSpacing*2 + h);
    scaleFont(24, 'Segoe UI');
    buttonFilterLeave.pos.setv(pos.sumxy(fbSpacing, 0));
    buttonBrowseTitlesMAL.pos.setv(pos.sumxy(fbSpacing*3 + width*2, 0));
    buttonBrowseTitles.pos.setv(pos.sumxy(fbSpacing*4 + width*3, 0));
    buttonBrowseTitlesMAL.size = buttonBrowseTitles.size = buttonFilterLeave.size = new Vector2(width, h);
    buttonFilterLeave.draw(); buttonBrowseTitles.draw(); buttonBrowseTitlesMAL.draw();
    // отрезаем
    clipCanvas(fullsize.minxy(0, header), new Vector2(cvsxoffset, header));
    saf.height = fbSpacing + header;
    hoverHint.yaccur = header;
    // count n пагес
    scaleFont(18, 'Segoe UI');
    if(sDBs.string != '') {
        sDBs.all > 0
        ? saf.height += sbTextFit(sDBs.all + txt('browserResultCount') + sDBs.string, new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get(), 18)
        : sDBs.state == 'start_mal' 
            ? saf.height += sbTextFit(txt('browserMALWait'), new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get(), 18)
            : saf.height += sbTextFit(txt('browserNoResult') + sDBs.string, new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get(), 18);
        saf.height += fbSpacing
    };
    if(sDBs.pages > 1) {
        if(saf.scroll.get() < _saf_browserheight/2) {
            saf.height += sbPageManager(sDBs.controls(), [browserPrevPage, browserPromptPage, browserNextPage], new Vector2(saf.xanchor+fbSpacing, saf.height), saf.width, fbSpacing, saf.scroll.get())
        // тут прикол, переключалку страниц низя нарисовать 2 раза на экране, поэтому когда мы пролистали половину то вместо того чтобы рисовать верхнюю просто добавляем пустоты ровно столько, сколько дали бы кнопки, если просто не рисовать кнопки то при пролистывании вниз список в один момент дёрнется, подумайте нахуй почему Jokerge я ебу нахуя вам это?
        } else {saf.height += fbSpacing*2 + pageManagerFont.size*_scaleDynamic + browserPromptPage.size.y}
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
    //
    sizeof: () => {
        return fileManager.sizeofJSON(edList.edited.getAnime())
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
    if(buttonEditorDelete.bhvr != null) {edList.deleteTitle(buttonEditorDelete.bhvr); playSound(sound['tagexc'])};
    setTimeout(() => {buttonEditorDelete.operate = false; buttonEditorDelete.dtime=500}, 500)
};
buttonEditorDelete.time = 500;
//
let buttonEditorApply = new TextButtonShaped(shapeRectRounded, txt('wordApply'), new Vector2(500,40),
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(filterMainThreePal));
buttonEditorApply.needshadow = false; buttonEditorApply.waitanim = false;
buttonEditorApply.onclick = () => {edList.setRoulette(); playSound(sound['player'])};
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
    if(conf) {edList.edited.compressArray(roulette.anime); edList.getMeta()};
    playSound(sound['button'])
}};
//
let buttonClearEditable = new TextButtonShaped(shapeRectRounded, txt('wordReset'), new Vector2(500,40),
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(130,29,29,1)#rgba(160,40,40,1)#rgba(255,63,63,1)#rgba(47,47,200,0.3)`));
buttonClearEditable.needshadow = false; buttonClearEditable.waitanim = false; buttonClearEditable.height = 0;
buttonClearEditable.onclick = () => {
    if(edList.edited.list.length > 0) {
        edList.clear();
        buttonClearEditable.state = 'idle';
        playSound(sound['tagexc'])
    };
};
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
buttonEditorDownload.onclick = () => {if(edList.edited.list.length > 0) {edList.downloadJSON(); playSound(sound['button'])}};
buttonEditorUpload.onclick = () => {edList.uploadJSON(); playSound(sound['button'])};
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
    buttonClearEditable.pos.setv(pos.sumxy(fbSpacing*4 + width*3, 0))
    buttonClearEditable.size = buttonEditorClaimRoll.size = buttonEditorApply.size = buttonFilterLeave.size = new Vector2(width, h);
    buttonFilterLeave.draw(); buttonEditorApply.draw(); buttonEditorClaimRoll.draw(); buttonClearEditable.draw();
    // отрезаем
    clipCanvas(fullsize.minxy(0, header), new Vector2(cvsxoffset, header));
    saf.height = fbSpacing + header;
    hoverHint.yaccur = header;
    // стейт списка
    if(!saf.viewmeta) {
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
    fillTextFast(new Vector2(xanchor + swidth - fbSpacing*2, cvssize.y - fbSpacing), 'Work In Progress!!!');
    // отрезаем
    clipCanvas(fullsize.minxy(0, header), new Vector2(cvsxoffset, header));
    saf.height = fbSpacing + header;
    hoverHint.yaccur = header;
};
//
// @EAG MARATHON ITEMS & STUFF
//
let mrthStuff = {
    items: {
        // POSITIVE
        'glasses': {
            name: txtMrth('itemGlassesName'),
            desc: txtMrth('itemGlassesDesc'),
            specials: {conflict: 'poop'},
        },
        'bribery': {
            name: txtMrth('itemBriberyName'),
            desc: txtMrth('itemBriberyDesc'),
            max: 2,
            specials: {conflict: 'black'},
        },
        'radar': {
            name: txtMrth('itemRadarName'),
            desc: txtMrth('itemRadarDesc'),
            max: 8,
        },
        'chocolate': {
            name: txtMrth('itemChocolateName'),
            desc: txtMrth('itemChocolateDesc'),
            specials: {conflict: 'salad'},
        },
        'recycler': {
            name: txtMrth('itemRecyclerName'),
            desc: txtMrth('itemRecyclerDesc'),
        },
        'marathon_key': {
            name: txtMrth('itemMkeyName'),
            desc: txtMrth('itemMkeyDesc'),
        },
        'universal_key': {
            name: txtMrth('itemUkeyName'),
            desc: txtMrth('itemUkeyDesc'),
        },
        'joker': {
            name: txtMrth('itemJokerName'),
            desc: txtMrth('itemJokerDesc'),
            specials: {conflict: 'order'},
            max: 2,
        },
        'monitor': {
            name: txtMrth('itemMonitorName'),
            desc: txtMrth('itemMonitorDesc'),
        },
        // NEGATIVE
        'poop': {
            name: txtMrth('itemPoopName'),
            desc: txtMrth('itemPoopDesc'),
        },
        'black': {
            name: txtMrth('itemBlackName'),
            desc: txtMrth('itemBlackDesc'),
        },
        'tax': {
            name: txtMrth('itemTaxName'),
            desc: txtMrth('itemTaxDesc'),
            max: 10,
        },
        'salad': {
            name: txtMrth('itemSaladName'),
            desc: txtMrth('itemSaladDesc'),
        },
        'order': {
            name: txtMrth('itemOrderName'),
            desc: txtMrth('itemOrderDesc'),
        },
        'azart': {
            name: txtMrth('itemAzartName'),
            desc: txtMrth('itemAzartDesc'),
        },
        'handcuffs': {
            name: txtMrth('itemHandcuffsName'),
            desc: txtMrth('itemHandcuffsDesc'),
        },
    },
    perms: {
        points: {
            value: 'permPoints',
            name: txtMrth('permPointsName'),
            desc: txtMrth('permPointsDesc'),
            limits: [0.5, 999], // normal is 1
            buff: [.08, .16], debuff: [-.05, -.15],
        },
        series: {
            value: 'permSeries',
            name: txtMrth('permSeriesName'),
            desc: txtMrth('permSeriesDesc'),
            limits: [5, 999], // normal is 10
            buff: [.08, .16], debuff: [-.05, -.15],
        },
        explore: {
            value: 'permExplore',
            name: txtMrth('permExploreName'),
            desc: txtMrth('permExploreDesc'),
            limits: [1, 5], // normal is 3
            buff: [-.05, -.1], debuff: [.04, .09],
        },
        quota: {
            value: 'permQuota',
            name: txtMrth('permQuotaName'),
            desc: txtMrth('permQuotaDesc'),
            limits: [10, 90], // normal is 50
            buff: [-.05, -.12], debuff: [.04, .11],
        },
    },
    missions: {
        question: {
            name: txtMrth('missionQuestion'),
            limits: [2, 4],
        },
        meeting: {
            name: txtMrth('missionMeeting'),
            limits: [3, 5],
        },
        treasure: {
            name: txtMrth('missionTreasure'),
            limits: [3, 4],
        },
        anime: {
            name: txtMrth('missionAnime'),
            limits: [1, 1],
            nobar: true,
        },
        points: {
            name: txtMrth('missionPoints'),
            // limits: [150, 450],
            limits: () => {return [itemFunc.getHonestCost(150), itemFunc.getHonestCost(350)]},
            value: 'total',
        },
        series: {
            name: txtMrth('missionSeries'),
            limits: [14, 33],
            value: 'episodes',
        },
        explore: {
            name: txtMrth('missionExplore'),
            limits: [20, 45],
            value: 'explored',
        },
    },
};
//
let _itemsPositive = ['glasses', 'bribery', 'radar', 'chocolate', 'recycler', 'marathon_key', 'universal_key', 'joker', 'monitor'];
let _itemsNegative = ['poop', 'black', 'tax', 'salad', 'azart', 'azart', 'order', 'handcuffs']; // азарт 2 раза потому что лудики ыеееееее
let _itemsAll = [].concat(_itemsPositive, _itemsNegative);
let _permsAll = ['points', 'explore', 'series', 'quota',];
let _missionsAll = ['question', 'meeting', 'treasure', 'anime', 'points', 'series', 'explore',];
//
function mrthInventoryAddItem(tag='') {
    // check negative OR positive
    var posit = false;
    for(var i in _itemsPositive) {if(_itemsPositive[i] == tag) {posit = true}};
    if(posit) {
        // check conflict
        var conf = false;
        if(mrthStuff.items[tag].specials !== undefined) {
            if(mrthStuff.items[tag].specials.conflict !== undefined) {
                var conf = mrthStuff.items[tag].specials.conflict;
            }
        };
        // check negatives
        if(conf !== false) {
            if(mapMeta.effects['1'] !== false) {if(mapMeta.effects['1'].tag === conf) {mapMeta.effects['1'] = false; return ['delete_eff', tag, conf]}};
            if(mapMeta.effects['2'] !== false) {if(mapMeta.effects['2'].tag === conf) {mapMeta.effects['2'] = false; return ['delete_eff', tag, conf]}};
        };
        // check slots
        for(var s in mapMeta.inventory) {
            if(mapMeta.inventory[s] === false) {mapMeta.inventory[s] = mrthCreateItem(tag); return ['add_item', tag]}
        };
        //
        return ['item_none', tag]
    } else {
        // check conflict
        for(var s in mapMeta.inventory) {
            if(mapMeta.inventory[s].conflict !== undefined) {if(mapMeta.inventory[s].conflict == tag) {
                // deleting item by negative
                var posit = mapMeta.inventory[s].tag;
                mapMeta.inventory[s] = false; 
                return ['delete_eff', posit, tag]
            }}
        };
        // check slots
        if(mapMeta.effects['1'].tag == tag || mapMeta.effects['2'].tag == tag) {return ['eff_already', tag]};
        if(mapMeta.effects['1'] === false) {mapMeta.effects['1'] = mrthCreateItem(tag); return ['add_eff', tag]};
        if(mapMeta.effects['2'] === false) {mapMeta.effects['2'] = mrthCreateItem(tag); return ['add_eff', tag]};
        // if no empty slots & not already have - replace random
        var ind = Math.floor(Math.random() * 1.999) + 1;
        var neg = mapMeta.effects[ind].tag;
        mapMeta.effects[ind] = mrthCreateItem(tag);
        return ['eff_replace', tag, neg]
    }
};
function mrthIsPositiveItem(item) {
    for(var i in _itemsPositive) {
        if(item == _itemsPositive[i]) {return true}
    };
    return false
};
function mrthInventoryComment(array) {
    // commentary
    switch (array[0]) {
        case 'add_item': return txtMrth('commItemPref') + mrthStuff.items[array[1]].name + txtMrth('commItemAdd');
        case 'item_none': return txtMrth('commItemPref') + mrthStuff.items[array[1]].name + txtMrth('commItemNone');
        case 'delete_eff': return txtMrth('commItemPref') + mrthStuff.items[array[1]].name + '", ' + txtMrth('commNegPref') + mrthStuff.items[array[2]].name + txtMrth('commDelete');
        case 'eff_already': return txtMrth('commNegPref') + mrthStuff.items[array[1]].name + txtMrth('commEffAlready');
        case 'eff_replace': return txtMrth('commNegPref') + mrthStuff.items[array[1]].name + txtMrth('commEffReplace') + mrthStuff.items[array[2]].name + '".';
        case 'add_eff': return txtMrth('commNegAdded') + mrthStuff.items[array[1]].name + '".';
        default: {console.log(array); return txtMrth('commUnknown')}
    }
};
//
function mrthInventoryFreeSpace() {
    for(var s in mapMeta.inventory) {
        if(mapMeta.inventory[s] === false) {return true}
    };
    return false
};
function mrthInventoryHaveItems() {
    for(var s in mapMeta.inventory) {
        if(mapMeta.inventory[s] !== false) {return true}
    };
    return false
};
//
function mrthCreateItem(tag) {
    var obj = JSON.parse(JSON.stringify(mrthStuff.items[tag]));
    var item = {tag: tag,};
    //
    if(obj.max !== undefined) {item.count = Number(obj.max)};
    if(obj.specials !== undefined) {
        for(var s in obj.specials) {item[s] = obj.specials[s]}
    };
    return item
};
function mrthGetItem(tag) {
    for(var i in mapMeta.inventory) {
        if(mapMeta.inventory[i] !== false) {if(mapMeta.inventory[i].tag == tag) {return mapMeta.inventory[i]}}
    };
    for(var i in mapMeta.effects) {
        if(mapMeta.effects[i] !== false) {if(mapMeta.effects[i].tag == tag) {return mapMeta.effects[i]}}
    };
   return false
};
function mrthDeleteItem(tag) {
    for(var i in mapMeta.inventory) {
        if(mapMeta.inventory[i] !== false) {if(mapMeta.inventory[i].tag == tag) {mapMeta.inventory[i] = false; return true}}
    };
    for(var i in mapMeta.effects) {
        if(mapMeta.effects[i] !== false) {if(mapMeta.effects[i].tag == tag) {mapMeta.effects[i] = false; return true}}
    };
   return false
};
function mrthDeleteRandomItem() {
    var tags = [];
    for(var i in mapMeta.inventory) {if(mapMeta.inventory[i] !== false) {tags.push(mapMeta.inventory[i].tag)}};
    return tags.length == 0 ? false : mrthDeleteItem(tags[Math.floor(Math.random() * (tags.length - 0.001))])
};
function mrthReduceItem(item) {
    if(item === false) {return}; // skip if no item
    if(item.count !== undefined) {
        item.count -= 1;
        if(item.count <= 0) {
            mrthDeleteItem(item.tag)
        }
    } else {
        mrthDeleteItem(item.tag)
    }
};
// ITEM FUNCTIONS
let itemFunc = {
    recyclerPoints: (pos, preset) => { // calc recycle points
        return Math.round(mrthGetExploreCost(pos) * 2 * presetbase[preset].mult * mapMeta.permPoints) // center number is recycle multiplier
    },
    getHonestCost: (points) => { // просчёт честной цены для штрафов/магазинов с учётом текущих множителей
        return Math.round(points * mapMeta.permPoints * (mapMeta.permSeries/10))
    },
};
// PERMANENT VALUES FUNCTIONS
function getPermanentEffect(buff = true, tag=false, mult=false) {
    // get indexed or randomized AND get perc if not allowed
    if(tag === false) {tag = _permsAll[Math.floor(Math.random() * 3.999)]};
    var perm = mrthStuff.perms[tag];
    // counting perm value change
    var effect = {value: perm.value,};
    if(buff) {effect.perc = perm.buff[0] + Math.random() * (perm.buff[1] - perm.buff[0])}
    else {effect.perc = perm.debuff[0] + Math.random() * (perm.debuff[1] - perm.debuff[0])};
    if(mult !== false) {effect.perc = effect.perc * mult};
    // formatting and returning
    effect.perc = floatNumber(effect.perc, 4);
    effect.limits = perm.limits;
    effect.tag = tag;
    return effect
};
function applyPermanentEffect(effect) {
    mapMeta[effect.value] = floatNumber(mapMeta[effect.value] + mapMeta[effect.value] * effect.perc, 2);
    mapMeta[effect.value] = mapMeta[effect.value] < effect.limits[0] ? effect.limits[0] : mapMeta[effect.value] > effect.limits[1] ? effect.limits[1] : mapMeta[effect.value];
};
function commentPermanentEffect(effect) {
    var _new = floatNumber(mapMeta[effect.value] + mapMeta[effect.value] * effect.perc, 2);
    if(effect.perc > 0) {
        return txtMrth('commPermPref') + mrthStuff.perms[effect.tag].name + txtMrth('commPermIncr') + `${floatNumber(effect.perc*100, 2)}%. (${mapMeta[effect.value]} => ${_new})`
    } else {
        return txtMrth('commPermPref') + mrthStuff.perms[effect.tag].name + txtMrth('commPermDecr') + `${floatNumber(effect.perc*-100, 2)}%. (${mapMeta[effect.value]} => ${_new})`
    }
};
// MISSIONS FUNCTIONS
function missionGenerateRandom(difficulty=1) {
    // gets random effect, gets VALUE of effect and get comment
    var mission = {reward: getPermanentEffect(), progress: 0};
    var perm = mrthStuff.perms[mission.reward.tag];
    var value = Math.abs(mission.reward.perc - perm.buff[0]) / Math.abs(perm.buff[1] - perm.buff[0]);
    // get random valued quest
    mission.type = _missionsAll[Math.floor(Math.random() * (_missionsAll.length-0.001))];
    var quest = mrthStuff.missions[mission.type];
    var limits = typeof quest.limits == 'function' ? quest.limits = quest.limits() : quest.limits;
    mission.target = Math.round(limits[0] + (limits[1] - limits[0]) * value * difficulty);
    mission.name = quest.name;
    // gets type of mission - auto or manual
    if(quest.value !== undefined) {
        mission.auto = true;
        mission.value = quest.value;
        mission.old = 0 + mapMeta[quest.value]; // 0+ for copy
    } else {mission.auto = false};
    // hide progress bar if needed
    if(quest.nobar !== undefined) {mission.nobar = true};
    return mission
};
function missionGetProgress(mission) {
    var prog = floatNumber(mission.progress / mission.target, 2);
    prog = prog < 0 ? 0 : prog > 1 ? 1 : prog;
    return mission.auto ? [prog, mission.old, mission.old + mission.target] : [prog, 0, mission.target]
};
function missionUpdate(mission) {
    if(mission.auto) {mission.progress = mapMeta[mission.value] - mission.old}; // get progress for auto missions
    return mission.progress >= mission.target
};
function missionProcessor() {
    for(var m in mapMeta.missions) {
        if(mapMeta.missions[m] === false) {continue} // skip empty mission slots
        else {if(missionUpdate(mapMeta.missions[m])) { // true if mission completed
            applyPermanentEffect(mapMeta.missions[m].reward);
            mapMeta.missCompleted++;
            mapMeta.missions[m] = false // give reward & delete mission
        }}
    }
};
function missionHaveSlots() {
    for(var m in mapMeta.missions) {
        if(m == 'daily') {continue}; // skip check daily slot
        if(mapMeta.missions[m] === false) {return true}
    };
    return false
};
function missionAdd(mission) {
    for(var m in mapMeta.missions) {
        if(m == 'daily') {continue}; // skip adding mission to daily slot
        if(mapMeta.missions[m] === false) {mapMeta.missions[m] = mission; return true}
    };
    console.warn('mrth: mission cannot be added due no empty slots');
    return false
};
function missionMoving(type, value=1) {
    for(var m in mapMeta.missions) {
        if(mapMeta.missions[m] !== false) {
            if(mapMeta.missions[m].type == type) {mapMeta.missions[m].progress += value; break}
        }
    }
};
// DAILY MISSION
function missionDaily() {
    // get date
    var date = new Date().toDateString();
    if(date !== mapMeta.date) {
        mapMeta.date = date;
        mapMeta.days++;
        mapMeta.missions.daily = missionGenerateRandom(0.6);
        marathonSave() // save after getting mission
    }
};
// LOAD TRANSLATED MEETINGS OBJECT
pref.language in _allMeetings
? mrthStuff.meetings = _allMeetings[pref.language]
: mrthStuff.meetings = _allMeetings['ru'];
delete _allMeetings;
// list of all scenarios
let mrthMeetingsHard = ['tyan', 'labyr', 'city_danger', 'abandoned', 'portal_maze'];
let mrthMeetingsEasy = ['shop', 'tower', 'hole', 'ded', 'wasteland', 'mountain_stranger'];
let mrthMeetingsAll = [].concat(mrthMeetingsHard, mrthMeetingsEasy);
//
// @EAG MARATHON RECT MISC
//
let buttonRollAnime = new TextButtonShaped(shapeRectRounded, txtMrth('rollAnime'), new Vector2(), 
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(32,128,128,1)#rgba(48,180,180,1)#rgba(64,255,255,1)#rgba(200,200,47,0.1)`));
buttonRollAnime.needshadow = false; buttonRollAnime.waitanim = false; buttonRollAnime.height = 0;
let buttonApplyWatch = new ShapedHoldButton(shapeRectRounded, new Vector2(),
    colorMapMatrix(`rgba(32,128,32,1)#rgba(48,180,48,1)#rgba(64,255,64,1)#rgba(200,200,47,0.1)`));
buttonApplyWatch.needshadow = false; buttonApplyWatch.waitanim = false; buttonApplyWatch.height = 0;
let buttonRerollAnime = new ShapedHoldButton(shapeRectRounded, new Vector2(),
    colorMapMatrix(`rgba(128,32,32,1)#rgba(180,48,48,1)#rgba(255,64,64,1)#rgba(200,200,47,0.1)`));
buttonRerollAnime.needshadow = false; buttonRerollAnime.waitanim = false; buttonRerollAnime.height = 0;
//
let animeReviewScore = new ShapedSelectBar(new Vector2(), new Color(64, 64, 255, 200), new Color(32, 32, 96, 255));
animeReviewScore.radius = 4;
animeReviewScore.permanent = false;
// animeReviewScore.visAlias = true;
animeReviewScore.onset = (value) => {
    mapGetRect(mapMeta.pos).object.score = Math.round(value);
    animeReviewScore.update(Math.round(value), 10)
};
let animeReviewWatched = new ShapedSelectBar(new Vector2(), new Color(64, 64, 255, 200), new Color(32, 32, 96, 255));
animeReviewWatched.radius = 4;
animeReviewWatched.permanent = false;
// animeReviewWatched.visAlias = true;
animeReviewWatched.onset = (value) => {
    mapGetRect(mapMeta.pos).object.watched = Math.round(value);
    animeReviewWatched.update(Math.round(value), mapGetRect(mapMeta.pos).object.animedata.episodes)
};
//
function getButtonApplyItem(tag) {
    var b = new TextButtonShaped(shapeRectRounded, `${txtMrth('rollApply')} "${mrthStuff.items[tag].name}"`, new Vector2(), 
        colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
        colorMapMatrix(`rgba(128,32,128,1)#rgba(180,48,180,1)#rgba(255,64,255,1)#rgba(200,47,200,0.1)`));
    b.onhover = () => {hoverHint.invoke(mrthStuff.items[tag].desc)};
    b.needshadow = false; b.waitanim = false; b.height = 0;
    return b
};
let buttonApplyItemGlasses = getButtonApplyItem('glasses');
buttonApplyItemGlasses.onclick = () => {
    buttonApplyItemGlasses.insp.items.push('glasses');
    buttonApplyItemGlasses.insp.multiplier = 1.25;
    mrthReduceItem(mrthGetItem('glasses'));
    playSound(sound['button'])
};
let buttonApplyItemChocolate = getButtonApplyItem('chocolate');
buttonApplyItemChocolate.onclick = () => {
    buttonApplyItemChocolate.insp.items.push('chocolate');
    buttonApplyItemChocolate.insp.filters.scoreAllow = true;
    buttonApplyItemChocolate.insp.filters.scoreMin = 7.5;
    buttonApplyItemChocolate.insp.filters.scoreMax = 10;
    mrthReduceItem(mrthGetItem('chocolate'));
    playSound(sound['button'])
};
let buttonApplyItemRecycler = getButtonApplyItem('recycler');
buttonApplyItemRecycler.onclick = () => {};
let buttonApplyItemMonitor = getButtonApplyItem('monitor');
buttonApplyItemMonitor.onclick = () => {
    buttonApplyItemMonitor.insp.items.push('monitor');
    buttonApplyItemMonitor.insp.watchplus += 2;
    mrthReduceItem(mrthGetItem('monitor'));
    playSound(sound['button'])
};
//
let buttonApplyItemList = {
    'glasses': buttonApplyItemGlasses,
    'chocolate': buttonApplyItemChocolate,
    'recycler': buttonApplyItemRecycler,
    'monitor': buttonApplyItemMonitor,
};
//
function recycleAnimeRect(pos) {
    var index = mapPosStringify(pos);
    mapMeta.map[index] = new mrthRect(pos, 'empty');
    mapMeta.map[index].open();
    mapMeta.selected = mapMeta.map[index];
    playSound(sound['button'])
};
//
let imageExternalLink = invokeNewImage(`images/extlink.png`);
let buttonExternalDB = new ImageButtonShaped(shapeRectRounded, imageExternalLink, new Vector2(4),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(63,63,255,0.4)#rgba(63,63,255,1)#rgba(0,0,0,0)`));
let buttonExternalMAL = new ImageButtonShaped(shapeRectRounded, siteLogos[1], new Vector2(4),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(63,63,255,0.4)#rgba(63,63,255,1)#rgba(0,0,0,0)`));
let buttonExternalShiki = new ImageButtonShaped(shapeRectRounded, siteLogos[0], new Vector2(4),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(63,63,255,0.4)#rgba(63,63,255,1)#rgba(0,0,0,0)`));
buttonExternalDB.needshadow = false; buttonExternalMAL.needshadow = false; buttonExternalShiki.needshadow = false;
buttonExternalDB.height = 0; buttonExternalMAL.height = 0; buttonExternalShiki.height = 0;
buttonExternalDB.exturl = ''; buttonExternalMAL.exturl = ''; buttonExternalShiki.exturl = '';
buttonExternalDB.onclick = () => {window.open(buttonExternalDB.exturl); playSound(sound['prompt'])};
buttonExternalMAL.onclick = () => {window.open(buttonExternalMAL.exturl); playSound(sound['prompt'])};
buttonExternalShiki.onclick = () => {window.open(buttonExternalShiki.exturl); playSound(sound['prompt'])};
//
let buttonMeetContinue = new TextButtonShaped(shapeRectRounded, txtMrth('meetContinue'), new Vector2(), 
    colorMapMatrix(`rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(48,180,180,0.5)#rgba(64,255,255,0.5)#rgba(200,200,47,0.1)`));
buttonMeetContinue.needshadow = false; buttonMeetContinue.height = 0;
buttonMeetContinue.onclick = () => {mapGetRect(mapMeta.pos).object.readstate = 'gettext'; playSound(sound['scroll'])};
//
let buttonMeetRoot1 = new TextButtonShaped(shapeRectRounded, `root1text`, new Vector2(), 
    colorMapMatrix(`rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.8)`),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(48,48,180,0.5)#rgba(64,64,255,0.5)#rgba(64,64,64,0.3)`));
buttonMeetRoot1.needshadow = false; buttonMeetRoot1.height = 0;
let buttonMeetRoot2 = new TextButtonShaped(shapeRectRounded, `root2text`, new Vector2(), 
    colorMapMatrix(`rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.8)`),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(48,48,180,0.5)#rgba(64,64,255,0.5)#rgba(64,64,64,0.3)`));
buttonMeetRoot2.needshadow = false; buttonMeetRoot2.height = 0;
let buttonMeetRoot3 = new TextButtonShaped(shapeRectRounded, `root3text`, new Vector2(), 
    colorMapMatrix(`rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.8)`),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(48,48,180,0.5)#rgba(64,64,255,0.5)#rgba(64,64,64,0.3)`));
buttonMeetRoot3.needshadow = false; buttonMeetRoot3.height = 0;
//
let buttonsQuestionAnswer = [
    new TextButtonShaped(shapeRectRounded, `answer1text`, new Vector2(), 
    colorMapMatrix(`rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.8)`),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(48,48,180,0.5)#rgba(64,64,255,0.7)#rgba(64,64,64,0.3)`)),
    new TextButtonShaped(shapeRectRounded, `answer2text`, new Vector2(), 
    colorMapMatrix(`rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.8)`),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(48,48,180,0.5)#rgba(64,64,255,0.7)#rgba(64,64,64,0.3)`)),
    new TextButtonShaped(shapeRectRounded, `answer3text`, new Vector2(), 
    colorMapMatrix(`rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.8)`),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(48,48,180,0.5)#rgba(64,64,255,0.7)#rgba(64,64,64,0.3)`)),
    new TextButtonShaped(shapeRectRounded, `answer4text`, new Vector2(), 
    colorMapMatrix(`rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.8)`),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(48,48,180,0.5)#rgba(64,64,255,0.7)#rgba(64,64,64,0.3)`))
];
buttonsQuestionAnswer[0].onclick = () => {buttonsQuestionAnswer[0].insp.answer = 0}; buttonsQuestionAnswer[0].height = 0; buttonsQuestionAnswer[0].needshadow = false;
buttonsQuestionAnswer[1].onclick = () => {buttonsQuestionAnswer[0].insp.answer = 1}; buttonsQuestionAnswer[1].height = 0; buttonsQuestionAnswer[1].needshadow = false;
buttonsQuestionAnswer[2].onclick = () => {buttonsQuestionAnswer[0].insp.answer = 2}; buttonsQuestionAnswer[2].height = 0; buttonsQuestionAnswer[2].needshadow = false;
buttonsQuestionAnswer[3].onclick = () => {buttonsQuestionAnswer[0].insp.answer = 3}; buttonsQuestionAnswer[3].height = 0; buttonsQuestionAnswer[3].needshadow = false;
//
let buttonTeleportPlayer = new TextButtonShaped(shapeRectRounded, txtMrth('tpPlayer'), new Vector2(), 
colorMapMatrix(`rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.8)`),
colorMapMatrix(`rgba(48,48,180,0.3)#rgba(48,48,180,0.7)#rgba(64,64,255,0.9)#rgba(64,64,64,0.3)`));
buttonTeleportPlayer.needshadow = false; buttonTeleportPlayer.height = 0; buttonTeleportPlayer.waitanim = false;
//
let buttonsMissionSelect = [
    new TextButtonShaped(shapeRectRounded, `1`, new Vector2(), 
    colorMapMatrix(`rgba(255,255,0,1)#rgba(255,255,0,1)#rgba(255,255,0,1)#rgba(255,255,0,0.8)`),
    colorMapMatrix(`rgba(255,0,0,0.2)#rgba(255,0,0,0.8)#rgba(255,0,0,1)#rgba(64,64,64,0.3)`)),
    new TextButtonShaped(shapeRectRounded, `2`, new Vector2(), 
    colorMapMatrix(`rgba(255,255,0,1)#rgba(255,255,0,1)#rgba(255,255,0,1)#rgba(255,255,0,0.8)`),
    colorMapMatrix(`rgba(255,0,0,0.2)#rgba(255,0,0,0.8#rgba(255,0,0,1)#rgba(64,64,64,0.3)`)),
    new TextButtonShaped(shapeRectRounded, `3`, new Vector2(), 
    colorMapMatrix(`rgba(255,255,0,1)#rgba(255,255,0,1)#rgba(255,255,0,1)#rgba(255,255,0,0.8)`),
    colorMapMatrix(`rgba(255,0,0,0.2)#rgba(255,0,0,0.8)#rgba(255,0,0,1)#rgba(64,64,64,0.3)`)),
];
buttonsMissionSelect[0].onclick = () => {buttonsMissionOnclick(0)}; buttonsMissionSelect[0].height = 0; buttonsMissionSelect[0].needshadow = false;
buttonsMissionSelect[1].onclick = () => {buttonsMissionOnclick(1)}; buttonsMissionSelect[1].height = 0; buttonsMissionSelect[1].needshadow = false;
buttonsMissionSelect[2].onclick = () => {buttonsMissionOnclick(2)}; buttonsMissionSelect[2].height = 0; buttonsMissionSelect[2].needshadow = false;
function buttonsMissionOnclick(i) {
    var mission = buttonsMissionSelect[0].insp.pool[i];
    mission.nobar = mission.nobar == 'yes' ? true : undefined;
    missionAdd(mission);
    buttonsMissionSelect[0].insp.state = 'pick';
    buttonsMissionSelect[0].insp.mission = mission.name;
    playSound(sound['button'])
};
//
function debugSizeLine(pos, size) {
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + size.x, pos.y + size.y);
    ctx.closePath();
    ctx.strokeStyle = '#ff0000';
    ctx.stroke();
};
//
function getWatchPointCount(episodes=1, rating=7, watched=1, multiplier=1, type='tv') {
    var typemult = type == 'MOVIE' ? 4 : type != 'TV' ? 1.2 : 1;
    var mult = watched >= episodes ? 1.25 : watched >= episodes/2 ? 1.1 : watched > 0 ? 1 : 0;
    return Math.round(watched * mult * (1 + (10 - rating)/20) * multiplier * typemult * mapMeta.permSeries * mapMeta.permPoints)
};
// MARKUP
//
function inspDefHeader(pos, width, spacing, text) {
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
    scaleFont(24, 'Segoe UI', 'bold');
    fillTextFast(pos.sumxy(width/2, spacing), text)
};
function inspTextInput(statpos, width, spacing, container='', fsize) {
    var [str, fit] = textWidthFit(container, width-spacing*3, 10); // add pointer
    var len = str.length > 3 ? str.length : 3;
    var sizey = spacing + (fit.y + fsize*0.5*_scaleDynamic) * len;
    var edit = String(container);
    ctx.fillStyle = '#00000077';
    fillRectFast(new Vector2(width, sizey), statpos);
    ctx.fillStyle = '#ffffff';
    fillTextArray(statpos.sumxy(spacing,  fsize*0.5*_scaleDynamic), [str, fit], fsize*0.5*_scaleDynamic);
    //
    ctx.fillStyle = '#cccccc'; ctx.textAlign = 'start';
    scaleFont(12, 'Consolas');
    if(mouse.pos.overAND(statpos) && mouse.pos.lessAND(statpos.sumxy(width, sizey))) {
        readKeyboardInput = true;
        edit = editTextInput(edit);
        fillTextFast(statpos.sumxy(spacing, sizey+spacing), txtMrth('inputComm1'))
    } else {
        fillTextFast(statpos.sumxy(spacing, sizey+spacing), txtMrth('inputComm2'))
    };
    //
    return [edit, statpos.sumxy(0, sizey + spacing*2)]
};
function inspTextBlock(statpos, width, spacing, text, smax, fsize, drawing=true) {
    var [str, vec] = textWidthFit(text, width - spacing, smax);
    drawing ? fillTextArray(statpos.sumxy(0, spacing/2), [str, vec], fsize*0.5*_scaleDynamic):false;
    // debugSizeLine(statpos, new Vector2(width, spacing/2 + (fsize*0.5*_scaleDynamic + vec.y) * str.length));      // debug
    return statpos.sumxy(0, spacing + (fsize*0.5*_scaleDynamic + vec.y) * str.length);
};
function inspSingleString(statpos, width, spacing, text, fsize, drawing=true) {
    var xoff = ctx.textAlign == 'start' ? 0 : ctx.textAlign == 'center' ? width/2 : width;
    drawing ? fillTextFast(statpos.sumxy(xoff, fsize*_scaleDynamic), textStringLimit(text, width-spacing)):false;
    // debugSizeLine(statpos, new Vector2(width, spacing + fsize*_scaleDynamic));       // debug
    return statpos.sumxy(0, spacing + fsize*_scaleDynamic)
};
function inspSelectBar(statpos, width, spacing, bar, maxvalue) {
    bar.pos = statpos; bar.size.setxy(width, spacing*2); bar.maxvalue = maxvalue;
    var oldstyle = ctx.fillStyle; // bar.draw() can change fillstyle, need to save before draw and load after 
    bar.draw();
    ctx.fillStyle = oldstyle;
    return statpos.sumxy(0, spacing*3)
};
function inspWideButton(statpos, width, spacing, button) {
    button.pos.setv(statpos);
    button.size.setxy(width, 30*_scaleDynamic);
    button.draw();
    return statpos.sumxy(0, spacing + 25*_scaleDynamic)
};
function inspInventorySlot(statpos, width, spacing, item) {
    if(item === false) {
        ctx.fillStyle = '#cccccc'; scaleFont(12, 'Segoe UI');
        return inspSingleString(statpos, width, spacing, txtMrth('emptySlot'), 12);
    } else {
        // get name & count info
        var str = mrthStuff.items[item.tag].name;
        if(item.count !== undefined) {str += ` x${item.count}`};
        // draw
        ctx.fillStyle = '#ffff55'; scaleFont(18, 'Segoe UI');
        var st = inspSingleString(statpos, width, spacing, str, 18).minxy(0, spacing);
        ctx.fillStyle = '#cccccc'; scaleFont(12, 'Segoe UI');
        st = inspTextBlock(st, width, spacing, mrthStuff.items[item.tag].desc, 3, 12);
        return st
    }
};
function inspAnimePositiveItem(statpos, width, spacing, itemtag, insp) {
    var item = mrthGetItem(itemtag);
    // if player have item
    if(item !== false) {
        // update & draw if item not already used
        var used = false;
        for(var i in insp.items) {if(insp.items[i] == item.tag) {used = true}};
        if(!used) {
            buttonApplyItemList[itemtag].insp = insp;
            return inspWideButton(statpos, width, spacing, buttonApplyItemList[itemtag])
        } else {return statpos}
    }
    else {return statpos}
};
//
function inspDoubleStringCentered(statpos, width, spacing, xalign, str1, str2, DSS) {
    var fsize = defaultDSS.DSSsizeMax(DSS);
    var center = width * xalign;
    ctx.textAlign = 'end'; scaleFont(DSS.size[0], DSS.font[0], DSS.style[0]); ctx.fillStyle = DSS.color[0]; // prefix string
    fillTextFast(statpos.sumxy(center-spacing, fsize*_scaleDynamic), textStringLimit(str1, center-spacing*2));
    ctx.textAlign = 'start'; scaleFont(DSS.size[1], DSS.font[1], DSS.style[1]); ctx.fillStyle = DSS.color[1]; // suffix string
    fillTextFast(statpos.sumxy(center+spacing, fsize*_scaleDynamic), textStringLimit(str2, (width-center)-spacing*2));
    // debugSizeLine(statpos, new Vector2(width, spacing + fsize*_scaleDynamic));       // debug
    return statpos.sumxy(0, spacing + fsize*_scaleDynamic)
};
let defaultDSS = { // DSS - double string styles
    DSSsizeMax: (DDS) => {return DDS.size[0] > DDS.size[1] ? DDS.size[0] : DDS.size[1]},
    multPoints: {size: [14, 16], font: ['Segoe UI', 'Consolas'], style: [false, 'bold'], color: ['#ffffff', '#ffff88']},
    multExplore: {size: [14, 16], font: ['Segoe UI', 'Consolas'], style: [false, 'bold'], color: ['#ffffff', '#ff8888']},
    multSeries: {size: [14, 16], font: ['Segoe UI', 'Consolas'], style: [false, 'bold'], color: ['#ffffff', '#88ff88']},
    stats: {size: [14, 16], font: ['Segoe UI', 'Consolas'], style: [false, 'bold'], color: ['#ffffff', '#8888ff']},
};
//
function inspAnimeNegativeInfo(statpos, width, spacing) {
    var poop = mrthGetItem('poop'); var salad = mrthGetItem('salad'); var order = mrthGetItem('order');
    if(poop !== false || salad !== false || order !== false) {
        ctx.fillStyle = '#f33';
        statpos = inspSingleString(statpos, width, spacing, txtMrth('inspNegatives'), 14);
        ctx.fillStyle = '#faa';
        poop === false ? false : statpos = inspSingleString(statpos, width, spacing, mrthStuff.items['poop'].name, 14);
        salad === false ? false : statpos = inspSingleString(statpos, width, spacing, mrthStuff.items['salad'].name, 14);
        order === false ? false : statpos = inspSingleString(statpos, width, spacing, mrthStuff.items['order'].name, 14);
    };
    return statpos
};
function inspMissionsList(statpos, width, spacing, list=false) {
    list = list !== false ? list : mapMeta.missions;
    for(var m in list) {
        ctx.textAlign = 'center';
        if(m == 'daily') {continue}; // skip only in default missions
        if(list[m] !== false) {
            var prog = missionGetProgress(list[m]);
            ctx.fillStyle = '#ffff55'; scaleFont(16, 'Segoe UI');
            statpos = inspSingleString(statpos, width, spacing, `${list[m].name} (${prog[2]})`, 16).minxy(0, spacing); // name
            ctx.fillStyle = '#cccccc'; scaleFont(12, 'Segoe UI');
            statpos = inspTextBlock(statpos, width, spacing, commentPermanentEffect(list[m].reward), 2, 12); // reward info
            if(list[m].nobar === undefined) {
                // progress bar
                var height = 13 * _scaleDynamic;
                fillRectRounded(new Vector2(width*0.8, height), statpos.sumxy(width*0.1, 0), '#ff000044');
                fillRectRounded(new Vector2(width*prog[0]*0.8, height), statpos.sumxy(width*0.1, 0), '#ff0000ff');
                statpos = statpos.sumxy(0, height*0.85);
                // progress text
                ctx.fillStyle = '#ffff55'; scaleFont(12, 'Consolas');
                fillTextFast(statpos.sumxy(width/2, 0), Math.round(prog[0]*1000)/10 + '%');
                ctx.textAlign = 'end'; fillTextFast(statpos.sumxy(width*0.1-spacing, 0), prog[1]);
                ctx.textAlign = 'start'; fillTextFast(statpos.sumxy(width*0.9+spacing, 0), prog[2]);
                statpos = statpos.sumxy(0, spacing)
            }
        } else { // empty slot
            if(m != 'd') {
                ctx.fillStyle = '#cccccc'; scaleFont(12, 'Segoe UI');
                statpos = inspSingleString(statpos, width, spacing, txtMrth('emptySlot'), 12);
            } else {
                ctx.fillStyle = '#cccccc'; scaleFont(12, 'Segoe UI');
                statpos = inspSingleString(statpos, width, spacing, txtMrth('charDailyComplete'), 12);
            }
        }
    };
    return statpos
};
function inspThreeButtons(statpos, width, spacing, height, array) {
    var w = (width - spacing*2)/3;
    array[0].size = array[1].size = array[2].size = new Vector2(w, height*_scaleDynamic);
    array[0].pos = statpos;                         array[0].draw();
    array[1].pos = statpos.sumxy(w+spacing, 0);     array[1].draw();
    array[2].pos = statpos.sumxy((w+spacing)*2, 0); array[2].draw();
    return statpos.sumxy(0, spacing + array[0].size.y)
};
function inspAnimeWatched(statpos, width, spacing, animew, drawing=true) {
    ctx.textAlign = 'center'; ctx.fillStyle = '#ffff00';
    scaleFont(18, 'Segoe UI', 'bold');
    // anime title, info, stats & review
    statpos = inspTextBlock(statpos, width, spacing, animew.n, 2, 16, drawing);
    scaleFont(14, 'Segoe UI'); ctx.fillStyle = '#ffffff';
    statpos = inspSingleString(statpos, width, spacing, animew.p, 13, drawing);
    statpos = inspSingleString(statpos, width, spacing, animew.y, 13, drawing);
    if(animew.r.length > 0) {
        ctx.textAlign = 'start';
        statpos = inspSingleString(statpos, width, spacing, txtMrth('aniReview2'), 13, drawing).minxy(0, spacing);
        scaleFont(12, 'Segoe UI');
        statpos = inspTextBlock(statpos, width, spacing, animew.r, 11, 11, drawing)
    };
    // end
    fillRect(new Vector2(width, 3*_scaleDynamic), statpos, '#ffffff');
    statpos = statpos.sumxy(0, spacing/2 + 3*_scaleDynamic);
    return statpos
};
//
// @EAG MARATHON RECT CLASSES
//
class inspEmpty {
    constructor(pos) {
        this.pos = pos;
        this.color = '#5555bb88';
        this.completed = false;
        //
        this.intro = false;
    }
    collect(content='medium') {}
    update() {}
    inspector(pos, width, spacing) {
        if(this.intro) {
            inspDefHeader(pos, width, spacing, 'AYAYA Marathon');
            var statpos = pos.sumxy(0, spacing*3);
            //
            scaleFont(12, 'Segoe UI');
            ctx.textAlign = 'start'; ctx.fillStyle = '#ff9999';
            statpos = inspTextBlock(statpos, width, spacing, txtMrth('disclaimer'), 20, 12).sumxy(0, spacing*2);
            //
            scaleFont(14, 'Segoe UI'); ctx.fillStyle = '#ffffff';
            statpos = inspTextBlock(statpos, width, spacing, txtMrth('intro1'), 20, 14);
            return statpos.y
        } else {
            inspDefHeader(pos, width, spacing, txtMrth('emptyName'));
            var statpos = pos.sumxy(0, spacing*3);
            // teleport button
            if(!mapMeta.pos.condAND(this.pos) && !mapMeta.watching) { // cutscene checking in button for prevent blicking
                buttonTeleportPlayer.onclick = () => {if(!mapMeta.watching && !mapMeta.cutscene) {mapMeta.pos = this.pos; playSound(sound['teleport'])}};
                scaleFont(14, 'Segoe UI');
                statpos = inspWideButton(statpos, width, spacing, buttonTeleportPlayer)
            }
            return statpos
        }
    }
};
//
class inspAnime {
    constructor(pos) {
        this.pos = pos;
        this.color = '#bb555588';
        this.completed = false;
        //
        this.preset = '';
        this.presetinfo = '';
        this.state = 'roll';
        this.animedata = null;
        this.watched = 0;
        this.review = '';
        this.score = 5;
        this.points = 0;
        this.history = [];
        // jikan
        this.timeout = 0;
        this.rating = 10;
        this.list = [];
        this.malid = false;
        this.pic = new Image();
        // items
        this.items = [];
        this.multiplier = 1;
        this.filters = {};
        this.watchplus = 0;
        // debuffs
        this.quota = {};
        this.reroll = 0;
    }
    collect(content='medium') {
        if(content == 'easy') {this.preset = _mrthpresetsEasy[Math.floor(Math.random() * (_mrthpresetsEasy.length - 0.001))]}
        else {this.preset = _mrthpresets[Math.floor(Math.random() * (_mrthpresets.length - 0.001))]};
        // this.preset = presetbase[_presetnames[index]];
        // this.presetinfo = this.preset.getInfo(); 
        this.presetinfo = presetbase[this.preset].getInfo();
    }
    update() {}
    inspector(pos, width, spacing) {
        // ui
        inspDefHeader(pos, width, spacing, txtMrth('aniName'));
        // preset info
        ctx.fillStyle = '#ffffff'; ctx.textAlign = 'start';
        scaleFont(14, 'Segoe UI');
        var statpos = inspTextBlock(pos.sumxy(0, spacing*2), width, spacing, this.presetinfo, 3, 14);
        // line && states
        fillRect(new Vector2(width, 3*_scaleDynamic), statpos, '#ffffff');
        statpos = statpos.sumxy(0, spacing/2 + 3*_scaleDynamic);
        //
        if(this.state == 'roll') {
            ctx.fillStyle = `#cccccc`;
            statpos = inspTextBlock(statpos, width, spacing, txtMrth('aniDesc'), 3, 14);
            // buttons & items & neg effects
            if(mapMeta.pos.condAND(this.pos)) {
                ctx.textAlign = 'center';
                buttonRollAnime.onclick = this.buttonRoll;
                buttonRollAnime.insp = this;
                buttonRollAnime.text = txtMrth('rollAnime');
                statpos = inspWideButton(statpos, width, spacing, buttonRollAnime).sumxy(0, spacing);
                // positive items & handc
                var handc = mrthGetItem('handcuffs');
                if(handc === false) {
                    statpos = inspAnimePositiveItem(statpos, width, spacing, 'glasses', this);
                    statpos = inspAnimePositiveItem(statpos, width, spacing, 'chocolate', this);
                    statpos = inspAnimePositiveItem(statpos, width, spacing, 'monitor', this);
                } else {
                    // handcuffs alert
                    ctx.textAlign = 'center'; ctx.fillStyle = '#ffaaaa';
                    statpos = inspTextBlock(statpos, width, spacing, txtMrth('aniHandcAlert'), 3, 14)
                };
                if(this.list.length == 0) { // recycler (aval if no watched anime)
                    var item = mrthGetItem('recycler');
                    if(item !== false) {
                        // calc recycle points & show
                        var recyclepoints = itemFunc.recyclerPoints(this.pos, this.preset);
                        statpos = inspTextBlock(statpos, width, spacing, txtMrth('aniUtil1') + recyclepoints +  txtMrth('aniUtil2'), 3, 14);
                        // setup button
                        buttonApplyItemRecycler.insp = this;
                        buttonApplyItemRecycler.onclick = () => {
                            // reset this rect, update map
                            recycleAnimeRect(this.pos);
                            // add points & delete item
                            mapMeta.points += recyclepoints;
                            mrthReduceItem(mrthGetItem('recycler'));
                            marathonSave()
                        };
                        statpos = inspAnimePositiveItem(statpos, width, spacing, 'recycler', this);    
                    }
                };
                // info about marathon_key
                var mkey = mrthGetItem('marathon_key');
                if(mkey !== false) {
                    statpos = inspTextBlock(statpos, width, spacing, txtMrth('aniMkey'), 5, 14);  
                };
                // info about items
                if(this.items.length > 0) {
                    statpos = inspSingleString(statpos, width, spacing, txtMrth('aniItems'), 14);
                    ctx.fillStyle = '#afa';
                };
                for(var i in this.items) {
                    statpos = inspSingleString(statpos, width, spacing, mrthStuff.items[this.items[i]].name, 14)
                };
                // negative effects
                statpos = inspAnimeNegativeInfo(statpos, width, spacing);
            } else {
                statpos = inspTextBlock(statpos, width, spacing, txtMrth('stepOnRect'), 3, 14);
            }
        //
        } else if(this.state == 'jikan_wait') {
            ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
            scaleFont(24, 'Segoe UI', 'bold');
            // anime title
            statpos = inspTextBlock(statpos, width, spacing, this.animedata.title, 2, 24);
            // waiting
            scaleFont(14, 'Segoe UI');
            statpos = inspSingleString(statpos, width, spacing, txtMrth('aniJikan'));
            this.pic.src = String(this.animedata.picture);
            this.pic.size = new Vector2();
            this.timeout += deltaTime/1000;
            //
            if(jikan._result != `wait`) {
                this.state = 'anime';
                if(jikan._result != null && !jikan._error) {
                    this.rating = Number(jikan._result.data.score); // read from JIKAN cause in jikan actual data about rating (и потому что магу, баля)
                    this.malid = Number(jikan._result.data.mal_id);
                } else {
                    this.rating = this.animedata.score;
                    this.malid = false;
                    console.warn('Error with load data from jikan for marathon anime inspector!');
                };
                marathonSave() // save AFTER try to load data from jikan
            } else if(this.timeout > 8) { // wait for result 8 seconds
                console.warn('Error with load data from jikan for marathon anime inspector!');
                this.malid = false;
                this.rating = this.animedata.score;
                this.state = 'anime';
                marathonSave();
            };
        //
        } else if(this.state == 'anime') {
            // anime title
            ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
            scaleFont(24, 'Segoe UI', 'bold');
            statpos = inspTextBlock(statpos, width, spacing, this.animedata.title, 2, 24);
            // anime info
            scaleFont(14, 'Segoe UI');
            var str = `${this.animedata.episodes} ep. | Rating ${this.rating} | ${txt(typesDataMap[this.animedata.type])} | ${this.animedata.status} | ${this.animedata.animeSeason.year} | ${txt(seasonsDataMap[this.animedata.animeSeason.season][1])}`;
            statpos = inspSingleString(statpos, width, spacing, str, 14);
            // external links
            buttonExternalShiki.sizedZoom(new Vector2(40*_scaleDynamic));
            buttonExternalShiki.pos.setv(statpos.sumxy(width/2 - (spacing/2 + 40*_scaleDynamic), 0));
            if(this.malid !== false) {
                buttonExternalShiki.exturl = `https://shikimori.one/animes/` + this.malid;
                buttonExternalMAL.sizedZoom(new Vector2(40*_scaleDynamic));
                buttonExternalMAL.pos.setv(statpos.sumxy((width + spacing)/2, 0));
                buttonExternalMAL.exturl = `https://myanimelist.net/anime/` + this.malid;
                buttonExternalMAL.draw();
            } else {
                buttonExternalShiki.exturl = `https://shikimori.one/animes?search=` + this.animedata.title;
                buttonExternalDB.sizedZoom(new Vector2(40*_scaleDynamic));
                buttonExternalDB.exturl = this.animedata.sources[0];
                buttonExternalDB.pos.setv(statpos.sumxy((width + spacing)/2, 0));
                buttonExternalDB.draw();
                //`https://shikimori.one/animes?search=${title.title}`
            };
            buttonExternalShiki.draw();
            statpos = statpos.sumxy(0, 40*_scaleDynamic);
            // dialog
            ctx.fillStyle = '#cccccc'; ctx.textAlign = 'start';
            statpos = inspTextBlock(statpos, width, spacing, txtMrth('aniWatching'), 4, 14);
            // watched
            ctx.fillStyle = '#ffffff';
            statpos = inspSingleString(statpos, width, spacing, `${txtMrth('aniWatched')}: ${Math.round(animeReviewWatched.point())+this.watchplus} / ${this.animedata.episodes}`, 14);
            statpos = inspSelectBar(statpos, width, spacing, animeReviewWatched, this.animedata.episodes);
            // score
            statpos = inspSingleString(statpos, width, spacing, txtMrth('aniScore') + Math.round(animeReviewScore.point()), 14);
            statpos = inspSelectBar(statpos, width, spacing, animeReviewScore, 10);
            // review
            statpos = inspSingleString(statpos, width, spacing, txtMrth('aniReview'), 14);
            scaleFont(12, 'Segoe UI');
            [this.review, statpos] = inspTextInput(statpos, width, spacing, this.review, 12);
            // points & spoilers
            scaleFont(14, 'Segoe UI', 'bold'); ctx.fillStyle = `#06a803`;
            this.points = getWatchPointCount(this.animedata.episodes, this.rating, this.watched+this.watchplus, presetbase[this.preset].mult * this.multiplier, this.animedata.type);
            var pstr = this.watched > 0
            ? `${txtMrth('aniWatchPoints')}: ${this.points} (~${floatNumber(this.points / (this.watched + this.watchplus), 1)} ${txtMrth('aniPointsEp')})`
            : `${txtMrth('aniWatchPoints')}: ${this.points}`;
            statpos = inspSingleString(statpos, width, spacing, pstr, 14);
            //
            var spoilers = getSpoilerCount(this.watched + this.watchplus, this.animedata.type);
            if(spoilers > 0) {statpos = inspSingleString(statpos, width, spacing, txtMrth('aniExplore') + spoilers, 14)};
            // quota info
            var quotaeps = Math.round(this.animedata.episodes * (mapMeta.permQuota/100) - 0.25); // 1.74 = 1, 1.75 = 2 (немного смещённое округление)
            if(this.watched > 0 && this.watched + this.watchplus < quotaeps) {
                ctx.fillStyle = `#fa7223`;
                var qtext = txtMrth('aniQuota1') + quotaeps + txtMrth('aniQuota2') + commentPermanentEffect(this.quota);
                statpos = inspTextBlock(statpos, width, spacing, qtext, 3, 14);
            };
            // apply button
            ctx.textAlign = 'center';
            if(this.watched > 0) {
                buttonApplyWatch.insp = this; 
                buttonApplyWatch.onact = this.buttonApply;
                //
                inspWideButton(statpos, width, spacing, buttonApplyWatch);
                ctx.fillStyle = `#ffffff`;
                statpos = inspSingleString(statpos.sumxy(0, spacing/2), width, spacing, txtMrth('aniEnding'), 14);
            } else {
                ctx.fillStyle = `#ff8888`;
                statpos = inspSingleString(statpos.sumxy(0, spacing/2), width, spacing, txtMrth('aniNotWatched'), 14);
            };
            // info about items
            scaleFont(14, 'Segoe UI');
            if(this.items.length > 0) {
                ctx.fillStyle = `#ffffff`;
                statpos = inspSingleString(statpos.sumxy(0, spacing/2), width, spacing, txtMrth('aniItems'), 14);
                ctx.fillStyle = '#afa';
            };
            for(var i in this.items) {statpos = inspSingleString(statpos, width, spacing, mrthStuff.items[this.items[i]].name, 14)};
            // info about negative items
            statpos = inspAnimeNegativeInfo(statpos, width, spacing);
            // reroll button
            ctx.textAlign = 'start'; ctx.fillStyle = '#cccccc';
            scaleFont(12, 'Segoe UI');
            statpos = inspTextBlock(statpos, width, spacing, txtMrth('aniRerollDesc'), 6, 12);
            buttonRerollAnime.insp = this;
            buttonRerollAnime.onact = this.buttonRoll;
            statpos = inspWideButton(statpos, width, spacing, buttonRerollAnime);
            // reroll info
            scaleFont(14, 'Segoe UI', 'bold'); ctx.fillStyle = '#fa7223';
            statpos = inspTextBlock(statpos, width, spacing, txtMrth('aniFine1') + this.reroll + txtMrth('aniFine2') + commentPermanentEffect(this.quota), 3, 14);
            // add some free space in bottom for easy-to-read
            statpos.y += 200 / _scaleDynamic;
        //
        } else if(this.state == 'watched') {
            for(var i in this.history) {
                ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
                scaleFont(24, 'Segoe UI', 'bold');
                // anime title, info, stats & review
                statpos = inspTextBlock(statpos, width, spacing, this.history[i].n, 2, 20);
                scaleFont(14, 'Segoe UI');
                statpos = inspSingleString(statpos, width, spacing, this.history[i].p, 14);
                statpos = inspSingleString(statpos, width, spacing, this.history[i].y, 14);
                ctx.textAlign = 'start';
                statpos = inspSingleString(statpos, width, spacing, txtMrth('aniReview2'), 14).minxy(0, spacing);
                scaleFont(12, 'Segoe UI');
                statpos = inspTextBlock(statpos, width, spacing, this.history[i].r, 11, 12);
                // end
                fillRect(new Vector2(width, 3*_scaleDynamic), statpos, '#ffffff');
                statpos = statpos.sumxy(0, spacing/2 + 3*_scaleDynamic);
            };
            // universal_key
            var item = mrthGetItem('universal_key');
            if(mapMeta.pos.condAND(this.pos) && item !== false) {
                ctx.textAlign = 'center'; scaleFont(14, 'Segoe UI');
                buttonRollAnime.text = txtMrth('aniUseUkey');
                buttonRollAnime.insp = this;
                buttonRollAnime.onclick = () => {
                    playSound(sound['player']);
                    mrthDeleteItem('universal_key');
                    buttonRollAnime.insp.state = 'roll';
                    buttonRollAnime.insp.completed = false;
                    mrthMeta.scroll.set(0);
                    marathonSave()
                };
                statpos = inspWideButton(statpos, width, spacing, buttonRollAnime).sumxy(0, spacing);
                ctx.textAlign = 'center'; ctx.fillStyle = '#cccccc';
                statpos = inspTextBlock(statpos, width, spacing, mrthStuff.items['universal_key'].desc, 4, 14)
            };
            // add some free space in bottom for easy-to-read
            statpos.y += 250 / _scaleDynamic;
        }
        return statpos.y
    }
    buttonRoll() {
        //
        if(this.insp.state == 'anime') { // удалять предметы пока не буду))))))
            this.insp.state = 'roll';
            mrthMeta.scroll.set(0);
            // reroll FINE with JOKERS and ORDER
            var joker = mrthGetItem('joker');
            if(joker === false) {
                mapMeta.rerolls++; // с жокером реролл не засчитывается
                if(mapMeta.points >= this.insp.reroll && mrthGetItem('order') === false) {mapMeta.points -= this.insp.reroll}
                else {applyPermanentEffect(this.insp.quota)}
            } else {
                mrthReduceItem(joker)
            };
            spartMrthBadIssue()
        } else {
            playSound(sound['player']);
            spartWinnerDrop(mouse.pos, 5, 1.5);
        };
        this.insp.completed = false;
        // reset inspector objects
        animeReviewScore.update(0, 10);
        animeReviewWatched.update(0, 1);
        buttonRerollAnime.progress = 0; buttonRerollAnime.operate = false;
        buttonApplyWatch.progress = 0; buttonApplyWatch.operate = false;
        this.insp.points = 0; this.insp.episodes = 0; this.insp.review = '';
        // get quota debuff and reroll fine
        this.insp.quota = getPermanentEffect(false);
        this.insp.reroll = itemFunc.recyclerPoints(this.insp.pos, this.insp.preset);
        // block movement while screen animation
        mapMeta.cutscene = true;
        // reset roulette winner
        if(roulette.winnerPos !== -1) {
            roulette.pics[roulette.winnerPos].bgColor = new Color(0,0,0,1);
            roulette.pics[roulette.winnerPos].winner = false;
            roulette.winnerPos = -1;
        };
        // data for title info block
        tInfo.meta.usePreset = true;
        presetSelected = ''+this.insp.preset;
        tInfo.meta.object = presetbase[presetSelected];
        tInfo.meta.changes = 0;
        lsSaveObject('tinfoMeta', tInfo.meta);
        // generate anime from preset modified by item filter addons
        filterPreset(presetbase[presetSelected]);
        for(var f in this.insp.filters) {filterDefault[f] = this.insp.filters[f]}; // modify filter by items
        // modify filter by negative items
        if(mrthGetItem('poop') !== false) {this.insp.multiplier = 0.75};
        if(mrthGetItem('salad') !== false) {filterDefault.scoreAllow = true; filterDefault.scoreMax = 7.5; filterDefault.scoreMin = 0};
        filterDefault.skipSpecial = true; // скип для всего односерийного, кроме фильмов
        // this function automated for jump to load screen
        roulette.marathon = true;
        animeArrayApply(getListFiltered(filterDefault));
    }
    buttonApply() {
        spartTopClicks(imageMarathonLogo, 10);
        setTimeout(() => {spartMrthGoodIssue(true)}, 500);
        // save anime to history
        buttonApplyWatch.insp.history.push({
            index: +mapMeta.animes,
            n: ''+buttonApplyWatch.insp.animedata.title,
            p: `${buttonApplyWatch.insp.animedata.episodes} ep. |  Rating ${buttonApplyWatch.insp.rating} | ${txt(typesDataMap[buttonApplyWatch.insp.animedata.type])} | ${buttonApplyWatch.insp.animedata.status} | ${buttonApplyWatch.insp.animedata.animeSeason.year} | ${txt(seasonsDataMap[buttonApplyWatch.insp.animedata.animeSeason.season][1])}`,
            y: `${txtMrth('aniWatched')}: ${buttonApplyWatch.insp.watched} | ${txtMrth('aniScore')}${buttonApplyWatch.insp.score} | ${txtMrth('aniPointsGain')}: ${buttonApplyWatch.insp.points}`,
            r: ''+buttonApplyWatch.insp.review,
        });
        buttonApplyWatch.insp.review = ''; // delete already saved review into history.r
        // set meta
        buttonApplyWatch.insp.state = 'watched';
        buttonApplyWatch.insp.completed = true;
        mapMeta.watching = false;
        // updating stats
        mapMeta.points += buttonApplyWatch.insp.points;
        mapMeta.total += buttonApplyWatch.insp.points;
        mapMeta.episodes += buttonApplyWatch.insp.watched;
        mapMeta.animes++;
        // updating missions
        if(buttonApplyWatch.insp.watched + buttonApplyWatch.insp.watchplus >= buttonApplyWatch.insp.animedata.episodes) {missionMoving('anime')};
        // deleting positive items from this rect
        buttonApplyWatch.insp.items = [];
        // deleting negative items
        if(mrthGetItem('poop') !== false) {mrthDeleteItem('poop')};
        if(mrthGetItem('salad') !== false) {mrthDeleteItem('salad')};
        if(mrthGetItem('order') !== false) {mrthDeleteItem('order')};
        //debuff by quota with JOKERS
        if(buttonApplyWatch.insp.watched + buttonApplyWatch.insp.watchplus < Math.floor(buttonApplyWatch.insp.animedata.episodes * (mapMeta.permQuota/100))) {
            var joker = mrthGetItem('joker');
            if(joker === false) {applyPermanentEffect(buttonApplyWatch.insp.quota)} else {mrthReduceItem(joker)};
        };
        // IF FULLY WATCHED delete handcuffs (+1 for prevent huita ebana)
        if(buttonApplyWatch.insp.watched + buttonApplyWatch.insp.watchplus + 1 >= buttonApplyWatch.insp.animedata.episodes) {
            mrthReduceItem(mrthGetItem('handcuffs'))
        };
        // checking map, if map do not have any anime rect - generating opened anime rect on random empty rect
        mapCheckAvalaibleAnimes();
        // rect spoiler cutscene
        var spoiler = getSpoilerCount(buttonApplyWatch.insp.watched, buttonApplyWatch.insp.animedata.type);
        if(spoiler > 0) {setTimeout(() => {mapMeta.cutscene = true; mapGenerateSpoilers(spoiler)}, 1500)};
        // save all
        marathonSave()
    }
};
// 2 серии = 1 клетка | 6 серий или фильм = 2 | 12 серий = 3 | 20 серий = 4
// 1 - хорошая встреча
// 2 - хороший предмет
// 3 - хорошая встреча
// 4 - аниме с топовым пресетом
//
class inspQuestion {
    constructor(pos) {
        this.pos = pos;
        this.color = '#55bbbb88';
        this.completed = false;
        //
        this.state = 'start';
        this.animes = [];
        this.title = 0;
        this.characters = [];
        this.type = 'none';
        this.picture = new Image();
        this.content = {
            quest: '', object: '',
            answers: [],
            type: 'pic',
            correct: 0,
        };
        this.reward = {type: '', content: '', default: 0};
        this.result = false;
        this.comment = '';
        this.answer = false;
    }
    collect(content='medium') {
        // set reward type
        this.reward.type = Math.random();
        if(content == 'easy') {
            if(this.reward.type <= 0.6) {this.reward.type = 'point'}
            else if(this.reward.type > 0.6 && this.reward.type < 0.8) {this.reward.type = 'item'}
            else {this.reward.type = 'spoiler'}
        } else {
            this.reward.type <= 0.7 ? this.reward.type = 'point' : this.reward.type = 'item'
        };
        // set default points reward in coins, if inventory not have free space
        this.reward.default = Math.floor(mrthGetExploreCost(this.pos) * (2 + Math.random()*2) * mapMeta.permPoints);
        // set other reward content
        if(this.reward.type == 'spoiler') {this.reward.content = Math.random() > 0.5 ? 2 : 1};
        if(this.reward.type == 'item') {this.reward.content = _itemsPositive[Math.floor(Math.random() * (_itemsPositive.length - 0.001))]};
    }
    update() {}
    inspector(pos, width, spacing) {
        // ui
        inspDefHeader(pos, width, spacing, txtMrth('queName'));
        // quest info
        ctx.fillStyle = '#cccccc'; ctx.textAlign = 'start';
        scaleFont(14, 'Segoe UI');
        var statpos = inspTextBlock(pos.sumxy(0, spacing*2), width, spacing, txtMrth('queAbout'), 3, 14);
        // line && states
        fillRect(new Vector2(width, 3*_scaleDynamic), statpos, '#ffffff');
        statpos = statpos.sumxy(0, spacing/2 + 3*_scaleDynamic);
        // start button
        if(this.state == 'start') {
            if(mapMeta.pos.condAND(this.pos)) {
                ctx.textAlign = 'center';
                buttonRollAnime.insp = this;
                buttonRollAnime.text = txtMrth('queGenerate');
                buttonRollAnime.onclick = () => {
                    playSound(sound['player']);
                    // start jikan state, requesting question data & enable cutscene
                    buttonRollAnime.insp.state = 'jikan_top';
                    jikan.custom(`https://api.jikan.moe/v4/top/anime?page=${Math.floor(Math.random()*40)}&sfw=true`);
                    mapMeta.cutscene = true; 
                };
                statpos = inspWideButton(statpos, width, spacing, buttonRollAnime).sumxy(0, spacing);
            } else {
                statpos = inspTextBlock(statpos, width, spacing, txtMrth('stepOnRect'), 3, 14);
            };
            // draw reward info
            ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
            statpos = inspSingleString(statpos, width, spacing, txtMrth('queInfo'), 14);
            scaleFont(20, 'Segoe UI', 'bold');
            if(this.reward.type == 'point') {statpos = inspSingleString(statpos, width, spacing, txtMrth('queCoins') + this.reward.default, 20)};
            if(this.reward.type == 'spoiler'){statpos = inspSingleString(statpos, width, spacing, txtMrth('queExplore') + this.reward.content, 20)};
            if(this.reward.type == 'item'){
                statpos = inspSingleString(statpos, width, spacing, mrthStuff.items[this.reward.content].name, 20);
                if(!mrthInventoryFreeSpace()) {ctx.fillStyle = '#ff5555'; scaleFont(14, 'Segoe UI');
                    statpos = inspTextBlock(statpos, width, spacing, txtMrth('queNoItems') + this.reward.default, 4, 14);
                }
            };
        //
        // request needed data about anime and characters
        } else if(this.state == 'jikan_top') {
            // top anime from 1000 (25 * 40 pages)
            if(jikan._result != 'wait') {
                if(jikan._result == 'failed' || jikan._result == 'error') {this.state = 'start'; return};
                // parse animes, get random one and send request for chars
                this.animes = JSON.parse(JSON.stringify(jikan._result));
                // if(typeof this.animes != 'object') {this.state = 'start'; return}; // if request throw error in data
                this.title = Math.floor(Math.random() * (this.animes.data.length - 0.001));
                jikan.custom(`https://api.jikan.moe/v4/anime/${this.animes.data[this.title].mal_id}/characters`);
                this.state = 'jikan_chars'
            };
        } else if(this.state == 'jikan_chars') {
            if(jikan._result != 'wait') {
                if(jikan._result == 'failed' || jikan._result == 'error') {this.state = 'start'; return};
                this.characters = JSON.parse(JSON.stringify(jikan._result));
                this.state = 'forming'
            }
        } else if(this.state == 'forming') {
            // get question type
            if(this.type == 'none') {
                var types = ['pic', 'synop', 'charname', 'charanime'];
                this.type = types[Math.floor(Math.random() * (types.length - 0.001))];
                // get correct answer title
                this.content.correct = Math.floor(Math.random() * 3.999);
            };
            // generate question
            //
            if(this.type == 'pic') {
                this.content.quest = txtMrth('queTypePic');
                this.content.type = 'pic';
                this.picture = new Image(); this.picture.timeo = 0;
                this.picture.src = this.animes.data[this.title].images.webp.image_url;
                this.content.answers = [];
                while (this.content.answers.length < 4) {
                    var ind = Math.floor(Math.random() * 24.999);
                    if(ind == this.title) {continue};
                    if(this.animes.data[ind].title == 'used') {continue}
                    else {
                        this.content.answers.push(this.animes.data[ind].title);
                        this.animes.data[ind].title = 'used'
                    }
                };
                this.content.answers[this.content.correct] = this.animes.data[this.title].title;
                this.state = 'waitpic'
            //
            } else if(this.type == 'synop') {
                this.content.quest = txtMrth('queTypeSynop');
                this.content.type = 'text';
                this.content.object = this.animes.data[this.title].synopsis;
                this.content.answers = [];
                while (this.content.answers.length < 4) {
                    var ind = Math.floor(Math.random() * 24.999);
                    if(ind == this.title) {continue};
                    if(this.animes.data[ind].title == 'used') {continue}
                    else {
                        this.content.answers.push(this.animes.data[ind].title);
                        this.animes.data[ind].title = 'used'
                    }
                };
                this.content.answers[this.content.correct] = this.animes.data[this.title].title;
                this.state = 'quest'
            } else if(this.type == 'charname') {
                // if characters less than 5, (4random + 1correct) new request
                if(this.characters.data.length < 5) {
                    this.title = Math.floor(Math.random() * (this.animes.data.length - 0.001));
                    jikan.custom(`https://api.jikan.moe/v4/anime/${this.animes.data[this.title].mal_id}/characters`);
                    this.state = 'jikan_chars'
                } else {
                    this.title = Math.floor(Math.random() * (this.characters.data.length - 0.001));
                    this.content.quest = txtMrth('queTypeName');
                    this.content.type = 'pic';
                    this.picture = new Image(); this.picture.timeo = 0;
                    this.picture.src = this.characters.data[this.title].character.images.webp.image_url;
                    this.content.answers = [];
                    while (this.content.answers.length < 4) {
                        var ind = Math.floor(Math.random() * (this.characters.data.length - 0.001));
                        if(ind == this.title) {continue};
                        if(this.characters.data[ind].character.name == 'used') {continue}
                        else {
                            this.content.answers.push(this.characters.data[ind].character.name);
                            this.characters.data[ind].character.name = 'used'
                        }
                    };
                    this.content.answers[this.content.correct] = this.characters.data[this.title].character.name;
                    this.state = 'waitpic'
                }
            } else if(this.type == 'charanime') {
                // if characters less than 1, new request
                if(this.characters.data.length < 1) {
                    this.title = Math.floor(Math.random() * (this.animes.data.length - 0.001));
                    jikan.custom(`https://api.jikan.moe/v4/anime/${this.animes.data[this.title].mal_id}/characters`);
                    this.state = 'jikan_chars'
                } else {
                    var char = Math.floor(Math.random() * (this.characters.data.length - 0.001));
                    this.content.quest = txtMrth('queTypeFrom');
                    this.content.type = 'pic';
                    this.picture = new Image(); this.picture.timeo = 0;
                    this.picture.src = this.characters.data[char].character.images.webp.image_url;
                    this.content.answers = [];
                    while (this.content.answers.length < 4) {
                        var ind = Math.floor(Math.random() * 24.999);
                        if(ind == this.title) {continue};
                        if(this.animes.data[ind].title == 'used') {continue}
                        else {
                            this.content.answers.push(this.animes.data[ind].title);
                            this.animes.data[ind].title = 'used'
                        }
                    };
                    this.content.answers[this.content.correct] = this.animes.data[this.title].title;
                    this.state = 'waitpic'
                }
            }
        } else if(this.state == 'waitpic') {
            this.picture.timeo += deltaTime;
            if(this.picture.complete) {this.state = 'quest'};
            if(this.picture.timeo > 10000) {this.state = 'start'; return} // timeout 10 sec & new request
        };
        // drawing waiting
        if(this.state != 'quest' && this.state != 'start' && this.state != 'end') {
            ctx.fillStyle = '#fff';
            statpos = inspSingleString(statpos, width, spacing, txtMrth('queLoading'), 14)
        };
        //
        // draw question
        if(this.state == 'quest') {
            // quest
            scaleFont(18, 'Segoe UI', 'bold'); ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
            statpos = inspSingleString(statpos, width, spacing, this.content.quest, 18);
            // q content
            scaleFont(14, 'Segoe UI');
            if(this.content.type == 'pic') {
                var picsize = this.picture.naturalHeight > this.picture.naturalWidth
                ? new Vector2((this.picture.naturalWidth / this.picture.naturalHeight) * 200, 200)
                : new Vector2(200, (this.picture.naturalHeight / this.picture.naturalWidth) * 200);
                drawImageSized(this.picture, statpos.sumxy(width/2 - picsize.x/2, 0), picsize);
                statpos = statpos.sumxy(0, picsize.y + spacing)
            } else if(this.content.type == 'text') {
                ctx.textAlign = 'start';
                statpos = inspTextBlock(statpos, width, spacing, this.content.object, 12, 14);
                ctx.textAlign = 'center';
            };
            // answers
            buttonsQuestionAnswer[0].insp = this;
            for(var a in this.content.answers) {
                buttonsQuestionAnswer[a].text = this.content.answers[a];
                statpos = inspWideButton(statpos, width, spacing, buttonsQuestionAnswer[a])
            };
            // get answer
            if(this.answer !== false) {
                // get result & clear temporary question data
                this.result = this.answer == this.content.correct;
                this.animes = []; this.characters = [];
                this.picture = '';
                // ending quest, disable cutscene
                this.completed = true;
                this.state = 'end';
                mapMeta.cutscene = false;
                // give reward, if result is true
                if(this.result) {
                    if(this.reward.type == 'point') {mapMeta.points += this.reward.default; spartMrthGoodIssue(true)};
                    if(this.reward.type == 'spoiler') {spartMrthGoodIssue(); setTimeout(() => {mapGenerateSpoilers(this.reward.content)}, 500);};
                    if(this.reward.type == 'item') {
                        if(mrthInventoryFreeSpace()) {this.comment = mrthInventoryComment(mrthInventoryAddItem(this.reward.content)); spartMrthGoodIssue()}
                        else {this.reward.type = 'point'; mapMeta.points += this.reward.default; spartMrthGoodIssue(true)}
                    };
                    // missions
                    missionMoving('question')
                } else {spartMrthBadIssue()}; // bad ending)))
                marathonSave()
            }
        } else if(this.state == 'end') {
            scaleFont(14, 'Segoe UI'); ctx.textAlign = 'center';
            statpos.sumxy(0, spacing);
            if(this.result) {
                ctx.fillStyle = '#4f4';
                statpos = inspSingleString(statpos, width, spacing, txtMrth('queNihuya'), 14);
                scaleFont(18, 'Segoe UI', 'bold');
                statpos = inspTextBlock(statpos, width, spacing, this.content.answers[this.content.correct], 2, 18);
                // draw reward info
                if(this.reward.type != 'item') {
                    ctx.fillStyle = '#ffffff'; scaleFont(14, 'Segoe UI');
                    statpos = inspSingleString(statpos, width, spacing, txtMrth('queResult'), 14);
                    scaleFont(18, 'Segoe UI', 'bold');
                    if(this.reward.type == 'point') {statpos = inspSingleString(statpos, width, spacing, txtMrth('queCoins') + this.reward.default, 18)};
                    if(this.reward.type == 'spoiler'){statpos = inspSingleString(statpos, width, spacing, txtMrth('queExplore') + this.reward.content, 18)};
                } else {
                    ctx.fillStyle = '#ffffff'; scaleFont(14, 'Segoe UI');
                    statpos = inspSingleString(statpos, width, spacing, txtMrth('queResult'), 14);
                    scaleFont(18, 'Segoe UI', 'bold');
                    statpos = inspTextBlock(statpos, width, spacing, this.comment, 5, 18)
                }
            } else {
                ctx.fillStyle = '#f44';
                statpos = inspSingleString(statpos, width, spacing, txtMrth('queEbanat'), 14);
                statpos = inspTextBlock(statpos, width, spacing, txtMrth('queRightAnswer') + this.content.answers[this.content.correct], 2, 14)
            }
        }
        //
        return statpos.y
    }
};
//
class inspMeeting {
    constructor(pos) {
        this.pos = pos;
        this.color = '#55bb5588';
        this.completed = false;
        //
        this.state = 'start';
        this.scenario = '';
        this.story = [];
        this.values = {};
        this.content = 'medium';
        // root reader
        this.readstate = 'callback';
        this.root = 'start';
        this.textprog = 0;
        this.result = '';
        // string revealer
        this.string = '';
        this.extra = false;
        this.strprog = 0;
        this.stringspeed = 70;
    }
    collect(content='medium') {
        this.content = content;
    }
    update() {}
    inspector(pos, width, spacing) {
        // ui
        inspDefHeader(pos, width, spacing, this.content == 'easy' ? txtMrth('metHeadGood') : txtMrth('metHeadNorm'));
        // quest info
        ctx.fillStyle = '#cccccc'; ctx.textAlign = 'start';
        scaleFont(14, 'Segoe UI');
        var about = this.content != 'easy' ? txtMrth('metAboutNorm') : txtMrth('metAboutGood');
        var statpos = inspTextBlock(pos.sumxy(0, spacing*2), width, spacing, about, 3, 14);
        // line && states
        fillRect(new Vector2(width, 3*_scaleDynamic), statpos, '#ffffff');
        statpos = statpos.sumxy(0, spacing/2 + 3*_scaleDynamic);
        //
        if(this.state == 'start') {
            // start button
            if(mapMeta.pos.condAND(this.pos)) {
                ctx.textAlign = 'center';
                buttonRollAnime.insp = this;
                buttonRollAnime.text = txtMrth('metStart');
                buttonRollAnime.onclick = () => {
                    playSound(sound['player']);
                    buttonRollAnime.insp.state = 'init';
                    // collect by content type
                    if(this.content == 'easy') {this.scenario = mrthMeetingsEasy[Math.floor(Math.random() * (mrthMeetingsEasy.length - 0.001))]}
                    else if(this.content == 'hard') {this.scenario = mrthMeetingsHard[Math.floor(Math.random() * (mrthMeetingsHard.length - 0.001))]}
                    else {this.scenario = mrthMeetingsAll[Math.floor(Math.random() * (mrthMeetingsAll.length - 0.001))]}
                    // applying "black" to collected content
                    if(mrthGetItem('black') !== false) {
                        // 50% chance of rewrite to bad meeting
                        if(Math.random() >= 0.5) {this.scenario = mrthMeetingsHard[Math.floor(Math.random() * (mrthMeetingsHard.length - 0.001))]};
                        mrthDeleteItem('black'); // delete in any case
                    }
                };
                statpos = inspWideButton(statpos, width, spacing, buttonRollAnime).sumxy(0, spacing);
                // info about black metka
                ctx.fillStyle = '#ff5555';
                if(mrthGetItem('black') !== false) {statpos = inspTextBlock(statpos, width, spacing, txtMrth('metBlack'), 3, 14)}
            } else {
                statpos = inspTextBlock(statpos, width, spacing, txtMrth('stepOnRect'), 3, 14);
            }
        } else if(this.state == 'init') {
            // load values from scenario
            for(let i in mrthStuff.meetings[this.scenario].meta.values) {
                this.values[i] = mrthStuff.meetings[this.scenario].meta.values[i];
            };
            // start cutscene for prevent player moving & start meet
            mapMeta.cutscene = true;
            this.state = 'meet'
        } else if(this.state == 'meet') {
            var sc = mrthStuff.meetings[this.scenario];
            // readstate model
            if(this.readstate == 'closed') {
                // closing readstate by if in head
            } else if(this.readstate == 'callback') {
                // root selection buttons reset avalaibility
                buttonMeetRoot1.state = `idle`; buttonMeetRoot2.state = `idle`; buttonMeetRoot3.state = `idle`;
                // check callback, get result & check result, maybe switch root
                var result = undefined;
                if(sc[this.root].callback !== undefined) {result = sc[this.root].callback(this)};
                if(result !== undefined) {
                    if(result == 'root') {
                        // switching the root by condition in callback
                        this.readstate = 'newroot'
                    } else {
                        // root selection buttons avalaibility
                        buttonMeetRoot1.state = result[0] !== undefined ? result[0] ? `idle` : `unaval` : `idle`;
                        buttonMeetRoot2.state = result[1] !== undefined ? result[1] ? `idle` : `unaval` : `idle`;
                        buttonMeetRoot3.state = result[2] !== undefined ? result[2] ? `idle` : `unaval` : `idle`;
                    }
                };
                // checking end root & new root, else getting text
                if(this.root == 'end') {this.readstate = 'end'}
                else if(this.readstate == 'newroot') {this.readstate = 'callback'} 
                else {
                    this.readstate = 'gettext'; this.textprog = 0;
                    // checking extrastring
                    this.extra = sc[this.root].extrastring === undefined;
                }
            //
            } else if(this.readstate == 'gettext') {
                // check text
                if(sc[this.root].text !== undefined) {
                    if(sc[this.root].text.length > this.textprog) {
                        // have unreaded text, reading
                        this.string = sc[this.root].text[this.textprog];
                        this.strprog = 0;
                        this.story[this.story.length] = ['s', ''];
                        this.readstate = 'reveal';
                    } else if(this.extra === false) {
                        // if have callback for show string with interpolated values
                        this.string = sc[this.root].extrastring(this);
                        this.strprog = 0;
                        this.extra = true;
                        this.story[this.story.length] = ['sb', ''];
                        this.readstate = 'reveal';
                    } else {
                        // do not have unreaded text, go to buttons
                        this.readstate = 'buttons';
                    }
                } else {
                    // do not have any text -> end root
                    this.root = 'end';
                    this.readstate = 'callback';
                }
            //
            } else if(this.readstate == 'reveal') {
                // revealing text & can skip by mouse
                if(this.strprog < this.string.length && !mouse.click) {
                    this.strprog += this.stringspeed * (deltaTime/1000);
                    this.story[this.story.length-1][1] = this.string.substring(0, Math.floor(this.strprog));
                } else {
                    mouse.click = false;
                    // text fully revealed, checking continue
                    this.story[this.story.length-1][1] = String(this.string);
                    this.textprog++;
                    if(sc[this.root].text.length > this.textprog || this.extra === false) {
                        this.readstate = 'continue'; // if has more text OR has extrastring, wait for continue button
                    } else {
                        this.readstate = 'buttons'; // if has no more text - buttons
                    }
                }
            //
            // } else if(this.readstate == 'continue') { --- drawing continue button, onclick is: this.readstate = 'gettext'
            } else if(this.readstate == 'buttons') {
                // if no choices - end meet
                if(sc[this.root].choice === undefined) {this.root = 'end'; this.readstate = 'callback'} 
                else { // setup root select buttons
                    if(sc[this.root].choice[0] !== undefined) {
                        buttonMeetRoot1.text = String(sc[this.root].choice[0].name);
                        buttonMeetRoot1.onclick = () => {
                            playSound(sound['button']);
                            mapGetRect(mapMeta.pos).object.readstate = 'callback';
                            mapGetRect(mapMeta.pos).object.story.push(['h', String(sc[this.root].choice[0].name)]);
                            mapGetRect(mapMeta.pos).object.root = String(sc[this.root].choice[0].root)
                        }
                    };
                    if(sc[this.root].choice[1] !== undefined) {
                        buttonMeetRoot2.text = String(sc[this.root].choice[1].name);
                        buttonMeetRoot2.onclick = () => {
                            playSound(sound['button']);
                            mapGetRect(mapMeta.pos).object.readstate = 'callback';
                            mapGetRect(mapMeta.pos).object.story.push(['h', String(sc[this.root].choice[1].name)]);
                            mapGetRect(mapMeta.pos).object.root = String(sc[this.root].choice[1].root)
                        }
                    };
                    if(sc[this.root].choice[2] !== undefined) {
                        buttonMeetRoot3.text = String(sc[this.root].choice[2].name);
                        buttonMeetRoot3.onclick = () => {
                            playSound(sound['button']);
                            mapGetRect(mapMeta.pos).object.readstate = 'callback';
                            mapGetRect(mapMeta.pos).object.story.push(['h', String(sc[this.root].choice[2].name)]);
                            mapGetRect(mapMeta.pos).object.root = String(sc[this.root].choice[2].root)
                        }
                    };
                    // wait for root select
                    this.readstate = 'root'
                }
            } else if(this.readstate == 'end') {
                // add end string and close meeting, free player moving
                this.story.push(['h', txtMrth('metEnded')]);
                mapMeta.cutscene = false;
                this.readstate = 'closed';
                setTimeout(() => {
                    mrthMeta.scroll.set(0);
                    this.completed = true;
                    this.state = 'ended';
                    this.story = [];
                    missionMoving('meeting');
                    marathonSave()
                }, 2000);
            };
            // drawing all meeting story
            for(let i in this.story) {
                if(this.story[i][0] == 'h') { // draw headers
                    scaleFont(18, 'Segoe UI', 'bold'); ctx.fillStyle = `#ffffff`; ctx.textAlign = 'center';
                    statpos = inspSingleString(statpos, width, spacing, this.story[i][1], 18);
                };
                if(this.story[i][0] == 's') { // text blocks
                    scaleFont(14, 'Segoe UI'); ctx.fillStyle = `#dddddd`; ctx.textAlign = 'start';
                    statpos = inspTextBlock(statpos, width, spacing, this.story[i][1], 30, 14);
                };
                if(this.story[i][0] == 'sb') { // text blocks with extrastring
                    scaleFont(14, 'Segoe UI', 'italic'); ctx.fillStyle = `#eeeeee`; ctx.textAlign = 'start';
                    statpos = inspTextBlock(statpos, width, spacing, this.story[i][1], 30, 14);
                };
            }
            // drawing continue button OR root buttons
            ctx.textAlign = 'center'; ctx.fillStyle = `#ffffff`; scaleFont(18, 'Segoe UI');
            if(this.readstate == 'continue') {
                statpos = inspWideButton(statpos, width, spacing, buttonMeetContinue)
            } else if(this.readstate == 'root') {
                sc[this.root].choice[0] !== undefined ? statpos = inspWideButton(statpos, width, spacing, buttonMeetRoot1) : false;
                sc[this.root].choice[1] !== undefined ? statpos = inspWideButton(statpos, width, spacing, buttonMeetRoot2) : false;
                sc[this.root].choice[2] !== undefined ? statpos = inspWideButton(statpos, width, spacing, buttonMeetRoot3) : false;
            };
            // add some free space in bottom for easy-to-read
            statpos.y += 250 * _scaleDynamic;
        } else if(this.state == 'ended') {
            scaleFont(14, 'Segoe UI'); ctx.fillStyle = `#ffffff`; ctx.textAlign = 'center';
            statpos = inspSingleString(statpos, width, spacing, txtMrth('metEnded'), 14);
            scaleFont(20, 'Segoe UI', 'bold');
            statpos = inspTextBlock(statpos, width, spacing, this.result, 3, 20);
        }
        return statpos.y
    }
};
//
class inspTreasure {
    constructor(pos) {
        this.pos = pos;
        this.color = '#fcce2688';
        this.completed = false;
        //
        this.state = 'idle';
        this.content = 'medium';
        this.array = [];
        this.progress = 0;
        this.speed = new Vector1(2);
        this.offset = 9;
        this.winner = '';
        this.comment = '';
        this.positives = 0;
    }
    collect(content='medium') {
        this.content = content;
        // get array
        var chance = content == 'easy' ? .8 : .55;
        for(let i = 0; i<25; i++) {
            if(Math.random() < chance) {
                this.positives++;
                this.array[i] = _itemsPositive[Math.floor(Math.random() * (_itemsPositive.length - 0.001))]
            } else {
                this.array[i] = _itemsNegative[Math.floor(Math.random() * (_itemsNegative.length - 0.001))]
            }
        };
    }
    update() {}
    inspector(pos, width, spacing) {
        inspDefHeader(pos, width, spacing, this.content == 'easy' ? txtMrth('treHeadGood') : txtMrth('treHeadNorm'));
        // quest info
        ctx.fillStyle = '#cccccc'; ctx.textAlign = 'start';
        scaleFont(14, 'Segoe UI');
        var statpos = inspSingleString(pos.sumxy(0, spacing*2), width, spacing, txtMrth('treAboutNorm'), 14);
        // collect speed vector from save
        if(!(this.speed instanceof Vector1)) {this.speed = new Vector1(2)};
        // line && states
        fillRect(new Vector2(width, 3*_scaleDynamic), statpos, '#ffffff');
        statpos = statpos.sumxy(0, spacing*1.5 + 3*_scaleDynamic);
        // update roulette
        this.speed.update();
        if(this.progress > this.array.length-1) {this.progress -= this.array.length};
        this.progress += this.speed.get() * (deltaTime/1000);
        if(this.state != 'winner') {
            // chances
            ctx.textAlign = 'center'; scaleFont(18, 'Segoe UI');
            var chances = this.positives/this.array.length;
            if(chances < 0.35) {ctx.fillStyle = '#f33'} else if(chances >= 0.35 && chances < 0.65) {ctx.fillStyle = '#ff3'} else {ctx.fillStyle = '#3f3'};
            statpos = inspSingleString(statpos, width, spacing, txtMrth('treChances') + floatNumber(chances*100, 1) + '%', 14).sumxy(0, spacing*2);
            // draw roulette
            scaleFont(20, 'Segoe UI'); ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
            for(let i = -this.offset; i<this.array.length+this.offset-1; i++) {
                if(i < this.progress - this.offset) {continue};
                if(i > this.progress + this.offset) {break};
                //
                ctx.globalAlpha = 1 - easeInCubic(Math.abs(this.progress - i) / this.offset);
                var xpos = this.offset + (i - this.progress);
                var name = this.array[i < 0 ? i + this.array.length : i > this.array.length-1 ? i - this.array.length : i];
                fillTextFast(statpos.sumxy(width/2, xpos * (20 * _scaleDynamic)), mrthStuff.items[name].name);
                ctx.globalAlpha = 1;
            };
            // centered line
            fillRect(new Vector2(width, 20*_scaleDynamic), statpos.sumxy(0, (this.offset-0.5) * (20 * _scaleDynamic)), '#00ff0055');
            //
            statpos = statpos.sumxy(0, (this.offset*2 + 1)*(20 * _scaleDynamic));
            ctx.textBaseline = 'alphabetic';
        };
        if(this.state == 'idle') {
            // start button
            ctx.fillStyle = '#ffffff'; scaleFont(14, 'Segoe UI');
            if(mapMeta.pos.condAND(this.pos)) {
                var black = mrthGetItem('black'); // get black metka ebana rotto
                if(mrthInventoryFreeSpace()) {
                    ctx.textAlign = 'center';
                    buttonRollAnime.insp = this;
                    buttonRollAnime.text = txtMrth('treStart');
                    buttonRollAnime.onclick = () => {
                        playSound(sound['player']);
                        buttonRollAnime.insp.state = 'speed';
                        mapMeta.cutscene = true;
                        // apply black metka
                        if(black !== false) {
                            this.positives = 0;
                            // 50% chance of rewrite 50% of items to bad items
                            if(Math.random() >= 0.5) {
                                for(let i = 0; i<25; i+=2) {
                                    if(Math.random() < 0.75) {
                                        this.array[i] = _itemsNegative[Math.floor(Math.random() * (_itemsNegative.length - 0.001))]
                                    } else {
                                        this.positives++;
                                        this.array[i] = _itemsPositive[Math.floor(Math.random() * (_itemsPositive.length - 0.001))]
                                    }
                                }
                            };
                            spartMrthBadIssue(); 
                            mrthDeleteItem('black') // delete in any case
                        }
                    };
                    statpos = inspWideButton(statpos, width, spacing, buttonRollAnime).sumxy(0, spacing);
                    // info about metka
                    ctx.fillStyle = '#ff5555';
                    if(black !== false) {statpos = inspTextBlock(statpos, width, spacing, txtMrth('treBlack'), 3, 14)}    
                } else {
                    statpos = inspTextBlock(statpos, width, spacing, txtMrth('treNoItems'), 3, 14);
                }
            } else {
                statpos = inspTextBlock(statpos, width, spacing, txtMrth('stepOnRect'), 3, 14);
            }
        //
        } else if(this.state == 'speed') {
            this.speed.move(100 + Math.random()*20, 5, easeInCirc);
            setTimeout(() => {this.speed.move(0, 25, easeOutCirc); this.state = 'wait'}, 5000);
            this.state = 'none'
        //
        } else if(this.state == 'wait') {
            if(!this.speed.isMoving()) {
                this.state = 'winner';
                this.winner = this.array[Math.round(this.progress)];
                this.array = [];
                //
                if(mrthIsPositiveItem(this.winner)) {spartMrthGoodIssue()} else {spartMrthBadIssue()};
                //
                this.completed = true;
                mapMeta.cutscene = false;
                this.comment = mrthInventoryComment(mrthInventoryAddItem(this.winner));
                // check permanent items (azart)
                var item = mrthGetItem('azart');
                if(item !== false) {
                    mapMeta.points -= Math.round(mapMeta.points * 0.25);
                    mrthDeleteItem('azart');
                    // this.comment = txtMrth('treLudoman');
                };
                // mission & save
                missionMoving('treasure');
                marathonSave()
            }
        //
        } else if(this.state == 'winner') {
            ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; scaleFont(18, 'Segoe UI', 'bold');
            statpos = inspTextBlock(statpos, width, spacing, this.comment, 5, 18);
            // desc
            ctx.fillStyle = '#cccccc'; scaleFont(14, 'Segoe UI'); ctx.textAlign = 'start';
            statpos = inspTextBlock(statpos, width, spacing, mrthStuff.items[this.winner].desc, 5, 14)
        }
        return statpos.y
    }
};
//
class inspMission {
    constructor(pos) {
        this.pos = pos;
        this.color = '#c400f588';
        this.completed = false;
        //
        this.state = 'idle';
        this.pool = [];
        this.mission = '';
    }
    update() {}
    collect(content) {
        for(let i=0; i<3; i++) {
            this.pool[i] = missionGenerateRandom();
            if(this.pool[i].nobar !== undefined) {this.pool[i].nobar = 'yes'} else {this.pool[i].nobar = 'no'}
        }
    }
    inspector(pos, width, spacing) {
        inspDefHeader(pos, width, spacing, txtMrth('misName'));
        // head
        ctx.fillStyle = '#cccccc'; ctx.textAlign = 'start';
        scaleFont(14, 'Segoe UI');
        var statpos = inspTextBlock(pos.sumxy(0, spacing*2), width, spacing, txtMrth('misAbout'), 3, 14);
        // line && states
        fillRect(new Vector2(width, 3*_scaleDynamic), statpos, '#ffffff');
        statpos = statpos.sumxy(0, spacing/2 + 3*_scaleDynamic);
        // draw missions
        if(this.state == 'idle' || this.state == 'pick') {
            statpos = inspMissionsList(statpos, width, spacing, this.pool);
            scaleFont(16, 'Segoe UI');
            if(!mapMeta.pos.condAND(this.pos)) {
                ctx.fillStyle = '#ff3333'; ctx.textAlign = 'center';
                inspSingleString(statpos, width, spacing, txtMrth('stepOnRect'), 14);
            } else if(missionHaveSlots()) {
                ctx.textAlign = 'center'; ctx.fillStyle = '#ffffff';
                statpos = inspSingleString(statpos.sumxy(0, spacing*2), width, spacing, txtMrth('misChoice'), 16);
                // draw buttons
                buttonsMissionSelect[0].insp = this;
                statpos = inspThreeButtons(statpos, width, spacing, 24, buttonsMissionSelect);
            } else {
                ctx.fillStyle = '#ff3333'; ctx.textAlign = 'center';
                inspSingleString(statpos, width, spacing, txtMrth('misMax'), 14);
            };
            // if mission picked
            if(this.state == 'pick') {
                this.completed = true;
                this.pool = [];
                this.state = 'end';
                marathonSave() // save after picking mission
            }
        } else {
            ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
            statpos = inspSingleString(statpos, width, spacing, txtMrth('misChoiced'), 14);
            ctx.fillStyle = '#ffff00'; scaleFont(18, 'Segoe UI', 'bold');
            inspSingleString(statpos, width, spacing, this.mission, 18);
        }
    }
};
//
// @EAG MARATHON RECT TYPES
//
let mrthMeta = {
    rectSize: 160,
    rectSpacing: 16,
    spacing: 10,
    line: 3,
    //
    typesWeight: 0,
    //
    visuals: false, // false, 'half', 'full'
    //
    scroll: new Vector1(0),
    sensivity: 100,
    height: 0,
};
//
let mapMeta = {
    started: false,
    pos: new Vector2(0), // player pos
    scroll: new Vector2(), // map scroll
    selected: null, // selected by mouse
    //
    zoom: new Vector1(1), // map scale
    zoomStep: 0.05,
    zoomRange: [0.2, 2],
    //
    player: new Vector2(), // animated player pos
    playerSize: new Vector2(mrthMeta.rectSize*0.55), // player sprite size
    //
    overlaySizing: new Vector2(600, 50),
    overlayOffset: new Vector1(-600),
    overlay: false,
    overlayState: 'main', // main, inv, pref
    //
    steps: 0,
    cutscene: false,
    watching: false,
    //
    cutstate: 'none',
    spoilers: [],
    // stats (some stats used for missions)
    points: 50,
    total: 0,
    animes: 0,
    episodes: 0,
    rerolls: 0,
    explored: 0,
    missCompleted: 0,
    days: 0,
    // спермачи
    permPoints: 1, // монеты и очки
    permExplore: 3,   // исследования, будет уменьшаться
    permSeries: 10,  // очки и монеты за каждую серию
    permQuota: 50, // минималка серий (в процентах)
    //
    map: {},
    neighbors: {},
    //
    inventory: {"1": false, "2": false, "3": false, "4": false,},
    effects: {'1': false, '2': false,},
    missions: {'1': false, '2': false, 'daily': false},
    //
    date: '',
    startedAt: '',
};
//
let mrthRectTypes = {
    // all
    'empty': {
        weight: 1000, // default 1000
        class: inspEmpty
    },
    'anime': {
        weight: 15, // default 15
        class: inspAnime
    },
    'quest': {
        weight: 50, // default 50
        class: inspQuestion
    },
    'meeting': {
        weight: 60, // default 60
        class: inspMeeting
    },
    'treasure': {
        weight: 10, // default 10
        class: inspTreasure
    },
    'mission': {
        weight: 8, // default 8
        class: inspMission
    },
};
//
let mrthBadgeCoins = invokeNewImage('images/coins.png');
let mrthBadgeWatched = invokeNewImage('images/watched.png');
let mrthRectQuestion = invokeNewImage('images/questions.png');
let mrthRectMeeting = invokeNewImage('images/meeting.png');
let mrthRectTreasure = invokeNewImage('images/treasure.png');
let mrthRectMission = invokeNewImage('images/mission.png');
//
let mrthTypedLogos = {
    'anime': mrthBadgeWatched,
    'quest': mrthRectQuestion,
    'meeting': mrthRectMeeting,
    'treasure': mrthRectTreasure,
    'mission':mrthRectMission,
};
// rebalance
let mrthRectRebalance = {};
let mrthRectDefaultBalance = JSON.stringify(mrthRectTypes);
//
function mrthRectsBalance() {
    var lw = 0;
    for(var r in mrthRectTypes) {
        var w = +mrthRectTypes[r].weight;
        mrthRectTypes[r].weight = [lw+1, lw + w];
        lw += w
    };
    mrthMeta.typesWeight = lw
};
mrthRectsBalance();
//
function mrthGetExploreCost(pos) {
    return Math.round(Math.sqrt(pos.x*pos.x + pos.y*pos.y) * mapMeta.permExplore);
};
//
// @EAG MARATHON MAPPER
//
class mrthRect {
    constructor(pos, type=mrthRectTypeRandom()) {
        this.pos = pos;
        this.type = type;
        this.opened = false;
        this.object = {};
    }
    draw(scroll, size, spacing) {
        var pos = scroll.sumv(this.pos.multv(spacing));
        if(!this.opened) {
            // hided state
            ctx.fillStyle = '#555555aa';
            fillRectFast(size.multxy(0.9), pos.sumv(size.multxy(0.05)));
            if(this.type != 'empty') {
                _mrthDrawedLogos++;
                ctx.globalAlpha = 0.4;
                drawImageSized(mrthTypedLogos[this.type], pos.sumv(size.multxy(0.25)), size.multxy(0.5));
                ctx.globalAlpha = 1;
            };
            // ment
            if(playerIsNeighbor(this.pos, true)) {
                // get TAX item
                var tax = mrthGetItem('tax');
                var cost = tax === false ? this.object.explore : Math.round(this.object.explore * 1.5);
                ctx.fillStyle = mapMeta.points >= cost ? '#55ff55aa' : '#ff5555aa'; 
                ctx.textAlign = 'center';
                ctx.font = `bold ${size.y*0.3}px Segoe UI`;
                fillTextFast(pos.sumv(size.multxy(0.5, 0.9)), cost);
            }
        } else {
            ctx.fillStyle = this.object.color;
            fillRectFast(size, pos);
            //
            if(this.type != 'empty') {
                _mrthDrawedLogos++;
                this.object.completed ? ctx.globalAlpha = 0.4 : false;
                drawImageSized(mrthTypedLogos[this.type], pos.sumv(size.multxy(0.25)), size.multxy(0.5));
                ctx.globalAlpha = 1;
            };
        };
    };
    open(content='medium') {
        this.object = new mrthRectTypes[this.type].class(this.pos);
        this.object.collect(content);
        spartMrthLogos(this); // visuals
        this.opened = true
    }
    color() {
        return this.opened ? this.object.color : '#555555aa'
    }
};
//
function mrthNewRect(pos, type=mrthRectTypeRandom()) {
    var r = new mrthRect(pos, type);
    r.object.explore = mrthGetExploreCost(pos);
    mapMeta.explored++;
    return r
};
//
function mrthRectTypeRandom() {
    var rand = Math.ceil(Math.random() * (+mrthMeta.typesWeight-0.001));
    for(var r in mrthRectTypes) {
        if(rand > mrthRectTypes[r].weight[1]) {continue} else {
            if(rand < mrthRectTypes[r].weight[0]) {continue} else {
                return r
            }
        }
    };
    //
    // console.warn('error with marathon map rect randomizer!!!!!!');
    return 'empty'
};
//
function mapPosStringify(pos) {return `${pos.x},${pos.y}`};
function mapPosParse(str) {var values = str.split(','); return new Vector2(values[0], values[1])};
function mapRectCenter(rect) {return rect.pos.multxy(mrthMeta.rectSize+mrthMeta.rectSpacing).sumxy(mrthMeta.rectSize/2)};
//
function mapGetRect(pos) {
    var spos = mapPosStringify(pos);
    return spos in mapMeta.map ? mapMeta.map[spos] : null
};
function playerIsNeighbor(pos, diag=false) {
    // if too far - false
    if(Math.abs(mapMeta.pos.x - pos.x) > 1 || Math.abs(mapMeta.pos.y - pos.y) > 1) {return false};
    //
    if(mapMeta.pos.sumxy(0,-1).condAND(pos)) {return true};
    if(mapMeta.pos.sumxy(0,1).condAND(pos)) {return true};
    if(mapMeta.pos.sumxy(-1,0).condAND(pos)) {return true};
    if(mapMeta.pos.sumxy(1,0).condAND(pos)) {return true};
    if(diag) {
        if(mapMeta.pos.sumxy(1,-1).condAND(pos)) {return true};
        if(mapMeta.pos.sumxy(-1,-1).condAND(pos)) {return true};
        if(mapMeta.pos.sumxy(-1,1).condAND(pos)) {return true};
        if(mapMeta.pos.sumxy(1,1).condAND(pos)) {return true};
    }
};
function mapGetNeighbors(pos, diag=false) {
    var n = {};
    var count = 0;
    if(mapPosStringify(pos.minxy(1,0)) in mapMeta.map) {n['-1,0'] = mapMeta.map[mapPosStringify(pos.minxy(1,0))]; count++};
    if(mapPosStringify(pos.minxy(0,1)) in mapMeta.map) {n['0,-1'] = mapMeta.map[mapPosStringify(pos.minxy(0,1))]; count++};
    if(mapPosStringify(pos.minxy(-1,0)) in mapMeta.map) {n['1,0'] = mapMeta.map[mapPosStringify(pos.minxy(-1,0))]; count++};
    if(mapPosStringify(pos.minxy(0,-1)) in mapMeta.map) {n['0,1'] = mapMeta.map[mapPosStringify(pos.minxy(0,-1))]; count++};
    // diagonal
    if(diag) {
        if(mapPosStringify(pos.minxy(-1, -1)) in mapMeta.map) {n['-1,-1'] = mapMeta.map[mapPosStringify(pos.minxy(-1, -1))]; count++};
        if(mapPosStringify(pos.minxy(1, -1)) in mapMeta.map) {n['1,-1'] = mapMeta.map[mapPosStringify(pos.minxy(1, -1))]; count++};
        if(mapPosStringify(pos.minxy(1, 1)) in mapMeta.map) {n['1,1'] = mapMeta.map[mapPosStringify(pos.minxy(1, 1))]; count++};
        if(mapPosStringify(pos.minxy(-1, 1)) in mapMeta.map) {n['-1,1'] = mapMeta.map[mapPosStringify(pos.minxy(-1, 1))]; count++};
        //
        if(count >= 8) {return n}
    } else {
        if(count >= 4) {return n}
    };
    // fill empty slots
    if(n['-1,0'] === undefined) {n['-1,0'] = null};
    if(n['0,-1'] === undefined) {n['0,-1'] = null};
    if(n['1,0'] === undefined) {n['1,0'] = null};
    if(n['0,1'] === undefined) {n['0,1'] = null};
    if(diag) {
        if(n['-1,-1'] === undefined) {n['-1,-1'] = null};
        if(n['1,-1'] === undefined) {n['1,-1'] = null};
        if(n['1,1'] === undefined) {n['1,1'] = null};
        if(n['-1,1'] === undefined) {n['-1,1'] = null};
    };
    return n
};
//
function mapGenerateEmptyRects(pos, n, diag=false) {
    if(n['-1,0'] !== undefined)     {if(n['-1,0'] == null)  {mapMeta.map[mapPosStringify(pos.sumxy(-1, 0))] = mrthNewRect(pos.sumxy(-1, 0))}};
    if(n['0,-1'] !== undefined)     {if(n['0,-1'] == null)  {mapMeta.map[mapPosStringify(pos.sumxy(0, -1))] = mrthNewRect(pos.sumxy(0, -1))}};
    if(n['1,0'] !== undefined)      {if(n['1,0'] == null)   {mapMeta.map[mapPosStringify(pos.sumxy(1, 0))] = mrthNewRect(pos.sumxy(1, 0))}};
    if(n['0,1'] !== undefined)      {if(n['0,1'] == null)   {mapMeta.map[mapPosStringify(pos.sumxy(0, 1))] = mrthNewRect(pos.sumxy(0, 1))}};
    if(diag) {
        if(n['-1,-1'] !== undefined)    {if(n['-1,-1'] == null) {mapMeta.map[mapPosStringify(pos.sumxy(-1, -1))] = mrthNewRect(pos.sumxy(-1, -1))}};
        if(n['1,-1'] !== undefined)     {if(n['1,-1'] == null)  {mapMeta.map[mapPosStringify(pos.sumxy(1, -1))] = mrthNewRect(pos.sumxy(1, -1))}};
        if(n['1,1'] !== undefined)      {if(n['1,1'] == null)   {mapMeta.map[mapPosStringify(pos.sumxy(1, 1))] = mrthNewRect(pos.sumxy(1, 1))}};
        if(n['-1,1'] !== undefined)     {if(n['-1,1'] == null)  {mapMeta.map[mapPosStringify(pos.sumxy(-1, 1))] = mrthNewRect(pos.sumxy(-1, 1))}}
    }
};
function mapHaveEmptyRects(n, diag=false) {
    if(n['-1,0'] !== undefined)     {if(n['-1,0'] == null)  {return true}}
    if(n['0,-1'] !== undefined)     {if(n['0,-1'] == null)  {return true}}
    if(n['1,0'] !== undefined)      {if(n['1,0'] == null)   {return true}}
    if(n['0,1'] !== undefined)      {if(n['0,1'] == null)   {return true}}
    if(diag) {
        if(n['-1,-1'] !== undefined)    {if(n['-1,-1'] == null) {return true}}
        if(n['1,-1'] !== undefined)     {if(n['1,-1'] == null)  {return true}}
        if(n['1,1'] !== undefined)      {if(n['1,1'] == null)   {return true}}
        if(n['-1,1'] !== undefined)     {if(n['-1,1'] == null)  {return true}}
    };
    //
    return false
};
//
function mapMovePlayer(movement) {
    if(!mapMeta.cutscene && !mapMeta.watching) {
        var opens = false, news = false;
        // check exploration & pay
        var rect = mapGetRect(mapMeta.pos.sumv(movement));
        if(!rect.opened) {
            // using radar for exploration
            var radar = mrthGetItem('radar');
            if(radar !== false) {mrthReduceItem(radar)}
            else {
                // get tax item
                var tax = mrthGetItem('tax');
                var cost = tax === false ? rect.object.explore : Math.round(rect.object.explore * 1.5);
                if(cost > mapMeta.points) {return}
                else {mapMeta.points -= cost; mrthReduceItem(tax)}
            }
        };
        // move to new pos with ease
        mapMeta.pos = mapMeta.pos.sumv(movement);
        mapEaseScroll();
        // open closed rect & select
        if(!rect.opened) {
            rect.open();
            opens = true;
            mapMeta.selected = rect;
            if(rect.type != 'empty') {
                mapMeta.overlayState = 'main'; 
                mapOverlayMover(true);
                playSound(sound['opener'], 0.9 + 0.2*Math.random())
            } else {playSound(sound['steps'], 0.85 + 0.3*Math.random())}
        } else {playSound(sound['steps'], 0.85 + 0.3*Math.random())};
        // update neighbors & selected
        mapMeta.neighbors = mapGetNeighbors(mapMeta.pos);
        // generate null map rects
        if(mapHaveEmptyRects(mapMeta.neighbors)) {
            mapGenerateEmptyRects(mapMeta.pos, mapMeta.neighbors);
            mapMeta.neighbors = mapGetNeighbors(mapMeta.pos);
            news = true
        };
        // save the map if map been changed
        if(opens | news) {marathonSave()}
    }
};
//
function mapGetRadiusAval(radius) {
    var aval = [];
    for(let x = 0; x<=radius*2; x++) {
        // walls
        if(x == 0 || x == radius*2) {
            for(let y = 0; y<=radius*2; y++) {
                if(mapGetRect(mapMeta.pos.sumxy(x - radius, y - radius)) === null) {aval.push(mapMeta.pos.sumxy(x - radius, y - radius))}
            }
        } else {
            // floor & ceil
            if(mapGetRect(mapMeta.pos.sumxy(x - radius, -radius)) === null) {aval.push(mapMeta.pos.sumxy(x - radius, -radius))};
            if(mapGetRect(mapMeta.pos.sumxy(x - radius, radius)) === null) {aval.push(mapMeta.pos.sumxy(x - radius, radius))};
        }
    };
    return aval
};
function mapGetSpoilerRects(count) {
    var radius = 1; // start radius is 2 (+1 in while)
    var aval = [];
    while (aval.length < count) {
        radius++;
        aval = mapGetRadiusAval(radius);
    };
    // upgrade radius
    radius+=1; // dva kak budto slishkom dohuya Taante nihuya sebe
    // aval = mapGetRadiusAval(radius); nahuya eto voobshe))))
    // get random rects from list
    var rects = [];
    for(let i=0; i<count; i++) {
        var index = Math.floor(Math.random() * (aval.length-0.001));
        rects.push(aval[index]);
        aval.splice(index, 1);
    };
    return rects
};
//
function mapCutsceneUpdater() {
    if(mapMeta.cutscene) {
        if(mapMeta.cutstate == 'get') {
            // get next spoiler rect
            if(mapMeta.spoilers.length > 0) {
                mapMeta.cutstate = 'move';
            } else { // if no spoilers, end cutscene
                mapMeta.cutstate = 'end';
            }
        //
        } else if(mapMeta.cutstate == 'move') {
            mapEaseScroll(0.5, mapMeta.spoilers[0], true);
            mapMeta.cutstate = 'wait';
            setTimeout(() => {mapMeta.cutstate = 'reveal'}, 500);
        //
        } else if(mapMeta.cutstate == 'reveal') {
            var rect = mrthNewRect(mapMeta.spoilers[0], mapMeta.spoilers[0].type);
            rect.open(mapMeta.spoilers[0].content);
            mapMeta.map[mapPosStringify(mapMeta.spoilers[0])] = rect;
            //
            mapMeta.spoilers.splice(0, 1);
            mapMeta.cutstate = 'wait';
            setTimeout(() => {mapMeta.cutstate = 'get'}, 500);
        //
        } else if(mapMeta.cutstate == 'end') {
            mapEaseScroll(0.5, mapMeta.pos, true);
            mapMeta.cutstate = 'none';
            setTimeout(() => {mapMeta.cutscene = false; marathonSave()}, 500);
        }
    }
};
//
function mapGenerateSpoilers(count) {
    var c = count > 4 ? 4 : count; c = c < 1 ? 1 : c; // minmax [1;4]
    // hide overlay & enable cutscene
    mapOverlayMover(false);
    mapMeta.cutscene = true;
    // setup spoilers
    mapMeta.spoilers = mapGetSpoilerRects(c);
    for(var s in mapMeta.spoilers) {
        var rand = Math.random();
        var type = Math.random() > 0.6 ? 'medium' : 'easy'; // 40% chance of "easy" rect content type
        if(rand <= 0.16) {mapMeta.spoilers[s].type = 'anime'; mapMeta.spoilers[s].content = type}
        else if(rand >= 0.16 && rand < 0.32) {mapMeta.spoilers[s].type = 'mission'; mapMeta.spoilers[s].content = type}
        else if(rand >= 0.32 && rand < 0.48) {mapMeta.spoilers[s].type = 'treasure'; mapMeta.spoilers[s].content = type}
        else if(rand >= 0.48 && rand < 0.74) {mapMeta.spoilers[s].type = 'meeting'; mapMeta.spoilers[s].content = type}
        else {mapMeta.spoilers[s].type = 'quest'; mapMeta.spoilers[s].content = type};
    };
    // start cutscene
    setTimeout(() => {mapMeta.cutstate = 'get'}, 500);
};
function getSpoilerCount(watched, type) {
    if(watched >= 20) {return 3}
    else if(watched >= 11) {return 2}
    else if(watched >= 6 || (watched >= 1 && type == 'MOVIE')) {return 1}
    else return 0
};
//
function mapHaveUnusedRect(type) {
    for(var i in mapMeta.map) {
        if(i == '0,0') {continue};
        if(mapMeta.map[i].type == type && mapMeta.map[i].opened) {
            if(!mapMeta.map[i].object.completed) {return true}
        }
    };
    return false
};
function mapGenerateAvalaibleRect(type, open=true, content='medium') {
    for(var i in mapMeta.map) {
        if(i == '0,0') {continue};
        if(mapMeta.map[i].type == 'empty') {
            mapMeta.map[i] = mrthNewRect(mapMeta.map[i].pos, type);
            open ? mapMeta.map[i].open(content) : false;
            marathonSave(); // save, because map been changed
            return mapMeta.map[i].pos;
        }
    };
    console.error(`cannot generate avalaible "${type}" type rect - not found at least one generated empty rect`);
    return false
};
function mapCheckAvalaibleAnimes() {
    if(!mapHaveUnusedRect('anime')) {
        var pos = mapGenerateAvalaibleRect('anime', true);
        if(pos !== false) {mapEaseScroll(0.5, pos)}
    }
};
//
// @EAG MARATHON MISC
//
// @ TEST-NEED
//      
// @TODO
//
// @TEST-RES
//      
// @ИДЕИ
//      добавить возможность в Вопросах сделать ставку и мб увеличить её, при неправильном проебать (мб реализовать это тока на хороших клетках вопросов)
//      идея для геймплея - разбросать по карте пазлики и заставить их собирать (чтобы взять пазлик нужно отдать монеты/предмет/эффект)
//      сделать экспортер всей истории просмотров
//      придумать 1-2 негативных предмета, ухудшающих значения пермачей сразу, или в каком-то случае
//      перм переменная - удача. Например, эсли удача 10%, то хороших предметов в рулетке будет на 10% больше
//      клетка с интерактивом
//      клетка с аниме списками
//      а нужно ли давать возможность удалять предметы из инвентаря ????
//      клетки-стены, которые нельзя пересечь без некоторых предметов
//      предметы взаимодействия с картой, по типу "телепортации", "исследования 24 соседних клеток",
//      размещаемые предметы/объекты на пустых клетках
//      клеточные структуры
//
let mapCurrentLocationLogo = invokeNewImage('images/location.png');
//
mapMeta.map = { // set default starter map
    '0,0': mrthNewRect(new Vector2(0, 0), 'empty'),
    '0,1': mrthNewRect(new Vector2(0, 1), 'anime'),
    '0,-1': mrthNewRect(new Vector2(0, -1), 'treasure'),
};
// open start rect, open easy anime rect, add intro flag & save all as default
mapMeta.map['0,0'].open(); mapMeta.map['0,1'].open('easy');
mapMeta.map['0,0'].object.intro = true;
let mapMetaDefault = JSON.stringify(marathonSave(true));
mrthMeta.visuals = 'full'; // add visuals after setup default map
// save & load functions
function marathonSave(copied=false) {
    var copy = mapMeta;
    // compress map objects
    for(var r in copy.map) {
        copy.map[r].object._datatype_ = copy.map[r].object.constructor.name;
    };
    // compress meta objects
    for(var key in copy) {
        if(typeof copy[key] != `object`) {continue};
        if(copy[key] instanceof Vector2) {copy[key]._datatype_ = copy[key].constructor.name};
        if(copy[key] instanceof Vector1) {copy[key]._datatype_ = copy[key].constructor.name};
    };
    //
    if(copied) {return copy} 
    else {lsSaveObject('marathonMap', copy)}
};
function marathonLoad(from=false) {
    var copy = from === false ? lsLoadObject('marathonMap', false) : from;
    if(copy !== false) {
        // decompress map
        for(var r in copy.map) {
            var values = copy.map[r];
            copy.map[r] = new mrthRect(new Vector2(values.pos.x, values.pos.y), values.type);
            copy.map[r].opened = values.opened;
            //
            if(values.object._datatype_ !== undefined) {copy.map[r].opened = values.opened} // eto kal ebanyy, po susi udalenie objecta
            else {continue};
            //
            if(values.object._datatype_ != `Object`) {
                var clas = eval(values.object._datatype_);
                // console.log(clas);
                var obj = new clas(new Vector2());
                for(var key in values.object) {
                    obj[key] = values.object[key]
                };
                obj.pos = new Vector2(values.object.pos.x, values.object.pos.y);
                delete obj._datatype_;
                copy.map[r].object = obj;
            } else {
                // if object is not classed
                var obj = {};
                for(var key in values.object) {
                    obj[key] = values.object[key]
                };
                copy.map[r].object = obj;
            }
        };
        // decomress meta
        for(var r in copy) {
            // special load for only objects + skip null's, undefined's & already collected map
            if(typeof copy[r] != `object`) {continue};
            if(copy[r] === null || copy[r] === undefined || r == 'map') {continue};
            if(copy[r]._datatype_ == `Vector1`) {copy[r] = new Vector1(copy[r].value)};
            if(copy[r]._datatype_ == `Vector2`) {copy[r] = new Vector2(copy[r].x, copy[r].y)};
        };
        // resets the overlay && selected contains random rect object class !!!
        copy.selected = null;
        copy.overlay = false;
        copy.overlayOffset = new Vector1(-600);
        // disable the cutscene & load
        copy.cutscene = false;
        mapMeta = copy
    };
};
// try to load saved map meta
marathonLoad();
// update daily mission
missionDaily();
// if not started - set date
if(!mapMeta.started) {mapMeta.started = true; mapMeta.startedAt = (new Date()).toLocaleDateString()};
//
function marathonEnd() {
    if(activeScreen == screenMarathonMap) {
        fileManager.downloadJSON('ayaya_marathon', marathonSave(true));
        requestScreen(screenRoulette, false);
        setTimeout(() => {
            marathonLoad(JSON.parse(mapMetaDefault));
            marathonSave();
        }, tss.fulltime * 1100);
    }
};
function marathonDeleteForce(backscreen=true) {
    if(backscreen) {requestScreen(screenRoulette, false)};
    setTimeout(() => {
        marathonLoad(JSON.parse(mapMetaDefault));
        marathonSave();
    }, tss.fulltime * 1100);
};
//
function mapEaseScroll(time=0.25, rectpos=mapMeta.pos, cuts=false) {
    mapMeta.cutscene = true;
    //
    var zoom = mapMeta.zoom.get();
    var pos = rectpos.multxy(-(mrthMeta.rectSpacing + mrthMeta.rectSize) * zoom); // player pos on map
    pos = pos.minxy((mrthMeta.rectSize/2) * zoom).sumv(fullsize.dividexy(2)); // pos on screen
    // invoke animation
    mapMeta.scroll.movev(pos, time, easeOutCirc);
    //
    if(!cuts) {setTimeout(() => {mapMeta.cutscene = false}, time*1100)}
};
//
function showScreenMarathon() {
    // request screen cutscene & skip animation if cutscene
    requestScreen(screenMarathonMap, true);
    if(mapMeta.cutscene) {return};
    // check map, fill empty neighbor rects, select player rect
    mapMeta.neighbors = mapGetNeighbors(mapMeta.pos);
    if(mapHaveEmptyRects(mapMeta.neighbors)) {mapGenerateEmptyRects(mapMeta.pos, mapMeta.neighbors)};
    // show animation
    var pos = mapMeta.pos.multxy(-(mrthMeta.rectSpacing + mrthMeta.rectSize)); // player pos on map
    pos = pos.minxy((mrthMeta.rectSize/2)).sumv(fullsize.dividexy(2)); // pos on screen
    setTimeout(() => {
        // invoke animation after screen switch
        mapMeta.scroll.reset();
        mapMeta.scroll.setv(pos.sumv(fullsize));
        mapEaseScroll(1);
        // invoke rect select, if watching anime
        if(mapMeta.watching) {
            mapMeta.cutscene = true;
            setTimeout(() => {mapSelectRect(mapGetRect(mapMeta.pos)); mapMeta.cutscene = false}, 1100);
        }
    }, (tss.fulltime/2) * 950)
};
//
let _mapOverlayHider = -1;
function mapOverlayMover(true_for_show) {
    clearTimeout(_mapOverlayHider);
    if(true_for_show) {
        if(mapMeta.overlayOffset.getFixed() < 0) {
            mapMeta.overlay = true;
            mapMeta.overlayOffset.move(0, 0.5, easeOutCirc)
        }
    } else {
        if(mapMeta.overlayOffset.getFixed() >= 0) {
            mapMeta.overlayOffset.move(-mapMeta.overlaySizing.x, 0.5, easeOutCirc);
            setTimeout(() => {
                mapMeta.overlayState = 'main';
                mapMeta.selected = null;
                mapMeta.overlay = false
            }, 500);
        }
    }
};
function mapSelectRect(rect) {
    if(mapMeta.selected != rect) {
        // enable main state
        mapMeta.overlayState = 'main';
        // move
        var zoom = mapMeta.zoom.get();
        var p = rect.pos.multxy(-(mrthMeta.rectSpacing + mrthMeta.rectSize) * zoom); // player pos on map
        p = p.minxy((mrthMeta.rectSize/2) * zoom).sumv(fullsize.dividexy(2)); // pos on screen
        mapMeta.scroll.movev(p, 0.25, easeOutCirc);
        // set selected
        mapMeta.selected = rect;
        playSound(sound['insp'], 0.8 + 0.4*Math.random())
        mapOverlayMover(true)
    }
};
//
function drawStatsBadge(pos, unit, badge, value, back, fore) {
    // font work
    scaleFont((unit/_scaleDynamic)/2, 'Segoe UI', 'bold');
    var textwidth = getTextMetrics(value).x;
    var bsize = new Vector2(textwidth > unit/2 ? textwidth + unit*1.5 : unit*1.75, unit * 0.75);
    // bg
    fillRectRounded(bsize.minxy(unit/2, 0), pos.minxy(bsize.x, -unit*0.125), back, unit * 0.35);
    // text
    ctx.fillStyle = fore; ctx.textAlign = 'start';
    fillTextFast(pos.sumxy(-bsize.x+unit*0.3, unit*0.7), value);
    // badge
    drawImageSized(badge, pos.minxy(unit, 0), new Vector2(unit));
    return bsize.x + unit/4;
};
function drawMarathonHeader() {
    var h = mapMeta.overlaySizing.y *  _scaleDynamic;
    var unit = h * 0.8;
    // badges
    var pointer = new Vector2(fullsize.x - h*0.1, h*0.1);
    pointer.x -= drawStatsBadge(pointer, unit, imageMarathonLogo, mapMeta.total, '#4444ff66', '#ccccff');
    pointer.x -= drawStatsBadge(pointer, unit, mrthBadgeWatched, mapMeta.episodes, '#44ff4466', '#ccffcc');
    pointer.x -= drawStatsBadge(pointer, unit, mrthBadgeCoins, mapMeta.points, '#ffff4466', '#ffffcc');
    // buttons
    pointer.setxy((fullsize.x - musicLite.size.x)/4 - (2.5*unit + h*0.2), h*0.1); // draw to center of free space of header from left to musicLite
    buttonInspectorBack.pos.setv(pointer); pointer.x += unit + h*0.1;
    buttonInspectorMain.pos.setv(pointer); pointer.x += unit + h*0.1;
    buttonInspectorInventory.pos.setv(pointer); pointer.x += unit + h*0.1;
    buttonInspectorStats.pos.setv(pointer); pointer.x += unit + h*0.1;
    buttonInspectorPref.pos.setv(pointer);
    var bsize = new Vector2(unit);
    buttonInspectorBack.sizedZoom(bsize); buttonInspectorBack.draw();
    buttonInspectorMain.sizedZoom(bsize); buttonInspectorMain.draw();
    buttonInspectorInventory.sizedZoom(bsize); buttonInspectorInventory.draw();
    buttonInspectorStats.sizedZoom(bsize); buttonInspectorStats.draw();
    buttonInspectorPref.sizedZoom(bsize); buttonInspectorPref.draw();
};
// inpector head buttons
let marathonInventoryLogo = invokeNewImage(`images/inventory.png`);
let marathonStatsLogo = invokeNewImage(`images/stats.png`);
//
let buttonInspectorBack = new ImageButtonShaped(shapeRectRounded, filterImageBackward, new Vector2(4),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(63,63,255,0.3)#rgba(63,63,255,1)#rgba(0,0,0,0)`));
let buttonInspectorMain = new ImageButtonShaped(shapeRectRounded, filterImageArrays, new Vector2(4),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(63,63,255,0.3)#rgba(63,63,255,1)#rgba(0,0,0,0)`));
let buttonInspectorInventory = new ImageButtonShaped(shapeRectRounded, marathonInventoryLogo, new Vector2(4),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(63,63,255,0.3)#rgba(63,63,255,1)#rgba(0,0,0,0)`));
let buttonInspectorStats = new ImageButtonShaped(shapeRectRounded, marathonStatsLogo, new Vector2(4),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(63,63,255,0.3)#rgba(63,63,255,1)#rgba(0,0,0,0)`));
let buttonInspectorPref = new ImageButtonShaped(shapeRectRounded, imagePrefMenu, new Vector2(4),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(63,63,255,0.3)#rgba(63,63,255,1)#rgba(0,0,0,0)`));
buttonInspectorBack.waitanim = false;       buttonInspectorBack.height = 4;
buttonInspectorMain.waitanim = false;       buttonInspectorMain.height = 4;
buttonInspectorInventory.waitanim = false;  buttonInspectorInventory.height = 4;
buttonInspectorStats.waitanim = false;      buttonInspectorStats.height = 4;
buttonInspectorPref.waitanim = false;       buttonInspectorPref.height = 4;
//
buttonInspectorBack.onclick = () => {requestScreen(screenRoulette, false); playSound(sound['player']);};
buttonInspectorMain.onclick = () => {
    if(!mapMeta.cutscene) {
        mrthMeta.scroll.set(0);
        if(mapMeta.selected == null) {mapSelectRect(mapGetRect(mapMeta.pos)); playSound(sound['button'])} 
        else {mapSelectRect(mapMeta.selected)};
        if(mapMeta.overlayState != 'main') {playSound(sound['button'])};
        mapMeta.overlayState = 'main'
    }
};
buttonInspectorInventory.onclick = () => {
    if(!mapMeta.cutscene) {
        mrthMeta.scroll.set(0);
        if(mapMeta.overlayState != 'inv') {
            playSound(sound['button']);
            if(!mapMeta.overlay) {mapOverlayMover(true)};
            mapMeta.overlayState = 'inv'
        }
    }
};
buttonInspectorPref.onclick = () => {
    if(!mapMeta.cutscene) {
        mrthMeta.scroll.set(0);
        if(mapMeta.overlayState != 'pref') {
            playSound(sound['button']);
            if(!mapMeta.overlay) {mapOverlayMover(true)};
            mapMeta.overlayState = 'pref'
        }
    }
};
buttonInspectorStats.onclick = () => {
    if(!mapMeta.cutscene) {
        mrthMeta.scroll.set(0);
        if(mapMeta.overlayState != 'stats') {
            playSound(sound['button']);
            if(!mapMeta.overlay) {mapOverlayMover(true)};
            mapMeta.overlayState = 'stats';
            // collect watched anime data
            marcsWatched();
        }
    }
};
// pref buttons
let buttonMrthDownloadBackup = new TextButtonShaped(shapeRectRounded, txtMrth('prefJSONdown'), new Vector2(),
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(128,128,32,1)#rgba(180,180,48,1)#rgba(255,255,64,1)#rgba(200,200,47,0.1)`));
let buttonMrthUploadBackup = new TextButtonShaped(shapeRectRounded, txtMrth('prefJSONup'), new Vector2(),
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(128,128,32,1)#rgba(180,180,48,1)#rgba(255,255,64,1)#rgba(200,200,47,0.1)`));
buttonMrthDownloadBackup.waitanim = false; buttonMrthUploadBackup.waitanim = false;
buttonMrthDownloadBackup.height = 0; buttonMrthUploadBackup.height = 0;
//
buttonMrthDownloadBackup.onclick = () => {
    fileManager.downloadJSON('marathon_backup', marathonSave(true));
    playSound(sound['button']);
};
buttonMrthUploadBackup.onclick = () => {
    playSound(sound['button']);
    fileManager.uploadJSON();
    fileManager.onupload = () => {
        var file = JSON.parse(JSON.stringify(fileManager.result));
        // check some values
        if(file.map === undefined) {return};
        if(file.map['0,0'] === undefined) {return};
        // load from file
        requestScreen(screenRoulette, false);
        buttonOpenMarathon.state = 'unaval';
        setTimeout(() => {
            marathonLoad(file);
            buttonOpenMarathon.state = 'idle';
        }, tss.fulltime * 2000);
    }
};
//
let buttonMrthResetAll = new ShapedHoldButton(shapeRectRounded, new Vector2(),
    colorMapMatrix(`rgba(128,32,32,1)#rgba(180,48,48,1)#rgba(255,64,64,1)#rgba(200,200,47,0.1)`));
buttonMrthResetAll.needshadow = false; buttonMrthResetAll.height = 0;
buttonMrthResetAll.onact = () => {marathonDeleteForce(); setTimeout(() => {buttonMrthResetAll.unblock()}, 5000)};
//
function getAllWatchedAnime() {
    var all = [];
    for(var a in mapMeta.map) {
        if(mapMeta.map[a].type == 'anime') {
            var h = mapMeta.map[a].object.history;
            if(h.length > 0) {
                for(var a in h) {
                     console.log(`%c${h[a].n}`, "color: #aaf; font-style: bold; background-color: black; padding: 2px",);
                    console.log(h[a].p);
                    console.log(h[a].y);
                    console.log(`Отзыв: ${h[a].r}`);
                }
                all = all.concat(h)
            }
        }
    };
    return all
}
// statistics
let mrthStats = {
    // watch finder
    watched: [],
};
function marcsWatched() {
    mrthStats.watched = [];
    // collect
    for(var m in mapMeta.map) {
        if(mapMeta.map[m].type == 'anime' && mapMeta.map[m].opened) {
            if(mapMeta.map[m].object.history.length > 0) {
                mrthStats.watched = mrthStats.watched.concat(mapMeta.map[m].object.history)
            }
        }
    };
    // sort by index
    mrthStats.watched.sort((a,b) => {return a.index - b.index})
};
//
// @EAG SCREEN MARATHON
//
let _mrthAllRects = 0;
let _mrthDrawedRects = 0;
let _mrthDrawedLogos = 0;
let _mrthDrawedHistory = 0;
//
function screenMarathonMap() {
    // update & bg
    mapMeta.scroll.update();
    mapMeta.zoom.update();
    srv.hideProgress.update(); // update this for show delayed musicBar.show task
    ctx.fillStyle = `rgba(0,0,15,${pref.bgalpha})`;
    fillRectFast(fullsize, new Vector2());
    // scaling
    var zoom = mapMeta.zoom.get();
    var rectSpacing = new Vector2((mrthMeta.rectSpacing + mrthMeta.rectSize) * zoom);
    var rectSize = new Vector2(mrthMeta.rectSize * zoom);
    var spacing = mrthMeta.spacing * _scaleDynamic;
    var player = mapMeta.playerSize.multxy(_scaleDynamic * zoom);
    // overlay style values
    mapMeta.overlayOffset.update();
    mrthMeta.scroll.update();
    var anchor = mapMeta.overlaySizing.sumxy(mapMeta.overlayOffset.get(), 0).multxy(_scaleDynamic);
    var offset = mapMeta.overlayOffset.get() * _scaleDynamic;
    // cutscene worker & blocker
    mapCutsceneUpdater();
    var zoomed = false;
    if(!mapMeta.cutscene &&  mouse.pos.overAND(anchor)) {
        // scroll by touch (напрямую захуячил шобы другие анимации не прерывать Taalk)
        if(mouse.press) {
            mapMeta.scroll.x += mouse.delta.x;
            mapMeta.scroll.y += mouse.delta.y;
        }
        // zoom by wheel
        if(mapMeta.zoom.getFixed() >  mapMeta.zoomRange[0] && wheelState == 'btm') {
            mapMeta.zoom.move(mapMeta.zoom.getFixed() - mapMeta.zoomStep, 0.25, easeOutCirc);
            zoomed = true
        };
        if(mapMeta.zoom.getFixed() <  mapMeta.zoomRange[1] && wheelState == 'top') {
            mapMeta.zoom.move(mapMeta.zoom.getFixed() + mapMeta.zoomStep, 0.25, easeOutCirc);
            zoomed = true
        }
    };
    // post zoom align
    if(zoomed) {
        zoomed = false;
        var zf = mapMeta.zoom.getFixed();
        var pos = mapMeta.selected == null ? mapMeta.pos : mapMeta.selected.pos; // selected or player position
        pos = pos.multxy(-(mrthMeta.rectSpacing + mrthMeta.rectSize) * zf); // pos on map
        pos = pos.minxy((mrthMeta.rectSize/2) * zf).sumv(fullsize.dividexy(2)); // pos on screen
        // invoke animation
        mapMeta.scroll.movev(pos, 0.25, easeOutCirc);
    };
    var scroll = mapMeta.scroll.get().sumv(anchor.multxy(0.5, 1));
    // draw all map
    _mrthDrawedRects = 0;
    _mrthDrawedLogos = 0;
    _mrthAllRects = 0;
    for(var i in mapMeta.map) {
        _mrthAllRects++;
        // relative
        var pos = mapMeta.map[i].pos.multv(rectSpacing).sumv(scroll); // pos on screen
        var selected = mapMeta.selected == null ? false : mapMeta.map[i].pos.condAND(mapMeta.selected.pos); // false if no select OR if not selected
        // if player standing
        if(mapMeta.map[i].pos.condAND(mapMeta.pos)) {
            mapMeta.player = pos.sumxy(rectSize.x/2 - player.x/2, rectSize.y/2 - player.y);
            mapMeta.player.x = mapMeta.player.x > fullsize.x - player.x ? fullsize.x - player.x : mapMeta.player.x < anchor.x ? anchor.x : mapMeta.player.x;
            mapMeta.player.y = mapMeta.player.y > fullsize.y - player.y ? fullsize.y - player.y : mapMeta.player.y < anchor.y ? anchor.y : mapMeta.player.y;
        };
        // if rect in window
        if(pos.overAND(rectSize.multxy(-1)) && pos.lessAND(fullsize)) {
            _mrthDrawedRects++;
            // if mouse on map
            if(mouse.pos.overAND(anchor) && !mapMeta.cutscene) {
                // if hovered
                if(mouse.pos.overAND(pos) && mouse.pos.lessAND(pos.sumv(rectSize))) {
                    if(mapMeta.map[i].opened) {
                        if(!selected) {
                            ctx.fillStyle = `#ffffff33`;
                            fillRectFast(rectSpacing, pos.minxy(mrthMeta.rectSpacing * zoom / 2));
                        };
                        // if click
                        if(mouse.click) {
                            mouse.click = false;
                            mapSelectRect(mapMeta.map[i])
                        }
                    }
                };
            };
            // if selected
            if(selected) {
                ctx.fillStyle = mapMeta.map[i].color();
                fillRectFast(rectSpacing, pos.minxy(mrthMeta.rectSpacing * zoom / 2));
            };
            // draw rect
            mapMeta.map[i].draw(scroll, rectSize, rectSpacing);
            // draw spawn
            if(mapMeta.map[i].pos.condAND(new Vector2())) {
                drawImageSized(imagesPrefTabs.about, pos.sumv(rectSize.dividexy(4)), rectSize.dividexy(2))
            };
        }
    };
    // visuals
    visual.mrthLayer(scroll, zoom, zoom);
    // player
    mapMeta.player.update();
    drawImageSized(mapCurrentLocationLogo, mapMeta.player, player);
    // overlay background
    ctx.fillStyle = `#000016bb`;
    fillRectFast(new Vector2(fullsize.x, anchor.y), new Vector2()); // overlay header
    // draw debug
    ctx.fillStyle = '#ffffffaa'; ctx.textAlign = 'start'; scaleFont(14, 'Consolas');
    fillTextFast(anchor.sumxy(5, 15), `A ${_mrthAllRects} DR ${_mrthDrawedRects} DL ${_mrthDrawedLogos}`);
    fillTextFast(anchor.sumxy(5, 30), `P ${visual.counters.mrth}/${visual.mrth.length}`);
    // inspector draw
    if(mapMeta.overlay) {
        clipCanvas(new Vector2(anchor.x, fullsize.x-anchor.y), new Vector2(0, anchor.y));
        // inspector bg
        ctx.fillStyle = `#000016bb`;
        fillRectFast(new Vector2(anchor.x, fullsize.x-anchor.y), new Vector2(0, anchor.y));
        var width = mapMeta.overlaySizing.x * _scaleDynamic - spacing*2;
        // if mouse in inspector
        if(mouse.pos.y > anchor.y && mouse.pos.x < anchor.x) {
            mrthMeta.height = Math.ceil(mrthMeta.height);
            var sensivity = mrthMeta.sensivity * _scaleDynamic;
            // scrolling
            if(fullsize.y - anchor.y >= mrthMeta.height) {mrthMeta.scroll.set(0)}
            else {
                if(mrthMeta.scroll.getFixed() < mrthMeta.height - (fullsize.y - anchor.y) && wheelState === 'btm') {
                    mrthMeta.scroll.move(Math.floor(mrthMeta.scroll.getFixed())+sensivity, 0.5, easeOutExpo)}
                else if(mrthMeta.scroll.getFixed() > 0 && wheelState === 'top') {
                    mrthMeta.scroll.move(Math.floor(mrthMeta.scroll.getFixed())-sensivity, 0.5, easeOutExpo)};
                if(mrthMeta.scroll.get() < 0) {mrthMeta.scroll.set(0)};
                if(mrthMeta.scroll.get() > mrthMeta.height - (fullsize.y - anchor.y)) {mrthMeta.scroll.set(mrthMeta.height - (fullsize.y - anchor.y))}
            }
        };
        // inspector positioning with scroll
        var inspPos = new Vector2(spacing + offset, anchor.y + spacing*2 - mrthMeta.scroll.get());
        mrthMeta.height = mrthMeta.scroll.get();
        if(mapMeta.overlayState == 'main') {
            // inspector main
            mapMeta.selected.object.update();
            mrthMeta.height += mapMeta.selected.object.inspector(inspPos, width, spacing)
        //
        } else if(mapMeta.overlayState == 'inv') {
            // items header
            inspDefHeader(inspPos, width, spacing, txtMrth('charItems'));
            var statpos = inspPos.sumxy(0, spacing*2);
            // draw positive
            scaleFont(16, 'Segoe UI'); 
            for(var i in mapMeta.inventory) {
                statpos = inspInventorySlot(statpos, width, spacing, mapMeta.inventory[i])
            };
            // negative header
            ctx.fillStyle = '#ffffff';
            inspDefHeader(statpos.sumxy(0, spacing*2), width, spacing, txtMrth('charNegs'));
            statpos = statpos.sumxy(0, spacing*4);
            // negatives
            scaleFont(16, 'Segoe UI'); 
            for(var i in mapMeta.effects) {
                statpos = inspInventorySlot(statpos, width, spacing, mapMeta.effects[i])
            };
            // missions
            missionProcessor(); // здесь, чтобы миссии обновлялись ток в этой вкладке
            ctx.fillStyle = '#ffffff';
            // daily
            inspDefHeader(statpos.sumxy(0, spacing*2), width, spacing, txtMrth('charMissionDaily'));
            statpos = statpos.sumxy(0, spacing*4);
            statpos = inspMissionsList(statpos, width, spacing, {'d': mapMeta.missions.daily});
            // picked
            inspDefHeader(statpos.sumxy(0, spacing*2), width, spacing, txtMrth('charMissions'));
            statpos = statpos.sumxy(0, spacing*4);
            statpos = inspMissionsList(statpos, width, spacing);
            // end
            mrthMeta.height += statpos.y + 150*_scaleDynamic; //for easy-to-read
        //
        } else if(mapMeta.overlayState == 'stats') {
            inspDefHeader(inspPos, width, spacing, txtMrth('charPerms'));
            var statpos = inspPos.sumxy(0, spacing*2);
            // multipliers
            statpos = inspDoubleStringCentered(statpos, width, spacing, 0.6, mrthStuff.perms['points'].name, floatNumber(mapMeta.permPoints, 2), defaultDSS.multPoints);
            statpos = inspDoubleStringCentered(statpos, width, spacing, 0.6, mrthStuff.perms['explore'].name, floatNumber(mapMeta.permExplore, 2), defaultDSS.multExplore);
            statpos = inspDoubleStringCentered(statpos, width, spacing, 0.6, mrthStuff.perms['series'].name, floatNumber(mapMeta.permSeries, 2), defaultDSS.multSeries);
            statpos = inspDoubleStringCentered(statpos, width, spacing, 0.6, mrthStuff.perms['quota'].name, floatNumber(mapMeta.permQuota, 1) + '%', defaultDSS.multExplore);
            // stats header
            inspDefHeader(statpos.sumxy(0, spacing*2), width, spacing, txtMrth('prefStats'));
            statpos = statpos.sumxy(0, spacing*4);
            // some stats
            statpos = inspDoubleStringCentered(statpos, width, spacing, 0.5, txtMrth('statsStartedAt'), mapMeta.startedAt, defaultDSS.multPoints); // yellow
            statpos = inspDoubleStringCentered(statpos, width, spacing, 0.57, txtMrth('statsDays'), mapMeta.days, defaultDSS.stats);
            statpos = inspDoubleStringCentered(statpos, width, spacing, 0.57, txtMrth('statsTotal'), mapMeta.total, defaultDSS.multSeries); // green
            statpos = inspDoubleStringCentered(statpos, width, spacing, 0.57, txtMrth('statsAnimes'), mapMeta.animes, defaultDSS.stats);
            statpos = inspDoubleStringCentered(statpos, width, spacing, 0.57, txtMrth('statsEpisodes'), mapMeta.episodes, defaultDSS.stats);
            statpos = inspDoubleStringCentered(statpos, width, spacing, 0.57, txtMrth('statsRerolls'), mapMeta.rerolls, defaultDSS.multExplore); // red
            statpos = inspDoubleStringCentered(statpos, width, spacing, 0.57, txtMrth('statsExplored'), mapMeta.explored, defaultDSS.stats);
            statpos = inspDoubleStringCentered(statpos, width, spacing, 0.57, txtMrth('statsMissions'), mapMeta.missCompleted, defaultDSS.stats);
            // history header
            inspDefHeader(statpos.sumxy(0, spacing*2), width, spacing, txtMrth('prefHistory'));
            statpos = statpos.sumxy(0, spacing*4);
            fillRect(new Vector2(width, 3*_scaleDynamic), statpos, '#ffffff');
            statpos = statpos.sumxy(0, spacing/2 + 3*_scaleDynamic);
            // view history
            _mrthDrawedHistory = 0;
            for(var an in mrthStats.watched) {
                if(statpos.y > fullsize.y) {break}
                else {
                    var draw = !(statpos.y + fullsize.y/2 < 0);
                    draw ? _mrthDrawedHistory++ : false;
                    statpos = inspAnimeWatched(statpos, width, spacing, mrthStats.watched[an], draw)
                }
            };
            mrthMeta.height += statpos.y + 150*_scaleDynamic; // for easy-to-read
        //
        } else if(mapMeta.overlayState == 'pref') {
            inspDefHeader(inspPos, width, spacing, txtMrth('prefHead'));
            var statpos = inspPos.sumxy(0, spacing*3);
            // json backups
            ctx.fillStyle = '#ffffff'; scaleFont(16, 'Segoe UI');
            statpos = inspSingleString(statpos, width, spacing, txtMrth('prefJSONsave'), 16);
            statpos = inspWideButton(statpos, width, spacing, buttonMrthDownloadBackup);
            statpos = inspWideButton(statpos, width, spacing, buttonMrthUploadBackup);
            // saves disclaimer
            scaleFont(14, 'Segoe UI');  ctx.textAlign = 'center'; ctx.fillStyle = '#ffaaaa';
            statpos = inspTextBlock(statpos, width, spacing, txtMrth('prefSaveDisc'), 3, 12);
            // delete all button
            inspDefHeader(statpos.sumxy(0, spacing*2), width, spacing, txtMrth('prefReset'));
            statpos = statpos.sumxy(0, spacing*4);
            statpos = inspWideButton(statpos, width, spacing, buttonMrthResetAll);
            scaleFont(14, 'Segoe UI'); ctx.fillStyle = '#ffaaaa';
            statpos = inspTextBlock(statpos, width, spacing, txtMrth('prefResetDisc'), 3, 12);

            //
            mrthMeta.height += statpos.y;
        }; 
        clipRestore()
    };
    // badges && controls
    drawMarathonHeader();
    // music
    musicLite.draw();
};
//
// @EAG STUFF PREFERENCES
//
const prefButtonSpacing = 5;
const prefButtonHeight = 32;
const prefLangButtons = new Vector2(40, 30);
const prefBarHeight = 16;
const prefOptionWidth = 250;
// base
const imagePrefApply = invokeNewImage('images/apply.png');
const imagePrefDefault = invokeNewImage('images/recycle.png');
const imageAyayaConfused = invokeNewImage('images/confused.png');
// tabs
const imagesPrefTabs = {
    main: invokeNewImage('images/pref_main.png'),
    audio: invokeNewImage('images/pref_audio.png'),
    draw: invokeNewImage('images/pref_draw.png'),
    other: invokeNewImage('images/pref_other.png'),
    about: invokeNewImage('images/pref_about.png'),
};
const prefTabsColors = {
    main: new Color(250,201,25,1),
    audio: new Color(30,30,200,1),
    draw: new Color(200,30,200,1),
    other: new Color(200,30,30,1),
    about: new Color(220,220,220,1),
};
// header buttons
let buttonPrefApply = new ImageButtonShaped(shapeRectRounded, imagePrefApply, new Vector2(prefButtonSpacing), 
    colorMapMatrix(`rgba(24,110,24,0)#rgba(40,160,40,0.35)#rgba(63,255,63,1)#rgba(47,200,47,0.8)`));
buttonPrefApply.onclick = () => {requestScreen(screenRoulette, false); playSound(sound['player'])};
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
    playSound(sound['button'])
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
const prefLanguages = [
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
    // поскольку в визуале сейчас только аудио
    prefRenderVisual.active = pref.visual
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
    const s = [
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
    prefAudioClips.active = pref.playClip
};
// filter attempts
let buttonFilterAttempts = new ShapedSelectBar(prefButtonSizes[0], colorMatrix(prefBarPalette[0]), colorMatrix(prefBarPalette[1]));
buttonFilterAttempts.onset = (value) => {var fa = Math.round(value); filterAttempts = fa; lsSaveValue('filterAttempts', fa); filterPrecount.request()};
buttonFilterAttempts.visAlias = true;
let buttonFilterAttTags = new TextButtonShaped(shapeRectRounded, '', new Vector2(prefOptionWidth/2, prefButtonHeight), colorMapMatrix(prefTextPalette), colorMapMatrix(prefSwitchPalette));
buttonFilterAttTags.isSwitcher = true; buttonFilterAttTags.needshadow = false; buttonFilterAttTags.height = 0;
buttonFilterAttTags.onclick = () => {filterAttemptTags = true; lsSaveValue('filterAttemptTags', true); filterPrecount.request(); spartTopClicks(particleImages.apply)};
buttonFilterAttTags.ondeact = () => {filterAttemptTags = false; lsSaveValue('filterAttemptTags', false); filterPrecount.request(); spartTopClicks(particleImages.remove)};
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
        spref.height += sbTextFit(txt('eagAbout'), new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get(), 18);
        spref.height += sbTextFit(txt('eagBased'), new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get(), 18);
        // о датабазе
        spref.height += spacing*2;
        scaleFont(32, 'Segoe UI', 'bold');
        spref.height += sbTextHeader(txt('wordDatabase'), new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        scaleFont(18, 'Segoe UI Light');
        spref.height += sbTitleObject(_preftitles.adb, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += sbTitleObject(_preftitles.adb_author, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += sbTitleObject(_preftitles.adb_version, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += sbTitleObject(_preftitles.adb_license, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
        spref.height += sbTitleObject(_preftitles.adb_length, new Vector2(spref.xanchor+spacing, spref.height), spref.width, spacing, spref.scroll.get());
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
    if(tss.state == 'end') {
        tss.screen = screen;
        open ? tss.state = 'openhide' : tss.state = 'closehide'
    }
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
            // particles
            if(rollWinner.blink.isMoving()) {
                spartWinnerDrop(normalAlign(new Vector2(0.25 + 0.5 * rollWinner.blink.get(), 0.45)), 1, 3);
            };
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
                // spartWinnerDrop(normalAlign(new Vector2(0.5, 0.45)), 90);
                rollWinner.text.getColor = rollWinner.effect;
                rollWinner.effvec.move(1, rollWinner.waiter, easeInOutSine);
                rollWinner.blink.move(1, 1);
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
                    rollBar.rollStarted = false;
                    rollWinner.state = 'none'
                }, 1100)
            }
        }
    },
};
//
// @EAG WALLPAPER IMAGE
//
let wallpaper = new Image();
const wallpaperbase = [
    'kyxbor3aw5hud3ek7xpik/1.jpg?rlkey=1s9dvj533143jago8lt5hymlh',      // пять невест
    'q34euwi9ktfz0mnl4a2oe/2.jpg?rlkey=u79lsps7ty61xmkzzfgtp3boa',      // повар боец сома
    'r0uom6cjam85700csbi7d/3.jpg?rlkey=cf65zhme2wtc78f4dp5u5bs1k',      // дракон горничная
    'v95fp9b4bn5zfxhiuz1bk/4.jpg?rlkey=thuhga2sdxfhqekn661c57jcv',      // школа дхд
    'c7d3bptxl0tvgost4kdwy/5.jpg?rlkey=khrz91dgwbxdttavz19tfre05',      // сакурасо
    'iwk9izyskxwpqa2tr1eg3/7.jpg?rlkey=mi7o08qfcl1nyza2rnf3hohz3',      // кейон
    'dfhht3gs1nho3p5c43sgi/9.jpg?rlkey=ntb79u0pkw7e2pls6gcq84tle',      // спай фемили
    '02oqjqer6yzujhdhn7iyd/10.jpg?rlkey=zcvohf7oltsc170vjfop3x8p6',     // вайолетт
    '0m6ff16ci2r2vob9pj4op/8.webp?rlkey=ulyyqggsib2iwiwqi0pco6ccd',     // речка самолётик
    '9dhc9s3cb161fz51supz6/9.webp?rlkey=8jgvodzg0jrjo4aq66ed6kl6y',     // babazaki
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
let wlpNatSize = new Vector2();
let clipNatSize = new Vector2();
let wlpsize = new Vector2();
let clipmsize = new Vector2();
let parallaxOffsW = new Vector2();
let parallaxOffsC = new Vector2();
const parallaxValue = 0.025;
//
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
    wlpNatSize.setxy(wallpaper.naturalWidth, wallpaper.naturalHeight);
    var ratio = wlpNatSize.x / wlpNatSize.y;
    ratio > fullsize.x/fullsize.y
        ? wlpsize.setxy(fullsize.y * ratio, fullsize.y)
        : wlpsize.setxy(fullsize.x, fullsize.x / ratio)
    //
    if(pref.playClip) {
        clipNatSize.setxy(clipmain.videoWidth, clipmain.videoHeight);
        ratio = clipNatSize.x / clipNatSize.y;
        ratio > fullsize.x/fullsize.y
        ? clipmsize.setxy(fullsize.y * ratio, fullsize.y)
        : clipmsize.setxy(fullsize.x, fullsize.x / ratio)
    };
    //
    if(pref.parallax) {
        wlpsize = wlpsize.multxy(1 + parallaxValue);
        parallaxOffsW = wlpsize.multxy(parallaxValue).multv(mouse.pos.minv(fullsize.dividexy(2)).dividev(fullsize));
        if(pref.playClip) {
            clipmsize = clipmsize.multxy(1 + parallaxValue);
            parallaxOffsC = clipmsize.multxy(parallaxValue).multv(mouse.pos.minv(fullsize.dividexy(2)).dividev(fullsize));
        }
    } else {
        parallaxOffsC.reset();
        parallaxOffsW.reset();
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
        ctx.globalAlpha = clipmainAlpha.get();
        drawImageSized(clipmain, fullAlign(new Vector2(0.5), clipmsize).sumv(parallaxOffsC), clipmsize);
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
    drawImageSized(wallpaper, fullAlign(new Vector2(0.5), wlpsize).sumv(parallaxOffsW), wlpsize);
    fillRect(fullsize, fullAlign(new Vector2(0.5), fullsize), '#0004');
    fillRect(fullsize, fullAlign(new Vector2(0.5), fullsize), `rgba(11,11,18,${_wphide.get()})`)
    setTimeout(() => {drawWallpaper = drawWallpaperNormal; _wphided=false}, 1200)
};
function drawWallpaperNormal() {
    updateWallSize();
    drawImageSized(wallpaper, fullAlign(new Vector2(0.5), wlpsize).sumv(parallaxOffsW), wlpsize);
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
    if(!pref.vsync) {
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
    }
};
function enabledVsyncRAF(vsync=true) {
    prefSetValue('vsync', vsync);
    eagrendering !== null ? clearInterval(eagrendering) : false;
    pref.vsync ? render() 
    : pref.lockfps ? lockFpsSwitch(pref.framerate) : lockFpsSwitch();
};
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
let _mem_limit = bytesStringify(performance.memory.jsHeapSizeLimit);
function developInfo() {
    if(pref.showDebugInfo) {
        //
        mouse.pos.x > fullsize.x/2
        ? devinfoValues.xanchor = devinfoValues.offset
        : devinfoValues.xanchor = fullsize.x - (devinfoValues.width + devinfoValues.offset);
        devinfoValues.text = devinfoValues.xanchor + devinfoValues.margin;
        //
        var total = bytesStringify(performance.memory.totalJSHeapSize);
        var usage = bytesStringify(performance.memory.usedJSHeapSize);
        var ftnorm = Math.norma(_ft / 16.6);
        // @RELEASE (убрать, если чет добавлял для себя)
        fillRectRounded(new Vector2(devinfoValues.width, devinfoValues.height), new Vector2(devinfoValues.xanchor, devinfoValues.offset), '#0029', devinfoValues.margin);
        fillText(new Vector2(devinfoValues.text, devinfoValues.texty(1)), 'FPS: '+FPS, '#fff', 'bold 16px Consolas');
        fillText(new Vector2(devinfoValues.text + devinfoValues.width*0.4, devinfoValues.texty(1)), 'frame: '+_ft+' ms', `rgba(${255*ftnorm}, ${255-255*ftnorm}, 0, 0.8)`, 'bold 12px Consolas');
        fillText(new Vector2(devinfoValues.text, devinfoValues.texty(2)), 'memLimit: '+_mem_limit, '#fcc', 'bold 12px Consolas');
        fillText(new Vector2(devinfoValues.text, devinfoValues.texty(3)), 'memUsage/Total: ' + usage + ' / ' + total, '#fcc', 'bold 12px Consolas');
        fillText(new Vector2(devinfoValues.text, devinfoValues.texty(4)), 'roulette: '+Math.floor(roulette.progress.get()*10)/10+'/'+(roulette.picsCount-1), '#ffc', 'bold 12px Consolas');
        fillText(new Vector2(devinfoValues.text, devinfoValues.texty(5)), 'full: '+Math.floor(fullsize.x)+'x'+Math.floor(fullsize.y) + ', cvs: '+Math.floor(cvssize.x)+'x'+Math.floor(cvssize.y), '#ccf', 'bold 12px Consolas');
        fillText(new Vector2(devinfoValues.text, devinfoValues.texty(6)), 'scale: '+floatNumber(_scaleDynamic, 2), '#cfc', 'bold 12px Consolas');
        fillText(new Vector2(devinfoValues.text, devinfoValues.texty(7)), 'session: '+bytesStringify(getSessionSize())+ ` (${floatNumber(getSessionSize()/sessionLimit*100, 1)}%)`, '#fc7', 'bold 12px Consolas');
        // хуй
        //
        graphFPS.draw(new Vector2(devinfoValues.xanchor, devinfoValues.texty(8)), 3, 0);
        if(pref.playClip) {
            // buffered ranges
            videoClipBuffered();
            ctx.fillStyle = '#0008';
            fillRectFast(new Vector2(devinfoValues.width, devinfoValues.spacing*(_clipmainBuffered.length+1)), new Vector2(devinfoValues.xanchor, devinfoValues.texty(8)+85));
            ctx.fillStyle = '#fffd'; ctx.textAlign = 'start';
            fillTextFast(new Vector2(devinfoValues.text, devinfoValues.texty(8)+85+devinfoValues.spacing), `videoClipBufferedRanges (${_clipmainBuffered.length})`);
            ctx.textAlign = 'end';
            var dur = String(clipmain.duration) != 'Infinity' ? clipmain.duration : 300;
            fillTextFast(new Vector2(devinfoValues.xanchor + devinfoValues.width, devinfoValues.texty(8)+85+devinfoValues.spacing), `${timeStringify(clipmain.currentTime)} - ${timeStringify(dur)}`);
            for(var r in _clipmainBuffered) {
                var w = (_clipmainBuffered[r][1] - _clipmainBuffered[r][0]) * devinfoValues.width;
                var x = _clipmainBuffered[r][0] * devinfoValues.width;
                ctx.fillStyle = `hsla(${Math.round(360*(r/_clipmainBuffered.length))} 80% 60% / 0.4)`;
                fillRectFast(new Vector2(w, devinfoValues.spacing), new Vector2(devinfoValues.xanchor + x, devinfoValues.texty(8)+85+devinfoValues.spacing*(Number(r)+1)))
            };
            ctx.fillStyle = '#fffa';
            var pos = (clipmain.currentTime/dur)*devinfoValues.width;
            fillRectFast(new Vector2(3, devinfoValues.spacing*_clipmainBuffered.length), new Vector2(devinfoValues.xanchor + pos, devinfoValues.texty(8)+85+devinfoValues.spacing))
        };
        ctx.textAlign = 'start';
        // mouse pos
        fillRect(new Vector2(10*_scaleDynamic), mouse.pos.minxy(5*_scaleDynamic), '#0006');
        fillRect(new Vector2(8*_scaleDynamic), mouse.pos.minxy(4*_scaleDynamic), '#0f0');
    } else if(pref.showFPS) {
        fillText(new Vector2(14, 30), FPS, '#fff', 'bold 16px Consolas');
        var ftnorm = Math.norma(_ft / 16.6);
        fillText(new Vector2(14, 40), _ft, `rgba(${255*ftnorm}, ${255-255*ftnorm}, 0, 0.8)`, 'bold 12px Consolas');
    }
};
// raf vsync OR interval startup
if(pref.vsync) {
    render()
} else {
    pref.lockfps ? lockFpsSwitch(pref.framerate) : lockFpsSwitch();
}
//
function render() {
    // input & update
    workWithFPS();
    canvasActualSize();
    inputListener();
    updatePreferences();
    updateMusic();
    jikan._update();
    // draw
    wallpaperImage();
    visual.backgroundLayer();
    activeScreen();
    visual.topLayer();
    transitionScreen();
    hoverHint.draw();
    ctx.textAlign = 'start';
    developInfo();
    // title
    scaleFont(12, 'Consolas', 'italic'); ctx.fillStyle = '#fff';
    ctx.fillText($appInfo.comment, 2, fullsize.y-4);
    ctx.textAlign = 'end';
    ctx.fillText('aodb-' + adb_information.lastUpdate, fullsize.x-4, fullsize.y-4);
    //
    calcDrawTime();
    if(pref.vsync) {requestAnimationFrame(render)};
};