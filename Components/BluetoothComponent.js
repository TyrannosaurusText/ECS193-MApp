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
    AsyncStorage,
    Alert,
    Vibration
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import { SafeAreaView } from 'react-navigation';
import { Buffer } from 'buffer';
import { withGlobalState } from 'react-globally';
import BackgroundTimer from 'react-native-background-timer';
import {NotificationsAndroid} from 'react-native-notifications';


const window = Dimensions.get('window');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

class BLEManager extends Component 
{
    constructor ()
    {
        super();

        var newStore = new Array(64);
        for (var j = 0; j < 64; j++) newStore[j] = 0;
        
        this.state = {
            scanning:false,             // is ble adapter scanning for devices
            peripherals: new Map(),     // list of found ble devices
            appState: '',               // state of application
            reading: false,             // is phone currently reading from ble device
            curReadings: newStore,      // current characteristic value readings (array of 64 floats)
            charsRead: 0,               // how many total reads has occured for this interval of reading               
            myPatch: null,              // ble object for the patch
            connectedToPatch: false,    // whether the phone is currently connected to the patch
            autoRead: false,            // will the phone automatically connect to a stored device or not
            resendCount: 0,             // sets of readings that failed to be sent to server, need to be resent 
            maxStore: 32,                // max amount of readings to store 
            maxPlotData: 40             // max amount of readings to display on plot at a time 
        }

        this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
        this.handleStopScan = this.handleStopScan.bind(this);
        this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(this);
        this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this);
        this.handleAppStateChange = this.handleAppStateChange.bind(this);
        this.resetReadings = this.resetReadings.bind(this);
        this.checkAlarm = this.checkAlarm.bind(this);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.storeItem = this.storeItem.bind(this);
        this.isConnected = this.isConnected.bind(this);
        this.fireAlarm = this.fireAlarm.bind(this);
    }

    /**
     * resetReadings()
     * Reset to a state ready for another set of readings
     */
    resetReadings () {
        // console.log('resetReadings(): before, reading: ' + this.state.reading + ', charsRead: ' + this.state.charsRead);
        /**
         * Set phone state to: not reading characteristic data, zero currently
         * read data, no stored raw characteristic data
         */
        this.state.reading = false;
        this.state.charsRead = 0;
        var newStore = new Array(64);
        for (var j = 0; j < 64; j++) newStore[j] = 0;
        this.setState({curReadings: newStore});
        // console.log('resetReadings(): after, reading: ' + this.state.reading + ', charsRead: ' + this.state.charsRead);
    }

    /**
     * processData()
     * @param {*} floats_64  Raw characteristic data
     * Processes raw characteristic data to usable volume data (64 floats
     * of raw data -> 1 float of volumetric data)
     */
    processData (floats_64) {
        var dataValue = 0;
        for (var i = 0; i < 64; i++) dataValue += floats_64[i];
        dataValue = dataValue / 64;
        // console.log('processData(): ' + dataValue);
        return dataValue;
    }

    /**
     * componentDidMount()
     * Sets up component tasks on mounting
     */
    componentDidMount () 
    {
        console.log('componentDidMount(): ');

        /**
         * Reset phone internal storage (for testing purposes)
         */
        AsyncStorage.removeItem('VolumeData');
        AsyncStorage.removeItem('JSONData');

        /**
         * Start ble background task
         */
        const intervalId = BackgroundTimer.setInterval(() => {
            console.log('BackgroundTimer.setInterval(); connectedToPatch: ' + this.state.connectedToPatch);
            if(this.state.connectedToPatch == false) {
                console.log('connectedToPatch: ', this.state.connectedToPatch);
                this.startScan();
            } else {
                console.log('connectedToPatch: ', this.state.connectedToPatch);
                this.handleUpdateValueForCharacteristic({peripheral: this.state.myPatch.id, value: [7]});
            }
        }, 15 * 60000);

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

    /**
     * isConnected()
     * @param {*} peripheral Ble peripheral
     * Check if phone is connected to peripheral. 
     */
    isConnected(peripheral) {
        this.retrieveConnected();
        return this.state.peripherals.has(peripheral.id);
    }

    /**
     * handleAppStateChange()
     * @param {*} nextAppState Application state
     * Do certain actions depending on app state change.
     */
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
        console.log("componentWillUnmount()");
        this.handlerDiscover.remove();
        this.handlerStop.remove();
        this.handlerDisconnect.remove();
        this.handlerUpdate.remove();

        if (this.state.myPatch) {
            BleManager.disconnect(this.state.myPatch.id);
        }
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
        this.resetReadings();
    }

    handleUpdateValueForCharacteristic (data) 
    {
        if (this.state.reading == true) {
            return;
        } else {
            this.state.reading = true;
        }

        //console.log('Received data from ' + data.peripheral);
        console.log('Value: ' + data.value);
        //console.log('peripheral: ' + data.peripheral);


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
        var index = 0;

        var cnt = 0;
        var readChar = () => {
            BleManager.read(data.peripheral, service, readChars[cnt])
                .then((readData) => {
                    console.log('----READ----');

                    var temp = new Buffer(17);
                    for (var j = 0; j < 17; j++)
                        temp.writeUInt8(readData[j], j);
                    //var id = temp.readInt8(16);
                    readings[index * 4] = temp.readFloatBE(0);
                    readings[index * 4 + 1] = temp.readFloatBE(4);
                    readings[index * 4 + 2] = temp.readFloatBE(8);
                    readings[index * 4 + 3] = temp.readFloatBE(12);
                    index++;

                    cnt = (cnt + 1) % 16;
                    this.state.charsRead = (this.state.charsRead + 1) % 32;

                    console.log('cnt: ' + cnt + ', charsRead: ' + this.state.charsRead);
                    if (/*cnt != readChars.length && */this.state.charsRead != (readChars.length * 2 - 1))
                    {
                        console.log('continue');
                        readCharBound();
                    }
                    else
                    {
                        console.log('STATE:');
                        //console.log(this.state);
                        var curr = this.state.curReadings;
                        for (var j = 0; j < 64; j++)
                        {
                            curr[j] += readings[j];
                        }

                        this.setState({curReadings: curr});

                        // if (data.value == 4)
                        if (this.state.charsRead == 31)
                        {
                            this.state.reading = false;
                            console.log('Values read');

                            var avg = this.state.curReadings;
                            for (var j = 0; j < 64; j++)
                                avg[j] /= 10;
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
                            var savedData;
                            var resendData = (oldData) => {
                                console.log('resendAllData(): oldData=' + oldData)
                                var indexResend = oldData.length - this.state.resendCount;
                                console.log('About to resend: ' + oldData[indexResend]);
                                fetch('https://majestic-legend-193620.appspot.com/insert/reading', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: oldData[indexResend]
                                })
                                .then((result) => result.json(), (error) => {
                                    console.log('Resend failed: resendCount=' + this.state.resendCount + ',error=' + error);
                                    
                                })
                                .then((json) => {
                                    console.log('ReSend done, prev resendCount=' + this.state.resendCount);
                                    console.log(json);
                                    pendingReadings = [];
                                    this.props.setGlobalState({pendingReadings});

                                    if(json != undefined) {
                                        this.state.resendCount -= 1;
                                        console.log('ReSend done, curr resendCount=' + this.state.resendCount);
                                        if(this.state.resendCount > 0) {
                                            resendData(savedData);
                                        }
                                    }
                                });
                            }

                            var resendAllData = resendData.bind(this);

                            if(this.props.globalState.email != '') {
                                /**
                                 * Resend data that failed to send
                                 */
                                if(this.state.resendCount != 0) {
                                    /**
                                     * Retrieve locally stored data
                                     */
                                    console.log('resendCount != 0')
                                    this.retrieveItem('JSONData').then((dataRecord) => {
                                        // console.log('dataRecord: '+ dataRecord);
                            
                                        var myArray;
                                        if(dataRecord == undefined) {
                                            myArray = null;
                                        } else {
                                            myArray = dataRecord.split(";");
                                            // console.log('dataRecord Array: ' + myArray);
                                            // console.log('dataRecord length: ' + myArray.length);
                                        }
                                        savedData = myArray;
                                    }).then(() => {
                                        /**
                                         * Resend old data
                                         */
                                      //  if(savedData != null && savedData != undefined) {
                                            return resendAllData(savedData);
                                       // } else {
                                     //       return null;
                                     //   }
                                    }).then((resendPromise) => {

                                        /**
                                        * Send current data
                                        */
                                        fetch('https://majestic-legend-193620.appspot.com/insert/reading', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(postObj)
                                        })
                                        .then((result) => result.json(), (error) => {
                                            if (this.state.resendCount < this.state.maxStore) {
                                                this.state.resendCount += 1;
                                            }
                                            console.log('Send failed: count=' + this.state.resendCount + ', error=' + error);
                                        })
                                        .then((json) => {
                                            console.log('Send done, resendCount=' + this.state.resendCount);
                                            console.log(json);
                                            pendingReadings = [];
                                            this.props.setGlobalState({pendingReadings});
                                        });
                                    });
                                } else {
                                        /**
                                        * Send current data
                                        */
                                       console.log('resendCount == 0');
                                       fetch('https://majestic-legend-193620.appspot.com/insert/reading', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(postObj)
                                        })
                                        .then((result) => result.json(), (error) => {
                                            if (this.state.resendCount < this.state.maxStore) {
                                                this.state.resendCount += 1;
                                            }
                                            console.log('Send failed: count=' + this.state.resendCount + ', error=' + error);
                                        })
                                        .then((json) => {
                                            console.log('Send done, resendCount=' + this.state.resendCount);
                                            console.log(json);
                                            pendingReadings = [];
                                            this.props.setGlobalState({pendingReadings});
                                        });
                                } 
                            } else {
                                if (this.state.resendCount < this.state.maxStore) {
                                    this.state.resendCount += 1;
                                }
                                
                                console.log('Not signed in: resendCount=' + this.state.resendCount);
                            }

                            var newCurrentVolume = this.processData(avg);
                            this.props.setGlobalState({currentVolume: newCurrentVolume});
                            var currHistory = this.props.globalState.history;

                            currHistory.push(
                                {
                                    time: utc,
                                    reading: newCurrentVolume
                                }
                            );

                            if(currHistory.length > this.state.maxPlotData) {
                                currHistory.shift();
                            }

                            this.props.setGlobalState({history: currHistory});

                            /**
                             * Update internal storage with new current values
                             */
                            this.updateInternalStorage('VolumeData', utc + ', ' + newCurrentVolume);
                            this.updateInternalStorage('JSONData', JSON.stringify(postObj));

                            /**
                             * Check to set if alarm threshold reached and
                             * prepare for next set of readings.
                             */
                            this.checkAlarm(newCurrentVolume);
                            this.resetReadings();
                        }
                    }
                })
                .catch((error) => {
                    console.log('READ ERROR');
                    console.log(error);
                    this.resetReadings();
                    // cnt--;
                    // index--;
                    // this.state.charsRead = this.state.charsRead - 1;
                    
                });
        }
        var readCharBound = readChar.bind(this);
        readCharBound();
    }

    updateInternalStorage(key, newValue) {
        var currentData = '';
        // console.log('updateInternalStorage(): key=' + key + ', newValue=' + newValue);
        this.retrieveItem(key).then((dataRecord) => {
            // console.log('dataRecord: '+ dataRecord + ', newValue: ' + newValue);

            if(dataRecord == undefined) {
                currentData = '' + newValue;
            } else {
                var myArray = dataRecord.split(";");
                // console.log('dataRecord Array: ' + myArray);
                // console.log('dataRecord length: ' + myArray.length);
                if (myArray.length == this.state.maxStore) {
                    // console.log('dataRecord length equals target');
                    myArray.shift();
                    myArray.push(newValue);
                    currentData = myArray.join(';');
                } else {
                    currentData = dataRecord + '; ' + newValue;
                }
            }

            // console.log('Current local data: ' + key + '=' + currentData);
            this.storeItem(key, currentData).then(() => {
                // console.log('Data stored in Ble successful: ' + key + '=' + currentData);
            }).catch((error) => {
                console.log('Data failed to be stored in Ble');
            });

        })
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
            BleManager.scan([], 3, true).then((results) => {
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
            if(peripheral.name == "PatchSim") {
                console.log('handleDiscoverPeripheral(); Calling test on peripheral');
                this.state.myPatch = peripheral;
                this.test(peripheral);
            }
        }
    }

    test (peripheral) 
    {
        if (peripheral)
        {
            if (peripheral.connected) {
                console.log('Trying to disconnect from peripheral');
                BleManager.disconnect(peripheral.id).then(() => {
                    this.state.connectedToPatch = false;
                    this.props.setGlobalState({bluetoothConnected: false});

                    //this.state.myPatch = null;
                })
                this.resetReadings();
                // BleManager.disconnect(peripheral.id).then(() => {
                //     console.log('Disconnected successfully from: ' + peripheral.id  + ', ' + peripheral.name);
                //     this.state.reading = false;
                // }, (err) => {
                //     console.log('Disconnected failure from: ' + peripheral.id  + ', ' + peripheral.name + ', error: ' + err);
                // })
            } else
            {
                console.log('test(); trying to connect to peripheral');
                BleManager.stopScan().then(() => {
                    console.log('Stop scanning successful');
                }, (err) => {
                    console.log('Stop scanning failed: ' + err);
                });
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
                    this.props.setGlobalState({bluetoothConnected: true});


                    // BleManager.createBond(peripheral.id).then(() => {
                    //     console.log('Bonded to: ' + peripheral.name + ', ' + peripheral.id);
                    // }, (bond_error) => {
                    //     console.log('Failed to Bond: ' + bond_error);
                    // });
                    //setTimeout(() => {
                        if (peripheral.name == "PatchSim") {
                            this.state.connectedToPatch = true;
                        }

                        BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
                            console.log('Peripheral Info');
                            console.log(peripheralInfo);

                            var service =    '72369D5C-94E1-41D7-ACAB-A88062C506A8';
                            var notifyChar = '222B99A0-37CC-4799-9152-7C35D5C5FE07';

                            // BleManager.startNotification(peripheral.id, service, notifyChar).then(() => {
                            //     console.log('Started notification on ' + peripheral.id);
                            // }).catch((err) => {
                            //     console.log('Notification error', err);
                            // });
                            this.handleUpdateValueForCharacteristic({peripheral: peripheral.id, value: [7]});

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
        let autoColor = '#ccc';

        return (
            <SafeAreaView style = {styles.container}>
                <TouchableHighlight 
                    style = {{
                        marginTop: 10,
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
                <TouchableHighlight
                    onPress = {() => {
                        if (this.state.autoRead == false) {
                            this.state.autoRead = true;
                            console.log('autoRead: ' + this.state.autoRead);
                            autoColor = 'green';
                        } else {
                            this.state.autoRead = false;
                            autoColor = '#ccc';
                            console.log('autoRead: ' + this.state.autoRead);
                        }
                    }} 
                    style = {{
                        marginTop: 0,
                        margin: 20, 
                        padding:20, 
                        backgroundColor:'#ccc'
                    }}
                >
                    <Text>Bluetooth device setup</Text>
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

    async storeItem(key, item) {
        console.log('storeItem() was called; key: ' + key + ', item: ' + item);
        try {
            //we want to wait for the Promise returned by AsyncStorage.setItem()
            //to be resolved to the actual value before returning the value
            // var jsonOfItem = await AsyncStorage.setItem(key, JSON.stringify(item));
            var jsonOfItem = await AsyncStorage.setItem(key, item).then;
            return jsonOfItem;
        } catch (error) {
          console.log('storeItem(): ' + error.message);
        }
    }

    //the functionality of the retrieveItem is shown below
    async retrieveItem(key) {
        console.log('retreiveItem() was called; key: ' + key);
        try {
            var myData = undefined;
            const retrievedItem = await AsyncStorage.getItem(key).then((patchData) => {
                console.log('retrieved item is: ' + patchData);
                if(patchData != null) {
                    console.log('returning patchData:' + myData);
                    myData = patchData;
                } else {
                    console.log('returning undefined');
                }
            });

            return myData;
        } catch (error) {
          console.log('retrieveItem(): ' + error.message);
          return retrievedItem;
        }
    }

    fireAlarm() {
        if(!this.props.globalState.alarmTriggered) {
            NotificationsAndroid.localNotification({
                title: "NIBVA",
                body: "Threshold value reached!",
                // extra: "data"
            });
            this.props.setGlobalState({alarmTriggered: true});
            var pattern = [1000, 2000];
            Vibration.vibrate(pattern, true);

            Alert.alert(
                'Alarm',
                '',
                [
                    {text: 'Stop', onPress: () => {
                        Vibration.cancel();
                        this.props.setGlobalState({alarmTriggered: false});
                    }},
                    // {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                ],
                { cancelable: false }
            );
        }
    }

    checkAlarm(volume) {
        var newAlarmList = this.props.globalState.alarmList;
        console.log("Check alarm: " + volume);
        for(var i = 0; i < newAlarmList.length; i++) {
            console.log('storedAlarm: ' + typeof(parseFloat(newAlarmList[i].threshold)) + ' <= nextVolume: ' + typeof(volume) + 'on? ' + newAlarmList[i].on);
            if(parseFloat(newAlarmList[i].threshold) <= volume && newAlarmList[i].on == "true") {
                this.fireAlarm();
                newAlarmList[i].on = "false";
            }
        }
    
        this.props.setGlobalState({alarmList: newAlarmList});
    
        var alarmRecord = newAlarmList.length.toString();
        for(var i = 0; i < newAlarmList.length; i++) {
            alarmRecord = alarmRecord + ',' + newAlarmList[i].threshold + ',' + newAlarmList[i].on;
        }
    
        console.log("alarmRecord: " + alarmRecord);
    
        this.storeItem("alarmRecord", alarmRecord).then((stored) => {
                //this callback is executed when your Promise is resolved
                // alert("Success writing");
                }).catch((error) => {
                //this callback is executed when your Promise is rejected
                console.log('Promise is rejected with error: ' + error);
        });
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