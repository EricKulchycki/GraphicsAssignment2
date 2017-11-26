////////////////////////////////////////////////////////////////////////////////

/* COMP 3490 A1
 * Eric Kulchycki
 * 7767961
 * PROF: Neil Bruce
 * 
 * 
 /*global variables, coordinates, clock etc.  */
var camera, scene, renderer;

var clock = new THREE.Clock();

var keyboard = new KeyboardState();

var base, stand1, stand2, stand3, stand4, controllerBox, baseController, handle, basetop;
var handleBall;
var frame1, frame2, frame3, frame4;
var armX, armY, box;
var claw1, claw2, claw3, claw4;

var pos = new THREE.Vector3();
var quat = new THREE.Quaternion();


// Physics variables
var collisionConfiguration;
var dispatcher;
var broadphase;
var solver;
var physicsWorld;
var terrainBody;
var dynamicObjects = [];
var transformAux1 = new Ammo.btTransform();
var heightData = null;
var ammoHeightData = null;
var time = 0;
var objectTimePeriod = 3;
var timeNextSpawn = time + objectTimePeriod;
var maxNumObjects = 30;

var gravityConstant = -300;
var rigidBodies = [];
var margin = 0.05;

function fillScene() {
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );


	var ambientLight = new THREE.AmbientLight(0xffffff, .1);
	scene.add(ambientLight);

	var pointLight = new THREE.PointLight(0xfd00f0, 2, 600);
	pointLight.position.x = -75;
	pointLight.position.y = 790;
	pointLight.position.z = 0;
	scene.add(pointLight);

	var pointLightTwoReturnOfThePointLight = new THREE.PointLight(0x0000ff, 2, 600);
	pointLightTwoReturnOfThePointLight.position.x = 75;
	pointLightTwoReturnOfThePointLight.position.y = 790;
	pointLightTwoReturnOfThePointLight.position.z = 0;
	scene.add(pointLightTwoReturnOfThePointLight);

	var roomLight = new THREE.PointLight(0xffffff, 2, 2000);
	roomLight.position.x = 600;
	roomLight.position.y = 2000;
	roomLight.position.z = 300;
	scene.add(roomLight);

	var buttonLight1 = new THREE.PointLight(0xffffff, 2, 5);
	buttonLight1.position.x = 30;
	buttonLight1.position.y = 404;
	buttonLight1.position.z = 175;
	scene.add(buttonLight1);

	var buttonLight2 = new THREE.PointLight(0xffffff, 2, 5);
	buttonLight2.position.x = -30;
	buttonLight2.position.y = 404;
	buttonLight2.position.z = 175;
	scene.add(buttonLight2);

//A simple grid floor, the variables hint at the plane that this lies within
// Later on we might install new flooring.
//  var gridXZ = new THREE.GridHelper(2000, 100, new THREE.Color(0xCCCCCC), new THREE.Color(0x888888));
//  scene.add(gridXZ);

 //Visualize the Axes - Useful for debugging, can turn this off if desired
//  var axes = new THREE.AxisHelper(150);
//  axes.position.y = 1;
//  scene.add(axes);

 drawClawMachine();
}

