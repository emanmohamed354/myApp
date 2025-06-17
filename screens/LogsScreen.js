// screens/LogsScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import tw from 'twrnc';
import { logsApi } from '../services/logsApi';
import { syncService } from '../services/syncService';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function LogsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isCarPaired } = useAuth();
  const [activeTab, setActiveTab] = useState('diagnostic');
  const [diagnosticLogs, setDiagnosticLogs] = useState([]);
  const [eventLogs, setEventLogs] = useState([]);
  const [syncData, setSyncData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [error, setError] = useState(null);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  const emptyStateAnim = useRef(new Animated.Value(0)).current;
  const itemAnimations = useRef([]).current;
  
  // Header animations
  const iconRotateAnim = useRef(new Animated.Value(0)).current;
  const iconFloatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const statusDotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Start header animations
    startHeaderAnimations();

    if (isCarPaired) {
      loadLogs();
      loadSyncData();
      updateLastSyncTime();
    }
  }, [isCarPaired]);

  useEffect(() => {
    // Animate tab indicator
    const position = activeTab === 'diagnostic' ? 0 : activeTab === 'events' ? width / 3 : (width / 3) * 2;
    Animated.spring(tabIndicatorAnim, {
      toValue: position,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const updateLastSyncTime = async () => {
    const time = await syncService.getLastSyncTime();
    setLastSyncTime(time);
  };

const performSync = async () => {
  setIsSyncing(true);
  try {
    const response = await syncService.syncData();
    if (response) {
      setSyncData(response);
      await updateLastSyncTime();
      
      const diagnosticCount = response.diagnostics ? response.diagnostics.length : 0;
      const eventCount = response.events ? response.events.length : 0;
      
      Alert.alert(
        'Sync Complete',
        `Synced ${diagnosticCount} diagnostic${diagnosticCount !== 1 ? 's' : ''} and ${eventCount} event${eventCount !== 1 ? 's' : ''}.`,
        [{ text: 'OK' }]
      );
    }
  } catch (error) {
    console.error('Sync error:', error);
    Alert.alert(
      'Sync Failed',
      'Unable to sync data. Please try again later.',
      [{ text: 'OK' }]
    );
  } finally {
    setIsSyncing(false);
  }
};

const loadSyncData = async () => {
  try {
    const localData = await syncService.getLocalSyncData();
    setSyncData(localData || { readings: [], diagnostics: [], events: [] });
  } catch (error) {
    console.error('Error loading sync data:', error);
    setSyncData({ readings: [], diagnostics: [], events: [] });
  }
};

  const formatSyncTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getSensorIcon = (sensor) => {
    if (sensor.includes('TEMPERATURE')) return 'thermometer';
    if (sensor.includes('PRESSURE')) return 'gauge';
    if (sensor.includes('SPEED')) return 'speedometer';
    if (sensor.includes('RPM')) return 'engine';
    if (sensor.includes('FUEL')) return 'gas-station';
    if (sensor.includes('VOLTAGE')) return 'flash';
    if (sensor.includes('LOAD')) return 'weight';
    if (sensor.includes('AIR')) return 'air-filter';
    return 'car-info';
  };

  const formatSensorName = (name) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const startHeaderAnimations = () => {
    // Rotating animation for decorative icons
    Animated.loop(
      Animated.timing(iconRotateAnim, {
        toValue: 1,
        duration: 30000,
        useNativeDriver: true,
      })
    ).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconFloatAnim, {
          toValue: -10,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(iconFloatAnim, {
          toValue: 10,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for status indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Status dot blink
    Animated.loop(
      Animated.sequence([
        Animated.timing(statusDotAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(statusDotAnim, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadLogs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [diagnostic, events] = await Promise.all([
        logsApi.getDiagnosticLogs(),
        logsApi.getEventLogs()
      ]);
      
      setDiagnosticLogs(diagnostic || []);
      setEventLogs(events || []);
      
      // Animate items in
      animateItems(activeTab === 'diagnostic' ? diagnostic : activeTab === 'events' ? events : syncData);
    } catch (err) {
      console.error('Error loading logs:', err);
      setError('Failed to load logs');
    } finally {
      setIsLoading(false);
    }
  };

  const animateItems = (items) => {
    items.forEach((_, index) => {
      if (!itemAnimations[index]) {
        itemAnimations[index] = new Animated.Value(0);
      }
      
      Animated.timing(itemAnimations[index], {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleClearCode = async (log) => {
    Alert.alert(
      'Clear Diagnostic Code',
      `Are you sure you want to clear code ${log.code}?\n\nThis code has occurred ${log.occurrenceCount} times.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Code',
          style: 'destructive',
          onPress: async () => {
            try {
              await logsApi.clearDiagnosticCode(log.id);
              await loadLogs();
              Alert.alert('Success', 'Diagnostic code cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear diagnostic code');
            }
          }
        }
      ]
    );
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'info': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return 'alert-octagon';
      case 'warning': return 'alert-triangle';
      case 'info': return 'information';
      default: return 'help-circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#EF4444';
      case 'pending': return '#F59E0B';
      case 'cleared': return '#10B981';
      default: return '#6B7280';
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.abs(now - date) / 36e5;
    
    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }) + ' Today';
    } else if (diffHours < 48) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }) + ' Yesterday';
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const AnimatedHeader = () => {
    const rotate = iconRotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    // Calculate diagnostic stats
    const activeCodes = diagnosticLogs.filter(log => log.status === 'active').length;
    const pendingCodes = diagnosticLogs.filter(log => log.status === 'pending').length;
    const clearedCodes = diagnosticLogs.filter(log => log.status === 'cleared').length;
    const criticalCodes = diagnosticLogs.filter(log => log.severity === 'critical').length;

    return (
      <LinearGradient
        colors={
          activeCodes > 0 || criticalCodes > 0
            ? ['rgba(220, 38, 38, 0.4)', 'rgba(220, 38, 38, 0.25)', 'rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.9)']
            : ['rgba(59, 130, 246, 0.4)', 'rgba(59, 130, 246, 0.25)', 'rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.9)']
        }
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top }}
      >
        <View style={tw`px-4 pt-4 pb-6`}>
          {/* Decorative Header Section */}
          <View style={tw`relative mb-4`}>
            {/* Background decorative icons */}
            <View style={tw`absolute inset-0 flex-row justify-between items-center px-2`}>
              <Animated.View
                style={{
                  transform: [
                    { rotate },
                    { translateY: iconFloatAnim }
                  ],
                }}
              >
                <MaterialCommunityIcons 
                  name="car-cog" 
                  size={20} 
                  color="rgba(255, 255, 255, 0.1)" 
                  style={tw`absolute left-0 top-0`}
                />
              </Animated.View>
              
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                }}
              >
                <FontAwesome5 
                  name="tools" 
                  size={18} 
                  color="rgba(255, 255, 255, 0.1)" 
                  style={tw`absolute right-0 top-0`}
                />
              </Animated.View>
              
              <Animated.View
                style={{
                  transform: [{ translateY: iconFloatAnim }],
                }}
              >
                <MaterialCommunityIcons 
                  name="clipboard-text" 
                  size={20} 
                  color="rgba(255, 255, 255, 0.1)" 
                  style={tw`absolute left-8 bottom-0`}
                />
              </Animated.View>
              
              <MaterialCommunityIcons 
                name="history" 
                size={20} 
                color="rgba(255, 255, 255, 0.1)" 
                style={tw`absolute right-8 bottom-0`}
              />
            </View>
            
            {/* Main Title Section */}
            <View style={tw`items-center py-2`}>
              <View style={tw`flex-row items-center mb-1`}>
                <MaterialCommunityIcons 
                  name="database-search" 
                  size={16} 
                  color="rgba(255, 255, 255, 0.4)" 
                  style={tw`mr-2`}
                />
                <Text style={tw`text-gray-400 text-xs uppercase tracking-wider`}>
                  Vehicle Diagnostics
                </Text>
                <MaterialCommunityIcons 
                  name="database-search" 
                  size={16} 
                  color="rgba(255, 255, 255, 0.4)" 
                  style={tw`ml-2`}
                />
              </View>
              <Text style={tw`text-white text-xl font-bold`}>
                {activeTab === 'sync' ? 'Sensor Readings' : 'System Logs & Codes'}
              </Text>
              <View style={tw`flex-row items-center mt-1`}>
                {activeTab === 'sync' ? (
                  <>
                    <MaterialCommunityIcons 
                      name="cloud-sync" 
                      size={14} 
                      color="#60A5FA" 
                      style={tw`mr-2`}
                    />
                    <Text style={tw`text-gray-400 text-xs`}>
                      {lastSyncTime ? `Last sync: ${formatSyncTime(lastSyncTime)}` : 'Not synced yet'}
                    </Text>
                  </>
                ) : (
                  <>
                    <Animated.View
                      style={[
                        tw`h-2 w-2 rounded-full mr-2`,
                        {
                          backgroundColor: activeCodes > 0 ? '#EF4444' : '#10B981',
                          opacity: statusDotAnim,
                          transform: [{ scale: pulseAnim }],
                        },
                      ]}
                    />
                    <Text style={tw`text-gray-400 text-xs`}>
                      {activeCodes > 0 
                        ? `${activeCodes} Active ${activeCodes === 1 ? 'Code' : 'Codes'}` 
                        : 'All Systems Normal'}
                    </Text>
                    <Animated.View
                      style={[
                        tw`h-2 w-2 rounded-full ml-2`,
                        {
                          backgroundColor: activeCodes > 0 ? '#EF4444' : '#10B981',
                          opacity: statusDotAnim,
                          transform: [{ scale: pulseAnim }],
                        },
                      ]}
                    />
                  </>
                )}
              </View>
            </View>
          </View>

          {/* First Row - 3 Cards */}
          {activeTab !== 'sync' && (
            <View style={tw`flex-row justify-between mb-2`}>
              {/* Critical Codes Card */}
              <Animated.View
                style={[
                  tw`w-[31.5%]`,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: criticalCodes > 0 ? pulseAnim : 1 }],
                  }
                ]}
              >
                <LinearGradient
                  colors={criticalCodes > 0 
                    ? ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)']
                    : ['rgba(55, 65, 81, 0.5)', 'rgba(55, 65, 81, 0.3)']}
                  style={tw`rounded-xl p-3`}
                >
                  <View style={tw`items-center`}>
                    <View style={tw`bg-red-500/20 p-2 rounded-full mb-1`}>
                      <MaterialCommunityIcons 
                        name="alert-octagon" 
                        size={20} 
                        color={criticalCodes > 0 ? "#EF4444" : "#6B7280"} 
                      />
                    </View>
                    <Text style={tw`text-white text-xl font-bold`}>{criticalCodes}</Text>
                    <Text style={tw`text-gray-400 text-xs`}>Critical</Text>
                  </View>
                </LinearGradient>
              </Animated.View>

              {/* Active Codes Card */}
              <Animated.View
                style={[
                  tw`w-[31.5%]`,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: iconFloatAnim }],
                  }
                ]}
              >
                <LinearGradient
                  colors={activeCodes > 0 
                    ? ['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.1)']
                    : ['rgba(55, 65, 81, 0.5)', 'rgba(55, 65, 81, 0.3)']}
                  style={tw`rounded-xl p-3`}
                >
                  <View style={tw`items-center`}>
                    <View style={tw`bg-yellow-500/20 p-2 rounded-full mb-1`}>
                      <MaterialCommunityIcons 
                        name="alert-circle" 
                        size={20} 
                        color={activeCodes > 0 ? "#F59E0B" : "#6B7280"} 
                      />
                    </View>
                    <Text style={tw`text-white text-xl font-bold`}>{activeCodes}</Text>
                    <Text style={tw`text-gray-400 text-xs`}>Active</Text>
                  </View>
                </LinearGradient>
              </Animated.View>

              {/* Cleared Codes Card */}
              <Animated.View
                style={[
                  tw`w-[31.5%]`,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: pulseAnim }],
                  }
                ]}
              >
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.1)']}
                  style={tw`rounded-xl p-3`}
                >
                  <View style={tw`items-center`}>
                    <View style={tw`bg-green-500/20 p-2 rounded-full mb-1`}>
                      <MaterialCommunityIcons 
                        name="check-circle" 
                        size={20} 
                        color="#10B981" 
                      />
                    </View>
                    <Text style={tw`text-white text-xl font-bold`}>{clearedCodes}</Text>
                    <Text style={tw`text-gray-400 text-xs`}>Cleared</Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            </View>
          )}

          {/* Refresh Button */}
          <TouchableOpacity
            onPress={() => {
              if (activeTab === 'sync') {
                performSync();
              } else {
                loadLogs();
              }
            }}
            disabled={isLoading || isSyncing}
            style={tw`absolute right-4 top-4`}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: (isLoading || isSyncing)
                      ? iconRotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        })
                      : '0deg',
                  },
                ],
              }}
            >
              <Ionicons 
                name="refresh" 
                size={24} 
                color={(isLoading || isSyncing) ? "#6B7280" : "#60A5FA"} 
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Bottom decorative elements */}
          <View style={tw`flex-row justify-center items-center mt-4`}>
            <MaterialCommunityIcons 
              name="car-connected" 
              size={14} 
              color="rgba(255, 255, 255, 0.2)" 
              style={tw`mx-1`}
            />
            <View style={tw`h-1 w-16 bg-gray-800 rounded-full mx-2`}>
              <Animated.View 
                style={[
                  tw`h-1 rounded-full`,
                  {
                    width: `${((activeCodes + pendingCodes) / diagnosticLogs.length) * 100 || 0}%`,
                    backgroundColor: activeCodes > 0 ? '#EF4444' : '#10B981',
                    opacity: statusDotAnim,
                  }
                ]} 
              />
            </View>
            <MaterialCommunityIcons 
              name="bluetooth-connect" 
              size={14} 
              color="rgba(255, 255, 255, 0.2)" 
              style={tw`mx-1`}
            />
          </View>
        </View>
      </LinearGradient>
    );
  };

  const EmptyState = ({ type }) => {
    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(emptyStateAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(emptyStateAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);

    const scale = emptyStateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.1],
    });

    return (
      <View style={tw`flex-1 items-center justify-center py-20`}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <MaterialCommunityIcons 
            name={type === 'diagnostic' ? 'car-cog' : 'calendar-check'} 
            size={80} 
            color="#4B5563" 
          />
        </Animated.View>
        <Text style={tw`text-gray-400 text-lg mt-6 font-semibold`}>
          No {type} logs found
        </Text>
        <Text style={tw`text-gray-500 text-sm mt-2 text-center px-8`}>
          {type === 'diagnostic' 
            ? 'Your vehicle has no diagnostic trouble codes'
            : 'No events have been logged yet'}
        </Text>
        <View style={tw`mt-6 px-8`}>
          <View style={tw`bg-gray-800/50 rounded-xl p-4`}>
            <Text style={tw`text-green-400 text-center text-sm`}>
              ✓ All systems operating normally
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderDiagnosticLog = (log, index) => {
    const animStyle = {
      opacity: itemAnimations[index] || fadeAnim,
      transform: [
        {
          translateY: (itemAnimations[index] || fadeAnim).interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }),
        },
      ],
    };

    const isActive = log.status === 'active';
    const isPending = log.status === 'pending';
    const isCleared = log.status === 'cleared';

    return (
      <Animated.View key={log.id} style={[tw`mb-3`, animStyle]}>
        <TouchableOpacity
          style={tw`relative overflow-hidden`}
          onPress={() => handleClearCode(log)}
          disabled={isCleared}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              isActive ? ['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.05)']
              : isPending ? ['rgba(245, 158, 11, 0.1)', 'rgba(245, 158, 11, 0.05)']
              : ['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.05)']
            }
            style={tw`rounded-xl`}
          >
            <View style={tw`p-4`}>
              {/* Header Row */}
              <View style={tw`flex-row items-center justify-between mb-3`}>
                <View style={tw`flex-row items-center flex-1`}>
                  <View style={tw`mr-3`}>
                    <MaterialCommunityIcons 
                      name={getSeverityIcon(log.severity)} 
                      size={24} 
                      color={getSeverityColor(log.severity)} 
                    />
                  </View>
                  <View style={tw`flex-1`}>
                    <View style={tw`flex-row items-center`}>
                      <Text style={tw`text-white font-bold text-lg mr-2`}>{log.code}</Text>
                      <View 
                        style={[
                          tw`px-2 py-0.5 rounded-full`,
                          { backgroundColor: `${getSeverityColor(log.severity)}20` }
                        ]}
                      >
                        <Text style={[tw`text-xs font-semibold`, { color: getSeverityColor(log.severity) }]}>
                          {log.severity.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <View style={tw`flex-row items-center mt-1`}>
                      <View 
                        style={[
                          tw`w-2 h-2 rounded-full mr-1`,
                          { backgroundColor: getStatusColor(log.status) }
                        ]}
                      />
                      <Text style={[tw`text-xs capitalize`, { color: getStatusColor(log.status) }]}>
                        {log.status}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {!isCleared && (
                  <MaterialCommunityIcons 
                    name="chevron-right" 
                    size={20} 
                    color="#6B7280" 
                  />
                )}
              </View>
              
              {/* Description */}
              <Text style={tw`text-gray-300 text-sm mb-3 leading-5`}>{log.description}</Text>
              
              {/* Stats Row */}
              <View style={tw`flex-row items-center justify-between`}>
                <View style={tw`flex-row items-center`}>
                  <View style={tw`bg-gray-800/50 rounded-lg px-3 py-1.5 mr-2`}>
                    <Text style={tw`text-gray-400 text-xs`}>
                      <Text style={tw`text-white font-semibold`}>{log.occurrenceCount}</Text> occurrences
                    </Text>
                  </View>
                  {!isCleared && (
                    <View style={tw`bg-gray-800/50 rounded-lg px-3 py-1.5`}>
                      <Text style={tw`text-gray-400 text-xs`}>
                        {formatDate(log.lastOccurrence)}
                      </Text>
                    </View>
                  )}
                </View>
                
                {!isCleared && (
                  <TouchableOpacity
                    style={tw`bg-red-500/20 px-4 py-2 rounded-lg flex-row items-center`}
                    onPress={() => handleClearCode(log)}
                  >
                    <MaterialCommunityIcons name="close-circle" size={16} color="#EF4444" />
                    <Text style={tw`text-red-400 text-sm font-semibold ml-1`}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Cleared Info */}
              {isCleared && log.clearedAt && (
                <View style={tw`mt-3 bg-green-500/10 rounded-lg p-2 flex-row items-center`}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
                  <Text style={tw`text-green-400 text-xs ml-2`}>
                    Cleared on {formatDate(log.clearedAt)}
                  </Text>
                </View>
              )}
              
              {/* Sync Status */}
              <View style={tw`absolute top-2 right-2`}>
                {log.synced ? (
                  <MaterialCommunityIcons name="cloud-check" size={16} color="#10B981" />
                ) : (
                  <MaterialCommunityIcons name="cloud-off-outline" size={16} color="#6B7280" />
                )}
              </View>
            </View>
          </LinearGradient>
          
          {/* Side Accent Bar */}
          <View 
            style={[
              tw`absolute left-0 top-0 bottom-0 w-1`,
              { backgroundColor: getSeverityColor(log.severity) }
            ]} 
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEventLog = (log, index) => {
    const animStyle = {
      opacity: itemAnimations[index] || fadeAnim,
      transform: [
        {
          translateY: (itemAnimations[index] || fadeAnim).interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }),
        },
      ],
    };

    // Determine event type and icon
    const getEventIcon = (event) => {
      if (event.toLowerCase().includes('start')) return { name: 'play-circle', color: '#10B981' };
      if (event.toLowerCase().includes('stop')) return { name: 'stop-circle', color: '#EF4444' };
      if (event.toLowerCase().includes('connect')) return { name: 'bluetooth-connect', color: '#3B82F6' };
      if (event.toLowerCase().includes('disconnect')) return { name: 'bluetooth-off', color: '#F59E0B' };
      if (event.toLowerCase().includes('error')) return { name: 'alert-circle', color: '#EF4444' };
      return { name: 'information', color: '#6B7280' };
    };

    const eventIcon = getEventIcon(log.event || '');

    return (
      <Animated.View key={log.id} style={[tw`mb-3`, animStyle]}>
        <View style={tw`bg-gray-800/50 rounded-xl overflow-hidden`}>
          <View style={tw`p-4`}>
            {/* Header */}
            <View style={tw`flex-row items-start justify-between mb-2`}>
              <View style={tw`flex-row items-start flex-1`}>
                <View style={tw`bg-gray-700/50 p-2 rounded-lg mr-3`}>
                  <MaterialCommunityIcons 
                    name={eventIcon.name} 
                    size={20} 
                    color={eventIcon.color} 
                  />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-white font-semibold mb-1`}>{log.event}</Text>
                  <Text style={tw`text-gray-500 text-xs`}>
                    {formatDate(log.timestamp)}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Description */}
            {log.description && (
              <Text style={tw`text-gray-400 text-sm mt-2 leading-5`}>
                {log.description}
              </Text>
            )}
            
            {/* Details */}
            {log.details && (
              <TouchableOpacity 
                style={tw`mt-3`}
                onPress={() => Alert.alert('Event Details', JSON.stringify(log.details, null, 2))}
              >
                <View style={tw`bg-gray-900/50 rounded-lg p-3 flex-row items-center justify-between`}>
                  <View style={tw`flex-row items-center`}>
                    <MaterialCommunityIcons name="code-json" size={16} color="#6B7280" />
                    <Text style={tw`text-gray-500 text-xs ml-2`}>View Details</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={16} color="#6B7280" />
                </View>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Bottom Timestamp Bar */}
          <View style={tw`bg-gray-900/30 px-4 py-2 flex-row items-center justify-between`}>
            <Text style={tw`text-gray-600 text-xs`}>
              Event ID: {log.id.substring(0, 8)}...
            </Text>
            <MaterialCommunityIcons 
              name="clock-outline" 
              size={12} 
              color="#6B7280" 
            />
          </View>
        </View>
      </Animated.View>
    );
  };

const renderSyncData = () => {
  // Check if we have diagnostics data instead of sensor readings
  const hasDiagnostics = syncData.diagnostics && syncData.diagnostics.length > 0;
  const hasReadings = Array.isArray(syncData) && syncData.length > 0;
  
  if (!hasReadings && !hasDiagnostics) {
    return (
      <View style={tw`flex-1 items-center justify-center py-20`}>
        <MaterialCommunityIcons name="cloud-sync" size={80} color="#4B5563" />
        <Text style={tw`text-gray-400 text-lg mt-6 font-semibold`}>
          No sync data available
        </Text>
        <Text style={tw`text-gray-500 text-sm mt-2 text-center px-8`}>
          Tap the sync button to get the latest data
        </Text>
        <TouchableOpacity
          onPress={performSync}
          disabled={isSyncing}
          style={tw`bg-blue-600 rounded-lg px-6 py-3 mt-6 flex-row items-center`}
        >
          <MaterialCommunityIcons 
            name="sync" 
            size={20} 
            color="#fff" 
            style={tw`mr-2`}
          />
          <Text style={tw`text-white font-semibold`}>
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      {/* Sync Status Card */}
      <View style={tw`bg-gray-800/30 rounded-xl p-4 mb-4 border border-gray-700`}>
        <View style={tw`flex-row items-center justify-between mb-2`}>
          <View style={tw`flex-row items-center`}>
            <MaterialCommunityIcons name="cloud-check" size={16} color="#60A5FA" />
            <Text style={tw`text-gray-300 text-sm font-semibold ml-2`}>
              Sync Status
            </Text>
          </View>
          <TouchableOpacity
            onPress={performSync}
            disabled={isSyncing}
            style={tw`bg-blue-600/20 px-3 py-2 rounded-lg flex-row items-center`}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: isSyncing
                      ? iconRotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        })
                      : '0deg',
                  },
                ],
              }}
            >
              <MaterialCommunityIcons 
                name="sync" 
                size={16} 
                color={isSyncing ? "#6B7280" : "#60A5FA"} 
              />
            </Animated.View>
            <Text style={tw`text-blue-400 text-sm ml-2`}>
              {isSyncing ? 'Syncing...' : 'Sync'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={tw`text-gray-400 text-xs leading-5`}>
          {lastSyncTime 
            ? `Last synced ${formatSyncTime(lastSyncTime)}.`
            : 'No sync performed yet.'
          }
        </Text>
      </View>

      {/* Display Diagnostics if available */}
      {hasDiagnostics && (
        <>
          <View style={tw`bg-gray-800/30 rounded-xl p-4 mb-4 border border-gray-700`}>
            <View style={tw`flex-row items-center mb-2`}>
              <MaterialCommunityIcons name="car-cog" size={16} color="#F59E0B" />
              <Text style={tw`text-gray-300 text-sm font-semibold ml-2`}>
                Synced Diagnostics
              </Text>
            </View>
            <Text style={tw`text-gray-400 text-xs`}>
              {syncData.diagnostics.length} diagnostic {syncData.diagnostics.length === 1 ? 'code' : 'codes'} found
            </Text>
          </View>

          {syncData.diagnostics.map((diagnostic, index) => renderDiagnosticLog(diagnostic, index))}
        </>
      )}

      {/* Display Events if available */}
      {syncData.events && syncData.events.length > 0 && (
        <>
          <View style={tw`bg-gray-800/30 rounded-xl p-4 mb-4 border border-gray-700`}>
            <View style={tw`flex-row items-center mb-2`}>
              <MaterialCommunityIcons name="calendar-clock" size={16} color="#3B82F6" />
              <Text style={tw`text-gray-300 text-sm font-semibold ml-2`}>
                Synced Events
              </Text>
            </View>
            <Text style={tw`text-gray-400 text-xs`}>
              {syncData.events.length} event{syncData.events.length !== 1 ? 's' : ''} found
            </Text>
          </View>

          {syncData.events.map((event, index) => renderEventLog(event, index))}
        </>
      )}

      {/* Empty state for sensor readings */}
      {syncData.readings && syncData.readings.length === 0 && (
        <View style={tw`bg-gray-800/30 rounded-xl p-4 border border-gray-700`}>
          <View style={tw`flex-row items-center`}>
            <MaterialCommunityIcons name="gauge-empty" size={16} color="#6B7280" />
            <Text style={tw`text-gray-400 text-sm ml-2`}>
              No sensor readings available
            </Text>
          </View>
        </View>
      )}
    </>
  );
};

  if (!isCarPaired) {
    return (
      <View style={tw`flex-1 bg-gray-900`}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)']}
          style={{ paddingTop: insets.top }}
        >
          <View style={tw`px-4 py-4`}>
            <Text style={tw`text-white text-xl font-bold`}>Vehicle Logs</Text>
          </View>
        </LinearGradient>
        
        <View style={tw`flex-1 items-center justify-center`}>
          <MaterialCommunityIcons name="car-off" size={60} color="#4B5563" />
          <Text style={tw`text-gray-400 text-lg mt-4`}>No vehicle paired</Text>
          <Text style={tw`text-gray-500 text-sm mt-2 text-center px-8`}>
            Pair your vehicle to view diagnostic logs and events
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <AnimatedHeader />

      {/* Tab Selector - Updated with 3 tabs */}
      <Animated.View 
        style={[
          tw`px-4 mb-4`,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <View style={tw`bg-gray-800 rounded-xl p-1 flex-row mt-2`}>
          <TouchableOpacity
            style={tw`flex-1 py-3 items-center`}
            onPress={() => setActiveTab('diagnostic')}
          >
            <View style={tw`flex-row items-center`}>
              <MaterialCommunityIcons 
                name="car-cog" 
                size={16} 
                color={activeTab === 'diagnostic' ? '#fff' : '#9CA3AF'} 
                style={tw`mr-1`}
              />
              <Text style={tw`${activeTab === 'diagnostic' ? 'text-white font-semibold' : 'text-gray-400'} text-xs`}>
                Diagnostic
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={tw`flex-1 py-3 items-center`}
            onPress={() => setActiveTab('events')}
          >
            <View style={tw`flex-row items-center`}>
              <MaterialCommunityIcons 
                name="calendar-clock" 
                size={16} 
                color={activeTab === 'events' ? '#fff' : '#9CA3AF'} 
                style={tw`mr-1`}
              />
              <Text style={tw`${activeTab === 'events' ? 'text-white font-semibold' : 'text-gray-400'} text-xs`}>
                Events
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`flex-1 py-3 items-center`}
            onPress={() => setActiveTab('sync')}
          >
            <View style={tw`flex-row items-center`}>
              <MaterialCommunityIcons 
                name="cloud-sync" 
                size={16} 
                color={activeTab === 'sync' ? '#fff' : '#9CA3AF'} 
                style={tw`mr-1`}
              />
              <Text style={tw`${activeTab === 'sync' ? 'text-white font-semibold' : 'text-gray-400'} text-xs`}>
                Sync Data
              </Text>
            </View>
          </TouchableOpacity>
          
          {/* Animated indicator */}
          <Animated.View
            style={[
              tw`absolute bottom-1 h-0.5 bg-blue-500 rounded-full`,
              {
                width: '33.33%',
                transform: [{ translateX: tabIndicatorAnim }],
              }
            ]}
          />
        </View>
      </Animated.View>

      {/* Content */}
      <ScrollView
        style={tw`flex-1`}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              if (activeTab === 'sync') {
                performSync();
              } else {
                loadLogs();
              }
            }}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            tw`px-4 pb-4`,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {isLoading && diagnosticLogs.length === 0 && eventLogs.length === 0 && syncData.length === 0 ? (
            <View style={tw`flex-1 items-center justify-center py-20`}>
              <View style={tw`bg-gray-800 rounded-full p-4 mb-4`}>
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
              <Text style={tw`text-gray-400 font-semibold`}>Loading {activeTab} data...</Text>
              <Text style={tw`text-gray-500 text-xs mt-1`}>
                {activeTab === 'sync' ? 'Fetching sensor readings' : 'Fetching diagnostic data'}
              </Text>
            </View>
          ) : error && activeTab !== 'sync' ? (
            <View style={tw`flex-1 items-center justify-center py-20`}>
              <MaterialCommunityIcons name="alert-circle" size={60} color="#EF4444" />
              <Text style={tw`text-gray-400 text-lg mt-4`}>Error loading {activeTab}</Text>
              <Text style={tw`text-gray-500 text-sm mt-2`}>{error}</Text>
              <TouchableOpacity
                style={tw`bg-blue-600 rounded-lg px-6 py-2 mt-4`}
                onPress={loadLogs}
              >
                <Text style={tw`text-white font-semibold`}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {activeTab === 'diagnostic' ? (
                <>
                  {diagnosticLogs.length === 0 ? (
                    <EmptyState type="diagnostic" />
                  ) : (
                    <>
                      {/* Diagnostic Logs */}
                      {diagnosticLogs.map((log, index) => renderDiagnosticLog(log, index))}
                      
                      {/* Summary Card */}
                      {diagnosticLogs.length > 0 && (
                        <View style={tw`bg-gray-800/30 rounded-xl p-4 mb-4 border border-gray-700`}>
                          <View style={tw`flex-row items-center mb-2`}>
                            <MaterialCommunityIcons name="information" size={16} color="#60A5FA" />
                            <Text style={tw`text-gray-300 text-sm font-semibold ml-2`}>
                              Diagnostic Summary
                            </Text>
                          </View>
                          <Text style={tw`text-gray-400 text-xs leading-5`}>
                            Your vehicle has {diagnosticLogs.length} diagnostic {diagnosticLogs.length === 1 ? 'code' : 'codes'} recorded. 
                            {diagnosticLogs.filter(log => log.status === 'active').length > 0 && 
                              ` ${diagnosticLogs.filter(log => log.status === 'active').length} require attention.`
                            }
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </>
              ) : activeTab === 'events' ? (
                <>
                  {eventLogs.length === 0 ? (
                    <EmptyState type="events" />
                  ) : (
                    <>
                      {/* Events Summary */}
                      {eventLogs.length > 0 && (
                        <View style={tw`bg-gray-800/30 rounded-xl p-4 mb-4 border border-gray-700`}>
                          <View style={tw`flex-row items-center mb-2`}>
                            <MaterialCommunityIcons name="timeline" size={16} color="#60A5FA" />
                            <Text style={tw`text-gray-300 text-sm font-semibold ml-2`}>
                              Event Timeline
                            </Text>
                          </View>
                          <Text style={tw`text-gray-400 text-xs leading-5`}>
                            {eventLogs.length} system {eventLogs.length === 1 ? 'event' : 'events'} recorded. 
                            Latest event: {eventLogs[0]?.event || 'Unknown'}
                          </Text>
                        </View>
                      )}
                      
                      {/* Event Logs */}
                      {eventLogs.map((log, index) => renderEventLog(log, index))}
                    </>
                  )}
                </>
              ) : (
                // Sync Data Tab
                <>
                  {renderSyncData()}
                </>
              )}
            </>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}