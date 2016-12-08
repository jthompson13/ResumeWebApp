var mysql   = require('mysql');
var db  = require('./db_connection.js');

/* DATABASE CONFIGURATION */
var connection = mysql.createConnection(db.config);

exports.getAll = function(callback) {
    var query = 'SELECT * FROM resume_view;';

    connection.query(query, function(err, result) {
        callback(err, result);
    });
};

exports.getById = function(account_id, callback) {
    var query = 'SELECT r.* , first_name, skill_name, company_name, school_name FROM Resume r ' +
        'LEFT JOIN Account a ON a.account_id = r.account_id ' +
        'LEFT JOIN Resume_Skill rs ON r.resume_id = rs.resume_id ' +
        'LEFT JOIN Skill s ON s.skill_id = rs.skill_id ' +
        'LEFT JOIN Resume_Company rc ON rc.resume_id = r.resume_id ' +
        'LEFT JOIN Company c ON c.company_id = rc.company_id ' +
        'LEFT JOIN Resume_School rsc ON rsc.resume_id = r.resume_id ' +
        'LEFT JOIN School sch ON sch.school_id = rsc.school_id ' +
        'WHERE r.resume_id = ?;';
    var queryData = [account_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};


exports.insert = function(params, callback) {

    // FIRST INSERT THE COMPANY
    var query = 'INSERT INTO Resume (resume_name, account_id) VALUES (?, ?)';

    var queryData = [params.resume_name, params.account_id];

    connection.query(query, queryData, function(err, result) {

        // THEN USE THE COMPANY_ID RETURNED AS insertId AND THE SELECTED ADDRESS_IDs INTO COMPANY_ADDRESS
        var resume_id = result.insertId;

        // NOTE THAT THERE IS ONLY ONE QUESTION MARK IN VALUES ?
        var querySkill = 'INSERT INTO Resume_Skill (resume_id, skill_id) VALUES ?';
        var queryCompany = 'INSERT INTO Resume_Company (resume_id, company_id) VALUES ?';
        var querySchool = 'INSERT INTO Resume_School (resume_id, school_id) VALUES ?';

        // TO BULK INSERT RECORDS WE CREATE A MULTIDIMENSIONAL ARRAY OF THE VALUES
        var resumeSkillData = [];
        for(var i=0; i < params.skill_id.length; i++) {
            resumeSkillData.push([resume_id, params.skill_id[i]]);
        }

        var resumeCompanyData = [];
        for(var i=0; i < params.company_id.length; i++) {
            resumeCompanyData.push([resume_id, params.company_id[i]]);
        }

        var resumeSchoolData = [];

        for(var i=0; i < params.school_id.length; i++) {
                resumeSchoolData.push([resume_id, params.school_id[i]]);

        }

        // NOTE THE EXTRA [] AROUND companyAddressData
        connection.query(querySkill, [resumeSkillData], function(err, result){
            connection.query(queryCompany, [resumeCompanyData], function(err, result){
                connection.query(querySchool, [resumeSchoolData], function(err, result){
                    callback(err, result);
                });
            });
        });
    });

};

exports.edit = function(resume_id, callback) {


    var query = 'CALL resume_getinfo(?, ?)';
    var query1 = 'SELECT account_id FROM Resume Where resume_id = ?';

    var queryData = resume_id;


    connection.query(query1, queryData, function(err, result1) {
        var queryData1 = [resume_id, result1[0].account_id];
        connection.query(query, queryData1, function (err, result) {
            callback(err, result[0]);
        });

    });
};



exports.delete = function(resume_id, callback) {
    var query = 'DELETE FROM Resume WHERE resume_id = ?';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });

};









////////////////////////////// BEGIN RESUME_SKILL INSERT ////////////////////////////////////////////
//declare the function so it can be used locally
var resumeSkillInsert = function(resume_id, skillsIdArray, callback){
    // NOTE THAT THERE IS ONLY ONE QUESTION MARK IN VALUES ?
    var query = 'INSERT INTO Resume_Skill (resume_id, skill_id) VALUES ?';

    // TO BULK INSERT RECORDS WE CREATE A MULTIDIMENSIONAL ARRAY OF THE VALUES
    var resumeSkillData = [];
    for(var i=0; i < skillsIdArray.length; i++) {
        resumeSkillData.push([resume_id, skillsIdArray[i]]);
    }
    connection.query(query, [resumeSkillData], function(err, result){
        callback(err, result);
    });
};

//export the same function so it can be used by external callers
module.exports.resumeSkillInsert = resumeSkillInsert;
///////////////////////////////////////// END /////////////////////////////////////////////////////////

