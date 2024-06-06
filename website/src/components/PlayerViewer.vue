<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'
import * as THREE from "https://unpkg.com/three@0.138.0/build/three.module.js"
import { SGMLoader } from "../assets/sgmLoader.js";
import { OrbitControls } from "../assets/OrbitContols.js";
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

import { getShopCatalogRequest } from '../requests/GetShopCatalogRequest.js';
import { getShopProductsRequest } from '../requests/GetShopProductsRequest.js';
import { getShopItemsRequest } from '../requests/GetShopItemsRequest.js';
import { getUserInfoRequest } from '../requests/GetUserInfoRequest.js';
import { setActiveCustomizationsRequest } from '../requests/SetActiveCustomizationsRequest.js';

export default {
  data() {
    return {
      userID: null,
      playerPrim_Color: null,
      playerSec_Color: null,
      selectedPrimaryDiv: null,
      primaryOpened: null,
      selectedSecondaryDiv: null,
      secondaryOpened: null,
      backTracker: null,
      canvas: null,
      renderer2: null,
      picker: null,
      grabColorArray: null,
      categoryState: null,
      editMode: null,
      nonExistentFiles: [],
      files: {
        default: {
          file: "../../cosmetics/head/head/head.sgm",
          name: "Head Basic",
          category: "Heads",
          materials: [
            {type: "default_primary_color"},
            {type: "default_secondary_color"},
            {type: "default_secondary_color_visor"},
          ],
          type:"head",
          previewRotation: [180, 0, 0],
          attachment_points: { glasses: { position: [0, 0, 0] } }, //really weird condition
        },
        player_basic_rope:{
          file: "../../cosmetics/grapple/hook/grapple_rope_preview.sgm",
          name: "Rope Basic",
          category: "rope",
          materials: [{type:"default_color"}],
        },
        player_basic_body: {
          file: "../../cosmetics/body/body.sgm",
          name: "Body Basic",
          category: undefined,
          materials: [{type: "default_secondary_color"}, {type: "default_primary_color"}],
        },
        player_basic_hand: {
          file: "../../cosmetics/hand/hand_claw.sgm",
          name: "Claw Hand",
          category: "Hands",
          type:"hand",
          materials: [
            {type: "default_primary_color"},
            {type: "default_secondary_color"},
            {type: "default_secondary_color_visor"},
          ],
          previewRotation: [180, 0, 0],
        },
      },
      ownedItems: [],
      activeCosmetics: {
        "hand": undefined,
        "head/glasses": undefined,
        "head/hat": undefined,
        "checkpoint": undefined,
        "grapple/hook": undefined,
        "body/neck": undefined,
        "head": undefined
      },
    }
  },

  computed: {
    ...mapState(useUserStore, ['accessToken']),
    ...mapState(useUserStore, ['isLoggedIn']),
    ...mapState(useUserStore, ['userInfo'])
  },

  created() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clonedGroup = null;
    this.scenes = [];
  },

  async mounted() {
    this.userID = this.$route.query.user_id;
    await this.createPlayer();
    this.picker = document.getElementById("categories-content");
    for (let w = 0; w < 100; w++) {
      this.createContainer(w, this.picker, this.handleContainerClick, this.handleContainerMouseOut);
    }

    const { scene, camera, renderer } = this.initScene();
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    let controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;

    controls.maxPolarAngle = Math.PI;
    controls.addEventListener("start", () => (document.body.style.cursor = "none"));
    controls.addEventListener("end", () => (document.body.style.cursor = "auto"));
    await this.renderPlayer("default", "head");
    await this.renderPlayer("player_basic_hand", "hand");
    await this.renderPlayer("player_basic_rope", "rope");
    await this.renderPlayer("player_basic_body", undefined);
    if (this.userID) {
      let playerResponseBody = await getUserInfoRequest(this.$api_server_url, this.userID);
      const getColor = (colorObj) => {
      if (!colorObj) return { r: 1, g: 1, b: 1 }; // Default to white
        const [r = 1, g = 1, b = 1] = colorObj.color || [];
        return { r, g, b };
      };
    
      const primaryColor = getColor(playerResponseBody.active_customizations.player_color_primary);
      const secondaryColor = getColor(playerResponseBody.active_customizations.player_color_secondary);
      const primary = this.LinearToGamma({ ...primaryColor, a: 1 });
      const secondary = this.LinearToGamma({ ...secondaryColor, a: 1 });
      const toRGB = (color) => `rgb(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)})`;
      
      this.playerPrim_Color = toRGB(primary);
      this.playerSec_Color = toRGB(secondary);

      let renderPromises = [];
      for (var type in this.activeCosmetics) {
        if (playerResponseBody.active_customizations.items && playerResponseBody.active_customizations.items[type] !== undefined) {
          let response = await fetch(this.files[playerResponseBody.active_customizations.items[type]].file, { method: 'HEAD' });
          
          if(!response.ok){
            this.nonExistentFiles.push(this.files[playerResponseBody.active_customizations.items[type]].file)
            continue;
          }

          if (this.activeCosmetics[type] !== undefined) {
            scene.remove(scene.getObjectByName(this.files[this.activeCosmetics[type]].name));
            if (type == "hand") {
                scene.remove(scene.getObjectByName(this.files[this.activeCosmetics[type]].name));
            }
          }
            this.activeCosmetics[type] = playerResponseBody.active_customizations.items[type]
        }
        if (type == "hand" && this.clonedGroup) {
          this.activeCosmetics[type] = playerResponseBody.active_customizations.items ? (playerResponseBody.active_customizations.items[type] == undefined ? "player_basic_hand" : playerResponseBody.active_customizations.items[type]) : undefined
        }
        if (this.activeCosmetics[type] !== undefined && this.activeCosmetics[type] !== "default") {
          renderPromises.push(await this.renderPlayer(this.activeCosmetics[type], type));
        }
      }
    await Promise.all(renderPromises).then(() => {
      this.changeMeshColors(this.playerPrim_Color,this.playerSec_Color)
        if (this.isLoggedIn) {
          if (this.userID && this.userID === this.userInfo.user_id) {
            this.editMode = true;
            document.getElementById("setCustomizations").style.display="block"
            console.log("Editing mode")
            let ownedProducts = this.userInfo.owned_products
            for (var pack in this.products) {
              if (ownedProducts.includes(pack)) {
                for (var product in this.products[pack].items) {
                  this.ownedItems.push(this.products[pack].items[product])
                }
              }
            }
          }
        }
      });
    }
    this.renderLoop();
  },

  methods: {
    async createPlayer() {
      const picker = document.getElementById("categories-content");
      const items = await getShopItemsRequest(this.$api_server_url);
      let catalogResponse = await getShopCatalogRequest(this.$api_server_url);
      let catalog = catalogResponse[3].sections
      this.products = await getShopProductsRequest(this.$api_server_url);
      if (this.userInfo && !this.userInfo.active_customizations || this.userInfo && !this.userInfo.active_customizations.items && this.userInfo.active_customizations) {
        this.userInfo.active_customizations = { items: {} }
      }
      for (let category in catalog) {
          if (catalog[category].title == "Head") {
            for (let index in catalog[category].sections) {
              this.processItemsAndSections(
                catalog[category].sections[index].items,
                catalog[category].sections[index],
                this.files,
                items
              );
            }
          } else {
            this.processItemsAndSections(
              catalog[category].items,
              catalog[category],
              this.files,
              items
            );
          }
       }
    },

    async handleContainerClick(e, rgbValue) {
      if (this.primaryOpened == true) {
        if (this.selectedSecondaryDiv) this.selectedSecondaryDiv.style.outline = "none"
        if (this.selectedPrimaryDiv) this.selectedPrimaryDiv.style.outline = "none"

        this.selectedPrimaryDiv = e.target
        this.playerPrim_Color = e.target.style.backgroundColor

        if (this.editMode == true) {
          this.grabColorArray = JSON.parse(e.target.getAttribute('data-grab_color'));
          this.userInfo.active_customizations.player_color_primary = { "color": this.grabColorArray }
        }
        this.changeMeshColors(e.target.style.backgroundColor, undefined)
        this.primaryOpened = false
      }
      if (this.secondaryOpened == true) {
        if (this.selectedPrimaryDiv) this.selectedPrimaryDiv.style.outline = "none"
        if (this.selectedSecondaryDiv) this.selectedSecondaryDiv.style.outline = "none"

        if (this.editMode == true) {
          this.grabColorArray = JSON.parse(e.target.getAttribute('data-grab_color'));
          this.userInfo.active_customizations.player_color_secondary = { "color": this.grabColorArray }
        }
        this.selectedSecondaryDiv = e.target
        this.playerSec_Color = e.target.style.backgroundColor
        this.changeMeshColors(undefined, e.target.style.backgroundColor)
        this.secondaryOpened = false
      }
      this.backTracker = this.displayCategoryList(
        0,
        this.backTracker,
        this.selectedPrimaryDiv,
        this.selectedSecondaryDiv,

        this.categoryState
      )
    },

    initScene() {
      const scene = new THREE.Scene()
      scene.background = null

      scene.add(new THREE.AmbientLight(0xffffff, 0.5))
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
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
      return {scene, camera, renderer}
    },

    processItemsAndSections(sectionItems, catalogSection, files, items) {
      for (var item in sectionItems) {
        for (var cosmeticItem in items) {
          if (sectionItems[item] === cosmeticItem) {
            files[cosmeticItem] = {
              file: "/" + items[cosmeticItem].file + ".sgm",
              name: items[cosmeticItem].title,
              category: catalogSection.title,
              materials: items[cosmeticItem].materials_v2,
              rope: items[cosmeticItem].rope?items[cosmeticItem].rope:undefined,
              type: items[cosmeticItem].type,
              previewRotation: items[cosmeticItem].preview_rotation,
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
    },

    setupRenderer(canvas) {
      let renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        transparent: true,
        antialias: true,
      })
      renderer.setPixelRatio(window.devicePixelRatio)
      return renderer
    },

    loadLight(scenes, scene) {
      let light = new THREE.DirectionalLight(0xffffff, 0.5)
      light.position.set(0, 0, 1)
      scene.add(new THREE.AmbientLight(0xffffff, 0.5))
      scene.add(light)
      scenes.push(scene)
    },

    applyColors(group, file, files) {
      group.children.forEach((obj, index) => {
        if (obj.name === "default_primary_color" && this.playerPrim_Color) {
          obj.material.color.set(this.playerPrim_Color)
        } else if (obj.name === "default_secondary_color" && this.playerSec_Color) {
          obj.material.color.set(this.playerSec_Color)
        } else if (obj.name === "default_secondary_color_visor" && this.playerSec_Color) {
          obj.material.color.set(this.halfColor(this.playerSec_Color))
        }
        else if (obj.name === "default_secondary_color_darkened" && this.playerSec_Color) {
          obj.material.color.set(this.halfColor(this.playerSec_Color))
        }
        else if (obj.name === "default_primary_color_darkened" && this.playerPrim_Color) {
          obj.material.color.set(this.halfColor(this.playerPrim_Color))
        }
        else if (obj.name === "default_primary_color_visor" && this.playerPrim_Color) {
          obj.material.color.set(this.halfColor(this.playerSec_Color))
        }
        else if (obj.name === "default_color") {
          function rgbFormat(colorObject) {
            return {
                r: colorObject[0],
                g: colorObject[1],
                b: colorObject[2],
                a: colorObject.a
            };
          }
          
          let rgbFormated = rgbFormat({...files[file].materials[index].diffuseColor, a:1});

          const toRGB = (color) => `rgb(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)})`;
          obj.material.color.set(toRGB(this.LinearToGamma(rgbFormated)))
        }
      })
      return group
    },

    async createGroupFromMeshes(meshes, materials, file, files) {
      let group = new THREE.Group()
      group.name = files[file].name 
      const toRGB = (color) => `rgb(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)})`;

      const threeMaterials = materials.map((material) => {
        const color = material.colors[0][0]
        const matOptions = {
          color: new THREE.Color(toRGB(this.LinearToGamma({r:color[0], g:color[1], b:color[2]}))),
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
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
        geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3))
        geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
        geometry.setIndex(new THREE.Uint32BufferAttribute(mesh.indices, 1))
        const threeMesh = new THREE.Mesh(geometry, threeMaterials[mesh.material_id])
        group.add(threeMesh)
      })
      group = this.applyMaterialIndices(group, file, files)
      group = this.applyColors(
            group,
            file,
            files
          );
      return group
    },
    computeGroupBoundingBox(group) {
      let box = new THREE.Box3();
      group.traverse(function (child) {
          if (child.isMesh) {
              child.geometry.computeBoundingBox();
              const childBox = child.geometry.boundingBox.clone();
              childBox.applyMatrix4(child.matrixWorld);
              box.union(childBox);
          }
      });
      return box;
  },
    adjustPositionForCategory(category, group, file, files, activeCosmetics, scene) {    
          
        if (category === "head" && activeCosmetics) {
          group.position.set(0, 0.2, 0);

          for(var item in activeCosmetics){
            if(item.includes("head/")){
              if (activeCosmetics[item]) {
                  const referenceGroup = scene.getObjectByName(files[activeCosmetics[item]].name);
                  referenceGroup.position.set(0, 0.2, 0);
                if (files[file].attachment_points && files[file].attachment_points.glasses) {
                  this.updateGroup(referenceGroup, files[file].attachment_points.glasses);
                }
                if (files[activeCosmetics[item]].attachment_point_overrides) {
                  this.updatePosition(referenceGroup, files[activeCosmetics[item]].attachment_point_overrides[activeCosmetics["head"]]);
                }
              }
            }
          }
        } else if (category&&category.includes("head/")) {
          group.position.set(0, 0.2, 0);
          if (files[activeCosmetics["head"]].attachment_points) {
            if (files[activeCosmetics["head"]].attachment_points[category.split("/")[1]]) {
              this.updateGroup(group, files[activeCosmetics["head"]].attachment_points[category.split("/")[1]]);
            }
            if (files[file].attachment_point_overrides) {
              this.updatePosition(group, files[file].attachment_point_overrides[activeCosmetics["head"]]);
            }
          }
        } else if (category === "grapple/hook") {
          let scene_rope = this.scene.getObjectByName("Rope Basic");
          let scene_geo = this.computeGroupBoundingBox(scene_rope);
          let grapple_size = new THREE.Vector3();
          scene_geo.getSize(grapple_size);

          let groupBoundingBox = this.computeGroupBoundingBox(group);
          let hook_size = new THREE.Vector3();
          groupBoundingBox.getSize(hook_size);

          group.position.copy(scene_rope.position);
          group.position.y += (grapple_size.z) + (hook_size.z /2);
          group.rotation.set(Math.PI / 2, Math.PI, Math.PI);

          files[file].rope !==undefined?this.updateRope(files[file].rope, true):this.updateRope(undefined, false);
        } else if (category === "checkpoint") {
          group.position.set(-0.5, -1.5, 0);
          group.rotation.set(0, Math.PI, 0);
        } else if(category=="rope"){
          group.position.set(0.5, -1.5, 0);
        }
      return group;
    },
    updateRope(ropeData, hasData){
      let scene_rope = this.scene.getObjectByName("Rope Basic")
      if(hasData==true){
        let diffuseColorData = ropeData.materials_v2[0].diffuseColor;
        let diffuseColor = this.LinearToGamma({
          r: diffuseColorData[0],
          g: diffuseColorData[1],
          b: diffuseColorData[2],
        })
        scene_rope.children[0].material.color.set(`rgb(${Math.floor(diffuseColor.r*255)},${Math.floor(diffuseColor.g*255)},${Math.floor(diffuseColor.b*255)})`)
    }else if(hasData==false){
      scene_rope.children[0].material.color.set("rgb(115, 89, 62)")
    }
    
    },
    updateGroup(group, attachmentPoint, rope) {
      group.position.set(0,0.2,0)
      group.scale.set(1,1,1);
      if (attachmentPoint.scale) {
        group.scale.set(attachmentPoint.scale, attachmentPoint.scale, attachmentPoint.scale);
      }
      if (attachmentPoint.position) {
        group.position.sub(new THREE.Vector3().fromArray(attachmentPoint.position));
      }
    },
    
    updatePosition(group, attachmentPointOverride) {
      group.position.set(0,0.2,0)
      group.scale.set(1,1,1);
      if (attachmentPointOverride && attachmentPointOverride.position) {
        group.position.add(new THREE.Vector3(-attachmentPointOverride.position[0],attachmentPointOverride.position[1],-attachmentPointOverride.position[2]))
      }
      if (attachmentPointOverride && attachmentPointOverride.scale) {
        group.scale.set(attachmentPointOverride.scale, attachmentPointOverride.scale, attachmentPointOverride.scale)
      }
  
    },


    applyPreviewRotation(group, item, files) {
      if (files[item].previewRotation !== undefined) {
        const [rx, ry, rz] = files[item].previewRotation.map(Number)
        group.rotation.x += (ry * Math.PI) / 180
        group.rotation.y += (rx * Math.PI)/180
        group.rotation.z += rz*Math.PI
      }
      return group
    },
    applyMaterialIndices(group, item, files) {
      for(let material in files[item].materials){
            if(group.children[material] !== undefined){
                  group.children[material].name = files[item].materials[material].type?files[item].materials[material].type:files[item].materials[material]
            }
          }
      return group
    },


    createPreviewButton(item, activeCosmetics, owned_products, type) {
      const previewButton = document.createElement("button")
      previewButton.style.height = "2em"
      previewButton.style.width = "70%"
      previewButton.innerHTML = owned_products.includes(item)?"Equip":"Preview"
      if (['default', 'player_basic_hand'].includes(item) && this.editMode) {
        previewButton.innerHTML = "Equip"
      }
      previewButton.style.zIndex = 999
      previewButton.classList.add("previewButton", `${type}`)
      previewButton.id = item
      if(activeCosmetics[type]==item){
        previewButton.classList.toggle("toggled")
        previewButton.innerHTML = "Un-equip";
        if (type == "head" || type == "hand") {
          previewButton.innerHTML = "Equipped";
        }
        previewButton.style.backgroundColor = "#FF0000";
      }
      return previewButton
    },

    createContainer(
      w,
      picker,
      handleContainerClick,
      handleContainerMouseOut
    ) {
      const container = document.createElement("div")
      const lastWholeDigitNum = w % 10
      const firstWholeDigitNum = Math.floor(w / 10)

      container.onclick = (e) => handleContainerClick(e, [Math.floor(
        this.LinearToGamma(this.GetColor(firstWholeDigitNum, lastWholeDigitNum)).r * 255
      ), Math.floor(
        this.LinearToGamma(this.GetColor(firstWholeDigitNum, lastWholeDigitNum)).g * 255
      ), Math.floor(
        this.LinearToGamma(this.GetColor(firstWholeDigitNum, lastWholeDigitNum)).b * 255
      )])
      container.onmouseout = handleContainerMouseOut

      container.setAttribute('data-grab_color', `[${this.GetColor(firstWholeDigitNum, lastWholeDigitNum).r},${this.GetColor(firstWholeDigitNum, lastWholeDigitNum).g},${this.GetColor(firstWholeDigitNum, lastWholeDigitNum).b}]`)
      container.style.backgroundColor = `rgb(${Math.floor(
        this.LinearToGamma(this.GetColor(firstWholeDigitNum, lastWholeDigitNum)).r * 255
      )}, ${Math.floor(
        this.LinearToGamma(this.GetColor(firstWholeDigitNum, lastWholeDigitNum)).g * 255
      )}, ${Math.floor(
        this.LinearToGamma(this.GetColor(firstWholeDigitNum, lastWholeDigitNum)).b * 255
      )})`
      picker.appendChild(container)
    },

    displayCategoryList(
      a,
      backTracker,
      selectedPrimaryDiv,
      selectedSecondaryDiv,
      categoryState
    ) {
      let categoriesContent = document.getElementById("categories-content")
      let children = categoriesContent.children
      if (a == 0) {
        //front page
        backTracker = 0
        for (let i = 0; i < children.length; i++) {
          children[i].style.display = "none"
        }

        if (selectedPrimaryDiv) selectedPrimaryDiv.style.outline = "none"
        if (selectedSecondaryDiv) selectedSecondaryDiv.style.outline = "none"
        document.getElementById("categories-content").style.display = "grid"
        document.getElementById("cosmetics").style.display = "block"
        document.getElementById("primary").style.display = "block"
        document.getElementById("secondary").style.display = "block"
        document.getElementById("back-btn").style.display = "none"
        document.getElementById("categories-content").style.height = "372px"
      }
      if (a == 1) {
        //cosmetics clicked
        backTracker = 0
        for (let i = 0; i < children.length; i++) {
          children[i].style.display = "none"
        }
        var contentChildren = document.getElementById("content").childNodes
        for (var i = contentChildren.length - 1; i >= 0; i--) {
          var child = contentChildren[i]
          document.getElementById("content").removeChild(child)
        }
        categoryState = false
        document.getElementById("categories-content").style.display = "grid"
        document.getElementById("Head").style.display = "block"
        document.getElementById("Body").style.display = "block"
        document.getElementById("Hands").style.display = "block"
        document.getElementById("Grapples").style.display = "block"
        document.getElementById("Checkpoints").style.display = "block"
        document.getElementById("back-btn").style.display = "block"
        document.getElementById("categories-content").style.height = "300px"
        document.getElementById("content").style.height = ""
        document.getElementById("back-btn").style.marginTop = "0em"
      }

      if (a == 2) {
        //color picker
        backTracker = 0
        for (let i = 0; i < children.length; i++) {
          children[i].style.display = "none"
        }
        document.getElementById("categories-content").style.display = "block"
        document
          .querySelectorAll("#categories-content div")
          .forEach((e) => (e.style.display = "inline-block"))
        document.getElementById("back-btn").style.display = "block"
        document.getElementById("categories-content").style.height = "400px"
      }
      if (a == 3) {
        //show head accessories categories
        backTracker = 1
        categoryState = true
        for (let i = 0; i < children.length; i++) {
          children[i].style.display = "none"
        }
        document.getElementById("Heads").style.display = "block"
        document.getElementById("Hats").style.display = "block"
        document.getElementById("Facewear").style.display = "block"
        document.getElementById("categories-content").style.height = "150px"
        document.getElementById("content").style.height = ""
        document.getElementById("back-btn").style.marginTop = "0em"
        var contentChildren = document.getElementById("content").childNodes
        for (var i = contentChildren.length - 1; i >= 0; i--) {
          var child = contentChildren[i]
          document.getElementById("content").removeChild(child)
        }
        document.getElementById("categories-content").style.display = "grid"
      }
      if (a == 4) {
        //finals when clicked
        if (categoryState == true) {
          backTracker = 3
        } else {
          backTracker = 1
        }
        for (let i = 0; i < children.length; i++) {
          children[i].style.display = "none"
        }
        document.getElementById("content").style.height = "100%"
        document.getElementById("categories-content").style.height = "372px"
        document.getElementById("back-btn").style.marginTop = "1.5em"

        //categories will dissappear btw
      }
      return backTracker
    },

  LinearToGamma(linearRGB) {
    let {r, g, b} = linearRGB;
    r = (r <= 0.0031308) ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055;
    g = (g <= 0.0031308) ? 12.92 * g : 1.055 * Math.pow(g, 1 / 2.4) - 0.055;
    b = (b <= 0.0031308) ? 12.92 * b : 1.055 * Math.pow(b, 1 / 2.4) - 0.055;
    return {r:r, g:g, b:b, a:1}
},

    ConvertHSVToRGB(h, s, v, alpha) {
      let hi = h * 3.0 / Math.PI
      const f = hi - Math.floor(hi)
      if (hi >= 3.0) {
        hi -= 6.0
      }
      if (hi < -3.0) {
        hi += 6.0
      }
      
      let r = Math.max(v, 0.0)
      let g = Math.max(v - s * v, 0.0)
      let b = Math.max(v - s * f * v, 0.0)
      let a = Math.max(v - s * (1.0 - f) * v, 0.0)
      
      if(hi < -2.0) {
        return {r: r, g: a, b: g, a: alpha}
      } else if(hi < -1.0) {
        return {r: b, g: r, b: g, a: alpha}
      } else if(hi < 0.0) {
        return {r: g, g: r, b: a, a: alpha}
      } else if(hi < 1.0) {
        return {r: g, g: b, b: r, a: alpha}
      } else if(hi < 2.0) {
        return {r: a, g: g, b: r, a: alpha}
      } else {
        return {r: r, g: g, b: b, a: alpha}
      }
    },

    GetColor (row, column) {
      let color
      if(row ==0){
        return (color = this.ConvertHSVToRGB(0.0, 0.0, 1.0 - column / 10.0))
      }
      if(row <= 5&&row!=0) {
        return (color = this.ConvertHSVToRGB(2.0 * Math.PI * column/10.0, 1.0, row/(10.0 - 4.0)))
      } else {
        return (color = this.ConvertHSVToRGB(2.0 * Math.PI * column/10.0, 1.0 - (row - 5.0)/(10.0 - 5.0), 1.0))
      }
    },

    handleContainerMouseOut(e) {
      if (this.selectedPrimaryDiv && this.primaryOpened == true) {
        this.selectedPrimaryDiv.style.outline = "3px solid #333"
      }
      if (this.selectedSecondaryDiv && this.secondaryOpened == true) {
        this.selectedSecondaryDiv.style.outline = "3px solid #333"
      }
    },

    handleCosmeticsClick(e) {
      this.backTracker = this.displayCategoryList(
        1,
        this.backTracker,
        this.selectedPrimaryDiv,
        this.selectedSecondaryDiv,
        this.categoryState
      );
    },

    handleColorClick(e) {
      this.backTracker = this.displayCategoryList(
        2,
        this.backTracker,
        this.selectedPrimaryDiv,
        this.selectedSecondaryDiv,
        this.categoryState
      );
      if (e.target.id == "primary") {
        if (this.selectedPrimaryDiv) {
          this.selectedPrimaryDiv.style.outline = "3px solid #333";
        }
        this.primaryOpened = true;
      } else {
        if (this.selectedSecondaryDiv) {
          this.selectedSecondaryDiv.style.outline = "3px solid #333";
        }
        this.secondaryOpened = true;
      }
    },
    
    handleHeadClick(e) {
      this.backTracker = this.displayCategoryList(
        3,
        this.backTracker,
        this.selectedPrimaryDiv,
        this.selectedSecondaryDiv,
        this.categoryState
      );
    },

    handleFinalClick(e) {
      //basically the things where you can view the cosmetics
      this.backTracker = this.displayCategoryList(
        4,
        this.backTracker,
        this.selectedPrimaryDiv,
        this.selectedSecondaryDiv,

        this.categoryState
      );
      this.renderCosmetics(e.target.id);
    },

    handleBackClick() {
      this.backTracker = this.displayCategoryList(
        this.backTracker,
        this.backTracker,
        this.selectedPrimaryDiv,
        this.selectedSecondaryDiv,
        this.categoryState
      );
    },

    downloadPlayerPic() {
      let canvas = document.getElementById('player-model')
      let link = document.createElement('a');
      link.download = 'player.png';
      link.href = canvas.toDataURL()
      link.click();
    },

    exportAsGLTF() {
      const exporter = new GLTFExporter();
      exporter.parse(
        this.scene, 
        function ( gltf ) {
          const blob = new Blob([JSON.stringify(gltf)], {type: 'text/json'});
          if(window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(blob, "player.gltf");
          } else {
            const elem = window.document.createElement('a');
            elem.href = window.URL.createObjectURL(blob);
            elem.download = "player.gltf";        
            document.body.appendChild(elem);
            elem.click();        
            document.body.removeChild(elem);
          }
        },
        function ( error ) {
            console.log( 'An error happened' );
        },
        {}
      );
    },
    
  setupThreeScene(file) {
    const scene2 = new THREE.Scene();
    scene2.userData.element = document.querySelector(".scene");
    const camera2 = new THREE.PerspectiveCamera(55, 1, 1, 1000);
    camera2.position.z += 2;
    scene2.userData.camera = camera2;
    (async (scene2) => {
      const sgmLoader2 = new SGMLoader()
      let group;
      let modelPath = this.files[file].file
      if(this.nonExistentFiles.includes(modelPath)){
         document.getElementById(modelPath).remove()
       return;
      };
      let response = await fetch(modelPath, { method: 'HEAD' });

      if(!response.ok) {
        document.getElementById(modelPath).remove()
        this.nonExistentFiles.push(modelPath)
        console.error("Model " + modelPath + " not found. Not rendering. (including any subsequent attempts until reload)")
        return;
      }
      sgmLoader2.load(this.files[file].file, async ([meshes, materials]) => { // Making the callback async
        group = await this.createGroupFromMeshes(meshes, materials, file, this.files);
        group = this.applyPreviewRotation(group, file, this.files)
        scene2.add(group);
      });
    })(scene2);
    return scene2;
  },
    setCustomizations(){
      setActiveCustomizationsRequest(this.$api_server_url, this.accessToken, this.userInfo.active_customizations)
    },
    
    updateSize() {
      let width = this.canvas.clientWidth;
      let height = this.canvas.clientHeight;
      if (this.canvas.width !== width || this.canvas.height != height) {
        this.renderer2.setSize(width, height, false);
      }
    },
    
    renderLoop() {
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(this.renderLoop);
    },
    
    render() {
      this.updateSize();
      this.canvas.style.transform = `translateY(${window.scrollY}px)`;
      this.renderer2.clear();
      this.renderer2.setScissorTest(true);
      this.scenes.forEach((scene2) => {
        let element = scene2.userData.element;
        let rect = element.getBoundingClientRect();

					if ( rect.bottom < 0 || rect.top  > this.renderer2.domElement.clientHeight ||
						 rect.right  < 0 || rect.left > this.renderer2.domElement.clientWidth ) {
						return;
					}

        let width = rect.right - rect.left;
        let height = rect.bottom - rect.top;
        let left = rect.left;
        let bottom = this.renderer2.domElement.clientHeight - rect.bottom;
        this.renderer2.setViewport(left, bottom, width, height);
        this.renderer2.setScissor(left, bottom, width, height);
        let camera = scene2.userData.camera;
        this.renderer2.render(scene2, camera)
    });

    },
    halfColor(color){
            var rgbArray = color.substring(4, color.length-1).split(",");
            var r = parseInt(rgbArray[0]);
            var g = parseInt(rgbArray[1]);
            var b = parseInt(rgbArray[2]);
            r = Math.floor(r * 0.5);
            g = Math.floor(g * 0.5);
            b = Math.floor(b * 0.5);
            return "rgb(" + r + "," + g + "," + b + ")";
    },
    changeMeshColors() {
      this.scene.traverse((child) => {
        if (child instanceof THREE.Group) {
          child.children.forEach((e) => {
            if (e.name === "default_primary_color" && this.playerPrim_Color) {
              e.material.color.set(this.playerPrim_Color)
            } else if (e.name === "default_secondary_color" && this.playerSec_Color) {
              e.material.color.set(this.playerSec_Color)
            } else if (e.name === "default_secondary_color_visor" && this.playerSec_Color) {
              e.material.color.set(this.halfColor(this.playerSec_Color))
            }
            else if (e.name === "default_secondary_color_darkened" && this.playerSec_Color) {
              obj.material.color.set(this.halfColor(this.playerSec_Color))
            }
            else if (e.name === "default_primary_color_darkened" && this.playerPrim_Color) {
              e.material.color.set(this.halfColor(this.playerPrim_Color))
            }
            else if (e.name === "default_primary_color_visor" && this.playerPrim_Color) {
              e.material.color.set(this.halfColor(this.playerSec_Color))
            }
          });
        }
      });
    },

    handlePreviewButtonClick(previewButton, item, type) {
      const toggledButton = document.getElementById(this.activeCosmetics[type]);

      if (toggledButton) {
        if (previewButton.id !== toggledButton.id) {
          toggledButton.innerHTML = "Preview";
          toggledButton.style.backgroundColor = "#00FF00";
          if (this.ownedItems.includes(item) || (['default', 'player_basic_hand'].includes(item) && this.editMode)) {
            toggledButton.innerHTML = "Equip";
            toggledButton.style.backgroundColor = "#00FF00";
          }
          previewButton.innerHTML = "Un-equip";
          if (["head", "hand"].includes(type)) {
            previewButton.innerHTML = "Equipped";
          }
          previewButton.style.backgroundColor = "#FF0000";
          this.scene.remove(
            this.scene.getObjectByName(this.files[this.activeCosmetics[type]].name)
          );
          if (type == "hand") {
            this.scene.remove(
              this.scene.getObjectByName(this.files[this.activeCosmetics[type]].name)
            );
            this.clonedGroup.position.z += 2
            this.scene.remove(this.clonedGroup);
          }
          this.activeCosmetics[type] = item;
          this.renderPlayer(item, type);
        } else if (["head", "hand"].includes(type)) {
          previewButton.innerHTML = "Equipped";
          previewButton.style.backgroundColor = "#FF0000";
          this.activeCosmetics[type] = item;
        } else {
          previewButton.classList.toggle("toggled");
          previewButton.innerHTML = "Preview";
          previewButton.style.backgroundColor = "#00FF00";
          this.activeCosmetics[type] = undefined;
          this.scene.remove(
            this.scene.getObjectByName(this.files[item].name)
          );
          if (this.editMode && this.userInfo) {
            this.userInfo.active_customizations.items[type] = undefined;
          }
        }
      } else {
        // nothing was equipped
        previewButton.innerHTML = "Un-equip";
        if (["head", "hand"].includes(type)) {
          previewButton.innerHTML = "Equipped";
        }
        previewButton.style.backgroundColor = "#FF0000";
        this.activeCosmetics[type] = item;
        this.renderPlayer(item, type);
      }
    },
      
    async renderPlayer(file, type) {
      return new Promise((resolve, reject) => {
        if (file === "default") {
          this.activeCosmetics["head"] = "default";
        } else if (file === "player_basic_hand") {
          this.activeCosmetics["hand"] = "player_basic_hand";
        }

        const loader = new SGMLoader();
        loader.load(this.files[file].file, async ([meshes, materials]) => {
          let group = await this.createGroupFromMeshes(meshes, materials, file, this.files);
          group = this.adjustPositionForCategory(
            type,
            group,
            file,
            this.files,
            this.activeCosmetics,
            this.scene
          );
          group.rotation.y += Math.PI;
          this.scene.add(group);
          if ("hand" === type) {
            this.clonedGroup = group.clone()
            this.clonedGroup.position.set(-0.3, -0.75, 0.1)
            this.clonedGroup.rotation.z += Math.PI
            this.clonedGroup.rotation.x += Math.PI / 2
            this.scene.add(this.clonedGroup)
            group.position.set(0.3, -0.75, 0.1)
            group.rotation.x += Math.PI / 2
          }
          if (this.editMode && this.userInfo && this.ownedItems.includes(file)) {
            this.userInfo.active_customizations.items[type] = file;
            console.log("setCustomizations");
          } else if (this.editMode && this.userInfo && ['default', 'player_basic_hand'].includes(file)) {
            this.userInfo.active_customizations.items[type] = undefined;
            console.log("setCustomizations");
          }
          resolve();
        });
      });
    },
      
    setupUI() {
      document.getElementById("customizations").style.height = "100%";
      document.getElementById("categories-content").style.display = "none";
      this.canvas = document.getElementById("canvas");
      let element2 = document.getElementById("body1");
      let positionInfo = element2.getBoundingClientRect();
      let height2 = positionInfo.height;
      let width2 = positionInfo.width;
      this.canvas.style.height = height2;
      this.canvas.style.width2 = width2;
    },

    async renderCosmetics(category) {
      this.setupUI();
      const template = `<div class="description">Scene $</div><div class="scene"></div>`;
      const content = document.getElementById("content");

      for (const item in this.files) {
        if (this.files[item].category === category) {
          const element = document.createElement("div");
          element.id = this.files[item].file;
          element.className = "list-item";
          element.innerHTML = template.replace("Scene $", this.files[item].name);
          const previewButton = this.createPreviewButton(
            item,
            this.activeCosmetics,
            this.ownedItems,
            this.files[item].type
          );
          previewButton.addEventListener("click", () =>
            this.handlePreviewButtonClick(previewButton, item, this.files[item].type)
          );
          element.appendChild(previewButton);

          const scene2 = this.setupThreeScene(item);
          scene2.userData.element = element.querySelector(".scene");
          content.appendChild(element);
          this.loadLight(this.scenes, scene2);
        }
      }
      this.renderer2 = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha:true,
        antialias: true
      });
      this.renderer2.setPixelRatio(window.devicePixelRatio);
      this.renderer2.setAnimationLoop( this.render );
    },

    handleGoBack() {
      location.href = "/levels?tab=tab_other_user&user_id=" + this.userID;
    }

  }
}


