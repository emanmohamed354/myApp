// utils/appointmentUtils.js
import { Alert } from 'react-native';

export const handleBookAppointment = ({ center, serviceType, date, time, notes, onSuccess }) => {
  if (!serviceType) {
    Alert.alert('Error', 'Please select a service type');
    return;
  }

  Alert.alert(
    'Confirm Appointment',
    `Book appointment at ${center.name} for ${serviceType} on ${date.toLocaleDateString()} at ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          // Here you would typically make an API call to book the appointment
          Alert.alert(
            'Success', 
            'Your appointment has been booked!\n\nYou will receive a confirmation message shortly.',
            [{ text: 'OK', onPress: onSuccess }]
          );
        }
      }
    ]
  );
};