import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import tw from 'twrnc';
import NotificationItem from './NotificationItem';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';

const NotificationList = ({ 
  notifications, 
  isLoading, 
  onRefresh, 
  onNotificationPress 
}) => {
  if (isLoading && notifications.length === 0) {
    return <LoadingState />;
  }

  if (notifications.length === 0) {
    return <EmptyState />;
  }

  return (
    <ScrollView
      style={tw`flex-1`}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          colors={['#3B82F6']}
          tintColor="#3B82F6"
        />
      }
    >
      <View style={tw`px-4 py-2`}>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onPress={onNotificationPress}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default NotificationList;