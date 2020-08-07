const canvasWidth = 500;
const canvasHeight = 500;
const dfltStrokeWidth = 10;
const shadowColor = 'rgba(175, 175, 175, 255)';
const drawnColor = 'rgba(0, 0, 0, 255)';

var canvas, context;
var traceImage;
var drawStartTime;

let shadowFillData = [];
let drawnRecording = [];
let isDrawing = false;
let mousex = 0;
let mousey = 0;
let sizeModifier = 1.0;

function setup() {
    canvas = document.getElementById('drawing-canvas');
    context = canvas.getContext('2d');
    traceImage = document.getElementById('traceImg');
    canvas.setAttribute('width', canvasWidth);
    canvas.setAttribute('height', canvasHeight);

    canvas.addEventListener('mousedown', e => {
        mousex = e.offsetX;
        mousey = e.offsetY;
        isDrawing = true;
        drawnRecording = [];
        drawStartTime = Date.now();
        drawnRecording.push({x: mousex, y: mousey, offset: 0});
    });

    canvas.addEventListener('mousemove', e => {
        if (isDrawing === true) {
            drawLine(context, mousex, mousey, e.offsetX, e.offsetY, );
            mousex = e.offsetX;
            mousey = e.offsetY;
            let timeOff = Date.now() - drawStartTime;
            drawnRecording.push({x: mousex, y: mousey, offset: timeOff});
        }
    });

    window.addEventListener('mouseup', e => {
        if (isDrawing === true) {
            drawLine(context, mousex, mousey, e.offsetX, e.offsetY);
            let timeOff = Date.now() - drawStartTime;
            drawnRecording.push({x: mousex, y: mousey, offset: timeOff});
            mousex = 0;
            mousey = 0;
            isDrawing = false;
            calcAccuracy();
        }
    });

    clearCanvas();
    let shadowImageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
    let pixelCount = shadowImageData.height * shadowImageData.width;
    for (let i = 0; i < pixelCount; i++) {
        let r = shadowImageData.data[i * 4];
        let g = shadowImageData.data[(i * 4) + 1];
        let b = shadowImageData.data[(i * 4) + 2];
        let a = shadowImageData.data[(i * 4) + 3];
        let color = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
        if (color === shadowColor) {
            shadowFillData.push(i);
        }
    }
}

function drawLine(context, x1, y1, x2, y2, color = drawnColor) {
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = dfltStrokeWidth * sizeModifier;
    context.lineCap = 'round';
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    //drawLine(context, 0, 0, 200, 200, shadowColor);
    context.drawImage(traceImage, 0, 0, canvasWidth, canvasHeight, 0, 0, canvasWidth * sizeModifier, canvasHeight * sizeModifier);
}

function calcAccuracy() {
    let matchedPixelCount = 0;
    drawnImageData = context.getImageData(0, 0, canvasWidth * sizeModifier, canvasHeight * sizeModifier);
    let pixelCount = drawnImageData.height * drawnImageData.width;
    for (let i = 0; i < pixelCount; i++) {
        let r = drawnImageData.data[i * 4];
        let g = drawnImageData.data[(i * 4) + 1];
        let b = drawnImageData.data[(i * 4) + 2];
        let a = drawnImageData.data[(i * 4) + 3];
        let color = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
        if (color === drawnColor) {
            if (shadowFillData.includes(i)) {
                matchedPixelCount++;
            }
        }
    }
    let accuracy = ((matchedPixelCount / shadowFillData.length) * 100).toFixed(1);
    let accText = document.getElementById('accuracy');
    accText.innerHTML = accuracy;
    let duration = drawnRecording[drawnRecording.length - 1].offset;
    let durText = document.getElementById('duration');
    durText.innerHTML = duration;
}

function replayDrawing() {
    clearCanvas();
    let zeroTime = Date.now();
    for (let i = 1; i < drawnRecording.length; i++) {
        window.setTimeout(
            function() {
                drawLine(context, drawnRecording[i-1].x, drawnRecording[i-1].y, drawnRecording[i].x, drawnRecording[i].y);
            }, 
            (drawnRecording[i].offset - (Date.now() - zeroTime))
        );
    }
}

function setSize(newSize) {
    sizeModifier = newSize;
    canvas.setAttribute('width', canvasWidth * sizeModifier);
    canvas.setAttribute('height', canvasHeight * sizeModifier);
    clearCanvas();
    shadowFillData = [];
    let shadowImageData = context.getImageData(0, 0, canvasWidth * sizeModifier, canvasHeight * sizeModifier);
    let pixelCount = shadowImageData.height * shadowImageData.width;
    for (let i = 0; i < pixelCount; i++) {
        let r = shadowImageData.data[i * 4];
        let g = shadowImageData.data[(i * 4) + 1];
        let b = shadowImageData.data[(i * 4) + 2];
        let a = shadowImageData.data[(i * 4) + 3];
        let color = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
        if (color === shadowColor) {
            shadowFillData.push(i);
        }
    }
}
