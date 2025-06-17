import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Path, Line, G, Text as SvgText, Defs, LinearGradient, Stop, RadialGradient } from 'react-native-svg';
import tw from 'twrnc';

const MainRPMIndicator = ({ value, size = 200 }) => {
  const max = 9000;
  const percentage = Math.min((value / max) * 100, 100);
  const angle = (percentage * 180) / 100 - 90; // 180 degree arc (semi-circle)
  
  const width = size * 1.5;
  const height = size * 0.7;
  const radius = size / 2 - 20;
  const centerX = width / 2;
  const centerY = height - 10;
  
  // Progressive color scheme
  let primaryColor = '#00FF88';
  let secondaryColor = '#00CC6A';
  
  if (value > 7000) {
    primaryColor = '#FF3366';
    secondaryColor = '#FF0044';
  } else if (value > 5000) {
    primaryColor = '#FFB800';
    secondaryColor = '#FF9500';
  } else if (value > 3000) {
    primaryColor = '#00D4FF';
    secondaryColor = '#0099CC';
  }
  
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

  // Create tick marks data
  const majorTicks = [];
  const minorTicks = [];
  
  for (let i = 0; i <= 9; i++) {
    const tickAngle = (i / 9) * 180 - 90;
    majorTicks.push({ angle: tickAngle, value: i });
    
    if (i < 9) {
      for (let j = 1; j <= 4; j++) {
        const minorAngle = tickAngle + (j * 20) / 5;
        minorTicks.push({ angle: minorAngle });
      }
    }
  }

  return (
    <View style={tw`items-center`}>
      <View style={{ width, height: height + 40 }}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            {/* Main gradient */}
            <LinearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={secondaryColor} />
              <Stop offset="100%" stopColor={primaryColor} />
            </LinearGradient>
          </Defs>

          {/* Background arc track */}
          <Path
            d={describeArc(centerX, centerY, radius + 10, -90, 90)}
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="20"
          />
          
          {/* Inner track */}
          <Path
            d={describeArc(centerX, centerY, radius, -90, 90)}
            fill="none"
            stroke="#2a2a2a"
            strokeWidth="2"
          />
          
          {/* Colored segments */}
          <Path
            d={describeArc(centerX, centerY, radius + 10, -90, -30)}
            fill="none"
            stroke="#00FF88"
            strokeWidth="18"
            opacity="0.15"
          />
          <Path
            d={describeArc(centerX, centerY, radius + 10, -30, 20)}
            fill="none"
            stroke="#00D4FF"
            strokeWidth="18"
            opacity="0.15"
          />
          <Path
            d={describeArc(centerX, centerY, radius + 10, 20, 60)}
            fill="none"
            stroke="#FFB800"
            strokeWidth="18"
            opacity="0.15"
          />
          <Path
            d={describeArc(centerX, centerY, radius + 10, 60, 90)}
            fill="none"
            stroke="#FF3366"
            strokeWidth="18"
            opacity="0.25"
          />
          
          {/* Active progress arc */}
          <Path
            d={describeArc(centerX, centerY, radius + 10, -90, angle)}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="18"
            strokeLinecap="round"
          />
          
          {/* Minor tick marks */}
          {minorTicks.map((tick, i) => {
            const start = polarToCartesian(centerX, centerY, radius - 8, tick.angle);
            const end = polarToCartesian(centerX, centerY, radius - 4, tick.angle);
            return (
              <Line
                key={`minor-${i}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="#333"
                strokeWidth="0.5"
              />
            );
          })}
          
          {/* Major tick marks and numbers */}
          {majorTicks.map((tick, i) => {
            const start = polarToCartesian(centerX, centerY, radius - 15, tick.angle);
            const end = polarToCartesian(centerX, centerY, radius - 4, tick.angle);
            const textPos = polarToCartesian(centerX, centerY, radius - 28, tick.angle);
            
            const isRedline = tick.value >= 7;
            
            return (
              <G key={`major-${i}`}>
                <Line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={isRedline ? '#FF3366' : '#666'}
                  strokeWidth="2"
                />
                <SvgText
                  x={textPos.x}
                  y={textPos.y}
                  fill={isRedline ? '#FF3366' : '#999'}
                  fontSize="12"
                  fontWeight="600"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {tick.value}
                </SvgText>
              </G>
            );
          })}
          
          {/* Modern needle */}
          <G>
            {/* Needle base */}
            <Circle
              cx={centerX}
              cy={centerY}
              r="20"
              fill="#1a1a1a"
              stroke="#333"
              strokeWidth="1"
            />
            
            {/* Needle */}
            {(() => {
              const needleLength = radius - 20;
              const needleEnd = polarToCartesian(centerX, centerY, needleLength, angle);
              const needleBase1 = polarToCartesian(centerX, centerY, 15, angle - 90);
              const needleBase2 = polarToCartesian(centerX, centerY, 15, angle + 90);
              
              return (
                <Path
                  d={`M ${needleBase1.x} ${needleBase1.y} L ${needleEnd.x} ${needleEnd.y} L ${needleBase2.x} ${needleBase2.y} Z`}
                  fill={primaryColor}
                  stroke={primaryColor}
                  strokeWidth="1"
                />
              );
            })()}
            
            {/* Center dot */}
            <Circle
              cx={centerX}
              cy={centerY}
              r="8"
              fill="#000"
              stroke={primaryColor}
              strokeWidth="2"
            />
          </G>
        </Svg>
        
        {/* Bottom display section */}
        <View style={tw`mt-2`}>
          {/* Main RPM display */}
          <View style={tw`items-center`}>
            <View style={tw`flex-row items-baseline`}>
              <Text style={[
                tw`text-3xl font-bold`,
                { color: primaryColor }
              ]}>
                {Math.floor(value).toString().padStart(4, '0')}
              </Text>
              <Text style={tw`text-sm font-semibold text-gray-500 ml-1`}>
                RPM
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MainRPMIndicator;