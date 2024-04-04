import * as THREE from 'three';
import { FreeControls } from './free_controls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SHADERS from './shaders.js';
import { GLTFExporter } from 'three/examples/jsm//exporters/GLTFExporter.js';
import * as config from '../../../src/configuration'
import * as protobuf from 'protobufjs'

import { createApp } from 'vue'
import App from '@/App.vue'
import { useUserStore } from '@/stores/user'
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import imageStampOk from '../../../src/assets/stamp_ok.png'

import modelCubeURL from '../models/cube.gltf'
import modelSphereURL from '../models/sphere.gltf'
import modelCylinderURL from '../models/cylinder.gltf'
import modelPyramidURL from '../models/pyramid.gltf'
import modelPrismURL from '../models/prism.gltf'
import modelStartEndURL from '../models/start_end.gltf'
import modelSignURL from '../models/sign.gltf'

import textureDefaultURL from '../textures/default.png'
import textureGrabbableURL from '../textures/grabbable.png'
import textureIceURL from '../textures/ice.png'
import textureLavaURL from '../textures/lava.png'
import textureWoodURL from '../textures/wood.png'
import textureGrapplableURL from '../textures/grapplable.png'
import textureGrapplableLavaURL from '../textures/grapplable_lava.png'
import textureGrabbableCrumblingURL from '../textures/grabbable_crumbling.png'
import textureDefaultColoredURL from '../textures/default_colored.png'
import textureBouncingURL from '../textures/bouncing.png'

let userID = undefined;

let clock, camera, scene, renderer, controls;
let animatedObjects = []
let animationTime = 0.0
let textureLoader;
let gltfLoader;
let shapes = [];
let objects = []
let materials = [];
let objectMaterials = [];
let isFogEnabled = true;
let isSliderDragging = false;
let particles = [];
let particlesPositions = [];
let particlesDirections = [];
let removedTimes = [];

init();

