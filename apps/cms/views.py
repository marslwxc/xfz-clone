import os
from datetime import datetime
from urllib import parse

from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.views import View
from django.views.decorators.http import require_GET, require_POST
from django.conf import settings
from django.core.paginator import Paginator
from django.utils.timezone import make_aware

from qiniu import Auth

from utils import restful
from apps.news.models import NewsCategory, News, Banner
from apps.news.serializers import BannerSerializer
from .forms import EditNewsCategoryForm, WriteNewsForm, \
                    AddBannerForm, EditBannerForm, EditNewsForm

# Create your views here.
@staff_member_required(login_url='news:index')
def index(request):
    return render(request, 'cms/index.html')


class NewsListView(View):
    def get(self,request):
        # request.GET：获取出来的所有数据，都是字符串类型
        page = int(request.GET.get('p',1))
        start = request.GET.get('start')
        end = request.GET.get('end')
        title = request.GET.get('title')
        # request.GET.get(参数,默认值)
        # 这个默认值是只有这个参数没有传递的时候才会使用
        # 如果传递了，但是是一个空的字符串，那么也不会使用默认值
        category_id = int(request.GET.get('category',0) or 0)

        newses = News.objects.select_related('category', 'author')

        if start or end:
            if start:
                start_date = datetime.strptime(start,'%Y/%m/%d')
            else:
                start_date = datetime(year=2020,month=1,day=1)
            if end:
                end_date = datetime.strptime(end,'%Y/%m/%d')
            else:
                end_date = datetime.today()
            newses = newses.filter(pub_time__range=(make_aware(start_date),make_aware(end_date)))

        if title:
            newses = newses.filter(title__icontains=title)

        if category_id:
            newses = newses.filter(category=category_id)

        paginator = Paginator(newses, 2)
        page_obj = paginator.page(page)

        context_data = self.get_pagination_data(paginator,page_obj)

        context = {
            'categories': NewsCategory.objects.all(),
            'newses': page_obj.object_list,
            'page_obj': page_obj,
            'paginator': paginator,
            'start': start,
            'end': end,
            'title': title,
            'category_id': category_id,
            'url_query': '&'+parse.urlencode({
                'start': start or '',
                'end': end or '',
                'title': title or '',
                'category': category_id or ''
            })
        }
        context.update(context_data)

        return render(request, 'cms/news_list.html', context=context)


    def get_pagination_data(self,paginator,page_obj,around_count=2):
        current_page = page_obj.number
        num_pages = paginator.num_pages

        left_has_more = False
        right_has_more = False

        if current_page <= around_count + 2:
            left_pages = range(1,current_page)
        else:
            left_has_more = True
            left_pages = range(current_page-around_count,current_page)

        if current_page >= num_pages - around_count - 1:
            right_pages = range(current_page+1,num_pages+1)
        else:
            right_has_more = True
            right_pages = range(current_page+1,current_page+around_count+1)

        return {
            # left_pages：代表的是当前这页的左边的页的页码
            'left_pages': left_pages,
            # right_pages：代表的是当前这页的右边的页的页码
            'right_pages': right_pages,
            'current_page': current_page,
            'left_has_more': left_has_more,
            'right_has_more': right_has_more,
            'num_pages': num_pages
        }


class WriteNewsView(View):
    def get(self, request):
        categories = NewsCategory.objects.all()
        context = {}
        context['categories'] = categories
        return render(request, 'cms/write_news.html', context)

    def post(self, request):
        form = WriteNewsForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data.get('title')
            desc = form.cleaned_data.get('desc')
            thumbnail = form.cleaned_data.get('thumbnail')
            content = form.cleaned_data.get('content')
            category_id = form.cleaned_data.get('category')
            category = NewsCategory.objects.get(pk=category_id)
            News.objects.create(title=title, \
                                desc=desc, \
                                thumbnail=thumbnail, \
                                content=content, \
                                category=category, \
                                author=request.user)
            return restful.ok()
        else:
            return restful.params_error(message=form.get_errors())


