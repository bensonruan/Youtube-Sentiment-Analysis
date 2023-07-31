const HOSTED_URLS = {
    ytGetComments:  window.location.protocol + '//'+ window.location.hostname + '/js/youtube-sentiment/youtubeGetComments.php?v=',
    model: 'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json',
    metadata: 'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json'
};  
const LOCAL_URLS = {
    ytGetComments:  'php/youtubeGetComments.php?v=',
    model: 'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json',
    metadata: 'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json'
};
const SentimentThreshold = {
    Positive: 0.66,
    Neutral: 0.33,
    Negative: 0
}
const PAD_INDEX = 0;
const OOV_INDEX = 2;
const YOUTUEB_BASE_URL = 'https://www.youtube.com/watch?v=';

let urls, model, metadata;

$("#videoId").on('keyup', function (e) {
    if (e.keyCode === 13) {
        youtubeSentiment();
    }
});

$(".btn-search").click(function () {
    youtubeSentiment();
});

function init(){
    if(window.location.hostname == 'localhost'){
        urls = LOCAL_URLS;
    }else {
        urls = HOSTED_URLS;
    }
}

async function setupSentimentModel(){
    if(typeof model === 'undefined'){
        model = await loadModel(urls.model);
    }
    if(typeof metadata === 'undefined'){
        metadata = await loadMetadata(urls.metadata);
    }
}

function youtubeSentiment(){
    $('#comment-list').addClass('d-none');
    $('#video-detail').addClass('d-none');
    $('#positive').empty();
    $('#neutral').empty();
    $('#negative').empty();
    $('#chartContainer').empty();
    $('.spinner-border').removeClass('d-none');
    
    getYouTubeComments($("#videoId").val(), processYouTubeComments);
}

function processYouTubeComments(ytVideo){
    setupSentimentModel().then(
        result => {
            displayVideoDetails(ytVideo);
            const comments = ytVideo.comments;
            const commentData = [];
            $.each(comments, function( index, comment ) {
                const comment_text = comment.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
                const sentiment_score = getSentimentScore(comment_text);
                let comment_sentiment = '';
                if(sentiment_score > SentimentThreshold.Positive){
                    comment_sentiment = 'positive'
                }else if(sentiment_score > SentimentThreshold.Neutral){
                    comment_sentiment = 'neutral'
                }else if(sentiment_score >= SentimentThreshold.Negative){
                    comment_sentiment = 'negative'
                }
                commentData.push({
                    sentiment: comment_sentiment,
                    score: sentiment_score.toFixed(2),
                    comment: comment_text
                });
            });
            //console.log(commentData);
            $('.spinner-border').addClass('d-none');
            displayComments(commentData.filter(t => t.sentiment == 'positive'), 'positive');
            displayComments(commentData.filter(t => t.sentiment == 'neutral'), 'neutral');
            displayComments(commentData.filter(t => t.sentiment == 'negative'), 'negative');
            $('#comment-list').removeClass('d-none');
            displayPieChart(commentData);
        }
    )   
}

async function loadModel(url) {
    try {
        const model = await tf.loadLayersModel(url);
        return model;
    } catch (err) {
        console.log(err);
    }
}

async function loadMetadata(url) {
    try {
        const metadataJson = await fetch(url);
        const metadata = await metadataJson.json();
        return metadata;
    } catch (err) {
        console.log(err);
    }
}

function padSequences(sequences, maxLen, padding = 'pre', truncating = 'pre', value = PAD_INDEX) {
  return sequences.map(seq => {
    if (seq.length > maxLen) {
      if (truncating === 'pre') {
        seq.splice(0, seq.length - maxLen);
      } else {
        seq.splice(maxLen, seq.length - maxLen);
      }
    }

    if (seq.length < maxLen) {
      const pad = [];
      for (let i = 0; i < maxLen - seq.length; ++i) {
        pad.push(value);
      }
      if (padding === 'pre') {
        seq = pad.concat(seq);
      } else {
        seq = seq.concat(pad);
      }
    }

    return seq;
  });
}

function getSentimentScore(text) {
    const inputText = text.trim().toLowerCase().replace(/(\.|\,|\!)/g, '').split(' ');
    // Convert the words to a sequence of word indices.
    const sequence = inputText.map(word => {
      let wordIndex = metadata.word_index[word] + metadata.index_from;
      if (wordIndex > metadata.vocabulary_size) {
        wordIndex = OOV_INDEX;
      }
      return wordIndex;
    });
    // Perform truncation and padding.
    const paddedSequence = padSequences([sequence], metadata.max_len);
    const input = tf.tensor2d(paddedSequence, [1, metadata.max_len]);

    const predictOut = model.predict(input);
    const score = predictOut.dataSync()[0];
    predictOut.dispose();

    return score;
}

