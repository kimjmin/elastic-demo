var fs = require('fs');
var parse = require('csv-parse');
// var s_meta = require('./station_meta');

var sMetaSource = fs.readFileSync('source/seoul-metro-stations-allinfo.json', 'utf8');
var sMeta = JSON.parse(sMetaSource);
// console.log("%j",sMeta);

var yearOfLogs = "2017";

var sLogs = fs.readFileSync('source/'+yearOfLogs+'.csv', 'utf8');
parse(sLogs, {comment:"#"}, function(csv_err, csv_data){
  if (csv_err) {
    return console.log(csv_err);
  }
  //console.log(csv_data.length);
  // console.log("%j",csv_data[0]);
  // console.log("%j",csv_data[1]);
  // console.log("%j",csv_data[2]);
  // 날짜 , 역번호 , 역명 , 구분 , 05~06 , 06~07 , 07~08 , 08~09 , 09~10 , 10~11 , 11~12 , 12~13 , 13~14 , 14~15 , 15~16 , 16~17 , 17~18 , 18~19 , 19~20 , 20~21 , 21~22 , 22~23 , 23~24 , 24~
  // 2008-01-01 ,150, 서울역(150) , 승차 ,379 ,287 ,371 ,876 ,965 ,"1,389 ","1,989 ","2,375 ","2,588 ","2,885 ","2,520 ","3,078 ","3,495 ","3,055 ","2,952 ","2,726 ","3,307 ","2,584 ","1,059 ",264

  
  // for(var cd=1; cd<3 ; cd+=2){
  for(var cd=1; cd< csv_data.length ; cd+=2){

    var dataIn = csv_data[cd];
    var dataOut = csv_data[cd+1];

    if(dataIn[0]===dataOut[0] && dataIn[1]===dataOut[1] && dataIn[2]===dataOut[2]){
    
      // console.log("%j\n%j",dataIn,dataOut);
      
      var ldateTemp = dataIn[0].split('-');
      // console.log(Number(ldateTemp[0]));
      // console.log(Number(ldateTemp[1]));
      // console.log(Number(ldateTemp[2]));
      for(var h=0; h < 20; h++){
        var ldate = new Date(ldateTemp[0],Number(ldateTemp[1])-1,ldateTemp[2],h+5);
        // console.log(ldate.toString());

    //     // - 로 되어 있는 값들 0으로 변경.
        var people_in = dataIn[4+h];
        people_in = people_in.trim();
        if(people_in === "-"){ people_in = "0"; }
        people_in = people_in.replace(/,/g,"");
    //     //console.log(people_in);
        people_in = Number(people_in);

        var people_out = dataOut[4+h];
        people_out = people_out.trim();
        if(people_out === "-"){ people_out = "0"; }
        people_out = people_out.replace(/,/g,"");
    //     //console.log(people_out);
        people_out = Number(people_out);
        
    //     var line_num_lang = {
    //       "1호선" : "Line 1", "2호선" : "Line 2", "3호선" : "Line 3", "4호선" : "Line 4", 
    //       "5호선" : "Line 5", "6호선" : "Line 6", "7호선" : "Line 7", "8호선" : "Line 8"
    //     }
    //     //console.log(station_name);

        var sSCode = dataIn[1].trim();
        var s_logs = sMeta[sSCode];

        s_logs["@timestamp"] = ldate;
        s_logs["people_in"] = people_in;
        s_logs["people_out"] = people_out;
        // s_logs["day_of_week"] = ldate.et;
        s_logs["hour_of_day"] = h+5;

        var day_of_week = {};
        day_of_week["txt"] = ldate.toString().substr(0,3);
        day_of_week["num"] = ldate.getDay();
        day_of_week["all"] = ldate.getDay() + "_"+ldate.toString().substr(0,3);
        
        s_logs["day_of_week"] = day_of_week;

        // console.log("%j",s_logs);
        
        var logdata = JSON.stringify(s_logs)+"\n";
        fs.appendFileSync("data/seoul-metro-logs-"+yearOfLogs+".log", logdata);
      }

    }
    
  }

});
