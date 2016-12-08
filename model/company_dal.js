var mysql   = require('mysql');
var db  = require('./db_connection.js');

/* DATABASE CONFIGURATION */
var connection = mysql.createConnection(db.config);

exports.getAll = function(callback) {
    var query = 'SELECT * FROM Company;';

    connection.query(query, function(err, result) {
        callback(err, result);
    });
};

// exports.getById = function(company_id, callback) {
//     var query = 'SELECT * FROM Company WHERE company_id = ?';
//     var queryData = [company_id];
//
//     connection.query(query, queryData, function(err, result) {
//         callback(err, result);
//     });
// };



exports.getById = function(company_id, callback) {
    var query = 'SELECT c.*, a.street, a.zip_code FROM Company c ' +
        'LEFT JOIN Company_Address ca on ca.company_id = c.company_id ' +
        'LEFT JOIN Address a on a.address_id = ca.address_id ' +
        'WHERE c.company_id = ?';
    var queryData = [company_id];
    console.log(query);

    connection.query(query, queryData, function(err, result) {

        callback(err, result);
    });
};

// exports.insert = function(params, callback) {
//     var query = 'INSERT INTO Company (company_id, company_name) VALUES (?, ?)';
//
//     // the question marks in the sql query above will be replaced by the values of the
//     // the data in queryData
//     var queryData = [params.company_id, params.company_name];
//
//     connection.query(query, queryData, function(err, result) {
//         callback(err, result);
//     });
//
// };

exports.insert = function(params, callback) {

    // FIRST INSERT THE COMPANY
    var query = 'INSERT INTO Company (company_name) VALUES (?)';

    var queryData = [params.company_name];

    connection.query(query, params.company_name, function(err, result) {

        // THEN USE THE COMPANY_ID RETURNED AS insertId AND THE SELECTED ADDRESS_IDs INTO COMPANY_ADDRESS
        var company_id = result.insertId;

        // NOTE THAT THERE IS ONLY ONE QUESTION MARK IN VALUES ?
        var query = 'INSERT INTO Company_Address (company_id, address_id) VALUES ?';

        // TO BULK INSERT RECORDS WE CREATE A MULTIDIMENSIONAL ARRAY OF THE VALUES
        var companyAddressData = [];
        for(var i=0; i < params.address_id.length; i++) {
            companyAddressData.push([company_id, params.address_id[i]]);
        }

        // NOTE THE EXTRA [] AROUND companyAddressData
        connection.query(query, [companyAddressData], function(err, result){
            callback(err, result);
        });
    });

};

//declare the function so it can be used locally
var companyAddressInsert = function(company_id, addressIdArray, callback){
    // NOTE THAT THERE IS ONLY ONE QUESTION MARK IN VALUES ?
    var query = 'INSERT INTO Company_Address (company_id, address_id) VALUES ?';

    // TO BULK INSERT RECORDS WE CREATE A MULTIDIMENSIONAL ARRAY OF THE VALUES
    var companyAddressData = [];
    for(var i=0; i < addressIdArray.length; i++) {
        companyAddressData.push([company_id, addressIdArray[i]]);
    }
    connection.query(query, [companyAddressData], function(err, result){
        callback(err, result);
    });
};

//export the same function so it can be used by external callers
module.exports.companyAddressInsert = companyAddressInsert;

//declare the function so it can be used locally
var companyAddressDeleteAll = function(company_id, callback){
    var query = 'DELETE FROM Company_Address WHERE company_id = ?';
    var queryData = [company_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};

//export the same function so it can be used by external callers
module.exports.companyAddressDeleteAll = companyAddressDeleteAll;

exports.update = function(params, callback) {
    var query = 'UPDATE Company SET company_name = ? WHERE company_id = ?';

    var queryData = [params.company_name, params.company_id];

    connection.query(query, queryData, function(err, result) {
        //delete company_address entries for this company
        companyAddressDeleteAll(params.company_id, function(err, result){

            if(params.address_id != null) {
                //insert company_address ids
                companyAddressInsert(params.company_id, params.address_id, function(err, result){
                    callback(err, result);
                });}
            else {
                callback(err, result);
            }
        });

    });
};

exports.edit = function(company_id, callback) {
    var query = 'CALL company_getinfo(?)';
    var queryData = [company_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};


exports.delete = function(company_id, callback) {
    var query = 'DELETE FROM Company WHERE company_id = ?';
    var queryData = [company_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });

};