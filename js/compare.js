//Load common code that includes config, then load the app logic for this page.
requirejs(['./config'], function (common) {
    requirejs(['app/mainCompare']);
});
