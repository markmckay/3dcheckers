import * as THREE from 'three';

export function initializePieces() {
  const pieces = [];
  
  // Red pieces on lower board (rows 0-2)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) { // Only on dark squares
        pieces.push({
          id: `red_${row}_${col}`,
          color: 'red',
          position: { row, col, board: 'lower' },
          isKing: false,
          mesh: null
        });
      }
    }
  }
  
  // Black pieces on upper board (rows 5-7)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) { // Only on dark squares
        pieces.push({
          id: `black_${row}_${col}`,
          color: 'black',
          position: { row, col, board: 'upper' },
          isKing: false,
          mesh: null
        });
      }
    }
  }
  
  return pieces;
}

export function createPieces(scene, pieces) {
  pieces.forEach(piece => {
    const mesh = createPieceMesh(piece);
    piece.mesh = mesh;
    scene.add(mesh);
  });
}

function createPieceMesh(piece) {
  const group = new THREE.Group();
  
  // Main piece body
  const pieceGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.15);
  const pieceMaterial = new THREE.MeshStandardMaterial({ 
    color: piece.color === 'red' ? 0xdc143c : 0x2f2f2f,
    metalness: 0.2,
    roughness: 0.8,
  });
  
  const pieceMesh = new THREE.Mesh(pieceGeometry, pieceMaterial);
  pieceMesh.castShadow = true;
  pieceMesh.receiveShadow = true;
  group.add(pieceMesh);
  
  // Add rim for better visibility
  const rimGeometry = new THREE.TorusGeometry(0.35, 0.05, 8, 16);
  const rimMaterial = new THREE.MeshStandardMaterial({ 
    color: piece.color === 'red' ? 0xff6b6b : 0x555555,
    metalness: 0.3,
    roughness: 0.7,
  });
  
  const rim = new THREE.Mesh(rimGeometry, rimMaterial);
  rim.position.y = 0.08;
  rim.castShadow = true;
  group.add(rim);
  
  // Position the piece
  const boardY = piece.position.board === 'lower' ? 0.4 : 5.4;
  group.position.set(
    piece.position.row - 3.5,
    boardY,
    piece.position.col - 3.5
  );
  
  // Add user data for interaction
  group.userData = {
    isPiece: true,
    pieceId: piece.id,
    color: piece.color,
    position: piece.position,
    isKing: piece.isKing
  };
  
  // Add king crown if needed
  if (piece.isKing) {
    addKingCrown(group, piece.color);
  }
  
  return group;
}

function addKingCrown(pieceGroup, color) {
  const crownGeometry = new THREE.ConeGeometry(0.2, 0.3, 8);
  const crownMaterial = new THREE.MeshStandardMaterial({ 
    color: color === 'red' ? 0xffd700 : 0xc0c0c0,
    metalness: 0.8,
    roughness: 0.2,
  });
  
  const crown = new THREE.Mesh(crownGeometry, crownMaterial);
  crown.position.y = 0.3;
  crown.castShadow = true;
  pieceGroup.add(crown);
  
  // Add small gems
  for (let i = 0; i < 4; i++) {
    const gemGeometry = new THREE.SphereGeometry(0.03);
    const gemMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff0000,
      metalness: 0.9,
      roughness: 0.1,
    });
    
    const gem = new THREE.Mesh(gemGeometry, gemMaterial);
    const angle = (i / 4) * Math.PI * 2;
    gem.position.set(
      Math.cos(angle) * 0.15,
      0.35,
      Math.sin(angle) * 0.15
    );
    gem.castShadow = true;
    pieceGroup.add(gem);
  }
}