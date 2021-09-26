from time import sleep

import pymysql
import requests
import json
if __name__ == '__main__':
    # conn = pymysql.connect(host="localhost", user="root", passwd="", db='sports', charset='utf8', port=3306)
    # cursor = conn.cursor()
    # sql = "select uniqueid from inventorymaterial order by id asc into outfile '/Users/dawei_simayi/Desktop/resSql222.txt'"
    # cursor.execute(sql)
    # cursor.fetchall()
    # sleep(2)
    url = "http://localhost:8000/api/v1/material/instock"
    header = {
        'Content-Type':'application/json',
        'Authorization':'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwidXNlcm5hbWUiOiJ0ZXN0ZXIiLCJhdmF0YXIiOiIiLCJyb2xlIjoiMDAzIiwiZW1haWwiOiJ0ZXN0QDEyMy5jb20iLCJpYXQiOjE2MzI2MzQ1OTAsImV4cCI6MTYzMzIzOTM5MH0.8XYf8zk1eEswIrbWrKEr2iXG39rDyVOoruUFqjfjdnQ'
    }
    Body = {
        "code": "test",
        "description": "test",
        "createAt": "1632643301149",
        "userId": 3,
        "data": {
            "dataSource": [{
                "uniqueId": "123456",
                "instockAmount": 1
            }],
            "count": 1
        }
    }
    f = open("/Users/dawei_simayi/Desktop/resSql222.txt")
    for line in f:
        line = line.strip('\n')
        Body["data"]["dataSource"][0]["uniqueId"] = line
        r = requests.post(url, headers=header,data=json.dumps(Body))
        if r.status_code != 200:
            print(line)
    # f = open("/Users/dawei_simayi/Desktop/resSql222.txt")
    # uniqueId = []
    # for line in f:
    #     uniqueId.append(line.strip('\n'))
    # for line in uniqueId:
    #     body["data"]["dataSource"][0]["uniqueId"] = line




