import * as THREE from 'https://cdn.skypack.dev/three@v0.132.0';
import { FirstPersonControls } from 'https://cdn.skypack.dev/three@v0.132.0/examples/jsm/controls/FirstPersonControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@v0.132.0/examples/jsm/loaders/GLTFLoader.js';

let clock, camera, scene, renderer, controls;
let textureLoader;
let gltfLoader;
let shapes = [];
let objects = []
let materials = [];

init();

function getMaterialForTexture(name, tileFactor)
{
	const vertexShader = document.getElementById('vertexShader').textContent;
	const fragmentShader = document.getElementById('fragmentShader').textContent;

	let material = new THREE.ShaderMaterial();
	material.vertexShader = vertexShader;
	material.fragmentShader = fragmentShader;
	material.flatShading = true;
	material.uniforms = {
		"colorTexture": { value: null },
		"tileFactor": { value: tileFactor }
	};

	textureLoader.load(name,
		// onLoad callback
		function(texture) {
			material.uniforms.colorTexture.value = texture
			material.uniforms.colorTexture.value.wrapS = material.uniforms.colorTexture.value.wrapT = THREE.RepeatWrapping;
		},

		// onProgress callback currently not supported
		undefined,

		// onError callback
		function(err) {
			console.error('An error happened.');
	});

	return material;
}

function getGeometryForModel(name)
{
	return new Promise(resolve => {
		gltfLoader.load(name, resolve);
	}).then(function(gltf) {
		return gltf.scene.children[0].geometry;
	});
}

