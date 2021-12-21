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

import { includes } from 'lodash';
import { SettingsMap } from '../commonComponents/blocs/SettingsManagerBloc';

export function setTeamDefaultSetting(key, value, settingsManagerBloc) {
	switch (PRODUCT_TYPE) {
		case 'classic-team': {
			if (includes(SettingsMap, key)) {
				settingsManagerBloc._zimbra.jsonRequest('ModifyPropertiesRequest',
					{
						prop: {
							zimlet: ZIMLET_PACKAGE_NAME,
							name: key,
							_content: value
						}
					},
					{ ns: 'Account' }
				).then((response) => {
					// TODO Check if here works
					settingsManagerBloc.setSettingSubject(key,value);
				}).catch((error) => console.error(error));
			}
			else {
				throw new Error();
			}
			break;
		}
		case 'zapp-team': {
			// TODO
			// try {
			// 	saveSettings({
			// 		props: {
			// 			zimlet: 'com_zextras_team_classic_staging',
			// 			name: key,
			// 			_content: value
			// 		}
			// 	}).then((res) => console.log('done', res));
			// } catch (e) {
			// 	console.error(e);
			// }
			break;
		}
		case 'external-team':
		default: {
			break;
		}
	}
}