function drawClawMachine() {

	//////////////////////////////
	// Some simple material definitions - This may become more complex in A2

	var bodyMaterial = new THREE.MeshLambertMaterial();
	bodyMaterial.color.setRGB( 0.5, 0.5, 0.5 );

	var controllerBoxMaterial = new THREE.MeshPhongMaterial({color: 0x00091e});
	var handleMaterial = new THREE.MeshPhongMaterial({color: 0xeded1e});
	var handleBallMaterial = new THREE.MeshPhongMaterial({color: 0xff0000});



	// This is where the model gets created. Add the appropriate geometry to create your machine
	// You are not limited to using BoxGeometry, and likely want to use other types of geometry for pieces of your submission
	// Note that the actual shape, size and other factors are up to you, provided constraints listed in the assignment description are met


 	//The base
	var baseMaterial = new THREE.MeshLambertMaterial( {color: 0x6c6c6c} );

	//Trying to make some textures. It's not going well.
	var wood = new THREE.TextureLoader().load( "textures/wood2.jpg");
	 basetop = new THREE.MeshLambertMaterial( { map: wood } );

	var solar = new THREE.TextureLoader().load( "textures/posts.jpg");
	var postTexture = new THREE.MeshLambertMaterial( { map: solar } );


	// base = new THREE.Mesh(new THREE.BoxGeometry( 300, 400, 300 ), basetop);
	// base.position.x = 0;
	// base.position.y = 200;
	// base.position.z = 0;
	// scene.add( base );

	// 4 supporting arms--------------------------------------------------------
	stand1 = new THREE.Mesh(
	new THREE.BoxGeometry( 25, 400, 25 ), postTexture );
	stand1.position.x = -137.5;
	stand1.position.y = 600;
	stand1.position.z = -137.5;
	scene.add( stand1 );

	stand2 = new THREE.Mesh(new THREE.BoxGeometry(25, 400, 25), postTexture);
	stand2.position.x = 137.5;
	stand2.position.y = 600;
	stand2.position.z = 137.5;
	scene.add(stand2);

	stand3 = new THREE.Mesh(new THREE.BoxGeometry(25, 400, 25), postTexture);
	stand3.position.x = 137.5;
	stand3.position.y = 600;
	stand3.position.z = -137.5;
	scene.add(stand3);

	stand4 = new THREE.Mesh(new THREE.BoxGeometry(25, 400, 25), postTexture);
	stand4.position.x = -137.5;
	stand4.position.y = 600;
	stand4.position.z = 137.5;
	scene.add(stand4);
	//--------------------------------------------------------------------------

	//Frame for the claw -------------------------------------------------------
	frame1 = new THREE.Mesh(new THREE.BoxGeometry(10.5, 10.5, 250), baseMaterial);
	frame1.position.x = -132;
	frame1.position.y = 780;
	frame1.position.z = 0;
	scene.add(frame1);

	frame2 = new THREE.Mesh(new THREE.BoxGeometry(10.5, 10.5, 250), baseMaterial);
	frame2.position.x = 132;
	frame2.position.y = 780;
	frame2.position.z = 0;
	scene.add(frame2);

	frame3 = new THREE.Mesh(new THREE.BoxGeometry(250, 10.5, 10.5), baseMaterial);
	frame3.position.x = 0;
	frame3.position.y = 780;
	frame3.position.z = -132;
	scene.add(frame3);

	frame4 = new THREE.Mesh(new THREE.BoxGeometry(250, 10.5, 10.5), baseMaterial);
	frame4.position.x = 0;
	frame4.position.y = 780;
	frame4.position.z = 132;
	scene.add(frame4);
	//--------------------------------------------------------------------------

	//Arms that supports the claw -----------------------------------------------

	armZ = new THREE.Mesh(new THREE.BoxGeometry(10,10,250), controllerBoxMaterial);
	armZ.position.x = 0;
	armZ.position.y = 780;
	armZ.position.z = 0;
	scene.add(armZ);

	box = new THREE.Mesh(new THREE.BoxGeometry( 50, 50, 50), controllerBoxMaterial);
	box.position.x = 0;
	box.position.y = 0;
	box.position.z = 0;

	armZ.add(box);

	//--------------------------------------------------------------------------

	var wood3 = new THREE.TextureLoader().load( "textures/wood3.jpg");
	var boxTopMaterial = new THREE.MeshLambertMaterial( { map: wood3 } );
	
	boxTop = new THREE.Mesh(new THREE.BoxGeometry(300, 25, 300), boxTopMaterial);
	boxTop.position.x = 0;
	boxTop.position.y = 812.5;
	boxTop.position.z = 0;
	scene.add(boxTop);

	//var controllerBoxMaterial = new THREE.MeshBasicMaterial({color: 0x00091e});
	controllerBox = new THREE.Mesh(new THREE.BoxGeometry(100, 200, 50), postTexture);
	controllerBox.position.x = 0;
	controllerBox.position.y = 300;
	controllerBox.position.z = 175;
	scene.add(controllerBox);

	var baseBoxMaterial = new THREE.MeshLambertMaterial({color: 0x000000});
	baseController = new THREE.Mesh(new THREE.BoxGeometry(25,5,25), baseBoxMaterial);
	baseController.position.x = 0;
	baseController.position.y = 400;
	baseController.position.z = 175;
	scene.add(baseController);

	var cylinderGeometry = new THREE.CylinderGeometry(3, 3, 40, 32);
	handle = new THREE.Mesh(cylinderGeometry, handleMaterial);
	handle.position.x = 0;
	handle.position.y = 420;
	handle.position.z = 175;
	scene.add(handle);

	//var sphereGeometry = new THREE.sphereGeometry(10, 32, 32);

	handleBall = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), handleBallMaterial);
	handleBall.position.x = 0;
	handleBall.position.y = 440;
	handleBall.position.z = 175;
	scene.add(handleBall);

	var button = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 5, 32), handleMaterial);
	button.position.x = 30;
	button.position.y = 400;
	button.position.z = 175;
	scene.add(button);

	var button2 = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 5, 32), handleBallMaterial);
	button2.position.x = -30;
	button2.position.y = 400;
	button2.position.z = 175;
	scene.add(button2);

	//claw definition ----------------------------------------------------------

	var clawMaterial = new THREE.MeshLambertMaterial({color: 0x333333});

	clawBar = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 110, 32), clawMaterial);
	clawBar.position.x = 0;
	clawBar.position.y = 730;
	clawBar.position.z = 0;
	scene.add(clawBar);

	claw1 = new THREE.Mesh(new THREE.BoxGeometry(50, 5, 15), clawMaterial);
	claw1.position.x = 25;
	claw1.position.y = 675;
	claw1.position.z = 0;
	scene.add(claw1);
	var claw12 = new THREE.Mesh(new THREE.BoxGeometry(7, 15, 15), clawMaterial);
	claw12.position.x = 25;
	claw12.position.y = -5;
	claw12.position.z = 0;
	shape3314 = new Ammo.btBoxShape(new Ammo.btVector3(15 * .5, 15 * .5, 7 * .5));
	shape3314.setMargin( margin );

	var mass3314 = 0;
	var localInertia3314 = new Ammo.btVector3( 0, 0, 0 );
	shape3314.calculateLocalInertia( mass3314, localInertia3314 );
	var transform3314 = new Ammo.btTransform();
	transform3314.setIdentity();
	var pos3314 = claw12.position;
	transform3314.setOrigin( new Ammo.btVector3( pos3314.x, pos3314.y, pos3314.z ) );
	var motionState3314 = new Ammo.btDefaultMotionState( transform3314 );
	var rbInfo3314 = new Ammo.btRigidBodyConstructionInfo( mass3314, motionState3314, shape3314, localInertia3314 );
	var body3314 = new Ammo.btRigidBody( rbInfo3314 );

	claw12.userData.physicsBody = body3314;
	claw12.receiveShadow = true;
	claw12.castShadow = true;
	claw1.add( claw12 );
	dynamicObjects.push( claw12 );
	physicsWorld.addRigidBody( body3314);


	//Claw 2
	claw2 = new THREE.Mesh(new THREE.BoxGeometry(50, 5, 15), clawMaterial);
	claw2.position.x = -25;
	claw2.position.y = 675;
	claw2.position.z = 0;
	scene.add(claw2);
	var claw22 = new THREE.Mesh(new THREE.BoxGeometry(7, 15, 15), clawMaterial);
	claw22.position.x = -25;
	claw22.position.y = -5;
	claw22.position.z = 0;
	shape3313 = new Ammo.btBoxShape(new Ammo.btVector3(15 * .5, 15 * .5, 7 * .5));
	shape3313.setMargin( margin );

	var mass3313 = 0;
	var localInertia3313 = new Ammo.btVector3( 0, 0, 0 );
	shape3313.calculateLocalInertia( mass3313, localInertia3313 );
	var transform3313 = new Ammo.btTransform();
	transform3313.setIdentity();
	var pos3313 = claw22.position;
	transform3313.setOrigin( new Ammo.btVector3( pos3313.x, pos3313.y, pos3313.z ) );
	var motionState3313 = new Ammo.btDefaultMotionState( transform3313 );
	var rbInfo3313 = new Ammo.btRigidBodyConstructionInfo( mass3313, motionState3313, shape3313, localInertia3313 );
	var body3313 = new Ammo.btRigidBody( rbInfo3313 );

	claw22.userData.physicsBody = body3313;
	claw22.receiveShadow = true;
	claw22.castShadow = true;
	claw2.add( claw22 );
	dynamicObjects.push( claw22 );
	physicsWorld.addRigidBody( body3313);

	//Claw 3
	claw3 = new THREE.Mesh(new THREE.BoxGeometry(15, 5, 50), clawMaterial);
	claw3.position.x = 0;
	claw3.position.y = 675;
	claw3.position.z = -25;
	scene.add(claw3);
	var claw32 = new THREE.Mesh(new THREE.BoxGeometry(15, 15, 7), clawMaterial);
	claw32.position.x = 0;
	claw32.position.y = -5;
	claw32.position.z = -25;
	shape3312 = new Ammo.btBoxShape(new Ammo.btVector3(15 * .5, 15 * .5, 7 * .5));
	shape3312.setMargin( margin );

	var mass3312 = 0;
	var localInertia3312 = new Ammo.btVector3( 0, 0, 0 );
	shape3312.calculateLocalInertia( mass3312, localInertia3312 );
	var transform3312 = new Ammo.btTransform();
	transform3312.setIdentity();
	var pos3312 = claw32.position;
	transform3312.setOrigin( new Ammo.btVector3( pos3312.x, pos3312.y, pos3312.z ) );
	var motionState3312 = new Ammo.btDefaultMotionState( transform3312 );
	var rbInfo3312 = new Ammo.btRigidBodyConstructionInfo( mass3312, motionState3312, shape3312, localInertia3312 );
	var body3312 = new Ammo.btRigidBody( rbInfo3312 );

	claw32.userData.physicsBody = body3312;
	claw32.receiveShadow = true;
	claw32.castShadow = true;
	claw3.add( claw32 );
	dynamicObjects.push( claw32 );
	physicsWorld.addRigidBody( body3312);


	//claw 4
	claw4 = new THREE.Mesh(new THREE.BoxGeometry(15, 5, 50), clawMaterial);
	claw4.position.x = 0;
	claw4.position.y = 675;
	claw4.position.z = 25;
	scene.add(claw4);
	var claw42 = new THREE.Mesh(new THREE.BoxGeometry(15, 15, 7), clawMaterial);
	claw42.position.x = 0;
	claw42.position.y = -5;
	claw42.position.z = 25;
	shape331 = new Ammo.btBoxShape(new Ammo.btVector3(15 * .5, 15 * .5, 7 * .5));
	shape331.setMargin( margin );

	var mass331 = 0;
	var localInertia331 = new Ammo.btVector3( 0, 0, 0 );
	shape331.calculateLocalInertia( mass331, localInertia331 );
	var transform331 = new Ammo.btTransform();
	transform331.setIdentity();
	var pos331 = claw42.position;
	transform331.setOrigin( new Ammo.btVector3( pos331.x, pos331.y, pos331.z ) );
	var motionState331 = new Ammo.btDefaultMotionState( transform331 );
	var rbInfo331 = new Ammo.btRigidBodyConstructionInfo( mass331, motionState331, shape331, localInertia331 );
	var body331 = new Ammo.btRigidBody( rbInfo331 );

	claw42.userData.physicsBody = body331;
	claw42.receiveShadow = true;
	claw42.castShadow = true;
	claw4.add( claw42 );
	dynamicObjects.push( claw42 );
	physicsWorld.addRigidBody( body331);

	//Guard ----------------------------------------------------------------------
	guard = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 10), postTexture);
	guard.position.x = 0;
	guard.position.y = 100;
	guard.position.z = 150;
	scene.add(guard);

	//Floor - with reference to stemkoski's github repository
	var floorTexture = new THREE.TextureLoader().load( 'textures/floor.jpg' );
	var floorMaterial = new THREE.MeshPhongMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(10000, 10000, 10, 10);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y = -2;
	floor.rotation.x = Math.PI / 2;
	scene.add(floor);

	//Adding glass to the sides of the machine -----------------------------------
	var glassMaterial = new THREE.MeshLambertMaterial({color: 0x000000, transparent: true, opacity: 0.25});
	var wall1 = new THREE.Mesh(new THREE.BoxGeometry(5, 400, 250), glassMaterial);
	wall1.position.x = 150;
	wall1.position.y = 600;
	wall1.position.z = 0;

	shape3 = new Ammo.btBoxShape(new Ammo.btVector3(5 * .5, 400 * .5, 250 * .5));
	shape3.setMargin( margin );

	var mass3 = 0;
	var localInertia3 = new Ammo.btVector3( 0, 0, 0 );
	shape3.calculateLocalInertia( mass3, localInertia3 );
	var transform3 = new Ammo.btTransform();
	transform3.setIdentity();
	var pos3 = wall1.position;
	transform3.setOrigin( new Ammo.btVector3( pos3.x, pos3.y, pos3.z ) );
	var motionState3 = new Ammo.btDefaultMotionState( transform3 );
	var rbInfo3 = new Ammo.btRigidBodyConstructionInfo( mass3, motionState3, shape3, localInertia3 );
	var body3 = new Ammo.btRigidBody( rbInfo3 );

	wall1.userData.physicsBody = body3;
	wall1.receiveShadow = true;
	wall1.castShadow = true;
	scene.add( wall1 );
	dynamicObjects.push( wall1 );
	physicsWorld.addRigidBody( body3 );

	//WALL 2
	var wall2 = new THREE.Mesh(new THREE.BoxGeometry(5, 400, 250), glassMaterial);
	wall2.position.x = -150;
	wall2.position.y = 600;
	wall2.position.z = 0;
	shape31 = new Ammo.btBoxShape(new Ammo.btVector3(5 * .5, 400 * .5, 250 * .5));
	shape31.setMargin( margin );

	var mass31 = 0;
	var localInertia31 = new Ammo.btVector3( 0, 0, 0 );
	shape31.calculateLocalInertia( mass31, localInertia31 );
	var transform31 = new Ammo.btTransform();
	transform31.setIdentity();
	var pos31 = wall2.position;
	transform31.setOrigin( new Ammo.btVector3( pos31.x, pos31.y, pos31.z ) );
	var motionState31 = new Ammo.btDefaultMotionState( transform31 );
	var rbInfo31 = new Ammo.btRigidBodyConstructionInfo( mass31, motionState31, shape31, localInertia31 );
	var body31 = new Ammo.btRigidBody( rbInfo31 );

	wall2.userData.physicsBody = body31;
	wall2.receiveShadow = true;
	wall2.castShadow = true;
	scene.add( wall2 );
	dynamicObjects.push( wall2 );
	physicsWorld.addRigidBody( body31 );

	//WALL 3
	var wall3 = new THREE.Mesh(new THREE.BoxGeometry(250, 400, 5), glassMaterial);
	wall3.position.x = 0;
	wall3.position.y = 600;
	wall3.position.z = 150;
	shape32 = new Ammo.btBoxShape(new Ammo.btVector3(250 * .5, 400 * .5, 5 * .5));
	shape32.setMargin( margin );

	var mass32 = 0;
	var localInertia32 = new Ammo.btVector3( 0, 0, 0 );
	shape32.calculateLocalInertia( mass32, localInertia32 );
	var transform32 = new Ammo.btTransform();
	transform32.setIdentity();
	var pos32 = wall3.position;
	transform32.setOrigin( new Ammo.btVector3( pos32.x, pos32.y, pos32.z ) );
	var motionState32 = new Ammo.btDefaultMotionState( transform32 );
	var rbInfo32 = new Ammo.btRigidBodyConstructionInfo( mass32, motionState32, shape32, localInertia32 );
	var body32 = new Ammo.btRigidBody( rbInfo32 );

	wall3.userData.physicsBody = body32;
	wall3.receiveShadow = true;
	wall3.castShadow = true;
	scene.add( wall3 );
	dynamicObjects.push( wall3 );
	physicsWorld.addRigidBody( body32 );


	//WALL 4
	var wall4 = new THREE.Mesh(new THREE.BoxGeometry(250, 400, 5), glassMaterial);
	wall4.position.x = 0;
	wall4.position.y = 600;
	wall4.position.z = -150;
	shape33 = new Ammo.btBoxShape(new Ammo.btVector3(20 * .5, 20 * .5, 20 * .5));
	shape33.setMargin( margin );

	var mass33 = 0;
	var localInertia33 = new Ammo.btVector3( 0, 0, 0 );
	shape33.calculateLocalInertia( mass33, localInertia33 );
	var transform33 = new Ammo.btTransform();
	transform33.setIdentity();
	var pos33 = wall4.position;
	transform33.setOrigin( new Ammo.btVector3( pos33.x, pos33.y, pos33.z ) );
	var motionState33 = new Ammo.btDefaultMotionState( transform33 );
	var rbInfo33 = new Ammo.btRigidBodyConstructionInfo( mass33, motionState33, shape33, localInertia33 );
	var body33 = new Ammo.btRigidBody( rbInfo33 );

	wall4.userData.physicsBody = body33;
	wall4.receiveShadow = true;
	wall4.castShadow = true;
	scene.add( wall4 );
	dynamicObjects.push( wall4 );
	physicsWorld.addRigidBody( body33);

	//Geometries to subtract from the base -----------------------------------------
	// var subBox = new THREE.Mesh(new THREE.BoxGeometry(50, 300, 50), baseMaterial);
	// subBox.position.x = 0;
	// subBox.position.y = 100;
	// subBox.position.z = 0;
	// base.subtract(subBox);

	//Text on top -------------------------------------------------------------------
	// var mar = new THREE.TextGeometry('craw', {
	// 	size: 80,
	// 	height: 5,
	// 	curveSegments: 12,
	// 	bevelThickness: 10,
	// 	bevelSize: 8,
	// 	bevelSegments: 5
	// });

	// mar.position.x = 0;
	// mar.position.y = 1000;
	// mar.position.z = 0;

	//Adding a sphere in the machine
	var radius = 30 + Math.random() * 30;
	threeObject = new THREE.Mesh( new THREE.SphereGeometry( radius, 20, 20 ), createObjectMaterial() );
	shape = new Ammo.btSphereShape( radius );
	shape.setMargin( margin );
	threeObject.position.x = 0;
	threeObject.position.y = 500;
	threeObject.position.z = 0;

	var mass = 100 * 5;
	var localInertia = new Ammo.btVector3( 0, 0, 0 );
	shape.calculateLocalInertia( mass, localInertia );
	var transform = new Ammo.btTransform();
	transform.setIdentity();
	var pos = threeObject.position;
	transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
	var motionState = new Ammo.btDefaultMotionState( transform );
	var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );
	var body = new Ammo.btRigidBody( rbInfo );

	threeObject.userData.physicsBody = body;
	threeObject.receiveShadow = true;
	threeObject.castShadow = true;
	scene.add( threeObject );
	dynamicObjects.push( threeObject );
	physicsWorld.addRigidBody( body );

	//Adding a sphere in the machine
	var radius2 = 30 + Math.random() * 30;
	threeObject2 = new THREE.Mesh( new THREE.SphereGeometry( radius2, 20, 20 ), createObjectMaterial() );
	shape2 = new Ammo.btSphereShape( radius2 );
	shape2.setMargin( margin );
	threeObject2.position.x = 15;
	threeObject2.position.y = 500;
	threeObject2.position.z = 0;

	var mass2 = 100 * 5;
	var localInertia2 = new Ammo.btVector3( 0, 0, 0 );
	shape2.calculateLocalInertia( mass2, localInertia2 );
	var transform2 = new Ammo.btTransform();
	transform2.setIdentity();
	var pos2 = threeObject2.position;
	transform2.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
	var motionState2 = new Ammo.btDefaultMotionState( transform2 );
	var rbInfo2 = new Ammo.btRigidBodyConstructionInfo( mass2, motionState2, shape2, localInertia2 );
	var body2 = new Ammo.btRigidBody( rbInfo2 );

	threeObject2.userData.physicsBody = body2;
	threeObject2.receiveShadow = true;
	threeObject2.castShadow = true;
	scene.add( threeObject2 );
	dynamicObjects.push( threeObject2 );
	physicsWorld.addRigidBody( body2 );

	//TRYING TO ADD A BOX
	boxThing1 = new THREE.Mesh( new THREE.BoxGeometry( 20, 20, 20 ), createObjectMaterial() );
	shape11 = new Ammo.btBoxShape(new Ammo.btVector3(20 * .5, 20 * .5, 20 * .5));
	shape11.setMargin( margin );
	boxThing1.position.x = 0;
	boxThing1.position.y = 500;
	boxThing1.position.z = 0;
	//boxThing1.rotateX(45);

	var mass11 = 100 * 5;
	var localInertia11 = new Ammo.btVector3( 0, 0, 0 );
	shape11.calculateLocalInertia( mass11, localInertia11 );
	var transform11 = new Ammo.btTransform();
	transform11.setIdentity();
	var pos11 = boxThing1.position;
	transform11.setOrigin( new Ammo.btVector3( pos11.x, pos11.y, pos11.z ) );
	var motionState11 = new Ammo.btDefaultMotionState( transform11 );
	var rbInfo11 = new Ammo.btRigidBodyConstructionInfo( mass11, motionState11, shape11, localInertia11 );
	var body11 = new Ammo.btRigidBody( rbInfo11 );

	boxThing1.userData.physicsBody = body11;
	boxThing1.receiveShadow = true;
	boxThing1.castShadow = true;
	scene.add( boxThing1 );
	dynamicObjects.push( boxThing1 );
	physicsWorld.addRigidBody( body11 );


	//TRYING TO ADD A BASE
	boxThing = new THREE.Mesh( new THREE.BoxGeometry( 300, 400, 300 ), basetop );
	shape1 = new Ammo.btBoxShape(new Ammo.btVector3(300 * .5, 400 * .5, 300 * .5));
	shape1.setMargin( margin );
	boxThing.position.x = 0;
	boxThing.position.y = 200;
	boxThing.position.z = 0;

	var mass1 = 0;
	var localInertia1 = new Ammo.btVector3( 0, 0, 0 );
	shape1.calculateLocalInertia( mass1, localInertia1 );
	var transform1 = new Ammo.btTransform();
	transform1.setIdentity();
	var pos1 = boxThing.position;
	transform1.setOrigin( new Ammo.btVector3( pos1.x, pos1.y, pos1.z ) );
	var motionState1 = new Ammo.btDefaultMotionState( transform1 );
	var rbInfo1 = new Ammo.btRigidBodyConstructionInfo( mass1, motionState1, shape1, localInertia1 );
	var body1 = new Ammo.btRigidBody( rbInfo1 );

	boxThing.userData.physicsBody = body1;
	boxThing.receiveShadow = true;
	boxThing.castShadow = true;
	scene.add( boxThing );
	dynamicObjects.push( boxThing );
	physicsWorld.addRigidBody( body1 );




} //end drawClawMachine

