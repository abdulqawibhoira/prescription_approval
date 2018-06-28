const config = require('../configs');
const { getConnection } = require('./connect.js');

const findOne = async (collection, { filter, project }) => {
    return await getConnection().collection(collection).find(filter).project(project).limit(1).next();
};

const update = async (collection, filter, updateData) => {
    return await getConnection().collection(collection).updateOne(filter, updateData);
};

const create = async (collection, data) => {
    return await getConnection().collection(collection).insertOne(data);
};

const findAll = async (collection, { filter, project, sort }) => {
    return await getConnection().collection(collection).find(filter).project(project).sort(sort).toArray();
};

module.exports = { findOne, update, create, findAll };