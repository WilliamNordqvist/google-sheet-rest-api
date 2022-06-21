const spreedSheet = SpreadsheetApp.getActive();
let sheet = spreedSheet.getSheetByName("AllLists");

const doGet = () => {
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    const rows = sheet.getRange(1, 1, lastRow, lastColumn).getValues().
    filter(e=>e.join().replace(/,/g, "").length);
    const jsonData = formateData(rows)
  
    return response().json(jsonData)
}

const doPost = (e) => {
const action = e.parameter.action
const data = JSON.parse(e.postData.contents)

//UPDATE
  if(action === 'update'){
    doUpdate(data)
    return doGet()
    
  }

  //DELETE 
    if(action === 'delete'){
    doDelete(data)
    return doGet()
    
  }
  // CREATE
 let firstRowTitles =  sheet.getRange(1,1,1,10).getValues()[0].filter(cell => cell !== "");
 const emptyRow = [' '] 
 sheet.appendRow(emptyRow)
 sheet.appendRow(firstRowTitles)
 sheet.appendRow(Object.values(data).map(value => value))

  return doGet()
}

const doUpdate = (data) => {
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    const range = sheet.getRange(1, 1, lastRow, lastColumn) 
    const values = range.getValues()
    values.forEach((i, index) => {
      if(i.includes(data.itemId || data.listId)){
        values[index] = Object.values(data)
      }
    })
    range.setValues(values)
}

const doDelete = (data) => {
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    const values = sheet.getRange(1, 1, lastRow, lastColumn).getValues()
    let itemIdex = values.map((i, index) => {
        if (i.includes(data.itemId || data.listId)) {
          return ++index
        }
    }).filter(Boolean)
    sheet.deleteRows(itemIdex[0], itemIdex.length)     
}

// HELPER FUNC
// TWO DIMENSION ARREY TO JSON
const arrayToJSONObject = (arr) => {
    const keys = arr[0];
    const newArr = arr.slice(1, arr.length);
 
    let formatted = [],
    data = newArr,
    cols = keys,
    l = cols.length;
    for (let i=0; i<data.length; i++) {
            const d = data[i],
                    o = {};
            for (let j=0; j<l; j++)
                    o[cols[j]] = d[j];
            formatted.push(o);
    }
    return formatted;
}

// FORMAT GOOGLE sheet DATA TO JSON
const formateData = (data) => {
  const [firstCell, ...rest] = data[0]
    let stop = null
    let breakPointIndex = []
    for (let i = 1; i < data.length; ++i) {
        if (data[i][0] == firstCell) {
            if (stop === null) {
                stop = i
            }
            breakPointIndex = [...breakPointIndex, data.splice(0, stop)]
            i = 1
            stop = null
        }
    }
    const test = [...breakPointIndex, data].map(row => arrayToJSONObject(row))[0]
return test
}

// SHORTCUT FOR GOOGLE SHEET JSON RES
const response = () => {
   return {
     text:function(data) {
         return ContentService
            .createTextOutput(JSON.stringify(data))
            .setMimeType(ContentService.MimeType.TEXT);
      },
      json: function(data) {
         return ContentService
            .createTextOutput(JSON.stringify(data))
            .setMimeType(ContentService.MimeType.JSON);
      }
   }
}
