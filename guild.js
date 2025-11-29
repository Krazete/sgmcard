window.addEventListener("DOMContentLoaded", function () {

/* Elements */

var preview = document.getElementById("preview");
var random = document.getElementById("random");
var download = document.getElementById("download");

var parts = {
    "bg": document.getElementsByName("logo-bg"),
    "mg": document.getElementsByName("logo-mg"),
    "fg": document.getElementsByName("logo-fg")
};

var hexes = {
    "bg": [document.getElementById("logo-bg-hex")],
    "mg": [document.getElementById("logo-mfg-hex"), document.getElementById("logo-mbg-hex")],
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

/* Preview */

var assemblage = { /* layers stored in reverse order */
    "bg": [],
    "mg": [],
    "fg": []
};
var paused = false;

function updatePreview() {
    if (!paused) {
        var context = preview.getContext("2d");
        context.clearRect(0, 0, preview.width, preview.height);
        for (var xg in assemblage) {
            for (var i = assemblage[xg].length - 1; i >= 0; i--) {
                if (assemblage[xg][i]) {
                    context.drawImage(
                        assemblage[xg][i],
                        (preview.width - assemblage[xg][i].width) / 2,
                        (preview.height - assemblage[xg][i].height) / 2
                    );
                }
            }
        }
    }
}

/* Parts */

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

function colorizeImage(image, color) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);
    context.globalCompositeOperation = "source-in";
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
}

function selectPart(e) {
    var idSplit = this.id.split("-");
    var xg = idSplit[1];
    var suffix = idSplit.slice(2).join("-");

    if (suffix == "none") {
        var n = xg == "mg" ? 3 : 2;
        for (var i = 0; i < n; i++) {
            assemblage[xg][i] = null;
        }
        updatePreview();
    }
    else {
        var prefix = {
            "bg": "Background",
            "mg": "Middle",
            "fg": "Foreground"
        };
        var basename = "guild/" + prefix[xg] + "_" + suffix;

        var loadImages = [
            loadImage(basename + ".png"),
            loadImage(basename + "_Colorize.png")
        ];
        if (xg == "mg") {
            loadImages.push(loadImage(basename + "_BG.png"));
        }

        Promise.all(loadImages).then(function (response) {
            assemblage[xg][0] = response[0];
            for (var i = 1; i < response.length; i++) {
                assemblage[xg][i] = colorizeImage(response[i], hexes[xg][i - 1].value);
            }
            updatePreview();
        });
    }
}

/* Hexes */

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

var activeHex;

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

function bound(n, min, max) {
    return Math.max(min, Math.min(n, max));
}

function lol(n) {
    return bound(parseInt(n), 0, 255).toString(16).padStart(2, 0);
}

function getHex(color) {
    var validhexPattern = /^\s*#*([\da-f]{3}[\da-f]?|[\da-f]{6}|[\da-f]{8})\s*$/i;
    if (validhexPattern.test(color)) {
        var digits = color.replace(/[^\da-f]/ig, "");
        if (digits.length < 6) {
            digits = digits.replace(/(.)/g, "$1$1");
        }
        if (digits.length > 6) {
            digits = digits.slice(0, 6);
        }
        return "#" + digits;
    }
    var validrgbPattern = /^\D*(\d+)\s*,\s*(\d+)\s*,\s*(\d+).*$/;
    if (validrgbPattern.test(color)) {
        var m = color.match(validrgbPattern);
        return "#" + lol(m[1]) + lol(m[2]) + lol(m[3]);
    }
    if (/^\s*transparent\s*$/i.test(color)) {
        return "#000000";
    }
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    context.fillStyle = color;
    return context.fillStyle;
}

function closeSwatch(e) {
    if (e === true || !swatch.contains(getPointer(e).target) && !activeHex.contains(getPointer(e).target)) {
        swatch.style = "";
        window.removeEventListener("mousedown", closeSwatch);
        window.removeEventListener("touchstart", closeSwatch);
    }
}

function openSwatch() {
    activeHex = this;

    var xg = this.id.split("-")[1];

    presets.innerHTML = "";
    for (var color of presetColors[xg]) {
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

function selectPreset(e) {
    if (e.target.dataset.color) {
        activeHex.value = e.target.dataset.color;
        updatePicker();
        updatePreview();
    }
}

function updatePicker() {
    picker.setColors([activeHex.value]);
}

function onPickerChange() {
    var color = picker.color.hexString;
    activeHex.value = color;
    updatePreview();
}

function onHexChange() {
    activeHex.value = getHex(activeHex.value); /* like boundInput */
    var color = activeHex.value;
    updatePicker();
    updatePreview();
}

/* Render */

function downloadLogo() {
    var a = document.createElement("a");
    a.download = "sgm-guild-logo.png";
    a.href = preview.toDataURL();
    a.click();
}

function randomize() {
    var bgi = Math.floor(Math.random() * (parts.bg.length - 1) + 1);
    var mgi = Math.floor(Math.random() * (parts.mg.length - 1) + 1);
    var fgi = Math.floor(Math.random() * (parts.fg.length - 1) + 1);
    paused = true;
    parts.bg[bgi].click();
    parts.mg[mgi].click();
    paused = false;
    parts.fg[fgi].click();
}

/* Event Listeners */

random.addEventListener("click", randomize);
download.addEventListener("click", downloadLogo);

for (var xg in parts) {
    for (var part of parts[xg]) {
        part.addEventListener("input", selectPart);
    }
}

for (var xg in hexes) {
    for (var hex of hexes[xg]) {
        hex.addEventListener("focus", openSwatch);
        hex.addEventListener("change", onHexChange);
    }
}

presets.addEventListener("click", selectPreset);

picker.on("color:change", onPickerChange);

/* (Re)Initialize Options */

window.addEventListener("load", function () {
    parts.bg[1].click();
    parts.mg[3].click();
    parts.fg[1].click();
    hexes.bg[0].value = presetColors.bg[4];
    hexes.mg[0].value = presetColors.mbg[4];
    hexes.mg[1].value = presetColors.mfg[4];
    hexes.fg[0].value = presetColors.fg[4];
    updatePreview();
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
