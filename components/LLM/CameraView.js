import { View, TouchableOpacity } from 'react-native';
import React from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera'; // Note: CameraView instead of Camera
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
export default function CameraViewComponent({ cameraRef, cameraType, setCameraType, setShowCamera, takePicture }) {
  return (
    <View style={tw`flex-1 bg-black`}>
      <CameraView
        style={tw`flex-1`}
        facing={cameraType}
        ref={cameraRef}
      />
      
      {/* Overlay UI positioned absolutely on top */}
      <View style={[tw`absolute top-12 left-0 right-0 flex-row justify-between px-4`]}>
        <TouchableOpacity
          onPress={() => setShowCamera(false)}
          style={tw`bg-gray-800 rounded-full p-3`}
        >
          <MaterialCommunityIcons name="close" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setCameraType(cameraType === 'back' ? 'front' : 'back')}
          style={tw`bg-gray-800 rounded-full p-3`}
        >
          <MaterialCommunityIcons name="camera-flip" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={[tw`absolute bottom-0 left-0 right-0 pb-10 items-center`]}>
        <TouchableOpacity
          onPress={takePicture}
          style={tw`bg-white rounded-full p-4`}
        >
          <MaterialCommunityIcons name="camera" size={32} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
