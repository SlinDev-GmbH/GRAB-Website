import * as THREE from 'three';

class MeshUtils {

  // Function to convert a color from linear to gamma space
  static linearToGamma([r, g, b]) {
    r = (r <= 0.0031308) ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055;
    g = (g <= 0.0031308) ? 12.92 * g : 1.055 * Math.pow(g, 1 / 2.4) - 0.055;
    b = (b <= 0.0031308) ? 12.92 * b : 1.055 * Math.pow(b, 1 / 2.4) - 0.055;
    return [r, g, b];
  }

  // Static method to reduce color brightness by 50%
  static halfColor(color) {
    return new THREE.Color(color).multiplyScalar(0.5);
  }

  // Optimized applyColors function
  static applyColors(scene, item, group) {
    const primaryColor = new THREE.Color(...MeshUtils.linearToGamma(scene.userData.primary_color));
    const secondaryColor = new THREE.Color(...MeshUtils.linearToGamma(scene.userData.secondary_color));

    const colorMap = {
      "default_color": index => new THREE.Color(...MeshUtils.linearToGamma(item.materials[index].diffuseColor)),
      "default_primary_color": () => primaryColor,
      "default_secondary_color": () => secondaryColor,
      "default_secondary_color_visor": () => MeshUtils.halfColor(secondaryColor.clone()),
      "default_secondary_color_darkened": () => MeshUtils.halfColor(secondaryColor.clone()),
      "default_primary_color_darkened": () => MeshUtils.halfColor(primaryColor.clone()),
      "default_primary_color_visor": () => MeshUtils.halfColor(primaryColor.clone()),
    };

    group.children.forEach((obj, index) => {
      const getColor = colorMap[obj.name];
      if (getColor) {
        obj.material.color.set(getColor(index));
      }
    });

    return group;
  }

  // Method to apply material indices to the group
  static applyMaterialIndices(group, item) {
    if (!item || !item.materials) {
      for (let child of group.children) {
        child.name = "default";
      }
    } else {
      for (let index in item.materials) {
        if (group.children[index] !== undefined) {
          group.children[index].name = item.materials[index].type ? item.materials[index].type : item.materials[index];
        }
      }
    }
    return group;
  }

  // Method to adjust the group's position/rotation based on item type
  static adjustGroupForCategory(group, itemtype) {
    if (itemtype.includes('body')) {
      group.position.copy(new THREE.Vector3(0, -0.2, 0));

    } else if (itemtype === 'hand') {
      let hands = [group, group.clone()];
      hands[1].position.set(0.3, -0.5, -0.4);//left hand
      hands[1].rotation.z = 170*(Math.PI/180)
      hands[1].rotation.x = 10*(Math.PI/180)
      hands[1].rotation.y = 0
// 50/50 this is right


      hands[0].position.set(-0.3, -0.75, -0.1);
      hands[0].rotation.x = -45*(Math.PI/180)
      hands[0].rotation.y = 0
      hands[0].rotation.z = -190*(Math.PI/180)      
      hands[0].scale.set(-1,1,1) 







      let handsGroup = new THREE.Group();
      handsGroup.add(hands[0]);
      handsGroup.add(hands[1]);

      return handsGroup;
    } else if (itemtype === "checkpoint") {
      group.position.set(-0.5, -1.5, 0);
    } else if(itemtype == "rope/left" || itemtype === "grapple/hook/left") {
      group.position.set(0.3, -0.5, -0.4);
      // group.rotation.z = 170*(Math.PI/180)
      // group.rotation.x = 10*(Math.PI/180)
      // group.rotation.y = 0

    } else if(itemtype == "rope/right" || itemtype === "grapple/hook/right") {

      group.position.set(-0.3, -0.75, -0.1);
      // group.rotation.x = -45*(Math.PI/180)
      // group.rotation.y = 0
      // group.rotation.z = -190*(Math.PI/180)      
      group.scale.set(-1,1,1)  // should just copy the hands tbh

    }
    return group;
  }
}

export default MeshUtils;
