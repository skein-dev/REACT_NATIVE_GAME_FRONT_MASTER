import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {images} from '../common/images';
import AppStatusBar from './AppStatusBar';
import {colors} from '../common/colors';
export const {width, height} = Dimensions.get('window');
import {
  responsiveScreenWidth,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';

import {useSelector} from 'react-redux';

const THEME_COLOR = colors.lightgreen;

export default (props) => {
  const setting = useSelector((state) => state.main.data.setting);
  const onSetting = () => {
    if (setting.distance) {
      props.navigate('Settings');
    }
  };
  return (
    <>
      <SafeAreaView />
      <SafeAreaView>
        <AppStatusBar backgroundColor={THEME_COLOR} barStyle="light-content" />
        <View style={styles.container}>
          <Image source={images.oval} style={styles.oval} />
          <View style={styles.header}>
            <TouchableOpacity onPress={onSetting}>
              <Image source={images.gear} style={styles.icon} />
            </TouchableOpacity>

            <Image
              source={images.GameOn2}
              style={styles.logo}
              resizeMode="contain"
            />

            <TouchableOpacity onPress={() => props.navigate('Messages')}>
              <Image source={images.chat} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {},
  oval: {
    width: '100%',
    alignSelf: 'center',
    height: responsiveHeight(25),
    marginTop: -responsiveHeight(13),
    position: 'absolute',
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    alignContent: 'center',
    marginTop: responsiveHeight(2),
    paddingVertical: 6,
    width: '100%',
    zIndex: 1,
  },
  icon: {
    width: responsiveWidth(7),
    height: responsiveWidth(7),
  },
  logo: {
    alignSelf: 'center',
    width: responsiveWidth(35),
    height: responsiveHeight(6),
  },
});
