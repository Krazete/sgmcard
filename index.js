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
    "character": document.getElementById("card-character")
};

var clipPaths = { /* backup for firefox <54 */
    "left": "polygon(0px 0px, 80px 0px, 80px 100%, 0px 100%)",
    "center": "polygon(80px 0px, 81px 0px, 81px 100%, 80px 100%)",
    "right": "polygon(81px 0px, 100% 0px, 100% 100%, 81px 100%)",
    "leftGold": "polygon(0px 0px, 87px 0px, 87px 100%, 0px 100%)",
    "centerGold": "polygon(87px 0px, 88px 0px, 88px 100%, 87px 100%)",
    "rightGold": "polygon(88px 0px, 100% 0px, 100% 100%, 88px 100%)",
    "art": "none"
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

var override = {
    "fg": {
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
        "gradient": document.getElementById("fg-gradient"),
        "input": document.getElementById("option-fg"),
        "update": selectTier
    },
    "bg": {
        "default": document.getElementById("option-bg-default"),
        "custom": document.getElementById("option-bg-custom"),
        "fire": document.getElementById("option-bg-fire"),
        "water": document.getElementById("option-bg-water"),
        "wind": document.getElementById("option-bg-wind"),
        "light": document.getElementById("option-bg-light"),
        "dark": document.getElementById("option-bg-dark"),
        "neutral": document.getElementById("option-bg-neutral"),
        "gradient": document.getElementById("bg-gradient"),
        "input": document.getElementById("option-bg"),
        "update": selectElement
    }
};

var render = {
    "button": document.getElementById("option-render"),
    "imageContainer": document.getElementById("render-image"),
    "disclaimer": document.getElementById("render-disclaimer"),
    "zipContainer": document.getElementById("render-zip")
};

var swatch = {
    "window": document.getElementById("swatch"),
    "hex": document.getElementById("hex"),
    "percent": document.getElementById("percent"),
    "delete": document.getElementById("delete")
}

var picker = new iro.ColorPicker("#iro", {
    "width": 160,
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

/* General Functions */

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

function getImageURLFromImageData(imageData) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    context.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
}

function bound(n, min, max) {
    return Math.max(min, Math.min(n, max));
}

function boundInput(input) {
    input.value = bound(input.value, input.min, input.max);
}

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

function fitCardCharacter() {
    autofit(card.character, 38, 250);
}

/* Card Mask Tool */

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

var e0, art0, mode;

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
    return 180 * Math.atan((y - art0.y) / (x - art0.x)) / Math.PI - (x - art0.x < 0 ? 180 : 0);
}

function setCircle(x, y, r, t) { /* displays results as if unaffected by updateBounds */
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
    e0 = getPointer(e);
    setArt0();
    var r = distanceFromArt0(e0.x, e0.y);
    if (mode == "move") {
        setCircle(art0.x, art0.y, r / 2);
    }
    else if (mode == "scale") {
        setCircle(art0.x, art0.y, r);
    }
    else if (mode == "rotate") {
        var t = angleFromArt0(e0.x, e0.y);
        setCircle(art0.x, art0.y, r, t);
    }
    updateBounds();
    window.addEventListener("mousemove", onPoseMove);
    window.addEventListener("touchmove", onPoseMove, {"passive": false});
    window.addEventListener("mouseup", onPoseEnd);
    window.addEventListener("touchend", onPoseEnd);
}

function onPoseMove(e) {
    var e1 = getPointer(e);
    if (mode == "move") {
        var preview = document.getElementById("preview");
        var previewBox = preview.getBoundingClientRect();
        var x0 = Math.floor(art0.x - previewBox.left);
        var y0 = Math.floor(art0.y - previewBox.top);
        var dx = e1.x - e0.x;
        var dy = e1.y - e0.y;
        art.x.value = x0 + dx;
        art.y.value = y0 + dy;
        setX();
        setY();
        setCircle(art0.x + dx, art0.y + dy);
    }
    else if (mode == "scale") {
        var r0 = distanceFromArt0(e0.x, e0.y);
        var r1 = distanceFromArt0(e1.x, e1.y);
        art.w.value = Math.max(1, art0.w * r1 / r0 || 1);
        setW();
        setCircle(art0.x, art0.y, r1);
    }
    else if (mode == "rotate") {
        var t0 = angleFromArt0(e0.x, e0.y);
        var t1 = angleFromArt0(e1.x, e1.y);
        art.a.value = (720 - (art0.a + t1 - t0)) % 360;
        setA();
        var r = distanceFromArt0(e1.x, e1.y);
        setCircle(art0.x, art0.y, r, t1);
    }
}

function onPoseEnd(e) {
    removeCircle();
    window.removeEventListener("mousemove", onPoseMove);
    window.removeEventListener("touchmove", onPoseMove);
    window.removeEventListener("mouseup", onPoseEnd);
    window.removeEventListener("touchend", onPoseEnd);
}

/* Image Processing */

var specialCSL = {
    "fg": [],
    "bg": [],
    "error": [
        {"color": "white", "stop": 0},
        {"color": "transparent", "stop": 6.25},
        {"color": "white", "stop": 12.5},
        {"color": "transparent", "stop": 18.75},
        {"color": "white", "stop": 25},
        {"color": "transparent", "stop": 31.25},
        {"color": "white", "stop": 37.5},
        {"color": "transparent", "stop": 43.75},
        {"color": "white", "stop": 50},
        {"color": "transparent", "stop": 56.25},
        {"color": "white", "stop": 62.5},
        {"color": "transparent", "stop": 68.75},
        {"color": "white", "stop": 75},
        {"color": "transparent", "stop": 81.25},
        {"color": "white", "stop": 87.5},
        {"color": "transparent", "stop": 93.75},
        {"color": "white", "stop": 100}
    ]
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

function loadColorizedImageURL(imageURL, gradientURLOrCSL) {
    if (gradientURLOrCSL.indexOf(".png") >= 0) { /* if both arguments are URLs */
        return Promise.all([
            loadImage(imageURL),
            loadImage(gradientURLOrCSL)
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
            var gradientData = getGradientDataFromCSL(gradientURLOrCSL);
            var colorizedData = colorizeImageDataWithGradientData(imageData, gradientData);
            return getImageURLFromImageData(colorizedData);
        });
    }
}

function getLinearGradientFromCSL(csl) {
    var linearGradient = "linear-gradient(to right, black 0%, ";
    if (csl.length <= 0) {
        csl = specialCSL.error;
    }
    for (var cs of csl) {
        linearGradient += cs.color + " " + cs.stop + "%, ";
    }
    linearGradient += "white 100%";
    return linearGradient;
}

function getGradientDataFromCSL(csl) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.height = 1;
    canvas.width = 256;
    var fillStyle = context.createLinearGradient(0, 0, 256, 0);
    fillStyle.addColorStop(0, "black");
    if (csl.length <= 0) {
        csl = specialCSL.error;
    }
    for (var cs of csl) {
        fillStyle.addColorStop(cs.stop / 100, cs.color);
    }
    fillStyle.addColorStop(1, "white");
    context.fillStyle = fillStyle;
    context.fillRect(0, 0, 256, 1);
    return context.getImageData(0, 0, canvas.width, canvas.height);
}

/* Menu Options */

function selectTier() {
    var cardTopURL = "";
    var cardBottomURL = "";
    var cardScoreURL = "";
    var cardBadgeURL = "";
    if (tier.none.checked) {
        preview.className = "";
    }
    else if (tier.bronze.checked) {
        preview.className = "bronze";
        cardTopURL = "fragment/BronzeTop.png";
        cardBottomURL = "fragment/BronzeBottom.png";
        cardScoreURL = "fragment/BronzeElement.png";
        cardBadgeURL = "fragment/BronzeLevel.png";
    }
    else if (tier.silver.checked) {
        preview.className = "silver";
        cardTopURL = "fragment/SilverTop.png";
        cardBottomURL = "fragment/SilverBottom.png";
        cardScoreURL = "fragment/SilverElement.png";
        cardBadgeURL = "fragment/SilverLevel.png";
    }
    else if (tier.gold.checked) {
        preview.className = "gold";
        cardTopURL = "fragment/GoldTop.png";
        cardBottomURL = "fragment/GoldBottom.png";
        cardScoreURL = "fragment/GoldElement.png";
        cardBadgeURL = "fragment/GoldLevel.png";
    }
    else if (tier.diamond.checked) {
        preview.className = "diamond";
        cardTopURL = "fragment/DiamondTop.png";
        cardBottomURL = "fragment/DiamondBottom.png";
        cardScoreURL = "fragment/DiamondElement.png";
        cardBadgeURL = "fragment/DiamondLevel.png";
    }

    var gradientURLOrCSL = "gradient/36.png";
    if (override.fg.custom.checked) {
        var fg = filteredBands(specialCSL.fg);
        gradientURLOrCSL = fg.length ? fg : specialCSL.error;
    }
    else if (override.fg.bronze.checked) {
        gradientURLOrCSL = "gradient/BronzeGradient.png";
    }
    else if (override.fg.silver.checked) {
        gradientURLOrCSL = "gradient/SilverGradient.png";
    }
    else if (override.fg.gold.checked) {
        gradientURLOrCSL = "gradient/GoldGradient.png";
    }
    else if (override.fg.fire.checked || override.fg.default.checked && element.fire.checked) {
        gradientURLOrCSL = "gradient/DiamondGradientMapFire.png";
    }
    else if (override.fg.water.checked || override.fg.default.checked && element.water.checked) {
        gradientURLOrCSL = "gradient/DiamondGradientWater.png";
    }
    else if (override.fg.wind.checked || override.fg.default.checked && element.wind.checked) {
        gradientURLOrCSL = "gradient/DiamondGradientMapWind.png";
    }
    else if (override.fg.light.checked || override.fg.default.checked && element.light.checked) {
        gradientURLOrCSL = "gradient/DiamondGradientLight.png";
    }
    else if (override.fg.dark.checked || override.fg.default.checked && element.dark.checked) {
        gradientURLOrCSL = "gradient/DiamondGradientDark.png";
    }
    else if (override.fg.neutral.checked || override.fg.default.checked && element.neutral.checked) {
        gradientURLOrCSL = "gradient/DiamondGradientMapNeutralB.png";
    }

    if (tier.diamond.checked && !element.none.checked || !tier.none.checked && !override.fg.default.checked) {
        Promise.all([
            loadColorizedImageURL(cardTopURL, gradientURLOrCSL),
            loadColorizedImageURL(cardBottomURL, gradientURLOrCSL),
            loadColorizedImageURL(cardScoreURL, gradientURLOrCSL),
            loadColorizedImageURL(cardBadgeURL, gradientURLOrCSL)
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
        card.scoreLeft.src = cardScoreURL;
        card.scoreCenter.src = cardScoreURL;
        card.scoreRight.src = cardScoreURL;
        card.badge.src = cardBadgeURL;
    }

    fitCardScore();
    fitCardLevel();

    if (override.fg.default.checked) {
        override.fg.gradient.style.backgroundImage = getLinearGradientFromCSL(specialCSL.error);
    }
    else if (gradientURLOrCSL.indexOf(".png") >= 0) {
        override.fg.gradient.style.backgroundImage = "url('" + gradientURLOrCSL + "')";
    }
    else {
        override.fg.gradient.style.backgroundImage = getLinearGradientFromCSL(gradientURLOrCSL);
    }
}

function selectElement() {
    if (element.none.checked) {
        card.element.src = "";
    }
    else if (element.fire.checked) {
        card.element.src = "fragment/ElementalIconFire.png";
    }
    else if (element.water.checked) {
        card.element.src = "fragment/ElementalIconWater.png";
    }
    else if (element.wind.checked) {
        card.element.src = "fragment/ElementalIconWind.png";
    }
    else if (element.light.checked) {
        card.element.src = "fragment/ElementalIconLight.png";
    }
    else if (element.dark.checked) {
        card.element.src = "fragment/ElementalIconDark.png";
    }
    else if (element.neutral.checked) {
        card.element.src = "fragment/ElementalIconNeutral.png";
    }

    var cardBackURL = "fragment/GreyBackground.png";
    var gradientURLOrCSL = "gradient/36.png";
    if (override.bg.custom.checked) {
        var bg = filteredBands(specialCSL.bg);
        gradientURLOrCSL = bg.length ? bg : specialCSL.error;
    }
    else if (override.bg.fire.checked || override.bg.default.checked && element.fire.checked) {
        gradientURLOrCSL = [
            {"color": "#301", "stop": 0},
            {"color": "#c40818", "stop": 20},
            {"color": "#f54", "stop": 50},
            {"color": "#fb7", "stop": 100}
        ];
    }
    else if (override.bg.water.checked || override.bg.default.checked && element.water.checked) {
        gradientURLOrCSL = [
            {"color": "#013", "stop": 0},
            {"color": "#06b", "stop": 20},
            {"color": "#3be", "stop": 50},
            {"color": "#40f4ff", "stop": 80},
            {"color": "#40f4ff", "stop": 100}
        ];
    }
    else if (override.bg.wind.checked || override.bg.default.checked && element.wind.checked) {
        gradientURLOrCSL = [
            {"color": "#010", "stop": 0},
            {"color": "#208038", "stop": 20},
            {"color": "#48c048", "stop": 50},
            {"color": "#bf7", "stop": 100}
        ];
    }
    else if (override.bg.light.checked || override.bg.default.checked && element.light.checked) {
        gradientURLOrCSL = [
            {"color": "#950", "stop": 0},
            {"color": "#db5", "stop": 20},
            {"color": "#fea", "stop": 50},
            {"color": "#fff", "stop": 100}
        ];
    }
    else if (override.bg.dark.checked || override.bg.default.checked && element.dark.checked) {
        gradientURLOrCSL = [
            {"color": "#113", "stop": 0},
            {"color": "#536", "stop": 20},
            {"color": "#a464a4", "stop": 50},
            {"color": "#ead", "stop": 100}
        ];
    }
    else if (override.bg.neutral.checked || override.bg.default.checked && element.neutral.checked) {
        gradientURLOrCSL = [
            {"color": "#333", "stop": 0},
            {"color": "#6b6b6b", "stop": 20},
            {"color": "#a0a0a0", "stop": 50},
            {"color": "#eee", "stop": 100}
        ];
    }

    if (!element.none.checked || !override.bg.default.checked) {
        loadColorizedImageURL(cardBackURL, gradientURLOrCSL).then(function (response) {
            card.back.src = response;
        });
    }
    else {
        card.back.src = cardBackURL;
    }

    if (tier.diamond.checked && override.fg.default.checked) {
        selectTier();
    }

    if (override.bg.default.checked) {
        override.bg.gradient.style.backgroundImage = getLinearGradientFromCSL(specialCSL.error);
    }
    else {
        override.bg.gradient.style.backgroundImage = getLinearGradientFromCSL(gradientURLOrCSL);
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

var artType = "";
var artURL = "";
var knownNames = {
    "Annie": "Annie",
    "Beowulf": "Beowulf",
    "BigBand": "Big Band",
    "HeavyMetal": "Big Band",
    "BlackDahlia": "Black Dahlia",
    "Cerebella": "Cerebella",
    "Double": "Double",
    "Eliza": "Eliza",
    "Filia": "Filia",
    "Fukua": "Fukua",
    "Marie": "Marie",
    "MsFortune": "Ms. Fortune",
    "Painwheel": "Painwheel",
    "Parasoul": "Parasoul",
    "Peacock": "Peacock",
    "RoboFortune": "Robo-Fortune",
    "Squigly": "Squigly",
    "Umbrella": "Umbrella",
    "Valentine": "Valentine"
};

function selectArt() {
    if (this.files.length) {
        var file = this.files[0];
        if (file.type.includes("image/")) {
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
            var prefix = file.name.split(/_|\./)[0];
            if (prefix in knownNames) {
                card.character.value = knownNames[prefix];
                fitCardCharacter();
            }
        }
    }
}

function selectPoseTool() {
    mode = this.id.split("-")[1];
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

function setX() {
    boundInput(art.x);
    card.art.style.left = art.x.value + "px";
}

function setY() {
    boundInput(art.y);
    card.art.style.top = art.y.value + "px";
}

function setW() {
    art.w.value = Math.max(art.w.min, art.w.value);
    card.art.style.width = art.w.value + "px";
    updateBounds();
}

function setA() {
    boundInput(art.a);
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

/* Gradient Picker */

function selectOverride() {
    var ground = this.id.split("-")[1];
    if (override[ground].default.checked) {
        override[ground].gradient.classList.add("dim");
    }
    else {
        override[ground].gradient.classList.remove("dim");
    }
    if (override[ground].custom.checked) {
        override[ground].gradient.classList.remove("disabled");
        override[ground].input.classList.remove("disabled");
        override[ground].input.classList.remove("dim");
    }
    else {
        override[ground].gradient.classList.add("disabled");
        override[ground].input.classList.add("disabled");
        override[ground].input.classList.add("dim");
    }
    override[ground].update();
}

var eb0, activeGround, activeGradientBox, activeBand, swatchBox, trackerId;

function getHex(color) {
    var validhexPattern = /^#([\da-f]{3}[\da-f]?|[\da-f]{6}([\da-f]{2})?)$/i;
    if (validhexPattern.test(color)) {
        return color;
    }
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    try {
        var linearGradient = context.createLinearGradient(0, 0, 0, 0);
        linearGradient.addColorStop(0, color);
    }
    catch {
        return false;
    }
    context.fillStyle = color;
    return context.fillStyle;
}

function closeSwatch(e) {
    if (e === true || !swatch.window.contains(getPointer(e).target)) {
        swatch.window.style = "";
        window.removeEventListener("mousedown", closeSwatch);
        window.removeEventListener("touchstart", closeSwatch);
    }
}

function Band(ground, color, percent) {
    this.element = document.createElement("div");
    this.element.className = "band";
    this.ground = ground;
    this.setColor(color);
    this.setPercent(percent);

    specialCSL[ground].push(this);
    override[ground].gradient.appendChild(this.element);
    return this;
}

Band.prototype.setColor = function (color) {
    this.color = color || "transparent";
    this.hex = getHex(color);
    if (this.hex) {
        this.element.style.background = this.color;
    }
    else {
        this.element.style.background = "linear-gradient(black, red, white, red, black)";
    }
}

Band.prototype.setPercent = function (percent) {
    this.stop = bound(percent, 0, 100);
    this.element.style.left = this.stop + "%";
}

Band.prototype.delete = function () {
    closeSwatch(true);
    this.element.remove();
    var i = specialCSL[this.ground].indexOf(this);
    specialCSL[this.ground].splice(i, 1);
}

function getPercentFromPointer() {
    return bound(Math.round(100 * (eb0.x - activeGradientBox.left) / activeGradientBox.width), 0, 100);
}

function filteredBands(bands) {
    return bands.filter(function (e) {
        return e.hex;
    });
}

function getColorFromPercent(percent) {
    var validBands = filteredBands(specialCSL[activeGround]);
    var p = Math.floor(255 * percent / 100);
    var color = "#";
    if (validBands.length) {
        var gradientData = getGradientDataFromCSL(validBands);
        for (var i = 0; i < 4; i++) {
            var c = gradientData.data[4 * p + i];
            if (i < 3 || c < 255) {
                color += c.toString(16).padStart(2, "0");
            }
        }
    }
    else {
        color += p.toString(16).padStart(2, "0").repeat(3);
    }
    return color;
}

function updateSwatchPosition() {
    swatch.window.style.left = bound(
        scrollX + activeGradientBox.left - swatchBox.width / 2 + activeGradientBox.width * activeBand.stop / 100,
        0, innerWidth - swatchBox.width
    ) + "px";
}

function sortGround() {
    specialCSL[activeGround].sort(function (a, b) {
        return a.stop - b.stop;
    });
}

function updateEverything() { /* update text input, gradient bar, and card front or back */
    sortGround();
    var pairs = [];
    for (var band of specialCSL[activeGround]) {
        pairs.push(band.color + " " + band.stop + "%");
    }
    override[activeGround].input.value = pairs.join(", ");
    override[activeGround].update();
}

function updateSwatch() {
    if (activeBand.hex) {
        swatch.window.classList.remove("invalid");
    }
    else {
        swatch.window.classList.add("invalid");
    }
}

function updatePicker() {
    picker.setColors([activeBand.hex]);
    updateSwatch();
}

function trackBand() {
    trackerId = requestAnimationFrame(trackBand);
    var percent = getPercentFromPointer();
    activeBand.setPercent(percent);
    swatch.percent.value = percent;
    updateSwatchPosition();
    updateEverything();
}

function onBandStart(e) {
    eb0 = getPointer(e);
    activeGround = this.id.split("-")[0]; /* this is always a gradient element */
    activeGradientBox = this.getBoundingClientRect();
    if (eb0.target.classList.contains("band")) {
        for (var band of specialCSL[activeGround]) {
            if (band.element == eb0.target) {
                activeBand = band;
                break;
            }
        }
    }
    else {
        var percent = getPercentFromPointer();
        var color = getColorFromPercent(percent);
        activeBand = new Band(activeGround, color, percent);
        updateEverything();
    }
    swatchBox = swatch.window.getBoundingClientRect();
    swatch.window.style.top = scrollY + activeGradientBox.top - swatchBox.height - 12 + "px";
    updatePicker();
    swatch.hex.value = activeBand.color;

    trackBand();
    document.body.className = "banding";
    window.removeEventListener("mousedown", closeSwatch);
    window.removeEventListener("touchstart", closeSwatch);
    window.addEventListener("mousemove", onBandMove);
    window.addEventListener("touchmove", onBandMove, {"passive": false});
    window.addEventListener("mouseup", onBandEnd);
    window.addEventListener("touchend", onBandEnd);
}

function onBandMove(e) {
    eb0 = getPointer(e);
}

function onBandEnd(e) {
    cancelAnimationFrame(trackerId);
    document.body.className = "";
    window.removeEventListener("mousemove", onBandMove);
    window.removeEventListener("touchmove", onBandMove);
    window.removeEventListener("mouseup", onBandEnd);
    window.removeEventListener("touchend", onBandEnd);
    window.addEventListener("mousedown", closeSwatch);
    window.addEventListener("touchstart", closeSwatch, {"passive": false});
}

function onPickerChange() {
    var color = picker.color.alpha < 1 ? picker.color.hex8String : picker.color.hexString;
    activeBand.setColor(color);
    swatch.hex.value = color;
    updateSwatch();
    updateEverything();
}

function onHexChange() {
    swatch.hex.value = swatch.hex.value.replace(/\s+/g, ""); /* like boundInput */
    var color = swatch.hex.value;
    activeBand.setColor(color);
    updatePicker();
    updateEverything();
}

function onPercentInput() {
    boundInput(swatch.percent);
    activeBand.setPercent(swatch.percent.value);
    updateSwatchPosition();
    updateEverything();
}

function onDeleteClick() {
    closeSwatch(true);
    activeBand.delete();
    updateEverything();
}

function generateBandsFromText(text) {
    override[activeGround].gradient.innerHTML = "";
    specialCSL[activeGround] = [];
    
    var colorstopPattern = /#?\w+\s+-?\d+(\.\d+)?/g;
    var matches = text.match(colorstopPattern);
    for (var match of matches) {
        var colorstop = match.split(/\s+/);
        new Band(activeGround, colorstop[0], colorstop[1]);
    }
    sortGround();
}

function onCustomInputChange() {
    activeGround = this.id.split("-")[1];
    generateBandsFromText(this.value);
    override[activeGround].update();
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
                if (clipPoint[0].includes("%")) {
                    x *= imageBox.width / 100;
                }
                if (clipPoint[1].includes("%")) {
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
card.character.addEventListener("input", fitCardCharacter);

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

for (var ground in override) {
    for (var option in override[ground]) {
        if (override[ground][option].type == "radio") {
            override[ground][option].addEventListener("click", selectOverride);
        }
    }
    override[ground].gradient.addEventListener("mousedown", onBandStart);
    override[ground].gradient.addEventListener("touchstart", onBandStart);
    override[ground].input.addEventListener("change", onCustomInputChange);
}

render.button.addEventListener("click", createCard);

picker.on("color:change", onPickerChange);
swatch.hex.addEventListener("change", onHexChange);
swatch.percent.addEventListener("input", onPercentInput);
swatch.delete.addEventListener("click", onDeleteClick);

/* (Re)Initialize Options */

window.addEventListener("load", function () {
    tier.none.checked = true;
    element.none.checked = true;
    energy.none.click();
    updateBounds();
    art.under.click();
    art.move.click();
    override.fg.default.click();
    override.bg.default.click();
});

/* Unload Warning */

function holup(e) {
    e.preventDefault();
    e.returnValue = "Changes you made may not be saved.";
    return e.returnValue;
}

window.addEventListener("beforeunload", holup);

/* Ko-fi Easter Egg */

var kofi = document.getElementById("kofi");
var rainbowId;

function rainbow() {
    var h = (Date.now() / 60) % 360;
    document.body.style = "--bg: hsl(" + h + ", 50%, 70%); --fg: hsl(" + h + ", 50%, 30%);";
    rainbowId = requestAnimationFrame(rainbow);
}

function stopRainbow() {
    document.body.style = "";
    cancelAnimationFrame(rainbowId);
}

kofi.addEventListener("mouseover", rainbow);
kofi.addEventListener("mouseout", stopRainbow);

});
