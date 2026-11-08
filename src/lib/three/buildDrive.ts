import type { ThreeLib } from '@/lib/three/loadThree';

const PCB_WIDTH = 3.2;
const PCB_DEPTH = 2.2;
const PCB_HEIGHT = 0.08;
const COVER_TOP = PCB_HEIGHT + 0.14;

function roundedSlab(THREE: ThreeLib, width: number, depth: number, height: number, radius: number, material: unknown) {
  const x = -width / 2;
  const y = -depth / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + depth - radius);
  shape.quadraticCurveTo(x + width, y + depth, x + width - radius, y + depth);
  shape.lineTo(x + radius, y + depth);
  shape.quadraticCurveTo(x, y + depth, x, y + depth - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  const geometry = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 8 });
  geometry.rotateX(-Math.PI / 2);
  return new THREE.Mesh(geometry, material);
}

function createLabelTexture(THREE: ThreeLib) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1e3a5f');
    gradient.addColorStop(1, '#0f766e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 170px sans-serif';
    ctx.fillText('1 ТБ', 60, 180);
    ctx.fillStyle = '#fbbf24';
    ctx.font = '600 70px sans-serif';
    ctx.fillText('NVMe SSD', 600, 180);
  }
  return new THREE.CanvasTexture(canvas);
}

export function buildDrive(THREE: ThreeLib) {
  const group = new THREE.Group();

  const pcbMaterial = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.55, metalness: 0.1 });
  const coverMaterial = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.75 });
  const finMaterial = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.28, metalness: 0.85 });
  const chipMaterial = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5 });
  const chipLabelMaterial = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.6 });
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xd4a017, roughness: 0.3, metalness: 0.9 });
  const screwMaterial = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.8 });

  const pcb = roundedSlab(THREE, PCB_WIDTH, PCB_DEPTH, PCB_HEIGHT, 0.12, pcbMaterial);
  group.add(pcb);

  const cover = roundedSlab(THREE, 2.6, 1.6, 0.14, 0.12, coverMaterial);
  cover.position.y = PCB_HEIGHT;
  group.add(cover);

  const finGeometry = new THREE.BoxGeometry(0.05, 0.16, 0.9);
  for (let i = 0; i < 11; i += 1) {
    const fin = new THREE.Mesh(finGeometry, finMaterial);
    fin.position.set(-1.0 + i * 0.2, COVER_TOP + 0.08, -0.4);
    group.add(fin);
  }

  const labelTexture = createLabelTexture(THREE);
  const sticker = new THREE.Mesh(
    new THREE.PlaneGeometry(2.0, 0.7).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ map: labelTexture, roughness: 0.6 })
  );
  sticker.position.set(0, COVER_TOP + 0.005, 0.45);
  group.add(sticker);

  const screwGeometry = new THREE.CylinderGeometry(0.07, 0.07, 0.03, 14);
  for (const x of [-1.15, 1.15]) {
    for (const z of [-0.7, 0.7]) {
      const screw = new THREE.Mesh(screwGeometry, screwMaterial);
      screw.position.set(x, COVER_TOP + 0.015, z);
      group.add(screw);
    }
  }

  const chipGeometry = new THREE.BoxGeometry(0.44, 0.05, 0.24);
  const chipLabelGeometry = new THREE.BoxGeometry(0.3, 0.01, 0.12);
  const pinGeometry = new THREE.BoxGeometry(0.05, 0.02, 0.03);
  const chipY = PCB_HEIGHT + 0.025;
  for (const z of [-0.95, 0.95]) {
    for (const x of [-1.0, -0.33, 0.33, 1.0]) {
      const chip = new THREE.Mesh(chipGeometry, chipMaterial);
      chip.position.set(x, chipY, z);
      group.add(chip);

      const label = new THREE.Mesh(chipLabelGeometry, chipLabelMaterial);
      label.position.set(x, chipY + 0.03, z);
      group.add(label);

      for (const pinZ of [-0.135, 0.135]) {
        for (const pinX of [-0.165, -0.055, 0.055, 0.165]) {
          const pin = new THREE.Mesh(pinGeometry, goldMaterial);
          pin.position.set(x + pinX, PCB_HEIGHT + 0.01, z + pinZ);
          group.add(pin);
        }
      }
    }
  }

  const contactGeometry = new THREE.BoxGeometry(0.25, 0.02, 0.08);
  for (let i = 0; i < 12; i += 1) {
    const contact = new THREE.Mesh(contactGeometry, goldMaterial);
    contact.position.set(1.45, PCB_HEIGHT + 0.01, -0.88 + i * (1.76 / 11));
    group.add(contact);
  }

  const indicator = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.9 })
  );
  indicator.position.set(-1.42, PCB_HEIGHT + 0.04, -0.95);
  group.add(indicator);

  group.position.y = -0.19;
  return group;
}
