window.addEventListener("DOMContentLoaded", function () {

/* Elements */

var card = {
    "back": document.getElementById("card-back"),
    "maskLeft": document.getElementById("mask-left"),
    "maskRight": document.getElementById("mask-right"),
    "maskTop": document.getElementById("mask-top"),
    "maskBottom": document.getElementById("mask-bottom"),
    "overlapTool": document.getElementById("card-overlap-tool"),
    "mask": document.getElementById("mask"),
    "art": document.getElementById("art"),
    "top": document.getElementById("card-top"),
    "poseTool": document.getElementById("card-pose-tool"),
    "circle": document.getElementById("circle"),
    "bottom": document.getElementById("card-bottom"),
    "element": document.getElementById("card-element"),
    "scoreLeft": document.getElementById("card-score-left"),
    "scoreCenter": document.getElementById("card-score-center"),
    "scoreRight": document.getElementById("card-score-right"),
    "badge": document.getElementById("card-badge"),
    "energy": document.getElementById("card-energy"),
    "score": document.getElementById("card-score"),
    "level": document.getElementById("card-level"),
    "variant": document.getElementById("card-variant"),
    "fighter": document.getElementById("card-fighter")
};

var tier = {
    "none": document.getElementById("option-no-tier"),
    "bronze": document.getElementById("option-bronze"),
    "silver": document.getElementById("option-silver"),
    "gold": document.getElementById("option-gold"),
    "diamond": document.getElementById("option-diamond")
};

var element = {
    "none": document.getElementById("option-no-element"),
    "fire": document.getElementById("option-fire"),
    "water": document.getElementById("option-water"),
    "wind": document.getElementById("option-wind"),
    "light": document.getElementById("option-light"),
    "dark": document.getElementById("option-dark"),
    "neutral": document.getElementById("option-neutral")
};

var energy = {
    "none": document.getElementById("option-no-energy"),
    "yellow": document.getElementById("option-yellow"),
    "blue": document.getElementById("option-blue"),
    "blank": document.getElementById("option-blank")
};

var art = {
    "file": document.getElementById("option-art"),
    "move": document.getElementById("option-move"),
    "x": document.getElementById("option-x"),
    "y": document.getElementById("option-y"),
    "scale": document.getElementById("option-scale"),
    "w": document.getElementById("option-w"),
    "rotate": document.getElementById("option-rotate"),
    "a": document.getElementById("option-a"),
    "under": document.getElementById("option-under"),
    "over": document.getElementById("option-over")
};

var foreground = {
    "default": document.getElementById("option-fg-default"),
    "custom": document.getElementById("option-fg-custom"),
    "bronze": document.getElementById("option-fg-bronze"),
    "silver": document.getElementById("option-fg-silver"),
    "gold": document.getElementById("option-fg-gold"),
    "fire": document.getElementById("option-fg-fire"),
    "water": document.getElementById("option-fg-water"),
    "wind": document.getElementById("option-fg-wind"),
    "light": document.getElementById("option-fg-light"),
    "dark": document.getElementById("option-fg-dark"),
    "neutral": document.getElementById("option-fg-neutral"),
    "preview": document.getElementById("fg-preview"),
    "input": document.getElementById("option-fg")
};

var background = {
    "default": document.getElementById("option-bg-default"),
    "custom": document.getElementById("option-bg-custom"),
    "fire": document.getElementById("option-bg-fire"),
    "water": document.getElementById("option-bg-water"),
    "wind": document.getElementById("option-bg-wind"),
    "light": document.getElementById("option-bg-light"),
    "dark": document.getElementById("option-bg-dark"),
    "neutral": document.getElementById("option-bg-neutral"),
    "preview": document.getElementById("bg-preview"),
    "input": document.getElementById("option-bg")
};

var render = {
    "button": document.getElementById("option-render"),
    "imageContainer": document.getElementById("render-image"),
    "disclaimer": document.getElementById("render-disclaimer"),
    "zipContainer": document.getElementById("render-zip"),
};

/* Preview Text */

var ruler = document.createElement("canvas").getContext("2d");

function autofit(input, maxSize, maxWidth) {
    var style = getComputedStyle(input);
    var value = input.value.toUpperCase();
    var width;
    for (var i = maxSize; i > 0; i--) {
        ruler.font = i + "px " + style.fontFamily;
        width = ruler.measureText(value).width;
        if (width < maxWidth) {
            break;
        }
    }
    input.style.fontSize = i + "px";
    return width;
}

function fitCardScore() {
    var width = parseInt(autofit(card.score, 31, 150)) || 65;
    var pad = 5;
    card.scoreCenter.style.transform = "scaleX(" + (width + pad) + ")";
    var offset = 29;
    if (preview.className == "gold") {
        offset = 22;
    }
    else if (preview.className == "diamond") {
        offset = 28;
    }
    card.scoreRight.style.left = offset + width + "px";
}

function fitCardLevel() {
    autofit(card.level, 31, 40);
}

function fitCardVariant() {
    autofit(card.variant, 58, 320);
}

function fitCardFighter() {
    autofit(card.fighter, 38, 250);
}

/* Card Mask Tool */

var clipPaths = { /* backup for firefox <54 */
    "left": "polygon(0px 0px, 80px 0px, 80px 100%, 0px 100%)",
    "center": "polygon(80px 0px, 81px 0px, 81px 100%, 80px 100%)",
    "right": "polygon(81px 0px, 100% 0px, 100% 100%, 81px 100%)",
    "leftGold": "polygon(0px 0px, 87px 0px, 87px 100%, 0px 100%)",
    "centerGold": "polygon(87px 0px, 88px 0px, 88px 100%, 87px 100%)",
    "rightGold": "polygon(88px 0px, 100% 0px, 100% 100%, 88px 100%)",
    "art": "none"
};

var maskPath = [0, 0, 395, 504];

function setMaskPath() {
    maskPath = [0, 0, 395, 504];
    if (card.maskLeft.className == "active") {
        maskPath[0] = 50;
    }
    if (card.maskRight.className == "active") {
        maskPath[2] = 345;
    }
    if (card.maskTop.className == "active") {
        maskPath[1] = 50;
    }
    if (card.maskBottom.className == "active") {
        maskPath[3] = 345;
    }
}

function toggleMaskSegment() {
    if (this.className == "active") {
        this.className = "";
    }
    else {
        this.className = "active";
    }
    setMaskPath();
    var polygon = "polygon(" +
        maskPath[0] + "px " + maskPath[1] + "px," +
        maskPath[2] + "px " + maskPath[1] + "px," +
        maskPath[2] + "px " + maskPath[3] + "px," +
        maskPath[0] + "px " + maskPath[3] + "px" +
    ")";
    card.mask.style.clipPath = polygon;
    card.mask.style.webkitClipPath = polygon;
    clipPaths.art = polygon;
}

/* Card Pose Tool */

var e0, art0;

function getPointer(e) {
    if (e.touches) {
        e.preventDefault();
        return {
            "x": e.touches[0].clientX,
            "y": e.touches[0].clientY,
            "target": e.touches[0].target
        };
    }
    return {
        "x": e.clientX,
        "y": e.clientY,
        "target": e.target
    };
}

function setArt0() {
    var savedRotation = card.art.style.transform;
    card.art.style.transform = "";
    var artBox = card.art.getBoundingClientRect();
    art0 = {
        "x": (artBox.left + artBox.right) / 2,
        "y": (artBox.top + artBox.bottom) / 2,
        "w": artBox.width,
        "a": -art.a.value || 0
    };
    card.art.style.transform = savedRotation;
}

function distanceFromArt0(x, y) {
    return Math.sqrt(Math.pow(x - art0.x, 2) + Math.pow(y - art0.y, 2));
}

function angleFromArt0(x, y) {
    return 180 * Math.atan((y - art0.y) / (x - art0.x)) / Math.PI + 90 * (Math.sign(x - art0.x) - 1);
}

function setCircle(x, y, r, t) {
    var poseToolBox = card.poseTool.getBoundingClientRect();
    card.circle.style.left = x - poseToolBox.left + "px";
    card.circle.style.top = y - poseToolBox.top + "px";
    if (r) {
        card.circle.style.width = 2 * r + "px";
        card.circle.style.height = 2 * r + "px";
    }
    if (t) {
        card.circle.style.borderWidth = "1px 5px 1px 1px";
        card.circle.style.transform = "translate(-50%, -50%) rotate(" + t + "deg)";
    }
    document.body.className = "posing";
}

function removeCircle() {
    card.circle.style = "";
    document.body.className = "";
}

function onPoseStart(e) {
    e = getPointer(e);
    e0 = e;
    setArt0();
    var r = distanceFromArt0(e.x, e.y);
    if (mode == "move") {
        setCircle(art0.x, art0.y, r / 2);
    }
    else if (mode == "scale") {
        setCircle(art0.x, art0.y, r);
    }
    else if (mode == "rotate") {
        var t = angleFromArt0(e.x, e.y);
        setCircle(art0.x, art0.y, r, t);
    }
    updateBounds();
    window.addEventListener("mousemove", onPoseMove);
    window.addEventListener("touchmove", onPoseMove, {"passive": false});
    window.addEventListener("mouseup", onPoseEnd);
    window.addEventListener("touchend", onPoseEnd, {"passive": false});
}

function onPoseMove(e) {
    e = getPointer(e);
    if (mode == "move") {
        var preview = document.getElementById("preview");
        var previewBox = preview.getBoundingClientRect();
        var x0 = Math.floor(art0.x - previewBox.left);
        var y0 = Math.floor(art0.y - previewBox.top);
        var dx = e.x - e0.x;
        var dy = e.y - e0.y;
        art.x.value = x0 + dx;
        art.y.value = y0 + dy;
        setX();
        setY();
        setCircle(art0.x + dx, art0.y + dy);
    }
    else if (mode == "scale") {
        var r0 = distanceFromArt0(e0.x, e0.y);
        var r = distanceFromArt0(e.x, e.y);
        art.w.value = Math.max(1, art0.w * r / r0 || 1);
        setW();
        setCircle(art0.x, art0.y, r);
    }
    else if (mode == "rotate") {
        var t0 = angleFromArt0(e0.x, e0.y);
        var t = angleFromArt0(e.x, e.y);
        art.a.value = (720 - (art0.a + t - t0)) % 360;
        setA();
        var r = distanceFromArt0(e.x, e.y);
        setCircle(art0.x, art0.y, r, t);
    }
}

function onPoseEnd(e) {
    removeCircle();
    window.removeEventListener("mousemove", onPoseMove);
    window.removeEventListener("touchmove", onPoseMove);
    window.removeEventListener("mouseup", onPoseEnd);
    window.removeEventListener("touchend", onPoseEnd);
}

/* idk data */

var gradientMapImage = {
    "error": "gradient/36.png",
    "bronze": "gradient/BronzeGradient.png",
    "silver": "gradient/SilverGradient.png",
    "gold": "gradient/GoldGradient.png",
    "fg": {
        "fire": "gradient/DiamondGradientMapFire.png",
        "water": "gradient/DiamondGradientWater.png",
        "wind": "gradient/DiamondGradientMapWind.png",
        "light": "gradient/DiamondGradientLight.png",
        "dark": "gradient/DiamondGradientDark.png",
        "neutral": "gradient/DiamondGradientMapNeutralB.png"
    },
    "bg": {
        "fire": "#301 0%, #c40818 20%, #f54 50%, #fb7 100%",
        "water": "#013 0%, #06b 20%, #3be 50%, #40f4ff 80%, #40f4ff 100%",
        "wind": "#010 0%, #208038 20%, #48c048 50%, #bf7 100%",
        "light": "#950 0%, #db5 20%, #fea 50%, #fff 100%",
        "dark": "#113 0%, #536 20%, #a464a4 50%, #ead 100%",
        "neutral": "#333 0%, #6b6b6b 20%, #aaa 50%, #eee 100%"
    }
};

var artType = "";
var artURL = "";
var mode;

/* Image Processing */

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
        imageData.data[4 * i + 3] = Math.min(a, gradientData.data[4 * intensity + 3]);
    }
    return imageData;
}

