
attribute float size;
attribute vec3 customColor;
attribute vec3 acceleration;
attribute vec3 velocity;

varying vec3 vColor;
varying vec3 vel;

void main() {

    vColor = customColor;

    vel = velocity;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    gl_PointSize = size;

}


