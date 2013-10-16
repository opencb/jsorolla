<script type="x-shader/x-fragment" >

//varying vec3 vColor;
varying vec2 vUv;
varying float vId;
varying float vX;

varying vec2 vPos;

#define NUM_PATCH 50
#define NUM_CHR 23

uniform float id;

uniform sampler2D tex;
uniform int active;
uniform vec2 coord;

uniform float selectionStart;
uniform float selectionEnd;
uniform int selected;


vec4 getValue4(sampler2D dataTex, float width, int pos){
    return texture2D(dataTex, vec2((float(pos)+0.5)/width, 0.0));
}
vec3 getValue3(sampler2D dataTex, float width, int pos){
    vec4 data = texture2D(dataTex, vec2((float(pos)+0.5)/width, 0.0));
    return vec3(data.x, data.y, data.z);
}
int getValueInt(sampler2D dataTex, float width, int pos){
    vec4 data = texture2D(dataTex, vec2((float(pos)+0.5)/width, 0.0));

    int x = int(data.x*255.0)*256*256*256;
    int y = int(data.y*255.0)*256*256;
    int z = int(data.z*255.0)*256;
    int w = int(data.w*255.0);
    return int(x + y + z + w);
}
float getValueFloat(sampler2D dataTex, float width, int pos){
    vec4 data = texture2D(dataTex, vec2((float(pos)+0.5)/width, 0.0));

    float x = data.x*255.0*256.0*256.0*256.0;
    float y = data.y*255.0*256.0*256.0;
    float z = data.z*255.0*256.0;
    float w = data.w*255.0;
    return x + y + z + w;
}

void main(void) {

    //vec4 Color = texture2D(tex, vec2((floor(vX*32.0)+0.5)/32.0, 0.0));
    //Color.w = 1.0;
    //vec4 Value = getValue4(tex, 8.0, 1);
    //
    //int variable = getValueInt(tex, 8.0, 1);
    //if(getValueInt(tex, 8.0, 1) == 20)
    //    gl_FragColor = vec4(0.0,1.0,0.0,1.0);
    //else
    //    gl_FragColor = vec4(1.0,1.0,0.0,1.0);


    if (active == 1) {
        gl_FragColor = texture2D(tex, vec2(vPos.y*(coord.y-coord.x)+coord.x, 0.0));
        /*
        gl_FragColor = texture2D(tex, vec2(vPos.y, 0.0));
        if (vPos.y < coord.y && vPos.y > coord.x) {
                if(vPos.x < 0.2 || vPos.x > 0.8){
                    gl_FragColor = vec4(1.0, 0.5, 0.0, 1.0);
            }
        }
        */
    }
     if (selected == 0) {
        gl_FragColor.r = gl_FragColor.r/2.0;
        gl_FragColor.g = gl_FragColor.g/2.0;
        gl_FragColor.b = gl_FragColor.b/2.0;
     }

    const float selection_width = 0.05;
    if (vPos.y >= selectionStart && vPos.y < selectionEnd) {
        if(vPos.x < selection_width || vPos.x > 1.0-selection_width){
            gl_FragColor = vec4(0.0, 0.7, 0.0, 1.0);
        }
    }

    //if(Value.w*255.0 - 2.0 == 0.0)
        //gl_FragColor = vec4(0.0,1.0,0.0,1.0);
    //else
        //gl_FragColor = vec4(1.0,1.0,0.0,1.0);

    //gl_FragColor = Color;
    //gl_FragColor = Value;

}

</script>