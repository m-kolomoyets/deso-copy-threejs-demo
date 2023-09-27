// ! === IMPORTS ===

import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader';
import { MTLLoader } from 'three/addons/loaders/MTLLoader';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import vertexParticles from './shaders/vertexParticles.glsl';
import fragmentParticles from './shaders/particlesFragment.glsl';


// ! === PLUGINS CONFIGS  ===

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.defaults({
  immediateRender: false,
  ease: "power1.inOut",
  scrub: true
});


// ! === GLOBAL VARIABLES ===

const clock = new THREE.Clock();

const mouse = new THREE.Vector2();
const target = new THREE.Vector2();
const windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);

const faceGroup = new THREE.Group();
const gearGroup = new THREE.Group();

const loadingManager = new THREE.LoadingManager();

const objLoader = new OBJLoader(loadingManager);
const mtlLoader = new MTLLoader(loadingManager);
const textureLoader = new THREE.TextureLoader(loadingManager);
const dracoLoader = new DRACOLoader(loadingManager);
const gltfLoader = new GLTFLoader(loadingManager);

dracoLoader.setDecoderConfig({ type: 'js' });
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

gltfLoader.setDRACOLoader(dracoLoader);

const FACE_CONTAINER = document.getElementById('face-canvas');
const SQUARES_CONTAINER = document.getElementById('squares-canvas');
const LANDSCAPE_CONTAINER = document.getElementById('landscape-canvas');

const faceScene = new THREE.Scene();
const squaresScene = new THREE.Scene();
const landscapeScene = new THREE.Scene();

const faceCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const squaresCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const landscapeCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

const faceRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
const squaresRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
const landscapeRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

const MERCEDES_INITIAL_POSITION = { x: 5500, y: 1000, z: 2 };
const MERCEDES_INITIAL_SCALE = 100;

const GEAR_INITIAL_POSITION = { x: -400, y: 100, z: 3 };
const GEAR_INITIAL_SCALE = 20;

const SQUARE_SIZE = 1;
const RECTANGLE_HEIGHT = 7;
const RECTANGLE_LONG_ROW_LENGTH = 5;
const RECTANGLE_ROWS_AMOUNT = 20;

let faceTimeline = gsap.timeline();
let squaresTimeline = gsap.timeline();
let landscapeTimeline = gsap.timeline();


// ! === EVENT LISTENERS ===

