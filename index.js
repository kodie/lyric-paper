var Canvas = require('canvas');
var Image = Canvas.Image;
var colors = require('colors');
var drawText = require('node-canvas-text').default;
var fs = require('fs');
var imgTxt = require('spontaneous-text');
var merge = require('deepmerge');
var opentype = require('opentype.js');
var Promise = require('promise');
var request = require('request');
var rndImg = require('rnd-flickr');
var rndSong = require('rnd-song');
const pIf = require('p-if');

var settings = {};

var defaults = {
  "width": 1024,
  "height": 768,
  "padding": 10,
  "tags": ["landscape", "people", "puppy", "kitten"],
  "tag_mode": "any",
  "genre": "",
  "language": "en",
  "flickr_api_key": "",
  "musixmatch_api_key": "",
  "file": "",
  "mute": false,
  "info_bar": {
    "display": true,
    "height": 12,
    "position": "bottom",
    "align": "right",
    "color": "#ffffff",
    "bg_color": "#000000",
    "font": "http://fonts.gstatic.com/s/roboto/v15/Hgo13k-tfSpn0qi1SFdUfaCWcynf_cDxXwCLxiixG1c.ttf",
    "text": "Photo: \"%%imgName%%\" by %%imgOwner%% (%%imgLicense%%) - Lyrics: \"%%songName%%\" by %%songArtist%%"
  }
}

function getImg() {
  if (!settings.mute) { console.log('Getting image...'.dim); }

  return new Promise(function (fulfill, reject){
    var options = {
        api_key: settings.flickr_api_key,
        width: settings.width,
        height: settings.height,
        tags: settings.tags,
        tag_mode: settings.tag_mode
    };

    rndImg(options, function(error, image, data) {
      if (!error) {
        var licenseType = getLicenseType(data.license);

        if (!settings.mute) {
          console.log(`Image: "${data.title}" by ${data.ownername} (${licenseType})`.bold);
        }

        fulfill([image, data]);
      } else { reject(error); }
    });
  });
}

function getTrack() {
  if (!settings.mute) { console.log('Getting track...'.dim); }

  return new Promise(function (fulfill, reject){
    var options = {
        api_key: settings.musixmatch_api_key,
        genre: settings.genre,
        language: settings.language,
        snippet: true
    };

    rndSong(options, function(error, res) {
      if (!error) {
        if (!settings.mute) {
          console.log(`Track: "${res.track.track_name}" by ${res.track.artist_name}`.bold);
          console.log(`Line: ${res.snippet.snippet_body}`.bold);
        }

        fulfill(res);
      } else { reject(error); }
    });
  });
}

function writeText(imgBuffer, text) {
  return new Promise(function (fulfill, reject){
    imgTxt(imgBuffer, text, { padding: settings.padding, mute: settings.mute }, function(error, response){
      if (!error) {
        fulfill(response);
      } else { reject(error); }
    });
  });
}

function getLicenseType(licenseId) {
  var license;
  switch (Number(licenseId)) {
    case 0: license = 'All rights reserved'; break;
    case 1: license = 'cc-nc-sa'; break;
    case 2: license = 'cc-nc'; break;
    case 3: license = 'cc-nc-nd'; break;
    case 4: license = 'cc'; break;
    case 5: license = 'cc-sa'; break;
    case 6: license = 'cc-nd'; break;
    case 7: license = 'No copyright restrictions'; break;
    case 8: license = 'USGov'; break;
  }
  return license;
}

function getInfoBarFont() {
  if (!settings.mute) { console.log(`Getting info bar font...`.dim); }

  return new Promise(function (fulfill, reject){
    if (/^(f|ht)tps?:\/\//i.test(settings.info_bar.font)) {
      request.get({encoding:'binary', url:settings.info_bar.font}, function(error, response, body){
        if (!error) {
          var buffer = new Buffer(body, 'binary');
          fulfill(opentype.parse(bufferToArrayBuffer(buffer)));
        } else { reject(error); }
      });
    } else {
      fulfill(opentype.loadSync(settings.info_bar.font));
    }
  });
}

function bufferToArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}

function strtr(string, replace) {
  for (var find in replace) {
    string = string.split(find).join(replace[find]);
  }
  return string;
}

function drawInfoBar(i) {
  return getInfoBarFont()
    .then(function(font){
      var canvas = new Canvas(settings.width, settings.height);
      var ctx = canvas.getContext('2d');
      var img = new Image;

      var box = {
        x: 0,
        y: 0,
        width: settings.width,
        height: settings.info_bar.height
      }

      if (settings.info_bar.position !== 'top') {
        box.y = settings.height - settings.info_bar.height;
      }

      var opts = {
        hAlign: settings.info_bar.align,
        textFillStyle: settings.info_bar.color,
        rectFillStyle: settings.info_bar.bg_color,
        rectFillOnlyText: true,
        vAlign: 'center',
        fillPadding: 2
      };

      var text = strtr(settings.info_bar.text, {
        '%%imgName%%': i.image.name,
        '%%imgOwner%%': i.image.by,
        '%%imgLicense%%': i.image.license,
        '%%songName%%': i.song.name,
        '%%songAlbum%%': i.song.album,
        '%%songArtist%%': i.song.artist
      });

      img.src = i.image.buffer;
      ctx.drawImage(img, 0, 0, settings.width, settings.height);

      if (!settings.mute) { console.log(`Drawing info bar...`.dim); }
      drawText(ctx, text, font, box, opts);

      i.image.buffer = canvas.toBuffer();
      return [canvas, i];
    });
}

function saveImage(stream, file) {
  if (!settings.mute) { console.log(`Saving image...`.dim); }

  return new Promise(function (fulfill, reject){
    var out = fs.createWriteStream(file);
    try { stream.pipe(out); }
    catch(e) { reject(e); }
    finally {
      if (!settings.mute) { console.log(`Image saved to ${settings.file}`.bold); }
      fulfill();
    }
  });
}

module.exports = function(options, cb) {
  settings = merge(defaults, options);

  getImg()
    .then(function(i){
      return getTrack()
        .then(function(t){ return [i, t]; });
    })
    .then(function(r){
      return writeText(r[0][0], r[1].snippet.snippet_body)
        .then(function(i){ return [r[0], r[1], i]; });
    })
    .then(function(r){
      var imgBuffer = r[2].image;
      var imgName = r[0][1].title;
      var imgOwner = r[0][1].ownername;
      var imgLicense = getLicenseType(r[0][1].license);
      var song = r[1].track.track_name;
      var album = r[1].track.album_name;
      var artist = r[1].track.artist_name;
      var txt = r[1].snippet.snippet_body;
      var font = r[2].font;
      var color = r[2].color;

      return {
        image: {
          name: imgName,
          by: imgOwner,
          license: imgLicense,
          buffer: imgBuffer
        },
        song: {
          line: txt,
          name: song,
          album: album,
          artist: artist
        },
        font: {
          name: font,
          color: color
        }
      };
    })
    .then(pIf(settings.info_bar.display, function(r){
      return drawInfoBar(r);
    }))
    .then(pIf(settings.file !== "", function(r){
      var stream = r[0].pngStream();
      return saveImage(stream, settings.file)
        .then(function(s){ return r[1]; })
    }, function(r){ return r[1]; }))
    .then(function(r){
      cb(null, r);
    })
    .catch(function(e){
      cb(e);
    });
};