//Creates a random phong material
function createObjectMaterial() {
	var c = Math.floor( Math.random() * ( 1 << 24 ) );
	return new THREE.MeshPhongMaterial( { color: c } );
} //end createObjectMaterial



function initPhysics() {
	// Physics configuration
	var collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
	var dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
	var broadphase = new Ammo.btDbvtBroadphase();
	var solver = new Ammo.btSequentialImpulseConstraintSolver();
	var softBodySolver = new Ammo.btDefaultSoftBodySolver();
	physicsWorld = new Ammo.btSoftRigidDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration, softBodySolver);
	physicsWorld.setGravity( new Ammo.btVector3( 0, gravityConstant, 0 ) );
	physicsWorld.getWorldInfo().set_m_gravity( new Ammo.btVector3( 0, gravityConstant, 0 ) );
}

function updatePhysics( deltaTime ) {
	physicsWorld.stepSimulation( deltaTime, 10 );
	// Update objects
	for ( var i = 0, il = dynamicObjects.length; i < il; i++ ) {
		var objThree = dynamicObjects[ i ];
		var objPhys = objThree.userData.physicsBody;
		var ms = objPhys.getMotionState();
		if ( ms ) {
			ms.getWorldTransform( transformAux1 );
			var p = transformAux1.getOrigin();
			var q = transformAux1.getRotation();
			objThree.position.set( p.x(), p.y(), p.z() );
			objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );
		}
	}
	
}

