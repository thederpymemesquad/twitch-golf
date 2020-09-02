//Matter.use('matter-collision-events');

// === Language Initilaztion ===
var default_lang = "en_us.json"

function loadLang(file) {
    let x = new XMLHttpRequest();
    x.open("GET", file, false);
    x.send();
    //console.debug(x)
    return JSON.parse(x.responseText);
}

var lang = loadLang("./js/lang/" + default_lang);
var fallbacklang = loadLang("./js/lang/" + default_lang);
var langlist = loadLang("./js/lang/lang_list.json");

translateExistingPageElements(lang, fallbacklang);

var langselect = document.getElementById("langselect")
for (l in langlist) {
    langselect.innerHTML += '<option value="' + langlist[l].file + '">' + langlist[l].name + "</option>"
}

function changeLanguage() {
    let load = document.getElementById("langselect").value
    lang = loadLang("./js/lang/" + load)
    translateExistingPageElements(lang, fallbacklang)
}



common.makeElementDraggable("editor-menu");
common.makeElementDraggable("debug-menu");

function updateEditorWindowDraggableOptions() {
    let allowOutOfBoundsMovement = document.getElementById("editor-menu-window-restriction").checked;
    let lockWindow = document.getElementById("editor-menu-window-lock").checked;

    $("#editor-menu").draggable("option", "containment", allowOutOfBoundsMovement ? "document" : false);
    $("#editor-menu").draggable("option", "disabled", lockWindow);
    $("#editor-menu").resizable("option", "disabled", lockWindow);
}


var version = {
    "str": "editor update alpha 0",
    "build": 12,
    "name": "update"
}

document.getElementById("gi-version").innerHTML = /*version['name'] + " - " +*/ version['str']
document.getElementById("gi-build").innerHTML = version['build']

var debugOptions = {
    debugModeEnabled: false,
    enableCameraTargetRendering: false,
    debugSidebarVisible: true,
    disableDebugMode: false,
    debugRenderOptionsEnabled: false,
    hideChat: false,
    debugRenderOptions: {
        wireframes: false,
        showSleeping: false,
        showDebug: false,
        showBroadphase: false,
        showBounds: false,
        showVelocity: false,
        showCollisions: false,
        showSeparations: false,
        showAxes: false,
        showPositions: false,
        showAngleIndicator: false,
        showIds: false,
        showShadows: false,
        showVertexNumbers: false,
        showConvexHulls: false,
        showInternalEdges: false,
        showMousePosition: false
    }
}

var rawMousePosition = {x: 0, y: 0}

var {Engine,
    Render,
    Runner,
    Composites,
    Events,
    Constraint,
    MouseConstraint,
    Mouse,
    World,
    Body,
    Bodies,
    Sleeping} = Matter;

// create engine
var engine = Engine.create({
        //enableSleeping: true
    });
var world = engine.world;

world.gravity.x = 0;
world.gravity.y = 0;

var baseStiffness = 0.0025;

// create renderer
var render = Render.create({
    canvas: document.getElementById('matter-canvas'),
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        enabled: true,
        hasBounds: true,
        wireframes: false,
        showSleeping: false,
        //showMousePosition: true
    }
});

//render.options.height = window.innerHeight;
//render.options.width = (window.innerWidth/10)*7
//Render.setPixelRatio(render, "auto")

Render.run(render);
var camera = new Camera(render, 0.05, 200);

var defaultCategory = 0x0001;
var nonInteractable = 0x0002;
var mouseInteractableCategory = 0x0004;

var ballUserGrabedState = mouseInteractableCategory;
var ballCollisionState = defaultCategory;

var noInteract = { category: nonInteractable };

function updateStiffness(ball, anchor) {
    return common.clamp(
        Math.abs(
            common.power(
                -2,
                common.distance(
                    ball.position,
                    anchor.position
                ) / (
                    (
                        10 + 20
                    ) * 10
                )
            )
        ), 
        0.000000001, 
        1
    );
}

//var ballSpawnX = 170;
//var ballSpawnY = 450;
//var ballRadius = 20;
//var boxPadding = 10;
var runner = Runner.create();
Runner.run(runner, engine);


var level = loadLevel(testLevelJSON, camera, false)

var golfBall = level['ball'];
var hole = level['hole'];
var mouse = level['mouse'];
var mouseConstraint = level['mC'];

var LevelEditorInstance = new LevelEditor(engine, render, level['mouse']);



//cameraSettings.poiPadding = 250

