import * as THREE from 'three';
import { FreeControls } from './free_controls.js';
import { GLTFExporter } from 'three/examples/jsm//exporters/GLTFExporter.js';
import * as config from '../../../src/configuration';
import * as protobuf from 'protobufjs';
import { inflate } from 'pako';
import { LevelLoader } from '../../../src/assets/LevelLoader.js';

import { createApp } from 'vue';
import App from '@/App.vue';
import { useUserStore } from '@/stores/user';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

// TODO: fix inconsistent naming
import { setCreator } from '../../../src/requests/SetCreator.js';
import { GetLevelDetailsRequest } from '../../../src/requests/GetLevelDetailsRequest.js';
import { GetLevelBrowserRequest } from '../../../src/requests/GetLevelBrowserRequest.js';
import { setLevelTagsRequest } from '../../../src/requests/SetLevelTagsRequest.js';
import { removeLevelFromVerificationQueueRequest } from '../../../src/requests/RemoveLevelFromVerificationQueueRequest.js';
import { hideLevelRequest } from '../../../src/requests/HideLevelRequest.js';
import { moderationActionRequest } from '../../../src/requests/ModerationActionRequest.js';
import { resetReportsRequest } from '../../../src/requests/ResetReportsRequest.js';
import { approveLevelRequest } from '../../../src/requests/ApproveLevelRequest.js';
import { GetLevelReportInfoRequest } from '../../../src/requests/GetLevelReportInfoRequest.js';
import { getLevelStatisticsRequest } from '../../../src/requests/GetLevelStatisticsRequest.js';
import { setUserFavorites } from '../../../src/requests/SetUserFavoritesRequest.js';
import { removeUserFavorites } from '../../../src/requests/RemoveUserFavoritesRequest.js';
import { reportLevelRequest } from '../../../src/requests/ReportLevelRequest.js';
import { getLevelLeaderboardRequest } from '../../../src/requests/GetLevelLeaderboardRequest.js';
import { getLevelReplayRequest } from '../../../src/requests/GetLevelReplayRequest.js';
import { removeLevelRecordRequest } from '../../../src/requests/RemoveLevelRecordRequest.js';
import { downloadLevelRequest } from '../../../src/requests/DownloadLevelRequest.js';

import imageStampOk from '../../../src/assets/icons/checkmark.svg';
import imageReport from '../../../src/assets/icons/report.svg';
import imageFavorite from '../../../src/assets/icons/star_off.svg';
import imageFavorited from '../../../src/assets/icons/star_on.svg';

// TODO: handle request fails

let userID = undefined;

// scene
let clock, camera, scene, renderer, controls;
// state
let isFogEnabled = true;
let isSliderDragging = false;
let isSliderPlaying = true;
let showTriggers = false;
// leaderboard
let removedTimes = [];
// image upload
let imageBlob;
let level;
// replays
let replayRoot = undefined;
let replayCache = {};
let replayPath = undefined;
let replayLoading = false;

init();

