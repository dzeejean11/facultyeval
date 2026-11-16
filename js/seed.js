/* Shared seed data for the admin site and the student portal. */
window.FES_PERMS = ["Manage users","Manage roles","Manage subjects","Manage academic years","Manage criteria","Manage forms","View reports","View own results","Review feedback analysis","Validate sentiment model","Manage settings","View audit log"];
window.FES_SEED = (function (PERMS) {
 return {
 users:[
  {id:1,name:"Dr. Maria Santos",email:"m.santos@school.edu",role:"Faculty",department:"Information Technology",status:"Active"},
  {id:2,name:"Prof. James Reyes",email:"j.reyes@school.edu",role:"Faculty",department:"Information Technology",status:"Active"},
  {id:3,name:"Dr. Ana Cruz",email:"a.cruz@school.edu",role:"Faculty",department:"Education",status:"Active"},
  {id:4,name:"Leo Garcia",email:"l.garcia@school.edu",role:"Student Evaluator",department:"Information Technology",status:"Active",password:"student123"},
  {id:8,name:"Maria Clara Reyes",email:"m.clara@school.edu",role:"Student Evaluator",department:"Education",status:"Active",password:"student123"},
  {id:5,name:"Admin Office",email:"admin@school.edu",role:"Administrator",department:"Engineering",status:"Active"},
  {id:6,name:"Engr. Paolo Dizon",email:"it@school.edu",role:"IT Expert",department:"Information Technology",status:"Active"},
  {id:7,name:"Dr. Elena Ramos",email:"head@school.edu",role:"Supervisor",department:"Education",status:"Active"}],
 subjects:[
  {id:1,code:"IT101",name:"Introduction to Programming",department:"Information Technology",units:3,faculty:"Dr. Maria Santos"},
  {id:2,code:"IT204",name:"Database Systems",department:"Information Technology",units:3,faculty:"Prof. James Reyes"},
  {id:3,code:"ED110",name:"Principles of Teaching",department:"Education",units:3,faculty:"Dr. Ana Cruz"}],
 years:[
  {id:1,name:"2025-2026",term:"2nd Semester",start:"2026-01-12",end:"2026-05-29",status:"Closed"},
  {id:2,name:"2026-2027",term:"1st Semester",start:"2026-08-17",end:"2026-12-18",status:"Active"},
  {id:3,name:"2026-2027",term:"2nd Semester",start:"2027-01-11",end:"2027-05-28",status:"Upcoming"}],
 roles:[
  {id:1,name:"Administrator",description:"Manages users, roles, forms and criteria",permissions:PERMS.slice()},
  {id:2,name:"IT Expert",description:"Reviews textual feedback analysis and configures the system",permissions:["View reports","Review feedback analysis","Validate sentiment model","Manage settings","View audit log"]},
  {id:3,name:"Supervisor",description:"Receives evaluation summaries and reports",permissions:["View reports","Review feedback analysis"]},
  {id:4,name:"Faculty",description:"Teaching staff who view their own results",permissions:["View own results"]},
  {id:5,name:"Student Evaluator",description:"Evaluates teachers in the student portal and mobile app",permissions:[]},
  {id:6,name:"Peer Evaluator",description:"Evaluates fellow faculty in the mobile app",permissions:[]}],
 criteria:[
  {id:1,name:"Subject mastery",category:"Teaching",description:"Knows the subject and explains it accurately",weight:25,status:"Active"},
  {id:2,name:"Communication",category:"Teaching",description:"Explains ideas clearly and listens to students",weight:20,status:"Active"},
  {id:3,name:"Teaching methods",category:"Teaching",description:"Uses activities that help students learn",weight:20,status:"Active"},
  {id:4,name:"Timely feedback",category:"Assessment",description:"Returns graded work with useful comments on time",weight:15,status:"Active"},
  {id:5,name:"Class management",category:"Classroom",description:"Starts on time and keeps a respectful class",weight:10,status:"Active"},
  {id:6,name:"Professionalism",category:"Conduct",description:"Is prepared, fair and approachable",weight:10,status:"Active"}],
 forms:[
  {id:1,name:"Student Evaluation of Faculty",audience:"Student evaluates faculty",scale:"5",criteria:[1,2,3,4,5,6],comments:"Optional",status:"Published"},
  {id:2,name:"Peer Evaluation of Faculty",audience:"Peer evaluates faculty",scale:"5",criteria:[1,3,6],comments:"Required",status:"Draft"},
  {id:3,name:"Supervisor Evaluation of Faculty",audience:"Supervisor evaluates faculty",scale:"5",criteria:[1,4,5,6],comments:"Optional",status:"Draft"}],
 feedback:[
  {id:1,text:"Malinaw magturo at responsive sa questions.",faculty:"Prof. James Reyes",source:"Student",manual:"Positive"},
  {id:2,text:"Mabilis ang pacing kaya nahihirapan akong sumunod.",faculty:"Dr. Maria Santos",source:"Student",manual:"Negative"},
  {id:3,text:"Clear explanations and very helpful consultation hours.",faculty:"Prof. James Reyes",source:"Student",manual:"Positive"},
  {id:4,text:"Good lessons, but the pace of the lectures is too fast.",faculty:"Dr. Maria Santos",source:"Student",manual:"Neutral"},
  {id:5,text:"Feedback on assignments arrives too late to be useful.",faculty:"Dr. Ana Cruz",source:"Student",manual:"Negative"},
  {id:6,text:"Hindi malinaw ang instructions sa project, nakakalito.",faculty:"Dr. Ana Cruz",source:"Student",manual:"Negative"},
  {id:7,text:"Very approachable si Sir, pero minsan late sa class.",faculty:"Prof. James Reyes",source:"Peer",manual:"Neutral"},
  {id:8,text:"Magaling at matiyaga magturo, salamat po!",faculty:"Dr. Maria Santos",source:"Student",manual:"Positive"},
  {id:9,text:"Boring ang lectures at walang activities.",faculty:"Dr. Ana Cruz",source:"Student",manual:"Negative"},
  {id:10,text:"The class is okay, nothing special.",faculty:"Dr. Maria Santos",source:"Peer",manual:"Neutral"},
  {id:11,text:"Sobrang galing ng teacher, very engaging ang discussions.",faculty:"Dr. Ana Cruz",source:"Student",manual:"Positive"},
  {id:12,text:"Supportive and fair in grading, nakakatulong sa learning namin.",faculty:"Prof. James Reyes",source:"Supervisor",manual:"Positive"},
  {id:13,text:"Ok lang naman, hindi masama.",faculty:"Dr. Ana Cruz",source:"Student",manual:"Neutral"}],
 settings:{name:"DEBESMSCAT",email:"evaluations@school.edu",departments:"Information Technology, Education, Business, Agriculture, Engineering",terms:"Semester",scale:"5",anonymous:"Yes",threshold:70,staffRole:"Faculty",retention:2,brandColor:"",tint:"Neutral"}
};
})(window.FES_PERMS);
