var common = {
    lerp: function(norm, min, max) {
        return (max - min) * norm + min;
    },
    logp: function(norm, min, max) {
        return Math.exp(Math.log(max) - Math.log(min) * Math.exp(norm) + Math.log(min))
    },
    normalize: function(value, min, max) {
        return (value - min) / (max - min);
    },
    power: function(x,n) {
        //if (n == Math.round(n)) return Math.pow(x,n);
        if(n === 0) return 1;
        if(n === -1) return 1/x;
        if(n === 1) return x;
        if (x < 0) {return -(Math.exp(n*Math.log(Math.abs(x))))};
        return Math.exp(n*Math.log(x))
    },
    clamp: function(value, low, high) {
        low = low || -Infinity;high = high || Infinity;
        return Math.min(Math.max(low, value), high);
    },
    distance: function(pos1, pos2) {
        return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
    },
    c: function(x,y) {
        return {x:x,y:y}
    },
    sumOfList: function(numbers, startNumber) {
        var tot = startNumber || 0;
        for (num in numbers) {
            tot += numbers[num];
        }
        return tot;
    },
    midpointOfPois: function(pois) {
        var x = 0,
            y = 0;
    
        for (var poi in pois) {
            x += pois[poi].cameraPOI_position().x;
            y += pois[poi].cameraPOI_position().y;
        }
    
        return {x:x/pois.length,y:y/pois.length}
    },
    midpointOfCoords: function(coords) {
        var x = 0,
            y = 0;

        for (var c in coords) {
            x += coords[c].x;
            y += coords[c].y;
        }

        return {x: x/coords.length, y: y/coords.length}
    },
    coordInBounds: function(coords, b) {
        return (coords.x < b.max.x && coords.x > b.min.x && coords.y < b.max.y && coords.y > b.min.y)
    },
    minMax: function(values) {
        var min = values[0],
            max = values[0];
    
        for (var v in values) {
            min = Math.min(min, values[v]);
            max = Math.max(max, values[v]);
        }

        return {min: min, max: max};
    },
    fetch: function(method, url, callback) {
        console.warn("used unfinisehd fetch function")
        let req = new XMLHttpRequest();
    }
}

common.getRelativeMousePosition = function(bounds, mousePosition) {
    mousePosition = mousePosition || mouse.absolute
    return {
        x: this.lerp(this.normalize(mousePosition.x, 0, window.innerWidth), bounds.min.x, bounds.max.x),
        y: this.lerp(this.normalize(mousePosition.y, 0, window.innerHeight), bounds.min.y, bounds.max.y)
    }
    //console.log(ret);
    //return ret
}

common.relativeCoords = function(coords, min, max, width, height) {
    return {x: common.normalize(coords.x, min.x, max.x) * width, y: common.normalize(coords.y, min.y, max.y) * height}
}

common.allXandY = function(coords) {
    var xValues, yValues = [];

    for (var c in coords) {
        xValues.push(coords[c].x);
        yValues.push(coords[c].y);
    }

    return {x: xValues, y: yValues}
}

common.calculateLikeyCameraBoundsFromCoords = function(coords, padding, bounds) {
    xy = this.allXandY(coords)

    var minMaxX = common.minMax(xy.x);
    var minMaxY = common.minMax(xy.y);

    //var center = common.midpointOfCoords(coords);

    return {
        min: {
            x: common.clamp(minMaxX.min - padding, bounds.min.x, bounds.max.x),
            y: common.clamp(minMaxY.min - padding, bounds.min.y, bounds.max.y) 
        },
        max: { 
            x: common.clamp(minMaxX.max + padding, bounds.min.x, bounds.max.x),
            y: common.clamp(minMaxY.max + padding, bounds.min.y, bounds.max.y) 
        } 
    };
};

common.setToolTip = function(text) {
    document.getElementById('tooltip').classList.add('visible');
    document.getElementById('tooltip-header').innerHTML = text;
}

common.hideToolTip = function() {
    document.getElementById('tooltip').classList.remove('visible')
}

