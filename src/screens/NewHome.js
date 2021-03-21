/* eslint-disable react-native/no-inline-styles */
import React, { Component } from 'react';
import {
    View, Text, StyleSheet, Image, Modal, TouchableOpacity, Dimensions, Platform, Alert,
} from 'react-native';
import Header from '../components/header';
import Footer from '../components/footer';
import { colors } from '../common/colors';
import { images } from '../common/images';
import { BlurView } from '@react-native-community/blur';
import { RFValue } from 'react-native-responsive-fontsize';
import AsyncStorage from '@react-native-community/async-storage';
import CardStack, { Card } from 'react-native-card-stack-swiper';
import TrialCard from './TrialCard';
import TeamCard from './TeamCard';
import TrainingCard from './TrainingCard';
import EventCard from './EventCard';
import UserCard from './UserCard';
import OutOfCards from './OutOfCards';
import AntDesign from 'react-native-vector-icons/AntDesign';
import APIKit, { clearClientToken } from '../services/api';
import { styles } from '../styles'
import { connect } from 'react-redux';
import * as Actions from '../store/actions';
import Geocoder from 'react-native-geocoding';
import Geolocation from '@react-native-community/geolocation';

export const { width, height } = Dimensions.get('window');

function DateView(props) {
    return (
        <View style={styles.item}>
            <View style={styles.btn_date}>
                <Text style={styles.text3}>{props.data}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <View
                    style={[
                        styles.circle_date,
                        {
                            backgroundColor: props.value[0] ? colors.green : colors.red,
                        },
                    ]}>
                    <Text style={styles.text_date}>AM</Text>
                </View>
                <View
                    style={[
                        styles.circle_date,
                        {
                            backgroundColor: props.value[1] ? colors.green : colors.red,
                        },
                    ]}>
                    <Text style={styles.text_date}>PM</Text>
                </View>
                <View
                    style={[
                        styles.circle_date,
                        {
                            backgroundColor: props.value[2] ? colors.green : colors.red,
                        },
                    ]}>
                    <Text style={styles.text_date}>EVE</Text>
                </View>
            </View>
        </View>
    );
}
class Home extends Component {
    constructor(props) {
        super(props);
        this.swiper = null;
        this.state = {
            userId: '',
            modalVisible: false,
            matchModal: false,
            toggleMatchingPanel: false,
            toggleMatchingFollowPanel: false,
            toggleTeamPanel: false,
            allcards: [],
            universities: [],
            currentUser: {},
            latitude: null,
            longitude: null,
            address: '',
            matchUser: {},
            matchUserId: null,
        };
    }