//KeyPress Implementations
function update() {

	keyboard.update();

	var tiltDistance = 6;
	var moveDistance = -6;

	if(keyboard.down("up")) {
		handle.rotateX(tiltDistance);
		handle.translateZ(moveDistance);
		handleBall.translateZ(moveDistance * 2);

		if(box.position.z > -100 ) {
			box.translateZ(-15);
			clawBar.translateZ(-15);
			claw1.translateZ(-15);
			claw2.translateZ(-15);
			claw3.translateZ(-15);
			claw4.translateZ(-15);
		}
	}
	if(keyboard.up("up")) {
		handleBall.translateZ(-(moveDistance * 2));
		handle.translateZ(-(moveDistance));
		handle.rotateX(-(tiltDistance));
	}
	if(keyboard.down("left")) {
		handle.rotateZ(-tiltDistance);
		handle.translateX(moveDistance);
		handleBall.translateX(moveDistance * 2);

		if(armZ.position.x > -100) {
			armZ.translateX(-15);
			clawBar.translateX(-15);
			claw1.translateX(-15);
			claw2.translateX(-15);
			claw3.translateX(-15);
			claw4.translateX(-15);
		}
	}
	if(keyboard.up("left")) {
		handleBall.translateX(-(moveDistance * 2));
		handle.translateX(-moveDistance);
		handle.rotateZ(tiltDistance);
	}
	if(keyboard.down("right")) {
		handle.rotateZ(tiltDistance);
		handle.translateX(-moveDistance);
		handleBall.translateX(-(moveDistance * 2));

		if(armZ.position.x < 100) {
			armZ.translateX(15);
			clawBar.translateX(15);
			claw1.translateX(15);
			claw2.translateX(15);
			claw3.translateX(15);
			claw4.translateX(15);
		}
	}
	if(keyboard.up("right")) {
		handleBall.translateX(moveDistance * 2);
		handle.translateX(moveDistance);
		handle.rotateZ(-tiltDistance);
	}
	if(keyboard.down("down")) {
		handle.rotateX(-tiltDistance);
		handle.translateZ(-moveDistance);
		handleBall.translateZ(-(moveDistance * 2));

		if(box.position.z < 100) {
			clawBar.translateZ(15);
			box.translateZ(15);
			claw1.translateZ(15);
			claw2.translateZ(15);
			claw3.translateZ(15);
			claw4.translateZ(15);
		}
	}
	if(keyboard.up("down")) {
		handleBall.translateZ(moveDistance * 2);
		handle.translateZ(moveDistance);
		handle.rotateX(tiltDistance);
	}
	if(keyboard.down("V")) {
		camera.position.set( 0, 1000, 1000);
	}
	if(keyboard.up("V")) {
		camera.position.set( -1200, 800, 1600);
	}

	var delta = clock.getDelta(); // seconds.
	var moveDistance = -800 * delta; // 200 pixels per second

	if(keyboard.down("space")) {

		dropclaw();
	}
}

