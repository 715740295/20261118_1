let idleSheet; // 載入角色靜止動作的精靈圖
let runSheet; // 載入角色奔跑動作的精靈圖
let backgroundImage; // 載入可水平平鋪的背景圖片
let effect1Sheet; // 載入從視窗上方落下的特效精靈圖
let effect2Sheet; // 載入在視窗底部播放的爆破特效精靈圖
let thunderSound; // 載入閃電特效使用的打雷音效
let worldPosition = 0; // 記錄角色在三張串接背景場景中的水平位置
let cameraOffset = 0; // 記錄背景相對於視窗的水平捲動位置
let movementDirection = 0; // 記錄目前輸入方向，右為正、左為負
let facingDirection = 1; // 記錄角色朝向，右為正、左為負
let previousDirection = 0; // 記錄上一個輸入方向以重設奔跑動畫
let runStartTime = 0; // 記錄本次奔跑動畫開始的時間
let rightEdgeEffectState = "idle"; // 記錄右側背景邊界特效目前的播放階段
let rightEdgeEffectStartTime = 0; // 記錄目前階段特效的開始時間
const movementSpeed = 300; // 設定背景每秒捲動的像素數
const frameDuration = 100; // 設定每張動畫影格顯示的毫秒數
const effect1Duration = 1000; // 設定閃電特效每次播放一秒
const effect1PlayCount = 3; // 設定閃電特效重複播放三次
const effect2Duration = frameDuration * 9; // 設定爆破特效九張影格播放一次所需的時間
function preload() { // 在畫面建立前載入動畫與背景素材
  idleSheet = loadImage("1/stop/stop.png"); // 載入包含十四張影格的靜止精靈圖
  runSheet = loadImage("1/run/run.png"); // 載入包含十二張影格的奔跑精靈圖
  backgroundImage = loadImage("bg/0.png"); // 載入背景圖片
  effect1Sheet = loadImage("effect1/effect1.png"); // 載入包含十四張影格的落下特效
  effect2Sheet = loadImage("effect2/effect2.png"); // 載入包含九張影格的爆破特效
  thunderSound = loadSound("thunder.mp3"); // 載入閃電播放時使用的打雷音效
} // 結束素材載入函式
function setup() { // 設定畫布與繪圖環境
  createCanvas(windowWidth, windowHeight); // 建立填滿整個視窗的畫布
  worldPosition = width * 1.5; // 將角色初始位置設在中間背景的中央
  cameraOffset = width; // 初始顯示中間背景並保留左右兩張背景
  imageMode(CORNER); // 使用圖片左上角作為繪製座標
  frameRate(60); // 將畫面更新頻率設定為每秒六十格
} // 結束畫面設定函式
function draw() { // 每一格更新背景與角色動畫
  const rightPressed = keyIsDown(RIGHT_ARROW); // 檢查右方向鍵是否正被按住
  const leftPressed = keyIsDown(LEFT_ARROW); // 檢查左方向鍵是否正被按住
  const requestedDirection = rightPressed ? 1 : leftPressed ? -1 : 0; // 根據左右方向鍵決定要求移動方向
  const maximumCharacterWidth = height / 3 * (runSheet.width / 12) / runSheet.height; // 依奔跑影格比例計算角色最大顯示寬度
  const worldWidth = width * 3; // 設定三張背景串接後的場景總寬度
  let remainingDistance = movementSpeed * deltaTime / 1000; // 計算本格角色與背景可移動的距離
  const characterScreenX = worldPosition - cameraOffset; // 計算角色目前在視窗中的水平位置
  if (requestedDirection > 0 && characterScreenX < width / 2) { // 反向往右時先讓角色回到畫面中央
    const distanceToCenter = width / 2 - characterScreenX; // 計算角色回到畫面中央所需的距離
    const characterStep = Math.min(remainingDistance, distanceToCenter); // 限制角色本格最多移動至畫面中央
    worldPosition += characterStep; // 先移動角色而不捲動背景
    remainingDistance -= characterStep; // 扣除角色回到中央所用的距離
  } // 結束往右回到中央的處理
  if (requestedDirection < 0 && characterScreenX > width / 2) { // 反向往左時先讓角色回到畫面中央
    const distanceToCenter = characterScreenX - width / 2; // 計算角色回到畫面中央所需的距離
    const characterStep = Math.min(remainingDistance, distanceToCenter); // 限制角色本格最多移動至畫面中央
    worldPosition -= characterStep; // 先移動角色而不捲動背景
    remainingDistance -= characterStep; // 扣除角色回到中央所用的距離
  } // 結束往左回到中央的處理
  movementDirection = requestedDirection; // 按住方向鍵時播放相應動作並控制背景
  if (movementDirection !== 0) { // 只有按下方向鍵時才更新背景與角色朝向
    facingDirection = movementDirection; // 讓角色面向目前按下的方向
  } // 結束方向判斷
  if (movementDirection !== previousDirection) { // 在開始、停止或切換方向時重設奔跑影格
    runStartTime = millis(); // 記錄目前時間作為奔跑動畫起點
    previousDirection = movementDirection; // 保存新的輸入方向供下一格比較
  } // 結束動畫重設判斷
  if (movementDirection > 0 && remainingDistance > 0) { // 往右時優先捲動背景，抵達背景邊界後再移動角色
    const backgroundStep = Math.min(remainingDistance, width * 2 - cameraOffset); // 計算背景向右捲動至最右邊界的距離
    cameraOffset += backgroundStep; // 將背景向左捲動畫面以呈現角色往右前進
    worldPosition += backgroundStep; // 角色在背景捲動時保持在畫面中央
    remainingDistance -= backgroundStep; // 扣除背景捲動所用的距離
    worldPosition = constrain(worldPosition + remainingDistance, maximumCharacterWidth / 2, worldWidth - maximumCharacterWidth / 2); // 背景到邊界後才讓角色繼續往右
  } // 結束往右移動處理
  if (movementDirection < 0 && remainingDistance > 0) { // 往左時優先捲動背景，抵達背景邊界後再移動角色
    const backgroundStep = Math.min(remainingDistance, cameraOffset); // 計算背景向左捲動至最左邊界的距離
    cameraOffset -= backgroundStep; // 將背景向右捲動畫面以呈現角色往左前進
    worldPosition -= backgroundStep; // 角色在背景捲動時保持在畫面中央
    remainingDistance -= backgroundStep; // 扣除背景捲動所用的距離
    worldPosition = constrain(worldPosition - remainingDistance, maximumCharacterWidth / 2, worldWidth - maximumCharacterWidth / 2); // 背景到邊界後才讓角色繼續往左
  } // 結束往左移動處理
  if (rightEdgeEffectState === "idle" && movementDirection > 0 && cameraOffset >= width * 2) { // 右側背景停止捲動時啟動落下特效
    rightEdgeEffectState = "falling"; // 將特效階段切換為落下動畫
    rightEdgeEffectStartTime = millis(); // 記錄落下動畫起始時間
  } // 結束落下特效啟動
  if (rightEdgeEffectState !== "idle" && cameraOffset < width * 2) { // 背景移出右側位置時停止整個特效循環
    rightEdgeEffectState = "idle"; // 重設特效階段以便下次抵達右側時重新播放
  } // 結束背景離開時的特效停止
  if (rightEdgeEffectState === "falling" && millis() - rightEdgeEffectStartTime >= effect1Duration * effect1PlayCount) { // 閃電特效播放三次後切換至爆破階段
    rightEdgeEffectState = "explosion"; // 將特效階段切換為單次爆破動畫
    rightEdgeEffectStartTime = millis(); // 記錄爆破動畫起始時間
  } // 結束落下特效完成判斷
  if (rightEdgeEffectState === "explosion" && millis() - rightEdgeEffectStartTime >= effect2Duration) { // 爆破播放一次後重新開始三次閃電
    rightEdgeEffectState = "falling"; // 將特效階段切回閃電動畫以循環播放
    rightEdgeEffectStartTime = millis(); // 重設下一輪閃電動畫起始時間
  } // 結束爆破特效停止判斷
  const shouldPlayThunder = rightEdgeEffectState !== "idle" && cameraOffset >= width * 2; // 背景停在右側特效位置時保持打雷音效播放
  if (shouldPlayThunder && !thunderSound.isPlaying()) { // 特效序列啟動時開始循環播放打雷音效
    thunderSound.loop(); // 循環播放音效並在閃電與爆破間持續
  } // 結束打雷音效啟動
  if (!shouldPlayThunder && thunderSound.isPlaying()) { // 背景離開右側特效位置時停止打雷音效
    thunderSound.stop(); // 停止目前播放的打雷音效
  } // 結束打雷音效停止
  background(0); // 清除上一格畫面並以黑色填滿空白區域
  for (let tileIndex = 0; tileIndex < 3; tileIndex++) { // 依序繪製左側、中間與右側三張相連背景
    image(backgroundImage, tileIndex * width - cameraOffset, 0, width, height); // 將背景圖片縮放至畫布大小並串接排列
  } // 結束背景平鋪迴圈
  const isAtLeftEdge = cameraOffset === 0 && worldPosition <= maximumCharacterWidth / 2; // 判斷角色是否已抵達視窗左邊界
  const isAtRightEdge = cameraOffset === width * 2 && worldPosition >= worldWidth - maximumCharacterWidth / 2; // 判斷角色是否已抵達視窗右邊界
  const isBlockedAtEdge = (isAtLeftEdge && movementDirection < 0) || (isAtRightEdge && movementDirection > 0); // 判斷角色是否正朝已抵達的邊界移動
  const isRunning = movementDirection !== 0 && !isBlockedAtEdge; // 抵達邊界時停止奔跑並切換為靜止動作
  const currentSheet = isRunning ? runSheet : idleSheet; // 依方向鍵狀態選擇奔跑或靜止精靈圖
  const frameCount = isRunning ? 12 : 14; // 設定奔跑與靜止動畫各自的影格數
  const frameWidth = currentSheet.width / frameCount; // 根據精靈圖總寬度計算單張影格寬度
  const frameHeight = currentSheet.height; // 使用精靈圖高度作為單張影格高度
  const displayHeight = height / 3; // 將角色顯示高度設定為畫布高度的三分之一
  const displayWidth = displayHeight * frameWidth / frameHeight; // 依每張原始影格比例計算角色顯示寬度
  let characterDisplayX = worldPosition - cameraOffset; // 計算角色目前在視窗中的繪製位置
  if (!isRunning && isAtLeftEdge) { // 靜止時讓角色圖片貼齊視窗左邊
    characterDisplayX = displayWidth / 2; // 將角色中心放在左邊界內側半個角色寬度處
  } // 結束左邊界對齊
  if (!isRunning && isAtRightEdge) { // 靜止時讓角色圖片貼齊視窗右邊
    characterDisplayX = width - displayWidth / 2; // 將角色中心放在右邊界內側半個角色寬度處
  } // 結束右邊界對齊
  let frameIndex; // 宣告目前要繪製的影格索引
  if (isRunning) { // 按下左右鍵時播放奔跑動畫
    const elapsedFrame = Math.floor((millis() - runStartTime) / frameDuration); // 計算本次奔跑已播放的影格數
    frameIndex = elapsedFrame < 12 ? elapsedFrame : 4 + ((elapsedFrame - 12) % 8); // 先播放第一至十二張，再循環播放第五至十二張
  } else { // 未按下方向鍵時播放靜止動畫
    frameIndex = Math.floor(millis() / frameDuration) % 14; // 依序循環播放全部十四張靜止影格
  } // 結束影格選擇
  push(); // 暫存目前的座標與縮放設定
  translate(characterDisplayX, 0); // 依角色目前位置繪製角色並保持中央或邊界對齊
  scale(facingDirection, 1); // 依最後的移動方向翻轉角色圖片
  image(currentSheet, -displayWidth / 2, height - displayHeight, displayWidth, displayHeight, frameIndex * frameWidth, 0, frameWidth, frameHeight); // 依指定尺寸繪製目前精靈影格並保持原始比例
  pop(); // 還原座標與縮放設定供下一格使用
  drawRightEdgeEffects(); // 在角色上方繪製右側背景邊界的落下或爆破特效
} // 結束每格繪圖函式
function drawRightEdgeEffects() { // 繪製右側背景停止時依序播放的特效
  const effectX = width * 0.75; // 將兩種特效的中心放在距視窗右側四分之一寬的位置
  if (rightEdgeEffectState === "falling") { // 播放由視窗上方落下的第一種特效
    const elapsedTime = millis() - rightEdgeEffectStartTime; // 計算落下特效已播放的時間
    const cycleTime = elapsedTime % effect1Duration; // 計算目前一秒循環中的播放時間
    const frameWidth = effect1Sheet.width / 14; // 依精靈圖總寬度計算單張落下影格寬度
    const frameHeight = effect1Sheet.height; // 使用精靈圖高度作為落下影格高度
    const frameIndex = Math.floor(cycleTime / effect1Duration * 14); // 每秒依序播放十四張閃電影格
    const effectY = cycleTime / effect1Duration * height; // 每次播放都讓閃電從視窗頂端向下移動
    image(effect1Sheet, effectX - frameWidth / 2, effectY, frameWidth, frameHeight, frameIndex * frameWidth, 0, frameWidth, frameHeight); // 繪製目前落下影格
  } // 結束落下特效繪製
  if (rightEdgeEffectState === "explosion") { // 播放一次視窗底部的爆破特效
    const frameWidth = effect2Sheet.width / 9; // 依精靈圖總寬度計算單張爆破影格寬度
    const frameHeight = effect2Sheet.height; // 使用精靈圖高度作為爆破影格高度
    const frameIndex = Math.min(Math.floor((millis() - rightEdgeEffectStartTime) / frameDuration), 8); // 依序播放九張爆破影格一次
    image(effect2Sheet, effectX - frameWidth / 2, height - frameHeight, frameWidth, frameHeight, frameIndex * frameWidth, 0, frameWidth, frameHeight); // 在視窗底端繪製目前爆破影格
  } // 結束爆破特效繪製
} // 結束右側邊界特效繪製函式
function keyPressed() { // 接收方向鍵並避免瀏覽器捲動頁面
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) { // 僅處理左右方向鍵
    userStartAudio(); // 在方向鍵使用者操作時啟用瀏覽器音訊播放
    return false; // 阻止方向鍵觸發瀏覽器預設捲動行為
  } // 結束方向鍵判斷
} // 結束鍵盤事件函式
function windowResized() { // 視窗尺寸改變時同步調整畫布寬度
  const worldProgress = worldPosition / (width * 3); // 記錄角色在原場景中的相對位置
  const backgroundProgress = cameraOffset / (width * 2); // 記錄背景在可捲動範圍中的相對位置
  resizeCanvas(windowWidth, windowHeight); // 讓畫布隨視窗寬高同步改變
  const maximumCharacterWidth = height / 3 * (runSheet.width / 12) / runSheet.height; // 依新畫布高度重新計算角色最大寬度
  worldPosition = constrain(worldProgress * width * 3, maximumCharacterWidth / 2, width * 3 - maximumCharacterWidth / 2); // 保持角色相對位置並限制於新場景範圍
  cameraOffset = backgroundProgress * width * 2; // 依新視窗寬度保留背景原本的相對捲動位置
} // 結束視窗尺寸事件函式
