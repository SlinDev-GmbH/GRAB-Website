import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

import * as protobuf from 'protobufjs';

import * as SHADERS from './shaders.js';

import modelCubeURL from './models/cube.gltf';
import modelSphereURL from './models/sphere.gltf';
import modelCylinderURL from './models/cylinder.gltf';
import modelPyramidURL from './models/pyramid.gltf';
import modelPyramid4URL from './models/pyramid4.glb';
import modelPrismURL from './models/prism.gltf';
import modelConeURL from './models/cone.gltf';
import modelStartEndURL from './models/start_end.gltf';
import modelSignURL from './models/sign.gltf';

import textureDefaultURL from './textures/default.png';
import textureGrabbableURL from './textures/grabbable.png';
import textureIceURL from './textures/ice.png';
import textureLavaURL from './textures/lava.png';
import textureWoodURL from './textures/wood.png';
import textureGrapplableURL from './textures/grapplable.png';
import textureGrapplableLavaURL from './textures/grapplable_lava.png';
import textureGrabbableCrumblingURL from './textures/grabbable_crumbling.png';
import textureDefaultColoredURL from './textures/default_colored.png';
import textureBouncingURL from './textures/bouncing.png';
import textureSnowURL from './textures/snow.png';
import textureTriggerURL from './textures/trigger.png';
import textureSublevelTriggerURL from './textures/sublevel_trigger.png';
import textureSoundURL from './textures/sound.png';

let textureLoader, gltfLoader, fontLoader;

class LevelLoader {
	constructor(options = {}) {
		this.config(options);

		textureLoader = new THREE.TextureLoader();
		gltfLoader = new GLTFLoader();
		fontLoader = new FontLoader();

		this.shapes = [];
		this.objects = [];

		let shapePromises = [
			getGeometryForModel(modelCubeURL),
			getGeometryForModel(modelSphereURL),
			getGeometryForModel(modelCylinderURL),
			getGeometryForModel(modelPyramidURL),
			getGeometryForModel(modelPrismURL),
			getGeometryForModel(modelConeURL),
			getGeometryForModel(modelPyramid4URL),
		];

		this.shapePromise = Promise.all(shapePromises).then((result) => {
			for (let shape of result) {
				this.shapes.push(shape);
			}
		});

		let objectPromises = [getGeometryForModel(modelStartEndURL), getGeometryForModel(modelSignURL)];

		this.objectPromise = Promise.all(objectPromises).then((result) => {
			for (let object of result) {
				this.objects.push(object);
			}
		});

		this.materials = [
			getMaterialForTexture(textureDefaultURL, 1.0, SHADERS.levelVS, SHADERS.levelFS, [0.4, 0.4, 0.4, 64.0]),
			getMaterialForTexture(textureGrabbableURL, 1.0, SHADERS.levelVS, SHADERS.levelFS, [0.2, 0.2, 0.2, 16.0]),
			getMaterialForTexture(textureIceURL, 0.1, SHADERS.levelVS, SHADERS.levelFS, [0.6, 0.6, 0.6, 64.0]),
			getMaterialForTexture(textureLavaURL, 0.1, SHADERS.levelVS, SHADERS.levelFS, [0.0, 0.0, 0.0, 1.0], 0.0, 1.0),
			getMaterialForTexture(textureWoodURL, 1.0, SHADERS.levelVS, SHADERS.levelFS, [0.2, 0.2, 0.2, 32.0]),
			getMaterialForTexture(textureGrapplableURL, 0.1, SHADERS.levelVS, SHADERS.levelFS, [0.3, 0.3, 0.3, 32.0]),
			getMaterialForTexture(textureGrapplableLavaURL, 0.1, SHADERS.levelVS, SHADERS.levelFS, [0.0, 0.0, 0.0, 1.0]),
			getMaterialForTexture(textureGrabbableCrumblingURL, 1.0, SHADERS.levelVS, SHADERS.levelFS, [0.2, 0.2, 0.2, 16.0]),
			getMaterialForTexture(textureDefaultColoredURL, 1.0, SHADERS.levelVS, SHADERS.levelFS, [0.15, 0.15, 0.15, 10.0]),
			getMaterialForTexture(textureBouncingURL, 1.0, SHADERS.levelVS, SHADERS.levelFS, [0.8, 0.8, 0.8, 64.0]),
			getMaterialForTexture(textureSnowURL, 0.1, SHADERS.levelVS, SHADERS.levelFS, [0.6, 0.6, 0.6, 64.0]),
		];

		let startMaterial = new THREE.ShaderMaterial();
		startMaterial.vertexShader = SHADERS.startFinishVS;
		startMaterial.fragmentShader = SHADERS.startFinishFS;
		startMaterial.flatShading = true;
		startMaterial.transparent = true;
		startMaterial.depthWrite = false;
		startMaterial.uniforms = { diffuseColor: { value: [0.0, 1.0, 0.0, 1.0] } };

		let finishMaterial = new THREE.ShaderMaterial();
		finishMaterial.vertexShader = SHADERS.startFinishVS;
		finishMaterial.fragmentShader = SHADERS.startFinishFS;
		finishMaterial.flatShading = true;
		finishMaterial.transparent = true;
		finishMaterial.depthWrite = false;
		finishMaterial.uniforms = { diffuseColor: { value: [1.0, 0.0, 0.0, 1.0] } };

		let altStartMaterial = new THREE.ShaderMaterial();
		altStartMaterial.vertexShader = SHADERS.startFinishVS;
		altStartMaterial.fragmentShader = SHADERS.startFinishFS;
		altStartMaterial.flatShading = true;
		altStartMaterial.transparent = true;
		altStartMaterial.depthWrite = false;
		altStartMaterial.uniforms = { diffuseColor: { value: [1.0, 1.0, 0.0, 1.0] } };

		let particleMaterial = new THREE.ShaderMaterial();
		particleMaterial.vertexShader = SHADERS.particleVS;
		particleMaterial.fragmentShader = SHADERS.particleFS;
		particleMaterial.flatShading = true;
		particleMaterial.uniforms = {
			fogEnabled: { value: 1.0 },
		};

		this.objectMaterials = [
			startMaterial,
			finishMaterial,
			getMaterialForTexture(textureWoodURL, 1.0, SHADERS.signVS, SHADERS.signFS),
			getMaterialForTexture(textureDefaultColoredURL, 1.0, SHADERS.levelVS, SHADERS.levelFS, [0.4, 0.4, 0.4, 64.0], 1.0),
			getMaterialForTexture(textureTriggerURL, 3.0, SHADERS.levelVS, SHADERS.levelFS, [0.4, 0.4, 0.4, 64.0], 1.0),
			getMaterialForTexture(textureSublevelTriggerURL, 3.0, SHADERS.levelVS, SHADERS.levelFS, [0.4, 0.4, 0.4, 64.0], 1.0),
			altStartMaterial,
			particleMaterial,
			getMaterialForTexture(textureSoundURL, 1.0, SHADERS.levelVS, SHADERS.levelFS, [0.4, 0.4, 0.4, 64.0], 1.0),
		];

		let skyMaterial = new THREE.ShaderMaterial();
		skyMaterial.vertexShader = SHADERS.skyVS;
		skyMaterial.fragmentShader = SHADERS.skyFS;
		skyMaterial.flatShading = false;
		skyMaterial.depthWrite = false;
		skyMaterial.side = THREE.BackSide;
		this.skyMaterial = skyMaterial;

		this.rootPromise = Promise.all([protobuf.load('/proto/level.proto')]).then((result) => {
			this.root = result[0];
		});

		fontLoader.load('/fonts/Roboto_Regular.json', (font) => {
			this.font = font;
		});
	}