</script>

<template>
  <main id="body1" class="scopedAlternative">
    <button class="buttons" id="download" @click="downloadPlayerPic">↓ .png</button>
    <button class="buttons" id="export" @click="exportAsGLTF">↓ .gltf</button>
    <button class="buttons" id="setCustomizations" @click="setCustomizations">↪ set items</button>
    <a class="buttons" id="back" @click="handleGoBack">Back</a>
    <div id="player-container">
      <canvas class="player-model" id="player-model"></canvas>
    </div>
    <canvas id="canvas"></canvas>
    <div id="customizations">
        <span id="back-btn" style="display: none;" @click="handleBackClick">Back</span>
        <div id="categories-content">
            <span id="cosmetics" @click="handleCosmeticsClick">Cosmetics</span>
            <span id="primary" @click="handleColorClick">Change Main Color</span>
            <span id="secondary" @click="handleColorClick">Change Second Color</span>
            <span id="Head" style="display: none;" @click="handleHeadClick">Head</span>
            <span class="final" @click="handleFinalClick" id="Body" style="display: none;">Body</span>
            <span class="final" @click="handleFinalClick" id="Hands" style="display: none;">Hands</span>
            <span class="final" @click="handleFinalClick" id="Grapples" style="display: none;">Grapples</span>
            <span class="final" @click="handleFinalClick" id="Checkpoints" style="display: none;">Checkpoints</span>
            <span class="final" @click="handleFinalClick" id="Heads" style="display: none;">Heads</span>
            <span class="final" @click="handleFinalClick" id="Hats" style="display: none;">Hats</span>
            <span class="final" @click="handleFinalClick" id="Facewear" style="display: none;">Facewear</span>
        </div>
        <div id="content"></div>
    </div>
  </main>
