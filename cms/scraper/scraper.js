var array = $("h1").first().nextAll().toArray()

var semester = "";
var part = "";
var json = {};

for (var i = 0; i < array.length; i++) {
  var e = $(array[i]);
  if (e.is("h2")) {
    semester = e.text();
  }
  
  if (e.is("h3")) {
    part = e.text();
  }
  
  if (e.is("table")) {
    
    if (!json[semester])
    {
      json[semester] = {};
    }
    
    json[semester][part] = [];
    
    
    var rows = e.children().children().first().nextAll().toArray();
    
    for (var j = 0; j < rows.length; j++)
    {
      var row = $(rows[j]);
      var data = row.children().toArray();
      
      if (part === "Senior Design 1")
      {
        var sd1obj = {
        "group number": $(data[0]).text(),
        "group name": $(data[1]).text(),
        "members": $(data[2]).text().split(", "),
        "emails": $(data[3]).text().split("; "),
        "design doc": {
          "name": $(data[4]).children().first().text(),
          "link": $(data[4]).children().first().attr("href")
        },
        "timestamp": $(data[5]).text()
        };
      
        var semesterObj = json[semester];
        semesterObj[part].push(sd1obj);
      }
      
      if (part === "Senior Design 2")
      {
        var sd2obj = {
        "group number": $(data[0]).text(),
        "group name": $(data[1]).text(),
        "members": $(data[2]).text().split(", "),
        "emails": $(data[3]).text().split("; "),
        "final doc": {
          "name": $(data[4]).children().first().text(),
          "link": $(data[4]).children().first().attr("href")
        },
        "presentation": {
          "name": $(data[4]).children().next().first().text(),
          "link": $(data[4]).children().next().first().attr("href")
        },
        "conference paper": {
          "name": $(data[4]).children().next().next().first().text(),
          "link": $(data[4]).children().next().next().first().attr("href")
        },
        "timestamp": $(data[5]).text()
        };
      
        var semesterObj = json[semester];
        semesterObj[part].push(sd2obj);
      }
      
    }   
    
    
  }
  
 
}

console.log(JSON.stringify(json, null, 2));