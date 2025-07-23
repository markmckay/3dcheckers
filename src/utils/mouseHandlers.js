import * as THREE from 'three';

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let selectedPiece = null;
let validMoves = [];

export function handleMouseEvents(camera, scene, renderer, gameState, setGameState, pieces, setPieces) {
  const canvas = renderer.domElement;
  
  canvas.addEventListener('click', (event) => {
    handleClick(event, camera, scene, renderer, gameState, setGameState, pieces, setPieces);
  });
  
  canvas.addEventListener('mousemove', (event) => {
    handleMouseMove(event, camera, scene, renderer);
  });
}

function handleClick(event, camera, scene, renderer, gameState, setGameState, pieces, setPieces) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  if (intersects.length > 0) {
    const clickedObject = findClickableObject(intersects[0].object);
    
    if (clickedObject) {
      if (clickedObject.userData.isPiece) {
        handlePieceClick(clickedObject, gameState, setGameState);
      } else if (clickedObject.userData.isSquare) {
        handleSquareClick(clickedObject, gameState, setGameState, pieces, setPieces, scene);
      }
    }
  } else {
    // Clicked on empty space - deselect
    clearSelection(scene);
    setGameState(prev => ({ ...prev, selectedPiece: null }));
  }
}

function handleMouseMove(event, camera, scene, renderer) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  // Reset all hover states
  scene.traverse((child) => {
    if (child.userData.isPiece || child.userData.isSquare) {
      if (child.material) {
        child.material.emissive.setHex(0x000000);
      }
    }
  });
  
  if (intersects.length > 0) {
    const hoveredObject = findClickableObject(intersects[0].object);
    if (hoveredObject && hoveredObject.material) {
      hoveredObject.material.emissive.setHex(0x333333);
    }
  }
}

function findClickableObject(object) {
  let current = object;
  while (current) {
    if (current.userData.isPiece || current.userData.isSquare) {
      return current;
    }
    current = current.parent;
  }
  return null;
}

function handlePieceClick(pieceObject, gameState, setGameState) {
  const pieceColor = pieceObject.userData.color;
  
  // Only allow selecting pieces of the current player
  if (pieceColor !== gameState.currentPlayer) {
    return;
  }
  
  // Clear previous selection
  clearSelection(pieceObject.parent);
  
  // Select this piece
  selectedPiece = pieceObject;
  highlightPiece(pieceObject, true);
  
  // Calculate and show valid moves
  validMoves = calculateValidMoves(pieceObject);
  highlightValidMoves(pieceObject.parent, validMoves);
  
  setGameState(prev => ({ 
    ...prev, 
    selectedPiece: pieceObject.userData.pieceId 
  }));
}

function handleSquareClick(squareObject, gameState, setGameState, pieces, setPieces, scene) {
  if (!selectedPiece) return;
  
  const targetSquare = {
    row: squareObject.userData.row,
    col: squareObject.userData.col,
    board: squareObject.userData.board
  };
  
  // Check if this is a valid move
  const isValidMove = validMoves.some(move => 
    move.row === targetSquare.row && 
    move.col === targetSquare.col && 
    move.board === targetSquare.board
  );
  
  if (isValidMove) {
    // Execute the move
    executeMove(selectedPiece, targetSquare, pieces, setPieces, scene);
    
    // Switch players
    const nextPlayer = gameState.currentPlayer === 'red' ? 'black' : 'red';
    setGameState(prev => ({ 
      ...prev, 
      currentPlayer: nextPlayer,
      selectedPiece: null,
      gameStarted: true
    }));
    
    // Clear selection
    clearSelection(scene);
    selectedPiece = null;
    validMoves = [];
  }
}

function calculateValidMoves(pieceObject) {
  const moves = [];
  const { row, col, board } = pieceObject.userData.position;
  const color = pieceObject.userData.color;
  const isKing = pieceObject.userData.isKing;
  
  // Basic move directions
  const directions = [];
  
  if (color === 'red' || isKing) {
    directions.push([1, 1], [1, -1]); // Forward for red
  }
  if (color === 'black' || isKing) {
    directions.push([-1, 1], [-1, -1]); // Forward for black
  }
  
  // Check each direction
  directions.forEach(([dRow, dCol]) => {
    const newRow = row + dRow;
    const newCol = col + dCol;
    
    // Check bounds
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      // Check if square is empty and on dark square
      if ((newRow + newCol) % 2 === 1) {
        moves.push({ row: newRow, col: newCol, board });
      }
    }
  });
  
  // Add inter-board moves for kings or special positions
  if (isKing || (board === 'lower' && row >= 6) || (board === 'upper' && row <= 1)) {
    const otherBoard = board === 'lower' ? 'upper' : 'lower';
    const targetRow = board === 'lower' ? 0 : 7;
    
    // Allow moving to corresponding position on other board
    if ((targetRow + col) % 2 === 1) {
      moves.push({ row: targetRow, col, board: otherBoard });
    }
  }
  
  return moves;
}

function executeMove(pieceObject, targetSquare, pieces, setPieces, scene) {
  // Update piece position
  const boardY = targetSquare.board === 'lower' ? 0.4 : 5.4;
  pieceObject.position.set(
    targetSquare.row - 3.5,
    boardY,
    targetSquare.col - 3.5
  );
  
  // Update piece data
  pieceObject.userData.position = targetSquare;
  
  // Check for king promotion
  const shouldPromote = (
    (pieceObject.userData.color === 'red' && targetSquare.board === 'upper' && targetSquare.row === 7) ||
    (pieceObject.userData.color === 'black' && targetSquare.board === 'lower' && targetSquare.row === 0)
  );
  
  if (shouldPromote && !pieceObject.userData.isKing) {
    pieceObject.userData.isKing = true;
    addKingCrown(pieceObject, pieceObject.userData.color);
  }
  
  // Update pieces array
  setPieces(prev => prev.map(piece => {
    if (piece.id === pieceObject.userData.pieceId) {
      return {
        ...piece,
        position: targetSquare,
        isKing: pieceObject.userData.isKing
      };
    }
    return piece;
  }));
}

function highlightPiece(pieceObject, highlight) {
  if (pieceObject.material) {
    pieceObject.material.emissive.setHex(highlight ? 0x444444 : 0x000000);
  }
  
  // Highlight all children
  pieceObject.traverse((child) => {
    if (child.material) {
      child.material.emissive.setHex(highlight ? 0x444444 : 0x000000);
    }
  });
}

function highlightValidMoves(scene, moves) {
  scene.traverse((child) => {
    if (child.userData.isSquare) {
      const isValidMove = moves.some(move => 
        move.row === child.userData.row && 
        move.col === child.userData.col && 
        move.board === child.userData.board
      );
      
      if (isValidMove && child.material) {
        child.material.emissive.setHex(0x004400);
      }
    }
  });
}

function clearSelection(scene) {
  scene.traverse((child) => {
    if (child.material) {
      child.material.emissive.setHex(0x000000);
    }
  });
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
}