</template>

<!-- i know the css is garbage, its a temporary alternative for scoped breaking everything -->

<style>
/* roboto-regular - latin */
@font-face {
    font-display: swap;
    /* Check https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display for other options. */
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 400;
    src: url('../fonts/roboto-v30-latin-regular.woff2') format('woff2');
    /* Chrome 36+, Opera 23+, Firefox 39+, Safari 12+, iOS 10+ */
}

/* roboto-italic - latin */
@font-face {
    font-display: swap;
    /* Check https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display for other options. */
    font-family: 'Roboto';
    font-style: italic;
    font-weight: 400;
    src: url('../fonts/roboto-v30-latin-italic.woff2') format('woff2');
    /* Chrome 36+, Opera 23+, Firefox 39+, Safari 12+, iOS 10+ */
}

/* roboto-700 - latin */
@font-face {
    font-display: swap;
    /* Check https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display for other options. */
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    src: url('../fonts/roboto-v30-latin-700.woff2') format('woff2');
    /* Chrome 36+, Opera 23+, Firefox 39+, Safari 12+, iOS 10+ */
}

main.scopedAlternative {
    font-family: 'Roboto';
    font-weight: 700;
    background-image: linear-gradient(#84c1f0, #e1f6ff, #84c1f0);
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-attachment: fixed;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    height: 100vh;
    flex-direction: row;
    flex-wrap: wrap-reverse;
    margin: 0;
    gap: 30px;
}

main.scopedAlternative * {
  font-weight: 700;
}

.scopedAlternative #customizations {
    width: 572px;
    height: 100%;
    overflow-y: scroll;
    overflow-x: hidden;
    padding: 3px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;

}

