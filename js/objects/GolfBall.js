/*
Base object that is the standard golf ball
*/

class GolfBall extends BodyPOI {
    constructor(engine, mouseConstraint, x, y, radius, anchorPadding) {
        super();
        this.e = engine;
        this.m = mouseConstraint;
        this.mCBaseStiffness = this.m.stiffness;
        this.radius = radius;
        this.anchorPadding = anchorPadding;
        this.collisionFilters = {
            defaultCategory: 0x0001,
            nonInteractable: 0x0002,
            mouseInteractableCategory: 0x0004,
            drag_nocollide: {
                category: 4,
                mask: 4294967295
            },
            nodrag_nocollide: {
                category: 0x0001,
                mask: 0x0004,
                group:0
            },
            nodrag_collide: {
                category: 0x0002,
                mask: 0x0002,
                group: 0
            }
        };

        this.collider = Matter.Bodies.circle(x, y, radius, {
            density: 0.01,
            friction: 0,
            frictionAir: 0.01,
            frictionStatic: 0,
            restitution: 0.9,
            label: "golf-ball-collider",
            collisionFilter: {
                category: this.collisionFilters.mouseInteractableCategory,
                mask: this.collisionFilters.mouseInteractableCategory
            },
            render: {
                visible: true,
                fillStyle: "#fff"
            }
        });
        this.collider.plugin.undeletable = true
        this.sensor = Matter.Bodies.circle(x, y, radius/2, {
            isSensor: true,
            //restitution: 0.9,
            mass: 0,
            friction: 0,
            frictionAir: 0.01,
            frictionStatic: 0,
            label: "golf-ball-sensor",
            render: {
                opacity: 1,
                visible: true,
                fillStyle: "#ffffffff",
                strokeStyle: "#000"
            },
            collisionFilter: {
                category: this.collisionFilters.nonInteractable | this.collisionFilters.defaultCategory | this.collisionFilters.mouseInteractableCategory
            }
        });
        this.sensor.plugin.undeletable = true
        this.body = Matter.Body.create({
            frictionAir: 0.01,
            frictionStatic: 0,
            friction: 0,
            restitution: 1,
            parts: [
                this.collider,
                this.sensor
            ],
            collisionFilter: {
                category: this.collisionFilters.mouseInteractableCategory
            },
            render: {
                fillStyle: "#fff"
            }
        });
        this.body.plugin.undeletable = true
        this.anchor = new GolfBallAnchor(this.e, x, y, radius+anchorPadding, this, {category: this.collisionFilters.nonInteractable}, 0.0025);

        this.waitingForRelease = false;
        //this.inAnchor = true;
        this.waitingForBallToStop = false;
        this.mouseIsHoldingObject = false;
        this.ballState = "";
        this.inHole = false;

        Matter.World.add(this.e.world, this.body)
        this.__postInit(this.body);
    }

    setCollisionFilter(filter) {
        this.collider.collisionFilter = filter;
        //this.sensor.collisionFilter = filter;
        this.body.collisionFilter = filter;
    }

    isHeldByMouse() {
        var m = this.m.body;
        return (this.m.mouse.button === 0 && (m == this.body || m == this.collider || m == this.sensor));
    }

    updateSleeping() {
        Matter.Sleeping.update([this.sensor, this.body, this.collider], this.e.timing.timeScale);
    }

    position() {
        return {x: this.body.position.x, y: this.body.position.y}
    }

    isInAnchor() {
        return (common.distance(this.body.position, this.anchor.innerCollider.position) < this.anchor.radius*1.5)
    }

    isInHole(hole) {
        return common.distance(this.position(), hole.position()) < (this.radius*1.25);
    }

    setPosition(position) {
        Matter.Body.setPosition(this.collider, position)
        Matter.Body.setPosition(this.sensor, position)
        Matter.Body.setPosition(this.body, position)
    }

    isSleeping() {
        return (this.body.isSleeping);
    }

