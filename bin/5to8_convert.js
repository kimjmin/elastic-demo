var fs = require('fs');
var parse = require('csv-parse');
var s_meta = require('./station_meta');

var sInfo = fs.readFileSync('source/station_info.json', 'utf8');
var sLocation = JSON.parse(sInfo).DATA;
//console.log(sLocation.DATA.length);

var f1to4 = fs.readFileSync('source/2014_5TO8.csv', 'utf8');
parse(f1to4, {comment:"#"}, function(csv_err, csv_data){
  if (csv_err) {
    return console.log(csv_err);
  }
  //console.log(csv_data.length);
  // console.log("%j",csv_data[0]);
  // console.log("%j",csv_data[1]);
  // console.log("%j",csv_data[2]);
  //호선명,역명,일자,승하차구분,합계,05-06시,06-07시,07-08시,08-09시,09-10시,10-11시,11-12시,12-13시,13-14시,14-15시,15-16시,16-17시,17-18시,18-19시,19-20시,20-21시,21-22시,22-23시,23-24시,24시이후
  //LINE_NM,STAT_NM,INCOME_DATE,ON_OFF_SE,TIME_SM,TIME_05,TIME_06,TIME_07,TIME_08,TIME_09,TIME_10,TIME_11,TIME_12,TIME_13,TIME_14,TIME_15,TIME_16,TIME_17,TIME_18,TIME_19,TIME_20,TIME_21,TIME_22,TIME_23,TIME_24
  //5호선,강동,20141231,승차,22725,329,764,2585,3262,1513,1043,943,1072,1029,1035,1086,1191,1755,1717,1146,811,635,499,202,108
  //5호선,강동,20141231,하차,18367,34,532,714,1468,798,610,612,617,784,788,950,1171,1388,1902,1655,1135,959,959,612,679

  var sDiffNames = {
    "동대문역사문화공원5" : ["동대문역사문화공원","동대문역사문화공원"],
    "이수" : ["총신대입구","총신대입구(이수)"]
  }

  //1,2 라인은 타이틀. 3라인 부터 시작.
  for(var cd=2; cd< csv_data.length ; cd+=2){
    var dataIn = csv_data[cd];
    var dataOut = csv_data[cd+1];
    if(dataIn[0]===dataOut[0] && dataIn[1]===dataOut[1] && dataIn[2]===dataOut[2]){
      var lStationName;
      if(dataIn[1].indexOf("(") > 0){
        lStationName = dataIn[1].substr(0,dataIn[1].indexOf("("));
      } else {
        lStationName = dataIn[1];
      }
      //console.log(lStationName);
      var station_name = "";
      
      if(!s_meta[lStationName]){
        station_name = sDiffNames[lStationName][0];
        //sRiders[j].SUB_STA_NM = sDiffNames[lStationName][0];
      } else {
        station_name = lStationName;
      }

      var ldateTemp = new Array(3);
      ldateTemp[0] = dataIn[2].substr(0,4);
      ldateTemp[1] = dataIn[2].substr(4,2);
      ldateTemp[2] = dataIn[2].substr(6,2);
      // console.log(Number(ldateTemp[0]));
      // console.log(Number(ldateTemp[1]));
      // console.log(Number(ldateTemp[2]));
      for(var h=0; h < 20; h++){
        var ldate = new Date(ldateTemp[0],Number(ldateTemp[1])-1,ldateTemp[2],h+5);

        // console.log("%j"+ldate);
        // - 로 되어 있는 값들 0으로 변경.
        var people_in = dataIn[5+h];
        //console.log(people_in);
        people_in = Number(people_in);

        var people_out = dataOut[5+h];
        //console.log(people_out);
        people_out = Number(people_out);
        
        var line_num_lang = {
          "1호선" : "Line 1", "2호선" : "Line 2", "3호선" : "Line 3", "4호선" : "Line 4", 
          "5호선" : "Line 5", "6호선" : "Line 6", "7호선" : "Line 7", "8호선" : "Line 8"
        }
        //console.log("==== "+station_name);
        var s_logs = {
          "time_slot" : ldate,
          "line_num" : dataIn[0],
          "line_num_en" : line_num_lang[dataIn[1]],
          "station_name" : station_name,
          "station_name_kr" : s_meta[station_name].STN_NM_KOR,
          "station_name_en" : s_meta[station_name].STN_NM_ENG,
          "station_name_chc" : s_meta[station_name].STN_NM_CHC,
          "station_name_ch" : s_meta[station_name].STN_NM_CHN,
          "station_name_jp" : s_meta[station_name].STN_NM_JPN,
          "station_geo" : {
            "lat" : s_meta[station_name].GEO_X,
            "lon" : s_meta[station_name].GEO_Y
          },
          "people_in" : people_in,
          "people_out" : people_out
        }

        //console.log("%j",s_logs);
        //console.log(ldate.toISOString().slice(0,10).replace(/-/g,""));
        var fileName = "5to8_"+ldateTemp[0]+ldateTemp[1]+ldateTemp[2]+".log";
        //var fileName = "1to4_"+ldate.toISOString().slice(0,10).replace(/-/g,"")+".log";
        var logdata = JSON.stringify(s_logs)+"\n";
        fs.appendFileSync("data/"+fileName, logdata);
      }

    }

  }

});