function getMaterialForTexture(name, tileFactor, vertexShader, fragmentShader, specularColor=[0.3, 0.3, 0.3, 16.0], neonEnabled=0.0)
{
	let material = new THREE.ShaderMaterial();
	material.vertexShader = vertexShader;
	material.fragmentShader = fragmentShader;
	material.flatShading = true;

	material.uniforms = {
		"colorTexture": { value: null },
		"tileFactor": { value: tileFactor },
		"diffuseColor": { value: [1.0, 1.0, 1.0] },
		"worldNormalMatrix": { value: new THREE.Matrix3() },
		"neonEnabled": { value: neonEnabled },
		"fogEnabled": { value: 1.0 },
		"specularColor": { value: specularColor}
	};

	material.uniforms.colorTexture.value = textureLoader.load(name);
	material.uniforms.colorTexture.value.wrapS = material.uniforms.colorTexture.value.wrapT = THREE.RepeatWrapping;
	material.uniforms.colorTexture.value.colorSpace = THREE.SRGBColorSpace;

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
	document.getElementById('copy-button').addEventListener('click', copyLevelURLPressed);
	document.getElementById('location-button').addEventListener('click', copyLocationURLPressed);
	document.getElementById('download-button').addEventListener('click', exportLevelAsGLTF);
	document.getElementById("fog-button").addEventListener("click", toggleFog);

	THREE.ColorManagement.enabled = true;

	renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputColorSpace = THREE.SRGBColorSpace;
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
	shapePromises.push(getGeometryForModel(modelCubeURL));
	shapePromises.push(getGeometryForModel(modelSphereURL));
	shapePromises.push(getGeometryForModel(modelCylinderURL));
	shapePromises.push(getGeometryForModel(modelPyramidURL));
	shapePromises.push(getGeometryForModel(modelPrismURL));
	let shapePromise = Promise.all(shapePromises).then(function(result){
		for(let shape of result)
		{
			shapes.push(shape);
		}
	});

	let objectPromises = []
	objectPromises.push(getGeometryForModel(modelStartEndURL));
	objectPromises.push(getGeometryForModel(modelSignURL));
	let objectPromise = Promise.all(objectPromises).then(function(result){
		for(let object of result)
		{
			objects.push(object);
		}
	});

	materials.push(getMaterialForTexture(textureDefaultURL, 1.0, SHADERS.levelVS, SHADERS.levelFS, [0.4, 0.4, 0.4, 64.0]));
	materials.push(getMaterialForTexture(textureGrabbableURL, 1.0, SHADERS.levelVS, SHADERS.levelFS, [0.2, 0.2, 0.2, 16.0]));
	materials.push(getMaterialForTexture(textureIceURL, 0.1, SHADERS.levelVS, SHADERS.levelFS, [0.6, 0.6, 0.6, 64.0]));
	materials.push(getMaterialForTexture(textureLavaURL, 0.1, SHADERS.levelVS, SHADERS.levelFS, [0.0, 0.0, 0.0, 1.0]));
	materials.push(getMaterialForTexture(textureWoodURL, 1.0, SHADERS.levelVS, SHADERS.levelFS, [0.2, 0.2, 0.2, 32.0]));
	materials.push(getMaterialForTexture(textureGrapplableURL, 0.1, SHADERS.levelVS, SHADERS.levelFS, [0.3, 0.3, 0.3, 32.0]));
	materials.push(getMaterialForTexture(textureGrapplableLavaURL, 0.1, SHADERS.levelVS, SHADERS.levelFS, [0.0, 0.0, 0.0, 1.0]));
	materials.push(getMaterialForTexture(textureGrabbableCrumblingURL, 1.0, SHADERS.levelVS, SHADERS.levelFS, [0.2, 0.2, 0.2, 16.0]));
	materials.push(getMaterialForTexture(textureDefaultColoredURL, 1.0, SHADERS.levelVS, SHADERS.levelFS, [0.15, 0.15, 0.15, 10.0]));
	materials.push(getMaterialForTexture(textureBouncingURL, 1.0, SHADERS.levelVS, SHADERS.levelFS, [0.8, 0.8, 0.8, 64.0]));

	let startMaterial = new THREE.ShaderMaterial();
	startMaterial.vertexShader = SHADERS.startFinishVS;
	startMaterial.fragmentShader = SHADERS.startFinishFS;
	startMaterial.flatShading = true;
	startMaterial.transparent = true;
	startMaterial.depthWrite = false;
	startMaterial.uniforms = { "diffuseColor": {value: [0.0, 1.0, 0.0, 1.0]}};
	objectMaterials.push(startMaterial);

	let finishMaterial = new THREE.ShaderMaterial();
	finishMaterial.vertexShader = SHADERS.startFinishVS;
	finishMaterial.fragmentShader = SHADERS.startFinishFS;
	finishMaterial.flatShading = true;
	finishMaterial.transparent = true;
	finishMaterial.depthWrite = false;
	finishMaterial.uniforms = { "diffuseColor": {value: [1.0, 0.0, 0.0, 1.0]}};
	objectMaterials.push(finishMaterial);

	objectMaterials.push(getMaterialForTexture(textureWoodURL, 1.0, SHADERS.signVS, SHADERS.signFS));
	objectMaterials.push(getMaterialForTexture(textureDefaultColoredURL, 1.0, SHADERS.levelVS, SHADERS.levelFS, [0.4, 0.4, 0.4, 64.0], 1.0));


	clock = new THREE.Clock();
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 5000);

	const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
	scene.add(ambientLight);

	const sunLight = new THREE.DirectionalLight(0xffffff, 0.5);
	scene.add(sunLight);

	controls = new FreeControls(camera, renderer.domElement);

	protobuf.load('/proto/level.proto', function(err, root) {
		if(err) throw err;

		const LevelMessage = root.lookupType("COD.Level.Level");

		(async () => {
			//Need to setup everything to be able to access the storage through pinia...
			const pinia = createPinia()
			pinia.use(piniaPluginPersistedstate)
			const app = createApp(App)
			app.use(pinia)
			const userStore = useUserStore(pinia)
			let { accessToken, list, listIndex } = userStore;

			var titleLabel = document.getElementById("title");
			var creatorsLabel = document.getElementById("creators");
			var descriptionLabel = document.getElementById("description");
			var complexityLabel = document.getElementById("complexity");
			var checkpointsLabel = document.getElementById("checkpoints");

			var dateLabel = document.getElementById("date");

			const urlParams = new URLSearchParams(window.location.search);
			let levelIdentifier = urlParams.get('level');
			let levelIdentifierParts = levelIdentifier.split(':')
			let hasIteration = levelIdentifierParts.length === 3
			levelIdentifier = levelIdentifierParts.join('/');

			let detailResponse = await fetch(config.SERVER_URL + 'details/' + levelIdentifier);
			let detailResponseBody = await detailResponse.json();
			userID = levelIdentifierParts[0];
			console.log(userID);

			if(detailResponseBody.hidden === true && !userStore.isAdmin)
			{
				//Don't load hidden levels unless this is an admin
				titleLabel.innerHTML = '<b>NOT AVAILABLE</b>';
				creatorsLabel.innerHTML = '';
				descriptionLabel.innerHTML = '';
				complexityLabel.innerHTML = '';
				checkpointsLabel.innerHTML = '';
				dateLabel.innerHTML = '';
				return;
			}

			if(!hasIteration)
			{
				levelIdentifier = detailResponseBody.data_key.split(':')
				levelIdentifier.splice(0, 1)
				levelIdentifier = levelIdentifier.join('/')
			}

			let response = await fetch(config.SERVER_URL + 'download/' + levelIdentifier)
			//console.log(response)
			let responseBody = await response.arrayBuffer()
			let formattedBuffer = new Uint8Array(responseBody)
			let decoded = LevelMessage.decode(formattedBuffer)
			//console.log(`decoded = ${JSON.stringify(decoded)}`)

			var fullscreenButton = document.getElementById("fullscreen")
			fullscreenButton.onclick = openFullscreen
			
			if (list.length > 0 && listIndex != null) {
				let listButtons = document.getElementById("listButtons");
				let nextButton = document.getElementById("nextListItem");
				let backButton = document.getElementById("prevListItem");
				if (listIndex === list.length - 1) {
					nextButton.style.display = "none";
				}
				if (listIndex === 0) {
					backButton.style.display = "none";
				}

				let currentListItem = document.getElementById("currentListItem");
				let totalListItems = document.getElementById("totalListItems");
				currentListItem.innerHTML = listIndex + 1;
				totalListItems.innerHTML = list.length;

				let nextListItem = list[listIndex + 1];
				let previousListItem = list[listIndex - 1];
				if(nextListItem && "object_info" in nextListItem) {
					nextListItem = nextListItem["object_info"]
				}
				if(previousListItem && "object_info" in previousListItem) {
					previousListItem = previousListItem["object_info"]
				}
				nextButton.addEventListener("click", function() {
					location.href = "/levels/viewer/?level=" + nextListItem.identifier + (window.location.href.includes('verify_queue') ? '&verify_queue' : '');
					userStore.setListIndex(listIndex + 1);
				});
				backButton.addEventListener("click", function() {
					location.href = "/levels/viewer/?level=" + previousListItem.identifier + (window.location.href.includes('verify_queue') ? '&verify_queue' : '');
					userStore.setListIndex(listIndex - 1);
				});
				document.addEventListener("keydown", function(event) {
					if (event.key === '2') {
						location.href = "/levels/viewer/?level=" + nextListItem.identifier + (window.location.href.includes('verify_queue') ? '&verify_queue' : '');
						userStore.setListIndex(listIndex + 1);
					} else if (event.key === '1' && previousListItem) {
						location.href = "/levels/viewer/?level=" + previousListItem.identifier + (window.location.href.includes('verify_queue') ? '&verify_queue' : '');
						userStore.setListIndex(listIndex - 1);
					}
				});
				if ((nextListItem && document.referrer.includes(nextListItem.identifier)) || (previousListItem && document.referrer.includes(previousListItem.identifier)) || (document.referrer.includes("levels") && !document.referrer.includes("viewer"))) {
					listButtons.style.display = "block";
				}
			}

			let moderationContainer = document.getElementById("moderationcontainer")
			if(userStore.isVerifier === true)
			{
				const verifyButton = document.getElementById("verifyButton");
				const unverifyButton = document.getElementById("unverifyButton");
				const verifySkipButton = document.getElementById("verifySkipButton");
				const verifySkipSuccessButton = document.getElementById("verifySkipSuccessButton");
				verifyButton.style.display = "block";
				unverifyButton.style.display = "none";
				if (window.location.href.includes('verify_queue')) {
					verifySkipButton.style.display = "block";
				}
				verifySkipSuccessButton.style.display = "none";
				if("tags" in detailResponseBody && detailResponseBody.tags.length > 0)
				{
					for(const tag of detailResponseBody.tags)
					{
						if(tag === "ok")
						{
							verifyButton.style.display = "none";
							unverifyButton.style.display = "block";
							break;
						}
					}
				}
				verifyButton.addEventListener("click", function() {
					(async () => {
						let response = await fetch(config.SERVER_URL + 'tag/' + levelIdentifierParts[0] + '/' + levelIdentifierParts[1] + '?tags=ok&access_token=' + accessToken);
						let responseBody = await response.text();
						if (responseBody == "Success") {
							verifyButton.style.display = "none";
							unverifyButton.style.display = "block";
						} else {
							confirm(responseBody);
							return
						}

						let responseQueue = await fetch(config.SERVER_URL + 'remove_from_verification_queue/' + levelIdentifierParts[0] + '/' + levelIdentifierParts[1] + '?tags=&access_token=' + accessToken);
						let responseQueueBody = await responseQueue.text();
						if (responseQueueBody == "Success") {
							verifySkipSuccessButton.style.display = "block";
							verifySkipButton.style.display = "none";
						} else {
							confirm(responseQueueBody);
						}
					})();
				});
				unverifyButton.addEventListener("click", function() {
					(async () => {
						let response = await fetch(config.SERVER_URL + 'tag/' + levelIdentifierParts[0] + '/' + levelIdentifierParts[1] + '?tags=&access_token=' + accessToken);
						let responseBody = await response.text();
						if (responseBody == "Success") {
							verifyButton.style.display = "block";
							unverifyButton.style.display = "none";
						} else {
							confirm(responseBody);
						}
					})();
				});
				verifySkipButton.addEventListener("click", function() {
					(async () => {
						let response = await fetch(config.SERVER_URL + 'remove_from_verification_queue/' + levelIdentifierParts[0] + '/' + levelIdentifierParts[1] + '?tags=&access_token=' + accessToken);
						let responseBody = await response.text();
						if (responseBody == "Success") {
							verifySkipSuccessButton.style.display = "block";
							verifySkipButton.style.display = "none";
						} else {
							confirm(responseBody);
						}
					})();
				});
			}

			if(userStore.isAdmin)
			{
				const hideContainer = document.getElementById("hidecontainer");
				hideContainer.style.display = "block";
				const hideButton = document.getElementById("hideButton");
				hideButton.addEventListener("click", function() {
					(async () => {
						const reason = document.getElementById("hideReason").value;
						const identifierPath = levelIdentifierParts[0] + '/' + levelIdentifierParts[1]

						const hideResponse = await fetch(config.SERVER_URL + 'hide/' + identifierPath, {headers: {'Authorization': 'Bearer ' + accessToken}})
						const hideResponseBody = await hideResponse.text();
						if (hideResponse.status != 200 || hideResponseBody !== 'Success') {
							confirm("Error: " + hideResponseBody);
						} else {
							hideContainer.style.display = "none";
						}
						if (reason !== "no_punish") {
							let extra = ''
							if (reason === "level_glitch") {
								extra += "?reason=message&type=message&message=A+level+you+published+relies+on+a+glitch+that+is+not+working+anymore.+If+you+fix+the+level,+please+let+me+know+through+discord+or+tiktok+to+make+it+available+again."
							} else {
								extra += '?reason=' + reason
							}
							const moderationResponse = await fetch(config.SERVER_URL + 'moderation_action/' + levelIdentifierParts[0] + extra, {headers: {'Authorization': 'Bearer ' + accessToken}})
							const moderationResponseBody = await moderationResponse.text();
							if (moderationResponse.status != 200 || moderationResponseBody !== 'Success') {
								confirm("Error: " + moderationResponseBody);
							}
							const resetResponse = await fetch(config.SERVER_URL + 'reports_reset/' + levelIdentifierParts[0], {headers: {'Authorization': 'Bearer ' + accessToken}})
							const resetResponseBody = await resetResponse.text();
							if(resetResponse.status != 200 || resetResponseBody !== 'Success'){
								confirm("Error: " + resetResponseBody);
							}
						}
					})();
				});

				const approveButton = document.getElementById("approveButton");
				approveButton.addEventListener("click", function() {
					(async () => {
						const identifierPath = levelIdentifierParts[0] + '/' + levelIdentifierParts[1]

						const approveResponse = await fetch(config.SERVER_URL + 'ignore_reports/' + identifierPath, {headers: {'Authorization': 'Bearer ' + accessToken}})
						const approveResponseBody = await approveResponse.text();
						if(approveResponse.status != 200 || approveResponseBody !== 'Success') {
							confirm("Error: " + approveResponseBody);
						} else {
							hideContainer.style.display = "none";
						}
					})();
				});

				( async () => {
					const identifierPath = levelIdentifierParts[0] + '/' + levelIdentifierParts[1]
					const reportsResponse = await fetch(config.SERVER_URL + 'report_info/' + identifierPath, {headers: {'Authorization': 'Bearer ' + accessToken}})
					let reports_data = await reportsResponse.text();
					if(reportsResponse.status != 200 || reports_data === 'Not authorized!') {
						//confirm("Error: " + reports_data);
						return false;
					}
					reports_data = JSON.parse(reports_data);
					if (reports_data && 'object_info' in reports_data) {
						const reportElement = document.getElementById("reports");
						reportElement.style.display = "block";
						const reportTitle = document.getElementById("reportsTitle");
						reportTitle.innerText += `${reports_data.reported_score} (${reports_data.reported_count})`;
						const reports = document.getElementById("reports");
						const reports_data_filtered = Object.entries(reports_data).filter(([key]) => key.includes('reported_score_'))
						for (const report of reports_data_filtered) {
							reports.innerHTML += `${report[0].slice(15)}:${report[1]}<br>`;
						}
					}

					console.log(reports_data)

					if(reports_data && "images" in reports_data) {
						for(const image of reports_data.images)
						{
							let moderationImageElement = document.createElement("div");
							var img = document.createElement("img");
							img.src = 'https://grab-images.slin.dev/' + image.key;
							moderationImageElement.appendChild(img);
							moderationImageElement.appendChild(document.createElement("br"));
							moderationImageElement.appendChild(document.createElement("br"));
							moderationImageElement.onclick = function() {
								console.log(image.camera_position)
								camera.position.set(-image.camera_position[0], image.camera_position[1], -image.camera_position[2]);
							}
							moderationContainer.appendChild(moderationImageElement);
						}
					}
				})();
				
				let linebreak = document.createElement("br");
				moderationContainer.appendChild(linebreak);

				let creatorButton = document.createElement("button");
				creatorButton.className = "creatorButton";
				moderationContainer.appendChild(creatorButton);
				creatorButton.innerHTML = "<b>Make Creator</b>";
				creatorButton.onclick = function () {
				  	(async () => {
						let response = await fetch(config.SERVER_URL + 'set_user_info_admin/' + levelIdentifierParts[0] + '?access_token=' + accessToken + '&is_creator=true');
						let responseBody = await response.text();
						console.log(responseBody);
						confirm("Result: " + responseBody);
						if(response.status != 200 && accessToken && responseBody === "Not authorized!")
						{
							logout();
						}
					})();
				};

				linebreak = document.createElement("br");
				moderationContainer.appendChild(linebreak);
				linebreak = document.createElement("br");
				moderationContainer.appendChild(linebreak);
			}


			await shapePromise;
			await objectPromise;

			let skyMaterial = new THREE.ShaderMaterial();
			skyMaterial.vertexShader = SHADERS.skyVS;
			skyMaterial.fragmentShader = SHADERS.skyFS;
			skyMaterial.flatShading = false;
			skyMaterial.depthWrite = false;
			skyMaterial.side = THREE.BackSide;

			let sunAngle = new THREE.Euler(THREE.MathUtils.degToRad(45), THREE.MathUtils.degToRad(315), 0.0)
			let sunAltitude = 45.0
			let horizonColor = [0.916, 0.9574, 0.9574]
			if(decoded.ambienceSettings)
			{
				sunAngle = new THREE.Euler(THREE.MathUtils.degToRad(decoded.ambienceSettings.sunAltitude), THREE.MathUtils.degToRad(decoded.ambienceSettings.sunAzimuth), 0.0);

				skyMaterial.uniforms["cameraFogColor0"] = { value: [decoded.ambienceSettings.skyHorizonColor.r, decoded.ambienceSettings.skyHorizonColor.g, decoded.ambienceSettings.skyHorizonColor.b] }
				skyMaterial.uniforms["cameraFogColor1"] = { value: [decoded.ambienceSettings.skyZenithColor.r, decoded.ambienceSettings.skyZenithColor.g, decoded.ambienceSettings.skyZenithColor.b] }
				skyMaterial.uniforms["sunSize"] = { value: decoded.ambienceSettings.sunSize }

				sunAltitude = decoded.ambienceSettings.sunAltitude
				horizonColor = [decoded.ambienceSettings.skyHorizonColor.r, decoded.ambienceSettings.skyHorizonColor.g, decoded.ambienceSettings.skyHorizonColor.b]
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
			skySunDirection.x = skySunDirection.x;
			skySunDirection.y = skySunDirection.y;
			skySunDirection.z = skySunDirection.z;

			let sunColorFactor = 1.0 - sunAltitude / 90.0
			sunColorFactor *= sunColorFactor
			sunColorFactor = 1.0 - sunColorFactor
			sunColorFactor *= 0.8
			sunColorFactor += 0.2
			let sunColor = [horizonColor[0] * (1.0 - sunColorFactor) + sunColorFactor, horizonColor[1] * (1.0 - sunColorFactor) + sunColorFactor, horizonColor[2] * (1.0 - sunColorFactor) + sunColorFactor]

			skyMaterial.uniforms["sunDirection"] = { value: skySunDirection }
			skyMaterial.uniforms["sunColor"] = { value: sunColor }

			const sky = new THREE.Mesh(shapes[1], skyMaterial)
			sky.frustumCulled = false
			sky.renderOrder = 1000 //sky should be rendered after opaque, before transparent
			scene.add(sky);

			const allMaterials = [...materials, ...objectMaterials]

			for(let material of allMaterials)
			{
				let density = 0.0
				if(decoded.ambienceSettings)
				{
					material.uniforms["cameraFogColor0"] = { value: [decoded.ambienceSettings.skyHorizonColor.r, decoded.ambienceSettings.skyHorizonColor.g, decoded.ambienceSettings.skyHorizonColor.b] }
					material.uniforms["cameraFogColor1"] = { value: [decoded.ambienceSettings.skyZenithColor.r, decoded.ambienceSettings.skyZenithColor.g, decoded.ambienceSettings.skyZenithColor.b] }
					material.uniforms["sunSize"] = { value: decoded.ambienceSettings.sunSize }
					density = decoded.ambienceSettings.fogDDensity
				}
				else
				{
					material.uniforms["cameraFogColor0"] = { value: [0.916, 0.9574, 0.9574] }
					material.uniforms["cameraFogColor1"] = { value: [0.28, 0.476, 0.73] }
					material.uniforms["sunSize"] = { value: 1.0 }
				}

				material.uniforms["sunDirection"] = { value: skySunDirection }
				material.uniforms["sunColor"] = { value: sunColor }

				let densityFactor = density * density * density * density
				let fogDensityX = 0.5 * densityFactor + 0.000001 * (1.0 - densityFactor)
				let fogDensityY = 1.0/(1.0 - Math.exp(-1500.0 * fogDensityX))

				material.uniforms["cameraFogDistance"] = { value: [fogDensityX, fogDensityY] }
			}

			let signCounter = 0;
			let realComplexity = 0;

			const loadLevelNodes = function(nodes, parentNode){

				let cameraPosition = undefined
				let cameraRotation = undefined

				for(let node of nodes)
				{
					let object = undefined
					if(node.levelNodeGroup)
					{
						object = new THREE.Object3D()
						parentNode.add(object);
						object.position.x = -node.levelNodeGroup.position.x
						object.position.y = node.levelNodeGroup.position.y
						object.position.z = -node.levelNodeGroup.position.z

						object.scale.x = node.levelNodeGroup.scale.x
						object.scale.y = node.levelNodeGroup.scale.y
						object.scale.z = node.levelNodeGroup.scale.z

						object.quaternion.x = -node.levelNodeGroup.rotation.x
						object.quaternion.y = node.levelNodeGroup.rotation.y
						object.quaternion.z = -node.levelNodeGroup.rotation.z
						object.quaternion.w = node.levelNodeGroup.rotation.w

						object.initialPosition = object.position.clone()
						object.initialRotation = object.quaternion.clone()
						object.isGroup = true

						loadLevelNodes(node.levelNodeGroup.childNodes, object)

						//realComplexity += 1
					}
					else if(node.levelNodeGravity)
					{
						let particleGeometry = new THREE.BufferGeometry();

						let particleColor = new THREE.Color(1.0, 1.0, 1.0);
						if(node.levelNodeGravity?.mode == 1)
						{
							particleColor = new THREE.Color(1.0, 0.6, 0.6);
						}
						let particleMaterial = new THREE.PointsMaterial({ color: particleColor, size: 0.2 });

						object = new THREE.Object3D()
						object.position.x = -node.levelNodeGravity.position.x
						object.position.y = node.levelNodeGravity.position.y
						object.position.z = -node.levelNodeGravity.position.z

						object.scale.x = node.levelNodeGravity.scale.x
						object.scale.y = node.levelNodeGravity.scale.y
						object.scale.z = node.levelNodeGravity.scale.z

						object.quaternion.x = -node.levelNodeGravity.rotation.x
						object.quaternion.y = node.levelNodeGravity.rotation.y
						object.quaternion.z = -node.levelNodeGravity.rotation.z
						object.quaternion.w = node.levelNodeGravity.rotation.w
						
						object.initialPosition = object.position.clone()
						object.initialRotation = object.quaternion.clone()

						let particleCount = Math.floor(object.scale.x * object.scale.y * object.scale.z * 10)
						particleCount = Math.min(particleCount, 2000);
						let particlePositions = [];

						for(let i = 0; i < particleCount; i++)
						{
							let x = (Math.random() - 0.5) * object.scale.x;
							let y = (Math.random() - 0.5) * object.scale.y;
							let z = (Math.random() - 0.5) * object.scale.z;

							particlePositions.push(x, y, z);
						}

						particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
						let particlePoints = new THREE.Points(particleGeometry, particleMaterial);
						object.add(particlePoints);
						parentNode.add(object);

						particles.push(particlePoints);
						particlesPositions.push(particlePositions);
						particlesDirections.push([node.levelNodeGravity.direction.x, node.levelNodeGravity.direction.y, node.levelNodeGravity.direction.z])

						realComplexity += 10;
					}
					else if(node.levelNodeStatic)
					{
						// console.log(node.levelNodeStatic.material)
						let material = materials[Math.min(Math.max(node.levelNodeStatic.material, 0), materials.length-1)]
						if(node.levelNodeStatic.material === root.COD.Types.LevelNodeMaterial.DEFAULT_COLORED && node.levelNodeStatic.isNeon)
						{
							material = objectMaterials[3] //Use neon material if this is a neon colored block
						}

						let newMaterial = material.clone()
						newMaterial.uniforms.colorTexture = material.uniforms.colorTexture

						if(node.levelNodeStatic.material == root.COD.Types.LevelNodeMaterial.DEFAULT_COLORED && node.levelNodeStatic.color)
						{
							newMaterial.uniforms.diffuseColor.value = [node.levelNodeStatic.color.r, node.levelNodeStatic.color.g, node.levelNodeStatic.color.b]

							const specularFactor = Math.sqrt(node.levelNodeStatic.color.r * node.levelNodeStatic.color.r + node.levelNodeStatic.color.g * node.levelNodeStatic.color.g + node.levelNodeStatic.color.b * node.levelNodeStatic.color.b) * 0.15
							newMaterial.uniforms.specularColor.value = [specularFactor, specularFactor, specularFactor, 16.0]
						}

						object = new THREE.Mesh(shapes[node.levelNodeStatic.shape-1000], newMaterial)
						parentNode.add(object);
						object.position.x = -node.levelNodeStatic.position.x
						object.position.y = node.levelNodeStatic.position.y
						object.position.z = -node.levelNodeStatic.position.z

						object.scale.x = node.levelNodeStatic.scale.x
						object.scale.y = node.levelNodeStatic.scale.y
						object.scale.z = node.levelNodeStatic.scale.z

						object.quaternion.x = -node.levelNodeStatic.rotation.x
						object.quaternion.y = node.levelNodeStatic.rotation.y
						object.quaternion.z = -node.levelNodeStatic.rotation.z
						object.quaternion.w = node.levelNodeStatic.rotation.w

						object.initialPosition = object.position.clone()
						object.initialRotation = object.quaternion.clone()

						let targetVector = new THREE.Vector3()
						let targetQuaternion = new THREE.Quaternion()
						let worldMatrix = new THREE.Matrix4()
						worldMatrix.compose(object.getWorldPosition(targetVector), object.getWorldQuaternion(targetQuaternion), object.getWorldScale(targetVector))

						let normalMatrix = new THREE.Matrix3()
						normalMatrix.getNormalMatrix(worldMatrix)
						newMaterial.uniforms.worldNormalMatrix.value = normalMatrix

						realComplexity += 2
					}
					else if(node.levelNodeCrumbling)
					{
						let material = materials[node.levelNodeCrumbling.material]
						let newMaterial = material.clone()
						newMaterial.uniforms.colorTexture = material.uniforms.colorTexture

						object = new THREE.Mesh(shapes[node.levelNodeCrumbling.shape-1000], newMaterial);
						parentNode.add(object);
						object.position.x = -node.levelNodeCrumbling.position.x
						object.position.y = node.levelNodeCrumbling.position.y
						object.position.z = -node.levelNodeCrumbling.position.z

						object.scale.x = node.levelNodeCrumbling.scale.x
						object.scale.y = node.levelNodeCrumbling.scale.y
						object.scale.z = node.levelNodeCrumbling.scale.z

						object.quaternion.x = -node.levelNodeCrumbling.rotation.x
						object.quaternion.y = node.levelNodeCrumbling.rotation.y
						object.quaternion.z = -node.levelNodeCrumbling.rotation.z
						object.quaternion.w = node.levelNodeCrumbling.rotation.w

						object.initialPosition = object.position.clone()
						object.initialRotation = object.quaternion.clone()

						let targetVector = new THREE.Vector3()
						let targetQuaternion = new THREE.Quaternion()
						let worldMatrix = new THREE.Matrix4()
						worldMatrix.compose(object.getWorldPosition(targetVector), object.getWorldQuaternion(targetQuaternion), object.getWorldScale(targetVector))

						let normalMatrix = new THREE.Matrix3()
						normalMatrix.getNormalMatrix(worldMatrix)
						newMaterial.uniforms.worldNormalMatrix.value = normalMatrix

						realComplexity += 3
					}
					else if(node.levelNodeStart)
					{
						object = new THREE.Mesh(objects[0], objectMaterials[0]);
						parentNode.add(object);
						object.position.x = -node.levelNodeStart.position.x
						object.position.y = node.levelNodeStart.position.y
						object.position.z = -node.levelNodeStart.position.z

						object.scale.x = node.levelNodeStart.radius * 2.0;
						object.scale.z = node.levelNodeStart.radius * 2.0;

						object.initialPosition = object.position.clone()
						object.initialRotation = object.quaternion.clone()

						cameraPosition = [object.position.x, object.position.y + 2.0, object.position.z]
						
						var goToStartLabel = document.getElementById("startButton");
						goToStartLabel.innerHTML = "Go to Start"
						goToStartLabel.style.cursor="pointer";
						goToStartLabel.onclick = function() {
							camera.position.set(object.position.x, object.position.y + 2.0, object.position.z);
						}
					}
					else if(node.levelNodeFinish)
					{
						object = new THREE.Mesh(objects[0], objectMaterials[1]);
						parentNode.add(object);
						object.position.x = -node.levelNodeFinish.position.x
						object.position.y = node.levelNodeFinish.position.y
						object.position.z = -node.levelNodeFinish.position.z

						object.scale.x = node.levelNodeFinish.radius * 2.0;
						object.scale.z = node.levelNodeFinish.radius * 2.0;

						object.initialPosition = object.position.clone()
						object.initialRotation = object.quaternion.clone()

						var goToFinishLabel = document.getElementById("finishButton");
						goToFinishLabel.innerHTML = "Go to Finish"
						goToFinishLabel.style.cursor="pointer";

						goToFinishLabel.onclick = function() {
							camera.position.set(object.position.x, object.position.y + 2.0, object.position.z);
						}
					}
					else if(node.levelNodeSign)
					{
						let material = objectMaterials[2]
						let newMaterial = material.clone()
						newMaterial.uniforms.colorTexture = material.uniforms.colorTexture

						object = new THREE.Mesh(objects[1], newMaterial);
						parentNode.add(object);
						object.position.x = -node.levelNodeSign.position.x
						object.position.y = node.levelNodeSign.position.y
						object.position.z = -node.levelNodeSign.position.z

						object.quaternion.x = -node.levelNodeSign.rotation.x
						object.quaternion.y = node.levelNodeSign.rotation.y
						object.quaternion.z = -node.levelNodeSign.rotation.z
						object.quaternion.w = node.levelNodeSign.rotation.w

						object.initialPosition = object.position.clone()
						object.initialRotation = object.quaternion.clone()

						let signText = node.levelNodeSign.text
						if(userStore.isModerator && signText && signText.length > 0)
						{
							let signTextElement = document.createElement("div");
							const signTextNode = document.createTextNode("Sign " + signCounter + ": " + signText);
							signTextElement.appendChild(signTextNode);
							signTextElement.appendChild(document.createElement("br"));
							signTextElement.appendChild(document.createElement("br"));
							signTextElement.onclick = function() {
								camera.position.set(object.position.x, object.position.y + 1.0, object.position.z);
							}
							moderationContainer.appendChild(signTextElement);
						}

						signCounter += 1;
						realComplexity += 5
					}

					if(object !== undefined)
					{
						//Attach data of the first animation to the object (which is all the initial animation system supports anyway)
						if(node.animations && node.animations.length > 0 && node.animations[0].frames && node.animations[0].frames.length > 0)
						{
							object.animation = node.animations[0]
							object.animation.currentFrameIndex = 0
							animatedObjects.push(object)
						}
					}
				}

				if(animatedObjects.length > 0)
				{
					const slider = document.getElementById("time-slider")
					slider.style.display = "block"
				}

				let cameraPositionFromUrl = urlParams.get('camera_position');
				let cameraRotationFromUrl = urlParams.get('camera_rotation');
				if(cameraPositionFromUrl && cameraRotationFromUrl)
				{
					cameraPosition = cameraPositionFromUrl.split(',').map(parseFloat);
					cameraRotation = cameraRotationFromUrl.split(',').map(parseFloat);
				}

				if(cameraPosition)
				{
					camera.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
				}

				if(cameraRotation)
				{
					controls.eulerVector.x = cameraRotation[0];
					controls.eulerVector.y = cameraRotation[1];
					controls.updateRotationVector();
				}
			};

			loadLevelNodes(decoded.levelNodes, scene);

			//Creating these as text elements to prevent embeded html to be rendered by the browser
			const titleTitleNode = document.createTextNode('title: ');
			titleLabel.appendChild(titleTitleNode);
			const titleFormattingNode = document.createElement('b');
			titleLabel.appendChild(titleFormattingNode);
			const titleNode = document.createTextNode(decoded.title);
			titleFormattingNode.appendChild(titleNode);

			const creatorsTitleNode = document.createTextNode('creators: ');
			creatorsLabel.appendChild(creatorsTitleNode);
			const creatorsFormattingNode = document.createElement('i');
			creatorsLabel.appendChild(creatorsFormattingNode);
			const creatorsNode = document.createTextNode(decoded.creators);
			creatorsFormattingNode.appendChild(creatorsNode);

			const descriptionNode = document.createTextNode('description: ' + decoded.description);
			descriptionLabel.appendChild(descriptionNode);
			const complexityNode = document.createTextNode('complexity: ' + decoded.complexity + ' (real: ' + realComplexity + ')');
			complexityLabel.appendChild(complexityNode);
			const checkpointsNode = document.createTextNode('checkpoints: ' + decoded.maxCheckpointCount);
			checkpointsLabel.appendChild(checkpointsNode);

			const creationDate = new Date(detailResponseBody.creation_timestamp);
			const updatedDate = new Date(detailResponseBody.update_timestamp);
			let dateString = "created: " + creationDate.toDateString()
			if(creationDate.toDateString() !== updatedDate.toDateString()) dateString += " (updated: " + updatedDate.toDateString() + ")"
			const dateNode = document.createTextNode(dateString);
			dateLabel.appendChild(dateNode);

			//Show OK stamp on levels that have the tag
			if("tags" in detailResponseBody && detailResponseBody.tags.length > 0)
			{
				for(const tag of detailResponseBody.tags)
				{
					if(tag === "ok")
					{
						const infoNode = document.getElementById("info");
						let stamp = document.createElement("img");
						stamp.className = "info-stamp-ok";
						stamp.src = imageStampOk;
						infoNode.appendChild(stamp);
						break;
					}
				}
			}

			if("images" in detailResponseBody && "thumb" in detailResponseBody.images && "key" in detailResponseBody.images.thumb && detailResponseBody.images.thumb.key.length > 0)
			{
				const infoNode = document.getElementById("info");
				let thumbnailImage = document.createElement("img");
				thumbnailImage.src = "https://grab-images.slin.dev/" + detailResponseBody.images.thumb.key;
				thumbnailImage.className = "previewImage"
				infoNode.prepend(thumbnailImage);

				let linebreak = document.createElement("br");
				infoNode.prepend(linebreak);
			}
			

			//Get level statistics
			(async () => {
				const urlParams = new URLSearchParams(window.location.search);
				let levelIdentifier = urlParams.get('level');
				levelIdentifier = levelIdentifier.split(':').join('/');

				let response = await fetch(config.SERVER_URL + 'statistics/' + levelIdentifier);
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
				responseBody.average_time
					? timeLabel.innerHTML = "average time: <b>" + responseBody.average_time + "</b>"
					: timeLabel.innerHTML = "average time: <b>N/a</b>"

				if(userStore.isLoggedIn){
					var reportButton = document.getElementById("reportButton")
					reportButton.style.display='block'
					levelIdentifier = detailResponseBody.data_key.split(':')
					levelIdentifier.splice(0, 1)
					levelIdentifier = levelIdentifier.join('/')

					reportButton.addEventListener("click", function() {
						(async () => {
							let reasonMapping = {
								sexual: "Sexual Content / Genitals",
								violence: "Detailed Violence",
								hatespeech: "Offensive Language",
								loweffort: "Very low effort level",
								glitch: "Requires to use a Glitch to finish",
								other: "Other"
							}
							let onOk = function(value, image) {
								(async () => {
									let response = await fetch(config.SERVER_URL + 'report/' + levelIdentifier + '?access_token=' +  userStore.accessToken + '&reason=' + value, {
										method: 'POST',
										  headers: {
										    'Content-Type': 'application/json'
										  },
										  body: image
										})
									
									let responseBody = await response.text();
									console.log(responseBody);
									confirm(response.status == 200? "Success" : "Error: Need to login again?");
									if(response.status != 200 &&  userStore.accessToken && responseBody === "Invalid Access Token")
									{
										logout();
									}
								})()
							}
							showOptionsDialog("Report Level", "Why should this level be removed?", reasonMapping, onOk, false, undefined)
						})();
					});
				}
			})()
		})()
	});
}
function showOptionsDialog(title, subtitle, options, onOk, imageRequired, reasonValue)
{
	let dialog = document.getElementById('popup')
	let titleElement = document.getElementById('popup-title')
	let descriptionElement = document.getElementById('popup-description')
	let reasonSelector = document.getElementById('popup-reason')
	let imageContext = document.getElementById('popup-thumbnail')
	let imagePreview = document.getElementById('popup-report-image')
	let closeButton = document.getElementById('popup-button-cancel')
	let okButton = document.getElementById('popup-button-ok')
	let setImageBtn = document.getElementById('report-set-image')
	let reportCaptureBtn  = document.getElementById('report-take-image')

	titleElement.innerHTML = title
	descriptionElement.innerHTML = subtitle
	reasonSelector.style.display='none'
	imageContext.style.display="none"
	reportCaptureBtn.style.display="none"
	okButton.style.display="initial"

	if (imageRequired == true) {
		imageContext.style.display = "flex"
		okButton.style.display = "none"

		imageContext.addEventListener("click", function() {
			dialog.removeAttribute('open')
			reportCaptureBtn.style.display ='block'
		})

		reportCaptureBtn.addEventListener("click", function() 
		{	
			var tempCanvas = document.createElement('canvas')
			tempCanvas.width = 512
			tempCanvas.height = 288

			let ctx = tempCanvas.getContext('2d')
			ctx.drawImage(canvas, 0, 0, 512, 288)

			setImageBtn.classList.add('report-set-image')
			reportCaptureBtn.style.display='none'
			dialog.setAttribute('open','open')
			okButton.style.display = 'initial'

			tempCanvas.toBlob(function(blob) {
				imagePreview.src = URL.createObjectURL(blob)
				okButton.onclick = function() {
					dialog.removeAttribute('open')
					onOk(reasonValue, blob)
					tempCanvas.remove()
					setImageBtn.classList.remove('report-set-image')

				}
			});			

		})
	}
	if(options !== undefined){

		reasonSelector.style.display='block';
		reasonSelector.innerHTML = ""

		let selectOption = document.createElement("option")
		selectOption.innerHTML = "- Select -"
		reasonSelector.appendChild(selectOption)

		for(let key in options)
		{
			let option = document.createElement("option")
			option.innerHTML = options[key]
			option.value = key
			reasonSelector.appendChild(option)
		}
	}
	if(!dialog.hasAttribute('open'))
	{	
		// show the dialog 
		dialog.setAttribute('open','open');

		closeButton.onclick = function(event) { dialog.removeAttribute('open'); options?reasonSelector.selectedIndex = 0:null; }
		okButton.onclick = function(event) {
				if(reasonSelector.selectedIndex === 0) return //Don't allow to report without a reason!
				dialog.removeAttribute('open');
				if(options !== undefined){
					showOptionsDialog("Report Thumbnail", "Take a photo for the report in the map", undefined, onOk, true, reasonSelector.value)
					reasonSelector.selectedIndex = 0;
				}
			}
	}
}

