import React from 'react';
import { useFrame } from '@react-three/fiber';

const FlyingObject = React.forwardRef(({ position, speed }, ref) => {
  useFrame(() => {
    // z方向の移動を反対に
    ref.current.position.z += speed;

    // 画面を超えた場合にリセットする条件を変更
    if (ref.current.position.z > 100) {
      ref.current.position.z = -10;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color='red' />
    </mesh>
  );
});

export default FlyingObject;