class EditNewsView(View):
    def get(self, request):
        news_id = request.GET.get('news_id')
        news = News.objects.get(pk=news_id)
        categories = NewsCategory.objects.all()
        context = {}
        context['news'] = news
        context['categories'] = categories
        return render(request, 'cms/write_news.html', context)

    def post(self, request):
        form = EditNewsForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data.get('title')
            desc = form.cleaned_data.get('desc')
            thumbnail = form.cleaned_data.get('thumbnail')
            content = form.cleaned_data.get('content')
            category_id = form.cleaned_data.get('category')
            pk = form.cleaned_data.get("pk")
            category = NewsCategory.objects.get(pk=category_id)
            News.objects.filter(pk=pk).update(title=title,desc=desc,thumbnail=thumbnail,content=content,category=category)
            return restful.ok()
        else:
            return restful.params_error(message=form.get_errors())


@require_POST
def delete_news(request):
    news_id = request.POST.get('news_id')
    News.objects.filter(pk=news_id).delete()
    return restful.ok()


@require_GET
def new_category(request):
    categories = NewsCategory.objects.all()
    context = {}
    context['categories'] = categories
    return render(request, 'cms/new_category.html', context)


@require_POST
def add_new_category(request):
    name = request.POST.get('name')
    exists = NewsCategory.objects.filter(name=name).exists()
    if not exists:
        NewsCategory.objects.create(name=name)
        return restful.ok()
    else:
        return restful.params_error(message="该分类已经存在")


@require_POST
def edit_news_category(request):
    form = EditNewsCategoryForm(request.POST)
    if form.is_valid():
        pk = form.cleaned_data.get('pk')
        name = form.cleaned_data.get('name')
        try:
            NewsCategory.objects.filter(pk=pk).update(name=name)
            return restful.ok()
        except:
            return restful.params_error(message="该分类不存在")
    return restful.params_error(message=form.get_error())


@require_POST
def delete_news_category(request):
    pk = request.POST.get('pk')
    try:
        NewsCategory.objects.filter(pk=pk).delete()
        return restful.ok()
    except:
        return restful.unauth_error(message='该分类不存在')


@require_POST
def upload_file(request):
    file = request.FILES.get('file')
    name = file.name
    with open(os.path.join(settings.MEDIA_ROOT,name),'wb') as fp:
        for chunk in file.chunks():
            fp.write(chunk)
    url = request.build_absolute_uri(settings.MEDIA_URL+name)
    # http://127.0.1:8000/media/abc.jpg
    return restful.result(data={'url':url})


@require_GET
def qntoken(request):
    #需要填写你的 Access Key 和 Secret Key
    access_key = settings.QINIU_ACCESSKEY
    secret_key = settings.QINIU_SECRETKEY
    #构建鉴权对象
    q = Auth(access_key, secret_key)
    #要上传的空间
    bucket_name = settings.QINIU_BUCKET_NAME
    
    token = q.upload_token(bucket_name)

    data = {}
    data['token'] = token
    return restful.result(data=data)


def banner(request):
    return render(request, 'cms/banners.html') 


def banner_list(request):
    banners = Banner.objects.all()
    serializer = BannerSerializer(banners, many=True)
    return restful.result(data=serializer.data)


def add_banner(request):
    form = AddBannerForm(request.POST)
    if form.is_valid():
        priority = form.cleaned_data.get('priority')
        image_url = form.cleaned_data.get('image_url')
        link_to = form.cleaned_data.get('link_to')
        banner = Banner.objects.create(priority=priority, \
                                        image_url=image_url, \
                                        link_to=link_to)
        return restful.result(data={'banner_id':banner.pk})
    else:
        return restful.params_error(message=form.get_errors())


def delete_banner(request):
    pk = request.POST.get('banner_id')
    Banner.objects.filter(pk=pk).delete()
    return restful.ok()


def edit_banner(request):
    form = EditBannerForm(request.POST)
    if form.is_valid():
        pk = form.cleaned_data.get('pk')
        image_url = form.cleaned_data.get('image_url')
        link_to = form.cleaned_data.get('link_to')
        priority = form.cleaned_data.get('priority')
        print(pk)
        Banner.objects.filter(pk=pk).update(image_url=image_url, \
                                            link_to=link_to, \
                                            priority=priority)
        return restful.ok()
    else:
        return restful.params_error(message=form.get_errors())