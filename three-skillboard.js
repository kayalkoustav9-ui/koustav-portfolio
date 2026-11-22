import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const shell = document.querySelector("[data-skillboard]");
const mount = document.querySelector(".skillboard-webgl");
const skillButtons = Array.from(document.querySelectorAll(".skill-key"));

if (shell && mount && skillButtons.length) {
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  } catch (error) {
    console.info("The 3D skillboard is using its lightweight fallback.", error);
  }

  if (renderer) {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-5, 5, 2.5, -2.5, 0.1, 60);
    camera.position.set(4.7, 8.4, 10.2);
    camera.lookAt(0, 0.25, 0);

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.touchAction = "pan-y";
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xc7ddff, 0x10182a, 2.05));

    const keyLight = new THREE.DirectionalLight(0xf0f6ff, 3.3);
    keyLight.position.set(-4.5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -7;
    keyLight.shadow.camera.right = 7;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    keyLight.shadow.bias = -0.00025;
    keyLight.shadow.normalBias = 0.025;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x66aaff, 2.2);
    rimLight.position.set(5, 4, -5);
    scene.add(rimLight);

    const mintLight = new THREE.PointLight(0x64e4c4, 1.4, 13, 2);
    mintLight.position.set(-3.2, 1.5, 2.8);
    scene.add(mintLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(13, 9),
      new THREE.ShadowMaterial({ color: 0x07111f, opacity: 0.34 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.045;
    floor.receiveShadow = true;
    scene.add(floor);

    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x6daeff, transparent: true, opacity: 0.34 });
    const halo = new THREE.Mesh(new THREE.TorusGeometry(4.7, 0.014, 6, 96), ringMaterial);
    halo.rotation.x = Math.PI / 2;
    halo.position.y = -0.02;
    scene.add(halo);

    const board = new THREE.Group();
    board.rotation.y = 0.12;
    scene.add(board);

    const caseMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x111c2e,
      metalness: 0.62,
      roughness: 0.28,
      clearcoat: 0.7,
      clearcoatRoughness: 0.22,
    });
    const plateMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x293951,
      metalness: 0.58,
      roughness: 0.3,
      clearcoat: 0.55,
    });

    const body = new THREE.Mesh(new RoundedBoxGeometry(8.1, 0.5, 4.3, 4, 0.16), caseMaterial);
    body.position.y = 0.25;
    body.castShadow = true;
    body.receiveShadow = true;
    board.add(body);

    const plate = new THREE.Mesh(new RoundedBoxGeometry(7.9, 0.12, 4.1, 4, 0.12), plateMaterial);
    plate.position.y = 0.52;
    plate.castShadow = true;
    plate.receiveShadow = true;
    board.add(plate);

    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0x69c9ff,
      emissive: 0x2b98ed,
      emissiveIntensity: 1.15,
      metalness: 0.35,
      roughness: 0.25,
    });
    const frontLight = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.035, 0.06), accentMaterial);
    frontLight.position.set(0, 0.53, 1.97);
    board.add(frontLight);

    const screwGeometry = new THREE.CylinderGeometry(0.075, 0.075, 0.04, 20);
    const screwMaterial = new THREE.MeshStandardMaterial({ color: 0x91a7c5, metalness: 0.88, roughness: 0.24 });
    for (const x of [-3.78, 3.78]) {
      for (const z of [-1.93, 1.93]) {
        const screw = new THREE.Mesh(screwGeometry, screwMaterial);
        screw.position.set(x, 0.59, z);
        screw.castShadow = true;
        board.add(screw);
      }
    }

    const keyGeometry = new RoundedBoxGeometry(1.34, 0.3, 0.84, 3, 0.075);
    const keyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x273850,
      metalness: 0.22,
      roughness: 0.25,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15,
    });
    const activeKeyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x227a78,
      emissive: 0x0e6960,
      emissiveIntensity: 0.75,
      metalness: 0.26,
      roughness: 0.24,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
    });
    const keyObjects = [];
    const keyMeshes = [];

    function makeLegend(label) {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 256;
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#e5f0ff";
      context.font = `600 ${label.length > 4 ? 42 : 58}px DM Mono, monospace`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(label, canvas.width / 2, canvas.height / 2);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
      return texture;
    }

    skillButtons.forEach((button, index) => {
      const column = index % 5;
      const row = Math.floor(index / 5);
      const x = (column - 2) * 1.48;
      const z = (row - 1) * 1.02;
      const keyGroup = new THREE.Group();
      keyGroup.position.set(x, 0, z);

      const cap = new THREE.Mesh(keyGeometry, keyMaterial);
      cap.position.y = 0.69;
      cap.castShadow = true;
      cap.receiveShadow = true;
      cap.userData.index = index;
      keyGroup.add(cap);
      keyMeshes.push(cap);

      const labelTexture = makeLegend(button.textContent.trim());
      const legend = new THREE.Mesh(
        new THREE.PlaneGeometry(0.86, 0.42),
        new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true, depthWrite: false })
      );
      legend.rotation.x = -Math.PI / 2;
      legend.position.y = 0.846;
      keyGroup.add(legend);

      keyObjects.push({ group: keyGroup, cap, legend, labelTexture, pressed: 0 });
      board.add(keyGroup);
    });

    const starMaterial = new THREE.MeshBasicMaterial({ color: 0x8bd8ff, transparent: true, opacity: 0.85 });
    const starGeometry = new THREE.SphereGeometry(0.035, 8, 8);
    const stars = [];
    for (let index = 0; index < 7; index += 1) {
      const star = new THREE.Mesh(starGeometry, starMaterial);
      const angle = (index / 7) * Math.PI * 2;
      const radius = index % 2 === 0 ? 5 : 5.35;
      star.position.set(Math.cos(angle) * radius, 0.28 + (index % 3) * 0.18, Math.sin(angle) * radius * 0.42);
      scene.add(star);
      stars.push(star);
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const targetRotation = { x: -0.1, y: 0.12 };
    let selectedIndex = -1;
    let visible = true;
    let pageVisible = !document.hidden;
    let lastTime = 0;

    function renderFrame(time = 0) {
      const elapsed = time * 0.001;
      const delta = lastTime ? Math.min((time - lastTime) * 0.001, 0.05) : 0.016;
      lastTime = time;

      board.rotation.x += (targetRotation.x - board.rotation.x) * 0.055;
      board.rotation.y += (targetRotation.y - board.rotation.y) * 0.055;
      board.position.y = 0.05 + Math.sin(elapsed * 1.25) * (reducedMotion.matches ? 0 : 0.075);
      halo.rotation.z = elapsed * 0.07;

      keyObjects.forEach((key) => {
        key.pressed = Math.max(0, key.pressed - delta * 4.5);
        key.group.position.y = -key.pressed * 0.12;
      });

      stars.forEach((star, index) => {
        star.position.y = 0.24 + (index % 3) * 0.18 + Math.sin(elapsed * 1.4 + index) * 0.055;
      });

      renderer.render(scene, camera);
    }

    function drawOnce() {
      renderFrame(performance.now());
    }

    function syncAnimation() {
      if (visible && pageVisible && !reducedMotion.matches) {
        renderer.setAnimationLoop(renderFrame);
      } else {
        renderer.setAnimationLoop(null);
        drawOnce();
      }
    }

    function resizeScene() {
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      const aspect = width / height;
      const viewHeight = 5.1;
      camera.left = -(viewHeight * aspect) / 2;
      camera.right = (viewHeight * aspect) / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      drawOnce();
    }

    function chooseKey(index, notifyPage = true) {
      if (!keyObjects[index]) return;
      if (selectedIndex >= 0 && keyObjects[selectedIndex]) {
        keyObjects[selectedIndex].cap.material = keyMaterial;
        keyObjects[selectedIndex].legend.material.color.setHex(0xe5f0ff);
      }
      selectedIndex = index;
      keyObjects[index].cap.material = activeKeyMaterial;
      keyObjects[index].legend.material.color.setHex(0xcffff2);
      keyObjects[index].pressed = 1;
      if (notifyPage) {
        document.dispatchEvent(new CustomEvent("skillboard:select", { detail: { index } }));
      }
      if (reducedMotion.matches || !visible || !pageVisible) drawOnce();
    }

    function setPointer(event) {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    }

    renderer.domElement.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      const bounds = renderer.domElement.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      targetRotation.y = 0.12 + x * 0.3;
      targetRotation.x = -0.1 - y * 0.16;
    });

    renderer.domElement.addEventListener("pointerleave", () => {
      targetRotation.x = -0.1;
      targetRotation.y = 0.12;
    });

    renderer.domElement.addEventListener("click", (event) => {
      setPointer(event);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(keyMeshes, false)[0];
      if (hit) chooseKey(hit.object.userData.index);
    });

    document.addEventListener("skillboard:select", (event) => chooseKey(event.detail.index, false));
    document.addEventListener("visibilitychange", () => {
      pageVisible = !document.hidden;
      syncAnimation();
    });
    reducedMotion.addEventListener?.("change", syncAnimation);

    if ("ResizeObserver" in window) {
      new ResizeObserver(resizeScene).observe(mount);
    } else {
      window.addEventListener("resize", resizeScene, { passive: true });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        syncAnimation();
      }, { threshold: 0.01 }).observe(shell);
    }

    renderer.domElement.addEventListener("webglcontextlost", () => {
      shell.classList.remove("is-webgl");
      renderer.setAnimationLoop(null);
    });

    shell.classList.add("is-webgl");
    resizeScene();
    chooseKey(0, false);
    syncAnimation();
  }
}
