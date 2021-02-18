nw.Window.open('index.html', {
	min_width: 800,
	min_height: 600,
	position: 'center',
	icon: './Image/favicon.png'
}, function(win) {
	var option = {
		key : "Ctrl+R",
		active : function() {
			win.reload();
		}
	};

	// Create a shortcut with |option|.
	var shortcut = new nw.Shortcut(option);

	// Register global desktop shortcut, which can work without focus.
	nw.App.registerGlobalHotKey(shortcut);
});