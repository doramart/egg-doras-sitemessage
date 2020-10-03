/*
 * @Author: doramart 
 * @Date: 2019-06-24 13:20:49 
 * @Last Modified by: doramart
 * @Last Modified time: 2020-08-23 09:29:33
 */

'use strict';
const Service = require('egg').Service;
const path = require('path')

// general是一个公共库，可用可不用
const {
    _list,
    _item,
    _count,
    _create,
    _update,
    _removes,
    _safeDelete,
    _updateMany
} = require(path.join(process.cwd(), 'app/service/general'));



class SiteMessageService extends Service {

    async find(payload, {
        query = {},
        searchKeys = [],
        include = [],
        attributes = null
    } = {}) {

        let listdata = _list(this, this.ctx.model.SiteMessage, payload, {
            query: query,
            searchKeys: searchKeys,
            include: !_.isEmpty(include) ? include : [{
                as: 'activeUser',
                select: getAuthUserFields('base')
            }, {
                as: 'passiveUser',
                select: getAuthUserFields()
            }, {
                as: 'content',
                attributes: ['title', '_id', 'id']
            }, {
                as: 'message',
                attributes: ['content', '_id', 'id', 'contentId'],
                include: {
                    as: 'contentId',
                    attributes: ['title', '_id', 'id', 'date']
                }
            }],
            attributes
        });
        return listdata;

    }


    async count(params = {}) {
        return _count(this, this.ctx.model.SiteMessage, params);
    }

    async create(payload) {
        return _create(this, this.ctx.model.SiteMessage, payload);
    }

    async removes(values, key = 'id') {
        return _removes(this, this.ctx.model.SiteMessage, values, key);
    }

    async safeDelete(values) {
        return _safeDelete(this, this.ctx.model.SiteMessage, values);
    }

    async update(id, payload) {
        return _update(this, this.ctx.model.SiteMessage, id, payload);
    }

    async updateMany(ids, payload, params) {
        return _updateMany(this, this.ctx.model.SiteMessage, ids, payload, params);
    }

    async item(params = {}) {
        return _item(this, this.ctx.model.SiteMessage, params)
    }


}

module.exports = SiteMessageService;