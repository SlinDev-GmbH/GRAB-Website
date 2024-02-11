import * as THREE from "three"
import { applyColors } from "./threejsHelpers.js"
 
export function createThreeGroup(
  meshes,
  materials,
  item,
  files,
  playerPrim_Color,
  playerSec_Color,
  visorColor
) {
  let group = new THREE.Group()
  const threeMaterials = materials.map((material) =>
    createThreeMaterial(material)
  )

  meshes.forEach((mesh) => {
    const geometry = createThreeGeometry(mesh)
    const threeMesh = new THREE.Mesh(
      geometry,
      threeMaterials[mesh.material_id]
    )
    group.add(threeMesh)
  })

  group = applyPreviewRotation(group, item, files)
  group = applyMaterialsAndColors(
    group,
    item,
    files,
    playerPrim_Color,
    playerSec_Color,
    visorColor
  )

  return group
}

function createThreeMaterial(material) {
  const color = material.colors[0][0]
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color[0], color[1], color[2]),
  })
}

function createThreeGeometry(mesh) {
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
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3))
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(new THREE.Uint32BufferAttribute(mesh.indices, 1))

  return geometry
}

function applyPreviewRotation(group, item, files) {
  if (files[item].previewRotation !== undefined) {
    const [rx, ry, rz] = files[item].previewRotation.map(Number)
    group.rotation.x += (ry * Math.PI) / 180
    group.rotation.y += (rx * Math.PI) / 180
    group.rotation.z += (rz * Math.PI) / 180
  }
  return group
}

function applyMaterialsAndColors(
  group,
  item,
  files,
  playerPrim_Color,
  playerSec_Color,
  visorColor
) {
  group.name = files[item].name
  if (files[item].category == "hand") {
    group.rotation.x += Math.PI / 2
  }
  group = applyMaterialIndices(group, item, files)
  group = applyColors(group, playerPrim_Color, playerSec_Color, visorColor)

  return group
}

export function applyMaterialIndices(group, item, files) {
  if (files[item].materials.indexOf("default_primary_color") !== -1) {
    group.children[
      files[item].materials.indexOf("default_primary_color")
    ].name = "default_primary_color"
  }
  if (files[item].materials.indexOf("default_secondary_color") !== -1) {
    group.children[
      files[item].materials.indexOf("default_secondary_color")
    ].name = "default_secondary_color"
  }
  if (files[item].materials.indexOf("default_secondary_color_visor") !== -1) {
    group.children[
      files[item].materials.indexOf("default_secondary_color_visor")
    ].name = "default_secondary_color_visor"
  }
  return group
}
