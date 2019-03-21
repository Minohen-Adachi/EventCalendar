var CalendarEvent = CalendarEvent || {};

// Eventクラス（クラスっぽいもの）//
CalendarEvent.Event = function Event(title,startTime,endTime,description,location) {
  this.title = title;             // タイトル //
  this.startTime = startTime;     // 開始時刻 //
  this.endTime = endTime;         // 終了時刻 //
  this.description = description; // 詳細 //
  this.location = location;       // 場所 (今は指定していない)//
}

// カレンダーからイベント情報取得 //
CalendarEvent.CreateCalendarEvents = function CreateCalendarEvents(calendarID,events) {
  // カレンダー取得 //
  var calendar = CalendarEvent.GetCalendar(calendarID);
  //Logger.log(calendar.getName())
  
  for each (var event in events) {
    // カレンダーへイベント登録 //
    var title = event.Name;
    var startTime = event.StartTime;
    var endTime = event.EndTime;
    var options = {description:event.Description, location:null, guests:null, sendInvites:null};
    var test = calendar.createEvent(title, startTime, endTime, options);
  }
  
  return events;
}

CalendarEvent.DeleteFBEvents = function DeleteFBEvents(calendarID) {
  var calendarEvent = CalendarEvent.GetCalendarEvent(calendarID);
  
  if(calendarEvent) {
    for each(var event in calendarEvent) {
      Logger.log(event);
      if(event.Description.indexOf('https://www.facebook.com/events/') !== -1) {
        // facebookのURLがdescriptionに入っていたら削除 //
        CalendarEvent.deleteCalendarEvent(calendarID,event.Id);
      }
    }
  }
}

CalendarEvent.deleteCalendarEvent = function deleteCalendarEvent(calendarID,eventID) {
  // カレンダー取得 //
  var calendar = CalendarEvent.GetCalendar(calendarID);
  var startTime = new Date();
  var endTime = new Date();
  endTime.setDate(endTime.getDate()+60);
  var events = calendar.getEvents(startTime, endTime);
  
    for each(var event in events ) {
       if(event.getId() == eventID) {
         event.deleteEvent();
      }
    }
}

// カレンダーからイベント情報取得 //
CalendarEvent.GetCalendarEvent = function GetCalendarEvent(calendarID) {
  
  var calendarEvents = [];
  // カレンダー取得 //
  var calendar = CalendarEvent.GetCalendar(calendarID);
  //Logger.log(calendar.getName())
  
  // カレンダーからイベント取得 //
  var startTime = new Date();
  var endTime = new Date();
  endTime.setDate(endTime.getDate()+60);
  var events = calendar.getEvents(startTime, endTime);
  
  for each(var event in events ) {
    var eventInfo = {};
    eventInfo.Id = event.getId();
    eventInfo.Location =event.getLocation();
    eventInfo.Title = event.getTitle();
    eventInfo.EndTime = event.getEndTime();
    eventInfo.StartTime = event.getStartTime();
    eventInfo.Description = event.getDescription();
    calendarEvents.push(eventInfo);
  }
  
  return calendarEvents;
}

// カレンダー情報取得 //
CalendarEvent.GetCalendar = function GetCalendar(calendarID) {
  var calendar;
  if(calendarID!=null) {
    calendar = CalendarApp.getCalendarById(calendarID);
  }
  //Logger.log(calendar);
  return calendar;
}

// 自分のカレンダーを取得 //
CalendarEvent.GetOwnCalender = function GetOwnCalender() {
  var calendars = CalendarApp.getAllOwnedCalendars();
  
  for(var i=0; i<calendars.length; ++i) {
    Logger.log("名前："+calendars[i].getName()+" ID："+calendars[i].getId());
   }
}

/**********************************************************************/
/* テストコード.
/**********************************************************************/

// イベント取得テスト用 //
function TestGetEvents() {
  // 設定シートからカレンダーID取得 //
  var settingSheet = SpreadsheetApp.getActive().getSheetByName("設定"); 
  var currentCell = settingSheet.getRange(2,4);
  var calendarID = currentCell.getValue();
  var events = GetCalendarEvent(calendarID);
  
  for(var i=0; i<events.length; ++i) {
    Logger.log("名前："+events[i].getTitle()+
      " ID："+events[i].getId()+
      " Description："+events[i].getDescription()+
      " Location："+events[i].getLocation());
  }
}

// イベント設定テスト用 //
function TestCreateEvent() {
  // 設定シートからカレンダーID取得 //
  var settingSheet = SpreadsheetApp.getActive().getSheetByName("設定"); 
  var currentCell = settingSheet.getRange(2,4);
  var calendarID = currentCell.getValue();
  
  // イベント情報作成 //
  var title = "testGAS";
  var startTime = new Date();
  var endTime = new Date();
  endTime.setHours(endTime.getHours()+2);
  var description = "https://www.google.com";
  var event = new Event(title,startTime,endTime,description);
  
  createCalendarEvent(calendarID,event);
}