// Initialization. Define the size of the canvas and store the aspect ratio
// You can change these as well

function init() {
	var canvasWidth = 1280;
	var canvasHeight = 720;
	var canvasRatio = canvasWidth / canvasHeight;

	// Set up a renderer. This will allow WebGL to make your scene appear
	renderer = new THREE.WebGLRenderer( { antialias: true } );

	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor( 0xAAAAAA, 1.0);

	// You also want a camera. The camera has a default position, but you most likely want to change this.
	// You'll also want to allow a viewpoint that is reminiscent of using the machine as described in the pdf
	// This might include a different position and/or a different field of view etc.
	camera = new THREE.PerspectiveCamera( 45, canvasRatio, 1, 4000 );
	// Moving the camera with the mouse is simple enough - so this is provided. However, note that by default,
	// the keyboard moves the viewpoint as well
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
	camera.position.set( -1200, 600, 1600);
	cameraControls.target.set(4,301,92);

	initPhysics();

	}

	// We want our document object model (a javascript / HTML construct) to include our canvas
	// These allow for easy integration of webGL and HTML
function addToDOM() {
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
}


	// This is a browser callback for repainting
	// Since you might change view, or move things
	// We cant to update what appears
function animate() {
	window.requestAnimationFrame(animate);
	render();
	//ADDED THIS
	update();
}

	// getDelta comes from THREE.js - this tells how much time passed since this was last called
	// This might be useful if time is needed to make things appear smooth, in any animation, or calculation
	// The following function stores this, and also renders the scene based on the defined scene and camera
