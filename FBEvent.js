var FBEvent = FBEvent || {};

var Properties = PropertiesService.getScriptProperties();
var AccessTokenKey = "FBAccessToken";

// グループ情報取得関数 //
FBEvent.GetGroupInfo = function GetGroupInfo(groupId) {
  var response = null;
  
  // アクセストークン取得 //
  var accessToken = Properties.getProperty(AccessTokenKey);
  
  if(accessToken!=null) {
    url = "https://graph.facebook.com/v3.2/" + groupId + "?access_token=" + accessToken;
    try {
      response = UrlFetchApp.fetch(url);
    } catch (ex) {
      response = null;
    }
  }
  
  return response;
}

FBEvent.analyzeEventInfo = function analyzeEventInfo(event) {
  var eventInfo = {};
  
  eventInfo.Place = "";
  eventInfo.StartTime = new Date(Date.parse(event.start_time));
  eventInfo.EndTime = new Date(Date.parse(event.end_time));
  eventInfo.Id = event.id;
  eventInfo.Description = "https://www.facebook.com/events/" + event.id + "/";
  eventInfo.Name = event.name;
  
  return eventInfo;
}

FBEvent.GetFBEvents = function GetFBEvents(groupId){
  // FBグループイベント取得//
  var accessToken = Properties.getProperty(AccessTokenKey);
  
  // リクエストURL作成 //
  var date = new Date();
  var since = Math.floor(date.getTime() / 1000); // 現在日時以降のイベントを取得 //
  var untilDate = new Date();
  untilDate.setDate(date.getDate()+60);
  var until = Math.floor(untilDate.getTime() / 1000); // 現在日時以降のイベントを取得 //
  var limit = 100; // イベント取得最大個数 //
  var accessToken = Properties.getProperty("FBAccessToken");
  var requestUrl = "https://graph.facebook.com/v3.2/" + groupId +
    "/events?limit=" + limit + "&since=" + since + "&until=" + until + "&access_token=" + accessToken;
  
  var fbEvents = [];
  do {
    resp = UrlFetchApp.fetch(requestUrl);
    if (resp&&(resp.getResponseCode() == 200)) {
      result = JSON.parse(resp.getContentText());
      Logger.log(result);
      
      for each(var event in result.data){
        var eventInfo = FBEvent.analyzeEventInfo(event)
        
        if(eventInfo) {
          fbEvents.push(eventInfo);
        }
      }
      
      if((result)&&(result.paging)&&(result.paging.next)) {
        requestUrl = result.paging.next;
      } else {
        requestUrl = null;
      }
    }
  } while(requestUrl!=null)
    
  return fbEvents;
}
