from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission, ContentType

from apps.news.models import News, NewsCategory, Banner, Comment
from apps.course.models import Course, CourseCategory, Teacher


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        # 新闻组
        edit_content_types = [
            ContentType.objects.get_for_model(News),
            ContentType.objects.get_for_model(NewsCategory),
            ContentType.objects.get_for_model(Banner),
            ContentType.objects.get_for_model(Comment),
        ]
        edit_permissions = Permission.objects.filter(content_type__in=edit_content_types)
        edit_group = Group.objects.create(name='编辑')
        edit_group.permissions.set(edit_permissions)
        # 课程组
        # 管理员组
        # 超级管理员