function render() {
	var deltaTime = clock.getDelta();
	cameraControls.update(deltaTime);

	updatePhysics(deltaTime);

	renderer.render(scene, camera);

	time += deltaTime;
}


function dropclaw() {
	var direction = new THREE.Vector3(0, -2, 0); // amount to move per frame
	moving = true;
	function animateClawDown() {
	claw1.position.add(direction); // add to position
	claw2.position.add(direction); // add to position
	claw3.position.add(direction); // add to position
	claw4.position.add(direction); // add to position
	clawBar.position.y -= 1;
	clawBar.scale.y += 0.02;
	renderer.render(scene, camera);

	if(clawBar.position.y < 635) {
		return pickupClaw();
		}

	requestAnimationFrame(animateClawDown); // keep looping

	}
	requestAnimationFrame(animateClawDown);
}

function pickupClaw() {
	var directionUp = new THREE.Vector3(0, 2, 0); // amount to move per frame
	function animateClawUp() {
	claw1.position.add(directionUp); // add to position
	claw2.position.add(directionUp); // add to position
	claw3.position.add(directionUp); // add to position
	claw4.position.add(directionUp); // add to position
	clawBar.position.y += 1;
	clawBar.scale.y -= 0.02;
	renderer.render(scene, camera);

	if(clawBar.position.y > 730) {
		moving = false;
		return;
	}
	requestAnimationFrame(animateClawUp); // keep looping

	}
	requestAnimationFrame(animateClawUp);
}

	// Since we're such talented programmers, we include some exception handeling in case we break something
	// a try and catch accomplished this as it often does
	// The sequence below includes initialization, filling up the scene, adding this to the DOM, and animating (updating what appears)
try {
  init();
  fillScene();
  addToDOM();
  animate();
} catch(error) {
    console.log("You did something bordering on utter madness. Error was:");
    console.log(error);
}
