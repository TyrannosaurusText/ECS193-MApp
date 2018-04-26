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
import BackgroundTask from 'react-native-background-task';

const window = Dimensions.get('window');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

BackgroundTask.define(() => {
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

    this.startScan();
    BackgroundTask.finish();
})

class BLEManager extends Component 
{
    constructor ()
    {
        super();

        var newStore = new Array(64);
        for (var j = 0; j < 64; j++) newStore[j] = 0;
        
        this.state = {
            scanning:false,
            peripherals: new Map(),
            appState: '',
            curReadings: newStore,
            readingsDone: 0,
            count: 0,
        }

        this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
        this.handleStopScan = this.handleStopScan.bind(this);
        this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(this);
        this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this);
        this.handleAppStateChange = this.handleAppStateChange.bind(this);

        setInterval(() => {
            this.setState((previousState) => {
                return {count: previousState.count + 1}
            });
        }, 1000);
    }

    componentDidMount () 
    {
        // AppState.addEventListener('change', this.handleAppStateChange);

        // BleManager.start({showAlert: false});
    
        // this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral );
        // this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan );
        // this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral );
        // this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic );
    
        // if (Platform.OS === 'android' && Platform.Version >= 23) 
        // {
        //     PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
        //         if (result)
        //             console.log("Permission is OK");
        //         else 
        //         {
        //             PermissionsAndroid.requestPermission(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
        //                 if (result)
        //                     console.log("User accept");
        //                 else
        //                     console.log("User refuse");
        //             });
        //         }
        //     });
        // }
    
        // this.startScan();
       BackgroundTask.schedule();
       this.checkStatus();

        /*
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
        */

    }

    async checkStatus() {
        const status = await BackgroundTask.statusAsync()
        
        if (status.available) {
          // Everything's fine
          return
        }
        
        const reason = status.unavailableReason
        if (reason === BackgroundTask.UNAVAILABLE_DENIED) {
          Alert.alert('Denied', 'Please enable background "Background App Refresh" for this app')
        } else if (reason === BackgroundTask.UNAVAILABLE_RESTRICTED) {
          Alert.alert('Restricted', 'Background tasks are restricted on your device')
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
        //console.log('Received data from ' + data.peripheral);
        console.log('Value: ' + data.value);
        //console.log('peripheral: ' + data.peripheral);

        this.setState({readingsDone: 0});

        var service = '72369D5C-94E1-41D7-ACAB-A88062C506A8';
        console.log('Service: ' + service);
        var readChars = [
            '056B0F3D-57D7-4842-A4F1-3177FD883A97',
            '36142750-2A5A-450A-BA69-9C072DB93079',
            '156B0F3D-57D7-4842-A4F1-3177FD883A97',
            'ED887B10-87E3-43D8-8595-7F8C0394A9AE',
            '38330731-44AC-462C-93A3-054F93A9A35A',
            '09EC3E8F-4390-439D-BBDF-2B79370ABA51',
            '7AC8C0E7-EBC7-4A44-9EE1-EEEA9FA2218D',
            '0EBC4973-F784-4849-8891-7D759FB1E3B7',
            '638E8CBF-BC8B-4B24-A719-D9F0DFE24784',
            'DE76C062-35DD-44ED-B8C2-CB28B98CDEF4',
            '90F1A21F-5D34-4B94-9797-E3873C66FA78',
            'C3C8B0A0-A540-486D-A94E-405F2F3D1334',
            '59A8A2B1-7E54-419A-A37F-F59D01D80CAE',
            '3ACB209A-3B54-4B2D-8981-C5D8E2B85DB7',
            '3D2A633F-5EEA-4346-A073-CBDD002040D1',
            'C3151BB7-3E2C-4821-8EB9-4067A6585508'
        ];
        var readings = [];

        var cnt = 0;
        var cycle = 0;
        var readChar = () => {
            console.log("Data peripheral: ", data.peripheral);
            BleManager.read(data.peripheral, service, readChars[cnt])
                .then((readData) => {
                    console.log('----READ----');

                    var temp = new Buffer(17);
                    for (var j = 0; j < 17; j++)
                        temp.writeUInt8(readData[j], j);
                    var id = temp.readInt8(16);
                    readings[id * 4] = temp.readFloatBE(0);
                    readings[id * 4 + 1] = temp.readFloatBE(4);
                    readings[id * 4 + 2] = temp.readFloatBE(8);
                    readings[id * 4 + 3] = temp.readFloatBE(12);

                    cnt++;
                    if(cnt == 16) {
                        cycle++;
                    }
                    console.log('cnt: ' + cnt);
                    if (cnt != readChars.length)
                    {
                        console.log('continue');
                        readCharBound();
                    }
                    else
                    {
                        //console.log('STATE:');
                        //console.log(this.state);
                        var curr = this.state.curReadings;
                        for (var j = 0; j < 64; j++)
                        {
                            curr[j] += readings[j];
                            this.setState({curReadings: curr});
                        }

                        if (data.value == 4)
                        {
                            console.log('Values read');

                            var avg = this.state.curReadings;
                            for (var j = 0; j < 64; j++)
                                avg[j] /= 5;
                            var pendingReadings = this.props.globalState.pendingReadings;

                            var da = new Date();
                            var y = da.getUTCFullYear();
                            var m = (da.getUTCMonth() + 1);
                            m = (m < 10 ? '0' : '') + m;
                            var d = da.getUTCDate();
                            d = (d < 10 ? '0' : '') + d;
                            var h = da.getUTCHours();
                            h = (h < 10 ? '0' : '') + h;
                            var mi = da.getUTCMinutes();
                            mi = (mi < 10 ? '0' : '') + mi;
                            var s = da.getUTCSeconds();
                            s = (s < 10 ? '0' : '') + s;
                            var utc = y + '-' + m + '-' + d + ' ' + h + ':' + mi + ':' + s;
                            console.log(utc);

                            var newReading = {
                                timestamp: utc,
                                channels: avg
                            };
                            pendingReadings.push(newReading);
                            this.props.setGlobalState({pendingReadings});
                            var postObj = {
                                authCode: this.props.globalState.authCode,
                                id: this.props.globalState.id,
                                readings: pendingReadings
                            };

                            console.log('SEND HERE');
                            console.log(postObj);

                            //if able to post
                            fetch('https://majestic-legend-193620.appspot.com/insert/reading', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(postObj)
                            })
                            .then((result) => result.json())
                            .then((json) => {
                                console.log('Send done');
                                console.log(json);
                                pendingReadings = [];
                                this.props.setGlobalState({pendingReadings});
                            });

                            var newStore = new Array(64);
                            for (var j = 0; j < 64; j++) newStore[j] = 0;
                            this.setState({curReadings: newStore});
                        }
                    }
                })
                .catch((error) => {
                    console.log('READ ERROR');
                    console.log(error);
                });
        }
        var readCharBound = readChar.bind(this);
        // for(var i = 0; i < 10; i++) {

        readCharBound();
    // }
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
            return ( BleManager.scan([], 3, true).then((results) => {
                console.log('Scanning...');
                this.setState({scanning:true});
            }));
        }
    }

    retrieveConnected ()
    {
        return (BleManager.getConnectedPeripherals([]).then((results) => {
            console.log(results);
            var peripherals = this.state.peripherals;
            for (var i = 0; i < results.length; i++) 
            {
                var peripheral = results[i];
                peripheral.connected = true;
                peripherals.set(peripheral.id, peripheral);
                this.setState({ peripherals });
            }
        }));
    }

    handleDiscoverPeripheral (peripheral)
    {
        var peripherals = this.state.peripherals;
        if (!peripherals.has(peripheral.id))
        {
            console.log('Got ble peripheral');
            peripherals.set(peripheral.id, peripheral);
            this.setState({ peripherals })
            
            if (peripheral.name == "PatchSim") {
                this.test(peripheral);
            }
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

                    //setTimeout(() => {
                        BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
                            console.log('Peripheral Info');
                            console.log(peripheralInfo);

                            var service =    '72369D5C-94E1-41D7-ACAB-A88062C506A8';
                            var notifyChar = '222B99A0-37CC-4799-9152-7C35D5C5FE07';
                            
                            // for(var i = 0; i < 10; i++)
                            this.handleUpdateValueForCharacteristic({peripheral: peripheral.id, value: [7]});
                            /*
                            BleManager.startNotification(peripheral.id, service, notifyChar).then(() => {
                                console.log('Started notification on ' + peripheral.id);
                            }).catch((err) => {
                                console.log('Notification error', err);
                            });
                            */
                        });

                    //}, 900);
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
                    <Text>Current Count: {this.state.count}</Text>

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