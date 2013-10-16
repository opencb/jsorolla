<script type="x-shader/x-vertex" >

  uniform float rangeStart;
  uniform float range;
  uniform float angularLong;
  uniform float radius;




  void main() {

      float rad = radius + position.y;
      float angle = ((position.x-rangeStart)/range);         // angle = ((pos.x-rangeStart))/range;        // [0-range]

      if(angle < 0.0){

          angle = 0.0;

      } else if(angle > 1.0) {

          angle = 1.0;

      }
      angle = angle*angularLong;  //    angle = angle*angularLong+phase;
      vec4 pos = vec4(cos(angle)*rad, sin(angle)*rad, position.z, 1.0);
//      pos.x = cos(angle)*rad;
//      pos.y = sin(angle)*rad;

      gl_Position = projectionMatrix * modelViewMatrix * pos;

  }

</script>