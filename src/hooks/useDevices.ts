import { useMemo } from 'react';
import { useRemoteStore } from '../store/remoteStore';
import { Device, DeviceType } from '../data/devices';

export function useDevices() {
  const { devices, activeDeviceId, setActiveDevice, addDevice, removeDevice, updateDevice } =
    useRemoteStore();

  const activeDevice = useMemo(
    () => devices.find((d) => d.id === activeDeviceId) ?? devices[0],
    [devices, activeDeviceId]
  );

  const onlineDevices = useMemo(() => devices.filter((d) => d.isOnline), [devices]);

  const devicesByType = useMemo(
    () =>
      devices.reduce<Record<DeviceType, Device[]>>(
        (acc, d) => {
          if (!acc[d.type]) acc[d.type] = [];
          acc[d.type].push(d);
          return acc;
        },
        {} as Record<DeviceType, Device[]>
      ),
    [devices]
  );

  return {
    devices,
    activeDevice,
    activeDeviceId,
    onlineDevices,
    devicesByType,
    setActiveDevice,
    addDevice,
    removeDevice,
    updateDevice,
  };
}
