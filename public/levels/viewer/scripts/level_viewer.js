import * as THREE from 'https://cdn.skypack.dev/three@v0.132.0';
import { FreeControls } from './free_controls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@v0.132.0/examples/jsm/loaders/GLTFLoader.js';

let userID = undefined;

let clock, camera, scene, renderer, controls;
let textureLoader;
let gltfLoader;
let shapes = [];
let objects = []
let materials = [];
let objectMaterials = [];

init();

function getCookie(cname)
{
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for(let i = 0; i <ca.length; i++)
	{
		let c = ca[i];
		while(c.charAt(0) == ' ')
		{
			c = c.substring(1);
		}
		if(c.indexOf(name) == 0)
		{
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function getMaterialForTexture(name, tileFactor, vertexShader, fragmentShader)
{
	let material = new THREE.ShaderMaterial();
	material.vertexShader = vertexShader;
	material.fragmentShader = fragmentShader;
	material.flatShading = true;

	material.uniforms = {
		"colorTexture": { value: null },
		"tileFactor": { value: tileFactor },
		"diffuseColor": { value: [1.0, 1.0, 1.0] },
		"worldNormalMatrix": { value: new THREE.Matrix3() }
	};

	material.uniforms.colorTexture.value = textureLoader.load(name);
	material.uniforms.colorTexture.value.wrapS = material.uniforms.colorTexture.value.wrapT = THREE.RepeatWrapping;

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
	document.getElementById('back-button').addEventListener('click', backButtonPressed);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.setClearColor(new THREE.Color(143.0/255.0, 182.0/255.0, 221.0/255.0), 1.0);
	renderer.setAnimationLoop(animation);
	renderer.domElement.id = "canvas"
	document.body.appendChild(renderer.domElement);
	window.addEventListener( 'resize', onWindowResize );

	document.addEventListener('pointerlockchange', pointerLockChanged, false);

	renderer.domElement.onclick = function() {
  		renderer.domElement.requestPointerLock();
	}

	textureLoader = new THREE.TextureLoader();
	gltfLoader = new GLTFLoader();

	let shapePromises = []
	shapePromises.push(getGeometryForModel(VIEWER_PATH + 'models/cube.gltf'));
	shapePromises.push(getGeometryForModel(VIEWER_PATH + 'models/sphere.gltf'));
	shapePromises.push(getGeometryForModel(VIEWER_PATH + 'models/cylinder.gltf'));
	shapePromises.push(getGeometryForModel(VIEWER_PATH + 'models/pyramid.gltf'));
	shapePromises.push(getGeometryForModel(VIEWER_PATH + 'models/prism.gltf'));
	let shapePromise = Promise.all(shapePromises).then(function(result){
		for(let shape of result)
		{
			shapes.push(shape);
		}
	});

	let objectPromises = []
	objectPromises.push(getGeometryForModel(VIEWER_PATH + 'models/start_end.gltf'));
	objectPromises.push(getGeometryForModel(VIEWER_PATH + 'models/sign.gltf'));
	let objectPromise = Promise.all(objectPromises).then(function(result){
		for(let object of result)
		{
			objects.push(object);
		}
	});

	const levelVertexShader = document.getElementById('level-vertexShader').textContent;
	const levelFragmentShader = document.getElementById('level-fragmentShader').textContent;

	materials.push(getMaterialForTexture(VIEWER_PATH + 'textures/default.png', 1.0, levelVertexShader, levelFragmentShader));
	materials.push(getMaterialForTexture(VIEWER_PATH + 'textures/grabbable.png', 1.0, levelVertexShader, levelFragmentShader));
	materials.push(getMaterialForTexture(VIEWER_PATH + 'textures/ice.png', 0.1, levelVertexShader, levelFragmentShader));
	materials.push(getMaterialForTexture(VIEWER_PATH + 'textures/lava.png', 0.1, levelVertexShader, levelFragmentShader));
	materials.push(getMaterialForTexture(VIEWER_PATH + 'textures/wood.png', 1.0, levelVertexShader, levelFragmentShader));
	materials.push(getMaterialForTexture(VIEWER_PATH + 'textures/grapplable.png', 0.1, levelVertexShader, levelFragmentShader));
	materials.push(getMaterialForTexture(VIEWER_PATH + 'textures/grapplable_lava.png', 0.1, levelVertexShader, levelFragmentShader));
	materials.push(getMaterialForTexture(VIEWER_PATH + 'textures/grabbable_crumbling.png', 1.0, levelVertexShader, levelFragmentShader));
	materials.push(getMaterialForTexture(VIEWER_PATH + 'textures/default_colored.png', 1.0, levelVertexShader, levelFragmentShader));

	const vertexShader = document.getElementById('startfinish-vertexShader').textContent;
	const fragmentShader = document.getElementById('startfinish-fragmentShader').textContent;

	let startMaterial = new THREE.ShaderMaterial();
	startMaterial.vertexShader = vertexShader;
	startMaterial.fragmentShader = fragmentShader;
	startMaterial.flatShading = true;
	startMaterial.transparent = true;
	startMaterial.depthWrite = false;
	startMaterial.uniforms = { "diffuseColor": {value: [0.0, 1.0, 0.0, 1.0]}};
	objectMaterials.push(startMaterial);

	let finishMaterial = new THREE.ShaderMaterial();
	finishMaterial.vertexShader = vertexShader;
	finishMaterial.fragmentShader = fragmentShader;
	finishMaterial.flatShading = true;
	finishMaterial.transparent = true;
	finishMaterial.depthWrite = false;
	finishMaterial.uniforms = { "diffuseColor": {value: [1.0, 0.0, 0.0, 1.0]}};
	objectMaterials.push(finishMaterial);

	const signVertexShader = document.getElementById('sign-vertexShader').textContent;
	const signFragmentShader = document.getElementById('sign-fragmentShader').textContent;
	objectMaterials.push(getMaterialForTexture(VIEWER_PATH + 'textures/wood.png', 1.0, signVertexShader, signFragmentShader));


	clock = new THREE.Clock();
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 5000);

	const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
	scene.add(ambientLight);

	const sunLight = new THREE.DirectionalLight(0xffffff, 0.5);
	scene.add(sunLight);

	controls = new FreeControls(camera, renderer.domElement);

	protobuf.load(VIEWER_PATH + "proto/level.proto", function(err, root) {
		if(err) throw err;

		const LevelMessage = root.lookupType("COD.Level.Level");

		(async () => {
			let accessToken = getCookie("access_token");
			let userInfoString = getCookie("user_info")
			let userInfo = undefined
			if(userInfoString && userInfoString.length > 0) userInfo = JSON.parse(userInfoString);

			var titleLabel = document.getElementById("title");
			var creatorsLabel = document.getElementById("creators");
			var descriptionLabel = document.getElementById("description");
			var complexityLabel = document.getElementById("complexity");

			const urlParams = new URLSearchParams(window.location.search);
			let levelIdentifier = urlParams.get('level');
			let levelIdentifierParts = levelIdentifier.split(':')
			let hasIteration = levelIdentifierParts.length === 3
			levelIdentifier = levelIdentifierParts.join('/');

			let detailResponse = await fetch(SERVER_URL + 'details/' + levelIdentifier);
			let detailResponseBody = await detailResponse.json();
			userID = levelIdentifierParts[0];
			console.log(userID);

			if(detailResponseBody.hidden === true && (!userInfo || !("is_admin" in userInfo) || userInfo.is_admin === false))
			{
				//Don't load hidden levels unless this is an admin
				titleLabel.innerHTML = '<b>NOT AVAILABLE</b>';
				creatorsLabel.innerHTML = '';
				descriptionLabel.innerHTML = '';
				complexityLabel.innerHTML = '';
				return;
			}

			if(!hasIteration)
			{
				levelIdentifier = detailResponseBody.data_key.split(':')
				levelIdentifier.splice(0, 1)
				levelIdentifier = levelIdentifier.join('/')
			}

			let response = await fetch(SERVER_URL + 'download/' + levelIdentifier);
			//console.log(response);
			let responseBody = await response.arrayBuffer();
			let formattedBuffer = new Uint8Array(responseBody);
			let decoded = LevelMessage.decode(formattedBuffer);
			//console.log(`decoded = ${JSON.stringify(decoded)}`);

			var fullscreenButton = document.getElementById("fullscreen");
			fullscreenButton.onclick = openFullscreen;

			/*let metaDescription = decoded.description
			if(decoded.creators && decoded.creators.length > 0)
			{
				metaDescription += ' - by ' + decoded.creators;
			}
			document.getElementsByTagName('meta')["description"].content = metaDescription;
			document.title = "GRAB: " + decoded.title;*/

			titleLabel.innerHTML = 'title: <b>' + decoded.title + '</b>';
			creatorsLabel.innerHTML = 'creators: <i>' + decoded.creators + '</i>';
			descriptionLabel.innerHTML = 'description: ' + decoded.description;
			complexityLabel.innerHTML = 'complexity: ' + decoded.complexity;

			await shapePromise;
			await objectPromise;

			const skyVertexShader = document.getElementById('sky-vertexShader').textContent;
			const skyFragmentShader = document.getElementById('sky-fragmentShader').textContent;
			let skyMaterial = new THREE.ShaderMaterial();
			skyMaterial.vertexShader = skyVertexShader;
			skyMaterial.fragmentShader = skyFragmentShader;
			skyMaterial.flatShading = false;
			skyMaterial.depthWrite = false;
			skyMaterial.side = THREE.BackSide;

			let sunAngle = new THREE.Euler(THREE.MathUtils.degToRad(-45), THREE.MathUtils.degToRad(315), 0.0)
			if(decoded.ambienceSettings)
			{
				sunAngle = new THREE.Euler(-THREE.MathUtils.degToRad(decoded.ambienceSettings.sunAltitude), THREE.MathUtils.degToRad(decoded.ambienceSettings.sunAzimuth), 0.0);

				skyMaterial.uniforms["cameraFogColor0"] = { value: [decoded.ambienceSettings.skyHorizonColor.r, decoded.ambienceSettings.skyHorizonColor.g, decoded.ambienceSettings.skyHorizonColor.b] }
				skyMaterial.uniforms["cameraFogColor1"] = { value: [decoded.ambienceSettings.skyZenithColor.r, decoded.ambienceSettings.skyZenithColor.g, decoded.ambienceSettings.skyZenithColor.b] }
				skyMaterial.uniforms["sunSize"] = { value: decoded.ambienceSettings.sunSize }
			}
			else
			{
				skyMaterial.uniforms["cameraFogColor0"] = { value: [0.916, 0.9574, 0.9574] }
				skyMaterial.uniforms["cameraFogColor1"] = { value: [0.28, 0.476, 0.73] }
				skyMaterial.uniforms["sunSize"] = { value: 1.0 }
			}

			const sunDirection = new THREE.Vector3( 0, 0, 1 );
			sunDirection.applyEuler(sunAngle);

			const skySunDirection = sunDirection.clone()
			skySunDirection.x = -skySunDirection.x;
			skySunDirection.y = -skySunDirection.y;
			skySunDirection.z = -skySunDirection.z;

			skyMaterial.uniforms["sunDirection"] = { value: skySunDirection }
			skyMaterial.uniforms["sunColor"] = { value: [1.0, 1.0, 1.0] }

			const sky = new THREE.Mesh(shapes[1], skyMaterial)
			sky.frustumCulled = false
			sky.renderOrder = 1000 //sky should be rendered after opaque, before transparent
			scene.add(sky);

			let extraRotate = new THREE.Quaternion();
			extraRotate.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

			let signTextContainer = document.getElementById("signtextcontainer");
			let signCounter = 0;

			const loadLevelNodes = function(nodes, parentNode){
				for(let node of nodes)
				{
					if(node.levelNodeGroup)
					{
						let cube = new THREE.Object3D()
						parentNode.add(cube);
						cube.position.x = node.levelNodeGroup.position.x
						cube.position.y = node.levelNodeGroup.position.y
						cube.position.z = node.levelNodeGroup.position.z

						cube.scale.x = node.levelNodeGroup.scale.x
						cube.scale.y = node.levelNodeGroup.scale.y
						cube.scale.z = node.levelNodeGroup.scale.z

						cube.quaternion.x = node.levelNodeGroup.rotation.x
						cube.quaternion.y = node.levelNodeGroup.rotation.y
						cube.quaternion.z = node.levelNodeGroup.rotation.z
						cube.quaternion.w = node.levelNodeGroup.rotation.w

						if(parentNode == scene)
						{
							let rotation = cube.quaternion.multiply(extraRotate)
							cube.setRotationFromQuaternion(rotation)
						}

						loadLevelNodes(node.levelNodeGroup.childNodes, cube)
					}
					else if(node.levelNodeStatic)
					{
						let material = materials[node.levelNodeStatic.material]
						let newMaterial = material.clone()
						newMaterial.uniforms.colorTexture = material.uniforms.colorTexture
						newMaterial.uniforms["sunDirection"] = { value: sunDirection }

						if(node.levelNodeStatic.material == root.COD.Types.LevelNodeMaterial.DEFAULT_COLORED && node.levelNodeStatic.color)
						{
							newMaterial.uniforms.diffuseColor.value = [node.levelNodeStatic.color.r, node.levelNodeStatic.color.g, node.levelNodeStatic.color.b]
						}

						let cube = new THREE.Mesh(shapes[node.levelNodeStatic.shape-1000], newMaterial)
						parentNode.add(cube);
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

						if(parentNode == scene)
						{
							let rotation = cube.quaternion.multiply(extraRotate)
							cube.setRotationFromQuaternion(rotation)
						}

						let targetVector = new THREE.Vector3()
						let targetQuaternion = new THREE.Quaternion()
						let worldMatrix = new THREE.Matrix4()
						worldMatrix.compose(cube.getWorldPosition(targetVector), cube.getWorldQuaternion(targetQuaternion), cube.getWorldScale(targetVector))

						let normalMatrix = new THREE.Matrix3()
						normalMatrix.getNormalMatrix(worldMatrix)
						newMaterial.uniforms.worldNormalMatrix.value = normalMatrix
					}
					else if(node.levelNodeCrumbling)
					{
						let material = materials[node.levelNodeCrumbling.material]
						let newMaterial = material.clone()
						newMaterial.uniforms.colorTexture = material.uniforms.colorTexture
						newMaterial.uniforms["sunDirection"] = { value: sunDirection }

						let cube = new THREE.Mesh(shapes[node.levelNodeCrumbling.shape-1000], newMaterial);
						parentNode.add(cube);
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

						if(parentNode == scene)
						{
							let rotation = cube.quaternion.multiply(extraRotate)
							cube.setRotationFromQuaternion(rotation)
						}

						let targetVector = new THREE.Vector3()
						let targetQuaternion = new THREE.Quaternion()
						let worldMatrix = new THREE.Matrix4()
						worldMatrix.compose(cube.getWorldPosition(targetVector), cube.getWorldQuaternion(targetQuaternion), cube.getWorldScale(targetVector))

						let normalMatrix = new THREE.Matrix3()
						normalMatrix.getNormalMatrix(worldMatrix)
						newMaterial.uniforms.worldNormalMatrix.value = normalMatrix
					}
					else if(node.levelNodeStart)
					{
						let start = new THREE.Mesh(objects[0], objectMaterials[0]);
						parentNode.add(start);
						start.position.x = node.levelNodeStart.position.x
						start.position.y = node.levelNodeStart.position.y
						start.position.z = node.levelNodeStart.position.z

						start.scale.x = node.levelNodeStart.radius * 2.0;
						start.scale.z = node.levelNodeStart.radius * 2.0;

						camera.position.set(start.position.x, start.position.y + 2.0, start.position.z);
					}
					else if(node.levelNodeFinish)
					{
						let finish = new THREE.Mesh(objects[0], objectMaterials[1]);
						parentNode.add(finish);
						finish.position.x = node.levelNodeFinish.position.x
						finish.position.y = node.levelNodeFinish.position.y
						finish.position.z = node.levelNodeFinish.position.z

						finish.scale.x = node.levelNodeFinish.radius * 2.0;
						finish.scale.z = node.levelNodeFinish.radius * 2.0;

						var goToFinishLabel = document.getElementById("go to finish");
						goToFinishLabel.innerHTML = "Go to Finish"
						goToFinishLabel.onclick = function() {
							camera.position.set(finish.position.x, finish.position.y + 2.0, finish.position.z);
						}
					}
					else if(node.levelNodeSign)
					{
						let material = objectMaterials[2]
						let newMaterial = material.clone()
						newMaterial.uniforms.colorTexture = material.uniforms.colorTexture
						newMaterial.uniforms["sunDirection"] = { value: sunDirection }

						let sign = new THREE.Mesh(objects[1], newMaterial);
						parentNode.add(sign);
						sign.position.x = node.levelNodeSign.position.x
						sign.position.y = node.levelNodeSign.position.y
						sign.position.z = node.levelNodeSign.position.z

						sign.quaternion.x = node.levelNodeSign.rotation.x
						sign.quaternion.y = node.levelNodeSign.rotation.y
						sign.quaternion.z = node.levelNodeSign.rotation.z
						sign.quaternion.w = node.levelNodeSign.rotation.w

						if(parentNode == scene)
						{
							let rotation = cube.quaternion.multiply(extraRotate)
							cube.setRotationFromQuaternion(rotation)
						}

						let signText = node.levelNodeSign.text
						if(userInfo && "is_admin" in userInfo && userInfo.is_admin === true && signText && signText.length > 0)
						{
							let signTextElement = document.createElement("div");
							signTextElement.innerHTML = "Sign " + signCounter + ": " + signText + "<br><br>"
							signTextElement.onclick = function() {
								camera.position.set(sign.position.x, sign.position.y + 1.0, sign.position.z);
							}
							signTextContainer.appendChild(signTextElement);
						}

						signCounter += 1;
					}
				}
			};

			loadLevelNodes(decoded.levelNodes, scene);

			

			//Get level statistics
			(async () => {
				const urlParams = new URLSearchParams(window.location.search);
				let levelIdentifier = urlParams.get('level');
				levelIdentifier = levelIdentifier.split(':').join('/');

				let response = await fetch(SERVER_URL + 'statistics/' + levelIdentifier);
				let responseBody = await response.json();

				var totalPlayedLabel = document.getElementById("total played count");
				totalPlayedLabel.innerHTML = "total played count: <b>" + responseBody.total_played_count + "</b>"

				var totalFinishedLabel = document.getElementById("total finished count");
				totalFinishedLabel.innerHTML = "total finished count: <b>" + responseBody.total_finished_count + "</b>"

				var playersPlayedLabel = document.getElementById("players played count");
				playersPlayedLabel.innerHTML = "players played count: <b>" + responseBody.played_count + "</b>"

				var playersFinishedLabel = document.getElementById("players finished count");
				playersFinishedLabel.innerHTML = "players finished count: <b>" + responseBody.finished_count + "</b>"

				var playersRatedLabel = document.getElementById("players rated count");
				playersRatedLabel.innerHTML = "players rated count: <b>" + responseBody.rated_count + "</b>"

				var playersLikedLabel = document.getElementById("players liked count");
				playersLikedLabel.innerHTML = "players liked count: <b>" + responseBody.liked_count + "</b>"

				var timeLabel = document.getElementById("average time");
				timeLabel.innerHTML = "average time: <b>" + responseBody.average_time + "</b>"
			})()
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

function openFullscreen()
{
	let elem = document.getElementById("canvas");
	if(elem.requestFullscreen)
	{
		elem.requestFullscreen();
	}
	else if(elem.mozRequestFullScreen)
	{ /* Firefox */
		elem.mozRequestFullScreen();
	}
	else if(elem.webkitRequestFullscreen)
	{ /* Chrome, Safari & Opera */
		elem.webkitRequestFullscreen();
	}
	else if(elem.msRequestFullscreen)
	{ /* IE/Edge */
		elem.msRequestFullscreen();
	}
	elem.style.width = '100%';
	elem.style.height = '100%';
}

function pointerLockChanged()
{
	if(document.pointerLockElement === canvas) {
		controls.isMouseActive = true;
	} else {
		controls.isMouseActive = false;
	}
}

export function backButtonPressed()
{
	let newURL = new URL(window.location);
	newURL.pathname = "/levels";
	if(userID !== undefined) newURL.search = "?tab=user&user_id=" + userID;
	else newURL.search = "";
	window.location.href = newURL.href;
}
