import * as THREE from 'three';
import MeshUtils from './MeshUtils';
import { SGMLoader } from "./sgmLoader";

class Player {
    constructor(scene, itemsList) {
        this.scene = scene;
        this.activeModels = {};
        this.itemsList = itemsList;
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
        this.loadDefaults();
    }

    loadDefaults() {
        for (let type in this.defaults) {
            this.loadModel(this.defaults[type].file /*using it as a name here*/, type); //this part isnt all that great but necessary
        }
    }

    unequip(type) { //shush bad naming but I have no other names
        if (this.defaults[type]) {
            this.loadModel(this.defaults[type].file, type)
        } else {
            this.HandleModelToScene(undefined, type)
        }
    }

    HandleModelToScene(model = undefined, itemType){
        if (this.activeModels[itemType]) {
            this.resetAttachments(itemType);
            this.scene.remove(this.activeModels[itemType]);
        }

        this.activeModels[itemType] = model;
        model?this.scene.add(model):undefined
    }

    loadModel(targetname, itemtype) {
        const loader = new SGMLoader();
        const item = this.itemsList[targetname] || this.defaults[itemtype]
        const file = item.file || targetname;

        loader.load(file, (model) => {
            model = MeshUtils.applyMaterialIndices(model, item);
            model = MeshUtils.applyColors(this.scene, item, model);
            model = MeshUtils.adjustGroupForCategory(model, itemtype);

            model.name = targetname;

            model = this.setupAttachments(model, item.attachment_point ? itemtype + '/' + item.attachment_point : itemtype);
            
            this.adjustAttachments(model, item);

            this.HandleModelToScene(model, itemtype)
   

        });
    }

    resetAttachments(itemtype) {
        for (let attachmentType in this.activeModels) {
            if (attachmentType.startsWith(itemtype + "/")) {
                this.activeModels[attachmentType].restore();
            }
        }
    }

    adjustAttachments(parentModel, item, type) {
        if (item.attachment_points) {
            for (let [attachmentType, point] of Object.entries(item.attachment_points)) {
                const fullAttachmentType = `${item.type}/${attachmentType}`;
                const childModel = this.activeModels[fullAttachmentType];

                if (childModel) {
                    childModel.restore();

                    const override = item.attachment_point_overrides?.[parentModel.name];
                    if (override) {
                        if (override.position) childModel.position.copy(new THREE.Vector3(...override.position));
                        if (override.scale) childModel.scale.set(override.scale, override.scale, override.scale);
                    } else {
                        if (point.position) childModel.position.copy(new THREE.Vector3(...point.position));
                        if (point.rotation) childModel.rotation.copy(new THREE.Euler(...point.rotation));

                        if (point.scale) childModel.scale.set(point.scale, point.scale, point.scale);
                    }
                }
            }
        }
        if (item.attachment_offset_v2){
            parentModel.position.z -=(item.attachment_offset_v2)
        }
    }

    setupAttachments(model, type) {
        let { position, rotation } = this.handleAttachments(type);
        let initialPosition, initialRotation;

        // Handle rotation if provided
        if (rotation) {
            rotation = new THREE.Euler(
                (rotation.x * Math.PI) / 180, // Convert to radians
                (rotation.y * Math.PI) / 180,
                (rotation.z * Math.PI) / 180
            );
            model.rotation.copy(rotation); // Set the rotation directly
        }
        initialRotation = model.rotation.clone(); // Clone after modifications

        // Handle position if provided
        if (position) {
            position = new THREE.Vector3(...position);
            model.position.add(position); // Add to the current position
        }
        initialPosition = model.position.clone(); // Clone after modifications

        model.restore = () => {
            if (initialPosition){ model.position.copy(initialPosition);
                console.log(initialPosition)

            }
            if (initialRotation) model.rotation.copy(initialRotation);
            model.scale.set(1, 1, 1);
            return model;
        };

        return model;
    }

    handleAttachments(type) {
        const positions = {
            "head/hat": [0.0, 0.190766, 0.0],
            "head/glasses": [0.0, 0.008302, -0.203441],
            "head/glasses/mouth": [0.0, -0.192385, -0.291841],
            "body/backpack": [0.0, -0.311955, 0.278574],
            "body/neck/chest": [0.0, -0.300416, -0.124705],
            "body/badge/left": [-0.134673, -0.267122, -0.088314],
            "body/badge/right": [0.134673, -0.267122, -0.088314],
        };

        const rotations = {
            "body/badge/left": [15.4997, -1.23764, 0.0],
            "body/badge/right": [-15.4997, -1.23764, 0.0]
        };

        return { position: positions[type] || null, rotation: rotations[type] || null };
    }
}

export { Player };
