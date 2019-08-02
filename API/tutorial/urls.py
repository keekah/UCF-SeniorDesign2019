"""tutorial URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from rest_framework import routers
from tutorial.quickstart import views
from tutorial.quickstart.models import Project
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


#This is where you define URL's for endpoints. They must end in a "/" and they must always have the "name" attribute
#everything else should be pretty easy to follow
urlpatterns = [
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path(r'api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path(r'api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('SubmitAssignmentOne/', views.SubmitAssignmentOne, name='SubmitAssignmentOne'),
    path('RunAlg/', views.RunAlg, name='RunAlg'),
    path('CreateUser/', views.CreateUser, name='CreateUser'),
    path('LoginUser/', views.LoginUser, name='LoginUser'),
    path('TestToken/', views.testToken, name='TestToken'),
    path('GetStudents/', views.GetStudents, name='GetStudents'),
    path('GetStudentByID/', views.GetStudentByID, name='GetStudentByID'),
    path('DeleteStudent/', views.DeleteStudent, name='DeleteStudent'),
    path('GetSchedule/', views.GetSchedule, name='GetSchedule'),
    path('SubmitProject/', views.SubmitProject, name='SubmitProject'),
    path('GetProjects/', views.GetProjects, name='GetProjects'),
    path('UploadStudentResume/', views.UploadStudentResume, name='UploadStudentResume'),
    path('DownloadStudentResume/', views.DownloadStudentResume, name='DownloadStudentResume'),
    path('GetSchedulerRunVersions/', views.GetSchedulerRunVersions, name='GetSchedulerRunVersions'),
    path('LoadPreviousRunVersion/', views.LoadPreviousRunVersion, name='LoadRunVersion'),
    path('GetStudentsMissingAssignmentOne/', views.GetStudentsMissingAssignmentOne, name='GetStudentsMissingAssignmentOne'),
    path('EditProject/', views.EditProject, name='EditProject'),
    path('Logout/', views.Logout, name='Logout'),
    path('SubmitStudentRoster/', views.SubmitStudentRoster, name='SubmitStudentRoster'),
    path('DownloadCMSProjectResource/', views.DownloadCMSProjectResource, name='DownloadCMSProjectResource'),
    path('CreateCMSProject/', views.CreateCmsProject, name='CreateCMSProject'),
    path('CreateCMSMember/', views.CreateCMSMember, name='CreateCMSMember'),
    path('GetCMSProjects/', views.GetCMSProjects, name='GetCMSProjects'),
    path('UploadCMSDesignDoc/', views.UploadCMSDesignDoc, name='UploadCMSDesignDoc'),
    path('UploadCMSFinalDoc/', views.UploadCMSFinalDoc, name='UploadCMSFinalDoc'),
    path('UploadCMSPresentation/', views.UploadCMSPresentation, name='UploadCMSPresentation'),
    path('UploadCMSConferencePaper/', views.UploadCMSConferencePaper, name='UploadCMSConferencePaper'),
    path('UploadCMSMemberPhoto/', views.UploadCMSMemberPhoto, name='UploadCMSMemberPhoto'),
    path('DownloadCMSMemberResource/', views.DownloadCMSMemberResource, name='DownloadCMSMemberResource'),
    path('CacheAlg/', views.CacheAlg, name='CacheAlg'),
    path('GetGroups/', views.GetGroups, name='GetGroups'),
    path('FinalizeScheduleVersion/', views.FinalizeScheduleVersion, name='FinalizeScheduleVersion'),
    path('ExportRunVersionCSV/', views.ExportRunVersionCSV, name='ExportRunVersionCSV'),
    #saved for if old data ever needs to be loaded
    path('UploadOldData/', views.UploadOldData, name='UploadOldData'),
    path('GetInitialGridBuild/', views.GetInitialGridBuild, name='GetInitialGridBuild'),
    path('UpdateCMSProject/', views.UpdateCMSProject, name='UpdateCMSProject'),
    path('UpdateFullCMSProject/', views.UpdateFullCMSProject, name='UpdateFullCMSProject'),
    path('DeleteCMSProject/', views.DeleteCMSProject, name='DeleteCMSProject'),
    path('DeleteCMSMember/', views.DeleteCMSMember, name='DeleteCMSMember'),
]

