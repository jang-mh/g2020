import React, {useState, useEffect, useRef} from 'react';
import {AppState,Alert,SafeAreaView,BackHandler,Platform,ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CookieManager from '@react-native-cookies/cookies';
import ScreenOrientation, { PORTRAIT } from "@capacitor/screen-orientation";
import FCM from './src/FCM';
import WebviewMessage from './src/WebviewMessage';
import SplashScreen from 'react-native-splash-screen'
import {WebView} from 'react-native-webview';
import {URL} from 'react-native-url-polyfill';
import Config from 'react-native-config';
import {getVersion} from 'react-native-device-info';
import Error from './src/Error';

const App = () => {
  const [topSafeAreaColor, setTopSafeAreaColor] = useState('#fff');
  const [bottomSafeAreaColor, setBottomSafeAreaColor] = useState('#fff');
  const [fcmToken, setFcmToken] = useState('');
  const [webviewKey, setWebviewKey] = useState(0);
  const [isWebviewLoaded, setIsWebviewLoaded] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [navigationGestures, setNavigationGestures] = useState(true);
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const webview = useRef();
  let goBackTwice = true;

useEffect(() => {
    AppState.addEventListener('change', _handleAppStateChange);

    // setTimeout(SplashScreen.show, 5000)

    return () => {
      AppState.removeEventListener('change', _handleAppStateChange);
    };
  }, []);

  useEffect(() => {
    Platform.OS === 'android' &&
      BackHandler.addEventListener('hardwareBackPress', androidBackHandler);

    return () => {
      Platform.OS === 'android' &&
        BackHandler.removeEventListener(
          'hardwareBackPress',
          androidBackHandler,
        );
    };
  }, [canGoBack]);

  const getUUIdV4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

const showToast = (message) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  };

const _handleAppStateChange = (nextAppState) => {
    // active
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      AsyncStorage.getItem('JWT').then((data) => {
        if (data) {
          webview.current.postMessage(
            JSON.stringify({
              name: 'foreground',
              tokenInfo: data,
            }),
          );
        }
      });
    }
    // background or inactive
    else {
      webview.current.postMessage(
        JSON.stringify({
          name: 'background',
          appState: nextAppState,
        }),
      );
    }

    appState.current = nextAppState;
    setAppStateVisible(appState.current);
  };

const jsonCookiesToCookieString = (json) => {
    let cookiesString = '';
    for (let [key, value] of Object.entries(json)) {
      cookiesString += `${key}=${value.value}; `;
    }
    return cookiesString;
  };

  const androidBackHandler = () => {
    if (!canGoBack && goBackTwice) {
      goBackTwice = false;
      showToast('뒤로가기 버튼을 한번 더 누르면 종료됩니다.');
      setTimeout(() => {
        goBackTwice = true;
      }, 4000);
      return true;
    } else if (!goBackTwice) {
      return false;
    } else if (canGoBack) {
      webview.current.goBack();
      return true;
    }

    return false;
  };

  const reloadWebview = () => {
    SplashScreen.show();
    setWebviewKey(webviewKey + 1);
    webview.current.reload();
  };

 const resetHistory = () => {
    setCanGoBack(false);
    Platform.OS === 'android' && webview.current.clearHistory(); // for android
  };

  const setSafeAreaColor = ({top, bottom}) => {
    setTopSafeAreaColor(top);
    setBottomSafeAreaColor(bottom);
  };

  const onWebviewMessage = (e) => {
    const methods = {
      reloadWebview: reloadWebview,
      setSafeAreaColor: setSafeAreaColor,
    };

    WebviewMessage(e, methods, webview);
  };

const onNavigationStateChange = (navState) => {
    const url = new URL(navState.url);

    switch (url.hash) {
      case '#/':
        resetHistory();
        break;

      case '#/home/main':
        resetHistory();

        CookieManager.get(Config.WEBVIEW_URL, true).then((cookies) => {
          AsyncStorage.setItem(
            'savedCookies',
            jsonCookiesToCookieString(cookies),
          );
        });
        break;

      default:
        setCanGoBack(navState.canGoBack);
        // setNavigationGestures(true); // for ios
        break;
    }
  };

const onLoadEnd = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    const url = new URL(nativeEvent.url);

    console.log('onLoadEnd')
    console.log(url.hash)

    if (url.hash === '#/') {
      SplashScreen.hide();

      AsyncStorage.getItem('deviceId').then((deviceId) => {
        if (deviceId) {
          webview.current.postMessage(
            JSON.stringify({
              name: 'deviceId',
              deviceId: deviceId,
            }),
          );
        } else {
          const uuid = getUUIdV4();

          AsyncStorage.setItem('deviceId', uuid, () => {
            webview.current.postMessage(
              JSON.stringify({
                name: 'deviceId',
                deviceId: uuid,
              }),
            );
          });
        }
      });

      AsyncStorage.getAllKeys((err, keys) => {
        AsyncStorage.multiGet(keys, (err, storage) => {
          console.log(storage)
          webview.current.postMessage(
            JSON.stringify({
              name: 'storage',
              storage: storage,
            }),
          );
        });
      });

      webview.current.postMessage(
        JSON.stringify({
          name: 'version',
          version: getVersion(),
        }),
      );

      if (fcmToken !== '') {
        webview.current.postMessage(
          JSON.stringify({
            name: 'fcmToken',
            token: fcmToken,
          }),
        );
      }
    }
  };
 const onError = () => {
    SplashScreen.hide();
  };

  const onContentProcessDidTerminate = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    webview.current.reload();
  };

  const tryConnect = () => {
    SplashScreen.show();
    webview.current.reload();
  };

return (
    <>
      <FCM webview={webview} setFcmToken={setFcmToken} />
      <ScreenOrientation
        orientation={PORTRAIT}
      />
      {topSafeAreaColor !== 'none' ? <SafeAreaView style={{ flex: 0, backgroundColor: topSafeAreaColor }} /> : null}
      {/*<StatusBar barStyle="light-content" />*/}
      <WebView
        ref={webview}
        key={webviewKey}
        originWhitelist={['*']}
        source={{
          //uri: Config.WEBVIEW_URL,
          uri: 'https://app.dringdring.co.kr/',
        }}
        decelerationRate='normal'
        cacheEnabled={false}
        bounces={false}
        allowsBackForwardNavigationGestures={navigationGestures}
        startInLoadingState={true}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        domStorageEnabled={true}
        onNavigationStateChange={onNavigationStateChange}
        onMessage={onWebviewMessage}
        onLoadEnd={onLoadEnd}
        onError={onError}
        onContentProcessDidTerminate={onContentProcessDidTerminate}
        renderError={(errorName) => <Error name={errorName} tryConnect={tryConnect} />}
      />
      {bottomSafeAreaColor !== 'none' ? <SafeAreaView style={{ flex: 0, backgroundColor: bottomSafeAreaColor }} /> : null}
    </>
  );
};

export default App;