.scopedAlternative .previewButton {
    width: 70%;
    border-radius: 2em;
    background-color: #00FF00;
    text-align: center;
    bottom: 10%;
    color: white;
    border: none;
    position: relative;
    cursor: pointer;
    z-index: 999;
}

.scopedAlternative #categories-content {
    display: grid;
    overflow: hidden;
    width: 382px;
    z-index: 2;
    height: 372px;
    padding: 3px;
    position: relative;

}

.scopedAlternative #categories-content div,
.scopedAlternative #categories-content div.selected:has(~ div:active),
.scopedAlternative div.selected:is(#categories-content div:active ~ div.selected) {
    width: 30px;
    height: 30px;
    display: inline-block;
    outline: none;
}

.scopedAlternative #categories-content div:hover {
    cursor: pointer;
    outline: 3px solid #333;
}

.scopedAlternative #categories-content div.selected,
.scopedAlternative #categories-content div:active {
    outline: 3px solid #000;
}

.scopedAlternative #categories-content span {
    color: #0f6db3;
    font-size: 1.5em;
    cursor: pointer;
    text-align: center;
}

.scopedAlternative #categories-content div {
    display: none;
    margin-inline: 1%;
    outline: 3px solid transparent;
}

.scopedAlternative .player-model {
    z-index: 2;
    width: 400px;
    height: 450px;
}

