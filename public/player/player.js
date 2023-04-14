import * as THREE from 'https://cdn.skypack.dev/three@v0.132.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@v0.132.0/examples/jsm/loaders/GLTFLoader.js';

const picker = document.getElementById('color-picker');
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
// Create 100 divs
for (let w = 0; w < 100; w++) {

    // Create a container element for the 10 divs
    const container = document.createElement('div');
    const lastWholeDigitNum = w % 10;
    const firstWholeDigitNum = Math.floor(w / 10);
    container.classList.add(`column${lastWholeDigitNum}`);
    container.classList.add(`row${firstWholeDigitNum}`);
    container.setAttribute("hsvValue", `rgb(${GetColor(firstWholeDigitNum, lastWholeDigitNum).r},${GetColor(firstWholeDigitNum, lastWholeDigitNum).g},${GetColor(firstWholeDigitNum, lastWholeDigitNum).b})`)
    container.style.backgroundColor = `rgb(${Math.floor(LinearToGamma(GetColor(firstWholeDigitNum, lastWholeDigitNum)).r * 255)}, ${Math.floor(LinearToGamma(GetColor(firstWholeDigitNum, lastWholeDigitNum)).g * 255)}, ${Math.floor(LinearToGamma(GetColor(firstWholeDigitNum, lastWholeDigitNum)).b * 255)})`;
    picker.appendChild(container);
    // If 10 containers have been created, move to the next row and reset x coordinate
}

function setPrimaryColor(e) {
    let modelNodes = [
        "Cylinder005",
        "Mesh004"
    ];
    if (e.target.parentNode.id !== 'color-picker') return;
    console.log(scene.children[1]);
    const color = e.target.style.backgroundColor;
    if (color) {
        const hex = color.replace(/^#/, '0x');
        const model = scene.children[1];
        if (model) {
            model.traverse(function (node) {
                if (node.isMesh && modelNodes.includes(node.name)) {
                    node.material = new THREE.MeshPhongMaterial({ color: hex });
                }
            });
        }
    }
    renderer.render(scene, camera);
    document.getElementById('primary').style.display = 'block';
    document.getElementById('secondary').style.display = 'block';
    document.querySelectorAll('#color-picker div').forEach(e => e.style.display = 'none');

    document.removeEventListener('click', setPrimaryColor);
}

function setSecondaryColor(e) {
    let modelNodes = [
        "Cylinder005_1",
        "Cylinder005_2",
        "Mesh004_1"
    ];
    if (e.target.parentNode.id !== 'color-picker') return;
    console.log(scene.children[1]);
    const color = e.target.style.backgroundColor;
    if (color) {
        const hex = color.replace(/^#/, '0x');
        const model = scene.children[1];
        if (model) {
            model.traverse(function (node) {
                if (node.isMesh && modelNodes.includes(node.name)) {
                    node.material = new THREE.MeshPhongMaterial({ color: hex });
                }
            });
        }
    }
    renderer.render(scene, camera);
    document.getElementById('primary').style.display = 'block';
    document.getElementById('secondary').style.display = 'block';
    document.querySelectorAll('#color-picker div').forEach(e => e.style.display = 'none');

    document.removeEventListener('click', setSecondaryColor);
}



addEventListener('click', (e) => {
    if (e.target.id == 'primary') {
        e.target.style.display = 'none';
        document.getElementById('secondary').style.display = 'none';
        document.querySelectorAll('#color-picker div').forEach(e => e.style.display = 'block');
        
        document.addEventListener('click', setPrimaryColor);
    
    } else if (e.target.id == 'secondary') {
        e.target.style.display = 'none';
        document.getElementById('primary').style.display = 'none';
        document.querySelectorAll('#color-picker div').forEach(e => e.style.display = 'block');
        
        document.addEventListener('click', setSecondaryColor);
    }
});

const scene = new THREE.Scene();
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);
const camera = new THREE.PerspectiveCamera(55, 300 / 300, 0.1, 1000);
camera.position.z = 1.6;
camera.rotation.x = -0.1;

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('.player-model'), alpha: true, transparent: true, antialias: true  });
renderer.setSize(300, 300);

scene.background = null;

const loader = new GLTFLoader();
loader.load('models/player.gltf', function (gltf) {
const model = gltf.scene;
scene.add(model);
renderer.render(scene, camera);
});