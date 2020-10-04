// ---------------------------------------------------------------------------

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.set(80, 30, 80);
var controls = new THREE.OrbitControls( camera );
controls.update();
// ---------------------------------------------------------------------------

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor( 0x77AAFF);


// ---------------------------------------------------------------------------

var entities = []

class Entity extends THREE.Object3D{

  constructor() {
    super();
  }

  update() {
  }

  reset() {
  }
}

// ---------------------------------------------------------------------------

class WaterSurface extends Entity{
    constructor(parent) {
        super();
        this.size = 128;
        this.waves = true;

		var color = new THREE.Color();
        this.geometry = new THREE.PlaneBufferGeometry( this.size, this.size, this.size, this.size );
        this.geometry.rotateX( - Math.PI / 2 );

        var positions = this.geometry.attributes.position;
        var vertex = new THREE.Vector3();
        var colors = [];

		this.floorMaterial=new THREE.MeshPhongMaterial( {
                                        color: 0x3377FF,
                                        specular: 0xFFFFFF,
                                        shininess: 96,
                                        flatShading: true,
                                        transparent: true,
                                        opacity: 0.9,
                                        // wireframe: true,
                                    } );

        // this.floorMaterial.shading = THREE.FlatShading;
        this.mesh = new THREE.Mesh( this.geometry, this.floorMaterial );
        this.mesh.receiveShadow = true;
        this.mesh.castShadow = false;

        this.speed = 0.001;

        this.add( this.mesh );
        parent.add(this);
    }

    update() {
        super.update();

        if ( this.waves ) {

            var positions = this.geometry.attributes.position;
            var vertex = new THREE.Vector3();

            for ( var x = 0; x < this.size+1; x++ ) {

                for ( var y = 0; y < this.size+1; y++ ) {

                    var pos = ( x * (this.size+1) ) + y;

              	   vertex.fromBufferAttribute( positions, pos );
                    var time = Date.now() * this.speed;
                    vertex.y = 0;

                    vertex.y += 2.70 * Math.sin ( ( 0.170 * x ) + (time * 1)) * 0.125;
                    vertex.y += 0.40 * Math.sin ( ( 0.410 * x ) + (time * 3)) * 0.125;
                    vertex.y += 0.15 * Math.sin ( ( 0.710 * x ) + (time * 5)) * 0.125;

                    vertex.y += 2.5 * Math.sin ( ( 0.150 * y ) + ( time * 1.7 ) ) * 0.125;
                    vertex.y += 0.4 * Math.sin ( ( 0.500 * y ) + ( time * 2.3 )) * 0.125;
                    vertex.y += 0.1 * Math.sin ( ( 0.800 * y ) + ( time * 4.1 ) ) * 0.125;

                	positions.setXYZ( pos, vertex.x, vertex.y, vertex.z );
                }
            }

            this.geometry.attributes.position.needsUpdate = true;
        }
    }
}

// ---------------------------------------------------------------------------

// const heights = [0,
//                 10,
//                 20,
//                 30,
//                 40,
//                 50,
//                 60]
//
// const colors = [rgb(255, 222, 173),   // sandy - underwater
//                 rgb(255, 236, 139),   // light goldenrod
//                 rgb(34, 139, 34),      // forest green
//                 rgb(142, 142, 56),    // olive drab
//                 rgb(128, 128, 128),   // grey
//                 rgb(255, 250, 250)   // snow
//                 ]

// ---------------------------------------------------------------------------

class Volcano extends Entity {
    constructor(parent, geometry, size, parts, rate) {
        super();
        this.geometry = geometry;
        this.size = size;

        this.particles = parts;
        this.rate = rate;

        this.n=0;

        this.x1 = this.size * 0.25;
        this.x2 = ((Math.random() * this.size) + (Math.random() * this.size))/2;

        this.z1 = this.size * 0.25;
        this.z2 = ((Math.random() * this.size) + (Math.random() * this.size))/2;
        parent.add(this);
    }

    generate(centre) {

        var positions = this.geometry.attributes.position;
        var vertex = new THREE.Vector3();
        var increment = this.rate;
        var minvel = 0.5 + Math.random();

        if (this.n<this.particles)
        {
            while ( increment > 0 )
            {
                increment--;
                this.n++;

                var angle = (( Math.random() *  Math.PI/2) + ( Math.random() *  Math.PI/2)) /3;
                var direction = Math.random() * ( 2 * Math.PI);
                var velocity = minvel + (Math.random() * 2);

                // DISTANCE CALCULATION FROM https://keisan.casio.com/exec/system/1225079475
                var distance = ( (velocity * velocity) * Math.sin( 2 * angle ) ) / 10;

                // COORDINATES CALCULATION FROM https://www.theclassroom.com/coordinates-distances-angles-2732.html
                // soh, cah, toa

                var deltax = Math.sin(direction) * distance;
                var deltaz = Math.cos(direction) * distance;

                // console.log(deltax, deltaz);

                var coords = new THREE.Vector3();
                coords.x = Math.floor(centre.x + (deltax * (this.size * 0.5)));
                coords.z = Math.floor(centre.z + (deltaz * (this.size * 0.5)));

                var meshVertexIndex = ( coords.x * (this.size +1) ) + coords.z;

                var meshVertex = new THREE.Vector3();
                meshVertex.fromBufferAttribute( positions, meshVertexIndex );
                // meshVertex.x =   coords.x;
                meshVertex.y += 0.01;
                // meshVertex.z = coords.z;

                positions.setXYZ( meshVertexIndex, meshVertex.x, meshVertex.y, meshVertex.z );
                this.geometry.attributes.position.needsUpdate = true;
            }
        }
    }

