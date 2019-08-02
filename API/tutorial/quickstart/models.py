from django.db import models
from django.utils.timezone import now

#Year and Term are the year and term a project or student wishes to take SD2. CurrentYear and CurrentTerm are for datetime.now()

class Project(models.Model):
    Sponsor = models.CharField(max_length=100)
    Sponsor2 = models.CharField(max_length=100, blank=True)
    ProjectName = models.CharField(max_length=100)
    Year = models.CharField(max_length=100)
    Term = models.CharField(max_length=100)
    Min = models.IntegerField()
    Max = models.IntegerField()
    CanDoBoth = models.BooleanField(blank=True, default=False)
    CurrentYear = models.CharField(max_length=100)
    CurrentTerm = models.CharField(max_length=100)
    GroupNumber = models.IntegerField(blank=True, default=0)

class Student(models.Model):
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    knightsEmail = models.CharField(max_length=100)
    term = models.CharField(max_length=100, blank=True)
    year = models.CharField(max_length=4)
    UCFID = models.IntegerField(blank=True, default=0)
    overallGPA = models.FloatField(blank=True, default=0)
    majorGPA = models.FloatField(blank=True, default=0)
    intrestArea = models.TextField(blank=True)
    technicalSkills = models.TextField(blank=True)
    knownLanguages = models.TextField(blank=True)
    workExperience = models.TextField(blank=True)
    resumeLink = models.TextField(blank=True, default="N/A")
    authID = models.IntegerField()
    CanDoBoth = models.BooleanField(blank=True, default=False)
    Bootcamp = models.BooleanField(blank=True, default=False)
    CurrentTerm = models.CharField(max_length=100)
    CurrentYear = models.CharField(max_length=4)
    OpenQuestion = models.TextField(blank=True, default="")

class StudentProjectRanking(models.Model):
    StudentID = models.IntegerField()
    ProjectID = models.IntegerField()
    Ranking = models.IntegerField()

class Schedule(models.Model):
    DateCreated = models.DateField(default=now)
    TotalStudents = models.IntegerField()
    Term = models.CharField(max_length=100)
    First = models.IntegerField()
    Second = models.IntegerField()
    Third = models.IntegerField()

class ScheduleProject(models.Model):
    ProjectName = models.CharField(max_length=100)
    NumStudents = models.IntegerField()
    Priority = models.IntegerField()
    ScheduleID = models.IntegerField()

class ScheduleStudent(models.Model):
    FName = models.CharField(max_length=100)
    LName = models.CharField(max_length=100)
    Summer = models.IntegerField(blank=True, default=0)
    Fall = models.IntegerField(blank=True, default=0)
    Spring = models.IntegerField(blank=True, default=0)
    Rank = models.IntegerField()
    ScheduleProjectID = models.IntegerField()

class FinalSchedule(models.Model):
    Year = models.CharField(max_length=100)
    Term = models.CharField(max_length=100)
    ScheduleVersion = models.CharField(max_length=100)

#class User(models.Model):
 #   Auth_UserID = models.IntegerField()
  #  FName = models.CharField(max_length=100)
   # LName = models.CharField(max_length=100)
    #Email = models.CharField(max_length=100)
   # GroupID = models.IntegerField()
    #AssignmentOne = models.BooleanField(default=False)
class CMSProject(models.Model):
    group_number = models.IntegerField()
    project_name = models.CharField(max_length=100)
    sponsor = models.CharField(max_length=100)
    sponsor2 = models.CharField(blank=True, max_length=100)
    group_size = models.IntegerField()
    year = models.CharField(max_length=100)
    term = models.CharField(max_length=100)
    design_doc_url = models.CharField(blank=True, max_length=100)
    final_doc_url = models.CharField(blank=True, max_length=100)
    presentation_url = models.CharField(blank=True, max_length=100)
    conference_paper_url = models.CharField(blank=True, max_length=100)
    senior_design1 = models.BooleanField(default=False)
    project_description = models.TextField(blank=True, default="")
    keywords = models.TextField(blank=True, default="")


class CMSMembers(models.Model):
    project_id = models.IntegerField()
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.CharField(max_length=100)
    photo = models.CharField(blank=True, max_length=100)

class  LoadedSchedulerRunVersion(models.Model):
    Version = models.TextField()
