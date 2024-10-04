import { Response } from 'express';
import path from 'path';
import { promises as fs } from 'fs';
// import { fileURLToPath } from 'url';
type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  data: T;
  exceptional?: {
    type: 'sendingFile' | 'more';
    sendingFile: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      file: any;
      extension: 'csv' | 'pdf';
    };
  };
};
const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  if (data?.exceptional) {
    const exceptional = data?.exceptional;
    if (exceptional?.type === 'sendingFile') {
      const sendingFile = exceptional?.sendingFile;
      if (sendingFile?.extension === 'csv') {
        const csvData = sendingFile?.file;
        // const csvData = jsonToCsv(jsonData); // Convert JSON to CSV format
        // const __filename = fileURLToPath(import.meta.url); // Get the current file path
        // const __dirname = path.dirname(__filename); // Get the directory name
        // eslint-disable-next-line no-undef
        const filePath = path.join(__dirname, 'output.csv'); // File path for the CSV
        (async () => {
          try {
            // Write the CSV data to a file asynchronously
            await fs.writeFile(filePath, csvData);

            // Send the CSV file as a response for download
            res.download(filePath, 'data.csv', async (err) => {
              if (err) {
                console.error('Error sending file:', err);
                return res.status(500).send('Error downloading file');
              }

              // Delete the file after sending it
              try {
                await fs.unlink(filePath);
              } catch (deleteErr) {
                console.error('Error deleting file:', deleteErr);
              }
            });
          } catch (err) {
            console.error('Error writing or sending CSV file:', err);
            res.status(500).send('Internal Server Error');
          }
        })();
      }
    }
  } else {
    res.status(data?.statusCode).json({
      success: data?.success,
      message: data?.message,
      data: data.data,
    });
  }
};
export default sendResponse;
