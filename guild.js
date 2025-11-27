window.addEventListener("DOMContentLoaded", function () {

var logoParts = {
    "bg": [],
    "mg": [],
    "fg": []
};

/* Elements */

var preview = document.getElementById("preview");
var download = document.getElementById("download");

var bg = document.getElementsByName("logo-bg");
var mg = document.getElementsByName("logo-mg");
var fg = document.getElementsByName("logo-fg");

var hexes = {
    "bg": [document.getElementById("logo-bg-hex")],
    "mg": [document.getElementById("logo-mbg-hex"), document.getElementById("logo-mfg-hex")],
    "fg": [document.getElementById("logo-fg-hex")]
};

var swatch = document.getElementById("swatch");
var presets = document.getElementById("presets");

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
        }
    ]
});

/* General Functions */

function getPointer(e, preventDefault) { /* preventDefault on touchmove, not on touchstart */
    if (e.touches) {
        if (preventDefault) {
            e.preventDefault();
        }
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

var imageMemo = {};
function loadImage(src) {
    function request(resolve, reject) {
        if (src in imageMemo) {
            resolve(imageMemo[src]);
        }
        else {
            var image = new Image();
            image.addEventListener("load", function () {
                imageMemo[src] = this;
                resolve(this);
            });
            image.addEventListener("error", function () {
                reject(this);
            });
            image.src = src;
        }
    }
    return new Promise(request);
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

/* Image Processing */

function colorizeImage(img, hex) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);
    context.globalCompositeOperation = "source-in";
    context.fillStyle = hex;
    context.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
}

/* Menu Options */

var grounds = {
    "bg": {
        "prefix": "Background",
        "index": 0
    },
    "mg": {
        "prefix": "Middle",
        "index": 2
    },
    "fg": {
        "prefix": "Foreground",
        "index": 5
    }
};

function updateEverything() {
    preview.width += 0;
    var context = preview.getContext("2d");
    for (var g in logoParts) {
        for (var i = 0; i < logoParts[g].length; i++) {
            if (logoParts[g][i]) {
                context.drawImage(
                    logoParts[g][i],
                    (preview.width - logoParts[g][i].width) / 2,
                    (preview.height - logoParts[g][i].height) / 2
                );
            }
        }
    }
}

function select(e) {
    var idSplit = this.id.split("-");
    var gType = idSplit[1];
    var suffix = idSplit.slice(2).join("-");

    if (suffix == "none") {
        logoParts[grounds[gType].index] = null;
        logoParts[grounds[gType].index + 1] = null;
        if (gType == "mg") {
            logoParts[grounds[gType].index + 2] = null;
        }
        if (e.isTrusted) {
            updateEverything();
        }
        return;
    }

    var base = "guild/" + grounds[gType].prefix + "_" + suffix;
    var loadImages = [];
    if (gType == "mg") {
        loadImages.push(loadImage(base + "_BG.png"));
    }
    loadImages.push(loadImage(base + "_Colorize.png"));
    loadImages.push(loadImage(base + ".png"));

    Promise.all(loadImages).then(function (response) {
        for (var i = 0; i < response.length - 1; i++) {
            logoParts[gType][i] = colorizeImage(response[i], hexes[gType][i].value);
        }
        logoParts[gType][i] = response[i];
        if (e.isTrusted) {
            updateEverything();
        }
    });
}

function getHex(color) {
    var validhexPattern = /^#[\da-f]{3}([\da-f]{3})?$/i;
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

function updateSwatchPosition() {
    swatch.window.style.left = bound(
        scrollX + this.left - swatchBox.width / 2 + this.width * activeBand.stop / 100,
        0, innerWidth - swatchBox.width
    ) + "px";
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
    updatePicker();
    updateEverything();
}

function onCustomInputChange() {
    activeGround = this.id.split("-")[1];
    generateBandsFromText(this.value);
    override[activeGround].update();
}

/* Render */

function renderCard(opaque) {
    var images = preview.getElementsByTagName("img");
    for (var image of images) {
        context.save();
        context.drawImage(
            image,
            imageBox.left - previewBox.left,
            imageBox.top - previewBox.top,
            imageBox.width,
            imageBox.height
        );
        context.restore();
    }

    return canvas;
}

function createCardImage(dataURL) {
    var image = new Image();
    image.src = dataURL;
    render.imageContainer.innerHTML = "";
    render.imageContainer.appendChild(image);
}

function downloadLogo() {
    var a = document.createElement("a");
    a.download = "sgm-guild-logo.png";
    a.href = preview.toDataURL();
    a.click();
}

/* Event Listeners */

download.addEventListener("click", downloadLogo);

for (var option of bg) {
    option.addEventListener("click", select);
}
for (var option of mg) {
    option.addEventListener("click", select);
}
for (var option of fg) {
    option.addEventListener("click", select);
}

presets.addEventListener("click", function (e) {
    console.log(e.target);
});

hexes.fg[0].addEventListener("focus", function () {
    for (var i = 0; i < 7; i++) {
        var preset = document.createElement("div");
        preset.innerHTML = i;
        presets.appendChild(preset);
        updateSwatchPosition(this);
    }
});

picker.on("color:change", onPickerChange);
// swatch.hex.addEventListener("change", onHexChange);
// swatch.percent.addEventListener("input", onPercentInput);
// swatch.delete.addEventListener("click", onDeleteClick);

/* (Re)Initialize Options */

window.addEventListener("load", function () {
    hexes.bg[0].value = "#ab34cd";
    hexes.mg[0].value = "#deb421";
    hexes.mg[1].value = "#13dbfe";
    hexes.fg[0].value = "#32f583";
    bg[1].click();
    mg[3].click();
    fg[1].click();
    updateEverything();
});

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
