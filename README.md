#엘라스틱서치 데모 데이터 생성기

이 프로젝트를 내려받은 후 프로젝트 홈 디렉토리에서 npm install 실행.

```
npm install
```

## 1. 서울시 지하철 유동인원 데이터
![대시보드](https://github.com/kimjmin/elastic-demo/blob/master/img/seoul-metro-demo.png?raw=true)
### 1.1 ELK 설정
#### elasticsearch

- 인덱스명: seoul-metro-2014
- 타입명: seoul-metro
- 매핑 정보:

필드명 | 타입 | 설명
---- | ---- | ----
\_timestamp | datetime | 승/하차 시간. 1시간 단위.
line_num | string | 호선 (1호선, 2호선 ...)
line_num_en | string | 호선(영문) (Line 1, Line 2 ...)
station_name | string | 역 이름 : 잠실
station_name | string | 역 이름 전체 : 잠실(송파구청)
station_name | string | 역 이름 영문
station_name | string | 역 이름 한자
station_name | string | 역 이름 중국어 간체
station_name | string | 역 이름 일본어
station_geo { lat , lon } | geo_point | 역 좌표
people_in | integer | 승차인원
people_out | integer | 하차인원


- 매핑 정보 입력:

```
curl -XPUT '<host url>:[9200|9243]/seoul-metro-2014' [-u '<user>'] -d '
  {
    "mappings" : {
      "seoul-metro" : {
        "properties" : {
          "time_slot" : { "type" : "date" },
          "line_num" : { "type" : "string", "index" : "not_analyzed" },
          "line_num_en" : { "type" : "string", "index" : "not_analyzed" },
          "station_name" : { "type" : "string", "index" : "not_analyzed" },
          "station_name_kr" : { "type" : "string", "index" : "not_analyzed" },
          "station_name_en" : { "type" : "string", "index" : "not_analyzed" },
          "station_name_chc" : { "type" : "string", "index" : "not_analyzed" },
          "station_name_ch" : { "type" : "string", "index" : "not_analyzed" },
          "station_name_jp" : { "type" : "string", "index" : "not_analyzed" },
          "station_geo" : { "type" : "geo_point" },
          "people_in" : { "type" : "integer" },
          "people_out" : { "type" : "integer" }
        }
      }
    }
  }'
```

> - ES 서버에 Sield 가 설치된 경우 -u 'user' 추가해서 사용자 인증 해야 함.

#### logstash

- logstash.conf:

```
input {
  file {
    codec => json
    path => "<git project path>/elastic-demo/data/*.log"
  }
}

filter{
  mutate {
    remove_field => [ "@version", "@timestamp", "host", "path" ]
  }
}

output{
  elasticsearch{
    hosts => ["127.0.0.1"]
    index => "seoul-metro-2014"
    document_type => "seoul-metro"
#    user => "<user>"
#    password => "<password>"
  }
}
```

> - found 클라우드 서비스에서 ssl 접속을 사용하는 경우 protocol => "http" 만 사용 가능함.
> - ES 서버에 Shield 가 설치된 경우 user => "user", password => "password" 추가해서 사용자 인증 해야 함.


### 1.2 데이터 수집

> 서울시의 지하철은 각각 1~4호선은 서울메트로가, 5~8호선은 서울도시철도공사가 관리하기 별도 파일들로부터 데이터를 추출해야 한다.
> 경의선, 분당선 등과 3호선의 일산선 구간 (대화 ~ 지축) 등은 집계된 데이터에 포함되어 있지 않다.

- 전체 도큐먼트 수 : 2,188,564

#### 역 코드로 지하철역 위치 조회
- 설명: 지하철역 위도/경도 좌표를 위한 메타데이타.
- 제공: [서울 열린 데이터광장](http://data.seoul.go.kr)([서울메트로](http://www.seoulmetro.co.kr/))
- 방법:
  1. http://data.seoul.go.kr/openinf/sheetview.jsp?infId=OA-118 접속.
  1. 제공되는 파일 중 json 파일 다운로드.
  1. 다운로드 한 파일명을 `station_info.json` 으로 변경하여 source/ 디렉토리 아래로 이동.
  1. 파일을 열고 `</script>` 포함 이전 부분과 마지막 라인 `<script>parent...` 포함 이후 부분 삭제.


#### 지하철역 다국어 이름 저장
- 설명: 지하철역 위도/경도 좌표를 위한 메타데이타.
- 제공: [서울 열린 데이터광장](http://data.seoul.go.kr)([서울메트로](http://www.seoulmetro.co.kr/))
- 방법:
  1. http://data.seoul.go.kr/openinf/sheetview.jsp?infId=OA-2782 접속.
  1. 제공되는 파일 중 json 파일 다운로드.
  1. 다운로드 한 파일명을 `station_lang.json` 으로 변경하여 source/ 디렉토리 아래로 이동.
  1. 파일을 열고 `</script>` 포함 이전 부분과 마지막 라인 `<script>parent...` 포함 이후 부분 삭제.
  1. 에디터에서 전체 바꾸기로 `<br>*개정(병기)역명예정` 텍스트 전부 삭제
  1. 에디터에서 전체 바꾸기로 `<br>*개정(병기)역명` 텍스트 전부 삭제
  1. 에디터에서 전체 바꾸기로 `<br>*개정역명예정<br>(미아삼거리-->미아사거리)` 텍스트 삭제
  1. 에디터에서 전체 바꾸기로 `<br>` 텍스트 전부 삭제


#### 역별 시간대별 승하차 인원 현황(2014년) - 1~4호선
- 설명: 2014년도 1~4호선 역별 시간대별 승하차 인원.
- 제공: [서울메트로](http://www.seoulmetro.co.kr/)
- 방법:
  1. http://www.seoulmetro.co.kr/board/bbs/view.action?bbsCd=61&mCode=C080000000&idxId=18450 접속.
  1. 1~4호선 역별 시간대별(일) 승하차인원 2014 - Excel 파일 다운로드.
  1. Excel 파일 열어서 다른이름으로 저장 선택 후 csv 형식으로 저장.
  1. 저장한 csv 파일을 다시 윈도우 메모장으로 열어서 UTF-8 포맷으로 선택 후 새로 저장.
  1. 파일명을 `2014_1TO4.csv` 로 변경 후 프로젝트의 source/ 디렉토리 아래로 이동.


#### 역별 시간대별(일) 승하차 인원[2014] - 5~8호선 서울도시철도공사
- 설명: 2014년도 5~8호선 역별 시간대별 승하차 인원
- 제공 [서울 열린 데이터광장](http://data.seoul.go.kr)([서울도시철도공사](http://www.smrt.co.kr/))
- 방법:
  1. http://data.seoul.go.kr/openinf/sheetview.jsp?infId=OA-12257&tMenu=11 접속.
  1. 제공되는 파일 중 csv 파일 다운로드.
  1. 다운로드 한 파일명을 `2014_5TO8.csv` 으로 변경하여 source/ 디렉토리 아래로 이동.
  

### 1.3 데이터 생성
- 다음 명령어 실행하면 프로젝트의 data/ 디렉토리 아래에 1to4_{YYYYMMDD}.log 형식으로 1~4호선 승하차 로그 파일 생성됨.
```
node bin/1to4_convert.js
```
- 다음 명령어 실행하면 프로젝트의 data/ 디렉토리 아래에 5to8_{YYYYMMDD}.log 형식으로 5~8호선 승하차 로그 파일 생성됨.
```
node bin/5to8_convert.js
```

### 1.4 추출된 데이터 링크
- https://drive.google.com/file/d/0ByqsUCpttxAGd1VXRU41VmJBNWs

