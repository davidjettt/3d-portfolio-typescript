import './style.css'
import * as THREE from 'three';
import { ISizes, IPoints, IObject } from './interfaces'
import headshot from '../images/headshot.png'


let scrollY: number = window.scrollY
const objectsDistance: number = 9

// Scene
const scene = new THREE.Scene()

// Sizes
const sizes: ISizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)

camera.position.z = 6
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector<HTMLCanvasElement>('#bg')!,
  antialias: true
})

renderer.setClearColor(0x0f0f0f)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Lighting
const pointLight = new THREE.PointLight(0x870d07, 10)
pointLight.position.set(5, 10, 7)
const ambientLight = new THREE.AmbientLight(0xffffff)
scene.add(pointLight, ambientLight)

// const lightHelper = new THREE.PointLightHelper(pointLight, 2)
// const gridHelper = new THREE.GridHelper(200, 50)
// scene.add(lightHelper)

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
})

// OBJECTS

// Avatar
const avatarTexture = new THREE.TextureLoader().load(headshot)
const avatar = new THREE.Mesh(
  new THREE.BoxGeometry(3, 3, 3),
  new THREE.MeshBasicMaterial({ map: avatarTexture })
)
scene.add(avatar)

// Triangle Shard Sculpture
const getPoints = (): IPoints => {
  const vertices: number[] = []
  const colors: number[] = []
  const numPoints: number = 150
  const size: number = 5
  let x, y, z, r, g, b;
  const colorMultiplier: number = 0.5

  for (let i:number = 0; i < numPoints; i++) {
    x = Math.random() * size - size * 0.5;
    y = Math.random() * size - size * 0.5;
    z = Math.random() * size - size * 0.5;
    r = x * colorMultiplier;
    g = y * colorMultiplier;
    b = z * colorMultiplier;

    // r = x * 0;
    // g = 0.5;
    // b = 0.5;
    vertices.push(x, y, z);
    colors.push(r, g, b);
  }
  return { vertices, colors }
}

const getShardSculpture = ({ vertices, colors }: {vertices: number[], colors: number[]}): IObject => {
  const geometry = new THREE.BufferGeometry()
  const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    // color: 0x000066
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.4
  })
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
  const mesh = new THREE.Mesh(geometry, material)
  // mesh.position.y = -objectsDistance * 0;
  scene.add(mesh)

  const update = (): void => {
    mesh.rotation.x += 0.002
    mesh.rotation.y += 0.002
    mesh.rotation.z += 0.001
  }

  return { mesh, update }
}

const points: IPoints = getPoints()
const shardSculpture = getShardSculpture(points)

// Plane Spiral
const planeGeometry = new THREE.PlaneGeometry(6, 6)

const getPlane = (index: number): IObject => {
  const hue: number = 0.05
  const lightness: number = 0.05 * index
  const color = new THREE.Color().setHSL(hue, 1, lightness)
  const planeMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.33,
  })
  const mesh = new THREE.Mesh(planeGeometry, planeMaterial)
  const scale: number = 1 - index * 0.05
  mesh.scale.multiplyScalar(scale)
  // mesh.rotation.z = Math.PI * index * 0.02
  const rate: number = index * 0.001
  const update = () => {
    mesh.rotation.z += rate
  }
  return { mesh, update }
}

const planes: IObject[] = [];
const numPlanes: number = 20;
// let plane;
for (let i: number = 0; i < numPlanes; i++) {
  let plane = getPlane(i);
  planes.push(plane);
  scene.add(plane.mesh);
}

const torusKnotGeometry = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.75, 0.25, 77, 3, 13, 11),
  new THREE.MeshBasicMaterial({
    color: "#008080",
    wireframe: true,
  })
)

scene.add(torusKnotGeometry)

// Object scrolling
avatar.position.y = -objectsDistance * 0
shardSculpture.mesh.position.y = -objectsDistance * 1
// mesh2.position.y = -objectsDistance * 2
torusKnotGeometry.position.y = -objectsDistance * 2
planes.map((plane) => (plane.mesh.position.y = -objectsDistance * 3))


const clock = new THREE.Clock()

const sectionMeshes = [avatar, torusKnotGeometry]

// let timeMult = 0.0004

const animate = () => {
  const elapsedTime = clock.getElapsedTime()

  for (const mesh of sectionMeshes) {
    mesh.rotation.x = elapsedTime * 0.2;
    mesh.rotation.y = elapsedTime * 0.2;
    mesh.rotation.z = elapsedTime * 0.1;
  }


  camera.position.y = (-scrollY / sizes.height) * objectsDistance
  planes.forEach((plane) => plane.update());
  shardSculpture.update();
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

animate()
