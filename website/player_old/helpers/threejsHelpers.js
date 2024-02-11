import * as THREE from "three"
export const initScene = () => {
  const scene = new THREE.Scene()
  scene.background = null

  scene.add(new THREE.AmbientLight(0xffffff, 1))
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
  directionalLight.position.set(0, 1, 2)
  scene.add(directionalLight)

  const camera = new THREE.PerspectiveCamera(55, 400 / 450, 1, 1000)
  camera.position.z = 3.5
  camera.rotation.x = -0.1

  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector(".player-model"),
    alpha: true,
    transparent: true,
    antialias: true,
    preserveDrawingBuffer: true 
  })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(400, 450)
  return {
    scene,
    camera,
    renderer,
  }
}

export const processItemsAndSections = (
  sectionItems,
  catalogSection,
  files,
  items
) => {
  for (var item in sectionItems) {
    for (var cosmeticItem in items) {
      let preview_rotation = items[cosmeticItem].preview_rotation
      let materialList = []
      for (var e in items[cosmeticItem].materials_v2) {
        if (items[cosmeticItem].materials_v2[e].type) {
          materialList.push(items[cosmeticItem].materials_v2[e].type)
        } else {
          materialList.push(items[cosmeticItem].materials_v2[e])
        }
      }

      if (sectionItems[item] === cosmeticItem) {
        files[cosmeticItem] = {
          file: "/" + items[cosmeticItem].file + ".sgm",
          name: items[cosmeticItem].title,
          category: catalogSection.title,
          primaryColor: items[cosmeticItem].colors
            ? items[cosmeticItem].colors[0]
            : undefined,
          secondaryColor: items[cosmeticItem].colors
            ? items[cosmeticItem].colors[1]
              ? items[cosmeticItem].colors[1]
              : undefined
            : undefined,
          materials: materialList,
          type: items[cosmeticItem].type,
          previewRotation: preview_rotation,
          attachment_points: items[cosmeticItem].attachment_points
            ? items[cosmeticItem].attachment_points
            : undefined,
          attachment_point_overrides: items[cosmeticItem]
            .attachment_point_overrides
            ? items[cosmeticItem].attachment_point_overrides
            : undefined,
            attachment_offset: items[cosmeticItem].attachment_offset_v2? items[cosmeticItem].attachment_offset_v2:undefined
          }
      }
    }
  }
}

export function setupRenderer(canvas) {
  let renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    transparent: true,
    antialias: true,
  })
  renderer.setPixelRatio(window.devicePixelRatio)
  return renderer
}

export const loadLight = (scenes, scene) => {
  var light = new THREE.DirectionalLight(0xffffff, 1)
  scene.add(new THREE.AmbientLight(0xffffff))
  light.position.set(0, 0, 1)
  scene.add(light)
  scenes.push(scene)
}

export const applyColors = (
  group,
  playerPrim_Color,
  playerSec_Color,
  visorColor
) => {
  group.children.forEach((obj) => {
    if (obj.name === "default_primary_color" && playerPrim_Color) {
      obj.material.color.set(playerPrim_Color)
    } else if (obj.name === "default_secondary_color" && playerSec_Color) {
      obj.material.color.set(playerSec_Color)
    } else if (obj.name === "default_secondary_color_visor" && visorColor) {
      obj.material.color.set(visorColor)
    }
  })
  return group
}
