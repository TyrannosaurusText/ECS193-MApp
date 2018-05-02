import React, { Component } from 'react';
import { AppRegistry, Dimensions, StyleSheet, PixelRatio } from 'react-native';
import { StackNavigator, DrawerNavigator, TabNavigator, TabBarBottom } from 'react-navigation';
import { Provider } from 'react-globally';

import DashboardComponent from './Components/DashboardComponent';
import BluetoothComponent from './Components/BluetoothComponent';
import TestComponent from './Components/TestComponent';
import HistoryComponent from './Components/HistoryComponent';


const DashboardStack = StackNavigator ({
    Dashboard: {
        screen: DashboardComponent,
        // navigationOptions: {
        //     title: 'Dashboard'
        // }
    }, 
    // Bluetooth: {
    //     screen: BluetoothComponent,
    //     // navigationOptions: {
    //         // title: 'Bluetooth Configuration',
    //         // tabBarVisible: false
    //     // }
    // }
}, {
    headerMode: 'none'
});

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
        screen: DashboardStack,
        navigationOptions: {
            title: 'Dashboard',
            // tabBarVisible: false
        }
    },
    // Test: {
    //     screen: TestComponent,
    //     navigationOptions: {
    //         title: 'Testing',
    //         // tabBarVisible: false
    //     }
    // },
    Bluetooth: {
        screen: BluetoothComponent,
        navigationOptions: {
            title: 'Bluetooth',
            // tabBarVisible: false
        }
    },
    History: {
        // screen: HistoryStack
        screen: HistoryComponent,
        navigationOptions: {
            title: 'History',
            // tabBarVisible: false
        }
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
    swipeEnabled: true,
    tabBarPosition: 'bottom',
    animationEnabled: true
});

const App = StackNavigator ({
    Main: {screen: Tabs}
});

// const App = 
// <Navigator
          //   initialRoute={{title: 'Awesome Scene', index: 0}}
          //   renderScene={(route, navigator) => <Text>Hello {route.title}!</Text>}
          //   style={{padding: 100}}
          // />;


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
        <App />
    </Provider>
);

AppRegistry.registerComponent('Dashboard', () => Dashboard);
AppRegistry.registerComponent('BLEManager', () => BLEManager);
AppRegistry.registerComponent('TestComponent', () => TestComponent);
AppRegistry.registerComponent('History', () => HistoryComponent);
//AppRegistry.registerComponent('Feedback', () => FeedbackComponent);
//AppRegistry.registerComponent('Alerts', () => AlertsComponent);
//AppRegistry.registerComponent('Messages', () => MessagesComponent);
//AppRegistry.registerComponent('Read', () => ReadComponent);
//AppRegistry.registerComponent('Compose', () => ComposeComponent);
AppRegistry.registerComponent('NIBVA', () => nibva);