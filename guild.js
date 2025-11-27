window.addEventListener("DOMContentLoaded", function () {

/* Data */

var pauseUpdates = false;
var logoParts = {
    "bg": [],
    "mg": [],
    "fg": []
};

/* Elements */

var preview = document.getElementById("preview");
var random = document.getElementById("random");
var download = document.getElementById("download");

var buttons = {
    "bg": document.getElementsByName("logo-bg"),
    "mg": document.getElementsByName("logo-mg"),
    "fg": document.getElementsByName("logo-fg")
};

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
            "component": iro.ui.Slider,
            "options": {
                "padding": 0,
            }
        },
        {
            "component": iro.ui.Wheel,
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
    if (pauseUpdates) {
        return;
    }
    var context = preview.getContext("2d");
    context.clearRect(0, 0, preview.width, preview.height);
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
        logoParts[gType][0] = null;
        logoParts[gType][1] = null;
        if (gType == "mg") {
            logoParts[gType][2] = null;
        }
        updateEverything();
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
        updateEverything();
    });
}

/* Color Stuff */

var activeHex;

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
    if (e === true || !swatch.contains(getPointer(e).target)) {
        swatch.style = "";
        window.removeEventListener("mousedown", closeSwatch);
        window.removeEventListener("touchstart", closeSwatch);
    }
}

var presetColors = {
    "bg": [
        "#778a90",
        "#a18042",
        "#774d3a",
        "#9b5151",
        "#73557e",
        "#507666",
        "#5c73a2"
    ],
    "mfg": [
        "#bad3db",
        "#e4c561",
        "#96664f",
        "#d27070",
        "#a15fba",
        "#68a38c",
        "#7b9ee4"
    ],
    "mbg": [
        "#212c3d",
        "#44361b",
        "#2f1c17",
        "#3b0b0b",
        "#2e1c34",
        "#172f25",
        "#1c2535"
    ],
    "fg": [
        "#e3f8ff",
        "#ffe789",
        "#dc8e6b",
        "#ff5b5b",
        "#e18eff",
        "#89e7c3",
        "#7dc7ff"
    ],
};

function openSwatch() {
    activeHex = this;

    var gType = this.id.split("-")[1];

    presets.innerHTML = "";
    for (var color of presetColors[gType]) {
        var preset = document.createElement("div");
        preset.style.background = color;
        preset.dataset.color = color;
        presets.appendChild(preset);
    }

    var swatchBox = swatch.getBoundingClientRect();
    var thisBox = this.getBoundingClientRect();
    swatch.style.left = bound(
        scrollX + thisBox.left,
        0, innerWidth - swatchBox.width
    ) + "px";
    swatch.style.top = scrollY + thisBox.top - swatchBox.height - 12 + "px";
    window.addEventListener("mousedown", closeSwatch);
    window.addEventListener("touchstart", closeSwatch);
}

function updateSwatch() {
    if (activeHex) {
        swatch.classList.remove("invalid");
    }
    else {
        swatch.classList.add("invalid");
    }
}

function updatePicker() {
    picker.setColors([activeHex.value]);
    updateSwatch();
}

function onPickerChange() {
    var color = picker.color.hexString;
    activeHex.value = color;
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

function randomize() {
    var bgi = Math.floor(Math.random() * (buttons.bg.length - 1) + 1);
    var mgi = Math.floor(Math.random() * (buttons.mg.length - 1) + 1);
    var fgi = Math.floor(Math.random() * (buttons.fg.length - 1) + 1);
    pauseUpdates = true;
    buttons.bg[bgi].click();
    buttons.mg[mgi].click();
    pauseUpdates = false;
    buttons.fg[fgi].click();
}

/* Event Listeners */

random.addEventListener("click", randomize);
download.addEventListener("click", downloadLogo);

for (var g in buttons) {
    for (var button of buttons[g]) {
        button.addEventListener("input", select);
    }
}

presets.addEventListener("click", function (e) {
    if (e.target.dataset.color) {
        activeHex.value = e.target.dataset.color;
        updatePicker();
        updateEverything();
    }
});

for (var g in hexes) {
    for (var hex of hexes[g]) {
        hex.addEventListener("focus", openSwatch);
    }
}

picker.on("color:change", onPickerChange);
// swatch.hex.addEventListener("change", onHexChange);
// swatch.percent.addEventListener("input", onPercentInput);
// swatch.delete.addEventListener("click", onDeleteClick);

/* (Re)Initialize Options */

window.addEventListener("load", function () {
    buttons.bg[1].click();
    buttons.mg[3].click();
    buttons.fg[1].click();
    hexes.bg[0].value = presetColors.bg[4];
    hexes.mg[0].value = presetColors.mbg[4];
    hexes.mg[1].value = presetColors.mfg[4];
    hexes.fg[0].value = presetColors.fg[4];
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
