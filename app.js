var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var jade = require('jade');
var i18n = require('i18n');
var locales = require('./locales');

var fs = require('fs');

i18n.configure({
    locales: locales.supportedLocales,
    directory: __dirname + '/locales',
    updateFiles: true
});

var staticFolder = __dirname + '/public';
try {
    var stats = fs.lstatSync(__dirname + '/dist');
    if (stats.isDirectory()) {
        staticFolder = __dirname + '/dist';
    }

    console.log('use ', staticFolder, ' as static folder.');
} catch (ex) {
    console.error(ex);
}

var viewFolder = __dirname + '/views';
app.set('views', viewFolder);

var staticSetting = {
    etag: true,
    lastModified: true,
    maxAge: 1000 * 3600 * 24 * 30,
    setHeaders: function (res, path) {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
};

app.use(express.static(staticFolder, staticSetting));
app.use('/locales', express.static(__dirname + '/locales', staticSetting));

app.use(i18n.init);
app.all('*', locales.setLocale, locales.setLocalVars);

app.set('port', (process.env.PORT || 60005));

app.use(require('./routes/index.js'));

app.listen(app.get('port'), function () {
    console.log('id3 application is running on port ', app.get('port'));
});