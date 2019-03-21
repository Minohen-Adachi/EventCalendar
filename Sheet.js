var Sheet = Sheet || {};

// SpreadSheetの情報取得・設定をする //
Sheet.GroupNameRow = 1;
Sheet.DataStartRow = 2;
Sheet.GropuIdColumn = 3;
Sheet.CalendarIdColumn = 4;
Sheet.StatusColumn = 5;
Sheet.ErrorString = 'エラー！';


Sheet.CreateGroupSheet = function GetGroupInfos(sheetName) {
  var isCreated = false;
  
  // グループ名のシート //
  if(sheetName) {
    //シートオブジェクト取得orシート作成 //
    var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
    if (sheet==null) {
      sheet = SpreadsheetApp.getActive().insertSheet(sheetName);
    }
    
    // シートの値をクリア //
    sheet.clear();

    var currentRow = 2;
    
    // 一覧のヘッダ作成 //
    range = sheet.getRange(currentRow-1, 1, 1, 6);
    range.setValues([["ID", "イベント名", "概要", "開始時間", "終了時間", "場所"]])
    range.setBackground("lightgreen");

    // 更新日時を記載 //
    range = sheet.getRange(1,8);
    range.setValue("更新日時")
    range.setBackground("lightblue");
    range = sheet.getRange(1,9);
    var date = new Date();
    var str = date.getFullYear()
    + '/' + ('0' + (date.getMonth() + 1)).slice(-2)
    + '/' + ('0' + date.getDate()).slice(-2)
    + ' ' + ('0' + date.getHours()).slice(-2)
    + ':' + ('0' + date.getMinutes()).slice(-2)
    + ':' + ('0' + date.getSeconds()).slice(-2)
    + '(JST)';
    range.setValue(str);
    
    isCreated = true;
  }
  
  return isCreated;
}

Sheet.GetGroupInfos = function GetGroupInfos(sheetName) {
  // 設定シートから設定値を取得 //
  var settingSheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  var groupInfos = [];
  var i = this.DataStartRow;
  
  do {
    // グループ情報（FBグループID、GoogleカレンダーID） //
    var groupInfo = {};

    // 名前列の値取得（※名前がなければ処理しない）//
    var gropuNameCell = settingSheet.getRange(i,this.GroupNameRow);
    var groupName = gropuNameCell.getValue();
    
    if (groupName) {
      // FBグループID //
      var gropuIdCell = settingSheet.getRange(i,this.GropuIdColumn);
      var groupId = gropuIdCell.getValue();
      // GoogleカレンダーID //
      var calenderIdCell = settingSheet.getRange(i,this.CalendarIdColumn);
      var calendarId = calenderIdCell.getValue();
      // ステータス用セル //
      var statusCell = settingSheet.getRange(i,this.StatusColumn);
      
      // 未入力の項目があればエラー //
      if((groupId)&&(calendarId)) {
        statusCell.setValue("OK");
        statusCell.setBackground("lightblue");
        
        groupInfo.GroupId = groupId;
        groupInfo.CalendarId = calendarId;
        groupInfos.push(groupInfo);
      } else {
        statusCell.setValue("エラー");
        statusCell.setBackground("red");
      }
    }
    i++;
  }while(groupName);
  
  return groupInfos;
}


Sheet.SetEventInfos = function SetEventInfos(groupName,events) {
  var groupSheet = SpreadsheetApp.getActive().getSheetByName(groupName);
  
  if (groupSheet) {
    var currentRow = 2;
  
    for each(var event in events) {
      var id = event.Id;
      var location = event.Place;
      var title = event.Name;
      var endTime = event.EndTime;
      var startTime = event.StartTime;
      var description = event.Description;
      
      var range = groupSheet.getRange(currentRow++, 1, 1, 6);
      range.setValues([[id, title, description, startTime, endTime, location]])
    }
  }
}

/**********************************************************************/
/* テストコード.
/**********************************************************************/

function test() {
  Sheet.GetGroupInfos('設定');
}


