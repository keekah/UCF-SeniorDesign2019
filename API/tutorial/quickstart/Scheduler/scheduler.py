"""
#How to use:
#errorProject is a project with no min and a large max. Students that can't be assigned to a project end up here.
errorProject = Project("Error", 0, 0, 100, 1, 1, [], 0, 0)
#if SDI is in spring, remember to set
springMode=1
#otherwise, make sure
springMode=0

#Start with
projectList=[]
id=1
#Then do
projectList.append(Project(name, id, min, max, canDoSummer, canDoFall, listOfStudents, priority, current))
id=id+1
#name is a string. id is the ID of the project, starting at 1. min and max are the minimum and maximum numbers of students. 
#canDoSummer and canDoFall are 1 if the project can be continued in summer and fall respectively, and 0 if it can't.
#If SDI is not during the spring, set both of these to 1 for all projects.
#listOfStudents should be empty [] when creating the project, even if students have already been chosen. Same with current being 0.
#This will be taken care of when students are being assigned to projects, as long as Student.lockedInto is set correctly.
#priority is what priority the project has when having students assigned. The higher, the more important. priority = -1 means no students will be assigned.

#Start with
studentList=[]
#Then do
studentList.append(Student(name, priorityList, gpa, bootcamp, canDoSummer, canDoFall, currentProject, lockedInto, blockedList))
#name is a string. 
#priorityList is a list of the priorities the student gave to each project. For example, if the student placed project 5 at priority 2, the 5th entry in priorityList will be 2.
#The lower the priority, the more the student wants the project.
#bootcamp is 1 if the student attended bootcamp and 0 otherwise.
#canDoSummer and canDoFall are 1 if the student can take SDII in summer and fall respectively, and 0 if they can't.
#If SDI is not during the spring, set both of these to 1 for all students.
#currentProject should be -1 for all students, even those that have been chosen for projects
#lockedInto is the value that determines whether a student has been pre-assigned to a project. ***This is 1 less than the project's ID!*** It starts at 0!
#lockedInto = -1 for students that have not been chosen for projects.
#blockedList includes any projects the student may not be assigned to. It is a list of ints such as [0, 4, 2]. These also start at 0.

Project.assignStudents(studentList, projectList, errorProject)
#Use this static method when you have some students who need to be assigned.

Project.randomizeAndAssign(studentList, projectList, errorProject)
#Use this static method if you want a different configuration of students. 
#It reassigns students that were assigned by assignStudents, but not those that have been lockedInto projects

Project.reassignFromUnmet(studentList, projectList, errorProject)
#Use this static method to reassign all students from projects that have failed to meet the mimimum student requirement.
#If you run this and then randomizeAndAssign, the projects that didn't have enough students will become locked.

Project.printAllProjects(projectList, studentList, errorProject, springMode)
#prints all the information about what students have been assigned to what projects and various statistics
"""

from random import shuffle
import sys
import json
import datetime, os
import traceback

