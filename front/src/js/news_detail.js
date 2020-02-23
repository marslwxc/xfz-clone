function CommentList() {}

CommentList.prototype.listenSubmitEvent = function() {
    var submitBtn = $(".submit-btn");
    var textarea = $("textarea[name='comment']");
    submitBtn.click(function() {
        var news_id = submitBtn.attr('data-news-id');
        var content = textarea.val()
        console.log(content);
        console.log(news_id);
        xfzajax.post({
            'url': '/news/public_comment/',
            'data': {
                'content': content,
                'news_id': news_id,
            },
            'success': function(result) {
                if (result['code'] === 200) {
                    var comment = result['data'];
                    var tpl = template('comment-item', { "comment": comment });
                    var commentListGroup = $(".comment-list");
                    commentListGroup.prepend(tpl);
                    window.messageBox.showSuccess('评论发表成功！');
                    textarea.val("");
                } else {
                    window.messageBox.showError(result['message']);
                }
            }
        });
    });
}

CommentList.prototype.run = function() {
    this.listenSubmitEvent();
}

$(function() {
    var commentlist = new CommentList();
    commentlist.run();
});