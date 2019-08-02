from django.contrib.auth.models import User, Group
from tutorial.quickstart.models import Project, Student, StudentProjectRanking, Schedule, ScheduleProject, ScheduleStudent, CMSProject, CMSMembers, FinalSchedule, LoadedSchedulerRunVersion
from rest_framework import viewsets
from tutorial.quickstart.serializers import UserSerializer, GroupSerializer
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
import json
import sys, os, datetime
from django.utils.timezone import now
import random
import string 
import smtplib
from email.mime.text import MIMEText
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password
from tutorial.quickstart.helpers import GetCurrentTerm, ConvertAlgFileToJson, BuildInitialGrid, RunBefore, ConvertGridJsonToAlgJson, VerifyProjectsAreUpdated
from django.core import serializers
import glob, csv, traceback
from io import TextIOWrapper
#import names
import random

#Summary:Creates a new project for the Scheduler. Calling this after students have submitted assignment one is useless since they won't have a project ranking
#Input: Check anything with data['{fieldName}']
#Output: 200 on succ 400 on fail
@csrf_exempt
def SubmitProject(request):
    try:
        data = json.loads(request.body)
        try:
            Sponsor2 = data["sponsor2"]
        except:
            Sponsor2 = None

        if len(data["term"]) > 1:
            Term = data["term"][0]
            CanDoBoth = True
        else:
            Term = data["term"][0].lower()
            CanDoBoth = False

        Sponsor = data["sponsor"]
        ProjectName = data["projectName"]
        Year = data["year"]
        Min = data["min"]
        Max = data["max"]

        query = Project.objects.filter(CurrentYear=(now().year), CurrentTerm=GetCurrentTerm())
        groupNumber = len(query) + 1
        query2 = Project(Sponsor=Sponsor, Sponsor2=Sponsor2, ProjectName=ProjectName,
                        Year=Year, Term=Term.lower(), Min=Min, Max=Max, CanDoBoth=CanDoBoth,
                        CurrentYear=str(now().year), CurrentTerm=GetCurrentTerm(), GroupNumber=groupNumber)
        query2.save()
        
        return HttpResponse(status=200)

    except Exception as e:

        return HttpResponse(status=400, content=json.dumps(str(e)))
#Summary: Gets projects for the sent current year or term. This allows admin to get projects from any term or year.
#Input: Check anything from data['{fieldName}']
#Output: list of projects on succ 400 on fail
@csrf_exempt
def GetProjects(request):
    try:
        data = json.loads(request.body)
        Year = data["year"]
        Term = data["term"]
        query = Project.objects.filter(CurrentYear=Year, CurrentTerm=Term)
        ret = {}
        results = []
        for project in query:
            tempProject = {}
            tempProject["Sponsor"] = project.Sponsor
            tempProject["Sponsor2"] = project.Sponsor2
            tempProject["ProjectName"] = project.ProjectName
            tempProject["Year"] = project.Year
            tempProject["Term"] = project.Term
            tempProject["Min"] = project.Min
            tempProject["Max"] = project.Max
            tempProject["CanDoBoth"] = project.CanDoBoth
            tempProject["ID"] = project.id
            tempProject["GroupNumber"] = project.GroupNumber
            results.append(tempProject)

        ret['results'] = results

        return HttpResponse(status=200, content=json.dumps(ret))

    except Exception as e:

        return HttpResponse(status=400, content=json.dumps(str(e)))

#Summary: Edits the project sent. you need to send all fields, even if they arent changed.
#Input: check anything using data['{fieldName}']
#Output: 200ok on succ 400 on fail
@csrf_exempt
def EditProject(request):
    try:
        data = json.loads(request.body)
        ID = data["ID"]
        query = Project.objects.get(id=ID)
        if len(data["term"]) > 1:
            Term = data["term"][0].lower()
            CanDoBoth = True
        else:
            Term = data["term"][0].lower()
            CanDoBoth = False
        query.Sponsor = data['sponsor']
        query.Sponsor2 = data['sponsor2']
        query.ProjectName = data['projectName']
        query.Year = data['year']
        query.Term = data['term']
        query.Min = data['min']
        query.Max = data['max']
        query.CanDoBoth = CanDoBoth
        query.save()
        return HttpResponse(status=200)

    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))

#Summary: Submits assignment one for the sent student ID. I inially had ID cache'd from login, but the front-end would send a diffrent session ID on every call for some reason
#Input: check anything using data['{fieldName}']
#Output: 200ok on succ 400 on fail
@csrf_exempt
def SubmitAssignmentOne(request):
    try:
        data = json.loads(request.body)

        if len(data["term"]) > 1:
            term = data["term"][0].lower()
            CanDoBoth = True
        else:
            term = data["term"].lower()
            CanDoBoth = False
        sessionID = data['ID']
        if(sessionID == None):
            return HttpResponse(status=400)
        query = Student(firstName=data['firstName'], lastName=data['lastName'], knightsEmail=data['knightsEmail'],
                               UCFID=data['UCFID'], overallGPA=data['overallGPA'], majorGPA=data['majorGPA'],
                               term=term, intrestArea=data['interestArea'], technicalSkills=data['technicalSkills'],
                               knownLanguages=data['knownLanguages'], workExperience=data['workExperience'], authID=sessionID,
                               year=data['year'], CanDoBoth=CanDoBoth, Bootcamp=data["bootcamp"], CurrentYear=str(now().year),
                               CurrentTerm=GetCurrentTerm(), OpenQuestion=data['OpenQuestion'])
        query.save()
        i = 1
        for obj in data["studentRanking"]:
            project = Project.objects.get(ProjectName=obj["ProjectName"])
            query2 = StudentProjectRanking(StudentID=query.id, ProjectID=project.id, Ranking=obj["priority"])
            query2.save()
            i += 1

        return HttpResponse(status=200)
    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))