const onLandscapeSceneMouseMove = (event) => {
  landscapeScenePointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  landscapeScenePointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

const onLandscapeSceneCLick = (event) => {
  landscapeSceneRaycaster.setFromCamera(landscapeScenePointer, landscapeCamera);
  const intersects = landscapeSceneRaycaster.intersectObjects(landscapeScene.children);

  if (intersects.length > 0) {
    console.log(intersects[0].object);

    if (intersects[0].object.name === 'Gear1') {

      gsap.to(intersects[0].object.rotation, {
        z: intersects[0].object.rotation.z + Math.PI * 2, duration: 1, ease: "power1.inOut",
      })
    }
  }
}

window.addEventListener('resize', () => {
  composer.setSize(window.innerWidth, window.innerHeight);
  faceRenderer.setSize(window.innerWidth, window.innerHeight);
  faceCamera.aspect = window.innerWidth / window.innerHeight;
  faceCamera.updateProjectionMatrix();

  squaresRenderer.setSize(window.innerWidth, window.innerHeight);
  squaresCamera.aspect = window.innerWidth / window.innerHeight;
  squaresCamera.updateProjectionMatrix();

  landscapeRenderer.setSize(window.innerWidth, window.innerHeight);
  landscapeCamera.aspect = window.innerWidth / window.innerHeight;
  landscapeCamera.updateProjectionMatrix();
});

window.addEventListener('mousemove', (event) => {
  mouse.x = event.clientX - windowHalf.x;
  mouse.y = event.clientY - windowHalf.y;
});

LANDSCAPE_CONTAINER.addEventListener('mousemove', onLandscapeSceneMouseMove);
LANDSCAPE_CONTAINER.addEventListener('click', onLandscapeSceneCLick);


loadingManager.onStart = (url, item, total) => {
  const loader = document.getElementById('loader');

  loader.style.zIndex = 99999;

  console.log('started loading:', url);
}

loadingManager.onProgress = (url, loaded, total) => {
  console.log('loading file:', url);
  console.log('loaded:', loaded, 'total:', total);

  const percentLoaded = Math.round(loaded / total * 100);

  const loaderIndicator = document.querySelector('.counter__percent');

  if (loaderIndicator) {
    loaderIndicator.textContent = percentLoaded;
  }
}


loadingManager.onLoad = () => {
  console.log('loaded all resources');

  gsap.to('.counter__percent', {
    delay: 1,
    duration: 0.3,
    opacity: 0
  });

  gsap.to('.loader__bar', {
    duration: 1.5,
    delay: 0.5,
    height: 0,
    stagger: {
      amount: 0.5
    },
    ease: 'power4.inOut'
  });

  gsap.to('#loader', {
    delay: 3,
    duration: 0,
    zIndex: -1
  });

}

// ! === ANIMATIONS FUNCTIONS ===

// FACE ANIMATION start
const setFaceScrollAnimation = (face) => {
  faceTimeline.to(face.rotation, {
    y: Math.PI / 2, x: -Math.PI / 3, scrollTrigger: {
      trigger: "#face-section .section.n_1",
      endTrigger: "#face-section .section.n_5",
      end: "top bottom",
    }
  }).to(face.position, {
    z: -2, y: -2, x: -3, scrollTrigger: {
      trigger: "#face-section .section.n_1",
      endTrigger: "#face-section .section.n_3",
      end: "top bottom",
    }
  });
}
// FACE ANIMATION end

// ! === OBJECTS LOADERS ===

// MERCEDES LOAD start
const mercedesObject = await gltfLoader.loadAsync('objects/mercedes/mercedes.glb');

mercedesObject.scene.position.set(MERCEDES_INITIAL_POSITION.x, MERCEDES_INITIAL_POSITION.y, MERCEDES_INITIAL_POSITION.z);
mercedesObject.scene.scale.set(MERCEDES_INITIAL_SCALE, MERCEDES_INITIAL_SCALE, MERCEDES_INITIAL_SCALE);
mercedesObject.scene.rotation.set(Math.PI / 2, Math.PI / -2, 0);
mercedesObject.scene.receiveShadow = true;
mercedesObject.scene.castShadow = true;

mercedesObject.scene.traverse((node) => {
  if (node.isMesh) { node.castShadow = true; node.receiveShadow = true; }
});

landscapeScene.add(mercedesObject.scene);
// landscapeRenderer.render(landscapeScene, landscapeCamera);

landscapeTimeline.to(mercedesObject.scene.position, {
  x: -1000, scrollTrigger: {
    trigger: "#landscape-section .section.n_3",
    endTrigger: "#landscape-section .section.n_10",
    end: "top bottom",
    ease: "power1.inOut",
  }
});
// MERCEDES LOAD end

// GEAR LOAD start
const gearObject = await gltfLoader.loadAsync('objects/gear/gear.gltf');

gearObject.scene.scale.set(GEAR_INITIAL_SCALE, GEAR_INITIAL_SCALE, GEAR_INITIAL_SCALE);
gearObject.scene.rotation.set(Math.PI / 2, Math.PI / -4, 0);
gearObject.scene.receiveShadow = true;
gearObject.scene.castShadow = true;

gearObject.scene.traverse((node) => {
  if (node.isMesh) { node.castShadow = true; }
});

gearGroup.add(gearObject.scene);
landscapeScene.add(gearGroup);
// landscapeRenderer.render(landscapeScene, landscapeCamera);

landscapeTimeline.to(gearGroup.rotation, {
  z: Math.PI / 2, scrollTrigger: {
    trigger: "#landscape-section .section.n_3",
    endTrigger: "#landscape-section .section.n_10",
    end: "top bottom",
  }
});

gearGroup.position.set(GEAR_INITIAL_POSITION.x, GEAR_INITIAL_POSITION.y, GEAR_INITIAL_POSITION.z);
// GEAR LOAD end

// FACE LOAD start
const faceMaterials = await mtlLoader.loadAsync('objects/face/face.mtl');

faceMaterials.preload();
objLoader.setMaterials(faceMaterials);

const faceObject = await objLoader.loadAsync('objects/face/face.obj');

faceGroup.add(faceObject);
faceScene.add(faceGroup);

faceObject.rotation.set(Math.PI / 4, -Math.PI / 2 - 0.4, Math.PI / 5);
faceGroup.position.set(-1, -0.5, 0);

setFaceScrollAnimation(faceObject);
// FACE LOAD end

// DNA PARTICLES start
const particlesShaderMaterial = new THREE.ShaderMaterial({
  extensions: {
    derivatives: '#extension GL_OES_standard_derivatives : enable'
  },
  side: THREE.DoubleSide,
  uniforms: {
    time: { value: 0 },
    resolution: { value: new THREE.Vector4() },
    uColor1: { value: new THREE.Color(0x0D98FF) },
    uColor2: { value: new THREE.Color(0xaa00cc) },
    uColor3: { value: new THREE.Color(0x0D98BA) },
    uvRate1: {
      value: new THREE.Vector2(1, 1)
    }
  },
  transparent: true,
  vertexShader: vertexParticles,
  fragmentShader: fragmentParticles,
  depthTest: false,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});

const dna = await gltfLoader.loadAsync('objects/dna/dna.glb');
const dnaGeometry = dna.scene.children[0].geometry;
dnaGeometry.center();

const dnaGeometryNumber = dnaGeometry.attributes.position.array.length / 3;

const randoms = new Float32Array(dnaGeometryNumber);
const colorRandoms = new Float32Array(dnaGeometryNumber);

for (let i = 0; i < dnaGeometryNumber; i++) {
  randoms.set([Math.random()], i);
  colorRandoms.set([Math.random()], i);
}

dnaGeometry.setAttribute('randoms', new THREE.BufferAttribute(randoms, 1));
dnaGeometry.setAttribute('colorRandoms', new THREE.BufferAttribute(colorRandoms, 1));

const particlesPlane = new THREE.Points(dnaGeometry, particlesShaderMaterial);

particlesPlane.position.set(4.5, -2, -1);
// particlesPlane.rotateZ(Math.PI / 5);
faceScene.add(particlesPlane);

const particlesRenderScene = new RenderPass(faceScene, faceCamera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.8);
const composer = new EffectComposer(faceRenderer);
composer.setSize(window.innerWidth, window.innerHeight);
composer.addPass(particlesRenderScene);
composer.addPass(bloomPass);

// DNA PARTICLES  end

// ALL SCREEN PARTICLES start
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 50_000;

const particlesPositions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i += 3) {
  particlesPositions[i] = (Math.random() - 0.5) * 400;
  particlesPositions[i + 1] = (Math.random() - 0.5) * 400;
  particlesPositions[i + 2] = -50;

}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3));

