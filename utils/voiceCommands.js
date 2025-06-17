// utils/voiceCommands.js
import Voice from '@react-native-voice/voice';
import * as Speech from 'expo-speech';

export class VoiceCommandService {
  static commands = {
    // Navigation commands
    'navigate home': { action: 'navigate', screen: 'Home' },
    'go to settings': { action: 'navigate', screen: 'Settings' },
    'show appointments': { action: 'navigate', screen: 'Appointment' },
    'open assistant': { action: 'navigate', screen: 'LLM' },
    
    // Car status commands
    'check engine': { action: 'checkStatus', type: 'engine' },
    'what is my speed': { action: 'readSensor', sensor: 'VEHICLE_SPEED' },
    'engine temperature': { action: 'readSensor', sensor: 'ENGINE_COOLANT_TEMPERATURE' },
    'car health': { action: 'checkHealth' },
    
    // Actions
    'book appointment': { action: 'bookAppointment' },
    'call emergency': { action: 'emergency' },
    'start recording': { action: 'startDiagnostics' },
    'stop recording': { action: 'stopDiagnostics' },
  };

  static callbacks = {};
  static isListening = false;

  static initialize(callbacks) {
    this.callbacks = callbacks;
    
    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechError = this.onSpeechError;
  }

  static async startListening() {
    try {
      this.isListening = true;
      await Voice.start('en-US');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      this.isListening = false;
    }
  }

  static async stopListening() {
    try {
      this.isListening = false;
      await Voice.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  }

  static onSpeechStart = (event) => {
    console.log('Speech recognition started');
  };

  static onSpeechEnd = (event) => {
    console.log('Speech recognition ended');
  };

  static onSpeechResults = (event) => {
    const text = event.value[0].toLowerCase();
    console.log('Speech results:', text);
    
    // Process command
    this.processCommand(text);
  };

  static onSpeechError = (event) => {
    console.error('Speech recognition error:', event.error);
    this.isListening = false;
  };

  static processCommand(text) {
    // Find matching command
    for (const [pattern, command] of Object.entries(this.commands)) {
      if (text.includes(pattern)) {
        this.executeCommand(command, text);
        return;
      }
    }
    
    // No exact match, try AI interpretation
    this.callbacks.onUnknownCommand?.(text);
  }

  static executeCommand(command, originalText) {
    switch (command.action) {
      case 'navigate':
        this.callbacks.navigate?.(command.screen);
        this.speak(`Navigating to ${command.screen}`);
        break;
        
      case 'readSensor':
        const value = this.callbacks.getSensorValue?.(command.sensor);
        if (value !== undefined) {
          const unit = this.getSensorUnit(command.sensor);
          this.speak(`Current ${command.sensor.replace(/_/g, ' ').toLowerCase()} is ${value} ${unit}`);
        } else {
          this.speak('Unable to read sensor value');
        }
        break;
        
      case 'checkHealth':
        const health = this.callbacks.getCarHealth?.();
        if (health) {
          this.speak(`Your car health is ${health} percent`);
        }
        break;
        
      case 'checkStatus':
        this.callbacks.checkStatus?.(command.type);
        break;
        
      case 'bookAppointment':
        this.callbacks.navigate?.('Appointment');
        this.speak('Opening appointment booking');
        break;
        
      case 'emergency':
        this.callbacks.emergency?.();
        this.speak('Calling emergency services');
        break;
        
      case 'startDiagnostics':
        this.callbacks.startDiagnostics?.();
        this.speak('Starting diagnostics recording');
        break;
        
      case 'stopDiagnostics':
        this.callbacks.stopDiagnostics?.();
        this.speak('Stopping diagnostics recording');
        break;
    }
  }

  static getSensorUnit(sensor) {
    const units = {
      VEHICLE_SPEED: 'kilometers per hour',
      ENGINE_RPM: 'RPM',
      ENGINE_COOLANT_TEMPERATURE: 'degrees celsius',
      FUEL_TANK_LEVEL_INPUT: 'percent',
      ENGINE_LOAD: 'percent',
    };
    return units[sensor] || '';
  }

  static async speak(text, options = {}) {
    const defaultOptions = {
      language: 'en-US',
      pitch: 1.0,
      rate: 1.0,
    };
    
    await Speech.speak(text, { ...defaultOptions, ...options });
  }

  static destroy() {
    Voice.destroy().then(Voice.removeAllListeners);
  }
}

