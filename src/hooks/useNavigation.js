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

import { hooks } from '@zextras/zapp-shell';
import {
	getChannelPath,
	getConversationPath,
	getMainPath, getMeetingEndedPagePath,
	getMeetingPath, getSpacePath
} from "../commonTeam/src/commonComponents/routing";
import {getPaths} from "../commonTeam/src/commonComponents/routing/paths";
import {useCallback} from "react";

const useNavigation = () => {

	const replaceHistoryCallback = hooks.useReplaceHistoryCallback();

	const routeToMainPath = useCallback(() => replaceHistoryCallback(getMainPath()), [replaceHistoryCallback]);
	const routeToSpaceList = useCallback(() => replaceHistoryCallback(getPaths().SPACES), [replaceHistoryCallback]);
	const routeToInstantMeetingList = useCallback(() => replaceHistoryCallback(getPaths().INSTANT_MEETINGS), [replaceHistoryCallback]);
	const routeToConversationPath = useCallback((conversationId) => replaceHistoryCallback(getConversationPath(conversationId)), [replaceHistoryCallback]);
	const routeToMeetingPath = useCallback((meetingId) => replaceHistoryCallback(getMeetingPath(meetingId)), [replaceHistoryCallback]);
	const routeToChannelPath = useCallback((spaceId, channelId) => replaceHistoryCallback(getChannelPath(spaceId, channelId)), [replaceHistoryCallback]);
	const routeToSpacePath = useCallback((spaceId) => replaceHistoryCallback(getSpacePath(spaceId)), [replaceHistoryCallback]);
	const routeToMeetingEndedPagePath = useCallback(() => replaceHistoryCallback(getMeetingEndedPagePath()), [replaceHistoryCallback]);

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