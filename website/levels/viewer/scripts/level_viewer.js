import * as THREE from 'https://cdn.skypack.dev/three@v0.132.0';
import { FreeControls } from './free_controls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@v0.132.0/examples/jsm/loaders/GLTFLoader.js';
import * as SHADERS from './shaders.js';
import { GLTFExporter } from 'https://cdn.skypack.dev/three@v0.132.0/examples/jsm//exporters/GLTFExporter.js';
import * as config from '../../../src/configuration'

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
import textureLaveURL from '../textures/lava.png'
import textureWoodURL from '../textures/wood.png'
import textureGrapplableURL from '../textures/grapplable.png'
import textureGrapplableLavaURL from '../textures/grapplable_lava.png'
import textureGrabbableCrumblingURL from '../textures/grabbable_crumbling.png'
import textureDefaultColoredURL from '../textures/default_colored.png'
import textureBouncingURL from '../textures/bouncing.png'

let userID = undefined;

let clock, camera, scene, renderer, controls;
let textureLoader;
let gltfLoader;
let shapes = [];
let objects = []
let materials = [];
let objectMaterials = [];
let isFogEnabled = true;

init();

function getMaterialForTexture(name, tileFactor, vertexShader, fragmentShader, neonEnabled=0.0)
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
		"fogEnabled": { value: 1.0 }
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
	document.getElementById('copy-button').addEventListener('click', copyLevelURLPressed);
	document.getElementById('download-button').addEventListener('click', exportLevelAsGLTF);
	document.getElementById("fog-button").addEventListener("click", toggleFog);

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

	materials.push(getMaterialForTexture(textureDefaultURL, 1.0, SHADERS.levelVS, SHADERS.levelFS));
	materials.push(getMaterialForTexture(textureGrabbableURL, 1.0, SHADERS.levelVS, SHADERS.levelFS));
	materials.push(getMaterialForTexture(textureIceURL, 0.1, SHADERS.levelVS, SHADERS.levelFS));
	materials.push(getMaterialForTexture(textureLaveURL, 0.1, SHADERS.levelVS, SHADERS.levelFS));
	materials.push(getMaterialForTexture(textureWoodURL, 1.0, SHADERS.levelVS, SHADERS.levelFS));
	materials.push(getMaterialForTexture(textureGrapplableURL, 0.1, SHADERS.levelVS, SHADERS.levelFS));
	materials.push(getMaterialForTexture(textureGrapplableLavaURL, 0.1, SHADERS.levelVS, SHADERS.levelFS));
	materials.push(getMaterialForTexture(textureGrabbableCrumblingURL, 1.0, SHADERS.levelVS, SHADERS.levelFS));
	materials.push(getMaterialForTexture(textureDefaultColoredURL, 1.0, SHADERS.levelVS, SHADERS.levelFS));
	materials.push(getMaterialForTexture(textureBouncingURL, 1.0, SHADERS.levelVS, SHADERS.levelFS));

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
	objectMaterials.push(getMaterialForTexture(textureDefaultColoredURL, 1.0, SHADERS.levelVS, SHADERS.levelFS, 1.0));


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
			let accessToken = userStore.accessToken;
			let list = userStore.list;

			var titleLabel = document.getElementById("title");
			var creatorsLabel = document.getElementById("creators");
			var descriptionLabel = document.getElementById("description");
			var complexityLabel = document.getElementById("complexity");
			var checkpointsLabel = document.getElementById("checkpoints");

			var dateLabel = document.getElementById("date");

			const urlParams = new URLSearchParams(window.location.search);
			let listIndex = urlParams.get('listIndex');
			let levelIdentifier = urlParams.get('level');
			let levelIdentifierParts = levelIdentifier.split(':')
			let hasIteration = levelIdentifierParts.length === 3
			levelIdentifier = levelIdentifierParts.join('/');

			let detailResponse = await fetch(config.SERVER_URL + 'details/' + levelIdentifier);
			let detailResponseBody = await detailResponse.json();
			userID = levelIdentifierParts[0];
			console.log(userID);

			if(detailResponseBody.hidden === true && !userStore.is_admin)
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

			if (list.length > 0 && listIndex) {
				let listButtons = document.getElementById("listButtons");
				let nextButton = document.getElementById("nextListItem");
				let backButton = document.getElementById("prevListItem");
				if (listIndex === list.length) {
					nextButton.style.display = "none";
				} else if (listIndex === "0") {
					backButton.style.display = "none";
				}
				listButtons.style.display = "block";
				nextButton.addEventListener("click", function() {
					location.href = "/levels/viewer/?level=" + list[parseInt(listIndex) + 1].identifier + "&listIndex=" + (parseInt(listIndex) + 1);
				});
				backButton.addEventListener("click", function() {
					location.href = "/levels/viewer/?level=" + list[parseInt(listIndex) - 1].identifier + "&listIndex=" + (parseInt(listIndex) - 1);
				});
			}

			let moderationContainer = document.getElementById("moderationcontainer")
			if(userStore.isModerator === true)
			{
				let tagsForm = document.createElement("form");
				moderationContainer.appendChild(tagsForm);
				tagsForm.innerHTML = '<fieldset><legend>Tags:</legend><input type="checkbox" value="ok">ok <input type="submit" value="Submit" /></fieldset>';
				let tagsParentObject = tagsForm.childNodes[0];
				let tagOptions = []
				for(const option of tagsParentObject.childNodes)
				{
					if(option.type === "checkbox")
					{
						tagOptions.push(option);
						if("tags" in detailResponseBody && detailResponseBody.tags.length > 0)
						{
							for(const tag of detailResponseBody.tags)
							{
								if(tag === option.value)
								{
									option.checked = true;
								}
							}
						}
					}
				}

				tagsForm.onsubmit = function(event) {
					let tags = "";
					for(const option of tagOptions)
					{
						if(option.checked)
						{
							tags += option.value + ",";
						}
					}

					(async () => {
						let response = await fetch(config.SERVER_URL + 'tag/' + levelIdentifierParts[0] + '/' + levelIdentifierParts[1] + '?tags=' + tags + '&access_token=' + accessToken);
						let responseBody = await response.text();
						console.log(responseBody);
						confirm("Result: " + responseBody);
						if(response.status != 200 && accessToken && responseBody === "Not authorized!")
						{
							logout();
						}
					})();
					return false;
				};

				let linebreak = document.createElement("br");
				moderationContainer.appendChild(linebreak);
			}

			if(userStore.isAdmin)
			{
				document.getElementById("hidecontainer").style.display = "block";
				const hideButton = document.getElementById("hideButton");
				hideButton.addEventListener("click", function() {
					(async () => {
						const reason = document.getElementById("hideReason").value;
						const identifierPath = levelIdentifierParts[0] + '/' + levelIdentifierParts[1]
						const hideResponse = await fetch(config.SERVER_URL + 'hide/' + identifierPath, {headers: {'Authorization': 'Bearer ' + accessToken}})
						const hideResponseBody = await hideResponse.text();
						if (hideResponse.status != 200 || hideResponseBody !== 'Success') {
							confirm("Error: " + hideResponseBody);
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
				document.getElementById("approveButton").addEventListener("click", function() {
					(async () => {
						const identifierPath = levelIdentifierParts[0] + '/' + levelIdentifierParts[1]
						const approveResponse = await fetch(config.SERVER_URL + 'ignore_reports/' + identifierPath, {headers: {'Authorization': 'Bearer ' + accessToken}})
						const approveResponseBody = await approveResponse.text();
						if(approveResponse.status != 200 || approveResponseBody !== 'Success') {
							confirm("Error: " + approveResponseBody);
						}
					})();
				});

				( async () => {
					const identifierPath = levelIdentifierParts[0] + '/' + levelIdentifierParts[1]
					const reportsResponse = await fetch(config.SERVER_URL + 'report_info/' + identifierPath, {headers: {'Authorization': 'Bearer ' + accessToken}})
					let reports_data = await reportsResponse.text();
					if(reportsResponse.status != 200 || reports_data === 'Not authorized!') {
						confirm("Error: " + reports_data);
						return;
					}
					reports_data = JSON.parse(reports_data);
					if ('object_info' in reports_data) {
						const reportElement = document.getElementById("reports");
						reportElement.style.display = "block";
						const reportTitle = document.getElementById("reportsTitle");
						reportTitle.innerText += `${reports_data.reported_score} (${reports_data.reported_count})`;
						const reports = document.getElementById("reports");
						reports_data = Object.entries(reports_data).filter(([key]) => key.includes('reported_score_'))
						for (const report of reports_data) {
							reports.innerHTML += `${report[0].slice(15)}:${report[1]}<br>`;
						}
					}
				})();
				
				let linebreak = document.createElement("br");
				moderationContainer.appendChild(linebreak);

				let creatorButton = document.createElement("button");
				creatorButton.className = "creatorButton";
				moderationContainer.appendChild(creatorButton);
				creatorButton.innerHTML = "<b>MAKE CREATOR</b>";
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

			for(let material of materials)
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
				material.uniforms["sunColor"] = { value: [1.0, 1.0, 1.0] }

				let densityFactor = density * density * density * density
				let fogDensityX = 0.5 * densityFactor + 0.000001 * (1.0 - densityFactor)
				let fogDensityY = 1.0/(1.0 - Math.exp(-1500.0 * fogDensityX))

				material.uniforms["cameraFogDistance"] = { value: [fogDensityX, fogDensityY] }
			}

			for(let material of objectMaterials)
			{
				material.uniforms["sunDirection"] = { value: skySunDirection }
			}

			let extraRotate = new THREE.Quaternion();
			extraRotate.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

			let signCounter = 0;
			let realComplexity = 0;

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

						/*if(parentNode == scene)
						{
							let rotation = cube.quaternion.multiply(extraRotate)
							cube.setRotationFromQuaternion(rotation)
						}*/

						loadLevelNodes(node.levelNodeGroup.childNodes, cube)

						//realComplexity += 1
					}
					else if(node.levelNodeStatic)
					{
						let material = materials[node.levelNodeStatic.material]
						if(node.levelNodeStatic.material === root.COD.Types.LevelNodeMaterial.DEFAULT_COLORED && node.levelNodeStatic.isNeon)
						{
							material = objectMaterials[3] //Use neon material if this is a neon colored block
						}

						let newMaterial = material.clone()
						newMaterial.uniforms.colorTexture = material.uniforms.colorTexture

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

						//if(parentNode == scene)
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

						realComplexity += 2
					}
					else if(node.levelNodeCrumbling)
					{
						let material = materials[node.levelNodeCrumbling.material]
						let newMaterial = material.clone()
						newMaterial.uniforms.colorTexture = material.uniforms.colorTexture

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

						//if(parentNode == scene)
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

						realComplexity += 3
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

						let sign = new THREE.Mesh(objects[1], newMaterial);
						parentNode.add(sign);
						sign.position.x = node.levelNodeSign.position.x
						sign.position.y = node.levelNodeSign.position.y
						sign.position.z = node.levelNodeSign.position.z

						sign.quaternion.x = node.levelNodeSign.rotation.x
						sign.quaternion.y = node.levelNodeSign.rotation.y
						sign.quaternion.z = node.levelNodeSign.rotation.z
						sign.quaternion.w = node.levelNodeSign.rotation.w

						//if(parentNode == scene)
						{
							let rotation = sign.quaternion.multiply(extraRotate)
							sign.setRotationFromQuaternion(rotation)
						}

						let signText = node.levelNodeSign.text
						if(userStore.isAdmin && signText && signText.length > 0)
						{
							let signTextElement = document.createElement("div");
							const signTextNode = document.createTextNode("Sign " + signCounter + ": " + signText);
							signTextElement.appendChild(signTextNode);
							signTextElement.appendChild(document.createElement("br"));
							signTextElement.appendChild(document.createElement("br"));
							signTextElement.onclick = function() {
								camera.position.set(sign.position.x, sign.position.y + 1.0, sign.position.z);
							}
							moderationContainer.appendChild(signTextElement);
						}

						signCounter += 1;
						realComplexity += 5
					}
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
	await navigator.clipboard.writeText(window.location.href);
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

function openLeaderboard() {
	document.getElementById("overlay").style.display = "block";
	document.getElementById("leaderboard").style.display = "block";
	loadLeaderboardData();
}

function closeLeaderboard() {
	document.getElementById("overlay").style.display = "none";
	document.getElementById("leaderboard").style.display = "none";
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
		data.forEach((entry, index) => {
			const row = document.createElement("div");
			row.className = "leaderboard-row";

			const position = document.createElement("div");
			position.className = "leaderboard-position";
			position.textContent = entry.position + 1;

			const name = document.createElement("div");
			name.className = "leaderboard-name";
			name.textContent = entry.user_name;

			const time = document.createElement("div");
			time.className = "leaderboard-time";
			time.textContent = entry.best_time;

			row.appendChild(position);
			row.appendChild(name);
			row.appendChild(time);
			leaderboardContent.appendChild(row);
		});
	}
}