function updateObjectAnimation(object, time)
{
	let animation = object.animation
	const animationFrames = animation.frames
	const relativeTime = (time * object.animation.speed) % animationFrames[animationFrames.length - 1].time;
	if (parseInt(document.getElementById('time-slider').max) < animationFrames[animationFrames.length - 1].time) {
		document.getElementById('time-slider').max = `${animationFrames[animationFrames.length - 1].time}`
	}
	
	//Find frames to blend between
	let oldFrame = animationFrames[animation.currentFrameIndex];
	let newFrameIndex = animation.currentFrameIndex + 1;
	if(newFrameIndex >= animationFrames.length) newFrameIndex = 0;
	let newFrame = animationFrames[newFrameIndex];
	
	let loopCounter = 0; //Used to prevent endless loop with only one frame or all having the same time
	while(loopCounter <= animationFrames.length)
	{
		oldFrame = animationFrames[animation.currentFrameIndex];
		newFrameIndex = animation.currentFrameIndex + 1;
		if(newFrameIndex >= animationFrames.length) newFrameIndex = 0;
		newFrame = animationFrames[newFrameIndex];
		
		if(oldFrame.time <= relativeTime && newFrame.time > relativeTime) break;
		animation.currentFrameIndex += 1;
		if(animation.currentFrameIndex >= animationFrames.length - 1) animation.currentFrameIndex = 0;
		
		loopCounter += 1;
	}

	let factor = 0.0
	let timeDiff = (newFrame.time - oldFrame.time);
	if(Math.abs(timeDiff) > 0.00000001) //Prevent dividing by 0 if time of both frames is equal
	{
		factor = (relativeTime - oldFrame.time) / timeDiff;
	}

	const oldRotation = new THREE.Quaternion( -oldFrame.rotation.x, oldFrame.rotation.y, -oldFrame.rotation.z, oldFrame.rotation.w )
	const newRotation = new THREE.Quaternion( -newFrame.rotation.x, newFrame.rotation.y, -newFrame.rotation.z, newFrame.rotation.w )
	const finalRotation = new THREE.Quaternion()
	finalRotation.slerpQuaternions(oldRotation, newRotation, factor)

	const oldPosition = new THREE.Vector3( -oldFrame.position.x, oldFrame.position.y, -oldFrame.position.z )
	const newPosition = new THREE.Vector3( -newFrame.position.x, newFrame.position.y, -newFrame.position.z )
	const finalPosition = new THREE.Vector3()
	finalPosition.lerpVectors(oldPosition, newPosition, factor)

	object.position.copy(object.initialPosition).add(finalPosition.applyQuaternion(object.initialRotation))
	object.quaternion.multiplyQuaternions(object.initialRotation, finalRotation)
}