#Summary: Creates users from a list of emails. This function creates their unique password and initializes the user
#Summary: This uses the mailing account made on gmail. Info is in the server.login()
#Input: check anything using data['{fieldName}']
#Output: 200ok on succ or 400 on fail
@csrf_exempt
def CreateUser(request):
    try:
        data = json.loads(request.body)
        emails = data['emails']
        smtp_server = "smtp.gmail.com:587"
        server = smtplib.SMTP(smtp_server)
        server.starttls()
        server.login('ucfsd1scheduler@gmail.com', 'Group4!_')

        for email in emails:
            try:
                user = User.objects.get(email=email)
                user = 1
            except:
                user = 0
            if user == 1:
                return HttpResponse(status=400, content="User has already been added")
            else:
                letters = string.ascii_letters
                password = ''.join(random.choice(letters) for i in range(8))
                query = User(email=email, password=make_password(password, "axbxc4"), username=email)
                query.save()
                subject = 'You have been added to the UCF Senior Design 1 Scheduler'
                body = "Please navigate to [http://10.171.204.211:8080/] and complete the account creation process.\nUsername: {0}\nPassword: {1}".format(email, password)
                SendEmail(email, subject, body, server)
        server.quit()
        return HttpResponse(status=200)   
    except Exception as e:
        return HttpResponse(status=400, content=json.dumps(str(e)))

#Summary: Sends an email using the sent mail server
#Input: self explainitory
#Output: True on succ False on fail
def SendEmail(email, subject, body, server):
    try:
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = 'ucfsd1scheduler@gmail.com'
        msg['To'] = email

        server.send_message(msg)
        return True
    except Exception as e:
        print(str(e))
        return False

#Summary: logs in the user sent
#Input: check anything using data['{fieldName}']
#Output: users details on succ 400 on fail
@csrf_exempt
def LoginUser(request):
    try:
        data = json.loads(request.body)
        email = data['email'].lower()
        password = data['password']

        try:
            hashedPassword = make_password(password, "axbxc4")
            user = User.objects.get(email=email, password=hashedPassword)
            student = Student.objects.filter(authID=user.id)
            token = RefreshToken.for_user(user)
            userDetails = {}
            if(user.is_staff):
                admin = 1
            else:
                admin = 0

            if not student:
                userDetails['FirstName'] = user.first_name
                userDetails['LastName'] = user.last_name
                userDetails['Email'] = user.email
                userDetails['ID'] = user.id
                userDetails['Admin'] = admin
                userDetails['Submitted'] = 0

            else:
                userDetails['FirstName'] = student[0].firstName
                userDetails['LastName'] = student[0].lastName
                userDetails['Email'] = user.email
                userDetails['ID'] = user.id
                userDetails['Admin'] = admin
                userDetails['Submitted'] = 1

            userDetails['Token'] = str(token.access_token)
            request.session['UserID'] = user.id
            request.session.modified = True
            return HttpResponse(status=200, content=json.dumps(userDetails))
        except Exception as e :
            return HttpResponse(status=400, content=json.dumps(str(e)))

    except Exception as e:
        return HttpResponse(status=400, content=json.dumps(str(e)))

#Summary: This is a test function. Use it to initialize any amount of projects and users. Good for testing. Takes foreeeeeeever to run if you add more than 50 students
#Input: 
#Output:
@csrf_exempt
def testToken(request):
    try:
        projectList = []
        y = 0
        while(y < 44):
            Sponsor = names.get_full_name()
            Sponsor2= names.get_full_name()
            ProjectName = Sponsor + "'s Cool Project"
            Year = "2020"
            Term = "spring"
            CurrentYear = "2019"
            CurrentTerm = "fall"
            GroupNumber = y + 1
            Min = 3
            Max = 5
            query3 = Project(Sponsor=Sponsor, Sponsor2=Sponsor2, ProjectName=ProjectName, Year=Year, Term=Term,
                             CurrentTerm=CurrentTerm, CurrentYear=CurrentYear, GroupNumber=GroupNumber, Min=Min,
                             Max=Max)
            query3.save()
            projectList.append(query3)
            y+=1
        i = 1
        while(i < 201):
            email = "{}@knights.uccf.edu".format(str(i))
            letters = string.ascii_letters
            password = ''.join(random.choice(letters) for i in range(8))
            query = User(email=email, password=make_password(password, "axbxc4"), username=email)
            query.save()
            authID = query.pk
            firstName = names.get_first_name()
            lastName = names.get_last_name()
            term = "spring"
            year = "2020"
            ucfid = round(random.uniform(1000000, 9999999), 2)
            overallGPA = round(random.uniform(2.2, 4.0), 2)
            majorGPA = round(random.uniform(2.2, 4.0), 2)
            intrestArea = "Taking Senior Design 1"
            technicalSkills = "Linux"
            knownLanguages = "Python, C#, and C++"
            workExperience = "Three Years of C++ programming"

            if(round(random.uniform(0, 1),1) == 1):
                bootcamp = True
            else:
                bootcamp = False

            CurrentYear="2019"
            CurrentTerm="fall"

            query2 = Student(firstName=firstName, lastName=lastName, knightsEmail=email, term=term, year=year, 
                             UCFID=ucfid, overallGPA=overallGPA, majorGPA=majorGPA, intrestArea=intrestArea, technicalSkills=technicalSkills,
                             knownLanguages=knownLanguages, workExperience=workExperience, authID=authID, Bootcamp=bootcamp,
                             CurrentTerm=CurrentTerm, CurrentYear=CurrentYear)
            query2.save()
            randList = random.sample(range(1, 45), 44)
            randPrj = random.sample(range(0, 44), 44)
            for prj in randPrj:
                ID = projectList[prj].pk
                stdID = query2.pk
                if(randList[prj] > 10):
                    ranking = 20
                else:
                    ranking = randList[prj]
                query4 = StudentProjectRanking(StudentID=stdID, ProjectID=ID, Ranking=ranking)
                query4.save()
            i+=1

        return HttpResponse(status=200)
    except Exception as e:
        return HttpResponse(status=400, content=json.dumps(str(e)))

