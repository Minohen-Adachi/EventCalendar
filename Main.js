var RedirectUri = "https://script.google.com/macros/s/AKfycbxi4odFlncV9Ib6izYmSRnrTFii0H4tDC9aeQJu56w/dev";
var Properties = PropertiesService.getScriptProperties();
var AccessTokenKey = "FBAccessToken";
var ClientIdKey = "ClientId";
var ClientSecretKey = "ClientSecret"
var SettingSheetName = "設定";


function Main() {  
  // 設定シートからグループ情報（グループID,カレンダーID)を取得 //
  var groupInfos = Sheet.GetGroupInfos(SettingSheetName);
  var length = groupInfos.length;
  var startRow = 2;
  
  // グループ分処理 //
  for(var i=0; i<length; ++i) {    
    // グループID //
    var groupId = groupInfos[i].GroupId;
    var isCreated = false;
    var fbEvents = null;
    var fbGroupInfoJson = null;
    
    if(groupId) {
      // グループシートクリアor作成 //
      var fbGroupInfo = FBEvent.GetGroupInfo(groupId);
      
      if(fbGroupInfo) {
        fbGroupInfoJson = JSON.parse(fbGroupInfo.getContentText());
        Logger.log(fbGroupInfoJson);
        
        if((fbGroupInfoJson)&&(fbGroupInfoJson.name)) {
          isCreated = Sheet.CreateGroupSheet(fbGroupInfoJson.name);
        }
      }
    }
    
    // FBグループ情報取得 //
    if (isCreated) {
      // FBイベント情報取得 //
      fbEvents = FBEvent.GetFBEvents(groupId);
    }
    
    // イベント情報をシートへ記載 //
    if (fbEvents) {
      Sheet.SetEventInfos(fbGroupInfoJson.name,fbEvents);
    }
        
    // GoogleCalendarからFBイベントを削除 //
    var calendarId = groupInfos[i].CalendarId
    if(calendarId) {
      CalendarEvent.DeleteFBEvents(calendarId);
      
      // GoogleCalendarへイベント設定 //
      CalendarEvent.CreateCalendarEvents(calendarId,fbEvents);
    }
  }
}

function setTrigger(){  
  ScriptApp.newTrigger("Main").timeBased().everyHours(1).create();
  //ScriptApp.newTrigger("Main").timeBased().everyMinutes(60).create();
}

function deleteTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for(var i=0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() == "Main") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}

function doGet(e) {
  // リダイレクトURLの場合 //
  if((e != null)&&(e.parameter!=null)&&(e.parameter.code!=null)){
    
    // 認証処理 //
    var clientId = Properties.getProperty(ClientIdKey);
    var clientSecret = Properties.getProperty(ClientSecretKey);

    var accessTokenUrl="https://graph.facebook.com/v2.3/oauth/access_token?" +
      "client_id="+ clientId + "&redirect_uri=" + RedirectUri + "&client_secret=" + clientSecret + "&code=" + e.parameter.code;
    // アクセストークン取得 //
    var accessTokenInfo = UrlFetchApp.fetch(accessTokenUrl);
    
    if (accessTokenInfo.getResponseCode() == 200) {
      result = JSON.parse(accessTokenInfo.getContentText())
      
      if ((result!=null)&&(result.access_token)) {
        accessToken = result.access_token;
        var property = properties.setProperty(AccessTokenKey,accessToken);
        
        setTrigger();
      }
    }
  }
  
  // HTML表示 //
  var template = HtmlService.createTemplateFromFile('Login.html');
  return template.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
}
