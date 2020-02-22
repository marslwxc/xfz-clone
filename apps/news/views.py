from django.shortcuts import render
from django.conf import settings

from utils import restful
from apps.xfzauth.decorators import xfz_login_required
from .forms import CommentForm
from .models import News, NewsCategory, Comment, Banner
from .serializers import NewsCategorySerializer, NewsSerializer, CommentSerializer

# Create your views here.
def index(request):
    count = settings.ONE_PAGE_NEWS_COUNT
    newses = News.objects.select_related('category', 'author').all()[:count]
    categories = NewsCategory.objects.all()
    banners = Banner.objects.all()
    context = {}
    context['newses'] = newses
    context['categories'] = categories
    context['banners'] = banners
    return render(request, 'news/index.html', context)


def news_list(request):
    page = int(request.GET.get('page', 1))
    category_id = int(request.GET.get('category_id', 0))

    start = (page - 1) * settings.ONE_PAGE_NEWS_COUNT
    end = start + settings.ONE_PAGE_NEWS_COUNT

    if category_id == 0:
        newses = News.objects.select_related('category', 'author').all()[start:end]
    else:
        newses = News.objects.select_related('category', 'author').filter(category__id=category_id)[start:end]
    serializer = NewsSerializer(newses, many=True)
    data = serializer.data
    return restful.result(data=data)


def news_detail(request, news_id):
    news = News.objects.select_related('category', 'author') \
                        .prefetch_related('comments__author') \
                        .get(id=news_id)
    context = {}
    context['news'] = news
    return render(request, 'news/news_detail.html', context=context)


@xfz_login_required
def public_comment(request):
    form = CommentForm(request.POST)
    if form.is_valid():
        content = form.cleaned_data.get('content')
        news_id = form.cleaned_data.get('news_id')
        news = News.objects.get(pk=news_id)
        comment = Comment.objects.create(content=content, \
                                        news=news, \
                                        author=request.user)
        serizlize = CommentSerializer(comment)
        return restful.result(data=serizlize.data)
    else:
        return restful.params_error(message=form.get_errors())


def search(request):
    return render(request, 'search/search.html')