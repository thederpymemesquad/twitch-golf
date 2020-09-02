var testLevelJSON = {
    "metadata": { // low level information about the level
        "name": "Test Level", // The name of the level displayed to the user
        "author": "LeOtOmAs",
        "levelVersion": 0, // The number of times the level has been saved after changes were made.
        "customLevelVersionString": "test", // The string that the level creater has decided to use for the string
        "createdInVersion": 0 // The version of the level editor the level was created in, used to check compatibility if changes were made
    },
    "levelData": {
        "meta": { // data about where the golf ball and hole are
            "golfBall": {"x": 170,"y": 450,"radius": 20,"anchorPadding": 10},
            "hole": {"x": 700, "y": 100, "radius": 1.05} // hole radius is multiplied by ball radius.
        },"staticObjects": [ // all static objects in the level
            {
                "type": "rect",
                "position": { "x": 395, "y": 600 }, // 395, 600
                "size": {"width": 815, "height": 50},
                "properties": {},
                "skipAlignment": true
            },{
                "type": "rect",
                "position": { "x": 610, "y": 250},
                "size": {"width": 200, "height": 20},
                "properties": {},
                "skipAlignment": true
            }
        ],"physicsObjects": [ // all objects in the level that will move
            {
                "type": "composite",
                "position": {"x": 500, "y": 300},
                "composite-data": {"rows": 10, "columns": 9, "columnGap": 0, "rowGap": 0},
                "composite-body": {
                    "type": "circle",
                    "size": {"radius": 15},
                    "properties": {"restitution": 0.8, "density": 0.005}
                }
            },{
                "type": "composite",
                "position": {"x": 550, "y": 0},
                "composite-data": {"rows": 10, "columns": 5, "columnGap": 0, "rowGap": 0},
                "composite-body": {
                    "type": "rect",
                    "size": {"width": 25, "height": 40},
                    "properties": {"restitution": 0.8,"density": 0.001}
                }
            }
        ]
    }
}

/*
var defaults = {
    id: Common.nextId(),
    type: 'body',
    label: 'Body',
    parts: [],
    plugin: {},
    angle: 0,
    vertices: Vertices.fromPath('L 0 0 L 40 0 L 40 40 L 0 40'),
    position: { x: 0, y: 0 },
    force: { x: 0, y: 0 },
    torque: 0,
    positionImpulse: { x: 0, y: 0 },
    constraintImpulse: { x: 0, y: 0, angle: 0 },
    totalContacts: 0,
    speed: 0,
    angularSpeed: 0,
    velocity: { x: 0, y: 0 },
    angularVelocity: 0,
    isSensor: false,
    isStatic: false,
    isSleeping: false,
    motion: 0,
    sleepThreshold: 60,
    density: 0.001,
    restitution: 0,
    friction: 0.1,
    frictionStatic: 0.5,
    frictionAir: 0.01,
    collisionFilter: {
        category: 0x0001,
        mask: 0xFFFFFFFF,
        group: 0
    },
    slop: 0.05,
    timeScale: 1,
    render: {
        visible: true,
        opacity: 1,
        sprite: {
            xScale: 1,
            yScale: 1,
            xOffset: 0,
            yOffset: 0
        },
        lineWidth: 0
    }
};
*/

function convertBodyPropertiesJSON(json, def) {
    var defaults = { label: 'Body', angle: 0, isSensor: false, isStatic: false, isSleeping: false, sleepThreshold: 60, density: 0.001, restitution: 0, friction: 0.1, frictionStatic: 0.5, frictionAir: 0.01, collisionFilter: { category: 0x0001, mask: 0xFFFFFFFF, group: 0 }, slop: 0.05, timeScale: 1, render: { visible: true, opacity: 1, lineWidth: 0 } }; def = def || defaults; json['collisionFilter'] = json['collisionFilter'] || {}; json['render'] = json['render'] || {}; var d = Matter.Common.extend(def, defaults);
    return { label: json['label'] || d.label, angle: json['angle'] || d.angle, isSensor: json['isSensor'] || d.isSensor, isStatic: json['isStatic'] || d.isStatic, isSleeping: json['isSleeping'] || d.isSleeping, sleepThreshold: json['sleepThreshold'] || d.sleepThreshold, density: json['density'] || d.density, restitution: json['restitution'] || d.restitution, friction: json['friction'] || d.friction, frictionStatic: json['frictionStatic'] || d.frictionStatic, frictionAir: json['frictionAir'] || d.frictionAir, collisionFilter: { category: json['collisionFilter']['category'] || d.collisionFilter.category, mask: json['collisionFilter']['mask'] || d.collisionFilter.mask, group: json['collisionFilter']['group'] || d.collisionFilter.group }, slop: json['slop'] || d.slop, timeScale: json['timeScale'] || d.timeScale, render: { visible: json['render']['visible'] || d.render.visible, opacity: json['render']['opacity'] || d.render.opacity, lineWidth: json['render']['lineWidth'] || d.render.lineWidth, fillStyle: json['render']['color'] || null } }
}