const crossMap = await textureLoader.loadAsync('/textures/cross.png');

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.15,
  color: 0x515151,
  transparent: true,
  blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
faceScene.add(particlesMesh);



// ALL SCREEN PARTICLES end

// const controls = new OrbitControls(landscapeCamera, landscapeRenderer.domElement);

//! === RENDEREDS OPTIONS ===

faceRenderer.setSize(window.innerWidth, window.innerHeight);
faceRenderer.setPixelRatio(window.devicePixelRatio);

squaresRenderer.setSize(window.innerWidth, window.innerHeight);
squaresRenderer.setPixelRatio(window.devicePixelRatio);

landscapeRenderer.setSize(window.innerWidth, window.innerHeight);
landscapeRenderer.setPixelRatio(window.devicePixelRatio);
landscapeRenderer.shadowMap.enabled = true;
landscapeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

const landscapeScenePointer = new THREE.Vector2();
const landscapeSceneRaycaster = new THREE.Raycaster();

FACE_CONTAINER.appendChild(faceRenderer.domElement);
SQUARES_CONTAINER.appendChild(squaresRenderer.domElement);
LANDSCAPE_CONTAINER.appendChild(landscapeRenderer.domElement);
// FACE SCENE start

const facesSceneLight = new THREE.DirectionalLight(0xfff0dd, 1);
const faceSceneLightHelper = new THREE.DirectionalLightHelper(facesSceneLight, 5);
facesSceneLight.position.set(0, 4, 7);

faceCamera.position.z = 5;

faceScene.add(facesSceneLight);
faceScene.add(faceSceneLightHelper);

// renderFace();
// FACE SCENE end

// SQUARES SCENE start
const getCubeLinesPositions = (index) => {
  const z = (index + 1) * -3;

  return [
    {
      width: 12,
      height: 0.1,
      depth: 0.1,
      rotation: [0, 0, 0],
      coords: [0, (RECTANGLE_HEIGHT / 2), z],
    },
    {
      width: 6,
      height: 0.1,
      depth: 0.1,
      rotation: [0, 0, Math.PI / 2],
      coords: [-6, 0, z]
    },
    {
      width: 12,
      height: 0.1,
      depth: 0.1,
      rotation: [0, 0, 0],
      coords: [0.5, -(RECTANGLE_HEIGHT / 2), z],
    }, {
      width: 6,
      height: 0.1,
      depth: 0.1,
      rotation: [0, 0, Math.PI / 2],
      coords: [6, 0, z]
    }
  ];
}

