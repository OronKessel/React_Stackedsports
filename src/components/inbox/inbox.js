import React, { Component } from 'react';
import { Keyboard, ScrollView, KeyboardAvoidingView, Platform, Dimensions, Animated, FlatList, TouchableOpacity, StyleSheet, StatusBar, View, Image, Text, TextInput } from 'react-native';
import Styles from '../../common/style';
import { serviceGetInbox } from '../../api/message/message';
import { formatDate, getDay } from '../../util/utils';
const { styles } = Styles;
const { width, height } = Dimensions.get('window');

var self = null;
class InboxView extends Component {

    constructor(props) {
        super(props)
        self = this;
        this.state = {
            isVisibleSpin: false,
            isMaskShow: 'none',
            maskPos: 'relative',
            userInfo: this.props.userInfo,
            filterContacts: [],
            contacts: [],
            refreshing: false
        }
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({ isVisibleSpin: true });
            serviceGetInbox()
                .then(res => {
                    if (res != null) {
                        self.setState({ isVisibleSpin: false, contacts: res, filterContacts: res });
                    }
                    else {
                        self.setState({ isVisibleSpin: false });
                    }


                })
                .catch(err => {
                    self.setState({ isVisibleSpin: false });
                });
        }, 100);

    }
    filterInbox(text) {
        var filters = [];
        if (text == '') {
            this.setState({ filterContacts: this.state.contacts });
        }
        else {
            for (var i = 0; i < this.state.contacts.length; i++) {
                if (this.state.contacts[i].first_name.includes(text)) {
                    filters.push(this.state.contacts[i])
                    continue;
                }
                if (this.state.contacts[i].last_name.includes(text)) {
                    filters.push(this.state.contacts[i])
                    continue;
                }
            }
            this.setState({ filterContacts: filters });
        }
    }
    renderSeparator() {
        return (
            <View style={{ backgroundColor: '#323E49', height: 1 }}>

            </View>
        );
    }
    renderAddUnread(item) {
        if (item.unread > 0) {
            return (
                <View style={{ backgroundColor: '#F44336', width: 10, height: 10, borderRadius: 5, position: 'absolute', marginLeft: 40 }} />
            );
        }
    }

    spinnerStyle = function () {
        return {
            alignSelf: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: 0,
            bottom: 0
        }
    }


    renderLoading = () => {
        if (this.state.isVisibleSpin)
            return (
                <View style={this.spinnerStyle()}>
                    <Spinner visible={true} />
                </View>
            );
        else
            return null;
    }
    getTimeString(receiveTime) {
        var date = new Date();
        var recDate = new Date(Date.parse(receiveTime));
        if (date.toDateString() == recDate.toDateString()) {
            return formatDate(recDate);
        }
        else if (date.getTime() - recDate.getTime() > 1000 * 3600 * 24 * 7) {
            currentDate = ("0" + (recDate.getMonth() + 1)).slice(-2) + "/" + ("0" + recDate.getDate()).slice(-2) + "/" + recDate.getFullYear();
            return currentDate;
        }
        else {
            return getDay(recDate);

        }
    }
    clickItem(item, index) {
        this.props.navigation.navigate('ConversationScreen', { athlet: item, userInfo: self.state.userInfo });
    }
    renderInboxItem(item, index) {
        var backColor = "#263440";
        if (index % 2 == 1) {
            backColor = '#25313C';
        }
        return (
            <TouchableOpacity onPress={() => this.clickItem(item, index)}>
                <View>
                    <View style={{ backgroundColor: backColor, flexDirection: 'row', alignItems: 'center', padding: 10 }}>
                        <View>
                            <Image style={[styles.img50, { borderRadius: 25 }]} source={{ uri: item.profile_image }} />
                            {this.renderAddUnread(item)}
                        </View>
                        <View style={{ marginLeft: 10, flex: 1 }}>
                            <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                                <Text style={[styles.whiteColor, { fontSize: 14 }]}>{item.first_name} {item.last_name}</Text>
                                <Image style={{ width: 18, height: 15, marginLeft: 10 }} source={require('../../assets/ic_msg.png')} />
                                {
                                    width < 350 ?
                                        <Text style={{ color: '#2491C9', fontSize: 12, textAlign: 'right', flex: 1 }}>{this.getTimeString(item.last_received_time).substring(0, 3)}</Text>
                                        :
                                        <Text style={{ color: '#2491C9', fontSize: 12, textAlign: 'right', flex: 1 }}>{this.getTimeString(item.last_received_time)}</Text>

                                }
                            </View>
                            <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                                <Text style={{ color: '#8F969C', fontSize: 12 }}>{item.last_message_preview}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ backgroundColor: '#323E49', height: 1 }}></View>
                </View>
            </TouchableOpacity>
        );
    }
    handleRefresh() {
        self.setState({ refreshing: true });
        serviceGetInbox()
            .then(res => {
                self.setState({ refreshing: false, contacts: res, filterContacts: res });
            })
            .catch(err => {
                self.setState({ refreshing: false });
            });
    }
    renderInbox() {
        if (this.state.contacts.length == 0) {
            return (
                <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', margin: 20, textAlign: 'center', fontSize: 16 }}>You have no message in your inbox. Compose a new message by selecting the plus sign below</Text>
                </View>
            );
        }
        else {
            return (
                <FlatList
                    data={this.state.filterContacts}
                    renderItem={({ item, index }) => this.renderInboxItem(item, index)}
                    keyExtractor={(item, index) => index.toString()}
                    refreshing={this.state.refreshing}
                    onRefresh={this.handleRefresh}
                />
            )
        }
    }
    render() {
        return (
            <View style={[styles.scene, { backgroundColor: '#25313C', flex: 1 }]}>
                <TextInput style={styles.inputSearch} placeholder="Search" placeholderTextColor="#8D9196" onChangeText={(text) => this.filterInbox(text)} />
                <View style={{ backgroundColor: '#323E49', height: 1 }}></View>

                {this.renderInbox()}

                <View style={{ position: 'absolute', bottom: 20, right: 0 }}>
                    <TouchableOpacity style={{ marginRight: 20, marginBottom: 20 }} onPress={() => self.props.navigation.navigate('MessageScreen', { userInfo: self.state.userInfo, onGoBack: () => this.goQueueScreen() })}>
                        <Image style={[styles.img50, { marginLeft: 5 }]} source={require('../../assets/ic_add_circle.png')} />
                    </TouchableOpacity>
                </View>

            </View>
        );
    }
}

export default InboxView