function loadBodyFromJSON(json, isStatic, skipAlignment, collisionFilter) {
    var iS = isStatic || false; var cF = collisionFilter || {}; var sA = skipAlignment || (json["skipAlignment"] || false);
    if (json['type'] === "composite") return Matter.Composites.pyramid(json["position"]["x"] || 0, json['position']['y'] || 0,json['composite-data']['columns'] || 1, json['composite-data']['rows'] || 1,json['composite-data']['columnGap'] || 0, json['composite-data']['rowGap'] || 0, function(x, y) {return loadBodyFromJSON({"type": json['composite-body']['type'] || "rect", 'position': {"x": x, "y": y} || {"x": 0, "y": 0}, "size": json['composite-body']['size'] || {"width": 1, "height": 1}, "radius": json['composite-body']['radius'] || 1, "properties": json['composite-body']['properties'] || {}}, iS, true, cF)})
    else {
        var properties = json['properties'] || {};if (iS) properties['isStatic'] = iS;properties['collisionFilter'] = {"category": nonInteractable};

        if (json['type'] === "rect" && sA)    return Matter.Bodies.rectangle( json['position']['x'] || 0, json['position']['y'] || 0, json['size']['width']  || 1, json['size']['height']|| 1, convertBodyPropertiesJSON(properties));
        else if (json['type'] === "rect")     return Matter.Bodies.rectangle((json['position']['x'] || 0) + ((json['size']['width']  || 1) * 0.5), (json['position']['y'] || 0) + ((json['size']['height']  || 1) * 0.5), json['size']['width']  || 1, json['size']['height']|| 1, convertBodyPropertiesJSON(properties));
        else if (json['type'] === "circle")   return Matter.Bodies.circle(    json['position']['x'] || 0, json['position']['y'] || 0, json['size']['radius'] || 1, convertBodyPropertiesJSON(properties), json['size']['sides'] || null);
        else if (json['type'] === "tpz")      return Matter.Bodies.trapezoid( json['position']['x'] || 0, json['position']['y'] || 0, json['size']['width']  || 1, json['size']['height'] || 1, json['size']['slope'] || 1, convertBodyPropertiesJSON(properties));
        else if (json['type'] === "reg-poly") return Matter.Bodies.polygon(   json['position']['x'] || 0, json['position']['y'] || 0, json['size']['sides']  || 3, json['size']['radius'] || 1, convertBodyPropertiesJSON(properties));
        else if (json['type'] === "tri")      return Matter.Bodies.polygon(   json['position']['x'] || 0, json['position']['y'] || 0, 3,                           json['size']['radius'] || 1, convertBodyPropertiesJSON(properties));
        else return null;
    }
}

var currentLevelMeta = {}

function loadLevel(json, camera, reuse) {
    //var l = logRawText;
    let meta = json['metadata'] || {};
    currentLevelMeta = meta;
    editor_levelData = json;

    // puts level info on level info bar thingy on the page
    document.getElementById("li-name").innerHTML = meta['name'] || "Unnamed Level"; document.getElementById("li-author").innerHTML = meta['author'] || ""; document.getElementById('li-version').innerHTML = "Version: " + meta['customLevelVersionString'] + " (" + meta['levelVersion'] + ")" || "Version: Unknown";

    
    if (!reuse) { // how the hell do i do this
        Matter.World.clear(world) // clear the world
        camera.clearPOIs() // remove POIs from the camera script
        mouse = Matter.Mouse.create(render.canvas); // create mouse, mC, ball, and hole
        mouseConstraint = Matter.MouseConstraint.create(engine, { mouse: mouse, constraint: { stiffness: 1, render: { visible: true } }, collisionFilter: { mask: mouseInteractableCategory } });
        hole = new Hole(engine, json['levelData']['meta']['hole']['x'], json['levelData']['meta']['hole']['y'], json['levelData']['meta']['hole']['radius']*json['levelData']['meta']['golfBall']['radius']);
        golfBall = new GolfBall(engine, mouseConstraint, json['levelData']['meta']['golfBall']['x'], json['levelData']['meta']['golfBall']['y'], json['levelData']['meta']['golfBall']['radius'], json['levelData']['meta']['golfBall']['anchorPadding']);
        

        //Matter.Composite.add(special, [hole, golfBall])

        camera.addPOI(golfBall);
        camera.addPOI(golfBall.anchor);
        camera.addPOI(hole);
    } //else {
        //golfBall
    //}
    
    // load static objects, and force them to be static
    for (let staticObject in json['levelData']['staticObjects']) {
        let sO = json['levelData']['staticObjects'][staticObject]; let newBody = loadBodyFromJSON(sO, true, null, {category: nonInteractable});
        Matter.World.add(world, newBody)
    }

    // load physics objects
    for (let physicObject in json['levelData']['physicsObjects']) {
        let pO = json['levelData']['physicsObjects'][physicObject]; let newBody = loadBodyFromJSON(pO, false, null, {category: nonInteractable});
        Matter.World.add(world, newBody)
    }

    return {"ball": golfBall, "hole": hole, "mouse": mouse, "mC": mouseConstraint}
}