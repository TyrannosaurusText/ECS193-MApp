import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import { StackNavigator, DrawerNavigator, TabNavigator, TabBarBottom } from 'react-navigation';
import { Provider } from 'react-globally';
// import { Navigator } from 'react-native-deprecated-custom-components';

import DashboardComponent from './Components/DashboardComponent';
import BluetoothComponent from './Components/BluetoothComponent';
import TestComponent from './Components/TestComponent';
// import MainNavigatorComponent from './Components/MainNavigatorComponent';


const DashboardStack = StackNavigator ({
    Dashboard: {
        screen: DashboardComponent,
        // navigationOptions: {
        //     title: 'Dashboard'
        // }
    },
    // Bluetooth: {
    //     screen: BluetoothComponent,
    //     navigationOptions: {
    //         title: 'Bluetooth Configuration',
    //         tabBarVisible: false
    //     }
    // }
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
    Dashboard: {screen: DashboardStack},
    Test: {screen: TestComponent},
    Bluetooth: {
        screen: BluetoothComponent,
        navigationOptions: {
            // title: 'Bluetooth Configuration',
            // tabBarVisible: false
        }
    }
    //History: {screen: HistoryStack},
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
    lazy: false,
    removeClippedSubviews: false,
    swipeEnabled: false,
    tabBarPosition: 'bottom',
    animationEnabled: true
});

const App = StackNavigator ({
    Main: {screen: Tabs}
});

// const App = MainNavigatorComponent;

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
// AppRegistry.registerComponent('MainNavigatorComponent', () => MainNavigatorComponent);
//AppRegistry.registerComponent('History', () => HistoryComponent);
//AppRegistry.registerComponent('Feedback', () => FeedbackComponent);
//AppRegistry.registerComponent('Alerts', () => AlertsComponent);
//AppRegistry.registerComponent('Messages', () => MessagesComponent);
//AppRegistry.registerComponent('Read', () => ReadComponent);
//AppRegistry.registerComponent('Compose', () => ComposeComponent);
AppRegistry.registerComponent('NIBVA', () => nibva);