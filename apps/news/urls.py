# conding: utf-8
from django.urls import path

from . import views

app_name = 'news'

urlpatterns = [
    path('', views.index, name="index"),
    path('news/<int:news_id>/', views.news_detail, name='news_detail'),
    # path('search/', views.search, name="search"),
    path('news/list/', views.news_list, name='news_list'),
    path('news/public_comment/', views.public_comment, name='public_comment'),
]