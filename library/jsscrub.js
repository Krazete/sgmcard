function convertToScrubber(input) {
    var i0 = 0;
    var x0 = 0;
    var style = document.createElement("style");

    function nonNaN(n) {
        var m = Number(n);
        if (isNaN(m)) {
            m = 0;
        }
        return m;
    }

    function onMouseUp(e) {
        style.remove();
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("touchmove", onMouseMove);
        window.removeEventListener("touchend", onMouseUp);
    }

    function onMouseMove(e) {
        var ex = 0;
        if (e.touches) {
            e.preventDefault();
            ex = e.touches[0].clientX;
        }
        else {
            ex = e.clientX;
        }
        var x1 = ex;
        var dx = (x1 - x0);
        if (input.step) {
            dx *= nonNaN(input.step);
        }
        var i1 = i0 + dx;
        if ("jsscrub" in input.dataset && input.dataset.jsscrub.includes("continuous")) {
            var min = nonNaN(input.min);
            var max = nonNaN(input.max);
            var dm = max - min;
            i1 = ((i1 - min) % dm + dm) % dm + min;
        }
        if (input.min) {
            i1 = Math.max(i1, input.min);
        }
        if (input.max) {
            i1 = Math.min(i1, input.max);
        }
        input.value = i1;
        input.dispatchEvent(new InputEvent("input"));
    }

    function onMouseDown(e) {
        var ex = 0;
        if (e.touches) {
            e.preventDefault();
            ex = e.touches[0].clientX;
        }
        else {
            ex = e.clientX;
        }
        i0 = nonNaN(input.value);
        x0 = ex;
        document.body.appendChild(style);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("touchmove", onMouseMove);
        window.addEventListener("touchend", onMouseUp);
    }

    input.style.cursor = "ew-resize";
    style.innerHTML = "html {cursor: ew-resize;} body {pointer-events: none;}";

    input.addEventListener("mousedown", onMouseDown);
    input.addEventListener("touchstart", onMouseDown);
}

function initScrubbers() {
    var scrubbers = document.getElementsByClassName("jsscrub");
    for (var i = 0; i < scrubbers.length; i++) {
        if (scrubbers[i].tagName == "INPUT" && scrubbers[i].type == "number") {
            convertToScrubber(scrubbers[i]);
        }
    }
}

window.addEventListener("load", initScrubbers);