    afterUpdate(h) {
        this.updateSleeping(engine);

        if (this.isInHole(h) && !this.isHeldByMouse() && !this.inHole) {
            logSystemMessage("ball in hole")
            Matter.Body.setPosition(golfBall.body, hole.position());
            Matter.Body.setPosition(this.anchor.innerCollider, common.c(this.body.position.x, this.body.position.y));
            this.anchor.attachBall();
            this.anchor.elastic.render.visible = true;
            this.inHole = true;
            //stop();
            return;
        }

        
    
        if (this.isHeldByMouse()) {
            this.anchor.elastic.render.visible = true;
            this.m.constraint.pointB = {x: 0, y: 0};

            
        } else {
            this.anchor.elastic.render.visible = false;
        }

        if (this.isInAnchor()) {
            if (this.waitingForRelease) {
                this.anchor.elastic.render.strokeStyle = "#00ff00ff";
                if (this.isHeldByMouse()) {
                    this.setCollisionFilter(this.collisionFilters.nodrag_nocollide);
                    this.waitingForRelease = false; 
                    this.anchor.innerCollider.render.opacity = 1;
                    
                    //updateStiffness(this.body, this.anchor.innerCollider, mouseConstraint.constraint)
                    this.ballState = "ball in box, but user has grabbed it";
                } else {
                    this.setCollisionFilter(this.collisionFilters.nodrag_collide);
                    this.waitingForRelease = false;
                    this.waitingForBallToStop = true;
                    this.anchor.detachBall();
                    this.anchor.elastic.render.visible = false;
                    
                    console.debug("ball launched")
                    this.ballState = "ball has been launched";
                }
            } else {
                this.anchor.elastic.render.strokeStyle = "#ff0000ff";
                if (this.isHeldByMouse()) {
                    this.setCollisionFilter(this.collisionFilters.nodrag_nocollide);
                    //updateStiffness(this.body, this.anchor.innerCollider, mouseConstraint.constraint)
                    this.ballState = "ball in box, but user has grabbed it";
                } else {
                    if (this.waitingForBallToStop) {
                        if (this.isSleeping()) {
                            Matter.Body.setPosition(this.anchor.innerCollider, common.c(this.body.position.x, this.body.position.y));
                            this.anchor.attachBall();
                            this.anchor.elastic.render.visible = true;
                            this.setCollisionFilter(this.collisionFilters.drag_nocollide);
                            this.waitingForBallToStop = false;

                            this.ballState = "ball was launched, but landed in anchor, updated anchor positon";
                        } else {
                            this.ballState = "ball was launched, but is still inside anchor";
                        }
                    } else {
                        if (!this.isSleeping()) {
                            this.anchor.setStiffness(1);
                            Matter.Body.setPosition(this.body, this.anchor.innerCollider.position);
                            Matter.Sleeping.set(this.body, true);
                            Matter.Sleeping.set(this.collider, true);
                            Matter.Sleeping.set(this.sensor, true);
                            this.setCollisionFilter(this.collisionFilters.drag_nocollide);
        
                            this.ballState = "user released inside anchor, returning to center";
                        } else {
                            this.anchor.setStiffness("base");
                            this.setCollisionFilter(this.collisionFilters.drag_nocollide);
                            this.ballState = "ball is idle in anchor";
                        }
                    }
                    
                }
            }
        } else {
            if (this.waitingForRelease) {
                this.anchor.elastic.render.strokeStyle = "#00ff00ff";
                if (this.isHeldByMouse()) {
                    //mouseConstraint.constraint.stiffness = updateStiffness(this.body, this.anchor.innerCollider)
                    this.anchor.setStiffness("base");
                    this.ballState = "waiting for user to release ball to launch";
                } else  {
                    this.anchor.setStiffness("base");
                    this.setCollisionFilter(this.collisionFilters.nodrag_nocollide)
                    this.ballState = "user has released ball, waiting for it to reach anchor";
                }
            } else {
                this.anchor.elastic.render.strokeStyle = "#ff0000ff";
                if (this.isHeldByMouse()) {
                    this.waitingForRelease = true;
                    //this.anchor.innerCollider.render.opacity = 0;
                    //this.setCollisionFilter(this.collisionFilters.drag_nocollide);
                    this.m.constraint.stiffness = updateStiffness(this.body, this.anchor.innerCollider);
    
                    this.ballState = "ball has just been dragged out of the anchor";
                    //console.log(this.ballState);
                } else {
                    if (this.waitingForBallToStop) {
                        if (this.isSleeping()) {
                            Matter.Body.setPosition(this.anchor.innerCollider, common.c(this.body.position.x, this.body.position.y));
                            this.anchor.attachBall();
                            this.anchor.elastic.render.visible = true;
                            this.setCollisionFilter(this.collisionFilters.drag_nocollide);
                            this.waitingForBallToStop = false;
    
                            this.ballState = "ball has just stopped, updated anchor position";
                        } else {
                            this.ballState = "waiting for the ball to stop to update anchor";
                        }
                    } else {
                        this.ballState = "? !rIB, !mIHO, !wFR, !wFRTS";
                        console.debug("got unknown predictd ball state of '" + this.ballState + "'");
                    }
                }
            }
        }

        if (LevelEditorInstance.userOptions.enabled) {
            this.setCollisionFilter(this.collisionFilters.nodrag_nocollide);
        }
    }
}