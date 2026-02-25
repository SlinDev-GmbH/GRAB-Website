import * as THREE from 'three';
import MeshUtils from './MeshUtils';
import { SGMLoader } from './sgmLoader';

class Player {
	constructor(baseUrl, scene, itemsList, playerItems, onModelLoaded = null) {
		this.baseUrl = baseUrl;
		this.scene = scene;
		this.activeModels = {};
		this.itemsList = itemsList;
		this.ropeOverrides = {};
		this.onModelLoaded = onModelLoaded;
		this.subscribers = new Set();
		this.defaults = {
			head: {
				file: 'player/head',
				materials: [
					{ type: 'default_primary_color' },
					{ type: 'default_secondary_color' },
					{ type: 'default_secondary_color_visor' },
				],
			},
			body: {
				file: 'player/body',
				materials: [{ type: 'default_secondary_color' }, { type: 'default_primary_color' }],
			},
			hand: {
				file: 'player/hand_claw',
				materials: [{ type: 'default_primary_color' }, { type: 'default_secondary_color' }],
			},
			feet: {
				file: 'player/feet',
				materials: [{ type: 'default_secondary_color' }],
			},
			'rope/left': {
				file: 'player/grapple_rope',
			},
			'rope/right': {
				file: 'player/grapple_rope',
			},
			checkpoint: { file: 'player/checkpoint' },
			'grapple/hook/left': { file: 'player/grapple_anchor' },
			'grapple/hook/right': { file: 'player/grapple_anchor' },
		};

		this.loadDefaults().then(() => {
			for (let itemType in playerItems) {
				this.loadModel(playerItems[itemType], itemType);
			}
		});
	}

	subscribe(callback) {
		if (callback) {
			this.subscribers.add(callback);
		}
	}

	unsubscribe(callback) {
		this.subscribers.delete(callback);
	}

	notifyChange() {
		this.subscribers.forEach((callback) => {
			callback();
		});
	}

	loadDefaults() {
		const loadPromises = [];

		for (let type in this.defaults) {
			loadPromises.push(this.loadModel(this.defaults[type].file, type));
		}

		return Promise.all(loadPromises);
	}

	unequip(type) {
		if (this.defaults[type]) {
			this.loadModel(this.defaults[type].file, type);
		} else {
			this.HandleModelToScene(undefined, type);
		}
	}

	HandleModelToScene(model = undefined, itemType) {
		if (this.activeModels[itemType]) {
			this.resetAttachments(itemType);
			this.scene.remove(this.activeModels[itemType]);
		}

		this.activeModels[itemType] = model;
		model ? this.scene.add(model) : undefined;
		this.notifyChange();
	}

	loadModel(targetname, itemtype) {
		const loader = new SGMLoader();
		const item = this.itemsList[targetname] || this.defaults[itemtype];
		const file = item.file || targetname;

		loader.load(this.baseUrl, file, (model) => {
			model = MeshUtils.applyMaterialIndices(model, item);
			if (itemtype === 'feet') {
				this.applyFeetMaterialNames(model);
			}
			model = MeshUtils.applyColors(this.scene, item, model);
			if (itemtype === 'checkpoint') {
				this.applyRotationYawPitchRollDegrees(model, [180, 0, 0]);
			}
			model = MeshUtils.adjustGroupForCategory(model, itemtype);
			this.applyAttachmentOffset(model, item);
			this.updateRopePresentation(model, itemtype, item);

			model.name = targetname;
			model.grab_type = itemtype;

			model = this.setupAttachments(model, item.attachment_point ? itemtype + '/' + item.attachment_point : itemtype);

			this.HandleModelToScene(model, itemtype);

			this.refreshAllAttachments();
			if (this.onModelLoaded) {
				this.onModelLoaded(model, itemtype);
			}
			this.notifyChange();
		});
	}

	updateRopePresentation(model, itemtype, item = null) {
		if (itemtype.startsWith('rope/')) {
			this.applyRopeOverridesFromItemType(model, itemtype);
			this.applyRopeTextureTiling(model);
			return;
		}

		if (itemtype.includes('grapple/hook')) {
			this.applyGrappleOffsetToRope(itemtype, item || this.itemsList[model.name] || this.defaults[itemtype]);
		}
	}

