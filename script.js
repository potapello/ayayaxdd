var cvs = document.getElementById("ayayaxdd");
var ctx = cvs.getContext("2d");
// focus stopper
let windowVisibilityOld, windowVisibility = false;
window.onpageshow = window.onfocus = () => {
    windowVisibility = true
};
window.onpagehide = window.onblur = () => {
    windowVisibility = false
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
// @EAG TODO BLOG
/*

%%% ПОСЛЕД. АПДЕЙТЫ

*** отдельный поток для ввода (хотя бы для скроллинга)

*** сбор данных -> аниме всего, аниме по пресету, аниме на рулетке

*** отображение информации о рейтинге

*** скейл под разные разрешения экрана

*** автооткрытие шикимори или первого доступного сурса после победы

*** режим наложения заднего фона

*** вывести медиа-файлы в облако и сделать подгрузку при ините (музыка уже в гитхабе)

*** менеджер музыки

*** глобальный оптимизон частей, которые долго думают

*/
// @EAG FPS
//
let fpsFramesCount = 30;
var FPS = 0, deltaTime = 0, fpsFrameSum, oldTime = 0;
let fpsFrames = [0]; 
let timeMultiplier = 1;
function calcFPS() {
    deltaTime = performance.now() - oldTime;
    oldTime = performance.now();
    //
    fpsFrames.push(deltaTime);
    if(fpsFrames.length > fpsFramesCount) {fpsFrames.splice(0, 1)};
    fpsFrameSum = 0; for(let i=0;i<fpsFrames.length;i++) {fpsFrameSum+=fpsFrames[i]};
    FPS = Math.floor(1000/(fpsFrameSum / fpsFrames.length)*10)/10;
    //
    deltaTime = timeMultiplier * deltaTime
};
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
        // name, actual & srzna4
        ctx.textAlign = "end";
        ctx.fillText(this.name, pos.x+this.width*elem_spacing-6, pos.y+12);
        ctx.fillText(this.array[0], pos.x+this.width*elem_spacing-6, pos.y+this.height-3);
        ctx.textAlign = "center";
        ctx.fillText(findCent(this.array, true), pos.x+(this.width*elem_spacing)/2, pos.y+this.height-3);
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
let graphFPS = new Graph('FPS', 80, 500);
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
        if(this.ease) {
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
                this.applyDiff()
            };
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
        if(this.ease) {
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
                this.applyDiff()
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
    scroll: 0,
    press: false,
    click: false,
    context: false,
};
let _def_mouse = JSON.stringify(mouse);
let wheelState = 'idle';
//
// mouse.click = false;
// mouse.context = false;
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
    mouse.scroll += Math.abs(a);
    mouse.wheel = 0;
    if(a != 0) {if(a > 0) {a = 'btm'} else {a = 'top'}} else {a = 'idle'};
    wheelState = a
};
// mouse button events
document.addEventListener('mousedown', (e) => {
    if(e.button == 0) {mouse.press = true} 
});
document.addEventListener('mouseup', (e) => {
    if(e.button == 0) {mouse.press = false}
});
//
// @EAG INPUT LISTENER
//
function inputListener() {
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
    mouse.scroll = 0;
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
    mouse.old = new Vector2(0).sumv(mouse.pos);
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
function timeStringify(sec) {
    var m = Math.floor(sec/60);
    var s = Math.floor(sec - m*60);
    return `${m}:${s>=10?s:'0'+s}`
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
let musicPrefix = 'https://raw.githubusercontent.com/potapello/ayayaxdd/master/audio/'
let music = [
    //['src', rolltime],
    [musicPrefix+'music1.ogg', 61, 'Kuhaku Gokko - Lil\'b'],
    [musicPrefix+'music2.ogg', 42, 'Quinn Karter - Living in a Dream'],
    [musicPrefix+'music3.ogg', 43, 'ITZY - Snowy'],
    [musicPrefix+'music4.ogg', 0, 'Cagayake!GIRLS (from K-ON)'],
    [musicPrefix+'music5.ogg', 35, 'bulow - Revolver'],
    [musicPrefix+'music6.ogg', 47, 'Gawr Gura - REFLECT'],
    [musicPrefix+'music7.ogg', 41, 'Ado - AntiSystem\'s'],
    [musicPrefix+'music8.ogg', 44, 'Kenshi Yonezu - KICK BACK'],
    [musicPrefix+'music9.ogg', 34, 'BABYMETAL - Divine Attack'],
    // BABYMETAL - Divine Attack
    // Kenshi Yonezu - KICK BACK
];
let musicNormal = new Audio();
musicNormal.oncanplay = () => {musicNormal.play()};
let musicNormalVolume = new Vector1(0);
let musicNormalLoop = false;
let musicRoll = new Audio();
musicRoll.oncanplay = () => {musicRoll.play()};
let musicRollVolume = new Vector1(0);
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
    musicNormal.play();
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
function musicRandomTrack() {
    return music[Math.floor(Math.random() * (music.length - 0.001))]; 
};
function musicNormalNew() {
    musicNormal.pause();
    musicNormal.currentTime = 0;
    musicNormalVolume.move(1, 1, easeInOutSine);
    buttonPauseTrack.image = mlcPauseImage;
    var track = musicRandomTrack()
    musicNormal.src = track[0];
    musicLite.name = track[2];
    musicNormal.play()
};
//
function musicNormalPause() {
    if(musicNormal.paused) {
        buttonPauseTrack.image = mlcPauseImage;
        musicNormal.play();
        musicNormalVolume.move(1, 0.25, easeInOutSine)
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
        musicNormal.play();
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
    rollSpeed: 25,
    rouletteItems: 50,
    rollImages: 11,
    showMap: false,
    showNSFW: false,
    autoScroll: true,
    // draw
    imageQuality: 'low',
    imageSmoothing: true,
    lockfps: true,
    framerate: 60,
    bgalpha: 0.75,
    // audio
    sound: 8,
    bgmusic: 4,
    rollmusic: 8,
    playerShow: true,
    rollNewTrack: true,
    // other
    parallax: false,
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
// @EAG TAG CLASS
//
class animeTag {
    constructor(name, tags = []) {
        this.name = name; this.tags = tags
    }
};
//
// @EAG TAGS VARIANTS & TRANSLATE
//
let tagbase = {
    'unknown':          new animeTag('Тэги не указаны', ['UNKNOWN', 'UNDEFINED', 'unknown', 'undefined']),
    // main
    'action':           new animeTag('Экшн', ['action', 'action comedy']),
    'adventure':        new animeTag('Приключения', ['adventure', 'adventures', 'travel']),
    'comedy':           new animeTag('Комедия', ['comedy', 'dark comedy']),
    'drama':            new animeTag('Драма', ['drama', 'tragedy', 'romantic drama']),
    'ecchi':            new animeTag('Этти', ['ecchi']),
    'fantasy':          new animeTag('Фэнтези', ['fantasy']),
    'game':             new animeTag('Игра', ['game', 'video game', 'virtual reality', 'hacking']),
    'harem':            new animeTag('Гарем', ['harem']),
    'historical':       new animeTag('Историческое', ['historical']),
    'horror':           new animeTag('Хоррор', ['horror', 'post-apocalyptic', 'body horror', 'ghost']),
    'isekai':           new animeTag('Исекай', ['isekai', 'reincarnation', 'rehabilitation', 'summoned into another world']),
    'magic':            new animeTag('Магия', ['magic']),
    'mecha':            new animeTag('Меха', ['mecha', 'robot']),
    'military':         new animeTag('Военное', ['military', 'war']),
    'music':            new animeTag('Музыка', ['music', 'classical music', 'musical']),
    'mystery':          new animeTag('Мистика', ['mystery', 'mystical']),
    'parody':           new animeTag('Пародия', ['parody']),
    'psychological':    new animeTag('Психологическое', ['psychological', 'philosophy']),
    'romance':          new animeTag('Романтика', ['romance', 'romantic', 'romantic comedy', 'mature romance']),
    'school':           new animeTag('Школа', ['school', 'teacher', 'educational', 'high school', 'teaching']),
    'sci-fi':           new animeTag('Научное', ['sci-fi', 'sci fi']),
    'seinen':           new animeTag('Сейнэн', ['seinen']),
    'shoujo':           new animeTag('Сёдзе', ['shoujo']),
    'shounen':          new animeTag('Сёнэн', ['shounen']),
    'slice of life':    new animeTag('Повседневное', ['slice of life', 'daily life']),
    'sports':           new animeTag('Спорт', ['sports', 'sport', 'swimming', 'boxing', 'soccer', 'racing']),
    'supernatural':     new animeTag('Суперсилы', ['supernatural', 'super power', 'psi-powers', 'superheroes']),
    'yaoi':             new animeTag('Яой', ['yaoi']),
    'yuri':             new animeTag('Юри', ['yuri']),
    // other
    'work':             new animeTag('Работа', ['work']),
    'tsundere':         new animeTag('Цундере', ['tsundere']),
    'yandere':          new animeTag('Яндере', ['yandere']),
    'rpg':              new animeTag('Ролевое', ['rpg', 'mmorpg']),
    'detective':        new animeTag('Детектив', ['detective', 'detectives']),
    'space':            new animeTag('Космос', ['space', 'space battles', 'space travel', 'astronauts']),
    'future':           new animeTag('Футуризм', ['future']),
    'survival':         new animeTag('Выживание', ['survival']),
    'crime':            new animeTag('Преступления', ['crime', 'organized crime', 'prison', 'thief']),
    'cooking':          new animeTag('Еда', ['cooking', 'food', 'cocktails', 'restaurants']),
    'math':             new animeTag('Математика', ['math', 'mathe', 'mathematic', 'geometry']),
    // oh no
    'secret':           new animeTag('Совершенно секретно', ['hentai', 'nudity']),
    'allnsfw':          new animeTag('NSFW', [
        'hentai', 'anal', 'oral', 'nudity', 'large breasts', 'pantsu',
        'pantsu shots', 'transgender', 'big boobs', 'bondage', 'masturbation', 'sado maso', 
        'tentacle', 'threesome', 'boys love', 'sex', 'boobjob', 'group sex', 'lactation',
        'exhibitionism', 'incest', 'urinating', 'voyeurism', 'double penetration', 'strap-ons',
        'footjob', 'futanari', 'small breasts', 'lgbt themes', 'cunnilingus', 'public sex',
        'bdsm', 'tentacles', 'hypersexuality', 'sex toys', 'handjob']),
};
//
// @EAG PRESET CLASS
//
class Preset {
    constructor(name, includes=null, excludes=null, years=null, episodes=null, rating=null, mult=1, others=null) {
        this.name = name;
        this.in = includes; this.ex = excludes;
        this.years = years; this.ep = episodes; this.rating = rating;
        this.mult = mult; this.others = others
    }
    addon() {
        var adn = {};
        if(this.in !== null) {adn['tagsIncluded'] = this.in};
        if(this.ex !== null) {adn['tagsExcluded'] = this.ex};
        adn['yearMax'] = this.years.max; adn['yearMin'] = this.years.min;
        adn['episodeMax'] = this.ep.max; adn['episodeMin'] = this.ep.min;
        if(this.others !== null) {adn = filterModify(adn, this.others)};
        return adn
    };
    getInfo() {
        var ini = '', exi = '';
        if(this.in !== null) {
            ini = ' Включения:'; 
            for(i in this.in) {ini = ini + ' ' + tagbase[this.in[i]].name + ','};
            ini = ini.substring(0, ini.length-1) + '.'
        };
        if(this.ex !== null) {
            exi = ' Исключения:'; 
            for(i in this.ex) {exi = exi + ' ' + tagbase[this.ex[i]].name + ','};
            exi = exi.substring(0, exi.length-1) + '.'
        };
        return `Пресет: ${this.name}.${ini}${exi} Серии: ${this.ep.min}-${this.ep.max}. Года: ${this.years.min}-${this.years.max}. Необходимый рейтинг: ${this.rating.min}-${this.rating.max}. Множитель = ${'x'+String(this.mult + 0.001).substring(0,4)}`
    }
};
//
// @EAG ALL PRESETS
//
let presetbase = {
    'Дефолтный': new Preset('Дефолтный', 
    includes = null, excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1, others = null),
    'Cтарая романтика': new Preset('Cтарая романтика', 
    includes = ['romance'], excludes = null,
    years = new Range(1970, 2007), episodes = new Range(1, 50), rating = new Range(6, 10),
    mult = 1, others = null),
    'Перерождение в 2007-й': new Preset('Перерождение в 2007-й', 
    includes = ['isekai'], excludes = null,
    years = new Range(2006, 2008), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1, others = null),
    'Современный кал': new Preset('Современный кал', 
    includes = null, excludes = null,
    years = new Range(2018, 2023), episodes = new Range(1, 50), rating = new Range(3, 7),
    mult = 1.5, others = null),
    'Запретный плод': new Preset('Запретный плод', 
    includes = ['secret'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 25), rating = new Range(5, 10),
    mult = 1.2, others = {NSFW: true}),
    'Хорошая ностальгия': new Preset('Хорошая ностальгия', 
    includes = null, excludes = null,
    years = new Range(1970, 2000), episodes = new Range(1, 50), rating = new Range(7, 10),
    mult = 1, others = null),
    'Preset девственника': new Preset('Preset девственника', 
    includes = ['yuri'], excludes = null,
    years = new Range(1970, 2010), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1, others = null),
    'Мужская магия': new Preset('Мужская магия', 
    includes = ['seinen', 'magic'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(6, 10),
    mult = 1, others = null),
    'Сверхъестественная школа': new Preset('Сверхъестественная школа', 
    includes = ['supernatural', 'school'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1, others = null),
    'Равноправное настоящее': new Preset('Равноправное настоящее', 
    includes = ['yuri'], excludes = null,
    years = new Range(2014, 2023), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1, others = null),
    'Девочки колдуют': new Preset('Девочки колдуют', 
    includes = ['shoujo', 'magic'], excludes = null,
    years = new Range(1970, 2010), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1, others = null),
    'Женский исекай': new Preset('Женский исекай', 
    includes = ['shoujo', 'isekai'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1, others = null),
    'Можно короче?': new Preset('Можно короче?', 
    includes = null, excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 13), rating = new Range(5, 10),
    mult = 1, others = null),
    'Лучшая эротика': new Preset('Лучшая эротика', 
    includes = ['ecchi'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(7, 10),
    mult = 1, others = null),
    'Бывалые гаремы': new Preset('Бывалые гаремы', 
    includes = ['harem'], excludes = null,
    years = new Range(1970, 2007), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1, others = null),
    'Девочки в танках': new Preset('Девочки в танках', 
    includes = ['shoujo', 'military'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1, others = null),
    'Новая психология': new Preset('Новая психология', 
    includes = ['psychological'], excludes = null,
    years = new Range(2016, 2023), episodes = new Range(1, 50), rating = new Range(6, 10),
    mult = 1, others = null),
    'Повседневность нулевых': new Preset('Повседневность нулевых', 
    includes = ['slice of life'], excludes = null,
    years = new Range(2001, 2010), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1, others = null),
    '\"Сполт это фыфнь\".': new Preset('\"Сполт это фыфнь\".', 
    includes = ['sports'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(4, 10),
    mult = 1.25, others = null),
    'Игры десятых': new Preset('Игры десятых', 
    includes = ['game'], excludes = null,
    years = new Range(2011, 2020), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1, others = null),
    'Пережитая история': new Preset('Пережитая история', 
    includes = ['historical'], excludes = null,
    years = new Range(1970, 2000), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1, others = null),
    'Лучшие приключения': new Preset('Лучшие приключения', 
    includes = ['adventure', 'action'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(20, 50), rating = new Range(7, 10),
    mult = 1.25, others = null),
    'Когда плакать?': new Preset('Когда плакать?', 
    includes = ['drama'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(3, 7),
    mult = 1.5, others = null),
    'Пожилые слёзы': new Preset('Пожилые слёзы', 
    includes = ['drama'], excludes = null,
    years = new Range(1970, 2000), episodes = new Range(1, 50), rating = new Range(7, 10),
    mult = 1, others = null),
    'Что это было?': new Preset('Что это было?', 
    includes = ['mystery'], excludes = null,
    years = new Range(2007, 2023), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1, others = null),
    'Новое приключение': new Preset('Новое приключение', 
    includes = ['adventure'], excludes = null,
    years = new Range(2018, 2023), episodes = new Range(1, 50), rating = new Range(6, 10),
    mult = 1, others = null),
    'Фентезийная любовь': new Preset('Фентезийная любовь', 
    includes = ['fantasy', 'romance'], excludes = null,
    years = new Range(2007, 2023), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1, others = null),
    'Запрещённый гарем': new Preset('Запрещённый гарем', 
    includes = ['harem', 'shoujo'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1, others = null),
    'Плюс уши': new Preset('Плюс уши', 
    includes = ['music'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(7, 10),
    mult = 1, others = null),
    'Путь педофила': new Preset('Путь педофила', 
    includes = ['ecchi', 'shoujo'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1, others = null),
    'Качалка Билли': new Preset('Качалка Билли', 
    includes = ['sports', 'seinen'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(6, 10),
    mult = 1, others = null),
    'Плохие шутки': new Preset('Плохие шутки', 
    includes = ['comedy'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(3, 7),
    mult = 1.5, others = null),
    'Новаторский юмор': new Preset('Новаторский юмор', 
    includes = ['comedy'], excludes = null,
    years = new Range(2016, 2023), episodes = new Range(1, 50), rating = new Range(6, 10),
    mult = 1, others = null),
    'Грустно, но вкусно': new Preset('Грустно, но вкусно', 
    includes = ['drama', 'romance'], excludes = null,
    years = new Range(2018, 2023), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1, others = null),
    'Бесится, но любит': new Preset('Бесится, но любит', 
    includes = ['tsundere'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(6, 10),
    mult = 1, others = null),
    'Влюбиться насмерть': new Preset('Влюбиться насмерть', 
    includes = ['yandere'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(6, 10),
    mult = 1, others = null),
    'Бесконечное \"это\"': new Preset('Бесконечное \"это\"',
    includes = ['ecchi'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 25), rating = new Range(5, 10),
    mult = 1, others = {seasonSpring: false, seasonFall: false, seasonWinter: false, seasonUndefined: false}),
    'Работать - круто!': new Preset('Работать - круто!', 
    includes = ['work'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(6, 10),
    mult = 1, others = null),
    'Ролевые штуки': new Preset('Ролевые штуки', 
    includes = ['rpg'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1.2, others = null),
    'Совсем не похоже': new Preset('Совсем не похоже', 
    includes = ['parody'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(3, 7),
    mult = 1.25, others = null),
    'Годная сатира': new Preset('Годная сатира', 
    includes = ['parody'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(7, 10),
    mult = 1, others = null),
    'Супер-романтика': new Preset('Супер-романтика', 
    includes = ['romance', 'supernatural'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1, others = null),
    'Выключаем свет': new Preset('Выключаем свет', 
    includes = ['horror'], excludes = ['yaoi', 'mecha'],
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(7, 10),
    mult = 1, others = null),
    'Женский спорт': new Preset('Женский спорт', 
    includes = ['shoujo', 'sports'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(6, 10),
    mult = 1, others = null),
    'Следопыт-новичок': new Preset('Следопыт-новичок', 
    includes = ['detective'], excludes = null,
    years = new Range(2018, 2023), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1, others = null),
    'Выживание без купюр': new Preset('Выживание без купюр', 
    includes = ['survival', 'adventure'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1, others = null),
    'Кухня, 7 сезон': new Preset('Кухня, 7 сезон', 
    includes = ['cooking', 'seinen'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1, others = null),
    'Под шансон': new Preset('Под шансон', 
    includes = ['crime'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 50), rating = new Range(5, 10),
    mult = 1.2, others = null),
    'Матанализ': new Preset('Матанализ', 
    includes = ['math'], excludes = null,
    years = new Range(1970, 2023), episodes = new Range(1, 999), rating = new Range(0, 10),
    mult = 1, others = null),
};
//
// @EAG OTHER TRANSLATE INFO
//
let filterItemNames = {
    statusFinished: 'Вышел',
    statusOngoing: 'Онгоинг',
    statusUpcoming: 'Анонс',
    statusUnknown: 'Неизв.',
    //type
    typeTV: 'TV Сериал',
    typeMovie: 'Фильм',
    typeONA: 'ONA',
    typeOVA: 'OVA',
    typeSpecial: 'Спешл',
    typeUnknown: 'Неизв.',
    //season
    seasonSpring: 'Весна',
    seasonSummer: 'Лето',
    seasonFall: 'Осень',
    seasonWinter: 'Зима',
    seasonUndefined: 'Неизв.',
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
//
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
function arrayImagesComplete(array) {
    for(i in array) {
        if(!array[i].complete) {return false}
    }; return true
}
//
function arrayShuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    };
    return array
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
    presetSelected = preset.name;
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
//
// @EAG FEEDBACK FUNCTIONS
//
function getArrayWorkProgress(iter, length, step) {
    for(let i = 1; i<100/step; i++) {
        if(iter == Math.round(length*step*i/100)) {console.info(`Прогресс сбора данных - ${step*i}%`)}
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
// @EAG GET ALL DATA BY TYPE
//
var _lastTypeDataArray = [];
function getTypedData(root, database = adb) {
    var data = [];
    var l = database.length;
    console.info(`Начат сбор данных по пути "${root}".`);
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
    console.info(`Данные по пути "${root}" были собраны в "_lastTypeDataArray".`);
    return _lastTypeDataArray
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
let cvssize = new Vector2();
let cvsscale = 1;
let casState = 'init';
let casscale = new Vector1(1);
let casTimeout = 0.25;
let casResized = new Vector2(window.innerWidth, window.innerHeight);
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
    cvssize = docsize.get();
    cvsscale = casscale.get();
    // cvssize = new Vector2(1366, 700);
};
//
// @EAG MARKUP METHODS
//
function globalAlign(align=new Vector2(0.5), size=new Vector2(0)) {
    return new Vector2(cvssize.x*align.x-(size.x*align.x), cvssize.y*align.y-(size.y*align.y))
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
function fillRectRounded(size, pos=new Vector2(), color='#000', radius=12) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, size.x, size.y, [radius]);
    ctx.fill();
};
function fillRectRoundedFrame(size, pos=new Vector2(), color='#000', radius=12) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, size.x, size.y, [radius]);
    ctx.stroke();
};
//
function alignImage(image = new Image, align) {
    image.complete ? drawImage(image, globalAlign(align, new Vector2(image.naturalWidth, image.naturalHeight))) : null
};
function alignImageSized(image = new Image, align, size) {
    image.complete ? drawImageSized(image, globalAlign(align, size), size) : null
};
//
function fillText(pos, text, color='#000', font='12px Helvetica') {
    ctx.fillStyle = color; ctx.font = font;
    ctx.fillText(text, pos.x, pos.y)
};
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
        if(mouse.pos.overAND(this.pos.get()) &&
        mouse.pos.lessAND(this.pos.get().vsum(this.size.get()))) {
            if(mouse.click) {
                return 'click'
            } else if (this.scrollable && getMousewheel() === 'btm') {
                return 'scrollup'
            } else if (this.scrollable && getMousewheel() === 'top') {
                return 'scrolldown'
            } else {
                return 'hover'
            }
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
            console.log("Компиляция цветовой схемы \""+ a +"\" невозможна - недостаточно элементов.")
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
        console.log("Компиляция цветовой схемы \""+ a +"\" невозможна - недостаточно элементов.");
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
function shapeCollisionState(shape, scrollable=fase) {
    if(ctx.isPointInPath(shape, mouse.pos.x, mouse.pos.y)) {
        if(mouse.click) {
            return 'click'
        } else if (scrollable && getMousewheel() === 'btm') {
            return 'scrollup'
        } else if (scrollable && getMousewheel() === 'top') {
            return 'scrolldown'
        } else {
            return 'hover'
        }
    };
    return 'idle'
};
//
// @EAG 2D STYLED SHAPES
//
function shapeProgressBar(align, size, prog, colormap) {
    const p = globalAlign(align, size);
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
            //
            this.shape = this.shapefunc(this.pos.get().sumxy(0, this.tap.get()), this.size.get());
            this.shadow = this.shapefunc(this.pos.get().sumxy(0, this.tap.get()+1), this.size.get().sumxy(0, this.height-this.tap.get()));
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
                                this.active = true
                            }
                        } else {
                            this.tap.set(0);
                            this.tap.move(this.height, 0.25, easeParabolaQuad);
                            setTimeout(() => {this.onclick()}, 250)};
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
            this.textpos = this.pos.get().sumxy(this.size.get().x/2, (this.size.get().y - this.metrics.y)/3 + this.metrics.y).sumxy(0, this.tap.get());
            ctx.fillStyle = this.textclr;
            ctx.fillText(this.text, this.textpos.x, this.textpos.y, [this.size.get().x])
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
        this.ondeact = () => {};
        this.onclick = () => {};
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
                                this.onclick()
                            }
                        } else {
                            this.tap.set(0);
                            this.tap.move(this.height, 0.25, easeParabolaQuad);
                            setTimeout(() => {this.onclick()}, 250)};
                        }
                    this.oldstate = this.state
                }
            };
            // colors
            !this.isSwitcher ? this.shapecm.setState(this.state, 0.25) : this.active ? this.shapecm.setState('click', 0.25) : this.shapecm.setState('idle', 0.25);
            this.shapecm.update();
            this.shapecm.alphaMult(this.alpha);
            this.shapeclr = this.shapecm.get();
            this.shadowclr = this.shapecm.idle.light(50).getColor();
            // draw
            fillShape(this.shadow, this.shadowclr);
            fillShape(this.shape, this.shapeclr);
            this.imagepos = this.pos.get().sumv(this.spacing.get()).sumxy(0, this.tap.get());
            drawImageSized(this.image, this.imagepos, this.shapesize.minv(this.spacing.get().multxy(2)))
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
        //
        this.shape = this.shapefunc(this.pos.get().sumxy(0, this.tap.get()), this.size.get());
        this.shadow = this.shapefunc(this.pos.get().sumxy(0, this.tap.get()+1), this.size.get().sumxy(0, this.height-this.tap.get()));
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
                lsSaveObject('tagSelection', tagSelection)
            };
            this.oldstate = this.state
        };
        //
        if(this.tagstate !== tagSelection[this.tag]) {
            if(tagSelection[this.tag] === 'none') {
                this.tap.move(this.height, 0.25, easeOutCirc);
                this.shdw.fadeTo(colorMatrix(`rgba(255,63,255,0.4)`), 0.25)
            } else if(tagSelection[this.tag] === 'inc') {
                this.tap.move(0, 0.25, easeOutCirc);
                this.shdw.fadeTo(colorMatrix(`rgba(63,255,63,0.8)`), 0.25)
            } else {
                if(this.tap.get() === this.height) {this.tap.move(0, 0.25, easeOutCirc)} 
                else {this.tap.move(this.height, 0.25, easeParabolaQuad)};
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
        if(this.tap.get() !== this.height) {fillShape(this.shadow, this.shadowclr)};
        fillShape(this.shape, this.shapeclr);
        this.metrics = getTextMetrics(this.text);
        this.textpos = this.pos.get().sumxy(this.size.get().x/2, (this.size.get().y - this.metrics.y)/3 + this.metrics.y).sumxy(0, this.tap.get());
        ctx.fillStyle = this.textclr;
        ctx.fillText(this.text, this.textpos.x, this.textpos.y, [this.size.get().x])
    }
};
//
// @EAG SHAPED SELECT BAR
//
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
        this.shadow = shapeRectRounded(this.pos, this.size, this.radius);
        this.shape = shapeRectRounded(this.pos.sumxy(this.spacing), this.size.minxy(this.spacing*2).multxy(this.pointer, 1), this.radius)
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
    ? `${style} ${size * cvsscale}px ${font}`
    : `${size * cvsscale}px ${font}`
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
        this.pos = pos; this.size = size; this.margin = margin;
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
// @EAG IMAGE METHODS
//
let fitFrameSize = new Vector2(240);
let fitFrameBg = new Color(0, 0, 0, 0.8);
let fitImageBorder = 4;
let fitImageSquared = false;
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
let invokedImages = [];
function invokeNewImage(src) {
    var image = new Image(); image.src = src; invokedImages.push(image); return image
};
//
class imageFitFrame {
    constructor(image = new Image()) {this.image = image}
    active = true;
    align = new Vector2(0.5);
    fitsize = null;
    offset = new Vector2();
    // upscale = new Vector2();
    // upoffset = new Vector2();
    bgColor = fitFrameBg;
    framehue = 0;
    ratio = 1;
    alpha = 1;
    zoom = 1;
    newImage(source) {
        this.image = new Image();
        this.image.src = String(source);
        this.fitsize = null
    }
    copy() {
        var iff = new imageFitFrame(this.image);
        iff.fitsize = new Vector2().setv(this.fitsize);
        iff.ratio = Number(String(this.ratio));
        iff.offset.setv(this.offset);
        // iff.upscale.setv(this.upscale);
        // iff.upoffset.setv(this.upoffset);
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
                this.offset = new Vector2((fitFrameSize.x - this.fitsize.x)/2, 0);
                // this.upscale = new Vector2(this.image.naturalWidth);
                // this.upoffset = new Vector2(0, (this.image.naturalHeight - this.image.naturalWidth)/2)
            } else {
                // album ratio
                this.fitsize = new Vector2(fitFrameSize.x, fitFrameSize.y / this.ratio);
                this.offset = new Vector2(0, (fitFrameSize.y - this.fitsize.y)/2);
                // this.upscale = new Vector2(this.image.naturalHeight);
                // this.upoffset = new Vector2((this.image.naturalWidth - this.image.naturalHeight)/2, 0)
            }
        }
    }
    draw() {
        // set fitsize (change only)
        if(this.fitsize === null && this.image.complete) {this.fit()};
        // draw frame
        ctx.globalAlpha = this.alpha;
        // if(!fitImageSquared) {
        var glal = globalAlign(this.align, this.fitsize.sumxy(fitImageBorder).multxy(this.zoom));
        drawImageSized(this.image, glal, this.fitsize.multxy(this.zoom));
        fillRectRoundedFrame(this.fitsize.multxy(this.zoom), glal, `hsl(${this.framehue}deg 100% 45%)`, fitImageBorder/2)
        //
    //     } else {
    //         ctx.fillStyle = this.bgColor.getColor();
    //         if(this.ratio !== 1) {
    //             drawImagePart(this.image,
    //                 this.upoffset, this.upscale,
    //                 globalAlign(this.align, fitFrameSize.multv(new Vector2(this.zoom))), fitFrameSize.multv(new Vector2(this.zoom))
    //                 )
    //         };
    //         fillRectFast(fitFrameSize.multv(new Vector2(this.zoom)), globalAlign(this.align, fitFrameSize.multv(new Vector2(this.zoom))));
    //         drawImageSized(this.image, globalAlign(this.align, fitFrameSize.multv(new Vector2(this.zoom))).sumv(this.offset.multv(new Vector2(this.zoom))), this.fitsize.multv(new Vector2(this.zoom)));
    //         fillRectRoundedFrame(fitFrameSize.multv(new Vector2(this.zoom)), globalAlign(this.align, fitFrameSize.multv(new Vector2(this.zoom))), `hsl(${this.framehue}deg 100% 45%)`, fitImageBorder/2);
    //     }; 
    //     ctx.globalAlpha = 1
    }
};
//
// @EAG SITES LIST OBJECT
//
let siteNames = { 
    'myanimelist.net': 'MAL',
    'anidb.net': 'AniDB',
    'anilist.co': 'AniList',
    'anime-planet.com': 'Anime-Planet',
    'anisearch.com': 'aniSearch',
    'kitsu.io': 'KITSU',
    'notify.moe': 'NOTIFY.MOE',
    'livechart.me': 'LiveChart.me',
};
//
let _slpp = 'images/';
let siteLogos = [
    invokeNewImage(_slpp+'myanimelist.png'),
    invokeNewImage(_slpp+'anidb.png'),
    invokeNewImage(_slpp+'anilist.png'),
    invokeNewImage(_slpp+'anime-planet.png'),
    invokeNewImage(_slpp+'anisearch.png'),
    invokeNewImage(_slpp+'kitsu.png'),
    invokeNewImage(_slpp+'notify-moe.png'),
    invokeNewImage(_slpp+'livechart.png'),
    //
    invokeNewImage(_slpp+'shikimori.png'),
    invokeNewImage(_slpp+'watch.png'),
];
//
let siteButtonColormap = `rgba(0,0,0,0)#rgba(0,255,127,0.2)#rgba(0,255,127,1)#rgba(255,63,63,0.2)`;
let siteimageSpacing = new Vector2(5);
let siteBoxSize = 250;
let siteButtonSpacing = 5;
//
function sitesButtonShape(pos, size) {
    var shape = new Path2D();
    shape.roundRect(pos.x, pos.y, size.x, size.y, 5);
    return shape
};
function sitesButtonPos(posm) {
    return posm.multxy((siteBoxSize - siteButtonSpacing*5)/4 + siteButtonSpacing).sumxy(siteButtonSpacing);
};
// постоянные кнопки
let sitesSearchShikimori = new ImageButtonShaped(
    sitesButtonShape, siteLogos[8], siteimageSpacing,
    // colorMapMatrix(`rgba(50,50,50,1)#rgba(70,70,70,1)#rgba(70,70,70,1)#rgba(50,50,50,0.5)`)
    colorMapMatrix(siteButtonColormap)
);
sitesSearchShikimori.onclick = () => {
    playSound(sound['player']);
    window.open(`https://shikimori.me/animes?search=${roulette.centerAnime['title']}`)
};
let sitesSearchDuck = new ImageButtonShaped(
    sitesButtonShape, siteLogos[9], siteimageSpacing,
    colorMapMatrix(siteButtonColormap)
);
sitesSearchDuck.onclick = () => {
    playSound(sound['player']);
    window.open(`https://yandex.ru/search/?text=смотреть ${roulette.centerAnime['title']}`)
};
//
let sites = {
    anchor: new Vector2(0.05, 0.95),
    pos: new Vector2(),
    //
    state: 'load',
    complete: false,
    sources: {},
    //
    getTime: 0,
    getCD: 0,
    //
    actual: {
        'myanimelist.net':  new Vector2(0,2),
        'anidb.net':        new Vector2(1,2),
        'anilist.co':       new Vector2(2,2),
        'anime-planet.com': new Vector2(3,2),
        'anisearch.com':    new Vector2(0,3),
        'kitsu.io':         new Vector2(1,3),
        'notify.moe':       new Vector2(2,3),
        'livechart.me':     new Vector2(3,3),
    },
    //
    buttons: {
        'myanimelist.net':  new ImageButtonShaped(sitesButtonShape, siteLogos[0], siteimageSpacing, colorMapMatrix(siteButtonColormap)),
        'anidb.net':        new ImageButtonShaped(sitesButtonShape, siteLogos[1], siteimageSpacing, colorMapMatrix(siteButtonColormap)),
        'anilist.co':       new ImageButtonShaped(sitesButtonShape, siteLogos[2], siteimageSpacing, colorMapMatrix(siteButtonColormap)),
        'anime-planet.com': new ImageButtonShaped(sitesButtonShape, siteLogos[3], siteimageSpacing, colorMapMatrix(siteButtonColormap)),
        'anisearch.com':    new ImageButtonShaped(sitesButtonShape, siteLogos[4], siteimageSpacing, colorMapMatrix(siteButtonColormap)),
        'kitsu.io':         new ImageButtonShaped(sitesButtonShape, siteLogos[5], siteimageSpacing, colorMapMatrix(siteButtonColormap)),
        'notify.moe':       new ImageButtonShaped(sitesButtonShape, siteLogos[6], siteimageSpacing, colorMapMatrix(siteButtonColormap)),
        'livechart.me':     new ImageButtonShaped(sitesButtonShape, siteLogos[7], siteimageSpacing, colorMapMatrix(siteButtonColormap)),
    },
    //
    draw: () => {
        // задний фон и позиционирование
        sites.pos = globalAlign(sites.anchor, new Vector2(siteBoxSize));
        fillRectRounded(new Vector2(siteBoxSize), sites.pos, `rgba(0,0,0,${pref.bgalpha})`, 10);
        // заголовок
        ctx.textAlign = 'center';
        fillText(sites.pos.sumxy(siteBoxSize/2, -siteButtonSpacing)  , 'Сайты', '#ffff', 'bold 24px Segoe UI');
        // обновление позиций, размеров кнопок и рисование
        for(b in sites.buttons) {
            sites.buttons[b].pos = sitesButtonPos(sites.actual[b]).sumv(sites.pos);
            sites.buttons[b].sizedZoom(new Vector2((siteBoxSize - siteButtonSpacing*5)/4));
            if(sites.state !== 'load') {sites.buttons[b].draw()}
        };
        // постоянные кнопки
        sitesSearchShikimori.pos = sites.pos.sumxy(siteButtonSpacing*2.5, siteButtonSpacing);
        sitesSearchDuck.pos = sites.pos.sumxy(siteButtonSpacing).sumxy(siteButtonSpacing*1.5, siteButtonSpacing + (siteBoxSize - siteButtonSpacing*5)/4);
        sitesSearchShikimori.sizedZoom(new Vector2(siteBoxSize - siteButtonSpacing*5, (siteBoxSize - siteButtonSpacing*5)/4));
        sitesSearchDuck.sizedZoom(new Vector2(siteBoxSize - siteButtonSpacing*5, (siteBoxSize - siteButtonSpacing*5)/4));
        sitesSearchShikimori.draw();
        sitesSearchDuck.draw();
        // елиф чисто для кнопок сайтов
        if(sites.state === 'load') {
            // ожидание загрузки логотипов
            sites.complete = true;
            for(s in siteLogos) {
                if(!siteLogos[s].complete) {sites.complete = false; break}
            };
            //
            if(sites.complete) {sites.state = 'get'}
        //
        } else if(sites.state === 'get') {
            // подсчет доступных ссылок
            sites.sources = {};
            sites.sources = getSiteSources(roulette.centerAnime['sources']);
            sites.getCD = Number(sites.getTime);
            // вырубаем все
            for(b in sites.buttons) {
                sites.buttons[b].state = 'unaval'
            };
            //
            sites.state = 'getwait'
        //
        } else if(sites.state === 'getwait') {
            // кд чтобы не мигали кнопки
            sites.getCD -= deltaTime;
            if(sites.getCD <= 0) {
                sites.getCD = 0;
                // врубаем только доступные
                for(b in sites.sources) {
                    sites.buttons[b].state = 'idle';
                    sites.buttons[b].oldstate = 'idle'
                };
                //
                siteUpdateURLs(sites.sources);
                sites.state = 'draw'
            }
        //
        }
    },
};
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
// перебирать нельзя - функция кал схавает, тут только так \*o*/
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
let tinfBarSize = 12;
let tinfTime = 0.5;
let tinfColorAlpha = 0.8;
//
let seasonsColorMap = {
    WINTER:     [1, `rgba(0,196,255,${tinfColorAlpha})`, `Зима`],
    SPRING:     [2, `rgba(0,255,72,${tinfColorAlpha})`, `Весна`],
    SUMMER:     [3, `rgba(234,255,0,${tinfColorAlpha})`, `Лето`],
    FALL:       [4, `rgba(232,70,0,${tinfColorAlpha})`, `Осень`],
    UNDEFINED:  [5, `rgba(186,0,133,${tinfColorAlpha})`, `Неизв.`],
};
function tinfEpisodesColor(x) {
    return x < 0.5 ? `rgba(${255*x*2},255,63,${tinfColorAlpha})` : `rgba(255,${255-255*(x-0.5)*2},63,${tinfColorAlpha}`
};
function tinfYearColor(x) {
    return x < 0.5 ? `rgba(55,${255-200*(x*2)},255,${tinfColorAlpha})` : `rgba(${55+200*(x-0.5)},55,255,${tinfColorAlpha})`
};
let typesColorMap = {
    SPECIAL:    [1, `rgba(3, 11, 252,${tinfColorAlpha})`, `Special`],
    ONA:        [2, `rgba(29,219,162,${tinfColorAlpha})`, `ONA`],
    OVA:        [3, `rgba(206,222,27,${tinfColorAlpha})`, `OVA`],
    TV:         [4, `rgba(43,222,27,${tinfColorAlpha})`, `TV`],
    MOVIE:      [5, `rgba(255,118,77,${tinfColorAlpha})`, `Movie`],
    UNKNOWN:    [6, `rgba(186,0,133,${tinfColorAlpha})`, `Unknown`],
};
//
function clockwiseProgress(x) {
    return Math.PI*3/2+x*2*Math.PI
};
//
function circleProgressBar(pos, progress, text, color = new Color()) {
    var txt = color.alpha(1).gamma(80).getColor();
    var bg = color.light(50).getColor();
    var fg = color.getColor();
    //
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, tInfo.radii-tinfBarSize/2, Math.PI*3/2, Math.PI*7/2);
    ctx.lineWidth = tinfBarSize;
    ctx.strokeStyle = bg; ctx.stroke();
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, tInfo.radii-tinfBarSize/2, Math.PI*3/2, clockwiseProgress(progress));
    ctx.strokeStyle = fg; ctx.stroke();
    ctx.fillStyle = txt;
    ctx.fillText(text, pos.x, pos.y+(ctx.measureText(text).actualBoundingBoxAscent/2), [tInfo.radii*1.75])
};
//
let tInfo = {
    anchor: new Vector2(0.95, 0.95),
    pos: new Vector2(),
    radii: 0,
    title: null,
    //
    episodes: new Vector1(0),
    year: new Vector1(2000),
    season: new Color(0,0,0,0),
    type: new Color(0,0,0,0),
    seasonp: new Vector1(0),
    typep: new Vector1(0),
    //
    updateTitle: (title) => {
        tInfo.title = title;
        tInfo.episodes.move(title['episodes'], tinfTime, easeInOutCubic);
        tInfo.year.move(title['animeSeason']['year'], tinfTime, easeInOutCubic);
        tInfo.season.fadeTo(colorMatrix(seasonsColorMap[title['animeSeason']['season']][1]), tinfTime);
        tInfo.seasonp.move(seasonsColorMap[title['animeSeason']['season']][0], tinfTime);
        tInfo.type.fadeTo(colorMatrix(typesColorMap[title['type']][1]), tinfTime);
        tInfo.typep.move(typesColorMap[title['type']][0], tinfTime);
    },
    //
    draw: () => {
        // update
        tInfo.episodes.update();
        tInfo.year.update();
        tInfo.season.update();
        tInfo.type.update();
        tInfo.seasonp.update();
        tInfo.typep.update();
        // позиция, радиус и бг
        tInfo.pos = globalAlign(tInfo.anchor, new Vector2(tinfBoxSize));
        tInfo.radii = (tinfBoxSize - tinfSpacing * 3)/4;
        fillRectRounded(new Vector2(tinfBoxSize), tInfo.pos, `rgba(0,0,0,${pref.bgalpha})`, 10);
        // заголовок
        ctx.textAlign = 'center';
        fillText(tInfo.pos.sumxy(siteBoxSize/2, -tinfSpacing)  , 'Инфо', '#fff', 'bold 24px Segoe UI');
        // круги на полях
        ctx.font = `bold 32px Helvetica`;
        circleProgressBar(
            tInfo.pos.sumxy(tinfSpacing).sumxy(tInfo.radii), 
            tInfo.episodes.get() / filterDefault.episodeMax, 
            Math.round(tInfo.episodes.get()),
            colorMatrix(tinfEpisodesColor(tInfo.episodes.get() / filterDefault.episodeMax))
        );
        circleProgressBar(
            tInfo.pos.sumxy(tinfSpacing*2, tinfSpacing).sumxy(tInfo.radii*3, tInfo.radii),
            (tInfo.year.get() - filterDefault.yearMin) / (filterDefault.yearMax - filterDefault.yearMin),
            Math.round(tInfo.year.get()),
            colorMatrix(tinfYearColor((tInfo.year.get() - filterDefault.yearMin) / (filterDefault.yearMax - filterDefault.yearMin)))
        );
        ctx.font = `bold 24px Helvetica`;
        circleProgressBar(
            tInfo.pos.sumxy(tinfSpacing, tinfSpacing*2).sumxy(tInfo.radii, tInfo.radii*3),
            tInfo.seasonp.get()/5,
            seasonsColorMap[tInfo.title['animeSeason']['season']][2],
            colorMatrix(tInfo.season.getColor())
        );
        circleProgressBar(
            tInfo.pos.sumxy(tinfSpacing*2).sumxy(tInfo.radii*3),
            tInfo.typep.get()/6,
            typesColorMap[tInfo.title['type']][2],
            colorMatrix(tInfo.type.getColor())
        )
    },

};
//
// @EAG ROLL BAR OBJECT
//
let rbBodyHeight = 60;
let rbSpacing = 5;
let rbRollWidth = (rbBodyHeight - rbSpacing*2)*2 + rbSpacing;
//
let buttonDoRoll = new TextButtonShaped(shapeRectRounded, 'Roll!', new Vector2(200, 40),
    colorMapMatrix(colorMapForeDefault),
    colorMapMatrix(`rgba(0,0,0,0)#rgba(63,63,255,0.25)#rgba(63,63,255,1)#rgba(0,0,0,0)`));
buttonDoRoll.onclick = () => {
    playSound(sound['roll']);
    roulette.doRoll(pref.rollTime, pref.rollSpeed);
    srv.hideProgress.value = 0;
    srv.hideProgress.move(1, srv.hideTime, easeInQuad);
    srv.state = 'roll_start';
    rollBar.state = 'hide';
    buttonDoRoll.state = 'unaval'
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
//
let filterChangesText = lsLoadString('filterChangesText', 'Изменений нет');
function rbChangesText(count) {
    if(count === 0) {
        filterChangesText = 'Изменений нет'
    } else if(count === 1) {
        filterChangesText = '+1 Изменение'
    } else if(count > 1 && count < 5) {
        filterChangesText = `+${count} Изменения`
    } else {
        filterChangesText = `+${count} Изменений`
    };
    lsSaveValue('filterChangesText', filterChangesText)
};
//
let rollBar = {
    anchor: new Vector2(0.5, 1.2),
    normal: new Vector2(0.5, 0.95),
    hide: new Vector2(0.5, 1.2),
    //
    pos: new Vector2(),
    size: new Vector2(cvssize.x * 0.4, rbBodyHeight),
    alpha: new Vector1(0),
    //
    state: 'init',
    time: 1,
    //
    draw: () => {
        // update
        rollBar.anchor.update();
        rollBar.alpha.update();
        ctx.globalAlpha = rollBar.alpha.get();
        // размеры и задний фон
        rollBar.size.setxy(cvssize.x * 0.4, rbBodyHeight);
        rollBar.pos = globalAlign(rollBar.anchor.get(), rollBar.size);
        rbRollWidth = (rbBodyHeight - rbSpacing*2)*2 + rbSpacing;
        // рисуем
        if(rollBar.state !== 'init' && rollBar.state !== 'invis') {
            fillRectRounded(rollBar.size, rollBar.pos, `rgba(0,0,0,${pref.bgalpha})`, 10);
            // крутить
            ctx.textAlign = 'center'; ctx.font = 'bold 36px Arial';
            buttonDoRoll.size.setxy(rbRollWidth, rollBar.size.y-rbSpacing*2);
            buttonDoRoll.pos.setv(rollBar.pos.sumxy(rbSpacing));
            buttonDoRoll.draw();
            // текст
            ctx.font = `16px Segoe UI`;
            ctx.fillText('Пресет: '+presetOnRoulette, rollBar.pos.x + rollBar.size.x/2, rollBar.pos.y + rbSpacing*2 + 14);
            ctx.fillText(filterChangesText, rollBar.pos.x + rollBar.size.x/2, rollBar.pos.y + rbBodyHeight - rbSpacing*2);
            // кнопки
            buttonChangeFilter.pos = rollBar.pos.sumxy(rollBar.size.x - rbRollWidth - rbSpacing, rbSpacing);
            buttonOpenPref.pos = rollBar.pos.sumxy(rollBar.size.x - rbBodyHeight + rbSpacing, rbSpacing);
            buttonChangeFilter.sizedZoom(new Vector2(rbBodyHeight - rbSpacing*2));
            buttonOpenPref.sizedZoom(new Vector2(rbBodyHeight - rbSpacing*2));
            buttonChangeFilter.draw();
            buttonOpenPref.draw();
        };
        //
        ctx.globalAlpha = 1;
        // state model
        if(rollBar.state === 'init') {
            if(imageChangeFilter.complete && imagePrefMenu.complete) {
                // unaval all
                buttonDoRoll.state = 'unaval';
                buttonChangeFilter.state = 'unaval';
                buttonOpenPref.state = 'unaval';
                //
                rollBar.state = 'complete'
            }
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
mlcMusicBar.onset = (value) => {musicNormal.currentTime = value};
mlcMusicBar.onhover = (value) => {
    ctx.fillStyle = '#fff'; ctx.textAlign = 'end'; ctx.font = 'bold 12px Consolas';
    ctx.fillText(timeStringify(value), mouse.pos.x-2, mlcMusicBar.pos.y+mlcBarSize.y+12)
};
//
let musicLite = {
    anchor: new Vector2(0.5, 0),
    pos: new Vector2(),
    size: new Vector2(mlcButtonSize*2 + mlcSpacing*2 + mlcBarSize.x, mlcButtonSize),
    spacing: 5,
    //
    dur: '',
    name: '', old: '',
    //
    draw: () => {
        if(pref.playerShow) {musicLite.drawfunc()}
    },
    drawfunc: () => {
        // position
        musicLite.size = new Vector2(mlcButtonSize*2 + mlcSpacing*2 + mlcBarSize.x, mlcButtonSize);
        musicLite.pos = globalAlign(musicLite.anchor, musicLite.size).sumxy(0, mlcSpacing);
        // bar
        mlcMusicBar.pos = musicLite.pos.sumxy(mlcButtonSize + mlcSpacing, mlcButtonSize - (mlcBarSize.y + mlcSpacing));
        mlcMusicBar.update(musicNormal.currentTime, musicNormal.duration);
        mlcMusicBar.draw();
        // buttons
        buttonPauseTrack.pos = musicLite.pos;
        buttonNextTrack.pos = musicLite.pos.sumxy(mlcButtonSize + mlcSpacing*2 + mlcBarSize.x, 0);
        buttonPauseTrack.sizedZoom(new Vector2(mlcButtonSize));
        buttonNextTrack.sizedZoom(new Vector2(mlcButtonSize));
        buttonPauseTrack.draw();
        buttonNextTrack.draw();
        // text
        ctx.font = '16px Segoe UI';
        if(musicLite.name !== musicLite.old) {
            var len = ctx.measureText(musicLite.name).width;
            if(len > mlcBarSize.x*0.75) {
                len = Math.floor(musicLite.name.length * ((mlcBarSize.x*0.75) / len)) - 3
                musicLite.name = musicLite.name.substring(0, len) + '...'
            };
            //
            musicLite.state = 'text';
            musicLite.dtime = 0;
            musicLite.old = musicLite.name
        };
        // draw text
        ctx.fillStyle = '#fffb'; ctx.textAlign = 'start';
        ctx.fillText(musicLite.name, musicLite.pos.x + mlcButtonSize + mlcSpacing*2, musicLite.pos.y + 20);
        //
        ctx.textAlign = 'end';
        String(musicNormal.duration) === 'NaN' ? null : musicLite.dur = musicNormal.duration;
        ctx.fillText(`${timeStringify(musicNormal.currentTime)} - ${timeStringify(musicLite.dur)}`, 
            musicLite.pos.x + mlcButtonSize + mlcBarSize.x, musicLite.pos.y + 20)
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
    nameboxhue: -1,
    //
    dragged: false,
    idleSpeed: 1,
    winnerPos: -1,
    winnerStyle: null,
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
            roulette.pics[pic] = new imageFitFrame(roulette.pics[pic]);
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
        var flag = Math.round(roulette.progress.get());
        while(flag < 0) {flag += roulette.picsCount};
        while(flag > roulette.picsCount - 1) {flag -= roulette.picsCount};
        return roulette.anime[flag]
    },
    centerNumber: () => {
        var n = Math.round(roulette.progress.get());
        while(n < 0) {n += roulette.picsCount};
        while(n > roulette.picsCount - 1) {n -= roulette.picsCount};
        return n
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
            roulette.pics[roulette.winnerPos].bgColor = fitFrameBg;
            roulette.winnerPos = -1
        }, 500)};
        roulette.time = 0;
        roulette.atime = time * (1 + (Math.random() * roulette.randomizer) - roulette.randomizer/2);
        roulette.speedMax = speed * (1 + (Math.random() * roulette.randomizer) - roulette.randomizer/2);
        roulette.catchWinner = true;
        //
        localStorage.removeItem(savePrefix+'roulette.winner');
        //
        musicRollStart()
    },
    draw: () => {
        // обновляем
        roulette.centerAnime = roulette.centerItem();
        if(roulette.winnerPos != -1) {
            roulette.winnerStyle = gradWinner(roulette.pics[roulette.winnerPos].framehue);
            roulette.pics[roulette.winnerPos].bgColor = roulette.winnerStyle
        };
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
                roulette.nameboxhue = roulette.pics[roulette.winnerPos].framehue;
                roulette.progress.move(roulette.winnerPos, 0.5, easeOutQuint);
                winnerRelease.move(1, 2, easeOutQuint);
                roulette.time = roulette.atime;
                console.log('Победитель:'+roulette.catchWinner['title'] + '\n' + roulette.catchWinner['sources'][0]);
                musicRollEnd();
                setTimeout(() => {playSound(sound['winner'])}, 100);
                lsSaveObject('roulette.winner', [roulette.winnerPos, roulette.catchWinner])
            }
        };
        // звучим и обновляем ссылки
        if(roulette.oldCenter !== roulette.centerAnime) {
            if(roulette.catchWinner || roulette.dragged) {playSound(sound['scroll'])};
            roulette.anime[roulette.winnerPos] === roulette.centerAnime
            ? roulette.nameboxhue = roulette.pics[roulette.winnerPos].framehue
            : roulette.nameboxhue = -1;
            //
            namebox.text = roulette.centerAnime['title'];
            sites.state = 'get';
            tInfo.updateTitle(roulette.centerAnime);
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
        //
        roulette.sorted = [];
        var depos = roulette.progress.get() - Math.round(roulette.progress.get());
        // for coloring
        var huecircle = roulette.pics.length > 20 
            ? roulette.pics.length / Math.ceil(roulette.pics.length / 20)
            : roulette.pics.length
        //
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
            // frame coloring
            item.framehue = Math.round(elem - huecircle*Math.floor(elem/huecircle)) * (360/huecircle);
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
        ctx.lineWidth = fitImageBorder;
        for(a in roulette.sorted) {
            roulette.sorted[a].draw()
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
    var tf = {align: new Vector2(), zoom: 0, alpha: 0};
    // align, 3 steps
    if(p > 0 && p <= 0.4) {
        tf.align = new Vector2(0.05 + (0.23+_itemsmapperx) * easeInCubic(p*2.5) - _itemsmapperx, 0.05 + 0.1 * easeInCubic(p*2.5));
        tf.zoom = 0.3 + 0.5 * (p*2.5);
        tf.alpha = p*2.5
    } else if (p > 0.4 && p <= 0.6) {
        tf.align = new Vector2(0.28 + 0.44 * (p-0.4)*5, 0.15 + 0.02 * easeParabolaQuad((p-0.4)*5));
        tf.zoom = 0.8 + 0.2 * easeParabolaQuad((p-0.4)*5);
        tf.alpha = 1
    } else {
        tf.align = new Vector2(1 - (0.23+_itemsmapperx) * easeInCubic(((p-0.6)*2.5)-1) - 0.05 + _itemsmapperx, 0.05 + 0.1 * easeInCubic(((p-0.6)*2.5)-1));
        tf.zoom = 0.8 - 0.5 * ((p-0.6)*2.5);
        tf.alpha = 1 - (p-0.6)*2.5
    };
    //
    return tf
};
//
// @EAG STUFF ROULETTE
//
function radialShadow(p=0) {
    var d = cvssize;
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
let rouletteMapBar = new ShapedSelectBar(new Vector2(cvssize.x*0.3, rmpBarHeight), colorMatrix(`rgba(0,0,0,0)`), colorMatrix(`rgba(0,0,0,0.5)`));
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
    fillRectRounded(new Vector2(s.y*2, s.y), p.sumxy(s.x * (rp / roulette.picsCount) - s.y, 0), '#44fc', s.y/2);
    if(typeof roulette.catchWinner !== 'boolean') {
        fillRectRounded(new Vector2(s.y), p.sumxy(s.x * (roulette.winnerPos / roulette.picsCount) - s.y/2, 0), '#4f4c', s.y/2)
    }
};
function drawMapRoulette() {
    if(pref.showMap) {
        rouletteMapBar.size = new Vector2(cvssize.x*0.3, rmpBarHeight);
        rouletteMapBar.pos = globalAlign(new Vector2(0.5, 0.5), rouletteMapBar.size).sumxy(0, rouletteMapBar.size.y);
        var p = roulette.progress.get(); p = p > roulette.picsCount ? roulette.picsCount : p < 0 ? 0 : p;
        rouletteMapBar.update(p, roulette.picsCount);
        rouletteMapBar.draw()
    }
};
//
// @EAG SCREEN LOADING
//
let sload = {
    state: 'none',
    time: 1,
    alpha: new Vector1(0),
    //
    bgcolor: 'rgba(48,48,143,1)',
    //
    text: {
        jkrg: `Думаем...`,
        pics: `Грузим картинки...`,
        gen: `Генерируем рулетку...`,
        done: `Готово!`,
        fevent: `Нажмите в любую область экрана для продолжения...`,
    },
    init: false,
};
window.onload = () => {sload.state = 'show'};
//
let firstMouseEvent = false;
let dynamicBgcolor = colorMatrix(sload.bgcolor).alpha(0);
let staticBgcolor = '#000';
let imageLoadProgress = new TextBox(globalAlign(new Vector2(0.5, 0.3)), new Vector2(400));
let loadImagesBar = `rgba(15,15,80,1)#rgba(100,100,255,1)#rgba(0,0,0,1)#rgba(0,0,0,1)`;
//
function screenLoading() {
    fillRect(cvssize, globalAlign(new Vector2(0.5), cvssize), dynamicBgcolor.getColor());
    //
    if(sload.state === 'show') {
        sload.alpha.move(1, sload.time, easeInOutSine);
        dynamicBgcolor.fadeTo(colorMatrix(sload.bgcolor), sload.time);
        imageLoadProgress.text = sload.text.jkrg;
        imageLoadProgress.shadow.x = imageLoadProgress.size.x;
        databaseShorter();
        //
        arrayImagesComplete(invokedImages) ? sload.state = 'wait' : false
    //
    } else if(sload.state === 'wait') {
        sload.alpha.update();
        dynamicBgcolor.update();
        shapeProgressBar(new Vector2(0.5, 0.75), new Vector2(400, 12), sload.alpha.get(), colorMapMatrix(loadImagesBar));
        //
        if(sload.alpha.get() >= 1) {
            sload.alpha.set(1);
            dynamicBgcolor = colorMatrix(sload.bgcolor);
            roulette.alphaMult = 0;
            roulette.zoomMult = 0;
            roulette.addAlign = new Vector2(0),
            roulette.addAlign = srv.rhAlign.get();
            sload.state = 'demo';
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
        imageLoadProgress.text = sload.text.gen;
        shapeProgressBar(new Vector2(0.5, 0.75), new Vector2(400, 12), 1, colorMapMatrix(loadImagesBar));
    //
    } else if(sload.state === 'loadnew') {
        // ресетим рулетку
        roulette.alphaMult = 0;
        roulette.zoomMult = 0;
        roulette.addAlign = new Vector2(0),
        roulette.addAlign = srv.rhAlign.get();
        //
        imageLoadProgress.text = sload.text.pics + ` (${roulette.picsComplete()}/${roulette.pics.length})`;
        shapeProgressBar(new Vector2(0.5, 0.75), new Vector2(400, 12), 0, colorMapMatrix(loadImagesBar));
        sload.state = 'loadstart'

    // 
    } else if(sload.state === 'loadstart') {
        imageLoadProgress.text = sload.text.pics + ` (${roulette.picsComplete()}/${roulette.pics.length})`;
        shapeProgressBar(new Vector2(0.5, 0.75), new Vector2(400, 12), roulette.picsComplete()/roulette.pics.length, colorMapMatrix(loadImagesBar));
        //
        if(roulette.picsComplete() == roulette.pics.length) {
            if(firstMouseEvent) {playSound(sound['loaded'])};
            imageLoadProgress.text = sload.text.done;
            srv.hideProgress.set(1);
            srv.hideProgress.move(0, 1, easeOutExpo);
            roulette.complete = false;
            roulette.setFrames();
            //
            sload.state = 'none';
            setTimeout(() => {sload.state = 'loadend'}, sload.time*1000)
        }
    } else if(sload.state === 'loadend') {
        if(!firstMouseEvent) {imageLoadProgress.text = sload.text.fevent};
        if(roulette.complete) {
            if((mouse.click && mouse.pos.overSAND(new Vector2()) && mouse.pos.lessSAND(cvssize)) || firstMouseEvent) {
                if(!lsItemUndefined('roulette.winner')) {
                    [roulette.winnerPos, roulette.catchWinner] = lsLoadObject('roulette.winner', [roulette.winnerPos, roulette.catchWinner]);
                    roulette.speed.reset();
                    roulette.progress.set(-10);
                    roulette.progress.move(roulette.winnerPos, 3, easeOutExpo);
                    setTimeout(() => {winnerRelease.move(1, 2, easeOutQuint); setTimeout(() => {playSound(sound['winner'])}, 100)}, 3*1000)
                } else {
                    roulette.speed.value = 30;
                    roulette.speed.move(1, 3, easeOutCubic);
                };
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
    alignImageSized(imageChangeFilter, new Vector2(0.5, 0.25), new Vector2(200));
    imageLoadProgress.pos = globalAlign(new Vector2(0.5, 0.65));
    ctx.textAlign = 'center';
    imageLoadProgress.castShadow();
    setTextStyle(28, 'Segoe UI', colorMatrix(`rgba(255,255,255,1)`));
    imageLoadProgress.draw();
};
//
// @EAG SCREEN ROULETTE
//
let srv = {
    state: 'init',
    hideProgress: new Vector1(),
    hideTime: 1,
    //
    rhAlign: new Vector2(0, -0.5),
};
//
let namebox = new TextBox(new Vector2(), new Vector2(640, 0));
namebox.dissolving = true;
namebox.shadow.x = namebox.size.x/2;
//
_lastbufferedtitle = '';
namebox.onupd = () => {
    var hover = false;
    if(roulette.catchWinner !== true 
    && mouse.pos.overAND(namebox.getShadowPos()) 
    && mouse.pos.lessAND(namebox.getShadowPos().sumv(namebox.shadow.get()))) {
        hover = true;
        if(mouse.click) {
            _lastbufferedtitle = prompt('Ctrl+C   :P', roulette.centerAnime['title'])
        }
    };
    ctx.font = '16px Segoe UI'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    if(hover) {ctx.fillText('Нажмите, чтобы скопировать', cvssize.x/2, cvssize.y-5)}
};
//
function screenRoulette() {
    sload.init = true;
    var srvhp = srv.hideProgress.get();
    if(srv.state === 'show_roulette') {
        fillRect(cvssize, globalAlign(new Vector2(0.5), cvssize), radialShadow(srvhp));
        srv.hideProgress.update();
        // развёртываем рулетку
        roulette.alphaMult = 1 - srvhp;
        roulette.zoomMult = 1 - srvhp;
        roulette.addAlign = srv.rhAlign.multv(new Vector2(srvhp));
        // рисуем
        roulette.draw();
        rollBar.draw();
        ctx.globalAlpha = (1 - srvhp);
        sites.draw(); tInfo.draw(); musicLite.draw(); drawMapRoulette();
        ctx.globalAlpha = 1;
        if(srvhp <= 0) {
            roulette.complete = true;
            srv.state = 'idle'
        }
    //
    } else if(srv.state === 'idle') {
        fillRect(cvssize, globalAlign(new Vector2(0.5), cvssize), radialShadow(0));
        ctx.textAlign = 'center';
        namebox.castShadow();
        namebox.pos = globalAlign(new Vector2(0.5, 0.8), new Vector2(0, namebox.shadow.get().y));
        setTextStyle(28, 'Segoe UI', colorMatrix(`rgba(255,255,255,1)`));
        if(roulette.nameboxhue > 0) {ctx.fillStyle = `hsl(${roulette.nameboxhue}deg 100% 75%)`};
        namebox.draw();
        //
        roulette.draw();
        rollBar.draw();
        sites.draw();
        tInfo.draw();
        drawMapRoulette();
        musicLite.draw();
    //
    } else if(srv.state === 'roll_start') {
        fillRect(cvssize, globalAlign(new Vector2(0.5), cvssize), radialShadow(0));
        srv.hideProgress.update();
        //
        namebox.pos = globalAlign(new Vector2(0.5, 0.8+0.05*srvhp), new Vector2(0, namebox.shadow.get().y));
        ctx.textAlign = 'center';
        namebox.castShadow();
        setTextStyle(28+8*srvhp, 'Segoe UI', colorMatrix(`rgba(255,255,255,1)`));
        namebox.measureShadow();
        if(roulette.nameboxhue > 0) {ctx.fillStyle = `hsl(${roulette.nameboxhue}deg 100% 75%)`};
        namebox.draw();
        //
        roulette.draw();
        rollBar.draw();
        ctx.globalAlpha = (1 - srvhp);
        sites.draw(); tInfo.draw(); musicLite.draw(); drawMapRoulette();
        ctx.globalAlpha = 1;
        //
        if(srvhp >= 1) {
            srv.state = 'roll'
        }
    //
    } else if(srv.state === 'roll') {
        fillRect(cvssize, globalAlign(new Vector2(0.5), cvssize), radialShadow(0));
        namebox.pos = globalAlign(new Vector2(0.5, 0.85), new Vector2(0, namebox.shadow.get().y));
        ctx.textAlign = 'center';
        namebox.castShadow();
        setTextStyle(36, 'Segoe UI', colorMatrix(`rgba(255,255,255,1)`));
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
        fillRect(cvssize, globalAlign(new Vector2(0.5), cvssize), radialShadow(0));
        srv.hideProgress.update();
        //
        namebox.pos = globalAlign(new Vector2(0.5, 0.8+0.05*srvhp), new Vector2(0, namebox.shadow.get().y));
        ctx.textAlign = 'center';
        namebox.castShadow();
        setTextStyle(28+8*srvhp, 'Segoe UI', colorMatrix(`rgba(255,255,255,1)`));
        namebox.measureShadow();
        if(roulette.nameboxhue > 0) {ctx.fillStyle = `hsl(${roulette.nameboxhue}deg 100% 75%)`};
        namebox.draw();
        //
        roulette.draw();
        rollBar.draw();
        ctx.globalAlpha = (1 - srvhp);
        sites.draw(); tInfo.draw(); musicLite.draw(); drawMapRoulette();
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
function sbTextHeader(text, pos, width, spacing, scroll=0) {
    var size = new Vector2(width, spacing*2 + ctx.measureText(text).fontBoundingBoxAscent);
    ctx.fillStyle = '#fff';
    ctx.fillText(text, pos.x + size.x/2, pos.y + size.y - spacing*2 - scroll);
    return size.y
};
function sbTextFit(text, pos, width, spacing, scroll=0, color='#fff') {
    var [array, measure] = textWidthFit(text, width - spacing*2);
    ctx.fillStyle = color;
    fillTextArray(pos.sumxy(spacing, spacing - scroll), [array, measure], spacing);
    return spacing*2 + measure.y * array.length;
};
function sbButtonPrefix(text, button, pos, width, spacing, scroll=0) {
    var size = new Vector2(width, spacing*2 + button.size.y);
    button.pos.setv(pos.sumxy(width - (button.size.x + spacing), spacing - scroll));
    ctx.fillStyle = '#fff'; ctx.textAlign = 'start';
    ctx.fillText(text, pos.x + spacing, pos.y + size.y - spacing*2 - scroll);
    ctx.textAlign = 'center';
    button.draw();
    return size.y + spacing
};
function sbCenteredButton(button, pos, width, spacing, scroll=0) {
    var size = new Vector2(width, spacing*2 + button.size.y);
    button.pos.setv(pos.sumxy(width/2 - button.size.x/2, spacing - scroll));
    button.draw();
    return size.y + spacing
};
function sbThreeButtonAlign(array, pos, width, spacing, scroll=0) {
    var size = new Vector2(width, spacing*2 + array[0].size.y);
    array[0].size.x = array[1].size.x = array[2].size.x = (width - spacing*2)/3;
    array[0].pos.setv(pos.sumxy(0, spacing - scroll));
    array[1].pos.setv(pos.sumxy(width/2 - array[1].size.x/2, spacing - scroll));
    array[2].pos.setv(pos.sumxy(width - array[2].size.x, spacing - scroll));
    array[0].draw();
    array[1].draw();
    array[2].draw();
    return size.y + spacing
};
function sbSelectbarPrefix(text, text2, bar, pos, width, spacing, scroll=0) {
    var size = new Vector2(width, spacing*2 + ctx.measureText(text).fontBoundingBoxAscent);
    bar.pos = pos.sumxy(width - (bar.size.x + spacing), spacing*2 - scroll);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'end';
    ctx.fillText(text2, (pos.x + size.x) - (spacing*2 + bar.size.x), pos.y + size.y - spacing*2 - scroll);
    ctx.textAlign = 'start';
    ctx.fillText(text, pos.x + spacing, pos.y + size.y - spacing*2 - scroll);
    bar.draw();
    return size.y + spacing
};
//
// @EAG STUFF FILTER
//
let tagSelection = {
    'unknown':          'exc',
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
    'yaoi':             'exc',
    'yuri':             'none',
    // other
    'work':             'none',
    'tsundere':         'none',
    'yandere':          'none',
    'rpg':              'none',
    'detective':        'none',
    'space':            'none',
    'future':           'none',
    'survival':         'none',
    'crime':            'none',
    'cooking':          'none',
    'math':             'none',
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
let presetButtonFont = 'bold 16px Segoe UI Light';
let tagButtons = {};
let tagButtonsFont = 'bold 18px Segoe UI Light';
//
let filterButtonsSpacing = 8;
let filterHeaderWeight = 50;
let filterHeaderFont = 'Segoe UI Light';
//
function generatePresetButtons() {
    var measure, size;
    ctx.textAlign = 'center'; ctx.font = presetButtonFont;
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
    ctx.textAlign = 'center'; ctx.font = tagButtonsFont;
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
    // обновляем тэги
    tagSelectionPrepare()
};
resetFilter();
tagSelectionPrepare();
filterPresetOnly = JSON.stringify(filterModify(filterDefault, presetbase[presetSelected].addon()));
filterDefault = lsLoadObject('filterDefault', filterDefault);
tagSelection = lsLoadObject('tagSelection', tagSelection);
//
function generateAnotherButton(value) {
    var measure, size;
    ctx.textAlign = 'center'; ctx.font = tagButtonsFont;
    measure = ctx.measureText(filterItemNames[value]);
    size = new Vector2(Math.floor(measure.width), measure.fontBoundingBoxAscent).sumxy(filterButtonsSpacing*2);
    var button = new TextButtonShaped(shapeRectRounded, filterItemNames[value], size, 
        colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
        colorMapMatrix(`rgba(173,83,19,1)#rgba(222,90,0,1)#rgba(222,90,0,1)#rgba(200,200,47,0.5)`));
    button.isSwitcher = true; button.initactivity = filterDefault[value];
    eval(`button.onclick = () => {filterDefault['${value}'] = true}; lsSaveObject('filterDefault', filterDefault)`);
    eval(`button.ondeact = () => {filterDefault['${value}'] = false}; lsSaveObject('filterDefault', filterDefault)`);
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
let buttonFilterYearMin = new TextButtonShaped(shapeRectRounded, filterDefault['yearMin'], new Vector2(250, 40),
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(32,128,128,1)#rgba(48,180,180,1)#rgba(64,255,255,1)#rgba(200,200,47,0.1)`));
buttonFilterYearMin.onclick = () => {
    playSound(sound['prompt']);
    filterDefault['yearMin'] = promptNumber(`Введите целое число меньше ${filterDefault['yearMax']}.`, 0, filterDefault['yearMax']-1, filterDefault['yearMin']); lsSaveObject('filterDefault', filterDefault)};
let buttonFilterYearMax = new TextButtonShaped(shapeRectRounded, filterDefault['yearMax'], new Vector2(250, 40),
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(32,128,128,1)#rgba(48,180,180,1)#rgba(64,255,255,1)#rgba(200,200,47,0.1)`));
buttonFilterYearMax.onclick = () => {
    playSound(sound['prompt']);
    filterDefault['yearMax'] = promptNumber(`Введите целое число больше ${filterDefault['yearMin']}.`, filterDefault['yearMin']+1, 2099, filterDefault['yearMax']); lsSaveObject('filterDefault', filterDefault)};
let buttonFilterEpsMin = new TextButtonShaped(shapeRectRounded, filterDefault['episodeMin'], new Vector2(250, 40),
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(32,128,128,1)#rgba(48,180,180,1)#rgba(64,255,255,1)#rgba(200,200,47,0.1)`));
buttonFilterEpsMin.onclick = () => {
    playSound(sound['prompt']);
    filterDefault['episodeMin'] = promptNumber(`Введите целое число меньше ${filterDefault['episodeMax']}.`, 1, filterDefault['episodeMax']-1, filterDefault['episodeMin']); lsSaveObject('filterDefault', filterDefault)};
let buttonFilterEpsMax = new TextButtonShaped(shapeRectRounded, filterDefault['episodeMax'], new Vector2(250, 40),
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(32,128,128,1)#rgba(48,180,180,1)#rgba(64,255,255,1)#rgba(200,200,47,0.1)`));
buttonFilterEpsMax.onclick = () => {
    playSound(sound['prompt']);
    filterDefault['episodeMax'] = promptNumber(`Введите целое число больше ${filterDefault['episodeMin']}.`, filterDefault['episodeMin']+1, 9999, filterDefault['episodeMax']); lsSaveObject('filterDefault', filterDefault)};
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
};
//
let buttonFilterLeave = new TextButtonShaped(shapeRectRounded, 'Назад', new Vector2(240, 60),
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(24,110,24,1)#rgba(40,160,40,1)#rgba(63,255,63,1)#rgba(200,200,47,0.1)`));
buttonFilterLeave.onclick = () => {requestScreen(screenRoulette, false)};
let buttonFilterApply = new TextButtonShaped(shapeRectRounded, 'Применить', new Vector2(240, 60),
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(24,110,24,1)#rgba(40,160,40,1)#rgba(63,255,63,1)#rgba(200,200,47,0.1)`));
buttonFilterApply.onclick = () => {animeFilterApply()};
let buttonFilterReset = new TextButtonShaped(shapeRectRounded, 'Сбросить', new Vector2(240, 60),
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(24,110,24,1)#rgba(40,160,40,1)#rgba(63,255,63,1)#rgba(200,200,47,0.1)`));
buttonFilterReset.onclick = () => {resetFilter(); tagSelectionPrepare(); lsSaveObject('tagSelection', tagSelection)};
//
let buttonSwitchPreset = new TextButtonShaped(shapeRectRounded, 'Применить пресет', new Vector2(300, 50),
    colorMapMatrix(`rgba(220,220,220,1)#rgba(255,255,255,1)#rgba(255,255,255,1)#rgba(255,255,255,0.6)`),
    colorMapMatrix(`rgba(24,110,24,1)#rgba(40,160,40,1)#rgba(63,255,63,1)#rgba(200,200,47,0.1)`));
buttonSwitchPreset.onclick = () => {presetSwitcher(); lsSaveObject('tagSelection', tagSelection)};
//
function tagSelectionPrepare() {
    tagSelection = JSON.parse(tagSelectionString);
    //
    for(t in filterDefault.tagsIncluded) {
        tagSelection[filterDefault.tagsIncluded[t]] = 'inc'
    };
    for(t in filterDefault.tagsExcluded) {
        tagSelection[filterDefault.tagsExcluded[t]] = 'exc';
        tagButtons[filterDefault.tagsExcluded[t]].tap.set(_imagebuttonheight-1)
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
        console.error('Ни одного тайтла, прошедшего по условиям фильтра, не найдено! Фильтр восстановлен до настроек пресета.');
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
let changeableValues = [
    'NSFW', 'episodeMin', 'episodeMax', 'yearMin', 'yearMax',
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
    widthperc: 0.75,
    width: 0,
    height: 0,
    scroll: new Vector1(0),
    sensivity: 100,
    //
    pointer: 0,
    pointer2: 0,
    //
    text: {
        preset: 'Нажмите на пресет, чтобы узнать, что именно он изменяет. Применение пресета выставит новые значения последующих настроек фильтра.',
        warn: 'Применение фильтра перезапишет старые элементы рулетки и удалит ПОБЕДИТЕЛЯ, если он уже определялся до этого.',
    },
}; 
//
function screenAnimeFilter() {
    // update
    actualizeFilterButtons();
    saf.scroll.update();
    saf.bgcolor = `rgba(0,0,0,${pref.bgalpha})`;
    // scrolling
    if(cvssize.y >= saf.height) {saf.scroll.set(0)}
    else {
        if(saf.scroll.get() < saf.height - cvssize.y && wheelState === 'btm') {
            saf.scroll.move(Math.floor(saf.scroll.getFixed())+saf.sensivity, 0.5, easeOutExpo)} 
        else if(saf.scroll.get() > 0 && wheelState === 'top') {
            saf.scroll.move(Math.floor(saf.scroll.getFixed())-saf.sensivity, 0.5, easeOutExpo)};
        if(saf.scroll.get() < 0) {saf.scroll.set(0)};
        if(saf.scroll.get() > saf.height - cvssize.y) {saf.scroll.set(saf.height - cvssize.y)}
    };
    //
    saf.width = cvssize.x * saf.widthperc;
    saf.height = 0;
    saf.xanchor = (cvssize.x - saf.width)/2 - filterButtonsSpacing;
    fillRect(new Vector2(saf.width + filterButtonsSpacing*2, cvssize.y), new Vector2(saf.xanchor, 0), saf.bgcolor);
    saf.height += filterButtonsSpacing;
    // заголовок пресетов
    fillRectRounded(new Vector2(saf.width, saf.pointer - saf.height), new Vector2(saf.xanchor+filterButtonsSpacing, saf.height - saf.scroll.get()), saf.selbox, 10);
    ctx.font = `bold ${filterHeaderWeight}px ${filterHeaderFont}`; ctx.textAlign = 'center';
    saf.height += sbTextHeader('Пресеты', new Vector2(saf.xanchor+filterButtonsSpacing, saf.height), saf.width, filterButtonsSpacing, saf.scroll.get());
    ctx.font = `20px ${filterHeaderFont}`;
    saf.height += sbTextFit(saf.text.preset, new Vector2(saf.xanchor+filterButtonsSpacing, saf.height), saf.width, filterButtonsSpacing, saf.scroll.get());
    saf.pointer = saf.height;
    // кнопки пресетов
    [saf.presetpos, saf.height] = positionsWidthBox(presetButtons, saf.width, filterButtonsSpacing, saf.height, saf.scroll.get());
    ctx.font = presetButtonFont;
    for(b in presetButtons) {
        presetButtons[b].pos.setv(saf.presetpos[b].sumxy((cvssize.x - saf.width)/2, filterButtonsSpacing));
        if(presetButtons[b].pos.y + presetButtons[b].size.y < 0) {continue};
        if(presetButtons[b].pos.y > cvssize.y) {continue};
        presetButtons[b].draw()
    };
    // применение пресета
    fillRectRounded(new Vector2(saf.width, saf.pointer2 - saf.height), new Vector2(saf.xanchor+filterButtonsSpacing, saf.height - saf.scroll.get()), saf.selbox, 10);
    ctx.font = `20px ${filterHeaderFont}`;
    saf.height += sbTextFit(presetbase[newPresetSelected].getInfo(), new Vector2(saf.xanchor+filterButtonsSpacing, saf.height), saf.width, filterButtonsSpacing, saf.scroll.get());
    ctx.font = 'bold 32px Segoe UI Light';
    saf.height += sbCenteredButton(buttonSwitchPreset, new Vector2(saf.xanchor+filterButtonsSpacing, saf.height), saf.width, filterButtonsSpacing, saf.scroll.get());
    saf.pointer2 = saf.height;
    // заголовок тэгов
    ctx.font = `bold ${filterHeaderWeight}px ${filterHeaderFont}`; ctx.textAlign = 'center';
    saf.height += sbTextHeader('Тэги', new Vector2(saf.xanchor+filterButtonsSpacing, saf.height), saf.width, filterButtonsSpacing, saf.scroll.get());
    // кнопки тэгов
    [saf.tagpos, saf.height] = positionsWidthBox(tagButtons, saf.width, filterButtonsSpacing*1.5, saf.height, saf.scroll.get());
    ctx.font = tagButtonsFont; ctx.textAlign = 'center';
    for(b in tagButtons) {
        tagButtons[b].pos.setv(saf.tagpos[b].sumxy((cvssize.x - saf.width)/2, filterButtonsSpacing));
        if(tagButtons[b].pos.y + tagButtons[b].size.y < 0) {continue};
        if(tagButtons[b].pos.y > cvssize.y) {continue};
        tagButtons[b].draw()
    };
    // заголовок штук
    ctx.font = `bold ${filterHeaderWeight}px ${filterHeaderFont}`;
    saf.height += sbTextHeader('Сезоны, типы и статусы', new Vector2(saf.xanchor+filterButtonsSpacing, saf.height), saf.width, filterButtonsSpacing, saf.scroll.get());
    // сезоны
    [saf.tagpos, saf.height] = positionsWidthBox(seasonButtons, saf.width, filterButtonsSpacing, saf.height, saf.scroll.get());
    ctx.font = tagButtonsFont;
    for(b in seasonButtons) {
        seasonButtons[b].pos.setv(saf.tagpos[b].sumxy((cvssize.x - saf.width)/2, filterButtonsSpacing));
        if(seasonButtons[b].pos.y + seasonButtons[b].size.y < 0) {continue};
        if(seasonButtons[b].pos.y > cvssize.y) {continue};
        seasonButtons[b].draw()
    };
    // типы
    [saf.tagpos, saf.height] = positionsWidthBox(typeButtons, saf.width, filterButtonsSpacing, saf.height, saf.scroll.get());
    for(b in typeButtons) {
        typeButtons[b].pos.setv(saf.tagpos[b].sumxy((cvssize.x - saf.width)/2, filterButtonsSpacing));
        if(typeButtons[b].pos.y + typeButtons[b].size.y < 0) {continue};
        if(typeButtons[b].pos.y > cvssize.y) {continue};
        typeButtons[b].draw()
    };
    // статусы
    [saf.tagpos, saf.height] = positionsWidthBox(statusButtons, saf.width, filterButtonsSpacing, saf.height, saf.scroll.get());
    for(b in statusButtons) {
        statusButtons[b].pos.setv(saf.tagpos[b].sumxy((cvssize.x - saf.width)/2, filterButtonsSpacing));
        if(statusButtons[b].pos.y + statusButtons[b].size.y < 0) {continue};
        if(statusButtons[b].pos.y > cvssize.y) {continue};
        statusButtons[b].draw()
    };
    // года
    ctx.font = `bold ${filterHeaderWeight}px ${filterHeaderFont}`;
    saf.height += sbTextHeader('Года', new Vector2(saf.xanchor+filterButtonsSpacing, saf.height), saf.width, filterButtonsSpacing, saf.scroll.get());
    ctx.font = '24px Segoe UI Light'; ctx.textAlign = 'start';
    saf.height += sbButtonPrefix('Минимально допустимый год выхода', buttonFilterYearMin, new Vector2(saf.xanchor+filterButtonsSpacing, saf.height), saf.width, filterButtonsSpacing, saf.scroll.get());
    ctx.textAlign = 'start';
    saf.height += sbButtonPrefix('Максимально допустимый год выхода', buttonFilterYearMax, new Vector2(saf.xanchor+filterButtonsSpacing, saf.height), saf.width, filterButtonsSpacing, saf.scroll.get());
    // серии
    ctx.font = `bold ${filterHeaderWeight}px ${filterHeaderFont}`;
    saf.height += sbTextHeader('Количество серий', new Vector2(saf.xanchor+filterButtonsSpacing, saf.height), saf.width, filterButtonsSpacing, saf.scroll.get());
    ctx.font = '24px Segoe UI Light'; ctx.textAlign = 'start';
    saf.height += sbButtonPrefix('Минимально допустимое кол-во серий', buttonFilterEpsMin, new Vector2(saf.xanchor+filterButtonsSpacing, saf.height), saf.width, filterButtonsSpacing, saf.scroll.get());
    ctx.textAlign = 'start';
    saf.height += sbButtonPrefix('Максимально допустимое кол-во серий', buttonFilterEpsMax, new Vector2(saf.xanchor+filterButtonsSpacing, saf.height), saf.width, filterButtonsSpacing, saf.scroll.get());
    // предупреждение перед применением
    saf.height += filterButtonsSpacing;
    ctx.font = '16px Segoe UI Light'; ctx.textAlign = 'center';
    saf.height += sbTextFit(saf.text.warn, new Vector2(saf.xanchor+filterButtonsSpacing, saf.height), saf.width, filterButtonsSpacing, saf.scroll.get(), '#f44');
    // действия с фильтром
    ctx.font = 'bold 32px Segoe UI Light';
    saf.height += sbThreeButtonAlign([buttonFilterLeave, buttonFilterApply, buttonFilterReset], new Vector2(saf.xanchor+filterButtonsSpacing, saf.height), saf.width, filterButtonsSpacing, saf.scroll.get());
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
let buttonPrefApply = new ImageButtonShaped(shapeRectRounded, imagePrefApply, new Vector2(prefButtonSpacing), 
    colorMapMatrix(`rgba(24,110,24,1)#rgba(40,160,40,1)#rgba(63,255,63,1)#rgba(47,200,47,0.3)`));
buttonPrefApply.onclick = () => {requestScreen(screenRoulette, false)};
let buttonPrefDefault = new ImageButtonShaped(shapeRectRounded, imagePrefDefault, new Vector2(prefButtonSpacing),
    colorMapMatrix(`rgba(110,24,24,1)#rgba(160,40,40,1)#rgba(255,63,63,1)#rgba(47,47,200,0.3)`));
buttonPrefDefault.onclick = () => {pref = JSON.parse(prefDefault); pref.lockfps ? lockFpsSwitch(pref.framerate) : lockFpsSwitch()};
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
prefRouletteImages.onset = (value) => {prefSetValue('rollImages', 3 + Math.round(value)*2)};
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
    prefRouletteImages.update((pref['rollImages'] - 3)/2, 7);
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
prefAudioRoll .onset = (value) => {prefSetValue('rollmusic', Math.round(value))};
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
let prefRenderWallpaper = new TextButtonShaped(shapeRectRounded, 'Сменить', new Vector2(prefOptionWidth, prefButtonHeight*1.2), colorMapMatrix(prefTextPalette), colorMapMatrix(prefPromptPalette));
let prefRenderParallax = new TextButtonShaped(shapeRectRounded, '', new Vector2(prefOptionWidth/2, prefButtonHeight), colorMapMatrix(prefTextPalette), colorMapMatrix(prefSwitchPalette));
prefRenderWallpaper.onclick = () => {setWallpaper(prompt('Вставьте ссылку на изображение', wallpaper.src))};
prefRenderParallax.isSwitcher = true; prefRenderParallax.height = 0; prefRenderParallax.needshadow = false;
prefRenderParallax.onclick = () => {prefSetValue('parallax', true)}; prefRenderParallax.ondeact = () => {prefSetValue('parallax', false)};
//
function actualPrefRender() {
    prefRenderFps.update((pref.framerate - 30)/5, 34);
    prefRenderBack.update(pref.bgalpha*100, 100);
    if(!pref.imageSmoothing) {
        prefRenderQuality.update(0, 2);
        prefRenderText = 'Выкл.'
    } else {
        if(pref.imageQuality === 'low') {
            prefRenderQuality.update(1, 2);
            prefRenderText = 'Низк.'
        } else {
            prefRenderQuality.update(2, 2);
            prefRenderText = 'Выс.'
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
    widthperc: 0.7,
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
    // scrolling
    if(cvssize.y >= spref.height) {spref.scroll.set(0)}
    else {
        if(spref.scroll.get() < spref.height - cvssize.y && wheelState === 'btm') {
            spref.scroll.move(Math.floor(spref.scroll.getFixed())+spref.sensivity, 0.5, easeOutExpo)} 
        else if(spref.scroll.get() > 0 && wheelState === 'top') {
            spref.scroll.move(Math.floor(spref.scroll.getFixed())-spref.sensivity, 0.5, easeOutExpo)};
        if(spref.scroll.get() < 0) {spref.scroll.set(0)};
        if(spref.scroll.get() > spref.height - cvssize.y) {spref.scroll.set(spref.height - cvssize.y)}
    };
    // start
    spref.width = cvssize.x * spref.widthperc - (prefButtonSpacing + prefButtonHeight)/2; spref.height = 0;
    spref.xanchor = (cvssize.x - spref.width)/2 + (prefButtonSpacing + prefButtonHeight)/2;
    fillRect(new Vector2(spref.width + prefButtonSpacing*2, cvssize.y), new Vector2(spref.xanchor, 0), spref.bgcolor);
    spref.height += prefButtonSpacing;
    // main buttons
    buttonPrefApply.sizedZoom(new Vector2(prefButtonHeight*2));
    buttonPrefDefault.sizedZoom(new Vector2(prefButtonHeight*2));
    buttonPrefApply.pos = new Vector2(spref.xanchor - (prefButtonSpacing*2 + prefButtonHeight*2), prefButtonSpacing);
    buttonPrefDefault.pos = new Vector2(spref.xanchor - (prefButtonSpacing*2 + prefButtonHeight*2), cvssize.y - (prefButtonHeight*2 + prefButtonSpacing + _imagebuttonheight));
    buttonPrefApply.draw(); buttonPrefDefault.draw();
    spref.alpha.update(); ctx.globalAlpha = spref.alpha.get();
    // НАСТРОЙКИ РУЛЕТКИ
    ctx.font = 'bold 54px Segoe UI'; ctx.textAlign = 'center';
    fillRectRounded(new Vector2(spref.width, spref.pointer - spref.height), new Vector2(spref.xanchor+prefButtonSpacing, spref.height - spref.scroll.get()), spref.selbox, 10);
    spref.height += sbTextHeader('Настройки', new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    spref.height += prefButtonSpacing;
    spref.pointer = spref.height;
    //
    actualPrefRoulette();
    ctx.font = 'bold 40px Segoe UI';
    spref.height += sbTextHeader('Рулетка', new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    ctx.font = '24px Segoe UI'; ctx.textAlign = 'start';
    spref.height += sbSelectbarPrefix('Время', Math.round(prefRouletteTime.point())+5, prefRouletteTime, new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    spref.height += sbSelectbarPrefix('Скорость', Math.round(prefRouletteSpeed.point())+10, prefRouletteSpeed, new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    spref.height += sbSelectbarPrefix('Максимум тайтлов', Math.round(prefRouletteTitles.point())+10, prefRouletteTitles, new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    spref.height += sbSelectbarPrefix('Тайтлов на экране', Math.round(prefRouletteImages.point())*2+3, prefRouletteImages, new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    spref.height += sbButtonPrefix('Авто-вращение', prefRouletteScroll, new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    spref.height += sbButtonPrefix('Показать карту', prefRouletteMap, new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    spref.height += sbButtonPrefix('Разрешить NSFW тайтлы', prefRouletteNSFW, new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    // НАСТРОЙКИ АУДИО
    actualPrefAudio();
    ctx.font = 'bold 40px Segoe UI'; ctx.textAlign = 'center';
    spref.height += sbTextHeader('Аудио', new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    ctx.font = '24px Segoe UI'; ctx.textAlign = 'start';
    spref.height += sbSelectbarPrefix('Звуки', Math.round(prefAudioSound.point()), prefAudioSound, new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    spref.height += sbSelectbarPrefix('Музыка (задний фон)', Math.round(prefAudioBG.point()), prefAudioBG, new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    spref.height += sbSelectbarPrefix('Музыка (вращение)', Math.round(prefAudioRoll.point()), prefAudioRoll, new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    spref.height += sbButtonPrefix('Другой трек при вращении', prefAudioNewTrack, new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    spref.height += sbButtonPrefix('Показать плеер', prefAudioShowPlayer, new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    // НАСТРОЙКИ ОТРИСОВКИ
    actualPrefRender();
    ctx.font = 'bold 40px Segoe UI'; ctx.textAlign = 'center';
    spref.height += sbTextHeader('Отрисовка', new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    ctx.font = '24px Segoe UI'; ctx.textAlign = 'start';
    spref.height += sbButtonPrefix('Ограничить FPS', prefRenderLockFps, new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    ctx.textAlign = 'start';
    spref.height += sbSelectbarPrefix('FPS', Math.round(prefRenderFps.point())*5 + 30, prefRenderFps, new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    spref.height += sbSelectbarPrefix('Сглаживание изображений', prefRenderText, prefRenderQuality, new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    spref.height += sbSelectbarPrefix('Непрозрачность теней', Math.round(prefRenderBack.point())/100, prefRenderBack, new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    spref.height += sbButtonPrefix(textStringLimit(`Задний фон - ${wallpaper.src}`, spref.width - (prefOptionWidth + prefButtonSpacing*2)), prefRenderWallpaper, new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    spref.height += _imagebuttonheight;
    // ДРУГОЕ
    spref.height += sbButtonPrefix('Параллакс', prefRenderParallax, new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    spref.height += sbButtonPrefix('Показать FPS', prefRenderShowFps, new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
    spref.height += sbButtonPrefix('Показать Доп. информацию', prefRenderDevInfo, new Vector2(spref.xanchor+prefButtonSpacing, spref.height), spref.width, prefButtonSpacing, spref.scroll.get());
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
        tss.alpha.set(0);
        tss.alpha.move(1, tss.fulltime/2, easeInQuint);
        tss.progress.move(1, tss.fulltime/2, easeInQuint);
        //
        tss.waitfunc = () => {
            ctx.fillRect(0, cvssize.y * (1 - tss.progress.get()), cvssize.x, cvssize.y * tss.progress.get());
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
        ctx.fillRect(0, 0, cvssize.x, cvssize.y);
        //
        tss.waitfunc = () => {
            ctx.fillRect(0, 0, cvssize.x, cvssize.y * tss.progress.get());
            if(tss.progress.get() <= 0) {
                tss.screen = () => {};
                tss.state = 'end'
            }
        };
        tss.state = 'wait'

    //
    } else if(tss.state === 'closehide') {
        playSound(sound['screen']);
        tss.alpha.set(0);
        tss.alpha.move(1, tss.fulltime/2, easeInQuint);
        tss.progress.move(1, tss.fulltime/2, easeInQuint);
        //
        tss.waitfunc = () => {
            ctx.fillRect(0, 0, cvssize.x, cvssize.y * tss.progress.get());
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
        ctx.fillRect(0, 0, cvssize.x, cvssize.y);
        //
        tss.waitfunc = () => {
            ctx.fillRect(0, cvssize.y * (1 - tss.progress.get()), cvssize.x, cvssize.y * tss.progress.get());
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
let wlpsize = new Vector2();
let parallaxSize = new Vector2();
let parallaxOffset = new Vector2();
let oldwallpaper = 'http://anime-zone.ru/inc/goods_wallpapers/lucky_star/lucky_star76.jpg';
wallpaper.src = lsLoadString('wallpaper', oldwallpaper);
wallpaper.onerror = () => {wallpaper.src = oldwallpaper};
//
function setWallpaper(src) {
    wallpaper.src = src
};
//
function updateWallSize() {
    if(oldwallpaper !== wallpaper.src && wallpaper.naturalHeight > 0) {
        lsSaveValue('wallpaper', wallpaper.src); 
        oldwallpaper = wallpaper.src
    };
    //
    var ir = wallpaper.naturalHeight / wallpaper.naturalWidth;
    if(cvssize.x / cvssize.y > ir) {
        wlpsize = new Vector2(cvssize.y / ir, cvssize.y);
        if(wlpsize.x < cvssize.x) {
            wlpsize = new Vector2(cvssize.x, cvssize.x * ir)
        }
    } else {
        wlpsize = new Vector2(cvssize.x, cvssize.x * ir);
        if(wlpsize.y < cvssize.y) {
            wlpsize = new Vector2(cvssize.y / ir, cvssize.y)
        }
    };
    if(pref.parallax) {
        parallaxSize = cvssize.dividexy(30);
        wlpsize = wlpsize.sumv(parallaxSize);
        parallaxOffset = parallaxSize.multv(mouse.pos.minv(cvssize.dividexy(2)).dividev(cvssize))
    } else {
        parallaxOffset.reset()
    }
};
//
function wallpaperImage() {
    if(!wallpaper.complete || !sload.init) {
        fillRect(cvssize, globalAlign(new Vector2(0.5), cvssize), staticBgcolor)
    } else {
        updateWallSize();
        drawImageSized(wallpaper, globalAlign(new Vector2(0.5), wlpsize).sumv(parallaxOffset), wlpsize);
        fillRect(cvssize, globalAlign(new Vector2(0.5), cvssize), '#0004')
    }
};
//
// @EAG RENDER ALL
//
let activeScreen = screenLoading;
//
let eagrendering;
function lockFpsSwitch(framerate = -1) {
    if(framerate > 0) {prefSetValue('framerate', framerate); prefSetValue('lockfps', true)} else {prefSetValue('lockfps', false)};
    eagrendering !== null ? clearInterval(eagrendering) : false;
    if(pref.lockfps) {
        eagrendering = setInterval(render, 1000/pref.framerate)
    } else {
        eagrendering = setInterval(render)
    }
};
pref.lockfps ? lockFpsSwitch(pref.framerate) : lockFpsSwitch();
//
function developInfo() {
    if(pref.showDebugInfo) {
        fillText(new Vector2(14, 30), 'FPS: '+FPS, '#fff', 'bold 16px Consolas');
        fillText(new Vector2(14, 45), 'roulette: '+Math.floor(roulette.progress.get()*10)/10+'/'+(roulette.picsCount-1), '#ccf', 'bold 12px Consolas');
        fillText(new Vector2(14, 60), 'cvs: '+Math.floor(cvssize.x)+'x'+Math.floor(cvssize.y), '#ccf', 'bold 12px Consolas');
        //
        graphFPS.update(FPS);
        graphFPS.draw(new Vector2(150, 10), 1, 0);
        ctx.textAlign = 'start'
    } else if(pref.showFPS) {
        fillText(new Vector2(14, 30), 'FPS: '+FPS, '#fff', 'bold 16px Consolas')
    }
};
//
//
function render() {
    // input & update
    canvasActualSize();
    calcFPS();
    inputListener();
    updatePreferences();
    RNG();
    updateMusic();
    // draw
    wallpaperImage();
    activeScreen();
    transitionScreen();
    ctx.textAlign = 'start';
    developInfo();
    // title
    ctx.font = 'italic 12px Consolas'; ctx.fillStyle = '#fff';
    ctx.fillText('ayayaxdd v0.72 beta', 2, cvssize.y-4);
    ctx.textAlign = 'end';
    ctx.fillText('created by potapello', cvssize.x-4, cvssize.y-4);
};