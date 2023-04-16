import * as SHADERS from '../../viewer/scripts/shaders.js';

let shapes = [];
let objects = []
let materials = [];
let objectMaterials = [];

init();

function init()
{
/*	AFRAME.registerShader('default', {
		schema: {
			color: {type: 'color', is: 'uniform'},
			timeMsec: {type: 'time', is: 'uniform'}
		},

		vertexShader: vertexShader,
		fragmentShader: fragmentShader
	});*/

/*	materials.push(getMaterialForTexture(VIEWER_PATH + 'textures/default.png', 1.0, levelVertexShader, levelFragmentShader));
	materials.push(getMaterialForTexture(VIEWER_PATH + 'textures/grabbable.png', 1.0, levelVertexShader, levelFragmentShader));
	materials.push(getMaterialForTexture(VIEWER_PATH + 'textures/ice.png', 0.1, levelVertexShader, levelFragmentShader));
	materials.push(getMaterialForTexture(VIEWER_PATH + 'textures/lava.png', 0.1, levelVertexShader, levelFragmentShader));
	materials.push(getMaterialForTexture(VIEWER_PATH + 'textures/wood.png', 1.0, levelVertexShader, levelFragmentShader));
	materials.push(getMaterialForTexture(VIEWER_PATH + 'textures/grapplable.png', 0.1, levelVertexShader, levelFragmentShader));
	materials.push(getMaterialForTexture(VIEWER_PATH + 'textures/grapplable_lava.png', 0.1, levelVertexShader, levelFragmentShader));
	materials.push(getMaterialForTexture(VIEWER_PATH + 'textures/grabbable_crumbling.png', 1.0, levelVertexShader, levelFragmentShader));
	materials.push(getMaterialForTexture(VIEWER_PATH + 'textures/default_colored.png', 1.0, levelVertexShader, levelFragmentShader));
	materials.push(getMaterialForTexture(VIEWER_PATH + 'textures/bouncing.png', 1.0, levelVertexShader, levelFragmentShader));

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

	objectMaterials.push(getMaterialForTexture(VIEWER_PATH + 'textures/default_colored.png', 1.0, levelVertexShader, levelFragmentShaderNeon));*/



/*	const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
	scene.add(ambientLight);

	const sunLight = new THREE.DirectionalLight(0xffffff, 0.5);
	scene.add(sunLight);*/

	const scene = document.querySelector('a-scene');

	const shapes = ["cubeDefault", "sphereDefault", "cylinderDefault", "pyramidDefault", "prismDefault"]
	const textures = ["#defaultTexture", "#grabbableTexture", "#iceTexture", "#lavaTexture", "#woodTexture", "#grapplableTexture", "#grapplableLavaTexture", "#grabbableCrumblingTexture", "#defaultColoredTexture", "#bouncingTexture"]

	protobuf.load("../viewer/proto/level.proto", function(err, root) {
		if(err) throw err;

		const LevelMessage = root.lookupType("COD.Level.Level");

		(async () => {
			const urlParams = new URLSearchParams(window.location.search);
			let levelIdentifier = urlParams.get('level');
			let levelIdentifierParts = levelIdentifier.split(':')
			let hasIteration = levelIdentifierParts.length === 3
			levelIdentifier = levelIdentifierParts.join('/');

			let detailResponse = await fetch(SERVER_URL + 'details/' + levelIdentifier);
			let detailResponseBody = await detailResponse.json();

			if(detailResponseBody.hidden === true)
			{
				//Don't load hidden levels
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

			/*const skyVertexShader = document.getElementById('sky-vertexShader').textContent;
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
			scene.add(sky);*/

			let extraRotate = new THREE.Quaternion();
			extraRotate.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

			const loadLevelNodes = function(nodes, parentNode){
				for(let node of nodes)
				{
			/*		if(node.levelNodeGroup)
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

						loadLevelNodes(node.levelNodeGroup.childNodes, cube)

						realComplexity += 1
					}
					else */if(node.levelNodeStatic)
					{
						let materialIndex = node.levelNodeStatic.material
						//let material = textures[node.levelNodeStatic.material]
						if(node.levelNodeStatic.material === root.COD.Types.LevelNodeMaterial.DEFAULT_COLORED && node.levelNodeStatic.isNeon)
						{
							materialIndex = 3
							//material = objectMaterials[3] //Use neon material if this is a neon colored block
						}

						/*let newMaterial = material.clone()
						newMaterial.uniforms.colorTexture = material.uniforms.colorTexture
						newMaterial.uniforms["sunDirection"] = { value: sunDirection }

						if(node.levelNodeStatic.material == root.COD.Types.LevelNodeMaterial.DEFAULT_COLORED && node.levelNodeStatic.color)
						{
							newMaterial.uniforms.diffuseColor.value = [node.levelNodeStatic.color.r, node.levelNodeStatic.color.g, node.levelNodeStatic.color.b]
						}*/

						 var newEntity = document.createElement('a-entity');

						// Use the mixin to make it a voxel.
						newEntity.setAttribute('mixin', shapes[node.levelNodeStatic.shape-1000]);

						newEntity.materialTexture = textures[materialIndex]

						// Add to the scene with `appendChild`.
						scene.appendChild(newEntity);

						//const mesh = newEntity.object3DMap
						//console.log(newEntity.children)
						//mesh.material.src = material

						/*let cube = new THREE.Mesh(shapes[node.levelNodeStatic.shape-1000], newMaterial)
						parentNode.add(cube);*/
						newEntity.object3D.position.x = node.levelNodeStatic.position.x
						newEntity.object3D.position.y = node.levelNodeStatic.position.y
						newEntity.object3D.position.z = node.levelNodeStatic.position.z

						newEntity.object3D.scale.x = node.levelNodeStatic.scale.x
						newEntity.object3D.scale.y = node.levelNodeStatic.scale.y
						newEntity.object3D.scale.z = node.levelNodeStatic.scale.z

						newEntity.object3D.quaternion.x = node.levelNodeStatic.rotation.x
						newEntity.object3D.quaternion.y = node.levelNodeStatic.rotation.y
						newEntity.object3D.quaternion.z = node.levelNodeStatic.rotation.z
						newEntity.object3D.quaternion.w = node.levelNodeStatic.rotation.w

						//if(parentNode == scene)
						{
							let rotation = newEntity.object3D.quaternion.multiply(extraRotate)
							newEntity.object3D.setRotationFromQuaternion(rotation)
						}

						/*let targetVector = new THREE.Vector3()
						let targetQuaternion = new THREE.Quaternion()
						let worldMatrix = new THREE.Matrix4()
						worldMatrix.compose(newEntity.object3D.getWorldPosition(targetVector), newEntity.object3D.getWorldQuaternion(targetQuaternion), newEntity.object3D.getWorldScale(targetVector))

						let normalMatrix = new THREE.Matrix3()
						normalMatrix.getNormalMatrix(worldMatrix)
						newMaterial.uniforms.worldNormalMatrix.value = normalMatrix*/
					}
					/*else if(node.levelNodeCrumbling)
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
					}*/
					else if(node.levelNodeStart)
					{
						/*let start = new THREE.Mesh(objects[0], objectMaterials[0]);
						parentNode.add(start);
						start.position.x = node.levelNodeStart.position.x
						start.position.y = node.levelNodeStart.position.y
						start.position.z = node.levelNodeStart.position.z

						start.scale.x = node.levelNodeStart.radius * 2.0;
						start.scale.z = node.levelNodeStart.radius * 2.0;

						camera.position.set(start.position.x, start.position.y + 2.0, start.position.z);*/
						scene.setAttribute("sq-spawnpoint", "position: " + node.levelNodeStart.position.x + " " + (node.levelNodeStart.position.y + 2.0) + " " + node.levelNodeStart.position.z + ";")
					}
					/*else if(node.levelNodeFinish)
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

						//if(parentNode == scene)
						{
							let rotation = sign.quaternion.multiply(extraRotate)
							sign.setRotationFromQuaternion(rotation)
						}

				/*		let signText = node.levelNodeSign.text
						if(userInfo && "is_admin" in userInfo && userInfo.is_admin === true && signText && signText.length > 0)
						{
							let signTextElement = document.createElement("div");
							const signTextNode = document.createTextNode("Sign " + signCounter + ": " + signText);
							signTextElement.appendChild(signTextNode);
							signTextElement.appendChild(document.createElement("br"));
							signTextElement.appendChild(document.createElement("br"));
							signTextElement.onclick = function() {
								camera.position.set(sign.position.x, sign.position.y + 1.0, sign.position.z);
							}
							signTextContainer.appendChild(signTextElement);
						}*/

						/*signCounter += 1;
						realComplexity += 5
					}*/
				}
			};

			loadLevelNodes(decoded.levelNodes, scene);
		})()
	});
}

