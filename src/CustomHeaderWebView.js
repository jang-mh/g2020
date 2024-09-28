import React, {useState, forwardRef} from 'react';
import {WebView} from 'react-native-webview';

const CustomHeaderWebView = forwardRef((props, ref) => {
  const { uri, ...restProps } = props;
  const [currentURI, setURI] = useState(props.source.uri);
  const newSource = { ...props.source, uri: currentURI };

  return (
    <WebView
      ref={ref}
      {...restProps}
      source={newSource}
      onShouldStartLoadWithRequest={(request) => {
        if (request.url === currentURI) return true;
        setURI(request.url);
        return false;
      }}
    />
  );
});

export default CustomHeaderWebView;
