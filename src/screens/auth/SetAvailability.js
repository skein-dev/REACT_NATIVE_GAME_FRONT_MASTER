/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {colors} from '../../common/colors';
import {images} from '../../common/images';
import {Button, Icon} from 'react-native-elements';
import {RFValue} from 'react-native-responsive-fontsize';
import APIKit from '../../services/api';
import { responsiveScreenFontSize, responsiveWidth ,responsiveHeight} from 'react-native-responsive-dimensions';

function DateView(props) {
  return (
    <View style={styles.item}>
      <View style={styles.btn}>
        <Text style={styles.text3}>{props.data}</Text>
      </View>
      <View style={{flexDirection: 'row',width:'75%'  }}>

        <TouchableOpacity
          onPress={() => {
            var key = props.data.toString();
            props.object.setState((prevState) => ({
              [key]: { 
                ...prevState[key],  
                am: !prevState[key].am,  
              },
            }));
          }}>
          <View
            style={[
              styles.circle,
              {backgroundColor: props.value.am ? colors.green : colors.red},
            ]}>
            <Text style={styles.text4}>AM</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            var key = props.data.toString();
            props.object.setState((prevState) => ({
              [key]: { 
                ...prevState[key],  
                pm: !prevState[key].pm,  
              },
            }));
          }}>
          <View
            style={[
              styles.circle,
              {backgroundColor: props.value.pm ? colors.green : colors.red},
            ]}>
            <Text style={styles.text4}>PM</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            var key = props.data.toString();
            props.object.setState((prevState) => ({
              [key]: { 
                ...prevState[key], 
                eve: !prevState[key].eve,  
              },
            }));
          }}>
          <View
            style={[
              styles.circle,
              {backgroundColor: props.value.eve ? colors.green : colors.red},
            ]}>
            <Text style={styles.text4}>EVE</Text>
          </View>
        </TouchableOpacity>

      </View>
    </View>
  );
}
export default class SetAvailability extends Component {
  state = null;

  constructor(props) {
    super(props);
    this.state = {
      Sunday: {
        am: 1,
        pm: 1,
        eve: 1,
      },
      Monday: {
        am: 1,
        pm: 1,
        eve: 1,
      },
      Tuesday: {
        am: 1,
        pm: 1,
        eve: 1,
      },
      Wednesday: {
        am: 1,
        pm: 1,
        eve: 1,
      },
      Thursday: {
        am: 1,
        pm: 1,
        eve: 1,
      },
      Friday: {
        am: 1,
        pm: 1,
        eve: 1,
      },
      Saturday: {
        am: 1,
        pm: 1,
        eve: 1,
      },
    };
  }
  componentDidMount() {
    APIKit.getavaliablity().then(
      (response) => {
        let availability = response.data;
        this.setState({
          Sunday: {
            am: availability.sun[0],
            pm: availability.sun[1],
            eve: availability.sun[2],
          },
          Monday: {
            am: availability.mon[0],
            pm: availability.mon[1],
            eve: availability.mon[2],
          },
          Tuesday: {
            am: availability.tue[0],
            pm: availability.tue[1],
            eve: availability.tue[2],
          },
          Wednesday: {
            am: availability.wed[0],
            pm: availability.wed[1],
            eve: availability.wed[2],
          },
          Thursday: {
            am: availability.thu[0],
            pm: availability.thu[1],
            eve: availability.thu[2],
          },
          Friday: {
            am: availability.fri[0],
            pm: availability.fri[1],
            eve: availability.fri[2],
          },
          Saturday: {
            am: availability.sat[0],
            pm: availability.sat[1],
            eve: availability.sat[2],
          },
        });
        // console.log(this.state);
      },
      (error) => {
        // console.log(error);
      },
    );
  }

