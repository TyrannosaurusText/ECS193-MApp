import React, {Component} from 'react';
import {
	Text, 
	TouchableHighlight, 
	View, Dimensions, 
	StyleSheet,
	AsyncStorage,
	Button} from 'react-native';
import { withGlobalState } from 'react-globally';
import { SafeAreaView } from 'react-navigation';
import GenerateForm from 'react-native-form-builder';

const window = Dimensions.get('window');

var fields = [
	{
		type: 'number',
		name: 'amount',
		required: true,
		// icon: 'ios-person',
		label: 'Threshold Amount',
		hidden: false,
	}
]

class AddAlarmComponent extends Component {
  constructor() {
		super();

		this.state = {
			invalid: true,
			result: ''
		}

		this.handleSubmit = this.handleSubmit.bind(this);
		this.onValueChange = this.onValueChange.bind(this);
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

	onValueChange() {

		console.log("Change");
		var formValues = this.formGenerator.getValues();
		// console.log(formValues.event);
		console.log(fields[0]);
		console.log(parseFloat(formValues.amount));
		// if(formValues.event == 'Void') {
		//     fields[0].hidden = false;
		//     console.log(formValues.amount);
			if(formValues.amount != '' && parseFloat(formValues.amount) > 0) {
				this.setState({invalid: false});
			}
			else {
				this.setState({invalid: true});
			}
		// }
		// else {
		//     fields[0].hidden = true;
		//     this.setState({invalid: false});

		// }
		this.setState({ state: this.state });
		this.setState({result: ""});
	}

	handleSubmit() {
		var newAlarmList = this.props.globalState.alarmList;
		var formValues = this.formGenerator.getValues();

		if(newAlarmList.length == 10) {
			alert("There can be a maximum of 10 alarms set at once");
			return;
		}

		for(var i in newAlarmList) {
			console.log(newAlarmList[i].threshold);
			console.log(formValues.amount);
			if(parseFloat(newAlarmList[i].threshold) == formValues.amount) {
				alert("There is already an alarm set for this threshold value");
				return;
			}
		}

		if(parseFloat(formValues.amount) <= this.props.globalState.currentVolume) {
			alert("Please set a threshold volume higher than current volume");
		}
		else {
			newAlarmList.push({"threshold": formValues.amount.toString(), "on": "true"});
		
			this.props.setGlobalState({alarmList: newAlarmList});

			var alarmRecord = newAlarmList.length.toString();
	        for(var i = 0; i < newAlarmList.length; i++) {
	            alarmRecord = alarmRecord + ',' + newAlarmList[i].threshold + ',' + newAlarmList[i].on;
	        }

	        console.log("alarmRecord: " + alarmRecord);

	        this.storeItem("alarmRecord", alarmRecord).then((stored) => {
	                //this callback is executed when your Promise is resolved
	                alert("Success writing");
	                }).catch((error) => {
	                //this callback is executed when your Promise is rejected
	                console.log('Promise is rejected with error: ' + error);
	        });

			this.props.navigation.pop();
		}


		// this.setState({result: "Submitting..."});
		// var da = new Date();
		// var y = da.getUTCFullYear();
		// var m = (da.getUTCMonth() + 1);
		// m = (m < 10 ? '0' : '') + m;
		// var d = da.getUTCDate();
		// d = (d < 10 ? '0' : '') + d;
		// var h = da.getUTCHours();
		// h = (h < 10 ? '0' : '') + h;
		// var mi = da.getUTCMinutes();
		// mi = (mi < 10 ? '0' : '') + mi;
		// var s = da.getUTCSeconds();
		// s = (s < 10 ? '0' : '') + s;
		// var utc = y + '-' + m + '-' + d + ' ' + h + ':' + mi + ':' + s;

		// var postObj = {
		//     authCode: this.props.globalState.authCode,
		//     timestamp: utc,
		// };

		// var formValues = this.formGenerator.getValues();
		// if(formValues.event == 'Void') {
		//     postObj["amount"] = formValues.amount;
		// }

		// console.log(postObj);

		// fetch('https://majestic-legend-193620.appspot.com/mobile/feedback', {
		// // fetch('https://majestic-legend-193620.appspot.com/insert/reading', {
		// // fetch('http://192.168.43.198:8080/mobile/readings', {
		//     method: 'POST',
		//     headers: { 'Content-Type': 'application/json' },
		//     body: JSON.stringify(postObj)

		// })
		// .then((json) => {
		//     console.log('Send done');
		//     console.log(json);
		//     if(json.statue == 200) {
		//         // this.setState({result: "Success!"});
		//         alert("Success!");
		//     }
		//     else {
		//         // this.setState({result: "Failure: " + json.status});
		//         alert("Failure: " + json.status);
		//     }

		// }).catch((error) => {
		//     console.log("ERROR in send " + error);
		//     // this.setState({result: "Failure: " + error});
		//     alert("Failure: " + error);
		// });
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


export default withGlobalState(AddAlarmComponent);