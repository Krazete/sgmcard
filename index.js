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
        imageData.data[4 * i + 3] = a;
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
            fillStyle.addColorStop(i / 16, i % 2 ? "black" : "white");
        }
    }
    context.fillStyle = fillStyle;
    context.fillRect(0, 0, 256, 1);
    return context.getImageData(0, 0, canvas.width, canvas.height);
}

function loadColorizedImageURL(imageURL, gradientDataOrURL) {
    if (typeof gradientDataOrURL == "string") { /* if both arguments are URLs */
        return Promise.all([
            loadImage(imageURL),
            loadImage(gradientDataOrURL)
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
            var colorizedData = colorizeImageDataWithGradientData(imageData, gradientDataOrURL);
            return getImageURLFromImageData(colorizedData);
        });
    }
}

/* Main */

function init() {
    /* Preview Elements */

    var card = {
        "back": document.getElementById("card-back"),
        "maskLeft": document.getElementById("mask-left"),
        "maskRight": document.getElementById("mask-right"),
        "maskTop": document.getElementById("mask-top"),
        "maskBottom": document.getElementById("mask-bottom"),
        "artMasks": document.getElementsByClassName("card-art-mask"),
        "artUnder": document.getElementById("art-under"),
        "top": document.getElementById("card-top"),
        "artOver": document.getElementById("art-over"),
        "bottom": document.getElementById("card-bottom"),
        "elementIcon": document.getElementById("card-element-icon"),
        "elementLeft": document.getElementById("card-element-left"),
        "elementCenter": document.getElementById("card-element-center"),
        "elementRight": document.getElementById("card-element-right"),
        "level": document.getElementById("card-level"),
        "energy": document.getElementById("card-energy"),
        "artPositionTool": document.getElementById("card-art-position-tool"),
        "circle": document.getElementById("circle"),
        "elementText": document.getElementById("card-element-text"),
        "levelText": document.getElementById("card-level-text"),
        "variant": document.getElementById("card-variant"),
        "fighter": document.getElementById("card-fighter")
    };

    /* Menu Option Elements */

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
        "width": document.getElementById("option-width"),
        "rotate": document.getElementById("option-rotate"),
        "angle": document.getElementById("option-angle"),
        "under": document.getElementById("option-under"),
        "over": document.getElementById("option-over")
    };
    var foreground = {
        "default": document.getElementById("option-fg-default"),
        "override": document.getElementById("option-fg-override"),
        "submenu": document.getElementById("fg-submenu"),
        "input": document.getElementById("option-fg"),
        "map": {
            "custom": document.getElementById("option-fg-custom"),
            "bronze": document.getElementById("option-fg-bronze"),
            "silver": document.getElementById("option-fg-silver"),
            "gold": document.getElementById("option-fg-gold"),
            "fire": document.getElementById("option-fg-fire"),
            "water": document.getElementById("option-fg-water"),
            "wind": document.getElementById("option-fg-wind"),
            "light": document.getElementById("option-fg-light"),
            "dark": document.getElementById("option-fg-dark"),
            "neutral": document.getElementById("option-fg-neutral")
        }
    };
    var background = {
        "default": document.getElementById("option-bg-default"),
        "override": document.getElementById("option-bg-override"),
        "submenu": document.getElementById("bg-submenu"),
        "input": document.getElementById("option-bg"),
        "map": {
            "custom": document.getElementById("option-bg-custom"),
            "fire": document.getElementById("option-bg-fire"),
            "water": document.getElementById("option-bg-water"),
            "wind": document.getElementById("option-bg-wind"),
            "light": document.getElementById("option-bg-light"),
            "dark": document.getElementById("option-bg-dark"),
            "neutral": document.getElementById("option-bg-neutral")
        }
    };
    var render = {
        "button": document.getElementById("option-render"),
        "link": document.getElementById("render-link"),
        "image": document.getElementById("render-image")
    };

    /* Preview Inputs */

    function getWidth(input) {
        var inputStyle = getComputedStyle(input);
        var copy = document.createElement("div");
        copy.innerHTML = input.value.toUpperCase();
        copy.style.font = inputStyle.font;
        copy.style.textTransform = inputStyle.textTransform;
        copy.style.whiteSpace = "pre";
        copy.style.display = "inline-block";
        document.body.appendChild(copy);
        var width = getComputedStyle(copy).width;
        copy.remove();
        return width;
    }

    function autoResize(input, maxSize, maxWidth) {
        for (var i = maxSize; i > 0; i--) {
            input.style.fontSize = i + "px";
            var width = parseFloat(getWidth(input));
            if (width < maxWidth) {
                break;
            }
        }
    }

    function newAutoResizer(maxSize, maxWidth) {
        return function () {
            autoResize(this, maxSize, maxWidth);
        };
    }

    function resizeCardElement() {
        autoResize(card.elementText, 31, 150);
        var width = parseInt(getWidth(card.elementText)) || 65;
        var pad = 5;
        card.elementCenter.style.transform = "scaleX(" + (width + pad) + ")";
        var offset = 29;
        if (preview.className == "gold") {
            offset = 22;
        }
        else if (preview.className == "diamond") {
            offset = 28;
        }
        card.elementRight.style.left = offset + width + "px";
    }

    function resizeCardLevel() {
        autoResize(card.levelText, 31, 40);
        if (
            tier.bronze.checked && card.levelText.value >= 30 ||
            tier.silver.checked && card.levelText.value >= 40 ||
            tier.gold.checked && card.levelText.value >= 50 ||
            tier.diamond.checked && card.levelText.value >= 60
        ) {
            card.levelText.style.color = "skyblue";
        }
        else {
            card.levelText.style.color = "";
        }
    }

    /* Art Position Tools */

    var e0, art0, circle = document.getElementById("circle");

    function getPointer(e) {
        if (e.x || e.y) {
            return e;
        }
        else {
            e.preventDefault();
            return {
                "x": e.touches[0].clientX,
                "y": e.touches[0].clientY
            };
        }
    }

    function setArt0() {
        var savedRotation = card.artUnder.style.transform;
        card.artUnder.style.transform = "";
        var artBox = card.artUnder.getBoundingClientRect();
        art0 = {
            "x": (artBox.left + artBox.right) / 2,
            "y": (artBox.top + artBox.bottom) / 2,
            "width": artBox.width,
            "angle": -art.angle.value || 0
        };
        card.artUnder.style.transform = savedRotation;
    }

    function distanceFromArt0(x, y) {
        return Math.sqrt(Math.pow(x - art0.x, 2) + Math.pow(y - art0.y, 2));
    }

    function angleFromArt0(x, y) {
        return 180 * Math.atan((y - art0.y) / (x - art0.x)) / Math.PI + 90 * (Math.sign(x - art0.x) - 1);
    }

    function setCircle(x, y, r, t) {
        var artPositionToolBox = card.artPositionTool.getBoundingClientRect();
        circle.style.left = x - artPositionToolBox.left + "px";
        circle.style.top = y - artPositionToolBox.top + "px";
        if (r) {
            circle.style.width = 2 * r + "px";
            circle.style.height = 2 * r + "px";
        }
        if (t) {
            circle.style.borderWidth = "0 5px 0 1px";
            circle.style.transform = "translate(-50%, -50%) rotate(" + t + "deg)";
        }
        document.body.className = "editing-art";
    }

    function removeCircle() {
        circle.style = "";
        document.body.className = "";
    }

    /* Art Move Tool */

    function setX() {
        card.artUnder.style.left = art.x.value + "px";
        card.artOver.style.left = art.x.value + "px";
    }

    function setY() {
        card.artUnder.style.top = art.y.value + "px";
        card.artOver.style.top = art.y.value + "px";
    }

    function startMoveArt(e) {
        e = getPointer(e);
        e0 = e;
        setArt0();
        var r = distanceFromArt0(e.x, e.y);
        setCircle(art0.x, art0.y, r / 2);
        card.artPositionTool.addEventListener("mousemove", moveArt);
        card.artPositionTool.addEventListener("touchmove", moveArt);
        card.artPositionTool.addEventListener("mouseup", stopMoveArt);
        card.artPositionTool.addEventListener("mouseout", stopMoveArt);
        card.artPositionTool.addEventListener("touchend", stopMoveArt);
    }

    function moveArt(e) {
        e = getPointer(e);
        var previewBox = preview.getBoundingClientRect();
        var x0 = Math.floor(art0.x - previewBox.left);
        var y0 = Math.floor(art0.y - previewBox.top);
        var dx = e.x - e0.x;
        var dy = e.y - e0.y;
        art.x.value = x0 + dx + 1;
        art.y.value = y0 + dy + 1;
        setX();
        setY();
        setCircle(art0.x + dx, art0.y + dy);
    }

    function stopMoveArt(e) {
        removeCircle();
        card.artPositionTool.removeEventListener("mousemove", moveArt);
        card.artPositionTool.removeEventListener("touchmove", moveArt);
        card.artPositionTool.removeEventListener("mouseup", stopMoveArt);
        card.artPositionTool.removeEventListener("mouseout", stopMoveArt);
        card.artPositionTool.removeEventListener("touchend", stopMoveArt);
    }

    /* Art Scale Tool */

    function setWidth() {
        card.artUnder.style.width = art.width.value + "px";
        card.artOver.style.width = art.width.value + "px";
    }

    function startScaleArt(e) {
        e = getPointer(e);
        e0 = e;
        setArt0();
        var r = distanceFromArt0(e.x, e.y);
        setCircle(art0.x, art0.y, r);
        card.artPositionTool.addEventListener("mousemove", scaleArt);
        card.artPositionTool.addEventListener("touchmove", scaleArt);
        card.artPositionTool.addEventListener("mouseup", stopScaleArt);
        card.artPositionTool.addEventListener("mouseout", stopScaleArt);
        card.artPositionTool.addEventListener("touchend", stopScaleArt);
    }

    function scaleArt(e) {
        e = getPointer(e);
        var r0 = distanceFromArt0(e0.x, e0.y);
        var r = distanceFromArt0(e.x, e.y);
        art.width.value = art0.width * r / r0 || 1;
        setWidth();
        setCircle(art0.x, art0.y, r);
    }

    function stopScaleArt(e) {
        removeCircle();
        card.artPositionTool.removeEventListener("mousemove", scaleArt);
        card.artPositionTool.removeEventListener("touchmove", scaleArt);
        card.artPositionTool.removeEventListener("mouseup", stopScaleArt);
        card.artPositionTool.removeEventListener("mouseout", stopScaleArt);
        card.artPositionTool.removeEventListener("touchend", stopScaleArt);
    }

    /* Art Rotate Tool */

    function setAngle() {
        card.artUnder.style.transform = "translate(-50%, -50%) rotateZ(" + -art.angle.value + "deg)";
        card.artOver.style.transform = "translate(-50%, -50%) rotateZ(" + -art.angle.value + "deg)";
    }

    function startRotateArt(e) {
        e = getPointer(e);
        e0 = e;
        setArt0();
        var t = angleFromArt0(e.x, e.y);
        var r = distanceFromArt0(e.x, e.y);
        setCircle(art0.x, art0.y, r, t);
        card.artPositionTool.addEventListener("mousemove", rotateArt);
        card.artPositionTool.addEventListener("touchmove", rotateArt);
        card.artPositionTool.addEventListener("mouseup", stopRotateArt);
        card.artPositionTool.addEventListener("mouseout", stopRotateArt);
        card.artPositionTool.addEventListener("touchend", stopRotateArt);
    }

    function rotateArt(e) {
        e = getPointer(e);
        var t0 = angleFromArt0(e0.x, e0.y);
        var t = angleFromArt0(e.x, e.y);
        art.angle.value = (720 - (art0.angle + t - t0)) % 360;
        setAngle();
        var r = distanceFromArt0(e.x, e.y);
        setCircle(art0.x, art0.y, r, t);
    }

    function stopRotateArt(e) {
        removeCircle();
        card.artPositionTool.removeEventListener("mousemove", rotateArt);
        card.artPositionTool.removeEventListener("touchmove", rotateArt);
        card.artPositionTool.removeEventListener("mouseup", stopRotateArt);
        card.artPositionTool.removeEventListener("mouseout", stopRotateArt);
        card.artPositionTool.removeEventListener("touchend", stopRotateArt);
    }

    /* Art Mask Tool */

    var artMaskPath = [0, 0, 395, 504];

    function setArtMaskPath() {
        artMaskPath = [0, 0, 395, 504];
        if (card.maskLeft.className == "active") {
            artMaskPath[0] = 50;
        }
        if (card.maskRight.className == "active") {
            artMaskPath[2] = 345;
        }
        if (card.maskTop.className == "active") {
            artMaskPath[1] = 50;
        }
        if (card.maskBottom.className == "active") {
            artMaskPath[3] = 345;
        }
    }

    function toggleMaskSegment() {
        if (this.className == "active") {
            this.className = "";
        }
        else {
            this.className = "active";
        }
        setArtMaskPath();
        for (var artMask of card.artMasks) {
            var polygon = "polygon(" +
                artMaskPath[0] + "px " + artMaskPath[1] + "px," +
                artMaskPath[2] + "px " + artMaskPath[1] + "px," +
                artMaskPath[2] + "px " + artMaskPath[3] + "px," +
                artMaskPath[0] + "px " + artMaskPath[3] + "px" +
            ")";
            artMask.style.clipPath = polygon;
            artMask.style.webkitClipPath = polygon;
        }
    }

    /* Menu Options */

    var gradientMapURL = {
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
        "bg": { /* contains imageData, not dataURL as the name "gradientMapURL" implies */
            "fire": getGradientDataFromText("#301 0%, #c40818 20%, #f54 50%, #fb7 100%"),
            "water": getGradientDataFromText("#013 0%, #06b 20%, #3be 50%, #40f4ff 80%, #40f4ff 100%"),
            "wind": getGradientDataFromText("#010 0%, #208038 20%, #48c048 50%, #bf7 100%"),
            "light": getGradientDataFromText("#950 0%, #db5 20%, #fea 50%, #fff 100%"),
            "dark": getGradientDataFromText("#113 0%, #536 20%, #a464a4 50%, #ead 100%"),
            "neutral": getGradientDataFromText("#333 0%, #6b6b6b 20%, #aaa 50%, #eee 100%")
        }
    };

    function selectTier() {
        var cardTopURL = "";
        var cardBottomURL = "";
        var cardElementURL = "";
        var cardLevelURL = "";
        if (tier.none.checked) {
            preview.className = "";
        }
        if (tier.bronze.checked) {
            preview.className = "bronze";
            cardTopURL = "fragment/BronzeTop.png";
            cardBottomURL = "fragment/BronzeBottom.png";
            cardElementURL = "fragment/BronzeElement.png";
            cardLevelURL = "fragment/BronzeLevel.png";
        }
        else if (tier.silver.checked) {
            preview.className = "silver";
            cardTopURL = "fragment/SilverTop.png";
            cardBottomURL = "fragment/SilverBottom.png";
            cardElementURL = "fragment/SilverElement.png";
            cardLevelURL = "fragment/SilverLevel.png";
        }
        else if (tier.gold.checked) {
            preview.className = "gold";
            cardTopURL = "fragment/GoldTop.png";
            cardBottomURL = "fragment/GoldBottom.png";
            cardElementURL = "fragment/GoldElement.png";
            cardLevelURL = "fragment/GoldLevel.png";
        }
        else if (tier.diamond.checked) {
            preview.className = "diamond";
            cardTopURL = "fragment/DiamondTop.png";
            cardBottomURL = "fragment/DiamondBottom.png";
            cardElementURL = "fragment/DiamondElement.png";
            cardLevelURL = "fragment/DiamondLevel.png";
        }

        if (tier.diamond.checked && !element.none.checked || foreground.override.checked && !tier.none.checked) {
            var gradientDataOrURL = gradientMapURL.error;
            if (element.fire.checked) {
                gradientDataOrURL = gradientMapURL.fg.fire;
            }
            else if (element.water.checked) {
                gradientDataOrURL = gradientMapURL.fg.water;
            }
            else if (element.wind.checked) {
                gradientDataOrURL = gradientMapURL.fg.wind;
            }
            else if (element.light.checked) {
                gradientDataOrURL = gradientMapURL.fg.light;
            }
            else if (element.dark.checked) {
                gradientDataOrURL = gradientMapURL.fg.dark;
            }
            else if (element.neutral.checked) {
                gradientDataOrURL = gradientMapURL.fg.neutral;
            }
            if (foreground.override.checked) {
                if (foreground.map.custom.checked) {
                    gradientDataOrURL = getGradientDataFromText(foreground.input.value);
                }
                else if (foreground.map.bronze.checked) {
                    gradientDataOrURL = gradientMapURL.bronze;
                }
                else if (foreground.map.silver.checked) {
                    gradientDataOrURL = gradientMapURL.silver;
                }
                else if (foreground.map.gold.checked) {
                    gradientDataOrURL = gradientMapURL.gold;
                }
                else if (foreground.map.fire.checked) {
                    gradientDataOrURL = gradientMapURL.fg.fire;
                }
                else if (foreground.map.water.checked) {
                    gradientDataOrURL = gradientMapURL.fg.water;
                }
                else if (foreground.map.wind.checked) {
                    gradientDataOrURL = gradientMapURL.fg.wind;
                }
                else if (foreground.map.light.checked) {
                    gradientDataOrURL = gradientMapURL.fg.light;
                }
                else if (foreground.map.dark.checked) {
                    gradientDataOrURL = gradientMapURL.fg.dark;
                }
                else if (foreground.map.neutral.checked) {
                    gradientDataOrURL = gradientMapURL.fg.neutral;
                }
            }
            Promise.all([
                loadColorizedImageURL(cardTopURL, gradientDataOrURL),
                loadColorizedImageURL(cardBottomURL, gradientDataOrURL),
                loadColorizedImageURL(cardElementURL, gradientDataOrURL),
                loadColorizedImageURL(cardLevelURL, gradientDataOrURL)
            ]).then(function (response) {
                card.top.src = response[0];
                card.bottom.src = response[1];
                card.elementLeft.src = response[2];
                card.elementCenter.src = response[2];
                card.elementRight.src = response[2];
                card.level.src = response[3];
            });
        }
        else {
            card.top.src = cardTopURL;
            card.bottom.src = cardBottomURL;
            card.elementLeft.src = cardElementURL;
            card.elementCenter.src = cardElementURL;
            card.elementRight.src = cardElementURL;
            card.level.src = cardLevelURL;
        }

        resizeCardElement();
        resizeCardLevel();
    }

    function selectElement() {
        var cardBackURL = "fragment/GreyBackground.png";
        var gradientDataOrURL = gradientMapURL.error;
        if (element.none.checked) {
            card.elementIcon.src = "";
        }
        else if (element.fire.checked) {
            card.elementIcon.src = "fragment/ElementalIconFire.png";
            gradientDataOrURL = gradientMapURL.bg.fire;
        }
        else if (element.water.checked) {
            card.elementIcon.src = "fragment/ElementalIconWater.png";
            gradientDataOrURL = gradientMapURL.bg.water;
        }
        else if (element.wind.checked) {
            card.elementIcon.src = "fragment/ElementalIconWind.png";
            gradientDataOrURL = gradientMapURL.bg.wind;
        }
        else if (element.light.checked) {
            card.elementIcon.src = "fragment/ElementalIconLight.png";
            gradientDataOrURL = gradientMapURL.bg.light;
        }
        else if (element.dark.checked) {
            card.elementIcon.src = "fragment/ElementalIconDark.png";
            gradientDataOrURL = gradientMapURL.bg.dark;
        }
        else if (element.neutral.checked) {
            card.elementIcon.src = "fragment/ElementalIconNeutral.png";
            gradientDataOrURL = gradientMapURL.bg.neutral;
        }
        if (background.override.checked) {
            if (background.map.custom.checked) {
                gradientDataOrURL = getGradientDataFromText(background.input.value);
            }
            else if (background.map.fire.checked) {
                gradientDataOrURL = gradientMapURL.bg.fire;
            }
            else if (background.map.water.checked) {
                gradientDataOrURL = gradientMapURL.bg.water;
            }
            else if (background.map.wind.checked) {
                gradientDataOrURL = gradientMapURL.bg.wind;
            }
            else if (background.map.light.checked) {
                gradientDataOrURL = gradientMapURL.bg.light;
            }
            else if (background.map.dark.checked) {
                gradientDataOrURL = gradientMapURL.bg.dark;
            }
            else if (background.map.neutral.checked) {
                gradientDataOrURL = gradientMapURL.bg.neutral;
            }
        }

        if (!element.none.checked || background.override.checked) {
            loadColorizedImageURL(cardBackURL, gradientDataOrURL).then(function (response) {
                card.back.src = response;
            });
        }
        else {
            card.back.src = cardBackURL;
        }

        if (tier.diamond.checked && !foreground.override.checked) {
            selectTier();
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

    var artURL = "";

    function selectArt() {
        var file = this.files[0];
        if (/image\//.test(file.type)) {
            var reader = new FileReader();
            reader.addEventListener("load", function () {
                /* stops animation and fixes orientation rendering issue */
                loadImage(this.result).then(function (image) {
                    var imageData = getImageDataFromImage(image);
                    artURL = getImageURLFromImageData(imageData);
                    selectOverlap();
                });
            });
            reader.readAsDataURL(this.files[0]);
        }
    }

    function selectOverlap() {
        if (art.under.checked) {
            card.artUnder.src = artURL;
            card.artOver.src = "";
        }
        else if (art.over.checked) {
            card.artUnder.src = "";
            card.artOver.src = artURL;
        }
    }

    function selectArtMoveTool() {
        card.artPositionTool.addEventListener("mousedown", startMoveArt);
        card.artPositionTool.addEventListener("touchstart", startMoveArt);
        card.artPositionTool.removeEventListener("mousedown", startScaleArt);
        card.artPositionTool.removeEventListener("touchstart", startScaleArt);
        card.artPositionTool.removeEventListener("mousedown", startRotateArt);
        card.artPositionTool.removeEventListener("touchstart", startRotateArt);
    }

    function selectArtScaleTool() {
        card.artPositionTool.removeEventListener("mousedown", startMoveArt);
        card.artPositionTool.removeEventListener("touchstart", startMoveArt);
        card.artPositionTool.addEventListener("mousedown", startScaleArt);
        card.artPositionTool.addEventListener("touchstart", startScaleArt);
        card.artPositionTool.removeEventListener("mousedown", startRotateArt);
        card.artPositionTool.removeEventListener("touchstart", startRotateArt);
    }

    function selectArtRotateTool() {
        card.artPositionTool.removeEventListener("mousedown", startMoveArt);
        card.artPositionTool.removeEventListener("touchstart", startMoveArt);
        card.artPositionTool.removeEventListener("mousedown", startScaleArt);
        card.artPositionTool.removeEventListener("touchstart", startScaleArt);
        card.artPositionTool.addEventListener("mousedown", startRotateArt);
        card.artPositionTool.addEventListener("touchstart", startRotateArt);
    }

    function selectForeground() {
        if (foreground.default.checked) {
            foreground.submenu.classList.add("disabled");
        }
        else {
            foreground.submenu.classList.remove("disabled");
        }
        selectTier();
    }

    function selectBackground() {
        if (background.default.checked) {
            background.submenu.classList.add("disabled");
        }
        else {
            background.submenu.classList.remove("disabled");
        }
        selectElement();
    }

    function selectForegroundMap() {
        if (foreground.map.custom.checked) {
            foreground.input.classList.remove("disabled");
        }
        else {
            foreground.input.classList.add("disabled");
        }
        selectTier();
    }

    function selectBackgroundMap() {
        if (background.map.custom.checked) {
            background.input.classList.remove("disabled");
        }
        else {
            background.input.classList.add("disabled");
        }
        selectElement();
    }

    /* Card Renderer */

    function renderCard() {
        var singlePattern = /-?\d+(\.\d+)?(px|%)?/g;
        var pairPattern = /-?\d+(\.\d+)?(px|%)\s+-?\d+(\.\d+)?(px|%)/g;

        var preview = document.getElementById("preview");
        var previewBox = preview.getBoundingClientRect();

        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        canvas.width = Math.round(previewBox.width);
        canvas.height = Math.round(previewBox.height);

        var images = preview.getElementsByTagName("img");
        for (var image of images) {
            context.save();

            if (image == card.artUnder || image == card.artOver) {
                context.moveTo(artMaskPath[0], artMaskPath[1]);
                context.lineTo(artMaskPath[2], artMaskPath[1]);
                context.lineTo(artMaskPath[2], artMaskPath[3]);
                context.lineTo(artMaskPath[0], artMaskPath[3]);
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
            if (clipPath != "none") {
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
            var textStyle = window.getComputedStyle(text);
            context.font = textStyle.font;
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
        context.fillStyle = "rgba(0, 0, 0, 0.05)";
        context.textAlign = "left";
        context.textBaseline = "bottom";
        context.rotate(Math.PI * -90 / 180);
        context.fillText("SGMCARD.NETLIFY.COM", -504, 395);
        context.restore();

        render.link.href = canvas.toDataURL();
        render.image.src = canvas.toDataURL();
    }

    /* Event Listeners */

    card.elementText.addEventListener("input", resizeCardElement);
    card.levelText.addEventListener("input", resizeCardLevel);
    card.variant.addEventListener("input", newAutoResizer(58, 320));
    card.fighter.addEventListener("input", newAutoResizer(38, 250));

    card.maskLeft.addEventListener("click", toggleMaskSegment);
    card.maskRight.addEventListener("click", toggleMaskSegment);
    card.maskTop.addEventListener("click", toggleMaskSegment);
    card.maskBottom.addEventListener("click", toggleMaskSegment);

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
    art.over.addEventListener("click", selectOverlap);
    art.under.addEventListener("click", selectOverlap);
    art.move.addEventListener("click", selectArtMoveTool);
    art.x.addEventListener("input", setX);
    art.y.addEventListener("input", setY);
    art.scale.addEventListener("click", selectArtScaleTool);
    art.width.addEventListener("input", setWidth);
    art.rotate.addEventListener("click", selectArtRotateTool);
    art.angle.addEventListener("input", setAngle);

    foreground.default.addEventListener("click", selectForeground);
    foreground.override.addEventListener("click", selectForeground);
    foreground.input.addEventListener("change", selectTier);
    for (var option in foreground.map) {
        foreground.map[option].addEventListener("click", selectForegroundMap);
    }
    background.default.addEventListener("click", selectBackground);
    background.override.addEventListener("click", selectBackground);
    background.input.addEventListener("change", selectElement);
    for (var option in background.map) {
        background.map[option].addEventListener("click", selectBackgroundMap);
    }

    render.button.addEventListener("click", renderCard);

    /* Initialize */

    tier.none.click();
    element.none.click();
    energy.none.click();
    art.under.click();
    art.move.click();
    foreground.default.click();
    foreground.map.custom.click();
    background.default.click();
    background.map.custom.click();
}

window.addEventListener("DOMContentLoaded", init);
