function Banner() {
    this.pageWidth = 795;
    this.bannerGroup = $("#banner-group");
    this.index = 1;
    this.bannerUl = $("#banner-ul");
    this.liList = this.bannerUl.children("li");
    this.leftArrow = $(".left-arrow");
    this.rightArrow = $(".right-arrow");
    this.bannerCount = this.liList.length;
    this.pageControl = $(".page-control");
}

Banner.prototype.initBanner = function() {
    var self = this;
    var firstLi = self.liList.eq(0).clone();
    var lastLi = self.liList.eq(self.bannerCount - 1).clone();
    this.bannerUl.append(firstLi);
    this.bannerUl.prepend(lastLi);
    this.bannerUl.css({ "width": self.pageWidth * (self.bannerCount + 2), "left": -self.pageWidth });
}

Banner.prototype.initPageControl = function() {
    var self = this;
    for (var i = 0; i < self.bannerCount; i++) {
        var circle = $("<li></li>");
        self.pageControl.append(circle);
        if (i === 0) {
            circle.addClass("active");
        }
    }
    self.pageControl.css({ "width": 2 * 8 + self.bannerCount * 10 + 16 * (self.bannerCount - 1) })
}

Banner.prototype.animate = function() {
    var self = this;
    self.bannerUl.animate({ "left": -795 * self.index }, 500);
    var index = self.index;
    if (index === 0) {
        index = self.bannerCount - 1;
    } else if (index === self.bannerCount + 1) {
        index = 0;
    } else {
        index = self.index - 1;
    }
    self.pageControl.children("li").eq(index).addClass("active").siblings().removeClass("active");
}

Banner.prototype.loop = function() {
    var self = this;
    this.timer = setInterval(function() {
        if (self.index >= self.bannerCount + 1) {
            self.bannerUl.css({ "left": -self.pageWidth });
            self.index = 2;
        } else {
            self.index++;
        }
        self.animate();
    }, 2000);
}

Banner.prototype.listenArrowClick = function() {
    var self = this;
    this.leftArrow.click(function() {
        if (self.index == 0) {
            self.bannerUl.css({ "left": -self.bannerCount * self.pageWidth });
            self.index = self.bannerCount - 1;
        } else {
            self.index--;
        }
        self.animate();
    });
    this.rightArrow.click(function() {
        if (self.index == self.bannerCount + 1) {
            self.bannerUl.css({ "left": -self.pageWidth });
            self.index = 2;
        } else {
            self.index++;
        }
        self.animate();
    })
}

Banner.prototype.listenBannerHover = function() {
    var self = this;
    this.bannerGroup.hover(function() {
        clearInterval(self.timer)
    }, function() {
        self.loop();
    });
}

Banner.prototype.listenPageControl = function() {
    var self = this;
    this.pageControl.children("li").each(function(index, obj) {
        $(obj).click(function() {
            self.index = index + 1;
            self.animate();
        });
    });
}

Banner.prototype.run = function() {
    this.initBanner();
    this.initPageControl();
    this.loop();
    this.listenBannerHover();
    this.listenArrowClick();
    this.listenPageControl();
}

function Index() {
    this.loadMoreBtn = $("#load-more-btn");
    this.page = 2;
    this.category_id = 0;

    template.defaults.imports.timeSince = function(dateValue) {
        var date = new Date(dateValue);
        var datets = date.getTime();
        var nowts = (new Date()).getTime();
        var timestamp = (nowts - datets) / 1000;
        if (timestamp < 60) {
            return '刚刚'
        } else if (timestamp >= 60 && timestamp < 60 * 60) {
            minutes = parseInt(timestamp / 60);
            return minutes + ' 分钟前'
        } else if (timestamp >= 60 * 60 && timestamp < 60 * 60 * 24) {
            hours = parseInt(timestamp / 60 / 60);
            return hours + ' 小时前'
        } else if (timestamp >= 60 * 60 * 24 && timestamp < 60 * 60 * 24 * 30) {
            days = parseInt(timestamp / 60 / 60 / 24);
            return days + ' 天前'
        } else {
            var year = date.getFullYear();
            var month = date.getMonth();
            var day = date.getDay();
            var hour = date.getHours();
            var minute = date.getMinutes();
            return year + "/" + month + "/" + day + " " + hour + ":" + minute
        }
    }
}

Index.prototype.listenLoadMoreEvent = function() {
    var self = this;
    self.loadMoreBtn.click(function() {
        xfzajax.get({
            'url': '/news/list/',
            'data': {
                'page': self.page,
                'category_id': self.category_id,
            },
            'success': function(result) {
                if (result['code'] === 200) {
                    var newses = result['data'];
                    if (newses.length > 0) {
                        var tpl = template("news-item", { 'newses': newses });
                        var ul = $(".list-inner-group");
                        ul.append(tpl);
                        self.page += 1;
                    } else {
                        self.loadMoreBtn.hide();
                    }
                }
            }
        });
    });
}

Index.prototype.listenCatporySwitchEvent = function() {
    var self = this;
    var ulGroup = $('.list-tab');
    ulGroup.children().click(function() {
        var li = $(this);
        var category_id = li.attr("data-category");
        var page = 1;
        xfzajax.get({
            'url': '/news/list/',
            'data': {
                'page': page,
                'category_id': category_id,
            },
            'success': function(result) {
                if (result['code'] === 200) {
                    var newses = result['data'];
                    var tpl = template('news-item', { 'newses': newses });
                    var newListGroup = $(".list-inner-group");
                    newListGroup.empty();
                    newListGroup.append(tpl);
                    self.page = 2;
                    self.category_id = category_id;
                    li.addClass('active').siblings().removeClass('active');
                    self.loadMoreBtn.show();
                }
            }
        });
    });
}

Index.prototype.run = function() {
    this.listenLoadMoreEvent();
    this.listenCatporySwitchEvent();
}

$(function() {
    var banner = new Banner();
    banner.run();

    var index = new Index();
    index.run();
});