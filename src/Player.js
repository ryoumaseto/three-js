import React, { useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const Player = React.forwardRef(({ position }, ref) => {
  const [keysPressed, setKeysPressed] = useState({});
  const { camera } = useThree(); // カメラ情報を取得

  useEffect(() => {
    const handleKeyDown = (event) => {
      setKeysPressed((keys) => ({ ...keys, [event.key]: true }));
    };

    const handleKeyUp = (event) => {
      setKeysPressed((keys) => ({ ...keys, [event.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (!ref.current) return;

    const moveSpeed = 0.5;

    // カメラの方向を基準にした前後左右の移動ベクトルを計算
    const forward = new THREE.Vector3(); // カメラ前方向
    const right = new THREE.Vector3(); // カメラ右方向
    camera.getWorldDirection(forward);
    forward.y = 0; // Y軸方向を無視してXZ平面上で動くようにする
    forward.normalize();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize(); // 前方向とY軸で外積を計算

    // キー入力に基づく移動
    if (keysPressed['ArrowUp']) {
      ref.current.position.addScaledVector(forward, moveSpeed);
    }
    if (keysPressed['ArrowDown']) {
      ref.current.position.addScaledVector(forward, -moveSpeed);
    }
    if (keysPressed['ArrowLeft']) {
      ref.current.position.addScaledVector(right, -moveSpeed);
    }
    if (keysPressed['ArrowRight']) {
      ref.current.position.addScaledVector(right, moveSpeed);
    }
    if (keysPressed['w']) {
      ref.current.position.y += moveSpeed;
    }　
    if (keysPressed['s']) {
      ref.current.position.y -= moveSpeed;
    }

    // 画面外に出ないように制限
    const limit = 20;
    ref.current.position.x = Math.max(Math.min(ref.current.position.x, limit), -limit);
    ref.current.position.y = Math.max(Math.min(ref.current.position.y, limit), -limit);
    ref.current.position.z = Math.max(Math.min(ref.current.position.z, limit), -limit);
  });

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color='blue' />
    </mesh>
  );
});

export default Player;
