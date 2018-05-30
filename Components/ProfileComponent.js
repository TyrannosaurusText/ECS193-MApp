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
import { LineChart, Grid } from 'react-native-svg-charts'
import FeedbackComponent from './FeedbackComponent';
import { withNavigation } from 'react-navigation';

const window = Dimensions.get('window');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class ProfileComponent extends Component 
{
    constructor() 
    {
        super();

        this.state = {
            familyName: '',
            givenName: '',
            email: '',
            doctorFamilyName: '',
            doctorGivenName: '',
            doctorEmail: ''
        }

        this.fetchProfile = this.fetchProfile.bind(this);
    }

    fetchProfile() {
        var postObj = {
            authCode: this.props.globalState.authCode,
            id: this.props.globalState.id,
        };
        console.log(postObj);
        //if able to pos
        fetch('https://majestic-legend-193620.appspot.com/fetch/singleMeta', {
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

            this.setState({
                familyName: json.familyName,
                givenName: json.givenName,
                email: json.email,
                doctorFamilyName: json.doctorFamilyName,
                doctorGivenName: json.doctorGivenName,
                doctorEmail: json.doctorEmail
            });

        }).catch((error) => {
            console.log("ERROR in send " + error);
        });
    }

    render () 
    {
        const {navigate} = this.props.navigation;
        
        return (
            <SafeAreaView>
                <Text>Personal Information:</Text>
                <Text>{this.state.givenName}, {this.state.familyName}</Text>
                <Text>{this.state.email}</Text>

                <Text>Doctor Information:</Text>
                <Text>{this.state.doctorGivenName}, {this.state.doctorFamilyName}</Text>
                <Text>{this.state.doctorEmail}</Text>

                <Button
                    title = "Fetch"
                    onPress = {this.fetchProfile}
                />

                <Button
                    title = "Request doctor change"
                    onPress = {() => {navigate("RequestDoctorChange")}}
                />
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
        margin: 10
    },
});


export default withGlobalState(ProfileComponent);