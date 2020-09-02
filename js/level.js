// this file contains a base level, that can be built upon to make more advanced levels

class BaseLevel {
    constructor(golf_ball, ball_hole) {
        this.golf_ball = golf_ball
        this.ball_hole = ball_hole

        this.hole.position = c(0,0);
        this.ball.position = c(0,0);
    }

    /**
     * This event is called after the `Matter.Engine` event `afterUpdate`
     */
    customUpdate() {
        return;
    }

    /**
     * This event is called when the ball enteres the hole
     */
    onComplete() {
        return;
    }

    /**
     * This event is called when the golf ball either enters a death
     * zone, or exits all safe area, after being sent back to the last
     * anchor or level spawn
     */
    onDeath() {
        return;
    }

    /**
     * This event is called when the ball collides with an object.
     * It is only triggered from the `Matter.Engine` event `collideStart`.
     * @param {Matter.Body} object 
     */
    onBounce(object) {
        return;
    }


}