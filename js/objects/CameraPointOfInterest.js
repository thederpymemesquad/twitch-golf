/**
 * An object that will be tracked by the camera.
 * The camera 
 */

class BaseCameraPOI {
    constructor() {
        this.camera_bounds = {x: {min: -Infinity, max: Infinity}, y: {min: -Infinity, max: Infinity}}; // the bounds that this POI will be restricted to
        this.camera_lerp = null; // unused
        this.camera_pos = {x: 0, y: 0};
    }

    cameraPOI_position() {
        var x = common.clamp(this.camera_pos.x, this.camera_bounds.x.min, this.camera_bounds.x.max)
        var y = common.clamp(this.camera_pos.y, this.camera_bounds.y.min, this.camera_bounds.y.max)
        return {x: x, y: y};
    }
}

class PositionPOI extends BaseCameraPOI {
    constructor(position) {
        super();
        this.camera_pos = position;
    }
}

class BodyPOI extends BaseCameraPOI {
    constructor() {
        super();
    }

    __postInit(body) {
        this.camera_body = body;
        this.camera_pos = body.position;
    }

    cameraPOI_position() {
        this.camera_pos = this.camera_body.position;
        return super.cameraPOI_position()
    }
}