#Summary: Runs the algorithm from the sent input. Also caches the pre alg data to be sent later if needed.
#Input: check anything using data['{fieldName}']
#Output: massive json list of all the projects and students
@csrf_exempt
def RunAlg(request):
    try:
        #print(os.getcwd())
        data = json.loads(request.body)
        sentYear = data['year']
        sentTerm = data['term'].lower()
        cacheObj = {}
        cacheObj['projectList'] = data['Projects']
        cacheObj['studentList'] = data['Students']
        cacheObj['term'] = sentTerm
        cacheObj['runBefore'] = RunBefore(sentYear, sentTerm)
        cacheObj = VerifyProjectsAreUpdated(cacheObj)
        cacheObj = ConvertGridJsonToAlgJson(cacheObj)

        cachePath = "tutorial/quickstart/Scheduler/Cache/{}/{}".format(sentYear, sentTerm)

        if not os.path.exists(cachePath):
            os.makedirs(cachePath)
        
        cachePath = cachePath + "/cache.txt"

        with open(cachePath, "w+") as f:
                f.write(json.dumps(cacheObj))

        #cmdString = "python tutorial/quickstart/Scheduler/scheduler.py tutorial/quickstart/Scheduler/input3.txt {} {}".format(sentYear, sentTerm)
        cmdString = "python tutorial/quickstart/Scheduler/scheduler.py {} {} {}".format(cachePath, sentYear, sentTerm)

        listFileString = "tutorial/quickstart/Scheduler/Schedule_Runs/{}/{}".format(sentYear, sentTerm)
        if not os.path.exists(listFileString):
            os.makedirs(listFileString)
        listFileString = listFileString + "/*"
        os.system(cmdString)
        list_of_files = glob.glob(listFileString) # * means all if need specific format then *.csv
        latest_file = max(list_of_files, key=os.path.getctime)
        ret = ConvertAlgFileToJson(latest_file, sentYear, sentTerm)
        request.session['CurrentScheduleVersion'] = ret
        return HttpResponse(status=200, content=ret)
    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))

#Summary: caches the version so changes can be saved without running the alg. I dont think the frontend uses this even though it was requested by them -_-
#Input: check anything using data['{fieldName}']
#Output: 200 ok on succ 400 on fail
@csrf_exempt
def CacheAlg(request):
    try:
        data = json.loads(request.body)
        sentYear = data['year']
        sentTerm = data['term'].lower()
        version = data['version']
        cacheObj = {}
        cacheObj['projectList'] = data['Projects']
        cacheObj['studentList'] = data['Students']
        cacheObj['term'] = sentTerm
        split = version.split(".")
        base = str(split[0]) + "-saved." + str(split[1])

        cachePath = "tutorial/quickstart/Scheduler/Schedule_Runs/{}/{}/{}".format(sentYear, sentTerm, base)

        with open(cachePath, "w+") as f:
                f.write(json.dumps(cacheObj))

        return HttpResponse(status=200)
    except Exception as e:
        return HttpResponse(status=400, content=json.dumps(str(e)))

#Summary: If a schedule exists already, send that. else build an inital grid and send that
#Input: check anything using data['{fieldName}']
#Output: massive json list of projects and students. May be assigned or unassigned based on when this is called
@csrf_exempt
def GetSchedule(request):
    try:
        data = json.loads(request.body)
        sentYear = data['year']
        sentTerm = data['term'].lower()
        listFileString = "tutorial/quickstart/Scheduler/Schedule_Runs/{}/{}".format(sentYear, sentTerm)

        if not os.path.exists(listFileString):
            ret = BuildInitialGrid(sentYear, sentTerm)
            if ret is None:
                return HttpResponse(status=400, content="No students or no projects in sent year / term")
            else:
                return HttpResponse(status=200, content=ret)

        listFileString = listFileString + "/*"
        list_of_files = glob.glob(listFileString) # * means all if need specific format then *.csv
        latest_file = max(list_of_files, key=os.path.getctime)
        ret = ConvertAlgFileToJson(latest_file, sentYear, sentTerm, getScheduleBit=0)
        request.session['CurrentScheduleVersion'] = ret
        return HttpResponse(status=200, content=ret)
        
    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))

#Summary: gets students with the sent current year and current term
#Input: check anything using data['{fieldName}']
#Output: list of students
@csrf_exempt
def GetStudents(request):
    try:
        data = json.loads(request.body)
        year = data['year']
        term = data['term']
        studentList = Student.objects.filter(CurrentYear=year, CurrentTerm=term.lower())
        if not studentList:
            return HttpResponse(status=400)
        else:
            ret = serializers.serialize('json', studentList)
            return HttpResponse(status=200, content=ret, content_type="application/json")

    except Exception as e:
        return HttpResponse(status=400, content=json.dumps(str(e)))

#Summary: deletes the selected student based on id
#Input: check anything using data['{fieldName}']
#Output: 200 or 400
@csrf_exempt
def DeleteStudent(request):
    try:
        data = json.loads(request.body)
        IDs = data['IDs']
        for ID in IDs:
            student = Student.objects.filter(authID=ID)
            if not student:
                return HttpResponse(status=400)
            else:
                Student.objects.get(authID=ID).delete()
        return HttpResponse(status=200)
    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))

#Summary: This is for grabbing the details of a specific student. Used mostly by the grid
#Input: check anything using data['{fieldName}']
#Output: student details
@csrf_exempt
def GetStudentByID(request):
    try:
        data = json.loads(request.body)
        ID = data['ID']
        studentList = Student.objects.filter(id=ID)
        if not studentList:
            return HttpResponse(status=400)
        else:
            ret = serializers.serialize('json', studentList)
            return HttpResponse(status=200, content=ret, content_type="application/json")

    except Exception as e:
        return HttpResponse(status=400, content=json.dumps(str(e)))

#Summary: self explains. Make sure you include enctype='multipart/form-data' in your header
#Input: Get request with ID, and a file with the html id for it being 'file'
#Output: 200 or 400
@csrf_exempt
def UploadStudentResume(request):
    try:
        userID = request.GET.get('ID', '')
        if(userID == ''):
            return HttpResponse(status=400)
        query = User.objects.filter(id=userID)
        if query is None:
            exc_info = sys.exc_info()
            print(''.join(traceback.format_exception(*exc_info)))
            return HttpResponse(status=400, content="Student doesnt exist at that ID")
        try:
            inputFile = request.FILES['file']
            inputFileName = inputFile.name
        except Exception as e:
            exc_info = sys.exc_info()
            print(''.join(traceback.format_exception(*exc_info)))
            return HttpResponse(status=400, content="No file found in request")
        listFileString = "tutorial/quickstart/Users/{}/".format(userID)

        if not os.path.exists(listFileString):
            os.makedirs(listFileString)

        listFileString = listFileString + inputFileName
        print(listFileString)

        with open(listFileString, "wb+") as f:
            for chunk in inputFile.chunks():
                f.write(chunk)

        return HttpResponse(status=200)     

    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))