async function init() {
	setupEvents();

	if (!window._levelLoader) window._levelLoader = new LevelLoader();

	THREE.ColorManagement.enabled = true;

	renderer = new THREE.WebGLRenderer({
		antialias: true,
		preserveDrawingBuffer: true,
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.setClearColor(new THREE.Color(143.0 / 255.0, 182.0 / 255.0, 221.0 / 255.0), 1.0);
	renderer.setAnimationLoop(animation);
	renderer.domElement.id = 'canvas';
	document.body.appendChild(renderer.domElement);

	renderer.domElement.onclick = function () {
		renderer.domElement.requestPointerLock();
	};

	clock = new THREE.Clock();
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 5000);

	controls = new FreeControls(camera, renderer.domElement);

	//Need to setup everything to be able to access the storage through pinia...
	const pinia = createPinia();
	pinia.use(piniaPluginPersistedstate);
	const app = createApp(App);
	app.use(pinia);
	const userStore = useUserStore(pinia);
	let { accessToken, list, listIndex, favoriteLevels } = userStore;
	const urlParams = new URLSearchParams(window.location.search);
	const requestedSpawnPoint = urlParams.get('spawnPoint');

	let defaultSpawn = null;
	let namedSpawns = {};

	var titleLabel = document.getElementById('title');
	var tagsLabel = document.getElementById('tags');
	var creatorsLabel = document.getElementById('creators');
	var descriptionLabel = document.getElementById('description');
	var complexityLabel = document.getElementById('complexity');
	var checkpointsLabel = document.getElementById('checkpoints');

	var dateLabel = document.getElementById('date');

	let levelIdentifier = urlParams.get('level');
	let levelIdentifierParts = levelIdentifier.split(':');
	let hasIteration = levelIdentifierParts.length === 3;

	let detailResponseBody = await GetLevelDetailsRequest(config.SERVER_URL, levelIdentifier);
	userID = levelIdentifierParts[0];
	console.log(userID);

	if ('tags' in detailResponseBody && detailResponseBody.tags.length > 0) {
		detailResponseBody.tags.forEach((tag) => {
			if (tag !== 'ok') {
				tagsLabel.innerHTML += '<span class="tag">' + tag + '</span>';
			}
		});
	}

	if (detailResponseBody.hidden === true && !userStore.isSuperModerator) {
		//Don't load hidden levels unless this is an admin
		titleLabel.innerHTML = '<b>NOT AVAILABLE</b>';
		creatorsLabel.innerHTML = '';
		descriptionLabel.innerHTML = '';
		complexityLabel.innerHTML = '';
		checkpointsLabel.innerHTML = '';
		dateLabel.innerHTML = '';
		return;
	}

	if (!hasIteration) {
		let identifier_parts = detailResponseBody.data_key.split(':');
		identifier_parts.splice(0, 1);
		levelIdentifier = identifier_parts.join(':');
	}

	let responseBody = await downloadLevelRequest(config.SERVER_URL, levelIdentifier);
	let formattedBuffer = new Uint8Array(responseBody);
	window._levelLoader.config({
		sky: true,
		lights: true,
		text: userStore.isVerifier,
		triggers: false, // false by default even with perms
		sound: false,
		sublevels: userStore.isVerifier,
		static: false,
	});
	level = await window._levelLoader.load(formattedBuffer);
	scene.add(level.scene);

	var fullscreenButton = document.getElementById('fullscreen');
	fullscreenButton.onclick = openFullscreen;

	if (list.length > 0 && listIndex != null) {
		let listButtons = document.getElementById('listButtons');
		let nextButton = document.getElementById('nextListItem');
		let backButton = document.getElementById('prevListItem');
		if (listIndex === list.length - 1) {
			nextButton.style.display = 'none';
		}
		if (listIndex === 0) {
			backButton.style.display = 'none';
		}

		let currentListItem = document.getElementById('currentListItem');
		let totalListItems = document.getElementById('totalListItems');
		currentListItem.innerHTML = listIndex + 1;
		totalListItems.innerHTML = list.length;

		let nextListItem = list[listIndex + 1];
		let previousListItem = list[listIndex - 1];
		if (nextListItem && 'object_info' in nextListItem) {
			nextListItem = nextListItem['object_info'];
		}
		if (previousListItem && 'object_info' in previousListItem) {
			previousListItem = previousListItem['object_info'];
		}
		nextButton.addEventListener('click', function () {
			location.href = '/levels/viewer/?level=' + nextListItem.identifier;
			userStore.setListIndex(listIndex + 1);
		});
		backButton.addEventListener('click', function () {
			location.href = '/levels/viewer/?level=' + previousListItem.identifier;
			userStore.setListIndex(listIndex - 1);
		});
		document.addEventListener('keydown', function (event) {
			if (event.key === '2') {
				location.href = '/levels/viewer/?level=' + nextListItem.identifier;
				userStore.setListIndex(listIndex + 1);
			} else if (event.key === '1' && previousListItem) {
				location.href = '/levels/viewer/?level=' + previousListItem.identifier;
				userStore.setListIndex(listIndex - 1);
			}
		});
		if (
			(nextListItem && document.referrer.includes(nextListItem.identifier)) ||
			(previousListItem && document.referrer.includes(previousListItem.identifier)) ||
			(document.referrer.includes('levels') && !document.referrer.includes('viewer'))
		) {
			listButtons.style.display = 'flex';
		}
	}

	if (userStore.isLoggedIn && (userStore.isVerifier || userStore.userID === userID)) {
		const tagButton = document.getElementById('tagButton');
		const tagMenu = document.getElementById('tagMenu');
		const tagMenuInner = document.getElementById('tagMenuInner');
		let levelUserTags = [];
		if ('tags' in detailResponseBody && detailResponseBody.tags.length > 0) {
			levelUserTags = detailResponseBody.tags;
		}

		tagButton.style.display = 'block';
		tagButton.addEventListener('click', async () => {
			tagMenuInner.innerHTML = '';
			const levelBrowser = await GetLevelBrowserRequest(config.SERVER_URL);
			const tags = levelBrowser.tags;
			const tagCheckboxes = [];
			for (const tag of tags) {
				const tagDiv = document.createElement('div');

				const checkbox = document.createElement('input');
				checkbox.type = 'checkbox';
				checkbox.id = `tag-${tag}`;
				checkbox.name = `tag-${tag}`;
				tagDiv.appendChild(checkbox);

				checkbox.addEventListener('change', (e) => {
					if (e.target.checked) {
						let currentChecked = 0;
						for (const checkbox of tagCheckboxes) {
							if (checkbox.checked) {
								currentChecked++;
							}
						}
						if (currentChecked > 2) {
							e.target.checked = false;
						}
					}
				});

				const label = document.createElement('label');
				label.innerHTML = tag;
				label.htmlFor = `tag-${tag}`;
				tagDiv.appendChild(label);

				tagCheckboxes.push(checkbox);
				tagMenuInner.appendChild(tagDiv);

				if (levelUserTags.includes(tag)) {
					checkbox.checked = true;
				}
			}
			const tagCount = tagCheckboxes.length;
			if (tagCount % 3 !== 0) {
				for (let i = 1; i < tagCount % 3; i++) {
					tagMenuInner.appendChild(document.createElement('div'));
				}
			}
			const cancelTagsButton = document.createElement('button');
			cancelTagsButton.id = 'cancelTagsButton';
			cancelTagsButton.innerHTML = 'Cancel';
			tagMenuInner.appendChild(cancelTagsButton);
			cancelTagsButton.addEventListener('click', async () => {
				tagMenu.style.display = 'none';
			});

			tagMenuInner.appendChild(document.createElement('div'));

			const submitTagsButton = document.createElement('button');
			submitTagsButton.id = 'submitTagsButton';
			submitTagsButton.innerHTML = 'Submit Tags';
			tagMenuInner.appendChild(submitTagsButton);
			submitTagsButton.addEventListener('click', async () => {
				levelUserTags = tagCheckboxes.filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.name.split('-')[1]);
				let success = await setLevelTagsRequest(config.SERVER_URL, accessToken, levelIdentifier, null, levelUserTags);
				if (success) {
					tagMenu.style.display = 'none';
				}
			});

			tagMenu.style.display = 'grid';
		});
	}

	let moderationContainer = document.getElementById('moderationcontainer');
	let signTextContainer = document.getElementById('signs-container');
	if (userStore.isVerifier === true) {
		const verifyButton = document.getElementById('verifyButton');
		const unverifyButton = document.getElementById('unverifyButton');
		const verifySkipButton = document.getElementById('verifySkipButton');
		const verifySkipSuccessButton = document.getElementById('verifySkipSuccessButton');
		const triggersButton = document.getElementById('triggersButton');

		triggersButton.style.display = 'block';
		triggersButton.addEventListener('click', () => {
			showTriggers = !showTriggers;

			scene.traverse((node) => {
				if (node instanceof THREE.Mesh) {
					if (node.isTrigger) {
						node.visible = showTriggers;
					}
				}
			});
		});

		verifyButton.style.display = 'block';
		unverifyButton.style.display = 'none';
		if (userStore.getListType() === 'tab_verify_queue') {
			verifySkipButton.style.display = 'block';
		}
		verifySkipSuccessButton.style.display = 'none';
		if ('tags' in detailResponseBody && detailResponseBody.tags.length > 0) {
			for (const tag of detailResponseBody.tags) {
				if (tag === 'ok') {
					verifyButton.style.display = 'none';
					unverifyButton.style.display = 'block';
					break;
				}
			}
		}
		let isLoadingVerification = false;
		verifyButton.addEventListener('click', async () => {
			if (isLoadingVerification) return;
			isLoadingVerification = true;

			let success = await setLevelTagsRequest(config.SERVER_URL, accessToken, levelIdentifier, ['ok'], null);
			if (success) {
				verifyButton.style.display = 'none';
				unverifyButton.style.display = 'block';

				let queueSuccess = await removeLevelFromVerificationQueueRequest(config.SERVER_URL, accessToken, levelIdentifier);
				if (queueSuccess) {
					verifySkipSuccessButton.style.display = 'block';
					verifySkipButton.style.display = 'none';
				}
			}

			isLoadingVerification = false;
		});
		unverifyButton.addEventListener('click', async () => {
			if (isLoadingVerification) return;
			isLoadingVerification = true;

			let success = await setLevelTagsRequest(config.SERVER_URL, accessToken, levelIdentifier, [], null);
			if (success) {
				verifyButton.style.display = 'block';
				unverifyButton.style.display = 'none';
			}

			isLoadingVerification = false;
		});
		let wasSkipped = false;
		verifySkipButton.addEventListener('click', async () => {
			if (wasSkipped) return;
			wasSkipped = true;
			let queueSuccess = await removeLevelFromVerificationQueueRequest(config.SERVER_URL, accessToken, levelIdentifier);
			if (queueSuccess) {
				verifySkipSuccessButton.style.display = 'block';
				verifySkipButton.style.display = 'none';
			}
		});
	}

	if (userStore.isSuperModerator) {
		const hideContainer = document.getElementById('hidecontainer');
		hideContainer.style.display = 'block';
		const hideButton = document.getElementById('hideButton');
		hideButton.addEventListener('click', async () => {
			const reason = document.getElementById('hideReason').value;

			let noPunish = reason === 'no_punish';

			if (reason === 'level_tips') {
				if ('creation_timestamp' in detailResponseBody) {
					const timestamp = detailResponseBody.creation_timestamp;
					const banDate = new Date('April 15, 2024 00:00:00');
					if (timestamp < banDate) {
						noPunish = true;
					}
				}
			}

			let success = await hideLevelRequest(config.SERVER_URL, accessToken, levelIdentifier);
			if (success) {
				if (noPunish) {
					hideContainer.style.display = 'none';
				} else {
					let actionSuccess = await moderationActionRequest(config.SERVER_URL, accessToken, levelIdentifierParts[0], reason);
					if (actionSuccess) {
						hideContainer.style.display = 'none';
					}
					await resetReportsRequest(config.SERVER_URL, accessToken, levelIdentifierParts[0]);
				}
			}
		});

		const approveButton = document.getElementById('approveButton');
		approveButton.addEventListener('click', async () => {
			let success = await approveLevelRequest(config.SERVER_URL, accessToken, levelIdentifier);
			if (success) {
				hideContainer.style.display = 'none';
			}
		});

		let reports_data = await GetLevelReportInfoRequest(config.SERVER_URL, levelIdentifier, accessToken);
		if (reports_data?.object_info) {
			const reportElement = document.getElementById('reports');
			reportElement.style.display = 'block';
			const reportTitle = document.getElementById('reportsTitle');
			reportTitle.innerText += `${reports_data.reported_score} (${reports_data.reported_count})`;
			const reports = document.getElementById('reports');
			const reports_data_filtered = Object.entries(reports_data).filter(([key]) => key.includes('reported_score_'));
			for (const report of reports_data_filtered) {
				reports.innerHTML += `${report[0].slice(15)}:${report[1]}<br>`;
			}
		}

		if (reports_data?.images) {
			for (const image of reports_data.images) {
				let moderationImageElement = document.createElement('div');
				var img = document.createElement('img');
				img.src = 'https://grab-images.slin.dev/' + image.key;
				moderationImageElement.appendChild(img);

				moderationImageElement.addEventListener('click', () => {
					console.log(image.camera_position);
					camera.position.set(-image.camera_position[0], image.camera_position[1], -image.camera_position[2]);
					let quaternion = new THREE.Quaternion();
					quaternion.x = image.camera_rotation[0];
					quaternion.y = image.camera_rotation[1];
					quaternion.z = image.camera_rotation[2];
					quaternion.w = image.camera_rotation[3];

					let euler = new THREE.Euler().setFromQuaternion(quaternion, 'XYZ');
					controls.eulerVector.x = euler.y;
					controls.eulerVector.y = euler.x + Math.PI;
					controls.updateRotationVector();
				});
				moderationContainer.appendChild(moderationImageElement);
			}
		}

		let creatorButton = document.getElementById('make-creator-button');
		creatorButton.style.display = 'block';
		creatorButton.addEventListener('click', async () => {
			await setCreator(config.SERVER_URL, accessToken, levelIdentifierParts[0], true);
		});
	}

	// sublevel triggers
	for (let object of level.nodes.levelNodeTrigger) {
		let node = object.userData.node;

		if (userStore.isVerifier && node.levelNodeTrigger.triggerTargets) {
			const sublevelContainer = document.getElementById('sublevels-container');
			for (const target of node.levelNodeTrigger.triggerTargets) {
				if (target.triggerTargetSubLevel && target.triggerTargetSubLevel.levelIdentifier) {
					const sublevelData = target.triggerTargetSubLevel.levelIdentifier;
					const sublevelParts = sublevelData.split(':');
					let sublevelTimestamp;

					if (sublevelParts[0] === 'community' && sublevelParts.length >= 3) {
						sublevelTimestamp = sublevelParts[2];
					} else if (sublevelParts.length >= 2) {
						sublevelTimestamp = sublevelParts[1];
					}

					if (sublevelTimestamp && userID) {
						document.getElementById('sublevels-title').style.display = 'flex';
						const sublevelElement = document.createElement('a');
						sublevelElement.className = 'sublevel-button';

						const spawnPointName = target.triggerTargetSubLevel.spawnPoint;

						if (spawnPointName && spawnPointName.length > 0) {
							sublevelElement.textContent = spawnPointName;
						} else {
							sublevelElement.textContent = 'Default';
						}

						let newLevelParam = `?level=${userID}:${sublevelTimestamp}`;
						if (spawnPointName) {
							newLevelParam += `&spawnPoint=${spawnPointName}`;
						}
						sublevelElement.href = `${location.origin}${location.pathname}${newLevelParam}`;
						sublevelContainer.appendChild(sublevelElement);
					}
				}
			}
		}
	}

	// default spawn point
	if (level.nodes.defaultSpawn) {
		defaultSpawn = level.nodes.defaultSpawn;
		var goToStartLabel = document.getElementById('startButton');
		goToStartLabel.innerHTML = 'To Start';
		goToStartLabel.style.cursor = 'pointer';
		goToStartLabel.onclick = function () {
			camera.position.set(defaultSpawn.position.x, defaultSpawn.position.y + 2.0, defaultSpawn.position.z);
			let euler = new THREE.Euler().setFromQuaternion(defaultSpawn.quaternion, 'YXZ');
			controls.eulerVector.x = 0;
			controls.eulerVector.y = euler.y + Math.PI;
			controls.updateRotationVector();
		};
	}

	// finish
	if (level.nodes.levelNodeFinish[0]) {
		let object = level.nodes.levelNodeFinish[0];

		var goToFinishLabel = document.getElementById('finishButton');
		goToFinishLabel.innerHTML = 'To Finish';
		goToFinishLabel.style.cursor = 'pointer';

		goToFinishLabel.onclick = function () {
			camera.position.set(object.position.x, object.position.y + 2.0, object.position.z);
		};
	}

	// signs
	if (userStore.isModerator) {
		for (let i in level.nodes.levelNodeSign) {
			let object = level.nodes.levelNodeSign[i];
			let node = object.userData.node;

			let signText = node.levelNodeSign.text;

			if (signText) {
				const euler = new THREE.Euler().setFromQuaternion(object.quaternion, 'XYZ');
				let signTextElement = document.createElement('div');
				const signTextNode = document.createTextNode('Sign ' + i + ': ' + signText);
				signTextElement.appendChild(signTextNode);
				signTextElement.onclick = function () {
					controls.eulerVector.x = 0;
					controls.eulerVector.y = euler.y + Math.PI;
					controls.updateRotationVector();

					let offset = new THREE.Vector3(0, 0, -1);
					if (object.parent && object.parent.quaternion) offset.applyQuaternion(object.parent.quaternion);
					offset.applyQuaternion(object.quaternion);

					let signPos = new THREE.Vector3(0, 0, 0);
					signPos.copy(object.position);
					if (object.parent.position) signPos.add(object.parent.position);
					camera.position.copy(signPos);
					camera.position.add(offset);
				};
				signTextContainer.appendChild(signTextElement);
			}
		}
	}

	// slider
	if (level.nodes.animated.length > 0) {
		const slider = document.getElementById('animation-controls');
		slider.style.display = 'flex';
		for (let object of level.nodes.animated) {
			let animation = object.animation;
			const animationFrames = animation.frames;
			if (parseInt(document.getElementById('time-slider').max) < animationFrames[animationFrames.length - 1].time) {
				document.getElementById('time-slider').max = `${animationFrames[animationFrames.length - 1].time}`;
			}
		}
	}

	const cameraPositionFromUrl = urlParams.get('camera_position');
	const cameraRotationFromUrl = urlParams.get('camera_rotation');

	if (cameraPositionFromUrl && cameraRotationFromUrl) {
		const cameraPosition = cameraPositionFromUrl.split(',').map(parseFloat);
		const cameraRotation = cameraRotationFromUrl.split(',').map(parseFloat);
		camera.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
		controls.eulerVector.x = cameraRotation[0];
		controls.eulerVector.y = cameraRotation[1];
		controls.updateRotationVector();
	} else if (requestedSpawnPoint && namedSpawns[requestedSpawnPoint]) {
		const spawnData = namedSpawns[requestedSpawnPoint];
		camera.position.set(spawnData.position.x, spawnData.position.y + 2.0, spawnData.position.z);
		let euler = new THREE.Euler().setFromQuaternion(spawnData.quaternion, 'YXZ');
		controls.eulerVector.x = 0;
		controls.eulerVector.y = euler.y + Math.PI;
		controls.updateRotationVector();
	} else if (defaultSpawn) {
		camera.position.set(defaultSpawn.position.x, defaultSpawn.position.y + 2.0, defaultSpawn.position.z);
		let euler = new THREE.Euler().setFromQuaternion(defaultSpawn.quaternion, 'YXZ');
		controls.eulerVector.x = 0;
		controls.eulerVector.y = euler.y + Math.PI;
		controls.updateRotationVector();
	} else {
		camera.position.set(0, 2, 0);
	}

	const titleFormattingNode = document.createElement('b');
	titleLabel.appendChild(titleFormattingNode);
	const titleNode = document.createTextNode(level.level.title);
	titleFormattingNode.appendChild(titleNode);

	const leaderboardTitleNode = document.createElement('b');
	document.getElementById('leaderboard-title').appendChild(leaderboardTitleNode);
	leaderboardTitleNode.appendChild(document.createTextNode(level.level.title));

	if (detailResponseBody.scheduled_for_deletion) {
		document.getElementById('scheduled_for_deletion').style.display = 'flex';
	}

	const creatorsFormattingNode = document.createElement('i');
	creatorsLabel.appendChild(creatorsFormattingNode);
	const creatorsNode = document.createTextNode('by ' + level.level.creators);
	creatorsFormattingNode.appendChild(creatorsNode);

	const descriptionNode = document.createTextNode(level.level.description);
	descriptionLabel.appendChild(descriptionNode);
	const complexityNode = document.createTextNode('complexity: ' + level.complexity);
	complexityLabel.title = level.level.complexity;
	complexityLabel.appendChild(complexityNode);
	const checkpointsNode = document.createTextNode('checkpoints: ' + level.level.maxCheckpointCount);
	checkpointsLabel.appendChild(checkpointsNode);

	const creationDate = new Date(detailResponseBody.creation_timestamp);
	const updatedDate = new Date(detailResponseBody.update_timestamp);
	let dateString = 'created: ' + creationDate.toDateString();
	const dateNode = document.createTextNode(dateString);
	dateLabel.appendChild(dateNode);
	if (creationDate.toDateString() !== updatedDate.toDateString()) {
		const updateNode = document.createTextNode('updated: ' + updatedDate.toDateString());
		dateLabel.appendChild(document.createElement('br'));
		dateLabel.appendChild(updateNode);
	}
	if (detailResponseBody.moderator_tag_ok_timestamp && userStore.isModerator) {
		const verificationDate = new Date(detailResponseBody.moderator_tag_ok_timestamp);
		let verifiedDateString = 'Verification Date: ' + verificationDate.toDateString();
		const verifiedDateNode = document.createTextNode(verifiedDateString);
		dateLabel.appendChild(document.createElement('br'));
		dateLabel.appendChild(verifiedDateNode);
	}

	//Show OK stamp on levels that have the tag
	if ('tags' in detailResponseBody && detailResponseBody.tags.length > 0) {
		for (const tag of detailResponseBody.tags) {
			if (tag === 'ok') {
				const detailsContainer = document.getElementById('main-details');
				let stamp = document.createElement('img');
				stamp.className = 'info-stamp-ok';
				stamp.src = imageStampOk;
				detailsContainer.prepend(stamp);
				break;
			}
		}
	}

	if (
		'images' in detailResponseBody &&
		'thumb' in detailResponseBody.images &&
		'key' in detailResponseBody.images.thumb &&
		detailResponseBody.images.thumb.key.length > 0
	) {
		const thumbContainer = document.getElementById('thumb-container');
		let thumbnailImage = document.createElement('img');
		thumbnailImage.src = 'https://grab-images.slin.dev/' + detailResponseBody.images.thumb.key;
		thumbnailImage.className = 'previewImage';
		thumbContainer.prepend(thumbnailImage);
	}

	// difficulty
	let difficultyLabel = document.getElementById('difficulty');
	difficultyLabel.innerText = (detailResponseBody.statistics?.difficulty_string || 'unrated').replace('veryhard', 'very hard');
	difficultyLabel.classList.add('difficulty-' + (detailResponseBody.statistics?.difficulty_string || 'unrated'));

	// get level statistics
	let statisticsData = await getLevelStatisticsRequest(config.SERVER_URL, levelIdentifier);
	if (statisticsData) {
		var totalFinishedLabel = document.getElementById('total finished count');
		totalFinishedLabel.innerHTML =
			'total finished: <b>' + statisticsData.total_finished_count + ' / ' + statisticsData.total_played_count + '</b>';

		var playersFinishedLabel = document.getElementById('players finished count');
		playersFinishedLabel.innerHTML =
			'players finished: <b>' + statisticsData.finished_count + ' / ' + statisticsData.played_count + '</b>';

		var playersLikedLabel = document.getElementById('players liked count');
		playersLikedLabel.innerHTML = 'players liked: <b>' + statisticsData.liked_count + ' / ' + statisticsData.rated_count + '</b>';

		var timeLabel = document.getElementById('average time');
		statisticsData.average_time
			? (timeLabel.innerHTML = 'average time: <b>' + Math.round(statisticsData.average_time * 100) / 100 + 's</b>')
			: (timeLabel.innerHTML = 'average time: <b>N/a</b>');
	}

	if (userStore.isLoggedIn) {
		let favoriteButton = document.getElementById('favoriteButton');
		let unfavoriteButton = document.getElementById('unfavoriteButton');

		let favoriteImg = document.createElement('img');
		favoriteImg.src = imageFavorite;
		favoriteButton.appendChild(favoriteImg);

		let unfavoritesButton = document.createElement('img');
		unfavoritesButton.src = imageFavorited;
		unfavoriteButton.appendChild(unfavoritesButton);

		if (favoriteLevels.includes(detailResponseBody.identifier)) {
			unfavoriteButton.style.display = 'flex';
		} else {
			favoriteButton.style.display = 'flex';
		}

		favoriteButton.addEventListener('click', async () => {
			let success = await setUserFavorites(config.SERVER_URL, levelIdentifier, accessToken);
			if (success) {
				favoriteButton.style.display = 'none';
				unfavoriteButton.style.display = 'flex';
				favoriteLevels.push(detailResponseBody.identifier);
			}
		});

		unfavoriteButton.addEventListener('click', async () => {
			let success = await removeUserFavorites(config.SERVER_URL, levelIdentifier, accessToken);
			if (success) {
				favoriteButton.style.display = 'flex';
				unfavoriteButton.style.display = 'none';
				userStore.favoriteLevels.splice(userStore.favoriteLevels.indexOf(detailResponseBody.identifier), 1);
			}
		});

		let reportButton = document.getElementById('reportButton');
		let reportImg = document.createElement('img');
		reportImg.src = imageReport;
		reportButton.appendChild(reportImg);

		reportButton.style.display = 'flex';

		reportButton.addEventListener('click', () => {
			let reasonMapping = {
				sexual: 'Sexual Content / Genitals',
				violence: 'Detailed Violence',
				hatespeech: 'Offensive Language',
				loweffort: 'Very low effort level',
				glitch: 'Requires to use a Glitch to finish',
				tips: 'Asking for Tips',
				other: 'Other',
			};
			let onOk = async (value, image) => {
				await reportLevelRequest(config.SERVER_URL, accessToken, levelIdentifier, value, image);
			};
			showOptionsDialog('Report Level', 'Why should this level be removed?', reasonMapping, onOk);
		});
	}
}

