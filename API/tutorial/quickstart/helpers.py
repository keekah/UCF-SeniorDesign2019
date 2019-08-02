from django.utils.timezone import now
from tutorial.quickstart.models import Project, Student, StudentProjectRanking
import json, os

#Gets the current term. Adjust this if term months ever change or new ones are added
def GetCurrentTerm():
    month = now().month
    if(month >= 8 and month < 12):
        return 'fall'
    elif (month >= 1 and month < 5):
        return 'spring'
    else:
        return 'summer'

#Oh boy howdy you're in for a rough one here
#Converts the output from the scheduler to the expected input for the front end
#Also to solve "locked allows a projects max to be ignored" this will also reassign any student in a project..
#where theres a locked student and it is past the project max
#yea i know, its rediculous...
def ConvertAlgFileToJson(fileName, sentYear, sentTerm, getScheduleBit=0):
    with open(fileName, "r") as f:
        data = f.read()
    ret = {}
    projectList = []
    studentList = []
    jsonData = json.loads(data)
    i = 0
    #for st in jsonData['studentList']:
        #if(st['currentProject'] == 15):
            #print(st['lockedInto'])
    for project in jsonData['projectList']:
        tempProject = {}
        tempProject['Name'] = project['projectName']
        #grab ID from table
        tempProject['ID'] = project['id']
        tempProject['Min'] = project['min']
        tempProject['Max'] = project['max']
        tempProject['CanDoFall'] = project['canDoFall']
        tempProject['CanDoSummer'] = project['canDoSummer']
        tempProject['Priority'] = project['priority']
        tempProject['CurrentStudents'] = project['current']
        projectList.append(tempProject)
    for student in jsonData['studentList']:
        tempStudent = {}
        tempStudent['Name'] = student['name']
        try:
            tempStudent['ID'] = student['id']
        except: 
            tempStudent['ID'] = i
        tempStudent['PriorityList'] = student['priorityList']
        tempStudent['GPA'] = student['gpa']
        tempStudent['BC'] = student['bootcamp']
        tempStudent['CanDoFall'] = student['canDoFall']
        tempStudent['CanDoSummer'] = student['canDoSummer']
        if(student['currentProject'] < 0):
            tempStudent['ProjectID'] = -2
        else:
            if(student['lockedInto'] == -1):
                tempStudent['ProjectID'] = projectList[int(student['currentProject'])]["ID"]
            else:
                tempStudent['ProjectID'] = projectList[int(student['lockedInto'])]["ID"]
        tempStudent['Locked'] = student['lockedInto']
        tempStudent['BlockedList'] = student['blockedList']
        studentList.append(tempStudent)

    #fix locked students breaking max barrier
    for tempS in studentList:
        if(tempS['Locked'] > 0):
            #student has been locked into a project, now the alg has allowed the project past max
            broken = 0
            for tempS2 in studentList:
                if(tempS2['Locked'] < 0 and tempS2["ProjectID"] == tempS["Locked"] and broken == 0):
                    iCount = 0
                    for tX in tempS2['PriorityList']:
                        if(tX != 20 and projectList[iCount]["CurrentStudents"] < projectList[iCount]["Max"]):
                            tempPr = projectList[iCount]
                            tempS2['ProjectID'] = tempPr["ID"]
                            tempPr["CurrentStudents"]+=1
                            broken=1
                            break
                        iCount+=1
    ret['Projects'] = projectList
    ret['Students'] = studentList
    ret['studentsFirstChoice'] = jsonData['studentsFirstChoice']
    ret['studentsSecondChoice'] = jsonData['studentsSecondChoice']
    ret['studentsThirdChoice'] = jsonData['studentsThirdChoice']
    ret['totalStudents'] = jsonData['totalStudents']
    if(getScheduleBit == 0):
        ret = ConvertIDsFromAlg(ret, sentYear, sentTerm)
    return json.dumps(ret)

