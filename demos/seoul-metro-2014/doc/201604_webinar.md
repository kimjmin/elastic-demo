Logstash 설정
```
input {
  beats {
    codec => json
    port => 5044
  }
}

filter{
  mutate {
    remove_field => [ "@version", "@timestamp", "beat", "count", "fields", "input_type","offset","source","type","host","tags" ]
  }
}

output{
  stdout {
    codec => json
  }
#  elasticsearch{
#    hosts => ["127.0.0.1"]
#    index => "seoul-metro-2014"
#    document_type => "seoul-metro"
#  }
}
```


```
echo '
{
  "time_slot": "2013-12-31T15:00:00.000Z",
  "line_num": "1호선",
  "line_num_en": "Line 1",
  "station_name": "서울역",
  "station_name_kr": "서울역",
  "station_name_en": "Seoul Station",
  "station_name_chc": "-",
  "station_name_ch": "首尔站",
  "station_name_jp": "ソウルヨク",
  "station_geo": {
    "lat": 37.554648,
    "lon": 126.972559
  },
  "people_in": 91,
  "people_out": 172
}
' >> test.log
```

