import * as THREE from 'three';
import MeshUtils from './MeshUtils';
import { SGMLoader } from "./sgmLoader";

class Player {
    constructor(baseUrl, scene, itemsList, playerItems) {
        this.baseUrl = baseUrl
        this.scene = scene;
        this.activeModels = {};
        this.itemsList = itemsList;
        this.pendingAttachments = {};
        this.defaults = {
            "head": {
                file: "player/head",
                materials: [
                    { type: "default_primary_color" },
                    { type: "default_secondary_color" },
                    { type: "default_secondary_color_visor" },
                ]
            },
            "body": {
                file: "player/body",
                materials: [
                    { type: "default_secondary_color" },
                    { type: "default_primary_color" }
                ],
            },
            "hand": {
                file: "player/hand_claw",
                materials: [
                    { type: "default_primary_color" },
                    { type: "default_secondary_color" }
                ]
            },
            "rope/left": {
                file: "player/grapple_rope",
            },
            "rope/right": {
                file: "player/grapple_rope",
            },
            "checkpoint": { file: "player/checkpoint" },
            "grapple/hook/left": { file: "player/grapple_anchor" },
            "grapple/hook/right": { file: "player/grapple_anchor" }
        };

        this.loadDefaults().then(() => {
            for (let itemType in playerItems) {
                this.loadModel(playerItems[itemType], itemType)
            }
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
            this.loadModel(this.defaults[type].file, type)
        } else {
            this.HandleModelToScene(undefined, type)
        }
    }

    HandleModelToScene(model = undefined, itemType) {
        if (this.activeModels[itemType]) {
            this.resetAttachments(itemType)
            this.scene.remove(this.activeModels[itemType])
        }

        this.activeModels[itemType] = model;
        model ? this.scene.add(model) : undefined
    }

    loadModel(targetname, itemtype) {
        const loader = new SGMLoader();
        const item = this.itemsList[targetname] || this.defaults[itemtype];
        const file = item.file || targetname;

        loader.load(this.baseUrl, file, (model) => {
            model = MeshUtils.applyMaterialIndices(model, item)
            model = MeshUtils.applyColors(this.scene, item, model)
            model = MeshUtils.adjustGroupForCategory(model, itemtype)

            model.name = targetname;
            model.grab_type = itemtype;

            model = this.setupAttachments(model, item.attachment_point ? itemtype + '/' + item.attachment_point : itemtype)

            this.HandleModelToScene(model, itemtype)

            this.applyPendingAttachments(model, itemtype)

            this.adjustAsChildModel(itemtype)
        });
    }

    applyPendingAttachments(model, itemtype) {
        if (this.pendingAttachments[itemtype]) {
            this.adjustAttachments(model, this.itemsList[model.name]);
            delete this.pendingAttachments[itemtype];
        }
    }

    adjustAsChildModel(itemtype) {
        for (let parentType in this.activeModels) {
            const parentModel = this.activeModels[parentType];
            const parentItem = this.itemsList[parentModel.name];
            if (parentItem && parentItem.attachment_points && parentItem.attachment_points[itemtype.split('/').pop()]) {
                this.adjustAttachments(parentModel, parentItem);
                break;
            }
        }
    }

    resetAttachments(itemtype) {
        for (let attachmentType in this.activeModels) {
            if (attachmentType.startsWith(itemtype + "/")) {
                this.activeModels[attachmentType].restore();
            }
        }
    }

    adjustAttachments(parentModel, item) {
        if (item.attachment_points) {
            for (let [attachmentType, point] of Object.entries(item.attachment_points)) {
                const fullAttachmentType = `${item.type}/${attachmentType}`;
                const childModel = this.activeModels[fullAttachmentType];

                if (childModel) {
                    this.applyAttachment(childModel, parentModel, point);
                } else {
                    // Queue the attachment for later
                    this.pendingAttachments[fullAttachmentType] = { parentModel, point, attachmentType };
                }
            }
        }
        if (item.attachment_offset_v2) {
            parentModel.position.z -= (item.attachment_offset_v2)
        }
    }
    applyAttachment(childModel, parentModel, point) {
        childModel.restore();
        const override = this.itemsList[childModel.name].attachment_point_overrides?.[parentModel.name];
        if (override) {
            if (override.position) childModel.position.copy(new THREE.Vector3(...override.position));
            if (override.scale) childModel.scale.set(override.scale, override.scale, override.scale);
        } else {
            if (point.position) {
                childModel.position.copy(new THREE.Vector3(...point.position));
                if (childModel.grab_type.includes('body')) {
                    childModel.position.y += -0.2;
                }
            }
            if (point.rotation) childModel.rotation.copy(new THREE.Euler(...point.rotation));
            if (point.scale) childModel.scale.set(point.scale, point.scale, point.scale);
        }
    }

    setupAttachments(model, type) {
        let { position, rotation } = this.handleAttachments(type);
        let initialPosition, initialRotation;

        if (rotation) {
            rotation = new THREE.Euler(
                (rotation.x * Math.PI) / 180, // Convert to radians
                (rotation.y * Math.PI) / 180,
                (rotation.z * Math.PI) / 180
            );
            model.rotation.copy(rotation);
        }
        initialRotation = model.rotation.clone();

        if (position) {
            position = new THREE.Vector3(...position)
            model.position.add(position)
        }

        initialPosition = model.position.clone()

        model.restore = () => {
            if (initialPosition) {
                model.position.copy(initialPosition)
            }

            if (initialRotation) {
                model.rotation.copy(initialRotation)
            }

            model.scale.set(1, 1, 1)

            return model;
        };

        return model;
    }

    handleAttachments(type) {
        const positions = {
            "head/hat": [0.0, 0.190766, 0.0],
            "head/glasses": [0.0, 0.008302, -0.203441],
            "head/glasses/mouth": [0.0, -0.192385, -0.291841],
            "head/glasses/emoji": [0.0, -0.192385, -0.294],
            "body/backpack": [0.0, -0.311955, 0.278574],
            "body/neck/chest": [0.0, -0.300416, -0.124705],
            "body/badge/left": [-0.134673, -0.267122, -0.088314],
            "body/badge/right": [0.134673, -0.267122, -0.088314],
            "body/lower": [0.0, -0.55, 0.1]
        };

        const rotations = {
            "body/badge/left": [15.4997, -1.23764, 0.0],
            "body/badge/right": [-15.4997, -1.23764, 0.0]
        };

        return { position: positions[type] || null, rotation: rotations[type] || null };
    }
}

export { Player };
