fs = require('fs');

var totalCnt = 0;

//메타데이터 생성.
fs.readFile('source/station_location.json', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  //console.log(data);

  var sLocation = JSON.parse(data).DATA;
  //console.log(sLocation.DATA.length);

  var s_meta = new Object();
  for(var i = 0; i < sLocation.length; i++){
    if(sLocation[i].XPOINT_WGS !== ""){
      s_meta[sLocation[i].STATION_NM] = {
        "STATION_CD" : sLocation[i].STATION_CD,
        "STATION_NM" : sLocation[i].STATION_NM,
        "LINE_NUM" : Number(sLocation[i].LINE_NUM),
        "FR_CODE" : sLocation[i].FR_CODE,
        "GEO_X" : Number(sLocation[i].XPOINT_WGS),
        "GEO_Y" : Number(sLocation[i].YPOINT_WGS)
      }
    }
  }
//  console.log("%j", s_meta["망원"]);

  fs.readFile('source/time_riders.json', 'utf8', function (terr,tdata) {
    if (terr) {
      return console.log(terr);
    }

    var sRiders = JSON.parse(tdata).DATA;

    //console.log("%j",sRiders[0]);

    //파일 이름 맞지 않는 것 맞춰주는 메타. [1] 값으로 최종 입력됨.
    var sDiffNames = {
      "흑석(중앙대입구)" : ["흑석","흑석(중앙대입구)"],
      "이수" : ["총신대입구(이수)","총신대입구(이수)"],
      "봉화산(서울의료원)" : ["봉화산","봉화산(서울의료원)"],
      "녹사평(용산구청)" : ["녹사평","녹사평(용산구청)"],
      "왕십리(성동구청)" : ["왕십리","왕십리(성동구청)"],
      "총신대입구" : ["총신대입구(이수)","총신대입구(이수)"],
      "서울역" : ["서울","서울역"],
      "수유(강북구청)" : ["수유","수유(강북구청)"],
      "청량리(지하)" : ["청량리","청량리"]
    }

    for(var j=0; j < sRiders.length; j++){

      var station_name = "";
      if(!s_meta[sRiders[j].SUB_STA_NM]){
        station_name = sDiffNames[sRiders[j].SUB_STA_NM][1];
        sRiders[j].SUB_STA_NM = sDiffNames[sRiders[j].SUB_STA_NM][0];

      } else {
        station_name = sRiders[j].SUB_STA_NM;
      }

      //USE_MON
      var rotDate = new Date(sRiders[j].USE_MON.substr(0,4),Number(sRiders[j].USE_MON.substr(4,2))-1,1);
      //console.log(rotDate.getMonth());
      //console.log(rotDate.getDay());

      var timeSliceBlk = [
        "MIDNIGHT","ONE","TWO","THREE","FOUR","FIVE","SIX","SEVEN","EIGHT","NINE",
        "TEN","ELEVEN","TWELVE","THIRTEEN","FOURTEEN","FIFTEEN","SIXTEEN","SEVENTEEN","EIGHTEEN","NINETEEN",
        "TWENTY","TWENTY_ONE","TWENTY_TWO","TWENTY_THREE"
      ]

      var thisMonth = rotDate.getMonth();
      while(thisMonth == rotDate.getMonth()){

        for(var tm=0; tm < timeSliceBlk.length; tm++){
          //rotDate.setUTCHours(tm);
          rotDate.setHours(tm);
          var rideRan = 0.8+(Math.random()*0.4);
          var alightRan = 0.8+(Math.random());

          var tmpRidesStr = sRiders[j][timeSliceBlk[tm]+"_RIDE_NUM"];
          var tmpOffStr = sRiders[j][timeSliceBlk[tm]+"_ALIGHT_NUM"];

          if(tmpRidesStr === ""){
            tmpRidesStr ="0";
          }
          if(tmpOffStr === ""){
            tmpOffStr ="0";
          }

          var tmpRides = 0;
          var tmpOff = 0;
          if(rotDate.getDay() === 6){
            tmpRides = Number(tmpRidesStr) * (0.2+(Math.random()*0.2));
            tmpOff = Number(tmpRidesStr) * (0.2+(Math.random()*0.2));
          } else if(rotDate.getDay() === 0){
            tmpRides = Number(tmpRidesStr) * (0.4+(Math.random()*0.2));
            tmpOff = Number(tmpRidesStr) * (0.4+(Math.random()*0.2));
          } else {
            tmpRides = Number(tmpRidesStr) * (0.9+(Math.random()*0.2));
            tmpOff = Number(tmpRidesStr) * (0.9+(Math.random()*0.2));
          }
          tmpRides = Math.round(tmpRides);
          tmpOff = Math.round(tmpOff);

          var s_rider_logs = {
            "TIME_SLICE" : rotDate,
            "LINE_NUM" : sRiders[j].LINE_NUM,
            "SUB_STA_NM" : station_name,
            //"STATION_CD" : s_meta[sRiders[j].SUB_STA_NM].STATION_CD,
            //"GEO_X" : s_meta[sRiders[j].SUB_STA_NM].GEO_X,
            //"GEO_Y" : s_meta[sRiders[j].SUB_STA_NM].GEO_Y,
            "RIDES" : tmpRides,
            "ALIGHT" : tmpOff,
            "TOTAL" : tmpRides + tmpOff
          }
          console.log("%j",s_rider_logs); //UTC 시간보다 늦은 만큼 시간이 적용됨.
          totalCnt++;
        }

        rotDate.setDate(rotDate.getDate()+1);
        //console.log(rotDate);
      }

    }
    //console.log(totalCnt);  //1326528

  });

});