function getImageURLFromImageData(imageData) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    context.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
}

function getLinearGradientFromText(text) {
    var colorStopPattern = /\S*?\s+\d+(\.\d+)?%?/g;

    var linearGradient = "linear-gradient(to right, black 0%, ";
    var colorStops = text.match(colorStopPattern);
    try {
        var pairs = [];
        for (var colorStop of colorStops) {
            var colorStopSplit = colorStop.split(/\s+/);
            var color = colorStopSplit[0];
            var cstop = parseFloat(colorStopSplit[1]);
            pairs.push([color, cstop]);
        }
        pairs.sort(function (a, b) {
            return a[1] - b[1];
        });
        for (var pair of pairs) {
            linearGradient += pair[0] + " " + pair[1] + "%, ";
        }
    }
    catch (e) {
        for (var i = 0; i < 16; i++) {
            linearGradient += (i % 2 ? "transparent " : "white ") + i * 25 / 4 + "%, ";
        }
    }
    linearGradient += "white 100%";
    return linearGradient;
}

function getGradientDataFromText(text) {
    var colorStopPattern = /\S*?\s+\d+(\.\d+)?%?/g;

    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.height = 1;
    canvas.width = 256;
    var fillStyle = context.createLinearGradient(0, 0, 256, 0);
    var colorStops = text.match(colorStopPattern);
    try {
        fillStyle.addColorStop(0, "black");
        for (var colorStop of colorStops) {
            var colorStopSplit = colorStop.split(/\s+/);
            var color = colorStopSplit[0];
            var cstop = parseFloat(colorStopSplit[1]) / 100;
            fillStyle.addColorStop(cstop, color);
        }
        fillStyle.addColorStop(1, "white");
    }
    catch (e) {
        for (var i = 0; i < 16; i++) {
            fillStyle.addColorStop(i / 16, i % 2 ? "transparent" : "white");
        }
    }
    context.fillStyle = fillStyle;
    context.fillRect(0, 0, 256, 1);
    return context.getImageData(0, 0, canvas.width, canvas.height);
}

