import { useState } from 'react';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';

export const useAudioRecording = () => {
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState(null);
  const [playingSound, setPlayingSound] = useState(null);
  const [playingAudioUri, setPlayingAudioUri] = useState(null);

  const startRecording = async (requestPermission) => {
    try {
      console.log('Requesting audio permissions...');
      const hasPermission = await requestPermission();
      
      if (!hasPermission) {
        Alert.alert('Permission needed', 'Please allow audio recording permission');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      
      // Start duration counter
      const interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      setRecordingInterval(interval);
      
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording...');
    if (!recording) return;
    
    try {
      clearInterval(recordingInterval);
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
      setAudioUri(uri);
      setRecording(undefined);
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const playAudio = async (uri) => {
    try {
      // If this audio is already playing, stop it
      if (playingAudioUri === uri && playingSound) {
        await playingSound.stopAsync();
        await playingSound.unloadAsync();
        setPlayingSound(null);
        setPlayingAudioUri(null);
        return;
      }

      // Stop any currently playing audio
      if (playingSound) {
        await playingSound.stopAsync();
        await playingSound.unloadAsync();
      }

      // Set audio mode for playback with higher volume
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false,
      });

      // Play the new audio
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { 
          shouldPlay: true,
          volume: 1.0,  // Maximum volume
        }
      );
      
      setPlayingSound(sound);
      setPlayingAudioUri(uri);
      
      // Set up listener for when audio finishes
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingSound(null);
          setPlayingAudioUri(null);
        }
      });
      
    } catch (error) {
      console.error('Error playing audio:', error);
      setPlayingSound(null);
      setPlayingAudioUri(null);
    }
  };

  const resetAudio = () => {
    setAudioUri(null);
    setRecordingDuration(0);
  };

  return {
    isRecording,
    audioUri,
    recordingDuration,
    playingAudioUri,
    startRecording,
    stopRecording,
    playAudio,
    resetAudio,
    setAudioUri,
    setRecordingDuration
  };
};