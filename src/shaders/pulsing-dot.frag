
uniform vec3 color;
uniform sampler2D texture;

varying vec3 vel;
varying vec3 vColor;

void main() {

    float v = sqrt(pow(vel.x, 2.0) + pow(vel.y, 2.0));

    gl_FragColor = vec4( v* color * vColor, 1.0 );

    /* gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord ); */

}


