const xss = require("xss");
const _ = require('lodash');



let SiteMessageController = {

    async list(ctx, app) {

        try {

            let payload = ctx.query;
            let siteMessageList = await ctx.service.siteMessage.find(payload, {
                include: [{
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
                        attributes: ['title', '_id', 'id', 'created_at']
                    }
                }]
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


    async getOne(ctx, app) {

        try {
            let id = ctx.query.id;

            let targetUser = await ctx.service.siteMessage.item({
                query: {
                    id: id
                }
            });

            ctx.helper.renderSuccess(ctx, {
                data: targetUser
            });

        } catch (err) {
            ctx.helper.renderFail(ctx, {
                message: err
            });
        }

    },


    async removes(ctx, app) {

        try {
            let targetIds = ctx.query.ids;
            await ctx.service.siteMessage.removes(targetIds);
            ctx.helper.renderSuccess(ctx);

        } catch (err) {

            ctx.helper.renderFail(ctx, {
                message: err
            });
        }
    }

}



module.exports = SiteMessageController;