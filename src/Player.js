import React, { useEffect, useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const Player = React.forwardRef(({ position }, ref) => {
  const [keysPressed, setKeysPressed] = useState({});
  const { camera } = useThree();
  const groupRef = useRef();

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
    if (!groupRef.current) return;

    const moveSpeed = 0.5;

    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    if (keysPressed['ArrowUp']) {
      groupRef.current.position.addScaledVector(forward, moveSpeed);
    }
    if (keysPressed['ArrowDown']) {
      groupRef.current.position.addScaledVector(forward, -moveSpeed);
    }
    if (keysPressed['ArrowLeft']) {
      groupRef.current.position.addScaledVector(right, -moveSpeed);
    }
    if (keysPressed['ArrowRight']) {
      groupRef.current.position.addScaledVector(right, moveSpeed);
    }
    if (keysPressed['w']) {
      groupRef.current.position.y += moveSpeed;
    }　
    if (keysPressed['s']) {
      groupRef.current.position.y -= moveSpeed;
    }

    const limit = 20;
    groupRef.current.position.x = Math.max(Math.min(groupRef.current.position.x, limit), -limit);
    groupRef.current.position.y = Math.max(Math.min(groupRef.current.position.y, limit), -limit);
    groupRef.current.position.z = Math.max(Math.min(groupRef.current.position.z, limit), -limit);

    // Update the ref's position to match the group's position
    if (ref && ref.current) {
      ref.current.position.copy(groupRef.current.position);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.3, 1, 4, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.4, 0.1, 0]}>
        <capsuleGeometry args={[0.1, 0.6, 4, 8]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.4, 0.1, 0]}>
        <capsuleGeometry args={[0.1, 0.6, 4, 8]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.2, -0.8, 0]}>
        <capsuleGeometry args={[0.12, 0.6, 4, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.2, -0.8, 0]}>
        <capsuleGeometry args={[0.12, 0.6, 4, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </group>
  );
});

export default Player;