	applyFeetMaterialNames(model) {
		model.traverse((obj) => {
			if (obj.material) {
				obj.name = 'default_secondary_color';
			}
		});
	}

	refreshAllAttachments() {
		for (let parentType in this.activeModels) {
			const parentModel = this.activeModels[parentType];
			const parentItem = parentModel ? this.itemsList[parentModel.name] || this.defaults[parentType] : null;
			if (parentModel && parentItem) {
				this.adjustAttachments(parentModel, parentItem, parentType);
			}
		}
	}

	resetAttachments(itemtype) {
		for (let attachmentType in this.activeModels) {
			if (attachmentType.startsWith(itemtype + '/')) {
				this.activeModels[attachmentType].restore();
			}
		}
	}

	adjustAttachments(parentModel, item, parentType) {
		const parentItemType = item?.type || parentType;
		if (!parentModel || !parentItemType) {
			return;
		}
		const hasAttachmentPoints = !!item?.attachment_points;
		const allowsDefaultPoints = parentItemType === 'head' || parentItemType === 'body';
		if (!hasAttachmentPoints && !allowsDefaultPoints) {
			return;
		}
		Object.entries(this.activeModels).forEach(([childType, childModel]) => {
			if (childType === parentType) {
				return;
			}
			if (!childModel || !childType.startsWith(`${parentItemType}/`)) {
				return;
			}
			const childItem = this.itemsList[childModel.name] || this.defaults[childType];
			const attachmentPoint = this.getAttachmentPointData(childType, childItem, parentModel, item);
			if (!attachmentPoint) {
				return;
			}
			this.applyAttachment(childModel, parentModel, attachmentPoint);
		});
	}
	applyAttachment(childModel, parentModel, point) {
		childModel.restore();
		const basePosition = childModel.position.clone();
		const baseRotation = childModel.rotation.clone();

		let localPosition = basePosition.clone();
		if (point.position) {
			localPosition.add(new THREE.Vector3(...point.position));
		}

		childModel.rotation.copy(baseRotation);
		if (point.rotation) {
			this.applyRotationYawPitchRollDegrees(childModel, point.rotation, false);
		}

		if (point.scale) {
			childModel.scale.set(point.scale, point.scale, point.scale);
		}

		childModel.position.copy(localPosition);
		const childItem = this.itemsList[childModel.name] || this.defaults[childModel.grab_type];
		this.applyAttachmentOffset(childModel, childItem);
		const localAdjustedPosition = childModel.position.clone();

		const parentWorldPosition = new THREE.Vector3();
		const parentWorldQuaternion = new THREE.Quaternion();
		parentModel.updateMatrixWorld(true);
		parentModel.getWorldPosition(parentWorldPosition);
		parentModel.getWorldQuaternion(parentWorldQuaternion);

		childModel.position.copy(localAdjustedPosition);
		childModel.position.applyQuaternion(parentWorldQuaternion);
		childModel.position.add(parentWorldPosition);

		childModel.quaternion.multiplyQuaternions(parentWorldQuaternion, childModel.quaternion);

		this.updateRopePresentation(childModel, childModel.grab_type || '', childItem);
	}

	getAttachmentPointData(childType, childItem, parentModel, parentItem) {
		const parts = childType.split('/');
		if (parts.length < 2 || !parentModel) {
			return null;
		}

		let attachmentPointDict = {};
		const overrides = childItem?.attachment_point_overrides;
		if (overrides) {
			const overrideEntry = overrides[parentModel.name] || overrides.default;
			if (overrideEntry) {
				attachmentPointDict = { ...overrideEntry };
			}
		}

		let attachmentPointDefaultInfo = null;
		if (parentItem?.attachment_points) {
			let partsWithoutRoot = parts.slice(1);
			if (childItem?.attachment_point) {
				partsWithoutRoot = partsWithoutRoot.concat(childItem.attachment_point);
			}
			const attachmentPointName = partsWithoutRoot.join('/');
			attachmentPointDefaultInfo = parentItem.attachment_points[attachmentPointName] || null;
		}

		if (!attachmentPointDefaultInfo) {
			attachmentPointDefaultInfo = this.getDefaultAttachmentPointData(childType, childItem);
		}

		if (!attachmentPointDict.position && attachmentPointDefaultInfo?.position) {
			attachmentPointDict.position = attachmentPointDefaultInfo.position;
		}
		if (!attachmentPointDict.rotation && attachmentPointDefaultInfo?.rotation) {
			attachmentPointDict.rotation = attachmentPointDefaultInfo.rotation;
		}
		if (!attachmentPointDict.scale && attachmentPointDefaultInfo?.scale) {
			attachmentPointDict.scale = attachmentPointDefaultInfo.scale;
		}

		let scale = attachmentPointDict.scale ?? 1;
		if (childItem?.scale) {
			scale *= childItem.scale;
		}

		return {
			position: attachmentPointDict.position || null,
			rotation: attachmentPointDict.rotation || null,
			scale,
		};
	}