class Project(object):
    def __init__(self, projectName, id, min, max, canDoSummer, canDoFall, listOfStudents, priority, current):
        self.projectName=projectName
        self.id=id
        self.min=min
        self.max=max
        self.canDoFall=canDoFall
        self.canDoSummer=canDoSummer
        self.listOfStudents=listOfStudents
        self.priority=priority
        self.current=current
        
    @staticmethod
    def assignStudents(studentList, projectList, errorProject):
        """maxPriority
        for x in projectList:
            if x.priority>maxPriority:
                maxPriority=x.priority"""
        for x in studentList:
            x.optimize(projectList, errorProject)
            
    @staticmethod
    def reassignFromUnmet(studentList, projectList, errorProject):
        maxMinSize=0
        for x in projectList:
            if x.min > maxMinSize:
                maxMinSize=x.min
        for z in range(maxMinSize): #this must be at least the minimum size of the largest group
            for x in projectList:
                if x.current < x.min and x.current <= z and x.priority != -1:
                    x.priority = -1
                    x.current=0
                    for y in x.listOfStudents:
                        y.currentProject=-1
                        #print(y.currentProject + "reassign")
                        y.optimize(projectList, errorProject)
                    x.listOfStudents=[]
            
    @staticmethod
    def randomizeAndAssign(studentList, projectList, errorProject):
        shuffle(studentList)
        for a in studentList:
            a.currentProject=-1
            #print(a.currentProject + "randomize")
        for a in projectList:
            a.current=0
            a.listOfStudents=[]
        Project.assignStudents(studentList, projectList, errorProject)
    
    @staticmethod
    def printAllProjects(projectList, studentList, errorProject, springMode):
        i=0
        j=0
        for a in projectList:
            #a.printList()
            if springMode == 1:
                summer=a.canDoSummer
                fall=a.canDoFall
                for b in a.listOfStudents:
                    summer=summer*b.canDoSummer
                    fall=fall*b.canDoFall
            j=j+1
            if a.priority >=0:
                i=i+a.max
                #f.write("This project currently does not have enough students.\n")
        #errorProject.printList()
        """if i < len(studentList):
            print("There are currently not enough assignment slots for every student.")"""
        got1=0
        got2=0
        got3=0
        for a in studentList:
            if a.currentProject>=0:
                if a.priorityList[a.currentProject]==3:
                    got3=got3+1
                if a.priorityList[a.currentProject]==2:
                    got2=got2+1
                if a.priorityList[a.currentProject]==1:
                    got1=got1+1
       # print("{} out of {} students got their first choice.".format(got1, len(studentList)))
       # print("{} out of {} students got their second choice.".format(got2, len(studentList)))
        #print("{} out of {} students got their third choice.".format(got3, len(studentList)))

        #f.write("{} out of {} students got their first choice.\n".format(got1, len(studentList)))
       #f.write("{} out of {} students got their second choice.\n".format(got2, len(studentList)))
        #f.write("{} out of {} students got their third choice.\n".format(got3, len(studentList)))
        date = datetime.datetime.now()
        fileName = date.strftime("%Y-%m-%d_%H_%M_%S.txt")
        fileName = dir_path = os.path.dirname(os.path.realpath(__file__)) + "/Schedule_Runs/"  + sys.argv[2] + "/" + sys.argv[3] + "/" + fileName
        with open(fileName, "w+") as f:
            temp = {}
            temp['studentsFirstChoice'] = got1
            temp['studentsSecondChoice'] = got2
            temp['studentsThirdChoice'] = got3
            temp['totalStudents'] = len(studentList)
            temp['studentList'] = studentList
            temp['projectList'] = projectList
            f.write(json.dumps(temp, default=lambda x: x.__dict__))
       

    #def printList(self):
        #f = open("run.txt", "a+")
        #print("\nName: {} ID: {}  Number of Students: {}  Priority: {}".format(self.projectName, self.id, self.current, self.priority))
        #f.write("\nName: {} ID: {}  Number of Students: {}  Priority: {}\n".format(self.name, self.id, self.current, self.priority))
        #for x in self.listOfStudents:
            #print("{}  {} Summer: {} Fall: {}".format(x.name, x.priorityList[self.id-1], x.canDoSummer, x.canDoFall))
            #f.write("{}  {} Summer: {} Fall: {}\n".format(x.name, x.priorityList[self.id-1], x.canDoSummer, x.canDoFall))
           # if x.lockedInto != -1:
                #print("This student is locked into this project.")
                #f.write("This student is locked into this project.\n")
       # if self.priority==-1:
          #  print("This project is locked.")
            #f.write("This project is locked.\n")

    def reprioritize(self, projectList, studentList):
        while (self.current<self.min):
            bestPrior=1000
            bestPriorStudent=studentList[0]
            bestPriorSet=0
            for b in studentList:
                if b.currentProject != self.id-1 and b.priorityList[self.id-1]<bestPrior and b.priorityList[self.id-1]>0 and projectList[b.currentProject].priority < self.priority and b.lockedInto == -1:
                    bestPrior=b.priorityList[self.id]
                    bestPriorStudent=b
                    bestPriorSet=1
            if bestPriorSet == 1:
                summer=self.canDoSummer
                fall=self.canDoFall
                for c in self.listOfStudents:
                    summer=summer*c.canDoSummer
                    fall=fall*c.canDoFall
                if summer == 1 or fall == 1:
                    projectList[bestPriorStudent.currentProject].listOfStudents.remove(bestPriorStudent)
                    projectList[bestPriorStudent.currentProject].current=projectList[bestPriorStudent.currentProject].current-1
                    self.current=self.current+1
                    self.listOfStudents.append(bestPriorStudent)
                    bestPriorStudent.currentProject=self.id
                    return