function onWindowResize()
{
	let SCREEN_HEIGHT = window.innerHeight;
	let SCREEN_WIDTH = window.innerWidth;

	camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
	camera.updateProjectionMatrix();

	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
}

document.getElementById('time-slider').addEventListener('input', function (){
	isSliderDragging=true
});

document.getElementById('time-slider').addEventListener('mouseup', function(){
    isSliderDragging = false
});
document.getElementById('time-slider').addEventListener('touchend', function(){
    isSliderDragging = false
});

function animation()
{
	const delta = clock.getDelta();
	if(isSliderDragging==true)
	{
		for (let object of animatedObjects)
		{
			updateObjectAnimation(object, parseInt(document.getElementById('time-slider').value))
		} 
		animationTime=parseInt(document.getElementById('time-slider').value)
	}
	else
	{
		controls.update(delta);
		animationTime += delta;
		document.getElementById('time-slider').value = animationTime
	}

	for(let object of animatedObjects)
	{
		updateObjectAnimation(object, animationTime)
	}

	/*let particleRenderDistance = 1000;
	let currentPosition = camera.position;
	for(let i = 0; i < particles.length; i++)
	{
		let particle = particles[i];
		let particlePositions = particlesPositions[i];
		let particleDirection = particlesDirections[i];

		let visibleParticles = [];
		for (let j = 0; j < particlePositions.length; j++) {
			let position = new THREE.Vector3(particlePositions[j * 3] , particlePositions[j * 3 + 1], particlePositions[j * 3 + 2]);
			position.x += particleDirection[0] * delta
			position.y += particleDirection[1] * delta
			position.z += particleDirection[2] * delta
			//let globalPosition = position.clone().applyMatrix4(particle.matrixWorld);
			//if (globalPosition.distanceTo(currentPosition) < particleRenderDistance) {
				visibleParticles.push(position.x, position.y, position.z);
			//}
		}

		particle.geometry.setAttribute('position', new THREE.Float32BufferAttribute(visibleParticles, 3));
	}*/

	renderer.render(scene, camera);
}

