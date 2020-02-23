// 点击登录按钮，弹出模态对话框
// $(function() {
//     $(".signin-btn").click(function() {
//         $(".mask-wrapper").show();
//     });

//     $(".close-btn").click(function() {
//         $(".mask-wrapper").hide();
//     });
// });

// $(function() {
//     $(".switch").click(function() {
//         var scrollWrapper = $(".scroll-wrapper");
//         var currentLeft = scrollWrapper.css("left");
//         currentLeft = parseInt(currentLeft);
//         if (currentLeft < 0) {
//             scrollWrapper.animate({ 'left': '0' });
//         } else {
//             scrollWrapper.animate({ 'left': '-400px' })
//         }
//     });
// });

function Auth() {
    this.signinBtn = $(".signin-btn");
    this.signupBtn = $(".signup-btn");
    this.closeBtn = $(".close-btn");
    this.maskWrapper = $(".mask-wrapper");
    this.switch = $(".switch");
    this.scrollWrapper = $(".scroll-wrapper");
    this.smsCaptchaBtn = $(".sms-captcha-btn");
}

Auth.prototype.showEvent = function() {
    var self = this;
    self.maskWrapper.show();
}

Auth.prototype.hideEvent = function() {
    var self = this;
    self.maskWrapper.hide();
}

Auth.prototype.smsSuccessEvent = function() {
    var self = this;
    messageBox.showSuccess("短信验证码发送成功！");
    self.smsCaptchaBtn.addClass('disabled');
    var count = 60;
    self.smsCaptchaBtn.unbind('click');
    var timer = setInterval(function() {
        self.smsCaptchaBtn.text(count + 's');
        count--;
        if (count <= 0) {
            clearInterval(timer);
            self.smsCaptchaBtn.removeClass('disabled');
            self.smsCaptchaBtn.text("发送验证码");
            self.listenSmsCaptchaEvent();
        }
    }, 1000);
}

Auth.prototype.listenShowHideEvent = function() {
    var self = this;
    self.signinBtn.click(function() {
        self.showEvent();
        self.scrollWrapper.css({ "left": 0 });
    });

    self.signupBtn.click(function() {
        self.showEvent();
        self.scrollWrapper.css({ "left": -400 });
    });

    self.closeBtn.click(function() {
        self.hideEvent();
    });
}

Auth.prototype.listenSwitchEvent = function() {
    var self = this;
    self.switch.click(function() {
        var currentLeft = self.scrollWrapper.css("left");
        currentLeft = parseInt(currentLeft);
        if (currentLeft < 0) {
            self.scrollWrapper.animate({ 'left': '0' });
        } else {
            self.scrollWrapper.animate({ 'left': '-400px' });
        }
    });
}

Auth.prototype.listenSigninEvent = function() {
    var self = this;
    var signinGroup = $('.signin-group');
    var telephoneInput = signinGroup.find("input[name='telephone']");
    var passwordInput = signinGroup.find("input[name='password']");
    var rememberInput = signinGroup.find("input[name='remember']");

    var submitBtn = signinGroup.find(".submit-btn");
    submitBtn.click(function() {
        var telephone = telephoneInput.val();
        var password = passwordInput.val();
        var remember = rememberInput.prop("checked");

        xfzajax.post({
            'url': '/account/login/',
            'data': {
                'telephone': telephone,
                'password': password,
                'remember': remember ? 1 : 0
            },
            'success': function(result) {
                if (result['code'] == 200) {
                    self.hideEvent();
                    window.location.reload();
                } else {
                    var messageObject = result['message'];
                    if (typeof messageObject == 'string' || messageObject.constructor == String) {
                        window.messageBox.show(messageObject);
                    } else {
                        // {"password":['密码最大长度不能超过20为！','xxx'],"telephone":['xx','x']}
                        for (var key in messageObject) {
                            var messages = messageObject[key];
                            var message = messages[0];
                            window.messageBox.show(message);
                        }
                    }
                }
            },
            'fail': function(error) {
                console.log(error);
            }
        });
    });
}

Auth.prototype.listenSignupEvent = function() {
    var signupGroup = $(".signup-group");
    var submitBtn = signupGroup.find(".submit-btn");
    submitBtn.click(function(event) {
        event.preventDefault();
        var telephoneInput = signupGroup.find("input[name='telephone']");
        var usernameInput = signupGroup.find("input[name='username']");
        var imgCaptchaInput = signupGroup.find("input[name='img_captcha']");
        var password1Input = signupGroup.find("input[name='password1']");
        var password2Input = signupGroup.find("input[name='password2']");
        var smsCaptchaInput = signupGroup.find("input[name='sms_captcha']");

        var telephone = telephoneInput.val();
        var username = usernameInput.val();
        var img_captcha = imgCaptchaInput.val();
        var password1 = password1Input.val();
        var password2 = password2Input.val();
        var sms_captcha = smsCaptchaInput.val();

        xfzajax.post({
            'url': "/account/register/",
            'data': {
                'telephone': telephone,
                'username': username,
                'img_captcha': img_captcha,
                'password1': password1,
                'password2': password2,
                'sms_captcha': sms_captcha
            },
            'success': function(result) {
                window.location.reload();
            }
        });
    });
}

Auth.prototype.listenImgCaptchaEvent = function() {
    var imgCaptcha = $(".img-captcha");
    imgCaptcha.click(function() {
        imgCaptcha.attr("src", '/account/img_captcha/' + '?random=' + Math.random())
    });
}

Auth.prototype.listenSmsCaptchaEvent = function() {
    var self = this;
    var telephoneInput = $(".signup-group input[name='telephone']");
    self.smsCaptchaBtn.click(function() {
        var telephone = telephoneInput.val();
        if (!telephone) {
            messageBox.showInfo('请输入手机号码！');
        } else {
            xfzajax.get({
                'url': '/account/sms_captcha/',
                'data': {
                    'telephone': telephone
                },
                'success': function(result) {
                    if (result['code'] == 200) {
                        self.smsSuccessEvent();
                    }
                },
                'fail': function(error) {
                    console.log(error);
                }
            });
        }
    });
}

Auth.prototype.run = function() {
    var self = this;
    self.listenShowHideEvent();
    self.listenSwitchEvent();
    self.listenSigninEvent();
    self.listenImgCaptchaEvent();
    self.listenSmsCaptchaEvent();
    self.listenSignupEvent();
}

$(function() {
    var auth = new Auth();
    auth.run();
});