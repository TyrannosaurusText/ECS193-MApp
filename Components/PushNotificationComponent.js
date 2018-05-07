import React, { Component } from 'react';
import PushNotification from 'react-native-push-notification';

export default class PushNotificationComponent extends Component {

  componentDidMount() {
    PushNotification.configure({
      onNotification: function(notification) {
        console.log('NOTIFICATION: ', notification);
      },
      popInitialNotification: true,
    });
  }
  
  render() {
    return null;
  }
}