function toggleFog()
{
	isFogEnabled = !isFogEnabled
	let fogValue = isFogEnabled? 1.0 : 0.0
	
	scene.traverse(function(node) {
		if(node instanceof THREE.Mesh)
		{
			if("material" in node && "fogEnabled" in node.material.uniforms)
			{
				node.material.uniforms["fogEnabled"].value = fogValue
			}
		}
	})
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

export async function copyLevelURLPressed()
{
	const urlParams = new URLSearchParams(window.location.search);
	const url = window.location.href.split("?")[0];
	const levelID = urlParams.get("level");
	await navigator.clipboard.writeText(url + "?level=" + levelID);
}

export function copyLocationURLPressed() {
	const urlParams = new URLSearchParams(window.location.search);
	const url = window.location.href.split("?")[0];
	const levelID = urlParams.get("level");
	const cameraPosition = camera.position;
	const cameraRotation = controls.eulerVector;
	const positionString = `camera_position=${cameraPosition.x},${cameraPosition.y},${cameraPosition.z}`;
	const rotationString = `camera_rotation=${cameraRotation.x},${cameraRotation.y}`;
	const newUrl = `${url}?level=${levelID}&${positionString}&${rotationString}`;
	navigator.clipboard.writeText(newUrl); 
}

function saveDataAsFile(filename, data) {
    const blob = new Blob([data], {type: 'text/json'});
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;        
        document.body.appendChild(elem);
        elem.click();        
        document.body.removeChild(elem);
    }
}

