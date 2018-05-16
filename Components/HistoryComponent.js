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
    Button,
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
import { LineChart, Grid } from 'react-native-svg-charts'

// import BackgroundTask from 'react-native-background-task';

const window = Dimensions.get('window');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class HistoryComponent extends Component 
{
    // static navigationOptions = ({ navigation }) => ({
    //     headerTitle: 'History',
    //     headerRight: (<Icon name="notifications" size={30} onPress={() => navigation.navigate('Alerts')}/>),
    // });

    constructor() 
    {
        super();
        this.fetchReading = this.fetchReading.bind(this);
    }

    fetchReading() {
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
        var avg = new Array(64);
        for (var j = 0; j < 64; j++) avg[j] = 0;
        var newReading = {
            timestamp: utc,
            channels: avg
        };

        // var newStore = new Array(64);
        // for (var j = 0; j < 64; j++) newStore[j] = {"timestamp": 0, "channels": j};
        var postObj = {
            authCode: this.props.globalState.authCode,
            id: this.props.globalState.id,
            readings: newReading
        };
        console.log(postObj);
        //if able to pos
        // fetch('https://majestic-legend-193620.appspot.com/mobile/readings', {
        fetch('https://majestic-legend-193620.appspot.com/insert/reading', {
        // fetch('http://127.0.0.1:8080/insert/reading', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postObj)

        })
        .then((result) => result.json())
        .then((json) => {
            console.log('Send done');
            console.log(json);
            // pendingReadings = [];
            // this.props.setGlobalState({pendingReadings});
        }).catch((error) => {
            console.log("ERROR in send " + error);
        });
    }

    render () 
    {

        // const list = Array.from(this.state.peripherals.values());
        const list = [
            {"time": 0, "reading": 1},
            {"time": 1, "reading": 10},
            {"time": 2, "reading": 8},
            {"time": 3, "reading": 12},
            {"time": 4, "reading": 14},
            {"time": 5, "reading": 1},
            {"time": 6, "reading": 10},
            {"time": 7, "reading": 8},
            {"time": 8, "reading": 12},
            {"time": 9, "reading": 14},
            {"time": 10, "reading": 1},
            {"time": 11, "reading": 10},
            {"time": 12, "reading": 8},
            {"time": 13, "reading": 12},
            {"time": 14, "reading": 14}
        ];
        const dataSource = ds.cloneWithRows(list);
        
    //     return (
    //         <SafeAreaView>
    //             <Text>Hi</Text>
    //         </SafeAreaView>
    //     );
    // }
    //     const list = Array.from(this.state.peripherals.values());
    //     const dataSource = ds.cloneWithRows(list);
        const data = [ 50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, -80 ];

        return (
            <SafeAreaView style = {styles.container}>
            

            <Button
                title = 'Fetch reading'
                onPress = {this.fetchReading}
            />
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
                                >Average reading: {item.reading}</Text>
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


export default withGlobalState(HistoryComponent);