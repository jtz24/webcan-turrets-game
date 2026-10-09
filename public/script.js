console.log("script.js is being executed");

let game;

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM content loaded");
    const gameContainer = document.getElementById("game-container");
    game = new Game(gameContainer);
    game.updateGame(); // 开始游戏循环

    // 确保在页面加载时隐藏视频框
    game.hidePoseCanvas();
});