function loadColorizedImageURL(imageURL, gradientURLOrText) {
    if (gradientURLOrText.indexOf(".png") >= 0) { /* if both arguments are URLs */
        return Promise.all([
            loadImage(imageURL),
            loadImage(gradientURLOrText)
        ]).then(function (response) {
            var imageData = getImageDataFromImage(response[0]);
            var gradientData = getImageDataFromImage(response[1], 256, 1);
            var colorizedData = colorizeImageDataWithGradientData(imageData, gradientData);
            return getImageURLFromImageData(colorizedData);
        });
    }
    else {
        return Promise.all([
            loadImage(imageURL)
        ]).then(function (response) {
            var imageData = getImageDataFromImage(response[0]);
            var gradientData = getGradientDataFromText(gradientURLOrText);
            var colorizedData = colorizeImageDataWithGradientData(imageData, gradientData);
            return getImageURLFromImageData(colorizedData);
        });
    }
}

/* Menu Options */

function selectTier() {
    var cardTopURL = "";
    var cardBottomURL = "";
    var cardElementURL = "";
    var cardBadgeURL = "";
    if (tier.none.checked) {
        preview.className = "";
    }
    if (tier.bronze.checked) {
        preview.className = "bronze";
        cardTopURL = "fragment/BronzeTop.png";
        cardBottomURL = "fragment/BronzeBottom.png";
        cardElementURL = "fragment/BronzeElement.png";
        cardBadgeURL = "fragment/BronzeLevel.png";
    }
    else if (tier.silver.checked) {
        preview.className = "silver";
        cardTopURL = "fragment/SilverTop.png";
        cardBottomURL = "fragment/SilverBottom.png";
        cardElementURL = "fragment/SilverElement.png";
        cardBadgeURL = "fragment/SilverLevel.png";
    }
    else if (tier.gold.checked) {
        preview.className = "gold";
        cardTopURL = "fragment/GoldTop.png";
        cardBottomURL = "fragment/GoldBottom.png";
        cardElementURL = "fragment/GoldElement.png";
        cardBadgeURL = "fragment/GoldLevel.png";
    }
    else if (tier.diamond.checked) {
        preview.className = "diamond";
        cardTopURL = "fragment/DiamondTop.png";
        cardBottomURL = "fragment/DiamondBottom.png";
        cardElementURL = "fragment/DiamondElement.png";
        cardBadgeURL = "fragment/DiamondLevel.png";
    }

    var gradientURLOrText = gradientMapImage.error;
    if (element.fire.checked) {
        gradientURLOrText = gradientMapImage.fg.fire;
    }
    else if (element.water.checked) {
        gradientURLOrText = gradientMapImage.fg.water;
    }
    else if (element.wind.checked) {
        gradientURLOrText = gradientMapImage.fg.wind;
    }
    else if (element.light.checked) {
        gradientURLOrText = gradientMapImage.fg.light;
    }
    else if (element.dark.checked) {
        gradientURLOrText = gradientMapImage.fg.dark;
    }
    else if (element.neutral.checked) {
        gradientURLOrText = gradientMapImage.fg.neutral;
    }
    if (foreground.custom.checked) {
        gradientURLOrText = foreground.input.value;
    }
    else if (foreground.bronze.checked) {
        gradientURLOrText = gradientMapImage.bronze;
    }
    else if (foreground.silver.checked) {
        gradientURLOrText = gradientMapImage.silver;
    }
    else if (foreground.gold.checked) {
        gradientURLOrText = gradientMapImage.gold;
    }
    else if (foreground.fire.checked) {
        gradientURLOrText = gradientMapImage.fg.fire;
    }
    else if (foreground.water.checked) {
        gradientURLOrText = gradientMapImage.fg.water;
    }
    else if (foreground.wind.checked) {
        gradientURLOrText = gradientMapImage.fg.wind;
    }
    else if (foreground.light.checked) {
        gradientURLOrText = gradientMapImage.fg.light;
    }
    else if (foreground.dark.checked) {
        gradientURLOrText = gradientMapImage.fg.dark;
    }
    else if (foreground.neutral.checked) {
        gradientURLOrText = gradientMapImage.fg.neutral;
    }
    if (tier.diamond.checked && !element.none.checked || !foreground.default.checked && !tier.none.checked) {
        Promise.all([
            loadColorizedImageURL(cardTopURL, gradientURLOrText),
            loadColorizedImageURL(cardBottomURL, gradientURLOrText),
            loadColorizedImageURL(cardElementURL, gradientURLOrText),
            loadColorizedImageURL(cardBadgeURL, gradientURLOrText)
        ]).then(function (response) {
            card.top.src = response[0];
            card.bottom.src = response[1];
            card.scoreLeft.src = response[2];
            card.scoreCenter.src = response[2];
            card.scoreRight.src = response[2];
            card.badge.src = response[3];
        });
    }
    else {
        card.top.src = cardTopURL;
        card.bottom.src = cardBottomURL;
        card.scoreLeft.src = cardElementURL;
        card.scoreCenter.src = cardElementURL;
        card.scoreRight.src = cardElementURL;
        card.badge.src = cardBadgeURL;
    }

    fitCardScore();
    fitCardLevel();

    if (foreground.default.checked) {
        foreground.preview.style.backgroundImage = getLinearGradientFromText("");
    }
    else if (gradientURLOrText.indexOf(".png") >= 0) {
        foreground.preview.style.backgroundImage = "url('" + gradientURLOrText + "')";
    }
    else {
        foreground.preview.style.backgroundImage = getLinearGradientFromText(gradientURLOrText);
    }
}

