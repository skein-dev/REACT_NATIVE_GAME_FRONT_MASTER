/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-alert */
import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {get} from 'lodash';
import {colors} from '../../common/colors';
import {images} from '../../common/images';
import {Input, Icon, Button} from 'react-native-elements';
import {RFValue} from 'react-native-responsive-fontsize';
import {responsiveScreenWidth} from 'react-native-responsive-dimensions';
import DropDownPicker from 'react-native-dropdown-picker';
import ImagePicker from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';
import APIKit from '../../services/api';
import ImageResizer from 'react-native-image-resizer';
import ImgToBase64 from 'react-native-image-base64';
import { responsiveScreenFontSize, responsiveWidth ,responsiveHeight} from 'react-native-responsive-dimensions';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

export default class SetPersonalInfo extends Component {
  state = null;
  constructor(props) {
    super(props);
    this.state = {
      firstname: get(this.props, 'navigation.state.params.user.firstname', ''),
      lastname: get(this.props, 'navigation.state.params.user.lastname', ''),
      gender: 'male',
      lat: '',
      long: '',
      address: '',
      showSelected: true,
      monthRange: [
        {label: 'Item 1', value: 'item1'},
        {label: 'Item 2', value: 'item2'},
      ],

      dayRange: [
        {label: 'Item 1', value: 'item1'},
        {label: 'Item 2', value: 'item2'},
      ],

      yearRange: [
        {label: 'Item 1', value: 'item1'},
        {label: 'Item 2', value: 'item2'},
      ],
      resourcePath: {},
      setting: {},
      year: 1970,
      month: 1,
      day: 1,
      photo: null,
      imageUrl: get(this.props, 'navigation.state.params.user.photo', null),
      isUploading: false,
    };
  }

  // UNSAFE_componentWillMount() {
  //   const {user} = this.props.navigation.state.params;
  //   if (user) {
  //     this.setState({
  //       firstname: user.firstname,
  //       lastname: user.lastname,
  //     });
  //   }
  // }

