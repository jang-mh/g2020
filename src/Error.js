import React from 'react';
import {Image, StyleSheet, Text, TouchableHighlight, View} from 'react-native';

const Error = ({tryConnect}) => {

  return (
    <View style={[StyleSheet.absoluteFill, styles.networkError]}>
      <View style={styles.inner}>
        <Text style={[styles.text, styles.text1]}>
          인터넷에{'\n'}
          연결할 수 없습니다.
        </Text>
        <Text style={[styles.text, styles.text2]}>
          네트워크 접속여부를{'\n'}
          확인하고 다시 시도해주세요.
        </Text>
        <Text style={styles.text3}>
          Internet connection is not available.{'\n'}
          Please check your network setting.
        </Text>
        <View style={styles.imgContainer}>
          <Image
            style={styles.img}
            source={require('./images/ico-error2.png')}
          />
        </View>
      </View>

      <TouchableHighlight onPress={tryConnect} style={styles.button}>
        <Text style={styles.buttonText}>다시 시도</Text>
      </TouchableHighlight>
    </View>
  );
};

export default Error;

const styles = StyleSheet.create({
  networkError: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
    height: '100%',
    paddingTop: 100,
    paddingHorizontal: 36,
    paddingBottom: 40,
  },
  inner: {
    flex: 1,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 22,
    lineHeight: 28,
  },
  text1: {
    color: '#FF4200',
  },
  text2: {
    marginTop: 10,
    color: '#000',
  },
  text3: {
    marginTop: 20,
    fontSize: 14,
    lineHeight: 20,
    color: '#222222',
  },
  imgContainer: {
    paddingTop: 30,
    alignItems: 'center',
  },
  img: {
    width: 173,
    height: 135,
    marginLeft: 30,
  },
  button: {
    backgroundColor: '#274068',
    shadowColor: 'rgba(38, 34, 109, 0.24)',
    borderRadius: 10,
  },
  buttonText: {
    paddingVertical: 15,
    textAlign: 'center',
    color: '#fff',
  },
});