function selectElement() {
    var cardBackURL = "fragment/GreyBackground.png";
    var gradientURLOrText = gradientMapImage.error;
    if (element.none.checked) {
        card.element.src = "";
    }
    else if (element.fire.checked) {
        card.element.src = "fragment/ElementalIconFire.png";
        gradientURLOrText = gradientMapImage.bg.fire;
    }
    else if (element.water.checked) {
        card.element.src = "fragment/ElementalIconWater.png";
        gradientURLOrText = gradientMapImage.bg.water;
    }
    else if (element.wind.checked) {
        card.element.src = "fragment/ElementalIconWind.png";
        gradientURLOrText = gradientMapImage.bg.wind;
    }
    else if (element.light.checked) {
        card.element.src = "fragment/ElementalIconLight.png";
        gradientURLOrText = gradientMapImage.bg.light;
    }
    else if (element.dark.checked) {
        card.element.src = "fragment/ElementalIconDark.png";
        gradientURLOrText = gradientMapImage.bg.dark;
    }
    else if (element.neutral.checked) {
        card.element.src = "fragment/ElementalIconNeutral.png";
        gradientURLOrText = gradientMapImage.bg.neutral;
    }
    if (background.custom.checked) {
        gradientURLOrText = background.input.value;
    }
    else if (background.fire.checked) {
        gradientURLOrText = gradientMapImage.bg.fire;
    }
    else if (background.water.checked) {
        gradientURLOrText = gradientMapImage.bg.water;
    }
    else if (background.wind.checked) {
        gradientURLOrText = gradientMapImage.bg.wind;
    }
    else if (background.light.checked) {
        gradientURLOrText = gradientMapImage.bg.light;
    }
    else if (background.dark.checked) {
        gradientURLOrText = gradientMapImage.bg.dark;
    }
    else if (background.neutral.checked) {
        gradientURLOrText = gradientMapImage.bg.neutral;
    }

    if (!element.none.checked || !background.default.checked) {
        loadColorizedImageURL(cardBackURL, gradientURLOrText).then(function (response) {
            card.back.src = response;
        });
    }
    else {
        card.back.src = cardBackURL;
    }

    if (tier.diamond.checked && foreground.default.checked) {
        selectTier();
    }

    if (background.default.checked) {
        background.preview.style.backgroundImage = getLinearGradientFromText("");
    }
    else {
        background.preview.style.backgroundImage = getLinearGradientFromText(gradientURLOrText);
    }
}

