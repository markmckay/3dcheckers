import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initializeScene } from '../utils/sceneSetup';
import { createBoards } from '../utils/boardCreation';
import { createPieces, initializePieces } from '../utils/pieceCreation';
import { handleMouseEvents } from '../utils/mouseHandlers';

export default function CheckersGame() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animationIdRef = useRef(null);
  
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

  useEffect(() => {
    if (!mountRef.current) return;

    const initGame = async () => {
      console.log('Starting game initialization...');
      try {
        // Initialize scene
        console.log('Initializing scene...');
        const { scene, camera, renderer, controls } = await initializeScene(mountRef.current);
        
        console.log('Scene initialized, setting refs...');
        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;
        controlsRef.current = controls;

        // Create boards
        console.log('Creating boards...');
        createBoards(scene);

        // Initialize pieces
        console.log('Initializing pieces...');
        const initialPieces = initializePieces();
        setPieces(initialPieces);
        
        // Create 3D pieces
        console.log('Creating 3D pieces...');
        createPieces(scene, initialPieces);

        // Set up mouse events
        console.log('Setting up mouse events...');
        handleMouseEvents(camera, scene, renderer, gameState, setGameState, pieces, setPieces);

        // Animation loop
        console.log('Starting animation loop...');
        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        // Handle window resize
        const handleResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        console.log('Game initialization complete!');
        setLoading(false);

        return () => {
          window.removeEventListener('resize', handleResize);
          if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
          }
        };
      } catch (error) {
        console.error('Error initializing game:', error);
        console.error('Error stack:', error.stack);
        setLoading(false);
      }
    };

    initGame();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  const handleGameModeChange = (mode) => {
    setGameState(prev => ({ ...prev, mode }));
  };

  const handleDifficultyChange = (difficulty) => {
    setGameState(prev => ({ ...prev, difficulty }));
  };

  const resetGame = () => {
    const initialPieces = initializePieces();
    setPieces(initialPieces);
    setGameState(prev => ({ 
      ...prev, 
      currentPlayer: 'red', 
      selectedPiece: null,
      gameStarted: false 
    }));
    
    if (sceneRef.current) {
      // Remove existing pieces
      const piecesToRemove = [];
      sceneRef.current.traverse((child) => {
        if (child.userData.isPiece) {
          piecesToRemove.push(child);
        }
      });
      piecesToRemove.forEach(piece => sceneRef.current.remove(piece));
      
      // Create new pieces
      createPieces(sceneRef.current, initialPieces);
    }
  };

  if (loading) {
    return <div className="loading">Loading 3D Checkers...</div>;
  }

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
        </div>
      </div>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}