#엘라스틱서치 데모 데이터 생성기

이 프로젝트를 내려받은 후 프로젝트 홈 디렉토리에서 npm install 실행.

```
npm install
```

## 1. 서울시 지하철 유동인원 데이터
![대시보드](https://github.com/kimjmin/elastic-demo/blob/master/img/seoul-metro-demo.png?raw=true)
### 1.1 ELK 설정
#### elasticsearch

- 인덱스명: demo-kr-subway
- 타입명: kr-subway
- 매핑 정보:

필드명 | 타입 | 설명
---- | ---- | ----
time_slice | datetime | 승/하차 시간. 1시간 단위.
line_num | string | 호선 (1호선, 2호선 ...)
station_name | string | 역 이름
station_code | string | 역 코드
station_geo { lat , lon } | geo_point | 역 좌표
people_in | integer | 승차인원
people_out | integer | 하차인원
total | integer | 승하차인원 합계


- 매핑 정보 입력:

```
curl -XPUT '<host url>:[9200|9243]/demo-kr-subway' [-u '<user>'] -d '
{
  "mappings" : {
    "kr-subway" : {
      "properties" : {
        "time_slice" : { "type" : "date" },
        "line_num" : { "type" : "string", "index" : "not_analyzed" },
        "station_name" : { "type" : "string", "index" : "not_analyzed" },
        "station_code" : { "type" : "string", "index" : "not_analyzed" },
        "station_geo" : { "type" : "geo_point" },
        "people_in" : { "type" : "integer" },
        "people_out" : { "type" : "integer" },
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
#    protocol => "node"
#    protocol => "http"
#    ssl => true
    host => "<host url>"  #remove http|https
#    port => 9300
    port => 9243
    index => "demo-kr-subway"
    document_type => "kr-subway"
#    user => "<user>"        #need admin privilege
#    password => "<password>"
  }
}
```

> - found 클라우드 서비스에서 ssl 접속을 사용하는 경우 protocol => "http" 만 사용 가능함.
> - ES 서버에 Sield 가 설치된 경우 user => "user", password => "password" 추가해서 사용자 인증 해야 함.


### 1.2 데이터 수집

> 서울시의 지하철은 각각 1~4호선은 서울메트로가, 5~8호선은 서울도시철도공사가 관리하기 별도 파일들로부터 데이터를 추출해야 한다.

- 전체 도큐먼트 수 : 2,188,564

#### 역 코드로 지하철역 위치 조회
- 설명: 지하철역 위도/경도 좌표를 위한 메타데이타.
- 제공: [서울 열린 데이터광장](http://data.seoul.go.kr)([서울메트로](http://www.seoulmetro.co.kr/))
- 방법:
  - http://data.seoul.go.kr/openinf/sheetview.jsp?infId=OA-118 접속.
  - 제공되는 파일 중 json 파일 다운로드.
  - 다운로드 한 파일명을 `station_info.json` 으로 변경하여 source/ 디렉토리 아래로 이동.


#### 역별 시간대별 승하차 인원 현황(2014년) - 1~4호선
- 설명: 2014년도 1~4호선 역별 시간대별 승하차 인원.
- 제공: [서울메트로](http://www.seoulmetro.co.kr/)
- 방법:
  - http://www.seoulmetro.co.kr/board/bbs/view.action?bbsCd=61&mCode=C080000000&idxId=18450 접속.
  - 1~4호선 역별 시간대별(일) 승하차인원 2014 - Excel 파일 다운로드.
  - Excel 파일 열어서 다른이름으로 저장 선택 후 csv 형식으로 저장.
  - 저장한 csv 파일을 다시 윈도우 메모장으로 열어서 UTF-8 포맷으로 선택 후 새로 저장.
  - 파일명을 `2014_1TO4.csv` 로 변경 후 프로젝트의 source/ 디렉토리 아래로 이동.
  - 다음 명령어 실행하면 프로젝트의 data/ 디렉토리 아래에 1to4_{YYYYMMDD}.log 형식으로 파일 생성됨.

```
node bin/1to4_convert.js
```

#### 역별 시간대별(일) 승하차 인원[2014] - 5~8호선 서울도시철도공사
- 설명: 2014년도 5~8호선 역별 시간대별 승하차 인원
- 제공 [서울 열린 데이터광장](http://data.seoul.go.kr)([서울도시철도공사](http://www.smrt.co.kr/))
- 방법:
  - http://data.seoul.go.kr/openinf/sheetview.jsp?infId=OA-12257&tMenu=11 접속.
  - 제공되는 파일 중 csv 파일 다운로드.
  - 다운로드 한 파일명을 `2014_5TO8.csv` 으로 변경하여 source/ 디렉토리 아래로 이동.
  - 다음 명령어 실행하면 프로젝트의 data/ 디렉토리 아래에 5to8_{YYYYMMDD}.log 형식으로 파일 생성됨.

```
node bin/5to8_convert.js
```

### 1.3 Kibana4 예제 페이지

- URL : https://14faa4d979096e1936d5d292ba5dbf6b.ap-northeast-1.aws.found.io/#/dashboard/서울시-지하철-승-slash-하차-인원
- 접속 id / password 는 jongmin.kim@elastic.co 으로 문의.