function selectEnergy() {
    var boltURL = "";
    if (energy.yellow.checked) {
        boltURL = "fragment/EnergyIcon.png";
    }
    else if (energy.blue.checked) {
        boltURL = "fragment/EnergyIcon-Blue.png";
    }
    else if (energy.blank.checked) {
        boltURL = "fragment/EnergyBlank.png";
    }
    card.energy.innerHTML = "";
    if (!energy.none.checked) {
        for (var i = 0; i < 10; i++) {
            var bolt = new Image();
            bolt.src = boltURL;
            card.energy.appendChild(bolt);
        }
    }
}

function bound(input) {
    input.value = Math.max(input.min, Math.min(input.value, input.max));
}

function updateBounds() {
    var poseToolBox = card.poseTool.getBoundingClientRect();
    var artBox = card.art.getBoundingClientRect();
    art.x.min = 50 + Math.floor(-artBox.width / 2);
    art.x.max = 50 + Math.ceil(poseToolBox.width + artBox.width / 2);
    art.y.min = 50 + Math.floor(-artBox.height / 2);
    art.y.max = 50 + Math.ceil(poseToolBox.height + artBox.height / 2);
    setX();
    setY();
}

function selectArt() {
    var file = this.files[0];
    if (/image\//.test(file.type)) {
        var reader = new FileReader();
        reader.addEventListener("load", function () {
            /* fixes orientation rendering issue, but allows gifs to animate */
            loadImage(this.result).then(function (image) {
                artType = file.type;
                if (artType == "image/gif") {
                    artURL = image.src;
                }
                else {
                    var imageData = getImageDataFromImage(image);
                    artURL = getImageURLFromImageData(imageData);
                    if (imageData.width == 360 && imageData.height == 340) {
                        art.x.value = 198;
                        art.y.value = 174;
                        art.w.value = 362;
                        art.a.value = 0;
                        setW();
                        setA();
                    }
                }
                card.art.src = artURL;
            });
        });
        reader.readAsDataURL(file);
    }
}

function selectPoseTool() {
    mode = this.id.split("-")[1];
}

function setX() {
    bound(art.x);
    card.art.style.left = art.x.value + "px";
}

function setY() {
    bound(art.y);
    card.art.style.top = art.y.value + "px";
}

function setW() {
    card.art.style.width = art.w.value + "px";
    updateBounds();
}

function setA() {
    card.art.style.transform = "translate(-50%, -50%) rotateZ(" + -art.a.value + "deg)";
    updateBounds();
}

