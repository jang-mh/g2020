import React, {useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import {getVersion} from 'react-native-device-info';

const FCM = ({webview, setFcmToken}) => {
  useEffect(() => {
    (async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        await messaging().registerDeviceForRemoteMessages();

        // Get the device token
        messaging()
          .getToken()
          .then(token => {
            console.log(token)
            setFcmToken(token);
          });

        // If using other push notification providers (ie Amazon SNS, etc)
        // you may need to get the APNs token instead for iOS:
        // if(Platform.OS == 'ios') { messaging().getAPNSToken().then(token => { return saveTokenToDatabase(token); }); }

        // Listen to whether the token changes
        return messaging().onTokenRefresh(token => {
          setFcmToken(token);
        });
      }

      if (authStatus === messaging.AuthorizationStatus.AUTHORIZED) {
        console.log('User has notification permissions enabled.');
      } else if (authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
        console.log('User has provisional notification permissions.');
      } else {
        console.log('User has notification permissions disabled');
      }
    })()
  }, []);

};
export default FCM;