def GetStudentListFromJson(prjID, stdList):
    assignList = []
    for std in stdList:
        if std.currentProject == prjID:
            assignList.append(std)
        else:
            pass
    return assignList

    

def ConvertJsonFileToAlgData(cacheObj):
    prjList = []
    stdList = []
    ret = {}
    for std in cacheObj['studentList']:
        name2 = std['Name']
        ID2 = std['ID']
        pri2 = std['PriorityList']
        gpa2 = std['GPA']
        bc2 = std['BC']
        fall2 = std['CanDoFall']
        summer2 = std['CanDoSummer']
        curr2 = std['ProjectID']
        lock = std['Locked']
        if(lock == 15):
            print("scheduler")
            print(curr2)
        block = std['BlockedList']
        #print(lock)
        #print("space")
        #print(std)
        if(fall2 == 0 and summer2 == 0):
            fall2 = 1
        stdList.append(Student(name2, ID2, pri2, gpa2, bc2, summer2, fall2, curr2, lock, block))

    for prj in cacheObj['projectList']:
        name = prj['Name']
        ID = prj['ID']
        Min = prj['Min']
        Max = prj['Max']
        fall = prj['CanDoFall']
        summer = prj['CanDoSummer']
        pri = prj['Priority']
        curr = prj['CurrentStudents']
        if(fall == 0 and summer == 0):
            fall = 1
        if cacheObj['runBefore'] == 1:
            sList = GetStudentListFromJson(ID, stdList)
            prjList.append(Project(name, ID, Min, Max, summer, fall, sList, pri, curr))
        else:
            prjList.append(Project(name, ID, Min, Max, summer, fall, [], pri, curr))
    ret["prjList"] = prjList
    ret["stdList"] = stdList
    return ret