	config(options = {}) {
		this.options = {
			sky: true,
			lights: true,
			text: false,
			triggers: false,
			sound: false,
			sublevels: false,
		};

		for (const key in this.options) {
			if (key in options) {
				this.options[key] = options[key];
			}
		}
	}

	async load(data) {
		const level = {
			level: undefined,
			nodes: {
				all: [],
				animated: [],
				material: {},
				shape: {},
				defaultSpawn: undefined,
			},
			complexity: 0,
			scene: new THREE.Scene(),
			update: () => {},
			meta: {
				time: 0.0,
			},
		};

		if (this.options.lights) {
			const ambientLight = new THREE.AmbientLight(0x404040);
			level.scene.add(ambientLight);

			const sunLight = new THREE.DirectionalLight(0xffffff, 0.5);
			level.scene.add(sunLight);
		}

		level.update = (delta) => {
			level.meta.time += delta;
			for (const object of level.nodes.animated) {
				updateObjectAnimation(object, level.meta.time);
			}
			for (const object of level.nodes.levelNodeParticleEmitter) {
				updateObjectParticles(object, delta);
			}
		};

		await this.rootPromise;

		let root = this.root;

		root.COD.Types.LevelNode.oneofs.content.fieldsArray.forEach((field) => {
			level.nodes[field.name] = [];
		});
		Object.values(root.COD.Types.LevelNodeShape).forEach((value) => {
			level.nodes.shape[value] = [];
		});
		Object.values(root.COD.Types.LevelNodeMaterial).forEach((value) => {
			level.nodes.material[value] = [];
		});
		const LevelMessage = root.lookupType('COD.Level.Level');

		let formattedBuffer = data;
		let decoded = LevelMessage.decode(formattedBuffer);
		level.level = decoded;

		await this.shapePromise;
		await this.objectPromise;

		let { shapes, objects, materials, objectMaterials } = this;
		let scene = level.scene;
		let namedSpawns = [];

		let sunAngle = new THREE.Euler(THREE.MathUtils.degToRad(45), THREE.MathUtils.degToRad(315), 0.0);
		let sunAltitude = 45.0;
		let horizonColor = [0.916, 0.9574, 0.9574];
		if (decoded.ambienceSettings) {
			sunAngle = new THREE.Euler(
				THREE.MathUtils.degToRad(decoded.ambienceSettings.sunAltitude),
				THREE.MathUtils.degToRad(decoded.ambienceSettings.sunAzimuth),
				0.0,
			);
			sunAltitude = decoded.ambienceSettings.sunAltitude;
			horizonColor = [
				decoded.ambienceSettings.skyHorizonColor.r,
				decoded.ambienceSettings.skyHorizonColor.g,
				decoded.ambienceSettings.skyHorizonColor.b,
			];

			this.skyMaterial.uniforms['cameraFogColor0'] = {
				value: [
					decoded.ambienceSettings.skyHorizonColor.r,
					decoded.ambienceSettings.skyHorizonColor.g,
					decoded.ambienceSettings.skyHorizonColor.b,
				],
			};
			this.skyMaterial.uniforms['cameraFogColor1'] = {
				value: [
					decoded.ambienceSettings.skyZenithColor.r,
					decoded.ambienceSettings.skyZenithColor.g,
					decoded.ambienceSettings.skyZenithColor.b,
				],
			};
			this.skyMaterial.uniforms['sunSize'] = { value: decoded.ambienceSettings.sunSize };
		} else {
			this.skyMaterial.uniforms['cameraFogColor0'] = { value: [0.916, 0.9574, 0.9574] };
			this.skyMaterial.uniforms['cameraFogColor1'] = { value: [0.28, 0.476, 0.73] };
			this.skyMaterial.uniforms['sunSize'] = { value: 1.0 };
		}

		const sunDirection = new THREE.Vector3(0, 0, 1);
		sunDirection.applyEuler(sunAngle);

		const skySunDirection = sunDirection.clone();

		let sunColorFactor = 1.0 - sunAltitude / 90.0;
		sunColorFactor *= sunColorFactor;
		sunColorFactor = 1.0 - sunColorFactor;
		sunColorFactor *= 0.8;
		sunColorFactor += 0.2;
		let sunColor = [
			horizonColor[0] * (1.0 - sunColorFactor) + sunColorFactor,
			horizonColor[1] * (1.0 - sunColorFactor) + sunColorFactor,
			horizonColor[2] * (1.0 - sunColorFactor) + sunColorFactor,
		];

		this.skyMaterial.uniforms['sunDirection'] = { value: skySunDirection };
		this.skyMaterial.uniforms['sunColor'] = { value: sunColor };

		if (this.options.sky) {
			const sky = new THREE.Mesh(this.shapes[1], this.skyMaterial);
			sky.frustumCulled = false;
			sky.renderOrder = 1000; // sky should be rendered after opaque, before transparent
			scene.add(sky);
		}

		const allMaterials = [...materials, ...objectMaterials];

		for (let material of allMaterials) {
			let density = 0.0;
			if (decoded.ambienceSettings) {
				material.uniforms['cameraFogColor0'] = {
					value: [
						decoded.ambienceSettings.skyHorizonColor.r,
						decoded.ambienceSettings.skyHorizonColor.g,
						decoded.ambienceSettings.skyHorizonColor.b,
					],
				};
				material.uniforms['cameraFogColor1'] = {
					value: [
						decoded.ambienceSettings.skyZenithColor.r,
						decoded.ambienceSettings.skyZenithColor.g,
						decoded.ambienceSettings.skyZenithColor.b,
					],
				};
				material.uniforms['sunSize'] = { value: decoded.ambienceSettings.sunSize };
				density = decoded.ambienceSettings.fogDensity;
			} else {
				material.uniforms['cameraFogColor0'] = { value: [0.916, 0.9574, 0.9574] };
				material.uniforms['cameraFogColor1'] = { value: [0.28, 0.476, 0.73] };
				material.uniforms['sunSize'] = { value: 1.0 };
			}

			material.uniforms['sunDirection'] = { value: skySunDirection };
			material.uniforms['sunColor'] = { value: sunColor };

			let densityFactor = density * density * density * density;
			let fogDensityX = 0.5 * densityFactor + 0.000001 * (1.0 - densityFactor);
			let fogDensityY = 1.0 / (1.0 - Math.exp(-1500.0 * fogDensityX));

			material.uniforms['cameraFogDistance'] = { value: [fogDensityX, fogDensityY] };
		}

		level.complexity = 0;

		const loadLevelNodes = (nodes, parentNode) => {
			for (let node of nodes) {
				let object = undefined;
				if (node.levelNodeGroup) {
					object = new THREE.Object3D();
					parentNode.add(object);
					object.position.x = -node.levelNodeGroup.position.x;
					object.position.y = node.levelNodeGroup.position.y;
					object.position.z = -node.levelNodeGroup.position.z;

					object.scale.x = node.levelNodeGroup.scale.x;
					object.scale.y = node.levelNodeGroup.scale.y;
					object.scale.z = node.levelNodeGroup.scale.z;

					object.quaternion.x = -node.levelNodeGroup.rotation.x;
					object.quaternion.y = node.levelNodeGroup.rotation.y;
					object.quaternion.z = -node.levelNodeGroup.rotation.z;
					object.quaternion.w = node.levelNodeGroup.rotation.w;

					object.initialPosition = object.position.clone();
					object.initialRotation = object.quaternion.clone();
					object.isGroup = true;

					loadLevelNodes(node.levelNodeGroup.childNodes, object);

					level.nodes.levelNodeGroup.push(object);
				} else if (node.levelNodeGravity) {
					object = new THREE.Object3D();
					object.position.x = -node.levelNodeGravity.position.x;
					object.position.y = node.levelNodeGravity.position.y;
					object.position.z = -node.levelNodeGravity.position.z;

					object.scale.x = node.levelNodeGravity.scale.x;
					object.scale.y = node.levelNodeGravity.scale.y;
					object.scale.z = node.levelNodeGravity.scale.z;

					object.quaternion.x = -node.levelNodeGravity.rotation.x;
					object.quaternion.y = node.levelNodeGravity.rotation.y;
					object.quaternion.z = -node.levelNodeGravity.rotation.z;
					object.quaternion.w = node.levelNodeGravity.rotation.w;

					object.initialPosition = object.position.clone();
					object.initialRotation = object.quaternion.clone();

					let particleGeometry = new THREE.BufferGeometry();

					let particleColor = new THREE.Color(1.0, 1.0, 1.0);
					if (node.levelNodeGravity?.mode == 1) {
						particleColor = new THREE.Color(1.0, 0.6, 0.6);
					}

					let lifeSpan = 1;
					let particleCount = Math.min(Math.floor(object.scale.x * object.scale.y * object.scale.z * 10), 2000);

					let size = 0.1;

					const positions = new Float32Array(particleCount * 3);
					const colors = new Float32Array(particleCount * 3);
					const scales = new Float32Array(particleCount);
					const lifeSpans = new Float32Array(particleCount);

					let worldPosition = new THREE.Vector3();
					let worldScale = new THREE.Vector3();
					let worldQuaternion = new THREE.Quaternion();
					object.getWorldPosition(worldPosition);
					object.getWorldScale(worldScale);
					object.getWorldQuaternion(worldQuaternion);

					let velocity = new THREE.Vector3(
						node.levelNodeGravity.direction.x,
						node.levelNodeGravity.direction.y,
						node.levelNodeGravity.direction.z,
					);
					velocity.applyQuaternion(worldQuaternion);

					for (let i = 0; i < particleCount; i++) {
						lifeSpans[i] = Math.random() * lifeSpan;

						scales[i] = size;

						let particlePosition = new THREE.Vector3(
							(Math.random() - 0.5) * worldScale.x,
							(Math.random() - 0.5) * worldScale.y,
							(Math.random() - 0.5) * worldScale.z,
						);
						particlePosition.applyQuaternion(worldQuaternion);

						positions[i * 3] = worldPosition.x + particlePosition.x;
						positions[i * 3 + 1] = worldPosition.y + particlePosition.y;
						positions[i * 3 + 2] = worldPosition.z + particlePosition.z;

						colors[i * 3] = particleColor.r;
						colors[i * 3 + 1] = particleColor.g;
						colors[i * 3 + 2] = particleColor.b;
					}

					particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
					particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
					particleGeometry.setAttribute('scale', new THREE.Float32BufferAttribute(scales, 1));

					let particleMaterial = objectMaterials[7].clone();

					let particlePoints = new THREE.Points(particleGeometry, particleMaterial);

					scene.add(particlePoints);
					parentNode.add(object);
					object.userData.update = (delta) => {
						const positions = particleGeometry.attributes.position.array;

						let worldPosition = new THREE.Vector3();
						let worldScale = new THREE.Vector3();
						let worldQuaternion = new THREE.Quaternion();
						object.getWorldPosition(worldPosition);
						object.getWorldScale(worldScale);
						object.getWorldQuaternion(worldQuaternion);

						let velocity = new THREE.Vector3(
							node.levelNodeGravity.direction.x,
							node.levelNodeGravity.direction.y,
							node.levelNodeGravity.direction.z,
						);
						velocity.applyQuaternion(worldQuaternion);

						for (let i = 0; i < particleCount; i++) {
							lifeSpans[i] -= delta;
							if (lifeSpans[i] <= 0) {
								lifeSpans[i] = lifeSpan;

								let particlePosition = new THREE.Vector3(
									(Math.random() - 0.5) * worldScale.x,
									(Math.random() - 0.5) * worldScale.y,
									(Math.random() - 0.5) * worldScale.z,
								);
								particlePosition.applyQuaternion(worldQuaternion);

								positions[i * 3] = worldPosition.x + particlePosition.x;
								positions[i * 3 + 1] = worldPosition.y + particlePosition.y;
								positions[i * 3 + 2] = worldPosition.z + particlePosition.z;
							}
							positions[i * 3] += velocity.x * delta;
							positions[i * 3 + 1] += velocity.y * delta;
							positions[i * 3 + 2] += velocity.z * delta;
						}

						particleGeometry.attributes.position.needsUpdate = true;
					};

					level.nodes.levelNodeGravity.push(object);
					level.complexity += 10;
				} else if (node.levelNodeParticleEmitter) {
					object = new THREE.Object3D();
					object.position.x = -node.levelNodeParticleEmitter.position.x;
					object.position.y = node.levelNodeParticleEmitter.position.y;
					object.position.z = -node.levelNodeParticleEmitter.position.z;

					object.scale.x = node.levelNodeParticleEmitter.scale.x;
					object.scale.y = node.levelNodeParticleEmitter.scale.y;
					object.scale.z = node.levelNodeParticleEmitter.scale.z;

					object.quaternion.x = -node.levelNodeParticleEmitter.rotation.x;
					object.quaternion.y = node.levelNodeParticleEmitter.rotation.y;
					object.quaternion.z = -node.levelNodeParticleEmitter.rotation.z;
					object.quaternion.w = node.levelNodeParticleEmitter.rotation.w;

					object.initialPosition = object.position.clone();
					object.initialRotation = object.quaternion.clone();

					let particleGeometry = new THREE.BufferGeometry();

					let particlesPerSecond = node.levelNodeParticleEmitter.particlesPerSecond;

					let lifeSpanMin = node.levelNodeParticleEmitter.lifeSpan.x;
					let lifeSpanMax = node.levelNodeParticleEmitter.lifeSpan.y;
					let particleCount = Math.min(Math.floor(particlesPerSecond * lifeSpanMax), 1000);

					let startSizeMin = node.levelNodeParticleEmitter.startSize.x * 2;
					let startSizeMax = node.levelNodeParticleEmitter.startSize.y * 2;
					let endSizeMin = node.levelNodeParticleEmitter.endSize.x * 2;
					let endSizeMax = node.levelNodeParticleEmitter.endSize.y * 2;

					let velocityMin = new THREE.Vector3(
						-node.levelNodeParticleEmitter.velocityMin.x,
						node.levelNodeParticleEmitter.velocityMin.y,
						-node.levelNodeParticleEmitter.velocityMin.z,
					);
					let velocityMax = new THREE.Vector3(
						-node.levelNodeParticleEmitter.velocityMax.x,
						node.levelNodeParticleEmitter.velocityMax.y,
						-node.levelNodeParticleEmitter.velocityMax.z,
					);

					let accelerationMin = new THREE.Vector3(
						-node.levelNodeParticleEmitter.accelerationMin.x,
						node.levelNodeParticleEmitter.accelerationMin.y,
						-node.levelNodeParticleEmitter.accelerationMin.z,
					);
					let accelerationMax = new THREE.Vector3(
						-node.levelNodeParticleEmitter.accelerationMax.x,
						node.levelNodeParticleEmitter.accelerationMax.y,
						-node.levelNodeParticleEmitter.accelerationMax.z,
					);

					let startColor = [
						node.levelNodeParticleEmitter.startColor.r,
						node.levelNodeParticleEmitter.startColor.g,
						node.levelNodeParticleEmitter.startColor.b,
					];
					let endColor = [
						node.levelNodeParticleEmitter.endColor.r,
						node.levelNodeParticleEmitter.endColor.g,
						node.levelNodeParticleEmitter.endColor.b,
					];

					// all default to 0, mimics slowly spawning in at the start
					const positions = new Float32Array(particleCount * 3);
					const colors = new Float32Array(particleCount * 3);
					const scales = new Float32Array(particleCount);
					const lifeSpans = new Float32Array(particleCount);
					const totalLifeSpans = new Float32Array(particleCount);
					const startSizes = new Float32Array(particleCount);
					const endSizes = new Float32Array(particleCount);
					const velocities = new Float32Array(particleCount * 3);
					const accelerations = new Float32Array(particleCount * 3);

					const randRange = (min, max) => {
						return Math.random() * (max - min) + min;
					};

					for (let i = 0; i < particleCount; i++) {
						totalLifeSpans[i] = randRange(lifeSpanMin, lifeSpanMax);
						lifeSpans[i] = Math.random() * totalLifeSpans[i];
					}

					particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
					particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
					particleGeometry.setAttribute('scale', new THREE.Float32BufferAttribute(scales, 1));

					let particleMaterial = objectMaterials[7].clone();

					let particlePoints = new THREE.Points(particleGeometry, particleMaterial);

					particlePoints.frustumCulled = false;
					scene.add(particlePoints);
					parentNode.add(object);
					object.userData.update = (delta) => {
						const positions = particleGeometry.attributes.position.array;
						const colors = particleGeometry.attributes.color.array;
						const scales = particleGeometry.attributes.scale.array;

						let worldPosition = new THREE.Vector3();
						let worldScale = new THREE.Vector3();
						let worldQuaternion = new THREE.Quaternion();
						object.getWorldPosition(worldPosition);
						object.getWorldScale(worldScale);
						object.getWorldQuaternion(worldQuaternion);

						let velocityMaxRotated = new THREE.Vector3().copy(velocityMax);
						let velocityMinRotated = new THREE.Vector3().copy(velocityMin);
						let accelerationMinRotated = new THREE.Vector3().copy(accelerationMin);
						let accelerationMaxRotated = new THREE.Vector3().copy(accelerationMax);
						velocityMaxRotated.applyQuaternion(worldQuaternion);
						velocityMinRotated.applyQuaternion(worldQuaternion);
						accelerationMinRotated.applyQuaternion(worldQuaternion);
						accelerationMaxRotated.applyQuaternion(worldQuaternion);

						for (let i = 0; i < particleCount; i++) {
							lifeSpans[i] -= delta;
							if (lifeSpans[i] <= 0) {
								delta = -lifeSpans[i];
								totalLifeSpans[i] = randRange(lifeSpanMin, lifeSpanMax);
								lifeSpans[i] = totalLifeSpans[i];

								startSizes[i] = randRange(startSizeMin, startSizeMax);
								endSizes[i] = randRange(endSizeMin, endSizeMax);

								velocities[i * 3] = randRange(velocityMinRotated.x, velocityMaxRotated.x);
								velocities[i * 3 + 1] = randRange(velocityMinRotated.y, velocityMaxRotated.y);
								velocities[i * 3 + 2] = randRange(velocityMinRotated.z, velocityMaxRotated.z);

								accelerations[i * 3] = randRange(accelerationMinRotated.x, accelerationMaxRotated.x);
								accelerations[i * 3 + 1] = randRange(accelerationMinRotated.y, accelerationMaxRotated.y);
								accelerations[i * 3 + 2] = randRange(accelerationMinRotated.z, accelerationMaxRotated.z);

								let particlePosition = new THREE.Vector3(
									(Math.random() - 0.5) * worldScale.x,
									(Math.random() - 0.5) * worldScale.y,
									(Math.random() - 0.5) * worldScale.z,
								);
								particlePosition.applyQuaternion(worldQuaternion);

								positions[i * 3] = worldPosition.x + particlePosition.x;
								positions[i * 3 + 1] = worldPosition.y + particlePosition.y;
								positions[i * 3 + 2] = worldPosition.z + particlePosition.z;
							}
							const lifeFactor = 1 - lifeSpans[i] / totalLifeSpans[i];
							scales[i] = THREE.MathUtils.lerp(startSizes[i], endSizes[i], lifeFactor);

							colors[i * 3] = THREE.MathUtils.lerp(startColor[0], endColor[0], lifeFactor);
							colors[i * 3 + 1] = THREE.MathUtils.lerp(startColor[1], endColor[1], lifeFactor);
							colors[i * 3 + 2] = THREE.MathUtils.lerp(startColor[2], endColor[2], lifeFactor);

							positions[i * 3] += velocities[i * 3] * delta;
							positions[i * 3 + 1] += velocities[i * 3 + 1] * delta;
							positions[i * 3 + 2] += velocities[i * 3 + 2] * delta;

							velocities[i * 3] += accelerations[i * 3] * delta;
							velocities[i * 3 + 1] += accelerations[i * 3 + 1] * delta;
							velocities[i * 3 + 2] += accelerations[i * 3 + 2] * delta;
						}

						particleGeometry.attributes.position.needsUpdate = true;
						particleGeometry.attributes.color.needsUpdate = true;
						particleGeometry.attributes.scale.needsUpdate = true;
					};

					level.nodes.levelNodeParticleEmitter.push(object);
					level.complexity += 5;
				} else if (node.levelNodeStatic) {
					let material = materials[Math.min(Math.max(node.levelNodeStatic.material, 0), materials.length - 1)];

					// Neon
					if (node.levelNodeStatic.material === root.COD.Types.LevelNodeMaterial.DEFAULT_COLORED && node.levelNodeStatic.isNeon) {
						material = objectMaterials[3];
					}

					let newMaterial = material.clone();
					newMaterial.uniforms.colorTexture = material.uniforms.colorTexture;

					// Transparent
					if (
						(node.levelNodeStatic.material == root.COD.Types.LevelNodeMaterial.DEFAULT_COLORED ||
							node.levelNodeStatic.material == root.COD.Types.LevelNodeMaterial.LAVA) &&
						node.levelNodeStatic.isTransparent
					) {
						newMaterial.transparent = true;
						newMaterial.uniforms.transparentEnabled.value = 1.0;
					}

					if (
						(node.levelNodeStatic.material == root.COD.Types.LevelNodeMaterial.DEFAULT_COLORED ||
							node.levelNodeStatic.material === root.COD.Types.LevelNodeMaterial.LAVA) &&
						node.levelNodeStatic.color1
					) {
						newMaterial.uniforms.diffuseColor.value = [
							node.levelNodeStatic.color1.r,
							node.levelNodeStatic.color1.g,
							node.levelNodeStatic.color1.b,
						];

						let specularFactor =
							Math.sqrt(
								node.levelNodeStatic.color1.r * node.levelNodeStatic.color1.r +
									node.levelNodeStatic.color1.g * node.levelNodeStatic.color1.g +
									node.levelNodeStatic.color1.b * node.levelNodeStatic.color1.b,
							) * 0.15;
						let specularColor = [specularFactor, specularFactor, specularFactor, 16.0];
						if (node.levelNodeStatic.color2) {
							specularColor = [
								node.levelNodeStatic.color2.r,
								node.levelNodeStatic.color2.g,
								node.levelNodeStatic.color2.b,
								node.levelNodeStatic.color2.a,
							];
							if (node.levelNodeStatic.material === root.COD.Types.LevelNodeMaterial.LAVA) {
								newMaterial.uniforms.isColoredLava.value = 1.0;
							}
						}
						newMaterial.uniforms.specularColor.value = specularColor;
					}

					object = new THREE.Mesh(shapes[node.levelNodeStatic.shape - 1000], newMaterial);
					parentNode.add(object);
					object.position.x = -node.levelNodeStatic.position.x;
					object.position.y = node.levelNodeStatic.position.y;
					object.position.z = -node.levelNodeStatic.position.z;

					object.scale.x = node.levelNodeStatic.scale.x;
					object.scale.y = node.levelNodeStatic.scale.y;
					object.scale.z = node.levelNodeStatic.scale.z;

					object.quaternion.x = -node.levelNodeStatic.rotation.x;
					object.quaternion.y = node.levelNodeStatic.rotation.y;
					object.quaternion.z = -node.levelNodeStatic.rotation.z;
					object.quaternion.w = node.levelNodeStatic.rotation.w;

					object.initialPosition = object.position.clone();
					object.initialRotation = object.quaternion.clone();

					let targetVector = new THREE.Vector3();
					let targetQuaternion = new THREE.Quaternion();
					let worldMatrix = new THREE.Matrix4();
					worldMatrix.compose(
						object.getWorldPosition(targetVector),
						object.getWorldQuaternion(targetQuaternion),
						object.getWorldScale(targetVector),
					);

					let normalMatrix = new THREE.Matrix3();
					normalMatrix.getNormalMatrix(worldMatrix);
					newMaterial.uniforms.worldNormalMatrix.value = normalMatrix;

					level.nodes.material[node.levelNodeStatic.material || 0]?.push(object);
					level.nodes.shape[node.levelNodeStatic.shape || 1000]?.push(object);
					level.nodes.levelNodeStatic.push(object);
					level.complexity += 2;
				} else if (node.levelNodeCrumbling) {
					let material = materials[node.levelNodeCrumbling.material];
					let newMaterial = material.clone();
					newMaterial.uniforms.colorTexture = material.uniforms.colorTexture;

					object = new THREE.Mesh(shapes[node.levelNodeCrumbling.shape - 1000], newMaterial);
					parentNode.add(object);
					object.position.x = -node.levelNodeCrumbling.position.x;
					object.position.y = node.levelNodeCrumbling.position.y;
					object.position.z = -node.levelNodeCrumbling.position.z;

					object.scale.x = node.levelNodeCrumbling.scale.x;
					object.scale.y = node.levelNodeCrumbling.scale.y;
					object.scale.z = node.levelNodeCrumbling.scale.z;

					object.quaternion.x = -node.levelNodeCrumbling.rotation.x;
					object.quaternion.y = node.levelNodeCrumbling.rotation.y;
					object.quaternion.z = -node.levelNodeCrumbling.rotation.z;
					object.quaternion.w = node.levelNodeCrumbling.rotation.w;

					object.initialPosition = object.position.clone();
					object.initialRotation = object.quaternion.clone();

					let targetVector = new THREE.Vector3();
					let targetQuaternion = new THREE.Quaternion();
					let worldMatrix = new THREE.Matrix4();
					worldMatrix.compose(
						object.getWorldPosition(targetVector),
						object.getWorldQuaternion(targetQuaternion),
						object.getWorldScale(targetVector),
					);

					let normalMatrix = new THREE.Matrix3();
					normalMatrix.getNormalMatrix(worldMatrix);
					newMaterial.uniforms.worldNormalMatrix.value = normalMatrix;

					level.nodes.material[node.levelNodeCrumbling.material || 0]?.push(object);
					level.nodes.shape[node.levelNodeCrumbling.shape || 1000]?.push(object);
					level.nodes.levelNodeCrumbling.push(object);
					level.complexity += 3;
				} else if (node.levelNodeTrigger) {
					let isSublevelTrigger = false;

					if (node.levelNodeTrigger.triggerTargets) {
						for (const target of node.levelNodeTrigger.triggerTargets) {
							if (target.triggerTargetSubLevel && target.triggerTargetSubLevel.levelIdentifier) {
								isSublevelTrigger = true;
							}
						}
					}

					let material;
					if (isSublevelTrigger && this.options.sublevels) {
						material = objectMaterials[5];
					} else {
						material = objectMaterials[4];
					}

					let newMaterial = material.clone();
					newMaterial.uniforms.colorTexture = material.uniforms.colorTexture;

					newMaterial.transparent = true;
					newMaterial.uniforms.transparentEnabled.value = 1.0;
					object = new THREE.Mesh(shapes[node.levelNodeTrigger.shape - 1000], newMaterial);

					parentNode.add(object);
					object.position.x = -node.levelNodeTrigger.position.x;
					object.position.y = node.levelNodeTrigger.position.y;
					object.position.z = -node.levelNodeTrigger.position.z;

					object.scale.x = node.levelNodeTrigger.scale.x;
					object.scale.y = node.levelNodeTrigger.scale.y;
					object.scale.z = node.levelNodeTrigger.scale.z;

					object.quaternion.x = -node.levelNodeTrigger.rotation.x;
					object.quaternion.y = node.levelNodeTrigger.rotation.y;
					object.quaternion.z = -node.levelNodeTrigger.rotation.z;
					object.quaternion.w = node.levelNodeTrigger.rotation.w;

					object.initialPosition = object.position.clone();
					object.initialRotation = object.quaternion.clone();

					let targetVector = new THREE.Vector3();
					let targetQuaternion = new THREE.Quaternion();
					let worldMatrix = new THREE.Matrix4();
					worldMatrix.compose(
						object.getWorldPosition(targetVector),
						object.getWorldQuaternion(targetQuaternion),
						object.getWorldScale(targetVector),
					);

					let normalMatrix = new THREE.Matrix3();
					normalMatrix.getNormalMatrix(worldMatrix);
					newMaterial.uniforms.worldNormalMatrix.value = normalMatrix;

					object.isTrigger = true;
					object.visible = this.options.triggers;

					level.nodes.shape[node.levelNodeTrigger.shape || 1000]?.push(object);
					level.nodes.levelNodeTrigger.push(object);
					level.complexity += 5;
				} else if (node.levelNodeSound) {
					let material = objectMaterials[8];

					let newMaterial = material.clone();
					newMaterial.uniforms.colorTexture = material.uniforms.colorTexture;

					newMaterial.transparent = true;
					newMaterial.uniforms.transparentEnabled.value = 1.0;
					object = new THREE.Mesh(shapes[1], newMaterial);

					parentNode.add(object);
					object.position.x = -node.levelNodeSound.position.x;
					object.position.y = node.levelNodeSound.position.y;
					object.position.z = -node.levelNodeSound.position.z;

					object.scale.x = 1;
					object.scale.y = 1;
					object.scale.z = 1;

					object.initialPosition = object.position.clone();
					object.initialRotation = object.quaternion.clone();

					let targetVector = new THREE.Vector3();
					let targetQuaternion = new THREE.Quaternion();
					let worldMatrix = new THREE.Matrix4();
					worldMatrix.compose(
						object.getWorldPosition(targetVector),
						object.getWorldQuaternion(targetQuaternion),
						object.getWorldScale(targetVector),
					);

					let normalMatrix = new THREE.Matrix3();
					normalMatrix.getNormalMatrix(worldMatrix);
					newMaterial.uniforms.worldNormalMatrix.value = normalMatrix;

					object.isSound = true;
					object.visible = this.options.sound;

					level.nodes.shape[1001].push(object);
					level.nodes.levelNodeSound.push(object);
					level.complexity += 8;
				} else if (node.levelNodeStart) {
					console.log(decoded.defaultSpawnPointID, level.nodes.all.length);
					const isDefaultSpawn =
						(decoded.defaultSpawnPointID == 0 && level.nodes.levelNodeStart.length == 0) ||
						decoded.defaultSpawnPointID - 1 == level.nodes.all.length;
					if (isDefaultSpawn) {
						object = new THREE.Mesh(objects[0], objectMaterials[0]);
					} else {
						object = new THREE.Mesh(objects[0], objectMaterials[6]);
					}
					parentNode.add(object);
					object.position.x = -node.levelNodeStart.position.x;
					object.position.y = node.levelNodeStart.position.y;
					object.position.z = -node.levelNodeStart.position.z;

					object.quaternion.set(
						-node.levelNodeStart.rotation.x,
						node.levelNodeStart.rotation.y,
						-node.levelNodeStart.rotation.z,
						node.levelNodeStart.rotation.w,
					);
					// only rotate around Y axis ? this looks wrong but sure
					object.quaternion.x = 0;
					object.quaternion.z = 0;

					object.quaternion.normalize();

					object.scale.x = node.levelNodeStart.radius * 2.0;
					object.scale.z = node.levelNodeStart.radius * 2.0;

					object.initialPosition = object.position.clone();
					object.initialRotation = object.quaternion.clone();

					const spawnName = node.levelNodeStart.name;
					if (spawnName && spawnName.length > 0) {
						namedSpawns[spawnName] = {
							position: object.position.clone(),
							quaternion: object.quaternion.clone(),
						};
					}

					if (isDefaultSpawn) {
						level.nodes.defaultSpawn = object;
					}

					level.nodes.levelNodeStart.push(object);
				} else if (node.levelNodeFinish) {
					object = new THREE.Mesh(objects[0], objectMaterials[1]);
					parentNode.add(object);
					object.position.x = -node.levelNodeFinish.position.x;
					object.position.y = node.levelNodeFinish.position.y;
					object.position.z = -node.levelNodeFinish.position.z;

					object.scale.x = node.levelNodeFinish.radius * 2.0;
					object.scale.z = node.levelNodeFinish.radius * 2.0;

					object.initialPosition = object.position.clone();
					object.initialRotation = object.quaternion.clone();

					level.nodes.levelNodeFinish.push(object);
				} else if (node.levelNodeSign) {
					let material = objectMaterials[2];
					let newMaterial = material.clone();
					newMaterial.uniforms.colorTexture = material.uniforms.colorTexture;

					object = new THREE.Mesh(objects[1], newMaterial);
					parentNode.add(object);
					object.position.x = -node.levelNodeSign.position.x;
					object.position.y = node.levelNodeSign.position.y;
					object.position.z = -node.levelNodeSign.position.z;

					object.quaternion.x = -node.levelNodeSign.rotation.x;
					object.quaternion.y = node.levelNodeSign.rotation.y;
					object.quaternion.z = -node.levelNodeSign.rotation.z;
					object.quaternion.w = node.levelNodeSign.rotation.w;

					object.initialPosition = object.position.clone();
					object.initialRotation = object.quaternion.clone();

					let signText = node.levelNodeSign.text;

					if (signText && this.options.text) {
						let letterSize = 0.059; //Size of the text characters
						const processString = (inputStr) => {
							let words = inputStr.split(/\s+/);
							let currentLineWidth = 0;
							let finalStr = '';

							words.forEach((word) => {
								let wordLength = word.length + 1;
								let wordWidth = wordLength * letterSize;

								/* 1.2 is a magical number to represent the width of the sign */
								if (currentLineWidth + wordWidth >= 1.2) {
									currentLineWidth = wordWidth;
									finalStr += '\n' + word + ' ';
								} else {
									currentLineWidth += wordWidth;
									finalStr += word + ' ';
								}
							});

							return finalStr.trim();
						};

						const processedText = processString(signText);

						const lines = processedText.split('\n');
						lines.forEach((line, index) => {
							const textGeometry = new TextGeometry(line, {
								font: this.font,
								size: letterSize,
								height: 0.0,
								curveSegments: 1,
								bevelEnabled: false,
							});

							const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
							const textMesh = new THREE.Mesh(textGeometry, textMaterial);

							textGeometry.computeBoundingBox();
							const boundingBox = textGeometry.boundingBox;
							const textWidth = boundingBox.max.x - boundingBox.min.x;
							const textHeight = boundingBox.max.y - boundingBox.min.y;

							const verticalSpacing = (textHeight + 0.2 * (index + 1)) / 2;
							textMesh.position.add(new THREE.Vector3(textWidth / 2, -verticalSpacing + 0.05 * (lines.length + 1), -0.025)); // Adjust these values to place the text on the block

							textMesh.rotation.y = Math.PI;

							object.add(textMesh);
						});
					}

					level.nodes.levelNodeSign.push(object);
					level.complexity += 5;
				}

				if (object !== undefined) {
					level.nodes.all.push(object);
					object.userData.node = node;
					if (object.material?.uniforms)
						object.material.uniforms.worldMatrix = { value: new THREE.Matrix4().copy(object.matrixWorld) };
					//Attach data of the first animation to the object (which is all the initial animation system supports anyway)
					if (
						node.animations &&
						node.animations.length > 0 &&
						node.animations[0].frames &&
						node.animations[0].frames.length > 0 &&
						node.activeAnimation === 0
					) {
						object.animation = node.animations[0];
						object.animation.currentFrameIndex = 0;
						level.nodes.animated.push(object);
					}
				}
			}
		};

		loadLevelNodes(decoded.levelNodes, scene);

		return level;
	}
}

