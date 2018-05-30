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
		this.storeItem = this.storeItem.bind(this);
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

	onValueChange() {
		var formValues = this.formGenerator.getValues();

		if(formValues.amount != '' && 
			parseFloat(formValues.amount) > 0 && 
			formValues.amount.indexOf(',') < 0 && 
			formValues.amount.indexOf('.') != formValues.amount.length - 1 && 
			formValues.amount.indexOf('.') == formValues.amount.lastIndexOf('.')) {
			this.setState({invalid: false});
		}
		else {
			this.setState({invalid: true});
		}
		
		// this.setState({ state: this.state });
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
	}

	render () {
		return (
			<SafeAreaView style = {styles.container}>
				<View>
					<GenerateForm
						ref={(c) => {
							this.formGenerator = c;
						}}
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