#Summary: self explains
#Input: check anything using data['{fieldName}']
#Output: file for student ID
@csrf_exempt
def DownloadStudentResume(request):
    try:
        userID = request.GET.get('ID', '')
        if(userID == ''):
            return HttpResponse(status=400, content="No user sent")

        listFileString = "tutorial/quickstart/Users/{}/".format(userID)
        listFileString = listFileString + "/*"
        list_of_files = glob.glob(listFileString) # * means all if need specific format then *.csv
        latest_file = max(list_of_files, key=os.path.getctime)
        temp = latest_file.split('.')
        fileExt = temp[1]
        with open(latest_file, 'rb') as fh:
            response = HttpResponse(fh.read(), content_type="application/force-download")
            response['Content-Disposition'] = 'inline; filename=' + os.path.basename(latest_file)
            return response
    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))

#Summary: Returns a json representation of the current scheduler run directory. Good for navigating what is available
#Input: check anything using data['{fieldName}']
#Output: Returns a json representation of the current scheduler run directory.
@csrf_exempt
def GetSchedulerRunVersions(request):
    try:
        listFileString = "tutorial/quickstart/Scheduler/Schedule_Runs/"
        ret = {}
        yearList = []

        years = [f for f in os.listdir(listFileString)]

        for year in years:
            fullList = {}
            temp = listFileString + year + "/"
            terms = [x for x in os.listdir(temp)]
            fullList["year"] = year
            termList = []

            for term in terms:
                termObj = {}
                temp2 = temp + term + "/"
                termObj["term"] = term
                versions = [y for y in os.listdir(temp2)]
                termObj["versions"] = versions
                termList.append(termObj)

            fullList["terms"] = termList
            yearList.append(fullList)

        ret["fullDirectory"] = yearList
        return HttpResponse(status=200, content=json.dumps(ret))

    except Exception as e:
        return HttpResponse(status=400, content=json.dumps(str(e)))

#Summary: Loads any run version based on the sent data
#Input: check anything using data['{fieldName}']
#Output: returns massive list of students and projects
@csrf_exempt
def LoadPreviousRunVersion(request):
    try:
        data = json.loads(request.body)
        year = data['year']
        term = data['term'].lower()
        fileName = data['fileName']

        listFileString = "tutorial/quickstart/Scheduler/Schedule_Runs/{}/{}/{}".format(year, term, fileName)
        
        if not os.path.exists(listFileString):
            return HttpResponse(status=400, content="File not found")

        ret = ConvertAlgFileToJson(listFileString, year, term)
        request.session['CurrentScheduleVersion'] = ret
        return HttpResponse(status=200, content=ret)

    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))


#Summary: Returns all the student emails of those who have NOT done assignment one. Not used by the frontend.
#Input: check anything using data['{fieldName}']
#Output: All student emails who have not done assignment one
@csrf_exempt
def GetStudentsMissingAssignmentOne(request):
    try:
        data = json.loads(request.body)
        year = data['year']
        term = data['term']
        students = Student.objects.filter(CurrentYear=year, CurrentTerm=term)
        allUsers = User.objects.all()
        missingList = []
        for user in allUsers:
            did = 0
            if user.is_staff == 1:
                did = 1
                pass
            else:
                for student in students:
                    if user.email == student.knightsEmail:
                        did = 1
                    else:
                        pass
                if did == 0:
                    missingList.append(user.email)
                else:
                    pass
        return HttpResponse(status=200, content=json.dumps(missingList))
                

    except Exception as e:
        return HttpResponse(status=400, content=json.dumps(str(e)))


#Summary: logs user out
#Input: none
#Output: 200 or 400
@csrf_exempt
def Logout(request):
    try:
        request.session.flush()
        return HttpResponse(status=200)
    except Exception as e:
        return HttpResponse(status=400, content=json.dumps(str(e)))


#Summary: creates students just like CreateStudent, but does it via .csv
#Input: file input of a .csv . Same .csv that is given by downloading the student roster on MyUCF
#Output: 200 or 400
@csrf_exempt
def SubmitStudentRoster(request):
    try:
        inputFile = request.FILES['file']
        inputFileName = inputFile.name
        emailList = []
        f = TextIOWrapper(request.FILES['file'].file, encoding='ASCII')
        csv_reader = csv.DictReader(f)
        line_count = 0
        for row in csv_reader:
            if line_count == 0:
                line_count += 1
            email = row["Email Address"]
            emailList.append(email)  
        CreateUserLocal(emailList)
        return HttpResponse(status=200)     
    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))


#Summary: Local function to send mass emails
#Input: list of emails
#Output: 
def CreateUserLocal(emails):
    try:
        smtp_server = "smtp.gmail.com:587"
        server = smtplib.SMTP(smtp_server)
        server.starttls()
        server.login('ucfsd1scheduler@gmail.com', 'Group4!_')

        for email in emails:
            try:
                user = User.objects.get(email=email)
                user = 1
            except:
                user = 0
            if user == 1:
                return HttpResponse(status=400, content="User has already been added")
            else:
                letters = string.ascii_letters
                password = ''.join(random.choice(letters) for i in range(8))
                query = User(email=email, password=make_password(password, "axbxc4"), username=email)
                query.save()
                subject = 'You have been added to the UCF Senior Design 1 Scheduler'
                body = "Please navigate to [URL] and complete the account creation process.\nUsername: {0}\nPassword: {1}".format(email, password)
                SendEmail(email, subject, body, server)
        server.quit()
        return
    except:
        return