    update() {
        super.update();
        this.generate(new THREE.Vector3(this.x2, 0, this.z2) );

    }
}

class OceanBed extends Entity {
    constructor(parent, size) {
        super();
        this.size = size;

        this.voffset = -5;

        this.position.x = 0;
        this.position.y = this.voffset;
        this.position.z = 0;

        var color = new THREE.Color();
        this.geometry = new THREE.PlaneBufferGeometry( this.size, this.size, this.size, this.size );
        this.geometry.rotateX( - Math.PI / 2 );

        // this.material = new THREE.MeshBasicMaterial( {
        //                               color: 0xf0f0f0,
        //                               shading: THREE.FlatShading,
        //                               vertexColors: THREE.VertexColors,

        this.material=new THREE.MeshPhongMaterial( {
                                        color: 0x007700,
                                        specular: 0x003300,
                                        shininess: 1,
                                        flatShading: true,
                                        transparent: false,
                                        // wireframe: true,
                                    } );

        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.receiveShadow = true;
        this.mesh.castShadow = true;

        this.add( this.mesh );
        parent.add(this);
    }

    update() {
        super.update();
        this.position.y = this.voffset;
    }
}

// ---------------------------------------------------------------------------

class AmbientLightEntity extends Entity{
  constructor(c) {
        super()
        // this.color = c;
        // this.light = new THREE.AmbientLight( this.color );

        // var lightHelper = new THREE.AmbientlLightHelper( this.light, 5 );
        // scene.add(lightHelper)

        this.add( this.light );
        scene.add( this );
  }
}

// ---------------------------------------------------------------------------

class Sun extends Entity{
  constructor(parent, c=0xFFFFAA, s=true) {
        super()

        this.light = new THREE.DirectionalLight( c, 1 );

        this.light.castShadow = s;            // default false

        this.light.shadow.mapSize.width = 256;
        this.light.shadow.mapSize.height = 256;

        this.light.shadow.camera.near = 400;    // default
        this.light.shadow.camera.far = 600;     // default

        this.light.shadow.camera.left     = -100;
        this.light.shadow.camera.right    =  100;
        this.light.shadow.camera.top      =  100;
        this.light.shadow.camera.bottom   = -100;
        this.light.shadowDarkness = 0.5;

        // var directionalLightHelper = new THREE.DirectionalLightHelper( this.light, 5 );
        // scene.add(directionalLightHelper)
        // var shadowHelper = new THREE.CameraHelper( this.light.shadow.camera );
        // scene.add( shadowHelper );

        this.light.add( new THREE.Mesh(
                            new THREE.SphereBufferGeometry( 40, 8, 8 ),
                            new THREE.MeshBasicMaterial( { color: 0xFFFF00 } )
                            )
                        );

        scene.add( this.light );
        scene.add( this.light.target );

        parent.add(this);
  }

  update() {
      var time = Date.now() * 0.001;
      this.light.position.set(
                            0,
                            500 * Math.sin ( time * 1/4),
                            500 * Math.cos ( time * 1/4),
                        );
  }
}

class Moon extends Entity{
  constructor(parent, c=0x3333AA, s=true) {
        super()

        this.light = new THREE.DirectionalLight( c, 1 );

        this.light.castShadow = s;            // default false

        this.light.shadow.mapSize.width = 256;
        this.light.shadow.mapSize.height = 256;

        this.light.shadow.camera.near = 400;    // default
        this.light.shadow.camera.far = 600;     // default

        this.light.shadow.camera.left     = -100;
        this.light.shadow.camera.right    =  100;
        this.light.shadow.camera.top      =  100;
        this.light.shadow.camera.bottom   = -100;
        this.light.shadowDarkness = 0.9;

        // var directionalLightHelper = new THREE.DirectionalLightHelper( this.light, 5 );
        // scene.add(directionalLightHelper)
        // var shadowHelper = new THREE.CameraHelper( this.light.shadow.camera );
        // scene.add( shadowHelper );

		this.light.add( new THREE.Mesh( new THREE.SphereBufferGeometry( 40, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );

        scene.add( this.light );
        scene.add( this.light.target );

        parent.add(this);
  }

  update() {
      var time = Date.now() * 0.001;
      this.light.position.set(
                            0,
                            -500 * Math.sin ( time * 1/4),
                            -500 * Math.cos ( time * 1/4),
                        );
  }
}


// ---------------------------------------------------------------------------

var oceanBed = new OceanBed(scene, 128);
entities.push(oceanBed);

var m = 12;
for (var c = 1; c < m; c++)
{
    entities.push(new Volcano(scene, oceanBed.geometry, 128, c*100000, (c*100000) / 100));
}

var surface = new WaterSurface(scene);
entities.push(surface);

var sun = new Sun(scene);
entities.push(sun);

var moon = new Moon(scene);
entities.push(moon);

// var gui = new dat.GUI();
// this.gui.add(surface, 'waves');
// this.gui.add(surface, 'speed');
// this.gui.add(oceanBed, 'voffset');

// ---------------------------------------------------------------------------

var animate = function () {

    for (thing of entities) {
         thing.update();
     }

    controls.update();
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
};

// ---------------------------------------------------------------------------

animate();