.scopedAlternative .cosmetic-Container {
    width: 100px;
    height: 100px;
    background: rgba(0, 0, 0, .1);
    border-radius: 15%;
}

.scopedAlternative #cosmetics {
    grid-column: 1 / 10;
    grid-row: 2/ 6;
}

.scopedAlternative #primary {
    grid-column: 1 / 10;
    grid-row: 3 / 6;
}

.scopedAlternative #secondary {
    grid-column: 1 / 10;
    grid-row: 4 / 6;
}

.scopedAlternative #content {
    position: relative;
    top: 0px;
    width: 100%;
    z-index: 1;
}

.scopedAlternative #back-btn {
    z-index: 9999;
    color: #0f6db3;
    font-size: 1.5em;
    cursor: pointer;
    position: relative;
    width: fit-content;
}

.scopedAlternative #canvas {
    position: fixed;
    left: 0px;
    width: 100%;
    height: 100%;
}

.scopedAlternative .buttons {
    width: 150px;
    height: 30px;
    font-size: 15px;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    border-radius: 15px;
    box-sizing: border-box;
    text-decoration: none;
    background-color: #00bc87;
    color: #fff;
    text-align: center;
    border: none;
    top: 1em;
    left: 1em;
    position: absolute;
    cursor: pointer;
    z-index: 1;
}