function setupEvents() {
	document.getElementById('back-button').addEventListener('click', backButtonPressed);
	document.getElementById('copy-button').addEventListener('click', copyLevelURLPressed);
	document.getElementById('location-button').addEventListener('click', copyLocationURLPressed);
	document.getElementById('download-button').addEventListener('click', exportLevelAsGLTF);
	document.getElementById('fog-button').addEventListener('click', toggleFog);

	window.addEventListener('resize', onWindowResize);

	document.addEventListener('pointerlockchange', pointerLockChanged, false);

	document.getElementById('time-slider').addEventListener('input', () => {
		isSliderDragging = true;
	});
	document.getElementById('time-slider').addEventListener('mouseup', () => {
		isSliderDragging = false;
	});
	document.getElementById('time-slider').addEventListener('touchend', () => {
		isSliderDragging = false;
	});
	document.getElementById('play-pause').addEventListener('click', () => {
		isSliderPlaying = !isSliderPlaying;
		if (isSliderPlaying) {
			document.getElementById('pause').style.display = 'flex';
			document.getElementById('play').style.display = 'none';
		} else {
			document.getElementById('play').style.display = 'flex';
			document.getElementById('pause').style.display = 'none';
		}
	});

	document.getElementById('leaderboard-button').addEventListener('click', openLeaderboard);
	document.getElementById('leaderboard-close').addEventListener('click', closeLeaderboard);
	document.getElementById('overlay').addEventListener('click', closeLeaderboard);
	document.getElementById('applyLeaderboardModifications').addEventListener('click', removeLeaderboardTimes);
}