function selectOverlap() {
    if (art.under.checked) {
        card.overlapTool.appendChild(card.top);
    }
    else if (art.over.checked) {
        card.overlapTool.appendChild(card.mask);
    }
}

function selectForeground() {
    if (foreground.default.checked) {
        foreground.preview.classList.add("dim");
    }
    else {
        foreground.preview.classList.remove("dim");
    }
    if (foreground.custom.checked) {
        foreground.preview.classList.remove("disabled");
        foreground.input.classList.remove("disabled");
        foreground.input.classList.remove("dim");
    }
    else {
        foreground.preview.classList.add("disabled");
        foreground.input.classList.add("disabled");
        foreground.input.classList.add("dim");
    }
    selectTier();
}

function selectBackground() {
    if (background.default.checked) {
        background.preview.classList.add("dim");
    }
    else {
        background.preview.classList.remove("dim");
    }
    if (background.custom.checked) {
        background.preview.classList.remove("disabled");
        background.input.classList.remove("disabled");
        background.input.classList.remove("dim");
    }
    else {
        background.preview.classList.add("disabled");
        background.input.classList.add("disabled");
        background.input.classList.add("dim");
    }
    selectElement();
}

/* Gradient Picker */

var swatch = document.getElementById("swatch");
var picker;
var hex = document.getElementById("hex");
var percent = document.getElementById("percent");
function initIro() {
    picker = new iro.ColorPicker("#iro", {
        "width": 192,
        "borderWidth": 1,
        "borderColor": "var(--fg)",
        "sliderMargin": 3,
        "layoutDirection": "horizontal",
        "layout": [
            {
                "component": iro.ui.Box,
            },
            {
                "component": iro.ui.Slider,
                "options": {
                    "sliderType": "hue"
                }
            },
            {
                "component": iro.ui.Slider,
                "options": {
                    "sliderType": "alpha",
                    "padding": 0,
                }
            }
        ]
    });
    picker.on("color:change", function () {
        hex.value = picker.color.alpha < 1 ? picker.color.hex8String : picker.color.hexString;
    })
}
initIro();
console.log(picker.props);

function onCancelPreview(e) {
    console.log(9);
    if (e.target != swatch) {
        swatch.style = "";
        window.removeEventListener("click", onCancelPreview);
        foreground.preview.addEventListener("click", onClickPreview);
    }
}

var activeBand, previewRect;
function onEndBand(e) {
    document.body.style = "none";
    window.removeEventListener("mousemove", onMoveBand);
    window.removeEventListener("touchmove", onMoveBand);
    window.removeEventListener("mouseup", onEndBand);
    window.removeEventListener("touchend", onEndBand);
}
function onMoveBand(e) {
    e = getPointer(e);
    var swatchRect = swatch.getBoundingClientRect();
    var i = 1 * Math.round(100 * ((e.clientX - previewRect.left) / previewRect.width));
    activeBand.style.left = i + "%";
    activeBand.style.transform = "translate(-50%)";
    swatch.style.left = previewRect.left + previewRect.width * i / 100 - swatchRect.width / 2 + "px";
    percent.value = i;
}
function onStartBand(e) {
    e = getPointer(e);
    var swatchRect = swatch.getBoundingClientRect();
    if (e.target.classList.contains("band")) {
        activeBand = e.target;
        previewRect = e.target.parentElement.getBoundingClientRect();
    }
    else {
        activeBand = document.createElement("div");
        activeBand.className = "band";
        this.appendChild(activeBand);
        previewRect = e.target.getBoundingClientRect();
    }
    swatch.style.top = scrollY - 16 + previewRect.top - swatchRect.height + "px";
    onMoveBand(e);

    document.body.style.webkitUserSelect = "none";
    document.body.style.userSelect = "none";
    document.body.style.pointerEvents = "none";
    window.addEventListener("mousemove", onMoveBand);
    window.addEventListener("touchmove", onMoveBand);
    window.addEventListener("mouseup", onEndBand);
    window.addEventListener("touchend", onEndBand);

}

/* Render */

