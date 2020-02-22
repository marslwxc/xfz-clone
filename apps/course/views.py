from django.shortcuts import render

from .models import Course, CourseCategory

# Create your views here.
def course_index(request):
    courses = Course.objects.all()
    coursecategories = CourseCategory.objects.all()
    context = {}
    context['courses'] = courses
    context['coursecategories'] = coursecategories
    return render(request, 'course/course_index.html', context)

def course_detail(request, course_id):
    return render(request, 'course/course_detail.html')