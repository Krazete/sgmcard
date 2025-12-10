window.addEventListener("DOMContentLoaded", function () {

/* Elements */

var preview = document.getElementById("preview");
var random = {
    "parts": document.getElementById("random-xg"),
    "hexes": document.getElementById("random-hex"),
    "button": document.getElementById("random")
};
var download = document.getElementById("download");

var parts = {
    "bg": document.getElementsByName("logo-bg"),
    "mg": document.getElementsByName("logo-mg"),
    "fg": document.getElementsByName("logo-fg")
};

var hexes = {
    "bg": [
        {
            "input": document.getElementById("logo-bg-0-hex"),
            "colors": ["#778a90", "#a18042", "#774d3a", "#9b5151", "#73557e", "#507666", "#5c73a2"]
        }
    ],
    "mg": [
        {
            "input": document.getElementById("logo-mg-0-hex"),
            "colors": ["#bad3db", "#e4c561", "#96664f", "#d27070", "#a15fba", "#68a38c", "#7b9ee4"]
        },
        {
            "input": document.getElementById("logo-mg-1-hex"),
            "colors": ["#212c3d", "#44361b", "#2f1c17", "#3b0b0b", "#2e1c34", "#172f25", "#1c2535"]
        }
    ],
    "fg": [
        {
            "input": document.getElementById("logo-fg-0-hex"),
            "colors": ["#e3f8ff", "#ffe789", "#dc8e6b", "#ff5b5b", "#e18eff", "#89e7c3", "#7dc7ff"]
        }
    ]
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

function updatePreview() {
    if (imagesLoading) {
        requestAnimationFrame(updatePreview);
        return;
    }

    var context = preview.getContext("2d");
    context.clearRect(0, 0, preview.width, preview.height);
    var xgs = ["bg", "mg", "fg"]; /* ensure order */
    for (var xg of xgs) {
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

/* Parts */

var imageMemo = {};
var imagesLoading = 0;
function loadImage(src) {
    function request(resolve, reject) {
        if (src in imageMemo) {
            resolve(imageMemo[src]);
            return;
        }

        imagesLoading++;
        var image = new Image();
        image.addEventListener("load", function () {
            imageMemo[src] = this;
            imagesLoading--;
            resolve(this);
        });
        image.addEventListener("error", function () {
            imagesLoading--;
            reject(this);
        });
        image.src = src;
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

function selectPart(xg) {
    if (xg == "fg" || xg == "mg" || xg == "bg") {
        for (var part of parts[xg]) {
            if (part.checked) {
                var idSplit = part.id.split("-");
                break;
            }
        }
    }
    else {
        var idSplit = this.id.split("-");
        xg = idSplit[1];
    }
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
                assemblage[xg][i] = colorizeImage(response[i], hexes[xg][i - 1].input.value);
            }
            updatePreview();
        });
    }
}

/* Hexes */

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

function Ox(n) { /* convert number to hexadecimal part */
    return bound(parseInt(n), 0, 255).toString(16).padStart(2, 0);
}

function sanitizeHex(color) {
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
        return "#" + Ox(m[1]) + Ox(m[2]) + Ox(m[3]);
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
    var e = getPointer(e);
    if (!swatch.contains(e.target) && !activeHex.contains(e.target)) {
        swatch.style = "";
        window.removeEventListener("mousedown", closeSwatch);
        window.removeEventListener("touchstart", closeSwatch);
    }
}

function updateHex(color) {
    var idSplit = activeHex.id.split("-");
    var xg = idSplit[1];
    activeHex.value = color;
    selectPart(xg);
}

function updatePresets() {
    for (var preset of presets.children) {
        if (preset.dataset.color.toLowerCase() == activeHex.value.toLowerCase()) {
            preset.classList.add("set");
        }
        else if (preset.classList.contains("set")) {
            preset.classList.remove("set");
        }
    }
}

function updatePicker() {
    picker.setColors([activeHex.value]);
}

function openSwatch() {
    activeHex = this;
    var idSplit = this.id.split("-");
    var xg = idSplit[1];
    var n = parseInt(idSplit[2]);

    presets.innerHTML = "";
    for (var color of hexes[xg][n].colors) {
        var preset = document.createElement("div");
        preset.style.background = color;
        preset.dataset.color = color;
        presets.appendChild(preset);
    }
    updatePresets();
    updatePicker();

    var swatchBox = swatch.getBoundingClientRect();
    var thisBox = this.getBoundingClientRect();
    swatch.style.left = scrollX + bound(thisBox.left, 0, innerWidth - swatchBox.width) + "px";
    swatch.style.top = scrollY + thisBox.top - swatchBox.height - 10 + "px";
    window.addEventListener("mousedown", closeSwatch);
    window.addEventListener("touchstart", closeSwatch);
}

function onHexChange() {
    updateHex(sanitizeHex(activeHex.value));
    updatePresets();
    updatePicker();
}

function selectPreset(e) {
    if (e.target.dataset.color) {
        updateHex(e.target.dataset.color);
        updatePresets();
        updatePicker();
    }
}

function onPickerChange() {
    updateHex(picker.color.hexString);
    updatePresets();
}

/* Preview Adjacent */

function randInt(n, m) {
    return Math.floor(Math.random() * (m - n) + n);
}

function updateRandom() {
    if (random.parts.checked || random.hexes.checked) {
        random.button.classList.remove("disabled");
    }
    else {
        random.button.classList.add("disabled");
    }
}

function randomizeLogo() {
    if (random.parts.checked) {
        for (var xg in parts) {
            var r = randInt(1, parts[xg].length);
            parts[xg][r].checked = true;
        }
    }
    if (random.hexes.checked) {
        for (var xg in hexes) {
            for (var hex of hexes[xg]) {
                var r = randInt(0, hex.colors.length);
                hex.input.value = hex.colors[r];
            }
        }
    }
    for (var xg in parts) {
        selectPart(xg);
    }
}

function downloadLogo() {
    var a = document.createElement("a");
    a.download = "sgm-guild-logo.png";
    a.href = preview.toDataURL();
    a.click();
}

/* Event Listeners */

random.parts.addEventListener("change", updateRandom);
random.hexes.addEventListener("change", updateRandom);
random.button.addEventListener("click", randomizeLogo);
download.addEventListener("click", downloadLogo);

for (var xg in parts) {
    for (var part of parts[xg]) {
        part.addEventListener("input", selectPart);
    }
}

for (var xg in hexes) {
    for (var hex of hexes[xg]) {
        hex.input.addEventListener("focus", openSwatch);
        hex.input.addEventListener("change", onHexChange);
    }
}

presets.addEventListener("click", selectPreset);
picker.on("color:change", onPickerChange);

/* (Re)Initialize Options */

window.addEventListener("load", function () {
    random.parts.checked = true;
    random.hexes.checked = true;
    // updateRandom();
    parts.bg[1].checked = true;
    parts.mg[3].checked = true;
    parts.fg[1].checked = true;
    for (var xg in hexes) {
        for (var hex of hexes[xg]) {
            hex.input.value = hex.colors[4];
        }
    }
    for (var xg in parts) {
        selectPart(xg);
    }
});

});
