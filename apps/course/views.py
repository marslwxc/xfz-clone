from django.shortcuts import render

from .models import Course, CourseCategory, Teacher

# Create your views here.
def course_index(request):
    courses = Course.objects.all()
    coursecategories = CourseCategory.objects.all()
    context = {}
    context['courses'] = courses
    context['coursecategories'] = coursecategories
    return render(request, 'course/course_index.html', context)

def course_detail(request, course_id):
    course = Course.objects.select_related('category', 'teacher').get(pk=course_id)
    context = {}
    context['course'] = course
    return render(request, 'course/course_detail.html', context)