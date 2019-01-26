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
    canvas = document.getElementById("canvas-0");
    context = canvas.getContext("2d");
    canvas.width = 500;
    canvas.height = 800;
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
    ]).then(function (responses) {
        backgroundData = responses[0];

        bronzeTopData = responses[1];
        bronzeElementData = responses[2];
        bronzeLevelData = responses[3];
        bronzeBottomData = responses[4];

        silverTopData = responses[5];
        silverElementData = responses[6];
        silverLevelData = responses[7];
        silverBottomData = responses[8];

        goldTopData = responses[9];
        goldElementData = responses[10];
        goldLevelData = responses[11];
        goldBottomData = responses[12];

        diamondTopData = responses[13];
        diamondElementData = responses[14];
        diamondLevelData = responses[15];
        diamondBottomData = responses[16];

        fireData = responses[17];
        waterData = responses[18];
        windData = responses[19];
        lightData = responses[20];
        darkData = responses[21];
        neutralData = responses[22];

        diamondFireData = responses[23];
        diamondWaterData = responses[24];
        diamondWindData = responses[25];
        diamondLightData = responses[26];
        diamondDarkData = responses[27];
        diamondNeutralData = responses[28];

        compose(backgroundData, fireData, 25, 48, 1.16);
        // noCompose("art/zozo.png", -210, -70, 1);
        compose(diamondTopData, diamondFireData, 0, 0);
        compose(diamondElementData, diamondFireData, 0, -2.5);
        compose(diamondLevelData, diamondFireData, 273, 0, 0.56);
        compose(diamondBottomData, diamondFireData, 0, 282);
        noCompose("fragment/ElementalIconLight.png", 13, 11, 0.43);

        for (var i = 0; i < 10; i++) {
            noCompose("fragment/EnergyIcon-Blue.png", 55 + 24 * i, 466, 0.85);
        }
    });
}

window.addEventListener("DOMContentLoaded", init);
