from django import forms

from apps.forms import FormMixin
from apps.news.models import News, Banner
from apps.course.models import Course


class EditNewsCategoryForm(forms.Form):
    pk = forms.IntegerField(error_messages={"required":"必须传入分类的id！"})
    name = forms.CharField(max_length=100)


class WriteNewsForm(forms.ModelForm):
    category = forms.IntegerField()

    class Meta:
        model = News
        exclude = ('pub_time', 'category', 'author')
        error_messages = {
            'title': {
                'max_length': '最多不能超过200个字',
                'required': '标题不能为空',
            },
            'desc': {
                'max_length': '最多不能超过200个字',
            }
        }


class EditNewsForm(forms.ModelForm, FormMixin):
    category = forms.IntegerField()
    pk = forms.IntegerField()
    
    class Meta:
        model = News
        exclude = ('category','author','pub_time')


class AddBannerForm(forms.ModelForm, FormMixin):
    class Meta:
        model = Banner
        fields = ('priority', 'image_url', 'link_to')


class EditBannerForm(forms.ModelForm, FormMixin):
    pk = forms.IntegerField()
    
    class Meta:
        model = Banner
        fields = ('priority', 'image_url', 'link_to')


class PubCourseForm(forms.ModelForm):
    category_id = forms.IntegerField()
    teacher_id = forms.IntegerField()

    class Meta:
        model = Course
        exclude = ('category', 'teacher')