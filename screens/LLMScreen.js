// screens/LLMScreen.js
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import PairingRequired from '../components/PairingRequired';

// Import hooks
import { usePermissions } from '../hooks/usePermissions';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { useCamera } from '../hooks/useCamera';
import { useChat } from '../hooks/useChat';
import { useChatHistory } from '../hooks/useChatHistory';

// Import constants
import { WELCOME_MESSAGES } from '../Constants/constants';

// screens/LLMScreen.js (continued)
import { formatDuration, getRandomWelcomeMessage } from '../utils/utils';

// Import components
import CameraView from '../components/LLM/CameraView';
import HistoryScreen from '../components/LLM/HistoryScreen';
import ChatContainer from '../components/LLM/ChatContainer';

export default function LLMScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isCarPaired } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('history');
  const [welcomeMessage] = useState(getRandomWelcomeMessage(WELCOME_MESSAGES));

  // Check if car is paired
  if (!isCarPaired) {
    return <PairingRequired feature="AI Assistant" />;
  }

  // Custom hooks
  const { checkCameraPermission, requestAudioPermission } = usePermissions();
  
  const { chatHistory, isLoading: isLoadingHistory, loadChatHistory, renameChat } = useChatHistory();

  const {
    isRecording,
    audioUri,
    recordingDuration,
    playingAudioUri,
    startRecording: startAudioRecording,
    stopRecording,
    playAudio,
    resetAudio,
    setAudioUri,
    setRecordingDuration
  } = useAudioRecording();

  const {
    cameraRef,
    showCamera,
    capturedImage,
    cameraType,
    setShowCamera,
    setCameraType,
    setCapturedImage,
    takePicture,
    resetCamera
  } = useCamera();

  const {
    scrollViewRef,
    query,
    setQuery,
    messages,
    isTyping,
    isLoading: isLoadingChat,
    currentChatId,
    handleSubmit: submitMessage,
    startNewChat: resetChat,
    loadChat: loadChatMessages,
  } = useChat();

  // Add a useEffect to refresh chat history when returning to history screen
  useEffect(() => {
    if (currentScreen === 'history') {
      loadChatHistory();
    }
  }, [currentScreen]);

  // Navigation functions
  const goBack = () => {
    setCurrentScreen('history');
  };

  const loadChat = async (chat) => {
    setCurrentScreen('chat');
    await loadChatMessages(chat.id);
  };

  const startNewChat = async () => {
    console.log('Starting new chat - resetting everything');
    resetChat();
    resetCamera();
    resetAudio();
    setCurrentScreen('chat');
  };

  // Media handling
  const openCamera = async () => {
    const hasPermission = await checkCameraPermission();
    if (hasPermission) {
      setShowCamera(true);
    }
  };

  const startRecording = async () => {
    await startAudioRecording(requestAudioPermission);
  };

  const resetMedia = () => {
    resetCamera();
    resetAudio();
  };

  const handleSubmit = () => {
    submitMessage(capturedImage, audioUri, recordingDuration, resetMedia);
  };

  // Camera View
  if (showCamera) {
    return (
      <CameraView 
        cameraRef={cameraRef} 
        cameraType={cameraType} 
        setCameraType={setCameraType} 
        setShowCamera={setShowCamera} 
        takePicture={takePicture} 
      />
    );
  }

  // History Screen
  if (currentScreen === 'history') {
    return (
      <HistoryScreen 
        insets={insets} 
        chatHistory={chatHistory} 
        loadChat={loadChat} 
        startNewChat={startNewChat}
        isLoading={isLoadingHistory}
        renameChat={renameChat} 
      />
    );
  }

  // Chat Screen
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ChatContainer 
        playingAudioUri={playingAudioUri} 
        insets={insets} 
        goBack={goBack} 
        startNewChat={startNewChat} 
        messages={messages} 
        welcomeMessage={welcomeMessage} 
        capturedImage={capturedImage} 
        setCapturedImage={setCapturedImage} 
        audioUri={audioUri} 
        setAudioUri={setAudioUri} 
        recordingDuration={recordingDuration} 
        playAudio={playAudio} 
        query={query} 
        setQuery={setQuery} 
        handleSubmit={handleSubmit} 
        openCamera={openCamera} 
        startRecording={startRecording} 
        stopRecording={stopRecording} 
        isRecording={isRecording} 
        setRecordingDuration={setRecordingDuration} 
        scrollViewRef={scrollViewRef} 
        isTyping={isTyping} 
        formatDuration={formatDuration}
        isLoading={isLoadingChat}
      />
    </>
  );
}