Matter.Events.on(engine, 'afterUpdate', function() {
    golfBall.afterUpdate(hole)
    camera.update();

    //level.customUpdate()

    if (!debugOptions.debugModeEnabled || !debugOptions.debugSidebarVisible) return;
    var sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = "";
    sidebar.innerHTML += "lang id: " + getTranslatedText("lang.id", "?", lang) + "<br>"
    sidebar.innerHTML += "camera target values: " + JSON.stringify(camera.targetValues) + "<br>";
    sidebar.innerHTML += "camera current values: " + JSON.stringify(camera.currentValues) + "<br>";
    sidebar.innerHTML += "render bounds values: " + JSON.stringify(render.bounds) + "<br>";
    sidebar.innerHTML += "predicted ball state: " + golfBall.ballState + "<br>";
    sidebar.innerHTML += "Ball Position: (" + golfBall.body.position.x + ", " + golfBall.body.position.y + ")<br>";
    sidebar.innerHTML += "RV: (" + golfBall.body.velocity.x + ", " + golfBall.body.velocity.y + ")<br>";
    sidebar.innerHTML += "ball {motion: " + golfBall.body.motion + ", sleep: " + golfBall.body.isSleeping + ", anchor: " + golfBall.isInAnchor() + "}<br>";
    sidebar.innerHTML += "{mHO: " + golfBall.isHeldByMouse() + ", wFR: " + golfBall.waitingForRelease + ", wFRTS: " + golfBall.waitingForRockToStop + "}<br>";
    sidebar.innerHTML += "ball-anchor distance: " + common.distance(golfBall.position(), golfBall.anchor.innerCollider.position) + "<br>";
    sidebar.innerHTML += "ball-hole distance: " + common.distance(golfBall.position(), hole.position()) + "<br>";
    sidebar.innerHTML += "camera zoom: " + camera.zoomTarget + ", " + camera.poiPadding + "<br>";
    sidebar.innerHTML += "mouse relative position: " + JSON.stringify(mouse.position) + "<br>";
    sidebar.innerHTML += "mouse absolute position: " + JSON.stringify(mouse.absolute) + "<br>";
    sidebar.innerHTML += "hovered element id: " + tt_debug_hover_id + "<br>";
});

Events.on(render, 'afterRender', function(e){
    //camera.debugDrawing(e)
})

//mouseConstraint.collisionFilter.group = 5;

/*Events.on(mouseConstraint, "startdrag", function(e){
    if (e.source.body != rock) {
        e.preventDefault()
    }


    sqrt( (x2 - x1)^2 + (y2 - y1)^2 )
})*/

World.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

// fit the render viewport to the scene
Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: (window.innerWidth/100)*65, y:  window.innerHeight, }
});

function stop() {
    Matter.Render.stop(render);
    Matter.Runner.stop(runner);
}

document.getElementById("sidebar").style.display = "none"

function openDebugMenu(forceClose) {
    dm = document.getElementById("debug-menu");

    if (dm.style.display === "block" || forceClose) {
        dm.style.display = "none";
    } else {
        dm.style.display = "block";
        //openLevelEditorMenu(true);
    }
}

window.onerror = function(e) {
    logSystemMessage(JSON.stringify(e));
    //debugger;
}

document.getElementById('matter-canvas').onwheel = function(e) {
    //console.log(e)
    var dir = (e.detail<0) ? 1 : (e.deltaY>0) ? -1 : 1;

    if (dir == 1) {
        camera.zoomIn();
    } else {
        camera.zoomOut();
    }
}

function updateDebugRenderOptions() {
    updateDebugOptions()
}

function disableDebugModePrompt() {
    var prompt = confirm("WARNING! Disabling debug mode with this option will completley disable it until you refesh the page. Are you sure you want to disable debug mode?")

    if (prompt === true) {
        document.getElementById("enableDebugMode").checked = false;
        debugOptions.debugModeEnabled = false;
        updateDebugOptions()

        debugOptions.disableDebugMode = true;

        document.getElementById("debug-menu-button").style.display = "none"
        document.getElementById('debug-menu').style.display = "none"

        alert("Debug mode has been disabled.");
        logSystemMessage("Debug mode has been disabled.")
    } else {
        alert("Debug mode will not be disabled.");
        logSystemMessage("Debug mode was not disabled.")
    }
}

