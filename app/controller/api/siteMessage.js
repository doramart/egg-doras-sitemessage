/*
 * @Author: doramart 
 * @Date: 2019-09-26 09:19:25 
 * @Last Modified by: doramart
 * @Last Modified time: 2020-08-23 09:29:19
 */
const _ = require('lodash');


let SiteMessageController = {


    async list(ctx, app) {

        try {

            let payload = ctx.query;
            let type = ctx.query.type;
            let queryObj = {};
            let userInfo = ctx.session.user || {};

            if (!_.isEmpty(userInfo)) {
                queryObj.passiveUser = userInfo.id;
            }

            if (type) {
                queryObj.type = type;
            }

            let siteMessageList = await ctx.service.siteMessage.find(payload, {
                query: queryObj
            });

            ctx.helper.renderSuccess(ctx, {
                data: siteMessageList
            });

        } catch (err) {

            ctx.helper.renderFail(ctx, {
                message: err
            });

        }
    },



    /**
     * @api {get} /api/siteMessage/setHasRead 设置消息为已读
     * @apiDescription 设置消息为已读，包含 赞赏、关注和评论消息；需要登录态
     * @apiName /siteMessage/setHasRead
     * @apiGroup SiteMessage
     * @apiParam {string} ids 消息id,多个id用逗号隔开;传 ids=all 设置所有消息为已读
     * @apiParam {string} type 当ids为all时，传该参数，指定全部设置已读的消息类别
     * @apiParam {string} token 登录时返回的参数鉴权
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *{
     *    "status": 200,
     *    "message": "设置已读成功",
     *    "server_time": 1542529985218,
     *    "data": {}
     *}
     * @apiSampleRequest http://localhost:10003/api/siteMessage/setHasRead
     * @apiVersion 1.0.0
     */
    async setMessageHasRead(ctx, app) {

        try {
            let errMsg = '',
                targetIds = ctx.query.ids;
            let messageType = ctx.query.type;
            let queryObj = {};
            // 用户只能操作自己的消息
            let userInfo = ctx.session.user || {};
            if (!_.isEmpty(userInfo)) {
                queryObj.passiveUser = userInfo.id;
            } else {
                throw new Error(ctx.__(ctx.__("validate_error_params")))
            }

            // 设置我所有未读的为已读
            if (targetIds == 'all') {
                if (messageType) {
                    queryObj.type = messageType;
                }
                queryObj.isRead = false;
            } else {
                if (!checkCurrentId(targetIds)) {
                    errMsg = ctx.__("validate_error_params");
                } else {
                    targetIds = targetIds.split(',');
                }
                if (errMsg) {
                    throw new Error(errMsg);
                }
                queryObj['id'] = {
                    [app.Sequelize.Op.in]: targetIds
                };
            }

            await ctx.service.siteMessage.updateMany('', {
                'isRead': true
            }, queryObj)

            ctx.helper.renderSuccess(ctx, {
                data: {}
            });

        } catch (err) {

            ctx.helper.renderFail(ctx, {
                message: err
            });

        }

    },

    async getSiteMessageOutline(ctx, app) {

        try {

            let userInfo = ctx.session.user;
            // 获取未读消息数量
            let noReadGoodNum = await ctx.service.siteMessage.count({
                isRead: false,
                type: '4',
                passiveUser: userInfo.id
            });

            let noReadGoodContent = await ctx.service.siteMessage.find({
                isPaging: '0',
                pageSize: 1
            }, {
                query: {
                    type: '4',
                    passiveUser: userInfo.id
                }
            })

            let noReadFollowNum = await ctx.service.siteMessage.count({
                isRead: false,
                type: '2',
                passiveUser: userInfo.id
            });
            let noReadFollowContent = await ctx.service.siteMessage.find({
                isPaging: '0',
                pageSize: 1
            }, {
                query: {
                    type: '2',
                    passiveUser: userInfo.id
                }
            })

            let noReadCommentNum = await ctx.service.siteMessage.count({
                isRead: false,
                type: '3',
                passiveUser: userInfo.id
            });
            let noReadCommentContent = await ctx.service.siteMessage.find({
                isPaging: '0',
                pageSize: 1
            }, {
                query: {
                    type: '3',
                    passiveUser: userInfo.id
                }
            })

            let userNotify_num = await ctx.service.systemNotify.count({
                isRead: false,
                user: userInfo.id
            });

            let userNotifyContent = await ctx.service.systemNotify.find({}, {
                query: {
                    isRead: false,
                    user: userInfo.id
                },
                include: ['notify']
            })

            let renderData = {
                first_privateLetter: userNotifyContent[0] || {},
                private_no_read_num: userNotify_num,
                no_read_good_num: noReadGoodNum,
                first_good_message: noReadGoodContent[0] || {},
                no_read_follow_num: noReadFollowNum,
                first_follow_message: noReadFollowContent[0] || {},
                no_read_comment_num: noReadCommentNum,
                first_comment_message: noReadCommentContent[0] || {},
            }

            ctx.helper.renderSuccess(ctx, {
                data: renderData
            });

        } catch (err) {
            ctx.helper.renderFail(ctx, {
                message: err
            });
        }
    }

}

module.exports = SiteMessageController;