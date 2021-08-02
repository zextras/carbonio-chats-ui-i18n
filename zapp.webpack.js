const { DefinePlugin } = require('webpack');
const pkg = require('./package.json');

const commitId = require('child_process').execSync('git rev-parse --short HEAD').toString();

module.exports = function (wpConf, zappConfig, options) {
	wpConf.devServer.proxy.push({
		context: ['/zx/team'],
		target: !options.server || options.server === 'none' ? 'http://localhost' : `https://${options.server}`,
		secure: false
	},{
		context: ['/zx/ws-chat/*'],
		target: !options.server || options.server === 'none' ? 'wss://localhost' : `wss://${options.server}`,
		ws: true,
		secure: false
	});
	wpConf.entry['external_app'] = './src/commonTeam/src/external/LoginPage.js';
	wpConf.plugins.push(
		new DefinePlugin({
			PRODUCT_TYPE: JSON.stringify('zapp-team'),// 'classic-team' | 'external-team
			COMMIT_ID: JSON.stringify(commitId),
			ZIMLET_VERSION: JSON.stringify(pkg.version),
			PRODUCT_NAME: JSON.stringify('zimbra-team'),
			ZIMLET_PACKAGE_NAME: JSON.stringify('com_zimbra_connect_modern'),
			__TEAM_IS_CLASSIC_ZIMLET: JSON.stringify(false)
		})
	);
};

/*
* , {
		context: ['/team/instant-meeting/*'],
		target: !options.server || options.server === 'none' ? 'http://localhost' : `https://${options.server}`,
		secure: false
	}*/