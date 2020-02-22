from django.urls import path

from . import views
from . import course_views


app_name = 'cms'

urlpatterns = [
    path('', views.index, name='index'),
    path('news_list/',views.NewsListView.as_view(),name='news_list'),
    path('write_news/', views.WriteNewsView.as_view(), name='write_news'),
    path('edit_news/', views.EditNewsView.as_view(), name='edit_news'),
    path('delete_news/', views.delete_news, name='delete_news'),

    path('new_category/', views.new_category, name="new_category"),
    path('add_new_category/', views.add_new_category, name='add_new_category'),
    path('edit_news_category/', views.edit_news_category, name="edit_news_categoty"),
    path('delete_news_category/', views.delete_news_category, name="delete_news_category"),

    path('qntoken/', views.qntoken, name='qntoken'),
    path('upload_file/', views.upload_file, name='upload_file'),

    path('banners/', views.banner, name="banners"),
    path('banner_list/', views.banner_list, name='banner_list'),
    path('add_banner/', views.add_banner, name='add_banner'),
    path('delete_banner/', views.delete_banner, name='delete_banner'),
    path('edit_banner/', views.edit_banner, name='edit_banner'),

    path('pub_course/', course_views.PubCourse.as_view(), name='pub_course'),
]