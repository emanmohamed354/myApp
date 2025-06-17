// utils/security.js
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

export class SecurityManager {
  static async encryptSensitiveData(data) {
    const jsonString = JSON.stringify(data);
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      jsonString
    );
    return digest;
  }

  static async saveSecureData(key, value) {
    try {
      await SecureStore.setItemAsync(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving secure data:', error);
    }
  }

  static async getSecureData(key) {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting secure data:', error);
      return null;
    }
  }

  static async deleteSecureData(key) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error deleting secure data:', error);
    }
  }

  static sanitizeInput(input) {
    // Remove potential XSS attempts
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
  }
}