function init()
{
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(new THREE.Color(143.0/255.0, 182.0/255.0, 221.0/255.0), 1.0);
	renderer.setAnimationLoop(animation);
	document.body.appendChild(renderer.domElement);
	window.addEventListener( 'resize', onWindowResize );

	textureLoader = new THREE.TextureLoader();
	gltfLoader = new GLTFLoader();

	let shapePromises = []
	shapePromises.push(getGeometryForModel('models/cube.gltf'));
	shapePromises.push(getGeometryForModel('models/sphere.gltf'));
	shapePromises.push(getGeometryForModel('models/cylinder.gltf'));
	shapePromises.push(getGeometryForModel('models/pyramid.gltf'));
	shapePromises.push(getGeometryForModel('models/prism.gltf'));
	let shapePromise = Promise.all(shapePromises).then(function(result){
		for(let shape of result)
		{
			shapes.push(shape);
		}
	});

	let objectPromises = []
	objectPromises.push(getGeometryForModel('models/start_end.gltf'));
	objectPromises.push(getGeometryForModel('models/sign.gltf'));
	let objectPromise = Promise.all(objectPromises).then(function(result){
		for(let object of result)
		{
			objects.push(object);
		}
	});

	materials.push(getMaterialForTexture('textures/default.png', 1.0));
	materials.push(getMaterialForTexture('textures/grabbable.png', 1.0));
	materials.push(getMaterialForTexture('textures/ice.png', 0.1));
	materials.push(getMaterialForTexture('textures/lava.png', 0.1));
	materials.push(getMaterialForTexture('textures/wood.png', 1.0));
	materials.push(getMaterialForTexture('textures/grapplable.png', 0.1));
	materials.push(getMaterialForTexture('textures/grapplable_lava.png', 0.1));
	materials.push(getMaterialForTexture('textures/grabbable_crumbling.png', 1.0));

	clock = new THREE.Clock();
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10000);
	camera.position.z = 0;

	const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
	scene.add(ambientLight);

	const sunLight = new THREE.DirectionalLight(0xffffff, 0.5);
	sunLight.position.x = 1.0;
	sunLight.position.y = 1.0;
	sunLight.position.z = 1.0;
	scene.add(sunLight);

	controls = new FirstPersonControls(camera, renderer.domElement);
	controls.movementSpeed = 50;
	controls.lookSpeed = 0.1;

	protobuf.load("level.proto", function(err, root) {
		if(err) throw err;

		// example code
		const LevelMessage = root.lookupType("COD.Level.Level");

		(async () => {
			let response = await fetch('https://api.slin.dev/grab/v1/download/290oi9o5ziqvg9cxbo2a4/1631392484/2');
			//console.log(response);
			let responseBody = await response.arrayBuffer();
			let formattedBuffer = new Uint8Array(responseBody);
			let decoded = LevelMessage.decode(formattedBuffer);
			//console.log(`decoded = ${JSON.stringify(decoded)}`);

			await shapePromise;
			await objectPromise;

			let extraRotate = new THREE.Quaternion();
			extraRotate.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

			for(let node of decoded.levelNodes)
			{
				if(node.levelNodeStatic)
				{
					let cube = new THREE.Mesh(shapes[node.levelNodeStatic.shape-1000], materials[node.levelNodeStatic.material]);
					scene.add(cube);
					cube.position.x = node.levelNodeStatic.position.x
					cube.position.y = node.levelNodeStatic.position.y
					cube.position.z = node.levelNodeStatic.position.z

					cube.scale.x = node.levelNodeStatic.scale.x
					cube.scale.y = node.levelNodeStatic.scale.y
					cube.scale.z = node.levelNodeStatic.scale.z

					cube.quaternion.x = node.levelNodeStatic.rotation.x
					cube.quaternion.y = node.levelNodeStatic.rotation.y
					cube.quaternion.z = node.levelNodeStatic.rotation.z
					cube.quaternion.w = node.levelNodeStatic.rotation.w

					cube.setRotationFromQuaternion(cube.quaternion.multiply(extraRotate));
				}
				else if(node.levelNodeCrumbling)
				{
					let cube = new THREE.Mesh(shapes[node.levelNodeCrumbling.shape-1000], materials[node.levelNodeCrumbling.material]);
					scene.add(cube);
					cube.position.x = node.levelNodeCrumbling.position.x
					cube.position.y = node.levelNodeCrumbling.position.y
					cube.position.z = node.levelNodeCrumbling.position.z

					cube.scale.x = node.levelNodeCrumbling.scale.x
					cube.scale.y = node.levelNodeCrumbling.scale.y
					cube.scale.z = node.levelNodeCrumbling.scale.z

					cube.quaternion.x = node.levelNodeCrumbling.rotation.x
					cube.quaternion.y = node.levelNodeCrumbling.rotation.y
					cube.quaternion.z = node.levelNodeCrumbling.rotation.z
					cube.quaternion.w = node.levelNodeCrumbling.rotation.w

					cube.setRotationFromQuaternion(cube.quaternion.multiply(extraRotate));
				}
				else if(node.levelNodeStart)
				{
					let start = new THREE.Mesh(objects[0], materials[4]);
					scene.add(start);
					start.position.x = node.levelNodeStart.position.x
					start.position.y = node.levelNodeStart.position.y
					start.position.z = node.levelNodeStart.position.z

					start.scale.x = node.levelNodeStart.radius;
					start.scale.z = node.levelNodeStart.radius;
				}
				else if(node.levelNodeFinish)
				{
					let finish = new THREE.Mesh(objects[0], materials[4]);
					scene.add(finish);
					finish.position.x = node.levelNodeFinish.position.x
					finish.position.y = node.levelNodeFinish.position.y
					finish.position.z = node.levelNodeFinish.position.z

					finish.scale.x = node.levelNodeFinish.radius;
					finish.scale.z = node.levelNodeFinish.radius;
				}
				else if(node.levelNodeSign)
				{
					let sign = new THREE.Mesh(objects[1], materials[4]);
					scene.add(sign);
					sign.position.x = node.levelNodeSign.position.x
					sign.position.y = node.levelNodeSign.position.y
					sign.position.z = node.levelNodeSign.position.z

					sign.quaternion.x = node.levelNodeSign.rotation.x
					sign.quaternion.y = node.levelNodeSign.rotation.y
					sign.quaternion.z = node.levelNodeSign.rotation.z
					sign.quaternion.w = node.levelNodeSign.rotation.w

					sign.setRotationFromQuaternion(sign.quaternion.multiply(extraRotate));
				}
			}
		})()
	});
}

function onWindowResize()
{
	let SCREEN_HEIGHT = window.innerHeight;
	let SCREEN_WIDTH = window.innerWidth;

	camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
	camera.updateProjectionMatrix();

	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
}

function animation(time)
{
	const delta = clock.getDelta();
	controls.update(delta);

	renderer.render(scene, camera);
}
