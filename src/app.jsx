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

import React, { useEffect } from 'react';
import { filter, find, forEach } from 'lodash';
import { skipWhile, take } from 'rxjs/operators';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { registerAppData } from '@zextras/zapp-shell';
import {NotificationCenterBloc} from "./commonTeam/src/commonComponents/blocs/NotificationCenterBloc";
import {ApiClient} from "./commonTeam/src/commonComponents/network/ApiClient";
import createApiLink from "./commonTeam/src/commonComponents/network/links/rest/apiLink";
import {SessionBloc} from "./commonTeam/src/commonComponents/blocs/SessionBloc";
import {MessageFactory} from "./commonTeam/src/commonComponents/components/commons/conversation/messages/MessageFactory";
import {UserInfoCacheBloc} from "./commonTeam/src/commonComponents/blocs/UserInfoCacheBloc";
import ServiceWorkerBloc from "./commonTeam/src/commonComponents/blocs/ServiceWorkerBloc";
import {LocalStreamBloc} from "./commonTeam/src/commonComponents/blocs/LocalStreamBloc";
import {ConversationsListBloc} from "./commonTeam/src/commonComponents/blocs/ConversationsListBloc";
import {MeetingListProviderBloc} from "./commonTeam/src/commonComponents/blocs/MeetingListProviderBloc";
import {SettingsManagerBloc} from "./commonTeam/src/commonComponents/blocs/SettingsManagerBloc";
import NotificationBloc from "./commonTeam/src/commonComponents/blocs/NotificationBloc";
import {SendFileBloc} from "./commonTeam/src/commonComponents/blocs/SendFileBloc";
import {ChatWindowListBloc} from "./commonTeam/src/commonComponents/blocs/ChatWindowListBloc";
import provideContexts from "./commonTeam/src/commonComponents/components/provideContexts";
import Sentry from "./commonTeam/utils/Sentry";
import MatomoTracker from "./commonTeam/utils/MatomoTracker";
import ConversationListPage from "./commonTeam/src/commonComponents/components/pages/ConversationListPage";
import {NotificationPortal} from "./commonTeam/src/commonComponents/components/notification/NotificationPortal";
import MiniVideoPortal from "./commonTeam/src/commonComponents/components/miniMeeting/MiniVideoPortal";
import SpaceListPage from "./commonTeam/src/commonComponents/components/pages/SpaceListPage";
import InstantMeetingListPage from "./commonTeam/src/commonComponents/components/pages/InstantMeetingListPage";
import ConversationPage from "./commonTeam/src/commonComponents/components/pages/ConversationPage";
import {simpleMessageBuilder} from "./commonTeam/src/commonComponents/components/commons/conversation/messages/SimpleMessageBuilder";
import {fileShareMessageBuilder} from "./commonTeam/src/commonComponents/components/commons/conversation/messages/FileShareMessageBuilder";
import {serviceNotificationBuilder} from "./commonTeam/src/commonComponents/components/commons/conversation/messages/ServiceNotificationBuilder";
import {deletedMessageBuilder} from "./commonTeam/src/commonComponents/components/commons/conversation/messages/DeletedMessageBuilder";
import ChannelPage from "./commonTeam/src/commonComponents/components/pages/ChannelPage";
import MeetingPage from "./commonTeam/src/commonComponents/components/pages/MeetingPage";
// import ExternalMeetingPage from "./commonTeam/src/commonComponents/components/pages/ExternalMeetingPage";
// import ExternalInstantMeetingPage from "./commonTeam/src/commonComponents/components/pages/ExternalInstantMeetingPage";

export default function App() {
	console.log(
		'%c com_zextras_zapp_team launched',
		'color:#0088C1; font-weight:bold; font-size:1.1rem; padding: 4px'
	);

	// TODO
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

	// const ExternalMeetingPageView = contextWrapper(<ExternalMeetingPage />);
	// const ExternalInstantMeetingPageView = contextWrapper(<ExternalInstantMeetingPage />);
	// const MiniChatPortalHandler = contextWrapper(<MiniChatPortal NotificationPortal={NotificationPortalHandler} />);

	const ZappTeamMainView = () => {
		const { path } = useRouteMatch();
		return (
			<Switch>
				<Route exact path={`${path}`} component={ConversationList} />
				<Route path={`${path}/conversations`} component={ConversationList} />
				<Route path={`${path}/spaces`} component={SpaceList} />
				<Route path={`${path}/instantMeetings`} component={InstantMeetingList} />
				<Route path={`${path}/conversation/:conversationId`} component={ConversationPageView} />
				<Route path={`${path}/channel/:spaceId/:channelId`} component={ChannelPageView} />
				<Route path={`${path}/meeting/:meetingId`} component={MeetingPageView} />
			</Switch>
		);
	};

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