.scopedAlternative .list-item {
    display: inline-block;
    text-align: center;
    margin-bottom: 1em;
    padding: 1em;
    box-shadow: 1px 2px 4px 0px rgba(0, 0, 0, 0.25);
    margin-right: 1em;
    background-color: rgba(0, 0, 0, 0.1);
}

.scopedAlternative .list-item .scene {
    width: 200px;
    height: 200px;
}

.scopedAlternative .list-item .description {
    color: #0f6db3;
    font-family: sans-serif;
    font-size: large;
    width: 200px;
    height: 20px;
    margin-top: 0.5em;
    bottom: 75%;
}

.scopedAlternative .customContainer {
    width: 28px;
    height: 28px;
}

.scopedAlternative .customContainer:hover {
    cursor: pointer;
    outline: 3px solid #333;
}

.scopedAlternative #download {
  z-index: 3;
  width: 110px;
  top: 3.5em;
}

.scopedAlternative #export {
  z-index: 3;
  width: 110px;
  top: 6em;
}
.scopedAlternative #setCustomizations {
  display: none;
  z-index: 3;
  width: 110px;
  top: 8.5em;
}

.scopedAlternative #back {
  z-index: 3;
  width: 110px;
  padding-block: 3px;
  height: auto;
  background-color: red;
}