class Student(object):
    def __init__(self, name, id, priorityList, gpa, bootcamp, canDoSummer, canDoFall, currentProject, lockedInto, blockedList):
        self.name = name
        self.priorityList = priorityList
        self.gpa=gpa
        self.bootcamp=bootcamp
        self.canDoFall=canDoFall
        self.canDoSummer=canDoSummer
        self.currentProject=currentProject
        self.lockedInto=lockedInto
        self.blockedList=blockedList
        self.id = id
    
    def place(self, projectList, errorProject):
        if self.lockedInto != -1 and self.currentProject == -1:
            projectList[self.lockedInto].listOfStudents.append(self)
            projectList[self.lockedInto].current+=1
            self.currentProject = self.lockedInto
            return
        if self.currentProject <= -1 or projectList[self.currentProject].priority == -1 or self.currentProject in self.blockedList:
            for y in range(1, max(self.priorityList)+1):
                z=countX(self.priorityList, y)
                for a in z:
                    if projectList[a].current < projectList[a].max and projectList[a].priority!=-1 and a not in self.blockedList:
                        summer=projectList[a].canDoSummer*self.canDoSummer
                        fall=projectList[a].canDoFall*self.canDoFall
                        for b in projectList[a].listOfStudents:
                            summer=summer*b.canDoSummer
                            fall=fall*b.canDoFall
                        if summer == 1 or fall == 1:
                            if self.currentProject >= 0:
                                projectList[self.currentProject].current=projectList[self.currentProject].current-1
                                projectList[self.currentProject].listOfStudents.remove(self)
                            projectList[a].current=projectList[a].current+1
                            projectList[a].listOfStudents.append(self)
                            if self.currentProject==-2:
                                errorProject.listOfStudents.remove(self)
                                errorProject.current=errorProject.current-1
                            self.currentProject=a
                            return
            for y in range(1, max(self.priorityList)+1):
                z=countX(self.priorityList, y)
                for a in z:
                    for c in projectList[a].listOfStudents:
                        if self.priorityList[a]<c.priorityList[a] and projectList[a].priority != -1 and a not in self.blockedList:
                            summer=projectList[a].canDoSummer*self.canDoSummer
                            fall=projectList[a].canDoFall*self.canDoFall
                            for b in projectList[a].listOfStudents:
                                summer=summer*b.canDoSummer
                                fall=fall*b.canDoFall
                            if summer == 1 or fall == 1:
                                projectList[a].listOfStudents.remove(c)
                                projectList[a].listOfStudents.append(self)
                                c.currentProject=-1
                                #print(c.name + " " + c.currentProject +"place")
                                self.currentProject=a
                                c.optimize(projectList, errorProject)
                                return
            if self.currentProject!=-2:
                errorProject.listOfStudents.append(self)
                self.currentProject=-2
                errorProject.current=errorProject.current+1

    def optimize(self, projectList, errorProject):
        if self.currentProject <= -1 or projectList[self.currentProject].priority == -1 or self.currentProject in self.blockedList:
            self.place(projectList, errorProject)
        if self.currentProject >= 0 and self.lockedInto == -1:
            for y in range(1, self.priorityList[self.currentProject]):
                z=countX(self.priorityList,y)
                for a in z:
                    if projectList[a].current < projectList[a].max and projectList[a].priority != -1 and projectList[a].priority>=projectList[self.currentProject].priority and a not in self.blockedList:
                        summer=projectList[a].canDoSummer*self.canDoSummer
                        fall=projectList[a].canDoFall*self.canDoFall
                        for c in projectList[a].listOfStudents:
                            summer=summer*c.canDoSummer
                            fall=fall*c.canDoFall
                        if summer == 1 or fall == 1:
                            projectList[self.currentProject].listOfStudents.remove(self)
                            projectList[self.currentProject].current=projectList[self.currentProject].current-1
                            projectList[a].current=projectList[a].current+1
                            projectList[a].listOfStudents.append(self)
                            self.currentProject=a
                            return
                    for b in projectList[a].listOfStudents:
                        if b.priorityList[b.currentProject] + self.priorityList[self.currentProject] > b.priorityList[self.currentProject] + self.priorityList[b.currentProject] and a not in self.blockedList:
                            summer1=projectList[a].canDoSummer*self.canDoSummer
                            fall1=projectList[a].canDoFall*self.canDoFall
                            summer2=projectList[self.currentProject].canDoSummer*b.canDoSummer
                            fall2=projectList[self.currentProject].canDoFall*b.canDoFall
                            projectList[self.currentProject].listOfStudents.remove(self)
                            projectList[a].listOfStudents.remove(b)
                            for c in projectList[a].listOfStudents:
                                summer1=summer1*c.canDoSummer
                                fall1=fall1*c.canDoFall
                            for c in projectList[self.currentProject].listOfStudents:
                                summer2=summer2*c.canDoSummer
                                fall2=fall2*c.canDoFall
                            if (summer1 == 1 or fall1 == 1) and (summer2 == 1 or fall2 == 1):
                                #print(self.name, self.currentProject)
                                projectList[self.currentProject].listOfStudents.append(b)
                                projectList[a].listOfStudents.append(self)
                                temp = b.currentProject
                                b.currentProject = self.currentProject
                                self.currentProject = temp
                                b.optimize(projectList, errorProject)
                                return
                            else:
                                projectList[self.currentProject].listOfStudents.append(self)
                                projectList[a].listOfStudents.append(b)
    
# Python code to create a list containing the index of every time a specific value appears in the list
def countX(lst, x): 
    count = []
    for y in range(len(lst)): 
        if (lst[y] == x): 
            count.append(y)
    return count 
    
def isInt(s):
    try:
        int(s,10)
        return True
    except ValueError:
        return False

#Test 1: basic test (one student per project, uses optimization)
"""
josh = Student("Josh", [1, 3, 4, 5, 2], 4.0, 1, 1, 1, -1)
jade = Student("Jade", [5, 1, 3, 4, 2], 4.0, 1, 1, 1, -1)
john = Student("John", [4, 5, 1, 3, 2], 4.0, 1, 1, 1, -1)
jane = Student("Jane", [3, 4, 5, 1, 2], 4.0, 1, 1, 1, -1)
jude = Student("Jude", [1, 2, 3, 4, 5], 4.0, 1, 1, 1, -1)
studentList = [josh, jade, john, jane, jude]

project1 = Project("1", 1, 1, 1, 1, 1, [], 0, 0)
project2 = Project("2", 2, 1, 1, 1, 1, [], 0, 0)
project3 = Project("3", 3, 1, 1, 1, 1, [], 0, 0)
project4 = Project("4", 4, 1, 1, 1, 1, [], 0, 0)
project5 = Project("5", 5, 1, 1, 1, 1, [], 0, 0)
projectList = [project1, project2, project3, project4, project5]"""