	getDefaultAttachmentPointData(childType, childItem) {
		const parts = childType.split('/');
		let attachmentPointNameParts = parts.slice(0);
		if (childItem?.attachment_point) {
			attachmentPointNameParts = attachmentPointNameParts.concat(childItem.attachment_point);
		}
		const attachmentPointName = attachmentPointNameParts.join('/');

		const positions = {
			'head/hat': [0.0, 0.190766, 0.0],
			'head/glasses': [0.0, 0.008302, -0.203441],
			'head/glasses/mouth': [0.0, -0.192385, -0.291841],
			'head/glasses/emoji': [0.0, -0.192385, -0.294],
			'body/backpack': [0.0, -0.311955, 0.278574],
			'body/neck/chest': [0.0, -0.300416, -0.124705],
			'body/badge/left': [-0.134673, -0.267122, -0.088314],
			'body/badge/right': [0.134673, -0.267122, -0.088314],
			'body/lower': [0.0, -0.55, 0.1],
		};

		const rotations = {
			'body/badge/left': [15.4997, -1.23764, 0.0],
			'body/badge/right': [-15.4997, -1.23764, 0.0],
		};

		return {
			position: positions[attachmentPointName] || null,
			rotation: rotations[attachmentPointName] || null,
			scale: 1,
		};
	}
	getAttachmentOffset(item) {
		if (!item) {
			return 0;
		}

		if (item.attachment_offset_v2 !== undefined) {
			return item.attachment_offset_v2;
		}
		if (item.attachment_offset !== undefined) {
			return item.attachment_offset;
		}
		return 0;
	}

	applyRotationYawPitchRollDegrees(model, rotation, reset = true) {
		if (!rotation) {
			return;
		}

		const [yaw, pitch, roll] = Array.isArray(rotation) ? rotation : [rotation.yaw, rotation.pitch, rotation.roll];
		const degToRad = Math.PI / 180;
		if (reset) {
			model.rotation.set(0, 0, 0);
		}
		model.rotateZ(roll * degToRad);
		model.rotateY(yaw * degToRad);
		model.rotateX(pitch * degToRad);
	}

	applyAttachmentOffset(model, item) {
		const offset = this.getAttachmentOffset(item);
		if (!offset) {
			return;
		}

		const prevOffset = model.userData.attachmentOffsetValue || 0;
		if (prevOffset === offset) {
			return;
		}

		model.translateZ(-(offset - prevOffset));
		model.userData.attachmentOffsetValue = offset;
	}

	applyGrappleOffsetToRope(itemtype, item) {
		if (!item || !itemtype.includes('grapple/hook')) {
			return;
		}

		let ropeTypes = [];
		if (itemtype.endsWith('/left')) {
			ropeTypes = ['rope/left'];
		} else if (itemtype.endsWith('/right')) {
			ropeTypes = ['rope/right'];
		} else {
			ropeTypes = ['rope/left', 'rope/right'];
		}

		ropeTypes.forEach((ropeType) => {
			const ropeModel = this.activeModels[ropeType];
			if (!ropeModel) {
				return;
			}
			this.applyRopeOverrides(ropeModel, ropeType, item);
			this.applyRopeTextureTiling(ropeModel);
		});
	}

	applyRopeOverridesFromItemType(model, itemtype) {
		if (!itemtype.startsWith('rope/')) {
			return;
		}

		const ropeSpec = this.ropeOverrides[itemtype];
		if (!ropeSpec) {
			return;
		}

		this.applyRopeOverridesToModel(model, ropeSpec);
	}