#app:has(.scopedAlternative) {
  max-width: 100% !important;
  width: 100%;
  padding: 0 !important;
}
body:has(.scopedAlternative) {
  max-width: 100% !important;
  width: 100%;
}

.scopedAlternative ::-webkit-scrollbar {
  width: 0;
}


@media screen and (max-width: 1002px) {
  main.scopedAlternative {
    flex-direction: column;
    flex-wrap: nowrap;
  }
  .scopedAlternative #customizations {
    align-items: center;
  }
  .scopedAlternative #back-btn {
    margin-right: auto;
  }
  .scopedAlternative #content {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  .scopedAlternative .list-item:nth-last-child(1):nth-child(odd) {
    margin-right: calc(50% - 25px);
  }
  .scopedAlternative .list-item {
    display: block;
  }
  .scopedAlternative .previewButton {
    bottom: 0;
  }
  .scopedAlternative .list-item .description {
    bottom: 0;
  }
  .scopedAlternative canvas#player-model.player-model {
    width: 300px !important;
    height: 337.5px !important;
    background-color: #4BA0D6;
  }
  main.scopedAlternative {
    background-color: #4BA0D6;
    background-image: none;
    gap: 0;
  }
  .scopedAlternative #player-container {
    background-color: #4BA0D6;
    padding-inline: 100px;
    z-index: 1;
  }
}

@media screen and (max-width: 600px) {
  .scopedAlternative #player-container {
    padding-inline: 0;
  }
  .scopedAlternative .list-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: min(300px, 80%);
    margin-right: 0;
  }
  .scopedAlternative #content {
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;
  }
  .scopedAlternative #back-btn {
    margin-right: 0;
    margin-inline: auto;
  }
  .scopedAlternative .list-item:nth-last-child(1):nth-child(odd) {
    margin-right: 0;
  }
  .scopedAlternative #customizations {
    width: 95%;
  }
}
</style>
