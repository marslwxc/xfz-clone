function News() {}

News.prototype.initUEditor = function() {
    window.ue = UE.getEditor('editor', {
        'initialFrameHeight': 400,
        'initialFrameWidth': 100 + '%',
        'serverUrl': '/ueditor/upload/'
    });
};

News.prototype.handleFileUploadProgress = function(response) {
    var total = response.total;
    var percent = total.percent;
    var percentText = percent.toFixed(0) + '%';
    var progressGroup = News.progressGroup;
    progressGroup.show();
    var progressBar = $('.progress-bar');
    progressBar.css({ 'width': percentText });
    progressBar.text(percentText);
}

News.prototype.handleFileUploadError = function(error) {
    window.messageBox.showError(error.message);
    var progressGroup = News.progressGroup;
    progressGroup.hide();
    console.log(error.message);
    var progressBar = $('.progress-bar');
    progressBar.css({ 'width': 0 });
    progressBar.text(0);
}

News.prototype.handleFileUploadComplete = function(response) {
    console.log(response);
    var progressGroup = News.progressGroup;
    progressGroup.hide();
    var progressBar = $('.progress-bar');
    progressBar.css({ 'width': 0 });
    progressBar.text(0);

    var domain = 'http://q5ttl3pxu.bkt.clouddn.com/';
    var filename = response.key;
    var url = domain + filename;
    console.log(url);
    var thumbnailInput = $("input[name='thumbnail']");
    thumbnailInput.val(url);
}

News.prototype.listenUploadFieldEvent = function() {
    var uploadBtn = $('#thumbnail-btn');
    uploadBtn.change(function() {
        var file = uploadBtn[0].files[0];
        var formData = new FormData();
        formData.append('file', file);
        console.log(formData.name);
        xfzajax.post({
            'url': '/cms/upload_file/',
            'data': formData,
            'processData': false,
            'contentType': false,
            'success': function(result) {
                if (result['code'] === 200) {
                    var url = result['data']['url'];
                    var thumbnailInput = $('#thumbnail-form');
                    thumbnailInput.val(url);
                }
            }
        });
    });
}

News.prototype.listenQiniuUploadFieldEvent = function() {
    var self = this;
    var uploadBtn = $('#thumbnail-btn');
    uploadBtn.change(function() {
        var file = this.files[0];
        xfzajax.get({
            'url': '/cms/qntoken/',
            'success': function(result) {
                if (result['code'] === 200) {
                    var token = result['data']['token'];
                    var key = (new Date()).getTime() + '.' + file.name.split('.')[1];
                    var putExtra = {
                        fname: key,
                        params: {},
                        mimeType: ['image/png', 'image/jpeg', 'image/gif', 'video/x-ms-wmv']
                    };
                    var config = {
                        useCdnDomain: true,
                        region: qiniu.region.z2,
                        retryCount: 6
                    };
                    var observer = qiniu.upload(file, key, token, putExtra, config);
                    observer.subscribe({
                        'next': self.handleFileUploadProgress,
                        'error': self.handleFileUploadError,
                        'complete': self.handleFileUploadComplete,
                    });
                }
            }
        });
    });
}

News.prototype.listerSubmitEvent = function() {
    var submitBtn = $("#submit-btn");
    submitBtn.click(function(event) {
        event.preventDefault();
        var btn = $(this);
        var pk = btn.attr('data-news-id');
        var title = $("input[name='title']").val();
        var category = $("select[name='category']").val();
        var desc = $("input[name='desc']").val();
        var thumbnail = $("input[name='thumbnail']").val();
        var content = window.ue.getContent();
        var url = '';
        var str = '';
        console.log(pk);
        if (pk) {
            url = '/cms/edit_news/' + pk + '/';
            str = '新闻修改成功';
        } else {
            url = '/cms/write_news/';
            str = '新闻添加成功';
        }

        xfzajax.post({
            'url': url,
            'data': {
                'title': title,
                'category': category,
                'desc': desc,
                'thumbnail': thumbnail,
                'content': content
            },
            'success': function(result) {
                if (result['code'] === 200) {
                    xfzalert.alertSuccess(str, function() {
                        window.location.reload();
                    })
                }
            }
        });
    });
}

News.prototype.run = function() {
    this.initUEditor();
    // this.listenUploadFieldEvent();
    this.listenQiniuUploadFieldEvent();
    this.listerSubmitEvent();
};

$(function() {
    var news = new News();
    news.run();

    News.progressGroup = $('#progress-group');
});