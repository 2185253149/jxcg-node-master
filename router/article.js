///文章相关接口
module.exports = function (app, models, $, db, nm) {
    //新闻详情
    app.get('/news/:id',async function(req,res){
        let id = req.params.id
        if(id){
            let news = await models.article.findSync({ id })
            if(news.errorMsg){
                res.send(res.errorMsg)
            }else{
                res.send(`
                <!DOCTYPE html>
                <html lang="zh-cmn-Hans">
                <head>
                  <meta charset="UTF-8">
                  <meta content="yes" name="apple-mobile-web-app-capable">
                  <meta content="yes" name="apple-touch-fullscreen">
                  <meta name="App-Config" content="fullscreen=yes,useHistoryState=yes,transition=yes">
                  <meta name="apple-mobile-web-app-status-bar-style" content="black">
                  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=0;">
                  <meta name="theme-color" content="#fff">
                  <title>${news.title}</title>
                  <style type="text/css">
                    html,body{
                        background:#f4f4f4;
                        margin:0;
                        padding:0;
                    }
                    .news{
                        margin:16px;
                    }
                    .digest{
                        background: #e4e4e4;
                        color: #999;
                        margin:16px 0px;
                        padding: 8px;
                    }
                    .newsAuthor{
                        text-align: center;
                    }
                    .newsAuthor span{
                        margin-right: 16px;
                        color: #999;
                    }
                    .newsTitle{
                        font-size: 26px;
                        text-align: center;
                        padding-bottom:16px;
                    }
                  </style>
                  
                        <!-- 引入样式 -->
                        <link rel="stylesheet" href="css/element.css">
                        
                </head>
                <body>
                <div class="news">
                    <div class="newsAuthor">
                        <span>${news.author || '数字环卫中心'}</span>
                        <span>发布时间:${news.time || news.createTimeString}</span>
                    </div>
                    <div class="digest">${news.digest || '-'}</div>
                    <div>${news.content}</div>
                </div>
                </body>
                </html>
                `)
            }
        }else{
            res.send(`参数错误`)
        }
    })
}