function showImageDialog(title, subtitle, options, onOk) {
	let dialog = document.getElementById('popup-2');
	let titleElement = document.getElementById('popup-title-2');
	let descriptionElement = document.getElementById('popup-description-2');
	let reasonSelector = document.getElementById('popup-reason');
	let imageContext = document.getElementById('popup-thumbnail');
	let imagePreview = document.getElementById('popup-report-image');
	let closeButton = document.getElementById('popup-button-cancel-2');
	let okButton = document.getElementById('popup-button-ok-2');
	let setImageBtn = document.getElementById('report-set-image');
	let takeImageBtn = document.getElementById('report-take-image');
	var tempCanvas = document.getElementById('temp-canvas');
	tempCanvas ? tempCanvas.remove() : (tempCanvas = undefined);

	titleElement.innerHTML = title;
	descriptionElement.innerHTML = subtitle;
	okButton.style.display = 'none';
	takeImageBtn.display = 'initial';

	function onClick() {
		dialog.removeAttribute('open');
		onOk(reasonSelector.value, imageBlob);
		setImageBtn.classList.remove('report-set-image');
		if (tempCanvas) {
			tempCanvas.remove();
		}
	}

	if (!imagePreview.src.includes('../../../src/assets/preview_image_placeholder.png')) {
		okButton.style.display = 'initial';
		okButton.onclick = onClick;
	}

	imageContext.addEventListener('click', function () {
		dialog.removeAttribute('open');
		takeImageBtn.style.display = 'block';
	});

	takeImageBtn.addEventListener('click', function () {
		var tempCanvas = document.createElement('canvas');
		tempCanvas.id = 'temp-canvas';
		tempCanvas.width = 512;
		tempCanvas.height = 288;

		let ctx = tempCanvas.getContext('2d');
		ctx.drawImage(document.getElementById('canvas'), 0, 0, 512, 288);

		setImageBtn.classList.add('report-set-image');
		takeImageBtn.style.display = 'none';
		dialog.setAttribute('open', 'open');
		okButton.style.display = 'initial';

		tempCanvas.toBlob(function (blob) {
			imagePreview.src = URL.createObjectURL(blob);
			imageBlob = blob;
			okButton.onclick = onClick;
		});
	});

	if (!dialog.hasAttribute('open')) {
		dialog.setAttribute('open', 'open');
		closeButton.onclick = function () {
			dialog.removeAttribute('open');
			options ? (reasonSelector.selectedIndex = 0) : null;
		};
	}
}

