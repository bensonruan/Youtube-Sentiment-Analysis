<?php

/**
 * Sample PHP code for youtube.commentThreads.list
 * See instructions for running these code samples locally:
 * https://developers.google.com/explorer-help/code-samples#php
 */


if (!file_exists(dirname(__DIR__) . '/vendor/autoload.php')) {
  throw new Exception(sprintf('Please run "composer require google/apiclient:~2.0" in "%s"', __DIR__));
}
require_once dirname(__DIR__) . '/vendor/autoload.php';

$response = new stdClass();

$VIDEO_ID = $_GET['v'];

$client = new Google_Client();
$client->setApplicationName('YouTube Comment Sentiment Analysis');
$client->setDeveloperKey('<YOUR_API_KEY>');

// Define service object for making API requests.
$youtube = new Google_Service_YouTube($client);

$videoDetail = $youtube->videos->listVideos('snippet,statistics', array(
    'id' => $VIDEO_ID,
    'maxResults' => 1,
));

$response->videoId = $videoDetail[0]['id'];
$response->title = $videoDetail[0]['snippet']['title'];
$response->publishedAt = $videoDetail[0]['snippet']['publishedAt'];
$response->thumbnails = $videoDetail[0]['snippet']['thumbnails']['medium'];
$response->statistics = $videoDetail[0]['statistics'];

$comments = array();
$pageIndex = 1;
$nextPageToken = getPagedComments($youtube, $VIDEO_ID, '');

while ($nextPageToken != '' && $pageIndex < 10) {
    $nextPageToken = getPagedComments($youtube, $VIDEO_ID, $nextPageToken);
    $pageIndex++;
}

$response->comments = $comments;

echo json_encode($response);

function getPagedComments($youtube, $videoId, $pageToken) {
    $videoComments = $youtube->commentThreads->listCommentThreads('snippet,replies', array(
        'videoId' => $videoId,
        'maxResults' => 100,
        'textFormat' => 'plainText',
        'pageToken' => $pageToken
    ));
    
    foreach ($videoComments as $comment) {
        array_push($GLOBALS['comments'], $comment['snippet']['topLevelComment']['snippet']['textOriginal']);
    }

    return $videoComments['nextPageToken'];
}