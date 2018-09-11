
const uri = ""
var mongoClient = require('mongodb').MongoClient
var queryLogs = function (query = {}, limit=1000) {
    return new Promise(function (resolve, reject) {
        try {
            mongoClient.connect(uri, (err, client) => {
                if (err) {
                    reject(err);
                    return;
                }
                let functions = client.db('test').collection('logs')
                if (limit) {
                    functions.find(query).limit(limit).toArray()
                        .then(res => {
                            client.close()
                            resolve(res)
                        })
                        .catch(error => {
                            logger.log('database error in function query ' + error);
                        })
                } else {
                    functions.find(query).toArray()
                        .then(res => {
                            client.close()
                            resolve(res)
                        })
                        .catch(error => {
                            logger.log('database error in function query ' + error);
                        })
                }
            })
        } catch (error) {
            reject(error)
        }
        
    })
}
module.exports={
    queryLogs
}