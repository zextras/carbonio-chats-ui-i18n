/*
 * *** BEGIN LICENSE BLOCK *****
 * Copyright (C) 2011-2021 ZeXtras
 *
 * The contents of this file are subject to the ZeXtras EULA;
 * you may not use this file except in compliance with the EULA.
 * You may obtain a copy of the EULA at
 * http://www.zextras.com/zextras-eula.html
 * *** END LICENSE BLOCK *****
 */

import {getBridgedFunctions, useReplaceHistoryCallback} from '@zextras/zapp-shell';
import {
	getChannelPath,
	getConversationPath,
	getMainPath, getMeetingEndedPagePath,
	getMeetingPath, getSpacePath
} from "../commonTeam/src/commonComponents/routing";
import {getPaths} from "../commonTeam/src/commonComponents/routing/paths";
import {useCallback} from "react";

const useNavigation = () => {

	const replaceHistoryCallback = useReplaceHistoryCallback();

	const routeToMainPath = useCallback(() => replaceHistoryCallback('/conversations'), [replaceHistoryCallback]);
	const routeToSpaceList = useCallback(() => replaceHistoryCallback('/spaces'), [replaceHistoryCallback]);
	const routeToInstantMeetingList = useCallback(() => replaceHistoryCallback('/instantMeetings'), [replaceHistoryCallback]);
	const routeToConversationPath = useCallback((conversationId) => replaceHistoryCallback(`/conversation/${encodeURIComponent(conversationId)}`), [replaceHistoryCallback]);
	const routeToMeetingPath = useCallback((meetingId) => replaceHistoryCallback(`/meeting/${encodeURIComponent(meetingId)}`), [replaceHistoryCallback]);
	const routeToChannelPath = useCallback((spaceId, channelId) => replaceHistoryCallback(`/channel/${encodeURIComponent(spaceId)}/${encodeURIComponent(channelId)}`), [replaceHistoryCallback]);
	const routeToSpacePath = useCallback((spaceId) => replaceHistoryCallback(`/channel/${encodeURIComponent(spaceId)}/${encodeURIComponent(spaceId)}`), [replaceHistoryCallback]);
	const routeToMeetingEndedPagePath = useCallback(() => replaceHistoryCallback(`/meetingEndedPage`), [replaceHistoryCallback]);

	return {
		routeToMainPath,
		routeToSpaceList,
		routeToConversationPath,
		routeToChannelPath,
		routeToSpacePath,
		routeToMeetingPath,
		routeToInstantMeetingList,
		routeToMeetingEndedPagePath
	}
}

export default useNavigation;