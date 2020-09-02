/*
A modified trigger zone that prevents the golf ball from 'dying'

Safe Area and Death Zone Priorities:
Safe Areas and Death Zones have a priority value (a `Number`) that
is used to check if a golf ball should 'die'. When the golf ball
checks the value of all zones it is currently in, it adds all of the 
safe area values, then subtracts the death zone values. If the value
is `<= 0`, the golf ball will 'die'. This may sound complicated, but
an example might help explain it.

A level should contain at least 1 safe area, that would cover the
whole map. you could also have multiple that make a shape, but for
the sake of this example, there is just 1 large square safe area
that covers the map. Lets say this level has a thin bridge the ball
must cross to reach the hole. There are 2 ways you could make it
'fall'. You could use 2 death zones, one on each side of the bridge,
or you could use 1 death zone covering both areas the previous 2
would cover, and have a safe area covering the bridge. Note that the
collision used for trigger zones is based on the balls sensor object,
which is half the size of the entire golf ball (radius / 2).

*/