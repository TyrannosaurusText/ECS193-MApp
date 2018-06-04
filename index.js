import React, { Component } from 'react';
import { Button, AppRegistry, Dimensions, StyleSheet, PixelRatio } from 'react-native';
import { StackNavigator, DrawerNavigator, TabNavigator, TabBarBottom } from 'react-navigation';
import { Provider } from 'react-globally';
import Icon from 'react-native-vector-icons/MaterialIcons';

import DashboardComponent from './Components/DashboardComponent';
import BluetoothComponent from './Components/BluetoothComponent';
import HistoryComponent from './Components/HistoryComponent';
import FeedbackComponent from './Components/FeedbackComponent';
import AlarmComponent from './Components/AlarmComponent';
import AddAlarmComponent from './Components/AddAlarmComponent';
import ProfileComponent from './Components/ProfileComponent';
import RequestDoctorChangeComponent from './Components/RequestDoctorChangeComponent';

const initialState = {
    signInCapable: false,
    authCode: '',
    email: '',
    id: -1,
    history: [],
    alarmList: [],
    pendingReadings: [],
    currentVolume: 0,
    bluetoothConnected: false,
    alarmTriggered: false,
    familyName: '',
    givenName: '',
    email: '',
    doctorFamilyName: '',
    doctorGivenName: '',
    doctorEmail: ''
};



const Tabs = TabNavigator ({
    Dashboard: {
        screen: DashboardComponent,
        navigationOptions : ({ navigation }) => ({
            headerTitle: 'NIBVA',
            headerStyle: {
                backgroundColor: 'black'
            },
            headerTitleStyle: {
                color: 'white'
            }
        })
    },
    Bluetooth: {
        screen: BluetoothComponent,
        navigationOptions : ({ navigation }) => ({
            headerTitle: 'NIBVA',
            headerStyle: {
                backgroundColor: 'black'
            },
            headerTitleStyle: {
                color: 'white'
            }
        })
    },
    History: {
        screen: HistoryComponent,
        navigationOptions : ({ navigation }) => ({
            headerTitle: 'NIBVA',
            headerStyle: {
                backgroundColor: 'black'
            },
            headerTitleStyle: {
                color: 'white'
            }
        })
    },
    Alarm: {screen: AlarmComponent,
        navigationOptions : ({ navigation }) => ({
            headerTitle: 'NIBVA',
            headerStyle: {
                backgroundColor: 'black'
            },
            headerTitleStyle: {
                color: 'white'
            }
        })
    },
    
},
{
    headerMode: 'screen',
    tabBarComponent: TabBarBottom,
    tabBarOptions: {
        labelStyle: {
            fontSize : 13,
            fontWeight: 'bold',
            justifyContent: 'center',
            alignSelf: 'center',
            marginBottom: 14,
        },
    },
    lazy: false,
    removeClippedSubviews: false,
    swipeEnabled: true,
    tabBarPosition: 'bottom',
    animationEnabled: true
});


const App = StackNavigator ({
    Main: {screen: Tabs},
    Feedback: {screen: FeedbackComponent,
        navigationOptions : {
            headerTitle: 'Event'
        }
    },
    AddAlarm: {screen: AddAlarmComponent,
        navigationOptions : ({ navigation }) => ({
            headerTitle: 'Add new alarm',
        })
    },
    Profile: {
        screen: ProfileComponent,
        navigationOptions: ({navigation}) => ({
            headerTitle: 'Profile',
            // headerStyle: {
            //     backgroundColor: 'black'
            // },
            // headerTitleStyle: {
            //     color: 'white'
            // }
        })
    }
}
);

const nibva = () => (
    <Provider globalState={initialState}>
        <App/>
    </Provider>
);

AppRegistry.registerComponent('Dashboard', () => DashboardComponent);
AppRegistry.registerComponent('BLEManager', () => BLEManager);
AppRegistry.registerComponent('History', () => HistoryComponent);
AppRegistry.registerComponent('Alarm', () => AlarmComponent);
AppRegistry.registerComponent('AddAlarm', () => AddAlarmComponent);
AppRegistry.registerComponent('Feedback', () => FeedbackComponent);
AppRegistry.registerComponent('Profile', () => ProfileComponent);
AppRegistry.registerComponent('RequestDoctorChange', () => RequestDoctorChangeComponent);
AppRegistry.registerComponent('NIBVA', () => nibva);