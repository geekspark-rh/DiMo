
#define PI2 6.283185
#define PI  3.141592
#define HPI 1.57080
#define B_ADD 1.76714
#define G_ADD 3.92699
#define R_ADD 5.89048

uniform vec3 color;
uniform sampler2D texture;

uniform float max_vel;
uniform float max_accel;

varying vec3 vel;
varying vec3 vColor;
varying float vel_m;
varying float accel_m;

vec3 newcolor;
vec3 inactive_color = vec3(0.6, 0.6, 0.6);
vec3 color_cycle_add = vec3(R_ADD, G_ADD, B_ADD);

void main() {

    // R = (sin(accel_m*pi*2+2.25*pi/4)+1)/2
    // G = (sin(accel_m*pi*2+5*pi/4)+1)/2
    // B = (sin(accel_m*pi*2+7.5*pi/4)+1)/2

    newcolor = vec3(vel_m/max_vel+accel_m/max_accel, vel_m/max_vel+accel_m/max_accel, vel_m/max_vel+accel_m/max_accel);
    /* newcolor = vec3(accel_m/max_accel, accel_m/max_accel, accel_m/max_accel); */
    /* newcolor = vec3(vel_m/max_vel, vel_m/max_vel, vel_m/max_vel); */
    newcolor *= PI2;
    newcolor += color_cycle_add;
    newcolor = sin(newcolor);
    newcolor += 1.0;
    newcolor /= 2.0;

    /* newcolor = vec3(accel_m*max_accel, accel_m*max_accel * PI, accel_m*max_accel * PI2); */
    /* newcolor *= PI2; */
    /* newcolor = sin(newcolor); */
    /* newcolor += inactive_color; */

    gl_FragColor = vec4(newcolor, 1.0) * texture2D( texture, gl_PointCoord );;
    /* gl_FragColor = vec4( color * vColor * vec3(accel_m / 1.0, accel_m / 2.0, accel_m / 3.0), 1.0 ) * texture2D( texture, gl_PointCoord );; */
    /* gl_FragColor = vec4( 1.0, 1.0, 1.0, 0.7 ) * texture2D( texture, gl_PointCoord ); */

}
