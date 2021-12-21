/*
* **** BEGIN LICENSE BLOCK *****
* Copyright (C) 2011-2021 ZeXtras
*
* The contents of this file are subject to the ZeXtras EULA;
* you may not use this file except in compliance with the EULA.
* You may obtain a copy of the EULA at
* http://www.zextras.com/zextras-eula.html
* **** END LICENSE BLOCK *****
*/
/* globals ZIMLET_PACKAGE_NAME, PRODUCT_TYPE */
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { filter, find, forEach } from 'lodash';
import { defaultSettingsMap, SettingsMap } from '../commonComponents/blocs/SettingsManagerBloc';
// import { getBridgedFunctions } from '@zextras/zapp-shell';

export function getTeamDefaultSettings(settingsManagerBloc) {
	switch (PRODUCT_TYPE) {
		case 'classic-team': {
			settingsManagerBloc._zimbra.jsonRequest('GetInfoRequest', {}, { ns: 'Account' }).then((response) => {
				if (response.hasOwnProperty('props')) {
					const teamsProps = filter(response.props, (prop) => prop.zimlet === ZIMLET_PACKAGE_NAME);

					forEach(SettingsMap, (settingName) => {
						const setting = find(teamsProps, ['name', settingName]);
						//theoretically default should be taken from xml but for fallback
						const value = setting != null ? setting._content : defaultSettingsMap[settingName];
						settingsManagerBloc.setSettingSubject(settingName, value);

						// mini_chat_display setting is the default value for single, group, space/channel
						if (setting == null &&
							(settingName === SettingsMap.MINI_CHAT_DISPLAY_SINGLE ||
								settingName === SettingsMap.MINI_CHAT_DISPLAY_GROUP ||
								settingName === SettingsMap.MINI_CHAT_DISPLAY_SPACE)) {
							const miniDisplaySetting = find(teamsProps, ['name', SettingsMap.MINI_CHAT_DISPLAY]);
							const miniDisplayValue = miniDisplaySetting != null ? miniDisplaySetting._content : defaultSettingsMap[SettingsMap.MINI_CHAT_DISPLAY];
							settingsManagerBloc._subjectsSettingsMap[settingName].next(miniDisplayValue);
						}
					});
				}
				else {
					throw new Error();
				}
			}).catch( ( error ) => console.error(error));
			break;
		}
		case 'zapp-team': {
			// const { getAccounts } = getBridgedFunctions();
			// const user = getAccounts();
			// try {
			// 	const teamsProps = filter(user[0].settings.props, (prop) => prop.zimlet === 'com_zextras_team_classic_staging');
			// 	forEach(SettingsMap, (settingName) => {
			// 		const setting = find(teamsProps, ['name', settingName]);
			// 		//theoretically default should be taken from xml but for fallback
			// 		const value = setting != null ? setting._content : defaultSettingsMap[settingName];
			// 		settingsManagerBloc.setSettingSubject(settingName, value);
			// 	});
			// } catch (e) { console.error(e) }
			break;
		}
		case 'external-team':
		default: {
			break;
		}
	}
}