function getMaterialForTexture(
	name,
	tileFactor,
	vertexShader,
	fragmentShader,
	specularColor = [0.3, 0.3, 0.3, 16.0],
	neonEnabled = 0.0,
	isLava = 0.0,
) {
	let material = new THREE.ShaderMaterial();
	material.vertexShader = vertexShader;
	material.fragmentShader = fragmentShader;
	material.flatShading = true;

	material.uniforms = {
		colorTexture: { value: null },
		tileFactor: { value: tileFactor },
		diffuseColor: { value: [1.0, 1.0, 1.0] },
		worldNormalMatrix: { value: new THREE.Matrix3() },
		worldMatrix: { value: new THREE.Matrix4() },
		neonEnabled: { value: neonEnabled },
		transparentEnabled: { value: 0.0 },
		fogEnabled: { value: 1.0 },
		specularColor: { value: specularColor },
		isLava: { value: isLava },
		isColoredLava: { value: 0.0 },
	};

	material.uniforms.colorTexture.value = textureLoader.load(name);
	material.uniforms.colorTexture.value.wrapS = material.uniforms.colorTexture.value.wrapT = THREE.RepeatWrapping;
	material.uniforms.colorTexture.value.colorSpace = THREE.SRGBColorSpace;

	return material;
}

async function getGeometryForModel(name) {
	return new Promise((resolve) => {
		gltfLoader.load(name, resolve);
	}).then(function (gltf) {
		return gltf.scene.children[0].geometry;
	});
}

