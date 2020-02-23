function Banner() {}

Banner.prototype.loadData = function() {
    var self = this;
    xfzajax.get({
        'url': '/cms/banner_list',
        'success': function(result) {
            if (result['code'] === 200) {
                var banners = result['data'];
                for (var i = 0; i < banners.length; i++) {
                    var banner = banners[i];
                    self.createBannerItem(banner);
                }
            }
        }
    });
}

Banner.prototype.listenAddBannerEvent = function() {
    var self = this;
    var addBtn = $("#add-banner-btn");
    addBtn.click(function() {
        var bannerListGroup = $(".banner-list-group");
        var length = bannerListGroup.children().length;
        if (length >= 6) {
            window.messageBox.showInfo("最多只能添加6张轮播图！");
            return
        }
        self.createBannerItem();
    });
}

Banner.prototype.createBannerItem = function(banner) {
    var self = this;
    var tpl = template("banner-item", { 'banner': banner });
    var bannerListGroup = $(".banner-list-group");
    if (banner) {
        bannerListGroup.append(tpl);
        var bannerItem = bannerListGroup.find(".banner-item:last");
    } else {
        bannerListGroup.prepend(tpl);
        var bannerItem = bannerListGroup.find(".banner-item:first");
    }
    self.addImageSelectEvent(bannerItem);
    self.addRemoveBannerEvent(bannerItem);
    self.addSaveBannerEvent(bannerItem);
}

Banner.prototype.addImageSelectEvent = function(bannerItem) {
    var image = bannerItem.find('.thumbnail');
    image.attr('id', 'doing');
    var imageInput = bannerItem.find('.image-input');
    image.click(function() {
        imageInput.click();
    });
    imageInput.change(function() {
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
                        'next': function(response) {},
                        'error': function(response) {
                            window.messageBox.showerrors("图片长传出错")
                        },
                        'complete': function(response) {
                            window.messageBox.showInfo("图片上传完成");
                            var domain = 'http://q5ttl3pxu.bkt.clouddn.com/';
                            var filename = response.key;
                            var url = domain + filename;
                            var image = $("#doing");
                            image.attr('src', url);
                            image.attr('id', '')
                        }
                    });
                }
            }
        });
    });
}

Banner.prototype.addRemoveBannerEvent = function(bannerItem) {
    var closeBtn = bannerItem.find('.close-btn');
    closeBtn.click(function() {
        var bannerId = bannerItem.attr('data-banner-id');
        if (bannerId) {
            xfzalert.alertConfirm({
                'text': '您确定要删除这个轮播图吗?',
                'confirmCallback': function() {
                    xfzajax.post({
                        'url': '/cms/delete_banner/',
                        'data': {
                            'banner_id': bannerId
                        },
                        'success': function(result) {
                            if (result['code'] === 200) {
                                bannerItem.remove();
                                window.messageBox.showSuccess('轮播图删除才成功！');
                            }
                        }
                    });
                }
            });
        } else {
            bannerItem.remove();
        }
    });
}

Banner.prototype.addSaveBannerEvent = function(bannerItem) {
    var saveBtn = bannerItem.find('.save-btn');
    var imageTag = bannerItem.find(".thumbnail");
    var priorityTag = bannerItem.find("input[name='priority']");
    var linktoTag = bannerItem.find("input[name='link_to']");
    var prioritySpan = bannerItem.find('span[class="priority"]');
    var bannerId = bannerItem.attr("data-banner-id");
    var url = '';
    if (bannerId) {
        url = '/cms/edit_banner/';
    } else {
        url = '/cms/add_banner/';
    }
    console.log(bannerId);
    saveBtn.click(function() {
        var image_url = imageTag.attr('src');
        var priority = priorityTag.val();
        var link_to = linktoTag.val();
        xfzajax.post({
            'url': url,
            'data': {
                'image_url': image_url,
                'priority': priority,
                'link_to': link_to,
                'pk': bannerId,
            },
            'success': function(result) {
                if (result['code'] === 200) {
                    if (bannerId) {
                        window.messageBox.showSuccess('轮播图修改成功！');
                    } else {
                        bannerId = result['data']['banner_id'];
                        bannerItem.attr('data-banner-id', bannerId);
                        window.messageBox.showSuccess('轮播图添加完成！');
                    }
                    prioritySpan.text("优先级：" + priority);
                }
            }
        });
    });
};

Banner.prototype.run = function() {
    this.listenAddBannerEvent();
    this.loadData();
}

$(function() {
    var banner = new Banner();
    banner.run();
});