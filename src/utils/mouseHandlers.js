import * as THREE from 'three';

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let selectedPiece = null;
let validMoves = [];

export function handleMouseEvents(camera, scene, renderer, gameState, setGameState, pieces, setPieces) {
  console.log('🖱️ [MouseHandlers] Setting up mouse event handlers...');
  
  const canvas = renderer.domElement;
  
  const clickHandler = (event) => {
    console.log('🖱️ [MouseHandlers] Mouse click detected');
    handleClick(event, camera, scene, renderer, gameState, setGameState, pieces, setPieces);
  };
  
  const moveHandler = (event) => {
    handleMouseMove(event, camera, scene, renderer);
  };
  
  canvas.addEventListener('click', clickHandler);
  canvas.addEventListener('mousemove', moveHandler);
  
  console.log('✅ [MouseHandlers] Mouse event handlers set up successfully');
  
  // Return cleanup function
  return () => {
    console.log('🖱️ [MouseHandlers] Cleaning up mouse event handlers...');
    canvas.removeEventListener('click', clickHandler);
    canvas.removeEventListener('mousemove', moveHandler);
  };
}

function handleClick(event, camera, scene, renderer, gameState, setGameState, pieces, setPieces) {
  console.log('🖱️ [MouseHandlers] Processing click event...');
  
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  console.log(`🖱️ [MouseHandlers] Mouse coordinates: (${mouse.x.toFixed(3)}, ${mouse.y.toFixed(3)})`);
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  console.log(`🖱️ [MouseHandlers] Found ${intersects.length} intersections`);
  
  if (intersects.length > 0) {
    const clickedObject = findClickableObject(intersects[0].object);
    
    if (clickedObject) {
      console.log(`🖱️ [MouseHandlers] Clicked on object:`, clickedObject.userData);
      
      if (clickedObject.userData.isPiece) {
        console.log(`🖱️ [MouseHandlers] Clicked on piece: ${clickedObject.userData.pieceId}`);
        handlePieceClick(clickedObject, gameState, setGameState);
      } else if (clickedObject.userData.isSquare) {
        console.log(`🖱️ [MouseHandlers] Clicked on square: [${clickedObject.userData.row}, ${clickedObject.userData.col}] on ${clickedObject.userData.board} board`);
        handleSquareClick(clickedObject, gameState, setGameState, pieces, setPieces, scene);
      }
    } else {
      console.log('🖱️ [MouseHandlers] Clicked on non-interactive object');
    }
  } else {
    // Clicked on empty space - deselect
    console.log('🖱️ [MouseHandlers] Clicked on empty space - deselecting');
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
  
  console.log(`🖱️ [MouseHandlers] Handling piece click - Color: ${pieceColor}, Current Player: ${gameState.currentPlayer}`);
  
  // Only allow selecting pieces of the current player
  if (pieceColor !== gameState.currentPlayer) {
    console.log('🖱️ [MouseHandlers] Cannot select opponent\'s piece');
    return;
  }
  
  // Clear previous selection
  clearSelection(pieceObject.parent);
  
  // Select this piece
  selectedPiece = pieceObject;
  highlightPiece(pieceObject, true);
  
  // Calculate and show valid moves
  validMoves = calculateValidMoves(pieceObject);
  console.log(`🖱️ [MouseHandlers] Found ${validMoves.length} valid moves for piece ${pieceObject.userData.pieceId}`);
  highlightValidMoves(pieceObject.parent, validMoves);
  
  setGameState(prev => ({ 
    ...prev, 
    selectedPiece: pieceObject.userData.pieceId 
  }));
}

function handleSquareClick(squareObject, gameState, setGameState, pieces, setPieces, scene) {
  if (!selectedPiece) {
    console.log('🖱️ [MouseHandlers] No piece selected for move');
    return;
  }
  
  const targetSquare = {
    row: squareObject.userData.row,
    col: squareObject.userData.col,
    board: squareObject.userData.board
  };
  
  console.log(`🖱️ [MouseHandlers] Attempting move to [${targetSquare.row}, ${targetSquare.col}] on ${targetSquare.board} board`);
  
  // Check if this is a valid move
  const isValidMove = validMoves.some(move => 
    move.row === targetSquare.row && 
    move.col === targetSquare.col && 
    move.board === targetSquare.board
  );
  
  if (isValidMove) {
    console.log('🖱️ [MouseHandlers] Valid move - executing...');
    // Execute the move
    executeMove(selectedPiece, targetSquare, pieces, setPieces, scene);
    
    // Switch players
    const nextPlayer = gameState.currentPlayer === 'red' ? 'black' : 'red';
    console.log(`🖱️ [MouseHandlers] Switching to player: ${nextPlayer}`);
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
  } else {
    console.log('🖱️ [MouseHandlers] Invalid move attempted');
  }
}

function calculateValidMoves(pieceObject) {
  console.log(`🖱️ [MouseHandlers] Calculating valid moves for piece ${pieceObject.userData.pieceId}...`);
  
  const moves = [];
  const { row, col, board } = pieceObject.userData.position;
  const color = pieceObject.userData.color;
  const isKing = pieceObject.userData.isKing;
  
  console.log(`🖱️ [MouseHandlers] Piece details - Position: [${row}, ${col}] on ${board}, Color: ${color}, King: ${isKing}`);
  
  // Basic move directions
  const directions = [];
  
  if (color === 'red' || isKing) {
    directions.push([1, 1], [1, -1]); // Forward for red
  }
  if (color === 'black' || isKing) {
    directions.push([-1, 1], [-1, -1]); // Forward for black
  }
  
  console.log(`🖱️ [MouseHandlers] Checking ${directions.length} directions...`);
  
  // Check each direction
  directions.forEach(([dRow, dCol]) => {
    const newRow = row + dRow;
    const newCol = col + dCol;
    
    // Check bounds
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      // Check if square is empty and on dark square
      if ((newRow + newCol) % 2 === 1) {
        moves.push({ row: newRow, col: newCol, board });
        console.log(`🖱️ [MouseHandlers] Added valid move: [${newRow}, ${newCol}] on ${board}`);
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
      console.log(`🖱️ [MouseHandlers] Added inter-board move: [${targetRow}, ${col}] on ${otherBoard}`);
    }
  }
  
  console.log(`🖱️ [MouseHandlers] Total valid moves found: ${moves.length}`);
  return moves;
}

function executeMove(pieceObject, targetSquare, pieces, setPieces, scene) {
  console.log(`🖱️ [MouseHandlers] Executing move for piece ${pieceObject.userData.pieceId} to [${targetSquare.row}, ${targetSquare.col}] on ${targetSquare.board}`);
  
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
    console.log(`👑 [MouseHandlers] Promoting piece ${pieceObject.userData.pieceId} to king!`);
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
  
  console.log(`✅ [MouseHandlers] Move executed successfully`);
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
  console.log(`🖱️ [MouseHandlers] Highlighting ${moves.length} valid moves...`);
  
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
  console.log('🖱️ [MouseHandlers] Clearing all selections and highlights...');
  
  scene.traverse((child) => {
    if (child.material) {
      child.material.emissive.setHex(0x000000);
    }
  });
}

function addKingCrown(pieceGroup, color) {
  console.log(`👑 [MouseHandlers] Adding crown to ${color} piece...`);
  
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