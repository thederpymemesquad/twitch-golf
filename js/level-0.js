class level_0 extends BaseLevel {
    constructor(golf_ball, ball_hole) {
        super();

        this.hole.position = c(0,0)
        this.ball.position = c(0,0)

        Matter.Body.setPosition(golf_ball, this.ball.position)
        Matter.Body.setPosition(ball_hole, this.hole.position)
    }
}