function showOptionsDialog(title, subtitle, options, onOk) {
	let dialog = document.getElementById('popup');
	let titleElement = document.getElementById('popup-title');
	let descriptionElement = document.getElementById('popup-description');
	let reasonSelector = document.getElementById('popup-reason');
	let closeButton = document.getElementById('popup-button-cancel');
	let okButton = document.getElementById('popup-button-ok');
	let tempCanvas = document.getElementById('temp-canvas');
	let takeImageBtn = document.getElementById('report-take-image');

	takeImageBtn.style.display = 'none';
	titleElement.innerHTML = title;
	descriptionElement.innerHTML = subtitle;
	tempCanvas ? tempCanvas.remove() : (tempCanvas = undefined);

	reasonSelector.style.display = 'block';
	reasonSelector.innerHTML = '';

	let selectOption = document.createElement('option');
	selectOption.innerHTML = '- Select -';
	reasonSelector.appendChild(selectOption);
	for (let key in options) {
		let option = document.createElement('option');
		option.innerHTML = options[key];
		option.value = key;
		reasonSelector.appendChild(option);
	}
	if (!dialog.hasAttribute('open')) {
		// show the dialog
		dialog.setAttribute('open', 'open');

		closeButton.onclick = function () {
			dialog.removeAttribute('open');
			options ? (reasonSelector.selectedIndex = 0) : null;
		};
		okButton.onclick = function () {
			if (reasonSelector.selectedIndex === 0) return; //Don't allow to report without a reason!
			dialog.removeAttribute('open');
			showImageDialog('Report Thumbnail', 'Take a photo for the report in the map', options, onOk);
		};
	}
}

