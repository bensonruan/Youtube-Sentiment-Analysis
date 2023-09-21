# Youtube-Sentiment-Analysis
 Sentiment analysis on Youtube comments and how well the number of comments classified as positive, neutral and negative

## Live Demo
**[https://bensonruan.com/youtube-sentiment-analysis/](https://bensonruan.com/youtube-sentiment-analysis/)**
![sentiment](https://bensonruan.com/wp-content/uploads/2023/09/YouTube-Sentiment-Analysis.png)

## Installing
1. Clone this repository to your local computer
``` bash
git https://github.com/bensonruan/Youtube-Sentiment-Analysis.git
```

2. On Google developer platform https://console.cloud.google.com/
* Register a Google dev account
* Create a Project
* Enable YouTube Data API v3
* Create an API key
* Replace your API key in youtubeGetComments.php

3. Install Google APIs Client Library
``` bash
composer require google/apiclient:^2.0
```

4. Config your path to the youtubeGetComments.php inside sentiment-analysis.js 
``` bash
ytGetComments:  window.location.protocol + '//'+ window.location.hostname + 'php/youtubeGetComments.php?v='
```

5. Point your localhost to the cloned root directory. Browse to http://localhost/index.html

## Note
If you are on Windows, you would need to install PHP via Web Platform Installer

## Library
* [youtube-data-api-v3](https://developers.google.com/youtube/v3/quickstart/php) - YouTube Data API v3 PHP Client Library
* [jquery](https://code.jquery.com/jquery-3.3.1.min.js) - JQuery
* [tensorflow.js sentiment](https://github.com/tensorflow/tfjs-examples/tree/master/sentiment) - Perform text sentiment analysis on text using the Layers API of TensorFlow.js
* [canvasjs](https://canvasjs.com/jquery-charts/) - JQuery chart library

## Support me 
[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/W7W6METMY)

