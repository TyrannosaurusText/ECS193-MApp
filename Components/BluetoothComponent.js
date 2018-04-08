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
import { withGlobalState } from 'react-globally';
import { SafeAreaView } from 'react-navigation';

const window = Dimensions.get('window');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

class BLEManager extends Component 
{
    constructor ()
    {
        super();
        
        this.state = {
            scanning:false,
            peripherals: new Map(),
            appState: ''
        }

        this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
        this.handleStopScan = this.handleStopScan.bind(this);
        this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(this);
        this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this);
        this.handleAppStateChange = this.handleAppStateChange.bind(this);
    }

    componentDidMount () 
    {
        AppState.addEventListener('change', this.handleAppStateChange);

        BleManager.start({showAlert: false});

        this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral );
        this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan );
        this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral );
        this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic );

        if (Platform.OS === 'android' && Platform.Version >= 23) 
        {
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
                if (result)
                    console.log("Permission is OK");
                else 
                {
                    PermissionsAndroid.requestPermission(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
                        if (result)
                            console.log("User accept");
                        else
                            console.log("User refuse");
                    });
                }
            });
        }

    }

    handleAppStateChange (nextAppState) 
    {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') 
        {
            console.log('App has come to the foreground!')
            BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
                console.log('Connected peripherals: ' + peripheralsArray.length);
            });
        }
        this.setState({appState: nextAppState});
    }

    componentWillUnmount () 
    {
        this.handlerDiscover.remove();
        this.handlerStop.remove();
        this.handlerDisconnect.remove();
        this.handlerUpdate.remove();
    }

    handleDisconnectedPeripheral (data) 
    {
        let peripherals = this.state.peripherals;
        let peripheral = peripherals.get(data.peripheral);
        if (peripheral) 
        {
            peripheral.connected = false;
            peripherals.set(peripheral.id, peripheral);
            this.setState({peripherals});
        }
        console.log('Disconnected from ' + data.peripheral);
    }

    handleUpdateValueForCharacteristic (data) 
    {
        console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);

        var service = '96CDFDA3-4F55-D346-24A3-7CDAE787B6F9';
        var readChar = '009DC8EC-8C77-20BD-2478-6DC266D0C5A9';

        BleManager.read(data.peripheral, service, readChar).then((readData) => {
            console.log('Read ' + readData + ' from ' + readChar);
        });
    }

    handleStopScan () 
    {
        console.log('Scan is stopped');
        this.setState({ scanning: false });
    }

    startScan () 
    {
        if (!this.state.scanning) 
        {
            this.setState({peripherals: new Map()});
            BleManager.scan([], 10, true).then((results) => {
                console.log('Scanning...');
                this.setState({scanning:true});
            });
        }
    }

    retrieveConnected ()
    {
        BleManager.getConnectedPeripherals([]).then((results) => {
            console.log(results);
            var peripherals = this.state.peripherals;
            for (var i = 0; i < results.length; i++) 
            {
                var peripheral = results[i];
                peripheral.connected = true;
                peripherals.set(peripheral.id, peripheral);
                this.setState({ peripherals });
            }
        });
    }

    handleDiscoverPeripheral (peripheral)
    {
        var peripherals = this.state.peripherals;
        if (!peripherals.has(peripheral.id))
        {
            console.log('Got ble peripheral', peripheral);
            peripherals.set(peripheral.id, peripheral);
            this.setState({ peripherals })
        }
    }

    test (peripheral) 
    {
        if (peripheral)
        {
            if (peripheral.connected)
                BleManager.disconnect(peripheral.id);
            else
            {
                BleManager.connect(peripheral.id).then(() => {
                    let peripherals = this.state.peripherals;
                    let p = peripherals.get(peripheral.id);
                    if (p) 
                    {
                        p.connected = true;
                        peripherals.set(peripheral.id, p);
                        this.setState({peripherals});
                    }
                    console.log('Connected to ' + peripheral.id);

                    setTimeout(() => {
                        BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
                            console.log('Peripheral Info');
                            console.log(peripheralInfo);

                            var service = '96CDFDA3-4F55-D346-24A3-7CDAE787B6F9';
                            var notifyChar = '0AAE4593-6F8C-ED56-F7B4-E1098BDC6E89';

                            BleManager.startNotification(peripheral.id, service, notifyChar).then(() => {
                                console.log('Started notification on ' + peripheral.id);
                            }).catch((err) => {
                                console.log('Notification error', err);
                            });
                        });

                    }, 900);
                }).catch((error) => {
                    console.log('Connection error', error);
                });
            }
        }
    }

    render () 
    {
        const list = Array.from(this.state.peripherals.values());
        const dataSource = ds.cloneWithRows(list);

        return (
            <SafeAreaView style = {styles.container}>
                <TouchableHighlight
                    style = {{
                        marginTop: 10,
                        marginRight: 50,
                        margin: 20,
                        padding: 20,
                        backgroundColor:'#ccc'
                    }}
                    onPress = {() => this.props.navigation.navigate('Dashboard')}
                >
                    <Text>Back to Dashboard</Text>
                </TouchableHighlight>
                <TouchableHighlight 
                    style = {{
                        marginTop: 0,
                        margin: 20, 
                        padding:20, 
                        backgroundColor:'#ccc'
                    }} 
                    onPress = {() => this.startScan() }
                >
                    <Text>Scan Bluetooth ({this.state.scanning ? 'on' : 'off'})</Text>
                </TouchableHighlight>
                <TouchableHighlight 
                    style = {{
                        marginTop: 0,
                        margin: 20, 
                        padding:20, 
                        backgroundColor:'#ccc'
                    }} 
                    onPress = {() => this.retrieveConnected() }
                >
                    <Text>Retrieve connected peripherals</Text>
                </TouchableHighlight>
                <ScrollView style = {styles.scroll}>
                    {
                        (list.length == 0) &&
                        <View style = {{ flex:1, margin: 20 }}>
                            <Text style = {{ textAlign: 'center' }}>No peripherals</Text>
                        </View>
                    }
                    <ListView
                        enableEmptySections = {true}
                        dataSource = {dataSource}
                        renderRow = {(item) => {
                            const color = item.connected ? 'green' : '#fff';
                            return (
                                <TouchableHighlight onPress={() => this.test(item) }>
                                    <View style={[ styles.row, { backgroundColor: color } ]}>
                                        <Text 
                                            style = {{
                                                fontSize: 12, 
                                                textAlign: 'center', 
                                                color: '#333333', 
                                                padding: 10
                                            }}
                                        >{item.name}</Text>
                                        <Text 
                                            style = {{
                                                fontSize: 8, 
                                                textAlign: 'center', 
                                                color: '#333333', 
                                                padding: 10
                                            }}
                                        >{item.id}</Text>
                                    </View>
                                </TouchableHighlight>
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

export default withGlobalState(BLEManager);