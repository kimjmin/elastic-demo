#엘라스틱서치 데모 페이지

### 서울시 지하철 유동인원

#### 역 코드로 지하철역 위치 조회
http://data.seoul.go.kr/openinf/sheetview.jsp?infId=OA-118

1. json 형식 파일 다운로드
2. source/ 디렉토리 아래에 station_info.json 파일명으로 복사.


#### 역별 시간대별 승하차 인원 현황(2014년) - 1~4호선 서울메트로
http://www.seoulmetro.co.kr/board/bbs/view.action?bbsCd=61&mCode=C080000000&idxId=18450

1. 1~4호선 역별 시간대별(일) 승하차인원 2014 - Excel 파일 다운로드
2. Excel 파일 열어서 다시 csv 형식으로 전환.
3. 윈도우에서 메모장으로 열어서 UTF-8 포맷으로 변경 후 새로 저장.
4. source/ 디렉토리 아래에 2014_1TO4.csv 파일명으로 복사.
5. 다음 명령어 실행하면 data/ 디렉토리 아래에 1to4_{YYYYMMDD}.log 형식으로 파일 생성됨.

```
node bin/1to4_convert.js
```

#### 5~8호선 역별 시간대별(일) 승하차 인원[2014]
http://data.seoul.go.kr/openinf/sheetview.jsp?infId=OA-12257&tMenu=11

1. csv 파일 다운로드
2. source/ 디렉토리 아래에 2014_5TO8.csv 파일명으로 복사.
5. 다음 명령어 실행하면 data/ 디렉토리 아래에 5to8_{YYYYMMDD}.log 형식으로 파일 생성됨.

```
node bin/5to8_convert.js
```

####매핑 정보

필드명 | 타입 | 설명
---- | ---- | ----
time_slice | datetime | 승/하차 시간. 1시간 단위.
line_num | string | 호선 (1호선, 2호선 ...)
station_name | string | 역 이름
station_code | string | 역 코드
station_geo | geo_point | 역 좌표 { lat: "" , lon: "" }
people_in | integer | 승차인원
people_out | integer | 하차인원
total | integer | 승하차인원

```
curl -XPUT http://bec6d9580e248fb1623c88c0c026bd7b.ap-northeast-1.aws.found.io:9200/demo-kr-subway -d '
{
  "mappings" : {
    "kr-subway" : {
      "properties" : {
        "time_slice" : { "type" : "date" },
        "line_num" : { "type" : "string" },
        "station_name" : { "type" : "string" },
        "station_code" : { "type" : "string" },
        "station_geo" : { "type" : "geo_point" },
        "people_in" : { "type" : "integer" },
        "people_out" : { "type" : "integer" },
        "people_out" : { "type" : "integer" }
      }
    }
  }
}'
```
