/*
 * *** BEGIN LICENSE BLOCK *****
 * Copyright (C) 2011-2021 Zextras
 *
 * The contents of this file are subject to the ZeXtras EULA;
 * you may not use this file except in compliance with the EULA.
 * You may obtain a copy of the EULA at
 * http://www.zextras.com/zextras-eula.html
 * *** END LICENSE BLOCK *****
 */

import { useCallback } from 'react';
import { useReplaceHistoryCallback } from '@zextras/zapp-shell';

function useRouting() {

	const replaceHistoryCallback = useReplaceHistoryCallback();
	const route = (url) => useCallback(() => replaceHistoryCallback(url), [replaceHistoryCallback]);
	const routeToMainPath = useCallback(() => replaceHistoryCallback('/conversations'), [replaceHistoryCallback]);
	const routeToSpaceList = useCallback(() => replaceHistoryCallback('/spaces'), [replaceHistoryCallback]);
	const routeToMeetingRoomList = useCallback(() => replaceHistoryCallback('/meetingRooms'), [replaceHistoryCallback]);
	const routeToConversationPath = useCallback((conversationId) => replaceHistoryCallback(`/conversation/${encodeURIComponent(conversationId)}`), [replaceHistoryCallback]);
	const routeToMeetingPath = useCallback((meetingId) => replaceHistoryCallback(`/meeting/${encodeURIComponent(meetingId)}`), [replaceHistoryCallback]);
	const routeToMeetingRoomPath = useCallback((conversationId, onGoing) => replaceHistoryCallback(`/meetingRoom/${encodeURIComponent(conversationId)}${onGoing ? `?ongoing${onGoing}` : ''}`), [replaceHistoryCallback]);
	const routeToChannelPath = useCallback((spaceId, channelId) => replaceHistoryCallback(`/channel/${encodeURIComponent(spaceId)}/${encodeURIComponent(channelId)}`), [replaceHistoryCallback]);
	const routeToSpacePath = useCallback((spaceId) => replaceHistoryCallback(`/channel/${encodeURIComponent(spaceId)}/${encodeURIComponent(spaceId)}`), [replaceHistoryCallback]);
	const routeToWaitingRoomPagePath = useCallback((conversationId) => replaceHistoryCallback(`/waitingRoom/${encodeURIComponent(conversationId)}`), [replaceHistoryCallback]);
	const routeToInfoPagePath = useCallback((infoType) => replaceHistoryCallback(`/infoPage/${encodeURIComponent(infoType)}`), [replaceHistoryCallback]);

	return {
		route,
		routeToMainPath,
		routeToSpaceList,
		routeToConversationPath,
		routeToChannelPath,
		routeToSpacePath,
		routeToMeetingPath,
		routeToMeetingRoomPath,
		routeToMeetingRoomList,
		routeToWaitingRoomPagePath,
		routeToInfoPagePath
	};
}

export default useRouting;