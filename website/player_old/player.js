import * as THREE from "three";
import { LinearToGamma } from "./helpers/helper.js";
import { filesConstants } from "./constants.js";
import { OrbitControls } from "./OrbitContols.js";

import { SGMLoader } from "./sgmLoader.js";
import { getCatalogueResponse, getItems, setCustomizations } from "./Api/index.js";
import {
  initScene,
  processItemsAndSections,
  loadLight,
  applyColors,
} from "./helpers/threejsHelpers.js";
import {
  createPreviewButton,
  displayCategoryList,
  createContainer

} from "./helpers/UIHelpers.js";
import {
  createGroupFromMeshes,
  adjustPositionForCategory,
  handleAttachmentPoints,
} from "./helpers/renderPlayerHelper.js";
import { createThreeGroup } from "./helpers/renderCosmeticsHelper.js";
import { createApp } from 'vue'
import App from '@/App.vue'
import { useUserStore } from '@/stores/user'
import { createPinia } from 'pinia';
import { getShopProducts } from './Api/index.js';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("user_id");
  const playerInfo_Url = `https://api.slin.dev/grab/v1/get_user_info?user_id=${userId}`;
  const picker = document.getElementById("categories-content");
  const items = await getItems();
  let catalogResponseBody = await getCatalogueResponse();
  let shop = await getShopProducts();

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  const app = createApp(App)
  app.use(pinia)
  const userStore = useUserStore(pinia)

  let playerPrim_Color,
    playerSec_Color,
    visorColor,
    selectedPrimaryDiv,
    primaryOpened,
    selectedSecondaryDiv,
    secondaryOpened,
    files = filesConstants,
    backTracker,
    clonedGroup,
    canvas,
    scenes = [],
    renderer2,
    editMode,
    grabColorArray,
    ownedItems = [],
    activeCosmetics = {
      "hand": undefined,
      "head/glasses": undefined,
      "head/hat": undefined,
      "checkpoint": undefined,
      "grapple/hook": undefined,
      "body/neck": undefined,
      "head": undefined
    };

  if (userStore.userInfo && !userStore.userInfo.active_customizations || userStore.userInfo && !userStore.userInfo.active_customizations.items && userStore.userInfo.active_customizations) {
    userStore.userInfo.active_customizations = { items: {} }
  }

  for (var category in catalogResponseBody) {
    if (
      catalogResponseBody[category].title !== "Item Packs" &&
      catalogResponseBody[category].title !== "Change Detail Color" &&
      catalogResponseBody[category].title !== "Change Main Color"
    ) {
      if (catalogResponseBody[category].title == "Head") {
        for (var index in catalogResponseBody[category].sections) {
          processItemsAndSections(
            catalogResponseBody[category].sections[index].items,
            catalogResponseBody[category].sections[index],
            files,
            items
          );
        }
      } else {
        processItemsAndSections(
          catalogResponseBody[category].items,
          catalogResponseBody[category],
          files,
          items
        );
      }
    }
  }

  const handleContainerClick = (e, rgbValue) => {
    if (primaryOpened == true) {
      if (selectedSecondaryDiv) selectedSecondaryDiv.style.outline = "none"
      if (selectedPrimaryDiv) selectedPrimaryDiv.style.outline = "none"


      selectedPrimaryDiv = e.target
      playerPrim_Color = e.target.style.backgroundColor
      if (editMode == true) {
        grabColorArray = JSON.parse(e.target.getAttribute('data-grab_color'));
        userStore.userInfo.active_customizations.player_color_primary = { "color": grabColorArray }
        setCustomizations(userStore)
      }
      changeMeshColors(e.target.style.backgroundColor, undefined, undefined)
      primaryOpened = false
    }
    if (secondaryOpened == true) {
      if (selectedPrimaryDiv) selectedPrimaryDiv.style.outline = "none"
      if (selectedSecondaryDiv) selectedSecondaryDiv.style.outline = "none"

      if (editMode == true) {
        grabColorArray = JSON.parse(e.target.getAttribute('data-grab_color'));
        userStore.userInfo.active_customizations.player_color_secondary = { "color": grabColorArray }
        setCustomizations(userStore)
      }
      selectedSecondaryDiv = e.target
      visorColor = `rgb(${Math.ceil(
        parseInt(rgbValue[0], 10) / 2
      )},${Math.ceil(parseInt(rgbValue[1], 10) / 2)},${Math.ceil(
        parseInt(rgbValue[2], 10) / 2
      )})`
      playerSec_Color = e.target.style.backgroundColor
      changeMeshColors(undefined, e.target.style.backgroundColor, visorColor)
      secondaryOpened = false
    }
    backTracker = displayCategoryList(
      0,
      backTracker,
      selectedPrimaryDiv,
      selectedSecondaryDiv,

      categoryState
    )
  }

  const handleContainerMouseOut = (e) => {
    if (selectedPrimaryDiv && primaryOpened == true) {
      selectedPrimaryDiv.style.outline = "3px solid #333"
    }
    if (selectedSecondaryDiv && secondaryOpened == true) {
      selectedSecondaryDiv.style.outline = "3px solid #333"
    }
  }
  for (let w = 0; w < 100; w++) {
    createContainer(w, picker, handleContainerClick, handleContainerMouseOut);
  }
  let categoryState;
  addEventListener("click", (e) => {
    if (e.target.id == "cosmetics") {
      backTracker = displayCategoryList(
        1,
        backTracker,
        selectedPrimaryDiv,
        selectedSecondaryDiv,
        categoryState
      );
    }
    if (e.target.id == "secondary" || e.target.id == "primary") {
      backTracker = displayCategoryList(
        2,
        backTracker,
        selectedPrimaryDiv,
        selectedSecondaryDiv,
        categoryState
      );
      if (e.target.id == "primary") {
        if (selectedPrimaryDiv) {
          selectedPrimaryDiv.style.outline = "3px solid #333";
        }
        primaryOpened = true;
      } else {
        if (selectedSecondaryDiv) {
          selectedSecondaryDiv.style.outline = "3px solid #333";
        }
        secondaryOpened = true;
      }
    }
    if (e.target.id == "Head") {
      backTracker = displayCategoryList(
        3,
        backTracker,
        selectedPrimaryDiv,
        selectedSecondaryDiv,
        categoryState
      );
    }
    if (e.target.className == "final") {
      //basically the things where you can view the cosmetics
      backTracker = displayCategoryList(
        4,
        backTracker,
        selectedPrimaryDiv,
        selectedSecondaryDiv,

        categoryState
      );
      renderCosmetics(e.target.id);
      animates();
    }
    if (e.target.id == "back-btn") {
      backTracker = displayCategoryList(
        backTracker,
        backTracker,
        selectedPrimaryDiv,
        selectedSecondaryDiv,
        categoryState
      );
    }
  });
  const { scene, camera, renderer } = initScene();

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;

  controls.maxPolarAngle = Math.PI;
  controls.addEventListener(
    "start",
    () => (document.body.style.cursor = "none")
  );
  controls.addEventListener("end", () => (document.body.style.cursor = "auto"));
  await renderPlayer("default", "head");
  await renderPlayer("player_basic_hand", "hand");
  await renderPlayer("player_basic_body", undefined);
  if (userId) {
    let playerInfoResponse = await fetch(playerInfo_Url);
    let playerResponseBody = await playerInfoResponse.json();
    playerPrim_Color = playerResponseBody.active_customizations.player_color_primary ?
      playerResponseBody.active_customizations.player_color_primary.color : undefined;
    playerSec_Color =
      playerResponseBody.active_customizations.player_color_secondary ? playerResponseBody.active_customizations.player_color_secondary.color : undefined;
    let renderPromises = [];
    for (var type in activeCosmetics) {
      if (playerResponseBody.active_customizations.items && playerResponseBody.active_customizations.items[type] !== undefined) {
        if (activeCosmetics[type] !== undefined) {
          scene.remove(
            scene.getObjectByName(files[activeCosmetics[type]].name)
          );
        }
        activeCosmetics[type] = playerResponseBody.active_customizations.items[type]
      }
      if (type == "hand" && clonedGroup) {
        activeCosmetics[type] = playerResponseBody.active_customizations.items ? (playerResponseBody.active_customizations.items[type] == undefined ? "player_basic_hand" : playerResponseBody.active_customizations.items[type]) : undefined
      }

      if (
        activeCosmetics[type] !== undefined
      ) {
        renderPromises.push(
         await renderPlayer(
            activeCosmetics[type],
            type
          )
        );
      }
    }
   await Promise.all(renderPromises).then(() => {

        changeMeshColors(
          `rgb(${Math.floor(
            LinearToGamma({
              r: playerPrim_Color?playerPrim_Color[0]:1,
              g: playerPrim_Color?playerPrim_Color[1]:1,
              b: playerPrim_Color?playerPrim_Color[2]:1,
              a: 1,
            }).r * 255
          )},${Math.floor(
            LinearToGamma({
              r: playerPrim_Color?playerPrim_Color[0]:1,
              g: playerPrim_Color?playerPrim_Color[1]:1,
              b: playerPrim_Color?playerPrim_Color[2]:1,
              a: 1,
            }).g * 255
          )},${Math.floor(
            LinearToGamma({
              r: playerPrim_Color?playerPrim_Color[0]:1,
              g: playerPrim_Color?playerPrim_Color[1]:1,
              b: playerPrim_Color?playerPrim_Color[2]:1,
              a: 1,
            }).b * 255
          )})`,
          `rgb(${Math.floor(
            LinearToGamma({
              r: playerSec_Color?playerSec_Color[0]:1,
              g: playerSec_Color?playerSec_Color[1]:0,
              b: playerSec_Color?playerSec_Color[2]:0,
              a: 1,
            }).r * 255
          )},${Math.floor(
            LinearToGamma({
              r: playerSec_Color?playerSec_Color[0]:1,
              g: playerSec_Color?playerSec_Color[1]:0,
              b: playerSec_Color?playerSec_Color[2]:0,
              a: 1,
            }).g * 255
          )},${Math.floor(
            LinearToGamma({
              r: playerSec_Color?playerSec_Color[0]:1,
              g: playerSec_Color?playerSec_Color[1]:0,
              b: playerSec_Color?playerSec_Color[2]:0,
              a: 1,
            }).b * 255
          )})`,
          `#${parseInt(
            Math.floor(
              (LinearToGamma({
                r: playerSec_Color?playerSec_Color[0]:1,
                g: playerSec_Color?playerSec_Color[1]:0,
                b: playerSec_Color?playerSec_Color[2]:0,
                a: 1,
              }).r *
                255) /
              2
            )
          )
            .toString(16)
            .padStart(2, "0")}${parseInt(
              Math.floor(
                (LinearToGamma({
                  r: playerSec_Color?playerSec_Color[0]:1,
                  g: playerSec_Color?playerSec_Color[1]:0,
                  b: playerSec_Color?playerSec_Color[2]:0,
                  a: 1,
                }).g *
                  255) /
                2
              )
            )
              .toString(16)
              .padStart(2, "0")}${parseInt(
                Math.floor(
                  (LinearToGamma({
                    r: playerSec_Color?playerSec_Color[0]:1,
                    g: playerSec_Color?playerSec_Color[1]:0,
                    b: playerSec_Color?playerSec_Color[2]:0,
                    a: 1,
                  }).b *
                    255) /
                  2
                )
              )
                .toString(16)
                .padStart(2, "0")}`
        );
      
      if (userStore.isLoggedIn) {
        if (userId && userId === userStore.userID) {
          editMode = true;
          let ownedProducts = userStore.userInfo.owned_products
          for (var pack in shop) {
            if (ownedProducts.includes(pack)) {
              for (var product in shop[pack].items) {
                ownedItems.push(shop[pack].items[product])
              }
            }
          }
        }
      }
    });

  }
  function handlePreviewButtonClick(previewButton, item, type) {
    const toggledButton = document.getElementById(activeCosmetics[type]);

    if (toggledButton) {
      handleToggleButtons(previewButton, toggledButton, item, type);
    } else {
      previewButton.innerHTML = "Un-equip";
      previewButton.style.backgroundColor = "#FF0000";
      activeCosmetics[type] = item;
      renderPlayer(item, type);
    }
  }
  function handleToggleButtons(previewButton, toggledButton, item, type) {
    if (toggledButton || previewButton.id !== toggledButton.id) {
      toggledButton.innerHTML = "Preview";
      toggledButton.style.backgroundColor = "#00FF00";
      if (ownedItems.includes(item)) {
        toggledButton.innerHTML = "equip";
        toggledButton.style.backgroundColor = "#00FF00";
      }
      previewButton.innerHTML = "Un-equip";
      previewButton.style.backgroundColor = "#FF0000";
      scene.remove(
        scene.getObjectByName(files[activeCosmetics[type]].name)
      );
      if (type == "hand") {
        scene.remove(
          scene.getObjectByName(files[activeCosmetics[type]].name)
        );
        clonedGroup.position.z += 2
        scene.remove(clonedGroup);
      }
      activeCosmetics[type] = item;
      renderPlayer(item, type);
    } else if (["head", "hand"].includes(type)) {
      previewButton.innerHTML = "Un-equip";
      previewButton.style.backgroundColor = "#FF0000";
      activeCosmetics[type] = item;
    } else {
      previewButton.classList.toggle("toggled");
      previewButton.innerHTML = "preview";
      previewButton.style.backgroundColor = "#00FF00";
      activeCosmetics[type] = undefined;
    }
  }
  async function renderPlayer(file, type) {
    return new Promise((resolve, reject) => {
      if (file === "default") {
        activeCosmetics["head"] = "default";
      } else if (file === "player_basic_hand") {
        activeCosmetics["hand"] = "player_basic_hand";
      }

      const loader = new SGMLoader();

      loader.load(files[file].file, async function ([meshes, materials]) {
        let group = await createGroupFromMeshes(meshes, materials, file, files);
        group = adjustPositionForCategory(
          type,
          group,
          file,
          files,
          activeCosmetics,
          scene
        );
        group.rotation.y += Math.PI;
        group = handleAttachmentPoints(files, file, group);
        group = applyColors(
          group,
          playerPrim_Color,
          playerSec_Color,
          visorColor
        );
        scene.add(group);
        if ("hand" === type) {
          clonedGroup = group.clone()
          clonedGroup.position.set(-0.3, -0.75, 0.1)
          clonedGroup.rotation.z += Math.PI
          clonedGroup.rotation.x += Math.PI / 2
          scene.add(clonedGroup)
          group.position.set(0.3, -0.75, 0.1)
          group.rotation.x += Math.PI / 2
        }
        if (editMode == true && userStore.userInfo && ownedItems.includes(file)) {
          userStore.userInfo.active_customizations.items[type] = file;
          setCustomizations(userStore);
        }
        resolve();
      });
    });
  }

  function setupUI() {
    document.getElementById("customizations").style.height = "100%";
    document.getElementById("categories-content").style.display = "none";
    canvas = document.getElementById("canvas");
    var element2 = document.getElementById("body1");
    var positionInfo = element2.getBoundingClientRect();
    var height2 = positionInfo.height;
    var width2 = positionInfo.width;
    canvas.style.height = height2;
    canvas.style.width2 = width2;
  }

  async function renderCosmetics(category) {
    setupUI();
    const template = document.getElementById("template").text;
    const content = document.getElementById("content");

    for (const item in files) {
      if (files[item].category === category) {
        const element = document.createElement("div");
        element.id = files[item].file;
        element.className = "list-item";
        element.innerHTML = template.replace("Scene $", files[item].name);
        const previewButton = createPreviewButton(
          item,
          activeCosmetics,
          ownedItems,
          files[item].type
        );
        previewButton.addEventListener("click", () =>
          handlePreviewButtonClick(previewButton, item, files[item].type)
        );
        element.appendChild(previewButton);

        const scene2 = setupThreeScene(item);
        scene2.userData.element = element.querySelector(".scene");
        content.appendChild(element);
        loadLight(scenes, scene2);
      }
    }

    renderer2 = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      transparent: true,
      antialias: true,
    });
    renderer2.setPixelRatio(window.devicePixelRatio);
  }
  document.getElementById("download").addEventListener("click", () =>
    downloadPlayerPic()
  );
  function downloadPlayerPic() {
    var canvas = document.getElementById('player-model')
    var link = document.createElement('a');
    link.download = 'filename.png';
    link.href = canvas.toDataURL()
    link.click();
  }



  function setupThreeScene(item) {
    const scene2 = new THREE.Scene();
    scene2.userData.element = document.querySelector(".scene");
    const camera2 = new THREE.PerspectiveCamera(55, 1, 1, 1000);
    camera2.position.z += 2;
    scene2.userData.camera = camera2;

    (function (scene2) {
      const sgmLoader2 = new SGMLoader();
      sgmLoader2.load(files[item].file, function ([meshes, materials]) {
        let group;
        group = createThreeGroup(
          meshes,
          materials,
          item,
          files,
          playerPrim_Color,
          playerSec_Color,
          visorColor
        );
        group = handleAttachmentPoints(files, item, group);
        scene2.add(group);
      });
    })(scene2);

    return scene2;
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
    requestAnimationFrame(renderLoop);
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
          if (e.name === "default_primary_color" && primaryColor) {
            e.material.color.set(primaryColor);
            playerPrim_Color = primaryColor;
          }
          if (e.name === "default_secondary_color" && secondaryColor) {
            e.material.color.set(secondaryColor);
            playerSec_Color = secondaryColor;
          }
          if (e.name === "default_secondary_color_visor" && visorColor_) {
            e.material.color.set(visorColor_);
            visorColor = visorColor_;
          }
        });
      }
    });
  }

  renderLoop();
})();
