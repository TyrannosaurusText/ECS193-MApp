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
    Picker,
    // AppState,
    Dimensions,
    Button,
} from 'react-native';
// import BleManager from 'react-native-ble-manager';
import { SafeAreaView } from 'react-navigation';
import { withGlobalState } from 'react-globally';
import Icon from 'react-native-vector-icons/MaterialIcons';
import GenerateForm from 'react-native-form-builder';


const window = Dimensions.get('window');

var fields = [
    {
        type: 'number',
        name: 'amount',
        required: true,
        // icon: 'ios-person',
        label: 'Amount',
        hidden: false,
    },
    {
        type: 'picker',
        name: 'event',
        mode: 'dialog',
        label: 'Select Event',
        defaultValue: 'Void',
        options: ['Leak', 'Void'],
    }
]

class FeedbackComponent extends Component {
    
    constructor() {
        super();

        this.state = {
            invalid: true,
            result: ''
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.onValueChange = this.onValueChange.bind(this);
    }

    onValueChange() {

        console.log("Change");
        var formValues = this.formGenerator.getValues();
        console.log(formValues.event);
        console.log(fields[0]);
        if(formValues.event == 'Void') {
            fields[0].hidden = false;
            console.log(formValues.amount);
            if(formValues.amount != '') {
                this.setState({invalid: false});
            }
            else {
                this.setState({invalid: true});
            }
        }
        else {
            fields[0].hidden = true;
            this.setState({invalid: false});

        }
        this.setState({ state: this.state });
        this.setState({result: ""});
    }

    handleSubmit() {
        this.setState({result: "Submitting..."});
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

        var postObj = {
            authCode: this.props.globalState.authCode,
            timestamp: utc,
        };

        var formValues = this.formGenerator.getValues();
        if(formValues.event == 'Void') {
            postObj["amount"] = formValues.amount;
        }

        console.log(postObj);

        fetch('https://majestic-legend-193620.appspot.com/mobile/feedback', {
        // fetch('https://majestic-legend-193620.appspot.com/insert/reading', {
        // fetch('http://192.168.43.198:8080/mobile/readings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postObj)

        })
        .then((json) => {
            console.log('Send done');
            console.log(json);
            if(json.status == 200) {
                // this.setState({result: "Success!"});
                alert("Success!");
            }
            else {
                // this.setState({result: "Failure: " + json.status});
                alert("Failure: " + json.status);
            }

        }).catch((error) => {
            console.log("ERROR in send " + error);
            // this.setState({result: "Failure: " + error});
            alert("Failure: " + error);
        });
    }

    render () {
        return (
            <SafeAreaView style = {styles.container}>
                <View>
                    <GenerateForm
                        ref={(c) => {
                            this.formGenerator = c;
                        }}
                        // fields={this.state.fields}
                        fields={fields}
                        onValueChange={this.onValueChange}
                    />
                </View>
                <Button
                    title="Submit"
                    onPress={this.handleSubmit}
                    disabled={this.state.invalid}
                />
            </SafeAreaView>
        );
    }
}


const styles = StyleSheet.create({
    // container: {
    //     flex: 1,
    //     backgroundColor: '#FFF',
    //     width: window.width,
    //     height: window.height
    // },
    // scroll: {
    //     flex: 1,
    //     backgroundColor: '#f0f0f0',
    //     margin: 10,
    // },
    // row: {
    //     margin: 10
    // },
});


export default withGlobalState(FeedbackComponent);