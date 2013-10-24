<script type="x-shader/x-vertex" >

varying vec2 vUv;
//varying vec3 vColor;
varying float vId;
varying float vX;

varying vec2 vPos;

uniform float id;
uniform sampler2D texture;

attribute float pos;


void main() {

    //vUv = uv;
    vX = (position.x+1.0)/2.0;

    vPos.x = position.z>0.0?1.0:0.0;
    vPos.y = pos;

    int myId = int(id);
    vId = id;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position.x, position.y, position.z/* *(cos(rad*2.0)+1.0)*/, 1.0 );

}

</script>