export function exportLevelAsGLTF()
{
    // Instantiate a exporter
	const exporter = new GLTFExporter();

	// Parse the input and generate the glTF output
	exporter.parse(
	    scene,
	    // called when the gltf has been generated
	    function ( gltf ) {

	        console.log( gltf );
	        saveDataAsFile( "test.gltf", JSON.stringify(gltf) );

	    },
	    // called when there is an error in the generation
	    function ( error ) {

	        console.log( 'An error happened' );

	    },
	    {}
	);
}

document.getElementById("leaderboard-button").addEventListener("click", openLeaderboard);
document.getElementById("leaderboard-close").addEventListener("click", closeLeaderboard);
document.getElementById("applyLeaderboardModifications").addEventListener("click", removeLeaderboardTimes);

function openLeaderboard() {
	document.getElementById("overlay").style.display = "block";
	document.getElementById("leaderboard").style.display = "block";
	loadLeaderboardData();
}

function closeLeaderboard() {
	document.getElementById("overlay").style.display = "none";
	document.getElementById("leaderboard").style.display = "none";
	removedTimes = [];
	document.getElementById("applyLeaderboardModifications").style.display = "none";
	document.getElementById("leaderboard-content").innerHTML = "";
}

async function loadLeaderboardData() {
	const urlParams = new URLSearchParams(window.location.search);
	let levelIdentifier = urlParams.get('level');
	let levelIdentifierParts = levelIdentifier.split(':')
	let hasIteration = levelIdentifierParts.length === 3
	const endpointUrl = config.SERVER_URL + 'statistics_top_leaderboard/' + levelIdentifierParts[0] + '/' + levelIdentifierParts[1];
	try {
		const response = await fetch(endpointUrl);
		if (response.ok) {
			const data = await response.json();
			displayLeaderboardData(data);
		} else {
			console.error("Failed to fetch leaderboard data:", response.statusText);
		}
	} catch (error) {
		console.error("Error fetching leaderboard data:", error);
	}
}

