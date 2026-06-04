/* eslint-env jest */
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: ({ children, ...props }) =>
      React.createElement(View, props, children),
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    PanGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    ScrollView: View,
    FlatList: View,
    NativeViewGestureHandler: View,
  };
});

jest.mock('react-native-screens', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    enableScreens: jest.fn(),
    Screen: View,
    ScreenContainer: View,
    NativeScreen: View,
    NativeScreenContainer: View,
    ScreenStack: View,
    ScreenStackHeaderConfig: View,
  };
});

jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-ble-manager', () => ({
  __esModule: true,
  default: {
    start: jest.fn(() => Promise.resolve()),
    checkState: jest.fn(() => Promise.resolve('on')),
    getBondedPeripherals: jest.fn(() => Promise.resolve([])),
    scan: jest.fn(() => Promise.resolve()),
    stopScan: jest.fn(() => Promise.resolve()),
    getDiscoveredPeripherals: jest.fn(() => Promise.resolve([])),
    onDiscoverPeripheral: jest.fn(() => ({ remove: jest.fn() })),
    isPeripheralConnected: jest.fn(() => Promise.resolve(false)),
    connect: jest.fn(() => Promise.resolve()),
    disconnect: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('react-native-ir-manager', () => ({
  __esModule: true,
  default: {
    hasIrEmitter: jest.fn(() => Promise.resolve(false)),
    transmit: jest.fn(() => Promise.resolve(true)),
    transmitProntoCode: jest.fn(() => Promise.resolve(true)),
    getCarrierFrequencies: jest.fn(() => Promise.resolve([])),
  },
}));

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(() =>
      Promise.resolve({
        type: 'wifi',
        isConnected: true,
        details: { ipAddress: '192.168.1.42' },
      }),
    ),
    addEventListener: jest.fn(() => jest.fn()),
  },
}));

jest.mock('./src/store/remoteStore', () => {
  const state = {
    preferences: { onboardingComplete: true, haptics: true, confirmPower: false, defaultSubnet: '192.168.1' },
    devices: [],
    scenes: [],
    favorites: [],
    learnedIr: [],
    pairings: {},
  };
  return {
    useRemoteStore: (sel) => (typeof sel === 'function' ? sel(state) : state),
  };
});