    componentDidMount() {
        // console.log('svg', images.chat);
        AsyncStorage.getItem('usedBefore', (err, result) => {
            if (err) {
            }
            else {
                if (result == null) {
                    this.setState({ modalVisible: true });
                }
            }
        });

        AsyncStorage.setItem(
            'usedBefore',
            JSON.stringify({ value: 'true' }),
            (err, result) => {
            },
        );


        APIKit.getCards()
            .then((resp) => {
                this.setState({ allcards: resp.data });
            })
            .catch(this.onAxiosError);


        APIKit.getuniversities()
            .then((resp) => {
                this.setState({ universities: resp.data });
            })
            .catch(this.onAxiosError);


        APIKit.getSetting()
            .then((resp) => {
                this.props.setSetting(resp.data);
                this.setState({ userId: resp.data.userId });
                this.props.socket.emit('User:Joined', resp.data.userId);
            })
            .catch(this.onAxiosError);

        APIKit.getContacts()
            .then((resp1) => {
                this.props.setContacts(resp1.data);
            })
            .catch(this.onAxiosError);

        APIKit.getTeams()
            .then((resp) => {
                this.props.setTeams(resp.data.docs);
            })
            .catch(this.onAxiosError);

        APIKit.getsports()
            .then((resp) => {
                this.props.setSports(resp.data);
            })
            .catch(this.onAxiosError);


        APIKit.getprofile()
            .then((resp) => {
                if (this.state.latitude) {
                    APIKit.profile({
                        ...resp.data,
                        location: {
                            lat: this.latitude,
                            lng: this.longitude,
                            address: this.address,
                        },
                    }).then((resp1) => {
                        this.props.setProfile(resp1.data);
                    });
                } else {
                    this.props.setProfile(resp.data);
                }
            })
            .catch(this.onAxiosError);


        this.props.socket.on('Online:Users', (onlineUsers) => {

        });
        this.props.socket.on('History', (history) => {
            if (
                history.from === this.state.userId &&
                history.to === this.props.curUser.userId
            ) {
                this.props.clearHistory();
                this.props.addHistory(history.msgs);
            }
        });
        this.props.socket.on('Message', (msg) => {
            if (this.props.curUser.userId === msg.from || this.props.curUser.userId === msg.to) {
                this.props.addHistory([msg.msg]);
                this.props.socket.emit('Chat:Read', {
                    from: this.state.userId,
                    to: this.props.curUser.userId,
                });
            }
            this.props.setContacts(
                this.props.contacts.map((co) => {
                    if (co.userId === msg.from) {
                        return {
                            ...co,
                            count: co.count + 1,
                            unread:
                                this.props.curUser.userId === msg.from ||
                                    this.props.curUser.userId === msg.to
                                    ? 0
                                    : co.unread + 1,
                            latest: msg.msg.msg,
                            datetime: msg.msg.createdAt,
                        };
                    }
                    if (co.userId === msg.to) {
                        return {
                            ...co,
                            count: co.count + 1,
                            unread: 0,
                            latest: msg.msg.msg,
                            datetime: msg.msg.createdAt,
                        };
                    }
                    return co;
                }),
            );
        });

        this.props.socket.on('Game:Matched', (matchUserData) => {
            console.log('matchUserData', matchUserData);
            // console.log(this.props.profile);
            if (matchUserData.userId === this.state.userId) {
                this.setState({
                    matchUser: matchUserData.partnerProfile,
                    matchUserId: matchUserData.partnerId,
                    matchModal: true,
                });
            } else if (matchUserData.partnerId === this.state.userId) {
                this.setState({
                    matchUser: matchUserData.userProfile,
                    matchUserId: matchUserData.userId,
                    matchModal: true,
                });
            }
        });
        this.props.socket.on('Chat:Read', (data) => {
            // console.log('Chat:Read', data);
        });
    }

    render() {
        const { navigate } = this.props.navigation;
        const allcards = this.state.allcards
        const style_invisible_newMatch =
            this.state.toggleMatchingPanel === false &&
                this.state.toggleTeamPanel === false &&
                this.state.toggleMatchingFollowPanel === false
                ? { opacity: 1 }
                : { height: 0, opacity: 0, flex: 0 };
        const style_visible_newMatch =
            this.state.toggleMatchingPanel === true
                ? { opacity: 1 }
                : { height: 0, opacity: 0, flex: 0 };
        const style_visible_newMatch_follow =
            this.state.toggleMatchingFollowPanel === true
                ? { opacity: 1 }
                : { height: 0, opacity: 0, flex: 0 };
        const style_visible_team =
            this.state.toggleTeamPanel === true
                ? { opacity: 1 }
                : { height: 0, opacity: 0, flex: 0 };
        const modal_style =
            (this.state.modalVisible === true || this.state.matchModal === true) &&
                Platform.OS === 'android'
                ? { opacity: 0.7 }
                : {};

        const users = allcards && allcards.find((cd) => cd.users !== undefined) && allcards.find((cd) => cd.users !== undefined).users;

        const teams = allcards && allcards.find((cd) => cd.team !== undefined) && allcards.find((cd) => cd.team !== undefined).team;

        const trials = allcards && allcards.find((cd) => cd.trial !== undefined) && allcards.find((cd) => cd.trial !== undefined).trial;

        const training = allcards && allcards.find((cd) => cd.traning !== undefined) && allcards.find((cd) => cd.traning !== undefined).traning;

        const events = allcards && allcards.find((cd) => cd.event !== undefined) && allcards.find((cd) => cd.event !== undefined).event;

        let cards = []
        cards.push(users)
        cards.push(teams)
        cards.push(trials)
        cards.push(training)
        cards.push(events)

        
    }
}


