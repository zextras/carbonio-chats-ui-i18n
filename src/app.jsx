/*
 * *** BEGIN LICENSE BLOCK *****
 * Copyright (C) 2011-2019 ZeXtras
 *
 * The contents of this file are subject to the ZeXtras EULA;
 * you may not use this file except in compliance with the EULA.
 * You may obtain a copy of the EULA at
 * http://www.zextras.com/zextras-eula.html
 * *** END LICENSE BLOCK *****
 */

import React, { useEffect, lazy, Suspense } from 'react';
import { Spinner, registerAppData } from '@zextras/zapp-shell';
import { filter, find, forEach, noop } from 'lodash';
import { skipWhile, take } from 'rxjs/operators';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import {NotificationCenterBloc} from "./commonComponents/blocs/NotificationCenterBloc";
import {ApiClient} from "./commonComponents/network/ApiClient";
import createApiLink from "./commonComponents/network/links/rest/apiLink";
import {SessionBloc} from "./commonComponents/blocs/SessionBloc";
import {MessageFactory} from "./commonComponents/components/commons/conversation/messages/MessageFactory";
import {UserInfoCacheBloc} from "./commonComponents/blocs/UserInfoCacheBloc";
import ServiceWorkerBloc from "./commonComponents/blocs/ServiceWorkerBloc";
import {LocalStreamBloc} from "./commonComponents/blocs/LocalStreamBloc";
import {ConversationsListBloc} from "./commonComponents/blocs/ConversationsListBloc";
import {MeetingListProviderBloc} from "./commonComponents/blocs/MeetingListProviderBloc";
import {SettingsManagerBloc} from "./commonComponents/blocs/SettingsManagerBloc";
import NotificationBloc from "./commonComponents/blocs/NotificationBloc";
import {SendFileBloc} from "./commonComponents/blocs/SendFileBloc";
import {ChatWindowListBloc} from "./commonComponents/blocs/ChatWindowListBloc";
import provideContexts from "./commonComponents/contexts/provideContexts";
import Sentry from "./commonComponents/utils/Sentry";
import MatomoTracker from "./commonComponents/utils/MatomoTracker";
import ConversationListPage from "./commonComponents/components/pages/ConversationListPage";
import {NotificationPortal} from "./commonComponents/components/notification/NotificationPortal";
import MiniVideoPortal from "./commonComponents/components/miniMeeting/MiniVideoPortal";
import SpaceListPage from "./commonComponents/components/pages/SpaceListPage";
import InstantMeetingListPage from "./commonComponents/components/pages/InstantMeetingListPage";
import ConversationPage from "./commonComponents/components/pages/ConversationPage";
import {simpleMessageBuilder} from "./commonComponents/components/commons/conversation/messages/SimpleMessageBuilder";
import {fileShareMessageBuilder} from "./commonComponents/components/commons/conversation/messages/FileShareMessageBuilder";
import {serviceNotificationBuilder} from "./commonComponents/components/commons/conversation/messages/ServiceNotificationBuilder";
import {deletedMessageBuilder} from "./commonComponents/components/commons/conversation/messages/DeletedMessageBuilder";
import ChannelPage from "./commonComponents/components/pages/ChannelPage";
import MeetingPage from "./commonComponents/components/meetingComponents/MeetingPage";
import ScheduledMeetingPage from "./commonComponents/components/pages/MeetingRoomsPage";
import MeetingEndedPage from "./commonComponents/components/pages/external/MeetingEndedPage";
import ExternalMeetingPage from "./commonComponents/components/pages/external/ExternalMeetingPage";
import AccessToMeetingPage from "./commonComponents/components/pages/external/AccessToMeetingPage";

const context = {};
const zimbra = {};

// Tracker
const sentry = new Sentry();
const matomo = new MatomoTracker();

// Creating Bloc
const notificationCenter = new NotificationCenterBloc();
const apiClient = new ApiClient(createApiLink('/zx/team/'), []);
const sessionBloc = new SessionBloc(apiClient, notificationCenter, context, matomo);
const messageFactory = new MessageFactory(apiClient);
const userInfoCacheBloc = new UserInfoCacheBloc(apiClient, sessionBloc);
const serviceWorkerBloc = new ServiceWorkerBloc();
const localStreamBloc = new LocalStreamBloc(sentry);
const conversationsListBloc = new ConversationsListBloc(apiClient, userInfoCacheBloc, sessionBloc, notificationCenter);
const meetingListProviderBloc = new MeetingListProviderBloc(apiClient, userInfoCacheBloc, sessionBloc, conversationsListBloc, localStreamBloc, notificationCenter, sentry, matomo, false);
// Pass the meetingListProviderBloc to conversationListBloc to initialise meeting on getConversations()
conversationsListBloc.setMeetingListProviderBloc(meetingListProviderBloc);
const settingsManagerBloc = new SettingsManagerBloc(zimbra);
const notificationBloc = new NotificationBloc(serviceWorkerBloc, apiClient, userInfoCacheBloc, sessionBloc, settingsManagerBloc, conversationsListBloc);
const sendFileBloc = new SendFileBloc(apiClient, conversationsListBloc, notificationCenter);
const chatWindowListBloc = new ChatWindowListBloc(sessionBloc);

