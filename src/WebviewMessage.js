import React from 'react';
import {Alert, Platform, Linking} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from 'react-native-splash-screen';
// import RNExitApp from 'react-native-exit-app';

const WebviewMessage = (e, methods, webview) => {
  console.log(e.nativeEvent.data)

  const setStorage = async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      throw Error(e);
    }
  };

  const removeStorage = async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      throw Error(e);
    }
  };

  const clearStorage = () => {
    AsyncStorage.clear();
  };

  const clearCache = () => {
    webview.current.clearCache(true);
  };

  const data = JSON.parse(e.nativeEvent.data);

  switch (data.name) {
    case 'setStorage':
      setStorage(data.message.key, data.message.val);
      break;

    case 'removeStorage':
      removeStorage(data.message.key);
      break;

    case 'clearData':
      clearStorage();
      if (Platform.OS === 'android') {
        clearCache();
      }
      break;

    case 'reloadWebview':
      methods.reloadWebview();
      break;

    case 'showSplashScreen':
      SplashScreen.show();
      break;

    case 'hideSplashScreen':
      SplashScreen.hide();
      break;

    case 'openWeb':
      Linking.openURL(data.message.url);
      break;

    case 'setSafeAreaColor':
      methods.setSafeAreaColor({
        top: data.message.top,
        bottom: data.message.bottom
      });
      break;

    default:
      console.error('알 수 없는 웹뷰 메시지 입니다.');
      break;
  }
};

export default WebviewMessage;
