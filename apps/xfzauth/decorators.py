from django.shortcuts import redirect

from utils import restful


def xfz_login_required(func):
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated:
            return func(*args, **kwargs)
        else:
            if request.is_ajax():
                return restful.unauth_error(message="请先登录")
            else:
                redirect('/')
    return wrapper