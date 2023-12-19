import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SGMLoader } from './sgmLoader.js'

( async () => {

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user_id');
const playerInfo_Url = `https://api.slin.dev/grab/v1/get_user_info?user_id=${userId}`;
const picker = document.getElementById('categories-content')
const item_api = await fetch('https://api.slin.dev/grab/v1/get_shop_items?version=1');
const items = await item_api.json();
let catalogResponse = await fetch('https://api.slin.dev/grab/v1/get_shop_catalog?version=1');
let catalogResponseBody = await catalogResponse.json();
let playerPrim_Color;
let playerSec_Color;
let visorColor;
let selectedPrimaryDiv;
let primaryOpened;
let selectedSecondaryDiv;
let secondaryOpened;
let files = {};
let backTracker;
let clonedGroup;
let activeCosmetics = {
  'Heads': undefined,
  'Hats': undefined,
  'Facewear': undefined,
  'Hands': undefined,
  'Checkpoints': undefined,
  'Grapples': undefined,
  'Body': undefined
}

function ConvertHSVToRGB(h, s, v, alpha) {
  let hi = h * 3.0 / Math.PI
  const f = hi - Math.floor(hi)

  if (hi >= 3.0)
    hi -= 6.0
  if (hi < -3.0)
    hi += 6.0

  let r = Math.max(v, 0.0)
  let g = Math.max(v - s * v, 0.0)
  let b = Math.max(v - s * f * v, 0.0)
  let a = Math.max(v - s * (1.0 - f) * v, 0.0)

  if (hi < -2.0) {
    return { r: r, g: a, b: g, a: alpha }
  }
  else if (hi < -1.0) {
    return { r: b, g: r, b: g, a: alpha }
  }
  else if (hi < 0.0) {
    return { r: g, g: r, b: a, a: alpha }
  }
  else if (hi < 1.0) {
    return { r: g, g: b, b: r, a: alpha }
  }
  else if (hi < 2.0) {
    return { r: a, g: g, b: r, a: alpha }
  }
  else {
    return { r: r, g: g, b: b, a: alpha }
  }
}

function GetColor(row, column) {
  let color
  if (row === 0) {
    return color = ConvertHSVToRGB(0.0, 0.0, 1.0 - column / 10.0);
  }
  if (row <= 5 && row != 0) {
    return color = ConvertHSVToRGB(2.0 * Math.PI * column / 10.0, 1.0, row / (10.0 - 4.0));

  }
  else {
    return color = ConvertHSVToRGB(2.0 * Math.PI * column / 10.0, 1.0 - (row - 5.0) / (10.0 - 5.0), 1.0);
  }
}

function LinearToGamma(color) {
  let r = color.r
  let g = color.g
  let b = color.b

  if (r <= 0.0031308) {
    r = r * 12.92
  }
  else {
    r = 1.055 * Math.pow(r, 1.0 / 2.4) - 0.055
  }

  if (g <= 0.0031308) {
    g = g * 12.92
  }
  else {
    g = 1.055 * Math.pow(g, 1.0 / 2.4) - 0.055
  }

  if (b <= 0.0031308) {
    b = b * 12.92
  }
  else {
    b = 1.055 * Math.pow(b, 1.0 / 2.4) - 0.055
  }

  return { r: r, g: g, b: b, a: color.a }
}

for (var category in catalogResponseBody) {
  if (catalogResponseBody[category].title !== 'Item Packs' &&
    catalogResponseBody[category].title !== 'Change Detail Color' &&
    catalogResponseBody[category].title !== 'Change Main Color') {
    if (catalogResponseBody[category].title == 'Head') {
      for (var index in catalogResponseBody[category].sections) {
        for (var item in catalogResponseBody[category].sections[index].items) {
          for (var cosmeticItem in items) {

            let preview_rotation = items[cosmeticItem].preview_rotation;
            let materialList = []

            for (var e in items[cosmeticItem].materials_v2) {
              if (items[cosmeticItem].materials_v2[e].type) {
                materialList.push(items[cosmeticItem].materials_v2[e].type)
              } else {
                materialList.push(items[cosmeticItem].materials_v2[e])
              }
            }

            if (catalogResponseBody[category].sections[index].items[item] === cosmeticItem) {
              files[cosmeticItem] = {
                file: items[cosmeticItem].file + '.sgm',
                name: items[cosmeticItem].title,
                category: catalogResponseBody[category].sections[index].title,
                primaryColor: items[cosmeticItem].colors ? items[cosmeticItem].colors[0] : undefined,
                secondaryColor: items[cosmeticItem].colors ? (items[cosmeticItem].colors[1] ? items[cosmeticItem].colors[1] : undefined) : undefined,
                materials: materialList,
                type: items[cosmeticItem].type,
                previewRotation: preview_rotation,
                attachment_points: items[cosmeticItem].attachment_points ? items[cosmeticItem].attachment_points : undefined,
                attachment_point_overrides: items[cosmeticItem].attachment_point_overrides ? items[cosmeticItem].attachment_point_overrides : undefined
              }
            }
          }
        }
      }
    } else {
      for (var item in catalogResponseBody[category].items) {
        for (var cosmeticItem in items) {
          let preview_rotation = items[cosmeticItem].preview_rotation;
          let materialList = []

          for (var e in items[cosmeticItem].materials_v2) {
            if (items[cosmeticItem].materials_v2[e].type) {
              materialList.push(items[cosmeticItem].materials_v2[e].type)
            } else {
              materialList.push(items[cosmeticItem].materials_v2[e])
            }
          }
          if (catalogResponseBody[category].items[item] === cosmeticItem) {
            files[cosmeticItem] = {
              file: items[cosmeticItem].file + '.sgm',
              name: items[cosmeticItem].title,
              category: catalogResponseBody[category].title,
              primaryColor: items[cosmeticItem].colors ? items[cosmeticItem].colors[0] : undefined,
              secondaryColor: items[cosmeticItem].colors ? (items[cosmeticItem].colors[1] ? items[cosmeticItem].colors[1] : undefined) : undefined,
              materials: materialList,
              type: items[cosmeticItem].type,
              previewRotation: preview_rotation,
              attachment_points: items[cosmeticItem].attachment_points ? items[cosmeticItem].attachment_points : undefined,
              attachment_point_overrides: items[cosmeticItem].attachment_point_overrides ? items[cosmeticItem].attachment_point_overrides : undefined
            }
          }
        }
      }
    }
  }
}



for (let w = 0; w < 100; w++) {
  const container = document.createElement('div');
  const lastWholeDigitNum = w % 10;
  const firstWholeDigitNum = Math.floor(w / 10);
  container.classList.add(`column${lastWholeDigitNum}`);
  container.classList.add(`row${firstWholeDigitNum}`);
  container.style.width = '28px';
  container.style.height = '28px';
  container.onclick = function (e) {
    if (primaryOpened == true) {
      if (selectedPrimaryDiv) selectedPrimaryDiv[0].style.outline = 'none';
      selectedPrimaryDiv = document.getElementsByClassName(container.className);
      playerPrim_Color = e.target.style.backgroundColor;
      changeMeshColors(e.target.style.backgroundColor, undefined, undefined);
      primaryOpened = false;
    }
    if (secondaryOpened == true) {
      if (selectedSecondaryDiv) selectedSecondaryDiv[0].style.outline = 'none';

      selectedSecondaryDiv = document.getElementsByClassName(container.className);
      const extractColor = e.target.style.backgroundColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      visorColor = `rgb(${Math.ceil(parseInt(extractColor[1], 10) / 2)},${Math.ceil(parseInt(extractColor[2], 10) / 2)},${Math.ceil(parseInt(extractColor[3], 10) / 2)})`;
      playerSec_Color = e.target.style.backgroundColor;
      changeMeshColors(undefined, e.target.style.backgroundColor, visorColor);
      secondaryOpened = false;
    }
    displayCategoryList(0);
  }
  container.onmouseover = function () {
    container.style.outline = '3px solid #333';
    container.style.cursor = 'pointer';
  };
  container.onmouseout = function () {
    container.style.outline = 'none';
    container.style.cursor = 'pointer';
    if (selectedPrimaryDiv && primaryOpened == true) { selectedPrimaryDiv[0].style.outline = '3px solid #333'; }
    if (selectedSecondaryDiv && secondaryOpened == true) { selectedSecondaryDiv[0].style.outline = '3px solid #333'; }
  };
  container.setAttribute("hsvValue", `rgb(${GetColor(firstWholeDigitNum, lastWholeDigitNum).r},${GetColor(firstWholeDigitNum, lastWholeDigitNum).g},${GetColor(firstWholeDigitNum, lastWholeDigitNum).b})`)
  container.style.backgroundColor = `rgb(${Math.floor(LinearToGamma(GetColor(firstWholeDigitNum, lastWholeDigitNum)).r * 255)}, ${Math.floor(LinearToGamma(GetColor(firstWholeDigitNum, lastWholeDigitNum)).g * 255)}, ${Math.floor(LinearToGamma(GetColor(firstWholeDigitNum, lastWholeDigitNum)).b * 255)})`;
  picker.appendChild(container);
}
files['default'] = {
  file: './cosmetics/head/head/head.sgm',
  name: 'Head Basic',
  category: 'Heads',
  materials: ['default_primary_color', 'default_secondary_color', 'default_secondary_color_visor'],
  previewRotation: [180, 0, 0],
  attachment_points:{glasses:{position:[0,0,0]}}//really weird condition 
}
files['player_basic_body'] = {
  file: './cosmetics/body/body.sgm',
  name: 'Body Basic',
  category: undefined,
  materials: ['default_secondary_color', 'default_primary_color']

}
files['player_basic_hand'] = {
  file: './cosmetics/hand/hand_claw.sgm',
  name: 'Claw Hand',
  category: 'Hands',
  materials: ['default_primary_color', 'default_secondary_color', 'default_secondary_color_visor'],
  previewRotation: [180, 0, 0]
}
 
let categoryState;
function displayCategoryList(a) {
  let categoriesContent = document.getElementById('categories-content');
  let children = categoriesContent.children;
  if (a == 0) {//front page
    backTracker = 0;
    for (let i = 0; i < children.length; i++) {
      children[i].style.display = 'none';
    }
    primaryOpened = false;
    secondaryOpened = false
    if (selectedPrimaryDiv) selectedPrimaryDiv[0].style.outline = 'none';
    if (selectedSecondaryDiv) selectedSecondaryDiv[0].style.outline = 'none';
    document.getElementById('categories-content').style.display = "grid"
    document.getElementById('cosmetics').style.display = 'block'
    document.getElementById('primary').style.display = 'block'
    document.getElementById('secondary').style.display = 'block'
    document.getElementById('back-btn').style.display = 'none'
    document.getElementById('categories-content').style.height = '372px'
  }
  if (a == 1) {//cosmetics clicked
    backTracker = 0;
    for (let i = 0; i < children.length; i++) {
      children[i].style.display = 'none';
    }
    var contentChildren = document.getElementById("content").childNodes;
    for (var i = contentChildren.length - 1; i >= 0; i--) {
      var child = contentChildren[i];
      document.getElementById("content").removeChild(child);
    }
    categoryState = false;
    document.getElementById('categories-content').style.display = 'grid'
    document.getElementById('Head').style.display = 'block'
    document.getElementById('Body').style.display = 'block'
    document.getElementById('Hands').style.display = 'block'
    document.getElementById('Grapples').style.display = 'block'
    document.getElementById('Checkpoints').style.display = 'block'
    document.getElementById('back-btn').style.display = 'block'
    document.getElementById('categories-content').style.height = '300px'
    document.getElementById('content').style.height = '';
    document.getElementById('back-btn').style.marginTop = '0em';

  }

  if (a == 2) { //color picker 
    backTracker = 0;
    for (let i = 0; i < children.length; i++) {
      children[i].style.display = 'none';
    }
    document.getElementById('categories-content').style.display = "block"
    document.querySelectorAll('#categories-content div').forEach(e => e.style.display = 'inline-block');
    document.getElementById('back-btn').style.display = 'block'
    document.getElementById('categories-content').style.height = '400px'
  }
  if (a == 3) {//show head accessories categories
    backTracker = 1;
    categoryState = true;
    for (let i = 0; i < children.length; i++) {
      children[i].style.display = 'none';
    }
    document.getElementById('Heads').style.display = 'block'
    document.getElementById('Hats').style.display = 'block'
    document.getElementById('Facewear').style.display = 'block'
    document.getElementById('categories-content').style.height = '150px'
    document.getElementById('content').style.height = '';
    document.getElementById('back-btn').style.marginTop = '0em';
    var contentChildren = document.getElementById("content").childNodes;
    for (var i = contentChildren.length - 1; i >= 0; i--) {
      var child = contentChildren[i];
      document.getElementById("content").removeChild(child);
    }
    document.getElementById('categories-content').style.display = 'grid'
  }
  if (a == 4) {//finals when clicked 
    if (categoryState == true) {
      backTracker = 3;
    } else {
      backTracker = 1;
    }
    for (let i = 0; i < children.length; i++) {
      children[i].style.display = 'none';
    }
    document.getElementById('content').style.height = '100%';
    document.getElementById('categories-content').style.height = '372px'
    document.getElementById('back-btn').style.marginTop = '1.5em';

    //categories will dissappear btw
  }

}
addEventListener('click', (e) => {
  if (e.target.id == 'cosmetics') {
    displayCategoryList(1);
  }
  if (e.target.id == 'secondary' || e.target.id == 'primary') {
    displayCategoryList(2);
    if (e.target.id == 'primary') {
      if (selectedPrimaryDiv) {
        selectedPrimaryDiv[0].style.outline = '3px solid #333';
      }
      primaryOpened = true;
    } else {
      if (selectedSecondaryDiv) {
        selectedSecondaryDiv[0].style.outline = '3px solid #333';
      }
      secondaryOpened = true;
    }
  }
  if (e.target.id == 'Head') {
    displayCategoryList(3);
  }
  if (e.target.className == 'final') {//basically the things where you can view the cosmetics
    displayCategoryList(4);
    renderCosmetics(e.target.id);
    animates();
  }
  if (e.target.id == 'back-btn') {
    displayCategoryList(backTracker);
  }

});

const scene = new THREE.Scene();
scene.background = null

scene.add(new THREE.AmbientLight(0xffffff, 1));
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 2)
directionalLight.position.set(0, 1, 2);
scene.add(directionalLight);

const camera = new THREE.PerspectiveCamera(55, 400 / 450, 1, 1000);
camera.position.z = 3.5;
camera.rotation.x = -0.1;

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('.player-model'), alpha: true, transparent: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(400, 450);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = controls.enablePan = true;
controls.minPolarAngle = controls.maxPolarAngle = Math.PI / 2;
controls.addEventListener('start', () => document.body.style.cursor = 'none');
controls.addEventListener('end', () => document.body.style.cursor = 'auto');
await renderPlayer('default', 'Heads');
await renderPlayer('player_basic_hand', 'Hands');
await renderPlayer('player_basic_body', undefined);
if (userId) {
  let playerInfoResponse = await fetch(playerInfo_Url);
  let playerResponseBody = await playerInfoResponse.json();
  playerPrim_Color = playerResponseBody.active_customizations.player_color_primary.color;
  playerSec_Color = playerResponseBody.active_customizations.player_color_secondary.color;

  if (activeCosmetics['Facewear'] !== undefined && activeCosmetics['Facewear'] !== playerResponseBody.active_customizations.items["head/glasses"]) {
    scene.remove(scene.getObjectByName(files[activeCosmetics['Facewear']].name));
  } activeCosmetics['Facewear'] = playerResponseBody.active_customizations.items["head/glasses"]
  if (activeCosmetics['Hats'] !== undefined && activeCosmetics['Hats'] !== playerResponseBody.active_customizations.items["head/hat"]) {
    scene.remove(scene.getObjectByName(files[activeCosmetics['Hats']].name));
  } activeCosmetics['Hats'] = playerResponseBody.active_customizations.items["head/hat"]

  if (activeCosmetics['Heads'] !== undefined && playerResponseBody.active_customizations.items["head"] !== undefined && activeCosmetics['Heads'] !== playerResponseBody.active_customizations.items["head"]) {
    scene.remove(scene.getObjectByName(files[activeCosmetics['Heads']].name));
  } activeCosmetics['Heads'] = playerResponseBody.active_customizations.items["head"] ? playerResponseBody.active_customizations.items["head"] : 'default'
  if (activeCosmetics['Hands'] !== undefined && playerResponseBody.active_customizations.items["hand"] !== undefined && activeCosmetics['Hands'] !== playerResponseBody.active_customizations.items["hand"]) {
    scene.remove(scene.getObjectByName(files[activeCosmetics['Hands']].name));
    if (clonedGroup) {
      scene.remove(clonedGroup);
    }
  } activeCosmetics['Hands'] = playerResponseBody.active_customizations.items["hand"] ? playerResponseBody.active_customizations.items["hand"] : 'player_basic_hand'

  if (activeCosmetics['Grapples'] !== undefined && activeCosmetics['Grapples'] !== playerResponseBody.active_customizations.items["grapple/hook"]) {
    scene.remove(scene.getObjectByName(files[activeCosmetics['Grapples']].name));

  } activeCosmetics['Grapples'] = playerResponseBody.active_customizations.items["grapple/hook"]

  if (activeCosmetics['Checkpoints'] !== undefined && activeCosmetics['Checkpoints'] !== playerResponseBody.active_customizations.items["checkpoint"]) {
    scene.remove(scene.getObjectByName(files[activeCosmetics['Checkpoints']].name));
  } activeCosmetics['Checkpoints'] = playerResponseBody.active_customizations.items["checkpoint"]

  if (activeCosmetics['Body'] !== undefined && activeCosmetics['Body'] !== playerResponseBody.active_customizations.items["body/neck"]) {
    scene.remove(scene.getObjectByName(files[activeCosmetics['Body']].name));
  } activeCosmetics['Body'] = playerResponseBody.active_customizations.items["body/neck"]



  let renderPromises = []
  if (playerResponseBody.active_customizations.items["head/glasses"] !== undefined) {
    renderPromises.push(renderPlayer(playerResponseBody.active_customizations.items["head/glasses"], 'Facewear'));
  }
  if (playerResponseBody.active_customizations.items["head/hat"] !== undefined) {
    renderPromises.push(renderPlayer(playerResponseBody.active_customizations.items["head/hat"], 'Hats'));
  }
  if (playerResponseBody.active_customizations.items["hand"] !== undefined) {
    renderPromises.push(renderPlayer(playerResponseBody.active_customizations.items["hand"], 'Hands'));
  }

  if (playerResponseBody.active_customizations.items["grapple/hook"] !== undefined) {
    renderPromises.push(renderPlayer(playerResponseBody.active_customizations.items["grapple/hook"], 'Grapples'));
  }
  if (playerResponseBody.active_customizations.items["checkpoint"] !== undefined) {
    renderPromises.push(renderPlayer(playerResponseBody.active_customizations.items["checkpoint"], 'Checkpoints'));
  }
  if (playerResponseBody.active_customizations.items["head"] !== undefined) {
    renderPromises.push(renderPlayer(playerResponseBody.active_customizations.items["head"], 'Heads'));
  }

  if (playerResponseBody.active_customizations.items["body/neck"] !== undefined) {
    renderPromises.push(renderPlayer(playerResponseBody.active_customizations.items["body/neck"], 'Body'));
  }
  Promise.all(renderPromises).then(() => {
    changeMeshColors(`rgb(${Math.floor(LinearToGamma({ r: playerPrim_Color[0], g: playerPrim_Color[1], b: playerPrim_Color[2], a: 1 }).r * 255)},${Math.floor(LinearToGamma({ r: playerPrim_Color[0], g: playerPrim_Color[1], b: playerPrim_Color[2], a: 1 }).g * 255)},${Math.floor(LinearToGamma({ r: playerPrim_Color[0], g: playerPrim_Color[1], b: playerPrim_Color[2], a: 1 }).b * 255)})`, `rgb(${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).r * 255)},${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).g * 255)},${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).b * 255)})`, `#${parseInt(Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).r * 255 / 2)).toString(16).padStart(2, '0')}${parseInt(Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).g * 255 / 2)).toString(16).padStart(2, '0')}${parseInt(Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).b * 255 / 2)).toString(16).padStart(2, '0')}`);
  });
}


function renderPlayer(file, category) {
  return new Promise((resolve, reject) => {
    if (file === 'default') {
      activeCosmetics['Heads'] = 'default';
    }
    if (file === 'player_basic_hand') {
      activeCosmetics['Hands'] = 'player_basic_hand';
    }

    const loader = new SGMLoader();
    loader.load(files[file].file, async function ([meshes, materials]) {
      const group = new THREE.Group();

      const threeMaterials = materials.map((material) => {
        const color = material.colors[0][0];
        const matOptions = {
          color: new THREE.Color(color[0], color[1], color[2]),
        };
        return new THREE.MeshStandardMaterial(matOptions);
      });

      meshes.forEach((mesh) => {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const normals = [];
        const uvs = [];

        mesh.vertices.forEach((vertex) => {
          positions.push(...vertex[0]);
          normals.push(...vertex[1]);
          if (vertex[2].length > 0) {
            uvs.push(...vertex[2][0]);
          }
        });
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

        geometry.setIndex(new THREE.Uint32BufferAttribute(mesh.indices, 1));

        const threeMesh = new THREE.Mesh(geometry, threeMaterials[mesh.material_id]);
        group.add(threeMesh);
      });

      group.name = files[file].name;

      if (category !== undefined) {
        if (['Heads', 'Hats', 'Facewear'].includes(category)) {
          group.position.y += 0.2;
        }
        if ('Heads' === category) {
          if (activeCosmetics['Facewear'] !== undefined) {
            let referenceGroup = scene.getObjectByName(files[activeCosmetics['Facewear']].name)
            referenceGroup.position.set(0, 0.2, 0);
            if (files[file].attachment_points !== undefined && files[file].attachment_points.glasses !== undefined) {
              if (files[file].attachment_points.glasses.scale !== undefined) {
                referenceGroup.scale.set(files[file].attachment_points.glasses.scale, files[file].attachment_points.glasses.scale, files[file].attachment_points.glasses.scale)
              }
              referenceGroup.position.z -= Number(files[file].attachment_points.glasses.position[2]);
            }
            if (activeCosmetics['Facewear'].attachment_point_overrides !== undefined) {
              referenceGroup.position.x -= Number(files[file].attachment_point_overrides[activeCosmetics['Heads']].position[0])
              referenceGroup.position.y += Number(files[file].attachment_point_overrides[activeCosmetics['Heads']].position[1])
              referenceGroup.position.z -= Number(files[file].attachment_point_overrides[activeCosmetics['Heads']].position[2])
            }
          }
          if (activeCosmetics['Hats'] !== undefined) {
            let referenceGroup = scene.getObjectByName(files[activeCosmetics['Hats']].name)
            referenceGroup.position.set(0, 0.2, 0);
            if (files[file].attachment_points !== undefined && files[file].attachment_points.hat !== undefined) {
              if (files[file].attachment_points.hat.scale !== undefined) {
                referenceGroup.scale.set(files[file].attachment_points.hat.scale, files[file].attachment_points.hat.scale, files[file].attachment_points.hat.scale)
              }
              referenceGroup.position.y += Number(files[file].attachment_points.hat.position[1]);
            }
          }
        }
        if (files[activeCosmetics['Heads']].attachment_points) {
          if ('Facewear' === category) {
            if (files[activeCosmetics['Heads']].attachment_points.glasses !== undefined) {
              if (files[activeCosmetics['Heads']].attachment_points.glasses.scale !== undefined) {
                group.scale.set(files[activeCosmetics['Heads']].attachment_points.glasses.scale, files[activeCosmetics['Heads']].attachment_points.glasses.scale, files[activeCosmetics['Heads']].attachment_points.glasses.scale)
              }
              group.position.z -= Number(files[activeCosmetics['Heads']].attachment_points.glasses.position[2]);
            }
            if (files[file].attachment_point_overrides !== undefined) {
              console.log(activeCosmetics['Heads'])

              group.position.x -= Number(files[file].attachment_point_overrides[activeCosmetics['Heads']].position[0])
              group.position.y += Number(files[file].attachment_point_overrides[activeCosmetics['Heads']].position[1])
              group.position.z -= Number(files[file].attachment_point_overrides[activeCosmetics['Heads']].position[2])
            }
          }
          if ('Hats' === category) {
            if (files[activeCosmetics['Heads']].attachment_points.hat !== undefined) {
              if (files[activeCosmetics['Heads']].attachment_points.hat.scale !== undefined) {
                group.scale.set(files[activeCosmetics['Heads']].attachment_points.hat.scale, files[activeCosmetics['Heads']].attachment_points.hat.scale, files[activeCosmetics['Heads']].attachment_points.hat.scale)
              }
              group.position.y += Number(files[activeCosmetics['Heads']].attachment_points.hat.position[1]);
            }
          }
        }
        if ('Grapples' === category) {
          group.position.x = 0.5;
          group.position.y = -1.25
          group.rotation.x += Math.PI / 2;
          group.rotation.y += Math.PI
        }

        if ('Checkpoints' === category) {
          group.position.x = -0.5;
          group.position.y = -1.5
          group.rotation.y += Math.PI
        }

      }
      group.rotation.y += Math.PI;


      if (files[file].materials.indexOf('default_primary_color') !== -1) {
        group.children[files[file].materials.indexOf('default_primary_color')].name = 'default_primary_color'
      }
      if (files[file].materials.indexOf('default_secondary_color') !== -1) {
        group.children[files[file].materials.indexOf('default_secondary_color')].name = 'default_secondary_color'
      }
      if (files[file].materials.indexOf('default_secondary_color_visor') !== -1) {
        group.children[files[file].materials.indexOf('default_secondary_color_visor')].name = 'default_secondary_color_visor'
      }
      if (files[file].materials.indexOf("default_primary_color") == -1 && files[file].primaryColor) {
        group.children[0].material.color.set(`#${Math.round(files[file].primaryColor[0] * 255).toString(16).padStart(2, '0')}${Math.round(files[file].primaryColor[1] * 255).toString(16).padStart(2, '0')}${Math.round(files[file].primaryColor[2] * 255).toString(16).padStart(2, '0')}`)
      }
      if (files[file].materials.indexOf("default_secondary_color") == -1 && files[file].secondaryColor) {
        group.children[1].material.color.set(`#${Math.round(files[file].secondaryColor[0] * 255).toString(16).padStart(2, '0')}${Math.round(files[file].secondaryColor[1] * 255).toString(16).padStart(2, '0')}${Math.round(files[file].secondaryColor[2] * 255).toString(16).padStart(2, '0')}`)
      }
      group.children.forEach((e) => {
        if (e.name === 'default_primary_color' && playerPrim_Color !== undefined) {
          e.material.color.set(playerPrim_Color);
        } if (e.name === 'default_secondary_color' && playerSec_Color !== undefined) {
          e.material.color.set(playerSec_Color);
        } if (e.name === 'default_secondary_color_visor' && visorColor !== undefined) {
          e.material.color.set(visorColor);
        }
      }); scene.add(group);
      if ('Hands' === category) {
        clonedGroup = group.clone(); // Clone the group
        clonedGroup.position.set(-0.3, -0.75, 0.1);
        clonedGroup.rotation.z += Math.PI
        clonedGroup.rotation.x += Math.PI / 2
        scene.add(clonedGroup); // Add the cloned group 
        group.position.set(0.3, -0.75, 0.1);
        group.rotation.x += Math.PI / 2
      }
      resolve();
    });
  });

}
let canvas;
var scenes = [], renderer2;
async function renderCosmetics(category) {
  document.getElementById("customizations").style.height = "100%";
  document.getElementById('categories-content').style.display = 'none';
  canvas = document.getElementById("canvas");
  var element2 = document.getElementById("body1");
  var positionInfo = element2.getBoundingClientRect();
  var height2 = positionInfo.height;
  var width2 = positionInfo.width;
  canvas.style.height = height2;
  canvas.style.width2 = width2;
  var template = document.getElementById("template").text;
  var content = document.getElementById("content");

  for (var item in files) {
    if (files[item].category === category) {
      let itemBackup = item;
      var element = document.createElement("div");
      element.id = `${files[item].file}`;
      element.className = "list-item";
      element.innerHTML = template.replace('Scene $', `${files[item].name}`);

      const previewButton = document.createElement('button');
      previewButton.style.height = '2em';
      previewButton.style.width = '70%';

      previewButton.innerHTML = 'preview';
      previewButton.style.zIndex = 999;
      previewButton.classList.add('previewButton', `${category}`);
      previewButton.id = item;
      if (item === activeCosmetics[category]) {
        if (!previewButton.classList.contains('toggled')) {
          previewButton.classList.toggle('toggled');
        }
      }
      if (previewButton.classList.contains('toggled')) {
        previewButton.innerHTML = 'Un-equip'
        previewButton.style.backgroundColor = "#FF0000";
      }
      previewButton.addEventListener('click', () => {
        previewButton.classList.toggle('toggled');
        const toggledButton = document.getElementById(activeCosmetics[category]);
        if (toggledButton !== null) {
          if (previewButton.id !== toggledButton.id) {
            toggledButton.classList.toggle('toggled');
            toggledButton.innerHTML = 'Preview'
            toggledButton.style.backgroundColor = '#00FF00'
            previewButton.innerHTML = 'Un-equip'
            previewButton.style.backgroundColor = "#FF0000";
            scene.remove(scene.getObjectByName(files[activeCosmetics[category]].name));
            if (category == 'Hands') {
              scene.remove(clonedGroup)
            }
            activeCosmetics[category] = itemBackup;
            renderPlayer(itemBackup, category)
          }

          if (previewButton.id == toggledButton.id && ['Heads', 'Hands'].includes(category)) {
            previewButton.innerHTML = 'Un-equip'
            previewButton.style.backgroundColor = "#FF0000";
            activeCosmetics[category] = itemBackup;
          }
          if (previewButton.id == toggledButton.id && !['Heads', 'Hands'].includes(category)) {
            previewButton.classList.toggle('toggled');
            previewButton.innerHTML = 'preview';
            previewButton.style.backgroundColor = '#00FF00';
            scene.remove(scene.getObjectByName(files[activeCosmetics[category]].name));
            activeCosmetics[category] = undefined;
          }
        } else if (toggledButton == null) {
          previewButton.innerHTML = 'Un-equip'
          previewButton.style.backgroundColor = "#FF0000";
          activeCosmetics[category] = itemBackup;
          renderPlayer(itemBackup, category)
        }
      });
      element.appendChild(previewButton);

      var scene2 = new THREE.Scene();
      scene2.userData.element = element.querySelector(".scene");
      content.appendChild(element);

      var camera2 = new THREE.PerspectiveCamera(55, 1, 1, 1000);
      camera2.position.z += 2;


      scene2.userData.camera = camera2;
      let z;
      z = item;
      (function (scene2) {
        var sgmLoader2 = new SGMLoader();
        sgmLoader2.load(files[item].file, function ([meshes, materials]) {
          const group = new THREE.Group();
          const threeMaterials = materials.map((material) => {
            console.log(material)
            const color = material.colors[0][0];

            return new THREE.MeshStandardMaterial({
              color: new THREE.Color(color[0], color[1], color[2]),
            });
          });

          meshes.forEach((mesh) => {
            const geometry = new THREE.BufferGeometry();
            const positions = [];
            const normals = [];
            const uvs = [];

            mesh.vertices.forEach((vertex) => {
              positions.push(...vertex[0]);
              normals.push(...vertex[1]);
              if (vertex[2].length > 0) {
                uvs.push(...vertex[2][0]);
              }
            });
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
            geometry.setIndex(new THREE.Uint32BufferAttribute(mesh.indices, 1));

            const threeMesh = new THREE.Mesh(geometry, threeMaterials[mesh.material_id]);
            group.add(threeMesh);
          });

          if (z) {
            if (files[z].previewRotation !== undefined) {
                group.rotation.x += Number(files[z].previewRotation[1]) * Math.PI / 180;//this cant be y. Update: it might be y 
                group.rotation.y += Number(files[z].previewRotation[0]) * Math.PI / 180;
                group.rotation.z += Number(files[z].previewRotation[2]) * Math.PI / 180;
                //Three js and grab rotations axis I still dont know the conversion so this might be wrong           
            }
            group.name = files[z].name;
            if (files[z].category == 'Hands') {
              group.rotation.x += Math.PI / 2
            }
            if (files[z].materials.indexOf('default_primary_color') !== -1) {
              group.children[files[z].materials.indexOf('default_primary_color')].name = 'default_primary_color'
            }
            if (files[z].materials.indexOf('default_secondary_color') !== -1) {
              group.children[files[z].materials.indexOf('default_secondary_color')].name = 'default_secondary_color'
            }
            if (files[z].materials.indexOf('default_secondary_color_visor') !== -1) {
              group.children[files[z].materials.indexOf('default_secondary_color_visor')].name = 'default_secondary_color_visor'
            }
            if (files[z].materials.indexOf("default_primary_color") == -1 && files[z].primaryColor) {
              group.children[0].material.color.set(`#${Math.round(files[z].primaryColor[0] * 255).toString(16).padStart(2, '0')}${Math.round(files[z].primaryColor[1] * 255).toString(16).padStart(2, '0')}${Math.round(files[z].primaryColor[2] * 255).toString(16).padStart(2, '0')}`)
            }
            if (files[z].materials.indexOf("default_secondary_color") == -1 && files[z].secondaryColor) {
              group.children[1].material.color.set(`#${Math.round(files[z].secondaryColor[0] * 255).toString(16).padStart(2, '0')}${Math.round(files[z].secondaryColor[1] * 255).toString(16).padStart(2, '0')}${Math.round(files[z].secondaryColor[2] * 255).toString(16).padStart(2, '0')}`)
            }
          }
          group.children.forEach((e) => {
            if (e.name === 'default_primary_color' && playerPrim_Color !== undefined) {
              e.material.color.set(playerPrim_Color);
            } if (e.name === 'default_secondary_color' && playerSec_Color !== undefined) {
              e.material.color.set(playerSec_Color);
            } if (e.name === 'default_secondary_color_visor' && visorColor !== undefined) {
              e.material.color.set(visorColor);
            }
          });

          scene2.add(group);
        });
      })(scene2);
      var light = new THREE.DirectionalLight(0xffffff, 1);
      scene2.add(new THREE.AmbientLight(0xffffff))
      light.position.set(0, 0, 1);
      scene2.add(light);
      scenes.push(scene2);
    }
  }
  renderer2 = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, transparent: true, antialias: true });
  renderer2.setPixelRatio(window.devicePixelRatio);
}



