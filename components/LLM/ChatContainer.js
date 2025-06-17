// components/LLM/ChatContainer.js - Update the message rendering part
import React from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, View, ActivityIndicator, Text } from 'react-native';
import tw from 'twrnc';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import EmptyChatState from './EmptyChatState';
import TypingIndicator from './TypingIndicator';

export default function ChatContainer({
  insets,
  goBack,
  startNewChat,
  messages,
  welcomeMessage,
  capturedImage,
  setCapturedImage,
  audioUri,
  setAudioUri,
  recordingDuration,
  playAudio,
  playingAudioUri,
  query,
  setQuery,
  handleSubmit,
  openCamera,
  startRecording,
  stopRecording,
  isRecording,
  setRecordingDuration,
  scrollViewRef,
  isTyping,
  formatDuration,
  isLoading
}) {
  // Process messages to add date separators
  const processedMessages = messages.map((message, index) => {
    let showDate = false;
    let date = '';
    
    if (index === 0) {
      // Always show date for first message
      showDate = true;
      date = formatMessageDate(message.fullTimestamp || new Date());
    } else {
      // Check if date changed from previous message
      const currentDate = new Date(message.fullTimestamp || new Date()).toDateString();
      const previousDate = new Date(messages[index - 1].fullTimestamp || new Date()).toDateString();
      
      if (currentDate !== previousDate) {
        showDate = true;
        date = formatMessageDate(message.fullTimestamp || new Date());
      }
    }
    
    return { ...message, showDate, date };
  });

  // Format date for display
  function formatMessageDate(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }

  const hasSentMessages = messages.length > 0;

  return (
    <KeyboardAvoidingView
      style={tw`flex-1 bg-gray-900`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ChatHeader insets={insets} goBack={goBack} startNewChat={startNewChat} />
      
      {isLoading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={tw`text-gray-400 mt-2`}>Loading messages...</Text>
        </View>
      ) : !hasSentMessages ? (
        <EmptyChatState
          welcomeMessage={welcomeMessage}
          capturedImage={capturedImage}
          setCapturedImage={setCapturedImage}
          audioUri={audioUri}
          setAudioUri={setAudioUri}
          recordingDuration={recordingDuration}
          formatDuration={formatDuration}
          playAudio={playAudio}
          playingAudioUri={playingAudioUri}
          query={query}
          setQuery={setQuery}
          handleSubmit={handleSubmit}
          openCamera={openCamera}
          startRecording={startRecording}
          stopRecording={stopRecording}
          isRecording={isRecording}
          setRecordingDuration={setRecordingDuration}
        />
      ) : (
        <>
          <ScrollView 
            ref={scrollViewRef}
            style={tw`flex-1 px-4`}
            contentContainerStyle={tw`py-4`}
          >
            {processedMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                playAudio={playAudio}
                formatDuration={formatDuration}
                playingAudioUri={playingAudioUri}
                showDate={message.showDate}
              />
            ))}

            {isTyping && <TypingIndicator />}
          </ScrollView>

          <ChatInput
            query={query}
            setQuery={setQuery}
            handleSubmit={handleSubmit}
            openCamera={openCamera}
            startRecording={startRecording}
            stopRecording={stopRecording}
            isRecording={isRecording}
            recordingDuration={recordingDuration}
            formatDuration={formatDuration}
            capturedImage={capturedImage}
            setCapturedImage={setCapturedImage}
            audioUri={audioUri}
            setAudioUri={setAudioUri}
            setRecordingDuration={setRecordingDuration}
            playAudio={playAudio}
            playingAudioUri={playingAudioUri}
          />
        </>
      )}
    </KeyboardAvoidingView>
  );
}