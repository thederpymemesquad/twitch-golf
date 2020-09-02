class Hole extends BodyPOI {
    constructor(eng, x, y, radius) {
        super();
        this.e = eng;
        this.radius = radius;

        this.body = Matter.Bodies.circle(x, y, radius, {isStatic: true, isSensor: true});
        this.body.plugin.undeletable = true
        this.camera_body = this.body;
        Matter.World.add(this.e.world, this.body);
    }

    position() {
        return this.body.position;
    }
}