const getCubesRowPositions = (index) => {
  const z = (index + 1) * -3;

  const longRowXPositions = [
    -6,
    -3,
    -0,
    3,
    6
  ];

  const upRowYPositions = new Array(RECTANGLE_LONG_ROW_LENGTH).fill(0).map(() => {
    return (RECTANGLE_HEIGHT / 2);
  });

  const bottomRowYPositions = new Array(RECTANGLE_LONG_ROW_LENGTH).fill(0).map(() => {
    return -(RECTANGLE_HEIGHT / 2);
  });

  const upRowCoordinates = new Array(RECTANGLE_LONG_ROW_LENGTH).fill(0).map((_, index) => {
    return [
      longRowXPositions[index],
      upRowYPositions[index],
      z
    ]
  });

  const bottomRowCoordinates = new Array(RECTANGLE_LONG_ROW_LENGTH).fill(0).map((_, index) => {
    return [
      longRowXPositions[index],
      bottomRowYPositions[index],
      z
    ]
  });

  const middleRowCoordinates = [
    [
      longRowXPositions[0],
      0,
      z
    ],
    [
      longRowXPositions[longRowXPositions.length - 1],
      0,
      z
    ]
  ];

  return [
    ...upRowCoordinates,
    ...middleRowCoordinates,
    ...bottomRowCoordinates
  ]
}

const renderCubeLine = () => {
  Array.from({ length: RECTANGLE_ROWS_AMOUNT }).forEach((_, index) => {
    const cubesRowPositions = getCubesRowPositions(index);
    const cubesRowLinesPositions = getCubeLinesPositions(index);

    cubesRowPositions.forEach((position) => {
      const geometry = new THREE.BoxGeometry(SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
      const material = new THREE.MeshPhysicalMaterial({
        roughness: 0,
        metalness: 1,
        reflectivity: 1
      });

      const cube = new THREE.Mesh(geometry, material);

      cube.castShadow = true;
      cube.receiveShadow = true;

      cube.position.set(...position);

      squaresScene.add(cube);
    });


    cubesRowLinesPositions.forEach(({ width, height, depth, coords, rotation }) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        new THREE.MeshPhysicalMaterial({
          roughness: 0,
          metalness: 1,
          reflectivity: 1
        })
      );

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      mesh.position.set(...coords);

      mesh.rotation.set(...rotation);

      squaresScene.add(mesh);
    });


  });
}

// SQUARES ANIMATION start
squaresTimeline.to(squaresCamera.rotation, {
  x: 0, y: 0, z: 0, scrollTrigger: {
    trigger: "#squares-section .section.n_1",
    endTrigger: "#squares-section .section.n_3",
    end: "top bottom",
  }
}).to(squaresCamera.position, {
  z: -60, scrollTrigger: {
    trigger: "#squares-section .section.n_1",
    endTrigger: "#squares-section .section.n_10",
    end: "top bottom",
  }
}).to(squaresCamera.position, {
  x: -3, scrollTrigger: {
    trigger: "#squares-section .section.n_2",
    endTrigger: "#squares-section .section.n_3",
    end: "top bottom",
  }
}).to(squaresCamera.position, {
  x: 3, scrollTrigger: {
    trigger: "#squares-section .section.n_4",
    endTrigger: "#squares-section .section.n_5",
    end: "top bottom",
  }
}).to(squaresCamera.rotation, {
  z: -Math.PI / 2, scrollTrigger: {
    trigger: "#squares-section .section.n_4",
    endTrigger: "#squares-section .section.n_8",
    end: "top bottom",
  }
});

squaresTimeline.to(document.getElementById('squares-canvas'), {
  backgroundColor: '#0F5193', scrollTrigger: {
    trigger: "#squares-section .section.n_9",
    endTrigger: "#squares-section .section.n_10",
    end: "top bottom",
  }
})
// SQUARES ANIMATION end

squaresCamera.position.z = 100;
squaresCamera.position.x = -3;
squaresCamera.rotation.set(1, -2, -4.5);

const squaresSceneLight = new THREE.DirectionalLight(0xfff0dd, 1);
const squaresSceneLightHelper = new THREE.DirectionalLightHelper(squaresSceneLight);
squaresSceneLight.translateZ(100);
squaresSceneLight.rotateX(Math.PI / 4);
squaresSceneLight.scale.set(10, 10, 10);


squaresSceneLight.shadow.mapSize.width = 1000;
squaresSceneLight.shadow.mapSize.height = 1000;
squaresSceneLight.shadow.camera.near = 1000;
squaresSceneLight.shadow.camera.far = 2000;
squaresSceneLight.shadow.bias = -0.0005;
squaresSceneLight.shadow.penumbra = 1;
squaresSceneLight.shadow.focus = 1000;
squaresSceneLight.intensity = 700;
squaresSceneLight.castShadow = true;
squaresScene.add(squaresSceneLight);
squaresScene.add(squaresSceneLightHelper);

