// utils/phoneUtils.js
import { Linking, Alert } from 'react-native';

export const callCenter = (phoneNumber) => {
  if (phoneNumber && phoneNumber !== 'Not available' && phoneNumber !== 'Contact for details') {
    Linking.openURL(`tel:${phoneNumber}`);
  } else {
    Alert.alert('No Phone Number', 'Phone number not available for this center');
  }
};