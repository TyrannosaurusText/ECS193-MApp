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
import { LineChart, Grid, YAxis } from 'react-native-svg-charts'
import FeedbackComponent from './FeedbackComponent';
import { withNavigation } from 'react-navigation';

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

        this.state = {
            historyList: []
        }

        this.fetchReading = this.fetchReading.bind(this);
        this.convertUTCDateToLocalDate = this.convertUTCDateToLocalDate.bind(this);
    }

    convertUTCDateToLocalDate(date) {
        var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

        var offset = date.getTimezoneOffset() / 60;
        var hours = date.getHours();

        newDate.setHours(hours - offset);

        return newDate;   
    }

    fetchReading() {
        if(this.props.globalState.email == '')
            return

        var postObj = {
            authCode: this.props.globalState.authCode,
            id: this.props.globalState.id,
        };
        console.log(postObj);
        //if able to pos
        fetch('https://majestic-legend-193620.appspot.com/mobile/readings', {
        // fetch('https://majestic-legend-193620.appspot.com/insert/reading', {
        // fetch('http://192.168.43.198:8080/mobile/readings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postObj)

        })
        .then((result) => result.json())
        .then((json) => {
            console.log('Send done');
            console.log(json);

            var csvArr = json.csv.split(/,|\n/);
            csvArr.pop();
            var numEntries = csvArr.length/65;

            var newList = [];
            for(var i = 0, j = 0; i < numEntries; i++) {
                var time = csvArr[i * 65];
                var newTime = this.convertUTCDateToLocalDate(new Date(time));
                console.log("Time is: " + newTime);
                var sum = 0;
                for(j = 1; j < 65; j++) {
                    sum += parseInt(csvArr[i * 65 + j]);
                }
                var avg = sum / 64;
                newList.push({"time": newTime.toString(), "reading": avg});
                console.log("Reading is: " + avg);
            }

            console.log(newList);

            this.setState({historyList: newList});
        }).catch((error) => {
            console.log("ERROR in send " + error);
        });
    }

    render () 
    {
        const list = this.state.historyList;
        const dataSource = ds.cloneWithRows(list);
        const data = this.state.historyList;
        const {navigate} = this.props.navigation;

        return (
            <View style = {styles.container}>
                {
                    (list.length == 0) &&
                    <View style = {{margin: 20}}>
                        <Text style = {{ textAlign: 'center' }}>No data to graph</Text>
                    </View>
                }
                {
                    (list.length != 0) &&
                    <View style = {{margin: 20}}>
                        <Text style = {{ textAlign: 'center' }}>Readings for the past eight hours</Text>
                    </View>
                }
                <View style={{
                    flexDirection: 'row',
                    height: window.height * 0.4,
                    width: window.width
                    // alignItems: 'center',
                    // justifyContent: 'center',
                }}>
                    <YAxis
                        data={data}
                        contentInset={{ top: 20, bottom: 20 }}
                        style={ { 
                            height: window.height * 0.4,
                            width: window.width*0.1 
                        } }
                        svg={{ fontSize: 10, fill: 'grey' }}
                        yAccessor={ ({ item }) => item.reading }
                    />
                    <View style={{
                        flex: 1,
                        width: window.width*0.9
                        // marginLeft: 10
                    }}>
                        <LineChart
                            style={ { 
                                height: window.height * 0.4,
                                width: window.width*0.9 
                                 } }
                            data={ data }
                            yAccessor={ ({ item }) => item.reading }
                            contentInset={ { top: 20, bottom: 20 } }
                            svg={{
                                strokeWidth: 2,
                                // stroke: 'rgb(134, 65, 244)',
                                stroke: 'rgb(72, 133, 237)'
                            }}
                        >
                            <Grid/>
                        </LineChart>
                    </View>
                </View>
                <View 
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }} >
                    <View style={{
                        flex: 1,
                        marginLeft: window.width*0.1,
                        marginRight: window.width*0.1,
                    }}>
                    <Button
                        title = 'Refresh'
                        onPress = {this.fetchReading}
                        // color = 'black'
                    />
                    </View>
                    <View style={{
                        flex: 1,
                        marginRight: window.width*0.1,
                        marginLeft: window.width*0.1
                    }}>
                    <Button 
                        title = 'Submit Event'
                        // color = 'black'
                        onPress = {() => {
                                if(this.props.globalState.email != '') {
                                    navigate('Feedback');
                                }
                                else {
                                    alert("Please sign in first");
                                }
                            }
                        }
                    />
                    </View>
                </View>

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
        </View>
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
        margin: 10
    },
});


export default withGlobalState(HistoryComponent);