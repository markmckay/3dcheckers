import * as THREE from 'three';

export function createBoards(scene) {
  console.log('🏁 [BoardCreation] Starting board creation...');
  
  try {
    // Create two boards - one at y=0 and one at y=5
    console.log('🏁 [BoardCreation] Creating lower board...');
    createSingleBoard(scene, 0, 'lower');
    console.log('✅ [BoardCreation] Lower board created');
    
    console.log('🏁 [BoardCreation] Creating upper board...');
    createSingleBoard(scene, 5, 'upper');
    console.log('✅ [BoardCreation] Upper board created');
    
    // Create connecting pillars
    console.log('🏁 [BoardCreation] Creating connecting pillars...');
    createConnectingPillars(scene);
    console.log('✅ [BoardCreation] Connecting pillars created');
    
    console.log('🎉 [BoardCreation] Board creation complete!');
  } catch (error) {
    console.error('❌ [BoardCreation] Error creating boards:', error);
    throw error;
  }
}

function createSingleBoard(scene, yPosition, boardType) {
  console.log(`🏁 [BoardCreation] Creating ${boardType} board at y=${yPosition}...`);
  
  const boardGroup = new THREE.Group();
  boardGroup.name = `${boardType}Board`;
  
  // Main board base
  const boardGeometry = new THREE.BoxGeometry(8.4, 0.3, 8.4);
  const boardMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8b4513,
    metalness: 0.1,
    roughness: 0.8,
  });
  const board = new THREE.Mesh(boardGeometry, boardMaterial);
  board.position.y = yPosition;
  board.receiveShadow = true;
  board.castShadow = true;
  boardGroup.add(board);

  // Create checkerboard pattern
  console.log(`🏁 [BoardCreation] Creating checkerboard pattern for ${boardType} board...`);
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const isLight = (i + j) % 2 === 0;
      const squareGeometry = new THREE.BoxGeometry(1, 0.05, 1);
      const squareMaterial = new THREE.MeshStandardMaterial({ 
        color: isLight ? 0xf5deb3 : 0x654321,
        metalness: 0.1,
        roughness: 0.6,
      });
      
      const square = new THREE.Mesh(squareGeometry, squareMaterial);
      square.position.set(
        i - 3.5,
        yPosition + 0.175,
        j - 3.5
      );
      square.receiveShadow = true;
      square.userData = {
        isSquare: true,
        row: i,
        col: j,
        board: boardType,
        isLight: isLight
      };
      
      boardGroup.add(square);
    }
  }

  // Add decorative border
  console.log(`🏁 [BoardCreation] Adding decorative border for ${boardType} board...`);
  const borderGeometry = new THREE.BoxGeometry(9, 0.4, 0.3);
  const borderMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4a4a4a,
    metalness: 0.3,
    roughness: 0.7,
  });
  
  // Four border pieces
  const borders = [
    { pos: [0, yPosition, 4.35], rot: [0, 0, 0] },
    { pos: [0, yPosition, -4.35], rot: [0, 0, 0] },
    { pos: [4.35, yPosition, 0], rot: [0, Math.PI/2, 0] },
    { pos: [-4.35, yPosition, 0], rot: [0, Math.PI/2, 0] }
  ];
  
  borders.forEach(({ pos, rot }) => {
    const border = new THREE.Mesh(borderGeometry, borderMaterial);
    border.position.set(...pos);
    border.rotation.set(...rot);
    border.castShadow = true;
    border.receiveShadow = true;
    boardGroup.add(border);
  });

  scene.add(boardGroup);
  console.log(`✅ [BoardCreation] ${boardType} board added to scene`);
}

function createConnectingPillars(scene) {
  console.log('🏁 [BoardCreation] Creating connecting pillars...');
  
  const pillarGeometry = new THREE.CylinderGeometry(0.15, 0.15, 5);
  const pillarMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4a4a4a,
    metalness: 0.4,
    roughness: 0.6,
  });

  const pillarPositions = [
    [4.5, 2.5, 4.5],
    [4.5, 2.5, -4.5],
    [-4.5, 2.5, 4.5],
    [-4.5, 2.5, -4.5]
  ];

  pillarPositions.forEach((pos, index) => {
    const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    pillar.position.set(...pos);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    scene.add(pillar);
    console.log(`✅ [BoardCreation] Pillar ${index + 1} created at position [${pos.join(', ')}]`);
  });
}