renderCubeLine();
// SQUARES SCENE end

const renderGround = () => {
  const planeGeometry = new THREE.PlaneGeometry(20000, 5000);
  const texture = textureLoader.load('textures/landscape/ground.png');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(250, 250);

  const planeMaterial = new THREE.MeshPhysicalMaterial({ map: texture, color: 0xffffff, dithering: true, side: THREE.FrontSide });

  const plane = new THREE.Mesh(planeGeometry, planeMaterial);

  plane.receiveShadow = true;
  plane.castShadow = true;
  plane.position.set(0, 1000, 0);

  landscapeScene.add(plane);
}

const renderSun = () => {
  const ambientLight = new THREE.AmbientLight(0xffffff, 2);
  landscapeScene.add(ambientLight);

  const landscapeSceneLight = new THREE.DirectionalLight(0xffffff, 0.8);
  const landscapeSceneLightHelper = new THREE.DirectionalLightHelper(landscapeSceneLight);

  landscapeSceneLight.castShadow = true;
  landscapeSceneLight.shadow.bias = -0.0005;
  landscapeSceneLight.shadow.penumbra = 1;
  landscapeSceneLight.shadow.mapSize.width = 1024;
  landscapeSceneLight.shadow.mapSize.height = 2014;
  landscapeSceneLight.shadow.camera.near = 1000;
  landscapeSceneLight.shadow.camera.far = 10000;

  // const lightTarget = new THREE.Object3D();

  // landscapeScene.add(lightTarget);
  // lightTarget.position.set(0, 0, 0);

  // spotLight.target = lightTarget;
  landscapeSceneLight.position.set(0, 7500, 500);

  landscapeScene.add(landscapeSceneLight);
  landscapeScene.add(landscapeSceneLightHelper);

  return landscapeSceneLight;
}

landscapeCamera.position.z = 2500;
landscapeCamera.position.y = -1700;
landscapeCamera.rotation.x = Math.PI;

const landScapeSun = renderSun();
renderGround();

landscapeTimeline.to(landscapeCamera.rotation, {
  x: Math.PI / 2, scrollTrigger: {
    trigger: "#landscape-section .section.n_1",
    endTrigger: "#landscape-section .section.n_3",
    end: "top bottom",
  }
})
  .to(landscapeCamera.position, {
    z: 300, scrollTrigger: {
      trigger: "#landscape-section .section.n_1",
      endTrigger: "#landscape-section .section.n_3",
      end: "top bottom",
    }
  }).
  to(landscapeCamera.position, {
    y: 0, scrollTrigger: {
      trigger: "#landscape-section .section.n_3",
      endTrigger: "#landscape-section .section.n_8",
      end: "top bottom",
    }
  }).to(landscapeCamera.rotation, {
    x: Math.PI / 2, scrollTrigger: {
      trigger: "#landscape-section .section.n_4",
      endTrigger: "#landscape-section .section.n_8",
      end: "top bottom",
    }
  })

// LANDSCAPE SCENE end

// GLOBAL ANIMATE start
function animate() {
  requestAnimationFrame(animate);

  // faceRenderer.render(faceScene, faceCamera);
  squaresRenderer.render(squaresScene, squaresCamera);
  landscapeRenderer.render(landscapeScene, landscapeCamera);
  composer.render();

  target.x = (1 - mouse.x) * 0.0001;
  target.y = (1 - mouse.y) * 0.0001;

  squaresSceneLight.position.z = squaresCamera.position.z + 150;

  faceGroup.position.y = Math.cos(clock.getElapsedTime() / 2) / 4;

  faceCamera.rotation.x += 0.05 * (target.y - faceCamera.rotation.x);
  faceCamera.rotation.y += 0.05 * (target.x - faceCamera.rotation.y);

  particlesPlane.rotation.y -= 0.001;

  squaresCamera.rotation.x += 0.05 * (target.y - squaresCamera.rotation.x);

  landScapeSun.shadow.camera.updateProjectionMatrix();

  gearGroup.position.z = Math.cos(clock.getElapsedTime()) * 20 + 100;

  particlesMesh.rotation.y += 0.1 * (target.x - faceCamera.rotation.y);
  particlesMesh.rotation.x += 0.1 * (target.y - faceCamera.rotation.x);

  // controls.update();
}

animate();
// GLOBAL ANIMATE end