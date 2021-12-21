const { DefinePlugin } = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const commitId = require('child_process').execSync('git rev-parse --short HEAD').toString();

module.exports = function (wpConf, pkg, options) {
	// wpConf.devServer?.proxy?.push?.({
	// 	context: ['/zx/team'],
	// 	target: !options.server || options.server === 'none' ? 'http://localhost' : `https://${options.server}`,
	// 	secure: false
	// });
	wpConf.plugins.push(
		new DefinePlugin({
			PRODUCT_TYPE: JSON.stringify('zapp-team'),// 'classic-team' | 'external-team
			COMMIT_ID: JSON.stringify(commitId),
			ZIMLET_VERSION: JSON.stringify(pkg.version),
			PRODUCT_NAME: JSON.stringify('zimbra-team'),
			ZIMLET_PACKAGE_NAME: JSON.stringify('com_zimbra_connect_modern'),
			__TEAM_IS_CLASSIC_ZIMLET: JSON.stringify(false)
		}),
		new HtmlWebpackPlugin({
			chunks: [],
			template: './src/commonComponents/external/errorPage.html',
			filename: 'external_index.html'
		}),
		new HtmlWebpackPlugin({
			title: 'Team',
			chunks: ['external_index'],
			template: './src/commonComponents/external/index.html',
			meta: { viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no' }
		}),
		new CopyPlugin({
			patterns: [
				{ from: './node_modules/emoji-datasource-twitter/img/twitter/sheets-256/20.png', to: 'emoji_20.png' },
				{ from: './node_modules/emoji-datasource-twitter/img/twitter/sheets-256/32.png', to: 'emoji_32.png' }
			]
		})
	);
};

/*
* , {
		context: ['/team/instant-meeting/*'],
		target: !options.server || options.server === 'none' ? 'http://localhost' : `https://${options.server}`,
		secure: false
	}*/

/*
*
*
*
* ,{
		context: ['/zx/ws-chat/*'],
		target: !options.server || options.server === 'none' ? 'wss://localhost' : `wss://${options.server}`,
		ws: true,
		secure: false
	}
*
*
*
* */