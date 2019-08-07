//jshint esversion:6

exports.objectToCsv = function(data) {
  const csvRows = [];
  //get headers
  const headers = Object.keys(data[0]._doc);
  csvRows.push(headers.join(","));
  //loop over the rows
  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + row[header]).replace(/"/g, '\\"'); //escape values
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }
  return csvRows.join("\n");
};