function onWindowResize() {
	let SCREEN_HEIGHT = window.innerHeight;
	let SCREEN_WIDTH = window.innerWidth;

	camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
	camera.updateProjectionMatrix();

	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
}

function animation() {
	const delta = clock.getDelta();
	if (!level) return;

	if (isSliderDragging) {
		level.meta.time = parseInt(document.getElementById('time-slider').value);
		level.update(0);
	} else if (isSliderPlaying) {
		document.getElementById('time-slider').value = level.meta.time + delta;
		level.update(delta);
	}

	controls.update(delta);
	renderer.render(scene, camera);
}

function toggleFog() {
	isFogEnabled = !isFogEnabled;
	let fogValue = isFogEnabled ? 1.0 : 0.0;

	scene.traverse(function (node) {
		if (node instanceof THREE.Mesh || node instanceof THREE.Points) {
			if ('material' in node && 'uniforms' in node.material && 'fogEnabled' in node.material.uniforms) {
				node.material.uniforms['fogEnabled'].value = fogValue;
			}
		}
	});
}

function openFullscreen() {
	let elem = document.getElementById('canvas');
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.mozRequestFullScreen) {
		/* Firefox */
		elem.mozRequestFullScreen();
	} else if (elem.webkitRequestFullscreen) {
		/* Chrome, Safari & Opera */
		elem.webkitRequestFullscreen();
	} else if (elem.msRequestFullscreen) {
		/* IE/Edge */
		elem.msRequestFullscreen();
	}
	elem.style.width = '100%';
	elem.style.height = '100%';
}

