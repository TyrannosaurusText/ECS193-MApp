import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    NativeAppEventEmitter,
    NativeEventEmitter,
    NativeModules,
    Platform,
    PermissionsAndroid,
    ListView,
    ScrollView,
    AppState,
    Dimensions,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import { SafeAreaView } from 'react-navigation';
import { Buffer } from 'buffer';
import { withGlobalState } from 'react-globally';
import DashboardComponent from './DashboardComponent';


// const FUK = TabNavigator ({
//     Dashboard: {screen: DashboardStack},
//     Test: {screen: TestComponent},
//     Bluetooth: {
//         screen: BluetoothComponent,
//         navigationOptions: {
//             // title: 'Bluetooth Configuration',
//             // tabBarVisible: false
//         }
//     }
    //History: {screen: HistoryStack},
    //Alerts: {screen: AlertsComponent},
    //Messages: {screen: MessagesStack}
// },

class MainNavigatorComponent extends Component {
    render() {
        // var MainNavigator = TabNavigator(this.state.Routes, {
        //   // contentComponent: Drawer,
        //   // drawerWidth: 250,
        //   initialRouteName: 'Home'              
        // });     
        // return (          
        //     <MainNavigator screenProps={{ rootNavigation: this.props.navigation }} />
        // )
        // const { categories } = this.props;

        // const Tabs = TabNavigator(FUK.routes['Dashboard'], {
        // const Tabs = TabNavigator({screen: TestComponent}, {
        //     tabBarComponent: TabBarBottom,
        //     tabBarPosition: 'botton',
        //     // tabBarOptions: {
        //     //     scrollEnabled: true,
        //     //     upperCaseLabel: false,            
        //     // }
        // });
        // render() {
        // return (
        //   <Navigator
        //     initialRoute={{title: 'Awesome Scene', index: 0}}
        //     renderScene={(route, navigator) => <Text>Hello {route.title}!</Text>}
        //     style={{padding: 100}}
        //   />
        // );
  }
    
        // return (<Tabs />);
    // }
}

export default withGlobalState(MainNavigatorComponent);
