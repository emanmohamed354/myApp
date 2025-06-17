import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import tw from 'twrnc';

const SensorIndicator = ({ value, config, size = 100 }) => {
  const percentage = Math.min((value / config.max) * 100, 100);
  const angle = (percentage * 270) / 100 - 135; // 270 degree arc starting at -135
  
  // Find current color based on value
  const currentColor = config.ranges.find(range => value <= range.max)?.color || '#EF4444';
  
  // Calculate arc path
  const radius = size / 2 - 10;
  const centerX = size / 2;
  const centerY = size / 2;
  
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };
  
  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  return (
    <View style={tw`items-center`}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {/* Background arc */}
          <Path
            d={describeArc(centerX, centerY, radius, -135, 135)}
            fill="none"
            stroke="#374151"
            strokeWidth="8"
          />
          {/* Value arc */}
          <Path
            d={describeArc(centerX, centerY, radius, -135, angle)}
            fill="none"
            stroke={currentColor}
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Center circle */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius - 10}
            fill="#1F2937"
          />
        </Svg>
        <View style={tw`absolute inset-0 items-center  justify-center`}>
          <Text style={[tw`text-white font-bold `, { fontSize: size / 4 }]}>
            {Math.round(value)}
          </Text>
          <Text style={tw`text-gray-400 text-xs`}>{config.unit}</Text>
        </View>
      </View>
      <Text style={tw`text-white text-sm mt-1`}>{config.name}</Text>
    </View>
  );
};

export default SensorIndicator;