function displayLeaderboardData(data) {
	const leaderboardContent = document.getElementById("leaderboard-content");
	leaderboardContent.innerHTML = "";

	if (data.length === 0) {
		const placeholder = document.createElement("div");
		placeholder.className = "leaderboard-placeholder";
		placeholder.innerHTML = "No data yet!<br>Be the first to set a record!";
		leaderboardContent.appendChild(placeholder);
	} else {
		const pinia = createPinia()
		pinia.use(piniaPluginPersistedstate)
		const app = createApp(App)
		app.use(pinia)
		const userStore = useUserStore(pinia)
		let maxDecimals = 0;
		data.forEach((entry) => {
			let decimals = entry.best_time.toString().split(".")[1];
			if (decimals) {
				maxDecimals = Math.max(maxDecimals, decimals.length);
			}
		});
		data.forEach((entry, index) => {
			const row = document.createElement("div");
			row.className = "leaderboard-row";

			const position = document.createElement("div");
			position.className = "leaderboard-position";
			position.textContent = entry.position + 1;

			const name = document.createElement("a");
			name.className = "leaderboard-name";
			name.textContent = entry.user_name;
			name.href = `/levels?tab=tab_other_user&user_id=${entry.user_id}`;

			const time = document.createElement("div");
			time.className = "leaderboard-time";
			let minutes = Math.floor(entry.best_time / 60);
			let seconds = (entry.best_time % 60).toFixed(maxDecimals);
			if (minutes < 10) { minutes = "0" + minutes; }
			if (seconds < 10) { seconds = "0" + seconds; }
			time.textContent = minutes + ':' + seconds;
			
			const button = document.createElement("button");
			button.className = "leaderboard-button";
			button.textContent = "x";
			button.onclick = function () {
				for (let i = 0; i < removedTimes.length; i++) {
					if (removedTimes[i][0] === entry.user_id) {
						removedTimes[i][1].classList.remove("leaderboard-row-removed");
						removedTimes.splice(i, 1);
						document.getElementById("applyLeaderboardModifications").style.display = removedTimes.length > 0 ? "block" : "none";
						return;
					}
				}
				removedTimes.push([entry.user_id, row]);
				row.classList.add("leaderboard-row-removed");
				document.getElementById("applyLeaderboardModifications").style.display = "block";
			};
			

			row.appendChild(position);
			row.appendChild(name);
			row.appendChild(time);
			if (userStore.isModerator === true) row.appendChild(button);
			leaderboardContent.appendChild(row);
		});
	}
}
async function removeLeaderboardTimes() {
	const pinia = createPinia()
	pinia.use(piniaPluginPersistedstate)
	const app = createApp(App)
	app.use(pinia)
	const userStore = useUserStore(pinia)
	const urlParams = new URLSearchParams(window.location.search);
	let levelIdentifier = urlParams.get('level');
	let levelIdentifierParts = levelIdentifier.split(':')
	for (let i = 0; i < removedTimes.length; i++) {
		const endpointUrl = config.SERVER_URL + 'statistics_remove_user/' + levelIdentifierParts[0] + '/' + levelIdentifierParts[1] + '?user_id=' + removedTimes[i][0];
		try {
			const response = await fetch(endpointUrl, {headers: {'Authorization': 'Bearer ' + userStore.accessToken}});
			if (response.ok) {
				removedTimes[i][1].remove();
			} else {
				alert("Failed to remove user");
			}
		} catch (error) {
			alert("Error removing user: " + error.message);
		}
	}
	removedTimes = [];
}
