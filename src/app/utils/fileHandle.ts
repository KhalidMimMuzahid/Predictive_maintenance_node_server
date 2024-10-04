// import fs from 'fs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jsonToCsv = (jsonData: any[]) => {
  const headers = Object.keys(jsonData[0]).join(','); // Get headers from the first object
  const rows = jsonData.map((obj) => Object.values(obj).join(',')); // Convert each object to a CSV row
  return [headers, ...rows].join('\n'); // Combine headers and rows
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// const writeCSV = (jsonData: any[]) => {
//   const csvData = jsonToCsv(jsonData);
//   fs.writeFile('output.csv', csvData, (err) => {
//     if (err) {
//       console.error('Error writing CSV file:', err);
//     } else {
//       console.log('CSV file has been written successfully!');
//     }
//   });
// };

export const fileHandle = {
  //   writeCSV,
  jsonToCsv,
};
