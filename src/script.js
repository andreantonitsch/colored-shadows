import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { SpotLightShadow } from 'three'
import { AxesHelper } from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js';


/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Axes Helper
const axes = new AxesHelper()
axes.visible = false
scene.add(axes)

// FPS counter
const stats = new Stats();
document.body.appendChild( stats.dom );

/**
 * Sizes
 */
 const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(27, sizes.width / sizes.height, 0.1, 200)
camera.position.x = 3
camera.position.y = 6
camera.position.z = 10
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true



/**
 * Material
 */
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.7
gui.add(material, 'metalness').min(0).max(1).step(0.001)
   .name('material matalness')

gui.add(material, 'roughness').min(0).max(1).step(0.001)
   .name('material roughness')

/**
 *  Environment
 */
const groundPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
groundPlane.rotation.x = - Math.PI * 0.5
groundPlane.position.y = - 0.5
groundPlane.receiveShadow = true

const backPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
backPlane.position.x = 0
backPlane.position.z = -2.5
backPlane.position.y =  2
backPlane.receiveShadow = true

scene.add(backPlane, groundPlane)



/**
 * Params
 */

const params = {
    animateLights: false,
    animateCylinders: false,
    lightSpacing: 2.54,
    cylinderSpacing: 1.5,
    lightDistance: 3.83
}


/**
 * Cylinders
 */
const cylinder = new THREE.CylinderGeometry(.3, .3, 1, 64, 1)
const cylinders = []
for(let i = 0; i < 3; i++){
    const c = new THREE.Mesh(cylinder, material)
    cylinders.push( c )
    scene.add(c)
    c.position.x = (i - 1) * params.cylinderSpacing
    c.castShadow = true
}




/**
 * Spotlights
 */
const lights = []
const lightFolders = [
    gui.addFolder('Red Light'),
    gui.addFolder('Green Light'),
    gui.addFolder('Blue Light')
]
for(let i = 0; i < 3; i++){
    const spotLight = new THREE.SpotLight(0xffffff, 1, 30, 
        2.41)
    
    // Light Parameters
    spotLight.position.x = (i -1) * params.lightSpacing
    spotLight.position.y = cylinders[i].position.y
    spotLight.position.z = cylinders[i].position.z + 
                           params.lightDistance
    spotLight.target = cylinders[i]

    // Shadow Parameters
    spotLight.castShadow = true
    spotLight.shadow.mapSize.width = 2048
    spotLight.shadow.mapSize.height = 2048
    
    // GUI
    lightFolders[i].add(spotLight, 'angle', 0, Math.PI, 0.01)        
    lightFolders[i].add(spotLight, 'intensity', 0, 1, 0.01)        
    lightFolders[i].add(spotLight, 'distance', 0.01, 50, 0.1)      

    // Scene Adding
    scene.add(spotLight)
    lights.push(spotLight)
}


lights[0].color = new THREE.Color(0xff0000)
lights[1].color = new THREE.Color(0x000ff00)
lights[2].color = new THREE.Color(0x0000ff)



/**
 * Param Controls
 */
const positionControls = gui.addFolder('Light Position Controls')
positionControls.add(params, 'lightSpacing', 0, 5, 0.01)
    .name('Light Spacing')
    .onChange(v => {
        for(let i = 0; i < 3; i++){
            lights[i].position.x = (i - 1) * v
        }
    })
positionControls.add(params, 'lightDistance', 0, 5, 0.01)
    .name('Light Distance')
    .onChange(v => {
        for(let i = 0; i < 3; i++){
            lights[i].position.z = cylinders[i].position.z + v

        }
    })
positionControls.add(params, 'cylinderSpacing', 0, 5, 0.01)
    .name('Cylinder Spacing')
    .onChange(v => {
        for(let i = 0; i < 3; i++){
            cylinders[i].position.x = (i - 1) * v
        }
    })


const animationFolder = gui.addFolder('Animation Controls')
animationFolder.add(params, 'animateLights').name('Animate Lights')
animationFolder.add(params, 'animateCylinders').name('Animate Cylinders')



/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    if( params.animateLights ){
        for(let i = 0; i < 3; i++){
            lights[i].position.x =  
                (i -1) * 
                (params.lightSpacing +
                    (Math.sin(elapsedTime / 2) * 0.4)
                )
        }
    }

    if( params.animateCylinders ){
        for(let i = 0; i < 3; i++){
            cylinders[i].position.x =  
                (i -1) * 
                (params.cylinderSpacing +
                    (Math.cos(elapsedTime / 2) * 0.2)
                )
        }
    }


    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
    stats.update()
}

tick()