function pointerLockChanged() {
	if (document.pointerLockElement === document.getElementById('canvas')) {
		controls.isMouseActive = true;
	} else {
		controls.isMouseActive = false;
	}
}

function backButtonPressed() {
	let newURL = new URL(window.location);
	newURL.pathname = '/levels';
	if (userID !== undefined) newURL.search = '?tab=user&user_id=' + userID;
	else newURL.search = '';
	window.location.href = newURL.href;
}

async function copyLevelURLPressed() {
	const urlParams = new URLSearchParams(window.location.search);
	const url = window.location.href.split('?')[0];
	const levelID = urlParams.get('level');
	await navigator.clipboard.writeText(url + '?level=' + levelID);
}

function copyLocationURLPressed() {
	const urlParams = new URLSearchParams(window.location.search);
	const url = window.location.href.split('?')[0];
	const levelID = urlParams.get('level');
	const cameraPosition = camera.position;
	const cameraRotation = controls.eulerVector;
	const positionString = `camera_position=${cameraPosition.x},${cameraPosition.y},${cameraPosition.z}`;
	const rotationString = `camera_rotation=${cameraRotation.x},${cameraRotation.y}`;
	const newUrl = `${url}?level=${levelID}&${positionString}&${rotationString}`;
	navigator.clipboard.writeText(newUrl);
}

function saveDataAsFile(filename, data) {
	const blob = new Blob([data], { type: 'text/json' });
	if (window.navigator.msSaveOrOpenBlob) {
		window.navigator.msSaveBlob(blob, filename);
	} else {
		const elem = window.document.createElement('a');
		elem.href = window.URL.createObjectURL(blob);
		elem.download = filename;
		document.body.appendChild(elem);
		elem.click();
		document.body.removeChild(elem);
	}
}

function exportLevelAsGLTF() {
	const exporter = new GLTFExporter();
	exporter.parse(
		scene,
		(gltf) => {
			console.log(gltf);
			saveDataAsFile('test.gltf', JSON.stringify(gltf));
		},
		(err) => {
			console.error(err);
		},
		{},
	);
}

function openLeaderboard() {
	document.getElementById('overlay').style.display = 'block';
	document.getElementById('leaderboard').style.display = 'block';
	loadLeaderboardData();
}

function closeLeaderboard() {
	document.getElementById('overlay').style.display = 'none';
	document.getElementById('leaderboard').style.display = 'none';
	removedTimes = [];
	document.getElementById('applyLeaderboardModifications').style.display = 'none';
	document.getElementById('leaderboard-content').innerHTML = '';
}

async function loadLeaderboardData() {
	const urlParams = new URLSearchParams(window.location.search);
	let levelIdentifier = urlParams.get('level');
	let leardeboard = await getLevelLeaderboardRequest(config.SERVER_URL, levelIdentifier);
	if (leardeboard) {
		displayLeaderboardData(leardeboard);
	}
}

