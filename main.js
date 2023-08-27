import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader';
import { MTLLoader } from 'three/addons/loaders/MTLLoader';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.defaults({
  immediateRender: false,
  ease: "power1.inOut",
  scrub: true
});

let faceTimeline = gsap.timeline();
let squaresTimeline = gsap.timeline();
let landscapeTimeline = gsap.timeline();

const clock = new THREE.Clock();

const mouse = new THREE.Vector2();
const target = new THREE.Vector2();
const windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);

const SQUARE_SIZE = 1;
const RECTANGLE_HEIGHT = 7;
const RECTANGLE_LONG_ROW_LENGTH = 5;
const RECTANGLE_ROWS_AMOUNT = 20;

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

// const controls = new OrbitControls(landscapeCamera, landscapeRenderer.domElement);

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

// FACE SCENE start


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
const faceGroup = new THREE.Group();

const renderFace = () => {
  const mtlLoader = new MTLLoader();

  mtlLoader.load('objects/face/face.mtl', (materials) => {
    materials.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);

    objLoader.load('objects/face/face.obj', (face) => {

      faceGroup.add(face);
      faceScene.add(faceGroup);

      face.rotation.set(Math.PI / 4, -Math.PI / 2 - 0.4, Math.PI / 5);
      faceGroup.position.set(-1, -0.5, 0);

      setFaceScrollAnimation(face);
    });
  });
}

const facesSceneLight = new THREE.DirectionalLight(0xfff0dd, 1);
const faceSceneLightHelper = new THREE.DirectionalLightHelper(facesSceneLight, 5);
facesSceneLight.position.set(0, 4, 7);

faceCamera.position.z = 5;

faceScene.add(facesSceneLight);
faceScene.add(faceSceneLightHelper);

renderFace();
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

// LANDSCAPE SCENE start
const renderMercedes = (startPosition, scale) => {
  const loader = new GLTFLoader();

  loader.load('objects/mercedes/mercedes.glb', (mercedes) => {
    mercedes.scene.position.set(startPosition.x, startPosition.y, startPosition.z);
    mercedes.scene.scale.set(scale, scale, scale);
    mercedes.scene.rotation.set(Math.PI / 2, Math.PI / -2, 0);
    mercedes.scene.receiveShadow = true;
    mercedes.scene.castShadow = true;

    mercedes.scene.traverse((node) => {
      if (node.isMesh) { node.castShadow = true; }
    });

    landscapeScene.add(mercedes.scene);

    landscapeTimeline.to(mercedes.scene.position, {
      x: -1000, scrollTrigger: {
        trigger: "#landscape-section .section.n_3",
        endTrigger: "#landscape-section .section.n_10",
        end: "top bottom",
        ease: "power1.inOut",
      }
    });
  }, undefined, function (error) {
    console.error(error);
  });
}


const gearGroup = new THREE.Group();

const renderGear = (startPosition, scale) => {
  const loader = new GLTFLoader();

  loader.load('objects/gear/gear.gltf', (gear) => {
    gear.scene.scale.set(scale, scale, scale);
    gear.scene.rotation.set(Math.PI / 2, Math.PI / -4, 0);
    gear.scene.receiveShadow = true;
    gear.scene.castShadow = true;

    gear.scene.traverse((node) => {
      if (node.isMesh) { node.castShadow = true; }
    });

    gearGroup.add(gear.scene);
    landscapeScene.add(gearGroup);

    landscapeTimeline.to(gearGroup.rotation, {
      z: Math.PI / 2, scrollTrigger: {
        trigger: "#landscape-section .section.n_3",
        endTrigger: "#landscape-section .section.n_10",
        end: "top bottom",
      }
    });

    gearGroup.position.set(startPosition.x, startPosition.y, startPosition.z);
  }, undefined, function (error) {
    console.error(error);
  });
}

const renderGround = () => {
  const planeGeometry = new THREE.PlaneGeometry(20000, 5000);
  const texture = new THREE.TextureLoader().load('textures/landscape/ground.png');
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

  const spotLight = new THREE.DirectionalLight(0xffffff, 7);
  const spotLightHelper = new THREE.DirectionalLightHelper(spotLight);

  spotLight.castShadow = true;
  spotLight.shadow.bias = -0.0005;
  spotLight.shadow.penumbra = 1;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 2014;
  spotLight.shadow.camera.near = 1000;
  spotLight.shadow.camera.far = 10000;

  // const lightTarget = new THREE.Object3D();

  // landscapeScene.add(lightTarget);
  // lightTarget.position.set(0, 0, 0);

  // spotLight.target = lightTarget;
  spotLight.position.set(0, 7500, 500);

  landscapeScene.add(spotLight);
  landscapeScene.add(spotLightHelper);

  return spotLight;
}

landscapeCamera.position.z = 2500;
landscapeCamera.position.y = -1700;
landscapeCamera.rotation.x = Math.PI;

const landScapeSun = renderSun();
renderGround();
renderMercedes({ x: 5500, y: 1000, z: 2 }, 100);
renderGear({ x: -400, y: 100, z: 3 }, 20);

landscapeTimeline.to(landscapeCamera.rotation, {
  x: Math.PI / 3, scrollTrigger: {
    trigger: "#landscape-section .section.n_1",
    endTrigger: "#landscape-section .section.n_3",
    end: "top bottom",
  }
}).to(landscapeCamera.position, {
  z: 800, scrollTrigger: {
    trigger: "#landscape-section .section.n_1",
    endTrigger: "#landscape-section .section.n_3",
    end: "top bottom",
  }
}).to(landscapeCamera.position, {
  y: 0, z: 250, scrollTrigger: {
    trigger: "#landscape-section .section.n_4",
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

  faceRenderer.render(faceScene, faceCamera);
  squaresRenderer.render(squaresScene, squaresCamera);
  landscapeRenderer.render(landscapeScene, landscapeCamera);

  target.x = (1 - mouse.x) * 0.0001;
  target.y = (1 - mouse.y) * 0.0001;

  squaresSceneLight.position.z = squaresCamera.position.z + 150;

  faceGroup.position.y = Math.cos(clock.getElapsedTime() / 2) / 4;

  faceCamera.rotation.x += 0.05 * (target.y - faceCamera.rotation.x);
  faceCamera.rotation.y += 0.05 * (target.x - faceCamera.rotation.y);

  squaresCamera.rotation.x += 0.05 * (target.y - squaresCamera.rotation.x);

  landScapeSun.shadow.camera.updateProjectionMatrix();

  gearGroup.position.z = Math.cos(clock.getElapsedTime()) * 20 + 100;

  // controls.update();
}

animate();
// GLOBAL ANIMATE end