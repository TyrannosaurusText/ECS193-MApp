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
import PushNotificationComponent from './Components/PushNotificationComponent';
import FeedbackComponent from './Components/FeedbackComponent';



// const DashboardStack = StackNavigator ({
//     // Dashboard: {
//     //     screen: DashboardComponent,
//     //     // navigationOptions: {
//     //     //     title: 'Dashboard'
//     //     // }
//     // },
//     Alerts: {
//         screen: AlertsComponent,
//     },
//     // Bluetooth: {
//     //     screen: BluetoothComponent,
//     //     // navigationOptions: {
//     //         // title: 'Bluetooth Configuration',
//     //     // }
//     // }
// }, {
//     headerMode: 'none',
// });

/*
const HistoryStack = StackNavigator ({
    History: {screen: HistoryComponent},
    Feedback: {screen: FeedbackComponent}
});

const MessagesStack = StackNavigator ({
    Messages: {screen: MessagesComponent},
    Read: {screen: ReadComponent},
    Compose: {screen: ComposeComponent}
});
*/

const Tabs = TabNavigator ({
    Dashboard: {
        screen: DashboardComponent,
        navigationOptions : ({ navigation }) => ({
        //     title: 'Dashboard',

            headerTitle: 'Dashboard',
            headerRight: (<Icon name="notifications" size={30} onPress={() => navigation.navigate('Alerts')}/>),
        })
        // navigationOptions: {
            // title: 'Testing',
        // }
    },
    // Test: {
    //     screen: TestComponent,
    //     // navigationOptions: {
    //     //     title: 'Testing',
    //     //     // tabBarVisible: false
    //     // }
    // },
    Bluetooth: {
        screen: BluetoothComponent,
        navigationOptions : ({ navigation }) => ({
        //     title: 'Dashboard',

            headerTitle: 'Bluetooth',
            headerRight: (
                <Icon 
                    name="notifications"
                    size={30} 
                    onPress={() => navigation.navigate('Alerts')}
                    />
            )
        })
    },
    History: {
        // screen: HistoryStack
        screen: HistoryComponent,
        navigationOptions : ({ navigation }) => ({
        //     title: 'Dashboard',

            headerTitle: 'History',
            headerRight: (
                <Icon 
                    name="notifications"
                    size={30} 
                    onPress={() => navigation.navigate('Alerts')}
                    />
            )
        })
    },
    //Alerts: {screen: AlertsComponent},
    //Messages: {screen: MessagesStack}
},
{
    // tabBarComponent: TabBarBottom,
    // tabBarComponent: ({ navigation }) =>
    //    <TabView.TabBarBottom 
    //     // {...rest}
    //     // navigation={{
    //       // ...navigation,
    //       // state: { navigation.state, routes: navigation.state.routes.filter(r => r.name !== 'BluetoothComponent')}
    //     // }}
    //   />,
    // tabBarComponent: ({ navigation, ...rest }) =>
    // <TabView.TabBarBottom
    // {...rest}
    // navigation={{
    //   ...navigation,
    //   state: {...navigation.state, routes: navigation.state.routes.filter(r => r.name !== 'Bluetooth'),
    // }}}
    // />,
    headerMode: 'screen',
    tabBarComponent: TabBarBottom,
    tabBarOptions: {
        // style: {
        // //     position: 'absolute',
        // //                 left: (Dimensions.get('window').width * 6) / 25,
        // //                 right: (Dimensions.get('window').width * 6) / 25,
        // //                 bottom: (Dimensions.get('window').height * 2) / 67,
        // //                 height: (Dimensions.get('window').height * 4) / 67,
        //     justifyContent: 'center',
        //     alignItems: 'center',
        // },
        // titleStyle: {
        //                 justifyContent: 'center',
        //                 alignItems: 'center',
        //             },
        labelStyle: {
            fontSize : 13,
            fontWeight: 'bold',
            // color: '#fff',
            // height: (deviceHeight * 4) / 67,
            // position: 'relative',
            justifyContent: 'center',
            alignSelf: 'center',
            // padding: 6,
            marginBottom: 14,
        },
    },
    // showLabel: false,
    lazy: false,
    removeClippedSubviews: false,
    swipeEnabled: false,
    tabBarPosition: 'bottom',
    animationEnabled: true
});


const App = StackNavigator ({
    Main: {screen: Tabs},
    Alerts: {screen: AlertsComponent,
        navigationOptions : {
            headerTitle: 'Alerts'
        }
    },
    Feedback: {screen: FeedbackComponent,
        navigationOptions : {
            headerTitle: 'Feedback'
        }
    }
}
);

const initialState = {
    signInCapable: false,
    authCode: '',
    email: '',
    id: -1,
    history: [],
    pendingReadings: []
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
AppRegistry.registerComponent('PushNotification', () => PushNotificationComponent);
AppRegistry.registerComponent('Feedback', () => FeedbackComponent);
//AppRegistry.registerComponent('Messages', () => MessagesComponent);
//AppRegistry.registerComponent('Read', () => ReadComponent);
//AppRegistry.registerComponent('Compose', () => ComposeComponent);
AppRegistry.registerComponent('NIBVA', () => nibva);