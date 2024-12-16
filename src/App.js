import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Player from './Player';
import './modal.css';

// 飛んでくるオブジェクト
const FlyingObject = React.forwardRef(({ position }, ref) => (
  <mesh ref={ref} position={position}>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="red" />
  </mesh>
));

// ランダムに動くオブジェクトラッパー
const FlyingObjectWrapper = React.forwardRef(({ initialPosition, speedVector, isGameActive }, ref) => {
  const objectRef = useRef();

  useFrame(() => {
    if (objectRef.current && isGameActive) {
      objectRef.current.position.x += speedVector[0];
      objectRef.current.position.y += speedVector[1];
      objectRef.current.position.z += speedVector[2];

      // プレイヤーを超えた場合リセット
      if (objectRef.current.position.z > 10) {
        const newPosition = generateRandomPosition();
        objectRef.current.position.set(...newPosition);
      }
    }
  });

  return (
    <FlyingObject
      ref={(el) => {
        objectRef.current = el;
        if (ref) ref.current.push(el); // 親のref配列に追加
      }}
      position={initialPosition}
    />
  );
});

// ランダム位置・速度生成
const generateRandomPosition = () => {
  const range = 50; // スポーン範囲
  return [
    Math.random() * range - range / 2,
    Math.random() * range - range / 2,
    -(Math.random() * 50 + 10), // 遠い位置で生成
  ];
};

const generateRandomSpeed = () => {
  const range = 1; // 速度範囲
  return [
    Math.random() * range - range / 2,
    Math.random() * range - range / 2,
    Math.random() * range + 0.5, // カメラ方向
  ];
};

const App = () => {
  const playerRef = useRef();
  const flyingObjects = useRef([]);
  const [collision, setCollision] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const handleCollision = () => {
    setCollision(true);
    setIsGameActive(false);
    setElapsedTime(((Date.now() - startTime) / 1000).toFixed(2));
  };

  const checkCollision = (player, object) => {
    if (!player || !object) return false;
    const playerBox = new THREE.Box3().setFromObject(player);
    const objectBox = new THREE.Box3().setFromObject(object);
    return playerBox.intersectsBox(objectBox);
  };

  // 衝突判定
  const CollisionChecker = ({ playerRef, flyingObjects, handleCollision }) => {
    useFrame(() => {
      if (!isGameActive) return;

      const player = playerRef.current;
      if (player) {
        for (let obj of flyingObjects.current) {
          if (obj && checkCollision(player, obj)) {
            handleCollision();
          }
        }
      }
    });
    return null;
  };

  const handleGameStart = () => {
    setIsGameActive(true);
    setCollision(false);
    setStartTime(Date.now());
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space' && !isGameActive) {
        handleGameStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGameActive]);
  
  return (
    <>
    {!isGameActive && (
      <div className="start-screen">
        <h2>スペースキーでゲーム開始</h2>
        <p>青色の物体を操作して赤色の物体を捕まえよう</p>
      </div>
    )}
      {collision && (
        <div className="modal">
          <div className="modal-content">
            <h2>お見事！</h2>
            <p>飛んでくる物体をとらえました。</p>
            <p>時間: {elapsedTime} 秒</p>
            <button onClick={() => window.location.reload()}>スペースキーでスタート</button>
          </div>
        </div>
      )}
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <Canvas camera={{ position: [0, 5, 20], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[0, 10, 10]} intensity={2} distance={100} decay={2} />
          <spotLight position={[0, 20, 20]} angle={Math.PI / 6} penumbra={0.5} intensity={1.5} castShadow />

          {/* ランダムな飛んでくる物体 */}
          {Array.from({ length: 10 }).map((_, i) => (
            <FlyingObjectWrapper
              key={i}
              ref={flyingObjects}
              initialPosition={generateRandomPosition()}
              speedVector={generateRandomSpeed()}
              isGameActive={isGameActive}
            />
          ))}

          {/* 衝突判定 */}
          <CollisionChecker 
            playerRef={playerRef} 
            flyingObjects={flyingObjects} 
            handleCollision={handleCollision} 
          />
          {/* プレイヤー */}
          <Player ref={playerRef} position={[0, 0, 0]} />
          {!isGameActive && <OrbitControls />}
        </Canvas>
      </div>
    </>
  );
};

export default App;
