import React, { Component } from 'react';
import { Button, AppRegistry, Dimensions, StyleSheet, PixelRatio } from 'react-native';
import { StackNavigator, DrawerNavigator, TabNavigator, TabBarBottom } from 'react-navigation';
import { Provider } from 'react-globally';
import Icon from 'react-native-vector-icons/MaterialIcons';

import DashboardComponent from './Components/DashboardComponent';
import BluetoothComponent from './Components/BluetoothComponent';
import TestComponent from './Components/TestComponent';
import HistoryComponent from './Components/HistoryComponent';
import AlertsComponent from './Components/AlertsComponent';
import FeedbackComponent from './Components/FeedbackComponent';
import AlarmComponent from './Components/AlarmComponent';
import AddAlarmComponent from './Components/AddAlarmComponent';
import ProfileComponent from './Components/ProfileComponent';
import RequestDoctorChangeComponent from './Components/RequestDoctorChangeComponent';


const Tabs = TabNavigator ({
    Dashboard: {
        screen: DashboardComponent,
        navigationOptions : ({ navigation }) => ({
            headerTitle: 'Dashboard',
        })
    },
    Bluetooth: {
        screen: BluetoothComponent,
        navigationOptions : ({ navigation }) => ({
            headerTitle: 'Bluetooth',
        })
    },
    History: {
        screen: HistoryComponent,
        navigationOptions : ({ navigation }) => ({
            headerTitle: 'History',
        })
    },
    Alarm: {screen: AlarmComponent,
        navigationOptions : ({ navigation }) => ({
            headerTitle: 'Alarms',
            headerRight: (
                <Icon 
                    name="add-alarm"
                    size={30} 
                    onPress={() => navigation.navigate('AddAlarm')}
                    />
            )
        })
    },
    Profile: {
        screen: ProfileComponent,
        navigationOptions: ({navigation}) => ({
            headerTitle: 'Profile',
        })
    }
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
    swipeEnabled: false,
    tabBarPosition: 'bottom',
    animationEnabled: true
});


const App = StackNavigator ({
    Main: {screen: Tabs},
    Alerts: {screen: AlertsComponent,
        navigationOptions : ({ navigation }) => ({
            headerTitle: 'Notifications',
        })
    },
    Feedback: {screen: FeedbackComponent,
        navigationOptions : {
            headerTitle: 'Feedback'
        }
    },
    AddAlarm: {screen: AddAlarmComponent,
        navigationOptions : ({ navigation }) => ({
            headerTitle: 'Add new alarm',
        })
    },
    RequestDoctorChange: {
        screen: RequestDoctorChangeComponent,
        navigationOptions : ({ navigation }) => ({
            headerTitle: 'Request Doctor Change',
        })
    }
}
);

const initialState = {
    signInCapable: false,
    authCode: '',
    email: '',
    id: -1,
    history: [],
    alarmList: [],
    pendingReadings: [],
    currentVolume: 0
};

const nibva = () => (
    <Provider globalState={initialState}>
        <App/>
    </Provider>
);

AppRegistry.registerComponent('Dashboard', () => DashboardComponent);
AppRegistry.registerComponent('BLEManager', () => BLEManager);
AppRegistry.registerComponent('TestComponent', () => TestComponent);
AppRegistry.registerComponent('History', () => HistoryComponent);
AppRegistry.registerComponent('Alerts', () => AlertsComponent);
AppRegistry.registerComponent('Alarm', () => AlarmComponent);
AppRegistry.registerComponent('AddAlarm', () => AddAlarmComponent);
AppRegistry.registerComponent('Feedback', () => FeedbackComponent);
AppRegistry.registerComponent('Profile', () => ProfileComponent);
AppRegistry.registerComponent('RequestDoctorChange', () => RequestDoctorChangeComponent);
AppRegistry.registerComponent('NIBVA', () => nibva);