#Test 2: test for minimum group size.
"""
josh = Student("Josh", [1, 3, 4, 5, 2], 4.0, 1, 1, 1, -1, -1, [])
jade = Student("Jade", [5, 1, 3, 4, 2], 4.0, 1, 1, 1, -1, -1, [])
john = Student("John", [4, 5, 1, 3, 2], 4.0, 1, 1, 1, -1, -1, [])
jane = Student("Jane", [3, 4, 5, 1, 2], 4.0, 1, 1, 1, -1, -1, [])
jude = Student("Jude", [1, 2, 3, 4, 5], 4.0, 1, 1, 1, -1, -1, [])
juan = Student("Juan", [3, 4, 5, 2, 1], 4.0, 1, 1, 1, -1, -1, [])
jose = Student("Jose", [2, 1, 4, 5, 3], 4.0, 1, 1, 1, -1, -1, [])
studentList = [josh, jade, john, jane, jude, juan, jose]

project1 = Project("1", 1, 2, 3, 1, 1, [], 0, 0)
project2 = Project("2", 2, 2, 3, 1, 1, [], 0, 0)
project3 = Project("3", 3, 2, 3, 1, 1, [], 0, 0)
project4 = Project("4", 4, 2, 3, 1, 1, [], 0, 0)
project5 = Project("5", 5, 2, 3, 1, 1, [], 0, 0)
projectList = [project1, project2, project3, project4, project5]"""

#Test 3: test of summer and fall (a song of fire and ice, or in florida, fire and more fire)
"""
project1 = Project("1", 1, 1, 1, 0, 1, [], 0)
project2 = Project("2", 2, 1, 1, 1, 1, [], 0)
project3 = Project("3", 3, 1, 1, 1, 0, [], 0)
project4 = Project("4", 4, 1, 1, 1, 1, [], 0)
project5 = Project("5", 5, 1, 1, 0, 1, [], 0)
projectList = [project1, project2, project3, project4, project5]

juan = Student("Juan", [3, 2, 4, 5, 1], 4.0, 1, 1, 0, -1)
jade = Student("Jade", [2, 3, 5, 1, 4], 4.0, 1, 1, 1, -1)
john = Student("John", [5, 1, 2, 4, 3], 4.0, 1, 1, 1, -1)
jose = Student("Jose", [3, 4, 1, 2, 5], 4.0, 1, 0, 1, -1)
jude = Student("Jude", [4, 5, 1, 3, 2], 4.0, 1, 1, 1, -1)
studentList = [juan, jade, john, jose, jude]

#p1 - Jose 3rd choice
#p2 - Juan 1st choice
#p3 - Jude 1st choice
#p4 - Jade 3rd choice
#p5 - John 2nd choice
#3+1+1+3+2 = 10 for all final rankings summed together"""

#Test 4: Fall 2018
"""
projectNames = ["Dance","Color","Data","Real","ELLE","SEE","E-RASSOR","Arcade","Agile","Sound","3D Arm","AUVSI","Blockchain","Slavery","Starcraft","Voice","Recommend","Boat","Task","AVAST","E-GOAT","ARPD","FPL Drone","Image ML","Beach","Gravity","Parking","Boost","Carebit","CAP","Sherlock","Reality","Knights","Athlete","Forage","D&D","Tinder","Microscope","Laser","Tour","Turbo+","Vacay","Outfitter","Sheet","Vegan","Indoor Nav"]
i = 1
projectList=[]
for a in projectNames:
    projectList.append(Project(a, i, 3, 5, 1, 1, [], 0, 0))
    i=i+1

for a in projectList:
    if a.name == "E-RASSOR": #ID=7
        a.max=10
    if a.name == "Starcraft": #ID=15
        a.max=15
    if a.name == "AVAST": #ID = 20
        a.max = 8
    if a.name == "E-GOAT": #ID = 21
        a.max = 8
    if a.name == "Gravity": #ID = 26
        a.max = 6"""
    
try:
    studentList=[]
    projectList=[]
    springMode=0
    with open(str(sys.argv[1]), 'r', encoding='utf-8-sig') as f:
            dat = f.read()
    cacheObj = {}
    data = json.loads(dat)
    cacheObj['projectList'] = data['projectList']
    cacheObj['studentList'] = data['studentList']
    cacheObj['term'] = data['term']
    cacheObj['runBefore'] = 0
    ret2 = ConvertJsonFileToAlgData(cacheObj)
    studentList = ret2['stdList']
    #print(studentList[0].name)
    projectList = ret2['prjList']
    if(cacheObj['term'].lower() == "spring"):
        springMode = 1