function renderCard(opaque) {
    var singlePattern = /-?\d+(\.\d+)?(e-?\d+)?(px|%)?/g;
    var pairPattern = /-?\d+(\.\d+)?(px|%)\s+-?\d+(\.\d+)?(px|%)/g;

    var preview = document.getElementById("preview");
    var previewBox = preview.getBoundingClientRect();

    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.width = Math.round(previewBox.width);
    canvas.height = Math.round(previewBox.height);
    if (opaque) {
        context.save();
        context.fillStyle = "black";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();
    }

    var images = preview.getElementsByTagName("img");
    for (var image of images) {
        context.save();

        if (image == card.art) {
            context.moveTo(maskPath[0], maskPath[1]);
            context.lineTo(maskPath[2], maskPath[1]);
            context.lineTo(maskPath[2], maskPath[3]);
            context.lineTo(maskPath[0], maskPath[3]);
            context.clip();
        }

        var imageStyle = getComputedStyle(image);
        var matrix = imageStyle.transform.match(singlePattern) || [
            1, 0, 0,
            1, 0, 0
        ];
        var a = parseFloat(matrix[0]);
        var b = parseFloat(matrix[1]);
        var c = parseFloat(matrix[2]);
        var d = parseFloat(matrix[3]);
        var e = parseFloat(matrix[4]);
        var f = parseFloat(matrix[5]);
        var origin = imageStyle.transformOrigin.match(singlePattern) || [
            parseFloat(imageStyle.width) / 2,
            parseFloat(imageStyle.height) / 2
        ];
        var x0 = parseFloat(imageStyle.left) + parseFloat(origin[0]);
        var y0 = parseFloat(imageStyle.top) + parseFloat(origin[1]);
        context.translate(x0, y0);
        context.transform(a, b, c, d, e, f);
        context.translate(-x0, -y0);

        var savedTransform = image.style.transform;
        image.style.transform = "none";
        var imageBox = image.getBoundingClientRect();

        var clipPath = imageStyle.clipPath;
        if (clipPath == "none") {
            clipPath = imageStyle.webkitClipPath;
        }
        if (
            (typeof clipPath == "undefined" || clipPath == "none") &&
            image.id.includes("card-element-") &&
            !image.id.includes("-icon")
        ) {
            var key = image.id.split("-").slice(-1)[0];
            if (preview.classList.contains("gold")) {
                key += "Gold";
            }
            clipPath = clipPaths[key];
        }
        if (typeof clipPath != "undefined" && clipPath != "none") {
            context.beginPath();
            var clipPoints = clipPath.match(pairPattern);
            for (var i = 0; i < clipPoints.length; i++) {
                var clipPoint = clipPoints[i].match(singlePattern);
                var x = parseFloat(clipPoint[0]);
                var y = parseFloat(clipPoint[1]);
                if (/%/.test(clipPoint[0])) {
                    x *= imageBox.width / 100;
                }
                if (/%/.test(clipPoint[1])) {
                    y *= imageBox.height / 100;
                }
                x += imageBox.left - previewBox.left;
                y += imageBox.top - previewBox.top;
                if (i == 0) {
                    context.moveTo(x, y);
                }
                else {
                    context.lineTo(x, y);
                }
            }
            context.clip();
        }

        context.drawImage(
            image,
            imageBox.left - previewBox.left,
            imageBox.top - previewBox.top,
            imageBox.width,
            imageBox.height
        );

        image.style.transform = savedTransform;

        context.restore();
    }

    var texts = preview.getElementsByTagName("input");
    for (var text of texts) {
        context.save();
        var textBox = text.getBoundingClientRect();
        var textStyle = getComputedStyle(text);
        context.font = textStyle.fontSize + " " + textStyle.fontFamily;
        context.fillStyle = textStyle.color;
        context.textAlign = textStyle.textAlign;
        context.textBaseline = "middle";
        context.shadowOffsetX = 0.07 * parseFloat(textStyle.fontSize);
        context.shadowOffsetY = 0.07 * parseFloat(textStyle.fontSize);
        context.shadowColor = "black";
        var x = (context.textAlign == "center" ? (textBox.left + textBox.right) / 2 : textBox.left) - previewBox.left;
        var y = (textBox.top + textBox.bottom) / 2 - previewBox.top;
        context.fillText(text.value.toUpperCase(), x, y);
        context.restore();
    }

    context.save();
    context.font = "16px Washington";
    if (opaque) {
        context.fillStyle = "rgba(255, 255, 255, 0.05)";
    }
    else {
        context.fillStyle = "rgba(0, 0, 0, 0.05)";
    }
    context.textAlign = "left";
    context.textBaseline = "bottom";
    context.rotate(Math.PI * -90 / 180);
    context.fillText("SGMCARD.NETLIFY.APP", -504, 395);
    context.restore();

    return canvas;
}

function renderNextFrame(artSuperGIF, cardArt, i) {
    function request(resolve, reject) {
        var renderFrame = function () {
            cardArt.removeEventListener("load", renderFrame);
            resolve({
                "transparent": renderCard(),
                "opaque": renderCard(true)
            });
        };
        cardArt.addEventListener("load", renderFrame);
        artSuperGIF.move_to(i);
        cardArt.src = artSuperGIF.get_canvas().toDataURL();
    }
    return new Promise(request);
}

function createCardImage(dataURL) {
    var image = new Image();
    image.src = dataURL;
    render.imageContainer.innerHTML = "";
    render.imageContainer.appendChild(image);
}

function createCardZip(blob) {
    var anchor = document.createElement("a");
    anchor.innerHTML = "Click here to download the frames as a ZIP of individual PNGs instead.";
    anchor.addEventListener("click", function () {
        saveAs(blob, "card");
    });
    render.zipContainer.innerHTML = "";
    render.zipContainer.appendChild(anchor);
    render.disclaimer.className = "";
}

