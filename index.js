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

function loadImage(src) {
    function request(resolve, reject) {
        var image = new Image();
        image.addEventListener("load", function () {
            resolve(this);
        });
        image.addEventListener("error", function () {
            reject(this);
        });
        image.src = src;
    }
    return new Promise(request);
}

function getImageDataFromImage(image, w, h) {
    var tempCanvas = document.createElement("canvas");
    var tempContext = tempCanvas.getContext("2d");
    if (w && h) {
        tempCanvas.width = w;
        tempCanvas.height = h;
        tempContext.drawImage(image, 0, 0, w, h);
    }
    else {
        tempCanvas.width = image.width;
        tempCanvas.height = image.height;
        tempContext.drawImage(image, 0, 0);
    }
    return tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
}

function colorizeImageDataWithGradientData(imageData, gradientData) {
    var colorizedData = new ImageData(imageData.width, imageData.height);
    var pixels = imageData.data.length / 4;
    for (var i = 0; i < pixels; i++) {
        var r = imageData.data[4 * i];
        var g = imageData.data[4 * i + 1];
        var b = imageData.data[4 * i + 2];
        var intensity = Math.floor((r + g + b) / 3);
        var a = imageData.data[4 * i + 3];
        imageData.data[4 * i] = gradientData.data[4 * intensity];
        imageData.data[4 * i + 1] = gradientData.data[4 * intensity + 1];
        imageData.data[4 * i + 2] = gradientData.data[4 * intensity + 2];
        imageData.data[4 * i + 3] = a;
    }
    return imageData;
}

function getImageFromImageData(imageData) {
    var tempCanvas = document.createElement("canvas");
    var tempContext = tempCanvas.getContext("2d");
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    tempContext.putImageData(imageData, 0, 0);
    return loadImage(tempCanvas.toDataURL());
}

function loadColorizedImage(imageSrc, gradientSrc) {
    return Promise.all([
        loadImage(imageSrc),
        loadImage(gradientSrc)
    ]).then(function (response) {
        var imageData = getImageDataFromImage(response[0]);
        var gradientData = getImageDataFromImage(response[1], 256, 1);
        var colorizedData = colorizeImageDataWithGradientData(imageData, gradientData);
        return getImageFromImageData(colorizedData);
    });
}

function loadBackground() {
    if (checked) {
        loadImage("fragment/GoldTop.png").then(console.log);
    }
    else {
        loadColorizedImage("fragment/GoldTop.png", "gradient/DiamondGradientDark.png").then(console.log);
    }
}

function drawImageToCanvas(image, canvas, x, y, w, h) {
    var context = canvas.getContext("2d");
    if (w && h) {
        context.drawImage(image, x, y);
    }
    else {
        context.drawImage(image, x, y, w, h);
    }
}

function init() {
    Promise.all([
        getImageData("fragment/GreyBackground.png"),

        getImageData("fragment/BronzeTop.png"),
        getImageData("fragment/BronzeElement.png"),
        getImageData("fragment/BronzeLevel.png"),
        getImageData("fragment/BronzeBottom.png"),

        getImageData("fragment/SilverTop.png"),
        getImageData("fragment/SilverElement.png"),
        getImageData("fragment/SilverLevel.png"),
        getImageData("fragment/SilverBottom.png"),

        getImageData("fragment/GoldTop.png"),
        getImageData("fragment/GoldElement.png"),
        getImageData("fragment/GoldLevel.png"),
        getImageData("fragment/GoldBottom.png"),

        getImageData("fragment/DiamondTop.png"),
        getImageData("fragment/DiamondElement.png"),
        getImageData("fragment/DiamondLevel.png"),
        getImageData("fragment/DiamondBottom.png"),

        getImageData("gradient/DiamondGradientMapFireBackplate.png", true),
        getImageData("gradient/DiamondGradientWaterBackplate.png", true),
        getImageData("gradient/DiamondGradientMapWindBackplate.png", true),
        getImageData("gradient/DiamondGradientLightBackplate.png", true),
        getImageData("gradient/DiamondGradientDarkBackplate.png", true),
        getImageData("gradient/DarkGradient.png", true),

        getImageData("gradient/DiamondGradientMapFire.png", true),
        getImageData("gradient/DiamondGradientWater.png", true),
        getImageData("gradient/DiamondGradientMapWind.png", true),
        getImageData("gradient/DiamondGradientLight.png", true),
        getImageData("gradient/DiamondGradientDark.png", true),
        getImageData("gradient/DiamondGradientMapNeutralB.png", true)
    ]);
}

window.addEventListener("DOMContentLoaded", init);