except Exception as e:
    exc_info = sys.exc_info()
    print(''.join(traceback.format_exception(*exc_info)))



errorProject = Project("Error", 0, 0, 100, 1, 1, [], 0, 0)
"""maxPriority=0

for x in projectList:
    if x.priority>maxPriority:
        maxPriority=x.priority

firstPlaceChoices=[]
for a in projectList:
    firstPlaceChoices.append(0)

for x in studentList:
    #x.place(projectList, errorProject)
    y=countX(x.priorityList,1)
    for a in y:
        firstPlaceChoices[a]=firstPlaceChoices[a]+1
    
for a in projectList:
    print("{} students chose project {}, {}, as their first choice.".format(firstPlaceChoices[a.id-1], a.id, a.name))"""
    
Project.assignStudents(studentList, projectList, errorProject)
"""
val = -1
while val != "c":
    val = input("Enter the id number of the project you want to change, or 'c' to continue. ")
    if isInt(val):
        i = int(val,10)-1
        for a in studentList:
            if a.priorityList[i] == 1:
                print("{} Bootcamp: {} GPA: {}".format(a.name, a.bootcamp, a.gpa))
        val = input("Type 'max' to change the maximum number of students that can be assigned to this project, 'a' to assign a student to this project, or 'b' to go back. ")
        if val == "max":
            val=input("Enter the new maximum number of students. ")
            if isInt(val):
                projectList[i].max=int(val,10)
        elif val == "a":
            val=input("Enter the name of the student you want to assign to this project. ")
            studentFound=0
            foundStudent=studentList[0]
            for a in studentList:
                if a.name == val:
                    studentFound=1
                    foundStudent=a
            if studentFound == 1:
                foundStudent.lockedInto=i
                if i != foundStudent.currentProject:
                    projectList[i].current=projectList[i].current+1
                    projectList[i].listOfStudents.append(foundStudent)
                    foundStudent.currentProject=i
            elif studentFound == 0:
                print("Student not found.")
        elif val != "b":
            print("Invalid input.")

for x in studentList:
    x.place(projectList, errorProject)

for x in studentList:
    x.optimize(projectList, errorProject)"""
    
"""for a in projectList:
    a.printList()
errorProject.printList()"""

val = -1

