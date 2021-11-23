import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View, Button, Platform, TouchableOpacity, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [title, setTitle] = useState('Notificaçãozinha')
  const [body, setBody] = useState('Isso é uma notificação mano!')
  const [idDevice, setIdDevice] = useState('')

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<any>();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();


  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => setExpoPushToken(token ? token : "error"));

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      console.log(notification)
    });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  
  async function registerForPushNotificationsAsync() {
    let token;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log(existingStatus);
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      alert(status)
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    alert(token)
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    return token;
  }


  function registerDevice() {
    const body = {
      name: "MeuDevice",
      token:expoPushToken
    };

    fetch('http://13.58.139.237:3001/devices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    .then(async response => {
      const responseData = await response.json()
      alert(responseData.id)
    })
    .catch(error => {
      alert(error.message)
    });
  }

  async function sendNotification() {
    await fetch(`http://13.58.139.237:3001/notifications/sendOne/${idDevice}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      alert(response.status)
    })
    .catch(error => {
      alert(error.message)
    });
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text>Meu token:</Text>
      <TextInput style={styles.textField} value={expoPushToken}/>
      <View style={styles.space} />
      <Text>ID:</Text>
      <TextInput style={styles.textField} value={idDevice} onChangeText={setIdDevice} />
      <View style={styles.space} />
      <Text>Titulo:</Text>
      <TextInput style={styles.textField} value={title} onChangeText={setTitle} />
      <Text>Corpo:</Text>
      <TextInput style={styles.textField} value={body} onChangeText={setBody} />
      <Button color="#a3d"  title="Enviar" onPress={sendNotification} />
      <View style={styles.space} />
      <Button color="#e1a" title="Registrar dispositivo" onPress={registerDevice} />
      <View style={styles.space} />
      <Button color="#e1a" title="Habilitar notificacao" onPress={registerForPushNotificationsAsync} />
      <Text>{notification}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textField: {
    borderWidth: 1,
    width: '80%',
    height: 32,
    margin: 10,
    padding: 5,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 18
  },
  space:{ 
    margin: 10
  }
});
