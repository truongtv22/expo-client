import React from 'react';
import { Text, View, Alert, Button, Linking } from 'react-native';

import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const BACKGROUND_FETCH_TASK = 'background-fetch';

export default function App() {
  React.useEffect(() => {
    const bootstrapAsync = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền hiển thị thông báo',
          'Ứng dụng yêu cầu quyền hiển thị thông báo',
          [
            { text: 'Huỷ bỏ' },
            { text: 'Mở Cài đặt', onPress: Linking.openSettings },
          ],
        );
      }
    };
    bootstrapAsync();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Hello world !!!</Text>
      <Button
        title="Start BackgroundFetch"
        onPress={async () => {
          const options = {
            // common
            minimumInterval: 15 * 60, // (seconds)
        
            // android only
            stopOnTerminate: false,
            startOnBoot: false,
          };
          await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, options);
          // ios only
          await BackgroundFetch.setMinimumIntervalAsync(15 * 60); // (seconds)
          await showNotification('BackgroundFetch', 'Start');
        }}
      />
      <Button
        title="Stop BackgroundFetch"
        onPress={async () => {
          await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
          await showNotification('BackgroundFetch', 'Stop');
        }}
      />
    </View>
  );
}

async function showNotification(title, body) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async ({ error }) => {
  if (!error) {
    await showNotification('BackgroundFetch', `Running ${new Date().toISOString()}`);
    return BackgroundFetch.Result.NewData;
  }
  await showNotification('BackgroundFetch', 'Error');
  return BackgroundFetch.Result.Failed;
});
