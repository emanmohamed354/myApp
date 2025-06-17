// components/LLM/MessageBubble.js
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

export default function MessageBubble({ message, playAudio, formatDuration, playingAudioUri, showDate }) {
  const isPlaying = playingAudioUri === message.audio;
  
  return (
    <>
      {/* Date separator */}
      {showDate && (
        <View style={tw`flex-row items-center my-4`}>
          <View style={tw`flex-1 h-[1px] bg-gray-700`} />
          <Text style={tw`mx-4 text-gray-500 text-xs`}>{message.date}</Text>
          <View style={tw`flex-1 h-[1px] bg-gray-700`} />
        </View>
      )}
      
      {/* Message bubble */}
      <View style={tw`mb-4 ${message.isUser ? 'items-end' : 'items-start'}`}>
        <View
          style={tw`max-w-[80%] px-4 py-3 rounded-2xl ${
            message.isUser 
              ? 'bg-blue-600 rounded-br-none' 
              : 'bg-gray-800 rounded-bl-none'
          }`}
        >
          {message.image && (
            <Image 
              source={{ uri: message.image }} 
              style={tw`w-48 h-48 rounded-lg mb-2`}
              resizeMode="cover"
            />
          )}
          
          {message.audio && (
            <TouchableOpacity
              onPress={() => playAudio(message.audio)}
              style={tw`flex-row items-center bg-black/20 rounded-full px-4 py-2 mb-2`}
            >
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={20} 
                color="white" 
              />
              <Text style={tw`text-white ml-2`}>
                {formatDuration(message.audioDuration || 0)}
              </Text>
              {isPlaying && (
                <View style={tw`ml-2 flex-row`}>
                  <View style={tw`w-1 h-3 bg-white rounded-full mx-0.5 opacity-30`} />
                  <View style={tw`w-1 h-5 bg-white rounded-full mx-0.5`} />
                  <View style={tw`w-1 h-3 bg-white rounded-full mx-0.5 opacity-30`} />
                </View>
              )}
            </TouchableOpacity>
          )}
          
          <Text style={tw`text-white ${message.isUser ? '' : 'text-gray-100'}`}>
            {message.text}
          </Text>
          
          <Text style={tw`text-xs mt-1 ${
            message.isUser ? 'text-blue-200' : 'text-gray-500'
          }`}>
            {message.timestamp}
          </Text>
        </View>
      </View>
    </>
  );
}