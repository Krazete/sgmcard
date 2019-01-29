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

/* Main */

function init() {
    var src = {
        "back": "fragment/GreyBackground.png",
        "top": "",
        "bottom": "",
        "element": "",
        "level": "",
        "energy": ""
    };

    /* Card Preview */

    var card = {
        "back": document.getElementById("card-back"),
        "art": document.getElementById("card-art"),
        "top": document.getElementById("card-top"),
        "bottom": document.getElementById("card-bottom"),
        "elementLeft": document.getElementById("card-element-left"),
        "elementCenter": document.getElementById("card-element-center"),
        "elementRight": document.getElementById("card-element-right"),
        "level": document.getElementById("card-level"),
        "energy": document.getElementById("card-energy"),
        "elementIcon": document.getElementById("card-element-icon"),
        "elementText": document.getElementById("card-element-text"),
        "levelText": document.getElementById("card-level-text"),
        "variant": document.getElementById("card-variant"),
        "fighter": document.getElementById("card-fighter")
    };

    /* Card Options */

    var tier = {
        "none": document.getElementById("option-no-tier"),
        "bronze": document.getElementById("option-bronze"),
        "silver": document.getElementById("option-silver"),
        "gold": document.getElementById("option-gold"),
        "diamond": document.getElementById("option-diamond")
    }
    var element = {
        "none": document.getElementById("option-no-element"),
        "fire": document.getElementById("option-fire"),
        "water": document.getElementById("option-water"),
        "wind": document.getElementById("option-wind"),
        "light": document.getElementById("option-light"),
        "dark": document.getElementById("option-dark"),
        "neutral": document.getElementById("option-neutral")
    };
    var overlap = {
        "under": document.getElementById("option-under"),
        "over": document.getElementById("option-over")
    };
    var energy = {
        "blank": document.getElementById("option-blank"),
        "yellow": document.getElementById("option-yellow"),
        "blue": document.getElementById("option-blue")
    };
    var advanced = {
        "defaultBackground": document.getElementById("option-default-background"),
        "customBackground": document.getElementById("option-custom-background"),
        "defaultForeground": document.getElementById("option-default-foreground"),
        "customForeground": document.getElementById("option-custom-foreground")
    };

    /* Callback */

    function loadColorizedBackground() {
        if (element.none.checked) {
            return loadImage(src.back);
        }
        else if (element.fire.checked) {
            return loadColorizedImage(src.back, );
        }
        else if (element.water.checked) {
            return loadColorizedImage(src.back, );
        }
        else if (element.wind.checked) {
            return loadColorizedImage(src.back, );
        }
        else if (element.light.checked) {
            return loadColorizedImage(src.back, );
        }
        else if (element.dark.checked) {
            return loadColorizedImage(src.back, );
        }
        else if (element.neutral.checked) {
            return loadColorizedImage(src.back, );
        }
    }

    function selectTier() {
        if (tier.none.checked) {
            preview.className = "";
            src.top = "";
            src.bottom = "";
            src.element = "";
            src.level = "";
        }
        if (tier.bronze.checked) {
            preview.className = "bronze";
            src.top = "fragment/BronzeTop.png";
            src.bottom = "fragment/BronzeBottom.png";
            src.element = "fragment/BronzeElement.png";
            src.level = "fragment/BronzeLevel.png";
        }
        else if (tier.silver.checked) {
            preview.className = "silver";
            src.top = "fragment/SilverTop.png";
            src.bottom = "fragment/SilverBottom.png";
            src.element = "fragment/SilverElement.png";
            src.level = "fragment/SilverLevel.png";
        }
        else if (tier.gold.checked) {
            preview.className = "gold";
            src.top = "fragment/GoldTop.png";
            src.bottom = "fragment/GoldBottom.png";
            src.element = "fragment/GoldElement.png";
            src.level = "fragment/GoldLevel.png";
        }
        else if (tier.diamond.checked) {
            preview.className = "diamond";
            src.top = "fragment/DiamondTop.png";
            src.bottom = "fragment/DiamondBottom.png";
            src.element = "fragment/DiamondElement.png";
            src.level = "fragment/DiamondLevel.png";
        }

        if (advanced.customForeground.checked) {
        }
        else if (tier.diamond.checked && !element.none.checked) {
            var gradient = "gradient/36.png";
            if (element.fire.checked) {
                gradient = "gradient/DiamondGradientMapFire.png";
            }
            else if (element.water.checked) {
                gradient = "gradient/DiamondGradientWater.png";
            }
            else if (element.wind.checked) {
                gradient = "gradient/DiamondGradientMapWind.png";
            }
            else if (element.light.checked) {
                gradient = "gradient/DiamondGradientLight.png";
            }
            else if (element.dark.checked) {
                gradient = "gradient/DiamondGradientDark.png";
            }
            else if (element.neutral.checked) {
                gradient = "gradient/DiamondGradientMapNeutralB.png";
            }
            Promise.all([
                loadColorizedImage(src.top, gradient),
                loadColorizedImage(src.bottom, gradient),
                loadColorizedImage(src.element, gradient),
                loadColorizedImage(src.level, gradient)
            ]).then(function (response) {
                card.top.src = response[0].src;
                card.bottom.src = response[1].src;
                card.elementLeft.src = response[2].src;
                card.elementCenter.src = response[2].src;
                card.elementRight.src = response[2].src;
                card.level.src = response[3].src;
            });
        }
        else {
            card.top.src = src.top;
            card.bottom.src = src.bottom;
            card.elementLeft.src = src.element;
            card.elementCenter.src = src.element;
            card.elementRight.src = src.element;
            card.level.src = src.level;
        }
    }

    function selectElement() {
        var gradient = "gradient/36.png";
        if (element.none.checked) {
            card.elementIcon.src = "";
        }
        else if (element.fire.checked) {
            card.elementIcon.src = "fragment/ElementalIconFire.png";
            gradient = "gradient/DiamondGradientMapFireBackplate.png";
        }
        else if (element.water.checked) {
            card.elementIcon.src = "fragment/ElementalIconWater.png";
            gradient = "gradient/DiamondGradientWaterBackplate.png";
        }
        else if (element.wind.checked) {
            card.elementIcon.src = "fragment/ElementalIconWind.png";
            gradient = "gradient/DiamondGradientMapWindBackplate.png";
        }
        else if (element.light.checked) {
            card.elementIcon.src = "fragment/ElementalIconLight.png";
            gradient = "gradient/DiamondGradientLightBackplate.png";
        }
        else if (element.dark.checked) {
            card.elementIcon.src = "fragment/ElementalIconDark.png";
            gradient = "gradient/DiamondGradientDarkBackplate.png";
        }
        else if (element.neutral.checked) {
            card.elementIcon.src = "fragment/ElementalIconNeutral.png";
            gradient = "gradient/DarkGradient.png";
        }

        if (advanced.customBackground.checked) {
        }
        else if (!element.none.checked) {
            loadColorizedImage(src.back, gradient).then(function (response) {
                card.back.src = response.src;
            });
        }
        else {
            card.back.src = src.back;
        }

        if (tier.diamond.checked && !advanced.customForeground.checked) {
            selectTier();
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

        var texts = preview.getElementsByTagName("input");
        for (var text of texts) {
            var textBox = text.getBoundingClientRect();
            var font = window.getComputedStyle(text).getPropertyValue("font");
            var fontSize = parseInt(window.getComputedStyle(text).getPropertyValue("font-size"));
            context.font = font;
            context.fillStyle = "white";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.shadowOffsetX = 0.07 * fontSize;
            context.shadowOffsetY = 0.07 * fontSize;
            context.shadowColor = "black";
            context.fillText(
                text.value.toUpperCase(),
                (textBox.left + textBox.right) / 2 - previewBox.left,
                (textBox.top + textBox.bottom) / 2 - previewBox.top
            );
        }

        // var a = document.createElement("a");
        // a.href = canvas.toDataURL();
        // a.setAttribute("download", "card.png");
        // a.click();

        document.getElementById("exported").src = canvas.toDataURL();
    }

    function selectEnergy() {
        if (energy.blank.checked) {
            src.energy = "fragment/EnergyBlank.png";
        }
        else if (energy.yellow.checked) {
            src.energy = "fragment/EnergyIcon.png";
        }
        else if (energy.blue.checked) {
            src.energy = "fragment/EnergyIcon-Blue.png";
        }

        card.energy.innerHTML = "";
        for (var i = 0; i < 10; i++) {
            var bolt = new Image();
            bolt.src = src.energy;
            card.energy.appendChild(bolt);
        }
    }

    for (var option in tier) {
        tier[option].addEventListener("click", selectTier);
    }
    for (var option in element) {
        element[option].addEventListener("click", selectElement);
    }
    for (var option in energy) {
        energy[option].addEventListener("click", selectEnergy);
    }
    document.getElementById("option-export").addEventListener("click", buildCardFromPreview);
}

window.addEventListener("DOMContentLoaded", init);