#Summary: Create a brand new project for the CMS
#Input: check anything using data['{fieldName}']
#Output: 200 with project id or 400
@csrf_exempt
def CreateCmsProject(request):
    try:
        data = json.loads(request.body)
        query = CMSProject(group_number=data['group_number'], project_name=data['project_name'], sponsor=data['sponsor'], sponsor2=data['sponsor2'],
                        year=data['year'], term=data['term'], keywords=data['keywords'], project_description=data['project_description'], group_size=data['group_size'])
        query.save()
        projectObj = {}
        ret = []
        projectObj['project_id'] = query.pk
        ret.append(projectObj)
        return HttpResponse(status=200, content=json.dumps(ret))
    except Exception as e:
        return HttpResponse(status=400, content=json.dumps(str(e)))


#Summary: Creates brand new cms member for cms
#Input: check anything using data['{fieldName}']
#Output: 200 with the member id or 400
@csrf_exempt
def CreateCMSMember(request):
    try:
        data.loads(request.body)
        query = CMSMembers(project_id=data['project_id'], first_name=data['first_name'], last_name=data['last_name'], email=data['email'])
        query.save()
        ID = query.pk

        memberObj = {}
        ret = []
        memberObj['member_id'] = query.pk
        ret.append(memberObj)
        return HttpResponse(status=200, content=json.dumps(ret))
        return HttpResponse(status=200)  

    except Exception as e:
        return HttpResponse(status=400, content=json.dumps(str(e)))


#Summary: Gets all cms projects with the sent term and year
#Input: none
#Output: json of all projects on cms
@csrf_exempt
def GetCMSProjects(request):
    try:
        query = CMSProject.objects.all()
        projectList = []
        for prj in query:
            tempPrj = {}
            tempPrj['project_id'] = prj.id
            tempPrj['project_name'] = prj.project_name
            tempPrj['group_number'] = prj.group_number
            tempPrj['year'] = prj.year
            tempPrj['term'] = prj.term.capitalize()
            tempPrj['sponsor'] = prj.sponsor
            tempPrj['sponsor2'] = prj.sponsor2
            tempPrj['design_doc_url'] = prj.design_doc_url
            tempPrj['final_doc_url'] = prj.final_doc_url
            tempPrj['presentation_url'] = prj.presentation_url
            tempPrj['conference_paper_url'] = prj.conference_paper_url
            tempPrj['senior_design1'] = prj.senior_design1
            tempPrj['project_description'] = prj.project_description
            tempPrj['keywords'] = prj.keywords
            
            studentList = []
            query2 = CMSMembers.objects.filter(project_id=prj.id)
            for std in query2:
                tempStd = {}
                tempStd['member_id'] = std.id
                tempStd['project_id'] = std.project_id
                tempStd['first_name'] = std.first_name
                tempStd['last_name'] = std.last_name
                tempStd['email'] = std.email
                tempStd['photo'] = std.photo
                studentList.append(tempStd)

            tempPrj['group_members'] = studentList

            projectList.append(tempPrj)
        
        ret = {}
        ret['project_list'] = projectList
        ret['currentTerm'] = GetCurrentTerm()
        ret['currentYear'] = now().year
        return HttpResponse(status=200, content=json.dumps(ret))
    except Exception as e:
        return HttpResponse(status=400, content=json.dumps(str(e)))


#Summary: Upload design doc for sent project. Check to make sure you have 'enctype' header
#Input: Get request with project id
#Output: 200 ok or 400
@csrf_exempt
def UploadCMSDesignDoc(request):
    try:
        prjID = request.GET.get('project_id', '')
        if(prjID == ''):
            return HttpResponse(status=400)
        query = CMSProject.objects.get(id=prjID)
        if query is None:
            return HttpResponse(status=400, content=json.dumps(str(e)))
        try:
            inputFile = request.FILES['file']
            inputFileName = inputFile.name
        except Exception as e:
            return HttpResponse(status=400, content=json.dumps(str(e)))
        listFileString = "tutorial/quickstart/CMSProject/{}/DesignDoc/".format(prjID)
        query.design_doc_url = "/DownloadCMSProjectResource/?project_id={}&res_type=DesignDoc".format(prjID)
        query.save()

        if not os.path.exists(listFileString):
            os.makedirs(listFileString)

        listFileString = listFileString + inputFileName

        with open(listFileString, "wb+") as f:
            for chunk in inputFile.chunks():
                f.write(chunk)

        return HttpResponse(status=200)

    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))

#same as above
@csrf_exempt
def UploadCMSFinalDoc(request):
    try:
        prjID = request.GET.get('project_id', '')
        if(prjID == ''):
            return HttpResponse(status=400)
        query = CMSProject.objects.get(id=prjID)
        if query is None:
            return HttpResponse(status=400, content=json.dumps(str(e)))
        try:
            inputFile = request.FILES['file']
            inputFileName = inputFile.name
        except Exception as e:
            return HttpResponse(status=400, content=json.dumps(str(e)))
        listFileString = "tutorial/quickstart/CMSProject/{}/FinalDoc/".format(prjID)
        
        query.final_doc_url = "/DownloadCMSProjectResource/?project_id={}&res_type=FinalDoc".format(prjID)
        query.save()

        if not os.path.exists(listFileString):
            os.makedirs(listFileString)

        listFileString = listFileString + inputFileName

        with open(listFileString, "wb+") as f:
            for chunk in inputFile.chunks():
                f.write(chunk)

        return HttpResponse(status=200)    

    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))

#same as above
@csrf_exempt
def UploadCMSPresentation(request):
    try:
        prjID = request.GET.get('project_id', '')
        if(prjID == ''):
            return HttpResponse(status=400)
        query = CMSProject.objects.get(id=prjID)
        if query is None:
            return HttpResponse(status=400, content=json.dumps(str(e)))
        try:
            inputFile = request.FILES['file']
            inputFileName = inputFile.name
        except Exception as e:
            return HttpResponse(status=400, content=json.dumps(str(e)))
        listFileString = "tutorial/quickstart/CMSProject/{}/Presentation/".format(prjID)
        query.presentation_url = "/DownloadCMSProjectResource/?project_id={}&res_type=Presentation".format(prjID)
        query.save()

        if not os.path.exists(listFileString):
            os.makedirs(listFileString)

        listFileString = listFileString + inputFileName

        with open(listFileString, "wb+") as f:
            for chunk in inputFile.chunks():
                f.write(chunk)

        return HttpResponse(status=200) 

    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))

