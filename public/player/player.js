import * as THREE from 'https://cdn.skypack.dev/three@v0.132.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@v0.132.0/examples/jsm/loaders/GLTFLoader.js';

const colors = [
    {
        "a": 1,
        "b": 1,
        "g": 1,
        "r": 1
    },
    {
        "a": 1,
        "b": 0.9,
        "g": 0.9,
        "r": 0.9
    },
    {
        "a": 1,
        "b": 0.8,
        "g": 0.8,
        "r": 0.8
    },
    {
        "a": 1,
        "b": 0.7,
        "g": 0.7,
        "r": 0.7
    },
    {
        "a": 1,
        "b": 0.6,
        "g": 0.6,
        "r": 0.6
    },
    {
        "a": 1,
        "b": 0.5,
        "g": 0.5,
        "r": 0.5
    },
    {
        "a": 1,
        "b": 0.39999998,
        "g": 0.39999998,
        "r": 0.39999998
    },
    {
        "a": 1,
        "b": 0.3,
        "g": 0.3,
        "r": 0.3
    },
    {
        "a": 1,
        "b": 0.19999999,
        "g": 0.19999999,
        "r": 0.19999999
    },
    {
        "a": 1,
        "b": 0.100000024,
        "g": 0.100000024,
        "r": 0.100000024
    },
    {
        "a": 1,
        "b": 0.16666667,
        "g": 0.16666667
    },
    {
        "a": 1,
        "b": 0.16666667,
        "g": 0.06666666
    },
    {
        "a": 1,
        "b": 0.16666667,
        "r": 0.033333343
    },
    {
        "a": 1,
        "b": 0.16666667,
        "r": 0.13333336
    },
    {
        "a": 1,
        "b": 0.09999999,
        "r": 0.16666667
    },
    {
        "a": 1,
        "r": 0.16666667
    },
    {
        "a": 1,
        "g": 0.100000024,
        "r": 0.16666667
    },
    {
        "a": 1,
        "g": 0.16666667,
        "r": 0.1333333
    },
    {
        "a": 1,
        "g": 0.16666667,
        "r": 0.0333333
    },
    {
        "a": 1,
        "b": 0.0666666,
        "g": 0.16666667
    },
    {
        "a": 1,
        "b": 0.33333334,
        "g": 0.33333334
    },
    {
        "a": 1,
        "b": 0.33333334,
        "g": 0.13333333
    },
    {
        "a": 1,
        "b": 0.33333334,
        "r": 0.066666685
    },
    {
        "a": 1,
        "b": 0.33333334,
        "r": 0.2666667
    },
    {
        "a": 1,
        "b": 0.19999997,
        "r": 0.33333334
    },
    {
        "a": 1,
        "r": 0.33333334
    },
    {
        "a": 1,
        "g": 0.20000005,
        "r": 0.33333334
    },
    {
        "a": 1,
        "g": 0.33333334,
        "r": 0.2666666
    },
    {
        "a": 1,
        "g": 0.33333334,
        "r": 0.0666666
    },
    {
        "a": 1,
        "b": 0.1333332,
        "g": 0.33333334
    },
    {
        "a": 1,
        "b": 0.5,
        "g": 0.5
    },
    {
        "a": 1,
        "b": 0.5,
        "g": 0.19999999
    },
    {
        "a": 1,
        "b": 0.5,
        "r": 0.100000024
    },
    {
        "a": 1,
        "b": 0.5,
        "r": 0.40000004
    },
    {
        "a": 1,
        "b": 0.29999995,
        "r": 0.5
    },
    {
        "a": 1,
        "r": 0.5
    },
    {
        "a": 1,
        "g": 0.30000007,
        "r": 0.5
    },
    {
        "a": 1,
        "g": 0.5,
        "r": 0.39999986
    },
    {
        "a": 1,
        "g": 0.5,
        "r": 0.099999905
    },
    {
        "a": 1,
        "b": 0.19999981,
        "g": 0.5
    },
    {
        "a": 1,
        "b": 0.6666667,
        "g": 0.6666667
    },
    {
        "a": 1,
        "b": 0.6666667,
        "g": 0.26666665
    },
    {
        "a": 1,
        "b": 0.6666667,
        "r": 0.13333337
    },
    {
        "a": 1,
        "b": 0.6666667,
        "r": 0.5333334
    },
    {
        "a": 1,
        "b": 0.39999995,
        "r": 0.6666667
    },
    {
        "a": 1,
        "r": 0.6666667
    },
    {
        "a": 1,
        "g": 0.4000001,
        "r": 0.6666667
    },
    {
        "a": 1,
        "g": 0.6666667,
        "r": 0.5333332
    },
    {
        "a": 1,
        "g": 0.6666667,
        "r": 0.1333332
    },
    {
        "a": 1,
        "b": 0.2666664,
        "g": 0.6666667
    },
    {
        "a": 1,
        "b": 0.8333333,
        "g": 0.8333333
    },
    {
        "a": 1,
        "b": 0.8333333,
        "g": 0.3333333
    },
    {
        "a": 1,
        "b": 0.8333333,
        "r": 0.1666667
    },
    {
        "a": 1,
        "b": 0.8333333,
        "r": 0.6666667
    },
    {
        "a": 1,
        "b": 0.4999999,
        "r": 0.8333333
    },
    {
        "a": 1,
        "r": 0.8333333
    },
    {
        "a": 1,
        "g": 0.5000001,
        "r": 0.8333333
    },
    {
        "a": 1,
        "g": 0.8333333,
        "r": 0.6666664
    },
    {
        "a": 1,
        "g": 0.8333333,
        "r": 0.16666651
    },
    {
        "a": 1,
        "b": 0.33333302,
        "g": 0.8333333
    },
    {
        "a": 1,
        "b": 1,
        "g": 1,
        "r": 0.19999999
    },
    {
        "a": 1,
        "b": 1,
        "g": 0.52,
        "r": 0.19999999
    },
    {
        "a": 1,
        "b": 1,
        "g": 0.19999999,
        "r": 0.36
    },
    {
        "a": 1,
        "b": 1,
        "g": 0.19999999,
        "r": 0.84000003
    },
    {
        "a": 1,
        "b": 0.67999995,
        "g": 0.19999999,
        "r": 1
    },
    {
        "a": 1,
        "b": 0.19999999,
        "g": 0.19999999,
        "r": 1
    },
    {
        "a": 1,
        "b": 0.19999999,
        "g": 0.68000007,
        "r": 1
    },
    {
        "a": 1,
        "b": 0.19999999,
        "g": 1,
        "r": 0.8399998
    },
    {
        "a": 1,
        "b": 0.19999999,
        "g": 1,
        "r": 0.35999984
    },
    {
        "a": 1,
        "b": 0.5199997,
        "g": 1,
        "r": 0.19999999
    },
    {
        "a": 1,
        "b": 1,
        "g": 1,
        "r": 0.39999998
    },
    {
        "a": 1,
        "b": 1,
        "g": 0.64,
        "r": 0.39999998
    },
    {
        "a": 1,
        "b": 1,
        "g": 0.39999998,
        "r": 0.52
    },
    {
        "a": 1,
        "b": 1,
        "g": 0.39999998,
        "r": 0.88000005
    },
    {
        "a": 1,
        "b": 0.67999995,
        "g": 0.19999999,
        "r": 1
    },
    {
        "a": 1,
        "b": 0.39999998,
        "g": 0.39999998,
        "r": 1
    },
    {
        "a": 1,
        "b": 0.39999998,
        "g": 0.7600001,
        "r": 1
    },
    {
        "a": 1,
        "b": 0.39999998,
        "g": 1,
        "r": 0.8799998
    },
    {
        "a": 1,
        "b": 0.39999998,
        "g": 1,
        "r": 0.51999986
    },
    {
        "a": 1,
        "b": 0.63999975,
        "g": 1,
        "r": 0.39999998
    },
    {
        "a": 1,
        "b": 1,
        "g": 1,
        "r": 0.6
    },
    {
        "a": 1,
        "b": 1,
        "g": 0.76,
        "r": 0.6
    },
    {
        "a": 1,
        "b": 1,
        "g": 0.6,
        "r": 0.68000007
    },
    {
        "a": 1,
        "b": 1,
        "g": 0.6,
        "r": 0.92
    },
    {
        "a": 1,
        "b": 0.75999993,
        "g": 0.39999998,
        "r": 1
    },
    {
        "a": 1,
        "b": 0.6,
        "g": 0.6,
        "r": 1
    },
    {
        "a": 1,
        "b": 0.6,
        "g": 0.84000003,
        "r": 1
    },
    {
        "a": 1,
        "b": 0.6,
        "g": 1,
        "r": 0.9199999
    },
    {
        "a": 1,
        "b": 0.6,
        "g": 1,
        "r": 0.67999995
    },
    {
        "a": 1,
        "b": 0.7599999,
        "g": 1,
        "r": 0.6
    },
    {
        "a": 1,
        "b": 1,
        "g": 1,
        "r": 0.8
    },
    {
        "a": 1,
        "b": 1,
        "g": 0.88,
        "r": 0.8
    },
    {
        "a": 1,
        "b": 1,
        "g": 0.8,
        "r": 0.84000003
    },
    {
        "a": 1,
        "b": 1,
        "g": 0.8,
        "r": 0.96000004
    },
    {
        "a": 1,
        "b": 0.91999996,
        "g": 0.8,
        "r": 1
    },
    {
        "a": 1,
        "b": 0.8,
        "g": 0.8,
        "r": 1
    },
    {
        "a": 1,
        "b": 0.8,
        "g": 0.92,
        "r": 1
    },
    {
        "a": 1,
        "b": 0.8,
        "g": 1,
        "r": 0.9599999
    },
    {
        "a": 1,
        "b": 0.8,
        "g": 1,
        "r": 0.84
    },
    {
        "a": 1,
        "b": 0.87999994,
        "g": 1,
        "r": 0.8
    }
];
colors.forEach((color) => {
    var picker = document.getElementById('color-picker');
    var colorElement = document.createElement('div');
    colorElement.style.backgroundColor = `rgb(${(color.r ? color.r : 0) * 255}, ${(color.g ? color.g : 0) * 255}, ${(color.b ? color.b : 0) * 255})`;
    picker.appendChild(colorElement);
});


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

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('.player-model'), alpha: true, transparent: true });
renderer.setSize(300, 300);

scene.background = null;

const loader = new GLTFLoader();
loader.load('models/player.gltf', function (gltf) {
const model = gltf.scene;
scene.add(model);
renderer.render(scene, camera);
});