  next(navigate) {
    const payload = {
      availability: {
        sun: [
          this.state.Sunday.am,
          this.state.Sunday.pm,
          this.state.Sunday.eve,
        ],
        mon: [
          this.state.Monday.am,
          this.state.Monday.pm,
          this.state.Monday.eve,
        ],
        tue: [
          this.state.Tuesday.am,
          this.state.Tuesday.pm,
          this.state.Tuesday.eve,
        ],
        wed: [
          this.state.Wednesday.am,
          this.state.Wednesday.pm,
          this.state.Wednesday.eve,
        ],
        thu: [
          this.state.Thursday.am,
          this.state.Thursday.pm,
          this.state.Thursday.eve,
        ],
        fri: [
          this.state.Friday.am,
          this.state.Friday.pm,
          this.state.Friday.eve,
        ],
        sat: [
          this.state.Saturday.am,
          this.state.Saturday.pm,
          this.state.Saturday.eve,
        ],
      },
    };
    APIKit.setavaliablity(payload).then(
      (response) => {
        // console.log(response);
        APIKit.getprofile().then(({data}) => {
          APIKit.profile({...data, fullfilled: true}).then((profile) => {
            console.log(profile.data);
            navigate('Permission');
          });
        });
      },
      (error) => {
        // console.log(error);
      },
    );
  }
  render() {
    const {navigate} = this.props.navigation;
    return (
      <View style={{flex:1 , backgroundColor:'#fff'}}>

     
      <ScrollView contentContainerStyle={{flex:1 , paddingVertical: 5}}  style={styles.container}> 

          <View style={styles.main}>

            <View style={styles.sectionTop}>
              <Image source={images.logo} style={styles.logo} />
              <Text style={styles.tlabel}>
                {
                  'Tap the relevant time and day to update availability. Please put times you are NOT available - you can update later'
                }
              </Text>
            </View>


            <View style={styles.sectionMiddle}>
              <View style={{marginRight: 0,  width:'75%' ,alignItems:'flex-start',justifyContent:'flex-end',flexDirection:'row' ,alignSelf:'flex-end'}}>
                <Text style={styles.text2}>
                  {'06:00-12:00'}
                </Text>
                <Text style={styles.text2}>
                  {'12.00-18.00'}
                </Text>
                <Text style={styles.text2}>
                  {'18.00-23.00'}
                </Text>
              </View>

              <DateView 
                data={'Monday'} 
                value={this.state.Monday} 
                object={this} 
              />

              <DateView
                data={'Tuesday'}
                value={this.state.Tuesday}
                object={this}
              />

              <DateView
                data={'Wednesday'}
                value={this.state.Wednesday}
                object={this}
              />

              <DateView
                data={'Thursday'}
                value={this.state.Thursday}
                object={this}
              />

              <DateView 
                data={'Friday'} 
                value={this.state.Friday} 
                object={this} 
              />

              <DateView
                data={'Saturday'}
                value={this.state.Saturday}
                object={this}
              />

              <DateView 
                data={'Sunday'} 
                value={this.state.Sunday} 
                object={this} 
              />

              <View style={styles.largeBtn}>
                <Text style={{color: 'white', fontFamily: 'ProximaNova-Regular'}}>
                  Save
                </Text>
              </View>
            </View>
            <View style={styles.sectionBottom}>
              <View style={{  alignItems: 'flex-start'}}>
                <Button
                  buttonStyle={styles.navBtn_prev}
                  icon={<Icon name={'chevron-left'} size={responsiveWidth(10)} color="#fff" />}
                  onPress={() => navigate('SetBioUniversity')}
                />
              </View>
              <View style={{ alignItems: 'flex-end'}}>
                <Button
                  buttonStyle={styles.navBtn_next}
                  icon={<Icon name={'chevron-right'} size={responsiveWidth(10)} color="#fff" />}
                  onPress={() => this.next(navigate)}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textareaContainer: {
    height: 180,
    padding: 5,
    backgroundColor: '#F5FCFF',
  },
  textarea: {
    textAlignVertical: 'top',
    height: 170,
    fontSize: 14,
    color: '#333',
  },
  main: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    margin: 20,
    marginTop: 8,
    justifyContent:'space-between'
  },
  sectionTop: { 
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop:10
  },
  sectionMiddle: { 
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  sectionBottom: { 
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent:'space-between'
  },
  logo: { 
    width: responsiveWidth(70),
    height: responsiveHeight(7),
    resizeMode: 'contain',
  },
  tlabel: {
    color: 'grey',
    textAlign: 'center',
    fontSize: RFValue(12, 580),
    fontWeight: '600',
    fontFamily: 'ProximaNova-Regular',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label1: { 
    color: 'grey',
    fontSize: RFValue(13, 580),
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: 'ProximaNova-Regular',
    marginVertical: 20,
    marginHorizontal: 20,
  },
  sublabel: {
    // flex: 1,
    color: 'grey',
    fontSize: RFValue(12, 580),
    fontWeight: '600',
    fontFamily: 'ProximaNova-Regular',
  },
  input: {
    width: '100%',
  },
  navBtn_prev: {
    width: responsiveWidth(17),
    height: responsiveWidth(17),
    backgroundColor: colors.red,
    borderRadius: responsiveWidth(17),
  },
  navBtn_next: {
    width: responsiveWidth(17),
    height: responsiveWidth(17),
    backgroundColor: colors.lightgreen,
    borderRadius: responsiveWidth(17),
  },
  mlabel: {
    alignItems: 'center',
    fontSize: 18,
    left: 10,
  },
  racket: {
    width: 40,
    height: 40,
  },
  textCon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    alignItems: 'center',
    fontSize: responsiveScreenFontSize(1.5),
  },
  btn: {
    width: '25%',
    height: 40,
    backgroundColor: '#34495E',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 40,
  },
  item: { 
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    width:'100%',
    justifyContent:'space-between',
    marginRight:5
  },
  circle: {
    backgroundColor: colors.green,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 1,
  },
  text2: {
    color: 'grey',
    fontSize: responsiveScreenFontSize(1.4),
    marginLeft: 10,
    fontWeight: '600',
    fontFamily: 'ProximaNova-Regular',
    alignSelf:'flex-start'
  },
  text3: {
    color: '#fff',
    fontSize: responsiveScreenFontSize(1.5),
    fontFamily: 'ProximaNova-Regular',
    fontWeight: '700',
  },
  text4: {
    color: 'white',
    fontSize: responsiveScreenFontSize(1.3),
    fontFamily: 'ProximaNova-Regular',
  },
});