  componentDidMount() {
    var that = this;
    const _monthRange = [];
    const _dayRange = [];
    const _yearRange = [];
    for (let i = 1; i < 13; i++) {
      _monthRange.push({label: i, value: i});
    }
    for (let i = 1; i < 32; i++) {
      _dayRange.push({label: i, value: i});
    }
    for (let i = 1970; i < 2020; i++) {
      _yearRange.push({label: i, value: i});
    }
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({
      monthRange: _monthRange,
      dayRange: _dayRange,
      yearRange: _yearRange,
    });

    //get profile from server
    APIKit.getprofile().then(
      (response) => {
        const data = response.data;
        that.setState({
          firstname: get(
            this.props,
            'navigation.state.params.user.firstname',
            data.firstname,
          ),
          lastname: get(
            this.props,
            'navigation.state.params.user.lastname',
            data.firstname,
          ),
          gender: data.gender,
          imageUrl: get(
            this.props,
            'navigation.state.params.user.photo',
            data.imageUrl,
          ),
        });
      },
      (error) => {
        // console.log(error);
      },
    );
    //get current location, lat & long
    //Checking for the permission just after component loaded
    if (Platform.OS === 'ios') {
      this.callLocation(that);
    } else {
      async function requestLocationPermission() {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Access Required',
              message: 'This App needs to Access your location',
            },
          );
          console.log({granted}, '[GRANTED]');

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            //To Check, If Permission is granted
            that.callLocation(that);
          } else {
            alert('Permission Denied');
          }
        } catch (err) {
          alert('err', err);
          // console.warn(err);
        }
      }
      requestLocationPermission();
    }
  }
  callLocation(it) {
    Geolocation.getCurrentPosition(
      //Will give you the current location
      (position) => {
        const currentLongitude = JSON.stringify(position.coords.longitude);
        //getting the Longitude from the location json
        const currentLatitude = JSON.stringify(position.coords.latitude);
        //getting the Latitude from the location json
        it.setState({lat: currentLongitude});
        //Setting state Longitude to re re-render the Longitude Text
        it.setState({long: currentLatitude});
        //Setting state Latitude to re re-render the Longitude Text
        Geocoder.init('AIzaSyAeKw1f7h01OyvWvCfUKsRyTywseFWOWEk');
        Geocoder.from(position.coords.latitude, position.coords.longitude)
          .then((json) => {
            var fullAddress = json.results[0].formatted_address;
            // console.log(fullAddress);
            APIKit.getSetting().then(({data}) => {
              const setting = {
                ...data,
                location: [
                  {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    address: fullAddress,
                  },
                ],
              };
              console.log('setting',setting);
              APIKit.setSetting(setting).then((resp) => {
                console.log('resp',resp);
                this.setState({setting});
              }) 
              .catch((error) => console.warn(error + "1111"));
              this.setState({address: fullAddress});
            });
          })
          .catch((error) => console.warn(error+ "2222"));
      },
      (error) => alert(error.message),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 200000},
    );
  }
  fileUpload = async () => {
    try {
      const data = new FormData();
      data.append('file', {
        uri:
          Platform.OS === 'android'
            ? this.state.photo.uri
            : this.state.photo.uri.replace('file://', ''),
        name: this.state.photo.fileName,
        type: this.state.photo.type,
      });
      // console.log(data);
      // show uploading
      this.setState({isUploading: true});
      APIKit.uploadImage({
        image: 'data:image/jpeg;base64,' + this.state.photo.data,
        name: this.state.photo.fileName,
      })
        .then((resp) => {
          // console.log('--resp', resp);
          this.setState({imageUrl: resp.data.imageUrl});
        })
        .catch((error) => {
          console.error('err', error);
        })
        .finally(() => {
          this.setState({isUploading: false});
        });
    } catch (e) {
      // error reading value
    }
  };
  imageGalleryLaunch = () => {
    let options = {
      noData: false,
    };

    ImagePicker.showImagePicker(options, (res) => {
      // console.log('Response = ', res);

      if (res.didCancel) {
        // console.log('User cancelled image picker');
      } else if (res.error) {
        // console.log('ImagePicker Error: ', res.error);
      } else if (res.customButton) {
        // console.log('User tapped custom button: ', res.customButton);
        alert(res.customButton);
      } else {
        if (res.uri) {
          this.setState({photo: res});
          // console.log(res);
          if (res.width > 500 || res.height > 500) {
            let newWidth = 500,
              newHeight = 500;
            if (res.width > res.height) {
              newHeight = (res.height / res.width) * 500;
            }
            // console.log('compressing', res.width);
            this.setState({isUploading: true});
            ImageResizer.createResizedImage(
              res.uri,
              newWidth,
              newHeight,
              'PNG',
              3,
            )
              .then((resizedImageUri) => {
                // resizeImageUri is the URI of the new image that can now be displayed, uploaded...
                ImgToBase64.getBase64String(resizedImageUri.uri)
                  .then((base64String) => {
                    this.setState({
                      photo: {
                        fileName: resizedImageUri.name,
                        uri: resizedImageUri.uri,
                        type: 'PNG',
                        data: base64String,
                      },
                    });
                    this.fileUpload();
                    console.log('dadasd:', base64String);

                  })
                  .catch((err) => {
                    console.log('loading image error:', err);
                  });
              })
              .catch((err) => {
                // console.log('Image Compress Error:', err);
                this.setState({isUploading: false});
                Alert.alert('Image Compress Failed.');
              });
          } else {
            this.fileUpload();
          }
        }
      }
    });
  };

  seleted_item() {
    if (this.state.showSelected) {
      return (
        <Image source={images.genderSelected} style={styles.genderSelected} />
      );
    } else {
      return null;
    }
  }
  selected(ge) {
    this.setState({gender: ge});
  }

  next() {
    if (this.state.firstname === '' || this.state.lastname === '') {
      Alert.alert('Please input First Name and Last Name');
    } else if (!this.state.imageUrl) {
      Alert.alert('Please upload your profile picture');
    } else {
      // Patch Profile
      var dob = new Date(this.state.year, this.state.month - 1, this.state.day);
      var diff_ms = Date.now() - dob.getTime();
      var age_dt = new Date(diff_ms);

      var age = Math.abs(age_dt.getUTCFullYear() - 1970);

      console.log({
        firstName: this.state.firstname,
        lastName: this.state.lastname,
        location: {
          lat: this.state.lat,
          lng: this.state.long,
          address: this.state.address,
        },
        gender: this.state.gender,
        age,
        imageUrl: this.state.imageUrl,
        fullfilled: false,
      });
      APIKit.profile({
        firstName: this.state.firstname,
        lastName: this.state.lastname,
        location: {
          lat: this.state.lat,
          lng: this.state.long,
          address: this.state.address,
        },
        gender: this.state.gender,
        age,
        imageUrl: this.state.imageUrl,
        fullfilled: false,
      }).then(
        (response) => {
          console.log(response);
          this.props.navigation.navigate('ChooseSports');

        },
        (error) => {
          // console.log(error);
        },
      );
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>

        <Text style={styles.header}>Add Profile Information</Text>
 
 

        <View style={{width:'100%',alignItems:'center'}}>
          
        <TouchableOpacity onPress={this.imageGalleryLaunch}>
            <Image
              source={
                this.state.photo == null
                  ? this.props.navigation.state.params.user &&
                    this.props.navigation.state.params.user.photo
                    ? {
                        uri: this.props.navigation.state.params.user.photo,
                      }
                    : images.userProfileDefault
                  : {uri: this.state.photo.uri}
              }
              style={styles.image}
            />
          </TouchableOpacity>
          <Text style={styles.imageLabel}>Add Profile Picture</Text>
 

          <View style={styles.inputContainer}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder={'Enter your first name'}
              value={this.state.firstname}
              onChangeText={(value) => this.setState({firstname: value})}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder={'Enter your last name'}
              onChangeText={(value) => this.setState({lastname: value})}
              value={this.state.lastname}
            />
          </View>

          <View style={styles.inputContainerIndex}>
          <Text style={styles.label}>Date of Birth</Text>
          <View
            style={
              Platform.OS === 'ios'
                ? {flexDirection: 'row', marginTop: 5, }
                : {flexDirection: 'row', marginTop: 5}
            }>

            <View  style={      Platform.OS === 'ios'  ? {flex: 1, paddingHorizontal: 5, }   : {flex: 1, paddingHorizontal: 5} }>

              <DropDownPicker
                style={{   backgroundColor: 'rgba(0,0,0,0.1)',    }}
                items={this.state.dayRange}
                defaultNull
                placeholder="DD"
                containerStyle={
                  Platform.OS === 'ios'
                    ? {height: 40, }
                    : {height: 40, }
                }
                labelStyle={{
                  color: 'grey',
                  fontSize: RFValue(12, 580),
                  alignItems: 'flex-start',
                }}
                placeholderStyle={Platform.OS === 'ios' ? {} : {}}
                onChangeItem={(item) => this.setState({day: item.value})}
              />
            </View>
            <View style={{flex: 1, paddingHorizontal: 5}}>
              <DropDownPicker
                style={{
                  backgroundColor: 'rgba(0,0,0,0.1)',
                }}
                items={this.state.monthRange}
                defaultNull
                placeholder="MM"
                containerStyle={{height: 40}}
                labelStyle={{
                  color: 'grey',
                  fontSize: RFValue(12, 580),
                  alignItems: 'flex-start',
                }}
                placeholderStyle={Platform.OS === 'ios' ? {} : {}}
                onChangeItem={(item) => this.setState({month: item.value})}
              />
            </View>
            <View style={{flex: 2, paddingHorizontal: 5}}>
              <DropDownPicker
                style={{
                  backgroundColor: 'rgba(0,0,0,0.1)',
                }}
                items={this.state.yearRange}
                defaultNull
                placeholder="YYYY"
                containerStyle={{height: 40}}
                labelStyle={{
                  color: 'grey',
                  fontSize: RFValue(12, 580),
                  // alignItems: 'flex-start',
                }}
                placeholderStyle={Platform.OS === 'ios' ? {} : {}}
                onChangeItem={(item) => this.setState({year: item.value})}
              />
            </View>
          </View>

        </View>

       
        
        
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.genderTouchable}
              onPress={() => this.selected('male')}>
              <Image
                style={
                  this.state.gender === 'male'
                    ? styles.genderSelected
                    : styles.genderImage
                }
                source={images.genderM}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.genderTouchable}
              onPress={() => this.selected('female')}>
              <Image
                style={
                  this.state.gender === 'female'
                    ? styles.genderSelected
                    : styles.genderImage
                }
                source={images.genderW}
              />
            </TouchableOpacity>
          </View>
        </View>  


       <View style={styles.sectionBottom}>
          <View style={{alignItems: 'flex-start'}}>
            <Button
              buttonStyle={styles.navBtn_prev}
              icon={<Icon name={'chevron-left'} size={60} color="#fff" />}
              onPress={() => this.props.navigation.goBack()}
            />
          </View>
          <View style={{alignItems: 'flex-end'}}>
            <Button
              buttonStyle={styles.navBtn_next}
              icon={<Icon name={'chevron-right'} size={60} color="#fff" />}
              onPress={() => this.next()}
            />
          </View>
        </View> 

      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    fontFamily: 'ProximaNova-Bold',
    fontSize: 16,
    marginTop: 10,
  },
  image: {
    height: 80,
    width: 80,
    borderRadius: 40,
    marginVertical: 10,
  },
  imageLabel: {
    fontFamily: 'ProximaNova-Bold',
    fontSize: 12,
  },
  inputContainer: {
    justifyContent: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  inputContainerIndex: {
    justifyContent: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  label: {
    fontFamily: 'ProximaNova-Regular',
    fontSize: 16,
  },
  textInput: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 5,
    fontFamily: 'ProximaNova-Regular',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    marginTop: 5,
  },
  genderTouchable: {
    marginRight: 8,
  },
  genderImage: {
    height: 60,
    width: 60,
    resizeMode: 'contain',
    opacity: 0.3,
  },
  genderSelected: {
    height: 60,
    width: 60,
    resizeMode: 'contain',
  },
  sectionBottom: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent:'space-between'
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
});
