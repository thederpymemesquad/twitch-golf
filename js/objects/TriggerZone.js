/*

*/

class TriggerZone {
    /**
     * An area that triggers an event when the golf ball enters and exits it. Can
     * be used to create areas that effect the ball in specific ways, or to create
     * areas that trigger something such as a door to open
     * @param {Matter.Body} body
     */
    constructor(body) {      
        this.body = body;
        this.body.isSensor = true;
        this.body.isStatic = true;
        this.collidingObjects = [];

        

        Events.on(engine, 'collisionStart', function(event) {
            this.collisionStart(event);
        });

        Events.on(engine, 'collisionEnd', function(event) {
            this.collisionEnd(event);
        });
    }

    collisionEnd(event) {
        var pairs = event.pairs;
        
        for (var i = 0, j = pairs.length; i != j; ++i) {
            var pair = pairs[i];

            if (pair.bodyA === this.ball || pair.bodyB  === this.ball) {
                this.onBallExit();
            }
        }
    }

    onBallExit() {
        respawnBallAtLastAnchor()
    }

    collisionStart(event) {
        var pairs = event.pairs;
        
        for (var i = 0, j = pairs.length; i != j; ++i) {
            var pair = pairs[i];

            if (pair.bodyA === this.ball || pair.bodyB  === this.ball) {
                this.onBallEnter();
            }
        }
    }

    onBallEnter() {
        return;
    }
}