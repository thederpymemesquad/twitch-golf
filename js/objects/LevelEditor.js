class LevelEditor {
    constructor(engine, render, mouse) {
        this._engine = engine;
        this._render = render;
        this._mouse = mouse;
        this.tempData = {
            isHoldingMouse: false,
        };
        this.version = 1;
        this.compatver = 0; // level editor format version, only changes when the way that could break stuff so that checking compatability is eaiser
        this.minSize = 10;
        this.levelData = {};
        this.cameraInject = true;
        this.userOptions = {
            enabled: false,
            delete: false
        }
        this.object = {
            type: "rect",
            selectionStyle: "rect",
            static: true,
            sides: 5,
            sidesCircle: false,
            freePolygonPoints: []
        }
        this.composite = {
            enabled: false,
            type: "pyramid",
            chain: false,
            size: {
                col: 1,
                row: 1,
                col_g: 0,
                row_g: 0
            }
        }
    }

    editor_export() {
        document.getElementById("editor-menu-data-box").value = JSON.stringify(editor_levelData);
    }

    editor_import() {
        let data = document.getElementById("editor-menu-data-box").value;
        loadLevel(JSON.parse(data), camera, false);
    }

    editor_import_debug() {
        let data = document.getElementById("editor-menu-data-box-debug").value;
        let isStatic = document.getElementById("editor-menu-data-debug-static").checked;
        loadBodyFromJSON(JSON.parse(data), isStatic, null, {})
    }

    openLevelEditorMenu(forceClose) {
        var menu = document.getElementById('editor-menu');
    
        if (menu.style.display === "block" || forceClose) {
            menu.style.display = "none";
        } else {
            menu.style.display = "block";
            //openDebugMenu(true);
        }
    }

    changeEditorObjectType(type) {
        this.userOptions.delete = false;
        if (type === "ball") {
            this.object.type = "ball";
            this.object.selectionStyle = "center";
            this.composite.enabled = false;
        } else if (type === "hole") {
            this.object.type = "hole";
            this.object.selectionStyle = "center";
            this.composite.enabled = false;
        } else if (type === "reg-poly" || type === "tri") {
            this.object.type = type;
            this.object.selectionStyle = "reg-poly"
        } else if (type === "trap") {
            logSystemMessage("Trapezoid coming soon maybe, idk")
            this.composite.enabled = false;
        } else if (type === "poly") {
            logSystemMessage("polygon coming soon")
            this.composite.enabled = false;
        } else if (type === "circle") {
            this.object.type = "circle";
            this.object.selectionStyle = "circle";
        } else if (type === "rect") {
            this.object.type = "rect";
            this.object.selectionStyle = "rect";
        }
        this.object.type = type;
        this.updateEditorUI();
    }

    toggleEditorState() {
        this.userOptions.enabled = document.getElementById('editor-quick-toggle-cb').checked;
        document.getElementById('editor-menu-enable').checked = this.userOptions.enabled
    }

    updateEditorUI() {
        document.getElementById("editor-menu-enable").checked = this.userOptions.enabled;
        document.getElementById("editor-menu-delete").checked = this.userOptions.delete;
        document.getElementById("editor-menu-static").checked = this.object.static;
        document.getElementById("editor-menu-obj-sides-circle").checked = this.object.sidesCircle;
        document.getElementById("editor-menu-place-comp").checked = this.composite.enabled;
    
        document.getElementById("editor-menu-obj-sides").value = this.object.sides;
    }

    updateEditorOptions() {
        function cb(id) {
            return document.getElementById('editor-menu-' + id).checked;
        }
        function value(id) {
            return document.getElementById(id).value;
        }
        this.userOptions.enabled = cb('enable');
        this.userOptions.delete = cb('delete');
        this.object.static = cb('static');
        this.object.sides = value('editor-menu-obj-sides');
        this.object.sidesCircle = cb('obj-sides-circle')
        this.object.color = value("editor-menu-obj-color")
        this.composite.enabled = cb('place-comp');
        this.composite.type = value('editor-menu-comp-type');
        this.composite.chain = cb('c-chain');
        this.composite.size.col = value('editor-menu-c-cols');
        this.composite.size.row = value('editor-menu-c-rows');
        this.composite.size.col_g = value('editor-menu-c-colg');
        this.composite.size.row_g = value('editor-menu-c-rowg');
    
        if (this.userOptions.enabled) {
            document.getElementById('editor-quick-toggle').style.display = "block"
        } else {
            document.getElementById('editor-quick-toggle').style.display = "none"
        }
        document.getElementById('editor-quick-toggle-cb').checked = this.userOptions.enabled
    
        if (this.userOptions.delete) {
            this.object.selectionStyle = "rect"
        } else {
            this.changeEditorObjectType(this.object.type);
        }
    }

    placeLevelEditorObject() {
        if (!this.userOptions.enabled) return
    
        var startCoords = this.tempData.mouseDownPosition;
        var endCoords = common.getRelativeMousePosition(this._render.bounds, this._mouse.absolute);
    
        var width = Math.max(startCoords.x, endCoords.x) - Math.min(startCoords.x, endCoords.x);
        var height = Math.max(startCoords.y, endCoords.y) - Math.min(startCoords.y, endCoords.y);
        var x = Math.min(startCoords.x, endCoords.x);
        var y = Math.min(startCoords.y, endCoords.y);
        var bounds = {
            max: {
                x: Math.max(startCoords.x, endCoords.x),
                y: Math.max(startCoords.y, endCoords.y)
            }, 
            min: {
                x: Math.min(startCoords.x, endCoords.x),
                y: Math.min(startCoords.y, endCoords.y)
            }
        }
    
        
    
        if (this.userOptions.delete) {
            var bodiesToRemove = Matter.Query.region(Matter.Composite.allBodies(world), bounds)
            var ac = Matter.Composite.allComposites(world)
            for (var c in ac) {
                var ab = Matter.Query.region(Matter.Composite.allBodies(ac[c]), bounds);
                for (var b in ab) {
                    bodiesToRemove.push(ac[c].bodies[b]);
                }
            };
            for (var b in bodiesToRemove) {
                if (!bodiesToRemove[b].plugin.undeletable) {
                    Matter.World.remove(world, bodiesToRemove[b])
                }
            }
        } else {
            var objJson = {
                "type": this.object.type,
                "position": {"x": x, "y": y},
                "size": {"width": width, "height": height},
                "properties": {
                    "render": {
                        "color": this.object.color
                    }
                }
            }
    
            if (this.composite.enabled) {
                logSystemMessage("whoops, no composites yet")
                if (this.composite.type === "stack") {}
            } else {
                //objJson['type'] = this.object.type;
                if (this.object.type === "rect") {
                    if (width > this.minSize && height > this.minSize) {
                        var newBody = loadBodyFromJSON(objJson, this.object.static, false);
                        //var newBody = Matter.Bodies.rectangle(x + (.5 * width), y + (.5 * height), width, height, {isStatic: this.object.static, collisionFilter: {category: nonInteractable}});
                        Matter.World.add(world, newBody)
                        if (this.object.static) editor_levelData["levelData"]["staticObjects"].push(objJson);
                        else editor_levelData["levelData"]["physicsObjects"].push(objJson);
                        document.getElementById("editor-menu-data-box-debug").value = JSON.stringify(objJson);
                    } else {
                        logSystemMessage("too small!")
                    }
                } else if (this.object.type === 'circle') {
                    if (width > this.minSize || height > this.minSize) {
                        x = mouse.mousedownPosition.x; y = mouse.mousedownPosition.y
                        var radius = Math.max(width, height);
                        var maxSides = this.object.sidesCircle ? this.object.sides : null;
                        var newBody = Matter.Bodies.circle(x, y, radius, {isStatic: this.object.static, collisionFilter: {category: nonInteractable}}, maxSides)
                        Matter.World.add(world, newBody);
                        objJson['size'] = {"radius": radius, "sides": maxSides}
                        if (this.object.static) editor_levelData["levelData"]["staticObjects"].push(objJson);
                        else editor_levelData["levelData"]["physicsObjects"].push(objJson);
                        document.getElementById("editor-menu-data-box-debug").value = JSON.stringify(objJson);
                    } else {
                        logSystemMessage("too small!")
                    }
                } else if (this.object.type === "trapezoid") {
                    logSystemMessage("whoops you have to put the cd in the computer")
                } else if (this.object.type === "reg-poly" || this.object.type === "tri") {
                    var sides = this.object.type == "tri" ? 3 : this.object.sides;
                    var radius = Math.max(width, height);
                    var angle = Math.atan2(startCoords.y - endCoords.y, startCoords.x - endCoords.x);
    
                    var newBody = Matter.Bodies.polygon(this.tempData.mouseDownPosition.x, this.tempData.mouseDownPosition.y, sides, radius, {angle: angle, isStatic: this.object.static, collisionFilter: {category: nonInteractable}});
                    Matter.World.add(world, newBody);
    
                    objJson['size'] = {"radius": radius, "sides": sides}
    
                    if (this.object.static) editor_levelData["levelData"]["staticObjects"].append(objJson);
                    else editor_levelData["levelData"]["physicsObjects"].append(objJson);
                    document.getElementById("editor-menu-data-box-debug").value = JSON.stringify(objJson);
                }
            }
        }    
    }

    onmousedown(e) {
        if (this.userOptions.enabled) {
            this.tempData.isHoldingMouse = true;
            this.tempData.mouseDownPosition = common.getRelativeMousePosition(this._render.bounds, mouse.absolute);;
        }
    }

    onmouseup(e) {
        if (this.tempData.isHoldingMouse && this.userOptions.enabled) {
            this.tempData.isHoldingMouse = false;
            this.placeLevelEditorObject()
        } else if (this.userOptions.enabled) {
            console.debug("mouse was released without being pressed first!")
        }
        
    }
};
//window.addEventListener("mousemove", function(e){lE_onmousemove(e)})


window.onload = function() {
    document.getElementById('matter-canvas').onmousedown = function(e){LevelEditorInstance.onmousedown(e)}
    document.getElementById('matter-canvas').onmouseup = function(e){LevelEditorInstance.onmouseup(e)}
}