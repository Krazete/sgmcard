var cardBack, cardArt, cardTop, cardBottom;
var cardElementLeft, cardElementCenter, cardElementRight, cardLevel;
var cardElementText, cardLevelText, cardVariantText, cardFighterText;

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
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    if (w && h) {
        canvas.width = w;
        canvas.height = h;
        context.drawImage(image, 0, 0, w, h);
    }
    else {
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);
    }
    return context.getImageData(0, 0, canvas.width, canvas.height);
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
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    context.putImageData(imageData, 0, 0);
    return loadImage(canvas.toDataURL());
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

function buildCardFromPreview() {
    var preview = document.getElementById("preview");
    var previewBox = preview.getBoundingClientRect();
    console.log(preview);
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.width = previewBox.width;
    canvas.height = previewBox.height;
    var images = preview.getElementsByTagName("img");
    for (var image of images) {
        var imageBox = image.getBoundingClientRect();
        context.drawImage(
            image,
            imageBox.left - previewBox.left,
            imageBox.top - previewBox.top,
            imageBox.width,
            imageBox.height
        );
    }
    var a = document.createElement("a");
    a.href = canvas.toDataURL();
    a.setAttribute("download", "card.png");
    a.click();
}

function init() {
    var background = "fragment/GreyBackground.png";

    var bronzeTop = "fragment/BronzeTop.png";
    var bronzeElement = "fragment/BronzeElement.png";
    var bronzeLevel = "fragment/BronzeLevel.png";
    var bronzeBottom = "fragment/BronzeBottom.png";

    var silverTop = "fragment/SilverTop.png";
    var silverElement = "fragment/SilverElement.png";
    var silverLevel = "fragment/SilverLevel.png";
    var silverBottom = "fragment/SilverBottom.png";

    var goldTop = "fragment/GoldTop.png";
    var goldElement = "fragment/GoldElement.png";
    var goldLevel = "fragment/GoldLevel.png";
    var goldBottom = "fragment/GoldBottom.png";

    var diamondTop = "fragment/DiamondTop.png";
    var diamondElement = "fragment/DiamondElement.png";
    var diamondLevel = "fragment/DiamondLevel.png";
    var diamondBottom = "fragment/DiamondBottom.png";

    var backFireGradient = "gradient/DiamondGradientMapFireBackplate.png";
    var backWaterGradient = "gradient/DiamondGradientWaterBackplate.png";
    var backWindGradient = "gradient/DiamondGradientMapWindBackplate.png";
    var backLightGradient = "gradient/DiamondGradientLightBackplate.png";
    var backDarkGradient = "gradient/DiamondGradientDarkBackplate.png";
    var backNeutralGradient = "gradient/DarkGradient.png";

    var diamondFireGradient = "gradient/DiamondGradientMapFire.png";
    var diamondWaterGradient = "gradient/DiamondGradientWater.png";
    var diamondWindGradient = "gradient/DiamondGradientMapWind.png";
    var diamondLightGradient = "gradient/DiamondGradientLight.png";
    var diamondDarkGradient = "gradient/DiamondGradientDark.png";
    var diamondNeutralGradient = "gradient/DiamondGradientMapNeutralB.png";

    cardBack = document.getElementById("card-back");
    cardArt = document.getElementById("card-art");
    cardTop = document.getElementById("card-top");
    cardBottom = document.getElementById("card-bottom");
    cardElementLeft = document.getElementById("card-element-left");
    cardElementCenter = document.getElementById("card-element-center");
    cardElementRight = document.getElementById("card-element-right");
    cardLevel = document.getElementById("card-level");
    cardElementText = document.getElementById("card-element-text");
    cardLevelText = document.getElementById("card-level-text");
    cardVariant = document.getElementById("card-variant");
    cardFighter = document.getElementById("card-fighter");

    //

    var tierIDs = [
        "option-no-tier",
        "option-bronze",
        "option-silver",
        "option-gold",
        "option-diamond"
    ];

    var elementIDs = [
        "option-no-element",
        "option-fire",
        "option-water",
        "option-wind",
        "option-light",
        "option-dark",
        "option-neutral"
    ];

    var fighterIDs = [
        "option-fighter",
        "option-variant"
    ];

    var artIDs = [
        "option-art",
        "option-under",
        "option-over"
    ];

    var energyIDs = [
        "option-blank",
        "option-yellow",
        "option-blue"
    ];

    var elementValue = "option-no-element";

    function selectTier() {
        var map = {
            "option-bronze": "fragment/BronzeTop.png",
            "option-silver": "fragment/SilverTop.png",
            "option-gold": "fragment/GoldTop.png",
            "option-diamond": "fragment/DiamondTop.png"
        };
        if (this.id == "option-no-tier") {
            cardTop.src = "";
            cardBottom.src = "";
            cardElementLeft.src = "";
            cardElementCenter.src = "";
            cardElementRight.src = "";
            cardLevel.src = "";
        }
        else if (this.id == "option-bronze") {
            preview.className = "bronze";
            cardTop.src = bronzeTop;
            cardBottom.src = bronzeBottom;
            cardElementLeft.src = bronzeElement;
            cardElementCenter.src = bronzeElement;
            cardElementRight.src = bronzeElement;
            cardLevel.src = bronzeLevel;
        }
        else if (this.id == "option-silver") {
            preview.className = "silver";
            cardTop.src = silverTop;
            cardBottom.src = silverBottom;
            cardElementLeft.src = silverElement;
            cardElementCenter.src = silverElement;
            cardElementRight.src = silverElement;
            cardLevel.src = silverLevel;
        }
        else if (this.id == "option-gold") {
            preview.className = "gold";
            cardTop.src = goldTop;
            cardBottom.src = goldBottom;
            cardElementLeft.src = goldElement;
            cardElementCenter.src = goldElement;
            cardElementRight.src = goldElement;
            cardLevel.src = goldLevel;
        }
        else if (this.id == "option-diamond") {
            preview.className = "diamond";
            if (1 || optionNoElement.checked) {
                cardTop.src = diamondTop;
                cardBottom.src = diamondBottom;
                cardElementLeft.src = diamondElement;
                cardElementCenter.src = diamondElement;
                cardElementRight.src = diamondElement;
                cardLevel.src = diamondLevel;
            }
            loadColorizedImage(diamondTop, diamondFireGradient).then(function (image) {
                cardTop.src = image.src;
            });
        }
    }

    function selectElement() {
        if (this.id == "option-no-element") {
            cardBack.src = background;
        }
        else {
            var map = {
                "option-fire": backFireGradient,
                "option-water": backWaterGradient,
                "option-wind": backWindGradient,
                "option-light": backLightGradient,
                "option-dark": backDarkGradient,
                "option-neutral": backNeutralGradient,
            }
            loadColorizedImage(background, map[this.id]).then(function (image) {
                cardBack.src = image.src;
            });
        }
    }

    for (var id of tierIDs) {
        var tier = document.getElementById(id);
        tier.addEventListener("click", selectTier);
    }
    for (var id of elementIDs) {
        var element = document.getElementById(id);
        element.addEventListener("click", selectElement);
    }
    for (var id of energyIDs) {
        var energy = document.getElementById(id);
        energy.addEventListener("click", selectEnergy);
    }
}

window.addEventListener("DOMContentLoaded", init);
