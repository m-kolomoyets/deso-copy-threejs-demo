import * as THREE from 'three';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.defaults({
  immediateRender: false,
  ease: "power1.inOut",
  scrub: true
});

let squares_anim = gsap.timeline()


const SQUARE_SIZE = 1;
const RECTANGLE_HEIGHT = 7;
const RECTANGLE_LONG_ROW_LENGTH = 5;
const RECTANGLE_ROWS_AMOUNT = 20;

const container = document.getElementById('squares-canvas');

console.log(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

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
      const material = new THREE.MeshNormalMaterial();
      const cube = new THREE.Mesh(geometry, material);

      cube.position.set(...position);

      scene.add(cube);
    });

    cubesRowLinesPositions.forEach(({ width, height, depth, coords, rotation }) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        new THREE.MeshNormalMaterial()
      );

      mesh.position.set(...coords);

      mesh.rotation.set(...rotation);

      scene.add(mesh);
    });


  });



}

camera.position.z = 100;
camera.position.x = -3;
camera.rotation.set(1, -2, -4.5);

const light = new THREE.DirectionalLight(0xfff0dd, 1);
light.position.set(0, 5, 10);
scene.add(light);

renderCubeLine();


function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

squares_anim.to(camera.rotation, {
  x: 0, y: 0, z: 0, scrollTrigger: {
    trigger: ".section.n_1",
    endTrigger: ".section.n_3",
    end: "top bottom",
  }
})
  .to(camera.position, {
    z: -200, scrollTrigger: {
      trigger: ".section.n_1",
      endTrigger: ".section.n_19",
      end: "top bottom",
    }
  }).to(camera.position, {
    x: -3, scrollTrigger: {
      trigger: ".section.n_2",
      endTrigger: ".section.n_3",
      end: "top bottom",
    }
  }).to(camera.position, {
    x: 3, scrollTrigger: {
      trigger: ".section.n_3",
      endTrigger: ".section.n_4",
      end: "top bottom",
    }
  }).to(camera.position, {
    x: 0, y: -2, scrollTrigger: {
      trigger: ".section.n_5",
      endTrigger: ".section.n_6",
      end: "top bottom",
    }
  });


animate();