#same as above
@csrf_exempt
def UploadCMSConferencePaper(request):
    try:
        prjID = request.GET.get('project_id', '')
        if(prjID == ''):
            return HttpResponse(status=400)
        query = CMSProject.objects.get(id=prjID)
        if query is None:
            return HttpResponse(status=400, content=json.dumps(str(e)))
        try:
            inputFile = request.FILES['file']
            inputFileName = inputFile.name
        except Exception as e:
            return HttpResponse(status=400, content=json.dumps(str(e)))
        listFileString = "tutorial/quickstart/CMSProject/{}/ConferencePaper/".format(prjID)
        query.conference_paper_url = "/DownloadCMSProjectResource/?project_id={}&res_type=ConferencePaper".format(prjID)
        query.save()

        if not os.path.exists(listFileString):
            os.makedirs(listFileString)

        listFileString = listFileString + inputFileName

        with open(listFileString, "wb+") as f:
            for chunk in inputFile.chunks():
                f.write(chunk)

        return HttpResponse(status=200)

    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))

#same as above
@csrf_exempt
def UploadCMSMemberPhoto(request):
    try:
        stdID = request.GET.get('member_id', '')
        if(stdID == ''):
            return HttpResponse(status=400)
        query = CMSMembers.objects.get(id=stdID)
        if query is None:
            return HttpResponse(status=400, content=json.dumps(str(e)))
        try:
            inputFile = request.FILES['file']
            inputFileName = inputFile.name
        except Exception as e:
            return HttpResponse(status=400, content=json.dumps(str(e)))
        listFileString = "tutorial/quickstart/CMSMember/{}/MemberPhoto/".format(stdID)
        query.photo = "/DownloadCMSMemberResource/?member_id={}&res_type=MemberPhoto".format(stdID)
        query.save()

        if not os.path.exists(listFileString):
            os.makedirs(listFileString)

        listFileString = listFileString + inputFileName

        with open(listFileString, "wb+") as f:
            for chunk in inputFile.chunks():
                f.write(chunk)

        return HttpResponse(status=200)  

    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))


#Summary: Downloads file for the project
#Input: get request with project id and type of file
#Output: file
@csrf_exempt
def DownloadCMSProjectResource(request):
    try:
        projectID = request.GET.get('project_id', '')
        resType = request.GET.get('res_type', '')

        if (projectID == '' or resType == ''):
            return HttpResponse(status=400)

        listFileString = "tutorial/quickstart/CMSProject/{}/{}".format(projectID, resType)
        if not os.path.exists(listFileString):
            return HttpResponse(status=400)
        listFileString = listFileString + "/*"

        list_of_files = glob.glob(listFileString) # * means all if need specific format then *.csv
        latest_file = max(list_of_files, key=os.path.getctime)
        temp = latest_file.split('.')
        fileExt = temp[1]

        with open(latest_file, 'rb') as fh:
            response = HttpResponse(fh.read(), content_type="application/force-download")
            response['Content-Disposition'] = 'inline; filename=' + os.path.basename(latest_file)
            return response
    except Exception as e:
        return HttpResponse(status=400, content=json.dumps(str(e)))

#same but for member
@csrf_exempt
def DownloadCMSMemberResource(request):
    try:
        projectID = request.GET.get('member_id', '')
        resType = request.GET.get('res_type', '')

        if (projectID == '' or resType == ''):
            return HttpResponse(status=400)

        listFileString = "tutorial/quickstart/CMSMember/{}/{}".format(projectID, resType)
        if not os.path.exists(listFileString):
            return HttpResponse(status=400)
        listFileString = listFileString + "/*"

        list_of_files = glob.glob(listFileString) # * means all if need specific format then *.csv
        latest_file = max(list_of_files, key=os.path.getctime)
        temp = latest_file.split('.')
        fileExt = temp[1]

        with open(latest_file, 'rb') as fh:
            response = HttpResponse(fh.read(), content_type="application/force-download")
            response['Content-Disposition'] = 'inline; filename=' + os.path.basename(latest_file)
            return response
    except Exception as e:
        return HttpResponse(status=400, content=json.dumps(str(e)))


#Summary: Get all groups for the most recent schedule run
#Input: check anything using data['{fieldName}']
#Output: returns list of projects, group members, and group nums
@csrf_exempt
def GetGroups(request):
    try:
        data = json.loads(request.body)
        year = data['year']
        term = data['term']
        try:
            #change this to not be hard coded
            listFileString = "tutorial/quickstart/Scheduler/Schedule_Runs/{}/{}/*".format(year, term)
            list_of_files = glob.glob(listFileString) # * means all if need specific format then *.csv
            latest_file = max(list_of_files, key=os.path.getctime)
            datum = ConvertAlgFileToJson(latest_file, year, term)
            currentRun = json.loads(datum)
        except:
            exc_info = sys.exc_info()
            print(''.join(traceback.format_exception(*exc_info)))
            return HttpResponse(status=400, content="No schedule loaded")
        groupList = []
        for project in currentRun['Projects']:
            groupObj = {}
            groupObj['projectID'] = project['ID']
            query = Project.objects.get(id=project['ID'])
            groupObj['groupNumber'] = query.GroupNumber
            groupObj['projectName'] = project['Name']
            studentList = []
            for student in currentRun['Students']:
                if student['ProjectID'] == project['ID']:
                    tempStudent = {}
                    tempStudent['studentName'] = student['Name']
                    tempStudent['studentID'] = student['ID']
                    tempStudent['GPA'] = student['GPA']
                    tempStudent['BC'] = student['BC']
                    tempStudent['CanDoFall'] = student['CanDoFall']
                    tempStudent['CanDoSummer'] = student['CanDoSummer']
                    tempStudent['ProjectID'] = student['ProjectID']
                    studentList.append(tempStudent)
                else:
                    pass
                groupObj['studentList'] = studentList
            groupList.append(groupObj)
        unAssignedList = []
        for un in currentRun['Students']:
            if student['ProjectID'] == -2:
                    tempStudent = {}
                    tempStudent['studentName'] = student['Name']
                    tempStudent['studentID'] = student['ID']
                    tempStudent['GPA'] = student['GPA']
                    tempStudent['BC'] = student['BC']
                    tempStudent['CanDoFall'] = student['CanDoFall']
                    tempStudent['CanDoSummer'] = student['CanDoSummer']
                    tempStudent['ProjectID'] = student['ProjectID']
                    unAssignedList.append(tempStudent)
            else:
                pass
        ret = {}
        ret['Groups'] = groupList
        ret['unAssignedList'] = unAssignedList
        return HttpResponse(status=200, content=json.dumps(ret))
    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))