function displayLeaderboardData(data) {
	const leaderboardContent = document.getElementById('leaderboard-content');
	leaderboardContent.innerHTML = '';

	if (data.length === 0) {
		const placeholder = document.createElement('div');
		placeholder.className = 'leaderboard-placeholder';
		placeholder.innerHTML = 'No data yet!<br>Be the first to set a record!';
		leaderboardContent.appendChild(placeholder);
	} else {
		const pinia = createPinia();
		pinia.use(piniaPluginPersistedstate);
		const app = createApp(App);
		app.use(pinia);
		const userStore = useUserStore(pinia);
		let maxDecimals = 0;
		data.forEach((entry) => {
			let decimals = entry.best_time.toString().split('.')[1];
			if (decimals) {
				maxDecimals = Math.max(maxDecimals, decimals.length);
			}
		});
		data.forEach((entry) => {
			const row = document.createElement('div');
			row.className = 'leaderboard-row';
			if (entry.user_id == userID) {
				row.className += ' leaderboard-row-creator';
			}
			if (entry.user_id == userStore.userID) {
				row.className += ' leaderboard-row-self';
			}
			if (entry.is_verification) {
				row.className += ' leaderboard-row-verification';
			}

			const position = document.createElement('div');
			position.className = 'leaderboard-position';
			position.textContent = entry.position + 1;

			const name = document.createElement('a');
			name.className = 'leaderboard-name';
			name.textContent = entry.user_name;
			name.href = `/levels?tab=tab_other_user&user_id=${entry.user_id}`;

			const time = document.createElement('div');
			time.className = 'leaderboard-time';
			let minutes = Math.floor(entry.best_time / 60);
			let seconds = (entry.best_time % 60).toFixed(maxDecimals);
			if (minutes < 10) {
				minutes = '0' + minutes;
			}
			if (seconds < 10) {
				seconds = '0' + seconds;
			}
			time.textContent = minutes + ':' + seconds;

			if (entry.replay_key && userStore.isVerifier) {
				const replayButton = document.createElement('div');
				replayButton.className = 'replay-button';
				time.appendChild(replayButton);
				replayButton.addEventListener('click', () => {
					playReplay(entry.replay_key);
				});
			}

			const button = document.createElement('button');
			button.className = 'leaderboard-button';
			button.innerHTML = '&times;';
			button.onclick = function () {
				for (let i = 0; i < removedTimes.length; i++) {
					if (removedTimes[i][0] === entry.user_id) {
						removedTimes[i][1].classList.remove('leaderboard-row-removed');
						removedTimes.splice(i, 1);
						document.getElementById('applyLeaderboardModifications').style.display = removedTimes.length > 0 ? 'block' : 'none';
						return;
					}
				}
				removedTimes.push([entry.user_id, row]);
				row.classList.add('leaderboard-row-removed');
				document.getElementById('applyLeaderboardModifications').style.display = 'block';
			};

			row.appendChild(position);
			row.appendChild(name);
			row.appendChild(time);
			if (userStore.isModerator === true) row.appendChild(button);
			leaderboardContent.appendChild(row);
		});
	}
}

function loadReplayProto() {
	return new Promise((resolve, reject) => {
		if (replayRoot) {
			resolve(replayRoot);
		} else {
			protobuf.load('/proto/replay.proto', function (err, root) {
				if (err) reject(err);
				if (root) {
					replayRoot = root;
					resolve(replayRoot);
				}
			});
		}
	});
}

async function playReplay(replayKey) {
	if (replayLoading) return;
	replayLoading = true;
	loadReplayProto()
		.then(async (root) => {
			const ReplayMessage = root.lookupType('COD.Replay.Replay');

			let replay = replayCache[replayKey];
			if (!replay) {
				const responseBody = await getLevelReplayRequest(config.DATA_URL, replayKey);
				const formattedBuffer = new Uint8Array(responseBody);
				const inflated = inflate(formattedBuffer);
				replay = ReplayMessage.decode(inflated);
				replayCache[replayKey] = replay;
			}

			if (replay) {
				const points = [];
				const colors = [];
				let attemptStart = 0;
				const trackRoute = () => {
					for (let i = attemptStart + 3; i < colors.length; i += 3) {
						colors[i] = 0;
						colors[i + 1] = 0;
						colors[i + 2] = 1;
					}
				};

				let didRespawn = false;
				let cx = 0,
					cy = 0,
					cz = 0;
				let x = 0,
					y = 0,
					z = 0;
				for (const frame of replay.frames) {
					const checkpoint = frame.checkpoint;
					if (checkpoint) {
						cx = -checkpoint.x || cx;
						cy = checkpoint.y || cy;
						cz = -checkpoint.z || cz;
						trackRoute();
						attemptStart = colors.length;
					}

					const position = frame.position;
					if (position) {
						const nx = -position.x || x;
						const ny = position.y || y;
						const nz = -position.z || z;

						let r = 0.5,
							g = 0.5,
							b = 1;
						const nd = new THREE.Vector3(x, y, z).distanceTo({ x: nx, y: ny, z: nz });
						const cd = new THREE.Vector3(nx, ny, nz).distanceTo({ x: cx, y: cy, z: cz });
						if (didRespawn || (nd > 1 && cd < 2)) {
							(r = 0.3), (g = 0), (b = 0);
							didRespawn = !didRespawn;
							attemptStart = colors.length;
						}

						points.push(x, y, z);
						colors.push(r, g, b);
						(x = nx), (y = ny), (z = nz);
					}
				}
				trackRoute();

				const pathMaterial = new THREE.LineBasicMaterial({ vertexColors: true });
				const pathGeometry = new THREE.BufferGeometry();
				pathGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
				pathGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

				if (replayPath) scene.remove(replayPath);
				replayPath = new THREE.Line(pathGeometry, pathMaterial);
				scene.add(replayPath);

				console.log(`Loaded ghost with ${points.length} frames`);
			}
		})
		.catch((err) => console.error(err))
		.finally(() => (replayLoading = false));
}

async function removeLeaderboardTimes() {
	const pinia = createPinia();
	pinia.use(piniaPluginPersistedstate);
	const app = createApp(App);
	app.use(pinia);
	const userStore = useUserStore(pinia);
	const urlParams = new URLSearchParams(window.location.search);
	let levelIdentifier = urlParams.get('level');
	for (let i = 0; i < removedTimes.length; i++) {
		let success = await removeLevelRecordRequest(config.SERVER_URL, userStore.accessToken, levelIdentifier, removedTimes[i][0]);
		if (success) {
			removedTimes[i][1].remove();
		} else {
			alert('Failed to remove user');
		}
	}
	removedTimes = [];
}
