#!/usr/bin/python

import sys,gzip,json
import os.path
import sqlite3
import bottle
from bottle import route, run, template, response, hook

if not os.path.isfile('example.db'):
    f = gzip.open(sys.argv[1], 'rb')
    file_content = f.read()
    f.close()

    conn = sqlite3.connect('example.db')
    c = conn.cursor()
    c.execute('CREATE TABLE example(chromosome text, start integer, end integer, type text, name text)')
    lines = file_content.split('\n')
    for line in lines:
        fields = line.split('\t')
        chrom = fields[0].replace('chr', '')
        if len(fields) > 5:
            c.execute("INSERT INTO example VALUES ('"+chrom+"',"+fields[3]+","+fields[4]+", 'TF_binding_site', '"+fields[8].replace('Name=', '')+"')")

    conn.commit()
    c.execute("CREATE INDEX chromosome_start_idx ON example('chromosome', 'start')")
    conn.close()

conn = sqlite3.connect('example.db')
c = conn.cursor()

# the decorator
# def enable_cors(fn):
#     def _enable_cors(*args, **kwargs):
#         # set CORS headers
#         response.headers['Access-Control-Allow-Origin'] = '*'
#         response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS'
#         response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'
#
#         if bottle.request.method != 'OPTIONS':
#             # actual request; reply with the actual response
#             return fn(*args, **kwargs)
#
#     return _enable_cors


app = bottle.app()

@app.hook('after_request')
def enable_cors():
    """
    You need to add some headers to each request.
    Don't use the wildcard '*' for Access-Control-Allow-Origin in production.
    """
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'PUT, GET, POST, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'

# @route('/region/<chrom>/<start>/<end>/data', method=['OPTIONS', 'GET'])
@app.route('/region/<chrom>/<start>/<end>/data')
def fetch(chrom, start, end):
    # response.headers['Content-type'] = 'application/json'
    c.execute("SELECT * FROM example WHERE chromosome='"+chrom+"' and start>="+start+" and end<="+end)
    results = []
    for row in c:
        result = {"id": row[4] ,"chromosome": row[0], "start": row[1], "end": row[2], "type": row[3]}
        results.append(result)
    str = chrom+":"+start+"-"+end
    return {"id":str, "result":json.dumps(results)}


@route('/close')
def index():
    conn.close()

app.run(host='127.0.0.1', port=9090)