apiClient.isConnected.subscribe((isConnected) => {
	if (isConnected) {
		conversationsListBloc.init();
		// Matomo initial data about conversations
		setTimeout(() => {
			const userId = sessionBloc.userInfo.getValue().id;
			const totalGroups = filter(conversationsListBloc._conversationsMap, (conversation) => conversation.type === 'group');
			const totalSpaces = filter(conversationsListBloc._conversationsMap, (conversation) => conversation.type === 'space');
			const totalsChannels = filter(conversationsListBloc._conversationsMap, (conversation) => conversation.type === 'channel');
			const totalJoinedChannels = filter(totalsChannels, channel => find(channel.members, user => user.user_id === userId));
			matomo.trackEvent('team_groups_number', 'startup_event', undefined, totalGroups.length);
			forEach(totalGroups, group => 	matomo.trackEvent('team_group_members', 'startup_event', group.id, group.members.length));
			matomo.trackEvent('team_spaces_number', 'startup_event', undefined, totalSpaces.length);
			forEach(totalSpaces, space => matomo.trackEvent('team_space_members', 'startup_event', space.id, space.members.length));
			matomo.trackEvent('team_channels_number', 'startup_event', undefined, totalsChannels.length);
			matomo.trackEvent('team_joined_channels_number', 'startup_event', undefined, totalJoinedChannels.length);
		}, 5000);
	}
});

apiClient.currentSession.pipe(
	skipWhile((loginData) => (loginData == null)),
	take(1)
)
	.subscribe((loginData) => {
		messageFactory.addMessageBuilder(simpleMessageBuilder);
		messageFactory.addMessageBuilder(fileShareMessageBuilder);
		messageFactory.addMessageBuilder(serviceNotificationBuilder);
		messageFactory.addMessageBuilder(deletedMessageBuilder);
	});
apiClient.login().then(() => null);

// Pages
const contextWrapper = provideContexts(
	conversationsListBloc,
	sessionBloc,
	userInfoCacheBloc,
	meetingListProviderBloc,
	settingsManagerBloc,
	sendFileBloc,
	chatWindowListBloc,
	messageFactory,
	notificationCenter,
	sentry,
	matomo
);

const NotificationPortalHandler = contextWrapper(<NotificationPortal />);
const MiniVideoPortalHandler = contextWrapper(<MiniVideoPortal />);

const ConversationList = contextWrapper(<ConversationListPage NotificationPortal={NotificationPortalHandler} MiniVideoPortal={MiniVideoPortalHandler} />);
const SpaceList = contextWrapper(<SpaceListPage NotificationPortal={NotificationPortalHandler} MiniVideoPortal={MiniVideoPortalHandler} />);
const InstantMeetingList = contextWrapper(<InstantMeetingListPage NotificationPortal={NotificationPortalHandler} MiniVideoPortal={MiniVideoPortalHandler} />);
const ConversationPageView = contextWrapper(<ConversationPage NotificationPortal={NotificationPortalHandler} MiniVideoPortal={MiniVideoPortalHandler} />);
const ChannelPageView = contextWrapper(<ChannelPage NotificationPortal={NotificationPortalHandler} MiniVideoPortal={MiniVideoPortalHandler} />);
const MeetingPageView = contextWrapper(<MeetingPage NotificationPortal={NotificationPortalHandler} />);
const ScheduledMeetingPageView = contextWrapper(<ScheduledMeetingPage NotificationPortal={NotificationPortalHandler} MiniVideoPortal={MiniVideoPortalHandler} />);
const ExternalMeetingPageView = contextWrapper(<ExternalMeetingPage />);
const ExternalInstantMeetingPageView = contextWrapper(<AccessToMeetingPage />);
// const WaitingRoomPageView = contextWrapper(<WaitingRoomPage />);
// const MiniChatPortalHandler = contextWrapper(<MiniChatPortal NotificationPortal={NotificationPortalHandler} />);

const ZappTeamMainView = () => {
	const { path } = useRouteMatch();
	return (
		<Switch>
			<Route exact path={`${path}`} component={ConversationList} />
			<Route path={`${path}/conversations`} component={ConversationList} />
			<Route path={`${path}/spaces`} component={SpaceList} />
			<Route path={`${path}/meetingRooms`} component={InstantMeetingList} />
			<Route path={`${path}/conversation/:conversationId`} component={ConversationPageView} />
			<Route path={`${path}/channel/:spaceId/:channelId`} component={ChannelPageView} />
			<Route path={`${path}/meetingRoom/:conversationId`} component={ScheduledMeetingPageView} />
			<Route path={`${path}/meetingEndedPage`} component={MeetingEndedPage} />
			<Route path={`${path}/meeting/:meetingId`} component={MeetingPageView} />
			// TODO HANDLE EXTERNAL ENTRYPOINT
			{/*{*/}
			{/*	if (isExternalMeeting) {*/}
			{/*		<Route exact path={`${path}`} component={ExternalInstantMeetingPageView} />*/}
			{/*		<Route path={`${path}/meeting/:meetingId`} component={ExternalMeetingPageView} />*/}
			{/*		<Route path={`${path}/infoPage/:infoType`} component={WaitingRoomPageView} />*/}
			{/*	}*/}
			{/*}*/}
		</Switch>
	);
};

export default function App() {
	console.log(
		'%c TEAM APP LOADED',
		'color: white; background: #8bc34a;padding: 4px 8px 2px 4px; font-family: sans-serif; border-radius: 12px; width: 100%'
	);

	useEffect(() => {
		registerAppData({
			icon: 'TeamOutline',
			views: {
				app: ZappTeamMainView
			},
		});
	}, []);

	return null;
}