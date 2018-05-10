import React, { Component } from 'react';
import {
    // AppRegistry,
    StyleSheet,
    Text,
    View,
    // TouchableHighlight,
    // NativeAppEventEmitter,
    // NativeEventEmitter,
    // NativeModules,
    // Platform,
    // PermissionsAndroid,
    ListView,
    ScrollView,
    // AppState,
    Dimensions,
} from 'react-native';
// import BleManager from 'react-native-ble-manager';
import { SafeAreaView } from 'react-navigation';
import { Buffer } from 'buffer';
import { withGlobalState } from 'react-globally';
import Icon from 'react-native-vector-icons/MaterialIcons';

// import BackgroundTask from 'react-native-background-task';

const window = Dimensions.get('window');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class AlertsComponent extends Component 
{
    static navigationOptions = ({ navigation }) => ({
        headerTitle: 'Notifications',
        // headerRight: (<Icon name="notifications" size={30} onPress={() => navigation.navigate('Alerts')}/>),
    });

    constructor() 
    {
        super();
    }

    render () 
    {

        // const list = Array.from(this.state.peripherals.values());
        const list = this.props.globalState.history;
        // const list = [
        //     {"time": 0, "reading": 1},
        //     {"time": 1, "reading": 10},
        //     {"time": 2, "reading": 8},
        //     {"time": 3, "reading": 12},
        //     {"time": 4, "reading": 14},
        //     {"time": 5, "reading": 1},
        //     {"time": 6, "reading": 10},
        //     {"time": 7, "reading": 8},
        //     {"time": 8, "reading": 12},
        //     {"time": 9, "reading": 14},
        //     {"time": 10, "reading": 1},
        //     {"time": 11, "reading": 10},
        //     {"time": 12, "reading": 8},
        //     {"time": 13, "reading": 12},
        //     {"time": 14, "reading": 14}
        // ];
        const dataSource = ds.cloneWithRows(list);
        
    //     return (
    //         <SafeAreaView>
    //             <Text>Hi</Text>
    //         </SafeAreaView>
    //     );
    // }
    //     const list = Array.from(this.state.peripherals.values());
    //     const dataSource = ds.cloneWithRows(list);

        return (
            <SafeAreaView style = {styles.container}>
            <ScrollView style = {styles.scroll}>
                    {
                        (list.length == 0) &&
                        <View style = {{ flex:1, margin: 20 }}>
                            <Text style = {{ textAlign: 'center' }}>No history available</Text>
                        </View>
                    }
                <ListView
                    enableEmptySections = {true}
                    dataSource = {dataSource}
                    renderRow = {(item) => {
                    // const color = item.connected ? 'green' : '#fff';
                        return (
                            // <TouchableHighlight onPress={() => this.test(item) }>
                            <View style= {[ styles.row, { backgroundColor: 'white'} ]}>
                                <Text 
                                    style = {{
                                        fontSize: 14, 
                                        textAlign: 'center', 
                                        color: '#333333', 
                                        padding: 10,
                                    }}
                                >Timestamp: {item.time}</Text>
                                <Text 
                                    style = {{
                                        fontSize: 12, 
                                        textAlign: 'center', 
                                        color: '#333333', 
                                        padding: 10,
                                    }}
                                >Alert: {item.alert}</Text>
                            </View>
                        );
                    }}
                />
            </ScrollView>
        </SafeAreaView>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        width: window.width,
        height: window.height
    },
    scroll: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        margin: 10,
    },
    row: {
        margin: 10
    },
});


export default withGlobalState(AlertsComponent);