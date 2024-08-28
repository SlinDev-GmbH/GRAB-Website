import * as THREE from 'three';

class MeshUtils {

  static linearToGamma(color) {
    return color.map(c => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
  }

  static halfColor(color) {
    return color.multiplyScalar(0.5);
  }

  static getColorFromInput(colorInput) {
    return colorInput instanceof THREE.Color
      ? colorInput
      : new THREE.Color(...(Array.isArray(colorInput) ? MeshUtils.linearToGamma(colorInput) : [colorInput]));
  }

  static applyColors(scene, item, group) {
    const primaryColor = MeshUtils.getColorFromInput(scene.userData.primary_color);
    const secondaryColor = MeshUtils.getColorFromInput(scene.userData.secondary_color);

    const colorMap = {
      default_color: (index) => new THREE.Color(...MeshUtils.linearToGamma(item.materials[index].diffuseColor)),
      default_primary_color: () => primaryColor,
      default_secondary_color: () => secondaryColor,
      default_secondary_color_visor: () => MeshUtils.halfColor(secondaryColor.clone()),
      default_secondary_color_darkened: () => MeshUtils.halfColor(secondaryColor.clone()),
      default_primary_color_darkened: () => MeshUtils.halfColor(primaryColor.clone()),
      default_primary_color_visor: () => MeshUtils.halfColor(primaryColor.clone()),
    };

    group.traverse((obj) => {
      if (obj.material && colorMap[obj.name]) {
        obj.material.color.set(colorMap[obj.name](group.children.indexOf(obj)));
      }
    });

    return group;
  }

  static applyColorsToAll(scene) {
    const primaryColor = MeshUtils.getColorFromInput(scene.userData.primary_color);
    const secondaryColor = MeshUtils.getColorFromInput(scene.userData.secondary_color);

    const colorMap = {
      default_primary_color: () => primaryColor,
      default_secondary_color: () => secondaryColor,
      default_secondary_color_visor: () => MeshUtils.halfColor(secondaryColor.clone()),
      default_secondary_color_darkened: () => MeshUtils.halfColor(secondaryColor.clone()),
      default_primary_color_darkened: () => MeshUtils.halfColor(primaryColor.clone()),
      default_primary_color_visor: () => MeshUtils.halfColor(primaryColor.clone()),
    };

    scene.traverse((obj) => {
      if (obj.material && colorMap[obj.name]) {
        obj.material.color.set(colorMap[obj.name]());
      }
    });
  }

  static applyMaterialIndices(group, item) {
    group.children.forEach((child, index) => {
      child.name = item?.materials?.[index]?.type || item?.materials?.[index] || "default";
    });
    return group;
  }

  static adjustGroupForCategory(group, itemtype) {
    if (itemtype.includes('body')) {
      group.position.copy(new THREE.Vector3(0, -0.2, 0));

    } else if (itemtype === 'hand') {
      const handsGroup = new THREE.Group();
      const leftHand = group.clone()
      const rightHand = group

      leftHand.position.set(0.3, -0.5, -0.4)
      leftHand.rotation.set(10 * Math.PI / 180, 0, 170 * Math.PI / 180)

      rightHand.position.set(-0.3, -0.75, -0.1)
      rightHand.rotation.set(-45 * Math.PI / 180, 0, -190 * Math.PI / 180)
      rightHand.scale.set(-1, 1, 1)

      handsGroup.add(leftHand, rightHand);
      return handsGroup;
    } else if (itemtype === "checkpoint") {
      group.position.set(-0.5, -1.5, 0)
    } else if(itemtype == "rope/left" || itemtype === "grapple/hook/left") {
      group.position.set(0.3, -0.5, -0.4)
      group.rotation.z = 170*(Math.PI/180)
      group.rotation.x = 10*(Math.PI/180)
      group.rotation.y = 0

    } else if(itemtype == "rope/right" || itemtype === "grapple/hook/right") {

      group.position.set(-0.3, -0.75, -0.1);
      group.rotation.x = -45*(Math.PI/180)
      group.rotation.y = 0
      group.rotation.z = -190*(Math.PI/180)      
      group.scale.set(-1,1,1)  

    }
    if (itemtype.includes("grapple/hook")) {
      let offset = new THREE.Vector3(0, 0, -1)
      offset.applyQuaternion(group.quaternion)
      group.position.add(offset)
    }
    return group;
  }
}

export default MeshUtils;