/*common.drawRegPoly = function(c, x, y, sides, radius, rotate, color) {
    c.beginPath();
    c.moveTo (x + radius * Math.cos(0), y + radius * Math.sin(0));          
    //c.rotate(rotate)
    for (var i = 1; i <= sides;i += 1) {
        c.lineTo(x + radius * Math.cos(i * 2 * Math.PI / sides), y + radius * Math.sin(i * 2 * Math.PI / sides));
    }
    
    c.strokeStyle = color;
    c.lineWidth = 1;
    c.stroke();
}*/

common.drawRegPoly = function(c, x, y, radius, sides, rotateAngle) {
    if (sides < 3) return;
    var a = (Math.PI * 2)/sides;
    c.beginPath();
    c.translate(x,y);
    c.rotate(rotateAngle);
    c.moveTo(radius,0);
    for (var i = 1; i < sides; i++) {
        c.lineTo(radius*Math.cos(a*i),radius*Math.sin(a*i));
    }
    c.closePath();
}

common.makeElementDraggable = function(id) {
    $("#" + id).resizable(
        {
            handles: "all",
            containment: "document",
            minWidth: 350,
            minHeight: 200
        }
    ).draggable(
        {
            handle: "#" + id + "-draggable",
            containment: false,
            cursor: "move"
        }
    );
}

var tooltipData = {
    x: 0,
    y: 0,
    mvX: 50,
    mvY: 5
}

var tt_debug_hover_id = "{none}"

var tt_def = {
    border: "000000ff",
    color: "ffffffff",
    background: "323232bb",
    width: "21.6em"
}

function tooltip_getTooltipText(data) {
    if (!data.tl && !data.text) { 
        //console.debug("data.tl and data.text are null");
        return null;
    }
    
    let text = getTranslatedText(data.tl, data.text, lang, fallbacklang);
    //console.debug(text);
    return text;
}

function tooltip_getTooltipData(element, def) {
    if (!def) def = tt_def;
    return {
        tl: element.getAttribute("data-tt-tl") || def.tl,
        text: element.getAttribute("data-tt") || def.text,
        border: element.getAttribute("data-tt-b") || def.border,
        color: element.getAttribute('data-tt-c') || def.color,
        background: element.getAttribute('data-tt-bg') || def.background,
        width: element.getAttribute('data-tt-w') || def.width,
    }
}

function tooltip_mousemoveevent(e) {
    tooltipData.x = e.clientX;
    tooltipData.y = e.clientY;

    var ttd = tooltipData

    var tte = document.getElementById('tooltip'),
        tth = document.getElementById('tooltip-header'),
        trX = "0",
        trY = "0",
        hE = document.elementFromPoint(ttd.x, ttd.y), // hovered element
        hET = null;

    

    if (tte === null || tth === null || hE === null) {
        return;
    }
    tt_debug_hover_id = hE.id;

    if (hE !== null) {
        let ettd = tooltip_getTooltipData(hE)
        hET = tooltip_getTooltipText(ettd)
        if (hET !== null) {
            tte.classList.add('visible');
            tth.innerHTML = hET;

            var customStyle = {
                border: hE.getAttribute("data-tt-b") || tt_def.border,
                color: hE.getAttribute('data-tt-c') || tt_def.color,
                background: hE.getAttribute('data-tt-bg') || tt_def.background,
                width: hE.getAttribute('data-tt-w') || tt_def.width,
            }

            tte.style.borderColor = "#" + customStyle.border;
            tte.style.color = "#" + customStyle.color;
            tte.style.backgroundColor = "#" + customStyle.background;
            tte.style.width = customStyle.width;

        } else {
            
            tte.classList.remove('visible')
        }
    } else {
        tte.classList.remove('visible')
    }

    if (tte.classList.contains('visible')) {
        if (!(ttd.x < tte.offsetWidth + window.innerWidth * 0.01)) {
            trX = "-100%"; ttd.mvX = -5;
        } else {
            ttd.mvX = 25;
        }
    
        if (!(ttd.y < window.innerHeight - tte.offsetHeight - window.innerHeight / 10) && tte.classList.contains('visible')) {
            trY = "-100%"; ttd.mvY = -5;
        } else {
            ttd.mvY = 25;
        }

        tte.style.transform = "translate(" + trX + ", " + trY + ")";
    }
    
    tte.style.top = (ttd.y+ttd.mvY) + 'px';
    tte.style.left = (ttd.x+ttd.mvX) + 'px';
};