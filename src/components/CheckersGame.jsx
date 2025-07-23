import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initializeScene } from '../utils/sceneSetup';
import { createBoards } from '../utils/boardCreation';
import { createPieces, initializePieces } from '../utils/pieceCreation';
import { handleMouseEvents } from '../utils/mouseHandlers';

export default function CheckersGame() {
  console.log('🎮 [CheckersGame] Component rendering...');
  
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animationIdRef = useRef(null);
  const cleanupMouseEventsRef = useRef(null);
  
  const [gameState, setGameState] = useState({
    mode: 'pvp',
    difficulty: 'medium',
    boardSize: 8,
    currentPlayer: 'red',
    selectedPiece: null,
    gameStarted: false
  });

  const [pieces, setPieces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🎮 [CheckersGame] useEffect triggered - starting initialization...');
    
    if (!mountRef.current) {
      console.log('🎮 [CheckersGame] Mount ref not ready, waiting...');
      return;
    }

    const initGame = () => {
      console.log('🎮 [CheckersGame] Starting game initialization...');
      
      try {
        setError(null);
        console.log('🎮 [CheckersGame] Error state cleared');
        
        // Initialize scene
        console.log('🎮 [CheckersGame] Initializing scene...');
        const { scene, camera, renderer, controls } = initializeScene(mountRef.current);
        console.log('🎮 [CheckersGame] Scene initialization returned:', { scene: !!scene, camera: !!camera, renderer: !!renderer });
        
        console.log('🎮 [CheckersGame] Scene initialized, setting refs...');
        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;
        controlsRef.current = controls;
        console.log('🎮 [CheckersGame] Refs set successfully');

        // Create boards
        console.log('🎮 [CheckersGame] Creating boards...');
        createBoards(scene);
        console.log('🎮 [CheckersGame] Boards created successfully');

        // Initialize pieces
        console.log('🎮 [CheckersGame] Initializing pieces...');
        const initialPieces = initializePieces();
        console.log('🎮 [CheckersGame] Pieces initialized:', initialPieces.length);
        setPieces(initialPieces);
        console.log('🎮 [CheckersGame] Pieces state set');
        
        // Create 3D pieces
        console.log('🎮 [CheckersGame] Creating 3D pieces...');
        createPieces(scene, initialPieces);
        console.log('🎮 [CheckersGame] 3D pieces created successfully');

        // Set up mouse events
        console.log('🎮 [CheckersGame] Setting up mouse events...');
        const cleanupMouseEvents = handleMouseEvents(
          camera, 
          scene, 
          renderer, 
          gameState, 
          setGameState, 
          initialPieces, 
          setPieces
        );
        cleanupMouseEventsRef.current = cleanupMouseEvents;
        console.log('🎮 [CheckersGame] Mouse events set up successfully');

        // Animation loop
        console.log('🎮 [CheckersGame] Starting animation loop...');
        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate);
          
          // Controls update removed for now
          
          if (renderer && scene && camera) {
            renderer.render(scene, camera);
          }
        };
        animate();
        console.log('🎮 [CheckersGame] Animation loop started');

        // Handle window resize
        const handleResize = () => {
          console.log('🎮 [CheckersGame] Window resized, updating camera and renderer...');
          if (camera && renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
          }
        };
        window.addEventListener('resize', handleResize);
        console.log('🎮 [CheckersGame] Resize handler added');

        console.log('🎉 [CheckersGame] Game initialization complete!');
        console.log('🎮 [CheckersGame] Setting loading to false...');
        setLoading(false);
        console.log('🎮 [CheckersGame] Loading state updated');

        return () => {
          console.log('🎮 [CheckersGame] Cleaning up resize listener...');
          window.removeEventListener('resize', handleResize);
        };
        
      } catch (error) {
        console.error('❌ [CheckersGame] Error initializing game:', error);
        console.error('❌ [CheckersGame] Error stack:', error.stack);
        console.error('❌ [CheckersGame] Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        setError(error.message);
        setLoading(false);
        console.log('❌ [CheckersGame] Error state set, loading set to false');
      }
    };

    console.log('🎮 [CheckersGame] About to call initGame...');
    initGame();
    console.log('🎮 [CheckersGame] initGame called');

    return () => {
      console.log('🎮 [CheckersGame] Component cleanup...');
      
      if (animationIdRef.current) {
        console.log('🎮 [CheckersGame] Canceling animation frame...');
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (cleanupMouseEventsRef.current) {
        console.log('🎮 [CheckersGame] Cleaning up mouse events...');
        cleanupMouseEventsRef.current();
      }
      
      if (rendererRef.current && mountRef.current && mountRef.current.contains(rendererRef.current.domElement)) {
        console.log('🎮 [CheckersGame] Removing renderer from DOM...');
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // Update mouse handlers when gameState changes
  useEffect(() => {
    console.log('🎮 [CheckersGame] Game state changed:', gameState);
    
    if (cleanupMouseEventsRef.current && cameraRef.current && sceneRef.current && rendererRef.current) {
      console.log('🎮 [CheckersGame] Updating mouse handlers with new game state...');
      
      // Cleanup old handlers
      cleanupMouseEventsRef.current();
      
      // Setup new handlers with updated game state
      const cleanupMouseEvents = handleMouseEvents(
        cameraRef.current, 
        sceneRef.current, 
        rendererRef.current, 
        gameState, 
        setGameState, 
        pieces, 
        setPieces
      );
      cleanupMouseEventsRef.current = cleanupMouseEvents;
    }
  }, [gameState.currentPlayer, gameState.selectedPiece, pieces]);

  const handleGameModeChange = (mode) => {
    console.log(`🎮 [CheckersGame] Game mode changed to: ${mode}`);
    setGameState(prev => ({ ...prev, mode }));
  };

  const handleDifficultyChange = (difficulty) => {
    console.log(`🎮 [CheckersGame] Difficulty changed to: ${difficulty}`);
    setGameState(prev => ({ ...prev, difficulty }));
  };

  const resetGame = () => {
    console.log('🎮 [CheckersGame] Resetting game...');
    
    const initialPieces = initializePieces();
    setPieces(initialPieces);
    setGameState(prev => ({ 
      ...prev, 
      currentPlayer: 'red', 
      selectedPiece: null,
      gameStarted: false 
    }));
    
    if (sceneRef.current) {
      console.log('🎮 [CheckersGame] Removing existing pieces from scene...');
      // Remove existing pieces
      const piecesToRemove = [];
      sceneRef.current.traverse((child) => {
        if (child.userData.isPiece) {
          piecesToRemove.push(child);
        }
      });
      
      console.log(`🎮 [CheckersGame] Found ${piecesToRemove.length} pieces to remove`);
      piecesToRemove.forEach(piece => sceneRef.current.remove(piece));
      
      // Create new pieces
      console.log('🎮 [CheckersGame] Creating new pieces...');
      createPieces(sceneRef.current, initialPieces);
    }
    
    console.log('✅ [CheckersGame] Game reset complete');
  };

  if (error) {
    console.error('❌ [CheckersGame] Rendering error state:', error);
    return (
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        color: 'white',
        textAlign: 'center',
        background: 'rgba(255, 0, 0, 0.8)',
        padding: '20px',
        borderRadius: '10px'
      }}>
        <h2>Error Loading Game</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
  }

  if (loading) {
    console.log('🎮 [CheckersGame] Rendering loading state...');
    return <div className="loading">Loading 3D Checkers...</div>;
  }

  console.log('🎮 [CheckersGame] Rendering game interface...');
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div className="game-ui">
        <h1>3D Checkers</h1>
        <div className="game-controls">
          <div className="control-group">
            <label>Game Mode:</label>
            <select 
              value={gameState.mode} 
              onChange={(e) => handleGameModeChange(e.target.value)}
            >
              <option value="pvp">Player vs Player</option>
              <option value="pvc">Player vs Computer</option>
            </select>
          </div>
          
          {gameState.mode === 'pvc' && (
            <div className="control-group">
              <label>Difficulty:</label>
              <select 
                value={gameState.difficulty} 
                onChange={(e) => handleDifficultyChange(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          )}
          
          <div className="control-group">
            <button onClick={resetGame}>Reset Game</button>
          </div>
          
          <div className={`current-player ${gameState.currentPlayer}`}>
            Current Player: {gameState.currentPlayer.toUpperCase()}
          </div>
          
          {gameState.selectedPiece && (
            <div style={{ 
              marginTop: '10px', 
              padding: '8px', 
              background: 'rgba(0, 255, 0, 0.1)', 
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              Selected: {gameState.selectedPiece}
            </div>
          )}
        </div>
      </div>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}