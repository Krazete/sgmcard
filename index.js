var canvas, context;

function getImageData(src, isGradient) {
    var tempCanvas = document.createElement("canvas");
    var tempContext = tempCanvas.getContext("2d");
    function request(resolve, reject) {
        var image = new Image();
        image.addEventListener("load", function () {
            var w = isGradient ? 256 : this.width;
            var h = isGradient ? 1 : this.height;
            tempCanvas.width = w;
            tempCanvas.height = h;
            tempContext.drawImage(this, 0, 0, w, h);
            resolve(tempContext.getImageData(0, 0, w, h));
        });
        image.addEventListener("error", function () {
            reject(new Error("Could not retrieve image data for \"" + this.src + "\"."));
        });
        image.src = src;
    }
    return new Promise(request);
}

function applyGradient(grayData, gradientData) {
    var imageData = new ImageData(grayData.width, grayData.height);
    var grayPixels = grayData.data.length / 4;
    for (var i = 0; i < grayPixels; i++) {
        var r = grayData.data[4 * i];
        var g = grayData.data[4 * i + 1];
        var b = grayData.data[4 * i + 2];
        var a = grayData.data[4 * i + 3];
        var rgb = Math.floor((r + g + b) / 3);
        imageData.data[4 * i] = gradientData.data[4 * rgb];
        imageData.data[4 * i + 1] = gradientData.data[4 * rgb + 1];
        imageData.data[4 * i + 2] = gradientData.data[4 * rgb + 2];
        imageData.data[4 * i + 3] = a;
    }
    return imageData;
}

function imageFromImageData(imageData) {
    var tempCanvas = document.createElement("canvas");
    var tempContext = tempCanvas.getContext("2d");
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    tempContext.putImageData(imageData, 0, 0);
    function request(resolve, reject) {
        var image = new Image();
        image.addEventListener("load", function () {
            resolve(image);
        });
        image.addEventListener("error", function () {
            reject(new Error("Could not retrieve image data for \"" + this.src + "\"."));
        });
        image.src = tempCanvas.toDataURL();
    }
    return new Promise(request);
}

function compose(grayData, gradientData, x, y, scale) {
    var imageData = applyGradient(grayData, gradientData);
    return imageFromImageData(imageData).then(function (response) {
        if (scale) {
            context.drawImage(response, x, y, response.width * scale, response.height * scale);
        }
        else {
            context.drawImage(response, x, y);
        }
    });
}

function noCompose(src, x, y, scale) {
    function request(resolve, reject) {
        var image = new Image();
        image.addEventListener("load", function () {
            if (scale) {
                context.drawImage(this, x, y, this.width * scale, this.height * scale);
            }
            else {
                context.drawImage(this, x, y);
            }
            resolve(true);
        });
        image.addEventListener("error", function () {
            reject(new Error("Could not retrieve image data for \"" + this.src + "\"."));
        });
        image.src = src;
    }
    return new Promise(request);
}

function init() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    canvas.width = 500;
    canvas.height = 800;
    Promise.all([
        getImageData("fragment/GreyBackground.png"),
        getImageData("gradient/30-3889.png", true)
    ]).then(function (responses) {
        compose(responses[0], responses[1], 25, 48, 1.16);
        noCompose("art/zozo.png", -210, -70, 1).then(function () {
            Promise.all([
                getImageData("fragment/DiamondTop.png"),
                getImageData("fragment/DiamondElement.png"),
                getImageData("fragment/DiamondLevel.png"),
                getImageData("fragment/DiamondBottom.png"),
                getImageData("gradient/DiamondGradientLight.png", true),
            ]).then(function (responses) {
                compose(responses[0], responses[4], 0, 0);
                compose(responses[1], responses[4], 0, -2.5);
                compose(responses[2], responses[4], 273, 0, 0.56);
                compose(responses[3], responses[4], 0, 282);
                noCompose("fragment/ElementalIconLight.png", 13, 11, 0.43);
            })
        });
    });
}

window.addEventListener("DOMContentLoaded", init);
