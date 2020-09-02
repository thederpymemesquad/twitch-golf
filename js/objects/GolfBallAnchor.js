class GolfBallAnchor extends BodyPOI {
    constructor(engine, x, y, radius, ball, collisionFilter, elasticBaseStiffness) {
        super();
        this.e = engine
        this.radius = radius;
        this.ball = ball;
        this.baseStiffness = elasticBaseStiffness;
        this.ballAttached = true;
        this.innerCollider = Matter.Bodies.circle(x, y, radius, {
            isStatic: true,
            isSensor: true,
            collisionFilter: collisionFilter,
            render: {
                fillStyle: '#ffffff55'
            }
        });
        this.innerCollider.plugin.undeletable = true

        /*this.outerCollider = Matter.Bodies.circle(x, y, radius*2, {
            isSensor: true,
            isStatic: true,
            collisionFilter: collisionFilter,
            render: {
                fillStyle: "#ffffff22"
            }
        });*/
        this.outerCollider = null
        //this.outerCollider.plugin.undeletable = true

        this.elastic = Matter.Constraint.create({
            bodyA: this.innerCollider,
            bodyB: this.ball.body,
            stiffness: elasticBaseStiffness,
            render: {
                type: "line",
                anchors: true
            },
            collisionFilter: {
                category: this.ball.collisionFilters.nonInteractable
            }
        });
        this.elastic.plugin.undeletable = true
        this.__postInit(this.innerCollider)

        Matter.World.add(this.e.world, [this.innerCollider, this.elastic]);
    }

    moveAnchor(position, snapBallToAnchor) {
        Matter.Body.setPosition(this.innerCollider, position);
        Matter.Body.setPosition(this.outerCollider, position);
        if (snapBallToAnchor) {
            this.ball.setPosition(position)
        }
    }

    detachBall() {
        if (this.ballAttached) {
            this.elastic.bodyB = null;
            this.ballAttached = false;
            return true;
        }
        return false;
    }

    attachBall() {
        if (!this.ballAttached) {
            this.elastic.bodyB = this.ball.body;
            this.ballAttached = true;
            return true;
        }
        return false;
    }

    setStiffness(stiffness) {
        if (stiffness === "base") {
            if (this.elastic.stiffness != this.baseStiffness) {
                this.elastic.stiffness = this.baseStiffness;
                //console.debug("[golfBall.anchor.elastic] set stiffness to base stiffness (" + this.baseStiffness + ")");
                return true;
            } else {
                return false;
            }
        } else if (stiffness != this.elastic.stiffness) {
            this.elastic.stiffness = stiffness;
            //console.debug("[golfBall.anchor.elastic] set stiffness to " + stiffness);
            return true;
        } else {
            return false;
        }
    }
}