import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

export default function EmptyChatState({
  welcomeMessage,
  capturedImage,
  setCapturedImage,
  audioUri,
  setAudioUri,
  recordingDuration,
  formatDuration,
  playAudio,
  playingAudioUri,
  query,
  setQuery,
  handleSubmit,
  openCamera,
  startRecording,
  stopRecording,
  isRecording,
  setRecordingDuration
}) {
  const isPlaying = playingAudioUri === audioUri;

  return (
    <View style={tw`flex-1 justify-center items-center px-4`}>
      <View style={tw`items-center mb-8`}>
        <Ionicons name="chatbubbles-outline" size={80} color="#4B5563" />
        <Text style={tw`text-gray-400 text-lg mt-4 text-center`}>
          {welcomeMessage}
        </Text>
      </View>

      <View style={tw`w-full max-w-md`}>
        {/* Media Preview */}
        {(capturedImage || audioUri) && (
          <ScrollView 
            horizontal 
            style={tw`mb-3`}
            showsHorizontalScrollIndicator={false}
          >
            {capturedImage && (
              <View style={tw`relative mr-2`}>
                <Image 
                  source={{ uri: capturedImage }} 
                  style={tw`w-20 h-20 rounded-lg`}
                />
                <TouchableOpacity
                  onPress={() => setCapturedImage(null)}
                  style={tw`absolute -top-2 -right-2 bg-red-500 rounded-full p-1`}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            )}
            
            {audioUri && (
              <TouchableOpacity
                onPress={() => playAudio(audioUri)}
                style={tw`flex-row items-center mr-2`}
              >
                <View style={tw`bg-blue-600 rounded-full p-2 mr-2`}>
                  <Ionicons 
                    name={isPlaying ? "pause" : "play"} 
                    size={20} 
                    color="white" 
                  />
                </View>
                <Text style={tw`text-white mr-2`}>
                  {formatDuration(recordingDuration)}
                </Text>
                {isPlaying && (
                  <View style={tw`flex-row`}>
                    <View style={tw`w-1 h-3 bg-white rounded-full mx-0.5 opacity-30`} />
                    <View style={tw`w-1 h-5 bg-white rounded-full mx-0.5`} />
                    <View style={tw`w-1 h-3 bg-white rounded-full mx-0.5 opacity-30`} />
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => {
                    setAudioUri(null);
                    setRecordingDuration(0);
                  }}
                  style={tw`ml-3`}
                >
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <View style={tw`flex-row items-center justify-center mb-3`}>
            <View style={tw`w-3 h-3 bg-red-500 rounded-full mr-2`} />
            <Text style={tw`text-red-500 font-medium`}>
              Recording... {formatDuration(recordingDuration)}
            </Text>
          </View>
        )}

        {/* Input Area */}
        <View style={tw`flex-row items-end bg-gray-800 rounded-3xl px-4 py-2`}>
          <TextInput
            style={tw`flex-1 text-white text-base max-h-32 py-2`}
            placeholder="Ask about your vehicle..."
            placeholderTextColor="#6B7280"
            value={query}
            onChangeText={setQuery}
            multiline
            editable={!isRecording}
          />
          
          <TouchableOpacity
            onPress={openCamera}
            style={tw`p-2`}
            disabled={isRecording}
          >
            <Ionicons 
              name="camera" 
              size={24} 
              color={isRecording ? "#374151" : "#6B7280"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}
            style={tw`p-2`}
          >
            <Ionicons 
              name={isRecording ? "stop-circle" : "mic"} 
              size={24} 
              color={isRecording ? "#EF4444" : "#6B7280"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!query.trim() && !capturedImage && !audioUri}
            style={tw`p-2`}
          >
            <Ionicons 
              name="send" 
              size={24} 
              color={query.trim() || capturedImage || audioUri ? "#3B82F6" : "#374151"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}