////////////////////////////// BEGIN RESUME_COMPANY INSERT ////////////////////////////////////////////
//declare the function so it can be used locally
var resumeCompanyInsert = function(resume_id, companysIdArray, callback){
    // NOTE THAT THERE IS ONLY ONE QUESTION MARK IN VALUES ?
    var query = 'INSERT INTO Resume_Company (resume_id, company_id) VALUES ?';

    // TO BULK INSERT RECORDS WE CREATE A MULTIDIMENSIONAL ARRAY OF THE VALUES
    var resumeCompanyData = [];
    for(var i=0; i < companysIdArray.length; i++) {
        resumeCompanyData.push([resume_id, companysIdArray[i]]);
    }
    connection.query(query, [resumeCompanyData], function(err, result){
        callback(err, result);
    });
};

//export the same function so it can be used by external callers
module.exports.resumeCompanyInsert = resumeCompanyInsert;
///////////////////////////////////////// END /////////////////////////////////////////////////////////

////////////////////////////// BEGIN RESUME_SCHOOL INSERT ////////////////////////////////////////////
//declare the function so it can be used locally
var resumeSchoolInsert = function(resume_id, schoolsIdArray, callback){
    // NOTE THAT THERE IS ONLY ONE QUESTION MARK IN VALUES ?
    var query = 'INSERT INTO Resume_School (resume_id, school_id) VALUES ?';

    // TO BULK INSERT RECORDS WE CREATE A MULTIDIMENSIONAL ARRAY OF THE VALUES
    var resumeSchoolData = [];
    for(var i=0; i < schoolsIdArray.length; i++) {
        resumeSchoolData.push([resume_id, schoolsIdArray[i]]);
    }
    connection.query(query, [resumeSchoolData], function(err, result){
        callback(err, result);
    });
};

//export the same function so it can be used by external callers
module.exports.resumeSchoolInsert = resumeSchoolInsert;
///////////////////////////////////////// END /////////////////////////////////////////////////////////

////////////////////////////// BEGIN RESUME_SKILL DELETE ////////////////////////////////////////////
//declare the function so it can be used locally
var resumeSkillDeleteAll = function(resume_id, callback){
    var query = 'DELETE FROM Resume_Skill WHERE resume_id = ?';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};

//export the same function so it can be used by external callers
module.exports.resumeSkillDeleteAll = resumeSkillDeleteAll;
///////////////////////////////////////// END /////////////////////////////////////////////////////////

////////////////////////////// BEGIN RESUME_COMPANY DELETE ////////////////////////////////////////////
//declare the function so it can be used locally
var resumeCompanyDeleteAll = function(resume_id, callback){
    var query = 'DELETE FROM Resume_Company WHERE resume_id = ?';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};

//export the same function so it can be used by external callers
module.exports.resumeCompanyDeleteAll = resumeCompanyDeleteAll;
///////////////////////////////////////// END /////////////////////////////////////////////////////////

////////////////////////////// BEGIN RESUME_SKILL DELETE ////////////////////////////////////////////
//declare the function so it can be used locally
var resumeSchoolDeleteAll = function(resume_id, callback){
    var query = 'DELETE FROM Resume_School WHERE resume_id = ?';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};

//export the same function so it can be used by external callers
module.exports.resumeSchoolDeleteAll = resumeSchoolDeleteAll;
///////////////////////////////////////// END /////////////////////////////////////////////////////////


exports.update = function(params, callback) {
    var query = 'UPDATE Resume SET resume_name = (?), account_id = ? WHERE resume_id = ?';

    var queryData = [params.resume_name, params.account_id, params.resume_id];

    connection.query(query, queryData, function(err, result) {
        //delete company_address entries for this company
        resumeSkillDeleteAll(params.resume_id, function(err, result){
            resumeSchoolDeleteAll(params.resume_id, function(err, result){
                resumeCompanyDeleteAll(params.resume_id, function(err, result){
                    if(params.skill_id != null) {
                        //insert company_address ids
                        resumeSkillInsert(params.resume_id, params.skill_id, function(err, result){
                            if(params.school_id != null) {
                                resumeSchoolInsert(params.resume_id, params.school_id, function(err, result){
                                    if(params.company_id != null) {
                                        resumeCompanyInsert(params.resume_id, params.company_id, function(err, result){
                                            callback(err, result);
                                        });}
                                    else{
                                        callback(err, result);
                                    }
                            });}
                            else{
                                if(params.company_id != null) {
                                    resumeCompanyInsert(params.resume_id, params.company_id, function(err, result){
                                        callback(err, result);
                                    });}
                                else{
                                    callback(err, result);
                                }
                            }
                    });}
                    else {
                        if(params.school_id != null) {
                            resumeSchoolInsert(params.resume_id, params.school_id, function(err, result){
                                if(params.company_id != null) {
                                    resumeCompanyInsert(params.resume_id, params.company_id, function(err, result){
                                        callback(err, result);
                                    });}
                                else{
                                    callback(err, result);
                                }
                            });}
                        else{
                            if(params.company_id != null) {
                                resumeCompanyInsert(params.resume_id, params.company_id, function(err, result){
                                    callback(err, result);
                                });}
                            else{
                                callback(err, result);
                            }
                        }
                    }
                });
            });
        });

    });
};