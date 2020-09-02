class Camera {
    constructor(renderer, lerpNorm, padding) {
        this.render = renderer;
        this.pointsOfInterest = [];
        this.bounds = {min: {x: -Infinity, y: -Infinity}, max: {x: Infinity, y: Infinity}};
        this.targetValues = {
            min: { x: 0, y: 0 },
            max: { x: (window.innerWidth/100)*65, y:  window.innerHeight }
        };
        this.currentValues = {
            min: { x: 0, y: 0 },
            max: { x: (window.innerWidth/100)*65, y:  window.innerHeight }
        };
        this.targetValues_noPadding = {
            min: {x: 0, y: 0},
            max: { x: (window.innerWidth/100)*65, y:  window.innerHeight }
        }
        this.hasOutOfViewPOIs = false;
        this.lerpNorm = lerpNorm;
        this.poiPadding = padding;
        this.maxZoomPad = 1e20;
        this.minZoomPad = 100;
        this.defaultZoom = padding;
        this.zoomInterval = 1.1;
        this.zoomTarget = padding;
        this.skipSmoothing = false;
        this.debugTargetValues = false;

        /*if (this.debugTargetValues) {
            this.debugBox = Matter.Bodies.rectangle(0,0,50,50,{isSensor:true, isStatic:true, render: {
                color: "#ffffff",
                opacity: 0.2
            }})
            World.add(this.render.engine.world, [this.debugBox])
        }*/
    }

    calculateDynamicLerp() {
        var minDist = common.distance(this.targetValues.min, this.currentValues.min);
        var maxDist = common.distance(this.targetValues.max, this.currentValues.max);
        // 0.000001
        var minLerp = common.power(0.000001 * -minDist, 2);
        var maxLerp = common.power(0.000001 * -maxDist, 2);

        return {min: minLerp, max: maxLerp};
    }

    new_addPOI(data) {
        if (data.t == "matter.body") {
            // add matter body POI
            //this.pointsOfInterest.push({"type": "body", "":""})
        } else if (data.t == "position") {
            // add basic position POI
        }
        this.pointsOfInterest.push(data.body)
    }

    addPOI(body) {
        this.pointsOfInterest.push(body);
        /*Matter.Events.on(world, "afterRemove", function(e){
            if (e.object == body) {
                console.debug(e.source);
                this.pointsOfInterest = []
            }
        })*/
    }

    clearPOIs() {
        this.pointsOfInterest = [];
    }

    setZoom(value) {
        if (value === 'default') {
            this.zoomTarget = common.clamp(this.defaultZoom, this.minZoomPad, this.maxZoomPad)
        } else {
            this.zoomTarget = common.clamp(value, this.minZoomPad, this.maxZoomPad)
        }
    }

    zoomIn() {
        this.setZoom(this.zoomTarget / this.zoomInterval)
    }

    zoomOut() {
        this.setZoom(this.zoomTarget * this.zoomInterval)
    }

    calculateNewCameraValues() {
        var xValues = [];
        var yValues = [];

        for (var poi in this.pointsOfInterest) {
            var poiCoords = this.pointsOfInterest[poi].cameraPOI_position();
            xValues.push(poiCoords.x);
            yValues.push(poiCoords.y);
        }


        var minMaxX = common.minMax(xValues);
        var minMaxY = common.minMax(yValues);
        
        var pad = this.poiPadding;

        var MaxX = this.bounds.max.x;
        var MaxY = this.bounds.max.y;
        var MinX = this.bounds.min.x;
        var MinY = this.bounds.min.y;

        this.targetValues_noPadding = {
            min: {
                x: minMaxX.min,
                y: minMaxY.min
            }, 
            max: {
                x: minMaxX.max,
                y: minMaxY.max
            }
        };

        var maxX = minMaxX.max + pad,
            maxY = minMaxY.max + pad,
            minX = minMaxX.min - pad,
            minY = minMaxY.min - pad;

        var center = common.midpointOfCoords(this.pointsOfInterest);

        var cameraMaxX = common.clamp(maxX, MinX, MaxX),
            cameraMaxY = common.clamp(maxY, MinY, MaxY),
            cameraMinX = common.clamp(minX, MinX, MaxX),
            cameraMinY = common.clamp(minY, MinY, MaxY);
        
        if (cameraMaxX < maxX || cameraMinX > minX || cameraMaxY < maxY || cameraMinY > minY) {
            this.hasOutOfViewPOIs = true;
        } else {
            this.hasOutOfViewPOIs = false;
        }

        var ocv = this.currentValues;
        var lp = this.lerpNorm;
        this.targetValues = {
            min: {
                x: cameraMinX,
                y: cameraMinY
            }, 
            max: {
                x: cameraMaxX,
                y: cameraMaxY
            }
        };
        //var l = this.calculateDynamicLerp();
        var l = {min: lp, max: lp}
        this.currentValues = {
            min: {
                x: common.lerp(l.min, ocv.min.x, cameraMinX),
                y: common.lerp(l.min, ocv.min.y, cameraMinY)
            },
            max: {
                x: common.lerp(l.max, ocv.max.x, cameraMaxX),
                y: common.lerp(l.max, ocv.max.y, cameraMaxY)
            }
        }
    }

    update() {
        this.calculateNewCameraValues();
        if (this.skipSmoothing) {
            this.poiPadding = this.zoomTarget
            Matter.Render.lookAt(this.render, this.targetValues);
        } else {
            this.poiPadding = common.lerp(0.3, this.poiPadding, this.zoomTarget)
            Matter.Render.lookAt(this.render, this.currentValues);
        }
        var realMousePosition = common.getRelativeMousePosition(this.render.bounds, mouse.absolute);

        var c = this.render.context;
        Matter.Render.startViewTransform(this.render);
        c.strokeStyle = "#00f"
        c.beginPath()
        c.rect(realMousePosition.x - 7, realMousePosition.y - 7, 14, 14);
        c.stroke();
        
        c.beginPath()
        c.strokeStyle = "#0f0"
        c.rect(mouse.position.x - 7, mouse.position.y - 7, 14, 14);
        c.stroke();
        Matter.Render.endViewTransform(this.render);

        if (LevelEditorInstance.cameraInject && LevelEditorInstance.tempData.isHoldingMouse && LevelEditorInstance.userOptions.enabled) {
        //if (false) {
            var startCoords = LevelEditorInstance.tempData.mouseDownPosition;
            var endCoords = common.getRelativeMousePosition(this.render.bounds, mouse.absolute);
            //var stest = common.relativeCoords(startCoords, this.currentValues.min, this.currentValues.max, window.innerWidth, window.innerHeight)
            //var etest = common.relativeCoords(endCoords, this.currentValues.min, this.currentValues.max, window.innerWidth, window.innerHeight)

            var width = Math.max(startCoords.x, endCoords.x) - Math.min(startCoords.x, endCoords.x);
            var height = Math.max(startCoords.y, endCoords.y) - Math.min(startCoords.y, endCoords.y);
            var x = Math.min(startCoords.x, endCoords.x);
            //var tx = Math.min(stest.x, etest.x)
            var y = Math.min(startCoords.y, endCoords.y);
            //var ty = Math.min(stest.y, etest.y)
            
            var angle = Math.atan2(startCoords.y - endCoords.y, startCoords.x - endCoords.x);

            Matter.Render.startViewTransform(this.render);
            c.strokeStyle = "#f00"
            if (LevelEditorInstance.object.selectionStyle === 'rect' && (width > 10 && height > 10)) c.strokeStyle = "#0f0";
            else if (width > 10 || height > 10) c.strokeStyle = "#0f0";
            
            c.beginPath();
            if (LevelEditorInstance.object.selectionStyle === 'rect') {
                c.rect(x, y, width, height);
                //c.strokeStyle = "#fff"
                //c.rect(tx, ty, width, height)
            } else if (LevelEditorInstance.object.selectionStyle === 'circle') {
                c.arc(startCoords.x, startCoords.y, Math.max(width, height), 0, 2*Math.PI)
            } else if (LevelEditorInstance.object.selectionStyle === 'reg-poly') {
                var sides = LevelEditorInstance.object.sides;
                if (LevelEditorInstance.object.type === 'tri') sides = 3;
                if (LevelEditorInstance.object.sides % 2 != 0) angle += Math.PI;
                common.drawRegPoly(c, startCoords.x, startCoords.y, Math.max(width, height), sides, angle)
            } else if (LevelEditorInstance.object.selectionStyle === 'center') {
                c.strokeStyle = "#fff";
                c.rect(x, y, width, height);
                c.stroke();
                c.beginPath();
                c.strokeStyle = "#0f0";
                var ix = x + (width/2);
                var iy = y + (height/2);
                c.arc(ix, iy, 5, 0, 2*Math.PI);
            }
            c.stroke();
            Matter.Render.endViewTransform(this.render);
        }
        
        if (this.debugTargetValues || this.overrideDebugState) {
            //this.debugDrawing();
            this.debugDrawing();
        }

        //Matter.Render.debug(this.render, this.render.context)
    }

    debugDrawing() {
        var c = this.render.context;
        var tV = this.targetValues_noPadding;
        
        Matter.Render.startViewTransform(this.render);
        c.strokeStyle = "#ffffff";
        c.beginPath();
        c.moveTo(tV.min.x, tV.min.y);
        c.lineTo(tV.min.x, tV.max.y);
        c.lineTo(tV.max.x, tV.max.y);
        c.lineTo(tV.max.x, tV.min.y);
        c.lineTo(tV.min.x, tV.min.y);
        c.stroke();

        for (var poi in this.pointsOfInterest) {
            var pos = this.pointsOfInterest[poi].cameraPOI_position();
            var p = this.zoomTarget;

            c.beginPath();
            c.rect(pos.x-10, pos.y-10, 20, 20);
            c.rect(pos.x-p, pos.y-p, p*2, p*2)
            c.stroke();
        }



        Matter.Render.endViewTransform(this.render);
    }    
}