#Summary: Send all the final project groups and members to the cms. Possible legal issues according to stressau. I would remove this functionality unless heinrich says otherwise
#Input: check anything using data['{fieldName}']
#Output: 200 ok or 400
@csrf_exempt
def FinalizeScheduleVersion(request):
    try:
        data = json.loads(request.body)
        year = data['year']
        term = data['term'].lower()
        version = data['version']
        appendOne = 0
        appendTwo = 0
        query2 = FinalSchedule.objects.filter(Year=year, Term=term, ScheduleVersion=version)
        if(len(query2) > 0):
            return HttpResponse(status=400)
        query = FinalSchedule(Year=year, Term=term, ScheduleVersion=version)
        query.save()
        listFileString = "tutorial/quickstart/Scheduler/Schedule_Runs/{}/{}/{}".format(year, term, version)
        currentRun = json.loads(ConvertAlgFileToJson(listFileString, year, term))
        for project in currentRun['Projects']:
            if(int(project['CurrentStudents']) == 0):
                pass
            pr = Project.objects.get(id=project['ID'])
            query = CMSProject(group_number=pr.GroupNumber, project_name=pr.ProjectName, sponsor=pr.Sponsor,
                               sponsor2=pr.Sponsor2, group_size=project['CurrentStudents'], year=pr.Year,
                               term=pr.Term)
            query.save()

        for student in currentRun['Students']:
            st = Student.objects.get(id=student['ID'])
            prj = next(f for f in currentRun['Projects'] if f['ID'] == student['ProjectID'])
            prjID = CMSProject.objects.get(project_name=prj['Name'])
            query2 = CMSMembers(project_id=prjID.id, first_name=st.firstName, last_name=st.lastName,
                                email=st.knightsEmail)
            query2.save()

        if(term.lower() == 'fall'):
            SendFinalizeEmails(year, ['spring'])
        elif(term.lower() == 'summer'):
            SendFinalizeEmails(year, ['fall'])
        elif(term.lower() == 'spring'):
            SendFinalizeEmails(year, ["fall", "summer"])
        return HttpResponse(status=200)
    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))


#Summary: This is for uploading the scraped data for all the old projects and groups
#Input: file
#Output: 200ok 400
@csrf_exempt 
def UploadOldData(request):
    try:
        inputFile = request.FILES["file"]
        inputFileName = inputFile.name
        bigData = inputFile.read()
        jsonFile = json.loads(bigData)
        jsonFile['Fall 2019'] = 0
        jsonFile['Summer 2016'] = 0
        jsonFile['Spring 2016'] = 0
        termArr = ["Spring", "Fall", "Summer"]
        yearArr = ["2019", "2018", "2017", "2016"]
        for year in yearArr:
            for term in termArr:
                tempStr = term + " " + year
                if(jsonFile[tempStr] == 0):
                    pass
                else:
                    termYear = jsonFile[tempStr]
                    #handle possible sd1
                    try:
                        tCheck = termYear['Senior Design 1']
                        if(len(tCheck) > 1):
                            for check in tCheck:
                                try:
                                    d = check["design doc"]['link']
                                except:
                                    d = "N/A"
                                query = CMSProject(group_number=check["group number"], project_name=check["group name"],
                                        group_size=len(check["members"]), year=year, term=term,
                                        design_doc_url=d, final_doc_url= "N/A", presentation_url="N/A",
                                        conference_paper_url="N/A", sponsor="N/A", sponsor2="N/A", senior_design1=True)
                                query.save()
                                memLen = len(check['members'])
                                i = 0
                                while(i < memLen):
                                    strArr = check['members'][i].split(' ')
                                    if(len(strArr) < 3):
                                        fName = strArr[0]
                                        lName = strArr[1]
                                    else:
                                        run = 0
                                        fName = strArr[0]
                                        lName = ""
                                        for name in strArr:
                                            if(run == 1 and name != ''):
                                                lName = lName + name
                                            run = 1
                                    query2 = CMSMembers(project_id=query.pk, first_name=fName, last_name=lName,
                                                        email=check['emails'][i])
                                    query2.save()
                                    i+=1
                        else:
                            pass
                    except:
                        pass
                    for obj in termYear["Senior Design 2"]:
                        try:
                            d = obj["design doc"]['link']
                        except:
                            d = "N/A"

                        try:
                            f = obj["final doc"]['link']
                        except:
                            f = "N/A"

                        try:
                            c = obj["conference paper"]['link']
                        except:
                            c = "N/A"

                        try:
                            p = obj["presentation"]['link']
                        except:
                            p = "N/A"
                        query = CMSProject(group_number=obj['group number'], project_name=obj['group name'],
                                        group_size=len(obj['members']), year=year, term=term,
                                        design_doc_url=d, final_doc_url=f, presentation_url=p,
                                        conference_paper_url=c, sponsor="N/A", sponsor2="N/A")
                        query.save()
                        memLen = len(obj['members'])
                        i = 0
                        while(i < memLen):
                            strArr = obj['members'][i].split(' ')
                            if(len(strArr) < 3):
                                fName = strArr[0]
                                lName = strArr[1]
                            else:
                                run = 0
                                fName = strArr[0]
                                lName = ""
                                for name in strArr:
                                    if(run == 1 and name != ''):
                                        lName = lName + name
                                    run = 1
                            query2 = CMSMembers(project_id=query.pk, first_name=fName, last_name=lName,
                                                email=obj['emails'][i])
                            query2.save()
                            i+=1



        return HttpResponse(status=200, content=bigData)
    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))