function getYouTubeComments(videoId, callback) {
    $.getJSON( urls.ytGetComments + videoId, function(result) {
        //console.log(result);
        if(result !== null && result.comments !== null){
            callback(result);
        }
    });
}

function displayVideoDetails(ytVideo){
    $('#video-title').html(ytVideo.title);
    $('#video-thumbnail').attr('src', ytVideo.thumbnails.url);
    $('#video-thumbnail').attr('width', ytVideo.thumbnails.width);
    $('#video-thumbnail').attr('height', ytVideo.thumbnails.height);
    $('#video-img-link').attr('href', YOUTUEB_BASE_URL + ytVideo.videoId);
    $('#video-title-link').attr('href', YOUTUEB_BASE_URL + ytVideo.videoId);
    var one_day = 1000 * 60 * 60 * 24;
    var one_month = one_day * 30;
    var one_year = one_day * 365;
    var present_date = new Date();
    var published_date = new Date(ytVideo.publishedAt);
    var days_between = Math.floor(present_date.getTime() - published_date.getTime()) / (one_day);
    var months_between = Math.floor(present_date.getTime() - published_date.getTime()) / (one_month);
    var years_between = Math.floor(present_date.getTime() - published_date.getTime()) / (one_year);
    if(years_between >= 1){
        $('#video-published').html(Math.abs(Math.floor(years_between)) + ' years ago');
    }else if(months_between >= 1){
        $('#video-published').html(Math.abs(Math.floor(months_between)) + ' months ago');
    }else if(days_between >= 1){
        $('#video-published').html(Math.abs(Math.floor(days_between)) + ' days ago');
    }else{
        $('#video-published').html('Today');
    }
    $('#video-view-count').html(parseInt(ytVideo.statistics.viewCount || 0).toLocaleString("en-US"));
    $('#video-comment-count').html(parseInt(ytVideo.statistics.commentCount || 0).toLocaleString("en-US"));
    $('#video-like-count').html(parseInt(ytVideo.statistics.likeCount || 0).toLocaleString("en-US"));
    $('#video-dislike-count').html(parseInt(ytVideo.statistics.dislikeCount || 0).toLocaleString("en-US"));
    $('#video-detail').removeClass('d-none');
}

function displayComments(commentData, sentiment){
    var tbl  = document.createElement('table');
    var tr = tbl.insertRow();
    for( var j in commentData[0] ) {
        if(j !=='sentiment'){
            var td = tr.insertCell();
            td.appendChild(document.createTextNode(j));
        }
    }

    for( var i = 0; i < commentData.length; i++) {
        var tr = tbl.insertRow();
        for( var j in commentData[i] ) {
            if(j !=='sentiment'){
                var td = tr.insertCell();
                var text = commentData[i][j];
                td.appendChild(document.createTextNode(text));
            }
        }
    }
    tbl.setAttribute('class', 'comment-table')
    $('#'+sentiment).append(tbl);
    $('#'+sentiment+'-counter').html('('+ commentData.length +')');
}

function displayPieChart(commentData){
    var sentimentsCounter = {"Negative": 0, "Neutral": 0, "Positive": 0};
    for( var i = 0; i < commentData.length; i++) {
        switch(commentData[i].sentiment) {
            case 'positive':
              sentimentsCounter["Positive"] += 1;
              break;
            case 'negative':
              sentimentsCounter["Negative"] += 1;
              break;
            case 'neutral':
              sentimentsCounter["Neutral"] += 1;
              break;
        }
    }

    var chart = new CanvasJS.Chart("chartContainer", {
        theme: "light2",
        exportEnabled: true,
        animationEnabled: true,
        data: [{
            type: "pie",
            startAngle: 25,
            toolTipContent: "<b>{label}</b>: {y}%",
            showInLegend: "true",
            legendText: "{label}",
            indexLabelFontSize: 16,
            indexLabel: "{label} - {y}%",
            dataPoints: [
                { y: (sentimentsCounter["Positive"] * 100.00/commentData.length).toFixed(2), label: "Positive" },
                { y: (sentimentsCounter["Neutral"] * 100.00/commentData.length).toFixed(2), label: "Neutral" },
                { y: (sentimentsCounter["Negative"] * 100.00/commentData.length).toFixed(2), label: "Negative" },
            ]
        }]
    });
    chart.render();
}

init();