	applyRopeOverrides(ropeModel, ropeType, grappleItem) {
		const ropeSpec = grappleItem?.rope;
		if (!ropeSpec) {
			return;
		}

		this.ropeOverrides[ropeType] = ropeSpec;
		this.applyRopeOverridesToModel(ropeModel, ropeSpec);
	}

	applyRopeOverridesToModel(ropeModel, ropeSpec) {
		if (ropeSpec.materials) {
			const ropeItem = { materials: ropeSpec.materials };
			MeshUtils.applyMaterialIndices(ropeModel, ropeItem);
			MeshUtils.applyColors(this.scene, ropeItem, ropeModel);
			this.applyRopeMaterialOverrides(ropeModel);
		}

		if (ropeSpec.thickness) {
			this.applyRopeThickness(ropeModel, ropeSpec.thickness);
		}
	}

	applyRopeMaterialOverrides(ropeModel) {
		ropeModel.traverse((obj) => {
			if (!obj.material) {
				return;
			}
			if (obj.name === 'default_color') {
				obj.material.map = null;
				obj.material.needsUpdate = true;
			}
		});
	}

	applyRopeThickness(ropeModel, thickness) {
		const prevThickness = ropeModel.userData.ropeThicknessApplied || 1;
		if (prevThickness === thickness) {
			return;
		}

		const factor = thickness / prevThickness;
		ropeModel.scale.x *= factor;
		ropeModel.scale.y *= factor;
		ropeModel.userData.ropeThicknessApplied = thickness;
	}

	getRopeLengthScale(ropeModel) {
		return Math.max(1, Math.abs(ropeModel.scale.x), Math.abs(ropeModel.scale.y), Math.abs(ropeModel.scale.z));
	}

	ensureRopeTextureInstance(material) {
		if (!material.map) {
			return;
		}

		if (!material.userData.ropeTextureIsolated) {
			material.map = material.map.clone();
			material.userData.ropeTextureIsolated = true;
		}
	}

	applyRopeTextureTiling(ropeModel) {
		const lengthScale = this.getRopeLengthScale(ropeModel);
		ropeModel.traverse((obj) => {
			if (!obj.material || !obj.material.map) {
				return;
			}

			this.ensureRopeTextureInstance(obj.material);
			obj.material.map.wrapS = THREE.RepeatWrapping;
			obj.material.map.wrapT = THREE.RepeatWrapping;
			obj.material.map.repeat.y = lengthScale;
			obj.material.map.needsUpdate = true;
			obj.material.needsUpdate = true;
		});
	}

	setupAttachments(model, type) {
		let { position, rotation } = this.handleAttachments(type);
		let initialPosition, initialRotation;

		if (rotation) {
			this.applyRotationYawPitchRollDegrees(model, rotation);
		}
		initialRotation = model.rotation.clone();

		if (position) {
			position = new THREE.Vector3(...position);
			model.position.add(position);
		}

		initialPosition = model.position.clone();

		model.restore = () => {
			if (initialPosition) {
				model.position.copy(initialPosition);
			}

			if (initialRotation) {
				model.rotation.copy(initialRotation);
			}

			model.scale.set(1, 1, 1);

			return model;
		};

		return model;
	}

	handleAttachments(type) {
		if (type.includes('/')) {
			return { position: null, rotation: null };
		}
		const positions = {
			'head/hat': [0.0, 0.190766, 0.0],
			'head/glasses': [0.0, 0.008302, -0.203441],
			'head/glasses/mouth': [0.0, -0.192385, -0.291841],
			'head/glasses/emoji': [0.0, -0.192385, -0.294],
			'body/backpack': [0.0, -0.311955, 0.278574],
			'body/neck/chest': [0.0, -0.300416, -0.124705],
			'body/badge/left': [-0.134673, -0.267122, -0.088314],
			'body/badge/right': [0.134673, -0.267122, -0.088314],
			'body/lower': [0.0, -0.55, 0.1],
		};

		const rotations = {
			'body/badge/left': [15.4997, -1.23764, 0.0],
			'body/badge/right': [-15.4997, -1.23764, 0.0],
		};

		return { position: positions[type] || null, rotation: rotations[type] || null };
	}
}

export { Player };
