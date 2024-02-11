export const filesConstants = {
  default: {
    file: "../../cosmetics/head/head/head.sgm",
    name: "Head Basic",
    category: "Heads",
    materials: [
      "default_primary_color",
      "default_secondary_color",
      "default_secondary_color_visor",
    ],
    type:"head",
    previewRotation: [180, 0, 0],
    attachment_points: { glasses: { position: [0, 0, 0] } }, //really weird condition
  },
  player_basic_body: {
    file: "../../cosmetics/body/body.sgm",
    name: "Body Basic",
    category: undefined,
    materials: ["default_secondary_color", "default_primary_color"],
  },
  player_basic_hand: {
    file: "../../cosmetics/hand/hand_claw.sgm",
    name: "Claw Hand",
    category: "Hands",
    type:"hand",
    materials: [
      "default_primary_color",
      "default_secondary_color",
      "default_secondary_color_visor",
    ],
    previewRotation: [180, 0, 0],
  },
}
