
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
};
