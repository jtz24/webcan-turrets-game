// Game settings
const WINDOW_NAME = "Star Catcher";
const GAME_TITLE = WINDOW_NAME;
const SCREEN_WIDTH = 1200;
const SCREEN_HEIGHT = 700;
const FPS = 90;
const DRAW_FPS = true;
const BUTTONS_SIZES = [300, 90];
const PLAYER_SIZE = 300;
const PLAYER_HITBOX_SIZE = [80, 120];
const STAR_SIZES = [80, 80];
const STAR_SIZE_RANDOMIZE = [1, 1.5];
const BALLOON_SIZES = [50, 50];
const BALLOON_SIZE_RANDOMIZE = [1.2, 1.5];
const DRAW_HITBOX = false;
const FLOOR = 650;
const ANIMATION_SPEED = 0.08;
const GAME_DURATION = 60;
const LIVES = 3;
const COLORS = {
    title: [255, 220, 0],
    score: [255, 220, 0],
    timer: [255, 220, 0],
    buttons: {
        default: [56, 67, 209],    // 深蓝色
        second: [87, 99, 255],     // 亮蓝色
        text: [255, 255, 255],     // 白色（按钮文字颜色）
        gray: [38, 61, 39],
        shadow: [46, 54, 163]
    }
};
const MUSIC_VOLUME = 0.2;
const SOUNDS_VOLUME = 1;
// Difficulty settings
class Settings {
    constructor() {
        this.POSITION_FACTOR = 2;
        this.MIN_DROP = 300;
        this.MAX_DROP = 900;
        this.STAR_SPAWN_TIME = 10;
        this.BALL_MIN_VEL = 1;
        this.BALL_MAX_VEL = 2;
        this.STAR_MIN_VEL = 1;
        this.STAR_MAX_VEL = 2;
    }
}
const settings = new Settings();
function updateDifficultySettings(newPositionFactor, newMinDrop, newMaxDrop, newStarSpawnTime, ballMinVel, ballMaxVel, newStarMinVel, newStarMaxVel) {
    settings.POSITION_FACTOR = newPositionFactor;
    settings.MIN_DROP = newMinDrop;
    settings.MAX_DROP = newMaxDrop;
    settings.STAR_SPAWN_TIME = newStarSpawnTime;
    settings.BALL_MIN_VEL = ballMinVel;
    settings.BALL_MAX_VEL = ballMaxVel;
    settings.STAR_MIN_VEL = newStarMinVel;
    settings.STAR_MAX_VEL = newStarMaxVel;
    console.log(`Settings updated: STAR_MIN_VEL=${settings.STAR_MIN_VEL}, STAR_MAX_VEL=${settings.STAR_MAX_VEL}, BALL_MIN_VEL=${settings.BALL_MIN_VEL}, BALL_MAX_VEL=${settings.BALL_MAX_VEL}`);
}
class Color {
    static BLACK = [0, 0, 0];
    static WHITE = [255, 255, 255];
    static GRAY = [128, 128, 128];
    static RED = [255, 0, 0];
    static BLUE = [0, 0, 255];
    static GOLD = [255, 215, 0];
    static GREEN = [0, 255, 0];
    static DARK_GREEN = [0, 100, 0];
    static LIGHT_BLUE = [173, 216, 230];
    static ORANGE = [255, 165, 0];
    static PURPLE = [128, 0, 128];
    static YELLOW = [255, 255, 0];
}
// 定义字体
const FONTS = {
    small: "16px Arial",
    medium: "24px Arial",
    big: "48px Arial"
};
