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
import Overlay from 'react-native-elements';

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
        };

        // this.fetchReading = this.fetchReading.bind(this);
        // this.convertUTCDateToLocalDate = this.convertUTCDateToLocalDate.bind(this);
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
                                >Alarm at threshold value: {item.threshold}</Text>
                            </View>
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