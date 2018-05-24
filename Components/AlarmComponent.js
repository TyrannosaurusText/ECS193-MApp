import React, { Component } from 'react';
import {
    // AppRegistry,
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    Modal,
    // NativeAppEventEmitter,
    // NativeEventEmitter,
    // NativeModules,
    // Platform,
    // PermissionsAndroid,
    Alert,
    Switch,
    Button,
    Spacer,
    ListView,
    ScrollView,
    AppState,
    Dimensions,
} from 'react-native';
// import BleManager from 'react-native-ble-manager';
import { SafeAreaView } from 'react-navigation';
import { Buffer } from 'buffer';
import { withGlobalState } from 'react-globally';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, Grid } from 'react-native-svg-charts'
import FeedbackComponent from './FeedbackComponent';
import { withNavigation } from 'react-navigation';

// import BackgroundTask from 'react-native-background-task';

const window = Dimensions.get('window');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class AlarmComponent extends Component 
{
    // static navigationOptions = ({ navigation }) => ({
    //     headerTitle: 'History',
    //     headerRight: (<Icon name="notifications" size={30} onPress={() => navigation.navigate('Alerts')}/>),
    // });

    constructor() 
    {
        super();

        this.state = {
            // alarmList: [],
            isVisible: false,
            toggle: false
        };

        this.editAlarmList = this.editAlarmList.bind(this);
        // this.convertUTCDateToLocalDate = this.convertUTCDateToLocalDate.bind(this);
    }

    editAlarmList(item) {
        console.log(typeof(item.on));
        Alert.alert(
            'Edit Alarm',
            // 'Threshold value: ' + item.threshold + ' State: ' + item.on == "true" ? 'on' : 'off',
            '',
            [
                {text: 'Delete', onPress: () => this.removeAlarm(item)},
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            ],
            // { cancelable: false }
        )
    }


    removeAlarm(item) {
        const list = this.props.globalState.alarmList;
        newList = [];
        for(var i in list) {
            if(item.threshold != list[i].threshold) {
                newList.push(list[i]);
            }
            else {
                console.log(item);
            }
        }

        console.log(newList);

        this.props.setGlobalState({alarmList: newList});
    }

    toggleAlarm(item) {
        const list = this.props.globalState.alarmList;
        newList = [];
        for(var i in list) {
            if(item.threshold == list[i].threshold) {
                if(this.props.globalState.currentVolume < item.threshold) {
                    item.on = item.on != "true" ? "true" : "false";
                }
                else {
                    alert("The current volume is higher than this alarm threshold volume");
                }
            }
            newList.push(item);
        }

        console.log(newList);

        this.props.setGlobalState({alarmList: newList});
    }

    // convertUTCDateToLocalDate(date) {
    //     var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

    //     var offset = date.getTimezoneOffset() / 60;
    //     var hours = date.getHours();

    //     newDate.setHours(hours - offset);

    //     return newDate;   
    // }

    // fetchReading() {
    //     var postObj = {
    //         authCode: this.props.globalState.authCode,
    //         id: this.props.globalState.id,
    //     };
    //     console.log(postObj);
    //     //if able to pos
    //     fetch('https://majestic-legend-193620.appspot.com/mobile/readings', {
    //     // fetch('https://majestic-legend-193620.appspot.com/insert/reading', {
    //     // fetch('http://192.168.43.198:8080/mobile/readings', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify(postObj)

    //     })
    //     .then((result) => result.json())
    //     .then((json) => {
    //         console.log('Send done');
    //         console.log(json);

    //         var csvArr = json.csv.split(/,|\n/);
    //         csvArr.pop();
    //         var numEntries = csvArr.length/65;

    //         var newList = [];
    //         for(var i = 0, j = 0; i < numEntries; i++) {
    //             var time = csvArr[i * 65];
    //             var newTime = this.convertUTCDateToLocalDate(new Date(time));
    //             console.log("Time is: " + newTime);
    //             var sum = 0;
    //             for(j = 1; j < 65; j++) {
    //                 sum += parseInt(csvArr[i * 65 + j]);
    //             }
    //             var avg = sum / 64;
    //             newList.push({"time": newTime.toString(), "reading": avg});
    //             console.log("Reading is: " + avg);
    //         }

    //         console.log(newList);

    //         this.setState({historyList: newList});
    //     }).catch((error) => {
    //         console.log("ERROR in send " + error);
    //     });
    // }

    render () {
        const list = this.props.globalState.alarmList;
        const dataSource = ds.cloneWithRows(list);
        // const data = [ 50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, -80 ];
        // const {navigate} = this.props.navigation;
        
        return (
            <SafeAreaView style = {styles.container}>
            <ScrollView style = {styles.scroll}>
            {
                (list.length == 0) &&
                <View style = {{ flex:1, margin: 20 }}>
                    <Text style = {{ textAlign: 'center' }}>No Alarm</Text>
                </View>
            }
                <ListView
                    enableEmptySections = {true}
                    dataSource = {dataSource}
                    renderRow = {(item) => {
                        var alarmValue = item.on == "true" ? true : false;
                        console.log(alarmValue);
                    // const color = item.connected ? 'green' : '#fff';
                        return (
                            <TouchableHighlight onPress={() => this.editAlarmList(item) }>
                                <View style= {[ styles.row, { flexDirection: 'row', backgroundColor: 'white'} ]}>
                                    <Text 
                                        style = {{
                                            fontSize: 14, 
                                            textAlign: 'center', 
                                            color: '#333333', 
                                            padding: 10,
                                        }}
                                    >Alarm at threshold value: {item.threshold}</Text>
                                    <Switch
                                        value={alarmValue}
                                        onValueChange={() => {console.log("Toggle pressed"); this.toggleAlarm(item)}} 
                                        style={{
                                            position: 'absolute', 
                                            right: 0,
                                            justifyContent: 'center',
                                        }}
                                    />
                                </View>
                            </TouchableHighlight>
                        );
                    }}
                />
            </ScrollView>
        </SafeAreaView>
        );
    }
  //   render() {
  //   return (
  //     <View style={{

  //       }}>
  //     </View>
  //   );
  // }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        width: window.width,
        height: window.height,
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


export default withGlobalState(AlarmComponent);