function updateSize() {
  var width = canvas.clientWidth;
  var height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height != height) {
    renderer2.setSize(width, height, false);
  }
}
function renderLoop() {
  renderer.render(scene, camera);
  requestAnimationFrame(renderLoop)
}
function animates() {
  render();
  requestAnimationFrame(animates);
}

function render() {
  updateSize();
  renderer2.setScissorTest(false);
  renderer2.clear();
  renderer2.setScissorTest(true);
  scenes.forEach(function (scene2) {
    scene2.children[0].rotation.y = Date.now() * 0.001;
    var element = scene2.userData.element;
    var rect = element.getBoundingClientRect();
    var width = rect.right - rect.left;
    var height = rect.bottom - rect.top;
    var left = rect.left;
    var bottom = renderer2.domElement.clientHeight - rect.bottom;
    renderer2.setViewport(left, bottom, width, height);
    renderer2.setScissor(left, bottom, width, height);
    var camera = scene2.userData.camera;
    renderer2.render(scene2, camera);
  });


}
function changeMeshColors(primaryColor, secondaryColor, visorColor_) {
  scene.traverse((child) => {
    if (child instanceof THREE.Group) {
      child.children.forEach((e) => {
        if (e.name === 'default_primary_color' && primaryColor !== undefined) {
          e.material.color.set(primaryColor);
          playerPrim_Color = primaryColor
        } if (e.name === 'default_secondary_color' && secondaryColor !== undefined) {
          e.material.color.set(secondaryColor);
          playerSec_Color = secondaryColor
        } if (e.name === 'default_secondary_color_visor' && visorColor_ !== undefined) {
          e.material.color.set(visorColor_);
          visorColor = visorColor_;
        }
      });
    }
  });
}

renderLoop();
})();
