import * as THREE from "three"

export async function createGroupFromMeshes(meshes, materials, file, files) {
  const group = new THREE.Group()
  group.name = files[file].name 
  const threeMaterials = materials.map((material) => {
    const color = material.colors[0][0]
    const matOptions = {
      color: new THREE.Color(color[0], color[1], color[2]),
    }
    return new THREE.MeshStandardMaterial(matOptions)
  })

  meshes.forEach((mesh) => {
    const geometry = new THREE.BufferGeometry()
    const positions = []
    const normals = []
    const uvs = []

    mesh.vertices.forEach((vertex) => {
      positions.push(...vertex[0])
      normals.push(...vertex[1])
      if (vertex[2].length > 0) {
        uvs.push(...vertex[2][0])
      }
    })
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    )
    geometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(normals, 3)
    )
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
    geometry.setIndex(new THREE.Uint32BufferAttribute(mesh.indices, 1))

    const threeMesh = new THREE.Mesh(
      geometry,
      threeMaterials[mesh.material_id]
    )
    group.add(threeMesh)
  })

  return group
}

export function adjustPositionForCategory(
  category,
  group,
  file,
  files,
  activeCosmetics,
  scene
) {
  if (category) {
    if (["head", "head/hat", "head/glasses"].includes(category)) {
      group.position.y += 0.2
    }
    if ("head" === category) {
      if (activeCosmetics["head/glasses"]) {
        let referenceGroup = scene.getObjectByName(
          files[activeCosmetics["head/glasses"]].name
        )
        referenceGroup.position.set(0, 0.2, 0)
        if (
          files[file].attachment_points &&
          files[file].attachment_points.glasses
        ) {
          if (files[file].attachment_points.glasses.scale) {
            referenceGroup.scale.set(
              files[file].attachment_points.glasses.scale,
              files[file].attachment_points.glasses.scale,
              files[file].attachment_points.glasses.scale
            )
          }
          referenceGroup.position.z -= Number(
            files[file].attachment_points.glasses.position[2]
          )
        }
        if (activeCosmetics["head/glasses"].attachment_point_overrides) {
          referenceGroup.position.x -= Number(
            files[file].attachment_point_overrides[activeCosmetics["head"]]
              .position[0]
          )
          referenceGroup.position.y += Number(
            files[file].attachment_point_overrides[activeCosmetics["head"]]
              .position[1]
          )
          referenceGroup.position.z -= Number(
            files[file].attachment_point_overrides[activeCosmetics["head"]]
              .position[2]
          )
        }
      }
      if (activeCosmetics["head/hat"]) {
        let referenceGroup = scene.getObjectByName(
          files[activeCosmetics["head/hat"]].name
        )
        referenceGroup.position.set(0, 0.2, 0)
        if (
          files[file].attachment_points &&
          files[file].attachment_points.hat
        ) {
          if (files[file].attachment_points.hat.scale) {
            referenceGroup.scale.set(
              files[file].attachment_points.hat.scale,
              files[file].attachment_points.hat.scale,
              files[file].attachment_points.hat.scale
            )
          }
          referenceGroup.position.y += Number(
            files[file].attachment_points.hat.position[1]
          )
        }
      }
    }
    if (files[activeCosmetics["head"]].attachment_points) {
      if ("head/glasses" === category) {
        if (files[activeCosmetics["head"]].attachment_points.glasses) {
          if (files[activeCosmetics["head"]].attachment_points.glasses.scale) {
            group.scale.set(
              files[activeCosmetics["head"]].attachment_points.glasses.scale,
              files[activeCosmetics["head"]].attachment_points.glasses.scale,
              files[activeCosmetics["head"]].attachment_points.glasses.scale
            )
          }
          group.position.z -= Number(
            files[activeCosmetics["head"]].attachment_points.glasses
              .position[2]
          )
        }
        if (files[file].attachment_point_overrides) {
          group.position.x -= Number(
            files[file].attachment_point_overrides[activeCosmetics["head"]]
              .position[0]
          )
          group.position.y += Number(
            files[file].attachment_point_overrides[activeCosmetics["head"]]
              .position[1]
          )
          group.position.z -= Number(
            files[file].attachment_point_overrides[activeCosmetics["head"]]
              .position[2]
          )
        }
      }
      if ("head/hat" === category) {
        if (files[activeCosmetics["head"]].attachment_points.hat) {
          if (files[activeCosmetics["head"]].attachment_points.hat.scale) {
            group.scale.set(
              files[activeCosmetics["head"]].attachment_points.hat.scale,
              files[activeCosmetics["head"]].attachment_points.hat.scale,
              files[activeCosmetics["head"]].attachment_points.hat.scale
            )
          }
          group.position.y += Number(
            files[activeCosmetics["head"]].attachment_points.hat.position[1]
          )
        }
      }
    }
    if ("grapple/hook" === category) {
      group.position.x = 0.5
      group.position.y = -1.0
  group.rotation.z+=Math.PI
  group.rotation.x-=Math.PI/2
  
    }

    if ("checkpoint" === category) {
      group.position.x = -0.5
      group.position.y = -1.5
      group.rotation.y += Math.PI
    }
  }
  return group
}

export function handleAttachmentPoints(files, file, group) {
  if (files[file].materials.indexOf("default_primary_color") !== -1) {
    group.children[
      files[file].materials.indexOf("default_primary_color")
    ].name = "default_primary_color"
  }
  if (files[file].materials.indexOf("default_secondary_color") !== -1) {
    group.children[
      files[file].materials.indexOf("default_secondary_color")
    ].name = "default_secondary_color"
  }
  if (files[file].materials.indexOf("default_secondary_color_visor") !== -1) {
    group.children[
      files[file].materials.indexOf("default_secondary_color_visor")
    ].name = "default_secondary_color_visor"
  }

  if (
    files[file].materials.indexOf("default_primary_color") == -1 &&
    files[file].primaryColor
  ) {
    group.children[0].material.color.set(
      `#${Math.round(files[file].primaryColor[0] * 255)
        .toString(16)
        .padStart(2, "0")}${Math.round(files[file].primaryColor[1] * 255)
        .toString(16)
        .padStart(2, "0")}${Math.round(files[file].primaryColor[2] * 255)
        .toString(16)
        .padStart(2, "0")}`
    )
  }
  if (
    files[file].materials.indexOf("default_secondary_color") == -1 &&
    files[file].secondaryColor
  ) {
    group.children[1].material.color.set(
      `#${Math.round(files[file].secondaryColor[0] * 255)
        .toString(16)
        .padStart(2, "0")}${Math.round(files[file].secondaryColor[1] * 255)
        .toString(16)
        .padStart(2, "0")}${Math.round(files[file].secondaryColor[2] * 255)
        .toString(16)
        .padStart(2, "0")}`
    )
  }
  return group
}
