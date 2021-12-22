/*
 * **** BEGIN LICENSE BLOCK *****
 * Copyright (C) 2011-2020 ZeXtras
 *
 * The contents of this file are subject to the ZeXtras EULA;
 * you may not use this file except in compliance with the EULA.
 * You may obtain a copy of the EULA at
 * http://www.zextras.com/zextras-eula.html
 * **** END LICENSE BLOCK *****
 */
/** @jsx createElement */
import { createElement, useEffect } from 'react';
import { useCreateOptions } from '../hooks/useCreateOptions';
import { useTranslation } from 'react-i18next';

const useCreationButtonsRegister = (onClickNewChat, onClickNewGroup, onClickCreate) => {

	const [t] = useTranslation();
	const { setCreateOptions } = useCreateOptions();

	useEffect(() => {

		setCreateOptions({
			newButton: {
				primary: {
					id: 'create-single',
					label: t('create.chat', 'Create Chat'),
					icon: 'ConversationViewOutline',
					click: onClickNewChat ? onClickNewChat : () => void 0,
					disabled: !onClickNewChat
				},
				secondaryItems: [
					{
						id: 'create-group',
						label: t('create.group', 'Create Group'),
						icon: 'ConversationViewOutline',
						click: onClickNewGroup ? onClickNewGroup : () => void 0,
						disabled: !onClickNewGroup
					},
					{
						id: 'create-docs-spreadsheet',
						label: t('create.space', 'Create Space'),
						icon: 'ConversationViewOutline',
						click: onClickCreate ? onClickCreate : () => void 0,
						disabled: !onClickCreate
					}
				]
			}
		});

		return () => {
			setCreateOptions({
				newButton: {}
			});
		}


	}, [setCreateOptions]);

	return null;

};

export default useCreationButtonsRegister;