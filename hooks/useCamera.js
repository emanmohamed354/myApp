import { useState, useRef } from 'react';
import { Alert } from 'react-native';

export const useCamera = () => {
  const cameraRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraType, setCameraType] = useState('back');

  const openCamera = (checkPermission) => {
    const hasPermission = checkPermission();
    if (hasPermission) {
      setShowCamera(true);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: false,
        });
        setCapturedImage(photo.uri);
        setShowCamera(false);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
  };

  return {
    cameraRef,
    showCamera,
    capturedImage,
    cameraType,
    setShowCamera,
    setCameraType,
    setCapturedImage,
    openCamera,
    takePicture,
    resetCamera
  };
};