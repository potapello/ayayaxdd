const _dropboxAffix = ['https://www.dropbox.com/scl/fi/','&raw=1'];
// key ==> w0i5vrvg2qat8mawfjy2i/file.ext?rlkey=vc7tda62c9s0kfcznxnm02240
function _dropboxURL(key) {
    return String(_dropboxAffix[0] + key + _dropboxAffix[1])
};
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
    // new in 1.3 (for marathon)
    'teleport': new Audio('sounds/teleport.wav'),
    'warn': new Audio('sounds/warn.wav'),
    'coins': new Audio('sounds/coins.wav'),
    'opener': new Audio('sounds/opener.mp3'),
    'steps': new Audio('sounds/steps.wav'),
    'success': new Audio('sounds/success.wav'),
    'insp': new Audio('sounds/insp.wav'),
};
//
let music = [
    //['src', rolltime, 'name', ?'beatmap-index'],
    // 1.3.x | =27
    [_dropboxURL('6fez59jgu1mtiz1dliu8b/music00.m4a?rlkey=3jocsi4be1dk9bptrpyyf905s'), 61, 'Kuhaku Gokko - Lil\'b', 0],
    [_dropboxURL('6sjgslxw6l4n7fwf102dn/music01.m4a?rlkey=8bcv0orsqplyqgx7m7zdcgjb2'), 49, 'Miku Sawai - Gomen ne, Iiko ja Irarenai', 1],
    [_dropboxURL('4pksqcfn813ib89c63dvh/music02.m4a?rlkey=dnzlgiyvfrzlnl4m8x5813n1y'), 0, 'Cagayake! - GIRLS', 2],
    [_dropboxURL('7ytcdpxj66h357r4qnwdy/music03.m4a?rlkey=qhw1acr4s6xh9fp503mjuj372'), 60, 'Sachika Misawa - Links', 3],
    [_dropboxURL('ecsygwdebtkyd96xvnrzp/music04.m4a?rlkey=bq7rywb2rx0jbwqsew4y2hbiu'), 0, 'Aoi Yuki - Los! Los! Los!', 4],
    [_dropboxURL('8cc3wbf9tr40kw6l5cfgq/music05.m4a?rlkey=y3mgkbpirpn4umo9ngn9248ln'), 41, 'Ado - AntiSystem\'s', 5],
    [_dropboxURL('f7sghsflxhjgrr285uigk/music06.m4a?rlkey=mlgc1k9k18jffeqbd1uu931xf'), 44, 'Kenshi Yonezu - KICK BACK', 6],
    [_dropboxURL('8gjwnm27te5t4l1lywbme/music07.m4a?rlkey=1ux3k17drn9ocld1jma4c1p6n'), 34, 'BABYMETAL - Divine Attack', 7],
    [_dropboxURL('g1e9hsneapxy487g6xemh/music08.m4a?rlkey=1vcn4l69607ayff782d8yneox'), 0, 'Uesaka Sumire - Inner Urge', 8],
    [_dropboxURL('pglgg4ici7jb2a61xujav/music09.m4a?rlkey=3qqcwgdw7pxdx9g25vl1lhlpi'), 47.5, 'Kanako Itou - Fatima', 9],
    [_dropboxURL('8fs90nkpcq6d3rw0t26pp/music10.m4a?rlkey=glmbxapdpanxw9hy5d78id4px'), 36, 'Kanako Itou - Hacking to the Gate', 10],
    [_dropboxURL('5al9ofzosjgqfhac6bnpi/music11.m4a?rlkey=c5o4eshzim9twmaut386mw9cj'), 0, 'ZOE, Jododo - Lighting', 11],
    [_dropboxURL('e2vfj3xp30d8hsuirtwv1/music12.m4a?rlkey=tui6pbrv2xc7jvabw4qx5s3ku'), 0, 'Ikimono Gakari - Blue Bird', 12],
    [_dropboxURL('n0b26m3t1f0nsalyit8qm/music13.m4a?rlkey=asb3siiue4e7kfilhkhqpjy8l'), 46.5, 'Uverworld - Touch off', 13],
    [_dropboxURL('eom0q3foxx0b7ku8cb1z7/music14.m4a?rlkey=0wfj3nvkai2p0m1rk1vn4hhcv'), 55, 'Masayuki Suzuki - Love Dramatic', 14],
    [_dropboxURL('f5jyfwijl89tsj8aytxhy/music15.m4a?rlkey=hd9dudp7y9uz5qf7jqetcv54g'), 42, 'Konomi Suzuki - Redo', 15],
    [_dropboxURL('sltnkc3cob3wbldeiydky/music16.m4a?rlkey=kfdfpmjqqc3pocyh7fospdnbb'), 34, 'Huwie Ishizaki - Wasuregataki', 16],
    [_dropboxURL('dtawk4wbi8835ef2nkixh/music17.m4a?rlkey=gz94s2660msdwrs4qdfom5jtk'), 49, 'yama - Shikisai', 17],
    [_dropboxURL('oounnedy4756d7c7brhhq/music18.m4a?rlkey=5lsrdmtxo6bzjeybve82gdxfl'), 27, 'Kessoku Band - Seishun Complex', 18],
    [_dropboxURL('1tecvyy7gs78v7owj5f4f/music19.m4a?rlkey=ia5wrjf4je8s3uhnh5oixnczc'), 51, 'Perfume - Pick Me Up', 19],
    [_dropboxURL('o1yuvq3gfciw9m86sqvga/music20.m4a?rlkey=0cdehua3111b5tm67qrawoa8s'), 23, 'Nightcore - Everytime We Touch', 20],
    [_dropboxURL('pkthf66q2p3insxcdfhpk/music21.m4a?rlkey=5oklsgc21js6uur3tv57wkq2x'), 11, 'beatMARIO - Night of Nights', 21],
    [_dropboxURL('hyq89kcdkvn0vc2qzx0lg/music22.m4a?rlkey=fadxm0m3u17ogn1ro1b2d6zmd'), 48, 'FELT - Summer Fever', 22],
    [_dropboxURL('7aq3wuwkizar3s34ggcm7/music23.m4a?rlkey=joll5oytlr43vlxw9v8u6fxrq'), 20.5, 'SEREBRO - Мало тебя (speed up)', 23],
    [_dropboxURL('vfgpnlem0sw1ga4uug1c3/music24.m4a?rlkey=4qqg4i9tc565zblcfwn61s65w'), 50, 'Touhou - Bad Apple!!', 24],
    [_dropboxURL('t304vt9kur4oadu0zn2e4/music25.m4a?rlkey=5ceax45teng3hxnrxf26mdk58'), 42, 'ZUTOMAYO - TAIDADA', 25],
    [_dropboxURL('lenkf5pqx2lfolme0sshs/music26.m4a?rlkey=7jpno16utfhr4q3kxc70aweds'), 35, 'Kuhaku Gokko - Pikaro', 26],
    // 1.4.0 | +21
    [_dropboxURL('c5trk2qrotuck11yjh2d1/music27.m4a?rlkey=d9slxj9lscwf9ze724zq1twl4'), 35.5, 'Coda - Bloody Stream', 27],
    [_dropboxURL('jig45enqq2pz1h1b9zfg2/music28.m4a?rlkey=xvl3mklku2hty0noxgmklynw1'), 32, 'Chirijiri - Chilly', 28],
    [_dropboxURL('4fa4ns77dixkcd65d3y62/music29.m4a?rlkey=gcc5sz1ps8m3ptaj8n79wfikx'), 0, 'Shikairo Days - Shikanoko Nokonoko Koshitantan', 29],
    [_dropboxURL('a5o8et37go52to8v4pk97/music30.m4a?rlkey=elzjz572rjjojdpl7s7y89y07'), 36, 'Minami - Kawakiwo Ameku', 30],
    [_dropboxURL('qb30h1gw9f0wezikpbu1m/music31.m4a?rlkey=6jq9cgkw82e0lg1ch8ey5bakj'), 40, 'YOASOBI - Idol', 31],
    [_dropboxURL('pfer3fxrsybicbll0sbuc/music32.m4a?rlkey=njv15j4stzzxk9pjgfpavghme'), 0, 'Creepy Nuts - Daten', 32],
    [_dropboxURL('utqipw32j1hkug58o173h/music33.m4a?rlkey=25ryy5k103afnqzmtqo7ij2t5'), 57, 'Kana Hanazawa - Renai Circulation', 33],
    [_dropboxURL('qytfwt1pmvac6oqyo3qwn/music34.m4a?rlkey=f7m1f86dtm76cwugngcarhqck'), 45, 'Ryokuoushoku Shakai - Hana ni Natte', 34], // ostorozhno)
    [_dropboxURL('s700smf20axbzvhks0pep/music35.m4a?rlkey=85wob9xl9489b5onqnc1vz2ln'), 46, 'Yomitan Akane - Enma the Second', 35],
    [_dropboxURL('93xxt4ds4rpbc0onhpl01/music36.m4a?rlkey=m28m2wjp7p1yefuzof56eo5cr'), 39, 'SUPER EUROBEAT - Deja Vu', 36],
    [_dropboxURL('54m7j253fyhqafolhjxnr/music37.m4a?rlkey=xxghtiw1cejavumkwtl752pya'), 54, 'Vickeblanka - Black Catcher', 37],
    [_dropboxURL('7ghntknjfzpnpff3j1059/music38.m4a?rlkey=cpfzo43zqxh16ratgxud2d8r5'), 122, 'Millennium Parade, Sheena Ringo - Work', 38],
    [_dropboxURL('emgeqzhgxbkekvoa9temx/music39.m4a?rlkey=uwq35k2dkcnrg5hg1fvrc08hl'), 0, 'TK from Ling tosite sigure - Unravel', 39],
    [_dropboxURL('tn5ihvk1zbro06yis6v0c/music40.m4a?rlkey=ifgt8ntn2kubliscldfqlw8cq'), 38, 'YOASOBI - Brave', 40],
    [_dropboxURL('4xhczt70quopiwd6t5ow4/music41.m4a?rlkey=g3eqm8q0woxirmrg5yu7ou4gc'), 32, 'DAZBEE - Othello', 41],
    [_dropboxURL('s1m9ia3p69385vsx35d11/music42.m4a?rlkey=szzx8hba3j6cp7dju9qslbmgc'), 23.5, 'Hiiragi Magnetite - Tetoris', 42],
    [_dropboxURL('bnu8mtgmo9akvn9hvsbdq/music43.m4a?rlkey=vj8b6to9dgh3f426e5572yzb1'), 43.3, 'LUCK LIFE - Symbol', 43],
    [_dropboxURL('x88o3rcl3k8x8z247etsc/music44.m4a?rlkey=5hjvvcpumwocrcxu990nr05m3'), 41.3, 'Goose house - Hikaru Nara', 44],
    [_dropboxURL('79f1oybvhu5wzb2dxfhxu/music45.m4a?rlkey=z6kctra84ubsn23i7rjgxmpck'), 0, 'Nobodyknows - Hero\'s Come Back!!', 45],
    [_dropboxURL('e1hpncnz8mg9xkht5qhal/music46.m4a?rlkey=v1shyl2tznrtbxh9hs5pshjxr'), 38, 'OxT - Clattanoia', 46],
    [_dropboxURL('wbbr91qzb2elnpdiu2edi/music47.m4a?rlkey=h39j5zk498r0a6wxx6joey0b8'), 20, 'Miyu Tomita - OveR', 47],
];
//
const clip_cmv_audio = [
    // [_dropboxURL(key), timing, name],
    [_dropboxURL('7eqolwtn466y98qykyoun/vclip00.m4a?rlkey=282tq3ntzbgi1qsisw0wizgtd'), 31, 'Shikitashi - Botagiri (YTPMV)'],
    [_dropboxURL('piytrp2dvthujfgvspq6y/vclip01.m4a?rlkey=9l9uhjm0l0edg1kfb8t30q7re'), 55, 'skwd - Aquarius (YTPMV)'],
    [_dropboxURL('mofiwniiac3b1va2yvhnp/vclip02.m4a?rlkey=st33yjdnzjlwfmv02dkxu5vka'), 35, 'skwd - Point of no return (YTPMV)'],
    [_dropboxURL('7h9t7gkknaqoicmkgmcah/vclip03.m4a?rlkey=zbv0od1b8d7wone0a9fdhwcxm'), 78, 'beoh - Yuyushiki Factory (YTPMV)'],
    [_dropboxURL('6i9k6asyf393jisdtwi58/vclip04.m4a?rlkey=rspf6q2gesauhyuwd5147smsx'), 0, 'aku rin - INTR (YTPMV)'],
    [_dropboxURL('3pb08m82rzvoy0artdhw0/vclip05.m4a?rlkey=sdqfytfkrc68c6i1rdgbz3jn8'), 0, 'aku rin - HTDN (YTPMV)'],
    [_dropboxURL('fzr3d7wdsdibqungdryiv/vclip06.m4a?rlkey=sw9rcscl20p981ys7a5j35jzf'), 0, 'beoh - Old Castle Baby (YTPMV)'],
    [_dropboxURL('7602753cma3c3fk9m8yy1/vclip07.m4a?rlkey=uypj97tc5p779qx4dlnd4m1j2'), 0, 'Kyoro - Survive (YTPMV)'],
    [_dropboxURL('zyt7hwnvb6xs3j621kgg4/vclip08.m4a?rlkey=vn3i6gz10xnar74s8hw3mlb0i'), 0, 'beoh - hpes-shiki (YTPMV)'],
    [_dropboxURL('e77cv3imfgt5u5r3j669g/vclip09.m4a?rlkey=argwmhwdzkzrj2a5dsae34e0i'), 62, 'nanodot - It\'s just your fault (YTPMV)'],
];
//
const cliponly = [
    // [music_data[url, timing, name, beatmap], timing_for_clip] OR only `music_data[x]`
    // чисто для удобства и для команды (clip [x] [pm?])
    music[24],
    [music[2], 53.7],
    [music[5], 51.2],
    [music[8], 10.85],
    [music[6], 38.05],
    [music[9], 0.2],
    [music[10], 48.5],
    [music[25], 42],
    // new (1.4)
    [music[13], 47.5],
    [music[14], 54],
    [music[18], 38],
    [music[38], 122],
    [music[27], 36.9],
    [music[29], 43],
    [music[31], 40],
    [music[32], 19.5],
    [music[34], 45],
    music[42],
    // all ytpmv
    clip_cmv_audio[0],
    clip_cmv_audio[1],
    clip_cmv_audio[2],
    clip_cmv_audio[3],
    clip_cmv_audio[4],
    clip_cmv_audio[5],
    clip_cmv_audio[6],
    clip_cmv_audio[7],
    clip_cmv_audio[8],
    clip_cmv_audio[9],
];
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
const clips_cmv = [
    // new videoClip(music[x], rolltime, lifetime, 'key'),
    new videoClip(clip_cmv_audio[0], 2, 32.1,     '581hu1jc3ircjbofkafas/vclip00.mp4?rlkey=vfwfh9ckdezv131fk0ky4ity1', true), // botagiri [1]
    new videoClip(clip_cmv_audio[1], 2, 37,       'd5u9ei0oorcbd6l14f8ow/vclip01.mp4?rlkey=0mjmraov96oh2qyjwryq8ny4z', true), // aquarius [2]
    new videoClip(clip_cmv_audio[2], 2, 43.2,     'i9rfh8pqqg9aicalcbxh0/vclip02.mp4?rlkey=x6u1lqfxnb325vz3giqbashiq', true), // point of no k-on [3]
    new videoClip(clip_cmv_audio[3], 2, 38.8,     'sbk09q2k73m26t9875qdi/vclip03.mp4?rlkey=kwpjknozqahch37hpx6zzg417', true), // yuyushiki factory [4]
    new videoClip(clip_cmv_audio[4], 0, 26.5,    'ssu4ho353el3eb3713vb3/vclip04.mp4?rlkey=8iwycg1v3kgs7q94wl48wn0ou', true), // INTR [5]
    new videoClip(clip_cmv_audio[5], 0, 37,      's6ji3lh677cg11f6sm5rn/vclip05.mp4?rlkey=iajac609w7g53yji7f5orrv16', true), // HTDN [6]
    new videoClip(clip_cmv_audio[6], 0, 46.4,    '8yym70ipw4ston5d4b524/vclip06.mp4?rlkey=79uymw4muwhunoldti2g1lc3o', true), // old castle baby [7]
    new videoClip(clip_cmv_audio[7], 0, 49.5,    '1hmfwiah5zexgf18vri0b/vclip07.mp4?rlkey=6v185rbepe6k04n863ij2sw2b', true), // eshatos survive [8]
    new videoClip(clip_cmv_audio[8], 0, 56,      'cwppqn4hxfm4evcisql4m/vclip08.mp4?rlkey=7xcgmce343udnrutx3emmyqzn', true), // hpes-shiki [9]
    new videoClip(clip_cmv_audio[9], 2, 36.7,    '0c3vuonz3yp8v6t7nyoun/vclip09.mp4?rlkey=4h4hejhdg8ohn1a31ybuaeapr', true), // your fault [10]
];
const clips_legit = [
    new videoClip(cliponly[0], 2.35, 35.4,  '1mji1em40u4vie3gekosl/vclip30.mp4?rlkey=1cuydrf6ixpaw0xz0b7a8o1kg'), // bad apple [0]
    new videoClip(cliponly[1], 2, 36,       'b7z0s2ztz9q0mlyd9z94o/vclip31.mp4?rlkey=6skp9k063a6r89mc0qux5uqnp'), // k-on op [1]
    new videoClip(cliponly[2], 2, 36.5,       'nww97ssrnlwnv2mokt00m/vclip32.mp4?rlkey=tnby7r3b5luajkkimn113wstk'), // ado antisystem [2]
    new videoClip(cliponly[3], 0, 28.5,     '74o3mtqh004ij43pmi60o/vclip33.mp4?rlkey=4qz2lmn9crlvcbpf48ri5lh5b'), // shimoneta ed [3]
    new videoClip(cliponly[4], 2, 34,       'uvmebnq460my6rqfadi63/vclip34.mp4?rlkey=zberboqvuvpgpt4m91tq2xpms'), // kick back [4]
    new videoClip(cliponly[5], 0, 69.5,     'h2oxclo8u20kps2qn22fh/vclip35.mp4?rlkey=16hcxhfnw4q91u1yyvsc8a1mp'), // fatima [5]
    new videoClip(cliponly[6], 2, 40,      'r5yuflmuecybeaptnstmw/vclip36.mp4?rlkey=5y4ynpt75lredny63npi8ug2v'), // gate 1 [6]
    new videoClip(cliponly[7], 2, 44.5,    '9e0gb9s6g9mglclyjvrw5/vclip37.mp4?rlkey=r9l49t93p1x5uuzjxnbqleq3p'), // dandadan ed [7]
    // new (1.4)
    new videoClip(cliponly[8], 2.5, 36.5, '2z67wjyq1xr9sr9o18irj/vclip38.mp4?rlkey=hs7qg8oornk5arx9dara66pl0'), // neverland [8]
    new videoClip(cliponly[9], 2, 33, 'c2nsshwbkubzqe5y6wvni/vclip39.mp4?rlkey=0awrx6bue4rtds6up0ukzrkcw'), // kaguya op1 [9]
    new videoClip(cliponly[10], 2, 43, 'rkndo75yua6za0aittkgw/vclip40.mp4?rlkey=kt4wmy3e75tptghfexvrnxm9m'), // bocchi [10]
    new videoClip(cliponly[11], 2, 39, 'gp09wa6xyv8bfysqsiut0/vclip41.mp4?rlkey=9s3a7nwj3s4nmgi0tmiitv1u9'), // hell paradise op [11]
    new videoClip(cliponly[12], 2.5, 38.7, 'mzkoi90k45j6ravx1qh4h/vclip42.mp4?rlkey=s2g8w7n5f1a9uqi7ll99ssdoj'), // bloody stream [12]
    new videoClip(cliponly[13], 2, 40, '8kw143pz2zkkljep9oq9j/vclip43.mp4?rlkey=uqw1c4fyaf6nohr3prn18fd50'), // shikanoko [13]
    new videoClip(cliponly[14], 2, 37.5, '04dpkeio90jdaeot19zyc/vclip44.mp4?rlkey=mpx2vn08gz5ti5o21261apvsh'), // oshi no ko op1 [14]
    new videoClip(cliponly[15], 2, 28.5, 'lov4wvy8ewbh5e21rldef/vclip45.mp4?rlkey=30671k5l7u0qog5r6n2bemzl3'), // call of the night [15]
    new videoClip(cliponly[16], 2, 34.4, 'nsmp5aluka7l4shkvvcg0/vclip46.mp4?rlkey=crngu0hzqgizppbn8a9sy8ldu'), // apothecary diar op1 [16]
    new videoClip(cliponly[17], 2.5, 39.5, 'nv24dsyr1bkavz3bfhal2/vclip47.mp4?rlkey=fd9senvojyvix4ir1b9gokmdm'), // tetoris [17]
];
const clips = [].concat(clips_legit, clips_cmv)
// beatmap class
class musicBeatmap {
    constructor(bpm, offset, chorus) {
        this.bpm = bpm;
        this.beatl = Math.round(60000/bpm)/1000;
        this.offset = offset;
        this.chorus = chorus;
    }
};
// beatmaps array
const music_beatmap = [
    // new musicBeatmap(bpm, offset, [[chorus1], [chorus2]])
    new musicBeatmap(120, 0.57, [[77, 97], [132, 152], [170, 203]]), // [0]
    new musicBeatmap(155, 0.26, [[63, 92], [148, 175], [236, 264]]), // [1]
    new musicBeatmap(170, 0.11, [[8, 19], [66, 88], [130, 154], [207, 241]]), // [2]
    new musicBeatmap(149, 0.09, [[76, 109], [163, 196], [252, 284]]), // [3]
    new musicBeatmap(120, 0.14, [[55, 81], [120, 144], [172, 204]]), // [4]
    new musicBeatmap(190, 0.3, [[55, 84], [119, 146], [173, 201]]), // [5]
    new musicBeatmap(204, 0.05, [[52, 75], [158, 181]]), // [6]
    new musicBeatmap(180, -0.15, [[47, 68], [102, 122], [149, 192]]), // [7]
    new musicBeatmap(135, -0.05, [[15, 32], [71, 89], [128, 146], [194, 211]]), // [8]
    new musicBeatmap(178, 0.05, [[6, 15], [62, 83], [148, 169], [212, 233]]), // [9]
    new musicBeatmap(160, 0.28, [[62, 89], [151, 178], [218, 242]]), // [10]
    new musicBeatmap(174, 0.15, [[5, 17], [39, 49]]), // [11]
    new musicBeatmap(152, 0.25, [[52, 84], [115, 141], [167, 199]]), // [12]
    new musicBeatmap(200, 0.05, [[68, 91], [135, 158], [219, 245]]), // [13]
    new musicBeatmap(129, 0.1, [[57, 89], [126, 158], [195, 227]]), // [14]
    new musicBeatmap(190, -0.1, [[55, 89], [142, 176], [218, 244]]), // [15]
    new musicBeatmap(125, -0.1, [[43, 75], [130, 160]]), // [16]
    new musicBeatmap(117, 0, [[67, 83], [100, 116], [141, 165]]), // [17]
    new musicBeatmap(190, 0.1, [[40, 60], [90, 110], [146, 169]]), // [18]
    new musicBeatmap(128, 0.2, [[60, 90], [158, 188]]), // [19]
    new musicBeatmap(170, 0.15, [[25, 47], [105, 162]]), // [20]
    new musicBeatmap(180, -0.10, [[22, 44], [86, 107], [129, 171]]), // [21]
    new musicBeatmap(120, -0.15, [[65, 81], [130, 161], [194, 209]]), // [22]
    new musicBeatmap(192, -0.1, [[26, 55], [76, 105], [118, 148]]), // [23]
    new musicBeatmap(138, -0.05, []), // ноль припеуэуэу))) [24]
    new musicBeatmap(144, -0.05, [[59, 87], [138, 151], [193, 219]]), // [25]
    new musicBeatmap(196, 0.05, [[55, 74], [126, 145], [201, 219]]), // [26]
    new musicBeatmap(132, -0.2, [[54, 87], [165, 199], [220, 258]]), // [27]
    new musicBeatmap(184, -0.15, [[44, 64], [71, 102]]), // [28]
    new musicBeatmap(183, -0.16, [[52, 83], [161, 198]]), // [29]
    new musicBeatmap(129, 0.15, [[60, 86], [130, 156], [179, 205]]), // [30]
    new musicBeatmap(166, 0.05, [[55, 79], [102, 125], [172, 189]]), // [31]
    new musicBeatmap(200, 0.16, [[30, 50], [82, 105], [126, 144]]), // [32]
    new musicBeatmap(120, 0.18, [[58, 73], [138, 154], [204, 219]]), // [33]
    new musicBeatmap(192, 0.17, [[59, 80], [158, 188]]), // [34] хана ни натееееее
    new musicBeatmap(135, 0.05, [[63, 91], [148, 177]]), // [35]
    new musicBeatmap(154, 0.0, [[64, 92], [130, 157], [196, 223]]), // [36]
    new musicBeatmap(200, -0.02, [[67, 87], [117, 136], [155, 184]]), // [37]
    new musicBeatmap(210, -0.08, [[52, 70], [143, 161], [180, 198]]), // [38]
    new musicBeatmap(135, -0.08, [[62, 88], [159, 209]]), // [39]
    new musicBeatmap(208, -0.04, [[59, 78], [146, 165]]), // [40]
    new musicBeatmap(212, -0.03, [[50, 68], [145, 164]]), // [41]
    new musicBeatmap(170, 0.0, [[34, 36], [39, 62], [85, 87], [91, 144]]), // [42]
    new musicBeatmap(154, 0.03, [[57, 82], [116, 141], [174, 197]]), // [43]
    new musicBeatmap(160, 0.1, [[56, 82], [121, 146], [182, 208]]), // [44]
    new musicBeatmap(104, -0.12, [[9, 47], [121, 139], [204, 240]]), // [45]
    new musicBeatmap(190, 0.05, [[0, 18], [52, 83], [127, 158], [190, 220]]), // [46]
    new musicBeatmap(198, 0.08, [[51, 71], [119, 139], [199, 219]]), // [47]
];