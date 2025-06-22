// components/settings/SettingsSection.js
import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';

const SettingsSection = ({ title, children }) => {
  // Process children to add isLast prop only to valid React elements
  const childrenArray = React.Children.toArray(children);
  const modifiedChildren = childrenArray.map((child, index) => {
    // Only clone and add props if it's a valid React element and not a Fragment
    if (React.isValidElement(child) && child.type !== React.Fragment) {
      return React.cloneElement(child, {
        ...child.props,
        isLast: index === childrenArray.length - 1
      });
    }
    return child;
  });

  return (
    <View style={tw`mb-6`}>
      <Text style={tw`text-gray-400 text-sm uppercase tracking-wider px-4 mb-3`}>
        {title}
      </Text>
      <View style={tw`bg-gray-800 mx-4 rounded-xl overflow-hidden`}>
        {modifiedChildren}
      </View>
    </View>
  );
};

export default SettingsSection;