
uniform vec3 color;
uniform sampler2D texture;

varying vec3 vel;
varying vec3 vColor;

vec3 inactive_color = vec3( 0.1, 0.1, 0.1 );

void main() {

    float v = sqrt(pow(vel.x, 2.0) + pow(vel.y, 2.0));

    vec3 vel_mult = vec3( v, v, v );

    gl_FragColor = vec4( color * vColor, 1 ) * texture2D( texture, gl_PointCoord );;

}