#Summary: Exports the sent version name and term/year as a .csv , Not used by the front end
#Input: check anything using data['{fieldName}']
#Output: .csv file
@csrf_exempt
def ExportRunVersionCSV(request):
    try:
        data = json.loads(request.body)
        year = data['year']
        term = data['term']
        version = data['version']
        tempStr = version.split('.')
        tempFileName = tempStr[0] + ".csv"
        if not os.path.exists("tutorial/quickstart/ExportedCSV/"):
            os.makedirs("tutorial/quickstart/ExportedCSV/")
        fileName = "tutorial/quickstart/ExportedCSV/" + tempFileName
        listFileString = "tutorial/quickstart/Scheduler/Schedule_Runs/{}/{}/{}".format(year, term, version)
        currentRun = json.loads(ConvertAlgFileToJson(listFileString, year, term))
        tableProjectList = Project.objects.filter(CurrentYear=year, CurrentTerm=term).order_by('Term', 'ProjectName')
        studentTableList = Student.objects.filter(CurrentYear=year, CurrentTerm=term)
        topList = ['Student', 'BC?', 'Term', 'Assigned?']
        #build top row
        for prj in currentRun['Projects']:
            topList.append(prj['Name'])
        with open(fileName, 'w+') as csvFile:
            writer = csv.writer(csvFile)
            writer.writerow(topList)
            sortedList = sorted(currentRun['Students'], key=lambda x: x['Name'])
            for student in sortedList:
                newRow = []
                tableStudent = next(z for z in studentTableList if z.id == student['ID'])
                #build row
                if(student['ProjectID'] == -2):
                    assigned = 'N'
                else:
                    assigned = 'Y'
                    currProj = next(f for f in tableProjectList if f.id == student['ProjectID'])
                #newRow[student['name'], tableStudent.Bootcamp, tableStudent.term, assigned]
                newRow.append(student['Name'])
                newRow.append(tableStudent.Bootcamp)
                newRow.append(tableStudent.term)
                newRow.append(assigned)

                i = 0
                for assignedList in student['PriorityList']:
                    if(assigned == 'Y'):
                        if(topList[i+4] == currProj.ProjectName):
                            newRow.append(("Assigned ({})").format(assignedList))
                        else:
                            newRow.append(assignedList)
                    else:
                        newRow.append(assignedList)
                    i+=1
                #topList.append(newRow)
                writer.writerow(newRow)
        with open(fileName, 'rb') as fh:
            response = HttpResponse(fh.read(), content_type="text/csv")
            response['Content-Disposition'] = 'attachment; filename=' + os.path.basename(fileName) + ".csv"
            return response
    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))


#Summary: Gets the initial build of a schedule. Good for reseting back to before any groups were made
#Input: check anything using data['{fieldName}']
#Output: list of students and projects
@csrf_exempt
def GetInitialGridBuild(request):
    try:
        data = json.loads(request.body)
        sentYear = data['year']
        sentTerm = data['term'].lower()
        listFileString = "tutorial/quickstart/Scheduler/Initial_Builds/{}/{}/build.txt".format(sentYear, sentTerm)

        with open(listFileString, 'r') as f:
            data = f.read()

        ret = data
        return HttpResponse(status=200, content=ret)

    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))


#Summary: Send emails to all members of all group with their group info and project assigned. Possibly dangerous since it uses the CMS database. Can send email to old members so i would suggest this is removed
#Input: year and term
#Output: 
def SendFinalizeEmails(year, term):
    if(int(year) < 2020):
        return None
    if((int(year) == 2019 and term == "spring") or (int(year) == 2019 and term =="fall")):
        return None
    nospampls = 0
    smtp_server = "smtp.gmail.com:587"
    server = smtplib.SMTP(smtp_server)
    server.starttls()
    server.login('ucfsd1scheduler@gmail.com', 'Group4!_')
    for t in term:
        query = CMSProject.objects.filter(year=year, term=t)
        for prj in query:
            query2 = CMSMembers.objects.filter(project_id=prj.id)
            print(len(query2))
            for std in query2:
                i = 0
                subject = "You have been added to a UCF Senior Design 1 Group"
                body = "Hello {} {},\n\nYour professor has finalized groups for this semester. Please see below for project and group information.\n".format(std.first_name, std.last_name)
                body +="\nProject Name: {}\nGroup Number: {}\nSponsor Name: {}".format(prj.project_name, prj.group_number, prj.sponsor)
                body +="\n\nGroup Information:\n"
                while(i < prj.group_size):
                    if(std.id != query2[i].id):
                        body+="Name: {} {}  Email: {}\n".format(query2[i].first_name, query2[i].last_name, query2[i].email)
                    i+=1
                if(nospampls == 0):
                    SendEmail("cuervotyler1@gmail.com", subject, body, server)
                    nospampls = 1 
    server.quit()
    return None


################################## Everything below this is for working with editing / deleting stuff from the cms. Everything is pretty much similar to that above

@csrf_exempt
def UpdateCMSProject(request):
    try:
        data = json.loads(request.body)
        projectID = data['project_id']
        desc = data['project_description']
        keywords = data['keywords']

        query = CMSProject.objects.get(id=projectID)
        query.project_description = desc
        query.keywords = keywords
        query.save()

        return HttpResponse(status=200)
    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))

@csrf_exempt
def UpdateFullCMSProject(request):
    try:
        data = json.loads(request.body)
        projectID = data['project_id']
        desc = data['project_description']
        keywords = data['keywords']
        project_name = data['project_name']
        sponsor = data['sponsor']
        sponsor2 = data['sponsor2']

        query = CMSProject.objects.get(id=projectID)
        query.project_description = desc
        query.keywords = keywords
        query.project_name = project_name
        query.sponsor = sponsor
        query.sponsor2 = sponsor2
        query.save()

        return HttpResponse(status=200)
    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))

@csrf_exempt
def DeleteCMSProject(request):
    try:
        ID = data['ID']
        query = CMSProject.objects.get(id=ID)
        query.delete()
    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))

@csrf_exempt
def DeleteCMSMember(request):
    try:
        ID = data['ID']
        query = CMSMembers.objects.get(id=ID)
        query.delete()
    except Exception as e:
        exc_info = sys.exc_info()
        print(''.join(traceback.format_exception(*exc_info)))
        return HttpResponse(status=400, content=json.dumps(str(e)))

