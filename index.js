const spreedSheet = SpreadsheetApp.getActive();
const tab = spreedSheet.getSheetByName("Blad1");

const doGet = () => {
    const lastRow = tab.getLastRow();
    const lastColumn = tab.getLastColumn();
    const rows = tab.getRange(1, 1, lastRow, lastColumn).getValues().
    filter(e=>e.join().replace(/,/g, "").length);
    const jsonData = formateData(rows)

    return response().json(jsonData)
}

const doPost = (e) => {
 const data = JSON.parse(e.postData.contents)
 let firstRowTitles =  tab.getRange(1,1,1,10).getValues()[0].filter(cell => cell !== "");
 const emptyRow = [' '] 
 tab.appendRow(emptyRow)
 tab.appendRow(firstRowTitles)
 tab.appendRow(Object.values(data).map(value => value))

 return response().json({status:'success'})
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

// FORMAT GOOGLE SHEET DATA TO JSON
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
    return [...breakPointIndex, data].map(row => arrayToJSONObject(row))
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