function updateDebugOptions() {
    if (debugOptions.disableDebugMode) return;
    debugOptions.debugModeEnabled                       = document.getElementById("enableDebugMode").checked;
    debugOptions.debugSidebarVisible                    = document.getElementById("enableDebugSidebar").checked;
    debugOptions.enableCameraTargetRendering            = document.getElementById("enableCameraTargetRendering").checked;
    debugOptions.debugRenderOptionsEnabled              = document.getElementById("debugRenderOptionsEnabled").checked;
    debugOptions.debugRenderOptions.wireframes          = document.getElementById("showWireframes").checked;
    debugOptions.debugRenderOptions.showSleeping        = document.getElementById("showSleeping").checked;
    debugOptions.debugRenderOptions.showDebug           = document.getElementById("showDebug").checked;
    debugOptions.debugRenderOptions.showBroadphase      = document.getElementById("showBroadphase").checked;
    debugOptions.debugRenderOptions.showBounds          = document.getElementById("showBounds").checked;
    debugOptions.debugRenderOptions.showVelocity        = document.getElementById("showVelocity").checked;
    debugOptions.debugRenderOptions.showCollisions      = document.getElementById("showCollisions").checked;
    debugOptions.debugRenderOptions.showSeparations     = document.getElementById("showSeparations").checked;
    debugOptions.debugRenderOptions.showAxes            = document.getElementById("showAxes").checked;
    debugOptions.debugRenderOptions.showPositions       = document.getElementById("showPositions").checked;
    debugOptions.debugRenderOptions.showAngleIndicator  = document.getElementById("showAngleIndicator").checked;
    debugOptions.debugRenderOptions.showIds             = document.getElementById("showIds").checked;
    debugOptions.debugRenderOptions.showShadows         = document.getElementById("showShadows").checked;
    debugOptions.debugRenderOptions.showVertexNumbers   = document.getElementById("showVertexNumbers").checked;
    debugOptions.debugRenderOptions.showConvexHulls     = document.getElementById("showConvexHulls").checked;
    debugOptions.debugRenderOptions.showInternalEdges   = document.getElementById("showInternalEdges").checked;
    // debugOptions.debugRenderOptions.showMousePosition = document.getElementById("showMousePosition").checked

    //if (!debugOptions.debugRenderOptionsEnabled) return;
    camera.debugTargetValues = debugOptions.debugModeEnabled && debugOptions.enableCameraTargetRendering;
    if (debugOptions.debugModeEnabled && debugOptions.debugSidebarVisible) {
        document.getElementById('sidebar').style.display = 'block';
    } else {
        document.getElementById('sidebar').style.display = 'none';
    }

    var e = debugOptions.debugRenderOptionsEnabled && debugOptions.debugModeEnabled;
    render.options.wireframes = debugOptions.debugRenderOptions.wireframes && e;
    render.options.showSleeping = debugOptions.debugRenderOptions.showSleeping && e;
    render.options.showDebug = debugOptions.debugRenderOptions.showDebug && e;
    render.options.showBroadphase = debugOptions.debugRenderOptions.showBroadphase && e;
    render.options.showBounds = debugOptions.debugRenderOptions.showBounds && e;
    render.options.showVelocity = debugOptions.debugRenderOptions.showVelocity && e;
    render.options.showCollisions = debugOptions.debugRenderOptions.showCollisions && e;
    render.options.showSeparations = debugOptions.debugRenderOptions.showSeparations && e;
    render.options.showAxes = debugOptions.debugRenderOptions.showAxes && e;
    render.options.showPositions = debugOptions.debugRenderOptions.showPositions && e;
    render.options.showAngleIndicator = debugOptions.debugRenderOptions.showAngleIndicator && e;
    render.options.showIds = debugOptions.debugRenderOptions.showIds && e;
    render.options.showShadows = debugOptions.debugRenderOptions.showShadows && e;
    render.options.showVertexNumbers = debugOptions.debugRenderOptions.showVertexNumbers && e;
    render.options.showConvexHulls = debugOptions.debugRenderOptions.showConvexHulls && e;
    render.options.showInternalEdges = debugOptions.debugRenderOptions.showInternalEdges && e;
    //render.options.showMousePosition = debugOptions.debugRenderOptions.showMousePosition

}

window.onmousemove = function(e) {
    //lE_onmousemove(e);
    tooltip_mousemoveevent(e);
}

window.onresize = function(e) {
    let rc = document.getElementById("matter-canvas");
    rc.width = window.innerWidth;
    rc.height = window.innerHeight;
    render.options.width = window.innerWidth;
    render.options.height = window.innerHeight;
}