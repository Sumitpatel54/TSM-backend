/* eslint-disable no-trailing-spaces */
/* eslint-disable semi */
import AWS from "aws-sdk"
import URL from "url"
import { v4 as uuidv4 } from 'uuid'

const stringIsAValidUrl = (s: any) => {
  try {
    new URL.URL(s)
    return true
  } catch (err) {
    return false
  }
}

// get file upload path
const geFileURL = (req: any) => {
  return req.protocol + "://" + req.headers.host + req.file.destination.replace(/public/g, '') + '/' + req.file.filename
}
const isFloat = (x: any) => { return !!(x % 1) }
const isNumber = (str: any) => {
  return !isNaN(str) && !isNaN(parseFloat(str))
}

const getTotalPages = (totalData: number, perPage: number) => {
  let totalPage = totalData / perPage
  let totalPages: any = 1

  if (totalPage > 1) {
    totalPages = totalPage
  }

  if (isFloat(totalPages)) {
    totalPages = parseInt(totalPages) + 1
  }
  return totalPages
}

/**
 * Used to generate time stamp from date and time
 * @param dateToUse
 * @param timeString
 *
 * @returns timeStamp
 */
const getTimestampFromDate = (dateToUse: string, timeString: string) => {
  try {
    if (timeString.includes(":")) {
      const timeArray = timeString.split(":")
      const hourToSet = Number(timeArray[0])
      const minToSet = Number(timeArray[1])

      let timeStamp: number = Number(((new Date(dateToUse).setHours(hourToSet, minToSet, 0)) / 1000).toFixed(0))
      return timeStamp
    }
    throw new Error('Time is not in the proper format')
  } catch (error: any) {
    throw new Error(error)
  }
}

/**
* @summary - Get s3 signed url
*/


const getUploadURLWithDir = async (files: any | any[], dirName: string) => {
  try {
    const filesArray = Array.isArray(files) ? files : [files];
    
    // Add file size and type validation
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo']; // Add more types as needed

    for (const file of filesArray) {
      if (file.size > maxSize) {
        throw new Error('File size exceeds 100MB limit');
      }
      
      if (!allowedTypes.includes(file.mimetype)) {
        throw new Error('Invalid file type. Only video files are allowed.');
      }
    }

    const s3 = new AWS.S3({
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
      // Add configuration for handling large files
      httpOptions: {
        timeout: 300000, // 5 minutes
        connectTimeout: 5000 // 5 seconds
      }
    });

    // Configure multipart upload
    const uploadPromises = filesArray.map(async (file: any) => {
      const buffer: any = file.data;
      const fileMime: any = file.name || file.originalname;
      const arr = fileMime.split(".");
      const fileExt = arr[arr.length - 1];
      const now = Math.round(+new Date() / 1000);
      const filePath = dirName ? `${dirName}/` : '';
      const fileName = `${now}.${fileExt}`;
      const fileFullName = `${filePath}${fileName}`;

      const s3Params: AWS.S3.PutObjectRequest = {
        Bucket: process.env.BUCKET as string,
        Key: fileFullName,
        Body: buffer,
        ContentType: file.mimetype,
        // Enable multipart upload for large files
        ServerSideEncryption: 'AES256'
      };

      // Use multipart upload for large files
      if (buffer.length > 5 * 1024 * 1024) { // 5MB threshold
        return new Promise((resolve, reject) => {
          const upload = s3.upload(s3Params);
          upload.on('httpUploadProgress', (progress) => {
            console.log(`Progress: ${progress.loaded}/${progress.total}`);
          });
          upload.send((err, data) => {
            if (err) reject(err);
            else resolve(`https://${process.env.BUCKET}.s3.amazonaws.com/${fileFullName}`);
          });
        });
      }

      // Use regular upload for smaller files
      await s3.upload(s3Params).promise();
      return `https://${process.env.BUCKET}.s3.amazonaws.com/${fileFullName}`;
    });

    const urls: any = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error("Error in getUploadURL:", error);
    throw error;
  }
};



const getUploadURL = async (files: any | any[] ) => {
  try {
    const filesArray = Array.isArray(files) ? files : [files];
    
    const s3 = new AWS.S3({
          accessKeyId: process.env.ACCESS_KEY_ID,
          secretAccessKey: process.env.SECRET_ACCESS_KEY
    })

    AWS.config.update({ region: 'us-east-1' });

    const uploadPromises = filesArray.map(async file => {
      const buffer: any = file.data;
      const fileMime: any = file.name;
      const arr = fileMime.split(".");
      const fileExt = arr[arr.length - 1];
      const hash = uuidv4();
      const now = Math.round(+new Date() / 1000);
      const filePath = `${hash}/`;
      const fileName = `${now}.${fileExt}`;
      const fileFullName = `${filePath}${fileName}`;

      const s3Params: AWS.S3.PutObjectRequest = {
        Bucket: process.env.BUCKET as string,
        Key: fileFullName,
        Body: buffer,
      };

      await s3.upload(s3Params).promise();
      return `https://${process.env.BUCKET}.s3.amazonaws.com/${fileFullName}`;
    });

    const urls:any = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error("Error in getUploadURL:", error);
    throw error;
  }
};



// const getUploadURL = async (file: any) => {
//   const s3 = new AWS.S3({
//     accessKeyId: process.env.ACCESS_KEY_ID,
//     secretAccessKey: process.env.SECRET_ACCESS_KEY
//   })

//   AWS.config.update({ region: 'us-east-1' })

//   // create a buffer from base64 string
//   const buffer: any = file.data

//   // get the file extension
//   const fileMime: any = file.name
//   const arr = fileMime.split(".")

//   // if (fileMime === null) throw new Error("Uploaded file is not supported")

//   let fileExt = fileMime.split(".")[arr.length - 1]
//   let hash = v4()
//   let now = Math.round(+new Date() / 1000)

//   let filePath = hash + "/"
//   let fileName = now + '.' + fileExt
//   let fileFullName = filePath + fileName
//   // let fileFullPath = process.env.BUCKET + fileFullName


//   const s3Params = {
//     Bucket: process.env.BUCKET,
//     Key: fileFullName,
//     Body: buffer,
//   }

//   // @ts-ignore
//   await s3.putObject(s3Params).promise()

//   return "https://" + process.env.BUCKET + ".s3.amazonaws.com/" + fileFullName
// }

/**
* @summary - Checks for null or undefined values
* @param {Object} inObj Requests passed to the express endpoint
* @returns Boolean
**/
const validateRequestForEmptyValues = (inObj: any) => {
  if (typeof inObj !== 'object' && inObj === null) {
    throw new Error("inObj must be an Object")
  }

  // cache object properties
  let inObjKeys = Object.keys(inObj)

  // loop through and check for null/falsy values
  // if found send back the offending property
  for (let i = 0; i < inObjKeys.length; i++) {
    if (inObj[inObjKeys[i]] === null || inObj[inObjKeys[i]] === undefined) {
      throw new Error(`${inObjKeys[i]} is required`)
    }

    // validate array if it is empty
    if (inObj[inObjKeys[i]] && Array.isArray(inObj[inObjKeys[i]]) && (inObj[inObjKeys[i]].length === 0)) {
      throw new Error(`${inObjKeys[i]} cannot be empty`)
    }
  }

  return true
}

export default { geFileURL, getTotalPages, stringIsAValidUrl, getTimestampFromDate, getUploadURL, isNumber, validateRequestForEmptyValues, getUploadURLWithDir }
