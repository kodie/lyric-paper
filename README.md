# lyric-paper

A node module that draws a random line of song lyrics onto a random image from Flickr.

## Installation
`npm install lyric-paper --save`

## Usage
```javascript
var lyricPaper = require('lyric-paper');

var settings = {
  "width": 1920,
  "height": 1080,
  "tags": ["winter", "snow", "holiday"],
  "genre": 8,
  "flickr_api_key": "4VMzlxushjNpN58ueouClMxtowKj4Ntc",
  "musixmatch_api_key": "l7hrOAk3RfkiHW9hoKYu0RVAvlwEl5U0",
  "file": "image.png"
};

lyricPaper(settings, function(err, res) {
  if (!err) {
    console.log(res);
  } else { console.log(new Error(err)); }
});
```

## Options
`flickr_api_key` - Your [Flickr](https://www.flickr.com) API key. **(Required)**

`musixmatch_api_key` - Your [MusixMatch](https://www.musixmatch.com) API key. **(Required)**

`width` - The desired image width.

`height` - The desired image height.

`padding` - The area in pixels around the edge of the image where text is off-limits.

`tags` - The keyword tags to use when finding an image from Flickr. Can be an array or a comma seperated string.

`tag_mode` - Set to either `any` or `all` to use any or all tags in the image search.

`content_type` - The type of content you would like the image to be:
* 1 for photos only.
* 2 for screenshots only.
* 3 for 'other' only.
* 4 for photos and screenshots.
* 5 for screenshots and 'other'.
* 6 for photos and 'other'.
* 7 for photos, screenshots, and 'other' (all).

`genre` - The Musixmatch genre ID for the music genre of the song that you would like your random lyrics to be from. ([See a list of genre IDs here](https://github.com/kodie/rnd-song/blob/master/genres.json))

`language` - The [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) language code for the language that you would like your random song to be. (ie. `en`)

`file` - If defined, the image will be saved to this file.

`mute` - Set to `true` to mute console output.

`info_bar.display` - Set to `false` to hide the info bar.

`info_bar.height` - The height of the info bar in pixels. (Text size will adjust automatically)

`info_bar.position` - The position of the info bar. Possible values are `top` and `bottom`.

`info_bar.align` - The alignment of the info bar. Possible values are `left` and `right`.

`info_bar.color` - The hex color for the info bar text.

`info_bar.bg_color` - The hex color for the info bar background. (Leave blank to disable background)

`info_bar.font` - The font file for the info bar text. Can be a file path or a URL.

`info_bar.text` - The text for the info bar. The following text will be replaced with their respective values:

* `%%imgName%%` - The name of the image.
* `%%imgOwner%%` - The owner of the image.
* `%%imgLicense%%` - The license type of the image.
* `%%songName%%` - The name of the song.
* `%%songAlbum%%` - The name of the song album.
* `%%songArtist%%` - The name of the song artist.

## Defaults
```json
{
  "width": 1024,
  "height": 768,
  "padding": 10,
  "tags": ["landscape", "people", "puppy", "kitten"],
  "tag_mode": "any",
  "content_type": "",
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
```

## Return
Here's an example of what the response will look like:

```
{
  image: {
    name: 'Rural Winter',
    by: 'arbyreed',
    license: 'cc-nc-sa',
    buffer: <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 07 80 00 00 04 38 08 06 00 00 00 e8 d3 c1 43 00 00 00 06 62 4b 47 44 00 ff 00 ff 00 ff a0 bd a7 ... >
  },
  song: {
    line: 'I\'m dreaming of a White Christmas',
    name: 'White Christmas',
    album: 'Elvis\' Christmas Album',
    artist: 'Elvis Presley'
  },
  font: {
    name: 'Chathura ExtraBold',
    color: '#cc2076'
  }
}
```

## License
MIT. See the License file for more info.
