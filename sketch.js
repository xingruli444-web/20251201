let stopSpriteSheet, walkSpriteSheet, jumpSpriteSheet, pushSpriteSheet, toolSpriteSheet;
let stopAnimation = [];
let walkAnimation = [];
let jumpAnimation = [];
let pushAnimation = [];
let toolAnimation = [];

let x, y;
let speed = 5;
let direction = 1; // 1 for right, -1 for left
let isWalking = false;
let isJumping = false;
let isPushing = false;
let jumpFrame = 0;
let pushFrame = 0;
let startY;
const JUMP_HEIGHT = 150; // 角色跳躍的高度

let tools = []; // 儲存所有發射出去的武器

const stopFrameInfo = { count: 3, width: 295, height: 114 };
const walkFrameInfo = { count: 11, width: 2228, height: 254 };
const jumpFrameInfo = { count: 16, width: 1225, height: 225 };
const pushFrameInfo = { count: 12, width: 1078, height: 228 };
const toolFrameInfo = { count: 17, width: 965, height: 275 };

function preload() {
  // 預先載入圖片精靈檔案
  stopSpriteSheet = loadImage('1/stop/111.png');
  walkSpriteSheet = loadImage('1/walk/111.png');
  jumpSpriteSheet = loadImage('1/jump/111.png');
  pushSpriteSheet = loadImage('1/push/111.png');
  toolSpriteSheet = loadImage('1/tool/111.png');
}

function setup() {
  // 建立一個佔滿整個視窗的畫布
  createCanvas(windowWidth, windowHeight);
  x = width / 2;
  y = height / 2;
  startY = y; // 儲存初始的Y軸位置

  // 從站立圖片精靈中切割出每一個影格
  let stopFrameWidth = stopFrameInfo.width / stopFrameInfo.count;
  for (let i = 0; i < stopFrameInfo.count; i++) {
    let frame = stopSpriteSheet.get(i * stopFrameWidth, 0, stopFrameWidth, stopFrameInfo.height);
    stopAnimation.push(frame);
  }

  // 從走路圖片精靈中切割出每一個影格
  let walkFrameWidth = walkFrameInfo.width / walkFrameInfo.count;
  for (let i = 0; i < walkFrameInfo.count; i++) {
    let frame = walkSpriteSheet.get(i * walkFrameWidth, 0, walkFrameWidth, walkFrameInfo.height);
    walkAnimation.push(frame);
  }

  // 從跳躍圖片精靈中切割出每一個影格
  let jumpFrameWidth = jumpFrameInfo.width / jumpFrameInfo.count;
  for (let i = 0; i < jumpFrameInfo.count; i++) {
    let frame = jumpSpriteSheet.get(i * jumpFrameWidth, 0, jumpFrameWidth, jumpFrameInfo.height);
    jumpAnimation.push(frame);
  }

  // 從攻擊圖片精靈中切割出每一個影格
  let pushFrameWidth = pushFrameInfo.width / pushFrameInfo.count;
  for (let i = 0; i < pushFrameInfo.count; i++) {
    let frame = pushSpriteSheet.get(i * pushFrameWidth, 0, pushFrameWidth, pushFrameInfo.height);
    pushAnimation.push(frame);
  }

  // 從武器圖片精靈中切割出每一個影格
  let toolFrameWidth = toolFrameInfo.width / toolFrameInfo.count;
  for (let i = 0; i < toolFrameInfo.count; i++) {
    let frame = toolSpriteSheet.get(i * toolFrameWidth, 0, toolFrameWidth, toolFrameInfo.height);
    toolAnimation.push(frame);
  }
}

function draw() {
  // 設定背景顏色
  background('#faedcd');
  imageMode(CENTER);

  // 更新並繪製所有武器
  updateAndDrawTools();
  
  if (isJumping) {
    // 播放跳躍動畫
    let frameIndex = floor(jumpFrame);
    let currentFrame = jumpAnimation[frameIndex];

    // 第13張圖片的索引是12
    const apexFrame = 12; 
    if (frameIndex < apexFrame) {
      // 在到達最高點之前，角色向上移動
      y = startY - JUMP_HEIGHT * sin(map(frameIndex, 0, apexFrame, 0, HALF_PI));
    } else {
      // 到達最高點後，角色向下移動
      y = (startY - JUMP_HEIGHT) + JUMP_HEIGHT * cos(map(frameIndex, apexFrame, jumpAnimation.length - 1, 0, HALF_PI));
    }

    push();
    translate(x, y);
    scale(direction, 1);
    image(currentFrame, 0, 0);
    pop();

    jumpFrame += 0.5; // 控制跳躍動畫速度
    if (jumpFrame >= jumpAnimation.length) {
      isJumping = false;
      y = startY;
    }
  } else if (isPushing) {
    // 播放攻擊動畫
    let frameIndex = floor(pushFrame);
    let currentFrame = pushAnimation[frameIndex];
    push();
    translate(x, y);
    scale(direction, 1);
    image(currentFrame, 0, 0);
    pop();

    pushFrame += 0.5; // 控制攻擊動畫速度
    if (pushFrame >= pushAnimation.length) {
      isPushing = false;
      // 動畫結束後，產生一個新的武器
      tools.push({
        x: x + (50 * direction), // 從角色前方發射
        y: y,
        direction: direction,
        speed: 10,
        frame: 0
      });
    }

  } else if (isWalking) {
    if (keyIsDown(RIGHT_ARROW)) {
      direction = 1;
      x += speed;
    } else if (keyIsDown(LEFT_ARROW)) {
      direction = -1;
      x -= speed;
    }
    // 播放走路動畫
    let frameIndex = floor(frameCount * 0.2) % walkAnimation.length;
    let currentFrame = walkAnimation[frameIndex];
    push();
    translate(x, y);
    scale(direction, 1); // 根據方向翻轉圖片
    image(currentFrame, 0, 0);
    pop();
  } else {
    // 播放站立動畫
    let frameIndex = floor(frameCount * 0.1) % stopAnimation.length;
    let currentFrame = stopAnimation[frameIndex];
    push();
    translate(x, y);
    scale(direction, 1); // 保持上次的方向
    image(currentFrame, 0, 0);
    pop();
  }
}

function updateAndDrawTools() {
  for (let i = tools.length - 1; i >= 0; i--) {
    let tool = tools[i];
    tool.x += tool.speed * tool.direction;

    // 播放武器動畫
    let frameIndex = floor(tool.frame) % toolAnimation.length;
    let currentFrame = toolAnimation[frameIndex];

    push();
    translate(tool.x, tool.y);
    scale(tool.direction, 1);
    image(currentFrame, 0, 0);
    pop();

    tool.frame += 0.5; // 控制武器動畫速度

    // 如果武器超出畫布範圍，就將其移除
    if (tool.x > width + 100 || tool.x < -100) {
      tools.splice(i, 1);
    }
  }
}

function keyPressed() {
  if (keyCode === 32 && !isJumping && !isPushing) { // 32 是空白鍵
    isPushing = true;
    isWalking = false;
    pushFrame = 0;
  } else if (keyCode === UP_ARROW && !isJumping && !isPushing) {
    isJumping = true;
    jumpFrame = 0;
  } else if (!isPushing && (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW)) {
    isWalking = true;
  }
}

function keyReleased() {
  if (!isJumping && !isPushing && (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW)) {
    isWalking = false;
  }
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}