function updateObjectAnimation(object, time) {
	let animation = object.animation;
	const animationFrames = animation.frames;
	const relativeTime = (time * object.animation.speed) % animationFrames[animationFrames.length - 1].time;

	//Find frames to blend between
	let oldFrame = animationFrames[animation.currentFrameIndex];
	let newFrameIndex = animation.currentFrameIndex + 1;
	if (newFrameIndex >= animationFrames.length) newFrameIndex = 0;
	let newFrame = animationFrames[newFrameIndex];

	let loopCounter = 0; //Used to prevent endless loop with only one frame or all having the same time
	while (loopCounter <= animationFrames.length) {
		oldFrame = animationFrames[animation.currentFrameIndex];
		newFrameIndex = animation.currentFrameIndex + 1;
		if (newFrameIndex >= animationFrames.length) newFrameIndex = 0;
		newFrame = animationFrames[newFrameIndex];

		if (oldFrame.time <= relativeTime && newFrame.time > relativeTime) break;
		animation.currentFrameIndex += 1;
		if (animation.currentFrameIndex >= animationFrames.length - 1) animation.currentFrameIndex = 0;

		loopCounter += 1;
	}

	let factor = 0.0;
	let timeDiff = newFrame.time - oldFrame.time;
	if (Math.abs(timeDiff) > 0.00000001) {
		//Prevent dividing by 0 if time of both frames is equal
		factor = (relativeTime - oldFrame.time) / timeDiff;
	}

	const oldRotation = new THREE.Quaternion(-oldFrame.rotation.x, oldFrame.rotation.y, -oldFrame.rotation.z, oldFrame.rotation.w);
	const newRotation = new THREE.Quaternion(-newFrame.rotation.x, newFrame.rotation.y, -newFrame.rotation.z, newFrame.rotation.w);
	const finalRotation = new THREE.Quaternion();
	finalRotation.slerpQuaternions(oldRotation, newRotation, factor);

	const oldPosition = new THREE.Vector3(-oldFrame.position.x, oldFrame.position.y, -oldFrame.position.z);
	const newPosition = new THREE.Vector3(-newFrame.position.x, newFrame.position.y, -newFrame.position.z);
	const finalPosition = new THREE.Vector3();
	finalPosition.lerpVectors(oldPosition, newPosition, factor);

	object.position.copy(object.initialPosition).add(finalPosition.applyQuaternion(object.initialRotation));
	object.quaternion.multiplyQuaternions(object.initialRotation, finalRotation);
}

function updateObjectParticles(object, delta) {
	object.userData.update(delta); // TODO: actually move the logic here
}

export { LevelLoader };