#takes all the data from the database and creates the expected json input for the front end grid
def BuildInitialGrid(year, term):
    try:
        tableProjectList = Project.objects.filter(CurrentYear=year, CurrentTerm=term)
        tableStudentList = Student.objects.filter(CurrentYear=year, CurrentTerm=term)
        if(len(tableProjectList) < 1 or len(tableStudentList) < 1):
            return None
        tableProjectList.order_by('ProjectName')
        ret = {}
        Students = []
        Projects = []
        #build student list
        for student in tableStudentList:
            tempStudent = {}
            tempStudent["Name"] = student.firstName + " " + student.lastName
            tempStudent["ID"] = student.id
            tempStudent["GPA"] = float(student.overallGPA)
            tempStudent["BC"] = int(student.Bootcamp == True)
            tempStudent["CanDoFall"] = int(student.CanDoBoth == True or student.term.lower() == 'fall')
            tempStudent["CanDoSummer"] = int(student.CanDoBoth == True or student.term.lower() == 'summer')
            tempStudent["ProjectID"] = -1
            tempStudent["Locked"] = -1
            tempStudent["BlockedList"] = []
            tempStudent["PriorityList"] = []

            for project in tableProjectList:
                try: 
                    query = StudentProjectRanking.objects.get(StudentID=student.id, ProjectID=project.id)
                    ranking = query.Ranking
                except:
                    ranking = 20

                tempStudent["PriorityList"].append(ranking)

            Students.append(tempStudent)

        for project in tableProjectList:
            tempProject = {}
            tempProject['ID'] = project.id
            tempProject['Min'] = project.Min
            tempProject['Max'] = project.Max
            tempProject['CanDoFall'] = int(project.CanDoBoth == True or project.Term.lower() == 'fall')
            tempProject['CanDoSummer'] = int(project.CanDoBoth == True or project.Term.lower() == 'summer')
            tempProject['Priority'] = 0
            tempProject['CurrentStudents'] = 0
            tempProject['Name'] = project.ProjectName

            Projects.append(tempProject)

        ret['Projects'] = Projects
        ret['Students'] = Students
        listFileString = "tutorial/quickstart/Scheduler/Initial_Builds/{}/{}".format(year, term)
        tempRet = json.dumps(ret)
        if not os.path.exists(listFileString):
            os.makedirs(listFileString)
        listFileString = listFileString + "/build.txt"
        with open(listFileString, "w+") as f:
            f.write(tempRet)

        return tempRet
    except Exception as e:
        print(str(e))
        return None
# returns if a project had been run before or not
def RunBefore(year, term):
    listFileString = "tutorial/quickstart/Scheduler/Schedule_Runs/{}/{}".format(year, term)
    if not os.path.exists(listFileString):
        return 0
    else:
        versions = [f for f in os.listdir(listFileString)]
        if len(versions) < 1:
            return 0
    return 1

# Jesus why did i even have to do this
# Takes all of the projects in the json Obj and turns the project id into that of a 0 - x scale
def ConvertGridJsonToAlgJson(jsonObj):
    i = 0
    for prj in jsonObj['projectList']:
        tempID = prj['ID'] + 1000
        for std in jsonObj['studentList']:
            if(std['ProjectID'] == prj['ID']):
                std['ProjectID'] = i
            if(std['Locked'] == prj['ID']):
                std['Locked'] = i
            if(len(std['BlockedList']) > 0):
                y = 0
                for item in std['BlockedList']:
                    if(item + 1000 == tempID):
                        std['BlockedList'][y] = i
                    else:
                        pass
                    y+=1
                    #print(std['BlockedList'])
                else:
                    pass
            else:
                pass
        prj['ID'] = i
        i+=1
    return jsonObj

#takes the scheduler output and converts all the 0 - x id's to the IDs of actual projects on the backend
def ConvertIDsFromAlg(jsonObj, year, term):
    for std in jsonObj['Students']:
        currentID = std['ProjectID'] 
        if(currentID == -2):
            currentID = -2
        else:
            realID = Project.objects.get(CurrentYear=year, CurrentTerm=term, ProjectName=jsonObj['Projects'][currentID]['Name'])
            #print(std['ProjectID'])
            std['ProjectID'] = realID.id
            if(std['Locked'] != -1):
                #print("I was assigned")
                std['Locked'] = realID.id
        if(len(std['BlockedList']) > 0):
            y = 0
            for item in std['BlockedList']:
                blockedProj = Project.objects.get(CurrentYear=year, CurrentTerm=term, ProjectName=jsonObj['Projects'][item]['Name'])
                std['BlockedList'][y] = blockedProj.id
                y+=1
    for prj in jsonObj['Projects']:
        realID = Project.objects.get(CurrentYear=year, CurrentTerm=term, ProjectName=prj['Name'])
        prj['ID'] = realID.id

    return jsonObj

#makes sure that project changes on the db are updated to the json obj
def VerifyProjectsAreUpdated(jsonObj):
    for project in jsonObj['projectList']:
        query = Project.objects.get(id=project['ID'])
        project['Min'] = query.Min
        project['Max'] = query.Max
        project['Name'] = query.ProjectName
    return jsonObj