while val != "0":
    #print("The current commands that are supported are:")
    #print("(0): Quit")
    #print("(1): Reassign all students from projects with fewer than the minimum amount of students")#
    #print("(2): Choose a project and allow no students to be assigned to it")
    #print("(3): Undo a command of type 1 or 2")
    #print("(4): Require that a project be populated by at least the minimum number of students, or undo a previous action of this type.")
    #print("(5): Require that a student be assigned to a specific project, or undo a previous action of this type.")
    #print("(6): Prevent a student from being assigned to one or more specific projects, or undo a previous action of this type.")
    #print("(7): Change the number of mimimum or maximum students for a project.")
   #print("(8): Randomize the order of students and run the algorithm again.")#
    #print("(9): Show the current status of all projects and students, including statistics.")#
    #val = input("Type the number, then enter, to activate a command.  ")
    Project.reassignFromUnmet(studentList, projectList, errorProject)
    #print(studentList[0].name + "1")
    Project.randomizeAndAssign(studentList, projectList, errorProject)
    #print(studentList[0].name + "2")
    Project.reassignFromUnmet(studentList, projectList, errorProject)
    #print(studentList[0].name + "3")
    Project.printAllProjects(projectList, studentList, errorProject, springMode)
    #print(studentList[0].name + "4")
    break
    if val == "1":
        Project.reassignFromUnmet(studentList, projectList, errorProject)
    if val == "2":
        while val != "b":
            print("The following projects are able to have students assigned to them:")
            for a in projectList:
                if a.priority != -1:
                    a.printList()
            val = input("Type a project ID and press enter to reassign all students assigned to a project to new projects and prevent new students from being assigned to it, or type b and press enter to return to the previous menu.  ")
            if (isInt(val)):
                i=int(val,10)-1
                if projectList[i].priority == -1:
                    print("This project has already been locked.")
                elif i>=len(projectList) or i < 0:
                    print("There is no project with this ID in the system.")
                else:
                    projectList[i].priority = -1
                    projectList[i].current=0
                    for y in projectList[i].listOfStudents:
                        y.currentProject=-1
                        y.optimize(projectList, errorProject)
                    projectList[i].listOfStudents=[]
            else:
                print("Invalid entry.")
    if val == "3":
        while val != "b":
            print("The following projects are unable to have students assigned to them.")
            for a in projectList:
                if a.priority == -1:
                    a.printList()
            val = input("Type a project ID and press enter to allow students to be assigned to that project again, or type b and press enter to return to the previous menu.  ")
            if isInt(val):
                i=int(val, 10)-1
                if i>=len(projectList) or i < 0:
                    print("There is no project with this ID in the system.")
                elif projectList[i].priority == -1:
                    projectList[i].priority = 0
                    for x in studentList:
                        x.optimize(projectList, errorProject)
                else:
                    print("This project ID is not on the list of blocked projects.")
            else:
                print("Invalid entry.")
            """for a in projectList:
                a.printList()
            errorProject.printList()"""
    if val == "4":
        while val != "b":
            print("These are the projects and their current priority values.")
            for a in projectList:
                print("\nName: {} ID: {}  Number of Students: {}  Priority: {}".format(a.name, a.id, a.current, a.priority))
            #errorProject.printList()
            val = input("Type the ID of a project to change its priority value, or type b to return to the previous menu. ")
            if isInt(val):
                i=int(val,10)-1
                if i>=len(projectList) or i < 0:
                    print("There is no project with this ID in the system.")
                else:
                    print("Project ID {}, {} currently has priority {}".format(i+1, projectList[i].name, projectList[i].priority))
                    print("Please enter its new priority value. The higher the value, the earlier it will be filled. Default priority is 0")
                    print("You can also stop projects from being filled by setting their priority to -1")
                    val = input("The value must be an integer. ")
                    if isInt(val):
                        j=int(val,10)
                        projectList[i].priority=j
                        print("Project {}'s priority has successfully been set to {}".format(i+1, j))
                        if (j<maxPriority):
                            maxPriority=j
                        projectList[i].reprioritize(projectList, studentList)
                    elif val != "b":
                        print("Invalid input.")
            else:
                print("Invalid entry.")
    if val == "5":
        while val != "b":
            val = input("Type the name of a student you would like to lock into a project or type b to return to the previous menu. ")
            if val != "b":
                studentFound=0
                foundStudent=studentList[0]
                for a in studentList:
                    if a.name == val:
                        studentFound=1
                        foundStudent=a
                if studentFound == 1:
                    val = input("Type the id of the project you would like to lock {} into, or 0 to unlock {} from their current project, or press b to return to the previous menu. ".format(foundStudent.name, foundStudent.name))
                    if isInt(val):
                        i=int(val,10)-1
                        if i>=len(projectList) or i < -1:
                            print("Invalid input.")
                        else:
                            foundStudent.lockedInto=i
                            if i != -1 and i != foundStudent.currentProject:
                                projectList[i].current=projectList[i].current+1
                                projectList[foundStudent.currentProject].current=projectList[foundStudent.currentProject].current-1
                                projectList[foundStudent.currentProject].listOfStudents.remove(foundStudent)
                                projectList[i].listOfStudents.append(foundStudent)
                                foundStudent.currentProject=i
                                if projectList[i].current>projectList[i].max:
                                    worstPrior=projectList[i].studentList[0].priorityList[i]
                                    worstPriorStudent=projectList[i].studentList[0]
                                    for b in projectList[i].listOfStudents:
                                        if b.priorityList[i] > worstPrior and b.lockedInto == -1:
                                            worstPrior = b.priorityList[i]
                                            worstPriorStudent = b
                                    projectList[i].current = projectList[i].current-1
                                    projectList[i].listOfStudents.remove(worstPriorStudent)
                                    worstPriorStudent.currentProject=-1
                                    worstPriorStudent.optimize(projectList, errorProject)
                            if i == -1:
                                foundStudent.optimize(projectList, errorProject)
                        for b in projectList:
                            b.printList()
                elif val != "b":
                    print("Invalid input.")
    if val == "6":
        val = input("Type the name of a student you would like to lock out of a project or type b to return to the previous menu. ")
        if val != "b":
            studentFound=0
            foundStudent=studentList[0]
            for a in studentList:
                if a.name == val:
                    studentFound=1
                    foundStudent=a
            if studentFound == 1:
                while val != "b":
                    print("Student {} is currently locked out of the following projects:".format(foundStudent.name))
                    for b in foundStudent.blockedList:
                        print(b+1)
                    print("Type the id of a project. If {} is already blocked from it, they will be unblocked. Otherwise, they will be blocked.".format(foundStudent.name))
                    val = input("Or type b to return to the menu. ")
                    if isInt(val):
                        i = int(val)-1
                        if i in foundStudent.blockedList:
                            foundStudent.blockedList.remove(i)
                            foundStudent.optimize(projectList, errorProject)
                        elif i < len(projectList) and i >= 0:
                            foundStudent.blockedList.append(i)
                            foundStudent.optimize(projectList, errorProject)
                        else:
                            print("Invalid input.")
                    elif val != "b":
                        print("Invalid input.")
                        break
    if val == "7":
        while val != "b":
            print("Type the ID of the project you want to edit, or ? to see a list of every project's minimum and maximum, or b to go back to the previous menu.")
            val = input("Note that if the minimum increases but is no longer met, students won't be reassigned immediately. You will need to run (1) from the main menu. ")
            if val == "?":
                for a in projectList:
                    print("Project {}: {}. Min: {} Max: {}".format(a.id,a.name, a.min, a.max))
            elif isInt(val):
                i = int(val)-1
                if i<=0 or i>len(projectList):
                    print("Invalid input.")
                else:
                    print("Project {}: {}. Min: {} Max: {}".format(projectList[i].id, projectList[i].name, projectList[i].min, projectList[i].max))
                    val = input("Type min to change the minimum, max to change the maximum, or b to go back. ")
                    if (val == "min"):
                        val = input("Enter the new minimum. ")
                        if isInt(val):
                            projectList[i].min=val
                    if (val == "max"):
                        val=input("Input the new maximum. ")
                        if isInt(val):
                            projectList[i].max=val
                            while projectList[i].cur>projectList[i].max and projectList[i].current>0:
                                worstPrior=projectList[i].studentList[0].priorityList[i]
                                worstPriorStudent=projectList[i].studentList[0]
                                for b in projectList[i].listOfStudents:
                                    if b.priorityList[i] > worstPrior and b.lockedInto == -1:
                                        worstPrior = b.priorityList[i]
                                        worstPriorStudent = b
                                projectList[i].current = projectList[i].current-1
                                projectList[i].listOfStudents.remove(worstPriorStudent)
                                worstPriorStudent.currentProject=-1
                                worstPriorStudent.optimize(projectList, errorProject)
                        elif val != "b":
                            print("Invalid input.")
                    else:
                        print("Invalid input.")
            elif val != "b":
                print("Invalid input.")
    if val == "8":
        Project.randomizeAndAssign(studentList, projectList, errorProject)
    if val == "9":
        Project.printAllProjects(projectList, studentList, errorProject, springMode)
        """i=0
        j=0
        for a in projectList:
            a.printList()
            if springMode == 1:
                summer=a.canDoSummer
                fall=a.canDoFall
                for b in a.listOfStudents:
                    summer=summer*b.canDoSummer
                    fall=fall*b.canDoFall
                if summer == 1 and fall == 1:
                    print("This project can happen in summer or fall.")
                elif summer == 1:
                    print("This project should happen in summer.")
                elif fall == 1:
                    print("This project should happen in fall.")
                else:
                    print("I'm not really sure when this project should happen. Sorry.")
            print("{} students chose this project as their first choice.".format(firstPlaceChoices[j]))
            j=j+1
            if a.priority >=0:
                i=i+a.max
            if a.min > a.current:
                print("This project currently does not have enough students.")
        errorProject.printList()
        if i < len(studentList):
            print("There are currently not enough assignment slots for every student.")
        got1=0
        got2=0
        got3=0
        for a in studentList:
            if a.currentProject>=0:
                if a.priorityList[a.currentProject]==3:
                    got3=got3+1
                if a.priorityList[a.currentProject]==2:
                    got2=got2+1
                if a.priorityList[a.currentProject]==1:
                    got1=got1+1
        print("{} out of {} students got their first choice.".format(got1, len(studentList)))
        print("{} out of {} students got their second choice.".format(got2, len(studentList)))
        print("{} out of {} students got their third choice.".format(got3, len(studentList)))"""