function createAnimatedCard() {
    document.body.classList.add("disabled");
    render.button.classList.add("loading");

    var artGIF = new Image();
    artGIF.className = "pre-jsgif";
    artGIF.src = artURL;
    document.body.appendChild(artGIF);

    var artSuperGIF = new SuperGif({
    	"gif": artGIF,
    	"max_width": art.w.value
    });
    window.scrollTo(0, innerHeight);
    artSuperGIF.load(function () {
        var frameLength = artSuperGIF.get_length();
        if (frameLength <= 1) {
            artSuperGIF.get_canvas().parentElement.remove();
            createStaticCard();
            return;
        }

        var responses = [];
        var promise = renderNextFrame(artSuperGIF, card.art, 0);
        for (var i = 1; i < frameLength; i++) {
            (function (i) {
                promise = promise.then(function (response) {
                    responses.push(response);
                    return renderNextFrame(artSuperGIF, card.art, i);
                });
            })(i);
        }
        promise.then(function (response) {
            responses.push(response);

            var zip = new JSZip();
            for (var i = 0; i < responses.length; i++) {
                var dataURL = responses[i].transparent.toDataURL();
                zip.file(i + ".png", dataURL.slice(22), {"base64": true});
            }
            zip.generateAsync({"type": "blob"}).then(createCardZip);

            var encoder = new GIF({
                "quality": 64,
                "workers": 8,
                "workerScript": "library/gif-js/gif.worker.js"
            });
            for (var i in responses) {
                encoder.addFrame(responses[i].opaque, {"delay": 1});
            }
            encoder.on("finished", function (blob) {
                card.art.src = artURL;
                for (var worker of encoder.freeWorkers) {
                    worker.terminate();
                }
                var reader = new FileReader();
                reader.addEventListener("load", function () {
                    createCardImage(this.result);
                    artSuperGIF.get_canvas().parentElement.remove();
                    document.body.classList.remove("disabled");
                    render.button.classList.remove("loading");
                });
                reader.addEventListener("error", function () {
                    document.body.classList.remove("disabled");
                    render.button.classList.remove("loading");
                });
                reader.readAsDataURL(blob);
            });
            encoder.render();
        });
    });
}

function createStaticCard() {
    render.button.classList.add("loading");
    var canvas = renderCard();
    createCardImage(canvas.toDataURL());
    render.disclaimer.className = "hidden";
    render.button.classList.remove("loading");
}

function createCard() {
    if (artType == "image/gif") {
        createAnimatedCard();
    }
    else {
        createStaticCard()
    }
}

/* Event Listeners */

card.score.addEventListener("input", fitCardScore);
card.level.addEventListener("input", fitCardLevel);
card.variant.addEventListener("input", fitCardVariant);
card.fighter.addEventListener("input", fitCardFighter);

card.maskLeft.addEventListener("click", toggleMaskSegment);
card.maskRight.addEventListener("click", toggleMaskSegment);
card.maskTop.addEventListener("click", toggleMaskSegment);
card.maskBottom.addEventListener("click", toggleMaskSegment);

card.art.addEventListener("load", updateBounds);

card.poseTool.addEventListener("mousedown", onPoseStart);
card.poseTool.addEventListener("touchstart", onPoseStart);

for (var option in tier) {
    tier[option].addEventListener("click", selectTier);
}
for (var option in element) {
    element[option].addEventListener("click", selectElement);
}
for (var option in energy) {
    energy[option].addEventListener("click", selectEnergy);
}

art.file.addEventListener("change", selectArt);
art.move.addEventListener("click", selectPoseTool);
art.x.addEventListener("input", setX);
art.y.addEventListener("input", setY);
art.scale.addEventListener("click", selectPoseTool);
art.w.addEventListener("input", setW);
art.rotate.addEventListener("click", selectPoseTool);
art.a.addEventListener("input", setA);
art.over.addEventListener("click", selectOverlap);
art.under.addEventListener("click", selectOverlap);

for (var option in foreground) {
    if (foreground[option].type == "radio") {
        foreground[option].addEventListener("click", selectForeground);
    }
}
foreground.preview.addEventListener("mousedown", onStartBand);
foreground.preview.addEventListener("touchstart", onStartBand);
foreground.input.addEventListener("change", selectTier);

for (var option in background) {
    if (background[option].type == "radio") {
        background[option].addEventListener("click", selectBackground);
    }
}
background.preview.addEventListener("mousedown", onStartBand);
background.preview.addEventListener("touchstart", onStartBand);
background.input.addEventListener("change", selectElement);

render.button.addEventListener("click", createCard);

/* (Re)Initialize Options */

window.addEventListener("load", function () {
    tier.none.checked = true;
    element.none.checked = true;
    energy.none.click();
    updateBounds();
    art.under.click();
    art.move.click();
    foreground.default.click();
    background.default.click();
});

/* Unload Warning */

function holup(e) {
    e.preventDefault();
    e.returnValue = "Changes you made may not be saved.";
    return e.returnValue;
}

window.addEventListener("beforeunload", holup);

});
