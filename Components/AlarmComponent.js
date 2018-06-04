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
    AsyncStorage
} from 'react-native';
// import BleManager from 'react-native-ble-manager';
import { SafeAreaView } from 'react-navigation';
import { Buffer } from 'buffer';
import { withGlobalState } from 'react-globally';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, Grid } from 'react-native-svg-charts'
import FeedbackComponent from './FeedbackComponent';
import AddAlarmComponent from './AddAlarmComponent';
import { withNavigation } from 'react-navigation';


const window = Dimensions.get('window');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class AlarmComponent extends Component 
{
    constructor() 
    {
        super();

        this.state = {
            isVisible: false,
            toggle: false
        };

        this.editAlarmList = this.editAlarmList.bind(this);
        this.removeAlarm = this.removeAlarm.bind(this);
        this.toggleAlarm = this.toggleAlarm.bind(this);
        this.storeItem = this.storeItem.bind(this);
        this.retrieveItem = this.retrieveItem.bind(this);
    }


    async storeItem(key, item) {
        try {
            //we want to wait for the Promise returned by AsyncStorage.setItem()
            //to be resolved to the actual value before returning the value
            // var jsonOfItem = await AsyncStorage.setItem(key, JSON.stringify(item));
            var jsonOfItem = await AsyncStorage.setItem(key, item);
            return jsonOfItem;
        } catch (error) {
          console.log(error.message);
        }
    }

    //the functionality of the retrieveItem is shown below
    async retrieveItem(key) {
        try {
          const retrievedItem =  await AsyncStorage.getItem(key);
          // const item = JSON.parse(retrievedItem);
          const item = retrievedItem;
          return item;
        } catch (error) {
          console.log(error.message);
        }
    }

    editAlarmList(item) {
        console.log(typeof(item.on));
        Alert.alert(
            'Edit Alarm',
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
        newAlarmList = [];
        for(var i in list) {
            if(item.threshold != list[i].threshold) {
                newAlarmList.push(list[i]);
            }
            else {
                console.log(item);
            }
        }

        console.log(newAlarmList);

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

    toggleAlarm(item) {
        const list = this.props.globalState.alarmList;
        newAlarmList = [];
        for(var i in list) {
            if(item.threshold == list[i].threshold) {
                if(this.props.globalState.currentVolume < item.threshold) {
                    item.on = item.on != "true" ? "true" : "false";
                }
                else {
                    alert("The current volume is higher than this alarm threshold volume");
                }
            }
            newAlarmList.push(list[i]);
        }

        console.log(newAlarmList);

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

    
    render () {
        const list = this.props.globalState.alarmList;
        const dataSource = ds.cloneWithRows(list);
        const {navigate} = this.props.navigation;
        
        return (
            <SafeAreaView style = {styles.container}>
            <ScrollView style = {styles.scroll}>
            {
                (list.length == 0) &&
                <View style = {{ flex:1, margin: 20 }}>
                    <Text style = {{ textAlign: 'center' }}>No alarm is setup</Text>
                </View>
            }
                <ListView
                    enableEmptySections = {true}
                    dataSource = {dataSource}
                    renderRow = {(item) => {
                        var alarmValue = item.on == "true" ? true : false;
                        console.log(alarmValue);
                        return (
                            <TouchableHighlight onPress={() => this.editAlarmList(item) }>
                                <View style= {[ styles.row, { flexDirection: 'row', backgroundColor: 'white'} ]}>
                                    <Text 
                                        style = {{
                                            fontSize: 16,
                                            textAlign: 'center', 
                                            padding: 10,
                                        }}
                                    >Alarm at threshold value: {item.threshold}</Text>
                                    <Switch
                                        value={alarmValue}
                                        onValueChange={() => {console.log("Toggle pressed"); this.toggleAlarm(item)}} 
                                        style={{
                                            position: 'absolute', 
                                            right: 5,
                                            justifyContent: 'center',
                                        }}
                                    />
                                </View>
                            </TouchableHighlight>
                        );
                    }}
                />
            </ScrollView>
            <View style={{
                height:window.height*0.2,
                justifyContent: 'center',
                marginRight:window.width*0.25, 
                marginLeft:window.width*0.25
                }} >
            <Button
                title = 'Add Alaram'
                // color = 'black'
                onPress = {() => {
                    if(list.length < 10) {
                        navigate('AddAlarm');
                    }
                    else {
                        alert("There can be a maximum of 10 alarms set at once");
                    }
                }
            }
            />
            </View>
        </SafeAreaView>
        );
    }
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
        margin: 10,
        height: window.height * 0.07,
        justifyContent: 'center',
        alignItems: 'center',
    },
});


export default withGlobalState(AlarmComponent);